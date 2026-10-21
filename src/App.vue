<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { applyEvent, initial, manual, status, STALE_MS, summary } from "./parking.ts";
const now = ref(Date.now()), spaces = ref(initial(now.value)), selected = ref("A01"), overrideStatus = ref<"free" | "occupied">("occupied"), events = ref<string[]>([]);
const counts = computed(() => summary(spaces.value, now.value));
const selectedSpace = computed(() => spaces.value.find(space => space.id === selected.value)!);
const timer = setInterval(() => { now.value = Date.now(); }, 1000);
onUnmounted(() => clearInterval(timer));
function log(message: string) { events.value = [message, ...events.value].slice(0, 6); }
function sensor(occupied: boolean) {
  now.value = Date.now(); const space = selectedSpace.value;
  spaces.value = applyEvent(spaces.value, { spaceId: space.id, occupied, sequence: space.sequence + 1, observedAt: now.value }, now.value);
  log(`${space.id}: sensor reports ${occupied ? "occupied" : "free"} (sequence ${space.sequence + 1})`);
}
function offline() { now.value = Date.now(); spaces.value = spaces.value.map(s => s.id === selected.value ? { ...s, lastSeen: now.value - STALE_MS - 1000 } : s); log(`${selected.value}: sensor connection lost`); }
function override() { now.value = Date.now(); spaces.value = manual(spaces.value, selected.value, overrideStatus.value, now.value); log(`${selected.value}: manual ${overrideStatus.value} for five minutes`); }
function clearOverride() { spaces.value = manual(spaces.value, selected.value, null, now.value); log(`${selected.value}: back to sensor status`); }
function reset() { now.value = Date.now(); spaces.value = initial(now.value); events.value = []; selected.value = "A01"; }
</script>
<template>
  <main><header><a href="/" class="brand">Z<span>·</span>PARK</a><span>LEVEL A / SENSOR PLAYGROUND</span></header>
    <section class="hero"><div><p class="eyebrow">TWELVE SPACES. ONE CLEAR PICTURE.</p><h1>Room to<br><em>pull in.</em></h1><p>A parking-house display you can experiment with.<br>No hardware, number plates or real cars.</p></div><div class="sign" aria-live="polite"><span>SPACES AVAILABLE</span><strong data-testid="free-count">{{ counts.free.toString().padStart(2, '0') }}</strong><small>{{ counts.accessibleFree }} accessible · {{ counts.unknown }} sensor offline</small></div></section>
    <section class="workspace"><div><div class="legend"><span>● Free</span><span>● Occupied</span><span>● Accessible & free</span><span>● Unknown</span></div><div class="floor" aria-label="Parking spaces"><button v-for="space in spaces" :key="space.id" :class="['space', status(space, now), { accessible: space.accessible, selected: selected === space.id }]" :aria-label="`${space.id}: ${status(space, now)}${space.accessible ? ', accessible' : ''}`" :aria-pressed="selected === space.id" @click="selected = space.id"><strong>{{ space.id }}</strong><span>{{ space.accessible ? 'ACCESSIBLE' : 'STANDARD' }}</span><small>{{ status(space, now) }}{{ space.override && space.override.until > now ? ' · manual' : '' }}</small></button></div><p class="floor-note">ENTRANCE ↑ &nbsp; LEVEL A · TOTAL 12 SPACES</p></div>
      <aside><p class="eyebrow">SIMULATE A SENSOR</p><label for="selected">Selected space</label><select id="selected" v-model="selected"><option v-for="space in spaces" :key="space.id">{{ space.id }}</option></select><div class="buttons"><button @click="sensor(true)">Car arrives</button><button @click="sensor(false)">Car leaves</button></div><button class="wide subtle" @click="offline">Sensor offline</button><hr><label for="manual">Manual status</label><select id="manual" v-model="overrideStatus"><option value="occupied">Occupied</option><option value="free">Free</option></select><button class="wide" @click="override">Override for 5 minutes</button><button class="wide subtle" @click="clearOverride">Return to sensor</button><p class="small">Readings older than 30 seconds become unknown. A manual override expires after five minutes.</p></aside>
    </section><section class="event-log"><h2>EVENT LOG</h2><p v-if="!events.length">Select a space and send your first sensor event.</p><ol v-else><li v-for="(event, i) in events" :key="i">{{ event }}</li></ol><button class="reset" @click="reset">Reset demo</button></section>
    <footer>New reconstruction of a 3rd-semester Z-Park idea · Vue / TypeScript · Simulated events only</footer>
  </main>
</template>
