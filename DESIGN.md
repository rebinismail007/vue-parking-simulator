# Requirements and decisions

| Study requirement or risk | New implementation | Evidence |
| --- | --- | --- |
| Sign shows all available spaces | Count includes standard and accessible free spaces | Count test |
| Green/free, red/occupied, yellow/accessible | Status plus accessible flag drives the floor display | Browser review |
| Sensor may fail | Readings expire into unknown after 30 seconds | Timeout test and browser clock check |
| Manual handling of failure | Five-minute override while underlying telemetry continues | Override/expiry test |
| Incorrect/replayed readings | Sequence and observation-time checks | Ordering/input tests |

The original material proposes a much larger C#/Vue/Raspberry Pi system. This new module isolates the display-state problem so it can run without devices, accounts or payment services. The pure TypeScript operations are separate from the Vue view. Automated checks support the study's emphasis on small changes and explicit acceptance criteria; they do not establish how the historical group worked.
