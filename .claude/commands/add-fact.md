# Record a supporting figure

Use exact decimal values and an explicit unit. Evidence references identify documents the operator has checked. The tool does not fetch them.

Run from the repository root:

```bash
node scripts/disclosures.mjs add-fact REV "Revenue" --cycle="September report" --value=125000.2500 --unit=NZD --evidence="archive:ledger/sep" --observed-on=2026-09-30 --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
