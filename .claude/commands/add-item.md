# Add a disclosure

Read the cycle first. Use a unique reference and a named owner. Then link supporting facts.

Run from the repository root:

```bash
node scripts/disclosures.mjs add-item REV-01 "Revenue commentary" --cycle="September report" --owner="Preparer" --due=2026-10-25 --narrative="Draft commentary" --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
