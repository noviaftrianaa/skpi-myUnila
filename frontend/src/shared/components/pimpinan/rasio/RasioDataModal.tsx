"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import Modal from "../Modal";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  executiveRasioService,
  type Mahasiswa,
  type Dosen,
} from "@/lib/services/executive";
import Link from "next/link";

// Types compatible with service
interface RasioDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFakultas: string;
  selectedFakultasName?: string;
  selectedProdi: string;
  selectedProdiName?: string;
  selectedTahunAjaran: string;
}

export const RasioDataModal = ({
  isOpen,
  onClose,
  selectedFakultas,
  selectedFakultasName,
  selectedProdi,
  selectedProdiName,
  selectedTahunAjaran,
}: RasioDataModalProps) => {
  // Mahasiswa pagination state
  const [mahasiswaPagination, setMahasiswaPagination] = useState({
    page: 1,
    perPage: 10,
    search: "",
  });

  // Dosen pagination state
  const [dosenPagination, setDosenPagination] = useState({
    page: 1,
    perPage: 10,
    search: "",
  });

  const [activeTab, setActiveTab] = useState<"mahasiswa" | "dosen">(
    "mahasiswa",
  );

  // Fetch mahasiswa data with useQuery
  const { data: mahasiswaResponse, isLoading: isLoadingMahasiswa } = useQuery({
    queryKey: [
      "rasio",
      "mahasiswa",
      selectedTahunAjaran,
      selectedProdi ? undefined : selectedFakultas,
      selectedProdi,
      mahasiswaPagination.page,
      mahasiswaPagination.perPage,
      mahasiswaPagination.search,
    ],
    queryFn: () =>
      executiveRasioService.getDataMahasiswa({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: selectedProdi ? undefined : selectedFakultas || undefined,
        prodi_id: selectedProdi || undefined,
        per_page: mahasiswaPagination.perPage,
        page: mahasiswaPagination.page,
        search: mahasiswaPagination.search || undefined,
      }),
    enabled: isOpen && activeTab === "mahasiswa",
    placeholderData: keepPreviousData,
  });

  // Fetch dosen data with useQuery
  const { data: dosenResponse, isLoading: isLoadingDosen } = useQuery({
    queryKey: [
      "rasio",
      "dosen",
      selectedTahunAjaran,
      selectedProdi ? undefined : selectedFakultas,
      selectedProdi,
      dosenPagination.page,
      dosenPagination.perPage,
      dosenPagination.search,
    ],
    queryFn: () =>
      executiveRasioService.getDataDosen({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: selectedProdi ? undefined : selectedFakultas || undefined,
        prodi_id: selectedProdi || undefined,
        per_page: dosenPagination.perPage,
        page: dosenPagination.page,
        search: dosenPagination.search || undefined,
      }),
    enabled: isOpen && activeTab === "dosen",
    placeholderData: keepPreviousData,
  });

  const mahasiswaData = mahasiswaResponse?.data || [];
  const mahasiswaTotal = mahasiswaResponse?.pagination?.total || 0;

  const dosenData = dosenResponse?.data || [];
  const dosenTotal = dosenResponse?.pagination?.total || 0;

  // Define columns for Mahasiswa
  const mahasiswaColumns: Column<Mahasiswa>[] = [
    { key: "nim", label: "NIM" },
    {
      key: "nama",
      label: "Nama",
      render: (item) => (
        <Link
          href={`/mahasiswa/${item.encrypted_id || item.id}`}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors text-[10px] sm:text-xs md:text-sm"
        >
          {item.nama}
        </Link>
      ),
    },
    { key: "prodi", label: "Program Studi" },
    { key: "fakultas", label: "Fakultas" },
    { key: "angkatan", label: "Angkatan" },
  ];

  // Define columns for Dosen
  const dosenColumns: Column<Dosen>[] = [
    { key: "nidn", label: "NIDN" },
    {
      key: "nama",
      label: "Nama",
      render: (item) => (
        <Link
          href={`/dosen/${item.encrypted_id || item.id}`}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors text-[10px] sm:text-xs md:text-sm"
        >
          {item.nama}
        </Link>
      ),
    },
    { key: "prodi", label: "Program Studi" },
    { key: "fakultas", label: "Fakultas" },
    {
      key: "status",
      label: "Status",
      render: (dsn) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            dsn.status === "PNS"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {dsn.status}
        </span>
      ),
    },
  ];

  // Get subtitle based on selection
  const getSubtitle = () => {
    if (selectedProdi && selectedProdiName) {
      return `Program Studi: ${selectedProdiName}`;
    }
    if (selectedFakultas && selectedFakultasName) {
      return `Fakultas: ${selectedFakultasName}`;
    }
    return "Semua Fakultas";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Data Detail"
      titleIcon={<FiUsers className="w-5 h-5" />}
      subtitle={getSubtitle()}
    >
      <Tabs
        color="primary"
        variant="underlined"
        classNames={{
          panel: "pt-6",
        }}
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as "mahasiswa" | "dosen")}
      >
        <Tab
          key="mahasiswa"
          title={
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              <span>Mahasiswa</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {mahasiswaTotal}
              </span>
            </div>
          }
        >
          <DataTable
            data={mahasiswaData}
            columns={mahasiswaColumns}
            searchPlaceholder="Cari mahasiswa..."
            defaultRowsPerPage={10}
            emptyMessage="Tidak ada data mahasiswa"
            serverSide
            totalRecords={mahasiswaTotal}
            onPageChange={(page) =>
              setMahasiswaPagination((prev) => ({ ...prev, page }))
            }
            onRowsPerPageChange={(rows) =>
              setMahasiswaPagination((prev) => ({
                ...prev,
                perPage: rows,
                page: 1,
              }))
            }
            onSearchChange={(search) =>
              setMahasiswaPagination((prev) => ({ ...prev, search, page: 1 }))
            }
            loading={isLoadingMahasiswa}
          />
        </Tab>

        <Tab
          key="dosen"
          title={
            <div className="flex items-center gap-2">
              <FiUserPlus className="w-4 h-4" />
              <span>Dosen</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {dosenTotal}
              </span>
            </div>
          }
        >
          <DataTable
            data={dosenData}
            columns={dosenColumns}
            searchPlaceholder="Cari dosen..."
            defaultRowsPerPage={10}
            emptyMessage="Tidak ada data dosen"
            serverSide
            totalRecords={dosenTotal}
            onPageChange={(page) =>
              setDosenPagination((prev) => ({ ...prev, page }))
            }
            onRowsPerPageChange={(rows) =>
              setDosenPagination((prev) => ({
                ...prev,
                perPage: rows,
                page: 1,
              }))
            }
            onSearchChange={(search) =>
              setDosenPagination((prev) => ({ ...prev, search, page: 1 }))
            }
            loading={isLoadingDosen}
          />
        </Tab>
      </Tabs>
    </Modal>
  );
};
