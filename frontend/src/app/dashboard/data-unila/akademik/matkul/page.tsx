"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService from "@/lib/services/data-unila/akademikDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiBook } from "react-icons/fi";

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
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("asc");

  useEffect(() => {
    setLoading(true);
    akademikDataService.getMatkul({ page, limit, search: search || undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<any>[] = [
    { key: "kode_mk", label: "KODE", width: "100px", sortable: true, render: (i) => (
      <span className="font-mono text-xs font-medium text-gray-600 dark:text-gray-400">{i.kode_mk || "-"}</span>
    )},
    { key: "nm_mk", label: "MATA KULIAH", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nm_mk}</div>
        <div className="text-xs text-gray-500">{i.nm_prodi} · {i.nm_fakultas}</div>
      </div>
    )},
    { key: "sks_mk", label: "SKS", width: "60px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{i.sks_mk}</span>
    )},
    { key: "jenis_mk", label: "JENIS", width: "140px", render: (i) => (
      i.jenis_mk
        ? <Chip size="sm" variant="flat" color="default" className="text-xs">{i.jenis_mk}</Chip>
        : <span className="text-gray-400 text-xs">-</span>
    )},
    { key: "sks_prak", label: "PRAK", width: "70px", align: "center" as const, render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.sks_prak > 0 ? i.sks_prak : "-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Mata Kuliah"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBook className="text-blue-500" /> Mata Kuliah
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {total.toLocaleString("id-ID")} mata kuliah terdaftar
          </p>
        </div>

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
                searchPlaceholder="Cari nama atau kode mata kuliah..."
                defaultRowsPerPage={20}
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
