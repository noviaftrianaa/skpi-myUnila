"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip } from "@heroui/react";
import { sisterPendidikanService, type PendidikanFormal } from "@/lib/services/sister/pdrd/pendidikanService";

export default function SisterPendidikanTable() {
  const [data, setData] = useState<PendidikanFormal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("thn_lulus");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
        const response = await sisterPendidikanService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        setData(response.data.data);
        setTotalRecords(response.data.total);
      } catch (error) {
        console.error('Error loading pendidikan formal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

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

  const formatYear = (year?: number | null) => {
    if (!year || year === 0) return "-";
    return year.toString();
  };

  const columns: Column<PendidikanFormal>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nama_dosen || "Tidak ada data"}
        </div>
      ),
    },
    {
      key: "nm_sp_formal",
      label: "PERGURUAN TINGGI",
      sortable: true,
      minWidth: "280px",
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white max-w-sm">
          {item.nm_sp_formal || "Tidak ada data"}
        </div>
      ),
    },
    {
      key: "nama_program_studi",
      label: "PROGRAM STUDI",
      sortable: false,
      minWidth: "200px",
      render: (item) => (
        <div className="text-sm">
          {item.nama_program_studi ? (
            <span className="text-gray-700 dark:text-gray-300">
              {item.nama_program_studi}
            </span>
          ) : item.bidang_studi_nama ? (
            <span className="text-gray-500 dark:text-gray-400 italic">
              {item.bidang_studi_nama}
            </span>
          ) : (
            <span className="text-gray-400 italic">Tidak ada data</span>
          )}
        </div>
      ),
    },
    {
      key: "jenjang_pendidikan_nama",
      label: "JENJANG",
      sortable: false,
      align: "center",
      width: "120px",
      render: (item) => (
        <div className="text-sm">
          <Chip
            size="sm"
            variant="flat"
            color={
              item.jenjang_pendidikan_nama === 'S3' ? 'danger' :
              item.jenjang_pendidikan_nama === 'S2' ? 'warning' :
              item.jenjang_pendidikan_nama === 'S1' ? 'primary' :
              'default'
            }
          >
            {item.jenjang_pendidikan_nama || "Tidak ada data"}
          </Chip>
        </div>
      ),
    },
    {
      key: "thn_lulus",
      label: "TAHUN LULUS",
      sortable: true,
      align: "center",
      width: "120px",
      render: (item) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300">
          {formatYear(item.thn_lulus)}
        </div>
      ),
    },
    {
      key: "gelar_akademik_nama",
      label: "GELAR",
      sortable: false,
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.gelar_akademik_nama || "-"}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <DataTable
          data={data}
          columns={columns}
          searchable={true}
          searchKeys={["nm_sp_formal", "nama_dosen", "nama_program_studi", "bidang_studi_nama"]}
          searchPlaceholder="Cari nama dosen, perguruan tinggi, atau program studi..."
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
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
          className="shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}
