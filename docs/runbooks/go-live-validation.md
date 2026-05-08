# GO-LIVE VALIDATION RUNBOOK
**System:** ViceLab Control Tower
**Status:** ACTIVE — must be executed in full before GO decision
**Rule:** Any FAIL = immediate NO-GO. "Partially enforced" = FAIL.

---

## REQUIRED AIRTABLE SCHEMA

Before running any check, verify these fields exist and are correctly typed.

### Commands table
| Field | Type | Required values |
|---|---|---|
| `command_id` | Formula / Auto-number | Unique, auto-generated |
| `idempotency_key` | Single line text | Must be set before execution |
| `status` | Single select | `Pending`, `Confirmed`, `Failed` |
| `write_confirmed` | Checkbox | Unchecked by default |
| `incident_id` | Link to Incidents | Required |
| `log_id` | Link to Logs | Populated after log write |
| `created_at` | Created time | Auto |

### Logs table
| Field | Type | Required values |
|---|---|---|
| `log_id` | Formula / Auto-number | Unique |
| `command_id` | Link to Commands | Required |
| `write_confirmed` | Checkbox | Set true only on confirmed write |
| `retry_status` | Single select | `Not Required`, `Pending Retry`, `Retrying`, `Retry Failed` |
| `failure_reason` | Long text | Populated on failure |
| `created_at` | Created time | Auto |

### Incidents table
| Field | Type | Required values |
|---|---|---|
| `incident_id` | Formula / Auto-number | Unique |
| `status` | Single select | `Active`, `Resolved`, `Failed` |
| `linked_commands` | Link to Commands | Rollup allowed |

### Alerts table
| Field | Type | Required values |
|---|---|---|
| `alert_id` | Formula / Auto-number | Unique |
| `linked_incident` | Link to Incidents | Set when incident created |
| `status` | Single select | `Open`, `Linked`, `Closed` |

### Dead Letters table (separate table, not a view)
| Field | Type | Notes |
|---|---|---|
| `record_id` | Single line text | ID of the originating record |
| `record_type` | Single select | `Command`, `Log`, `Sync` |
| `failure_reason` | Long text | Error message from Make |
| `retry_status` | Single select | `Pending Retry`, `Abandoned` |
| `created_at` | Created time | Auto |
| `raw_payload` | Long text | Full JSON payload at time of failure |

---

## REQUIRED AIRTABLE VIEWS

Create each view exactly as specified. Names are exact — used in Make.com filters.

### View 1 — `Failures / Dead Letters`
**Table:** Dead Letters
**Filter:** none (show all)
**Sort:** `created_at` descending
**Purpose:** Primary visibility surface for all failures.

### View 2 — `Unconfirmed Commands`
**Table:** Commands
**Filter:** `write_confirmed` is unchecked AND `status` is `Confirmed`
**Purpose:** Detects commands that reached Confirmed without a log — this view must always be empty in production.

### View 3 — `Pending Retry Logs`
**Table:** Logs
**Filter:** `retry_status` is `Pending Retry` OR `retry_status` is `Retrying`
**Sort:** `created_at` ascending
**Purpose:** Queue surface for Make retry scenario.

### View 4 — `Blocked Commands`
**Table:** Commands
**Filter:** `status` is `Failed` AND `failure_reason` contains `incident_blocked`
**Purpose:** Audit trail for state-guard violations.

---

## REQUIRED MAKE.COM ERROR HANDLERS

Apply to every Make.com scenario without exception.

### Standard Error Handler Module (add to every scenario)

```
Route: Error Handler
Trigger: Any module failure

Step 1 — Create Dead Letter record in Airtable
  Table: Dead Letters
  Fields:
    record_id:      {{triggering_module.record_id}}
    record_type:    [Command | Log | Sync — set per scenario]
    failure_reason: {{error.message}}
    retry_status:   Pending Retry
    raw_payload:    {{toJSON(triggering_module.input)}}

Step 2 — Update originating record
  If record_type = Command:
    Set Commands.status = Failed
    Set Commands.write_confirmed = false
  If record_type = Log:
    Set Logs.write_confirmed = false
    Set Logs.retry_status = Pending Retry

Step 3 — Stop scenario with INCOMPLETE (not Error)
  Reason: Error status suppresses downstream routes
```

---

## REQUIRED IDEMPOTENCY PATTERN

Implement in every Make.com scenario that writes a Command record.

```
BEFORE executing any command action:

Step 1 — Search Airtable Commands table
  Filter: idempotency_key = {{input.idempotency_key}}
           AND status != Failed

Step 2 — Check result count
  IF count > 0:
    → Create Log record:
        command_id:     {{found_record.command_id}}
        write_confirmed: false
        failure_reason: "Duplicate execution blocked — idempotency_key already processed"
        retry_status:   Not Required
    → Set Command.status = Failed
    → Stop scenario (success — this is expected behaviour)

  IF count = 0:
    → Continue to execution

idempotency_key format:
  {{incident_id}}_{{command_type}}_{{formatDate(now; "YYYY-MM-DD")}}

  Example: INC-004_EMAIL_OUTREACH_2026-05-08

  Rule: Same incident, same command type, same calendar day = duplicate.
  Override: Only allowed via MANUAL_OVERRIDE event code, logged with actor.
```

---

## REQUIRED INCIDENT TRANSITION GUARD LOGIC

Implement as the first step in any Make.com scenario that creates or confirms a Command.

```
GUARD: Incident State Check

Step 1 — Fetch linked Incident record
  Table: Incidents
  Record ID: {{command.incident_id}}

Step 2 — Read incident.status

Step 3 — Evaluate
  IF status = "Resolved" OR status = "Failed":
    → Create Command record with:
        status:         Failed
        failure_reason: "incident_blocked — incident status is {{incident.status}}"
        write_confirmed: false
    → Create Log record with:
        command_id:     {{new_command.command_id}}
        write_confirmed: false
        failure_reason: "Command rejected — incident {{incident.incident_id}} is {{incident.status}}"
        retry_status:   Not Required
    → Create Dead Letter record
    → Stop scenario

  IF status = "Active":
    → Continue to command execution
```

---

## CHECK 1 — LOG CONFIRMATION ENFORCEMENT

**Purpose:** No command reaches `Confirmed` status without a linked Log record where `write_confirmed = true`.

### Make.com setup required
The Command confirmation scenario must follow this exact sequence:

```
Step 1 — Incident state guard (see above)
Step 2 — Idempotency check (see above)
Step 3 — Execute command action
Step 4 — Create Log record
    write_confirmed: false  (default)
    retry_status:   Not Required
Step 5 — On Log create success:
    Set Log.write_confirmed = true
    Set Command.write_confirmed = true
    Set Command.status = Confirmed
    Set Command.log_id = {{log.log_id}}

  On Log create failure:
    → Error handler (see above)
    → Command status remains Pending or set to Failed
    → Command.write_confirmed remains false
```

### Test input
```
Incident:       Create Incident record, status = Active, id = TEST-INC-001
Command type:   Test Confirmation
idempotency_key: TEST-INC-001_TEST_CONFIRMATION_2026-05-08
```

### Execution steps
1. Trigger the command confirmation scenario with the above input.
2. Before Step 5 completes, check Airtable — `Commands.status` must still be `Pending`.
3. Allow scenario to complete.
4. Check Airtable.

### Pass condition
- `Commands.status` = `Confirmed`
- `Commands.write_confirmed` = checked
- `Commands.log_id` is populated
- Linked `Logs` record exists with `write_confirmed` = checked
- `Unconfirmed Commands` view is empty

### Fail condition
- `Commands.status` = `Confirmed` AND `Commands.write_confirmed` = unchecked
- `Commands.status` = `Confirmed` AND `Commands.log_id` is empty
- Log record does not exist

### Expected Airtable records
| Table | Field | Value |
|---|---|---|
| Commands | status | Confirmed |
| Commands | write_confirmed | true |
| Commands | log_id | [populated] |
| Logs | write_confirmed | true |
| Logs | retry_status | Not Required |

### Evidence required
- Screenshot: Commands record showing `status = Confirmed`, `write_confirmed = checked`, `log_id` populated
- Screenshot: Linked Logs record showing `write_confirmed = checked`
- Screenshot: `Unconfirmed Commands` view showing 0 records

### Remediation if failed
1. Check Make scenario Step 5 — confirm it is not setting `status = Confirmed` before `write_confirmed = true`.
2. Wrap Steps 4+5 in a single atomic sequence: Log create → on success → update Command.
3. Re-run test. Do not proceed until PASS.

---

## CHECK 2 — DEAD LETTERS / FAILURE VISIBILITY

**Purpose:** Every Make.com failure produces a visible Dead Letter record. No failure is silent.

### Make.com setup required
Error handler is attached to every active scenario (see Required Make Error Handlers above).

### Test input
Force a controlled failure:
```
Scenario:       Log write scenario
Method:         In the Log create module, temporarily set a required field to an
                invalid type (e.g., set write_confirmed to a string "INVALID")
Expected:       Module fails, error handler fires
Restore after:  Revert the invalid field immediately after test
```

### Execution steps
1. Introduce the invalid field value.
2. Trigger the scenario.
3. Check Dead Letters table in Airtable within 60 seconds.
4. Revert the invalid field.

### Pass condition
- Dead Letter record exists with:
  - `record_type` = `Log`
  - `failure_reason` contains the Make.com error message
  - `retry_status` = `Pending Retry`
  - `raw_payload` populated
- `Failures / Dead Letters` Airtable view shows the record
- No error is swallowed — scenario does not show as "Success" in Make.com history

### Fail condition
- No Dead Letter record created
- Dead Letter record exists but `failure_reason` is empty
- Make.com scenario history shows "Success" despite the module failure

### Expected Airtable records
| Table | Field | Value |
|---|---|---|
| Dead Letters | record_type | Log |
| Dead Letters | failure_reason | [Make error text] |
| Dead Letters | retry_status | Pending Retry |
| Dead Letters | raw_payload | [JSON string] |

### Evidence required
- Screenshot: Make.com scenario history showing the execution with error state
- Screenshot: Dead Letters Airtable record — all fields visible
- Screenshot: `Failures / Dead Letters` Airtable view with the record visible

### Remediation if failed
1. Verify error handler route is enabled in Make scenario settings (Routes → Error Handler).
2. Verify the Airtable module inside the error handler has correct table name and field mappings.
3. Re-run test. Do not proceed until PASS.

---

## CHECK 3 — INCIDENT STATE BLOCKING

**Purpose:** Commands cannot be created or confirmed against incidents with status `Resolved` or `Failed`.

### Make.com setup required
Incident transition guard is the first step in the command scenario (see Required Incident Transition Guard Logic above).

### Test input
```
Test A — Resolved incident:
  Incident:       Create record, status = Resolved, id = TEST-INC-002
  Command type:   Test Block Resolved

Test B — Failed incident:
  Incident:       Create record, status = Failed, id = TEST-INC-003
  Command type:   Test Block Failed
```

### Execution steps
1. Run Test A: trigger command scenario linked to TEST-INC-002.
2. Check results.
3. Run Test B: trigger command scenario linked to TEST-INC-003.
4. Check results.

### Pass condition (both tests)
- Command record created with `status = Failed`
- Command `failure_reason` contains `incident_blocked`
- Log record created with matching `failure_reason`
- Dead Letter record created
- `Blocked Commands` Airtable view shows both records
- Incident record is unchanged (status not modified)

### Fail condition
- Command reaches `Confirmed` or `Pending` without being blocked
- No failure log created
- Incident status is modified by the scenario

### Expected Airtable records (per test)
| Table | Field | Value |
|---|---|---|
| Commands | status | Failed |
| Commands | failure_reason | incident_blocked — incident status is Resolved |
| Commands | write_confirmed | false |
| Logs | failure_reason | Command rejected — incident TEST-INC-002 is Resolved |
| Logs | write_confirmed | false |
| Logs | retry_status | Not Required |
| Dead Letters | record_type | Command |

### Evidence required
- Screenshot: Failed Command record — all fields visible including `failure_reason`
- Screenshot: Linked Log record — `write_confirmed` unchecked
- Screenshot: `Blocked Commands` view showing both test records
- Screenshot: Original Incident records — status unchanged

### Remediation if failed
1. Confirm the incident state guard is the first module in the scenario, before any command creation.
2. Confirm the guard's filter checks both `Resolved` AND `Failed` (not just one).
3. Re-run both tests. Do not proceed until both PASS.

---

## CHECK 4 — IDEMPOTENCY / DUPLICATE PREVENTION

**Purpose:** A command with an already-processed `idempotency_key` is blocked on second execution.

### Make.com setup required
Idempotency check runs after the incident guard and before execution (see Required Idempotency Pattern above).

### Test input
```
First execution:
  Incident:        TEST-INC-001 (status = Active)
  idempotency_key: TEST-INC-001_IDEMPOTENCY_TEST_2026-05-08
  Expected:        Executes and confirms

Second execution (immediate repeat — same key):
  Incident:        TEST-INC-001
  idempotency_key: TEST-INC-001_IDEMPOTENCY_TEST_2026-05-08
  Expected:        Blocked
```

### Execution steps
1. Run first execution. Verify PASS on Check 1 (command confirmed with log).
2. Immediately re-trigger the same scenario with identical input.
3. Check Airtable.

### Pass condition
- First execution: Command `status = Confirmed`, `write_confirmed = true`
- Second execution: New Command record created with `status = Failed`
- Second Command `failure_reason` contains `Duplicate execution blocked`
- Log record created for the duplicate with `retry_status = Not Required`
- Only one `Confirmed` Command exists for this `idempotency_key`

### Fail condition
- Second Command reaches `Confirmed`
- No duplicate log created
- First Command is overwritten or modified by second execution

### Expected Airtable records
| Table | Field | Value |
|---|---|---|
| Commands (first) | status | Confirmed |
| Commands (first) | write_confirmed | true |
| Commands (second) | status | Failed |
| Commands (second) | failure_reason | Duplicate execution blocked — idempotency_key already processed |
| Logs (second) | write_confirmed | false |
| Logs (second) | retry_status | Not Required |

### Evidence required
- Screenshot: Both Command records side by side — first Confirmed, second Failed
- Screenshot: Second Command's `failure_reason` field
- Screenshot: Airtable search on `idempotency_key` showing exactly one Confirmed record

### Remediation if failed
1. Confirm the idempotency search filter matches on `idempotency_key` AND excludes records where `status = Failed` (failed records should allow retry with a new key).
2. Confirm the guard stops the scenario before any action is taken on duplicate detection.
3. Re-run test. Do not proceed until PASS.

---

## CHECK 5 — ELLA STALE DATA WARNING

**Purpose:** When `last_synced_at` is older than the freshness threshold, Ella must output a stale data warning before any recommendation.

### Required threshold
```
Freshness threshold: 30 minutes
Stale condition:     now() - last_synced_at > 30 minutes
```

### Make.com / Ella setup required
Before Ella processes any query, the scenario must:
```
Step 1 — Read system record or relevant Airtable record's last_synced_at
Step 2 — Calculate age: {{dateDifference(now; last_synced_at; "minutes")}}
Step 3 — IF age > 30:
    Prepend to Ella's response:
    "⚠️ Data may be stale. Last synced: {{last_synced_at}}.
     Recommendations may be unreliable. Verify current state before acting."
    Then continue with response (do not block entirely).
  IF age <= 30:
    Continue normally.
```

### Test input
```
Step 1: Set the relevant record's last_synced_at to 2 hours ago.
        Example value: {{addMinutes(now; -120)}}
Step 2: Submit a query to Ella: "What should I prioritise right now?"
Step 3: Read Ella's output.
```

### Pass condition
- Ella's response begins with the exact stale warning text before any recommendation content
- Warning includes the actual `last_synced_at` timestamp
- Ella still provides a response (warning does not silently block)

### Fail condition
- Ella provides recommendations with no warning
- Ella is blocked entirely with no output (warning must appear, not suppress)
- Warning text is present but `last_synced_at` timestamp is missing or incorrect

### Expected output (exact required prefix)
```
⚠️ Data may be stale. Last synced: [timestamp].
Recommendations may be unreliable. Verify current state before acting.
```

### Evidence required
- Screenshot: Airtable record showing `last_synced_at` set to stale value
- Screenshot: Full Ella response — warning visible at the top before any recommendation text
- Screenshot: `last_synced_at` timestamp in the warning matches the Airtable field value

### Remediation if failed
1. Confirm the freshness check step runs before Ella's output module, not after.
2. Confirm the warning text is prepended, not appended.
3. Confirm `last_synced_at` is passed into the warning text as a variable, not hardcoded.
4. Re-run test. Do not proceed until PASS.

---

## CHECK 6 — FULL CHAIN TEST

**Purpose:** The complete operational chain — Alert → Incident → Command → Log — executes correctly end to end, all records are linked, all status transitions are correct, and data persists after page refresh.

### Test input
```
Alert:    Create manually in Airtable
          alert_id:   CHAIN-ALERT-001
          status:     Open

Incident: Create via Make.com scenario (or manually if no automation yet)
          incident_id: CHAIN-INC-001
          status:      Active
          linked_alert: CHAIN-ALERT-001

Command:  Trigger via Make.com scenario
          incident_id:    CHAIN-INC-001
          command_type:   Chain Test
          idempotency_key: CHAIN-INC-001_CHAIN_TEST_2026-05-08

Log:      Created automatically by command scenario
```

### Execution steps
1. Create Alert record `CHAIN-ALERT-001`, status = `Open`.
2. Create Incident record `CHAIN-INC-001`, link to alert, status = `Active`. Update Alert status to `Linked`.
3. Trigger command scenario for `CHAIN-INC-001`.
4. Wait for scenario to complete (max 60 seconds).
5. Check all four records in Airtable.
6. Refresh the browser / re-open Airtable.
7. Re-check all four records.

### Pass condition
- Alert `CHAIN-ALERT-001`: `status = Linked`, `linked_incident` = `CHAIN-INC-001`
- Incident `CHAIN-INC-001`: `status = Active`, `linked_commands` contains the Command record
- Command: `status = Confirmed`, `write_confirmed = true`, `log_id` populated, `incident_id = CHAIN-INC-001`
- Log: `write_confirmed = true`, `retry_status = Not Required`, `command_id` populated
- All links are bidirectional (Command → Incident → Alert navigable in Airtable)
- After browser refresh: all values identical — no rollback, no clearing

### Fail condition
- Any record missing
- Any link is one-directional or empty
- `write_confirmed` is false on Command or Log
- Data changes or disappears after refresh
- Any step required manual intervention not specified in this test

### Expected Airtable records
| Table | Record | Key fields |
|---|---|---|
| Alerts | CHAIN-ALERT-001 | status = Linked, linked_incident = CHAIN-INC-001 |
| Incidents | CHAIN-INC-001 | status = Active, linked_commands = [populated] |
| Commands | [auto] | status = Confirmed, write_confirmed = true, log_id = [populated] |
| Logs | [auto] | write_confirmed = true, retry_status = Not Required |

### Evidence required
- Screenshot: Alert record — `status`, `linked_incident` visible
- Screenshot: Incident record — `status`, `linked_commands` visible
- Screenshot: Command record — `status`, `write_confirmed`, `log_id` visible
- Screenshot: Log record — `write_confirmed`, `retry_status`, `command_id` visible
- Screenshot: Same four records after browser refresh — values unchanged

### Remediation if failed
Diagnose by isolation:
1. If Alert → Incident link missing: fix Incident creation scenario to set `linked_alert`.
2. If Command → Incident link missing: fix command scenario field mapping.
3. If Log missing: fix Step 4 in command scenario (log creation before confirmation).
4. If data clears on refresh: Airtable sync issue — check Make.com scenario for failed writes silently ignored.
5. Re-run full chain from Step 1. Do not proceed until PASS.

---

## EVIDENCE TEMPLATE

Copy this block and complete it for each check. Do not mark PASS without a screenshot reference.

```
CHECK [N] — [NAME]
Executed by:   [name]
Executed at:   [YYYY-MM-DD HH:MM UTC]
Test input:    [exact values used]

Results:
  [field]:     [actual value]
  [field]:     [actual value]

Screenshots:
  1. [filename or description]
  2. [filename or description]
  3. [filename or description]

Unconfirmed Commands view: [0 records / N records — FAIL if N > 0]
Dead Letters created:      [Yes / No]

RESULT: PASS / FAIL
Blocker (if FAIL): [exact description]
```

---

## FINAL GO/NO-GO DECISION FORMAT

Complete after all six checks are executed.

```
GO-LIVE DECISION
Date:          [YYYY-MM-DD]
Executed by:   [name]

CHECK RESULTS:
  Check 1 — Log confirmation:    PASS / FAIL
  Check 2 — Dead letters:        PASS / FAIL
  Check 3 — Incident blocking:   PASS / FAIL
  Check 4 — Idempotency:         PASS / FAIL
  Check 5 — Ella freshness:      PASS / FAIL
  Check 6 — Full chain:          PASS / FAIL

BLOCKERS:
  [List any FAIL blockers here, or "None"]

UNCONFIRMED COMMANDS VIEW: [must show 0 records]
DEAD LETTERS VIEW: [must show 0 unexpected records]

DECISION: GO / NO-GO

Authorised by: [name]
```

**GO requires:** All six checks PASS, zero blockers, zero records in Unconfirmed Commands view.
**NO-GO triggers:** Any single FAIL, any partially completed check, any untested check.

---

## EXECUTE FIRST: CHECK 1

Begin here. Do not run Check 2 until Check 1 returns PASS with screenshots.

**Pre-flight before starting Check 1:**
1. Confirm `Unconfirmed Commands` view exists in Airtable and is filtered correctly.
2. Confirm `Dead Letters` table exists with all required fields.
3. Confirm the command confirmation Make.com scenario has the error handler attached.
4. Confirm `idempotency_key` field exists on Commands table.

**Then run Check 1 exactly as specified above.**

Return the completed evidence block for Check 1 before proceeding to Check 2.
