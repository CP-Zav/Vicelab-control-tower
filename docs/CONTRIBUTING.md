# Contributing to Vicelab Control Tower

## Issue ↔ PR Linking

Every Codex PR must link to its source GitHub Issue.

In your PR body, always include:

```
Closes #<issue-number>
```

GitHub automatically closes the linked issue when the PR is merged. Use `Closes #` — not `Fixes #` or `Resolves #` (consistency matters).

---

## How to Create a Codex Task

1. Open a GitHub Issue with the `codex` label.
2. Note the issue number.
3. Create `/tasks/<ID>-<slug>.md` using this format:

```yaml
---
issue: <number>
title: <task title>
status: todo
priority: high | medium | low
owner: codex
---

# Goal

# Definition of Done

# Acceptance Criteria

# Notes
```

4. The Control Centre ingests `/tasks/*.md` automatically on the next build.

---

## How to Open a Codex PR

1. Find your task in `/tasks/` — e.g. `tasks/C1-observability.md`
2. Check the `issue:` frontmatter field for the issue number.
3. Create a branch: `codex/<ID>-<slug>` — e.g. `codex/C1-observability`
4. Use `/.github/PULL_REQUEST_TEMPLATE/codex_task.md` as your template.
5. Fill `Closes #<issue>` in the PR body.

---

## How /tasks Are Ingested

The Control Centre reads `/tasks/*.md` at build time:

- Frontmatter fields (`issue`, `title`, `status`, `priority`, `owner`) map to structured task records.
- Tasks render in the Execution Layer board automatically.
- Each task card shows its `sourcePath` for traceability.
- If `/tasks` cannot be read, the app falls back to seeded data.

---

## Fallback Behavior

If `/tasks` loading fails, the app:

1. Catches the error silently.
2. Loads seeded records from `app/lib/tasks/seed.js`.
3. Displays `Tasks source: seed fallback` in the board header.

No build failure. No broken UI.
