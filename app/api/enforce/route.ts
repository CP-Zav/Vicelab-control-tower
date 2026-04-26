import { enforceOperationalRules, LogRules, IncidentRules } from '@/lib/airtable-rules'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/enforce
 * Validates operations against Control Tower operational rules
 * Before writing to Airtable/Redis
 */
export async function POST(req: NextRequest) {
  try {
    const operation = await req.json()

    // Validate operation structure
    if (!operation.type || !['command', 'log', 'incident'].includes(operation.type)) {
      return NextResponse.json(
        { error: 'Invalid operation type' },
        { status: 400 }
      )
    }

    if (!operation.data) {
      return NextResponse.json(
        { error: 'Operation must include data' },
        { status: 400 }
      )
    }

    // Apply automations before validation
    if (operation.type === 'log') {
      operation.data = LogRules.applyRetryAutomation(operation.data)
    }

    // Run master enforcement
    const validation = enforceOperationalRules(operation)

    // Return validation results
    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      processedData: validation.valid ? operation.data : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Enforce API] Error:', error)
    return NextResponse.json(
      { error: 'Enforcement validation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/enforce/failures
 * Returns records that match the Failures / Dead Letters criteria
 * write_confirmed = false OR retry_status != "Not Required"
 */
export async function GET(req: NextRequest) {
  try {
    // This endpoint would query Redis/Airtable for failure records
    // For now, return the filter criteria
    const failureFilters = {
      view: '🚨 Failures / Dead Letters',
      filters: [
        {
          field: 'write_confirmed',
          operator: 'is',
          value: false
        },
        {
          operator: 'OR'
        },
        {
          field: 'retry_status',
          operator: 'is not',
          value: 'Not Required'
        }
      ],
      description: 'All logs with failed writes or pending/failed retries'
    }

    return NextResponse.json(failureFilters)
  } catch (error) {
    console.error('[Enforce API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve failure criteria' },
      { status: 500 }
    )
  }
}
