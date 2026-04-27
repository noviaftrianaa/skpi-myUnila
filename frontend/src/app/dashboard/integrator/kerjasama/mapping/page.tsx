"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import kerjasamaService, {
  UnitMapping,
  UnitMappingStats,
} from "@/lib/services/kerjasama/kerjasamaService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

import {
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiX,
  FiFilter,
} from "react-icons/fi";
import { MdHandshake, MdOutlineMapsHomeWork } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

const STRATEGY_LABELS: Record<string, { label: string; color: string }> = {
  kode_prodi: { label: "Kode Prodi", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  fakultas: { label: "Fakultas", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  manual: { label: "Manual", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  univ: { label: "Univ-level", color: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  unmapped: { label: "Unmapped", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  skip: { label: "Skip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
};

export default function KerjasamaMappingPage() {
  useRequireAuth();

  const [stats, setStats] = useState<UnitMappingStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [data, setData] = useState<UnitMapping[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("");

  // Edit modal
  const [editTarget, setEditTarget] = useState<UnitMapping | null>(null);
  const [editIdSms, setEditIdSms] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const r = await kerjasamaService.getUnitMappingStats();
      if (r.success) setStats(r.data);
    } catch (e) {
      console.error("mapping stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const r = await kerjasamaService.getUnitMappingList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        strategy: strategyFilter || undefined,
      });
      if (r.success) {
        setData(r.data || []);
        setTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error("mapping list:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, rowsPerPage, searchQuery, strategyFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (m: UnitMapping) => {
    setEditTarget(m);
    setEditIdSms(m.id_sms || "");
    setEditNotes(m.notes || "");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditIdSms("");
    setEditNotes("");
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const trimmed = editIdSms.trim();
      await kerjasamaService.updateUnitMapping(editTarget.sikerma_unit_id, {
        id_sms: trimmed === "" ? null : trimmed,
        notes: editNotes.trim() === "" ? null : editNotes.trim(),
      });
      toast.success("Mapping berhasil diperbarui");
      closeEdit();
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Gagal menyimpan";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<UnitMapping>[] = [
    {
      key: "sikerma_unit_id",
      label: "ID",
      align: "center",
      render: (m) => (
        <span className="font-mono text-xs text-gray-500">{m.sikerma_unit_id}</span>
      ),
    },
    {
      key: "kode_unit",
      label: "Kode",
      align: "center",
      render: (m) => (
        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
          {m.kode_unit || "-"}
        </span>
      ),
    },
    {
      key: "unit_nama",
      label: "Nama Unit",
      render: (m) => (
        <div className="max-w-[280px]">
          <p className="font-medium text-gray-900 dark:text-white truncate" title={m.unit_nama || ""}>
            {m.unit_nama || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {m.nama_pendek}{m.jenjang ? ` · ${m.jenjang}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "nm_sms",
      label: "Mapping pdrd.sms",
      render: (m) => (
        m.id_sms ? (
          <div className="max-w-[260px]">
            <p className="text-sm text-gray-800 dark:text-gray-200 truncate" title={m.nm_sms || ""}>
              {m.nm_sms || "(unnamed)"}
            </p>
            <p className="text-[10px] font-mono text-gray-400 truncate">{m.id_sms}</p>
          </div>
        ) : (
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Belum termapping</span>
        )
      ),
    },
    {
      key: "strategy",
      label: "Strategy",
      align: "center",
      render: (m) => {
        const s = m.strategy || "unmapped";
        const cfg = STRATEGY_LABELS[s] || STRATEGY_LABELS.unmapped;
        return (
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "notes",
      label: "Catatan",
      render: (m) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block max-w-[180px]" title={m.notes || ""}>
          {m.notes || "-"}
        </span>
      ),
    },
    {
      key: "id_unit_mapping",
      label: "Aksi",
      align: "center",
      render: (m) => (
        <button
          onClick={() => openEdit(m)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <FiEdit2 className="w-3.5 h-3.5" /> Edit
        </button>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdHandshake className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Mapping Unit SIKERMA ↔ pdrd.sms"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mapping Unit Kerjasama
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Audit & override manual mapping unit SIKERMA ke <code>pdrd.sms</code> (prodi/fakultas).
            Strategy <span className="font-semibold">manual</span> tidak akan di-overwrite oleh sync berikutnya.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <MdOutlineMapsHomeWork className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">Total Unit</p>
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Mapped</p>
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.mapped || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-rose-100">Unmapped</p>
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.unmapped || 0}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy breakdown */}
        {stats?.by_strategy && Object.keys(stats.by_strategy).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Per Strategy</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.by_strategy).map(([k, v]) => {
                const cfg = STRATEGY_LABELS[k] || STRATEGY_LABELS.unmapped;
                return (
                  <span key={k} className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
                    {cfg.label}: {v}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Strategy filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Strategy:</span>
            {["", "unmapped", "kode_prodi", "fakultas", "manual", "univ"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => { setStrategyFilter(s); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  strategyFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {s === "" ? "Semua" : STRATEGY_LABELS[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <DataTable<UnitMapping>
            data={data}
            columns={columns}
            searchable
            searchPlaceholder="Cari kode_unit atau nama unit..."
            loading={isLoadingData}
            serverSide
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            defaultRowsPerPage={rowsPerPage}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FiEdit2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Mapping Unit</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editTarget.kode_unit} · {editTarget.unit_nama}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 text-xs space-y-1">
                <div><span className="font-semibold">SIKERMA Unit ID:</span> {editTarget.sikerma_unit_id}</div>
                <div><span className="font-semibold">Nama Pendek:</span> {editTarget.nama_pendek || "-"}</div>
                <div><span className="font-semibold">Jenjang:</span> {editTarget.jenjang || "-"}</div>
                <div><span className="font-semibold">Strategy saat ini:</span> {editTarget.strategy || "unmapped"}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  ID SMS (UUID dari pdrd.sms)
                </label>
                <input
                  type="text"
                  value={editIdSms}
                  onChange={(e) => setEditIdSms(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kosongkan untuk un-map. Strategy akan auto-set ke <code>manual</code>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Catatan / Alasan
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Mis. unit ini sebenarnya prodi PSDKU, atau biro yang setara fakultas, dll."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={closeEdit}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <FiX className="w-4 h-4" /> Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all disabled:opacity-60"
                >
                  <FiSave className="w-4 h-4" /> {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
