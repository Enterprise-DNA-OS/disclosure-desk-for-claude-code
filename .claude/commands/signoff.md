# Record an independent review decision

Read show and the current checks. Only record a decision actually supplied by the reviewer. Reviewer and preparer labels must differ. Use --decision=returned to record a return. This is a review record, not an authenticated digital signature.

Run from the repository root:

```bash
node scripts/disclosures.mjs signoff REV-01 --decision=approved --evidence="archive:review/123" --actor="Reviewer"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
