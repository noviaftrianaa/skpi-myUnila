"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { MdSecurity } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import {
  rolePenggunaService,
  type ImportPreviewRow,
  type ImportResult,
} from "@/lib/services/manakses/rolePenggunaService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";

const APP_KEY = "manajemen-akses";

export default function ImportAksesPage() {
  useRequireAuth();
  const [appList, setAppList] = useState<Aplikasi[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [idAplikasi, setIdAplikasi] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [dryRunning, setDryRunning] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "error" | "duplikat">("all");

  useEffect(() => {
    const load = async () => {
      setAppLoading(true);
      try {
        const res = await aplikasiService.getList({ limit: 200, page: 1 });
        setAppList(res.data || []);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Gagal load daftar aplikasi");
      } finally {
        setAppLoading(false);
      }
    };
    load();
  }, []);

  const downloadTemplate = async () => {
    if (!idAplikasi) {
      toast.error("Pilih aplikasi target terlebih dahulu");
      return;
    }
    setDownloading(true);
    try {
      const blob = await rolePenggunaService.getImportTemplate(idAplikasi);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const appName =
        appList.find((x) => x.id_aplikasi === idAplikasi)?.nm_aplikasi?.replace(/\s+/g, "-").toLowerCase() ||
        "app";
      a.href = url;
      a.download = `template_import_role_${appName}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template Excel berhasil diunduh");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal download template");
    } finally {
      setDownloading(false);
    }
  };

  const handleDryRun = async () => {
    if (!file) return;
    setDryRunning(true);
    setPreview(null);
    try {
      const res = await rolePenggunaService.importBulk(file, true, idAplikasi || undefined);
      setPreview(res);
      toast.success(
        `Preview: ${res.rows_ok || 0} OK, ${res.rows_error || 0} error, ${res.rows_duplikat || 0} duplikat`
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal preview");
    } finally {
      setDryRunning(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    if (!confirm(`Commit import ${preview?.rows_ok || 0} baris OK ke database?`)) return;
    setCommitting(true);
    try {
      const res = await rolePenggunaService.importBulk(file, false, idAplikasi || undefined);
      toast.success(`${res.inserted ?? 0} role berhasil di-import!`);
      setPreview(null);
      setFile(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal commit import");
    } finally {
      setCommitting(false);
    }
  };

  const filteredPreview = useMemo<ImportPreviewRow[]>(() => {
    if (!preview?.preview) return [];
    if (filterStatus === "all") return preview.preview;
    return preview.preview.filter((r) => r.status === filterStatus);
  }, [preview, filterStatus]);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Bulk Import Akses"
    >
      <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Link href="/dashboard/manajemen-akses" className="hover:text-blue-600 dark:hover:text-blue-400">
            Manajemen Akses
          </Link>
          <Icon icon="heroicons:chevron-right" className="h-3 w-3" />
          <span className="text-gray-700 dark:text-slate-300">Bulk Import Akses</span>
        </nav>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bulk Import Akses Pengguna</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload CSV untuk assign role secara batch. Hanya untuk peran fungsional —
            peran identitas (Mhs/Dosen/Tendik) auto-sync via SSO.
          </p>
        </div>
      </div>

      {/* Step 1: Pilih aplikasi & download template */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            1
          </span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Pilih Aplikasi & Download Template
          </h3>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-slate-400">
          Pilih aplikasi target terlebih dahulu — template Excel akan berisi daftar peran fungsional
          yang valid + sheet referensi UUID unit organisasi.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
              Aplikasi Target
            </label>
            <select
              value={idAplikasi}
              onChange={(e) => setIdAplikasi(e.target.value)}
              disabled={appLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
            >
              <option value="">— Pilih aplikasi target —</option>
              {appList.map((a) => (
                <option key={a.id_aplikasi} value={a.id_aplikasi}>
                  {a.nm_aplikasi}
                </option>
              ))}
            </select>
          </div>
          {idAplikasi && (
            <button
              type="button"
              onClick={downloadTemplate}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition disabled:opacity-50"
            >
              {downloading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" />
              ) : (
                <Icon icon="heroicons:arrow-down-tray" className="h-4 w-4" />
              )}
              Download Template Excel
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Upload */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            2
          </span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload File CSV</h3>
        </div>
        <label
          htmlFor="csv-file"
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition ${
            file
              ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-700/50 dark:bg-emerald-900/10"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-600 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10"
          }`}
        >
          <Icon
            icon={file ? "heroicons:check-circle" : "heroicons:document-arrow-up"}
            className={`h-10 w-10 ${file ? "text-emerald-500" : "text-gray-400 dark:text-slate-500"}`}
          />
          {file ? (
            <>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{file.name}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(1)} KB · klik untuk ganti
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Klik atau drop file CSV di sini
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Maks. 5 MB</div>
            </>
          )}
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setPreview(null);
            }}
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDryRun}
            disabled={!file || dryRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {dryRunning ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                Memvalidasi...
              </>
            ) : (
              <>
                <Icon icon="heroicons:eye" className="h-4 w-4" />
                Preview & Validasi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Preview */}
      {preview && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-gray-200 p-5 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                3
              </span>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Preview Hasil Validasi</h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total Baris" value={preview.total_rows} icon="heroicons:document-text" colorClass="bg-gray-500" />
              <Stat label="Valid" value={preview.rows_ok ?? 0} icon="heroicons:check-circle" colorClass="bg-emerald-500" />
              <Stat label="Error" value={preview.rows_error ?? 0} icon="heroicons:x-circle" colorClass="bg-red-500" />
              <Stat label="Duplikat" value={preview.rows_duplikat ?? 0} icon="heroicons:document-duplicate" colorClass="bg-amber-500" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {(["all", "ok", "error", "duplikat"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatus(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      filterStatus === s
                        ? "bg-blue-500 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {s === "all" ? "Semua" : s === "ok" ? "Valid" : s === "error" ? "Error" : "Duplikat"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCommit}
                disabled={committing || (preview.rows_ok ?? 0) === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {committing ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="h-4 w-4" />
                    Commit Import ({preview.rows_ok ?? 0} baris OK)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/40">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <th className="px-4 py-2 w-12">#</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Peran</th>
                  <th className="px-4 py-2">SK</th>
                  <th className="px-4 py-2">Tgl Kadaluarsa</th>
                  <th className="px-4 py-2">Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredPreview.map((r) => (
                  <tr
                    key={r.line}
                    className={
                      r.status === "error"
                        ? "bg-red-50/40 dark:bg-red-900/10"
                        : r.status === "duplikat"
                        ? "bg-amber-50/40 dark:bg-amber-900/10"
                        : ""
                    }
                  >
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">{r.line}</td>
                    <td className="px-4 py-2">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{r.username || "—"}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-slate-300">
                      {r.nm_peran || (r.id_peran ? `ID #${r.id_peran}` : "—")}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-slate-300">
                      {r.no_sk || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-slate-300">{r.tgl_kadaluarsa}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">
                      {r.errors.length > 0 ? (
                        <span className="text-red-600 dark:text-red-400">{r.errors.join("; ")}</span>
                      ) : r.status === "duplikat" ? (
                        <span className="text-amber-600 dark:text-amber-400">Sudah ada role aktif</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPreview.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                      Tidak ada baris dengan status "{filterStatus}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

function Stat({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-slate-700 dark:bg-slate-700/30">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${colorClass}`}>
        <Icon icon={icon} className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-medium uppercase text-gray-500 dark:text-slate-400">{label}</div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">{value.toLocaleString("id-ID")}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "ok" | "error" | "duplikat" }) {
  const map = {
    ok: { cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Valid", icon: "heroicons:check" },
    error: { cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: "Error", icon: "heroicons:x-mark" },
    duplikat: { cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: "Duplikat", icon: "heroicons:document-duplicate" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>
      <Icon icon={m.icon} className="h-3 w-3" />
      {m.label}
    </span>
  );
}
