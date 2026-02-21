import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Link2, Image,
  Film, Undo, Redo,
} from 'lucide-react'
import { useRef } from 'react'

interface Props {
  editor: Editor | null
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-sm ${
        active
          ? 'bg-surface-3 text-text-primary'
          : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5" />
}

export function EditorToolbar({ editor }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ''
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    editor.chain().focus().setVideo({ src: url }).run()
    e.target.value = ''
  }

  const handleLink = () => {
    const url = window.prompt('Enter URL:')
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-surface-1 flex-wrap">
      {/* History */}
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo size={13} />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo size={13} />
      </ToolbarButton>

      <Sep />

      {/* Headings */}
      <ToolbarButton
        title="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={13} />
      </ToolbarButton>

      <Sep />

      {/* Inline */}
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code size={12} />
      </ToolbarButton>

      <Sep />

      {/* Lists */}
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Task list"
        active={editor.isActive('taskList')}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare size={13} />
      </ToolbarButton>

      <Sep />

      {/* Blocks */}
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={13} />
      </ToolbarButton>

      <Sep />

      {/* Media */}
      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={handleLink}>
        <Link2 size={13} />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={() => imageInputRef.current?.click()}>
        <Image size={13} />
      </ToolbarButton>
      <ToolbarButton title="Insert video" onClick={() => videoInputRef.current?.click()}>
        <Film size={13} />
      </ToolbarButton>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoUpload}
      />
    </div>
  )
}
