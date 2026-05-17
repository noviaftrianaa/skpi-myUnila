"use client";

// Media Library — drag-drop upload, grid view, filter, multi-select bulk delete.
// Wired ke /me/blog/media — backend store di MinIO bucket blog-media.

import { Card, CardBody } from "@heroui/react";
import {
  FiCheck, FiCopy, FiDownload, FiFile, FiFileText, FiFilm, FiImage,
  FiLoader, FiMusic, FiSearch, FiTrash2, FiUpload, FiUploadCloud, FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { useState, useRef, useCallback, useMemo } from "react";
import {
  useMediaList, useUploadMedia, useDeleteMedia, mediaURL,
} from "@/lib/services/blog-platform";
import type { MediaItem, JenisMedia } from "@/lib/services/blog-platform";

type FilterTab = "all" | JenisMedia;

const TYPE_ICONS: Record<JenisMedia, typeof FiFile> = {
  image: FiImage, video: FiFilm, document: FiFileText, audio: FiMusic, other: FiFile,
};

const TYPE_COLORS: Record<JenisMedia, { bg: string; text: string }> = {
  image:    { bg: "bg-blue-50 dark:bg-blue-950/40",     text: "text-blue-600 dark:text-blue-400"     },
  video:    { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400" },
  document: { bg: "bg-amber-50 dark:bg-amber-950/40",   text: "text-amber-600 dark:text-amber-400"   },
  audio:    { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  other:    { bg: "bg-slate-50 dark:bg-slate-800",      text: "text-slate-600 dark:text-slate-400"   },
};

const PAGE_SIZE = 60;

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function MediaLibraryPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const jenisFilter = filter === "all" ? undefined : filter;
  const { data, isLoading, error } = useMediaList(jenisFilter, PAGE_SIZE, 0);
  const uploadMut = useUploadMedia();
  const deleteMut = useDeleteMedia();

  const items = data?.items ?? [];
  const totalSize = data?.usage?.total_bytes ?? 0;
  const totalCount = data?.usage?.total_count ?? 0;
  const quota = data?.quota_bytes ?? 0;
  const maxFile = data?.max_file_bytes ?? 0;

  const filtered = useMemo(
    () => items.filter((m) =>
      !search || m.nama_file.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search],
  );

  // Per-jenis counts within the current paginated batch (server-side total is
  // applied in jenisFilter so the "Semua" tab is what we render lifetime counts
  // against — for the tab badges we compute from the visible batch).
  const counts = useMemo(() => ({
    all: items.length,
    image: items.filter((i) => i.jenis_media === "image").length,
    video: items.filter((i) => i.jenis_media === "video").length,
    document: items.filter((i) => i.jenis_media === "document").length,
    audio: items.filter((i) => i.jenis_media === "audio").length,
    other: items.filter((i) => i.jenis_media === "other").length,
  }), [items]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const failures: string[] = [];
    for (const f of list) {
      try {
        await uploadMut.mutateAsync({ file: f });
      } catch (e) {
        const msg = (e as Error).message || "upload gagal";
        failures.push(`${f.name}: ${msg}`);
      }
    }
    if (failures.length > 0) setUploadErrors(failures);
    else setUploadErrors([]);
  }, [uploadMut]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onPick = () => inputRef.current?.click();
  const onPickChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    for (const id of ids) {
      try { await deleteMut.mutateAsync(id); } catch (e) { console.error(e); }
    }
    setSelected(new Set());
  };

  const deleteSingle = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      if (detailItem?.id_media === id) setDetailItem(null);
    } catch (e) {
      alert(`Gagal hapus: ${(e as Error).message}`);
    }
  };

  const copyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiImage className="w-6 h-6 text-myunila" /> Media Library
            {isLoading && <FiLoader className="w-4 h-4 text-myunila animate-spin" />}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola semua aset blog kamu — total <strong className="tabular-nums">{totalCount}</strong> file di MinIO.
          </p>
        </div>
        <button
          onClick={onPick}
          disabled={uploadMut.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow disabled:opacity-50"
        >
          {uploadMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiUpload className="w-4 h-4" />}
          Upload Media
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,application/pdf,.docx,.xlsx,.pptx,.txt,.csv"
        onChange={onPickChange}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {uploadErrors.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Beberapa upload gagal:</p>
            <ul className="space-y-0.5 text-amber-800 dark:text-amber-300 text-xs">
              {uploadErrors.map((e, i) => <li key={i}>• {e}</li>)}
            </ul>
            <button onClick={() => setUploadErrors([])} className="mt-2 text-[11px] text-amber-700 hover:underline">Tutup</button>
          </div>
        </div>
      )}

      {/* Storage quota */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage Quota</p>
              <p className="mt-0.5 text-sm">
                <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{formatBytes(totalSize)}</strong>
                <span className="text-slate-500"> / {formatBytes(quota)}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {quota > 0 ? ((totalSize / quota) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-myunila to-blue-500 rounded-full transition-all"
              style={{ width: quota > 0 ? `${Math.min(100, (totalSize / quota) * 100)}%` : "0%" }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Maks per file: {formatBytes(maxFile)}
          </p>
        </CardBody>
      </Card>

      {/* Dropzone */}
      <Card className={`shadow-sm border-2 border-dashed transition-all ${
        isDragging
          ? "border-myunila bg-myunila/5"
          : "border-slate-300 dark:border-slate-700 hover:border-myunila/50"
      }`}>
        <CardBody
          className="p-0"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <button
            onClick={onPick}
            disabled={uploadMut.isPending}
            className="w-full p-8 flex flex-col items-center text-slate-500 hover:text-myunila transition-colors disabled:opacity-50"
          >
            <FiUploadCloud className={`w-12 h-12 mb-3 ${isDragging ? "text-myunila scale-110" : ""} transition-all`} />
            <p className="font-semibold text-base">
              {uploadMut.isPending ? "Mengunggah…" : isDragging ? "Lepaskan untuk upload" : "Drop file di sini, atau klik untuk pilih"}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              Maks {formatBytes(maxFile || 25 * 1024 * 1024)} per file · Image / Video / Audio / Document
            </p>
          </button>
        </CardBody>
      </Card>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {[
            { k: "all" as const,      l: "Semua",   c: counts.all,      color: "slate"   },
            { k: "image" as const,    l: "Gambar",  c: counts.image,    color: "blue"    },
            { k: "video" as const,    l: "Video",   c: counts.video,    color: "purple"  },
            { k: "document" as const, l: "Dokumen", c: counts.document, color: "amber"   },
            { k: "audio" as const,    l: "Audio",   c: counts.audio,    color: "emerald" },
            { k: "other" as const,    l: "Lainnya", c: counts.other,    color: "slate"   },
          ].map((f) => {
            const isActive = filter === f.k;
            return (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-myunila text-myunila"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {f.l}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive ? "bg-myunila/10 text-myunila" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>{f.c}</span>
              </button>
            );
          })}
        </nav>
        <div className="relative w-full sm:w-72 mb-2 sm:mb-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama file…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 -mt-3">
        Menampilkan <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{filtered.length}</strong> file
        {search && <> · pencarian: &ldquo;<strong>{search}</strong>&rdquo;</>}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FiImage className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-500">
              {isLoading ? "Memuat media…" : "Belum ada media. Upload file pertamamu."}
            </p>
            <button
              onClick={onPick}
              disabled={uploadMut.isPending}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <FiUpload className="w-4 h-4" /> Upload File
            </button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((m) => {
            const Icon = TYPE_ICONS[m.jenis_media] || FiFile;
            const colors = TYPE_COLORS[m.jenis_media] || TYPE_COLORS.other;
            const isSelected = selected.has(m.id_media);
            return (
              <Card
                key={m.id_media}
                className={`group shadow-sm border transition-all cursor-pointer ${
                  isSelected
                    ? "border-myunila ring-2 ring-myunila/30 shadow-md"
                    : "border-slate-200/60 dark:border-slate-800 hover:shadow-md hover:border-myunila/30"
                }`}
              >
                <CardBody className="p-0">
                  <div
                    className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden"
                    onClick={() => setDetailItem(m)}
                  >
                    {m.jenis_media === "image" && m.url_publik ? (
                      // External MinIO URLs aren't whitelisted in next.config — use raw img.
                      // Thumbnail variant (~320w JPEG) is much smaller than the original.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaURL(m, "thumb")} alt={m.alt_text || m.nama_file} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${colors.bg} ${colors.text}`}>
                        <Icon className="w-12 h-12" />
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(m.id_media); }}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-myunila text-white"
                          : "bg-white/80 backdrop-blur-sm text-transparent hover:text-slate-400 opacity-0 group-hover:opacity-100"
                      }`}
                      title={isSelected ? "Deselect" : "Select"}
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(m.id_media, m.url_publik); }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white text-slate-900 hover:bg-slate-100 shadow-sm"
                        title="Copy URL"
                      >
                        {copiedId === m.id_media ? (
                          <><FiCheck className="w-3 h-3 text-emerald-500" /> Copied!</>
                        ) : (
                          <><FiCopy className="w-3 h-3" /> URL</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate" title={m.nama_file}>
                      {m.nama_file}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
                      <span>{formatBytes(m.ukuran_bytes)}</span>
                      <span className={`uppercase font-bold tracking-wider ${colors.text}`}>
                        {m.jenis_media}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating selection bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl">
          <span className="text-sm font-semibold tabular-nums">{selected.size} terpilih</span>
          <div className="w-px h-5 bg-white/20 dark:bg-slate-200" />
          <button
            onClick={() => setSelected(new Set())}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs hover:bg-white/10 dark:hover:bg-slate-100"
          >
            <FiX className="w-3.5 h-3.5" /> Batal
          </button>
          <button
            onClick={bulkDelete}
            disabled={deleteMut.isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50"
          >
            {deleteMut.isPending ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiTrash2 className="w-3.5 h-3.5" />}
            Hapus
          </button>
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailItem(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base truncate">{detailItem.nama_file}</h3>
              <button onClick={() => setDetailItem(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {detailItem.jenis_media === "image" && detailItem.url_publik ? (
                  // Detail preview uses medium variant — sharp enough at 800w, still snappy.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaURL(detailItem, "medium")} alt={detailItem.alt_text || detailItem.nama_file} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${TYPE_COLORS[detailItem.jenis_media].bg} ${TYPE_COLORS[detailItem.jenis_media].text}`}>
                    {(() => {
                      const Icon = TYPE_ICONS[detailItem.jenis_media] || FiFile;
                      return <Icon className="w-12 h-12" />;
                    })()}
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <DetailRow label="Tipe" value={detailItem.jenis_media} />
                <DetailRow label="MIME" value={detailItem.mime_type} />
                <DetailRow label="Ukuran" value={formatBytes(detailItem.ukuran_bytes)} />
                {detailItem.lebar_px && detailItem.tinggi_px && (
                  <DetailRow label="Dimensi" value={`${detailItem.lebar_px} × ${detailItem.tinggi_px} px`} />
                )}
                <DetailRow label="Tanggal upload" value={new Date(detailItem.created_at).toLocaleString("id-ID")} />
                <DetailRow label="URL" value={detailItem.url_publik.slice(0, 60) + (detailItem.url_publik.length > 60 ? "…" : "")} />
                {detailItem.alt_text && <DetailRow label="Alt text" value={detailItem.alt_text} />}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => copyUrl(detailItem.id_media, detailItem.url_publik)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {copiedId === detailItem.id_media ? <><FiCheck className="w-4 h-4 text-emerald-500" /> Copied!</> : <><FiCopy className="w-4 h-4" /> Copy URL</>}
              </button>
              <a
                href={detailItem.url_publik}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FiDownload className="w-4 h-4" /> Buka
              </a>
              <button
                onClick={() => deleteSingle(detailItem.id_media)}
                disabled={deleteMut.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {deleteMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-900 dark:text-slate-100 text-right break-all">{value}</span>
    </div>
  );
}
