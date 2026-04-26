# Airtable Operational Rules Setup Guide

## Overview
This document outlines how to enforce Control Tower operational rules directly in Airtable to ensure data integrity, prevent invalid state transitions, and maintain consistency across Commands, Logs, and Incidents tables.

---

## RULE 1: Command Enforcement

### Objective
Ensure `command_status` transitions are valid and prevent premature "Confirmed" status without proper validation.

### Implementation Steps

#### Step 1: Add Field to Commands Table
- **Field Name:** `command_status`
- **Field Type:** `Single Select`
- **Options:** `Queued`, `Executing`, `Confirmed`, `Failed`
- **Default:** `Queued`

#### Step 2: Link to Logs Table
- **Field Name:** `linked_log`
- **Field Type:** `Link to another table`
- **Link to:** `Logs` table
- **Single select:** Yes (one log per command)

#### Step 3: Create Airtable Automation

**Trigger:** When `linked_log` is linked AND `write_confirmed` in linked Log = true

**Action:** Set `command_status` to `Confirmed`

```
IF {linked_log.write_confirmed} == TRUE
THEN {command_status} = "Confirmed"
```

#### Step 4: Add Validation Rule

Use Airtable field validation on `command_status`:

- Create a conditional field: `can_confirm_command`
  - Formula: `AND({linked_log} != BLANK(), {linked_log.write_confirmed} = TRUE)`
  - Show: Read-only message "Cannot confirm: requires linked Log with write_confirmed = true"

---

## RULE 2: Log Validation

### Objective
Ensure Logs table always includes required tracking fields and automatically applies retry logic.

### Implementation Steps

#### Step 1: Add Required Fields to Logs Table

- **Field 1: `write_confirmed`**
  - Type: Checkbox
  - Default: Unchecked

- **Field 2: `error_message`**
  - Type: Long text
  - Required: Yes (if write_confirmed = false)

- **Field 3: `retry_status`**
  - Type: Single Select
  - Options: `Not Required`, `Pending Retry`, `Retry Failed`
  - Default: `Not Required`

- **Field 4: `result`**
  - Type: Single Select
  - Options: `Success`, `Failure`, `Pending`, `Timeout`
  - Default: `Pending`

#### Step 2: Create Automation for Retry Logic

**Trigger:** When `write_confirmed` is unchecked (= false)

**Action:** Set `retry_status` to `Pending Retry`

```
IF {write_confirmed} = FALSE
THEN {retry_status} = "Pending Retry"
ELSE IF {write_confirmed} = TRUE
THEN {retry_status} = "Not Required"
```

#### Step 3: Add Conditional Required Fields

- Make `error_message` **required when** `write_confirmed` = FALSE
- Make `error_message` **hidden when** `write_confirmed` = TRUE

---

## RULE 3: Incident State Lock

### Objective
Prevent linking commands to resolved/failed incidents and enforce valid incident status transitions.

### Implementation Steps

#### Step 1: Add Incident Status Field

- **Field Name:** `incident_status`
- **Field Type:** Single Select
- **Options:** `Open`, `Acknowledged`, `In Progress`, `Resolved`, `Failed`
- **Default:** `Open`

#### Step 2: Create Command Link Field

In **Commands** table, add:

- **Field Name:** `linked_incident`
- **Field Type:** Link to another table
- **Link to:** `Incidents` table

#### Step 3: Add Validation on Command Linking

Create a formula field in **Commands** table:

```
IF(
  {linked_incident} != BLANK(),
  IF(
    OR(
      {linked_incident.incident_status} = "Resolved",
      {linked_incident.incident_status} = "Failed"
    ),
    "❌ Cannot link to Resolved/Failed incidents",
    "✓ Valid"
  ),
  "✓ No incident linked"
)
```

#### Step 4: Automation for Incident Status Transitions

Create multiple automations:

**Automation 1:** Open → Acknowledged
- Trigger: When user selects "Acknowledged"
- Action: Log in `incident_log` with timestamp

**Automation 2:** Acknowledged → In Progress
- Trigger: When user selects "In Progress"
- Action: Notify linked Commands

**Automation 3:** In Progress → Resolved
- Trigger: When user selects "Resolved"
- Action: Set `resolved_at` timestamp
- Action: Remove all pending Command links

---

## RULE 4: Failure View

### Objective
Create a dedicated view to surface all failed writes and pending retries for operational visibility.

### Implementation Steps

#### Step 1: Create View in Logs Table

- **View Name:** `🚨 Failures / Dead Letters`
- **View Type:** Grid

#### Step 2: Apply Filters

Add **two filter conditions** with OR logic:

**Filter 1:**
- Field: `write_confirmed`
- Condition: `is`
- Value: `unchecked` (false)

**Filter 2:**
- Field: `retry_status`
- Condition: `is not`
- Value: `Not Required`

#### Step 3: Sort and Highlight

- **Sort:** By `created_at` (most recent first)
- **Color:** Highlight all records red

#### Step 4: Configure Fields to Display

Show these columns:
- `log_id`
- `command_reference`
- `write_confirmed`
- `error_message`
- `retry_status`
- `result`
- `created_at`
- `last_retry_attempt`

---

## RULE 5: Data Freshness Tracking

### Objective
Ensure all core tables track sync state to identify stale or unreliable data.

### Implementation Steps

#### Step 1: Add Freshness Fields to All Core Tables

Add to **Commands**, **Logs**, **Incidents**, **Automations** tables:

- **Field 1: `last_synced_at`**
  - Type: Date & time
  - Read-only: Yes (updated via API)

- **Field 2: `data_source`**
  - Type: Single Select
  - Options: `Redis`, `Airtable`, `External API`, `Manual`
  - Default: `Manual`

- **Field 3: `live_status`**
  - Type: Single Select
  - Options: `Fresh` (< 5 min), `Stale` (5-60 min), `Stale+` (> 60 min)
  - Formula: 
  ```
  IF(
    NOT({last_synced_at}),
    "Unknown",
    IF(
      {last_synced_at} > NOW() - 300,
      "Fresh",
      IF(
        {last_synced_at} > NOW() - 3600,
        "Stale",
        "Stale+"
      )
    )
  )
  ```

#### Step 2: Create Freshness View

- **View Name:** `Data Freshness Monitor`
- **Fields:** All records, grouped by `live_status`
- **Highlight:** Stale+ records in red, Stale in yellow

---

## API Integration

### Validation Endpoint

Before writing to Airtable, POST to `/api/enforce`:

```typescript
POST /api/enforce
{
  "type": "command" | "log" | "incident",
  "data": { /* record data */ },
  "currentStatus": "Queued",
  "targetStatus": "Confirmed"
}

Response:
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "processedData": { /* validated data */ },
  "timestamp": "2026-04-27T..."
}
```

### Failures View Endpoint

Get filter criteria for Failures view:

```
GET /api/enforce/failures
```

---

## Summary of Enforced Rules

| Rule | Enforcement | Status |
|------|------------|--------|
| 1. Command Status Transitions | Formula + Automation | ✅ Implemented |
| 2. Confirmed Status Gate | Automation (requires Log + write_confirmed) | ✅ Implemented |
| 3. Log Retry Automation | Auto-set `retry_status` when write fails | ✅ Implemented |
| 4. Incident Linking Lock | Prevent commands linking to Resolved/Failed | ✅ Implemented |
| 5. Failures View | Dedicated view with OR filters | ✅ Implemented |
| 6. Data Freshness Tracking | Timestamp + status formula | ✅ Implemented |

---

## Limitations

1. **Airtable Automation Delays** – Automations may take 1-2 seconds to execute; use API enforcement for immediate validation
2. **Formula Limitations** – Complex conditional logic may require API fallback
3. **View-Only Enforcement** – Views don't prevent writes; use field validation + API gates
4. **No Real-Time Sync** – Airtable updates are eventually consistent; use Redis for real-time state
5. **Retry Logic** – Manual intervention may be needed for complex retry scenarios; consider queue system

---

## Best Practices

1. **Always validate via API before Airtable write** – Call `/api/enforce` first
2. **Use Redis for operational state** – Airtable as audit log, Redis for current state
3. **Monitor Failures view daily** – Dead letters require human intervention
4. **Test state transitions** – Use Airtable test records before production
5. **Document custom automations** – Keep this file updated as rules change
