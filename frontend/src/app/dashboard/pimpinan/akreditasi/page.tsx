"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import { useQuery } from "@tanstack/react-query";
import {
  executiveAkreditasiService,
  type Fakultas,
  type Prodi,
} from "@/lib/services/executive";
import { formatDate } from "@/shared/components/pimpinan/akreditasi/utils";
import { StatsCard } from "@/shared/components/pimpinan/akreditasi/StatsCard";
import {
  getFakultasColumns,
  getProdiColumns,
} from "@/shared/components/pimpinan/akreditasi/columns";
import { HistoryModal } from "@/shared/components/pimpinan/akreditasi/HistoryModal";

// ========================================
// Main Page Component
// ========================================

export default function AkreditasiPage() {
  const [selectedFakultas, setSelectedFakultas] = useState<Fakultas | null>(
    null,
  );
  const [selectedProdiHistory, setSelectedProdiHistory] = useState<{
    prodi: Prodi;
    history: Prodi["history_akreditasi"];
  } | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fetch fakultas data
  const {
    data: fakultasData = [],
    isLoading: isLoadingFakultas,
    error: fakultasError,
  } = useQuery({
    queryKey: ["akreditasi", "fakultas"],
    queryFn: () => executiveAkreditasiService.getAllFakultas(),
  });

  // Fetch prodi data when fakultas is selected
  const {
    data: prodiData = [],
    isLoading: isLoadingProdi,
    error: prodiError,
  } = useQuery({
    queryKey: ["akreditasi", "prodi", selectedFakultas?.id],
    queryFn: () =>
      executiveAkreditasiService.getProdiByFakultasId(selectedFakultas!.id),
    enabled: !!selectedFakultas,
  });

  // Handle fakultas click - drill down to prodi
  const handleFakultasClick = (fakultas: Fakultas) => {
    setSelectedFakultas(fakultas);
  };

  // Handle back to fakultas list
  const handleBack = () => {
    setSelectedFakultas(null);
  };

  // Handle show history
  const handleShowHistory = (prodi: Prodi) => {
    setSelectedProdiHistory({ prodi, history: prodi.history_akreditasi });
    setIsHistoryModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedProdiHistory(null);
  };

  // Calculate statistics
  const stats = {
    totalFakultas: fakultasData.length,
    totalProdiAktif: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.prodi_aktif.toString() || "0"),
      0,
    ),
    totalProdiReakreditasi: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.prodi_akan_kadaluarsa.toString() || "0"),
      0,
    ),
    totalJenjangProdi: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.total_prodi || "0"),
      0,
    ),
  };

  // Table columns
  const fakultasColumns = getFakultasColumns(handleFakultasClick);
  const prodiColumns = getProdiColumns(handleShowHistory, formatDate);

  // Loading state
  if (isLoadingFakultas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Error state
  if (fakultasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiAlertCircle className="w-16 h-16 text-danger" />
        <p className="text-lg text-danger">Gagal memuat data akreditasi</p>
        <p className="text-sm text-gray-500">
          {(fakultasError as Error).message || "Terjadi kesalahan pada server"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FiAward className="w-8 h-8 text-myunila" />
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedFakultas
                  ? `Akreditasi - ${selectedFakultas.nama_lembaga}`
                  : "Data Akreditasi Program Studi"}
              </h1>
            </div>
            <p className="text-gray-600 ml-11">
              {selectedFakultas
                ? "Daftar program studi beserta status akreditasinya"
                : "Ringkasan akreditasi program studi per fakultas"}
            </p>
          </div>

          {/* Back Button */}
          {selectedFakultas && (
            <Button
              onPress={handleBack}
              variant="flat"
              color="primary"
              className="mb-4"
              startContent={<FiArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Daftar Fakultas
            </Button>
          )}

          {/* Stats Cards */}
          {!selectedFakultas && (
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <StatsCard
                title="Total Fakultas"
                value={stats.totalFakultas}
                icon={<FiBookOpen />}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatsCard
                title="Total Prodi Aktif"
                value={stats.totalProdiAktif}
                icon={<FiCheckCircle />}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatsCard
                title="Prodi Reakreditasi"
                value={stats.totalProdiReakreditasi}
                icon={<FiClock />}
                color="bg-gradient-to-br from-orange-500 to-orange-600"
              />
              <StatsCard
                title="Total Jenjang Prodi"
                value={stats.totalJenjangProdi}
                icon={<FiAward />}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
            </div>
          )}

          {/* Tables */}
          {!selectedFakultas ? (
            <DataTable
              data={fakultasData}
              columns={fakultasColumns}
              searchable={true}
              searchKeys={["nama_lembaga"]}
              searchPlaceholder="Cari fakultas..."
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          ) : isLoadingProdi ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" color="primary" />
            </div>
          ) : prodiError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <FiAlertCircle className="w-16 h-16 text-danger" />
              <p className="text-lg text-danger">Gagal memuat data prodi</p>
            </div>
          ) : (
            <DataTable
              data={prodiData}
              columns={prodiColumns}
              searchable={true}
              searchKeys={["nama_prodi", "jenjang"]}
              searchPlaceholder="Cari prodi..."
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </motion.div>
      </div>

      {/* History Modal - Outside the main container */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseModal}
        prodiName={selectedProdiHistory?.prodi.nama_prodi || ""}
        jenjang={selectedProdiHistory?.prodi.jenjang || ""}
        history={selectedProdiHistory?.history || []}
      />
    </>
  );
}
