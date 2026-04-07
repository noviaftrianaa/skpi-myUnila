"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiFileText, FiUsers, FiCalendar, FiGrid, FiDownload } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import dosenDataService, { type SertifikasiItem, type SertifikasiStats } from "@/lib/services/data-unila/dosenDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";

interface StatCardProps {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}
function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{icon}</div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString("id-ID") : parseInt(String(value) || "0").toLocaleString("id-ID")}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function SertifikasiPage() {
  useRequireAuth();
  const [data, setData] = useState<SertifikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<SertifikasiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  useEffect(() => {
    dosenDataService.getSertifikasiStats({}).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getSertifikasiList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<SertifikasiItem>[] = [
    { key: "nm_sdm", label: "NAMA DOSEN", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_sdm}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nidn || i.nip || "-"} · {i.nm_prodi || "-"}</div>
      </div>
    )},
    { key: "bidang_studi", label: "BIDANG STUDI", render: (i) => (
      <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.bidang_studi || "-"}</div>
    )},
    { key: "no_sert", label: "SK SERTIFIKASI", width: "180px", sortable: true, render: (i) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{i.no_sert || "-"}</span>
    )},
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm font-bold">{i.tahun || "-"}</span>
    )},
    { key: "nrg", label: "NRG", width: "150px", render: (i) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{i.nrg || "-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Sertifikasi Dosen"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sertifikasi Dosen</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat sertifikasi dosen Universitas Lampung</p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FiFileText className="w-6 h-6" />} label="Total Sertifikasi" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Dosen" value={stats.total_dosen} color="from-green-500 to-emerald-600" />
            <StatCard icon={<FiGrid className="w-6 h-6" />} label="Jenis Sertifikasi" value={stats.total_jenis} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiCalendar className="w-6 h-6" />} label="Rentang Tahun" value={stats.total_tahun} color="from-amber-500 to-orange-500" />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari nama dosen, NIDN, bidang studi..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Fakultas" placeholder="Semua Fakultas"
                      selectedKeys={filterFak ? [filterFak] : []}
                      onSelectionChange={k => { setFilterFak(Array.from(k)[0] as string || ""); setFilterProdi(""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}>
                      {(filters?.fakultas || []).map(f => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                    </Select>
                    <Select aria-label="Prodi" placeholder="Semua Prodi"
                      selectedKeys={filterProdi ? [filterProdi] : []}
                      onSelectionChange={k => { setFilterProdi(Array.from(k)[0] as string || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}>
                      {(filters?.prodi || []).map(p => <SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `dosen-sertifikasi`,
                        'Sertifikasi',
                        { nm_sdm: 'Nama Dosen', nidn: 'NIDN', bidang_studi: 'Bidang Studi', no_sert: 'SK Sertifikasi', thn_sert: 'Tahun', nrg: 'NRG' }
                      )}
                      className="h-10 font-medium ml-auto">Export Excel</Button>
                  </div>
                }
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
