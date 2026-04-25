'use client'

import { motion } from 'framer-motion'
import { Zap, Clock, DollarSign, Activity } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  color: 'cyan' | 'violet' | 'pink' | 'success'
  delay?: number
}

function MetricCard({ title, value, subtitle, icon, color, delay = 0 }: MetricCardProps) {
  const colorClasses = {
    cyan: {
      glow: 'glow-cyan',
      bg: 'bg-cyan/10',
      border: 'border-cyan/30',
      text: 'text-cyan',
      iconBg: 'bg-cyan/20'
    },
    violet: {
      glow: 'glow-violet',
      bg: 'bg-violet/10',
      border: 'border-violet/30',
      text: 'text-violet',
      iconBg: 'bg-violet/20'
    },
    pink: {
      glow: 'glow-pink',
      bg: 'bg-pink/10',
      border: 'border-pink/30',
      text: 'text-pink',
      iconBg: 'bg-pink/20'
    },
    success: {
      glow: '',
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      iconBg: 'bg-success/20'
    }
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl glass p-6
        border ${classes.border} ${classes.glow}
        transition-all duration-300 cursor-default
      `}
    >
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 ${classes.bg} opacity-50`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-4xl font-bold ${classes.text}`}>
            {value}
          </p>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        <div className={`p-3 rounded-lg ${classes.iconBg} ${classes.text}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

interface MetricCardsProps {
  readyToExecute: number
  approvalsWaiting: number
  revenueCritical: number
  automationHealth: number
}

export function MetricCards({ 
  readyToExecute, 
  approvalsWaiting, 
  revenueCritical, 
  automationHealth 
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Ready to Execute"
        value={readyToExecute}
        subtitle="Tasks queued for action"
        icon={<Zap className="w-6 h-6" />}
        color="cyan"
        delay={0.1}
      />
      <MetricCard
        title="Approvals Waiting"
        value={approvalsWaiting}
        subtitle="Pending your review"
        icon={<Clock className="w-6 h-6" />}
        color="violet"
        delay={0.2}
      />
      <MetricCard
        title="Revenue-Critical"
        value={revenueCritical}
        subtitle="High-impact tasks"
        icon={<DollarSign className="w-6 h-6" />}
        color="pink"
        delay={0.3}
      />
      <MetricCard
        title="Automation Health"
        value={`${automationHealth}%`}
        subtitle="System performance"
        icon={<Activity className="w-6 h-6" />}
        color="success"
        delay={0.4}
      />
    </div>
  )
}
