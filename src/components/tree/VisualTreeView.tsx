import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { X, GitBranch } from 'lucide-react'
import { useNotesStore } from '../../store/notesStore'
import { useUIStore } from '../../store/uiStore'
import { Note } from '../../types'

// ---- Layout algorithm: simple top-down tree ----
interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

const NODE_W = 160
const NODE_H = 52
const H_GAP = 40
const V_GAP = 80

function layoutTree(
  notes: Record<string, Note>,
  rootId: string
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  // Measure subtree width
  function subtreeWidth(id: string): number {
    const note = notes[id]
    if (!note || note.children.length === 0) return NODE_W
    const childrenWidth = note.children.reduce(
      (sum, cId) => sum + subtreeWidth(cId),
      0
    )
    return Math.max(NODE_W, childrenWidth + H_GAP * (note.children.length - 1))
  }

  function place(id: string, x: number, y: number) {
    positions.set(id, { x, y })
    const note = notes[id]
    if (!note || note.children.length === 0) return

    const widths = note.children.map((cId) => subtreeWidth(cId))
    const totalWidth =
      widths.reduce((a, b) => a + b, 0) + H_GAP * (note.children.length - 1)
    let curX = x - totalWidth / 2

    note.children.forEach((cId, i) => {
      const w = widths[i]
      place(cId, curX + w / 2, y + NODE_H + V_GAP)
      curX += w + H_GAP
    })
  }

  place(rootId, 0, 0)
  return positions
}

// ---- Custom node ----
interface NoteNodeData extends Record<string, unknown> {
  label: string
  emoji?: string
  isActive: boolean
  childCount: number
  onClick: () => void
}

function NoteNode({ data }: NodeProps) {
  const d = data as NoteNodeData
  return (
    <div
      onClick={d.onClick}
      className={`cursor-pointer rounded-lg border transition-all select-none ${
        d.isActive
          ? 'border-accent-green bg-surface-3 shadow-lg shadow-accent-green/10'
          : 'border-border bg-surface-2 hover:border-border hover:bg-surface-3'
      }`}
      style={{ width: NODE_W, height: NODE_H, padding: '8px 12px' }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#2a2a2a', border: 'none', width: 6, height: 6 }} />
      <div className="flex items-center gap-2 h-full">
        {d.emoji && <span className="text-base leading-none flex-shrink-0">{d.emoji}</span>}
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium truncate ${d.isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
            {d.label}
          </div>
          {d.childCount > 0 && (
            <div className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5">
              <GitBranch size={8} />
              {d.childCount} branch{d.childCount !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#2a2a2a', border: 'none', width: 6, height: 6 }} />
    </div>
  )
}

const nodeTypes = { noteNode: NoteNode }

// ---- Main view ----
export function VisualTreeView() {
  const { notes, activeNoteId, setActiveNote } = useNotesStore()
  const { toggleTreeView } = useUIStore()

  const { initialNodes, initialEdges } = useMemo(() => {
    const positions = layoutTree(notes, 'root')
    const initialNodes: Node[] = []
    const initialEdges: Edge[] = []

    Object.values(notes).forEach((note) => {
      const pos = positions.get(note.id) ?? { x: 0, y: 0 }
      initialNodes.push({
        id: note.id,
        type: 'noteNode',
        position: pos,
        data: {
          label: note.title,
          emoji: note.emoji,
          isActive: note.id === activeNoteId,
          childCount: note.children.length,
          onClick: () => {
            setActiveNote(note.id)
            toggleTreeView()
          },
        } as NoteNodeData,
      })

      note.children.forEach((childId) => {
        initialEdges.push({
          id: `${note.id}->${childId}`,
          source: note.id,
          target: childId,
          style: { stroke: '#2a2a2a', strokeWidth: 1.5 },
          type: 'smoothstep',
        })
      })
    })

    return { initialNodes, initialEdges }
  }, [notes, activeNoteId, setActiveNote, toggleTreeView])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="fixed inset-0 z-50 bg-surface-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-accent-green" />
          <span className="text-sm font-medium text-text-primary">Note Tree</span>
          <span className="text-xs text-text-muted">
            {Object.keys(notes).length} notes
          </span>
        </div>
        <button
          onClick={toggleTreeView}
          className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Flow */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} color="#1e1e1e" gap={20} size={1} />
          <Controls position="bottom-right" />
          <MiniMap
            position="bottom-left"
            nodeColor={(n) => {
              const d = n.data as NoteNodeData
              return d.isActive ? '#4caf87' : '#242424'
            }}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>
      </div>

      {/* Hint */}
      <div className="px-4 py-2 border-t border-border bg-surface-1 text-[11px] text-text-muted flex-shrink-0">
        Click a node to open that note. Scroll or pinch to zoom. Drag to pan.
      </div>
    </div>
  )
}
