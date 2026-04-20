import fs from 'fs'
import path from 'path'
import { SEED_TASKS } from './seed'

const TASKS_DIR = path.join(process.cwd(), 'tasks')

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }
  const meta = {}
  match[1].split('\n').forEach(line => {
    const i = line.indexOf(':')
    if (i === -1) return
    const key = line.slice(0, i).trim()
    const val = line.slice(i + 1).trim()
    if (key) meta[key] = val
  })
  return { meta, body: match[2].trim() }
}

function parseSection(body, heading) {
  const re = new RegExp(`^# ${heading}\\s*\\n([\\s\\S]*?)(?=\\n# |$)`, 'm')
  const m = body.match(re)
  return m ? m[1].trim() : null
}

export function loadTasks() {
  try {
    const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.md')).sort()
    if (!files.length) return { tasks: SEED_TASKS, source: 'seed fallback' }

    const imported = files.flatMap(file => {
      try {
        const raw = fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8')
        const { meta, body } = parseFrontmatter(raw)
        const slug = file.replace(/\.md$/, '')
        const id = slug.split('-')[0].toUpperCase()
        return [{
          id, slug,
          title: meta.title || id,
          status: meta.status || 'todo',
          priority: meta.priority || null,
          owner: meta.owner || 'codex',
          issue: meta.issue ? Number(meta.issue) : null,
          goal: parseSection(body, 'Goal'),
          definitionOfDone: parseSection(body, 'Definition of Done'),
          acceptanceCriteria: parseSection(body, 'Acceptance Criteria'),
          notes: parseSection(body, 'Notes'),
          sourcePath: `tasks/${file}`,
        }]
      } catch { return [] }
    })

    const importedIds = new Set(imported.map(t => t.id))
    const tasks = [
      ...imported,
      ...SEED_TASKS.filter(t => !importedIds.has(t.id)),
    ]
    return { tasks, source: 'live /tasks' }
  } catch {
    return { tasks: SEED_TASKS, source: 'seed fallback' }
  }
}
