# Record checks and their sources

Checked 20 October 2026. Scope: NZ company reporting records and internal preparation controls. The operator identifies applicable law, retention schedules and deadlines. The tool does not determine filing obligations, certify compliance, supply accounting judgments or file reports.

## NZ company record retention

The Companies Office describes seven-year retention for financial statements and accounting records. [Keeping company records](https://companies-register.companiesoffice.govt.nz/help-centre/complying-with-the-law/keeping-company-records/).

The compliance command flags missing retain_until dates or dates before period_end plus seven calendar years. This is a conservative screening calculation for a regular annual period, not a complete implementation of the statutory accounting-period rule. Companies Act 1993 section 189 refers to the current accounting period and the last seven completed periods for accounting records; irregular periods and other records need the records owner's schedule. No records are automatically deleted. A cycle cannot close until its recorded retention date passes the screen.

## Internal preparation controls

The following are design policies, not legal thresholds: a disclosure has supporting figures; source references are present; evidence dates are on or after the period end; pairwise values agree within an explicitly recorded tolerance; follow-ups are complete; narrative text exists; a reviewer's label differs from the preparer's label. All failed tie-outs in a cycle block approval throughout that cycle. Old evidence is a request for review, not proof it is invalid.

Workiva documents [certification actions and approval workflows](https://support.workiva.com/hc/en-us/sections/13887422791188-Certifications). This base uses local revision-specific decision records. It does not import or recreate a Workiva certification, signature or permission.

## Limits

Actor names are operator-supplied labels. Database owners can bypass local controls. Evidence references are stored text, not verified file contents or availability checks. The application does not retrieve sources. It never decides GAAP treatment, materiality, tax, securities disclosures or deadlines. AU and other jurisdictions need separate policies. A current approval means a recorded local decision for that revision, not an auditor's opinion or statutory certification.
