"use client";

// TipTap Editor — rich text editor untuk Blog Platform.
// Bundled dengan toolbar dan extensions: StarterKit + Link + Image + Placeholder.
// Output: HTML string (untuk konten_html) + JSON (untuk konten_json re-edit).

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  FiBold, FiItalic, FiUnderline, FiCode, FiLink, FiImage, FiList,
  FiAlignLeft, FiHash, FiCornerDownLeft, FiRotateCcw, FiRotateCw,
  FiMinus,
} from "react-icons/fi";

export interface TipTapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onUpdate?: (html: string, json: object, wordCount: number) => void;
  className?: string;
  /** Custom image picker callback. Kalau diset, image button akan trigger ini
   *  (sebagai pengganti window.prompt URL). Callback harus return Promise<string|null>
   *  yang resolve dengan URL gambar atau null kalau cancel. */
  onPickImage?: () => Promise<string | null>;
}

export function TipTapEditor({
  initialContent = "",
  placeholder = "Mulai tulis…",
  onUpdate,
  className = "",
  onPickImage,
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR compatibility
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-sm overflow-x-auto" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-myunila pl-4 italic text-slate-700 dark:text-slate-300" } },
        bulletList: { HTMLAttributes: { class: "list-disc ml-5 space-y-1" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-5 space-y-1" } },
        horizontalRule: { HTMLAttributes: { class: "my-6 border-t-2 border-slate-200 dark:border-slate-800" } },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-myunila underline hover:text-myunila-700" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-4" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-slate dark:prose-invert max-w-none min-h-[400px] focus:outline-none px-1",
      },
    },
    onUpdate: ({ editor }) => {
      if (!onUpdate) return;
      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      onUpdate(html, json, wordCount);
    },
  });

  // Sync initial content perubahan (e.g. saat load data dari API)
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() === "<p></p>") {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className={`min-h-[400px] rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-400 ${className}`}>
        Memuat editor…
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      <EditorToolbar editor={editor} onPickImage={onPickImage} />
      <div className="px-4 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ============================== Toolbar ==============================

function EditorToolbar({ editor, onPickImage }: { editor: Editor; onPickImage?: () => Promise<string | null> }) {
  const Button = ({
    onClick, active = false, disabled = false, title, children,
  }: {
    onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
        active
          ? "bg-myunila/10 text-myunila"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur">
      {/* Headings */}
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <span className="font-bold text-xs">H1</span>
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <span className="font-bold text-xs">H2</span>
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <span className="font-bold text-xs">H3</span>
      </Button>
      <Button
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive("paragraph")}
        title="Paragraf"
      >
        <FiAlignLeft className="w-4 h-4" />
      </Button>

      <Divider />

      {/* Marks */}
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <FiBold className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <FiItalic className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strike-through"
      >
        <FiUnderline className="w-4 h-4 line-through" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <FiCode className="w-4 h-4" />
      </Button>

      <Divider />

      {/* Lists */}
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <FiList className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <span className="font-bold text-[10px]">1.</span>
      </Button>

      <Divider />

      {/* Block elements */}
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <span className="text-base leading-none">&ldquo;</span>
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <FiHash className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <FiMinus className="w-4 h-4" />
      </Button>

      <Divider />

      {/* Link */}
      <Button
        onClick={() => {
          const previous = editor.getAttributes("link").href;
          const url = window.prompt("URL link:", previous || "https://");
          if (url === null) return; // cancel
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <FiLink className="w-4 h-4" />
      </Button>

      {/* Image — pakai media picker kalau tersedia, fallback ke URL prompt */}
      <Button
        onClick={async () => {
          if (onPickImage) {
            const url = await onPickImage();
            if (url) editor.chain().focus().setImage({ src: url }).run();
          } else {
            const url = window.prompt("URL gambar:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title={onPickImage ? "Insert image dari Media Library" : "Insert image (URL)"}
      >
        <FiImage className="w-4 h-4" />
      </Button>

      <Divider />

      {/* Hard break */}
      <Button
        onClick={() => editor.chain().focus().setHardBreak().run()}
        title="Line break"
      >
        <FiCornerDownLeft className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <FiRotateCcw className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <FiRotateCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
