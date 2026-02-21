import { useRef, useCallback } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { GoalsSidebar } from '../goals/GoalsSidebar'
import { NoteEditor } from '../editor/NoteEditor'
import { VisualTreeView } from '../tree/VisualTreeView'
import { useUIStore } from '../../store/uiStore'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

export function AppLayout() {
  const {
    goalsOpen,
    treeViewOpen,
    leftSidebarWidth,
    rightSidebarWidth,
    toggleGoals,
    setLeftSidebarWidth,
    setRightSidebarWidth,
  } = useUIStore()

  // Resize logic for left sidebar
  const leftDragging = useRef(false)
  const rightDragging = useRef(false)

  const onLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    leftDragging.current = true
    const startX = e.clientX
    const startW = leftSidebarWidth

    const onMove = (ev: MouseEvent) => {
      if (!leftDragging.current) return
      const delta = ev.clientX - startX
      const newW = Math.max(160, Math.min(400, startW + delta))
      setLeftSidebarWidth(newW)
    }
    const onUp = () => {
      leftDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [leftSidebarWidth, setLeftSidebarWidth])

  const onRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    rightDragging.current = true
    const startX = e.clientX
    const startW = rightSidebarWidth

    const onMove = (ev: MouseEvent) => {
      if (!rightDragging.current) return
      const delta = startX - ev.clientX
      const newW = Math.max(200, Math.min(420, startW + delta))
      setRightSidebarWidth(newW)
    }
    const onUp = () => {
      rightDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [rightSidebarWidth, setRightSidebarWidth])

  return (
    <div className="flex h-full w-full overflow-hidden select-none">
      {/* Left sidebar */}
      <div
        style={{ width: leftSidebarWidth, minWidth: leftSidebarWidth }}
        className="flex-shrink-0 overflow-hidden"
      >
        <LeftSidebar />
      </div>

      {/* Left resize handle */}
      <div
        onMouseDown={onLeftMouseDown}
        className="w-[3px] flex-shrink-0 cursor-col-resize hover:bg-accent-green transition-colors bg-transparent"
      />

      {/* Main editor */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <NoteEditor />
      </div>

      {/* Toggle goals button */}
      <button
        onClick={toggleGoals}
        title={goalsOpen ? 'Hide goals' : 'Show goals'}
        className="flex-shrink-0 w-7 flex items-center justify-center border-l border-border bg-surface-1 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
      >
        {goalsOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
      </button>

      {/* Right resize handle + sidebar */}
      {goalsOpen && (
        <>
          <div
            onMouseDown={onRightMouseDown}
            className="w-[3px] flex-shrink-0 cursor-col-resize hover:bg-accent-green transition-colors bg-transparent"
          />
          <div
            style={{ width: rightSidebarWidth, minWidth: rightSidebarWidth }}
            className="flex-shrink-0 overflow-hidden"
          >
            <GoalsSidebar />
          </div>
        </>
      )}

      {/* Visual tree overlay */}
      {treeViewOpen && <VisualTreeView />}
    </div>
  )
}
