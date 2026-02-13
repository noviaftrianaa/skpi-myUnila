"use client";

import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import Modal from "../Modal";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { executiveJabfungService, type Dosen as JabfungDosen } from "@/lib/services/executive/jabfungService";
import { executiveJenjangPendidikanService, type Dosen as JenjangDosen } from "@/lib/services/executive/jenjangPendidikanService";
import { executivePangkatGolonganService, type Dosen as PangGolDosen } from "@/lib/services/executive/pangkatGolonganService";
import { executiveIkatanKerjaService, type Dosen as IkatanKerjaDosen } from "@/lib/services/executive/ikatanKerjaService";
import { executiveJenisKelaminService, type Dosen as JenisKelaminDosen } from "@/lib/services/executive/jenisKelaminService";
import { executiveStatusKepegawaianService, type Dosen as StatusKepegawaianDosen } from "@/lib/services/executive/statusKepegawaianService";
import Link from "next/link";

// Types
interface DosenDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTipeData: string;
  selectedTahunAjaran: string;
  selectedTahunAjaranName?: string;
  selectedFakultas: string;
  selectedFakultasName?: string;
  selectedProdi: string;
  selectedProdiName?: string;
}

// Tipe data display names
const TipeDataNames: Record<string, string> = {
  jabfung: "Jabatan Fungsional",
  pang_gol: "Pangkat Golongan",
  ikatan_kerja: "Ikatan Kerja",
  jenjang_pendidikan: "Jenjang Pendidikan",
  jenis_kelamin: "Jenis Kelamin",
  status_pegawai: "Status Kepegawaian",
};

type ModalDosen = JabfungDosen | JenjangDosen | PangGolDosen | IkatanKerjaDosen | JenisKelaminDosen | StatusKepegawaianDosen;

export const DosenDataModal = ({
  isOpen,
  onClose,
  selectedTipeData,
  selectedTahunAjaran,
  selectedTahunAjaranName,
  selectedFakultas,
  selectedFakultasName,
  selectedProdi,
  selectedProdiName,
}: DosenDataModalProps) => {
  // Dosen pagination state
  const [dosenPagination, setDosenPagination] = useState({
    page: 1,
    perPage: 10,
    search: "",
  });

  // Fetch dosen data with useQuery
  const { data: dosenResponse, isLoading: isLoadingDosen } = useQuery({
    queryKey: [
      "dosen",
      selectedTipeData,
      selectedTahunAjaran,
      selectedProdi ? undefined : selectedFakultas,
      selectedProdi,
      dosenPagination.page,
      dosenPagination.perPage,
      dosenPagination.search,
    ],
    queryFn: () => {
      const params = {
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: selectedProdi ? undefined : selectedFakultas || undefined,
        prodi_id: selectedProdi || undefined,
        per_page: dosenPagination.perPage,
        page: dosenPagination.page,
        search: dosenPagination.search || undefined,
      };

      if (selectedTipeData === "jenjang_pendidikan") {
        return executiveJenjangPendidikanService.getDataDosen(params);
      }
      if (selectedTipeData === "pang_gol") {
        return executivePangkatGolonganService.getDataDosen(params);
      }
      if (selectedTipeData === "ikatan_kerja") {
        return executiveIkatanKerjaService.getDataDosen(params);
      }
      if (selectedTipeData === "jenis_kelamin") {
        return executiveJenisKelaminService.getDataDosen(params);
      }
      if (selectedTipeData === "status_pegawai") {
        return executiveStatusKepegawaianService.getDataDosen(params);
      }
      return executiveJabfungService.getDataDosen(params);
    },
    enabled: isOpen,
    placeholderData: keepPreviousData,
  });

  const dosenData = dosenResponse?.data || [];
  const dosenTotal = dosenResponse?.pagination?.total || 0;

  // Define columns for Dosen (dynamic based on tipe data)
  const getDosenColumns = (): Column<ModalDosen>[] => {
    const baseColumns: Column<ModalDosen>[] = [
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
    ];

    // Add dynamic column based on tipe data
    if (selectedTipeData === "jabfung") {
      baseColumns.push({
        key: "jabfung",
        label: "Jabfung",
        render: (item) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              (item as JabfungDosen).jabfung === "Profesor"
                ? "bg-red-100 text-red-700"
                : (item as JabfungDosen).jabfung === "Lektor Kepala"
                ? "bg-amber-100 text-amber-700"
                : (item as JabfungDosen).jabfung === "Lektor"
                ? "bg-green-100 text-green-700"
                : (item as JabfungDosen).jabfung === "Asisten Ahli"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {(item as JabfungDosen).jabfung}
          </span>
        ),
      });
    }

    if (selectedTipeData === "jenjang_pendidikan") {
      baseColumns.push({
        key: "jenjang_didik",
        label: "Jenjang",
        render: (item) => {
          const jenjang = (item as JenjangDosen).jenjang_didik;
          const colorClass: Record<string, string> = {
            D3: "bg-cyan-100 text-cyan-700",
            D4: "bg-blue-100 text-blue-700",
            S1: "bg-green-100 text-green-700",
            S2: "bg-purple-100 text-purple-700",
            "S2 Terapan": "bg-indigo-100 text-indigo-700",
            S3: "bg-red-100 text-red-700",
            "S3 Terapan": "bg-rose-100 text-rose-700",
            Profesi: "bg-teal-100 text-teal-700",
            Sp1: "bg-amber-100 text-amber-700",
            Sp2: "bg-pink-100 text-pink-700",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                colorClass[jenjang] || "bg-gray-100 text-gray-700"
              }`}
            >
              {jenjang}
            </span>
          );
        },
      });
    }

    if (selectedTipeData === "pang_gol") {
      baseColumns.push({
        key: "pangkat_golongan",
        label: "Pangkat Golongan",
        render: (item) => (
          <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
            {(item as PangGolDosen).pangkat_golongan}
          </span>
        ),
      });
    }

    if (selectedTipeData === "ikatan_kerja") {
      baseColumns.push({
        key: "ikatan_kerja",
        label: "Ikatan Kerja",
        render: (item) => (
          <span className="px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-700">
            {(item as IkatanKerjaDosen).ikatan_kerja}
          </span>
        ),
      });
    }

    if (selectedTipeData === "jenis_kelamin") {
      baseColumns.push({
        key: "jenis_kelamin",
        label: "Jenis Kelamin",
        render: (item) => {
          const jenisKelamin = (item as JenisKelaminDosen).jenis_kelamin;
          const colorClass: Record<string, string> = {
            "Laki-laki": "bg-blue-100 text-blue-700",
            "Perempuan": "bg-pink-100 text-pink-700",
            "Belum Diketahui": "bg-gray-100 text-gray-700",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                colorClass[jenisKelamin] || "bg-gray-100 text-gray-700"
              }`}
            >
              {jenisKelamin}
            </span>
          );
        },
      });
    }

    if (selectedTipeData === "status_pegawai") {
      baseColumns.push({
        key: "status_kepegawaian",
        label: "Status Kepegawaian",
        render: (item) => {
          const statusKepegawaian = (item as StatusKepegawaianDosen).status_kepegawaian;
          const colorClass: Record<string, string> = {
            "PNS": "bg-blue-100 text-blue-700",
            "CPNS": "bg-indigo-100 text-indigo-700",
            "PPPK": "bg-purple-100 text-purple-700",
            "Non ASN": "bg-fuchsia-100 text-fuchsia-700",
            "ASN JF Non Dosen": "bg-green-100 text-green-700",
            "Dokter Pendidik Klinis": "bg-teal-100 text-teal-700",
            "Lainnya": "bg-gray-100 text-gray-700",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                colorClass[statusKepegawaian] || "bg-gray-100 text-gray-700"
              }`}
            >
              {statusKepegawaian}
            </span>
          );
        },
      });
    }

    return baseColumns;
  };

  // Get subtitle based on selection
  const getSubtitle = () => {
    const parts: string[] = [];

    if (selectedTahunAjaranName) {
      parts.push(`Tahun Ajaran: ${selectedTahunAjaranName}`);
    }

    if (selectedProdi && selectedProdiName) {
      parts.push(`Program Studi: ${selectedProdiName}`);
    } else if (selectedFakultas && selectedFakultasName) {
      parts.push(`Fakultas: ${selectedFakultasName}`);
    }

    if (parts.length === 0) {
      return "Semua Fakultas";
    }

    return parts.join(" | ");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Data Dosen"
      titleIcon={<FiUsers className="w-5 h-5" />}
      subtitle={getSubtitle()}
    >
      <DataTable
        data={dosenData}
        columns={getDosenColumns()}
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
    </Modal>
  );
};
