import { redis, keys } from '@/lib/redis'
import {
  executionTasks,
  approvalItems,
  automations,
  activeAlerts,
  activeIncidents,
  metrics,
} from '@/lib/mock-data'

export async function initializeRedis() {
  try {
    console.log('[Redis] Initializing with seed data...')

    // Check if already initialized
    const existingTasks = await redis.get(keys.tasks())
    if (existingTasks) {
      console.log('[Redis] Already initialized, skipping...')
      return
    }

    // Populate tasks
    await redis.set(keys.tasks(), JSON.stringify(executionTasks))
    for (const task of executionTasks) {
      await redis.set(keys.task(task.id), JSON.stringify(task))
    }

    // Populate approvals
    await redis.set(keys.approvals(), JSON.stringify(approvalItems))
    for (const approval of approvalItems) {
      await redis.set(keys.approval(approval.id), JSON.stringify(approval))
    }

    // Populate automations
    await redis.set(keys.automations(), JSON.stringify(automations))
    for (const automation of automations) {
      await redis.set(keys.automation(automation.id), JSON.stringify(automation))
    }

    // Populate alerts
    await redis.set(keys.alerts(), JSON.stringify(activeAlerts))
    for (const alert of activeAlerts) {
      await redis.set(keys.alert(alert.id), JSON.stringify(alert))
    }

    // Populate incidents
    await redis.set(keys.activeIncidents(), JSON.stringify(activeIncidents))
    for (const incident of activeIncidents) {
      await redis.set(keys.incident(incident.id), JSON.stringify(incident))
    }

    // Populate metrics
    await redis.set(keys.metrics(), JSON.stringify(metrics))

    console.log('[Redis] Initialization complete')
    return true
  } catch (error) {
    console.error('[Redis] Initialization failed:', error)
    throw error
  }
}
