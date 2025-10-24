"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DataTable, { Column } from "./ui/DataTable";
import { Chip, Select, SelectItem } from "@heroui/react";
import dashboardService from "@/lib/services/dashboardService";
import type { ProgramStudi, ProgramStudiStatistics, ProgramStudiPeriod } from "@/lib/types/dashboardTypes";

export default function ProgramStudiTable() {
  const [data, setData] = useState<ProgramStudi[]>([]);
  const [statistics, setStatistics] = useState<ProgramStudiStatistics | null>(null);
  const [periods, setPeriods] = useState<ProgramStudiPeriod[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getAkreditasiColor = (akreditasi: string) => {
    switch (akreditasi) {
      case "Unggul": return "success";
      case "Baik Sekali": return "primary";
      case "Baik": return "warning";
      default: return "default";
    }
  };

  // Load periods on mount
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const response = await dashboardService.getProgramStudiPeriods();
        if (response.success && response.data.length > 0) {
          setPeriods(response.data);
          setSelectedPeriode(response.data[0].id_smt);
        }
      } catch (error) {
        console.error('Error loading periods:', error);
      }
    };
    loadPeriods();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (!selectedPeriode) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [listResponse, statsResponse] = await Promise.all([
          dashboardService.getProgramStudiList({
            periode: selectedPeriode,
            search: searchQuery || undefined,
            page: currentPage,
            per_page: rowsPerPage,
            sort_by: sortBy,
            sort_order: sortOrder,
          }),
          dashboardService.getProgramStudiStatistics({
            periode: selectedPeriode,
          })
        ]);

        if (listResponse.success) {
          setData(listResponse.data);
          setTotalRecords(listResponse.pagination.total);
        }

        if (statsResponse.success) {
          setStatistics(statsResponse.data);
        }
      } catch (error) {
        console.error('Error loading program studi data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriode, searchQuery, currentPage, rowsPerPage, sortBy, sortOrder]);

  const columns: Column<ProgramStudi>[] = [
    { key: "kode", label: "KODE", align: "center", width: "70px", sortable: true, render: (item) => <span className="font-bold text-gray-900">{item.kode}</span> },
    {
      key: "nama",
      label: "NAMA PROGRAM STUDI",
      minWidth: "180px",
      sortable: true,
      render: (item) => (
        <Link
          href={`/program-studi/detail/${item.id}`}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          {item.nama}
        </Link>
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          color={item.status === "Aktif" ? "success" : "default"}
          variant="flat"
          className="font-semibold"
        >
          {item.status}
        </Chip>
      )
    },
    { key: "jenjang", label: "JENJANG", align: "center", width: "80px", sortable: true, render: (item) => <span className="font-bold text-blue-600">{item.jenjang}</span> },
    { key: "akreditasi", label: "AKREDITASI", align: "center", width: "110px", sortable: true, render: (item) => <Chip size="sm" color={getAkreditasiColor(item.akreditasi)} variant="flat" className="font-semibold">{item.akreditasi}</Chip> },
    { key: "total_dosen", label: "DOSEN", align: "center", width: "70px", sortable: true, headerRender: () => <div className="text-center">JUMLAH DOSEN</div>, render: (item) => <span className="font-bold text-gray-900">{item.total_dosen}</span> },
    { key: "total_mahasiswa", label: "MAHASISWA", align: "center", width: "90px", sortable: true, headerRender: () => <div className="text-center"><div>JUMLAH</div><div>MAHASISWA</div></div>, render: (item) => <span className="font-bold text-indigo-600">{item.total_mahasiswa.toLocaleString('id-ID')}</span> },
    { key: "rasio", label: "RASIO", align: "center", width: "80px", headerRender: () => <div className="text-center"><div>RASIO DOSEN /</div><div>MAHASISWA</div></div>, render: (item) => <span className="text-gray-700 font-semibold">{item.rasio}</span> },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/30 via-white to-indigo-50/20 relative">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants} className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">Program Studi</h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Daftar program studi di Universitas Lampung</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <DataTable
              data={data}
              columns={columns}
              searchable={true}
              searchKeys={["nama", "kode"]}
              searchPlaceholder="Cari: [Nama Program Studi] / [Kode]"
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 15, 25, 50]}
              noWrapper={true}
              loading={loading}
              serverSide={true}
              totalRecords={totalRecords}
              onPageChange={(page) => setCurrentPage(page)}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
              onSortChange={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              filterSlot={
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm whitespace-nowrap">Periode:</span>
                  <Select
                    placeholder="Pilih Periode"
                    selectedKeys={selectedPeriode ? [selectedPeriode] : []}
                    onChange={(e) => setSelectedPeriode(e.target.value)}
                    classNames={{
                      base: "flex-1 min-w-[180px]",
                      trigger: "bg-white/95 backdrop-blur-sm h-10 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-0",
                      value: "text-slate-700 font-semibold text-sm",
                      popoverContent: "bg-white rounded-lg shadow-xl",
                      innerWrapper: "text-slate-700",
                    }}
                    size="md"
                    startContent={
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    {periods.map((periode) => (
                      <SelectItem key={periode.id_smt} value={periode.id_smt}>
                        {periode.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              }
            />

            {/* Footer Summary */}
            {statistics && (
              <div className="border-t-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                      <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Dosen</div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.total_dosen.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                      <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Mahasiswa</div>
                      <div className="text-2xl font-bold text-indigo-600">{statistics.total_mahasiswa.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                      <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Rasio Dosen:Mahasiswa</div>
                      <div className="text-2xl font-bold text-emerald-600">1:{statistics.avg_rasio}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
