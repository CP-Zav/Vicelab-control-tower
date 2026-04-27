import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { task } = req.body

    if (!task) {
      return res.status(400).json({ error: 'No task provided' })
    }

    // Call AI (OpenAI example)
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: task.input }],
      }),
    })

    const aiData = await aiRes.json()
    const output = aiData.choices?.[0]?.message?.content || ''

    return res.status(200).json({ success: true, output })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
