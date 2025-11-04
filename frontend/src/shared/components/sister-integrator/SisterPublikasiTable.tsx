"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip } from "@heroui/react";
import { sisterPublikasiService, type Publikasi } from "@/lib/services/publikasiService";

export default function SisterPublikasiTable() {
  const [data, setData] = useState<Publikasi[]>([]);
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
        const response = await sisterPublikasiService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading publikasi:', error);
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

  const formatYear = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      return "-";
    }
  };

  const columns: Column<Publikasi>[] = [
    {
      key: "judul",
      label: "JUDUL PUBLIKASI",
      sortable: false,
      minWidth: "350px",
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white max-w-lg">
          {item.judul}
        </div>
      ),
    },
    {
      key: "jenis_publikasi_nama",
      label: "JENIS PUBLIKASI",
      sortable: false,
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm">
          <Chip size="sm" variant="flat" color="secondary">
            {item.jenis_publikasi_nama || "Tidak ada data"}
          </Chip>
        </div>
      ),
    },
    {
      key: "tgl_terbit",
      label: "TAHUN TERBIT",
      sortable: false,
      align: "center",
      width: "120px",
      render: (item) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300">
          {formatYear(item.tgl_terbit)}
        </div>
      ),
    },
    {
      key: "penulis",
      label: "PENULIS",
      minWidth: "300px",
      render: (item) => (
        <div className="text-sm max-w-md">
          {item.penulis && item.penulis.length > 0 ? (
            <div className="space-y-1">
              {item.penulis.slice(0, 3).map((penulis, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={penulis.jenis_peran.includes("Penulis") ? "primary" : "default"}
                    className="flex-shrink-0"
                  >
                    {penulis.jenis_peran}
                  </Chip>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {penulis.nama}
                  </span>
                </div>
              ))}
              {item.penulis.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  +{item.penulis.length - 3} lainnya
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic">Tidak ada penulis</span>
          )}
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
          searchKeys={["judul"]}
          searchPlaceholder="Cari judul publikasi..."
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
          className="shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}
