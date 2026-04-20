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

## Task Ingestion

The Control Centre ingests task definitions directly from `/tasks/*.md` at build time.

**How it works:**
1. `app/lib/tasks/loader.js` reads all `.md` files from `/tasks/`.
2. Frontmatter is parsed into structured records (`id`, `title`, `status`, `priority`, `issue`, etc.).
3. Markdown body sections (`# Goal`, `# Definition of Done`, `# Acceptance Criteria`, `# Notes`) are extracted.
4. Records are merged into the board — imported tasks replace seed tasks with matching IDs.
5. Each task card shows its `sourcePath` so the origin is always traceable.

**Fallback:**
If `/tasks` cannot be read (missing dir, parse error, build failure), the app loads from `app/lib/tasks/seed.js` and displays `Tasks source: seed fallback` in the board header.

**Adding a new task:**
1. Create the GitHub Issue (label: `codex`).
2. Add `/tasks/<ID>-<slug>.md` with the standard frontmatter.
3. Deploy — the new task appears in the board automatically.
