# Bring a Workiva figure sheet across

Read docs/replace-workiva.md. Map the six headers, inspect a dry run, then import without --dry-run. Changed rows require explicit --update and invalidate linked approvals. Preserve original exports outside git.

Run from the repository root:

```bash
node scripts/disclosures.mjs import workiva examples/workiva-facts.csv --cycle="September report" --dry-run --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
