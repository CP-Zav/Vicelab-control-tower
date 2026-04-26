'use client'

import { ValidationReport } from '@/components/validation/validation-report'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ValidationPage() {
  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent">
            Pre-Launch Validation
          </h1>
          <p className="text-muted-foreground">
            6-Step hardening sequence for Control Tower go-live gate
          </p>
        </div>

        {/* Validation Report */}
        <ValidationReport />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>ViceLab Control Tower — Pre-Launch Hardening & Validation</p>
        </footer>
      </main>
    </div>
  )
}
