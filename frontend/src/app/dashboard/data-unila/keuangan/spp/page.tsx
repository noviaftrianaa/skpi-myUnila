"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiDollarSign, FiCheckCircle, FiClock, FiList, FiDownload } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import keuanganDataService, { type SppItem, type SppStats } from "@/lib/services/data-unila/keuanganDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";
const fmtRp = (v: number | string) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;
const fmtMilyar = (v: string) => {
  const n = Number(v || 0);
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}jt`;
  return fmtRp(n);
};

interface StatCardProps {
  icon: React.ReactNode; label: string; value: string; color: string; raw?: boolean;
}
function StatCard({ icon, label, value, color, raw }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{icon}</div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-xl font-bold text-white">{raw ? value : parseInt(value || "0").toLocaleString("id-ID")}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function SppPage() {
  useRequireAuth();
  const [data, setData] = useState<SppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_bayar");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<SppStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filterTahun, setFilterTahun] = useState("");
  const [tahunList, setTahunList] = useState<Array<{ tahun: string }>>([]);

  useEffect(() => {
    keuanganDataService.getSppStats({}).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    keuanganDataService.getSppFilters().then(r => setTahunList(r.tahun)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    keuanganDataService.getSppList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      tahun: filterTahun || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<SppItem>[] = [
    { key: "nm_pd", label: "MAHASISWA", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_pd || "-"}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nipd || "-"} · {i.nm_prodi || "-"}</div>
      </div>
    )},
    { key: "id_smt", label: "SEMESTER", width: "100px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-xs font-medium">{i.id_smt}</span>
    )},
    { key: "total_tagihan", label: "TAGIHAN", width: "140px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{fmtRp(i.total_tagihan)}</span>
    )},
    { key: "nominal", label: "TERBAYAR", width: "140px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">{fmtRp(i.nominal)}</span>
    )},
    { key: "sisa_tagihan", label: "SISA", width: "120px", align: "right" as const, render: (i) => (
      <span className={`font-mono text-sm ${Number(i.sisa_tagihan) > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>
        {Number(i.sisa_tagihan) > 0 ? fmtRp(i.sisa_tagihan) : "Lunas"}
      </span>
    )},
    { key: "flag_by", label: "STATUS", width: "90px", align: "center" as const, render: (i) => (
      <Chip size="sm" variant="flat" color={i.flag_by === "LUNAS" ? "success" : i.flag_by === "BELUM" ? "warning" : "default"}>
        {i.flag_by || "-"}
      </Chip>
    )},
    { key: "tgl_bayar", label: "TGL BAYAR", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.tgl_bayar || "-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Data SPP"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data SPP Mahasiswa</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat pembayaran SPP/UKT mahasiswa</p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FiList className="w-6 h-6" />} label="Total Transaksi" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiDollarSign className="w-6 h-6" />} label="Total Terbayar" value={fmtMilyar(stats.total_terbayar)} color="from-green-500 to-emerald-600" raw />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Lunas" value={stats.lunas} color="from-teal-500 to-cyan-600" />
            <StatCard icon={<FiClock className="w-6 h-6" />} label="Cicilan" value={stats.cicilan} color="from-amber-500 to-orange-500" />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari nama mahasiswa, NIM..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Tahun" placeholder="Semua Tahun"
                      selectedKeys={filterTahun ? [filterTahun] : []}
                      onSelectionChange={k => { setFilterTahun(Array.from(k)[0] as string || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[140px]", trigger: "h-10" }}>
                      {tahunList.map(t => <SelectItem key={String(t.tahun)}>{String(t.tahun)}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `keuangan-spp`,
                        'SPP',
                        { nm_pd: 'Nama Mahasiswa', nipd: 'NIM', nm_prodi: 'Program Studi', id_smt: 'Semester', total_tagihan: 'Tagihan', nominal: 'Terbayar', sisa_tagihan: 'Sisa', flag_by: 'Status', tgl_bayar: 'Tanggal Bayar' }
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
