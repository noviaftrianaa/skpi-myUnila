"use client";

// Post Editor — edit post berdasarkan id_post.
// Sprint 2: TipTap rich editor + auto-save debounced + cover upload preview.
// Sprint 6: real API via useUpdatePost / usePublishPost / useDeletePost.

import Link from "next/link";
import Image from "next/image";
import { use, useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody, Input, Textarea, Button } from "@heroui/react";
import {
  FiArrowLeft, FiBarChart2, FiBookmark, FiCalendar, FiCheck, FiClock, FiEdit3,
  FiEye, FiImage, FiLock, FiRotateCcw, FiSave, FiTrash2, FiUpload, FiUsers, FiX,
} from "react-icons/fi";
import { TipTapEditor } from "../../../_components/TipTapEditor";
import { MediaPickerModal } from "../../../_components/MediaPickerModal";
import { CoAuthorSection } from "../../../_components/CoAuthorSection";
import {
  usePost, useUpdatePost, usePublishPost, useDeletePost, useKategoriList,
  usePostRevision, usePostRevisions, usePostAnalytics,
} from "@/lib/services/blog-platform";

const AUTOSAVE_DEBOUNCE_MS = 30_000; // 30 detik

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: existing, isLoading: loadingPost, error: postError } = usePost(id);
  const { data: kategoriList } = useKategoriList(true);
  const updateMut = useUpdatePost();
  const publishMut = usePublishPost();
  const deleteMut = useDeletePost();

  // Local form state — diisi dari API saat load
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [kategoriId, setKategoriId] = useState<string>("");
  const [status, setStatus] = useState<string>("draft");
  const [visibilitas, setVisibilitas] = useState<string>("public");
  const [konten, setKonten] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revViewing, setRevViewing] = useState<number | null>(null);
  const { data: revisions } = usePostRevisions(id, historyOpen);
  const { data: revDetail } = usePostRevision(id, revViewing);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const { data: analytics } = usePostAnalytics(id, 30, analyticsOpen);
  const [initialized, setInitialized] = useState(false);
  const pickerResolveRef = useRef<((url: string | null) => void) | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = updateMut.isPending;

  // Initialize form state dari API response
  useEffect(() => {
    if (existing && !initialized) {
      setJudul(existing.judul);
      setSlug(existing.slug);
      setRingkasan(existing.ringkasan ?? "");
      setKategoriId(existing.id_kategori_post ?? "");
      setStatus(existing.status);
      setVisibilitas(existing.visibilitas);
      setKonten(existing.konten_html ?? "");
      setCoverUrl(existing.cover_url ?? undefined);
      setTags((existing.tags ?? []).map((t) => t.nm_tag));
      setInitialized(true);
    }
  }, [existing, initialized]);

  // Image picker callback for TipTap toolbar
  const onPickImage = useCallback(() => {
    return new Promise<string | null>(resolve => {
      pickerResolveRef.current = resolve;
      setPickerOpen(true);
    });
  }, []);

  const closePicker = () => {
    setPickerOpen(false);
    if (pickerResolveRef.current) { pickerResolveRef.current(null); pickerResolveRef.current = null; }
  };

  const onPickerSelect = (url: string) => {
    setPickerOpen(false);
    if (pickerResolveRef.current) { pickerResolveRef.current(url); pickerResolveRef.current = null; }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 150));

  const buildPayload = useCallback(() => ({
    judul,
    slug,
    ringkasan: ringkasan || null,
    id_kategori_post: kategoriId || null,
    status: status as "draft" | "published" | "scheduled" | "archived" | "review" | "trash",
    visibilitas: visibilitas as "public" | "unlisted" | "private" | "password",
    konten_html: konten || null,
    cover_url: coverUrl || null,
    tags, // replace junction at every save
  }), [judul, slug, ringkasan, kategoriId, status, visibilitas, konten, coverUrl, tags]);

  const persist = useCallback(async (silent = false) => {
    if (silent) setAutoSaving(true);
    try {
      await updateMut.mutateAsync({ id, input: buildPayload() });
      setLastSaved(new Date());
      setDirty(false);
    } catch (e: unknown) {
      if (!silent) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan";
        window.alert(`Gagal: ${msg}\n\nKalau 401: login dulu di /login.`);
      }
    } finally {
      if (silent) setAutoSaving(false);
    }
  }, [id, updateMut, buildPayload]);

  const handleSave = () => persist(false);

  const handlePublish = async () => {
    try {
      // Save changes first kalau dirty, lalu publish
      if (dirty) await updateMut.mutateAsync({ id, input: buildPayload() });
      await publishMut.mutateAsync(id);
      setStatus("published");
      setLastSaved(new Date());
      setDirty(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal publish";
      window.alert(`Gagal publish: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Pindahkan post ini ke trash? Bisa di-restore dalam 30 hari.")) return;
    try {
      await deleteMut.mutateAsync(id);
      window.location.href = "/dashboard/blog-platform/posts";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal hapus";
      window.alert(`Gagal: ${msg}`);
    }
  };

  // Mark dirty on any field change → schedule auto-save 30s
  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => persist(true), AUTOSAVE_DEBOUNCE_MS);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, persist]);

  // Helper untuk wrap setter dengan dirty flag
  const wrap = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  // Editor update callback (HTML + JSON + word count)
  const onEditorUpdate = useCallback((html: string, _json: object, count: number) => {
    setKonten(html);
    setWordCount(count);
    setDirty(true);
  }, []);

  // Cover image local upload (FileReader → DataURL preview; backend upload nanti)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onCoverPick = () => fileInputRef.current?.click();
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverUrl(reader.result as string);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };
  const removeCover = () => { setCoverUrl(undefined); setDirty(true); };

  // Auto-generate ringkasan dari paragraph pertama HTML (kalau kosong)
  const autoExcerpt = (): string => {
    const text = konten.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 160);
  };

  if (loadingPost) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-sm text-slate-500 inline-flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-myunila border-t-transparent animate-spin" /> Memuat post…
        </p>
      </div>
    );
  }

  if (postError || !existing) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Post tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">Post dengan ID <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">{id}</code> tidak tersedia atau sudah dihapus.</p>
        {postError && (
          <p className="mt-1 text-xs text-rose-500">{(postError as Error).message}</p>
        )}
        <Link href="/dashboard/blog-platform/posts" className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white">
          <FiArrowLeft className="w-4 h-4" /> Kembali ke Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/dashboard/blog-platform/posts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-myunila transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali ke Posts
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {autoSaving ? (
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Auto-saving…
            </span>
          ) : dirty ? (
            <span className="text-xs text-amber-600 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Belum disimpan
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <FiCheck className="w-3 h-3 text-emerald-500" />
              Tersimpan {lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
          <Button
            size="sm"
            variant="bordered"
            startContent={<FiEye className="w-3.5 h-3.5" />}
            className="border-slate-200 dark:border-slate-700"
          >
            Preview
          </Button>
          <Button
            size="sm"
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            startContent={!saving && <FiSave className="w-3.5 h-3.5" />}
            className="bg-gradient-to-r from-myunila to-myunila-700"
          >
            {status === "published" ? "Update" : "Simpan Draft"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-6 space-y-4">
              {/* Hidden file input untuk cover upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCoverChange}
              />

              {/* Cover image */}
              <div className="relative h-48 sm:h-56 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 group">
                {coverUrl ? (
                  // Use <img> instead of next/image for data: URLs preview compatibility
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-1.5">
                    <FiImage className="w-12 h-12" />
                    <p className="text-xs text-slate-400">Belum ada cover</p>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={removeCover}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 backdrop-blur-sm shadow-sm transition-colors"
                      title="Hapus cover"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onCoverPick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm shadow-sm transition-colors"
                  >
                    <FiUpload className="w-3.5 h-3.5" /> {coverUrl ? "Ganti Cover" : "Upload Cover"}
                  </button>
                </div>
              </div>

              {/* Judul */}
              <Input
                value={judul}
                onValueChange={wrap(setJudul)}
                placeholder="Judul post kamu…"
                size="lg"
                variant="flat"
                classNames={{
                  input: "text-2xl sm:text-3xl font-bold tracking-tight",
                  inputWrapper: "border-none bg-transparent shadow-none px-0",
                }}
              />

              {/* Ringkasan */}
              <Textarea
                value={ringkasan}
                onValueChange={wrap(setRingkasan)}
                placeholder={`Ringkasan singkat (auto dari 160 karakter pertama kalau kosong)${konten ? ` — preview: "${autoExcerpt()}…"` : ""}`}
                minRows={2}
                maxRows={4}
                variant="flat"
                classNames={{
                  input: "text-base text-slate-600 dark:text-slate-400 italic",
                  inputWrapper: "border-none bg-transparent shadow-none px-0",
                }}
              />

              <hr className="border-slate-200/60 dark:border-slate-800" />

              {/* Konten — TipTap rich editor */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Konten
                </p>
                <TipTapEditor
                  initialContent={konten || `<p>${existing.ringkasan || ""}</p>`}
                  placeholder="Mulai tulis konten artikel…"
                  onUpdate={onEditorUpdate}
                  onPickImage={onPickImage}
                />
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 tabular-nums">
                  <span>{wordCount} kata</span>
                  <span>·</span>
                  <span>{readingTime} menit baca</span>
                  <span className="ml-auto text-[10px] text-slate-400">Auto-save tiap 30 detik bila ada perubahan</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar — meta panel */}
        <div className="space-y-4">
          {/* Status & visibilitas */}
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Publish</h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 inline-flex items-center gap-1.5">
                  <FiEdit3 className="w-3.5 h-3.5" /> Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { v: "draft", label: "Draft", icon: FiEdit3 },
                    { v: "review", label: "Review", icon: FiClock },
                    { v: "scheduled", label: "Scheduled", icon: FiCalendar },
                    { v: "published", label: "Published", icon: FiCheck },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => wrap(setStatus)(opt.v)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        status === opt.v
                          ? "border-myunila bg-myunila/10 text-myunila"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-myunila/40"
                      }`}
                    >
                      <opt.icon className="w-3 h-3" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 inline-flex items-center gap-1.5">
                  <FiLock className="w-3.5 h-3.5" /> Visibilitas
                </label>
                <select
                  value={visibilitas}
                  onChange={e => wrap(setVisibilitas)(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="public">🌐 Public (semua orang)</option>
                  <option value="unlisted">🔗 Unlisted (via link saja)</option>
                  <option value="private">🔒 Private (login required)</option>
                  <option value="password">🔑 Password protected</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Slug & Kategori */}
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Metadata</h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 inline-flex items-center gap-1.5">
                  <FiBookmark className="w-3.5 h-3.5" /> Slug URL
                </label>
                <Input
                  value={slug}
                  onValueChange={wrap(setSlug)}
                  placeholder="auto-generate-dari-judul"
                  size="sm"
                  variant="bordered"
                  classNames={{ input: "text-xs font-mono", inputWrapper: "border-slate-200 dark:border-slate-700" }}
                />
                <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">
                  /post/{slug || "your-slug"}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
                <select
                  value={kategoriId}
                  onChange={e => wrap(setKategoriId)(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">— Pilih kategori —</option>
                  {(kategoriList ?? []).map(k => (
                    <option key={k.id_kategori_post} value={k.id_kategori_post}>{k.nm_kategori}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-myunila/10 text-myunila text-[11px] font-medium">
                      #{t}
                      <button type="button" onClick={() => { setTags(tags.filter((x) => x !== t)); setDirty(true); }} className="hover:text-rose-500">
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                      e.preventDefault();
                      const t = tagInput.trim().replace(/^#/, "");
                      if (!tags.includes(t)) {
                        setTags([...tags, t]);
                        setDirty(true);
                      }
                      setTagInput("");
                    }
                  }}
                  placeholder="Tambah tag, Enter untuk simpan"
                  className="w-full px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </CardBody>
          </Card>

          {/* Revision History trigger */}
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-5 space-y-3">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center justify-between w-full text-sm text-slate-700 dark:text-slate-300 hover:text-myunila"
              >
                <span className="inline-flex items-center gap-2">
                  <FiClock className="w-3.5 h-3.5" /> Riwayat Edit
                </span>
                <span className="text-xs text-slate-400">Lihat →</span>
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsOpen(true)}
                className="flex items-center justify-between w-full text-sm text-slate-700 dark:text-slate-300 hover:text-myunila"
              >
                <span className="inline-flex items-center gap-2">
                  <FiBarChart2 className="w-3.5 h-3.5" /> Analytics Post
                </span>
                <span className="text-xs text-slate-400">Lihat →</span>
              </button>
            </CardBody>
          </Card>

          {/* Co-author section — credit multi-author contributors */}
          <CoAuthorSection idPost={id} />

          {/* Publish button (only when status is draft/review/scheduled) */}
          {status !== "published" && status !== "trash" && (
            <Card className="shadow-sm border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardBody className="p-5">
                <button
                  onClick={handlePublish}
                  disabled={publishMut.isPending}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <FiCheck className="w-4 h-4" /> {publishMut.isPending ? "Publishing…" : "Publish Now"}
                </button>
                <p className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 text-center">
                  Akan diset status=published & tgl_terbit otomatis.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Danger zone */}
          {status !== "trash" && (
            <Card className="shadow-sm border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
              <CardBody className="p-5">
                <button
                  onClick={handleDelete}
                  disabled={deleteMut.isPending}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 disabled:opacity-50 transition-colors"
                >
                  <FiTrash2 className="w-3.5 h-3.5" /> {deleteMut.isPending ? "Memindahkan…" : "Pindahkan ke Trash"}
                </button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Media Picker Modal — untuk insert image dari editor toolbar */}
      <MediaPickerModal open={pickerOpen} onClose={closePicker} onSelect={onPickerSelect} />

      {/* Per-Post Analytics Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setAnalyticsOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg inline-flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5 text-myunila" /> Analytics Post (30 hari terakhir)
              </h3>
              <button onClick={() => setAnalyticsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {!analytics && (
                <p className="text-sm text-slate-400 text-center py-12">Memuat analytics…</p>
              )}
              {analytics && (
                <>
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="flex items-center justify-between">
                        <FiEye className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] text-slate-400">all-time</span>
                      </div>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {analytics.total_views.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Total Views</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="flex items-center justify-between">
                        <FiUsers className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] text-slate-400">30d</span>
                      </div>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {analytics.unique_views.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Unique IPs</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="flex items-center justify-between">
                        <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] text-slate-400">30d</span>
                      </div>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {analytics.authed_views.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Logged-in</p>
                    </div>
                  </div>

                  {/* Daily bar chart */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Views per hari ({analytics.window_days}d)</p>
                    {(() => {
                      const max = Math.max(...analytics.daily.map((d) => d.views), 1);
                      return (
                        <div className="flex items-end gap-0.5 h-32 border-b border-slate-200 dark:border-slate-700">
                          {analytics.daily.map((d) => {
                            const h = Math.max(2, (d.views / max) * 100);
                            return (
                              <div key={d.date} className="flex-1 min-w-0 relative group" title={`${d.date}: ${d.views} views`}>
                                <div
                                  className={`w-full rounded-t transition-colors ${
                                    d.views > 0 ? "bg-myunila hover:bg-myunila-700" : "bg-slate-100 dark:bg-slate-800"
                                  }`}
                                  style={{ height: `${h}%` }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{analytics.daily[0]?.date.slice(5) || "-"}</span>
                      <span>{analytics.daily[analytics.daily.length - 1]?.date.slice(5) || "-"}</span>
                    </div>
                  </div>

                  {/* Referrers */}
                  {analytics.referrers.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Top Referrers (30d)</p>
                      <ul className="space-y-1.5">
                        {analytics.referrers.map((r) => {
                          const maxRef = Math.max(...analytics.referrers.map((x) => x.views), 1);
                          const pct = (r.views / maxRef) * 100;
                          return (
                            <li key={r.host} className="relative">
                              <div className="flex items-center justify-between text-xs gap-2 px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 bg-myunila/10 dark:bg-myunila/20" style={{ width: `${pct}%` }} />
                                <span className="font-mono text-slate-700 dark:text-slate-300 truncate relative">{r.host}</span>
                                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100 relative">{r.views}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setHistoryOpen(false); setRevViewing(null); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg inline-flex items-center gap-2">
                <FiClock className="w-5 h-5 text-myunila" /> Riwayat Edit Post
              </h3>
              <button onClick={() => { setHistoryOpen(false); setRevViewing(null); }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex">
              {/* Left: revision list */}
              <div className="w-64 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                {(revisions ?? []).length === 0 && (
                  <div className="p-5 text-xs text-slate-400 text-center">
                    Belum ada snapshot. Edit + save untuk capture revisi pertama.
                  </div>
                )}
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(revisions ?? []).map((r) => (
                    <li key={r.id_post_revision}>
                      <button
                        onClick={() => setRevViewing(r.nomor_revisi)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          revViewing === r.nomor_revisi ? "bg-myunila/5 border-l-2 border-myunila" : ""
                        }`}
                      >
                        <p className="text-xs font-mono text-slate-400">rev #{r.nomor_revisi}</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                          {r.judul_snapshot}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(r.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: detail view */}
              <div className="flex-1 overflow-y-auto p-5">
                {revViewing === null && (
                  <div className="text-sm text-slate-400 text-center py-12">
                    <FiRotateCcw className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    Pilih revisi di kiri untuk lihat snapshot konten saat itu.
                  </div>
                )}
                {revViewing !== null && revDetail && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rev #{revDetail.nomor_revisi}</p>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">{revDetail.judul_snapshot}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(revDetail.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {revDetail.ringkasan_snapshot && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ringkasan</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{revDetail.ringkasan_snapshot}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Konten HTML</p>
                      {revDetail.konten_html_snapshot ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-900/50"
                          dangerouslySetInnerHTML={{ __html: revDetail.konten_html_snapshot }} />
                      ) : (
                        <p className="text-xs text-slate-400 italic">(kosong di revisi ini)</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
