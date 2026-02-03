'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Unlink,
  FolderOpen,
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const insertImageFromPicker = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-colors
        ${isActive
          ? 'bg-tactical-red/20 text-tactical-red'
          : 'text-slate-medium hover:text-slate-light hover:bg-midnight-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-midnight-600 mx-1" />
  );

  return (
    <div className="border-b border-midnight-600 p-2 bg-midnight-800/50">
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                removeLink();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            isActive={editor.isActive('link')}
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            {editor.isActive('link') ? (
              <Unlink className="h-4 w-4" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
          </ToolbarButton>

          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-midnight-800 border border-midnight-600 rounded-lg shadow-lg z-10 flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-midnight-700 border border-midnight-500 rounded px-2 py-1 text-sm text-slate-light
                         placeholder:text-slate-dark focus:border-tactical-red focus:outline-none w-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <button
                onClick={addLink}
                className="px-2 py-1 bg-tactical-red text-white text-sm rounded hover:bg-tactical-red-hover"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Image - URL input */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowImageInput(!showImageInput)}
            title="Add Image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>

          {showImageInput && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-midnight-800 border border-midnight-600 rounded-lg shadow-lg z-10 flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="bg-midnight-700 border border-midnight-500 rounded px-2 py-1 text-sm text-slate-light
                         placeholder:text-slate-dark focus:border-tactical-red focus:outline-none w-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <button
                onClick={addImage}
                className="px-2 py-1 bg-tactical-red text-white text-sm rounded hover:bg-tactical-red-hover"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Image - Media Library */}
        <ToolbarButton
          onClick={() => setShowMediaPicker(true)}
          title="Browse Media Library"
        >
          <FolderOpen className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Click outside to close popups */}
      {(showLinkInput || showImageInput) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowLinkInput(false);
            setShowImageInput(false);
          }}
        />
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={insertImageFromPicker}
      />
    </div>
  );
}
