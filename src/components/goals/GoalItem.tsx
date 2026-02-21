import { useState, useRef } from 'react'
import { Check, Trash2, ChevronDown, ChevronRight, Plus, Edit2, X } from 'lucide-react'
import { Goal } from '../../types'
import { useGoalsStore } from '../../store/goalsStore'
import { GoalProgressBar } from './GoalProgressBar'

interface Props {
  goal: Goal
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`flex-shrink-0 w-[15px] h-[15px] rounded-sm border transition-all ${
        checked
          ? 'bg-accent-green border-accent-green'
          : 'border-surface-4 hover:border-accent-green-dim'
      } flex items-center justify-center`}
    >
      {checked && <Check size={9} strokeWidth={3} className="text-surface-0" />}
    </button>
  )
}

export function GoalItem({ goal }: Props) {
  const {
    toggleGoal,
    deleteGoal,
    renameGoal,
    addGoalItem,
    toggleGoalItem,
    deleteGoalItem,
    renameGoalItem,
  } = useGoalsStore()

  const [expanded, setExpanded] = useState(true)
  const [addingItem, setAddingItem] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(goal.title)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState('')
  const newItemRef = useRef<HTMLInputElement>(null)

  const items = goal.items ?? []
  const completedCount = items.filter((i) => i.completed).length
  const isGroup = goal.type === 'group'

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addGoalItem(goal.id, newItemTitle.trim())
      setNewItemTitle('')
      setTimeout(() => newItemRef.current?.focus(), 0)
    }
  }

  const handleSaveTitle = () => {
    if (titleDraft.trim()) renameGoal(goal.id, titleDraft.trim())
    setEditingTitle(false)
  }

  const handleSaveItemTitle = (itemId: string) => {
    if (itemDraft.trim()) renameGoalItem(goal.id, itemId, itemDraft.trim())
    setEditingItemId(null)
  }

  return (
    <div className={`rounded-lg border transition-all mb-2 ${goal.completed ? 'border-surface-3 opacity-60' : 'border-border bg-surface-2'}`}>
      {/* Goal header */}
      <div className="flex items-start gap-2 px-3 py-2.5 group/goal">
        {/* Single goal checkbox or group toggle */}
        {isGroup ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 mt-0.5 text-text-muted hover:text-text-secondary"
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <div className="flex-shrink-0 mt-0.5">
            <Checkbox checked={goal.completed} onChange={() => toggleGoal(goal.id)} />
          </div>
        )}

        {/* Title */}
        {editingTitle ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              className="flex-1 bg-surface-3 text-text-primary text-[13px] px-1 rounded outline-none border border-accent-green min-w-0"
            />
            <button onClick={handleSaveTitle} className="text-accent-green flex-shrink-0"><Check size={11} /></button>
            <button onClick={() => setEditingTitle(false)} className="text-text-muted flex-shrink-0"><X size={11} /></button>
          </div>
        ) : (
          <span
            className={`flex-1 text-[13px] leading-tight ${goal.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}
          >
            {goal.title}
          </span>
        )}

        {/* Actions */}
        {!editingTitle && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/goal:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => { setEditingTitle(true); setTitleDraft(goal.title) }}
              className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3"
            >
              <Edit2 size={10} />
            </button>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-surface-3"
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for groups */}
      {isGroup && items.length > 0 && (
        <div className="px-3 pb-1">
          <GoalProgressBar total={items.length} completed={completedCount} />
        </div>
      )}

      {/* Group items */}
      {isGroup && expanded && (
        <div className="px-3 pb-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 group/item"
            >
              <Checkbox
                checked={item.completed}
                onChange={() => toggleGoalItem(goal.id, item.id)}
              />
              {editingItemId === item.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    autoFocus
                    value={itemDraft}
                    onChange={(e) => setItemDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveItemTitle(item.id)
                      if (e.key === 'Escape') setEditingItemId(null)
                    }}
                    className="flex-1 bg-surface-3 text-text-primary text-[12px] px-1 rounded outline-none border border-accent-green min-w-0"
                  />
                  <button onClick={() => handleSaveItemTitle(item.id)} className="text-accent-green"><Check size={10} /></button>
                  <button onClick={() => setEditingItemId(null)} className="text-text-muted"><X size={10} /></button>
                </div>
              ) : (
                <span
                  className={`flex-1 text-[12px] ${item.completed ? 'line-through text-text-muted' : 'text-text-secondary'}`}
                >
                  {item.title}
                </span>
              )}
              {editingItemId !== item.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingItemId(item.id); setItemDraft(item.title) }}
                    className="w-4 h-4 flex items-center justify-center rounded text-text-muted hover:text-text-primary"
                  >
                    <Edit2 size={9} />
                  </button>
                  <button
                    onClick={() => deleteGoalItem(goal.id, item.id)}
                    className="w-4 h-4 flex items-center justify-center rounded text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add item */}
          {addingItem ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-[15px] flex-shrink-0" />
              <input
                ref={newItemRef}
                autoFocus
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem()
                  if (e.key === 'Escape') { setAddingItem(false); setNewItemTitle('') }
                }}
                placeholder="New item…"
                className="flex-1 bg-transparent text-[12px] text-text-secondary outline-none border-b border-border pb-0.5 placeholder:text-text-muted"
              />
              <button onClick={handleAddItem} className="text-accent-green flex-shrink-0"><Check size={10} /></button>
              <button onClick={() => { setAddingItem(false); setNewItemTitle('') }} className="text-text-muted flex-shrink-0"><X size={10} /></button>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-1 mt-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
            >
              <Plus size={10} />
              Add item
            </button>
          )}
        </div>
      )}
    </div>
  )
}
