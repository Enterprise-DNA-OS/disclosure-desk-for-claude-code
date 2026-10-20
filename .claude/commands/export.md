---
description: "Create a private portable archive"
---

# Create a private portable archive

Report the generated file and record counts. The archive includes change history and is not an automatic restore. Keep it private.

Run from the repository root:

```bash
node scripts/disclosures.mjs export
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
