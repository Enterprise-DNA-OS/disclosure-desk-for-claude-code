# Disclosure Desk for Claude Code

Find the report section whose figures changed after sign-off. Track evidence, reconciliations, deadlines and review decisions in a database you own. MIT licensed. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, test and import a mapped figure sheet. | Your fields, reporting rules, screens and connections. One setup fee, then a retainer. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=workiva&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=workiva&utm_medium=readme) |

Workiva quotes each organisation privately and includes unlimited users. This free base covers an operator's disclosure desk. Its scope is smaller than Workiva's reporting platform: it does not file reports, tag XBRL or edit collaborative documents. [Vendor pricing](https://www.workiva.com/pricing), checked 20 October 2026. [Scope and sources](docs/research.md).

## Quick start

Use Node 22 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/disclosure-desk-for-claude-code.git
cd disclosure-desk-for-claude-code
npm install
npm test
npm run demo
```

The demo uses a fresh temporary PGlite database, ignores DATABASE_URL, renders the reporting paperwork and removes the files when it finishes. Use npm run demo -- --keep to retain the fictional workspace. Run npm run migrate and npm run seed for a persistent fictional demo. Never seed a business workspace.

Start real work in an empty database:

```bash
npm run migrate
node scripts/disclosures.mjs init "Your business" --actor="Your name"
node scripts/disclosures.mjs add-cycle "September report" --period-end=2026-09-30 --deadline=2026-10-31 --retain-until=2034-09-30 --actor="Your name"
```

DATABASE_URL selects private Postgres; otherwise DATA_DIR selects embedded PGlite, default .data/db. OUTPUT_DIR chooses where private reports are written. Remote TLS verifies certificates. One business and one trusted operator per database. Open the folder in Claude Code, Codex, OpenCode or Cursor and describe the job. The software makes no model calls.

## Five reporting rituals

- /reporting-cycle: see every disclosure and the checks holding it back.
- /evidence-gaps: find missing sources and evidence dated before the period end.
- /tie-outs: compare source figures with schedules using exact decimals.
- /signoffs-due: find missing or outdated approvals.
- /weekly-review: write the Monday review from attention, reconciliations and sign-offs.

34 workflow commands ship in .claude/commands, backed by 30 CLI operations and the document and view renderers. [Full command reference](docs/cli.md). Use --json for machine output. Names match case-insensitively and UUID prefixes work when unique. Ambiguous references list candidates and exit 1.

## Bring your Workiva figures

Workiva supports CSV spreadsheet exports. Sheets have user-defined layouts: map a copy into one figure per row, with a code, label, value, unit, evidence reference and date. The sample is fictional.

```bash
node scripts/disclosures.mjs import workiva examples/workiva-facts.csv --cycle="September report" --dry-run --actor="Your name"
```

Inspect the dry run, then repeat without --dry-run. Use --map=examples/column-map.json for your headings. One invalid row rolls back the whole file. Identical imports are skipped. Changed values require --update, then linked disclosures need another sign-off. Formulas, comments, attachments, old review decisions and tags require separate reconciliation. [Switching guide](docs/replace-workiva.md).

## Evidence and review rules

Every figure has an explicit unit and up to four decimal places. Pairwise tie-outs require the same period and unit. A failed tie-out blocks approvals across that reporting cycle. A disclosure needs narrative, linked facts, current evidence and no open follow-ups before approval. Reviewer labels must differ from preparer labels. Changes to linked figures, links, narratives or tie-outs invalidate affected approvals. Closing a cycle requires clear checks, current approvals and a reviewed retention date, then blocks further writes.

Sign-offs record decisions supplied by the operator; they are not digital signatures or authenticated approvals. Evidence references are text pointers and the application does not verify the referenced files. History is append-only through database triggers, but a database owner can bypass these controls. The tool neither sends nor files anything. [Record checks and legal sources](docs/compliance.md).

## Paperwork and views

Set your business name, local logo and colours in brand.json. npm run docs produces disclosure packs, review records and reconciliation records. npm run view produces the reporting week, evidence and sign-off dashboards. HTML output escapes record text. /draft-report and /weekly-review write internal drafts into drafts/. No action buttons or public server are included. [Why there is no front end](docs/why-no-front-end.md).

## Ten questions answered from your own records

/insights answers these today. They are useful joins across this base, not claims about reports Workiva cannot build.

1. Which overdue disclosures still need sign-off?
2. Which owners have open follow-ups past their due dates?
3. Which figures have no evidence reference?
4. Which figures rely on evidence before the reporting period end?
5. Which reconciliations disagree beyond their tolerance?
6. Which disclosures changed after their last approval?
7. Which disclosures have no supporting figures?
8. Which figures are reused across several disclosures?
9. Which reporting cycles have a short or missing retention date?
10. Which disclosures are ready for an independent reviewer?

## Your first hour: ten things to ask for

1. Show the overdue report sections.
2. Find figures without a source reference.
3. Compare revenue with the reviewed schedule.
4. Tell me which approval became outdated after that correction.
5. Draft a follow-up for the owner of the unresolved difference.
6. Show every section using the same figure.
7. Put our business name on a disclosure review pack.
8. Draft the reporting week without sending it.
9. Add a read-only view for our committee.
10. Add our report-section category through /customise.

## Verification and operation

npm test exercises all CLI operations, repeat imports, atomic rollback, custom mappings, exact decimal comparisons, changed approvals, closed-cycle controls, drafts, export and HTML escaping. The workflow runs Node 22 on Linux and Windows. [Actual build evidence](docs/verification.md).

Back up and test restoring your database before use. JSON export is a portable record archive, not an automatic restoration command. Keep private data out of git. The NZ retention check is a screening rule, not a complete records schedule; other jurisdictions need their own policies. Accounting decisions and statutory obligations remain with the operator and their advisers.
