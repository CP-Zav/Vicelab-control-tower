# W3 — Approved Event Language Spec

## Status
Approved

## Overview
This document defines the canonical event language used across all engines. All event codes are machine-readable and map to human-readable messages via a central event mapping.

## Constraints
- Do NOT modify wording
- Do NOT invent new codes
- All engines MUST use these codes — no hardcoded strings

---

## Event Type Mapping

### BLOCKED
- **Code:** `DEPENDENCY_UNMET`
- **Meaning:** A record cannot activate because one or more dependencies are not yet satisfied.
- **Human message:** "Blocked — dependency not met"

### ACTIVATED
- **Code:** `TRIGGER_FIRED`
- **Meaning:** A trigger condition was evaluated as true and the record has been activated.
- **Human message:** "Activated — trigger condition met"

### OVERRIDE
- **Code:** `MANUAL_OVERRIDE`
- **Meaning:** An operator manually overrode the engine decision. Override must be logged with actor and timestamp.
- **Human message:** "State changed manually by operator"

### SYNC
- **Code:** `SYNC_FAILED`
- **Meaning:** A Supabase sync operation failed. Local-first state preserved. Retry queued.
- **Human message:** "Sync failed — local state preserved, retry pending"

---

## Usage Rules
1. All event emissions use codes from this mapping only.
2. Human-readable messages are derived from the central map — never inline strings.
3. Every emitted event includes: `code`, `message`, `timestamp`, `record_id`, `actor` (if manual).
