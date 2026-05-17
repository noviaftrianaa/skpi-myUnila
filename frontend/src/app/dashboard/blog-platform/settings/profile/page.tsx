"use client";

// Profile settings — edit nm_tampilan, nm_blog, tagline, bio, lokasi, sosmed.
// Avatar/cover URL pakai input text (image upload module belum di-wire dari sini).
// Backend: PUT /api/v1/me/blog dengan partial body.

import Image from "next/image";
import { Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  FiAlertCircle, FiCamera, FiCheck, FiGithub, FiGlobe, FiInstagram,
  FiLinkedin, FiLoader, FiSave, FiTwitter,
} from "react-icons/fi";
import { useMyBlog, useUpdateMyBlog } from "@/lib/services/blog-platform";

interface SosmedFields {
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  website: string;
}

const EMPTY_SOSMED: SosmedFields = { twitter: "", instagram: "", linkedin: "", github: "", website: "" };

export default function ProfileSettingsPage() {
  const { data: blog, isLoading, error, refetch } = useMyBlog();
  const update = useUpdateMyBlog();

  const [nmBlog, setNmBlog] = useState("");
  const [nmTampilan, setNmTampilan] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [coverURL, setCoverURL] = useState("");
  const [sosmed, setSosmed] = useState<SosmedFields>(EMPTY_SOSMED);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Hydrate dari server
  useEffect(() => {
    if (!blog) return;
    setNmBlog(blog.nm_blog || "");
    setNmTampilan(blog.nm_tampilan || "");
    setTagline(blog.tagline || "");
    setBio(blog.bio || "");
    setLokasi(blog.lokasi || "");
    setAvatarURL(blog.avatar_url || "");
    setCoverURL(blog.cover_url || "");
    const s = blog.sosmed_json || {};
    setSosmed({
      twitter: (s.twitter as string) || "",
      instagram: (s.instagram as string) || "",
      linkedin: (s.linkedin as string) || "",
      github: (s.github as string) || "",
      website: (s.website as string) || "",
    });
  }, [blog]);

  const handleSave = async () => {
    const sosmedClean: Record<string, string> = {};
    (Object.keys(sosmed) as (keyof SosmedFields)[]).forEach((k) => {
      const v = sosmed[k].trim();
      if (v) sosmedClean[k] = v;
    });
    try {
      await update.mutateAsync({
        nm_blog: nmBlog,
        nm_tampilan: nmTampilan,
        tagline,
        bio,
        lokasi,
        avatar_url: avatarURL,
        cover_url: coverURL,
        sosmed_json: sosmedClean,
      });
      setSavedAt(new Date());
      refetch();
    } catch (e) {
      alert(`Gagal simpan: ${(e as Error).message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" /> Memuat profil…
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-900 dark:text-rose-300">
          {(error as Error)?.message || "Belum punya blog. Claim subdomain dulu di Settings → Subdomain."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Settings Blog</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Edit profil author yang ditampilkan di per-user blog.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
              <FiCheck className="w-3 h-3" />
              Tersimpan {savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {update.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </header>

      {/* Avatar & Cover preview */}
      <Card>
        <CardBody className="p-0">
          <div className="relative">
            <div className="h-40 bg-gradient-to-r from-myunila to-myunila-700 relative">
              {coverURL && <Image src={coverURL} alt="" fill className="object-cover" unoptimized />}
            </div>
            <div className="px-6 -mt-12 pb-6 relative flex items-end gap-4">
              <div className="relative">
                {avatarURL ? (
                  // Use plain img karena cross-host yg gak di-allowlist
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatarURL} alt="" width={96} height={96} className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-xl object-cover bg-white" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <FiCamera className="w-7 h-7" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 space-y-3 -mt-2">
            <Field label="Avatar URL" hint="Sementara pakai URL eksternal (mis. ui-avatars, gravatar). Module Media Upload P2.">
              <input value={avatarURL} onChange={(e) => setAvatarURL(e.target.value)} placeholder="https://..."
                     className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono" />
            </Field>
            <Field label="Cover URL">
              <input value={coverURL} onChange={(e) => setCoverURL(e.target.value)} placeholder="https://..."
                     className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono" />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Basic info */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Informasi Dasar</h2>
          <Field label="Nama Tampilan" hint="Bisa beda dari nama SSO (kalau ingin pseudonym).">
            <input value={nmTampilan} maxLength={100} onChange={(e) => setNmTampilan(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </Field>
          <Field label="Judul Blog" hint="Ditampilkan di header dan title bar.">
            <input value={nmBlog} maxLength={100} onChange={(e) => setNmBlog(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </Field>
          <Field label={`Tagline (${tagline.length}/255)`} hint="Subtitle blog di header.">
            <input value={tagline} maxLength={255} onChange={(e) => setTagline(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </Field>
          <Field label={`Bio (${bio.length}/500)`} hint="Akan tampil di hero profile dan author card.">
            <textarea value={bio} rows={3} maxLength={500} onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
          </Field>
          <Field label="Lokasi">
            <input value={lokasi} maxLength={100} placeholder="Kota / Provinsi" onChange={(e) => setLokasi(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </Field>
        </CardBody>
      </Card>

      {/* Sosmed */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Sosial Media</h2>
          <p className="text-xs text-slate-500">Kosongkan kalau tidak ingin tampil. Boleh isi username atau URL lengkap.</p>
          <SosmedField icon={FiTwitter}   label="Twitter / X"     placeholder="username atau https://x.com/..."
                       value={sosmed.twitter} onChange={(v) => setSosmed({ ...sosmed, twitter: v })} />
          <SosmedField icon={FiInstagram} label="Instagram"       placeholder="username"
                       value={sosmed.instagram} onChange={(v) => setSosmed({ ...sosmed, instagram: v })} />
          <SosmedField icon={FiLinkedin}  label="LinkedIn"        placeholder="username"
                       value={sosmed.linkedin} onChange={(v) => setSosmed({ ...sosmed, linkedin: v })} />
          <SosmedField icon={FiGithub}    label="GitHub"          placeholder="username"
                       value={sosmed.github} onChange={(v) => setSosmed({ ...sosmed, github: v })} />
          <SosmedField icon={FiGlobe}     label="Website Pribadi" placeholder="https://..."
                       value={sosmed.website} onChange={(v) => setSosmed({ ...sosmed, website: v })} />
        </CardBody>
      </Card>

      {/* Privacy */}
      <Card className="border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
        <CardBody className="p-5">
          <h3 className="font-semibold text-amber-900 dark:text-amber-300 text-sm">🔒 Catatan Privasi</h3>
          <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
            Data sensitif (NIM/NIP penuh, email pribadi, nomor telepon, alamat, IPK, NIK) <strong>tidak pernah ditampilkan</strong> di blog publik.
            Hanya field di atas + data CV yang kamu input manual.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function SosmedField({ icon: Icon, label, placeholder, value, onChange }: {
  icon: typeof FiTwitter; label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-slate-400 shrink-0" />
      <div className="flex-1">
        <label className="block text-xs text-slate-500 mb-0.5">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
      </div>
    </div>
  );
}
