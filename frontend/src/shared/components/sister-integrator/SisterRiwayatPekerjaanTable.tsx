"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterRiwayatPekerjaanService,
  RiwayatPekerjaan,
  riwayatPekerjaanHelpers,
} from "@/lib/services/sister/pdrd/riwayatPekerjaanService";

export default function SisterRiwayatPekerjaanTable() {
  const [data, setData] = useState<RiwayatPekerjaan[]>([]);
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
        const response = await sisterRiwayatPekerjaanService.getList({
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
        console.error("Error loading riwayat pekerjaan data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<RiwayatPekerjaan>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {riwayatPekerjaanHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {riwayatPekerjaanHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "nm_jabatan",
      label: "JABATAN",
      sortable: true,
      minWidth: "180px",
      render: (item) => (
        <div className="font-medium text-sm">{item.nm_jabatan}</div>
      ),
    },
    {
      key: "instansi",
      label: "INSTANSI",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            {item.instansi || "Tidak ada data"}
          </div>
          {item.divisi && (
            <div className="text-xs text-gray-500">{item.divisi}</div>
          )}
        </div>
      ),
    },
    {
      key: "jenis_pekerjaan_name",
      label: "JENIS PEKERJAAN",
      minWidth: "150px",
      render: (item) => (
        <Chip size="sm" color="primary" variant="flat">
          {riwayatPekerjaanHelpers.getJenisPekerjaan(
            item.jenis_pekerjaan_name
          )}
        </Chip>
      ),
    },
    {
      key: "mulai_bekerja",
      label: "PERIODE",
      sortable: true,
      minWidth: "180px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-xs text-gray-600">
            {riwayatPekerjaanHelpers.formatMonth(item.mulai_bekerja)} -{" "}
            {riwayatPekerjaanHelpers.formatMonth(item.selesai_bekerja)}
          </div>
          <div className="text-xs font-medium text-blue-600">
            {riwayatPekerjaanHelpers.getDuration(
              item.mulai_bekerja,
              item.selesai_bekerja
            )}
          </div>
        </div>
      ),
    },
    {
      key: "a_ln",
      label: "LOKASI",
      minWidth: "120px",
      render: (item) => (
        <Chip
          size="sm"
          color={item.a_ln === 1 ? "warning" : "success"}
          variant="flat"
        >
          {riwayatPekerjaanHelpers.getLuarNegeriLabel(item.a_ln)}
        </Chip>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      minWidth: "160px",
      render: (item) => (
        <div className="text-xs text-gray-500">
          {riwayatPekerjaanHelpers.formatDate(item.last_sync)}
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
      <DataTable<RiwayatPekerjaan>
        data={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchKeys={["nama_dosen", "nm_jabatan", "instansi"]}
        searchPlaceholder="Cari nama dosen, jabatan, atau instansi..."
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
