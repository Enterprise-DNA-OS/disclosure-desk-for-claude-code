---
description: "Change a narrative or its owner"
---

# Change a narrative or its owner

Use the supplied text. Every revision requires a new sign-off. Optional --owner and --due change assignment or date.

Run from the repository root:

```bash
node scripts/disclosures.mjs revise REV-01 --narrative="Revised commentary" --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
