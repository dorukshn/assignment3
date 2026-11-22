import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State, type Task } from './taskReducer'

const a: Task = { id: 'a', title: 'Read the slides', status: 'todo' }
const b: Task = { id: 'b', title: 'Write the reducer', status: 'in-progress' }
const c: Task = { id: 'c', title: 'Take screenshots', status: 'done' }

function sample(): State {
  return { tasks: [a, b, c], filter: 'all', past: [] }
}

// Freeze the state and everything inside it, so a mutation throws an error.
function freeze(state: State): State {
  for (const t of state.tasks) Object.freeze(t)
  Object.freeze(state.tasks)
  for (const list of state.past) Object.freeze(list)
  Object.freeze(state.past)
  return Object.freeze(state)
}

describe('taskReducer', () => {
  it('add appends a new task with status todo', () => {
    const next = taskReducer(initialState, { type: 'add', id: 'x', title: 'New' })
    expect(next.tasks).toEqual([{ id: 'x', title: 'New', status: 'todo' }])
    expect(next.filter).toBe('all')
  })

  it('advance moves a task to the next status', () => {
    const next = taskReducer(sample(), { type: 'advance', id: 'a' })
    expect(next.tasks[0].status).toBe('in-progress')
    expect(next.tasks[1]).toBe(b) // the other tasks are the same objects
  })

  it('advance three times returns to todo', () => {
    let state = sample()
    for (let i = 0; i < 3; i++) state = taskReducer(state, { type: 'advance', id: 'a' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('remove deletes the task with that id', () => {
    const next = taskReducer(sample(), { type: 'remove', id: 'b' })
    expect(next.tasks.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('setFilter changes only the filter', () => {
    const before = sample()
    const next = taskReducer(before, { type: 'setFilter', filter: 'done' })
    expect(next.filter).toBe('done')
    expect(next.tasks).toBe(before.tasks)
  })

  it('clearDone removes done tasks and keeps the filter', () => {
    const before = { ...sample(), filter: 'todo' as const }
    const next = taskReducer(before, { type: 'clearDone' })
    expect(next.tasks.map((t) => t.id)).toEqual(['a', 'b'])
    expect(next.filter).toBe('todo')
  })

  it('does not change the old state', () => {
    const before = freeze(sample())
    const copy = structuredClone(before)
    taskReducer(before, { type: 'add', id: 'x', title: 'New' })
    taskReducer(before, { type: 'advance', id: 'a' })
    taskReducer(before, { type: 'remove', id: 'a' })
    taskReducer(before, { type: 'setFilter', filter: 'done' })
    taskReducer(before, { type: 'clearDone' })
    taskReducer(before, { type: 'undo' })
    expect(before).toEqual(copy)
  })

  describe('edge cases', () => {
    it('advance or remove with an unknown id returns the same state', () => {
      const before = sample()
      expect(taskReducer(before, { type: 'advance', id: 'nope' })).toBe(before)
      expect(taskReducer(before, { type: 'remove', id: 'nope' })).toBe(before)
    })

    it('clearDone on an empty list keeps an empty list', () => {
      const next = taskReducer(initialState, { type: 'clearDone' })
      expect(next.tasks).toEqual([])
    })

    it('clearDone with nothing done changes nothing', () => {
      const before: State = { tasks: [a, b], filter: 'all', past: [] }
      expect(taskReducer(before, { type: 'clearDone' })).toBe(before)
    })
  })

  describe('undo (Bonus 1)', () => {
    it('undo brings back the tasks from before the last change', () => {
      const s1 = taskReducer(initialState, { type: 'add', id: 'x', title: 'New' })
      const s2 = taskReducer(s1, { type: 'advance', id: 'x' })
      const back = taskReducer(s2, { type: 'undo' })
      expect(back.tasks).toEqual(s1.tasks)
    })

    it('undo after clearDone brings the cleared tasks back', () => {
      const cleared = taskReducer(sample(), { type: 'clearDone' })
      const back = taskReducer(cleared, { type: 'undo' })
      expect(back.tasks).toEqual([a, b, c])
    })

    it('changing the filter is not undoable', () => {
      const next = taskReducer(sample(), { type: 'setFilter', filter: 'done' })
      expect(next.past).toEqual([])
    })

    it('undo with nothing to undo returns the same state', () => {
      expect(taskReducer(initialState, { type: 'undo' })).toBe(initialState)
    })
  })
})
