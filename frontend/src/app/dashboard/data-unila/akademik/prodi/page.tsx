"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService from "@/lib/services/data-unila/akademikDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";
const AK_COLORS: Record<string,"success"|"primary"|"warning"|"danger"|"default"> = { "Unggul":"success", "Baik Sekali":"primary", "A":"success", "B":"primary", "C":"warning" };

export default function ProdiPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState(""); const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_prodi"); const [sortOrder, setSortOrder] = useState<"asc"|"desc">("asc");

  useEffect(() => {
    setLoading(true);
    akademikDataService.getProdi({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); }).catch(() => toast.error("Gagal")).finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div><div className="font-medium text-gray-900 dark:text-white">{i.nm_prodi}</div>
        <div className="text-xs text-gray-500">{i.nm_fakultas} · {i.jenjang}</div></div>
    )},
    { key: "akreditasi", label: "AKREDITASI", width: "110px", align: "center" as const, render: (i) => (
      i.akreditasi ? <Chip size="sm" variant="flat" color={AK_COLORS[i.akreditasi]||"default"} className="font-bold">{i.akreditasi}</Chip> : <span className="text-gray-400">-</span>
    )},
    { key: "mhs_aktif", label: "MHS AKTIF", width: "100px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm">{Number(i.mhs_aktif||0).toLocaleString("id-ID")}</span>
    )},
    { key: "jml_dosen", label: "DOSEN", width: "80px", align: "right" as const, render: (i) => (
      <span className="font-mono text-sm">{i.jml_dosen||0}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Program Studi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Program Studi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{total} program studi terdaftar</p></div>
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n=>{setLimit(n);setPage(1);}}
              onSearchChange={q=>{setSearch(q);setPage(1);}} onSortChange={handleSort}
              searchPlaceholder="Cari program studi..." defaultRowsPerPage={20} />
          </motion.div>
        </CardBody></Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
