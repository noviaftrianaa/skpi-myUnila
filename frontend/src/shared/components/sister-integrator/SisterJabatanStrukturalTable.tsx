"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterJabatanStrukturalService,
  JabatanStruktural,
  jabatanStrukturalHelpers,
} from "@/lib/services/jabatanStrukturalService";

export default function SisterJabatanStrukturalTable() {
  const [data, setData] = useState<JabatanStruktural[]>([]);
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
        const response = await sisterJabatanStrukturalService.getList({
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
        console.error("Error loading jabatan struktural data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<JabatanStruktural>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {jabatanStrukturalHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {jabatanStrukturalHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "nama_jabatan",
      label: "JABATAN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="font-medium text-sm">
          {jabatanStrukturalHelpers.getNamaJabatan(item.nama_jabatan)}
        </div>
      ),
    },
    {
      key: "kategori_kegiatan",
      label: "KATEGORI KEGIATAN",
      sortable: true,
      minWidth: "180px",
      render: (item) => (
        <Chip size="sm" color="primary" variant="flat">
          {jabatanStrukturalHelpers.getKategoriKegiatan(item.kategori_kegiatan)}
        </Chip>
      ),
    },
    {
      key: "sk_jabstruk",
      label: "SK JABATAN",
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm">
          {jabatanStrukturalHelpers.getSKJabatan(item.sk_jabstruk)}
        </div>
      ),
    },
    {
      key: "tmt_sk_jabstruk",
      label: "PERIODE",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-xs text-gray-600">
            {jabatanStrukturalHelpers.formatMonth(item.tmt_sk_jabstruk)} -{" "}
            {item.tst_sk_jabstruk && item.tst_sk_jabstruk.Valid
              ? jabatanStrukturalHelpers.formatMonth(item.tst_sk_jabstruk)
              : "Sekarang"}
          </div>
          <div className="text-xs font-medium text-blue-600">
            {jabatanStrukturalHelpers.getDuration(
              item.tmt_sk_jabstruk,
              item.tst_sk_jabstruk
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      minWidth: "120px",
      render: (item) => {
        const status = jabatanStrukturalHelpers.getStatusLabel(
          item.tmt_sk_jabstruk,
          item.tst_sk_jabstruk
        );
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
      key: "lokasi_tugas",
      label: "LOKASI TUGAS",
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm">
          {jabatanStrukturalHelpers.getLokasiTugas(item.lokasi_tugas)}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      minWidth: "160px",
      render: (item) => (
        <div className="text-xs text-gray-500">
          {jabatanStrukturalHelpers.formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DataTable<JabatanStruktural>
        data={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchKeys={["nama_dosen", "nama_jabatan", "sk_jabstruk", "lokasi_tugas"]}
        searchPlaceholder="Cari nama dosen, jabatan, SK, atau lokasi tugas..."
        defaultRowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
  );
}
