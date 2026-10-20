---
description: "Connect a disclosure to a figure"
---

# Connect a disclosure to a figure

Both records must belong to the same reporting cycle. Adding a link changes the disclosure revision. Repeating the same link does nothing.

Run from the repository root:

```bash
node scripts/disclosures.mjs link REV-01 REV --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
