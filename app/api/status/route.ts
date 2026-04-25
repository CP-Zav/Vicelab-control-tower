import { NextRequest, NextResponse } from 'next/server'
import { redis, keys, getJSON } from '@/lib/redis'
import { Alert, Incident } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    let alerts: Alert[] = []
    let incidents: Incident[] = []

    if (type === 'alerts' || type === 'all') {
      const alertsKey = keys.alerts()
      alerts = (await getJSON<Alert[]>(alertsKey)) || []
    }

    if (type === 'incidents' || type === 'all') {
      const incidentsKey = keys.activeIncidents()
      incidents = (await getJSON<Incident[]>(incidentsKey)) || []
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        incidents,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[status GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch operational status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId, incidentId, severity, title, description } = body

    if (action === 'resolve-alert') {
      const alertKey = keys.alert(alertId)
      const alert = await getJSON<Alert>(alertKey)

      if (!alert) {
        return NextResponse.json(
          { success: false, error: 'Alert not found' },
          { status: 404 }
        )
      }

      // Mark as resolved (remove from active)
      await redis.del(alertKey)

      return NextResponse.json({
        success: true,
        message: `Alert ${alertId} resolved`,
      })
    }

    if (action === 'create-incident') {
      const incidentId = `INC-${Date.now()}`
      const incident: Incident = {
        id: incidentId,
        title,
        status: 'active',
        severity,
        impactedSystem: '',
        description,
        timeStarted: new Date().toISOString(),
      }

      const incidentKey = keys.incident(incidentId)
      await redis.set(incidentKey, JSON.stringify(incident))

      // Add to active incidents list
      const activeKey = keys.activeIncidents()
      const active = (await getJSON<Incident[]>(activeKey)) || []
      active.push(incident)
      await redis.set(activeKey, JSON.stringify(active))

      return NextResponse.json({
        success: true,
        data: incident,
        message: `Incident ${incidentId} created`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[status POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process status update' },
      { status: 500 }
    )
  }
}
