import { loadTasks } from '../lib/tasks/loader'

export const dynamic = 'force-static'

const STATUS_COLOR = { todo: '#2a2a2a', 'in-progress': '#003a80', done: '#0f3d0f' }
const PRIORITY_COLOR = { high: '#d93f0b', medium: '#b8860b', low: '#444' }

function TaskCard({ task }) {
  return (
    <div style={{ padding: '18px 20px', border: '1px solid #222', borderRadius: '10px', background: '#111', marginBottom: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <code style={{ fontSize: '11px', color: '#444', flexShrink: 0 }}>{task.id}</code>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{task.title}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          {task.priority && (
            <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '10px', background: PRIORITY_COLOR[task.priority] || '#333', color: '#fff' }}>
              {task.priority}
            </span>
          )}
          <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '10px', background: STATUS_COLOR[task.status] || '#2a2a2a', color: '#fff' }}>
            {task.status}
          </span>
        </div>
      </div>
      {task.goal && (
        <p style={{ fontSize: '12px', opacity: 0.55, margin: '8px 0 0', lineHeight: 1.5 }}>{task.goal}</p>
      )}
      <div style={{ marginTop: '6px', fontSize: '10px', color: '#444', display: 'flex', gap: '8px' }}>
        {task.issue && <span>#{task.issue}</span>}
        <span>{task.sourcePath}</span>
      </div>
    </div>
  )
}

export default function Page() {
  const { tasks, source } = loadTasks()

  return (
    <main style={{ padding: '40px', maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '38px',
        background: 'linear-gradient(90deg, cyan, violet, hotpink)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        marginBottom: '6px',
      }}>
        ViceLab Control Tower
      </h1>

      <p style={{ opacity: 0.6, marginBottom: '8px' }}>
        System online. Awaiting execution commands.
      </p>

      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
        border: '1px solid #333', fontSize: '11px', color: '#666', marginBottom: '36px',
      }}>
        ◎ Tasks source: {source}
      </span>

      <div>
        <h3 style={{ marginBottom: '14px', opacity: 0.4, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          Execution Layer
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </div>
    </main>
  )
}
