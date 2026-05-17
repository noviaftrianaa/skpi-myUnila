"use client";

// Subdomain claim/manage — picker pattern (no free typing).
// Sprint 7: real API integration via blog-service.
//
// State:
//   - User punya blog → show current subdomain + cooldown info (rename = P2)
//   - User belum punya blog → show 5 picker options + claim form

import { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiCheckCircle, FiClock, FiExternalLink,
  FiInfo, FiLoader, FiLock, FiRefreshCw, FiShield, FiStar,
} from "react-icons/fi";
import {
  useMyBlog, useSubdomainOptions, useClaimSubdomain,
} from "@/lib/services/blog-platform";
import type { SubdomainOption } from "@/lib/services/blog-platform";

const APEX = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

export default function SubdomainSettingsPage() {
  const { data: blog, isLoading: loadingBlog } = useMyBlog();
  const hasBlog = !!blog;
  const { data: optionsData, isLoading: loadingOpts, error: optsError, refetch } = useSubdomainOptions(!hasBlog && !loadingBlog);
  const claimMut = useClaimSubdomain();

  const [selected, setSelected] = useState<string | null>(null);
  const [nmBlog, setNmBlog] = useState("");
  const [tagline, setTagline] = useState("");

  // Loading state untuk first paint
  if (loadingBlog) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 inline-flex items-center gap-2 mx-auto">
        <FiLoader className="w-4 h-4 animate-spin" /> Memuat info blog kamu…
      </div>
    );
  }

  // =================== STATE 1: User SUDAH punya blog ===================
  if (hasBlog && blog) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">Subdomain Aktif</p>
                <a
                  href={`https://${blog.subdomain}.${APEX}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 hover:text-myunila inline-flex items-center gap-2 mt-1 break-all"
                >
                  {blog.subdomain}.{APEX}
                  <FiExternalLink className="w-5 h-5" />
                </a>
                <p className="text-sm text-slate-500 mt-1">
                  Diklaim {blog.tgl_klaim ? new Date(blog.tgl_klaim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-amber-200 dark:border-amber-900">
          <CardBody className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-300">Rename subdomain — coming soon (P2)</h3>
                <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                  Saat ini subdomain belum bisa di-rename. Kebijakan: cooldown 90 hari setelah klaim/rename terakhir untuk
                  jaga konsistensi link & SEO. Fitur akan tersedia di Phase 2.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // =================== STATE 2: User BELUM punya blog — claim flow ===================

  const options: SubdomainOption[] = optionsData?.options ?? [];
  const profile = optionsData?.profile;
  const tipeRole = optionsData?.tipe_role_kode || "MHS";

  const handleClaim = async () => {
    if (!selected) return;
    if (!nmBlog.trim()) {
      window.alert("Isi nama blog dulu.");
      return;
    }
    try {
      const result = await claimMut.mutateAsync({
        subdomain: selected,
        nm_blog: nmBlog.trim(),
        nm_tampilan: profile?.name || "",
        tagline: tagline.trim() || undefined,
      });
      window.alert(`✓ Subdomain ${result.subdomain} berhasil diklaim! Refresh untuk ke dashboard.`);
      window.location.href = "/dashboard/blog-platform";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal klaim";
      window.alert(`Gagal: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Why no custom typing */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
        <CardBody className="p-5">
          <div className="flex items-start gap-3">
            <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">Kenapa subdomain di-generate sistem?</h3>
              <p className="text-blue-800 dark:text-blue-400 leading-relaxed">
                Untuk menjaga <strong>konsistensi brand</strong> dan menghindari subdomain aneh atau menyerupai akun resmi,
                semua subdomain digenerate otomatis dari profil civitas (nama lengkap, NIM/NIP, peran). Kamu tinggal pilih
                satu opsi yang paling cocok.
              </p>
              <ul className="text-blue-700 dark:text-blue-400 list-disc list-inside text-xs space-y-0.5 mt-2">
                <li><strong>Mahasiswa</strong>: berbasis NIM (1 opsi tetap, locked)</li>
                <li><strong>Staf/Dosen/Alumni</strong>: 5 opsi dari variasi nama</li>
                <li>4-layer validation: <strong>format / reserved word / unique / no-impersonation</strong> sudah otomatis</li>
                <li>Subdomain di luar daftar? Ajukan banding manual review (SLA 24h)</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading state */}
      {loadingOpts && (
        <Card>
          <CardBody className="p-8 text-center text-sm text-slate-500">
            <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" />
            Memuat opsi subdomain dari sistem…
          </CardBody>
        </Card>
      )}

      {/* Error state */}
      {optsError && (
        <Card className="border-2 border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
          <CardBody className="p-5">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-rose-900 dark:text-rose-300">Gagal memuat opsi subdomain</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                  Pastikan kamu login. Error: {(optsError as Error).message}
                </p>
                <button onClick={() => refetch()} className="mt-2 text-xs text-myunila underline hover:no-underline">
                  Coba lagi
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Picker options */}
      {!loadingOpts && !optsError && options.length > 0 && (
        <Card>
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Pilih subdomain</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated dari <strong>{profile?.name || "profile kamu"}</strong> ({tipeRole}) ·
                  semua opsi sudah <FiCheck className="inline w-3 h-3 text-emerald-500" /> pre-validated
                </p>
              </div>
              <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 text-xs text-myunila hover:underline">
                <FiRefreshCw className="w-3 h-3" /> Generate ulang
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt) => (
                <SubdomainOptionRow
                  key={opt.subdomain}
                  opt={opt}
                  selected={selected === opt.subdomain}
                  onSelect={() => setSelected(opt.subdomain)}
                />
              ))}
            </div>

            {/* Claim form (muncul setelah pilih) */}
            {selected && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Nama Blog *</label>
                  <input
                    type="text"
                    value={nmBlog}
                    onChange={e => setNmBlog(e.target.value)}
                    placeholder="e.g. Catatan Riset Saya"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Tagline (opsional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="Catatan harian, riset & pembelajaran"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-slate-500">
                <FiInfo className="inline w-3.5 h-3.5 mr-1" />
                Subdomain langsung aktif &lt; 5 detik setelah claim.
              </p>
              <button
                onClick={handleClaim}
                disabled={!selected || !nmBlog.trim() || claimMut.isPending}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-myunila to-myunila-700 text-white font-semibold text-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-shadow"
              >
                <FiCheck className="w-4 h-4" /> {claimMut.isPending ? "Mengklaim…" : "Klaim Subdomain"}
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Manual appeal */}
      <Card className="border border-dashed">
        <CardBody className="p-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-slate-500" />
            Butuh subdomain di luar daftar?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Untuk kebutuhan khusus (mis. brand pribadi yg sudah dikenal), ajukan banding ke admin Blog Platform.
            Proses manual review SLA 24 jam.
          </p>
          <button className="mt-3 text-sm text-myunila font-medium hover:underline">
            Ajukan banding manual → <span className="text-[10px] text-slate-400">(P2)</span>
          </button>
        </CardBody>
      </Card>
    </div>
  );
}

function SubdomainOptionRow({
  opt, selected, onSelect,
}: {
  opt: SubdomainOption; selected: boolean; onSelect: () => void;
}) {
  const disabled = !opt.available;
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-myunila bg-myunila/5 dark:bg-myunila/10"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-myunila bg-myunila" : "border-slate-300 dark:border-slate-600"}`}>
            {selected && <FiCheck className="w-3 h-3 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {opt.subdomain}<span className="text-slate-400">.{APEX}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{opt.reasoning}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {opt.preferred && opt.available && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1">
              <FiStar className="w-3 h-3" /> Rekomendasi
            </span>
          )}
          {opt.available ? (
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><FiCheck className="w-3 h-3" /> Tersedia</span>
          ) : (
            <span className="text-xs text-rose-500 inline-flex items-center gap-1" title={opt.reason}>
              <FiLock className="w-3 h-3" /> {opt.reason ? opt.reason.slice(0, 30) : "Tidak tersedia"}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
