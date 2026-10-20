---
description: "Freeze a completed reporting cycle"
---

# Freeze a completed reporting cycle

Read the complete cycle first. All disclosures need current approvals, clear checks and an adequate retention date. Closure blocks future writes. Only close on an explicit operator instruction. There is no reopen command.

Run from the repository root:

```bash
node scripts/disclosures.mjs close-cycle "September report" --actor="Operator"
```

Use --json when composing results. Resolve ambiguous names from the listed candidates before writing. Nothing sends or publishes.
