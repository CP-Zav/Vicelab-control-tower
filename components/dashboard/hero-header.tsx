'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, CheckCircle, Send, Settings, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroHeaderProps {
  onRunBrief: () => void
  onOpenApprovals: () => void
  onExecuteOutreach: () => void
  onOpenSettings: () => void
}

export function HeroHeader({ 
  onRunBrief, 
  onOpenApprovals, 
  onExecuteOutreach, 
  onOpenSettings 
}: HeroHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
      setCurrentDate(new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.section 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl glass-strong mb-8"
    >
      {/* Background grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30" />
      
      {/* Glow effects */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Title Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-cyan animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan animate-ping opacity-50" />
              </div>
              <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
                System Online
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">ViceLab</span>
              <br />
              <span className="bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent">
                Control Tower
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md">
              One-click execution layer for your multi-brand ecosystem
            </p>
            
            {/* Status indicators */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan" />
                <span>{currentTime}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span>{currentDate}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={onRunBrief}
                className="w-full h-auto py-4 px-6 bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan hover:text-cyan glow-cyan transition-all duration-300"
                variant="outline"
              >
                <div className="flex flex-col items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span className="text-sm font-medium">Run Daily Brief</span>
                </div>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={onOpenApprovals}
                className="w-full h-auto py-4 px-6 bg-violet/10 hover:bg-violet/20 border border-violet/30 text-violet hover:text-violet transition-all duration-300"
                variant="outline"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Open Approvals</span>
                </div>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={onExecuteOutreach}
                className="w-full h-auto py-4 px-6 bg-pink/10 hover:bg-pink/20 border border-pink/30 text-pink hover:text-pink transition-all duration-300"
                variant="outline"
              >
                <div className="flex flex-col items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span className="text-sm font-medium">Execute Outreach</span>
                </div>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={onOpenSettings}
                className="w-full h-auto py-4 px-6 bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all duration-300"
                variant="outline"
              >
                <div className="flex flex-col items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Workflow Settings</span>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
