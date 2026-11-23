'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, List, ListOrdered, Undo2, Redo2 } from 'lucide-react';
import { readRichText, writeRichText } from '@/lib/content/rich-text';

type Props = {
  value: string;
  onChangeAction: (value: string) => void;
  disabled?: boolean;
  label: string;
};

export function AdminRichText({ value, onChangeAction, disabled = false, label }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        code: false,
        italic: false,
        link: false,
        strike: false,
        underline: false,
        trailingNode: false,
      }),
    ],
    content: readRichText(value),
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'true',
        class:
          'min-h-40 max-h-120 overflow-y-auto px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none [&_p]:min-h-[1lh] [&_p+p]:mt-3 [&_strong]:font-semibold [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6 [&_li]:my-1 [&_li_p+p]:mt-1',
      },
    },
    onUpdate: ({ editor }) => onChangeAction(writeRichText(editor.getJSON())),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive('bold') ?? false,
      bullet: editor?.isActive('bulletList') ?? false,
      ordered: editor?.isActive('orderedList') ?? false,
      undo: editor?.can().undo() ?? false,
      redo: editor?.can().redo() ?? false,
    }),
  });

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);
  useEffect(() => {
    if (!editor) return;
    // Parent updates after typing must not reset the cursor or undo history.
    if (writeRichText(editor.getJSON()) !== value) {
      const content = readRichText(value);
      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [editor, value]);

  const buttons = [
    {
      label: 'Bold',
      icon: Bold,
      active: state?.bold,
      action: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: 'Bulleted list',
      icon: List,
      active: state?.bullet,
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Numbered list',
      icon: ListOrdered,
      active: state?.ordered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Undo',
      icon: Undo2,
      unavailable: !state?.undo,
      action: () => editor?.chain().focus().undo().run(),
    },
    {
      label: 'Redo',
      icon: Redo2,
      unavailable: !state?.redo,
      action: () => editor?.chain().focus().redo().run(),
    },
  ];

  return (
    <div
      className="rounded-sm border border-neutral-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      aria-busy={!editor}
    >
      <div
        role="group"
        aria-label={`${label} formatting`}
        className="flex flex-wrap gap-1 border-b border-neutral-200 p-1"
      >
        {buttons.map(({ label, icon: Icon, active, action, unavailable }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled || !editor || unavailable}
            onMouseDown={(event) => event.preventDefault()}
            onClick={action}
            className={`flex h-9 w-9 items-center justify-center rounded-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-35 ${active ? 'bg-blue-50 text-blue-700' : 'text-neutral-600'}`}
          >
            <Icon size={17} />
          </button>
        ))}
      </div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-40 px-3 py-2 text-sm text-neutral-500">Loading editor…</div>
      )}
    </div>
  );
}
