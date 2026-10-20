---
description: "Find work awaiting review"
---

# Find work awaiting review

List open-cycle disclosures without a current approval, ordered by due date. An old approval is not an approval of the new revision.

Run from the repository root:

```bash
node scripts/disclosures.mjs signoffs-due
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
