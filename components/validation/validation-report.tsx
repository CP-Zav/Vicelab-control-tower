'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronDown,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ValidationStepResult {
  step: string
  result: string
  riskLevel: string
  blockers: string[]
  warnings: string[]
  details: any
}

interface ValidationResponse {
  decision: 'GO' | 'NO-GO'
  riskLevel: string
  summaryStatus: string
  validationSteps: ValidationStepResult[]
  blockerCount: number
  blockers: string[]
  allRulesEnforced: boolean
  hardRulesStatus: Record<string, boolean>
  recommendation: string
  nextSteps: string[]
}

export function ValidationReport() {
  const [data, setData] = useState<ValidationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/validate')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Validation fetch failed:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-32 bg-secondary rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load validation report
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-destructive'
      case 'High': return 'text-orange-500'
      case 'Medium': return 'text-yellow-500'
      default: return 'text-success'
    }
  }

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-destructive/10 border-destructive/30'
      case 'High': return 'bg-orange-500/10 border-orange-500/30'
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/30'
      default: return 'bg-success/10 border-success/30'
    }
  }

  const toggleStep = (step: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(step)) {
      newExpanded.delete(step)
    } else {
      newExpanded.add(step)
    }
    setExpandedSteps(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Decision Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-6 rounded-lg border-2 glass-strong
          ${data.decision === 'GO'
            ? 'border-success/50 bg-success/5'
            : 'border-destructive/50 bg-destructive/5'
          }
        `}
      >
        <div className="flex items-start gap-4">
          {data.decision === 'GO' ? (
            <CheckCircle className="w-8 h-8 text-success flex-shrink-0 mt-1" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
          )}
          <div className="flex-1 space-y-2">
            <h2 className={`text-2xl font-bold ${data.decision === 'GO' ? 'text-success' : 'text-destructive'}`}>
              {data.summaryStatus}
            </h2>
            <p className="text-muted-foreground">{data.recommendation}</p>
            <div className="pt-3 space-y-1">
              {data.nextSteps.map((step, i) => (
                <div key={i} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hard Rules Status */}
      <Card className="glass-strong border-border p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan" />
          Hard Rules Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(data.hardRulesStatus).map(([rule, passed]) => (
            <div
              key={rule}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
            >
              {passed ? (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
              <span className="text-sm">{rule}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Validation Steps */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Validation Steps (6-Step Sequence)</h3>
        {data.validationSteps.map((step, idx) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <button
              onClick={() => toggleStep(step.step)}
              className={`
                w-full p-4 rounded-lg border transition-all text-left
                ${step.result === 'PASS'
                  ? 'bg-success/5 border-success/30 hover:bg-success/10'
                  : 'bg-destructive/5 border-destructive/30 hover:bg-destructive/10'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {step.result === 'PASS' ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium capitalize">
                      Step {idx + 1}: {step.step.replace('-', ' ')}
                    </div>
                    <div className={`text-xs mt-1 ${getRiskColor(step.riskLevel)}`}>
                      Risk: {step.riskLevel}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform flex-shrink-0 ${
                    expandedSteps.has(step.step) ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {expandedSteps.has(step.step) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`
                  p-4 border-t border-border rounded-b-lg
                  ${step.result === 'PASS'
                    ? 'bg-success/5'
                    : 'bg-destructive/5'
                  }
                `}
              >
                <div className="space-y-3">
                  {step.blockers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                        <AlertCircle className="w-4 h-4" />
                        Blockers ({step.blockers.length})
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {step.blockers.map((blocker, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-destructive flex-shrink-0">•</span>
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.warnings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-yellow-500 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Warnings ({step.warnings.length})
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {step.warnings.map((warning, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-yellow-500 flex-shrink-0">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.details && (
                    <div>
                      <div className="text-xs font-medium text-foreground/60 mb-2">Details</div>
                      <pre className="text-xs bg-secondary/50 p-2 rounded border border-border overflow-auto max-h-48 text-foreground/70">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="glass-strong border-border p-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan">{data.validationSteps.length}</div>
          <div className="text-xs text-muted-foreground">Total Steps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {data.validationSteps.filter(s => s.result === 'PASS').length}
          </div>
          <div className="text-xs text-muted-foreground">Passed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive">
            {data.blockerCount}
          </div>
          <div className="text-xs text-muted-foreground">Blockers</div>
        </div>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => window.location.reload()}
          className="bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30"
        >
          Refresh Validation Report
        </Button>
      </div>
    </div>
  )
}
