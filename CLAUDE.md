# Disclosure Desk for Claude Code: operating instructions

Read README.md, docs/cli.md and docs/compliance.md first. One business and one trusted operator per database. Read the workspace identity before acting. Every answer starts from the CLI; never invent a figure, evidence reference or reviewer decision.

Use scripts/disclosures.mjs for record changes. Read the disclosure and linked evidence before writing. Actor labels are supplied by the operator, not authenticated identities. A reviewer must differ from the preparer. Changed facts or narratives require another sign-off. Closed reporting cycles cannot be edited. Do not close one without an explicit operator instruction.

Never send, publish, file statutory returns or generate a digital signature. Drafts remain internal. This tool records review work, not an accountant's opinion. No deletion or reopen command exists. Keep imports, archives, private reports and credentials out of git. Do not seed a business workspace.

Use numbered migrations. Back up business data before changing the schema. Test code changes with npm test and npm run demo. DATABASE_URL selects private Postgres; otherwise DATA_DIR selects PGlite. OUTPUT_DIR selects the private output folder. brand.json controls the documents and views. Do not expose the database owner connection to a public API.

## Routing

| Job | Recipe |
|---|---|
| init | .claude/commands/init.md |
| cycles | .claude/commands/cycles.md |
| add-cycle | .claude/commands/add-cycle.md |
| cycle | .claude/commands/cycle.md |
| add-item | .claude/commands/add-item.md |
| items | .claude/commands/items.md |
| show | .claude/commands/show.md |
| revise | .claude/commands/revise.md |
| facts | .claude/commands/facts.md |
| add-fact | .claude/commands/add-fact.md |
| set-fact | .claude/commands/set-fact.md |
| link | .claude/commands/link.md |
| add-tieout | .claude/commands/add-tieout.md |
| tie-outs | .claude/commands/tie-outs.md |
| signoff | .claude/commands/signoff.md |
| log | .claude/commands/log.md |
| tasks | .claude/commands/tasks.md |
| complete-task | .claude/commands/complete-task.md |
| reporting-cycle | .claude/commands/reporting-cycle.md |
| evidence-gaps | .claude/commands/evidence-gaps.md |
| signoffs-due | .claude/commands/signoffs-due.md |
| attention | .claude/commands/attention.md |
| compliance | .claude/commands/compliance.md |
| insights | .claude/commands/insights.md |
| history | .claude/commands/history.md |
| import | .claude/commands/import.md |
| export | .claude/commands/export.md |
| draft-report | .claude/commands/draft-report.md |
| weekly-review | .claude/commands/weekly-review.md |
| close-cycle | .claude/commands/close-cycle.md |
| customise | .claude/commands/customise.md |
| new-view | .claude/commands/new-view.md |
| documents | .claude/commands/documents.md |
| views | .claude/commands/views.md |

Installed and operated through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=workiva&utm_medium=agent
