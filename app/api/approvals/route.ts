import { NextRequest, NextResponse } from 'next/server'
import { redis, keys, getJSON } from '@/lib/redis'
import { ApprovalItem } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let approvals: ApprovalItem[] = []

    if (status) {
      const key = keys.approvalsByStatus(status)
      approvals = (await getJSON<ApprovalItem[]>(key)) || []
    } else {
      const key = keys.approvals()
      approvals = (await getJSON<ApprovalItem[]>(key)) || []
    }

    return NextResponse.json({
      success: true,
      data: approvals,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[approvals GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, approvalId, decision } = body

    if (action === 'approve' || action === 'refuse') {
      const approvalKey = keys.approval(approvalId)
      const approval = await getJSON<ApprovalItem>(approvalKey)

      if (!approval) {
        return NextResponse.json(
          { success: false, error: 'Approval not found' },
          { status: 404 }
        )
      }

      // Log decision
      const logKey = `approval:decision:${approvalId}:${Date.now()}`
      await redis.set(
        logKey,
        JSON.stringify({
          approvalId,
          decision,
          timestamp: new Date().toISOString(),
          decidedAt: new Date().toISOString(),
        }),
        { ex: 604800 } // 7 days
      )

      return NextResponse.json({
        success: true,
        data: approval,
        message: `Approval ${approvalId} ${decision}`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[approvals POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
