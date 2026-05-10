"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import StatCard from "@/shared/components/data-unila/StatCard";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiAward, FiGlobe, FiFlag, FiCalendar, FiDownload } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, { type PrestasiItem, type PrestasiStats } from "@/lib/services/data-unila/tridarmaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";

const T_COLORS: Record<string, "success" | "primary" | "warning" | "default"> = {
  Internasional: "success", Nasional: "primary", Regional: "warning",
};

export default function PrestasiPage() {
  useRequireAuth();
  const [data, setData] = useState<PrestasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("thn_prestasi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<PrestasiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filterTahun, setFilterTahun] = useState("");

  useEffect(() => {
    tridarmaDataService.getPrestasiStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    tridarmaDataService
      .getPrestasi({
        page, limit,
        search: search || undefined,
        sort_by: sortBy, sort_order: sortOrder,
        tahun: filterTahun || undefined,
      })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<PrestasiItem>[] = [
    { key: "nama", label: "PRESTASI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nama}</div>
        {i.penyelenggara && <div className="text-xs text-gray-500 mt-0.5">{i.penyelenggara}</div>}
      </div>
    )},
    { key: "tingkat", label: "TINGKAT", width: "130px", render: (i) =>
      <Chip size="sm" variant="flat" color={T_COLORS[i.tingkat] || "default"} className="font-medium">{i.tingkat || "-"}</Chip>
    },
    { key: "jenis", label: "JENIS", width: "150px", render: (i) =>
      <span className="text-sm text-gray-700 dark:text-gray-300">{i.jenis || "-"}</span>
    },
    { key: "tahun", label: "TAHUN", width: "90px", sortable: true, align: "center" as const, render: (i) =>
      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{i.thn_prestasi || i.tahun || "-"}</span>
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Prestasi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Prestasi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Catatan prestasi mahasiswa & dosen Universitas Lampung di tingkat lokal hingga internasional
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Total Prestasi" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiGlobe className="w-6 h-6" />} label="Internasional" value={stats.internasional} color="from-emerald-500 to-green-600" />
            <StatCard icon={<FiFlag className="w-6 h-6" />} label="Nasional" value={stats.nasional} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiCalendar className="w-6 h-6" />} label="Tahun Ini" value={stats.tahun_ini} color="from-amber-500 to-orange-500" sublabel={`${new Date().getFullYear()}`} />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari prestasi atau penyelenggara..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Tahun" placeholder="Semua Tahun"
                      selectedKeys={filterTahun ? [filterTahun] : []}
                      onSelectionChange={(k) => { setFilterTahun((Array.from(k)[0] as string) || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[140px]", trigger: "h-10" }}>
                      {(stats?.by_tahun || []).map((y) => (
                        <SelectItem key={String(y.tahun)}>{`${y.tahun} (${y.jumlah})`}</SelectItem>
                      ))}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `prestasi`, "Prestasi",
                        { nama: "Prestasi", penyelenggara: "Penyelenggara", tingkat: "Tingkat", jenis: "Jenis", tahun: "Tahun" }
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
