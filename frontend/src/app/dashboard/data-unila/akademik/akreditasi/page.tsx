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

export default function AkreditasiPage() {
  useRequireAuth();
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState(""); const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_sk"); const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");

  useEffect(() => {
    setLoading(true);
    akademikDataService.getAkreditasi({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); }).catch(() => toast.error("Gagal")).finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);
  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div><div className="font-medium text-gray-900 dark:text-white">{i.nm_prodi}</div><div className="text-xs text-gray-500">{i.nm_fakultas}</div></div>
    )},
    { key: "peringkat", label: "PERINGKAT", width: "100px", sortable: true, align: "center" as const, render: (i) => (
      <Chip size="sm" variant="flat" color={i.peringkat==="Unggul"||i.peringkat==="A"?"success":i.peringkat==="Baik Sekali"||i.peringkat==="B"?"primary":"warning"} className="font-bold">{i.peringkat||"-"}</Chip>
    )},
    { key: "lembaga", label: "LEMBAGA", width: "130px", render: (i) => <span className="text-xs text-gray-600">{i.lembaga||"-"}</span> },
    { key: "tgl_sk", label: "TGL SK", width: "110px", sortable: true, render: (i) => <span className="text-xs text-gray-600">{i.tgl_sk||"-"}</span> },
    { key: "tgl_expired", label: "EXPIRED", width: "110px", render: (i) => (
      <span className={`text-xs ${i.tgl_expired && new Date(i.tgl_expired) < new Date() ? "text-red-500 font-semibold" : "text-gray-600"}`}>{i.tgl_expired||"-"}</span>
    )},
    { key: "a_aktif", label: "STATUS", width: "80px", align: "center" as const, render: (i) => (
      <Chip size="sm" variant="flat" color={i.a_aktif?"success":"default"}>{i.a_aktif?"Aktif":"Expired"}</Chip>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Akreditasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Akreditasi Prodi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{total} data akreditasi</p></div>
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n=>{setLimit(n);setPage(1);}}
              onSearchChange={q=>{setSearch(q);setPage(1);}} onSortChange={handleSort}
              searchPlaceholder="Cari prodi, SK akreditasi..." defaultRowsPerPage={20} />
          </motion.div>
        </CardBody></Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
