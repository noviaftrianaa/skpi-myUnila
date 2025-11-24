"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterBidangIlmuService,
  BidangIlmuItem,
  bidangIlmuHelpers,
} from "@/lib/services/sister/pdrd/bidangIlmuService";

export default function SisterBidangIlmuTable() {
  const [data, setData] = useState<BidangIlmuItem[]>([]);
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
        const response = await sisterBidangIlmuService.getList({
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
        console.error("Error loading bidang ilmu data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  const columns: Column<BidangIlmuItem>[] = [
    {
      key: "nama_dosen",
      label: "NAMA DOSEN",
      sortable: true,
      minWidth: "200px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="font-medium text-sm">
            {bidangIlmuHelpers.getDosenName(item.nama_dosen)}
          </div>
          <div className="text-xs text-gray-500">
            NIDN: {bidangIlmuHelpers.getNIDN(item.nidn)}
          </div>
        </div>
      ),
    },
    {
      key: "urutan",
      label: "URUTAN",
      sortable: true,
      minWidth: "100px",
      render: (item) => (
        <div className="text-sm font-medium">
          {item.urutan}
        </div>
      ),
    },
    {
      key: "nama_bidang",
      label: "BIDANG ILMU",
      sortable: true,
      minWidth: "300px",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">
            {bidangIlmuHelpers.getNamaBidang(item.nama_bidang)}
          </div>
          <div className="text-xs text-gray-500">
            Kode: {bidangIlmuHelpers.getKodeBidang(item.kode_bidang)}
          </div>
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      minWidth: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500">
          {bidangIlmuHelpers.formatDateTime(item.last_sync)}
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
      <DataTable<BidangIlmuItem>
        data={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchKeys={["nama_dosen", "nidn", "nama_bidang", "kode_bidang"]}
        searchPlaceholder="Cari nama dosen, NIDN, atau bidang ilmu..."
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
