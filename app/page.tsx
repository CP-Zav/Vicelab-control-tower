'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  CheckCircle, 
  Workflow, 
  LayoutDashboard,
  Command
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/dashboard/hero-header'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { OperationalStatus } from '@/components/dashboard/operational-status'
import { ExecutionTab } from '@/components/dashboard/execution-tab'
import { ApprovalsTab } from '@/components/dashboard/approvals-tab'
import { AutomationsTab } from '@/components/dashboard/automations-tab'
import { PipelineTab } from '@/components/dashboard/pipeline-tab'
import { CommandCenterTab } from '@/components/dashboard/command-center-tab'
import { 
  useOperationalStatus,
  useTasks,
  useApprovals,
  useAutomations,
} from '@/lib/hooks'
import { 
  pipelineCategories,
  metrics,
  pendingCommands,
  ellGuidance
} from '@/lib/mock-data'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('execution')
  const [briefDialogOpen, setBriefDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize Redis on mount
  useEffect(() => {
    fetch('/api/init').then(() => setInitialized(true))
  }, [])

  // Fetch real data from APIs
  const { alerts, incidents, isLoading: statusLoading } = useOperationalStatus()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { approvals, isLoading: approvalsLoading } = useApprovals()
  const { automations, overallHealth } = useAutomations()

  const handleRunBrief = () => {
    setBriefDialogOpen(true)
  }

  const handleOpenApprovals = () => {
    setActiveTab('approvals')
  }

  const handleExecuteOutreach = () => {
    setActiveTab('execution')
  }

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true)
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-12 h-12 rounded-lg border-2 border-cyan border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">Initializing Control Tower...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Operational Status - HIGHEST PRIORITY */}
        {!statusLoading && (
          <OperationalStatus
            alerts={alerts}
            incidents={incidents}
            pendingCommands={pendingCommands}
            guidance={ellGuidance}
          />
        )}

        {/* Hero Header */}
        <HeroHeader
          onRunBrief={handleRunBrief}
          onOpenApprovals={handleOpenApprovals}
          onExecuteOutreach={handleExecuteOutreach}
          onOpenSettings={handleOpenSettings}
        />

        {/* Metric Cards */}
        <MetricCards
          readyToExecute={tasks.filter(t => t.status === 'ready').length}
          approvalsWaiting={approvals.length}
          revenueCritical={tasks.filter(t => t.impact === 'high').length}
          automationHealth={overallHealth}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-strong border border-border p-1 h-auto flex-wrap justify-start gap-1">
            <TabsTrigger 
              value="execution" 
              className="data-[state=active]:bg-cyan/20 data-[state=active]:text-cyan gap-2"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Execution</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals"
              className="data-[state=active]:bg-violet/20 data-[state=active]:text-violet gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="automations"
              className="data-[state=active]:bg-pink/20 data-[state=active]:text-pink gap-2"
            >
              <Workflow className="w-4 h-4" />
              <span className="hidden sm:inline">Automations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pipeline"
              className="data-[state=active]:bg-success/20 data-[state=active]:text-success gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger 
              value="command-center"
              className="data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground gap-2"
            >
              <Command className="w-4 h-4" />
              <span className="hidden sm:inline">Command Center</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="execution" className="mt-0">
                <ExecutionTab tasks={tasks} />
              </TabsContent>

              <TabsContent value="approvals" className="mt-0">
                <ApprovalsTab approvals={approvals} />
              </TabsContent>

              <TabsContent value="automations" className="mt-0">
                <AutomationsTab automations={automations} />
              </TabsContent>

              <TabsContent value="pipeline" className="mt-0">
                <PipelineTab categories={pipelineCategories} />
              </TabsContent>

              <TabsContent value="command-center" className="mt-0">
                <CommandCenterTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>ViceLab Control Tower v1.2 &middot; Redis-backed execution layer &middot; Real-time sync</p>
        </footer>
      </main>

      {/* Daily Brief Dialog */}
      <Dialog open={briefDialogOpen} onOpenChange={setBriefDialogOpen}>
        <DialogContent className="glass-strong border-cyan/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan">
              <Play className="w-5 h-5" />
              Daily Brief Generated
            </DialogTitle>
            <DialogDescription>
              Your daily operational brief has been compiled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-2">Priority Summary</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Ready to Execute</span>
                  <span className="text-cyan font-medium">{tasks.filter(t => t.status === 'ready').length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pending Approvals</span>
                  <span className="text-violet font-medium">{approvals.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Revenue-Critical</span>
                  <span className="text-pink font-medium">{tasks.filter(t => t.impact === 'high').length}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-cyan/5 border border-cyan/20">
              <h4 className="font-medium text-cyan mb-2">Top Priority</h4>
              <p className="text-sm text-muted-foreground">
                {tasks.find(t => t.status === 'ready')?.title || 'No tasks pending'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setBriefDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1 bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30"
              onClick={() => {
                setBriefDialogOpen(false)
                setActiveTab('execution')
              }}
            >
              Start Executing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure your Control Tower preferences and automations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {[
              { label: 'Auto-execute low-risk tasks', enabled: false },
              { label: 'Daily brief notifications', enabled: true },
              { label: 'Slack integration', enabled: true },
              { label: 'Email digest (weekly)', enabled: false }
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">{setting.label}</span>
                <div className={`
                  w-10 h-6 rounded-full relative cursor-pointer transition-colors
                  ${setting.enabled ? 'bg-cyan/30' : 'bg-secondary'}
                `}>
                  <div className={`
                    absolute top-1 w-4 h-4 rounded-full transition-all
                    ${setting.enabled ? 'right-1 bg-cyan' : 'left-1 bg-muted-foreground'}
                  `} />
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setSettingsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

      {/* Daily Brief Dialog */}
      <Dialog open={briefDialogOpen} onOpenChange={setBriefDialogOpen}>
        <DialogContent className="glass-strong border-cyan/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan">
              <Play className="w-5 h-5" />
              Daily Brief Generated
            </DialogTitle>
            <DialogDescription>
              Your daily operational brief has been compiled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-2">Priority Summary</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Ready to Execute</span>
                  <span className="text-cyan font-medium">{metrics.readyToExecute}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pending Approvals</span>
                  <span className="text-violet font-medium">{metrics.approvalsWaiting}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Revenue-Critical</span>
                  <span className="text-pink font-medium">{metrics.revenueCritical}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-cyan/5 border border-cyan/20">
              <h4 className="font-medium text-cyan mb-2">Top Priority</h4>
              <p className="text-sm text-muted-foreground">
                Publish weekly LinkedIn thought leadership post (VL-EX-001)
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setBriefDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1 bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30"
              onClick={() => {
                setBriefDialogOpen(false)
                setActiveTab('execution')
              }}
            >
              Start Executing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure your Control Tower preferences and automations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {[
              { label: 'Auto-execute low-risk tasks', enabled: false },
              { label: 'Daily brief notifications', enabled: true },
              { label: 'Slack integration', enabled: true },
              { label: 'Email digest (weekly)', enabled: false }
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">{setting.label}</span>
                <div className={`
                  w-10 h-6 rounded-full relative cursor-pointer transition-colors
                  ${setting.enabled ? 'bg-cyan/30' : 'bg-secondary'}
                `}>
                  <div className={`
                    absolute top-1 w-4 h-4 rounded-full transition-all
                    ${setting.enabled ? 'right-1 bg-cyan' : 'left-1 bg-muted-foreground'}
                  `} />
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setSettingsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
        {/* Hero Header */}
        <HeroHeader
          onRunBrief={handleRunBrief}
          onOpenApprovals={handleOpenApprovals}
          onExecuteOutreach={handleExecuteOutreach}
          onOpenSettings={handleOpenSettings}
        />

        {/* Metric Cards */}
        <MetricCards
          readyToExecute={metrics.readyToExecute}
          approvalsWaiting={metrics.approvalsWaiting}
          revenueCritical={metrics.revenueCritical}
          automationHealth={metrics.automationHealth}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-strong border border-border p-1 h-auto flex-wrap justify-start gap-1">
            <TabsTrigger 
              value="execution" 
              className="data-[state=active]:bg-cyan/20 data-[state=active]:text-cyan gap-2"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Execution</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals"
              className="data-[state=active]:bg-violet/20 data-[state=active]:text-violet gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="automations"
              className="data-[state=active]:bg-pink/20 data-[state=active]:text-pink gap-2"
            >
              <Workflow className="w-4 h-4" />
              <span className="hidden sm:inline">Automations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pipeline"
              className="data-[state=active]:bg-success/20 data-[state=active]:text-success gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger 
              value="command-center"
              className="data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground gap-2"
            >
              <Command className="w-4 h-4" />
              <span className="hidden sm:inline">Command Center</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="execution" className="mt-0">
                <ExecutionTab tasks={executionTasks} />
              </TabsContent>

              <TabsContent value="approvals" className="mt-0">
                <ApprovalsTab approvals={approvalItems} />
              </TabsContent>

              <TabsContent value="automations" className="mt-0">
                <AutomationsTab automations={automations} />
              </TabsContent>

              <TabsContent value="pipeline" className="mt-0">
                <PipelineTab categories={pipelineCategories} />
              </TabsContent>

              <TabsContent value="command-center" className="mt-0">
                <CommandCenterTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>ViceLab Control Tower v1.0 &middot; Multi-brand execution layer</p>
        </footer>
      </main>

      {/* Daily Brief Dialog */}
      <Dialog open={briefDialogOpen} onOpenChange={setBriefDialogOpen}>
        <DialogContent className="glass-strong border-cyan/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan">
              <Play className="w-5 h-5" />
              Daily Brief Generated
            </DialogTitle>
            <DialogDescription>
              Your daily operational brief has been compiled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-2">Priority Summary</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Ready to Execute</span>
                  <span className="text-cyan font-medium">{metrics.readyToExecute}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pending Approvals</span>
                  <span className="text-violet font-medium">{metrics.approvalsWaiting}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Revenue-Critical</span>
                  <span className="text-pink font-medium">{metrics.revenueCritical}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-cyan/5 border border-cyan/20">
              <h4 className="font-medium text-cyan mb-2">Top Priority</h4>
              <p className="text-sm text-muted-foreground">
                Publish weekly LinkedIn thought leadership post (VL-EX-001)
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setBriefDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1 bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30"
              onClick={() => {
                setBriefDialogOpen(false)
                setActiveTab('execution')
              }}
            >
              Start Executing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure your Control Tower preferences and automations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {[
              { label: 'Auto-execute low-risk tasks', enabled: false },
              { label: 'Daily brief notifications', enabled: true },
              { label: 'Slack integration', enabled: true },
              { label: 'Email digest (weekly)', enabled: false }
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">{setting.label}</span>
                <div className={`
                  w-10 h-6 rounded-full relative cursor-pointer transition-colors
                  ${setting.enabled ? 'bg-cyan/30' : 'bg-secondary'}
                `}>
                  <div className={`
                    absolute top-1 w-4 h-4 rounded-full transition-all
                    ${setting.enabled ? 'right-1 bg-cyan' : 'left-1 bg-muted-foreground'}
                  `} />
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setSettingsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
