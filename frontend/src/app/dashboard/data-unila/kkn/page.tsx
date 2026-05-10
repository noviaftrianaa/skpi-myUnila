"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import StatCard from "@/shared/components/data-unila/StatCard";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiMapPin, FiCalendar, FiHome, FiDownload } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import kknDataService, { type KknItem, type KknStats, type KknPeriode } from "@/lib/services/data-unila/kknDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";

const STATUS_COLORS: Record<string, "success" | "primary" | "warning" | "default"> = {
  Aktif: "success", Selesai: "primary", Pending: "warning",
};

export default function KknPage() {
  useRequireAuth();
  const [data, setData] = useState<KknItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_bergabung");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<KknStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [periodeList, setPeriodeList] = useState<KknPeriode[]>([]);
  const [filterPeriode, setFilterPeriode] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");

  useEffect(() => {
    kknDataService.getStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    kknDataService.getPeriode().then(setPeriodeList).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    kknDataService
      .getList({
        page, limit,
        search: search || undefined,
        sort_by: sortBy, sort_order: sortOrder,
        id_periode: filterPeriode || undefined,
        kabupaten: filterKabupaten || undefined,
      })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterPeriode, filterKabupaten]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<KknItem>[] = [
    { key: "npm", label: "NPM / NAMA", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nm_mahasiswa || "—"}</div>
        <div className="text-xs text-gray-500 mt-0.5 font-mono">{i.npm || "-"}</div>
      </div>
    )},
    { key: "nm_kelompok", label: "KELOMPOK", sortable: true, render: (i) => (
      <div>
        <div className="text-sm text-gray-700 dark:text-gray-300">{i.nm_kelompok || "-"}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.kode_kelompok}</div>
      </div>
    )},
    { key: "nm_kabupaten", label: "LOKASI", sortable: true, render: (i) => (
      <div>
        <div className="text-sm text-gray-700 dark:text-gray-300">{i.nm_kabupaten || "-"}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {i.nm_kecamatan && i.nm_desa ? `${i.nm_kecamatan} · ${i.nm_desa}` : (i.nm_kecamatan || i.nm_desa || "-")}
        </div>
      </div>
    )},
    { key: "tahun_akademik", label: "PERIODE", width: "150px", render: (i) => (
      <div>
        <div className="text-xs text-gray-700 dark:text-gray-300">{i.tahun_akademik || "-"}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nm_periode || ""}{i.gelombang ? ` Gel. ${i.gelombang}` : ""}</div>
      </div>
    )},
    { key: "status", label: "STATUS", width: "110px", align: "center" as const, render: (i) =>
      <Chip size="sm" variant="flat" color={STATUS_COLORS[i.status || ""] || "default"} className="font-medium">{i.status || "-"}</Chip>
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Data KKN"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data KKN</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kuliah Kerja Nyata (KKN) — peserta, kelompok, lokasi, dan periode pelaksanaan
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Mahasiswa" value={stats.total_mhs} color="from-blue-500 to-indigo-600" sublabel="Semua periode" />
            <StatCard icon={<FiHome className="w-6 h-6" />} label="Kelompok" value={stats.total_kelompok} color="from-emerald-500 to-green-600" />
            <StatCard icon={<FiMapPin className="w-6 h-6" />} label="Lokasi (Desa)" value={stats.total_lokasi} color="from-violet-500 to-purple-600" sublabel={`${stats.total_kabupaten} kabupaten`} />
            <StatCard icon={<FiCalendar className="w-6 h-6" />} label="Periode" value={stats.total_periode} color="from-amber-500 to-orange-500" sublabel={`Aktif: ${stats.periode_aktif}`} />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari NPM, nama mhs, kelompok, desa..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Periode" placeholder="Semua Periode"
                      selectedKeys={filterPeriode ? [filterPeriode] : []}
                      onSelectionChange={(k) => { setFilterPeriode((Array.from(k)[0] as string) || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}>
                      {periodeList.map((p) => (
                        <SelectItem key={p.id_periode}>{`${p.tahun_akademik || ""} ${p.nm_periode}${p.gelombang ? ` Gel.${p.gelombang}` : ""}`}</SelectItem>
                      ))}
                    </Select>
                    <Select aria-label="Kabupaten" placeholder="Semua Kabupaten"
                      selectedKeys={filterKabupaten ? [filterKabupaten] : []}
                      onSelectionChange={(k) => { setFilterKabupaten((Array.from(k)[0] as string) || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}>
                      {(stats?.by_kabupaten || []).map((k) => (
                        <SelectItem key={k.nm_kabupaten}>{`${k.nm_kabupaten} (${k.jml_mhs})`}</SelectItem>
                      ))}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `data-kkn`, "KKN",
                        { npm: "NPM", nm_mahasiswa: "Nama Mahasiswa", nm_kelompok: "Kelompok", kode_kelompok: "Kode Kelompok", nm_kabupaten: "Kabupaten", nm_kecamatan: "Kecamatan", nm_desa: "Desa", tahun_akademik: "Tahun Akademik", nm_periode: "Periode", status: "Status" }
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
