import test from "node:test";
import assert from "node:assert/strict";
import { applyEvent, initial, manual, parseEvent, STALE_MS, status, summary } from "../src/parking.ts";
const now = 1_000_000;
test("total free includes accessible spaces and excludes occupied", () => {
  assert.deepEqual(summary(initial(now), now), { free: 8, occupied: 4, unknown: 0, accessibleFree: 2 });
});
test("new readings update immutably and repeated/out-of-order events are ignored", () => {
  const before = initial(now);
  const event = { spaceId: "A01", occupied: true, sequence: 2, observedAt: now };
  const after = applyEvent(before, event, now);
  assert.equal(before[0].occupied, false); assert.equal(after[0].occupied, true);
  assert.deepEqual(applyEvent(after, { ...event, occupied: false, sequence: 1 }, now), after);
  assert.deepEqual(applyEvent(after, { ...event, occupied: false, observedAt: now + 1 }, now), after);
});
test("stale sensors become unknown and do not inflate availability", () => {
  const spaces = initial(now);
  assert.equal(status(spaces[0], now + STALE_MS), "free");
  assert.equal(status(spaces[0], now + STALE_MS + 1), "unknown");
  assert.equal(summary(spaces, now + STALE_MS + 1).free, 0);
});
test("manual override survives telemetry and expires back to sensor state", () => {
  let spaces = manual(initial(now), "A01", "free", now);
  spaces = applyEvent(spaces, { spaceId: "A01", occupied: true, sequence: 1, observedAt: now + 1 }, now + 1);
  assert.equal(status(spaces[0], now + 2), "free");
  assert.equal(status(spaces[0], now + 300001), "unknown");
  assert.equal(status(manual(spaces, "A01", null, now)[0], now + 2), "occupied");
});
test("malformed sensor messages are rejected", () => {
  for (const value of [null, {}, { spaceId: "A01", occupied: "yes", sequence: 1, observedAt: now }, { spaceId: "A01", occupied: true, sequence: -1, observedAt: now }]) assert.throws(() => parseEvent(value));
});
