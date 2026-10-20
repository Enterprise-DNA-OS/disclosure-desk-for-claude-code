# Command reference

Run commands from the repository root with Node 22 or later. Options use --name=value; --json, --dry-run, --update and --all are switches. Write operations require --actor. Names match case-insensitively, UUID prefixes must be unique. Ambiguity lists candidates and exits 1. Decimal input has at most 16 integer and four fractional digits. Dates use YYYY-MM-DD.

## init

Start an empty business workspace. Read the workspace first. Initialise only an empty database. Never load fictional seed data into it.

```bash
node scripts/disclosures.mjs init "Business name" --actor="Operator"
```

## cycles

List reporting periods. Show each period end, delivery deadline, retention date and open or closed state.

```bash
node scripts/disclosures.mjs cycles
```

## add-cycle

Open a reporting period. Use the dates the operator supplies. Confirm the applicable retention rule with the records owner; the software does not decide statutory deadlines.

```bash
node scripts/disclosures.mjs add-cycle "September report" --period-end=2026-09-30 --deadline=2026-10-31 --retain-until=2034-09-30 --actor="Operator"
```

## cycle

Read a full reporting period. Read dates and disclosure checks together. Distinguish closed periods from work in progress.

```bash
node scripts/disclosures.mjs cycle "September report"
```

## add-item

Add a disclosure. Read the cycle first. Use a unique reference and a named owner; then link supporting facts.

```bash
node scripts/disclosures.mjs add-item REV-01 "Revenue commentary" --cycle="September report" --owner="Preparer" --due=2026-10-25 --narrative="Draft commentary" --actor="Operator"
```

## items

List disclosures. Show reference, title, owner, due date and revision. Use show for the complete record.

```bash
node scripts/disclosures.mjs items
```

## show

Read a disclosure and its evidence. Read its narrative, linked figures, decision history and follow-ups before changing it.

```bash
node scripts/disclosures.mjs show REV-01
```

## revise

Change a narrative or its owner. Use the supplied text. Every revision requires a new sign-off. Optional --owner and --due change assignment or date.

```bash
node scripts/disclosures.mjs revise REV-01 --narrative="Revised commentary" --actor="Operator"
```

## facts

Read supporting figures. Keep values with their units and evidence references. Never sum different units or currencies.

```bash
node scripts/disclosures.mjs facts
```

## add-fact

Record a supporting figure. Use exact decimal values and an explicit unit. Evidence references identify documents the operator has checked; the tool does not fetch them.

```bash
node scripts/disclosures.mjs add-fact REV "Revenue" --cycle="September report" --value=125000.2500 --unit=NZD --evidence="archive:ledger/sep" --observed-on=2026-09-30 --actor="Operator"
```

## set-fact

Correct a supporting figure. Read every linked disclosure first. Changes invalidate their current approvals. Use a new fact code for a different unit.

```bash
node scripts/disclosures.mjs set-fact REV --value=125001.2500 --evidence="archive:ledger/sep-revised" --observed-on=2026-09-30 --actor="Operator"
```

## link

Connect a disclosure to a figure. Both records must belong to the same reporting cycle. Adding a link changes the disclosure revision. Repeating the same link does nothing.

```bash
node scripts/disclosures.mjs link REV-01 REV --actor="Operator"
```

## add-tieout

Set a pairwise reconciliation. Read both figures and units first. Use only an explicitly agreed nonnegative tolerance. This compares two figures; it is not a formula engine.

```bash
node scripts/disclosures.mjs add-tieout "Revenue agreement" REV-LEDGER REV-SCHEDULE --cycle="September report" --tolerance=0 --actor="Operator"
```

## tie-outs

Review numerical agreements. Show the two values, difference, unit, tolerance and result. A failed reconciliation blocks approval throughout its cycle.

```bash
node scripts/disclosures.mjs tie-outs
```

## signoff

Record an independent review decision. Read show and the current checks. Only record a decision actually supplied by the reviewer. Reviewer and preparer labels must differ. Use --decision=returned to record a return. This is a review record, not an authenticated digital signature.

```bash
node scripts/disclosures.mjs signoff REV-01 --decision=approved --evidence="archive:review/123" --actor="Reviewer"
```

## log

Assign a reporting follow-up. Read existing tasks to avoid duplicates. Record a concrete next action with an owner and date.

```bash
node scripts/disclosures.mjs log REV-01 "Confirm revenue adjustment" --owner="Preparer" --due=2026-10-25 --actor="Operator"
```

## tasks

Read open follow-ups. Show overdue work first. Add --all to include completed tasks.

```bash
node scripts/disclosures.mjs tasks
```

## complete-task

Record a completed follow-up. Read the task and linked disclosure. Complete it only when the operator confirms the work is done.

```bash
node scripts/disclosures.mjs complete-task "Confirm revenue adjustment" --actor="Operator"
```

## reporting-cycle

Run the reporting desk. Present each disclosure with its figure count, evidence gaps, failed reconciliations, open tasks and current sign-off.

```bash
node scripts/disclosures.mjs reporting-cycle
```

## evidence-gaps

Review missing and old evidence. Separate a missing source reference from evidence dated before the reporting period end. The latter is an internal review rule, not a legal conclusion.

```bash
node scripts/disclosures.mjs evidence-gaps
```

## signoffs-due

Find work awaiting review. List open-cycle disclosures without a current approval, ordered by due date. An old approval is not an approval of the new revision.

```bash
node scripts/disclosures.mjs signoffs-due
```

## attention

Triage the reporting week. Read every flagged disclosure before assigning work. Show the reason and owner. A record labelled Ready may still be overdue.

```bash
node scripts/disclosures.mjs attention
```

## compliance

Check records and review controls. Read docs/compliance.md. Explain the NZ retention screen separately from internal evidence checks. Report exceptions, never certify compliance.

```bash
node scripts/disclosures.mjs compliance
```

## insights

Answer ten joined reporting questions. Return only the questions relevant to the operator and their actual rows. Empty results are not proof of complete source records.

```bash
node scripts/disclosures.mjs insights
```

## history

Read the change log. Read actor labels, entity identifiers and timestamps. JSON export includes before and after records. Labels are operator-supplied, not authenticated identities.

```bash
node scripts/disclosures.mjs history
```

## import

Bring a Workiva figure sheet across. Read docs/replace-workiva.md. Map the six headers, inspect a dry run, then import without --dry-run. Changed rows require explicit --update and invalidate linked approvals. Preserve original exports outside git.

```bash
node scripts/disclosures.mjs import workiva examples/workiva-facts.csv --cycle="September report" --dry-run --actor="Operator"
```

## export

Create a private portable archive. Report the generated file and record counts. The archive includes change history and is not an automatic restore. Keep it private.

```bash
node scripts/disclosures.mjs export
```

## draft-report

Draft an internal disclosure briefing. Read cycle and show first. Return the saved draft path and unresolved checks. Do not issue, file or send it.

```bash
node scripts/disclosures.mjs draft-report "September report"
```

## weekly-review

Write the Monday reporting review. Read attention, tie-outs and signoffs-due. The command writes their results to an internal draft. Summarise owners, deadlines and unresolved evidence. Never send it.

```bash
node scripts/disclosures.mjs weekly-review
```

## close-cycle

Freeze a completed reporting cycle. Read the complete cycle first. All disclosures need current approvals, clear checks and an adequate retention date. Closure blocks future writes. Only close on an explicit operator instruction; there is no reopen command.

```bash
node scripts/disclosures.mjs close-cycle "September report" --actor="Operator"
```

