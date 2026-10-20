# Run the reporting desk

Present each disclosure with its figure count, evidence gaps, failed reconciliations, open tasks and current sign-off.

Run from the repository root:

```bash
node scripts/disclosures.mjs reporting-cycle
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
