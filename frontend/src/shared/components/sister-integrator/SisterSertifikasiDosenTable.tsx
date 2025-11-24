"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterSertifikasiDosenService,
  SertifikasiDosen,
  sertifikasiDosenHelpers,
} from "@/lib/services/sister/pdrd/sertifikasiDosenService";

export default function SisterSertifikasiDosenTable() {
  const [data, setData] = useState<SertifikasiDosen[]>([]);
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
        const response = await sisterSertifikasiDosenService.getList({
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
        console.error("Error loading sertifikasi dosen data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<SertifikasiDosen>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {sertifikasiDosenHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {sertifikasiDosenHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "jenis_sertifikasi",
      label: "JENIS SERTIFIKASI",
      sortable: true,
      minWidth: "220px",
      render: (item) => (
        <Chip size="sm" color="primary" variant="flat" className="whitespace-normal h-auto py-1">
          {sertifikasiDosenHelpers.getJenisSertifikasi(item.jenis_sertifikasi)}
        </Chip>
      ),
    },
    {
      key: "bidang_studi",
      label: "BIDANG STUDI",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="text-sm">
          {sertifikasiDosenHelpers.getBidangStudi(item.bidang_studi)}
        </div>
      ),
    },
    {
      key: "lembaga_sertifikasi",
      label: "LEMBAGA",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="text-sm">
          {sertifikasiDosenHelpers.getLembagaSertifikasi(item.lembaga_sertifikasi)}
        </div>
      ),
    },
    {
      key: "thn_sert",
      label: "TAHUN",
      sortable: true,
      minWidth: "100px",
      render: (item) => (
        <div className="text-sm font-medium">
          {sertifikasiDosenHelpers.formatYear(item.thn_sert)}
        </div>
      ),
    },
    {
      key: "nrg",
      label: "NO. REGISTRASI",
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm font-mono">
          {sertifikasiDosenHelpers.getNomorRegistrasi(item.nrg)}
        </div>
      ),
    },
    {
      key: "no_peserta",
      label: "NO. PESERTA",
      minWidth: "150px",
      render: (item) => (
        <div className="text-sm font-mono">
          {sertifikasiDosenHelpers.getNomorPeserta(item.no_peserta)}
        </div>
      ),
    },
    {
      key: "sk_sert",
      label: "SK SERTIFIKASI",
      minWidth: "180px",
      render: (item) => (
        <div className="text-sm">
          {sertifikasiDosenHelpers.getSKSertifikasi(item.sk_sert)}
        </div>
      ),
    },
    {
      key: "masa_berlaku",
      label: "MASA BERLAKU",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-sm">
            {sertifikasiDosenHelpers.getMasaBerlaku(item.tmt_sert, item.tst_sert)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      minWidth: "120px",
      render: (item) => {
        const status = sertifikasiDosenHelpers.getStatusLabel(item.tst_sert);
        const color = sertifikasiDosenHelpers.getStatusColor(item.tst_sert);
        return (
          <Chip
            size="sm"
            color={color}
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
          {sertifikasiDosenHelpers.formatDate(item.last_sync)}
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
      <DataTable<SertifikasiDosen>
        data={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchKeys={["nama_dosen", "jenis_sertifikasi", "bidang_studi", "lembaga_sertifikasi"]}
        searchPlaceholder="Cari nama dosen, jenis sertifikasi, bidang studi, atau lembaga..."
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
