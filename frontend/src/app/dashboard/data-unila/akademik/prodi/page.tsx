"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import StatCard from "@/shared/components/data-unila/StatCard";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiAward, FiUsers, FiTrendingUp, FiDownload } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type ProdiStats } from "@/lib/services/data-unila/akademikDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";

const AK_COLORS: Record<string, "success" | "primary" | "warning" | "danger" | "default"> = {
  Unggul: "success", "Baik Sekali": "primary", A: "success", B: "primary", C: "warning",
};

export default function ProdiPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_prodi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState<ProdiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  useEffect(() => {
    akademikDataService.getProdiStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    akademikDataService
      .getProdi({
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
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_prodi}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nm_fakultas} · Jenjang {i.jenjang || "-"}</div>
      </div>
    )},
    { key: "akreditasi", label: "AKREDITASI", width: "120px", align: "center" as const, render: (i) =>
      i.akreditasi ? (
        <Chip size="sm" variant="flat" color={AK_COLORS[i.akreditasi] || "default"} className="font-bold">
          {i.akreditasi}
        </Chip>
      ) : <span className="text-gray-400 text-xs">Belum</span>
    },
    { key: "mhs_aktif", label: "MAHASISWA AKTIF", width: "140px", sortable: true, align: "end" as const, render: (i) =>
      <span className="font-mono text-sm">{Number(i.mhs_aktif || 0).toLocaleString("id-ID")}</span>
    },
    { key: "jml_dosen", label: "DOSEN", width: "90px", align: "end" as const, render: (i) =>
      <span className="font-mono text-sm">{i.jml_dosen || 0}</span>
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Program Studi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Program Studi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Daftar program studi Universitas Lampung dengan akreditasi & jumlah civitas akademika
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Prodi" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Akreditasi Unggul" value={stats.unggul} color="from-emerald-500 to-green-600" sublabel="Unggul + A" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Sarjana (S1)" value={stats.sarjana} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="Pascasarjana" value={(stats.magister || 0) + (stats.doktor || 0)} color="from-amber-500 to-orange-500" sublabel={`S2: ${stats.magister} · S3: ${stats.doktor}`} />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari nama program studi atau fakultas..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Fakultas" placeholder="Semua Fakultas"
                      selectedKeys={filterFak ? [filterFak] : []}
                      onSelectionChange={(k) => { setFilterFak((Array.from(k)[0] as string) || ""); setFilterProdi(""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}>
                      {(filters?.fakultas || []).map((f) => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `program-studi`, "Prodi",
                        { nm_prodi: "Program Studi", nm_fakultas: "Fakultas", jenjang: "Jenjang", akreditasi: "Akreditasi", mhs_aktif: "Mahasiswa Aktif", jml_dosen: "Jumlah Dosen" }
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
