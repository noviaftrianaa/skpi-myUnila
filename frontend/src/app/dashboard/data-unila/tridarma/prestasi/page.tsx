"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip , Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiAward , FiDownload } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, { type PrestasiItem } from "@/lib/services/data-unila/tridarmaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { exportToExcel } from "@/lib/utils/exportExcel";

const APP_KEY = "data-unila";
const T_COLORS: Record<string, "success"|"primary"|"warning"|"default"> = { Internasional: "success", Nasional: "primary", Regional: "warning" };

export default function PrestasiPage() {
  useRequireAuth();
  const [data, setData] = useState<PrestasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("thn_prestasi");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");

  useEffect(() => {
    setLoading(true);
    tridarmaDataService.getPrestasi({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<PrestasiItem>[] = [
    { key: "nama", label: "PRESTASI", sortable: true, render: (i) => (
      <div><div className="font-medium text-gray-900 dark:text-white text-sm">{i.nama}</div>
        {i.penyelenggara && <div className="text-xs text-gray-500 mt-0.5">{i.penyelenggara}</div>}</div>
    )},
    { key: "tingkat", label: "TINGKAT", width: "130px", render: (i) => (
      <Chip size="sm" variant="flat" color={T_COLORS[i.tingkat]||"default"}>{i.tingkat||"-"}</Chip>
    )},
    { key: "jenis", label: "JENIS", width: "130px", render: (i) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{i.jenis||"-"}</span>
    )},
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm">{i.thn_prestasi||i.tahun||"-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Prestasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Prestasi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Data prestasi mahasiswa dan dosen</p></div>
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
              onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
              searchPlaceholder="Cari prestasi..." defaultRowsPerPage={20} 
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `prestasi`,
                        'Prestasi',
                        { nama: 'Prestasi', tingkat: 'Tingkat', jenis: 'Jenis', tahun: 'Tahun' }
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
