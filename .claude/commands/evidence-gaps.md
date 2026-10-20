---
description: "Review missing and old evidence"
---

# Review missing and old evidence

Separate a missing source reference from evidence dated before the reporting period end. The latter is an internal review rule, not a legal conclusion.

Run from the repository root:

```bash
node scripts/disclosures.mjs evidence-gaps
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
