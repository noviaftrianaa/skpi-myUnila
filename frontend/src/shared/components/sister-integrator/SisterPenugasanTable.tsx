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
      key: "id_stat_pegawai",
      label: "STATUS KEPEGAWAIAN",
      sortable: true,
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            item.id_stat_pegawai === 1
              ? "success"
              : item.id_stat_pegawai === 2
              ? "primary"
              : "default"
          }
        >
          {penugasanHelpers.getStatusKepegawaianLabel(item.id_stat_pegawai)}
        </Chip>
      ),
    },
    {
      key: "id_ikatan_kerja",
      label: "IKATAN KERJA",
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {penugasanHelpers.getIkatanKerjaLabel(item.id_ikatan_kerja)}
        </span>
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
      key: "tgl_srt_tgs",
      label: "TGL SURAT TUGAS",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{formatDate(item.tgl_srt_tgs)}</span>
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
