export type TaskStatus = 'ready' | 'awaiting-approval' | 'blocked'
export type TaskType = 'content' | 'outreach' | 'store' | 'compliance' | 'automation'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AutomationState = 'healthy' | 'attention' | 'needs-fix'

export interface ExecutionTask {
  id: string
  title: string
  brand: string
  type: TaskType
  impact: 'low' | 'medium' | 'high'
  owner: string
  status: TaskStatus
  description?: string
}

export interface ApprovalItem {
  id: string
  title: string
  category: string
  riskLevel: RiskLevel
  nextAction: string
  brand: string
  submittedBy: string
  submittedAt: string
}

export interface Automation {
  id: string
  name: string
  triggerType: string
  health: number
  state: AutomationState
  lastRun: string
  errorCount: number
}

export interface PipelineCategory {
  id: string
  name: string
  queueCount: number
  description: string
  icon: string
}

export const executionTasks: ExecutionTask[] = [
  {
    id: 'VL-EX-001',
    title: 'Publish weekly LinkedIn thought leadership post',
    brand: 'ViceLab',
    type: 'content',
    impact: 'high',
    owner: 'Content Engine',
    status: 'ready',
    description: 'AI-generated post on founder productivity systems'
  },
  {
    id: 'CP-EX-002',
    title: 'Deploy new recipe carousel to Instagram',
    brand: 'Cooked Pilot',
    type: 'content',
    impact: 'high',
    owner: 'Social Pipeline',
    status: 'ready',
    description: '5-image carousel featuring weekend meal prep'
  },
  {
    id: 'VG-EX-003',
    title: 'Send partner outreach sequence #4',
    brand: 'VibeGuard',
    type: 'outreach',
    impact: 'medium',
    owner: 'Outreach Bot',
    status: 'awaiting-approval',
    description: 'Follow-up emails to 12 potential brand partners'
  },
  {
    id: 'VL-EX-004',
    title: 'Update Big Cartel product descriptions',
    brand: 'ViceLab',
    type: 'store',
    impact: 'medium',
    owner: 'Store Sync',
    status: 'ready',
    description: 'Refresh copy for 8 digital products'
  },
  {
    id: 'CP-EX-005',
    title: 'Review TikTok content for compliance',
    brand: 'Cooked Pilot',
    type: 'compliance',
    impact: 'high',
    owner: 'Compliance Gate',
    status: 'blocked',
    description: 'Flagged for potential nutrition claim review'
  },
  {
    id: 'VL-EX-006',
    title: 'Schedule Substack newsletter',
    brand: 'ViceLab',
    type: 'content',
    impact: 'high',
    owner: 'Newsletter Engine',
    status: 'ready',
    description: 'Weekly founder insights edition #47'
  },
  {
    id: 'VG-EX-007',
    title: 'Process Facebook ad creative refresh',
    brand: 'VibeGuard',
    type: 'content',
    impact: 'medium',
    owner: 'Ad Pipeline',
    status: 'awaiting-approval',
    description: 'New ad variants for retargeting campaign'
  },
  {
    id: 'CP-EX-008',
    title: 'Sync inventory to Big Cartel',
    brand: 'Cooked Pilot',
    type: 'store',
    impact: 'low',
    owner: 'Inventory Sync',
    status: 'ready',
    description: 'Weekly stock level update for merch items'
  }
]

export const approvalItems: ApprovalItem[] = [
  {
    id: 'APR-001',
    title: 'LinkedIn post: "Why 99% of founders fail at systems"',
    category: 'Public Content',
    riskLevel: 'medium',
    nextAction: 'Review tone and claims',
    brand: 'ViceLab',
    submittedBy: 'Content Engine',
    submittedAt: '2 hours ago'
  },
  {
    id: 'APR-002',
    title: 'Partner outreach email to Wellness Co.',
    category: 'Partner Outreach',
    riskLevel: 'low',
    nextAction: 'Verify partnership terms',
    brand: 'VibeGuard',
    submittedBy: 'Outreach Bot',
    submittedAt: '4 hours ago'
  },
  {
    id: 'APR-003',
    title: 'Recipe video with health benefit claims',
    category: 'Compliance Review',
    riskLevel: 'high',
    nextAction: 'Legal review required',
    brand: 'Cooked Pilot',
    submittedBy: 'Video Pipeline',
    submittedAt: '1 day ago'
  },
  {
    id: 'APR-004',
    title: 'New product listing: Digital Planner v3',
    category: 'Store Listing',
    riskLevel: 'low',
    nextAction: 'Approve pricing and copy',
    brand: 'ViceLab',
    submittedBy: 'Product Engine',
    submittedAt: '3 hours ago'
  },
  {
    id: 'APR-005',
    title: 'Instagram Reel with music licensing',
    category: 'Rights Review',
    riskLevel: 'critical',
    nextAction: 'Verify music rights',
    brand: 'Cooked Pilot',
    submittedBy: 'Social Pipeline',
    submittedAt: '5 hours ago'
  }
]

export const automations: Automation[] = [
  {
    id: 'AUTO-001',
    name: 'LinkedIn Post Scheduler',
    triggerType: 'Cron (Daily 9AM)',
    health: 98,
    state: 'healthy',
    lastRun: '2 hours ago',
    errorCount: 0
  },
  {
    id: 'AUTO-002',
    name: 'Instagram Content Pipeline',
    triggerType: 'Queue-based',
    health: 94,
    state: 'healthy',
    lastRun: '45 minutes ago',
    errorCount: 1
  },
  {
    id: 'AUTO-003',
    name: 'Outreach Email Sequences',
    triggerType: 'Event-driven',
    health: 76,
    state: 'attention',
    lastRun: '1 hour ago',
    errorCount: 3
  },
  {
    id: 'AUTO-004',
    name: 'Big Cartel Inventory Sync',
    triggerType: 'Webhook',
    health: 100,
    state: 'healthy',
    lastRun: '30 minutes ago',
    errorCount: 0
  },
  {
    id: 'AUTO-005',
    name: 'TikTok Auto-Publisher',
    triggerType: 'Cron (3x Daily)',
    health: 45,
    state: 'needs-fix',
    lastRun: '6 hours ago',
    errorCount: 8
  },
  {
    id: 'AUTO-006',
    name: 'Substack Newsletter Builder',
    triggerType: 'Weekly Trigger',
    health: 88,
    state: 'healthy',
    lastRun: '2 days ago',
    errorCount: 0
  },
  {
    id: 'AUTO-007',
    name: 'Compliance Auto-Scanner',
    triggerType: 'On-submit',
    health: 67,
    state: 'attention',
    lastRun: '15 minutes ago',
    errorCount: 2
  }
]

export const pipelineCategories: PipelineCategory[] = [
  {
    id: 'pipe-outreach',
    name: 'Outreach',
    queueCount: 24,
    description: 'Partner emails, cold outreach, follow-ups',
    icon: 'mail'
  },
  {
    id: 'pipe-content',
    name: 'Content',
    queueCount: 18,
    description: 'Social posts, newsletters, videos',
    icon: 'pen-tool'
  },
  {
    id: 'pipe-store',
    name: 'Store',
    queueCount: 7,
    description: 'Product updates, inventory, listings',
    icon: 'shopping-bag'
  },
  {
    id: 'pipe-compliance',
    name: 'Compliance',
    queueCount: 5,
    description: 'Legal review, rights, claims verification',
    icon: 'shield-check'
  }
]

export const brands = [
  { id: 'all', name: 'All Brands', color: 'cyan' },
  { id: 'vicelab', name: 'ViceLab', color: 'cyan' },
  { id: 'cooked-pilot', name: 'Cooked Pilot', color: 'pink' },
  { id: 'vibeguard', name: 'VibeGuard', color: 'violet' }
]

export const metrics = {
  readyToExecute: 12,
  approvalsWaiting: 5,
  revenueCritical: 3,
  automationHealth: 87
}
