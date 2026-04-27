import type { NextApiRequest, NextApiResponse } from 'next'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appEMk1WfRzjfhc9F'
const TASKS_TABLE_ID = process.env.AIRTABLE_TASKS_TABLE_ID || 'tbliUArxcDHyxOfi5'

const FIELDS = {
  taskName: 'fldkyMHHgFrAWLazz',
  status: 'fldRwJYkwPj74XF1b',
  notes: 'fldXUxzgR91qkPN9e',
  executionLog: 'fld06W4D37AjCzKxV',
  routingKey: 'fldceeCtvffUFtcQx',
  delegateNow: 'fldZO6vuiS7EsLXAO',
  controlEnabled: 'fldXGNHpt1SnNymQx',
  aiStatus: 'fldm05347r7eiSLw9',
  jsonPayload: 'fldYwlaxr8IPgrseS',
  aiOutput: 'fldWwmlQPUtcGA0MH',
  objective: 'flddSmFC9ZImq0vY5',
  context: 'fldSdKXpuknYmDXHH',
  tone: 'fldr66h0BMGdpSkZO',
  wordLimit: 'fldUtSqKD1PgE8u09',
  region: 'fldNtHXcI1duFViOv',
  complianceNotes: 'fldIg7RvV7oDIMtoH',
  deliverableType: 'flda9hcY71tCB0DWY',
  primaryTool: 'fldenkuYXQtwZCLb8',
  secondaryTool: 'fldJX3CyhHeWmUSnF',
  completed: 'fldZBfrHyyEWOa5zU',
  completedAt: 'fldvvQzIvGQBaO4Qf',
} as const

type AirtableRecord = {
  id: string
  fields: Record<string, any>
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

async function airtableFetch(path: string, init?: RequestInit) {
  const token = requireEnv('AIRTABLE_API_KEY')
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || `Airtable request failed: ${res.status}`)
  }
  return data
}

async function getTask(taskId: string): Promise<AirtableRecord> {
  return airtableFetch(`${TASKS_TABLE_ID}/${taskId}`)
}

async function updateTask(taskId: string, fields: Record<string, any>) {
  return airtableFetch(`${TASKS_TABLE_ID}/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields, typecast: true }),
  })
}

function safeField(fields: Record<string, any>, fieldId: string) {
  const value = fields[fieldId]
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function buildPrompt(record: AirtableRecord, directInput?: string) {
  const f = record.fields || {}

  const payload = safeField(f, FIELDS.jsonPayload)
  const payloadText = payload ? `\nJSON payload:\n${payload}` : ''

  return `You are the execution engine for ViceLab Control Tower.

Task: ${safeField(f, FIELDS.taskName)}
Routing key: ${safeField(f, FIELDS.routingKey)}
Objective: ${safeField(f, FIELDS.objective) || directInput || safeField(f, FIELDS.notes)}
Deliverable type: ${safeField(f, FIELDS.deliverableType)}
Primary tool: ${safeField(f, FIELDS.primaryTool)}
Secondary tool: ${safeField(f, FIELDS.secondaryTool)}
Tone: ${safeField(f, FIELDS.tone) || 'direct, useful, operational'}
Word limit: ${safeField(f, FIELDS.wordLimit) || 'no strict limit'}
Region: ${safeField(f, FIELDS.region)}
Compliance notes: ${safeField(f, FIELDS.complianceNotes)}
Context:
${safeField(f, FIELDS.context) || safeField(f, FIELDS.notes)}${payloadText}

Return the completed deliverable only. Be decisive. No filler.`
}

async function runAI(prompt: string) {
  const apiKey = requireEnv('OPENAI_API_KEY')
  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You execute Control Tower tasks and produce production-ready outputs.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    }),
  })

  const aiData = await aiRes.json().catch(() => ({}))
  if (!aiRes.ok) {
    throw new Error(aiData?.error?.message || `OpenAI request failed: ${aiRes.status}`)
  }

  return aiData.choices?.[0]?.message?.content?.trim() || ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startedAt = new Date().toISOString()

  try {
    const { taskId, task } = req.body || {}
    const recordId = taskId || task?.id

    if (!recordId) {
      return res.status(400).json({ error: 'Missing taskId. Send { taskId: "rec..." }.' })
    }

    const taskRecord = await getTask(recordId)

    await updateTask(recordId, {
      [FIELDS.aiStatus]: 'Processing',
      [FIELDS.executionLog]: `Started AI execution at ${startedAt}`,
    })

    const prompt = buildPrompt(taskRecord, task?.input)
    const output = await runAI(prompt)
    const completedAt = new Date().toISOString()

    await updateTask(recordId, {
      [FIELDS.aiStatus]: 'Done',
      [FIELDS.status]: 'Done',
      [FIELDS.aiOutput]: output,
      [FIELDS.completed]: true,
      [FIELDS.completedAt]: completedAt,
      [FIELDS.executionLog]: `Started AI execution at ${startedAt}\nCompleted at ${completedAt}`,
      [FIELDS.delegateNow]: false,
    })

    return res.status(200).json({
      success: true,
      taskId: recordId,
      output,
      completedAt,
    })
  } catch (err: any) {
    const failedAt = new Date().toISOString()
    const message = err?.message || 'Unknown execution error'

    const recordId = req.body?.taskId || req.body?.task?.id
    if (recordId) {
      await updateTask(recordId, {
        [FIELDS.aiStatus]: 'Error',
        [FIELDS.executionLog]: `Failed at ${failedAt}\n${message}`,
        [FIELDS.delegateNow]: false,
      }).catch(() => null)
    }

    return res.status(500).json({ success: false, error: message })
  }
}
