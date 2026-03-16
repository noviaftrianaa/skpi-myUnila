"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Select, SelectItem, Spinner } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiActivity, FiUsers, FiBook, FiStar } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import mahasiswaDataService, { type AktivitasItem, type AktivitasStats, type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";

const JENIS_COLORS: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  "KKN": "primary", "PKL/Magang": "secondary", "MBKM": "success",
  "Penelitian": "primary", "Kompetisi": "warning", "Lomba": "warning",
  "Pertukaran Mahasiswa": "success", "Pengabdian Masyarakat": "secondary",
};

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

export default function AktivitasPage() {
  useRequireAuth();
  const [data, setData] = useState<AktivitasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id_smt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<AktivitasStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  useEffect(() => {
    mahasiswaDataService.getAktivitasStats({}).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    mahasiswaDataService.getAktivitas({
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

  const columns: Column<AktivitasItem>[] = [
    { key: "judul", label: "JUDUL AKTIVITAS", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nm_prodi} · {i.nm_fakultas}</div>
      </div>
    )},
    { key: "jenis_aktivitas", label: "JENIS", width: "150px", sortable: true, render: (i) => (
      <Chip size="sm" variant="flat" color={JENIS_COLORS[i.jenis_aktivitas] || "default"} className="text-xs">{i.jenis_aktivitas}</Chip>
    )},
    { key: "id_smt", label: "SEMESTER", width: "100px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{i.id_smt || "-"}</span>
    )},
    { key: "tgl_mulai", label: "MULAI", width: "100px", sortable: true, render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.tgl_mulai || "-"}</span>
    )},
    { key: "lokasi_kegiatan", label: "LOKASI", width: "160px", render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{i.lokasi_kegiatan || "-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Aktivitas Mahasiswa"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Aktivitas Mahasiswa</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">KKN, PKL, MBKM, dan kegiatan mahasiswa lainnya</p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FiActivity className="w-6 h-6" />} label="Total Aktivitas" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Prodi" value={stats.total_prodi} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiBook className="w-6 h-6" />} label="Kegiatan Akademik" value={stats.akademik} color="from-green-500 to-emerald-600" />
            <StatCard icon={<FiStar className="w-6 h-6" />} label="Non-Akademik" value={stats.non_akademik} color="from-amber-500 to-orange-500" />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari judul aktivitas, lokasi..." defaultRowsPerPage={20}
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
