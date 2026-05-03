"use client";

/**
 * RoleAccessPanel — RBAC matrix manager per-aplikasi.
 * Pattern A (per-app tab): mount with `appId` prop di AplikasiDetailModal.
 * Pattern B (standalone): mount di page Role-Menu Matrix dgn app selector di parent.
 *
 * Fitur:
 *  - Display matrix Role × Menu × Permission (show/insert/update/delete)
 *  - Bulk: toggle column (apply role ke semua menu) atau toggle row (semua role)
 *  - Per-cell edit dgn 4 checkbox CRUD
 *  - Add role (assign role baru ke app — auto grant 'show' ke semua menu)
 *  - Remove role (hapus akses role di app — semua menu_role row hapus)
 *  - Save batch via bulkUpdateMatrix
 *  - Tailwind only, responsive
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiSave, FiRefreshCw, FiSearch, FiCheckSquare, FiSquare,
  FiPlus, FiTrash2, FiAlertCircle, FiInfo, FiEye, FiPlusSquare,
  FiEdit, FiX, FiCopy,
} from "react-icons/fi";
import toast from "react-hot-toast";
import rbacMatrixService, {
  type MatrixMenu, type MatrixRole, type MatrixData,
  type MenuPermissions, type MatrixChange,
} from "@/lib/services/manakses/rbacMatrixService";

interface Props {
  appId: string;
  appName?: string;
  onSaved?: () => void;
}

type PermKey = "show" | "insert" | "update" | "delete";
const PERM_KEYS: PermKey[] = ["show", "insert", "update", "delete"];

export default function RoleAccessPanel({ appId, appName, onSaved }: Props) {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);

  // Local state — pending changes (sebelum save)
  // Map: { roleId: { menuId: MenuPermissions } }
  const [pending, setPending] = useState<Record<number, Record<string, MenuPermissions>>>({});

  const loadMatrix = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const r = await rbacMatrixService.getMatrix(appId);
      setData(r);
      // Initialize pending dari assignments existing
      setPending(JSON.parse(JSON.stringify(r.assignments || {})));
    } catch (err: any) {
      toast.error(`Gagal load matrix: ${err?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  // Filter menu berdasarkan search
  const visibleMenus = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.menus;
    return data.menus.filter(m =>
      m.nm_menu.toLowerCase().includes(q) ||
      (m.nm_file || "").toLowerCase().includes(q)
    );
  }, [data, search]);

  // Get permission untuk cell tertentu (pakai pending state)
  const getPerm = (roleId: number, menuId: string): MenuPermissions => {
    return pending[roleId]?.[menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
  };

  // Update cell permission
  const setPerm = (roleId: number, menuId: string, key: PermKey, value: number) => {
    setPending(prev => {
      const next = { ...prev };
      if (!next[roleId]) next[roleId] = {};
      const current = next[roleId][menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
      next[roleId][menuId] = { ...current, [key]: value };
      return next;
    });
  };

  // Toggle satu cell (toggle "show" sebagai shortcut)
  const toggleCell = (roleId: number, menuId: string) => {
    const perm = getPerm(roleId, menuId);
    const isAccessible = perm.show === 1 || perm.insert === 1 || perm.update === 1 || perm.delete === 1;
    if (isAccessible) {
      // Revoke all
      setPending(prev => {
        const next = { ...prev };
        if (next[roleId]) {
          delete next[roleId][menuId];
        }
        return next;
      });
    } else {
      // Grant view-only by default
      setPerm(roleId, menuId, "show", 1);
    }
  };

  // Bulk: grant role ke semua menu (set show=1 untuk semua menu di app)
  const grantRoleAllMenus = (roleId: number) => {
    if (!data) return;
    setPending(prev => {
      const next = { ...prev };
      if (!next[roleId]) next[roleId] = {};
      for (const m of data.menus) {
        const existing = next[roleId][m.id_menu];
        if (!existing || (existing.show === 0 && existing.insert === 0 && existing.update === 0 && existing.delete === 0)) {
          next[roleId][m.id_menu] = { show: 1, insert: 0, update: 0, delete: 0 };
        }
      }
      return next;
    });
    toast.success(`Role di-grant view ke ${data.menus.length} menu (klik Save untuk apply)`);
  };

  // Bulk: revoke role dari semua menu
  const revokeRoleAllMenus = (roleId: number) => {
    setPending(prev => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
    toast(`Role akses di-revoke (klik Save untuk apply)`, { icon: "🗑️" });
  };

  // Add role baru ke matrix
  const addRole = (roleId: number) => {
    if (!data) return;
    if (data.roles.find(r => r.id_peran === roleId)) {
      toast.error("Role sudah ada di matrix");
      return;
    }
    const role = data.all_roles.find(r => r.id_peran === roleId);
    if (!role) return;
    setData(prev => prev ? { ...prev, roles: [...prev.roles, role] } : prev);
    grantRoleAllMenus(roleId);
    setShowAddRole(false);
  };

  // Copy permissions dari role A ke role B
  const copyRolePermissions = (fromId: number, toId: number) => {
    if (!data) return;
    const source = pending[fromId];
    if (!source) {
      toast.error("Role asal tidak punya permission");
      return;
    }
    setPending(prev => ({ ...prev, [toId]: JSON.parse(JSON.stringify(source)) }));
    toast.success("Permission ter-copy (klik Save untuk apply)");
  };

  // Hitung jumlah change vs original
  const changeCount = useMemo(() => {
    if (!data) return 0;
    let count = 0;
    const orig = data.assignments || {};
    const allRoleIds = new Set([...Object.keys(orig), ...Object.keys(pending)].map(Number));
    for (const roleId of allRoleIds) {
      const o = orig[roleId] || {};
      const p = pending[roleId] || {};
      const allMenuIds = new Set([...Object.keys(o), ...Object.keys(p)]);
      for (const menuId of allMenuIds) {
        const oi = o[menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
        const pi = p[menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
        if (oi.show !== pi.show || oi.insert !== pi.insert ||
            oi.update !== pi.update || oi.delete !== pi.delete) {
          count++;
        }
      }
    }
    return count;
  }, [data, pending]);

  // Save batch
  const saveChanges = async () => {
    if (!data || changeCount === 0) {
      toast("Tidak ada perubahan", { icon: "ℹ️" });
      return;
    }
    setSaving(true);
    try {
      const changes: MatrixChange[] = [];
      const orig = data.assignments || {};
      const allRoleIds = new Set([...Object.keys(orig), ...Object.keys(pending)].map(Number));
      for (const roleId of allRoleIds) {
        const o = orig[roleId] || {};
        const p = pending[roleId] || {};
        const allMenuIds = new Set([...Object.keys(o), ...Object.keys(p)]);
        for (const menuId of allMenuIds) {
          const oi = o[menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
          const pi = p[menuId] || { show: 0, insert: 0, update: 0, delete: 0 };
          if (oi.show !== pi.show || oi.insert !== pi.insert ||
              oi.update !== pi.update || oi.delete !== pi.delete) {
            changes.push({ id_peran: roleId, id_menu: menuId, ...pi });
          }
        }
      }
      const result = await rbacMatrixService.bulkUpdate(appId, changes);
      toast.success(`✅ Tersimpan: ${result.inserted} insert, ${result.updated} update, ${result.deleted} hapus`);
      onSaved?.();
      await loadMatrix();
    } catch (err: any) {
      toast.error(`Gagal save: ${err?.message || "unknown"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <FiRefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Memuat matrix akses...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400">
        <FiAlertCircle className="w-10 h-10 mx-auto mb-2" />
        <p className="text-sm">Data tidak tersedia</p>
      </div>
    );
  }

  // Roles untuk dropdown "Add Role" (yang belum ada di matrix)
  const availableRolesToAdd = data.all_roles.filter(
    r => !data.roles.find(rr => rr.id_peran === r.id_peran)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header — info + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiCheckSquare className="w-5 h-5 text-blue-600" />
            Matrix Akses Role × Menu
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {appName ? `Aplikasi: ${appName} · ` : ""}
            {data.roles.length} role × {data.menus.length} menu
            {changeCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                {changeCount} perubahan belum tersimpan
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMatrix}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Reload
          </button>
          <button
            onClick={saveChanges}
            disabled={saving || changeCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              changeCount > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
            Simpan {changeCount > 0 && `(${changeCount})`}
          </button>
        </div>
      </div>

      {/* Toolbar — search + add role */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari menu (judul atau path)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAddRole(s => !s)}
            disabled={availableRolesToAdd.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Tambah Role ({availableRolesToAdd.length})
          </button>
          {showAddRole && availableRolesToAdd.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-72 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="px-3 py-2 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                Pilih role untuk grant akses
              </div>
              {availableRolesToAdd.map(r => (
                <button
                  key={r.id_peran}
                  onClick={() => addRole(r.id_peran)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="font-semibold text-gray-800">{r.nm_peran}</div>
                  <div className="text-[10px] text-gray-400">id: {r.id_peran}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {data.roles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FiInfo className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">Belum ada role yang ter-assign ke aplikasi ini</p>
          <p className="text-xs text-gray-400">Klik <span className="font-semibold">"Tambah Role"</span> untuk grant akses ke role pertama</p>
        </div>
      )}

      {/* Matrix grid */}
      {data.roles.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-b from-blue-50 to-blue-100/50 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-3 font-bold text-gray-700 border-b border-blue-200 min-w-[260px] sticky left-0 bg-blue-50 z-20">
                    Menu
                  </th>
                  {data.roles.map(role => (
                    <th key={role.id_peran} className="px-2 py-3 font-bold text-gray-700 border-b border-l border-blue-200 min-w-[160px] text-center">
                      <div className="flex flex-col gap-1.5 items-center">
                        <span className="text-[11px] font-bold">{role.nm_peran}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => grantRoleAllMenus(role.id_peran)}
                            title="Grant view ke semua menu"
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          >
                            Set All
                          </button>
                          <button
                            onClick={() => revokeRoleAllMenus(role.id_peran)}
                            title="Revoke akses di semua menu"
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200"
                          >
                            Clear
                          </button>
                          <CopyDropdown
                            currentRoleId={role.id_peran}
                            roles={data.roles}
                            onCopy={(fromId) => copyRolePermissions(fromId, role.id_peran)}
                          />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleMenus.map((menu, idx) => (
                  <tr key={menu.id_menu} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-2 border-b border-gray-100 sticky left-0 bg-inherit z-10">
                      <div className="flex flex-col" style={{ paddingLeft: `${(menu.level_menu || 0) * 12}px` }}>
                        <span className="font-semibold text-gray-800 text-[12px]">{menu.nm_menu}</span>
                        {menu.nm_file && (
                          <span className="text-[10px] text-gray-400 font-mono truncate max-w-[240px]">{menu.nm_file}</span>
                        )}
                      </div>
                    </td>
                    {data.roles.map(role => {
                      const perm = getPerm(role.id_peran, menu.id_menu);
                      const hasAccess = perm.show + perm.insert + perm.update + perm.delete > 0;
                      return (
                        <td
                          key={role.id_peran}
                          className={`px-2 py-2 border-b border-l border-gray-100 text-center ${
                            hasAccess ? "bg-emerald-50/40" : ""
                          }`}
                        >
                          <PermissionCell
                            perm={perm}
                            onChange={(key, val) => setPerm(role.id_peran, menu.id_menu, key, val)}
                            onToggle={() => toggleCell(role.id_peran, menu.id_menu)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {visibleMenus.length === 0 && (
                  <tr>
                    <td colSpan={data.roles.length + 1} className="px-3 py-12 text-center text-gray-400 text-xs">
                      Tidak ada menu yang cocok dengan pencarian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      {data.roles.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-2">
          <span className="flex items-center gap-1">
            <FiEye className="w-3 h-3 text-blue-600" /> View
          </span>
          <span className="flex items-center gap-1">
            <FiPlusSquare className="w-3 h-3 text-emerald-600" /> Insert
          </span>
          <span className="flex items-center gap-1">
            <FiEdit className="w-3 h-3 text-amber-600" /> Update
          </span>
          <span className="flex items-center gap-1">
            <FiTrash2 className="w-3 h-3 text-rose-600" /> Delete
          </span>
          <span className="ml-auto text-gray-400">
            Klik kotak hijau untuk toggle akses · cell hover untuk fine-tune CRUD
          </span>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function PermissionCell({
  perm,
  onChange,
  onToggle,
}: {
  perm: MenuPermissions;
  onChange: (key: PermKey, val: number) => void;
  onToggle: () => void;
}) {
  const hasAny = perm.show + perm.insert + perm.update + perm.delete > 0;
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
          hasAny
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
        }`}
        title={hasAny ? "Klik untuk revoke akses" : "Klik untuk grant view"}
      >
        {hasAny ? <FiCheckSquare className="w-3.5 h-3.5" /> : <FiSquare className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">
          {hasAny ? `${[perm.show && "V", perm.insert && "I", perm.update && "U", perm.delete && "D"].filter(Boolean).join("")}` : "—"}
        </span>
      </button>
      {hover && hasAny && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-30 flex flex-col gap-1 min-w-[110px]">
          {(["show", "insert", "update", "delete"] as PermKey[]).map(key => (
            <label key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700 cursor-pointer hover:bg-gray-50 px-1.5 py-1 rounded">
              <input
                type="checkbox"
                checked={perm[key] === 1}
                onChange={(e) => onChange(key, e.target.checked ? 1 : 0)}
                className="w-3 h-3 rounded border-gray-300"
              />
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyDropdown({
  currentRoleId,
  roles,
  onCopy,
}: {
  currentRoleId: number;
  roles: MatrixRole[];
  onCopy: (fromId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const others = roles.filter(r => r.id_peran !== currentRoleId);

  if (others.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Copy permission dari role lain"
        className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200"
      >
        <FiCopy className="w-2.5 h-2.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-30">
          <div className="px-2 py-1 border-b text-[9px] uppercase font-bold text-gray-400">Copy dari:</div>
          {others.map(r => (
            <button
              key={r.id_peran}
              onClick={() => { onCopy(r.id_peran); setOpen(false); }}
              className="w-full text-left px-2 py-1 text-[10px] font-semibold text-gray-700 hover:bg-blue-50 transition-colors"
            >
              {r.nm_peran}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
