"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import StatCard from "@/shared/components/data-unila/StatCard";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiBook, FiDownload, FiLayers, FiActivity, FiBarChart2 } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type MatkulStats } from "@/lib/services/data-unila/akademikDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";

export default function MatkulPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_mk");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState<MatkulStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  useEffect(() => {
    akademikDataService.getMatkulStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    akademikDataService
      .getMatkul({
        page, limit,
        search: search || undefined,
        sort_by: sortBy, sort_order: sortOrder,
        id_fakultas: filterFak || undefined,
        id_prodi: filterProdi || undefined,
      })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "kode_mk", label: "KODE", width: "110px", sortable: true, render: (i) =>
      <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">{i.kode_mk || "-"}</span>
    },
    { key: "nm_mk", label: "MATA KULIAH", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nm_mk}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nm_prodi} · {i.nm_fakultas}</div>
      </div>
    )},
    { key: "sks_mk", label: "SKS", width: "70px", sortable: true, align: "center" as const, render: (i) =>
      <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{i.sks_mk}</span>
    },
    { key: "jenis_mk", label: "JENIS", width: "140px", render: (i) =>
      i.jenis_mk
        ? <Chip size="sm" variant="flat" color="default" className="text-xs">{i.jenis_mk}</Chip>
        : <span className="text-gray-400 text-xs">-</span>
    },
    { key: "sks_prak", label: "PRAKTIKUM", width: "100px", align: "center" as const, render: (i) =>
      (i.sks_prak > 0 || i.sks_prak_lap > 0)
        ? <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">{(i.sks_prak || 0) + (i.sks_prak_lap || 0)} sks</span>
        : <span className="text-gray-400 text-xs">-</span>
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Mata Kuliah"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mata Kuliah</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Daftar mata kuliah seluruh program studi Universitas Lampung
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FiBook className="w-6 h-6" />} label="Total Matkul" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiLayers className="w-6 h-6" />} label="Total SKS" value={stats.total_sks} color="from-violet-500 to-purple-600" sublabel={`Rata: ${(stats.rata_sks || 0).toFixed(1)} sks`} />
            <StatCard icon={<FiActivity className="w-6 h-6" />} label="Dgn Praktikum" value={stats.dgn_praktikum} color="from-emerald-500 to-green-600" />
            <StatCard icon={<FiBarChart2 className="w-6 h-6" />} label="Teori Saja" value={stats.teori_only} color="from-amber-500 to-orange-500" />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari nama atau kode mata kuliah..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Fakultas" placeholder="Semua Fakultas"
                      selectedKeys={filterFak ? [filterFak] : []}
                      onSelectionChange={(k) => { setFilterFak((Array.from(k)[0] as string) || ""); setFilterProdi(""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}>
                      {(filters?.fakultas || []).map((f) => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                    </Select>
                    <Select aria-label="Prodi" placeholder="Semua Prodi"
                      selectedKeys={filterProdi ? [filterProdi] : []}
                      onSelectionChange={(k) => { setFilterProdi((Array.from(k)[0] as string) || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}>
                      {(filters?.prodi || []).map((p) => <SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `mata-kuliah`, "Matkul",
                        { kode_mk: "Kode", nm_mk: "Mata Kuliah", nm_prodi: "Program Studi", nm_fakultas: "Fakultas", sks_mk: "SKS", jenis_mk: "Jenis", sks_prak: "Praktikum" }
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
