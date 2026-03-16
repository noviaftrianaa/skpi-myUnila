"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiGlobe, FiCheckCircle, FiXCircle, FiUsers } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import kerjasamaDataService from "@/lib/services/data-unila/kerjasamaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
const APP_KEY = "data-unila";

export default function KerjasamaPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState(""); const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_mulai"); const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { kerjasamaDataService.getStats().then(setStats).catch(console.error); }, []);
  useEffect(() => {
    setLoading(true);
    kerjasamaDataService.getList({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); }).catch(() => toast.error("Gagal")).finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);
  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "judul_mou", label: "JUDUL MOU", sortable: true, render: (i) => (
      <div><div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul_mou}</div>
        {i.jenis && <div className="text-xs text-gray-500 mt-0.5">{i.jenis}</div>}</div>
    )},
    { key: "mitra", label: "MITRA", sortable: true, render: (i) => <span className="text-sm text-gray-700 dark:text-gray-300">{i.mitra||"-"}</span> },
    { key: "tgl_mulai", label: "MULAI", width: "100px", sortable: true, render: (i) => <span className="text-xs text-gray-600">{i.tgl_mulai||"-"}</span> },
    { key: "tgl_selesai", label: "SELESAI", width: "100px", sortable: true, render: (i) => <span className="text-xs text-gray-600">{i.tgl_selesai||"-"}</span> },
    { key: "status", label: "STATUS", width: "90px", align: "center" as const, render: (i) => (
      <Chip size="sm" variant="flat" color={i.status==="Aktif"?"success":"default"}>{i.status}</Chip>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Kerjasama">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Kerjasama</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">MoU dan perjanjian kerjasama</p></div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l:"Total MoU", v:stats.total, c:"from-blue-500 to-indigo-600", ic:<FiGlobe className="w-6 h-6"/> },
              { l:"Aktif", v:stats.aktif, c:"from-green-500 to-emerald-600", ic:<FiCheckCircle className="w-6 h-6"/> },
              { l:"Expired", v:stats.expired, c:"from-red-500 to-rose-600", ic:<FiXCircle className="w-6 h-6"/> },
              { l:"Mitra Unik", v:stats.mitra_unik, c:"from-violet-500 to-purple-600", ic:<FiUsers className="w-6 h-6"/> },
            ].map(s=>(
              <Card key={s.l} className={`border-none shadow-lg rounded-xl bg-gradient-to-br ${s.c}`}>
                <CardBody className="p-4 relative"><div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"/>
                  <div className="flex items-center gap-3 relative z-10"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{s.ic}</div>
                    <div><p className="text-xs text-white/80 uppercase">{s.l}</p><h3 className="text-2xl font-bold text-white">{parseInt(s.v||"0").toLocaleString("id-ID")}</h3></div></div></CardBody></Card>
            ))}
          </div>
        )}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n=>{setLimit(n);setPage(1);}}
              onSearchChange={q=>{setSearch(q);setPage(1);}} onSortChange={handleSort}
              searchPlaceholder="Cari MoU, mitra..." defaultRowsPerPage={20} />
          </motion.div>
        </CardBody></Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
