'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  dir = 'ltr',
  className = '',
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-tactical-red hover:text-tactical-amber underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[200px] ${dir === 'rtl' ? 'text-right' : 'text-left'}`,
        dir,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`bg-midnight-700 rounded-xl border border-midnight-600 overflow-hidden ${className}`}>
      <EditorToolbar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
