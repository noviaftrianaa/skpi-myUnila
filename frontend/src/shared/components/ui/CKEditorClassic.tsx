"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

/**
 * CKEditor 5 (Classic build) wrapper — client-only via dynamic import.
 * Next.js SSR akan error karena CKEditor mengakses `window`/`document` saat init,
 * jadi komponen dimuat hanya di client.
 *
 * Toolbar standar: Heading, Bold, Italic, Underline, Link, List, Color, Align.
 */

interface CKEditorClassicProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const CKEditorInner = dynamic(
  async () => {
    const [{ CKEditor }, ClassicEditorModule] = await Promise.all([
      import("@ckeditor/ckeditor5-react"),
      import("@ckeditor/ckeditor5-build-classic"),
    ]);
    const ClassicEditor = (ClassicEditorModule as unknown as { default: unknown }).default ?? ClassicEditorModule;

    const Inner = ({ value, onChange, minHeight }: CKEditorClassicProps) => {
      const editorRef = useRef<unknown>(null);

      useEffect(() => {
        const editor = editorRef.current as { editing?: { view?: { change: (cb: (writer: { setStyle: (key: string, value: string, root: unknown) => void }) => void) => void; document?: { getRoot: (name: string) => unknown } } } } | null;
        if (editor?.editing?.view?.document?.getRoot) {
          editor.editing.view.change((writer) => {
            const root = editor.editing!.view!.document!.getRoot("main");
            if (root) writer.setStyle("min-height", `${minHeight ?? 240}px`, root);
          });
        }
      }, [minHeight]);

      return (
        <CKEditor
          editor={ClassicEditor as never}
          data={value}
          config={{
            toolbar: {
              items: [
                "heading", "|",
                "bold", "italic", "|",
                "link", "bulletedList", "numberedList", "|",
                "blockQuote", "insertTable", "|",
                "outdent", "indent", "|",
                "undo", "redo",
              ],
              shouldNotGroupWhenFull: true,
            },
            language: "id",
          }}
          onReady={(editor) => { editorRef.current = editor; }}
          onChange={(_evt, editor) => onChange(editor.getData())}
        />
      );
    };
    Inner.displayName = "CKEditorInner";
    return Inner;
  },
  { ssr: false, loading: () => <div className="border border-gray-300 rounded-lg p-3 text-xs text-gray-400 bg-gray-50">Memuat editor...</div> }
);

export default function CKEditorClassic(props: CKEditorClassicProps) {
  return (
    <div className="ck-editor-wrapper">
      <CKEditorInner {...props} />
    </div>
  );
}
