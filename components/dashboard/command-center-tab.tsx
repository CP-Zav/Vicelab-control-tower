'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  Play, 
  CheckCircle, 
  BookOpen,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Workflow
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const commandSteps = [
  {
    id: 'brief',
    title: 'Brief',
    description: 'Daily intelligence gathering and priority ranking across all brands and channels.',
    icon: FileText,
    color: 'cyan',
    details: [
      'Aggregate pending tasks from all systems',
      'AI-powered priority scoring',
      'Revenue impact analysis',
      'Risk assessment and flagging'
    ]
  },
  {
    id: 'execute',
    title: 'Execute',
    description: 'One-click deployment of approved tasks to their respective platforms.',
    icon: Play,
    color: 'violet',
    details: [
      'Batch execution support',
      'Real-time status tracking',
      'Automatic retry on failure',
      'Cross-platform synchronization'
    ]
  },
  {
    id: 'approve',
    title: 'Approve',
    description: 'Human-in-the-loop review gate for sensitive or high-risk operations.',
    icon: CheckCircle,
    color: 'pink',
    details: [
      'Risk-based routing',
      'Compliance verification',
      'Legal review integration',
      'Binary decision flow'
    ]
  },
  {
    id: 'log',
    title: 'Log',
    description: 'Complete audit trail and analytics for all system operations.',
    icon: BookOpen,
    color: 'success',
    details: [
      'Full operation history',
      'Performance analytics',
      'Error tracking and alerts',
      'Compliance reporting'
    ]
  }
]

const colorClasses: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  cyan: { bg: 'bg-cyan/5', border: 'border-cyan/30', text: 'text-cyan', iconBg: 'bg-cyan/20' },
  violet: { bg: 'bg-violet/5', border: 'border-violet/30', text: 'text-violet', iconBg: 'bg-violet/20' },
  pink: { bg: 'bg-pink/5', border: 'border-pink/30', text: 'text-pink', iconBg: 'bg-pink/20' },
  success: { bg: 'bg-success/5', border: 'border-success/30', text: 'text-success', iconBg: 'bg-success/20' }
}

export function CommandCenterTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Command Logic Architecture</h2>
        <p className="text-muted-foreground">
          The ViceLab Control Tower operates on a four-stage execution model designed for 
          maximum efficiency with appropriate human oversight.
        </p>
      </div>

      {/* Architecture Visualization */}
      <div className="relative py-8">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan via-violet via-pink to-success hidden lg:block" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {commandSteps.map((step, index) => {
            const colors = colorClasses[step.color]
            const Icon = step.icon

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Number */}
                <div className={`
                  absolute -top-3 left-1/2 -translate-x-1/2 z-10
                  w-6 h-6 rounded-full ${colors.iconBg} ${colors.text}
                  flex items-center justify-center text-xs font-bold
                  border-2 border-background
                `}>
                  {index + 1}
                </div>

                <div className={`
                  glass rounded-xl p-6 border ${colors.border}
                  hover:${colors.bg} transition-all duration-300
                  h-full
                `}>
                  <div className={`p-3 rounded-xl ${colors.iconBg} w-fit mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className={`w-3 h-3 mt-0.5 shrink-0 ${colors.text}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow connector (visible on lg screens only between cards) */}
                {index < commandSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Exception Routing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="glass-strong rounded-xl p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-warning/20">
            <Workflow className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Exception Routing</h3>
            <p className="text-sm text-muted-foreground">
              How the system handles blocked or failed tasks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Blocked Tasks */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="font-medium text-sm">Blocked Tasks</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Tasks that fail compliance or require additional review.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-warning" />
                Routed to approval queue
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-warning" />
                Flagged for manual review
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-warning" />
                Owner notified
              </li>
            </ul>
          </div>

          {/* Failed Executions */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-destructive" />
              <span className="font-medium text-sm">Failed Executions</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Tasks that fail during execution phase.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-destructive" />
                Automatic retry (3x)
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-destructive" />
                Error logged with context
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-destructive" />
                Escalated to repair queue
              </li>
            </ul>
          </div>

          {/* Urgent Items */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-pink/20 text-pink border-pink/30 text-xs">
                Priority
              </Badge>
              <span className="font-medium text-sm">Urgent Items</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Revenue-critical or time-sensitive tasks.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-pink" />
                Pushed to top of queue
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-pink" />
                Highlighted in daily brief
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-pink" />
                Push notification enabled
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
