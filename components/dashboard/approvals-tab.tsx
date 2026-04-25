'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApprovalItem } from '@/lib/mock-data'

interface ApprovalsTabProps {
  approvals: ApprovalItem[]
}

function getRiskConfig(riskLevel: ApprovalItem['riskLevel']) {
  switch (riskLevel) {
    case 'low':
      return {
        label: 'Low Risk',
        className: 'bg-success/20 text-success border-success/30',
        icon: Shield
      }
    case 'medium':
      return {
        label: 'Medium Risk',
        className: 'bg-warning/20 text-warning border-warning/30',
        icon: Clock
      }
    case 'high':
      return {
        label: 'High Risk',
        className: 'bg-pink/20 text-pink border-pink/30',
        icon: AlertTriangle
      }
    case 'critical':
      return {
        label: 'Critical',
        className: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: AlertTriangle
      }
  }
}

function getBrandColor(brand: string) {
  const brandLower = brand.toLowerCase()
  if (brandLower.includes('vicelab')) return 'text-cyan'
  if (brandLower.includes('cooked')) return 'text-pink'
  if (brandLower.includes('vibeguard')) return 'text-violet'
  return 'text-foreground'
}

export function ApprovalsTab({ approvals: initialApprovals }: ApprovalsTabProps) {
  const [approvals, setApprovals] = useState(initialApprovals)
  const [processedItems, setProcessedItems] = useState<Map<string, 'approved' | 'refused'>>(new Map())

  const handleApprove = (id: string) => {
    setProcessedItems(prev => new Map(prev).set(id, 'approved'))
    setTimeout(() => {
      setApprovals(prev => prev.filter(a => a.id !== id))
    }, 600)
  }

  const handleRefuse = (id: string) => {
    setProcessedItems(prev => new Map(prev).set(id, 'refused'))
    setTimeout(() => {
      setApprovals(prev => prev.filter(a => a.id !== id))
    }, 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">Approval Queue</h3>
          <p className="text-sm text-muted-foreground">
            Review and approve pending items before they go live
          </p>
        </div>
        <Badge variant="outline" className="bg-violet/10 text-violet border-violet/30">
          {approvals.length} pending
        </Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {approvals.map((item, index) => {
          const riskConfig = getRiskConfig(item.riskLevel)
          const RiskIcon = riskConfig.icon
          const processedState = processedItems.get(item.id)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: processedState ? 0.5 : 1,
                y: 0,
                scale: processedState ? 0.98 : 1,
                backgroundColor: processedState === 'approved' 
                  ? 'rgba(34, 197, 94, 0.05)' 
                  : processedState === 'refused'
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'transparent'
              }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass rounded-xl p-6 border border-border hover:border-violet/30 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Item Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {item.id}
                    </span>
                    <span className={`text-sm font-medium ${getBrandColor(item.brand)}`}>
                      {item.brand}
                    </span>
                    <Badge variant="outline" className={riskConfig.className}>
                      <RiskIcon className="w-3 h-3 mr-1" />
                      {riskConfig.label}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-medium text-foreground">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="secondary" className="bg-secondary/80">
                      {item.category}
                    </Badge>
                  </div>
                  
                  {/* Next Action */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    <ArrowRight className="w-4 h-4 text-cyan" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Next action: </span>
                      <span className="text-foreground font-medium">{item.nextAction}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Submitted by: <span className="text-foreground">{item.submittedBy}</span></span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-3 lg:min-w-[140px]">
                  {!processedState ? (
                    <>
                      <Button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 lg:w-full bg-success/20 hover:bg-success/30 text-success border border-success/30"
                        variant="outline"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRefuse(item.id)}
                        className="flex-1 lg:w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30"
                        variant="outline"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Refuse
                      </Button>
                    </>
                  ) : (
                    <div className={`
                      flex items-center justify-center gap-2 p-3 rounded-lg
                      ${processedState === 'approved' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}
                    `}>
                      {processedState === 'approved' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Refused</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {approvals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-violet" />
          </div>
          <h3 className="text-lg font-medium mb-2">Inbox Zero</h3>
          <p className="text-muted-foreground">
            All approvals have been processed. Great work!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
