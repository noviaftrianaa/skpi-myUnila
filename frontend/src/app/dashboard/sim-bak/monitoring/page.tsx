"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiAward, FiDownload, FiClock, FiTrendingUp, FiSearch, FiCheck, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getMahasiswaAktif, getLulusan, getMonitoringStats, getRefFakultas, getRefProdi, exportMonitoring } from "@/lib/services/sim-bak/simBakService";
import toast, { Toaster } from "react-hot-toast";

const tabs = [
  { key: "aktif", label: "Mahasiswa Aktif", icon: <FiUsers className="w-4 h-4" /> },
  { key: "lulusan", label: "Lulusan", icon: <FiAward className="w-4 h-4" /> },
];

export default function MonitoringPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("aktif");
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<{ total_aktif: number; total_lulus: number; persen_tepat_waktu: number; rata_masa_studi: number } | null>(null);

  // Filter
  const [fakultasList, setFakultasList] = useState<Array<{ id_fakultas: string; nm_fakultas: string }>>([]);
  const [prodiList, setProdiList] = useState<Array<{ id_prodi: string; nm_prodi: string; nm_jenjang: string }>>([]);
  const [filters, setFilters] = useState({ id_fakultas: "", id_prodi: "", jenjang: "", angkatan: "", tahun_lulus: "", search: "" });

  // Data
  const [aktifData, setAktifData] = useState<Array<Record<string, unknown>>>([]);
  const [aktifTotal, setAktifTotal] = useState(0);
  const [lulusanData, setLulusanData] = useState<Array<Record<string, unknown>>>([]);
  const [lulusanTotal, setLulusanTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(false);

  // Init
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getMonitoringStats().then(setStats).catch(() => {}),
      getRefFakultas().then(setFakultasList).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  // Load prodi saat fakultas berubah
  useEffect(() => {
    if (filters.id_fakultas) {
      getRefProdi(filters.id_fakultas).then(setProdiList).catch(() => {});
    } else {
      setProdiList([]);
    }
  }, [filters.id_fakultas]);

  // Fetch data on tab/filter/page change
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (filters.id_fakultas) params.id_fakultas = filters.id_fakultas;
      if (filters.id_prodi) params.id_prodi = filters.id_prodi;
      if (filters.jenjang) params.jenjang = filters.jenjang;
      if (filters.search) params.search = filters.search;

      if (activeTab === "aktif") {
        if (filters.angkatan) params.angkatan = filters.angkatan;
        const result = await getMahasiswaAktif(params as Parameters<typeof getMahasiswaAktif>[0]);
        setAktifData(result.data ?? []);
        setAktifTotal(result.pagination?.total ?? 0);
      } else {
        if (filters.tahun_lulus) params.tahun_lulus = filters.tahun_lulus;
        const result = await getLulusan(params as Parameters<typeof getLulusan>[0]);
        setLulusanData(result.data ?? []);
        setLulusanTotal(result.pagination?.total ?? 0);
      }
    } catch { /* fallback empty */ }
    finally { setDataLoading(false); }
  }, [activeTab, page, filters]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleExport = async () => {
    try {
      // Direct download via window.open
      const params = new URLSearchParams();
      params.set("type", activeTab === "aktif" ? "aktif" : "lulusan");
      if (filters.id_fakultas) params.set("id_fakultas", filters.id_fakultas);
      if (filters.id_prodi) params.set("id_prodi", filters.id_prodi);
      if (filters.jenjang) params.set("jenjang", filters.jenjang);
      if (filters.angkatan) params.set("angkatan", filters.angkatan);
      if (filters.tahun_lulus) params.set("tahun_lulus", filters.tahun_lulus);

      const baseUrl = process.env.NEXT_PUBLIC_BAK_API_URL || "http://localhost:9002/api/v1";
      window.open(`${baseUrl}/monitoring/export?${params.toString()}`, "_blank");
      toast.success("Export dimulai...");
    } catch {
      toast.error("Gagal export data");
    }
  };

  const resetFilters = () => {
    setFilters({ id_fakultas: "", id_prodi: "", jenjang: "", angkatan: "", tahun_lulus: "", search: "" });
    setPage(1);
  };

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const aktifColumns: Column<Record<string, unknown>>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-xs">{String(item.nim)}</span> },
    { key: "nm_mahasiswa", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{String(item.nm_mahasiswa)}</span> },
    { key: "nm_prodi", label: "Prodi", render: (item) => <span className="text-sm text-gray-600">{String(item.nm_prodi ?? "-")}</span> },
    { key: "nm_fakultas", label: "Fakultas", render: (item) => <span className="text-sm text-gray-600">{String(item.nm_fakultas ?? "-")}</span> },
    { key: "nm_jenjang", label: "Jenjang", render: (item) => <Chip size="sm" variant="flat">{String(item.nm_jenjang ?? "-")}</Chip> },
    { key: "angkatan", label: "Angkatan", align: "center" as const, render: (item) => <span className="text-sm">{String(item.angkatan ?? "-")}</span> },
    { key: "semester_aktif", label: "Semester", align: "center" as const, render: (item) => <span className="text-sm">{String(item.semester_aktif ?? "-")}</span> },
    { key: "ipk", label: "IPK", align: "center" as const, render: (item) => <span className="text-sm">{String(item.ipk ?? "-")}</span> },
  ];

  const lulusanColumns: Column<Record<string, unknown>>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-xs">{String(item.nim)}</span> },
    { key: "nm_mahasiswa", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{String(item.nm_mahasiswa)}</span> },
    { key: "nm_prodi", label: "Prodi", render: (item) => <span className="text-sm text-gray-600">{String(item.nm_prodi ?? "-")}</span> },
    { key: "nm_jenjang", label: "Jenjang", render: (item) => <Chip size="sm" variant="flat">{String(item.nm_jenjang ?? "-")}</Chip> },
    { key: "angkatan", label: "Angkatan", align: "center" as const, render: (item) => <span className="text-sm">{String(item.angkatan ?? "-")}</span> },
    { key: "tahun_lulus", label: "Lulus", align: "center" as const, render: (item) => <span className="text-sm">{String(item.tahun_lulus ?? "-")}</span> },
    { key: "masa_studi_semester", label: "Masa Studi", align: "center" as const, render: (item) => <span className="text-sm">{String(item.masa_studi_semester ?? "-")} smt</span> },
    { key: "ipk", label: "IPK", align: "center" as const, render: (item) => <span className="text-sm">{String(item.ipk ?? "-")}</span> },
    { key: "tepat_waktu", label: "Tepat Waktu", align: "center" as const, render: (item) => (
      item.tepat_waktu
        ? <Chip size="sm" color="success" variant="flat" startContent={<FiCheck className="w-3 h-3" />}>Ya</Chip>
        : <Chip size="sm" color="danger" variant="flat" startContent={<FiX className="w-3 h-3" />}>Tidak</Chip>
    )},
  ];

  const selectClass = "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Monitoring Mahasiswa">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoring Mahasiswa</h1>

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Mahasiswa Aktif", value: stats.total_aktif.toLocaleString("id-ID"), icon: <FiUsers />, gradient: "from-blue-500 to-blue-600" },
              { label: "Total Lulusan", value: stats.total_lulus.toLocaleString("id-ID"), icon: <FiAward />, gradient: "from-emerald-500 to-green-600" },
              { label: "Tepat Waktu", value: `${stats.persen_tepat_waktu}%`, icon: <FiTrendingUp />, gradient: "from-violet-500 to-purple-600" },
              { label: "Rata-rata Studi", value: `${stats.rata_masa_studi} smt`, icon: <FiClock />, gradient: "from-amber-500 to-orange-500" },
            ].map(s => (
              <Card key={s.label} className="border-none shadow-md rounded-xl"><CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}>{s.icon}</div>
                  <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
                </div>
              </CardBody></Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Cari</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                placeholder="NIM, nama, prodi..."
                className={`${selectClass} pl-9 w-full`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fakultas</label>
            <select value={filters.id_fakultas} onChange={e => { setFilters(f => ({ ...f, id_fakultas: e.target.value, id_prodi: "" })); setPage(1); }} className={selectClass}>
              <option value="">Semua Fakultas</option>
              {fakultasList.map(f => <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>)}
            </select>
          </div>
          {filters.id_fakultas && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prodi</label>
              <select value={filters.id_prodi} onChange={e => { setFilters(f => ({ ...f, id_prodi: e.target.value })); setPage(1); }} className={selectClass}>
                <option value="">Semua Prodi</option>
                {prodiList.map(p => <option key={p.id_prodi} value={p.id_prodi}>{p.nm_prodi} ({p.nm_jenjang})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Jenjang</label>
            <select value={filters.jenjang} onChange={e => { setFilters(f => ({ ...f, jenjang: e.target.value })); setPage(1); }} className={selectClass}>
              <option value="">Semua</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>
          {activeTab === "aktif" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Angkatan</label>
              <input type="number" value={filters.angkatan} onChange={e => { setFilters(f => ({ ...f, angkatan: e.target.value })); setPage(1); }}
                placeholder="cth: 2022" className={`${selectClass} w-24`} />
            </div>
          )}
          {activeTab === "lulusan" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tahun Lulus</label>
              <input type="number" value={filters.tahun_lulus} onChange={e => { setFilters(f => ({ ...f, tahun_lulus: e.target.value })); setPage(1); }}
                placeholder="cth: 2025" className={`${selectClass} w-24`} />
            </div>
          )}
          <Button size="sm" variant="flat" onPress={resetFilters}>Reset</Button>
          <Button size="sm" color="primary" variant="flat" startContent={<FiDownload className="w-3.5 h-3.5" />} onPress={handleExport}>
            Export CSV
          </Button>
        </div>

        {/* Data Table */}
        {dataLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : activeTab === "aktif" ? (
          <DataTable data={aktifData} columns={aktifColumns} searchable={false} defaultRowsPerPage={20} />
        ) : (
          <DataTable data={lulusanData} columns={lulusanColumns} searchable={false} defaultRowsPerPage={20} />
        )}

        {/* Total info */}
        <p className="text-xs text-gray-400 text-center">
          Menampilkan {activeTab === "aktif" ? aktifData.length : lulusanData.length} dari {activeTab === "aktif" ? aktifTotal : lulusanTotal} data
        </p>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
