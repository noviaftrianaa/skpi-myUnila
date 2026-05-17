"use client";

// About Page — terpisah dari bio (max 500 char di profile).
// Markdown editable, dapat berisi long-form bio, CV summary, riwayat publikasi, dll.
// Module 6 MVP: "About page (Markdown editable, separate dari bio)"

import { useEffect, useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { FiAlertCircle, FiCheck, FiEdit3, FiEye, FiInfo, FiLoader, FiSave } from "react-icons/fi";
import { useMyBlog, useUpdateMyBlog } from "@/lib/services/blog-platform";

const PLACEHOLDER = `## Tentang Saya

Halo! Tulis tentang dirimu di sini — boleh panjang, pakai markdown.

### Latar Belakang
Ceritakan latar belakangmu, ketertarikan, hal yang sedang kamu pelajari.

### Aktivitas
- List proyek, pengalaman, atau apapun yang ingin kamu bagikan.

### Kontak
Email: ...
GitHub: [@username](https://github.com/...)
`;

export default function AboutPage() {
  const { data: blog, isLoading, error, refetch } = useMyBlog();
  const update = useUpdateMyBlog();

  const [konten, setKonten] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Hydrate dari blog.deskripsi
  useEffect(() => {
    if (!blog) return;
    setKonten(blog.deskripsi || "");
  }, [blog]);

  const charCount = konten.length;
  const wordCount = konten.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    try {
      await update.mutateAsync({ deskripsi: konten });
      setLastSaved(new Date());
      refetch();
    } catch (e) {
      alert(`Gagal simpan: ${(e as Error).message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" /> Memuat…
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-900 dark:text-rose-300">
          {(error as Error)?.message || "Belum punya blog. Claim subdomain dulu."}
        </p>
      </div>
    );
  }

  const saving = update.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-slate-500">
          Halaman panjang tentang kamu — dirender di <span className="font-mono text-myunila">/{`{subdomain}`}.blog.unila.ac.id/about</span>
        </p>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <FiCheck className="w-3 h-3 text-emerald-500" />
              Tersimpan {lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            size="sm"
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            startContent={!saving && <FiSave className="w-3.5 h-3.5" />}
            className="bg-gradient-to-r from-myunila to-myunila-700"
          >
            Simpan
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4">
        <div className="flex items-start gap-3">
          <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <p><strong>About page</strong> berbeda dari <strong>Bio</strong> di profile (max 500 char). Halaman ini full markdown — boleh long-form, dengan heading, list, link, gambar. Cocok untuk CV ringkas, riwayat publikasi, atau cerita yang lebih dalam.</p>
            <p className="mt-1">Editor markdown lengkap (toolbar + live preview) akan tersedia di Sprint 2.</p>
          </div>
        </div>
      </div>

      {/* Editor / Preview toggle */}
      <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/60">
        <button
          onClick={() => setMode("edit")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === "edit"
              ? "bg-white dark:bg-slate-900 text-myunila shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <FiEdit3 className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => setMode("preview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === "preview"
              ? "bg-white dark:bg-slate-900 text-myunila shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <FiEye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* Content area */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-0">
          {mode === "edit" ? (
            <textarea
              value={konten}
              onChange={e => setKonten(e.target.value)}
              placeholder={PLACEHOLDER}
              className="w-full min-h-[500px] p-6 font-mono text-sm leading-relaxed bg-transparent border-0 focus:outline-none resize-y text-slate-900 dark:text-slate-100"
            />
          ) : (
            <div className="p-6 prose prose-slate dark:prose-invert max-w-none min-h-[500px]">
              <MarkdownPreview content={konten} />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
        <div className="flex items-center gap-4">
          <span>{wordCount} kata</span>
          <span>·</span>
          <span>{charCount} karakter</span>
        </div>
        <span>Markdown supported · {`{subdomain}`}.blog.unila.ac.id/about</span>
      </div>
    </div>
  );
}

// Simple markdown renderer (placeholder — sprint 2: pakai react-markdown + remark-gfm)
function MarkdownPreview({ content }: { content: string }) {
  // Very basic: split lines and apply heading, bold, link patterns
  const lines = content.split("\n");
  return (
    <div className="space-y-3 text-slate-900 dark:text-slate-100">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-xl font-bold tracking-tight mt-6 mb-2">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-base font-bold mt-4 mb-1.5">{line.replace("### ", "")}</h3>;
        }
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4 list-disc">{renderInline(line.replace("- ", ""))}</li>;
        }
        return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // bold **text** + link [label](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const segments = text.split(regex);
  segments.forEach((s, i) => {
    if (s.startsWith("**") && s.endsWith("**")) {
      parts.push(<strong key={i}>{s.slice(2, -2)}</strong>);
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(s);
      if (linkMatch) {
        parts.push(<a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-myunila underline">{linkMatch[1]}</a>);
      } else if (s) {
        parts.push(<span key={i}>{s}</span>);
      }
    }
  });
  return parts;
}
