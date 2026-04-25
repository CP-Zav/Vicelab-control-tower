'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Automation } from '@/lib/mock-data'

interface AutomationsTabProps {
  automations: Automation[]
}

function getStateConfig(state: Automation['state']) {
  switch (state) {
    case 'healthy':
      return {
        label: 'Healthy',
        className: 'bg-success/20 text-success border-success/30',
        icon: CheckCircle,
        progressColor: 'bg-success'
      }
    case 'attention':
      return {
        label: 'Attention',
        className: 'bg-warning/20 text-warning border-warning/30',
        icon: AlertTriangle,
        progressColor: 'bg-warning'
      }
    case 'needs-fix':
      return {
        label: 'Needs Fix',
        className: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: XCircle,
        progressColor: 'bg-destructive'
      }
  }
}

export function AutomationsTab({ automations }: AutomationsTabProps) {
  const healthyCount = automations.filter(a => a.state === 'healthy').length
  const attentionCount = automations.filter(a => a.state === 'attention').length
  const needsFixCount = automations.filter(a => a.state === 'needs-fix').length
  const avgHealth = Math.round(automations.reduce((acc, a) => acc + a.health, 0) / automations.length)

  const issuesAutomations = automations.filter(a => a.state !== 'healthy')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{healthyCount}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{attentionCount}</p>
              <p className="text-xs text-muted-foreground">Attention</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{needsFixCount}</p>
              <p className="text-xs text-muted-foreground">Needs Fix</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan/20">
              <Zap className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan">{avgHealth}%</p>
              <p className="text-xs text-muted-foreground">Avg Health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-medium mb-4">All Automations</h3>
          
          {automations.map((automation, index) => {
            const stateConfig = getStateConfig(automation.state)
            const StateIcon = stateConfig.icon

            return (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass rounded-xl p-5 border border-border hover:border-cyan/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{automation.name}</h4>
                      <Badge variant="outline" className={stateConfig.className}>
                        <StateIcon className="w-3 h-3 mr-1" />
                        {stateConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {automation.triggerType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {automation.lastRun}
                      </span>
                      {automation.errorCount > 0 && (
                        <span className="text-destructive">
                          {automation.errorCount} errors
                        </span>
                      )}
                    </div>
                    
                    {/* Health Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Health</span>
                        <span className={automation.health >= 80 ? 'text-success' : automation.health >= 60 ? 'text-warning' : 'text-destructive'}>
                          {automation.health}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${automation.health}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full rounded-full ${stateConfig.progressColor}`}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:border-cyan/50 hover:text-cyan shrink-0"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Refresh
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Repair Priorities Panel */}
        <div className="space-y-4">
          <div className="glass-strong rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Wrench className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-medium">Repair Priorities</h3>
            </div>

            {issuesAutomations.length > 0 ? (
              <div className="space-y-3">
                {issuesAutomations.map((automation) => {
                  const stateConfig = getStateConfig(automation.state)
                  
                  return (
                    <div
                      key={automation.id}
                      className="p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{automation.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {automation.errorCount} errors detected
                          </p>
                        </div>
                        <Badge variant="outline" className={`${stateConfig.className} text-xs`}>
                          {automation.health}%
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        Investigate
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
              </div>
            )}
          </div>

          {/* Recent Issues */}
          <div className="glass-strong rounded-xl p-5 border border-border">
            <h3 className="font-medium mb-4">Recent Issues</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
                <div>
                  <p className="text-foreground">TikTok API rate limit exceeded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                <div>
                  <p className="text-foreground">Compliance scan timeout</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                <div>
                  <p className="text-foreground">Outreach queue delay</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
