---
description: "Record a completed follow-up"
---

# Record a completed follow-up

Read the task and linked disclosure. Complete it only when the operator confirms the work is done.

Run from the repository root:

```bash
node scripts/disclosures.mjs complete-task "Confirm revenue adjustment" --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
