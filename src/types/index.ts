export interface Note {
  id: string
  title: string
  content: string // TipTap JSON string
  parentId: string | null
  children: string[]
  createdAt: number
  updatedAt: number
  emoji?: string
}

export interface GoalItem {
  id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  type: 'single' | 'group'
  completed: boolean
  createdAt: number
  // Group fields
  items?: GoalItem[]
}
