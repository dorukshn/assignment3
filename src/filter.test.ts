import { describe, it, expect } from 'vitest'
import { filterTasks, countByFilter } from './filter'
import { taskReducer, type State, type Task } from './taskReducer'

const tasks: Task[] = [
  { id: 'a', title: 'Read the slides', status: 'todo' },
  { id: 'b', title: 'Write the reducer', status: 'in-progress' },
  { id: 'c', title: 'Take screenshots', status: 'done' },
  { id: 'd', title: 'Write tests', status: 'todo' },
]

describe('filterTasks', () => {
  it('all returns every task', () => {
    expect(filterTasks(tasks, 'all')).toEqual(tasks)
  })

  it('returns only the tasks with the chosen status', () => {
    expect(filterTasks(tasks, 'todo').map((t) => t.id)).toEqual(['a', 'd'])
    expect(filterTasks(tasks, 'in-progress').map((t) => t.id)).toEqual(['b'])
    expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual(['c'])
  })

  it('works on an empty list', () => {
    expect(filterTasks([], 'done')).toEqual([])
  })
})

describe('countByFilter', () => {
  it('counts the tasks for each filter', () => {
    expect(countByFilter(tasks)).toEqual({ all: 4, todo: 2, 'in-progress': 1, done: 1 })
  })

  it('gives zeros for an empty list', () => {
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })

  it('counts are right after a delete', () => {
    const state: State = { tasks, filter: 'all', past: [] }
    const next = taskReducer(state, { type: 'remove', id: 'a' })
    expect(countByFilter(next.tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })
})
