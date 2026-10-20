# Bring a Workiva figure sheet across

Workiva's [spreadsheet export guide](https://support.workiva.com/hc/en-us/articles/360048485411-Export-a-spreadsheet), checked 20 October 2026, documents CSV export from File > Save As. Select a sheet, export values without formulas and retain the original privately. All sheets can also be exported in a ZIP; extract the required CSV first. Filtered views are not retained by these exports.

Workiva sheets are user-defined. There is no universal Workiva header layout. examples/workiva-facts.csv is a fictional mapping example, not a captured vendor file. Prepare a rectangular sheet with one figure per row, a header row and stable unique codes. For a presentation-style financial statement, first map a copy into this layout and reconcile it against the original.

| Canonical field | Default heading | Requirement |
|---|---|---|
| code | Code | Unique stable code within the cycle |
| label | Label | Human description |
| value | Value | Exact decimal, no currency symbol, comma grouping or formula |
| unit | Unit | Explicit currency or measure; no implicit scaling |
| evidence_ref | Evidence | Source reference; blank imports as a review exception |
| observed_on | Observed on | Valid date, YYYY-MM-DD, not in the future |

Expand any thousands or millions scaling before importing and verify totals independently. Do not mix currencies in a value. Header names can be mapped with a JSON file in the shape of examples/column-map.json. Every mapped column must exist, including Evidence when blank. CSV quoting, BOM, CRLF, doubled quotes and embedded newlines are supported.

```bash
node scripts/disclosures.mjs import workiva /private/export.csv --cycle="September report" --map=examples/column-map.json --dry-run --actor="Operator"
```

Check each proposed row. Remove --dry-run for the one-command import. The whole file commits or rolls back. Identical code and content pairs are skipped. Changed existing figures are rejected unless --update is supplied after reconciliation; updates invalidate linked approvals. Duplicate codes, malformed values and invalid dates fail the whole file. An existing code cannot change unit.

## Check before switching

Compare row counts, every value, units, dates and evidence references. Create disclosures and link their facts. Reconcile the figures in both systems. Record new independent review decisions only after checking evidence. Export a private JSON archive and test your database backup restoration. Keep the existing reporting process until the operator has accepted the replacement scope.

Narrative documents, presentation formatting, formulas, XBRL tags, comments, attachments, permissions, certification history and connector settings do not travel in this figure import. Preserve them separately. A referenced file is not copied. The free base does not file reports. Enterprise DNA maps these records and agrees any additional screens or connections for the installed version. A clean figure sheet moves in one command; retiring an entire reporting platform requires a separately accepted scope.
