import { GitBranch, Plus, Network } from 'lucide-react'
import { useNotesStore } from '../../store/notesStore'
import { useUIStore } from '../../store/uiStore'
import { NoteTreeItem } from '../tree/NoteTreeItem'

export function LeftSidebar() {
  const { notes, activeNoteId, createNote } = useNotesStore()
  const { toggleTreeView } = useUIStore()

  const rootNote = notes['root']

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-accent-green" />
          <span className="text-[12px] font-medium text-text-secondary uppercase tracking-widest">
            Notes
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Visual tree view"
            onClick={toggleTreeView}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <Network size={13} />
          </button>
          <button
            title="New root note"
            onClick={() => createNote('root')}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {rootNote ? (
          <NoteTreeItem
            note={rootNote}
            depth={0}
            activeNoteId={activeNoteId}
          />
        ) : (
          <div className="px-3 py-6 text-center text-text-muted text-xs">
            No notes yet
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border-soft px-3 py-2">
        <div className="text-[11px] text-text-muted">
          {Object.keys(notes).length} note{Object.keys(notes).length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
