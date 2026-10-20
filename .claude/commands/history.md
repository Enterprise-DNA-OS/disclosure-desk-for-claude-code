# Read the change log

Read actor labels, entity identifiers and timestamps. JSON export includes before and after records. Labels are operator-supplied, not authenticated identities.

Run from the repository root:

```bash
node scripts/disclosures.mjs history
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
