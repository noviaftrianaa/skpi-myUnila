"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterTugasTambahanService,
  TugasTambahan,
  tugasTambahanHelpers,
} from "@/lib/services/tugasTambahanService";

export default function SisterTugasTambahanTable() {
  const [data, setData] = useState<TugasTambahan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("last_sync");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await sisterTugasTambahanService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        if (response.success && response.data) {
          setData(response.data.data);
          setTotalRecords(response.data.total);
        }
      } catch (error) {
        console.error("Error loading tugas tambahan data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<TugasTambahan>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {tugasTambahanHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {tugasTambahanHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "jenis_tugas_name",
      label: "JENIS TUGAS",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="font-medium text-sm">
          {tugasTambahanHelpers.getJenisTugas(item.jenis_tugas_name)}
        </div>
      ),
    },
    {
      key: "unit_kerja_name",
      label: "UNIT KERJA",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="text-sm">
          {tugasTambahanHelpers.getUnitKerja(item.unit_kerja_name)}
        </div>
      ),
    },
    {
      key: "kategori_kegiatan_name",
      label: "KATEGORI KEGIATAN",
      sortable: true,
      minWidth: "180px",
      render: (item) => (
        <Chip size="sm" color="primary" variant="flat">
          {tugasTambahanHelpers.getKategoriKegiatan(item.kategori_kegiatan_name)}
        </Chip>
      ),
    },
    {
      key: "sk_tugas_tambah",
      label: "SK TUGAS",
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm">
          {tugasTambahanHelpers.getSKTugas(item.sk_tugas_tambah)}
        </div>
      ),
    },
    {
      key: "jml_jam",
      label: "JUMLAH JAM",
      minWidth: "120px",
      render: (item) => (
        <div className="text-sm">
          {tugasTambahanHelpers.getJumlahJam(item.jml_jam)}
        </div>
      ),
    },
    {
      key: "tmt_sk_tambah",
      label: "PERIODE",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-sm">
            {tugasTambahanHelpers.getPeriodeText(item.tmt_sk_tambah, item.tst_sk_tambah)}
          </div>
          <div className="text-xs text-gray-500">
            Durasi: {tugasTambahanHelpers.getDuration(item.tmt_sk_tambah, item.tst_sk_tambah)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      minWidth: "100px",
      render: (item) => {
        const status = tugasTambahanHelpers.getStatusLabel(item.tmt_sk_tambah, item.tst_sk_tambah);
        return (
          <Chip
            size="sm"
            color={status === "Aktif" ? "success" : "default"}
            variant="flat"
          >
            {status}
          </Chip>
        );
      },
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      minWidth: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500">
          {tugasTambahanHelpers.formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchQuery}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
        searchPlaceholder="Cari berdasarkan nama dosen, jenis tugas, unit kerja..."
      />
    </motion.div>
  );
}
