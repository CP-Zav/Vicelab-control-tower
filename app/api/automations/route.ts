import { NextRequest, NextResponse } from 'next/server'
import { redis, keys, getJSON } from '@/lib/redis'
import { Automation } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const key = keys.automations()
    const automations = (await getJSON<Automation[]>(key)) || []

    // Calculate overall health
    const avgHealth = automations.length > 0
      ? Math.round(automations.reduce((sum, a) => sum + a.health, 0) / automations.length)
      : 100

    return NextResponse.json({
      success: true,
      data: automations,
      overallHealth: avgHealth,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[automations GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, automationId } = body

    if (action === 'restart') {
      const automationKey = keys.automation(automationId)
      const automation = await getJSON<Automation>(automationKey)

      if (!automation) {
        return NextResponse.json(
          { success: false, error: 'Automation not found' },
          { status: 404 }
        )
      }

      // Simulate restart
      automation.health = 95
      automation.state = 'healthy'
      automation.errorCount = 0
      automation.lastRun = new Date().toISOString()

      await redis.set(automationKey, JSON.stringify(automation))

      // Log restart
      const logKey = `automation:restart:${automationId}:${Date.now()}`
      await redis.set(
        logKey,
        JSON.stringify({
          automationId,
          action: 'restart',
          timestamp: new Date().toISOString(),
        }),
        { ex: 604800 }
      )

      return NextResponse.json({
        success: true,
        data: automation,
        message: `Automation ${automationId} restarted`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[automations POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process automation' },
      { status: 500 }
    )
  }
}
