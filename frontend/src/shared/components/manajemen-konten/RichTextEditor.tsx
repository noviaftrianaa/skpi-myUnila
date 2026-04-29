"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiLink,
  FiImage,
  FiCode,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from "react-icons/fi";
import { MdFormatQuote, MdFormatListNumbered, MdHorizontalRule } from "react-icons/md";

/**
 * RichTextEditor — Tailwind-only WYSIWYG editor pakai contentEditable + document.execCommand.
 *
 * Trade-off: execCommand is deprecated tapi masih widely supported di semua browser
 * modern. Untuk myUnila Phase 1, ini cukup — Phase 2 bisa migrate ke Tiptap setelah
 * npm install + container rebuild.
 *
 * Output: HTML string. Stored di kolom `isi` (NVARCHAR(MAX)).
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Mulai menulis...",
  minHeight = 300,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value → editor (only if editor empty or value changed externally)
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = window.prompt("Masukkan URL:");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("URL gambar (banner.jpg, https://..., dll):");
    if (url) exec("insertImage", url);
  };

  const insertHr = () => {
    exec("insertHorizontalRule");
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({
    onClick,
    icon,
    title,
  }: {
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors"
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        isFocused ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Format */}
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            exec("formatBlock", e.target.value);
            e.target.value = "";
          }}
          className="text-xs font-medium px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer outline-none focus:border-blue-500"
        >
          <option value="">Format</option>
          <option value="P">Paragraf</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
          <option value="PRE">Kode Block</option>
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => exec("bold")} icon={<FiBold className="w-4 h-4" />} title="Bold (Ctrl+B)" />
        <ToolbarButton onClick={() => exec("italic")} icon={<FiItalic className="w-4 h-4" />} title="Italic (Ctrl+I)" />
        <ToolbarButton onClick={() => exec("underline")} icon={<FiUnderline className="w-4 h-4" />} title="Underline (Ctrl+U)" />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} icon={<FiList className="w-4 h-4" />} title="Bullet List" />
        <ToolbarButton
          onClick={() => exec("insertOrderedList")}
          icon={<MdFormatListNumbered className="w-4 h-4" />}
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => exec("formatBlock", "BLOCKQUOTE")}
          icon={<MdFormatQuote className="w-4 h-4" />}
          title="Quote"
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => exec("justifyLeft")} icon={<FiAlignLeft className="w-4 h-4" />} title="Align Left" />
        <ToolbarButton onClick={() => exec("justifyCenter")} icon={<FiAlignCenter className="w-4 h-4" />} title="Align Center" />
        <ToolbarButton onClick={() => exec("justifyRight")} icon={<FiAlignRight className="w-4 h-4" />} title="Align Right" />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={insertLink} icon={<FiLink className="w-4 h-4" />} title="Insert Link" />
        <ToolbarButton onClick={insertImage} icon={<FiImage className="w-4 h-4" />} title="Insert Image (URL)" />
        <ToolbarButton onClick={() => exec("formatBlock", "PRE")} icon={<FiCode className="w-4 h-4" />} title="Code Block" />
        <ToolbarButton onClick={insertHr} icon={<MdHorizontalRule className="w-4 h-4" />} title="Horizontal Rule" />
      </div>

      {/* Editable area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning
          className="px-4 py-3 outline-none prose prose-sm max-w-none text-gray-800 focus:outline-none"
          style={{ minHeight: `${minHeight}px` }}
        />
        {!value && !isFocused && (
          <div
            className="absolute top-3 left-4 text-gray-400 pointer-events-none select-none"
            style={{ minHeight: `${minHeight}px` }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
