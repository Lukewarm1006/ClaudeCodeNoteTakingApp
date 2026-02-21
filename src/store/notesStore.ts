import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '../types'

const ROOT_NOTE_ID = 'root'

function createRootNote(): Note {
  return {
    id: ROOT_NOTE_ID,
    title: 'Welcome',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome to NoteTree' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is your root note. Start writing, or create a branch below.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Use the sidebar to navigate your note tree, or click the tree icon to see a full visual map of all your notes.',
            },
          ],
        },
      ],
    }),
    parentId: null,
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    emoji: '🌱',
  }
}

function loadNotes(): Record<string, Note> {
  try {
    const stored = localStorage.getItem('notetree:notes')
    if (stored) return JSON.parse(stored)
  } catch {}
  const root = createRootNote()
  return { [root.id]: root }
}

function saveNotes(notes: Record<string, Note>) {
  try {
    localStorage.setItem('notetree:notes', JSON.stringify(notes))
  } catch {}
}

interface NotesState {
  notes: Record<string, Note>
  activeNoteId: string
  // Actions
  setActiveNote: (id: string) => void
  createNote: (parentId: string, title?: string) => string
  updateNote: (id: string, data: Partial<Note>) => void
  deleteNote: (id: string) => void
  moveNote: (id: string, newParentId: string) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: loadNotes(),
  activeNoteId: ROOT_NOTE_ID,

  setActiveNote: (id) => {
    set({ activeNoteId: id })
  },

  createNote: (parentId, title = 'Untitled') => {
    const id = uuidv4()
    const newNote: Note = {
      id,
      title,
      content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
      parentId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    set((state) => {
      const notes = { ...state.notes }
      notes[id] = newNote
      if (notes[parentId]) {
        notes[parentId] = {
          ...notes[parentId],
          children: [...notes[parentId].children, id],
        }
      }
      saveNotes(notes)
      return { notes, activeNoteId: id }
    })

    return id
  },

  updateNote: (id, data) => {
    set((state) => {
      const notes = {
        ...state.notes,
        [id]: {
          ...state.notes[id],
          ...data,
          updatedAt: Date.now(),
        },
      }
      saveNotes(notes)
      return { notes }
    })
  },

  deleteNote: (id) => {
    const state = get()
    if (id === ROOT_NOTE_ID) return

    // Recursively collect all descendant IDs
    function collectDescendants(noteId: string): string[] {
      const note = state.notes[noteId]
      if (!note) return []
      return [noteId, ...note.children.flatMap(collectDescendants)]
    }

    const toDelete = new Set(collectDescendants(id))
    const note = state.notes[id]

    set((prevState) => {
      const notes = { ...prevState.notes }

      // Remove from parent's children
      if (note.parentId && notes[note.parentId]) {
        notes[note.parentId] = {
          ...notes[note.parentId],
          children: notes[note.parentId].children.filter((c) => c !== id),
        }
      }

      // Delete all descendants
      toDelete.forEach((dId) => {
        delete notes[dId]
      })

      saveNotes(notes)

      // Navigate to parent or root
      const newActiveId = note.parentId && notes[note.parentId]
        ? note.parentId
        : ROOT_NOTE_ID

      return { notes, activeNoteId: newActiveId }
    })
  },

  moveNote: (id, newParentId) => {
    set((state) => {
      const notes = { ...state.notes }
      const note = notes[id]
      if (!note || id === ROOT_NOTE_ID) return state

      // Remove from old parent
      if (note.parentId && notes[note.parentId]) {
        notes[note.parentId] = {
          ...notes[note.parentId],
          children: notes[note.parentId].children.filter((c) => c !== id),
        }
      }

      // Add to new parent
      if (notes[newParentId]) {
        notes[newParentId] = {
          ...notes[newParentId],
          children: [...notes[newParentId].children, id],
        }
      }

      notes[id] = { ...note, parentId: newParentId }
      saveNotes(notes)
      return { notes }
    })
  },
}))
