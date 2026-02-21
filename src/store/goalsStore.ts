import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Goal, GoalItem } from '../types'

function loadGoals(): Goal[] {
  try {
    const stored = localStorage.getItem('notetree:goals')
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveGoals(goals: Goal[]) {
  try {
    localStorage.setItem('notetree:goals', JSON.stringify(goals))
  } catch {}
}

interface GoalsState {
  goals: Goal[]
  addGoal: (title: string, type: 'single' | 'group') => void
  toggleGoal: (id: string) => void
  deleteGoal: (id: string) => void
  renameGoal: (id: string, title: string) => void
  addGoalItem: (goalId: string, title: string) => void
  toggleGoalItem: (goalId: string, itemId: string) => void
  deleteGoalItem: (goalId: string, itemId: string) => void
  renameGoalItem: (goalId: string, itemId: string, title: string) => void
  reorderGoals: (goals: Goal[]) => void
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: loadGoals(),

  addGoal: (title, type) => {
    const newGoal: Goal = {
      id: uuidv4(),
      title,
      type,
      completed: false,
      createdAt: Date.now(),
      items: type === 'group' ? [] : undefined,
    }
    set((state) => {
      const goals = [...state.goals, newGoal]
      saveGoals(goals)
      return { goals }
    })
  },

  toggleGoal: (id) => {
    set((state) => {
      const goals = state.goals.map((g) =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
      saveGoals(goals)
      return { goals }
    })
  },

  deleteGoal: (id) => {
    set((state) => {
      const goals = state.goals.filter((g) => g.id !== id)
      saveGoals(goals)
      return { goals }
    })
  },

  renameGoal: (id, title) => {
    set((state) => {
      const goals = state.goals.map((g) =>
        g.id === id ? { ...g, title } : g
      )
      saveGoals(goals)
      return { goals }
    })
  },

  addGoalItem: (goalId, title) => {
    const newItem: GoalItem = { id: uuidv4(), title, completed: false }
    set((state) => {
      const goals = state.goals.map((g) => {
        if (g.id !== goalId || g.type !== 'group') return g
        return { ...g, items: [...(g.items ?? []), newItem] }
      })
      saveGoals(goals)
      return { goals }
    })
  },

  toggleGoalItem: (goalId, itemId) => {
    set((state) => {
      const goals = state.goals.map((g) => {
        if (g.id !== goalId || g.type !== 'group') return g
        const items = (g.items ?? []).map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
        const allDone = items.length > 0 && items.every((i) => i.completed)
        return { ...g, items, completed: allDone }
      })
      saveGoals(goals)
      return { goals }
    })
  },

  deleteGoalItem: (goalId, itemId) => {
    set((state) => {
      const goals = state.goals.map((g) => {
        if (g.id !== goalId || g.type !== 'group') return g
        const items = (g.items ?? []).filter((i) => i.id !== itemId)
        const allDone = items.length > 0 && items.every((i) => i.completed)
        return { ...g, items, completed: allDone }
      })
      saveGoals(goals)
      return { goals }
    })
  },

  renameGoalItem: (goalId, itemId, title) => {
    set((state) => {
      const goals = state.goals.map((g) => {
        if (g.id !== goalId || g.type !== 'group') return g
        const items = (g.items ?? []).map((item) =>
          item.id === itemId ? { ...item, title } : item
        )
        return { ...g, items }
      })
      saveGoals(goals)
      return { goals }
    })
  },

  reorderGoals: (goals) => {
    saveGoals(goals)
    set({ goals })
  },
}))
