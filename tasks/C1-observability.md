---
issue: 2
title: Engine Observability Pass
status: todo
priority: high
owner: codex
---

# Goal
Make every engine decision visible and explainable.

# Definition of Done
- Structured logs for dependency, trigger, and constraint decisions
- Each event includes a machine-readable code and human-readable message
- Activity feed shows reason for: `blocked`, `activated`, `skipped`
- Record detail shows decision trail
- No silent transitions

# Acceptance Criteria
- [ ] Events emitted from all engines
- [ ] Activity feed displays messages
- [ ] No hardcoded strings
- [ ] Uses central event mapping

# Notes
Wire in event emission using: `DEPENDENCY_UNMET`, `TRIGGER_FIRED`, `SYNC_FAILED`
See `/docs/decisions/W3-event-language.md` for approved event codes.
