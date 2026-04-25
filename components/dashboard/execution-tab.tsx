'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Play, 
  Eye, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExecutionTask, brands } from '@/lib/mock-data'

interface ExecutionTabProps {
  tasks: ExecutionTask[]
}

function getStatusConfig(status: ExecutionTask['status']) {
  switch (status) {
    case 'ready':
      return {
        label: 'Ready',
        icon: CheckCircle,
        className: 'bg-success/20 text-success border-success/30'
      }
    case 'awaiting-approval':
      return {
        label: 'Awaiting Approval',
        icon: Clock,
        className: 'bg-violet/20 text-violet border-violet/30'
      }
    case 'blocked':
      return {
        label: 'Blocked',
        icon: AlertTriangle,
        className: 'bg-destructive/20 text-destructive border-destructive/30'
      }
  }
}

function getImpactConfig(impact: ExecutionTask['impact']) {
  switch (impact) {
    case 'high':
      return { label: 'High Impact', className: 'bg-pink/20 text-pink border-pink/30' }
    case 'medium':
      return { label: 'Medium', className: 'bg-cyan/20 text-cyan border-cyan/30' }
    case 'low':
      return { label: 'Low', className: 'bg-muted text-muted-foreground border-border' }
  }
}

function getBrandColor(brand: string) {
  const brandLower = brand.toLowerCase()
  if (brandLower.includes('vicelab')) return 'text-cyan'
  if (brandLower.includes('cooked')) return 'text-pink'
  if (brandLower.includes('vibeguard')) return 'text-violet'
  return 'text-foreground'
}

export function ExecutionTab({ tasks: initialTasks }: ExecutionTabProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [executedTasks, setExecutedTasks] = useState<Set<string>>(new Set())

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = brandFilter === 'all' || 
                        task.brand.toLowerCase().includes(brandFilter.replace('-', ' '))
    return matchesSearch && matchesBrand
  })

  const handleExecute = (taskId: string) => {
    setExecutedTasks(prev => new Set([...prev, taskId]))
    // Update task status after a brief delay for visual feedback
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border focus:border-cyan/50 focus:ring-cyan/20"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Queue */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, index) => {
            const statusConfig = getStatusConfig(task.status)
            const impactConfig = getImpactConfig(task.impact)
            const StatusIcon = statusConfig.icon
            const isExecuted = executedTasks.has(task.id)

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isExecuted ? 0.5 : 1, 
                  x: 0,
                  scale: isExecuted ? 0.98 : 1
                }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  glass rounded-xl p-5 border border-border
                  hover:border-cyan/30 transition-all duration-300
                  ${isExecuted ? 'bg-success/5' : ''}
                `}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Task Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                        {task.id}
                      </span>
                      <span className={`text-sm font-medium ${getBrandColor(task.brand)}`}>
                        {task.brand}
                      </span>
                      <Badge variant="outline" className={impactConfig.className}>
                        {impactConfig.label}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-medium text-foreground">
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Type: <span className="text-foreground capitalize">{task.type}</span></span>
                      <span>Owner: <span className="text-foreground">{task.owner}</span></span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                    <Badge variant="outline" className={`${statusConfig.className} gap-1.5`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border hover:border-cyan/50 hover:text-cyan"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        Details
                      </Button>
                      
                      {task.status === 'ready' && !isExecuted && (
                        <Button
                          size="sm"
                          onClick={() => handleExecute(task.id)}
                          className="bg-cyan/20 hover:bg-cyan/30 text-cyan border border-cyan/30 glow-cyan"
                        >
                          <Play className="w-4 h-4 mr-1.5" />
                          Execute
                        </Button>
                      )}
                      
                      {isExecuted && (
                        <Button
                          size="sm"
                          disabled
                          className="bg-success/20 text-success border border-success/30"
                        >
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          Executed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-cyan" />
            </div>
            <h3 className="text-lg font-medium mb-2">All Clear</h3>
            <p className="text-muted-foreground">
              No tasks match your current filters, or all tasks have been executed.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
