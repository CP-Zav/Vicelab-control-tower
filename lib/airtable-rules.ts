/**
 * AIRTABLE OPERATIONAL RULES ENFORCEMENT
 * Enforces Control Tower data integrity rules
 */

// Command Status Values
export type CommandStatus = 'Queued' | 'Executing' | 'Confirmed' | 'Failed'

// Incident Status Values
export type IncidentStatus = 'Open' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Failed'

// Retry Status Values
export type RetryStatus = 'Not Required' | 'Pending Retry' | 'Retry Failed'

/**
 * RULE 1: COMMAND ENFORCEMENT
 * Ensures command_status transitions are valid and Confirmed requires linked Log + write_confirmed
 */
export const CommandRules = {
  validStatuses: ['Queued', 'Executing', 'Confirmed', 'Failed'] as const,

  /**
   * Validates if a command can transition to "Confirmed" status
   * - Must have linked Log record
   * - Log must have write_confirmed = true
   */
  canConfirmCommand: (command: {
    linked_log_id?: string
    write_confirmed?: boolean
  }): { valid: boolean; reason?: string } => {
    if (!command.linked_log_id) {
      return {
        valid: false,
        reason: 'Command cannot be Confirmed without linked Log record'
      }
    }
    if (command.write_confirmed !== true) {
      return {
        valid: false,
        reason: 'Command cannot be Confirmed until write_confirmed = true in linked Log'
      }
    }
    return { valid: true }
  },

  /**
   * Validates command status transition
   */
  validateTransition: (
    fromStatus: CommandStatus,
    toStatus: CommandStatus,
    linkedLogId?: string
  ): { valid: boolean; reason?: string } => {
    const validTransitions: Record<CommandStatus, CommandStatus[]> = {
      'Queued': ['Executing', 'Failed'],
      'Executing': ['Confirmed', 'Failed'],
      'Confirmed': [],
      'Failed': ['Queued'] // Retry
    }

    const allowedTransitions = validTransitions[fromStatus] || []
    if (!allowedTransitions.includes(toStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${fromStatus} to ${toStatus}`
      }
    }

    if (toStatus === 'Confirmed' && !linkedLogId) {
      return {
        valid: false,
        reason: 'Confirmed status requires linked Log record'
      }
    }

    return { valid: true }
  }
}

/**
 * RULE 2: LOG VALIDATION
 * Ensures Logs table always includes required fields
 */
export const LogRules = {
  requiredFields: [
    'write_confirmed',
    'error_message',
    'retry_status',
    'result'
  ] as const,

  /**
   * Validates log record has all required fields
   */
  validateLogRecord: (log: any): { valid: boolean; missing?: string[] } => {
    const missing = LogRules.requiredFields.filter(field => !(field in log))
    if (missing.length > 0) {
      return { valid: false, missing }
    }
    return { valid: true }
  },

  /**
   * AUTOMATION: If write_confirmed = false, set retry_status = "Pending Retry"
   * This enforces the automatic retry logic
   */
  applyRetryAutomation: (log: {
    write_confirmed?: boolean
    retry_status?: RetryStatus
  }): Partial<typeof log> => {
    if (log.write_confirmed === false && log.retry_status !== 'Pending Retry') {
      return {
        ...log,
        retry_status: 'Pending Retry'
      }
    }
    return log
  }
}

/**
 * RULE 3: INCIDENT STATE LOCK
 * Enforces incident status values and prevents invalid command linking
 */
export const IncidentRules = {
  validStatuses: ['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Failed'] as const,

  /**
   * Prevents commands from linking to Resolved or Failed incidents
   */
  canLinkCommandToIncident: (
    incidentStatus: IncidentStatus
  ): { valid: boolean; reason?: string } => {
    const blockedStatuses: IncidentStatus[] = ['Resolved', 'Failed']
    if (blockedStatuses.includes(incidentStatus)) {
      return {
        valid: false,
        reason: `Cannot link commands to ${incidentStatus} incidents. Only Open, Acknowledged, or In Progress incidents accept new commands.`
      }
    }
    return { valid: true }
  },

  /**
   * Validates incident status transition
   */
  validateIncidentTransition: (
    fromStatus: IncidentStatus,
    toStatus: IncidentStatus
  ): { valid: boolean; reason?: string } => {
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      'Open': ['Acknowledged', 'In Progress'],
      'Acknowledged': ['In Progress', 'Resolved', 'Failed'],
      'In Progress': ['Resolved', 'Failed'],
      'Resolved': [],
      'Failed': ['Open'] // Reopen
    }

    const allowedTransitions = validTransitions[fromStatus] || []
    if (!allowedTransitions.includes(toStatus)) {
      return {
        valid: false,
        reason: `Cannot transition incident from ${fromStatus} to ${toStatus}`
      }
    }

    return { valid: true }
  }
}

/**
 * RULE 4: FAILURE VIEW DATA
 * Defines the data structure for the 🚨 Failures / Dead Letters view
 */
export const FailureViewRules = {
  /**
   * Defines filter conditions for the Failures view
   * write_confirmed = false OR retry_status != "Not Required"
   */
  filterConditions: {
    write_confirmed: false, // OR
    retry_status_notEqual: 'Not Required'
  },

  /**
   * Checks if a log record qualifies for the Failures view
   */
  isFailureRecord: (log: {
    write_confirmed?: boolean
    retry_status?: RetryStatus
  }): boolean => {
    return (
      log.write_confirmed === false ||
      (log.retry_status && log.retry_status !== 'Not Required')
    )
  }
}

/**
 * RULE 5: DATA FRESHNESS
 * Ensures all core tables track sync state
 */
export const DataFreshnessRules = {
  requiredSyncFields: [
    'last_synced_at',
    'data_source',
    'live_status'
  ] as const,

  /**
   * Validates record has all freshness tracking fields
   */
  validateFreshnessFields: (record: any): { valid: boolean; missing?: string[] } => {
    const missing = DataFreshnessRules.requiredSyncFields.filter(
      field => !(field in record)
    )
    if (missing.length > 0) {
      return { valid: false, missing }
    }
    return { valid: true }
  },

  /**
   * Updates freshness metadata
   */
  updateFreshness: (record: any, dataSource: string) => {
    return {
      ...record,
      last_synced_at: new Date().toISOString(),
      data_source: dataSource,
      live_status: 'Fresh'
    }
  },

  /**
   * Checks if record data is stale (> 5 minutes)
   */
  isStale: (lastSyncedAt?: string): boolean => {
    if (!lastSyncedAt) return true
    const lastSync = new Date(lastSyncedAt)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60)
    return diffMinutes > 5
  }
}

/**
 * MASTER ENFORCEMENT FUNCTION
 * Validates entire operation lifecycle
 */
export const enforceOperationalRules = (operation: {
  type: 'command' | 'log' | 'incident'
  data: any
  currentStatus?: CommandStatus | IncidentStatus
  targetStatus?: CommandStatus | IncidentStatus
}): {
  valid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  switch (operation.type) {
    case 'command':
      const cmdValidation = CommandRules.validateLogRecord(operation.data)
      if (!cmdValidation.valid) {
        errors.push(`Command missing required fields`)
      }
      if (operation.targetStatus === 'Confirmed') {
        const confirmValidation = CommandRules.canConfirmCommand(operation.data)
        if (!confirmValidation.valid) {
          errors.push(confirmValidation.reason || 'Cannot confirm command')
        }
      }
      break

    case 'log':
      const logValidation = LogRules.validateLogRecord(operation.data)
      if (!logValidation.valid) {
        errors.push(`Log missing fields: ${logValidation.missing?.join(', ')}`)
      }
      const automationApplied = LogRules.applyRetryAutomation(operation.data)
      if (automationApplied !== operation.data) {
        warnings.push('Retry automation applied: write_confirmed = false triggered retry')
      }
      break

    case 'incident':
      const incidentValidation = IncidentRules.validateIncidentTransition(
        operation.currentStatus as IncidentStatus,
        operation.targetStatus as IncidentStatus
      )
      if (!incidentValidation.valid) {
        errors.push(incidentValidation.reason || 'Invalid incident transition')
      }
      break
  }

  const freshnessValidation = DataFreshnessRules.validateFreshnessFields(operation.data)
  if (!freshnessValidation.valid) {
    warnings.push(
      `Missing freshness fields: ${freshnessValidation.missing?.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
