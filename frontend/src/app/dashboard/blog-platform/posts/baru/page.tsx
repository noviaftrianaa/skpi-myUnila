"use client";

// New Post Page — full-screen editor untuk tulis post baru.
// Sprint 2: TipTap integration + auto-save + slug auto-generate + tag picker.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiCheckCircle, FiEye, FiImage, FiSave, FiSend, FiUpload, FiX,
} from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";
import { TipTapEditor } from "../../_components/TipTapEditor";
import { MediaPickerModal } from "../../_components/MediaPickerModal";
import { useCreatePost, usePublishPost, useUpdatePost, useKategoriList } from "@/lib/services/blog-platform";
import { useRouter } from "next/navigation";

const AUTOSAVE_DEBOUNCE_MS = 30_000;

export default function NewPostPage() {
  const router = useRouter();
  const createMut = useCreatePost();
  const updateMut = useUpdatePost();
  const publishMut = usePublishPost();
  const { data: kategoriList } = useKategoriList(true);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [konten, setKonten] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("draft");
  const [visibilitas, setVisibilitas] = useState("public");
  const [bahasa, setBahasa] = useState<"id" | "en">("id"); // Phase BD
  const [tglPublish, setTglPublish] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");

  // Track created post id setelah first save (untuk auto-save berikutnya pakai update endpoint)
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const [dirty, setDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerResolveRef = useRef<((url: string | null) => void) | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image picker callback for TipTap toolbar — returns Promise<string|null>
  const onPickImage = useCallback(() => {
    return new Promise<string | null>(resolve => {
      pickerResolveRef.current = resolve;
      setPickerOpen(true);
    });
  }, []);

  const closePicker = () => {
    setPickerOpen(false);
    if (pickerResolveRef.current) {
      pickerResolveRef.current(null);
      pickerResolveRef.current = null;
    }
  };

  const onPickerSelect = (url: string) => {
    setPickerOpen(false);
    if (pickerResolveRef.current) {
      pickerResolveRef.current(url);
      pickerResolveRef.current = null;
    }
  };

  // Slug auto-generate dari judul (sampai user manual edit slug)
  const slugFromJudul = (judul || "")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

  useEffect(() => {
    if (!slugManual) setSlug(slugFromJudul);
  }, [slugFromJudul, slugManual]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 150));

  const buildCreatePayload = useCallback(() => ({
    judul: judul || "(Tanpa judul)",
    slug: slug || undefined,
    ringkasan: excerpt || undefined,
    id_kategori_post: kategoriId || undefined,
    konten_html: konten || undefined,
    cover_url: coverUrl || undefined,
    visibilitas: visibilitas as "public" | "unlisted" | "private" | "password",
    bahasa,
    tags: tags.length > 0 ? tags : undefined,
  }), [judul, slug, excerpt, kategoriId, konten, coverUrl, visibilitas, bahasa, tags]);

  const buildUpdatePayload = useCallback(() => ({
    judul,
    slug: slug || undefined,
    ringkasan: excerpt || null,
    id_kategori_post: kategoriId || null,
    konten_html: konten || null,
    cover_url: coverUrl || null,
    status: status as "draft" | "review" | "published" | "scheduled" | "archived" | "trash",
    visibilitas: visibilitas as "public" | "unlisted" | "private" | "password",
    bahasa,
    tags, // replace junction at every save
  }), [judul, slug, excerpt, kategoriId, konten, coverUrl, status, visibilitas, bahasa, tags]);

  const persist = useCallback(async (silent = false): Promise<string | null> => {
    if (!judul.trim()) {
      if (!silent) window.alert("Isi judul dulu sebelum simpan.");
      return null;
    }
    if (silent) setAutoSaving(true);
    try {
      let postId = createdPostId;
      if (!postId) {
        // First save → create
        const created = await createMut.mutateAsync(buildCreatePayload());
        postId = created.id_post;
        setCreatedPostId(postId);
      } else {
        // Subsequent saves → update
        await updateMut.mutateAsync({ id: postId, input: buildUpdatePayload() });
      }
      setLastSaved(new Date());
      setDirty(false);
      return postId;
    } catch (e: unknown) {
      if (!silent) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan";
        window.alert(`Gagal: ${msg}\n\nKalau 401: login dulu di /login.`);
      }
      return null;
    } finally {
      if (silent) setAutoSaving(false);
    }
  }, [judul, createdPostId, createMut, updateMut, buildCreatePayload, buildUpdatePayload]);

  const handlePublish = async () => {
    const postId = await persist(false);
    if (!postId) return;
    try {
      await publishMut.mutateAsync(postId);
      // Redirect ke edit page (publish berhasil)
      router.push(`/dashboard/blog-platform/posts/${postId}/edit`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal publish";
      window.alert(`Gagal publish: ${msg}`);
    }
  };

  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => persist(true), AUTOSAVE_DEBOUNCE_MS);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, persist]);

  // Wrap setter dengan dirty flag
  const wrap = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  const onEditorUpdate = useCallback((html: string, _json: object, count: number) => {
    setKonten(html);
    setWordCount(count);
    setDirty(true);
    // Auto-update excerpt kalau user belum manual edit
    if (!excerpt) {
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      // Don't overwrite manual excerpt; only auto-fill kalau kosong
    }
  }, [excerpt]);

  // Cover upload (DataURL preview, real upload nanti)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onCoverPick = () => fileInputRef.current?.click();
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCoverUrl(reader.result as string); setDirty(true); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 -my-6 lg:-my-8 bg-slate-50 dark:bg-slate-950">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/blog-platform/posts" className="text-slate-500 hover:text-myunila transition-colors" title="Tutup">
              <FiX className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs text-slate-500">Tulis Post Baru</p>
              <p className="text-sm font-medium inline-flex items-center gap-1.5">
                {autoSaving ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> <span className="text-slate-500">Auto-saving…</span></>
                ) : dirty ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> <span className="text-amber-600">Belum disimpan</span></>
                ) : lastSaved ? (
                  <><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-600 dark:text-slate-300">Tersimpan {lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></>
                ) : (
                  <span className="text-slate-400">Belum disimpan</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5">
              <FiEye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => persist(false)}
              disabled={createMut.isPending || updateMut.isPending}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <FiSave className="w-4 h-4" /> {createdPostId ? "Update Draft" : "Simpan Draft"}
            </button>
            <button
              onClick={handlePublish}
              disabled={createMut.isPending || updateMut.isPending || publishMut.isPending}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-myunila to-myunila-700 text-white text-sm font-semibold hover:shadow-md disabled:opacity-50 inline-flex items-center gap-1.5 transition-shadow"
            >
              <FiSend className="w-4 h-4" /> {publishMut.isPending ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
            <CardBody className="p-0">
              {/* Title */}
              <input
                type="text"
                value={judul}
                onChange={(e) => wrap(setJudul)(e.target.value)}
                placeholder="Judul post di sini…"
                className="w-full px-6 pt-6 pb-2 text-3xl font-bold bg-transparent focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 tracking-tight"
              />

              {/* Slug */}
              <div className="px-6 pb-4 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-mono text-xs">/{slug || "(slug-otomatis)"}</span>
                {!slugManual && slugFromJudul && (
                  <button onClick={() => setSlugManual(true)} className="text-[10px] text-myunila hover:underline">
                    Edit slug
                  </button>
                )}
                {slugManual && (
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => wrap(setSlug)(e.target.value)}
                    className="text-xs font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-1 max-w-xs"
                  />
                )}
              </div>

              {/* TipTap editor */}
              <div className="px-3 pb-3">
                <TipTapEditor
                  initialContent=""
                  placeholder="Mulai tulis isi artikel di sini…"
                  onUpdate={onEditorUpdate}
                  onPickImage={onPickImage}
                  className="border-0 shadow-none"
                />
              </div>

              {/* Bottom bar */}
              <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-500 tabular-nums">
                <span>{wordCount} kata · {readingTime} menit baca</span>
                <span>Auto-save tiap 30 detik bila ada perubahan</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar settings */}
        <aside className="lg:col-span-1 space-y-4">
          <Section title="Status & Publish">
            <Field label="Status">
              <select
                value={status}
                onChange={e => wrap(setStatus)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Visibilitas">
              <select
                value={visibilitas}
                onChange={e => wrap(setVisibilitas)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="public">🌐 Public</option>
                <option value="unlisted">🔗 Unlisted</option>
                <option value="private">🔒 Private (login-only)</option>
                <option value="password">🔑 Password protected</option>
              </select>
            </Field>
            <Field label="Bahasa">
              <select
                value={bahasa}
                onChange={e => wrap(setBahasa)(e.target.value as "id" | "en")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="id">🇮🇩 Bahasa Indonesia</option>
                <option value="en">🇬🇧 English</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Link ke versi bahasa lain bisa diatur di halaman edit setelah post dibuat.
              </p>
            </Field>
            {status === "scheduled" && (
              <Field label="Tgl Publish">
                <input
                  type="datetime-local"
                  value={tglPublish}
                  onChange={e => wrap(setTglPublish)(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                />
              </Field>
            )}
          </Section>

          <Section title="Kategori & Tag">
            <Field label="Kategori">
              <select
                value={kategoriId}
                onChange={(e) => wrap(setKategoriId)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">Pilih kategori…</option>
                {(kategoriList ?? []).map(k => (
                  <option key={k.id_kategori_post} value={k.id_kategori_post}>{k.nm_kategori}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-myunila/10 text-myunila">
                    #{t}
                    <button onClick={() => { setTags(tags.filter(x => x !== t)); setDirty(true); }} className="hover:text-rose-500">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput("");
                    setDirty(true);
                    e.preventDefault();
                  }
                }}
                placeholder="Ketik + Enter"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </Field>
          </Section>

          <Section title="Cover Image">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              className="hidden"
            />
            {coverUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={onCoverPick} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-100 shadow-sm inline-flex items-center gap-1">
                    <FiUpload className="w-3 h-3" /> Ganti
                  </button>
                  <button onClick={() => { setCoverUrl(null); setDirty(true); }} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-rose-600 hover:bg-rose-50 shadow-sm inline-flex items-center gap-1">
                    <FiX className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onCoverPick} className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-myunila hover:bg-myunila/5 transition-colors flex flex-col items-center justify-center text-sm text-slate-500 hover:text-myunila">
                <FiImage className="w-8 h-8 mb-2" />
                Drop atau klik untuk upload
                <span className="text-[10px] text-slate-400 mt-1">Rekomendasi 16:9, max 5MB</span>
              </button>
            )}
          </Section>

          <Section title="Ringkasan (Excerpt)">
            <textarea
              rows={3}
              maxLength={500}
              value={excerpt}
              onChange={e => wrap(setExcerpt)(e.target.value)}
              placeholder="Auto dari 160 char pertama, atau ketik manual…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 tabular-nums">{excerpt.length} / 500 karakter</p>
          </Section>

          <Section title="SEO Meta">
            <Field label="Meta Title">
              <input
                value={metaTitle}
                onChange={e => wrap(setMetaTitle)(e.target.value)}
                placeholder="Default: judul"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </Field>
            <Field label="Meta Description">
              <textarea
                rows={2}
                maxLength={160}
                value={metaDesc}
                onChange={e => wrap(setMetaDesc)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none"
                placeholder="Default: ringkasan"
              />
              <p className="text-xs text-slate-400 mt-1 tabular-nums">{metaDesc.length} / 160</p>
            </Field>
          </Section>
        </aside>
      </div>

      {/* Media Picker Modal — untuk insert image dari editor toolbar */}
      <MediaPickerModal open={pickerOpen} onClose={closePicker} onSelect={onPickerSelect} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
        {children}
      </CardBody>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
