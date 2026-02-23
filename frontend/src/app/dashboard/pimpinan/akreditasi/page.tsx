"use client";

import { useState, useEffect } from "react";
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
import { executiveAkreditasiService } from "@/lib/services/executive";
import { formatDate } from "@/shared/components/pimpinan/akreditasi/utils";
import { StatsCard } from "@/shared/components/pimpinan/akreditasi/StatsCard";
import {
  getFakultasColumns,
  getProdiColumns,
} from "@/shared/components/pimpinan/akreditasi/columns";
import { HistoryModal } from "@/shared/components/pimpinan/akreditasi/HistoryModal";
import { Fakultas, Prodi } from "@/lib/services/executive/akreditasiService";
import { useUserContext } from "@/contexts/UserContextContext";

// ========================================
// Main Page Component
// ========================================

export default function AkreditasiPage() {
  const { activeContext } = useUserContext();
  const [selectedFakultas, setSelectedFakultas] = useState<Fakultas | null>(
    null,
  );
  const [selectedProdiHistory, setSelectedProdiHistory] = useState<{
    prodi: Prodi;
    history: Prodi["history_akreditasi"];
  } | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fetch fakultas data (for Rektor and Dekan only)
  // For Kaprodi (level 5), we'll fetch prodi data separately
  const {
    data: fakultasData = [],
    isLoading: isLoadingFakultas,
    error: fakultasError,
  } = useQuery({
    queryKey: [
      "akreditasi",
      "fakultas",
      activeContext?.id_organisasi,
      activeContext?.level_organisasi,
    ],
    queryFn: () =>
      executiveAkreditasiService.getAllFakultas({
        id_organisasi: activeContext?.id_organisasi,
        level_organisasi: activeContext?.level_organisasi,
      }),
    enabled: activeContext?.level_organisasi !== 5, // Disable for Kaprodi
  });

  // Fetch prodi data for Kaprodi directly
  const {
    data: kaprodiProdiData = [],
    isLoading: isLoadingKaprodiProdi,
    error: kaprodiProdiError,
  } = useQuery({
    queryKey: ["akreditasi", "kaprodi-prodi", activeContext?.id_organisasi],
    queryFn: () =>
      executiveAkreditasiService.getAllFakultas({
        id_organisasi: activeContext?.id_organisasi,
        level_organisasi: activeContext?.level_organisasi,
      }),
    enabled: activeContext?.level_organisasi == 5, // Only for Kaprodi
  });

  // Fetch prodi data when fakultas is selected (only for Rektor/Dekan)
  const {
    data: prodiData = [],
    isLoading: isLoadingProdi,
    error: prodiError,
  } = useQuery({
    queryKey: ["akreditasi", "prodi", selectedFakultas?.id],
    queryFn: () =>
      executiveAkreditasiService.getProdiByFakultasId(selectedFakultas!.id),
    enabled: !!selectedFakultas && activeContext?.level_organisasi !== 5,
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

  // Check if returned data is Prodi array (for Kaprodi role)
  // Prodi has 'nama_prodi' field, Fakultas has 'nama_lembaga' field
  const isKaprodiView = activeContext?.level_organisasi == 5;
  console.log(isKaprodiView);
  const isDataProdi =
    kaprodiProdiData.length > 0 &&
    kaprodiProdiData[0] &&
    "nama_prodi" in kaprodiProdiData[0];
  const prodiDataForKaprodi =
    isKaprodiView && isDataProdi
      ? (kaprodiProdiData as unknown as Prodi[])
      : (kaprodiProdiData as Prodi[]);

  // Auto-drill down untuk Dekan
  useEffect(() => {
    if (!activeContext || !fakultasData.length) return;

    // Level 3 = Rektor, Level 4 = Dekan, Level 5 = Kaprodi
    if (activeContext.level_organisasi === 4 && fakultasData.length === 1) {
      // Dekan: Auto-select ke fakultasnya
      setSelectedFakultas(fakultasData[0]);
    }
    // Kaprodi: No auto-select needed, directly show prodi table
  }, [activeContext, fakultasData]);

  // Calculate statistics (only for Rektor role - level 3)
  const stats = {
    totalFakultas: fakultasData.length,
    totalProdiAktif: fakultasData.reduce(
      (sum, f) =>
        "prodi_aktif" in f
          ? sum + parseInt(f.prodi_aktif.toString() || "0")
          : sum,
      0,
    ),
    totalProdiReakreditasi: fakultasData.reduce(
      (sum, f) =>
        "prodi_akan_kadaluarsa" in f
          ? sum + parseInt(f.prodi_akan_kadaluarsa.toString() || "0")
          : sum,
      0,
    ),
    totalJenjangProdi: fakultasData.reduce(
      (sum, f) =>
        "total_prodi" in f ? sum + parseInt(f.total_prodi || "0") : sum,
      0,
    ),
  };

  // Table columns
  const fakultasColumns = getFakultasColumns(handleFakultasClick);
  const prodiColumns = getProdiColumns(handleShowHistory, formatDate);

  // Loading state
  if (isLoadingFakultas || isLoadingKaprodiProdi) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Error state
  if (fakultasError || kaprodiProdiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiAlertCircle className="w-16 h-16 text-danger" />
        <p className="text-lg text-danger">Gagal memuat data akreditasi</p>
        <p className="text-sm text-gray-500">
          {(fakultasError || (kaprodiProdiError as Error))?.message ||
            "Terjadi kesalahan pada server"}
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
                  : activeContext?.level_organisasi == 4
                    ? `Akreditasi - ${activeContext.nm_organisasi}`
                    : activeContext?.level_organisasi == 5
                      ? `Akreditasi - ${activeContext.nm_organisasi}`
                      : "Data Akreditasi Program Studi"}
              </h1>
            </div>
            <p className="text-gray-600 ml-11">
              {selectedFakultas
                ? "Daftar program studi beserta status akreditasinya"
                : isKaprodiView
                  ? "Data akreditasi program studi Anda"
                  : "Ringkasan akreditasi program studi per fakultas"}
            </p>
          </div>

          {/* Back Button */}
          {selectedFakultas && activeContext?.level_organisasi == 3 && (
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
          {!selectedFakultas && activeContext?.level_organisasi === 3 && (
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
          {/* For Kaprodi: directly show prodi table */}
          {isKaprodiView ? (
            <DataTable
              key="kaprodi-prodi-table"
              data={prodiDataForKaprodi}
              columns={prodiColumns}
              searchable={true}
              searchKeys={["nama_prodi", "jenjang"]}
              searchPlaceholder="Cari prodi..."
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          ) : !selectedFakultas ? (
            <DataTable
              key="fakultas-table"
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
              key={`prodi-table-${selectedFakultas?.id}`}
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
