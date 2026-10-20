---
description: "Open a reporting period"
---

# Open a reporting period

Use the dates the operator supplies. Confirm the applicable retention rule with the records owner. The software does not decide statutory deadlines.

Run from the repository root:

```bash
node scripts/disclosures.mjs add-cycle "September report" --period-end=2026-09-30 --deadline=2026-10-31 --retain-until=2034-09-30 --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
