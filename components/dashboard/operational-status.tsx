'use client'

import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, Info, RefreshCw, ChevronUp, Zap, LogSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Alert, Incident, PendingCommand, EllGuidance } from '@/lib/mock-data'

interface OperationalStatusProps {
  alerts: Alert[]
  incidents: Incident[]
  pendingCommands: PendingCommand[]
  guidance: EllGuidance
}

export function OperationalStatus({
  alerts,
  incidents,
  pendingCommands,
  guidance
}: OperationalStatusProps) {
  const hasIssues = incidents.length > 0 || alerts.some(a => a.severity === 'critical')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400'
      case 'warning':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400'
      default:
        return 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'high':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'medium':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Critical Status Banner */}
      {hasIssues && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/30 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="space-y-1">
                <p className="font-semibold text-red-300 text-sm">SYSTEM STATUS: REQUIRES ATTENTION</p>
                <p className="text-xs text-red-200/80">
                  {incidents.length} active incident{incidents.length !== 1 ? 's' : ''} · {alerts.filter(a => a.severity === 'critical').length} critical alert{alerts.filter(a => a.severity === 'critical').length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 hover:bg-red-500/10 text-red-300 h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300 h-8"
              >
                <Zap className="w-3 h-3 mr-1" />
                Escalate
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incidents Panel */}
        {incidents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 p-4 rounded-lg glass-strong border border-red-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-sm text-red-300">Active Incidents</h3>
              <Badge className="ml-auto bg-red-500/20 text-red-300 border-red-500/30">
                {incidents.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-mono text-red-300">{incident.id}</p>
                    <Badge className={`text-xs ${getRiskColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-red-200 mb-2">{incident.title}</p>
                  <p className="text-xs text-red-200/60 leading-relaxed">{incident.description}</p>
                  <p className="text-xs text-red-200/40 mt-2">Started {incident.timeStarted}</p>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              className="w-full mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 h-8"
            >
              <LogSquare className="w-3 h-3 mr-1" />
              Log Incident
            </Button>
          </motion.div>
        )}

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${incidents.length > 0 ? 'lg:col-span-1' : 'lg:col-span-2'} p-4 rounded-lg glass-strong border border-border backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-cyan-300">Active Alerts</h3>
              <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {alerts.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg bg-gradient-to-r border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    {alert.action && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs flex-shrink-0"
                      >
                        {alert.action}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending Commands Panel */}
        {pendingCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 p-4 rounded-lg glass-strong border border-border backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-sm text-violet-300">Pending Commands</h3>
              <Badge className="ml-auto bg-violet-500/20 text-violet-300 border-violet-500/30">
                {pendingCommands.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {pendingCommands.map((cmd) => (
                <div key={cmd.id} className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className={`text-xs flex-shrink-0 ${
                      cmd.approvalStatus === 'approved'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {cmd.approvalStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground mb-1">{cmd.command}</p>
                  <p className="text-xs text-muted-foreground mb-2">{cmd.impact}</p>
                  {cmd.approvalStatus === 'approved' && (
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30"
                    >
                      Execute Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Ella Guidance Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-5 rounded-lg glass-strong border border-cyan-500/20 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-cyan-300 mb-1">Ella Guidance Panel</h3>
            <p className="text-xs text-muted-foreground">AI-powered operational recommendations</p>
          </div>
          <Badge className={`flex-shrink-0 ${getRiskColor(guidance.riskLevel)}`}>
            {guidance.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Situation */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs font-semibold text-cyan-300 mb-2">What&apos;s Happening</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{guidance.situation}</p>
          </div>

          {/* Recommended Action */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs font-semibold text-green-300 mb-2">Recommended Action</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{guidance.suggestedAction}</p>
          </div>

          {/* Suggested Command */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border md:col-span-2">
            <p className="text-xs font-semibold text-violet-300 mb-2">Suggested Command Sequence</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{guidance.suggestedCommand}</p>
          </div>

          {/* Reasoning */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border md:col-span-2">
            <p className="text-xs font-semibold text-amber-300 mb-2">Why This Matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{guidance.reasoning}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 h-8"
          >
            <ChevronUp className="w-3 h-3 mr-1" />
            Follow Guidance
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-border h-8"
          >
            Dismiss
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
