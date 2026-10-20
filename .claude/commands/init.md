---
description: "Start an empty business workspace"
---

# Start an empty business workspace

Read the workspace first. Initialise only an empty database. Never load fictional seed data into it.

Run from the repository root:

```bash
node scripts/disclosures.mjs init "Business name" --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
