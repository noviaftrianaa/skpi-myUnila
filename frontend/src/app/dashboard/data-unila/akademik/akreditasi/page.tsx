"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import StatCard from "@/shared/components/data-unila/StatCard";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiAward, FiCheckCircle, FiAlertTriangle, FiClock, FiDownload } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type AkreditasiStats } from "@/lib/services/data-unila/akademikDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";

const PERINGKAT_COLORS: Record<string, "success" | "primary" | "warning" | "danger" | "default"> = {
  Unggul: "success", "Baik Sekali": "primary", Baik: "warning", A: "success", B: "primary", C: "warning",
};

function getStatusChip(tglExpired: string | null, aktif: number): { color: any; label: string } {
  if (!aktif) return { color: "default", label: "Tidak Aktif" };
  if (!tglExpired) return { color: "success", label: "Aktif" };
  const exp = new Date(tglExpired);
  const now = new Date();
  if (exp < now) return { color: "danger", label: "Expired" };
  const days = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 90) return { color: "warning", label: `${days} hari` };
  return { color: "success", label: "Aktif" };
}

export default function AkreditasiPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_sk");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<AkreditasiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");

  useEffect(() => {
    akademikDataService.getAkreditasiStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    akademikDataService
      .getAkreditasi({
        page, limit,
        search: search || undefined,
        sort_by: sortBy, sort_order: sortOrder,
        id_fakultas: filterFak || undefined,
      })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_prodi}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nm_fakultas || "-"}</div>
      </div>
    )},
    { key: "peringkat", label: "PERINGKAT", width: "120px", align: "center" as const, sortable: true, render: (i) =>
      i.peringkat ? (
        <Chip size="sm" variant="flat" color={PERINGKAT_COLORS[i.peringkat] || "default"} className="font-bold">
          {i.peringkat}
        </Chip>
      ) : <span className="text-gray-400 text-xs">-</span>
    },
    { key: "lembaga", label: "LEMBAGA", width: "110px", render: (i) =>
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.lembaga || "-"}</span>
    },
    { key: "no_sk", label: "NOMOR SK", render: (i) =>
      <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{i.no_sk || "-"}</span>
    },
    { key: "tgl_sk", label: "TGL SK", width: "110px", sortable: true, render: (i) =>
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.tgl_sk || "-"}</span>
    },
    { key: "tgl_expired", label: "STATUS", width: "120px", align: "center" as const, render: (i) => {
      const s = getStatusChip(i.tgl_expired, i.a_aktif);
      return <Chip size="sm" variant="flat" color={s.color} className="font-medium">{s.label}</Chip>;
    }},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Akreditasi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Akreditasi Program Studi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Riwayat akreditasi program studi (BAN-PT, LAM, dan lembaga akreditasi lainnya)
          </p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Total Akreditasi" value={stats.total} color="from-blue-500 to-indigo-600" sublabel={`Aktif: ${stats.aktif}`} />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Unggul / A" value={stats.unggul} color="from-emerald-500 to-green-600" />
            <StatCard icon={<FiClock className="w-6 h-6" />} label="Akan Expired" value={stats.akan_expire} color="from-amber-500 to-orange-500" sublabel="≤90 hari ke depan" />
            <StatCard icon={<FiAlertTriangle className="w-6 h-6" />} label="Sudah Expired" value={stats.expired} color="from-red-500 to-rose-600" sublabel="Perlu re-akreditasi" />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari prodi, no SK, peringkat..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Fakultas" placeholder="Semua Fakultas"
                      selectedKeys={filterFak ? [filterFak] : []}
                      onSelectionChange={(k) => { setFilterFak((Array.from(k)[0] as string) || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}>
                      {(filters?.fakultas || []).map((f) => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `akreditasi-prodi`, "Akreditasi",
                        { nm_prodi: "Program Studi", nm_fakultas: "Fakultas", peringkat: "Peringkat", lembaga: "Lembaga", no_sk: "Nomor SK", tgl_sk: "Tgl SK", tgl_expired: "Tgl Expired" }
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
