"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";
import { useRouter } from "next/navigation";
import { pengajuanAksesService, type PengajuanAkses, type AutoFlag } from "@/lib/services/manakses/pengajuanAksesService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { peranService, type Peran } from "@/lib/services/manakses/peranService";
import { unitOrganisasiService } from "@/lib/services/manakses/unitOrganisasiService";

type Tab = "form" | "list";

interface UnitOption {
  id_organisasi: string;
  nm_lemb: string;
  level_organisasi?: number;
}

export default function PengajuanAksesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("form");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
          <p className="mt-3 text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Icon icon="heroicons:identification" className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Pengajuan Akses Aplikasi</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">Self-Service Access Request</p>
            </div>
          </div>
          <Link
            href="/portal"
            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 sm:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Icon icon="heroicons:arrow-left" className="h-4 w-4" />
            Kembali ke Portal
          </Link>
        </div>
      </header>

      {/* Tab nav */}
      <div className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "form"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Icon icon="heroicons:plus-circle" className="h-4 w-4" />
            Ajukan Baru
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "list"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Icon icon="heroicons:list-bullet" className="h-4 w-4" />
            Pengajuan Saya
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        {activeTab === "form" ? <PengajuanForm /> : <PengajuanList />}
      </main>
    </div>
  );
}

// ============================================================================
// FORM PENGAJUAN
// ============================================================================
function PengajuanForm() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Aplikasi[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [perans, setPerans] = useState<Peran[]>([]);
  const [peransLoading, setPeransLoading] = useState(false);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [unitSearch, setUnitSearch] = useState("");
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  const [form, setForm] = useState({
    id_aplikasi: "",
    id_peran: 0,
    id_organisasi: "",
    nm_organisasi: "",
    no_sk: "",
    tgl_sk: new Date().toISOString().slice(0, 10),
    tgl_kadaluarsa: new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10),
    catatan_pemohon: "",
  });
  const [skFile, setSkFile] = useState<File | null>(null);
  const [skUpload, setSkUpload] = useState<{ sk_url: string; sk_filename: string; sk_filesize: number; sk_mimetype: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Captcha — simple math (anti-bot)
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  useEffect(() => {
    setCaptchaA(Math.floor(Math.random() * 9) + 1);
    setCaptchaB(Math.floor(Math.random() * 9) + 1);
  }, []);
  const captchaValid = parseInt(captchaInput || "0", 10) === captchaA + captchaB;

  // Load apps on mount — filter ke aplikasi yg tampil di portal + aktif saja
  // (mencegah pemohon pilih aplikasi internal/test yg gak relevan utk user umum)
  useEffect(() => {
    (async () => {
      setAppsLoading(true);
      try {
        const res = await aplikasiService.getList({
          limit: 200,
          page: 1,
          portal: "ya",
          status: "aktif",
          sort_by: "nm_aplikasi",
          sort_order: "asc",
        });
        setApps(res.data || []);
      } catch {
        toast.error("Gagal load daftar aplikasi");
      } finally {
        setAppsLoading(false);
      }
    })();
  }, []);

  // Searchable app combobox state
  const [appSearch, setAppSearch] = useState("");
  const [appOpen, setAppOpen] = useState(false);
  const filteredApps = useMemo(() => {
    if (!appSearch.trim()) return apps;
    const q = appSearch.toLowerCase();
    return apps.filter((a: any) =>
      (a.nm_aplikasi || "").toLowerCase().includes(q)
      || (a.app_slug || "").toLowerCase().includes(q)
    );
  }, [apps, appSearch]);
  const selectedApp = useMemo(
    () => apps.find((a: any) => a.id_aplikasi === form.id_aplikasi),
    [apps, form.id_aplikasi]
  );

  // Load perans saat app dipilih
  useEffect(() => {
    if (!form.id_aplikasi) {
      setPerans([]);
      return;
    }
    (async () => {
      setPeransLoading(true);
      try {
        // Reuse same logic dgn import-template (peran utk app)
        const res = await peranService.getList({ id_aplikasi: form.id_aplikasi, limit: 100 });
        setPerans((res.data || []).filter((p: any) => !p.a_peran_identitas));
      } catch {
        toast.error("Gagal load daftar peran");
      } finally {
        setPeransLoading(false);
      }
    })();
  }, [form.id_aplikasi]);

  // Search unit (debounced)
  useEffect(() => {
    if (unitSearch.length < 2) {
      setUnits([]);
      return;
    }
    const t = setTimeout(async () => {
      setUnitLoading(true);
      try {
        const res = await unitOrganisasiService.getAll({ search: unitSearch, limit: 20 });
        setUnits((res || []).map((u: any) => ({
          id_organisasi: u.id_organisasi,
          nm_lemb: u.nm_lemb,
          level_organisasi: u.level_organisasi,
        })));
      } finally {
        setUnitLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [unitSearch]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSkFile(null);
      setSkUpload(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file melebihi 2 MB");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Format file harus PDF, JPG, PNG, atau WebP");
      return;
    }
    setSkFile(file);
    setSkUpload(null);
  };

  const handleUpload = async () => {
    if (!skFile) return;
    setUploading(true);
    try {
      const result = await pengajuanAksesService.uploadSk(skFile);
      setSkUpload(result);
      toast.success("SK berhasil diupload");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal upload SK");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaValid) {
      toast.error("Jawaban verifikasi salah");
      return;
    }
    if (!skUpload) {
      toast.error("Upload SK terlebih dahulu");
      return;
    }
    if (!form.id_aplikasi || !form.id_peran || !form.id_organisasi) {
      toast.error("Lengkapi semua field wajib");
      return;
    }
    setSubmitting(true);
    try {
      const result = await pengajuanAksesService.create({
        id_aplikasi: form.id_aplikasi,
        id_peran: form.id_peran,
        id_organisasi: form.id_organisasi,
        sk_url: skUpload.sk_url,
        sk_filename: skUpload.sk_filename,
        sk_filesize: skUpload.sk_filesize,
        sk_mimetype: skUpload.sk_mimetype,
        no_sk: form.no_sk || undefined,
        tgl_sk: form.tgl_sk,
        tgl_kadaluarsa: form.tgl_kadaluarsa,
        catatan_pemohon: form.catatan_pemohon || undefined,
      });
      toast.success("Pengajuan berhasil disubmit");
      // Reset form
      setForm({
        id_aplikasi: "",
        id_peran: 0,
        id_organisasi: "",
        nm_organisasi: "",
        no_sk: "",
        tgl_sk: new Date().toISOString().slice(0, 10),
        tgl_kadaluarsa: new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10),
        catatan_pemohon: "",
      });
      setSkFile(null);
      setSkUpload(null);
      // Show flags if any (warnings)
      if (result.auto_flags && result.auto_flags.length > 0) {
        result.auto_flags.forEach((f) => {
          toast(f.message, {
            icon: "⚠️",
            duration: 5000,
          });
        });
      }
    } catch (e: any) {
      const flags = e?.response?.data?.flags as AutoFlag[] | undefined;
      if (flags) {
        flags.forEach((f) => toast.error(f.message, { duration: 5000 }));
      } else {
        toast.error(e?.response?.data?.message || "Gagal submit pengajuan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identitas Pemohon */}
      <Card title="Identitas Pemohon" icon="heroicons:user-circle" desc="Auto-filled dari sesi SSO Anda">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label>Nama</Label>
            <Value>{user?.name || "—"}</Value>
          </div>
          <div>
            <Label>Username</Label>
            <Value>{user?.username || "—"}</Value>
          </div>
          <div>
            <Label>Email</Label>
            <Value className="break-all">{user?.email || "—"}</Value>
          </div>
          <div>
            <Label>Tipe</Label>
            <Value>{user?.role || "User"}</Value>
          </div>
        </div>
      </Card>

      {/* Akses Saya — display peran yg sudah dimiliki sebagai info utk pemohon */}
      <ExistingRolesCard />

      {/* Pengajuan */}
      <Card title="Detail Pengajuan" icon="heroicons:clipboard-document-list" desc="Pilih aplikasi target + peran + unit organisasi">
        <div className="space-y-4">
          {/* Aplikasi — searchable combobox, filter ke yg tampil portal */}
          <div>
            <Label required>Aplikasi Target</Label>
            <div className="relative">
              <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={selectedApp ? selectedApp.nm_aplikasi : appSearch}
                placeholder={appsLoading ? "Memuat aplikasi…" : "Ketik nama aplikasi (mis. Dashboard / SIAKADU)"}
                disabled={appsLoading}
                onChange={(e) => {
                  setAppSearch(e.target.value);
                  setAppOpen(true);
                  if (selectedApp) {
                    // user editing — clear selection
                    setForm((p) => ({ ...p, id_aplikasi: "", id_peran: 0 }));
                  }
                }}
                onFocus={() => setAppOpen(true)}
                onBlur={() => setTimeout(() => setAppOpen(false), 200)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
              {(selectedApp || appSearch) && !appsLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setAppSearch("");
                    setForm((p) => ({ ...p, id_aplikasi: "", id_peran: 0 }));
                    setAppOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Hapus pilihan"
                >
                  ✕
                </button>
              )}
              {appOpen && filteredApps.length > 0 && (
                <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                  {filteredApps.map((a: any) => {
                    const isComingSoon = a.a_coming_soon;
                    const isMaintenance = a.a_maintenance;
                    const disabled = isComingSoon || isMaintenance;
                    return (
                      <button
                        key={a.id_aplikasi}
                        type="button"
                        disabled={disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (disabled) return;
                          setForm((p) => ({ ...p, id_aplikasi: a.id_aplikasi, id_peran: 0 }));
                          setAppSearch("");
                          setAppOpen(false);
                        }}
                        title={isComingSoon ? "Aplikasi belum tersedia (Coming Soon)" : isMaintenance ? "Aplikasi sedang maintenance" : undefined}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                          disabled
                            ? "cursor-not-allowed opacity-60 bg-gray-50/50 dark:bg-slate-800/30"
                            : "hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        }`}
                      >
                        <Icon icon={a.icon_name || "heroicons:rectangle-stack"} className={`h-5 w-5 flex-shrink-0 ${disabled ? "text-gray-400" : "text-indigo-600 dark:text-indigo-400"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium truncate ${disabled ? "text-gray-500 dark:text-slate-500" : "text-gray-900 dark:text-white"}`}>
                              {a.nm_aplikasi}
                            </span>
                            {isComingSoon && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300">
                                <Icon icon="heroicons:clock" className="h-2.5 w-2.5" />
                                Soon
                              </span>
                            )}
                            {isMaintenance && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                                <Icon icon="heroicons:wrench-screwdriver" className="h-2.5 w-2.5" />
                                Maintenance
                              </span>
                            )}
                          </div>
                          {a.ket_aplikasi && (
                            <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{a.ket_aplikasi}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {appOpen && appSearch && filteredApps.length === 0 && (
                <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-xs text-gray-500 shadow-lg dark:border-slate-600 dark:bg-slate-800">
                  Aplikasi tidak ditemukan
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Hanya menampilkan aplikasi aktif yang muncul di portal myUnila.
            </p>
          </div>

          {/* Peran */}
          <div>
            <Label required>Peran</Label>
            <select
              required
              value={form.id_peran || ""}
              disabled={!form.id_aplikasi || peransLoading}
              onChange={(e) => setForm((p) => ({ ...p, id_peran: parseInt(e.target.value, 10) }))}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:text-gray-400 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
            >
              <option value="">
                {!form.id_aplikasi ? "Pilih aplikasi dulu" : peransLoading ? "Loading…" : "— Pilih peran —"}
              </option>
              {perans.map((p) => (
                <option key={p.id_peran} value={p.id_peran}>
                  {p.nm_peran}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Organisasi (search) */}
          <div>
            <Label required>Unit Organisasi</Label>
            <div className="relative">
              <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari fakultas / prodi / unit kerja…"
                value={unitSearch}
                onChange={(e) => {
                  setUnitSearch(e.target.value);
                  setUnitOpen(true);
                }}
                onFocus={() => setUnitOpen(true)}
                onBlur={() => setTimeout(() => setUnitOpen(false), 200)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
              {unitOpen && units.length > 0 && (
                <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                  {units.map((u) => (
                    <button
                      key={u.id_organisasi}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setForm((p) => ({ ...p, id_organisasi: u.id_organisasi, nm_organisasi: u.nm_lemb }));
                        setUnitSearch(u.nm_lemb);
                        setUnitOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{u.nm_lemb}</div>
                      {u.level_organisasi && (
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          Level {u.level_organisasi}{u.level_organisasi === 3 ? " (Universitas)" : u.level_organisasi === 4 ? " (Fakultas)" : " (Prodi)"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.id_organisasi && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Icon icon="heroicons:check-circle" className="h-3 w-3" />
                Terpilih: {form.nm_organisasi}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SK Penugasan */}
      <Card title="SK Penugasan" icon="heroicons:document-text" desc="Upload SK dalam format PDF / JPG / PNG (max 2MB)">
        <div className="space-y-4">
          {/* Drag drop area */}
          <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
            skUpload ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700/30"
          }`}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" hidden onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            {skUpload ? (
              <div className="text-center">
                <Icon icon="heroicons:check-circle" className="mx-auto h-10 w-10 text-emerald-600" />
                <div className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">{skUpload.sk_filename}</div>
                <div className="text-xs text-gray-500">{(skUpload.sk_filesize / 1024).toFixed(1)} KB · ke-upload ✓</div>
              </div>
            ) : skFile ? (
              <div className="text-center">
                <Icon icon="heroicons:document" className="mx-auto h-10 w-10 text-indigo-600" />
                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{skFile.name}</div>
                <div className="text-xs text-gray-500">{(skFile.size / 1024).toFixed(1)} KB · siap upload</div>
              </div>
            ) : (
              <div className="text-center">
                <Icon icon="heroicons:cloud-arrow-up" className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-300">Klik atau drag & drop file SK di sini</div>
                <div className="text-xs text-gray-500">PDF / JPG / PNG / WebP — max 2MB</div>
              </div>
            )}
          </label>

          {skFile && !skUpload && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                  Mengupload…
                </>
              ) : (
                <>
                  <Icon icon="heroicons:cloud-arrow-up" className="h-4 w-4" />
                  Upload File SK ke Server
                </>
              )}
            </button>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Nomor SK</Label>
              <input
                type="text"
                value={form.no_sk}
                onChange={(e) => setForm((p) => ({ ...p, no_sk: e.target.value }))}
                placeholder="Opsional"
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
            </div>
            <div>
              <Label>Tanggal SK</Label>
              <input
                type="date"
                value={form.tgl_sk}
                onChange={(e) => setForm((p) => ({ ...p, tgl_sk: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
            </div>
            <div>
              <Label required>Berlaku s/d</Label>
              <input
                type="date"
                required
                value={form.tgl_kadaluarsa}
                onChange={(e) => setForm((p) => ({ ...p, tgl_kadaluarsa: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label>Catatan (opsional)</Label>
            <textarea
              rows={3}
              value={form.catatan_pemohon}
              onChange={(e) => setForm((p) => ({ ...p, catatan_pemohon: e.target.value }))}
              placeholder="Penjelasan kepentingan akses, atau konteks pengajuan…"
              className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Captcha + Submit */}
      <Card title="Verifikasi & Submit" icon="heroicons:shield-check">
        <div className="space-y-4">
          <div>
            <Label required>Verifikasi (anti-bot)</Label>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-base font-semibold text-gray-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {captchaA} + {captchaB} = ?
              </div>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Jawaban"
                className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
              {captchaInput && (
                <Icon
                  icon={captchaValid ? "heroicons:check-circle" : "heroicons:x-circle"}
                  className={`h-5 w-5 ${captchaValid ? "text-emerald-500" : "text-red-500"}`}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !captchaValid || !skUpload}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Mengirim pengajuan…
              </>
            ) : (
              <>
                <Icon icon="heroicons:paper-airplane" className="h-4 w-4" />
                Ajukan Akses
              </>
            )}
          </button>
        </div>
      </Card>
    </form>
  );
}

// ============================================================================
// LIST PENGAJUAN SAYA
// ============================================================================
function PengajuanList() {
  const [data, setData] = useState<PengajuanAkses[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await pengajuanAksesService.myRequests();
        setData(list);
      } catch {
        toast.error("Gagal load pengajuan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin batalkan pengajuan ini?")) return;
    try {
      await pengajuanAksesService.cancel(id);
      toast.success("Pengajuan dibatalkan");
      setData((p) => p.map((r) => (r.id_pengajuan === id ? { ...r, status: "cancelled" as const } : r)));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal cancel");
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
        <p className="mt-3 text-sm text-gray-500">Memuat pengajuan…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
        <Icon icon="heroicons:inbox" className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-slate-300">Belum ada pengajuan</p>
        <p className="text-xs text-gray-500">Klik tab "Ajukan Baru" untuk membuat pengajuan akses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <PengajuanCard key={r.id_pengajuan} item={r} onCancel={handleCancel} />
      ))}
    </div>
  );
}

function PengajuanCard({ item, onCancel }: { item: PengajuanAkses; onCancel: (id: string) => void }) {
  const statusMeta = {
    pending:   { label: "Menunggu Validasi", bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: "heroicons:clock" },
    approved:  { label: "Disetujui",         bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: "heroicons:check-circle" },
    rejected:  { label: "Ditolak",           bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: "heroicons:x-circle" },
    cancelled: { label: "Dibatalkan",        bg: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300", icon: "heroicons:no-symbol" },
    expired:   { label: "Kadaluarsa",        bg: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: "heroicons:archive-box" },
  }[item.status] || { label: item.status, bg: "bg-gray-100 text-gray-700", icon: "heroicons:document" };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.bg}`}>
              <Icon icon={statusMeta.icon} className="h-3 w-3" />
              {statusMeta.label}
            </span>
            <span className="text-xs text-gray-500">{new Date(item.tgl_create).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
            {item.nm_aplikasi} — <span className="text-indigo-600 dark:text-indigo-400">{item.nm_peran}</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Unit: {item.nm_organisasi}</p>
          {item.no_sk && <p className="mt-1 text-xs text-gray-500">SK: {item.no_sk} · Berlaku s/d {new Date(item.tgl_kadaluarsa).toLocaleDateString("id-ID")}</p>}

          {item.auto_flags && item.auto_flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.auto_flags.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                  <Icon icon="heroicons:exclamation-triangle" className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>{f.message}</span>
                </div>
              ))}
            </div>
          )}

          {item.alasan_tolak && (
            <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <strong>Alasan tolak:</strong> {item.alasan_tolak}
            </div>
          )}

          {item.status === "approved" && item.nama_validator && (
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
              ✓ Disetujui oleh {item.nama_validator} pada {item.tgl_validasi ? new Date(item.tgl_validasi).toLocaleDateString("id-ID") : "—"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.sk_url && (
            <a
              href={pengajuanAksesService.previewSkUrl(item.id_pengajuan)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Icon icon="heroicons:document-arrow-down" className="h-3.5 w-3.5" />
              SK
            </a>
          )}
          {item.status === "pending" && (
            <button
              onClick={() => onCancel(item.id_pengajuan)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300"
            >
              <Icon icon="heroicons:x-mark" className="h-3.5 w-3.5" />
              Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MICRO UI
// ============================================================================
function Card({ title, icon, desc, children }: { title: string; icon: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-slate-700 dark:bg-slate-700/30">
        <div className="flex items-center gap-2">
          <Icon icon={icon} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {desc && <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Value({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium text-gray-900 dark:text-white ${className}`}>{children}</div>;
}

// ============================================================================
// ExistingRolesCard — info peran yang sudah dimiliki user di akun SSO-nya
// (membantu pemohon supaya tidak ajukan role yang duplikat)
// ============================================================================
function ExistingRolesCard() {
  const { roles, isLoadingContext } = useUserContext();
  const list = roles || [];

  return (
    <Card title="Akses Aplikasi Saat Ini" icon="heroicons:key" desc={`${list.length} peran terdaftar di akun Anda`}>
      {isLoadingContext ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-500" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <Icon icon="heroicons:information-circle" className="mr-1 inline h-4 w-4" />
          Belum ada peran terdaftar selain peran identitas (Mhs/Dosen/Tendik).
          Ajukan akses untuk aplikasi yang Bapak/Ibu butuhkan.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((r: any) => (
            <span
              key={r.id_role_pengguna}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 dark:ring-indigo-800/40"
              title={r.nm_organisasi || ""}
            >
              <Icon icon="heroicons:shield-check" className="h-3 w-3" />
              <strong>{r.nm_peran}</strong>
              {r.nm_organisasi && <span className="opacity-75">· {r.nm_organisasi}</span>}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
        💡 Pengajuan untuk peran yang sudah dimiliki akan auto-flag warning. Pertimbangkan{" "}
        <Link href="/portal/profile" className="text-indigo-600 hover:underline">Profil Saya</Link> untuk perpanjang.
      </p>
    </Card>
  );
}
