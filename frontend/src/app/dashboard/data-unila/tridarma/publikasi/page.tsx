"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiLink, FiAward, FiCalendar } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, { type PublikasiItem, type PublikasiStats } from "@/lib/services/data-unila/tridarmaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";
const Q_COLORS: Record<string, "success"|"primary"|"warning"|"danger"|"default"> = { Q1: "success", Q2: "primary", Q3: "warning", Q4: "danger" };

export default function PublikasiPage() {
  useRequireAuth();
  const [data, setData] = useState<PublikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_terbit");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [stats, setStats] = useState<PublikasiStats|null>(null);

  useEffect(() => { tridarmaDataService.getPublikasiStats().then(setStats).catch(console.error); }, []);

  useEffect(() => {
    setLoading(true);
    tridarmaDataService.getPublikasi({ page, limit, search: search||undefined, sort_by: sortBy, sort_order: sortOrder })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder]);

  const handleSort = useCallback((k: string, o: "asc"|"desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<PublikasiItem>[] = [
    { key: "judul", label: "JUDUL", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul}</div>
        {i.nama_jurnal && <div className="text-xs text-gray-500 mt-0.5">{i.nama_jurnal}</div>}
      </div>
    )},
    { key: "tgl_terbit", label: "TERBIT", width: "100px", sortable: true, render: (i) => (
      <span className="text-xs text-gray-600">{i.tgl_terbit||i.tahun||"-"}</span>
    )},
    { key: "quartile", label: "Q", width: "50px", align: "center" as const, render: (i) => (
      i.quartile ? <Chip size="sm" variant="flat" color={Q_COLORS[i.quartile]||"default"} className="font-bold">{i.quartile}</Chip> : <span className="text-gray-400">-</span>
    )},
    { key: "doi", label: "DOI", width: "60px", align: "center" as const, render: (i) => (
      i.doi ? <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline"><FiLink className="w-4 h-4" /></a> : <span className="text-gray-400">-</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Publikasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Publikasi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Data publikasi dosen Universitas Lampung</p></div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Total Publikasi", v: stats.total, c: "from-blue-500 to-indigo-600", ic: <FiBookOpen className="w-6 h-6" /> },
              { l: "Ber-Quartile", v: stats.ber_quartile, c: "from-green-500 to-emerald-600", ic: <FiAward className="w-6 h-6" /> },
              { l: "Ber-DOI", v: stats.ber_doi, c: "from-violet-500 to-purple-600", ic: <FiLink className="w-6 h-6" /> },
              { l: "Rentang Tahun", v: stats.rentang_tahun, c: "from-amber-500 to-orange-500", ic: <FiCalendar className="w-6 h-6" /> },
            ].map(s => (
              <Card key={s.l} className={`border-none shadow-lg rounded-xl bg-gradient-to-br ${s.c}`}>
                <CardBody className="p-4 relative"><div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{s.ic}</div>
                    <div><p className="text-xs text-white/80 uppercase">{s.l}</p>
                      <h3 className="text-2xl font-bold text-white">{parseInt(s.v||"0").toLocaleString("id-ID")}</h3></div>
                  </div></CardBody></Card>
            ))}
          </div>
        )}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden"><CardBody className="p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
              onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
              searchPlaceholder="Cari judul, jurnal, DOI..." defaultRowsPerPage={20} />
          </motion.div>
        </CardBody></Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
