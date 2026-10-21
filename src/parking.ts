export type Status = "free" | "occupied" | "unknown";
export type Space = { id: string; accessible: boolean; occupied: boolean; sequence: number; lastSeen: number; override: { status: "free" | "occupied"; until: number } | null };
export type SensorEvent = { spaceId: string; occupied: boolean; sequence: number; observedAt: number };
export const STALE_MS = 30_000;
export function initial(now: number): Space[] {
  return Array.from({ length: 12 }, (_, i) => ({ id: `A${String(i + 1).padStart(2, "0")}`, accessible: i < 2, occupied: i % 3 === 2, sequence: 0, lastSeen: now, override: null }));
}
export function parseEvent(value: unknown): SensorEvent {
  if (typeof value !== "object" || value === null) throw new Error("Sensor event must be an object.");
  const v = value as Record<string, unknown>;
  if (typeof v.spaceId !== "string" || typeof v.occupied !== "boolean" || !Number.isSafeInteger(v.sequence) || Number(v.sequence) < 1 || !Number.isSafeInteger(v.observedAt) || Number(v.observedAt) < 0) throw new Error("Invalid sensor event.");
  return { spaceId: v.spaceId, occupied: v.occupied, sequence: Number(v.sequence), observedAt: Number(v.observedAt) };
}
export function applyEvent(spaces: Space[], event: SensorEvent, now: number): Space[] {
  const validated = parseEvent(event);
  return spaces.map(space => space.id === validated.spaceId && validated.sequence > space.sequence && validated.observedAt >= space.lastSeen && validated.observedAt <= now
    ? { ...space, occupied: validated.occupied, sequence: validated.sequence, lastSeen: validated.observedAt } : space);
}
export function status(space: Space, now: number): Status {
  if (space.override && space.override.until > now) return space.override.status;
  if (now - space.lastSeen > STALE_MS) return "unknown";
  return space.occupied ? "occupied" : "free";
}
export function manual(spaces: Space[], id: string, next: "free" | "occupied" | null, now: number): Space[] {
  return spaces.map(space => space.id === id ? { ...space, override: next === null ? null : { status: next, until: now + 300_000 } } : space);
}
export function summary(spaces: Space[], now: number) {
  return { free: spaces.filter(s => status(s, now) === "free").length, occupied: spaces.filter(s => status(s, now) === "occupied").length, unknown: spaces.filter(s => status(s, now) === "unknown").length, accessibleFree: spaces.filter(s => s.accessible && status(s, now) === "free").length };
}
