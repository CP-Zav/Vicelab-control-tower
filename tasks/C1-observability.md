# [C1] Engine Observability Pass

## Goal
Make every engine decision visible and explainable.

## Definition of Done
- Structured logs for dependency, trigger, and constraint decisions
- Each event includes:
  - Machine-readable code
  - Human-readable message
- Activity feed shows reason for: `blocked`, `activated`, `skipped`
- Record detail shows decision trail
- No silent transitions

## Acceptance Criteria
- [ ] Events emitted from all engines
- [ ] Activity feed displays messages
- [ ] No hardcoded strings
- [ ] Uses central event mapping
