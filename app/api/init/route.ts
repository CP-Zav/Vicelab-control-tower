import { NextRequest, NextResponse } from 'next/server'
import { initializeRedis } from '@/lib/init-redis'

let initialized = false

export async function GET(request: NextRequest) {
  try {
    if (!initialized) {
      await initializeRedis()
      initialized = true
    }

    return NextResponse.json({
      success: true,
      message: 'System initialized',
      initialized: true,
    })
  } catch (error) {
    console.error('[init] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Initialization failed' },
      { status: 500 }
    )
  }
}
