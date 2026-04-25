'use client'

import { motion } from 'framer-motion'
import { 
  Mail, 
  PenTool, 
  ShoppingBag, 
  ShieldCheck,
  ArrowRight,
  Target,
  Layers
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PipelineCategory } from '@/lib/mock-data'

interface PipelineTabProps {
  categories: PipelineCategory[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'mail': Mail,
  'pen-tool': PenTool,
  'shopping-bag': ShoppingBag,
  'shield-check': ShieldCheck
}

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'Outreach': { bg: 'bg-cyan/10', border: 'border-cyan/30', text: 'text-cyan', glow: 'hover:glow-cyan' },
  'Content': { bg: 'bg-pink/10', border: 'border-pink/30', text: 'text-pink', glow: 'hover:glow-pink' },
  'Store': { bg: 'bg-violet/10', border: 'border-violet/30', text: 'text-violet', glow: 'hover:glow-violet' },
  'Compliance': { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', glow: '' }
}

export function PipelineTab({ categories }: PipelineTabProps) {
  const totalQueue = categories.reduce((acc, cat) => acc + cat.queueCount, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Pipeline Overview</h3>
          <p className="text-sm text-muted-foreground">
            {totalQueue} total items across all pipelines
          </p>
        </div>
        <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/30">
          <Layers className="w-3 h-3 mr-1.5" />
          4 Active Pipelines
        </Badge>
      </div>

      {/* Pipeline Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category, index) => {
          const Icon = iconMap[category.icon] || Mail
          const colors = colorMap[category.name] || colorMap['Outreach']

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`
                glass rounded-xl p-6 border ${colors.border} ${colors.glow}
                transition-all duration-300 cursor-pointer
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${colors.text}`}>
                    {category.queueCount}
                  </p>
                  <p className="text-xs text-muted-foreground">in queue</p>
                </div>
              </div>
              
              <h4 className="text-lg font-medium text-foreground mb-2">
                {category.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>

              <Button
                variant="ghost"
                size="sm"
                className={`mt-4 ${colors.text} hover:${colors.bg} p-0`}
              >
                View Queue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Active Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="glass-strong rounded-xl p-6 border border-cyan/30 glow-cyan"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan/20">
              <Target className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Active Mission</h3>
              <p className="text-sm text-muted-foreground">CP-BD-001: Cooked Pilot Brand Development</p>
            </div>
          </div>
          <Badge className="bg-cyan/20 text-cyan border-cyan/30">
            In Progress
          </Badge>
        </div>

        {/* Mission Stages */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Mission Progress</span>
          </div>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <div className="absolute top-4 left-4 w-[60%] h-0.5 bg-cyan" />
            
            {/* Stage Indicators */}
            <div className="relative flex justify-between">
              {[
                { name: 'Research', status: 'complete' },
                { name: 'Strategy', status: 'complete' },
                { name: 'Execution', status: 'active' },
                { name: 'Review', status: 'pending' }
              ].map((stage, i) => (
                <div key={stage.name} className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${stage.status === 'complete' ? 'bg-cyan text-primary-foreground' : 
                      stage.status === 'active' ? 'bg-cyan/20 border-2 border-cyan text-cyan' :
                      'bg-secondary text-muted-foreground'}
                  `}>
                    {i + 1}
                  </div>
                  <span className={`
                    text-xs mt-2 
                    ${stage.status === 'active' ? 'text-cyan font-medium' : 'text-muted-foreground'}
                  `}>
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="text-sm">
            <span className="text-muted-foreground">Est. Completion: </span>
            <span className="text-foreground font-medium">March 28, 2026</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-cyan/30 text-cyan hover:bg-cyan/10"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
