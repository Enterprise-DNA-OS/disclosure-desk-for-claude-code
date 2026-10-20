# Correct a supporting figure

Read every linked disclosure first. Changes invalidate their current approvals. Use a new fact code for a different unit.

Run from the repository root:

```bash
node scripts/disclosures.mjs set-fact REV --value=125001.2500 --evidence="archive:ledger/sep-revised" --observed-on=2026-09-30 --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
