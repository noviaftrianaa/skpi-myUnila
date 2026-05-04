"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiCheck,
  FiShield,
  FiPlus,
  FiSave,
  FiX,
  FiChevronRight,
  FiEye,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import rbacMatrixService, {
  type MatrixData,
  type MatrixChange,
  type MatrixMenu,
  type MatrixRole,
  type MenuPermissions,
} from "@/lib/services/manakses/rbacMatrixService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────
interface RBACMatrixEditorProps {
  onSaved?: () => void;
}

type PermKey = "show" | "insert" | "update" | "delete";
const PERM_KEYS: PermKey[] = ["show", "insert", "update", "delete"];
const PERM_LABELS: Record<PermKey, string> = {
  show: "Lihat",
  insert: "Tambah",
  update: "Edit",
  delete: "Hapus",
};

// ────────────────────────────────────────
// Custom Checkbox
// ────────────────────────────────────────
function MatrixCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all mx-auto
        ${checked
          ? "bg-blue-500 border-blue-500"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {checked && <FiCheck className="w-3.5 h-3.5 text-white" />}
    </button>
  );
}

// ────────────────────────────────────────
// Skeleton Loader
// ────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700 animate-pulse">
      <div className="flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
      {PERM_KEYS.map((k) => (
        <div key={k} className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
      ))}
    </div>
  );
}

// ────────────────────────────────────────
// Mobile Menu Card
// ────────────────────────────────────────
function MobileMenuCard({
  menu,
  perms,
  changed,
  onToggle,
}: {
  menu: MatrixMenu;
  perms: MenuPermissions;
  changed: boolean;
  onToggle: (key: PermKey, value: boolean) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-3 mb-2 transition-all ${
        changed
          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
          : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {menu.level_menu > 0 && (
          <FiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        )}
        <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
          {menu.nm_menu}
        </span>
        {changed && (
          <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
            diubah
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {PERM_KEYS.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 dark:bg-slate-700 rounded-lg px-2 py-1.5"
            onClick={() => onToggle(key, !perms[key])}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                perms[key]
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {perms[key] ? <FiCheck className="w-3 h-3 text-white" /> : null}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {PERM_LABELS[key]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// Main Component
// ────────────────────────────────────────
export default function RBACMatrixEditor({ onSaved }: RBACMatrixEditorProps) {
  const [apps, setApps] = useState<Aplikasi[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [changes, setChanges] = useState<Map<string, MatrixChange>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingApps, setLoadingApps] = useState(true);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [addingRoleId, setAddingRoleId] = useState<string>("");
  const [addingRole, setAddingRole] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Fetch apps
  useEffect(() => {
    setLoadingApps(true);
    aplikasiService
      .getList({ limit: 100, sort_by: "nm_aplikasi" })
      .then((res) => setApps(res.data))
      .catch(() => toast.error("Gagal memuat daftar aplikasi"))
      .finally(() => setLoadingApps(false));
  }, []);

  // ── Fetch matrix
  const fetchMatrix = useCallback(
    async (appId: string) => {
      if (!appId) return;
      setLoading(true);
      setMatrix(null);
      setSelectedRole(null);
      setChanges(new Map());
      try {
        const data = await rbacMatrixService.getMatrix(appId);
        setMatrix(data);
        if (data.roles.length > 0) setSelectedRole(data.roles[0].id_peran);
      } catch {
        toast.error("Gagal memuat permission matrix");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedApp) fetchMatrix(selectedApp);
  }, [selectedApp, fetchMatrix]);

  // ── Current permissions for selected role (merged with changes)
  const getPerms = useCallback(
    (menuId: string): MenuPermissions => {
      if (!matrix || selectedRole === null) return { show: 0, insert: 0, update: 0, delete: 0 };
      const changeKey = `${selectedRole}:${menuId}`;
      if (changes.has(changeKey)) {
        const c = changes.get(changeKey)!;
        return { show: c.show, insert: c.insert, update: c.update, delete: c.delete };
      }
      return (
        matrix.assignments[selectedRole]?.[menuId] ?? {
          show: 0,
          insert: 0,
          update: 0,
          delete: 0,
        }
      );
    },
    [matrix, selectedRole, changes]
  );

  const isRowChanged = useCallback(
    (menuId: string): boolean => {
      if (selectedRole === null) return false;
      return changes.has(`${selectedRole}:${menuId}`);
    },
    [selectedRole, changes]
  );

  // ── Toggle single permission
  const handleToggle = useCallback(
    (menuId: string, key: PermKey, value: boolean) => {
      if (selectedRole === null || !matrix) return;
      const changeKey = `${selectedRole}:${menuId}`;
      const current = getPerms(menuId);
      const newPerms = { ...current, [key]: value ? 1 : 0 };

      // Check if it equals original
      const original = matrix.assignments[selectedRole]?.[menuId] ?? {
        show: 0,
        insert: 0,
        update: 0,
        delete: 0,
      };
      const isDiff =
        newPerms.show !== original.show ||
        newPerms.insert !== original.insert ||
        newPerms.update !== original.update ||
        newPerms.delete !== original.delete;

      setChanges((prev) => {
        const next = new Map(prev);
        if (isDiff) {
          next.set(changeKey, {
            id_peran: selectedRole,
            id_menu: menuId,
            ...newPerms,
          });
        } else {
          next.delete(changeKey);
        }
        return next;
      });
    },
    [selectedRole, matrix, getPerms]
  );

  // ── Quick actions
  const applyQuickAction = useCallback(
    (action: "full" | "view-only" | "none") => {
      if (!matrix || selectedRole === null) return;
      const next = new Map(changes);
      matrix.menus.forEach((menu) => {
        const changeKey = `${selectedRole}:${menu.id_menu}`;
        let newPerms: MenuPermissions;
        if (action === "full") newPerms = { show: 1, insert: 1, update: 1, delete: 1 };
        else if (action === "view-only") newPerms = { show: 1, insert: 0, update: 0, delete: 0 };
        else newPerms = { show: 0, insert: 0, update: 0, delete: 0 };

        const original = matrix.assignments[selectedRole]?.[menu.id_menu] ?? {
          show: 0, insert: 0, update: 0, delete: 0,
        };
        const isDiff =
          newPerms.show !== original.show ||
          newPerms.insert !== original.insert ||
          newPerms.update !== original.update ||
          newPerms.delete !== original.delete;

        if (isDiff) {
          next.set(changeKey, { id_peran: selectedRole, id_menu: menu.id_menu, ...newPerms });
        } else {
          next.delete(changeKey);
        }
      });
      setChanges(next);
    },
    [matrix, selectedRole, changes]
  );

  // ── Save
  const handleSave = async () => {
    if (changes.size === 0 || !selectedApp) return;
    setSaving(true);
    try {
      const result = await rbacMatrixService.bulkUpdate(
        selectedApp,
        Array.from(changes.values())
      );
      toast.success(
        `Tersimpan! ${result.inserted} ditambah, ${result.updated} diperbarui, ${result.deleted} dihapus`
      );
      setChanges(new Map());
      await fetchMatrix(selectedApp);
      onSaved?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ── Add role to app (just selects role to show in matrix)
  const handleAddRole = async () => {
    if (!addingRoleId || !matrix) return;
    const roleId = Number(addingRoleId);
    // Check if already in matrix.roles
    if (matrix.roles.some((r) => r.id_peran === roleId)) {
      toast.error("Role sudah ada di matriks aplikasi ini");
      return;
    }
    setAddingRole(true);
    try {
      // Add role by setting all permissions to 0 for all menus — backend will create records
      const initialChanges: MatrixChange[] = matrix.menus.map((m) => ({
        id_peran: roleId,
        id_menu: m.id_menu,
        show: 0,
        insert: 0,
        update: 0,
        delete: 0,
      }));
      await rbacMatrixService.bulkUpdate(selectedApp, initialChanges);
      toast.success("Role berhasil ditambahkan ke aplikasi");
      setShowAddRoleModal(false);
      setAddingRoleId("");
      await fetchMatrix(selectedApp);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambahkan role";
      toast.error(message);
    } finally {
      setAddingRole(false);
    }
  };

  // ── Available roles to add (not yet in matrix)
  const availableRolesToAdd = useMemo(() => {
    if (!matrix) return [];
    const existingIds = new Set(matrix.roles.map((r) => r.id_peran));
    return matrix.all_roles.filter((r) => !existingIds.has(r.id_peran));
  }, [matrix]);

  const changeCount = changes.size;

  // ────────────────────────────────────────
  // Render
  // ────────────────────────────────────────
  return (
    <div className="space-y-4 pb-24">
      {/* ── Header Card */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <MdSecurity className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Permission Matrix</h2>
            <p className="text-sm text-white/80">
              Kelola hak akses CRUD per role untuk setiap menu aplikasi
            </p>
          </div>
        </div>
      </div>

      {/* ── App Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Pilih Aplikasi
        </label>
        {loadingApps ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Memuat aplikasi...
          </div>
        ) : (
          <Select
            placeholder="Pilih aplikasi..."
            selectedKeys={selectedApp ? [selectedApp] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              setSelectedApp(val || "");
            }}
            classNames={{
              trigger: "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600",
            }}
          >
            {apps.map((app) => (
              <SelectItem key={app.id_aplikasi} textValue={app.nm_aplikasi}>
                <div className="flex flex-col">
                  <span className="font-medium">{app.nm_aplikasi}</span>
                  {app.url && (
                    <span className="text-xs text-gray-400">{app.url}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      {/* ── Loading state */}
      {loading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── No app selected */}
      {!loading && !matrix && selectedApp === "" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <FiShield className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Pilih aplikasi untuk mulai mengelola permission matrix
          </p>
        </div>
      )}

      {/* ── Matrix content */}
      {!loading && matrix && (
        <>
          {/* ── Role pills + Add Role */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pilih Role
              </span>
              {availableRolesToAdd.length > 0 && (
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Tambah Role
                </button>
              )}
            </div>
            {matrix.roles.length === 0 ? (
              <div className="text-center py-4">
                <FiAlertCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Belum ada role untuk aplikasi ini
                </p>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {matrix.roles.map((role) => {
                  const isActive = selectedRole === role.id_peran;
                  // Count changes for this role
                  const roleChanges = Array.from(changes.keys()).filter((k) =>
                    k.startsWith(`${role.id_peran}:`)
                  ).length;
                  return (
                    <button
                      key={role.id_peran}
                      onClick={() => {
                        setSelectedRole(role.id_peran);
                      }}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      <FiShield className="w-3.5 h-3.5" />
                      {role.nm_peran}
                      {roleChanges > 0 && (
                        <span className="w-4 h-4 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {roleChanges > 9 ? "9+" : roleChanges}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Quick Actions */}
          {selectedRole !== null && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyQuickAction("full")}
                className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiShield className="w-4 h-4" />
                Akses Penuh
              </button>
              <button
                onClick={() => applyQuickAction("view-only")}
                className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiEye className="w-4 h-4" />
                Hanya Lihat
              </button>
              <button
                onClick={() => applyQuickAction("none")}
                className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                Hapus Semua
              </button>
              {changeCount > 0 && (
                <button
                  onClick={() => setChanges(new Map())}
                  className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Reset ({changeCount})
                </button>
              )}
            </div>
          )}

          {/* ── Permission Matrix Table / Cards */}
          {selectedRole !== null && matrix.menus.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-slate-700/50 grid grid-cols-[1fr_repeat(4,_3.5rem)] items-center px-4 py-2.5 border-b border-gray-200 dark:border-slate-600">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Menu
                  </span>
                  {PERM_KEYS.map((key) => (
                    <span
                      key={key}
                      className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
                    >
                      {PERM_LABELS[key]}
                    </span>
                  ))}
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {matrix.menus.map((menu) => {
                    const perms = getPerms(menu.id_menu);
                    const changed = isRowChanged(menu.id_menu);
                    return (
                      <motion.div
                        key={menu.id_menu}
                        layout
                        className={`grid grid-cols-[1fr_repeat(4,_3.5rem)] items-center px-4 py-2.5 transition-colors ${
                          changed
                            ? "border-l-4 border-amber-400 bg-amber-50/40 dark:bg-amber-900/10"
                            : "border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/30"
                        }`}
                      >
                        {/* Menu name */}
                        <div
                          className="flex items-center gap-1 min-w-0"
                          style={{ paddingLeft: menu.level_menu * 20 }}
                        >
                          {menu.level_menu > 0 && (
                            <FiChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm truncate ${
                              menu.level_menu === 0
                                ? "font-semibold text-gray-800 dark:text-gray-200"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {menu.nm_menu}
                          </span>
                          {changed && (
                            <span className="ml-1.5 text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                              •
                            </span>
                          )}
                        </div>
                        {/* Checkboxes */}
                        {PERM_KEYS.map((key) => (
                          <MatrixCheckbox
                            key={key}
                            checked={perms[key] === 1}
                            onChange={(v) => handleToggle(menu.id_menu, key, v)}
                          />
                        ))}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-2">
                {matrix.menus.map((menu) => {
                  const perms = getPerms(menu.id_menu);
                  const changed = isRowChanged(menu.id_menu);
                  return (
                    <MobileMenuCard
                      key={menu.id_menu}
                      menu={menu}
                      perms={perms}
                      changed={changed}
                      onToggle={(key, value) => handleToggle(menu.id_menu, key, value)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* ── Empty state */}
          {selectedRole !== null && matrix.menus.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
              <FiAlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada menu untuk aplikasi ini
              </p>
            </div>
          )}

          {/* ── No role selected */}
          {selectedRole === null && matrix.roles.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
              <FiShield className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Pilih role di atas untuk melihat dan mengedit permission
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Floating Save Button */}
      <AnimatePresence>
        {changeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white
                px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:opacity-95 transition-all
                disabled:opacity-70 disabled:cursor-not-allowed
                ${changeCount > 0 && !saving ? "animate-bounce" : ""}
              `}
            >
              {saving ? (
                <Spinner size="sm" color="white" />
              ) : (
                <FiSave className="w-5 h-5" />
              )}
              <span className="font-semibold text-sm">
                {saving ? "Menyimpan..." : `Simpan ${changeCount} Perubahan`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Role Modal */}
      <AnimatePresence>
        {showAddRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowAddRoleModal(false);
                setAddingRoleId("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <FiPlus className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tambah Role ke Aplikasi
                </h3>
                <button
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setAddingRoleId("");
                  }}
                  className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Pilih role yang akan ditambahkan ke matriks permission aplikasi ini.
                </p>
                {availableRolesToAdd.length === 0 ? (
                  <div className="text-center py-8">
                    <FiAlertCircle className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Semua role sudah ada di aplikasi ini
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={addingRoleId}
                      onChange={(e) => setAddingRoleId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Pilih role...</option>
                      {availableRolesToAdd.map((role) => (
                        <option key={role.id_peran.toString()} value={role.id_peran.toString()}>
                          {role.nm_peran}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <button
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setAddingRoleId("");
                  }}
                  disabled={addingRole}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddRole}
                  disabled={!addingRoleId || addingRole}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                >
                  {addingRole && <Spinner size="sm" color="white" />}
                  Tambahkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
