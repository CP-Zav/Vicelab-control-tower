import { enforceOperationalRules, DataFreshnessRules } from '@/lib/airtable-rules'

/**
 * Middleware to validate operations before database writes
 */
export const validateOperation = async (operation: {
  type: 'command' | 'log' | 'incident'
  data: any
  currentStatus?: any
  targetStatus?: any
}) => {
  // Add freshness metadata
  operation.data = DataFreshnessRules.updateFreshness(
    operation.data,
    'API'
  )

  // Run enforcement
  const validation = enforceOperationalRules(operation)

  if (!validation.valid) {
    throw new Error(
      `Validation failed: ${validation.errors.join('; ')}`
    )
  }

  return {
    data: operation.data,
    warnings: validation.warnings
  }
}

/**
 * Response formatter for enforcement results
 */
export const formatEnforcementResponse = (validation: any) => {
  return {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    processedData: validation.valid ? validation.data : null,
    timestamp: new Date().toISOString(),
    rules_applied: [
      'CommandRules.canConfirmCommand',
      'LogRules.applyRetryAutomation',
      'IncidentRules.canLinkCommandToIncident',
      'DataFreshnessRules.updateFreshness'
    ]
  }
}
