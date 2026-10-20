---
description: "Assign a reporting follow-up"
---

# Assign a reporting follow-up

Read existing tasks to avoid duplicates. Record a concrete next action with an owner and date.

Run from the repository root:

```bash
node scripts/disclosures.mjs log REV-01 "Confirm revenue adjustment" --owner="Preparer" --due=2026-10-25 --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
