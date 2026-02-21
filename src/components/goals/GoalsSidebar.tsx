import { useState } from 'react'
import { Target, Plus, X } from 'lucide-react'
import { useGoalsStore } from '../../store/goalsStore'
import { GoalItem } from './GoalItem'

export function GoalsSidebar() {
  const { goals, addGoal } = useGoalsStore()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'single' | 'group'>('single')

  const handleAdd = () => {
    if (newTitle.trim()) {
      addGoal(newTitle.trim(), newType)
      setNewTitle('')
      setAdding(false)
    }
  }

  const activeGoals = goals.filter((g) => !g.completed)
  const doneGoals = goals.filter((g) => g.completed)

  return (
    <div className="flex flex-col h-full bg-surface-1 border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-accent-green" />
          <span className="text-[12px] font-medium text-text-secondary uppercase tracking-widest">
            Goals
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          title="Add goal"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="px-3 py-3 border-b border-border-soft bg-surface-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
            }}
            placeholder="Goal title…"
            className="w-full bg-surface-3 text-text-primary text-[13px] px-2 py-1.5 rounded outline-none border border-accent-green placeholder:text-text-muted mb-2"
          />
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setNewType('single')}
              className={`flex-1 py-1 rounded text-[11px] transition-colors ${newType === 'single' ? 'bg-accent-green text-surface-0 font-medium' : 'bg-surface-3 text-text-muted hover:text-text-secondary'}`}
            >
              Single
            </button>
            <button
              onClick={() => setNewType('group')}
              className={`flex-1 py-1 rounded text-[11px] transition-colors ${newType === 'group' ? 'bg-accent-green text-surface-0 font-medium' : 'bg-surface-3 text-text-muted hover:text-text-secondary'}`}
            >
              Group
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-1 rounded bg-accent-green text-surface-0 text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle('') }}
              className="w-7 h-7 flex items-center justify-center rounded bg-surface-3 text-text-muted hover:text-text-primary"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeGoals.length === 0 && !adding && (
          <div className="text-center py-8 text-text-muted text-xs">
            <Target size={24} className="mx-auto mb-2 opacity-30" />
            <p>No goals yet.</p>
            <p className="mt-1 opacity-60">Click + to add one.</p>
          </div>
        )}

        {activeGoals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} />
        ))}

        {/* Completed */}
        {doneGoals.length > 0 && (
          <>
            <div className="text-[10px] text-text-muted uppercase tracking-widest mt-4 mb-2 px-1">
              Completed ({doneGoals.length})
            </div>
            {doneGoals.map((goal) => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border-soft px-3 py-2 text-[11px] text-text-muted">
        {activeGoals.length} active · {doneGoals.length} done
      </div>
    </div>
  )
}
