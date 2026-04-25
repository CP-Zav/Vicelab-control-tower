import { NextRequest, NextResponse } from 'next/server'
import { redis, keys, getJSON } from '@/lib/redis'
import { ExecutionTask } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const brand = searchParams.get('brand')

    let tasks: ExecutionTask[] = []

    if (status) {
      // Fetch tasks by status
      const key = keys.tasksByStatus(status)
      tasks = (await getJSON<ExecutionTask[]>(key)) || []
    } else if (brand) {
      // Fetch tasks by brand
      const key = keys.tasksByBrand(brand)
      tasks = (await getJSON<ExecutionTask[]>(key)) || []
    } else {
      // Fetch all tasks
      const key = keys.tasks()
      tasks = (await getJSON<ExecutionTask[]>(key)) || []
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[tasks GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskId, newStatus } = body

    if (action === 'execute') {
      // Update task status
      const taskKey = keys.task(taskId)
      const task = await getJSON<ExecutionTask>(taskKey)

      if (!task) {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        )
      }

      // Update status
      task.status = newStatus || 'ready'
      await redis.set(taskKey, JSON.stringify(task))

      // Log execution
      const logKey = `task:execution:${taskId}:${Date.now()}`
      await redis.set(
        logKey,
        JSON.stringify({
          taskId,
          action: 'execute',
          newStatus: task.status,
          timestamp: new Date().toISOString(),
        }),
        { ex: 86400 } // 24 hours
      )

      return NextResponse.json({
        success: true,
        data: task,
        message: `Task ${taskId} executed`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[tasks POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute task' },
      { status: 500 }
    )
  }
}
