# Current Cycle Runbook

## Execution Order

```
C1 → W2 → C2 → C3 → W4 → C4 → C5
```

| Step | ID | Description |
|------|----|-------------|
| 1 | C1 | Engine Observability Pass |
| 2 | W2 | _(wire-up / integration step)_ |
| 3 | C2 | State Transition Guardrails |
| 4 | C3 | Seed/Data Realism Upgrade |
| 5 | W4 | _(wire-up / integration step)_ |
| 6 | C4 | Filters/Search Quality Pass |
| 7 | C5 | Supabase Sync Hardening |

## Notes
- Each step must be complete and merged before the next begins.
- W steps are integration/wiring steps between Codex tasks.
- All Codex tasks tracked under the `codex` label in GitHub Issues.
