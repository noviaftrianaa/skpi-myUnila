"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip } from "@heroui/react";
import {
  sisterPenugasanService,
  type Penugasan,
  penugasanHelpers,
} from "@/lib/services/penugasanService";

export default function SisterPenugasanTable() {
  const [data, setData] = useState<Penugasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await sisterPenugasanService.getList(
          currentPage,
          rowsPerPage,
          searchQuery || ""
        );

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error("Error loading penugasan:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum sync";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Belum sync";
    }
  };

  const columns: Column<Penugasan>[] = [
    {
      key: "no",
      label: "NO",
      render: (_, index) => (
        <div className="text-center font-medium">
          {(currentPage - 1) * rowsPerPage + index + 1}
        </div>
      ),
    },
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {item.nama_dosen || "-"}
          </div>
          {item.nip && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              NIP: {item.nip}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status_kepegawaian",
      label: "STATUS KEPEGAWAIAN",
      sortable: true,
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            item.status_kepegawaian === "PNS"
              ? "success"
              : item.status_kepegawaian === "CPNS"
              ? "primary"
              : "default"
          }
        >
          {item.status_kepegawaian || "-"}
        </Chip>
      ),
    },
    {
      key: "ikatan_kerja",
      label: "IKATAN KERJA",
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {item.ikatan_kerja || "-"}
        </span>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div>
          <div className="text-sm font-medium">{item.nama_prodi || "-"}</div>
          <div className="flex items-center gap-2 mt-1">
            {item.kode_prodi && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {item.kode_prodi}
              </span>
            )}
            {item.id_jenj_didik && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                Jenjang: {item.id_jenj_didik}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "homebase",
      label: "HOMEBASE & TAHUN AKTIF",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={item.homebase === 1 ? "success" : "default"}
          >
            {item.homebase === 1 ? "Ya" : "Tidak"}
          </Chip>
          {item.tahun_aktif && (
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Tahun Aktif: <span className="font-semibold">{item.tahun_aktif}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "no_srt_tgs",
      label: "NO SURAT TUGAS",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-mono">{item.no_srt_tgs || "-"}</span>
      ),
    },
    {
      key: "tmt_srt_tgs",
      label: "TMT TUGAS",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{formatDate(item.tmt_srt_tgs)}</span>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari berdasarkan NIDN, NIP, Nama, atau No Surat Tugas..."
          onSearchChange={setSearchQuery}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          // Server-side mode
          serverSide={true}
          totalRecords={totalRecords}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
        />
      </motion.div>
    </motion.div>
  );
}
