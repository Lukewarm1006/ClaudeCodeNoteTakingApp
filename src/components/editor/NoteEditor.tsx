import { useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { VideoExtension } from './VideoExtension'
import { EditorToolbar } from './EditorToolbar'
import { useNotesStore } from '../../store/notesStore'
import { GitBranch, Plus } from 'lucide-react'

export function NoteEditor() {
  const { notes, activeNoteId, updateNote, createNote } = useNotesStore()
  const activeNote = notes[activeNoteId]
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastNoteIdRef = useRef<string>(activeNoteId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      VideoExtension,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      CodeBlock,
      HorizontalRule,
      Placeholder.configure({
        placeholder: 'Start writing…',
      }),
    ],
    content: activeNote?.content
      ? JSON.parse(activeNote.content)
      : { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      // Debounced save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON())
        updateNote(lastNoteIdRef.current, { content: json })
      }, 500)
    },
  })

  // Switch content when active note changes
  useEffect(() => {
    if (!editor || !activeNote) return
    if (lastNoteIdRef.current !== activeNoteId) {
      // Save current before switching
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        const json = JSON.stringify(editor.getJSON())
        updateNote(lastNoteIdRef.current, { content: json })
      }
      lastNoteIdRef.current = activeNoteId
      const content = activeNote.content
        ? JSON.parse(activeNote.content)
        : { type: 'doc', content: [{ type: 'paragraph' }] }
      editor.commands.setContent(content, false)
    }
  }, [activeNoteId, activeNote, editor, updateNote])

  const handleAddBranch = useCallback(() => {
    createNote(activeNoteId, 'Untitled')
  }, [activeNoteId, createNote])

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Select a note
      </div>
    )
  }

  // Build breadcrumb
  const breadcrumb: string[] = []
  let cursor = activeNote
  while (cursor) {
    breadcrumb.unshift(cursor.title)
    if (!cursor.parentId) break
    cursor = notes[cursor.parentId]
  }

  return (
    <div className="flex flex-col h-full bg-surface-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface-1 text-[12px] text-text-muted">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-text-muted opacity-40">/</span>}
            <span className={i === breadcrumb.length - 1 ? 'text-text-secondary' : ''}>
              {crumb}
            </span>
          </span>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleAddBranch}
            title="Add branch from this note"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors border border-border"
          >
            <GitBranch size={10} />
            <Plus size={9} />
            <span>Branch</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="min-h-full"
        />
      </div>

      {/* Children branches preview */}
      {activeNote.children.length > 0 && (
        <div className="border-t border-border bg-surface-1 px-4 py-2">
          <div className="text-[11px] text-text-muted mb-2 flex items-center gap-1">
            <GitBranch size={10} />
            <span>Branches ({activeNote.children.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeNote.children.map((childId) => {
              const child = notes[childId]
              if (!child) return null
              return (
                <button
                  key={childId}
                  onClick={() => useNotesStore.getState().setActiveNote(childId)}
                  className="px-2 py-1 text-[12px] rounded border border-border text-text-secondary hover:border-accent-green hover:text-text-primary transition-colors bg-surface-2"
                >
                  {child.emoji && <span className="mr-1">{child.emoji}</span>}
                  {child.title}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
