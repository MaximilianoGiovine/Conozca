'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
    Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon,
    Undo, Redo
} from 'lucide-react'

interface Props {
    content: string
    onChange: (html: string) => void
    placeholder?: string
}

interface ToolbarBtnProps {
    onClick: () => void
    active: boolean
    children: React.ReactNode
    title: string
}

function ToolbarBtn({ onClick, active, children, title }: ToolbarBtnProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${active ? 'bg-gray-700 text-amber-400' : 'text-gray-400'}`}
        >
            {children}
        </button>
    )
}

export function AcademicEditor({ content, onChange, placeholder }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography,
            Link.configure({ openOnClick: false }),
            Image,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'academic-editor-content focus:outline-none min-h-[400px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-850">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-800 border-b border-gray-700">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-gray-700 mx-1" />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título H1">
                    <Heading1 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Subtítulo H2">
                    <Heading2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Subtítulo H3">
                    <Heading3 className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-gray-700 mx-1" />
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
                    <AlignRight className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
                    <AlignJustify className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-gray-700 mx-1" />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
                    <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">
                    <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <div className="w-px h-5 bg-gray-700 mx-1" />
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Deshacer">
                    <Undo className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Rehacer">
                    <Redo className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            {/* Editor Area */}
            <div className="p-6 bg-white text-gray-900 academic-editor-wrapper">
                {!editor.getText() && placeholder && (
                    <p className="absolute text-gray-400 pointer-events-none font-libre-baskerville">{placeholder}</p>
                )}
                <EditorContent editor={editor} />
            </div>

            {/* Academic editor styles */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700;900&display=swap');

        .academic-editor-wrapper .academic-editor-content {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 1rem;
          line-height: 1.8;
          color: #1a1a1a;
        }

        .academic-editor-wrapper .academic-editor-content h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          color: #111;
          border-bottom: 2px solid #d97706;
          padding-bottom: 0.5rem;
        }

        .academic-editor-wrapper .academic-editor-content h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #222;
        }

        .academic-editor-wrapper .academic-editor-content h3 {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 700;
          font-style: italic;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .academic-editor-wrapper .academic-editor-content p {
          margin-bottom: 1.5em;
          text-align: justify;
          text-indent: 2em;
        }

        .academic-editor-wrapper .academic-editor-content p:first-of-type,
        .academic-editor-wrapper .academic-editor-content h1 + p,
        .academic-editor-wrapper .academic-editor-content h2 + p,
        .academic-editor-wrapper .academic-editor-content h3 + p {
          text-indent: 0;
        }

        .academic-editor-wrapper .academic-editor-content blockquote {
          border-left: 3px solid #d97706;
          padding: 0.5rem 1rem;
          margin: 1.5rem 2rem;
          font-style: italic;
          color: #555;
          background: #fefce8;
        }

        .academic-editor-wrapper .academic-editor-content ul,
        .academic-editor-wrapper .academic-editor-content ol {
          padding-left: 2rem;
          margin-bottom: 1.5em;
        }

        .academic-editor-wrapper .academic-editor-content li {
          margin-bottom: 0.4em;
        }
      `}</style>
        </div>
    )
}
