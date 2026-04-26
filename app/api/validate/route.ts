import { NextRequest, NextResponse } from 'next/server'
import { runFullValidationSuite } from '@/lib/validation-suite'

/**
 * GET /api/validate
 * Runs full 6-step validation suite for pre-launch hardening
 * Returns comprehensive report with GO/NO-GO decision
 */
export async function GET(req: NextRequest) {
  try {
    const result = runFullValidationSuite()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      decision: result.overallResult,
      riskLevel: result.riskLevel,
      summaryStatus: result.overallResult === 'GO' ? '✓ SYSTEM READY FOR GO-LIVE' : '✗ SYSTEM NOT READY - BLOCKERS FOUND',
      validationSteps: result.reports.map(report => ({
        step: report.step,
        result: report.result,
        riskLevel: report.riskLevel,
        blockers: report.blockers,
        warnings: report.warnings,
        details: report.details
      })),
      blockerCount: result.blockersFound.length,
      blockers: result.blockersFound,
      allRulesEnforced: result.allRulesEnforced,
      hardRulesStatus: {
        'No command confirmed without log': result.reports[0].result === 'PASS',
        'No silent failures': result.reports[1].result === 'PASS',
        'No commands on Resolved/Failed incidents': result.reports[2].result === 'PASS',
        'Duplicate execution prevented': result.reports[3].result === 'PASS',
        'No stale data without warning': result.reports[4].result === 'PASS',
        'Full chain integrity': result.reports[5].result === 'PASS'
      },
      recommendation: result.overallResult === 'GO'
        ? 'System is LAUNCH SAFE. All hard rules enforced. Proceed with deployment.'
        : `System has BLOCKERS. ${result.blockersFound.length} issues must be resolved before go-live.`,
      nextSteps: result.overallResult === 'GO'
        ? ['Deploy to production', 'Monitor first 24h closely', 'Track alert volume']
        : ['Fix blockers listed above', 'Re-run validation', 'Document resolution']
    })
  } catch (error) {
    console.error('[Validate API] Error:', error)
    return NextResponse.json(
      {
        error: 'Validation suite failed to execute',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/validate/step
 * Run a specific validation step for debugging
 */
export async function POST(req: NextRequest) {
  try {
    const { step } = await req.json()

    if (!step) {
      return NextResponse.json(
        { error: 'Step parameter required' },
        { status: 400 }
      )
    }

    const { 
      validateAutomationConfirmation,
      validateFailureVisibility,
      validateIncidentStateControl,
      validateIdempotency,
      validateDataFreshness,
      validateFullChain
    } = await import('@/lib/validation-suite')

    const stepValidators: Record<string, Function> = {
      'automation': validateAutomationConfirmation,
      'failures': validateFailureVisibility,
      'incident-state': validateIncidentStateControl,
      'idempotency': validateIdempotency,
      'freshness': validateDataFreshness,
      'full-chain': validateFullChain
    }

    const validator = stepValidators[step]
    if (!validator) {
      return NextResponse.json(
        { error: `Unknown step: ${step}` },
        { status: 400 }
      )
    }

    const result = validator()

    return NextResponse.json({
      step,
      result: result.result,
      riskLevel: result.riskLevel,
      blockers: result.blockers,
      warnings: result.warnings,
      details: result.details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Validate Step API] Error:', error)
    return NextResponse.json(
      { error: 'Step validation failed' },
      { status: 500 }
    )
  }
}
