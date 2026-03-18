"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Select, SelectItem, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiTrendingUp, FiUsers, FiDollarSign, FiBriefcase, FiDownload } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import tracerDataService from "@/lib/services/data-unila/tracerDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
const APP_KEY = "data-unila";

export default function TracerPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState(""); const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_pengisian"); const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<MahasiswaFilters|null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  useEffect(() => { tracerDataService.getStats({}).then(setStats).catch(console.error); }, []);
  useEffect(() => { mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error); }, []);

  useEffect(() => {
    setLoading(true);
    tracerDataService.getList({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder, id_fakultas: filterFak||undefined, id_prodi: filterProdi||undefined })
      .then(r => { setData(r.data); setTotal(r.total); }).catch(() => toast.error("Gagal")).finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi]);
  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "nama_lulusan", label: "LULUSAN", sortable: true, render: (i) => (
      <div><div className="font-medium text-gray-900 dark:text-white">{i.nama_lulusan}</div>
        <div className="text-xs text-gray-500">{i.nim} · {i.nm_prodi}</div></div>
    )},
    { key: "status_lulusan", label: "STATUS", width: "120px", render: (i) => (
      <Chip size="sm" variant="flat" color={i.status_lulusan?.includes("kerja")?"success":"primary"}>{i.status_lulusan||"-"}</Chip>
    )},
    { key: "tempat_kerja", label: "TEMPAT KERJA", render: (i) => <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.tempat_kerja||"-"}</span> },
    { key: "masa_tunggu_bulan", label: "TUNGGU", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm">{i.masa_tunggu_bulan||"-"} bln</span>
    )},
    { key: "income_per_bln", label: "INCOME", width: "120px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
        {i.income_per_bln ? `Rp ${Number(i.income_per_bln).toLocaleString("id-ID")}` : "-"}
      </span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Tracer Study">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tracer Study</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Data survey lulusan Universitas Lampung</p></div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l:"Total Response", v:stats.total, c:"from-blue-500 to-indigo-600", ic:<FiUsers className="w-6 h-6"/> },
              { l:"Bekerja", v:stats.bekerja, c:"from-green-500 to-emerald-600", ic:<FiBriefcase className="w-6 h-6"/> },
              { l:"Studi Lanjut", v:stats.studi_lanjut, c:"from-violet-500 to-purple-600", ic:<MdSchool className="w-6 h-6"/> },
              { l:"Avg Income", v:stats.avg_income?`Rp${(Number(stats.avg_income)/1e6).toFixed(1)}jt`:"-", c:"from-amber-500 to-orange-500", ic:<FiDollarSign className="w-6 h-6"/>, raw:true },
            ].map(s=>(
              <Card key={s.l} className={`border-none shadow-lg rounded-xl bg-gradient-to-br ${s.c}`}>
                <CardBody className="p-4 relative"><div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"/>
                  <div className="flex items-center gap-3 relative z-10"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{s.ic}</div>
                    <div><p className="text-xs text-white/80 uppercase">{s.l}</p><h3 className="text-2xl font-bold text-white">{(s as any).raw?s.v:parseInt(s.v||"0").toLocaleString("id-ID")}</h3></div></div></CardBody></Card>
            ))}
          </div>
        )}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n=>{setLimit(n);setPage(1);}}
              onSearchChange={q=>{setSearch(q);setPage(1);}} onSortChange={handleSort}
              searchPlaceholder="Cari nama lulusan, NIM, tempat kerja..." defaultRowsPerPage={20}
              filterSlot={
                <div className="flex flex-wrap gap-2 w-full">
                  <Select aria-label="Fakultas" placeholder="Semua Fakultas" selectedKeys={filterFak?[filterFak]:[]}
                    onSelectionChange={k=>{setFilterFak(Array.from(k)[0] as string||""); setFilterProdi(""); setPage(1);}}
                    size="sm" variant="bordered" classNames={{base:"w-[200px]",trigger:"h-10"}}>
                    {(filters?.fakultas||[]).map(f=><SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                  </Select>
                  <Select aria-label="Prodi" placeholder="Semua Prodi" selectedKeys={filterProdi?[filterProdi]:[]}
                    onSelectionChange={k=>{setFilterProdi(Array.from(k)[0] as string||""); setPage(1);}}
                    size="sm" variant="bordered" classNames={{base:"w-[220px]",trigger:"h-10"}}>
                    {(filters?.prodi||[]).map(p=><SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>)}
                  </Select>
                  <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                    onPress={() => exportToExcel(
                      data as unknown as Record<string, unknown>[],
                      `tracer-study`,
                      'Tracer',
                      { nama_lulusan: 'Nama Lulusan', status_lulusan: 'Status', tempat_kerja: 'Tempat Kerja', masa_tunggu_bulan: 'Masa Tunggu (bulan)', income_per_bln: 'Income/Bulan' }
                    )}
                    className="h-10 font-medium ml-auto">Export Excel</Button>
                </div>
              }
            />
          </motion.div>
        </CardBody></Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
