import { Redis } from '@upstash/redis'

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables: KV_REST_API_URL, KV_REST_API_TOKEN')
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Key patterns for Redis storage
export const keys = {
  // Tasks
  task: (id: string) => `task:${id}`,
  tasks: () => 'tasks:all',
  tasksByStatus: (status: string) => `tasks:status:${status}`,
  tasksByBrand: (brand: string) => `tasks:brand:${brand}`,
  
  // Approvals
  approval: (id: string) => `approval:${id}`,
  approvals: () => 'approvals:all',
  approvalsByStatus: (status: string) => `approvals:status:${status}`,
  
  // Automations
  automation: (id: string) => `automation:${id}`,
  automations: () => 'automations:all',
  automationHealth: () => 'automations:health:index',
  
  // Alerts & Incidents
  alert: (id: string) => `alert:${id}`,
  alerts: () => 'alerts:all',
  incident: (id: string) => `incident:${id}`,
  incidents: () => 'incidents:all',
  activeIncidents: () => 'incidents:active',
  
  // Metrics
  metrics: () => 'metrics:current',
  
  // Session/User state
  session: (userId: string) => `session:${userId}`,
  userPrefs: (userId: string) => `prefs:${userId}`,
}

// Utility to set with expiration
export async function setWithExpiry(
  key: string,
  value: any,
  expirySeconds: number = 3600
) {
  return redis.set(key, JSON.stringify(value), { ex: expirySeconds })
}

// Utility to get parsed JSON
export async function getJSON<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  if (!value) return null
  return JSON.parse(value as string) as T
}

// Utility to increment counter
export async function incrementCounter(key: string, amount: number = 1) {
  return redis.incrby(key, amount)
}
