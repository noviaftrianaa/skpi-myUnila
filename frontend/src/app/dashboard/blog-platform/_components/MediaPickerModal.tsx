"use client";

// Media Picker Modal — pilih gambar dari Media Library untuk insert ke editor.
// Atau upload langsung via dropzone. Returns selected media URL via onSelect callback.
// Wired ke /me/blog/media (jenis=image).

import { useState, useRef, useMemo } from "react";
import { FiCheck, FiImage, FiLoader, FiSearch, FiUploadCloud, FiX } from "react-icons/fi";
import { useMediaList, useUploadMedia, mediaURL } from "@/lib/services/blog-platform";

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt?: string) => void;
}

const PAGE_SIZE = 60;

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMediaList("image", PAGE_SIZE, 0);
  const uploadMut = useUploadMedia();
  const items = data?.items ?? [];

  const images = useMemo(
    () => items.filter((m) => !search || m.nama_file.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  if (!open) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const f of list) {
      try {
        const m = await uploadMut.mutateAsync({ file: f });
        setSelectedId(m.id_media);
      } catch (e) {
        alert(`Upload gagal (${f.name}): ${(e as Error).message}`);
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const confirmSelect = () => {
    if (!selectedId) return;
    const item = items.find((m) => m.id_media === selectedId);
    if (item) {
      // Editor inserts get medium variant by default — sharp enough for body
      // content, ~5–10x smaller than the original PNG.
      onSelect(mediaURL(item, "medium"), item.alt_text || item.nama_file);
      onClose();
      setSelectedId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
              <FiImage className="w-4 h-4 text-myunila" /> Pilih Gambar
              {isLoading && <FiLoader className="w-3.5 h-3.5 animate-spin text-myunila" />}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pilih dari library atau upload baru ke MinIO</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama file…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploadMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50"
          >
            {uploadMut.isPending ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiUploadCloud className="w-3.5 h-3.5" />}
            Upload Baru
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-5 transition-colors ${isDragging ? "bg-myunila/5" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          {isDragging && (
            <div className="border-2 border-dashed border-myunila rounded-lg p-6 text-center text-myunila mb-4">
              <FiUploadCloud className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm font-semibold">Lepaskan untuk upload</p>
            </div>
          )}

          {images.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <FiImage className="w-8 h-8" />
              </div>
              <p className="text-sm text-slate-500">
                {isLoading ? "Memuat…" : search ? "Tidak ada hasil pencarian." : "Belum ada gambar."}
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-3 text-sm text-myunila font-medium hover:underline"
              >
                Upload gambar pertama →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((m) => {
                const isSelected = selectedId === m.id_media;
                return (
                  <button
                    key={m.id_media}
                    onClick={() => setSelectedId(m.id_media)}
                    onDoubleClick={() => { setSelectedId(m.id_media); setTimeout(confirmSelect, 50); }}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-myunila ring-2 ring-myunila/30 shadow-md"
                        : "border-slate-200 dark:border-slate-700 hover:border-myunila/50"
                    }`}
                  >
                    {/* External MinIO URL — bypass next/image whitelisting. */}
                    {/* Thumbnail variant for grid; original gets loaded on confirm. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaURL(m, "thumb")} alt={m.alt_text || m.nama_file} className="w-full h-full object-cover" loading="lazy" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-myunila text-white flex items-center justify-center shadow">
                        <FiCheck className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate font-semibold">{m.nama_file}</p>
                      <p className="text-white/70 tabular-nums">{formatBytes(m.ukuran_bytes)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            {selectedId ? "1 gambar dipilih · double-click untuk insert" : "Pilih satu gambar untuk insert"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              onClick={confirmSelect}
              disabled={!selectedId}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow inline-flex items-center gap-1.5"
            >
              <FiCheck className="w-4 h-4" /> Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
