# Z-Park Sensor Simulator — Vue / TypeScript

A new reconstruction of the parking-display part of the supplied **Parkeringssensor 3. semester**, **Opgavesæt systemudvikling**, **Metode afsnit** and parking-risk PDFs. The study material names Vue, C#, REST and Raspberry Pi; complete source is not present. This is a new Vue implementation, October 2026.

## Run

Node.js 24+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Open http://127.0.0.1:5173. Choose a space and send an arrival, departure or offline event. Try overriding its state manually, then return control to the sensor.

## Implemented study requirements

- Green available spaces, red occupied spaces and yellow free accessible spaces.
- One sign showing **all** free spaces, including accessible ones.
- Typed sensor messages, monotonic sequences and rejection of older/future readings.
- Unknown state after a 30-second timeout; unknown spaces are not advertised as free.
- Five-minute manual overrides for a sensor failure; underlying telemetry still updates.
- Immutable domain operations, Vue computed state, an event log and responsive floor plan.

Five tests cover counts, event ordering, timeouts, override expiry and malformed input. No hardware is required. Number-plate registration, login, payments and external APIs are original requirements outside this display simulation. The risk document motivated the explicit unknown state rather than treating missing readings as free.

Primary tooling reference: [Vue quick start](https://vuejs.org/guide/quick-start).
