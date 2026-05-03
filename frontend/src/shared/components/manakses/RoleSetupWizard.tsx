"use client";

/**
 * RoleSetupWizard — Pattern C
 * Wizard 5-step untuk setup akses cepat 1 role ke banyak aplikasi/menu sekaligus.
 * Step 1: pilih role
 * Step 2: pilih aplikasi (multi)
 * Step 3: pilih menu per aplikasi (auto-checked semua, bisa uncheck)
 * Step 4: pilih default permission (view-only / view+edit / full)
 * Step 5: review & apply
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiX, FiChevronRight, FiChevronLeft, FiCheckCircle, FiCircle,
  FiSearch, FiSave, FiRefreshCw, FiUser, FiGrid, FiList, FiShield, FiEye,
  FiEdit, FiCheck, FiAlertCircle, FiInfo, FiArrowRight, FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { peranService, type PeranOption } from "@/lib/services/manakses/peranService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { menuService, type Menu } from "@/lib/services/manakses/menuService";
import rbacMatrixService, { type MatrixChange } from "@/lib/services/manakses/rbacMatrixService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  // Optional pre-selected role
  initialRoleId?: number | null;
}

type PermPreset = "view" | "edit" | "full";

const PRESET_PERMS: Record<PermPreset, { show: number; insert: number; update: number; delete: number; label: string; desc: string }> = {
  view: { show: 1, insert: 0, update: 0, delete: 0, label: "View Only", desc: "Hanya bisa lihat menu (read-only)" },
  edit: { show: 1, insert: 1, update: 1, delete: 0, label: "View + Edit", desc: "Bisa lihat, tambah, edit (tanpa hapus)" },
  full: { show: 1, insert: 1, update: 1, delete: 1, label: "Full Access", desc: "Semua hak akses CRUD" },
};

export default function RoleSetupWizard({ isOpen, onClose, onCompleted, initialRoleId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — role
  const [roles, setRoles] = useState<PeranOption[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Step 2 — apps
  const [apps, setApps] = useState<Aplikasi[]>([]);
  const [appSearch, setAppSearch] = useState("");
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

  // Step 3 — menus per app
  // { [appId]: { menus: Menu[], selectedMenuIds: Set<string> } }
  const [appMenus, setAppMenus] = useState<Record<string, { menus: Menu[]; selected: Set<string> }>>({});

  // Step 4 — permission preset
  const [preset, setPreset] = useState<PermPreset>("view");

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRoleSearch("");
      setAppSearch("");
      setSelectedAppIds(new Set());
      setAppMenus({});
      setPreset("view");
      setSelectedRoleId(initialRoleId ?? null);
      loadInitialData();
    }
  }, [isOpen, initialRoleId]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, appsData] = await Promise.all([
        peranService.getAll(),
        aplikasiService.getList({ limit: 500, status: "aktif", sort_by: "nm_aplikasi", sort_order: "asc" }),
      ]);
      setRoles(rolesData);
      setApps(appsData.data || []);
    } catch (e: any) {
      toast.error(`Gagal load data: ${e?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered lists
  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(r => r.nm_peran.toLowerCase().includes(q));
  }, [roles, roleSearch]);

  const filteredApps = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    const list = apps.filter(a => (a.jumlah_menu || 0) > 0);
    if (!q) return list;
    return list.filter(a =>
      a.nm_aplikasi.toLowerCase().includes(q) ||
      (a.nm_kategori || "").toLowerCase().includes(q)
    );
  }, [apps, appSearch]);

  // When entering step 3, fetch menus for newly-selected apps
  useEffect(() => {
    if (step !== 3) return;
    const toFetch = Array.from(selectedAppIds).filter(id => !appMenus[id]);
    if (toFetch.length === 0) return;

    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          toFetch.map(async appId => {
            const r = await menuService.getByAplikasi(appId, "flat");
            return { appId, menus: r.menus || [] };
          })
        );
        setAppMenus(prev => {
          const next = { ...prev };
          for (const { appId, menus } of results) {
            // Default: semua menu di-checklist
            next[appId] = { menus, selected: new Set(menus.map(m => m.id_menu)) };
          }
          return next;
        });
      } catch (e: any) {
        toast.error(`Gagal load menu: ${e?.message || "unknown"}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [step, selectedAppIds]);

  // Helpers
  const toggleApp = (appId: string) => {
    setSelectedAppIds(prev => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const toggleMenu = (appId: string, menuId: string) => {
    setAppMenus(prev => {
      const next = { ...prev };
      if (!next[appId]) return prev;
      const sel = new Set(next[appId].selected);
      if (sel.has(menuId)) sel.delete(menuId);
      else sel.add(menuId);
      next[appId] = { ...next[appId], selected: sel };
      return next;
    });
  };

  const toggleAllMenusForApp = (appId: string, on: boolean) => {
    setAppMenus(prev => {
      const next = { ...prev };
      if (!next[appId]) return prev;
      next[appId] = {
        ...next[appId],
        selected: on ? new Set(next[appId].menus.map(m => m.id_menu)) : new Set(),
      };
      return next;
    });
  };

  // Validation per step
  const canNext = useMemo(() => {
    if (step === 1) return selectedRoleId !== null;
    if (step === 2) return selectedAppIds.size > 0;
    if (step === 3) {
      // At least 1 menu selected total
      return Object.values(appMenus).some(am => am.selected.size > 0);
    }
    if (step === 4) return true;
    return true;
  }, [step, selectedRoleId, selectedAppIds, appMenus]);

  // Total summary
  const totalMenusSelected = useMemo(() => {
    return Object.values(appMenus).reduce((sum, am) => sum + am.selected.size, 0);
  }, [appMenus]);

  const selectedRole = roles.find(r => r.id_peran === selectedRoleId);

  // Apply changes
  const apply = async () => {
    if (!selectedRoleId) return;
    setSubmitting(true);
    let totalInserted = 0, totalUpdated = 0, failed = 0;

    // Group changes per app, call bulkUpdate per app
    for (const appId of Array.from(selectedAppIds)) {
      const am = appMenus[appId];
      if (!am || am.selected.size === 0) continue;

      const presetVals = PRESET_PERMS[preset];
      const changes: MatrixChange[] = Array.from(am.selected).map(menuId => ({
        id_peran: selectedRoleId,
        id_menu: menuId,
        show: presetVals.show,
        insert: presetVals.insert,
        update: presetVals.update,
        delete: presetVals.delete,
      }));

      try {
        const r = await rbacMatrixService.bulkUpdate(appId, changes);
        totalInserted += r.inserted || 0;
        totalUpdated += r.updated || 0;
      } catch (e: any) {
        failed++;
        console.error(`Failed app ${appId}:`, e);
      }
    }

    setSubmitting(false);
    if (failed > 0) {
      toast.error(`Berhasil sebagian: ${totalInserted + totalUpdated} disimpan, ${failed} aplikasi gagal`);
    } else {
      toast.success(`✅ Wizard selesai: ${totalInserted} insert, ${totalUpdated} update`);
    }
    onCompleted?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Quick Setup Akses Role</h2>
              <p className="text-[11px] text-gray-500">Wizard 5-langkah untuk grant akses 1 role ke banyak aplikasi sekaligus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { n: 1, label: "Pilih Role", icon: FiUser },
              { n: 2, label: "Pilih Aplikasi", icon: FiGrid },
              { n: 3, label: "Pilih Menu", icon: FiList },
              { n: 4, label: "Permission", icon: FiShield },
              { n: 5, label: "Review", icon: FiCheck },
            ].map((s, i) => {
              const Icon = s.icon;
              const isDone = step > s.n;
              const isActive = step === s.n;
              return (
                <div key={s.n} className="flex items-center gap-1 sm:gap-2 flex-1 last:flex-none">
                  <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
                    isActive ? "bg-violet-100 text-violet-700" :
                    isDone ? "bg-emerald-100 text-emerald-700" :
                    "text-gray-400"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? "bg-violet-600 text-white" :
                      isDone ? "bg-emerald-600 text-white" :
                      "bg-gray-200 text-gray-500"
                    }`}>
                      {isDone ? <FiCheck className="w-3 h-3" /> : s.n}
                    </div>
                    <span className="text-[11px] font-semibold hidden sm:inline">{s.label}</span>
                  </div>
                  {i < 4 && <div className={`flex-1 h-0.5 ${isDone ? "bg-emerald-300" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <FiRefreshCw className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Memuat data...</span>
            </div>
          )}

          {/* STEP 1 — Pilih Role */}
          {step === 1 && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">1. Pilih Role yang akan di-setup</h3>
                <span className="text-[11px] text-gray-400">{filteredRoles.length} role</span>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari role..."
                  value={roleSearch}
                  onChange={e => setRoleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredRoles.map(r => {
                  const sel = selectedRoleId === r.id_peran;
                  return (
                    <button
                      key={r.id_peran}
                      onClick={() => setSelectedRoleId(r.id_peran)}
                      className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        sel
                          ? "border-violet-500 bg-violet-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        sel ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {sel ? <FiCheckCircle className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{r.nm_peran}</div>
                        <div className="text-[10px] text-gray-400">id: {r.id_peran}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredRoles.length === 0 && (
                  <div className="col-span-full text-center py-8 text-xs text-gray-400">
                    Tidak ada role yang cocok
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Pilih Aplikasi */}
          {step === 2 && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  2. Pilih Aplikasi <span className="text-violet-600">untuk role: {selectedRole?.nm_peran}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{selectedAppIds.size} dipilih · {filteredApps.length} aplikasi</span>
                  <button
                    onClick={() => setSelectedAppIds(new Set(filteredApps.map(a => a.id_aplikasi)))}
                    className="text-[10px] font-semibold text-violet-600 hover:underline"
                  >Pilih Semua</button>
                  {selectedAppIds.size > 0 && (
                    <button
                      onClick={() => setSelectedAppIds(new Set())}
                      className="text-[10px] font-semibold text-rose-600 hover:underline"
                    >Reset</button>
                  )}
                </div>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari aplikasi..."
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredApps.map(a => {
                  const sel = selectedAppIds.has(a.id_aplikasi);
                  return (
                    <button
                      key={a.id_aplikasi}
                      onClick={() => toggleApp(a.id_aplikasi)}
                      className={`text-left p-2.5 rounded-lg border-2 transition-all flex items-start gap-2 ${
                        sel
                          ? "border-violet-500 bg-violet-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-violet-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        {sel
                          ? <FiCheckCircle className="w-4 h-4 text-violet-600" />
                          : <FiCircle className="w-4 h-4 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{a.nm_aplikasi}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{a.nm_kategori || "-"}</span>
                          <span>·</span>
                          <span className="font-semibold">{a.jumlah_menu || 0} menu</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredApps.length === 0 && (
                  <div className="col-span-full text-center py-8 text-xs text-gray-400">
                    Tidak ada aplikasi yang cocok
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Pilih Menu per App */}
          {step === 3 && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  3. Pilih Menu yang akan diberi akses
                </h3>
                <span className="text-[11px] text-gray-400">{totalMenusSelected} menu dipilih total</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Default: semua menu di-checklist. Uncheck menu yang tidak ingin diberi akses.
              </p>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {Array.from(selectedAppIds).map(appId => {
                  const app = apps.find(a => a.id_aplikasi === appId);
                  const am = appMenus[appId];
                  if (!app) return null;
                  const totalMenu = am?.menus.length || 0;
                  const selectedCount = am?.selected.size || 0;
                  const allOn = totalMenu > 0 && selectedCount === totalMenu;
                  return (
                    <div key={appId} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-2 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <FiGrid className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-800 truncate">{app.nm_aplikasi}</span>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">{selectedCount}/{totalMenu}</span>
                        </div>
                        {am && totalMenu > 0 && (
                          <button
                            onClick={() => toggleAllMenusForApp(appId, !allOn)}
                            className="text-[10px] font-semibold text-violet-700 hover:underline flex-shrink-0"
                          >
                            {allOn ? "Uncheck All" : "Check All"}
                          </button>
                        )}
                      </div>
                      <div className="p-2 max-h-44 overflow-y-auto">
                        {!am ? (
                          <div className="text-center py-4 text-[10px] text-gray-400 flex items-center justify-center gap-2">
                            <FiRefreshCw className="w-3 h-3 animate-spin" /> memuat menu...
                          </div>
                        ) : am.menus.length === 0 ? (
                          <div className="text-center py-4 text-[10px] text-gray-400">Aplikasi ini belum punya menu</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {am.menus.map(m => {
                              const sel = am.selected.has(m.id_menu);
                              return (
                                <label
                                  key={m.id_menu}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] cursor-pointer transition-colors ${
                                    sel ? "bg-violet-50 hover:bg-violet-100" : "hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={sel}
                                    onChange={() => toggleMenu(appId, m.id_menu)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600"
                                  />
                                  <span className="font-medium text-gray-700 truncate flex-1">{m.nm_menu}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Permission Preset */}
          {step === 4 && !loading && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800">4. Pilih Default Permission</h3>
              <p className="text-[11px] text-gray-500">
                Permission ini akan di-apply ke <strong>{totalMenusSelected} menu</strong> di {selectedAppIds.size} aplikasi.
                Setelah selesai Anda masih bisa fine-tune per cell di matrix.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(PRESET_PERMS) as [PermPreset, typeof PRESET_PERMS[PermPreset]][]).map(([key, val]) => {
                  const sel = preset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setPreset(key)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        sel
                          ? "border-violet-500 bg-violet-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-violet-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {key === "view" && <FiEye className={`w-5 h-5 ${sel ? "text-violet-600" : "text-blue-500"}`} />}
                        {key === "edit" && <FiEdit className={`w-5 h-5 ${sel ? "text-violet-600" : "text-amber-500"}`} />}
                        {key === "full" && <FiShield className={`w-5 h-5 ${sel ? "text-violet-600" : "text-emerald-500"}`} />}
                        <span className="text-sm font-bold text-gray-900">{val.label}</span>
                        {sel && <FiCheckCircle className="ml-auto w-4 h-4 text-violet-600" />}
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">{val.desc}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {val.show === 1 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">VIEW</span>}
                        {val.insert === 1 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">INSERT</span>}
                        {val.update === 1 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">UPDATE</span>}
                        {val.delete === 1 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">DELETE</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 — Review */}
          {step === 5 && !loading && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800">5. Review & Konfirmasi</h3>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-bold text-violet-700">{selectedRole?.nm_peran}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Aplikasi:</span>
                  <span className="font-bold text-gray-900">{selectedAppIds.size} aplikasi</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total menu:</span>
                  <span className="font-bold text-gray-900">{totalMenusSelected} menu</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Permission preset:</span>
                  <span className="font-bold text-gray-900">{PRESET_PERMS[preset].label}</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 max-h-[260px] overflow-y-auto">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Detail per Aplikasi</p>
                <div className="space-y-1.5">
                  {Array.from(selectedAppIds).map(appId => {
                    const app = apps.find(a => a.id_aplikasi === appId);
                    const am = appMenus[appId];
                    const cnt = am?.selected.size || 0;
                    return (
                      <div key={appId} className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-gray-50">
                        <span className="font-medium text-gray-700 truncate flex-1">{app?.nm_aplikasi}</span>
                        <span className="text-violet-600 font-semibold flex-shrink-0">{cnt} menu</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">
                  Aksi ini akan menambah/mengupdate baris di tabel <code className="bg-white px-1 rounded">man_akses.menu_role</code>.
                  Permission existing untuk role ini di menu yang dipilih akan di-overwrite dengan preset di atas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
          <button
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            <FiChevronLeft className="w-3.5 h-3.5" />
            {step === 1 ? "Batal" : "Kembali"}
          </button>
          <span className="text-[11px] text-gray-400">Step {step} / 5</span>
          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Lanjut
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={apply}
              disabled={submitting || totalMenusSelected === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
              Apply Setup ({totalMenusSelected} menu)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
