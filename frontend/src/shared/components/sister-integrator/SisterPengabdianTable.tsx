"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip } from "@heroui/react";
import { sisterPengabdianService, type Litabmas } from "@/lib/services/pengabdianService";

export default function SisterPengabdianTable() {
  const [data, setData] = useState<Litabmas[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("");
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
        const response = await sisterPengabdianService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy || undefined,
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading pengabdian:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Litabmas>[] = [
    {
      key: "judul_litabmas",
      label: "JUDUL PENGABDIAN",
      sortable: true,
      minWidth: "300px",
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white max-w-md">
          {item.judul_litabmas}
        </div>
      ),
    },
    {
      key: "id_thn_kegiatan",
      label: "TAHUN",
      sortable: true,
      align: "center",
      width: "100px",
      render: (item) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300">
          {item.id_thn_kegiatan || "-"}
        </div>
      ),
    },
    {
      key: "pendanaan",
      label: "PENDANAAN",
      sortable: true,
      align: "end",
      width: "180px",
      render: (item) => {
        const total = item.dana_dikti + item.dana_pt + item.dana_institusi_lain;
        return (
          <div className="text-sm">
            <div className="font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(total)}
            </div>
            <div className="text-xs space-y-0.5">
              {item.dana_dikti > 0 && (
                <div className="text-blue-600 dark:text-blue-400">
                  Dikti: {formatCurrency(item.dana_dikti)}
                </div>
              )}
              {item.dana_pt > 0 && (
                <div className="text-green-600 dark:text-green-400">
                  PT: {formatCurrency(item.dana_pt)}
                </div>
              )}
              {item.dana_institusi_lain > 0 && (
                <div className="text-purple-600 dark:text-purple-400">
                  Lain: {formatCurrency(item.dana_institusi_lain)}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "anggota",
      label: "ANGGOTA",
      minWidth: "250px",
      render: (item) => (
        <div className="text-sm max-w-sm">
          {item.anggota && item.anggota.length > 0 ? (
            <div className="space-y-1">
              {item.anggota.slice(0, 3).map((anggota, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={anggota.jenis_peran.includes("Ketua") ? "secondary" : "default"}
                    className="flex-shrink-0"
                  >
                    {anggota.jenis_peran}
                  </Chip>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {anggota.nama}
                  </span>
                </div>
              ))}
              {item.anggota.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  +{item.anggota.length - 3} lainnya
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic">Tidak ada anggota</span>
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
          searchKeys={["judul_litabmas"]}
          searchPlaceholder="Cari judul pengabdian..."
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
