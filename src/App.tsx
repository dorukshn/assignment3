// The state lives in App with useReducer and goes down to the other components as props.
import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

const LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    // The caller creates the id, so the reducer stays pure.
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask}>
      <input name="title" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

type FilterBarProps = {
  filter: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}

function FilterBar({ filter, counts, dispatch }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
      {FILTERS.map((f) => {
        const active = f === filter
        return (
          <button
            key={f}
            type="button"
            aria-pressed={active}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={
              active
                ? { background: '#1a58a5', color: 'white', fontWeight: 'bold' }
                : undefined
            }
          >
            {LABELS[f]} ({counts[f]})
          </button>
        )
      })}
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) return <p>No tasks here.</p>
  return (
    <ul>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Derived while rendering, never stored in state.
  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar filter={state.filter} counts={counts} dispatch={dispatch} />
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => dispatch({ type: 'clearDone' })}>
          Clear done
        </button>
        <button
          type="button"
          disabled={state.past.length === 0}
          onClick={() => dispatch({ type: 'undo' })}
        >
          Undo
        </button>
      </div>
    </main>
  )
}
