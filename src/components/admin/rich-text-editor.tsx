"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List } from "lucide-react";

interface Props {
  initialContent: string;
  onChange: (html: string) => void;
}

// Loaded via next/dynamic with `ssr: false` so tiptap/ProseMirror stay out of
// the server (Worker) bundle — they're only needed client-side.
export function RichTextEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-border bg-muted/50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-background ${editor?.isActive("bold") ? "bg-background shadow-sm" : ""}`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-background ${editor?.isActive("italic") ? "bg-background shadow-sm" : ""}`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-background ${editor?.isActive("bulletList") ? "bg-background shadow-sm" : ""}`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[120px] p-3 text-sm prose prose-sm max-w-none focus-within:outline-none"
      />
    </div>
  );
}
