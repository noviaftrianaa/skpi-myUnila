"use client";

import React, { useState, useEffect } from "react";
import { Chip } from "@heroui/react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import {
  sisterBidangIlmuService,
  BidangIlmuItem,
  bidangIlmuHelpers,
} from "@/lib/services/bidangIlmuService";

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
      minWidth: "220px",
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
      minWidth: "80px",
      render: (item) => (
        <div className="flex justify-center">
          <Chip size="sm" color="secondary" variant="flat">
            {item.urutan}
          </Chip>
        </div>
      ),
    },
    {
      key: "nama_bidang",
      label: "BIDANG ILMU",
      sortable: true,
      minWidth: "350px",
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
      minWidth: "180px",
      render: (item) => (
        <div className="flex flex-col">
          <div className="text-xs text-gray-600">
            {bidangIlmuHelpers.formatDateTime(item.last_sync)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Data Bidang Ilmu Dosen
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Mapping bidang ilmu/keahlian dosen dari SISTER
        </p>
      </div>

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
        searchPlaceholder="Cari dosen, NIDN, atau bidang ilmu..."
      />
    </div>
  );
}
