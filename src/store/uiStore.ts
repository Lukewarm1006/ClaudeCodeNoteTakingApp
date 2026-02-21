import { create } from 'zustand'

interface UIState {
  goalsOpen: boolean
  treeViewOpen: boolean
  leftSidebarWidth: number
  rightSidebarWidth: number
  toggleGoals: () => void
  toggleTreeView: () => void
  setLeftSidebarWidth: (w: number) => void
  setRightSidebarWidth: (w: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  goalsOpen: true,
  treeViewOpen: false,
  leftSidebarWidth: 240,
  rightSidebarWidth: 280,

  toggleGoals: () => set((s) => ({ goalsOpen: !s.goalsOpen })),
  toggleTreeView: () => set((s) => ({ treeViewOpen: !s.treeViewOpen })),
  setLeftSidebarWidth: (w) => set({ leftSidebarWidth: w }),
  setRightSidebarWidth: (w) => set({ rightSidebarWidth: w }),
}))
