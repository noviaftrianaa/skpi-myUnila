"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import unitPimpinanService, { RefUnit, PimpinanUnit, UnitStats } from "@/lib/services/siakadu/unitPimpinanService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { FiHome, FiUsers, FiRefreshCw, FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

const JNS_LABELS: Record<string, { label: string; color: string }> = {
  U: { label: "Universitas", color: "bg-purple-100 text-purple-700" },
  F: { label: "Fakultas", color: "bg-blue-100 text-blue-700" },
  J: { label: "Jurusan", color: "bg-cyan-100 text-cyan-700" },
  P: { label: "Prodi", color: "bg-emerald-100 text-emerald-700" },
  L: { label: "Lembaga", color: "bg-amber-100 text-amber-700" },
};

export default function UnitPimpinanPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<UnitStats | null>(null);
  const [data, setData] = useState<RefUnit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [jnsFilter, setJnsFilter] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  // Pimpinan modal
  const [selectedUnit, setSelectedUnit] = useState<RefUnit | null>(null);
  const [pimpinanList, setPimpinanList] = useState<PimpinanUnit[]>([]);
  const [pimpinanLoading, setPimpinanLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const r = await unitPimpinanService.getStats();
      if (r.success) setStats(r.data);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await unitPimpinanService.getList({
        page,
        limit,
        search: search || undefined,
        jns_unit: jnsFilter || undefined,
      });
      if (r.success) {
        setData(r.data || []);
        setTotal(r.meta?.total || 0);
      }
    } catch (err: any) {
      toast.error("Gagal memuat: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, jnsFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openPimpinan = async (u: RefUnit) => {
    setSelectedUnit(u);
    setPimpinanLoading(true);
    try {
      const r = await unitPimpinanService.getPimpinanByUnit(u.id_unit);
      if (r.success) setPimpinanList(r.data || []);
    } catch {
      setPimpinanList([]);
    } finally {
      setPimpinanLoading(false);
    }
  };

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");
    try {
      const interval = setInterval(() => setSyncProgress((p) => (p >= 85 ? 85 : p + 5)), 700);
      const r = await unitPimpinanService.sync(user?.name || "manual");
      clearInterval(interval);
      if (r.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(
          `Fetched: ${r.data.total_fetched} · Inserted: ${r.data.total_inserted} · Updated: ${r.data.total_updated} · Errors: ${r.data.total_errors} · Duration: ${r.data.duration}`
        );
        toast.success("Sync unit & pimpinan berhasil");
        setTimeout(async () => {
          await fetchStats();
          await fetchData();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 3000);
      } else throw new Error(r.message);
    } catch (e: any) {
      setSyncStatus("error");
      setSyncMessage(e.response?.data?.message || e.message);
      toast.error("Sync gagal");
      setTimeout(() => { setShowProgressModal(false); setSyncStatus("idle"); }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const columns: Column<RefUnit>[] = [
    {
      key: "id_unit",
      label: "ID Unit",
      render: (u) => <span className="font-mono text-xs">{u.id_unit}</span>,
    },
    {
      key: "jns_unit",
      label: "Jenis",
      align: "center",
      render: (u) => {
        const cfg = JNS_LABELS[u.jns_unit] || { label: u.jns_unit, color: "bg-gray-100 text-gray-700" };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: "nm_unit",
      label: "Nama Unit",
      render: (u) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 truncate" title={u.nm_unit || ""}>{u.nm_unit || "-"}</p>
          <p className="text-xs text-gray-500">
            {u.id_jenjang && <span className="font-mono">{u.id_jenjang}</span>}
            {u.id_parent_unit && <span> · parent: <span className="font-mono">{u.id_parent_unit}</span></span>}
          </p>
        </div>
      ),
    },
    {
      key: "akreditasi",
      label: "Akreditasi",
      align: "center",
      render: (u) => (
        <div className="text-xs">
          <p className="font-semibold text-gray-700">{u.akreditasi || "-"}</p>
          {u.sk_akreditasi && <p className="text-gray-400 truncate max-w-[160px]" title={u.sk_akreditasi}>SK: {u.sk_akreditasi}</p>}
        </div>
      ),
    },
    {
      key: "is_aktif",
      label: "Status",
      align: "center",
      render: (u) =>
        u.is_aktif === "1" ? (
          <span className="text-emerald-600 text-xs font-semibold">Aktif</span>
        ) : (
          <span className="text-gray-400 text-xs">Nonaktif</span>
        ),
    },
    {
      key: "id_unit",
      label: "Aksi",
      align: "center",
      render: (u) => (
        <button
          onClick={() => openPimpinan(u)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <FiUsers className="w-3.5 h-3.5" /> Pimpinan
        </button>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Unit & Pimpinan SIAKADU"
    >
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Unit & Pimpinan SIAKADU</h1>
            <p className="text-sm text-gray-600 mt-1">Sinkronisasi data unit (Universitas/Fakultas/Jurusan/Prodi) dan pimpinannya dari SIAKADU</p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSyncing ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <MdSync className="w-4 h-4" />}
            Sinkronisasi
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Unit" value={stats?.total || 0} gradient="from-blue-500 to-indigo-600" />
          <StatCard label="Aktif" value={stats?.aktif || 0} gradient="from-emerald-500 to-teal-600" />
          <StatCard label="Total Pimpinan" value={stats?.total_pimpinan || 0} gradient="from-purple-500 to-violet-600" />
          <StatCard label="Last Sync" value={stats?.last_sync ? formatRelative(stats.last_sync) : "—"} gradient="from-amber-500 to-orange-600" small />
        </div>

        {/* Per-jenis breakdown */}
        {stats?.by_jenis && stats.by_jenis.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Distribusi per Jenis Unit</p>
            <div className="flex flex-wrap gap-2">
              {stats.by_jenis.map((j) => {
                const cfg = JNS_LABELS[j.jns_unit] || { label: j.jns_unit, color: "bg-gray-100 text-gray-700" };
                return (
                  <span key={j.jns_unit} className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                    {cfg.label}: {j.jml}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Scheduler */}
        <ScheduleList syncType={"siakadu_unit" as any} />

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <select
            value={jnsFilter}
            onChange={(e) => { setJnsFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Jenis</option>
            <option value="U">Universitas</option>
            <option value="F">Fakultas</option>
            <option value="J">Jurusan</option>
            <option value="P">Prodi</option>
            <option value="L">Lembaga</option>
          </select>
          <input
            type="text"
            placeholder="Cari id_unit / nama unit..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataTable<RefUnit>
            data={data}
            columns={columns}
            loading={loading}
            serverSide
            totalRecords={total}
            currentPage={page}
            onPageChange={setPage}
            onRowsPerPageChange={(r) => { setLimit(r); setPage(1); }}
            defaultRowsPerPage={limit}
          />
        </div>
      </div>

      {/* Sync confirm */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSyncConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiHome className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Sinkronisasi Unit & Pimpinan</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">Sync semua unit (~270 record) dari SIAKADU API + pimpinan per unit. Estimasi 2-5 detik.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSyncConfirm(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleSync} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md">Ya, Sync</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                syncStatus === "success" ? "bg-green-100" : syncStatus === "error" ? "bg-red-100" : "bg-blue-100"
              }`}>
                {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6 text-green-600" /> :
                 syncStatus === "error" ? <FiXCircle className="w-6 h-6 text-red-600" /> :
                 <FiRefreshCw className="w-6 h-6 text-blue-600 animate-spin" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {syncStatus === "success" ? "Sukses" : syncStatus === "error" ? "Gagal" : "Sinkronisasi..."}
                </h3>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div className={`h-2.5 rounded-full transition-all ${
                syncStatus === "success" ? "bg-green-500" : syncStatus === "error" ? "bg-red-500" : "bg-blue-600"
              }`} style={{ width: `${syncProgress}%` }} />
            </div>
            {syncMessage && (
              <p className={`text-xs p-3 rounded-lg ${
                syncStatus === "success" ? "bg-green-50 text-green-700" : syncStatus === "error" ? "bg-red-50 text-red-700" : "text-gray-600"
              }`}>{syncMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Pimpinan modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedUnit(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUnit.nm_unit}</h3>
                <p className="text-xs text-gray-500">{selectedUnit.id_unit} · {JNS_LABELS[selectedUnit.jns_unit]?.label || selectedUnit.jns_unit}</p>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {pimpinanLoading ? (
                <div className="text-center py-8 text-gray-500">Memuat...</div>
              ) : pimpinanList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Belum ada data pimpinan</div>
              ) : (
                <div className="space-y-2">
                  {pimpinanList.map((p, i) => (
                    <div key={`${p.nip}-${p.peran}-${i}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {p.nama?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{p.nama}</p>
                        <p className="text-xs text-gray-500 font-mono">{p.nip}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{p.peran || p.jabatan || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}

function StatCard({ label, value, gradient, small }: { label: string; value: any; gradient: string; small?: boolean }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-md p-4 text-white`}>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className={small ? "text-sm font-semibold" : "text-2xl font-bold"}>{typeof value === "number" ? value.toLocaleString("id-ID") : value}</p>
    </div>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari lalu`;
}
