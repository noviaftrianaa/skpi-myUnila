"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import manajemenKontenService, {
  Kategori,
  Konten,
  KontenStatus,
  KontenTipe,
  CreateKontenPayload,
} from "@/lib/services/manajemen-konten/manajemenKontenService";
import { toast } from "react-hot-toast";
import { FiSave, FiX, FiEye, FiUpload, FiImage, FiTrash2 } from "react-icons/fi";

export default function KontenForm({
  initialData,
  defaultTipe,
}: {
  initialData?: Konten;
  defaultTipe?: KontenTipe;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [tipe, setTipe] = useState<KontenTipe>(initialData?.tipe || defaultTipe || "pengumuman");
  const [judul, setJudul] = useState(initialData?.judul || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [ringkasan, setRingkasan] = useState(initialData?.ringkasan || "");
  const [isi, setIsi] = useState(initialData?.isi || "");
  const [idKategori, setIdKategori] = useState(initialData?.id_kategori || "");
  const [bannerURL, setBannerURL] = useState(initialData?.banner_url || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [allowComment, setAllowComment] = useState(initialData?.allow_comment || false);
  const [allowLike, setAllowLike] = useState(initialData?.allow_like || false);
  const [tglTerbit, setTglTerbit] = useState(
    initialData?.tgl_terbit ? initialData.tgl_terbit.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [tglExpiry, setTglExpiry] = useState(
    initialData?.tgl_expiry ? initialData.tgl_expiry.substring(0, 10) : ""
  );
  const [status, setStatus] = useState<KontenStatus>(initialData?.status || "draft");
  const [targetRole, setTargetRole] = useState(initialData?.target_role || "all");
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleBannerUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maksimal 5 MB");
      return;
    }
    setUploading(true);
    try {
      const r = await manajemenKontenService.uploadFile(file);
      if (r.success) {
        // Build full public URL: NEXT_PUBLIC_MAN_KONTEN_API_URL adalah root service
        // (tanpa /api/v1, konsisten dgn Go service lain), jadi langsung concat dgn r.data.url
        // (yg sudah include "/man-konten/uploads/<file>")
        const kongBase = (process.env.NEXT_PUBLIC_MAN_KONTEN_API_URL || "").replace(/\/$/, "");
        const fullURL = kongBase + r.data.url;
        setBannerURL(fullURL);
        toast.success(`Upload sukses: ${r.data.filename}`);
      }
    } catch (err: any) {
      toast.error("Gagal upload: " + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    manajemenKontenService.listKategori().then((r) => r.success && setKategoriList(r.data)).catch(() => {});
  }, []);

  const buildPayload = (statusOverride?: KontenStatus): CreateKontenPayload => ({
    tipe,
    judul,
    slug: slug || null,
    ringkasan: ringkasan || null,
    isi: isi || null,
    id_kategori: idKategori || null,
    banner_url: bannerURL || null,
    author: author || null,
    tags: tags || null,
    is_pinned: isPinned,
    is_featured: isFeatured,
    tgl_terbit: tglTerbit || null,
    tgl_expiry: tglExpiry || null,
    status: statusOverride || status,
    target_role: targetRole,
    allow_comment: allowComment,
    allow_like: allowLike,
  });

  const handleSubmit = async (statusOverride?: KontenStatus) => {
    if (!judul.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && initialData) {
        await manajemenKontenService.updateKonten(initialData.id_pengumuman, buildPayload(statusOverride));
        toast.success("Konten berhasil disimpan");
      } else {
        const r = await manajemenKontenService.createKonten(buildPayload(statusOverride));
        toast.success("Konten berhasil dibuat");
        router.push(`/dashboard/manajemen-apps/manajemen-konten/konten/${r.data.id_pengumuman}`);
        return;
      }
    } catch (err: any) {
      toast.error("Gagal: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main column — judul + isi */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Tulis judul yang menarik..."
              className="w-full px-4 py-3 text-lg font-semibold rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {(tipe === "berita" || tipe === "artikel") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Slug URL <span className="text-xs text-gray-400 font-normal">(opsional, auto-generate dari judul)</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="judul-yang-friendly-untuk-url"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ringkasan <span className="text-xs text-gray-400 font-normal">(maks 500 karakter, untuk preview card)</span>
            </label>
            <textarea
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value.slice(0, 500))}
              placeholder="Ringkasan singkat tentang konten ini..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{ringkasan.length} / 500</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi</label>
            <RichTextEditor
              value={isi}
              onChange={setIsi}
              placeholder="Mulai menulis konten di sini..."
              minHeight={400}
            />
          </div>
        </div>
      </div>

      {/* Sidebar — settings */}
      <div className="space-y-4">
        {/* Action buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 sticky top-4">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" /> Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            <FiEye className="w-4 h-4" /> {isEdit ? "Update & Publish" : "Publish Sekarang"}
          </button>
          {isEdit && (
            <button
              onClick={() => router.push("/dashboard/manajemen-apps/manajemen-konten/konten")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-4 h-4" /> Batal & Kembali
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800">Pengaturan</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipe Konten</label>
            <select
              value={tipe === "artikel" ? "berita" : tipe}
              onChange={(e) => setTipe(e.target.value as KontenTipe)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="pengumuman">📢 Pengumuman</option>
              <option value="berita">📰 Berita / Artikel</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Bedakan via <span className="font-semibold">Kategori</span> (Akademik, Kegiatan, Opini, dll)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
            <select
              value={idKategori}
              onChange={(e) => setIdKategori(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Pilih kategori...</option>
              {kategoriList.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tgl Terbit</label>
            <input
              type="date"
              value={tglTerbit}
              onChange={(e) => setTglTerbit(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tgl Kedaluwarsa <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="date"
              value={tglExpiry}
              onChange={(e) => setTglExpiry(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Target Audience</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="tendik">Tendik</option>
            </select>
          </div>
        </div>

        {(tipe === "berita" || tipe === "artikel") && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-800">Metadata SEO & Penulis</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Penulis</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama penulis"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tags{" "}
                <span className="text-gray-400 font-normal">(pisahkan koma — penting untuk SEO & search)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="contoh: akademik, beasiswa, 2026, prestasi"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tags muncul di halaman detail dan dapat dipakai untuk filter konten serupa
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <FiImage className="w-4 h-4" /> Banner
          </h3>

          {bannerURL ? (
            <div className="space-y-2">
              <div className="relative group">
                <img
                  src={bannerURL}
                  alt="banner preview"
                  className="w-full h-36 object-cover rounded-lg border border-gray-100"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
                <button
                  type="button"
                  onClick={() => setBannerURL("")}
                  className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                  title="Hapus banner"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={bannerURL}
                onChange={(e) => setBannerURL(e.target.value)}
                placeholder="atau paste URL eksternal"
                className="w-full px-2 py-1.5 text-xs font-mono rounded border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleBannerUpload(f);
                  e.target.value = "";
                }}
                className="sr-only"
              />
              {uploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-blue-600">Mengupload...</p>
                </>
              ) : (
                <>
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">Klik untuk upload banner</p>
                  <p className="text-[11px] text-gray-400">JPG, PNG, WEBP, GIF · maks 5 MB</p>
                </>
              )}
            </label>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800">Opsi</h3>
          <CheckboxRow checked={isPinned} onChange={setIsPinned} label="Pin di atas (always-on-top)" />
          <CheckboxRow checked={isFeatured} onChange={setIsFeatured} label="Featured (tampil di highlight)" />
          <CheckboxRow checked={allowComment} onChange={setAllowComment} label="Izinkan komentar" />
          <CheckboxRow checked={allowLike} onChange={setAllowLike} label="Izinkan like / reaksi" />
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <span
        className={`mt-0.5 inline-flex w-4 h-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 group-hover:border-gray-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className="text-xs text-gray-700 leading-tight">{label}</span>
    </label>
  );
}
