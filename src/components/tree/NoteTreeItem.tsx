import React, { useState, useRef } from 'react'
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useNotesStore } from '../../store/notesStore'
import { Note } from '../../types'

interface NoteTreeItemProps {
  note: Note
  depth: number
  activeNoteId: string
}

export function NoteTreeItem({ note, depth, activeNoteId }: NoteTreeItemProps) {
  const { notes, setActiveNote, createNote, deleteNote, updateNote } = useNotesStore()
  const [expanded, setExpanded] = useState(depth === 0)
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = activeNoteId === note.id
  const hasChildren = note.children.length > 0

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((v) => !v)
  }

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    createNote(note.id, 'Untitled')
    setExpanded(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNote(note.id)
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
    setEditTitle(note.title)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateNote(note.id, { title: editTitle.trim() })
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-[5px] rounded-md cursor-pointer text-sm select-none transition-colors ${
          isActive
            ? 'bg-surface-3 text-text-primary'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: '6px' }}
        onClick={() => setActiveNote(note.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Chevron */}
        <button
          className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors text-text-muted hover:text-text-secondary ${!hasChildren ? 'invisible' : ''}`}
          onClick={hasChildren ? handleExpand : undefined}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Emoji */}
        {note.emoji && (
          <span className="text-xs flex-shrink-0 leading-none">{note.emoji}</span>
        )}

        {/* Title / edit */}
        {editing ? (
          <div
            className="flex items-center gap-1 flex-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-surface-3 text-text-primary text-[13px] px-1 rounded outline-none border border-accent-green min-w-0"
            />
            <button onClick={handleSaveEdit} className="text-accent-green">
              <Check size={11} />
            </button>
            <button onClick={() => setEditing(false)} className="text-text-muted">
              <X size={11} />
            </button>
          </div>
        ) : (
          <span className="flex-1 truncate text-[13px]">{note.title}</span>
        )}

        {/* Hover actions */}
        {!editing && (hovered || isActive) && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              title="New branch"
              onClick={handleAddChild}
              className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-4 transition-colors"
            >
              <Plus size={11} />
            </button>
            <button
              title="Rename"
              onClick={handleStartEdit}
              className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-4 transition-colors"
            >
              <Edit2 size={10} />
            </button>
            {note.parentId !== null && (
              <button
                title="Delete"
                onClick={handleDelete}
                className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-surface-4 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {note.children.map((childId) => {
            const child = notes[childId]
            if (!child) return null
            return (
              <NoteTreeItem
                key={childId}
                note={child}
                depth={depth + 1}
                activeNoteId={activeNoteId}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
