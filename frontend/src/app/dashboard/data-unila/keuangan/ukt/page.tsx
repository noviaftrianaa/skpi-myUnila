"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiList, FiCalendar, FiGrid, FiDollarSign } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import keuanganDataService, { type UktItem, type UktStats } from "@/lib/services/data-unila/keuanganDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";
const fmtRp = (v: number | string) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;

export default function UktPage() {
  useRequireAuth();
  const [data, setData] = useState<UktItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tahun");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [stats, setStats] = useState<UktStats|null>(null);
  const [filterTahun, setFilterTahun] = useState("");
  const [tahunList, setTahunList] = useState<Array<{ tahun: string }>>([]);

  useEffect(() => {
    keuanganDataService.getUktStats().then(setStats).catch(console.error);
    keuanganDataService.getUktFilters().then(r => setTahunList(r.tahun)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    keuanganDataService.getUktList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      tahun: filterTahun || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<UktItem>[] = [
    { key: "nama_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nm_prodi_pdrd || i.nama_prodi}</div>
        <div className="text-xs text-gray-500">{i.nm_fakultas_pdrd || i.nama_fakultas || "-"} · {i.jenjang || "-"}</div>
      </div>
    )},
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm font-bold">{i.tahun}</span>
    )},
    { key: "nama_kelas", label: "KELAS UKT", width: "160px", render: (i) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{i.nama_kelas}</span>
    )},
    { key: "nominal", label: "NOMINAL", width: "160px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">{fmtRp(i.nominal)}</span>
    )},
  ];

  const fmtNum = (v: string) => parseInt(v || "0").toLocaleString("id-ID");

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data UKT"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data UKT</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Uang Kuliah Tunggal per program studi dan tahun</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Total Data", v: fmtNum(stats.total), c: "from-blue-500 to-indigo-600", ic: <FiList className="w-6 h-6"/> },
              { l: "Rentang Tahun", v: `${stats.tahun_awal}–${stats.tahun_akhir}`, c: "from-green-500 to-emerald-600", ic: <FiCalendar className="w-6 h-6"/>, raw: true },
              { l: "Total Prodi", v: fmtNum(stats.total_prodi), c: "from-violet-500 to-purple-600", ic: <FiGrid className="w-6 h-6"/> },
              { l: "Rata-rata UKT", v: fmtRp(stats.avg_nominal || 0), c: "from-amber-500 to-orange-500", ic: <FiDollarSign className="w-6 h-6"/>, raw: true },
            ].map(s => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`border-none shadow-lg rounded-xl bg-gradient-to-br ${s.c}`}>
                  <CardBody className="p-4 relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"/>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{s.ic}</div>
                      <div>
                        <p className="text-xs text-white/80 uppercase">{s.l}</p>
                        <h3 className="text-xl font-bold text-white">{s.v}</h3>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                serverSide
                totalRecords={total}
                onPageChange={setPage}
                onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }}
                onSortChange={handleSort}
                searchPlaceholder="Cari nama prodi, kelas UKT..."
                defaultRowsPerPage={20}
                filterSlot={
                  <Select
                    aria-label="Tahun"
                    placeholder="Semua Tahun"
                    selectedKeys={filterTahun ? [filterTahun] : []}
                    onSelectionChange={k => { setFilterTahun(Array.from(k)[0] as string || ""); setPage(1); }}
                    size="sm" variant="bordered"
                    classNames={{ base: "w-[140px]", trigger: "h-10" }}
                  >
                    {tahunList.map(t => <SelectItem key={String(t.tahun)}>{String(t.tahun)}</SelectItem>)}
                  </Select>
                }
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
