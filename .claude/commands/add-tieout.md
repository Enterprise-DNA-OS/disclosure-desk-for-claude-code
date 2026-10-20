---
description: "Set a pairwise reconciliation"
---

# Set a pairwise reconciliation

Read both figures and units first. Use only an explicitly agreed nonnegative tolerance. This compares two figures. It is not a formula engine.

Run from the repository root:

```bash
node scripts/disclosures.mjs add-tieout "Revenue agreement" REV-LEDGER REV-SCHEDULE --cycle="September report" --tolerance=0 --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
