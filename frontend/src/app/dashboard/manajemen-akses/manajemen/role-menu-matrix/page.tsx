"use client";

/**
 * Role-Menu Matrix Page — standalone Pattern B
 * Bulk RBAC editor: pilih aplikasi → kelola matrix Role × Menu × Permission.
 * Tailwind only, mirip pattern WS Authorization.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import RoleAccessPanel from "@/shared/components/manakses/RoleAccessPanel";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { MdSecurity } from "react-icons/md";
import {
  FiGrid, FiSearch, FiChevronDown, FiCheckSquare, FiInfo,
  FiArrowLeft, FiZap, FiAlertCircle, FiRefreshCw,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";

const APP_KEY = "manajemen-akses";

export default function RoleMenuMatrixPage() {
  useRequireAuth();

  const [apps, setApps] = useState<Aplikasi[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Load list aplikasi (semua aktif yang punya menu)
  useEffect(() => {
    (async () => {
      try {
        setLoadingApps(true);
        const r = await aplikasiService.getList({ limit: 500, status: "aktif", sort_by: "nm_aplikasi", sort_order: "asc" });
        setApps(r.data || []);
      } catch (e: any) {
        console.error("Failed loading apps", e);
      } finally {
        setLoadingApps(false);
      }
    })();
  }, []);

  // Pre-select dari querystring ?app=xxx
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const fromQs = sp.get("app");
    if (fromQs) setSelectedAppId(fromQs);
  }, []);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a =>
      a.nm_aplikasi.toLowerCase().includes(q) ||
      (a.app_slug || "").toLowerCase().includes(q) ||
      (a.nm_kategori || "").toLowerCase().includes(q)
    );
  }, [apps, search]);

  const selectedApp = useMemo(
    () => apps.find(a => a.id_aplikasi === selectedAppId) || null,
    [apps, selectedAppId]
  );

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Matrix Role × Menu"
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/dashboard/manajemen-akses" className="hover:text-blue-600">Dashboard</Link>
              <span>/</span>
              <Link href="/dashboard/manajemen-akses/manajemen/aplikasi" className="hover:text-blue-600">Manajemen</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Matrix Role-Menu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiGrid className="text-blue-600" /> Matrix Role × Menu
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Bulk editor akses peran ke menu per-aplikasi. Pilih aplikasi di bawah, lalu atur permission CRUD per cell.
            </p>
          </div>
          <Link
            href="/dashboard/manajemen-akses/manajemen/peran"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors w-fit"
          >
            <FiZap className="w-3.5 h-3.5" />
            Quick Setup Wizard
          </Link>
        </div>

        {/* App Selector Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-5 rounded-full bg-blue-600"></span>
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">Pilih Aplikasi</h2>
            <span className="ml-auto text-[11px] text-gray-400">
              {loadingApps ? "memuat..." : `${apps.length} aplikasi tersedia`}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(s => !s)}
              disabled={loadingApps}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedApp ? (
                  <>
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {selectedApp.nm_aplikasi.charAt(0).toUpperCase()}
                    </span>
                    <div className="text-left min-w-0">
                      <div className="font-bold text-gray-900 truncate">{selectedApp.nm_aplikasi}</div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {selectedApp.nm_kategori || "-"} · {selectedApp.app_slug || selectedApp.id_aplikasi.substring(0, 8)}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400">{loadingApps ? "Memuat aplikasi..." : "— Pilih aplikasi untuk mulai —"}</span>
                )}
              </div>
              <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-[420px] overflow-hidden flex flex-col">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari aplikasi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredApps.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">Tidak ada aplikasi cocok</div>
                  ) : (
                    filteredApps.map(app => (
                      <button
                        key={app.id_aplikasi}
                        onClick={() => {
                          setSelectedAppId(app.id_aplikasi);
                          setShowDropdown(false);
                          setSearch("");
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center gap-2 ${
                          app.id_aplikasi === selectedAppId ? "bg-blue-50" : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {app.nm_aplikasi.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{app.nm_aplikasi}</div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {app.nm_kategori || "-"} · {app.jumlah_menu || 0} menu
                          </div>
                        </div>
                        {app.id_aplikasi === selectedAppId && (
                          <FiCheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick App Chips — top 8 aplikasi populer (yg punya menu paling banyak) */}
          {!selectedAppId && !loadingApps && apps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 uppercase mb-2">Akses Cepat</p>
              <div className="flex flex-wrap gap-1.5">
                {apps
                  .filter(a => (a.jumlah_menu || 0) > 0)
                  .sort((a, b) => (b.jumlah_menu || 0) - (a.jumlah_menu || 0))
                  .slice(0, 12)
                  .map(app => (
                    <button
                      key={app.id_aplikasi}
                      onClick={() => setSelectedAppId(app.id_aplikasi)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {app.nm_aplikasi}
                      <span className="text-[9px] bg-white px-1.5 py-0.5 rounded-full text-gray-500">{app.jumlah_menu}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Matrix Panel */}
        {selectedAppId ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
            <RoleAccessPanel appId={selectedAppId} appName={selectedApp?.nm_aplikasi} />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-10 text-center">
            <FiInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">Pilih Aplikasi Untuk Mulai</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Setelah memilih aplikasi, Anda dapat melihat & mengubah akses peran (role) ke setiap menu.
              Bulk-grant per role, copy permission antar role, dan simpan sekaligus.
            </p>
          </div>
        )}
      </div>

      {/* Click-outside handler */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
