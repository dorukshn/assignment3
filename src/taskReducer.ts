// Name: Doruk Şahin
// Student number: 2023502030
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

// The whole state of the app: the task list and the chosen filter.
export type State = { tasks: Task[]; filter: Filter }

export const initialState: State = { tasks: [], filter: 'all' }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }],
      }
    case 'advance':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
      }
    case 'remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
  }
}
