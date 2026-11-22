// Name: Doruk Şahin
// Student number: 2023502030
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

// The whole state of the app: the task list, the chosen filter and,
// for Bonus 1 (Undo), the earlier task lists, the newest one last.
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }

export const initialState: State = { tasks: [], filter: 'all', past: [] }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

// Put a new task list into the state and remember the old one for Undo.
// If nothing really changed (for example an unknown id), keep the state as it is.
function withTasks(state: State, tasks: Task[]): State {
  const unchanged =
    tasks.length === state.tasks.length && tasks.every((t, i) => t === state.tasks[i])
  if (unchanged) return state
  return { ...state, tasks, past: [...state.past, state.tasks] }
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return withTasks(state, [
        ...state.tasks,
        { id: action.id, title: action.title, status: 'todo' },
      ])
    case 'advance':
      return withTasks(
        state,
        state.tasks.map((t) => (t.id === action.id ? { ...t, status: NEXT[t.status] } : t)),
      )
    case 'remove':
      return withTasks(
        state,
        state.tasks.filter((t) => t.id !== action.id),
      )
    case 'setFilter':
      // Only the filter changes; the tasks stay the same. Not undoable.
      return { ...state, filter: action.filter }
    case 'clearDone':
      // Keep every task that is not done; the filter stays the same.
      return withTasks(
        state,
        state.tasks.filter((t) => t.status !== 'done'),
      )
    case 'undo': {
      // Nothing to undo: return the same state.
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return { ...state, tasks: previous, past: state.past.slice(0, -1) }
    }
  }
}
