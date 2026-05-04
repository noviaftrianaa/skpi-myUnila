"use client";

/**
 * API Config — kredensial SIMKATMAWA (Kemdiktisaintek pusat).
 * Endpoint: setting.api_config (encrypted via Laravel Crypt).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simPrestasiMenuConfig } from "../../config/menuConfig";
import { apiConfigService, type ApiConfig } from "@/lib/services/si-prestasi/prestasiService";
import {
  FiKey, FiEye, FiEyeOff, FiSave, FiRefreshCw, FiCheckCircle, FiAlertTriangle,
  FiShield, FiInfo, FiToggleLeft, FiToggleRight, FiServer, FiActivity,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "si-prestasi";

export default function ApiConfigPage() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pinging, setPinging] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [kodePt, setKodePt] = useState("");
  const [rateLimit, setRateLimit] = useState("30");
  const [timeout, setTimeoutVal] = useState("30");

  // Load existing config
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const c = await apiConfigService.get("simkatmawa");
        setConfig(c);
        setBaseUrl(c.base_url);
        setKodePt(c.kode_pt || "");
        setRateLimit(String(c.rate_limit_per_min));
        setTimeoutVal(String(c.timeout_seconds));
      } catch (e: any) {
        toast.error(`Gagal load: ${e?.response?.data?.message || e?.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        base_url: baseUrl.trim(),
        kode_pt: kodePt.trim() || null,
        rate_limit: parseInt(rateLimit || "30", 10),
        timeout: parseInt(timeout || "30", 10),
      };
      if (username.trim()) payload.username = username.trim();
      if (password.trim()) payload.password = password.trim();
      const updated = await apiConfigService.update("simkatmawa", payload);
      setConfig(updated);
      setUsername(""); setPassword(""); // Clear input after save
      toast.success("✅ Konfigurasi tersimpan (kredensial ter-enkripsi)");
    } catch (e: any) {
      toast.error(`Gagal simpan: ${e?.response?.data?.message || e?.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFlag = async (flag: "a_active" | "a_dry_run", value: boolean) => {
    try {
      const updated = await apiConfigService.toggle("simkatmawa", flag, value);
      setConfig(updated);
      toast.success(`${flag} = ${value ? "ON" : "OFF"}`);
    } catch (e: any) {
      toast.error(`Toggle gagal: ${e?.message}`);
    }
  };

  const testPing = async () => {
    setPinging(true);
    const t = toast.loading("Test koneksi ke SIMKATMAWA...");
    try {
      const r = await apiConfigService.ping();
      toast.dismiss(t);
      if (r.success) {
        toast.success("✅ Koneksi OK — kredensial valid");
      } else {
        toast.error(`Ping gagal: ${r.message || "unknown"}`);
      }
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(`Ping gagal: ${e?.response?.data?.message || e?.message}`);
    } finally {
      setPinging(false);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiKey className="h-6 w-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="space-y-5 p-6 max-w-4xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard/si-prestasi" className="hover:text-blue-600">SI Prestasi</Link>
            <span>/</span>
            <Link href="/dashboard/si-prestasi/master-data" className="hover:text-blue-600">Master Data</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">API Config</span>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <FiKey className="h-7 w-7 text-blue-500" /> API Config — SIMKATMAWA
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Kredensial untuk push prestasi/sertifikasi/rekognisi ke <code>simkatmawa.kemdiktisaintek.go.id</code>.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <FiRefreshCw className="w-5 h-5 animate-spin mr-2" /> Memuat config...
          </div>
        ) : !config ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-900">
            Config belum di-seed. Pastikan row <code>simkatmawa</code> ada di setting.api_config.
          </div>
        ) : (
          <>
            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatusCard
                icon={<FiCheckCircle className="w-5 h-5" />}
                label="Status Config"
                active={config.a_active}
                trueLabel="Active"
                falseLabel="Disabled"
                onToggle={() => toggleFlag("a_active", !config.a_active)}
              />
              <StatusCard
                icon={<FiShield className="w-5 h-5" />}
                label="Mode"
                active={!config.a_dry_run}
                trueLabel="LIVE (kirim asli)"
                falseLabel="DRY-RUN (mock)"
                onToggle={() => toggleFlag("a_dry_run", !config.a_dry_run)}
              />
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-500 mb-1">
                  <FiActivity className="w-4 h-4" /> Kredensial
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {config.has_username && config.has_password ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><FiCheckCircle className="w-4 h-4" /> Tersimpan</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold"><FiAlertTriangle className="w-4 h-4" /> Belum di-set</span>
                  )}
                </div>
                <button
                  onClick={testPing}
                  disabled={pinging || !config.has_username || !config.has_password}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-40"
                >
                  {pinging ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiServer className="w-3 h-3" />}
                  Test Koneksi
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FiKey className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Kredensial SIMKATMAWA</h2>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 flex items-start gap-2">
                <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  Username + password digunakan untuk auth POST <code>/api/login</code> (auth_type=bearer).
                  Disimpan ter-enkripsi (Laravel Crypt AES-256-CBC dengan APP_KEY) — admin lain tidak bisa baca dari DB langsung.
                  Form ini KOSONG by default — biarkan kosong kalau tidak ingin ubah, isi hanya kalau mau ganti.
                </div>
              </div>

              <Field label="Username">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={config.has_username ? "(tersimpan — kosongkan jika tidak ubah)" : "kemahasiswaan.unila@kpa.unila.ac.id"}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={config.has_password ? "(tersimpan — kosongkan jika tidak ubah)" : "Masukkan password SIMKATMAWA"}
                    autoComplete="new-password"
                    className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Base URL" hint="default: https://simkatmawa.kemdiktisaintek.go.id">
                  <input
                    type="url"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-xs"
                  />
                </Field>
                <Field label="Kode PT (Unila)" hint="kode satuan pendidikan PDDIKTI">
                  <input
                    type="text"
                    value={kodePt}
                    onChange={(e) => setKodePt(e.target.value)}
                    placeholder="contoh: 001026"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Rate Limit (req/menit)">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Timeout (detik)">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={timeout}
                    onChange={(e) => setTimeoutVal(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
              </div>

              {config.deskripsi && (
                <div className="text-[11px] text-slate-500 italic border-l-2 border-slate-200 pl-3">
                  {config.deskripsi}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                  Last update: {new Date(config.updated_at).toLocaleString("id-ID")}
                </p>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 shadow-md"
                >
                  {submitting ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

function StatusCard({ icon, label, active, trueLabel, falseLabel, onToggle }: {
  icon: React.ReactNode; label: string; active: boolean; trueLabel: string; falseLabel: string; onToggle: () => void;
}) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-500 mb-1">
        <span className={active ? "text-emerald-700" : "text-slate-400"}>{icon}</span>
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-bold ${active ? "text-emerald-800" : "text-slate-600"}`}>
          {active ? trueLabel : falseLabel}
        </span>
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-700">
          {active ? <FiToggleRight className="w-7 h-7 text-emerald-600" /> : <FiToggleLeft className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </label>
  );
}
