"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterRiwayatFungsionalService,
  RiwayatFungsional,
  riwayatFungsionalHelpers,
} from "@/lib/services/sister/pdrd/riwayatFungsionalService";

export default function SisterRiwayatFungsionalTable() {
  const [data, setData] = useState<RiwayatFungsional[]>([]);
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
        const response = await sisterRiwayatFungsionalService.getList({
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
        console.error("Error loading riwayat fungsional data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<RiwayatFungsional>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {riwayatFungsionalHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {riwayatFungsionalHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "jabatan",
      label: "JABATAN FUNGSIONAL",
      sortable: true,
      minWidth: "180px",
      render: (item) => {
        const jabatanName = riwayatFungsionalHelpers.getJabatan(item.jabatan);
        return (
          <Chip
            size="sm"
            color={riwayatFungsionalHelpers.getJabatanColor(jabatanName)}
            variant="flat"
            className="font-medium"
          >
            {jabatanName}
          </Chip>
        );
      },
    },
    {
      key: "sk_jabfung",
      label: "NO. SK",
      sortable: true,
      minWidth: "180px",
      render: (item) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {item.sk_jabfung}
        </code>
      ),
    },
    {
      key: "tmt_sk_jabfung",
      label: "TMT",
      sortable: true,
      minWidth: "130px",
      render: (item) => (
        <div className="text-sm font-medium text-blue-600">
          {riwayatFungsionalHelpers.formatMonth(item.tmt_sk_jabfung)}
        </div>
      ),
    },
    {
      key: "angka_kredit",
      label: "ANGKA KREDIT",
      sortable: true,
      minWidth: "140px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-sm font-bold text-purple-600">
            {riwayatFungsionalHelpers.getTotalAngkaKredit(item)}
          </div>
          <div className="text-xs text-gray-500">
            Utama: {item.angka_kredit || 0}
          </div>
        </div>
      ),
    },
    {
      key: "lebih_ajar",
      label: "KELEBIHAN",
      minWidth: "150px",
      render: (item) => (
        <div className="text-xs space-y-0.5">
          {(item.lebih_ajar || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ajar:</span>
              <span className="font-medium">{item.lebih_ajar}</span>
            </div>
          )}
          {(item.lebih_lit || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Penelitian:</span>
              <span className="font-medium">{item.lebih_lit}</span>
            </div>
          )}
          {(item.lebih_pengmas || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pengmas:</span>
              <span className="font-medium">{item.lebih_pengmas}</span>
            </div>
          )}
          {(item.lebih_tunjang || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tunjang:</span>
              <span className="font-medium">{item.lebih_tunjang}</span>
            </div>
          )}
          {(item.lebih_ajar || 0) === 0 && (item.lebih_lit || 0) === 0 &&
           (item.lebih_pengmas || 0) === 0 && (item.lebih_tunjang || 0) === 0 && (
            <span className="text-gray-400">-</span>
          )}
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
          {riwayatFungsionalHelpers.formatDate(item.last_sync)}
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
      <DataTable<RiwayatFungsional>
        data={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchKeys={["nama_dosen", "jabatan", "sk_jabfung"]}
        searchPlaceholder="Cari nama dosen, jabatan, atau nomor SK..."
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
