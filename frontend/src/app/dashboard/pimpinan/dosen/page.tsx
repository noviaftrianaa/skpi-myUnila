"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, Select, SelectItem } from "@heroui/react";
import { FiUsers } from "react-icons/fi";
import {
  DosenChart,
  DosenDataModal,
  JabfungStatsCards,
  JenjangStatsCards,
  TipeDataOptions,
  useDosenData,
  getChartData,
  getStats,
  getCurrentTipeDataOption,
  getChartTitle,
  getChartSubtitle,
  type DosenStats,
} from "@/shared/components/pimpinan/dosen";

// ========================================
// Main Page Component
// ========================================

export default function DosenPage() {
  const [selectedTipeData, setSelectedTipeData] = useState<string>("");
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>("");
  const [selectedFakultas, setSelectedFakultas] = useState<string>("");
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Custom hook for data fetching
  const {
    tahunAjaranList,
    isLoadingTahunAjaran,
    fakultasList,
    isLoadingFakultas,
    prodiList,
    isLoadingProdi,
    jabfungFakultasList,
    jabfungProdiList,
    jenjangFakultasList,
    jenjangProdiList,
  } = useDosenData({
    selectedTipeData,
    selectedTahunAjaran,
    selectedFakultas,
  });

  // Handle tipe data change
  const handleTipeDataChange = (value: string) => {
    setSelectedTipeData(value);
  };

  // Handle tahun ajaran change
  const handleTahunAjaranChange = (value: string) => {
    setSelectedTahunAjaran(value);
  };

  // Handle fakultas change
  const handleFakultasChange = (value: string) => {
    setSelectedFakultas(value);
    setSelectedProdi("");
  };

  // Handle prodi change
  const handleProdiChange = (value: string) => {
    setSelectedProdi(value);
  };

  // Get chart data and stats
  const chartData = getChartData(
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jabfungProdiList,
    jabfungFakultasList,
    jenjangProdiList,
    jenjangFakultasList,
  );

  const stats = getStats(
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jabfungProdiList,
    jabfungFakultasList,
    jenjangProdiList,
    jenjangFakultasList,
  ) as DosenStats;

  const currentTipeOption = getCurrentTipeDataOption(
    selectedTipeData,
    TipeDataOptions,
  );

  const isChartDisabled = !selectedTipeData || !selectedTahunAjaran;

  // Get selected names for modal
  const selectedTahunAjaranName =
    tahunAjaranList.find((t) => t.id_thn_ajaran === selectedTahunAjaran)
      ?.nm_thn_ajaran || "";
  const selectedFakultasName =
    fakultasList.find((f) => f.id === selectedFakultas)?.nama_fakultas || "";
  const selectedProdiName =
    prodiList.find((p) => p.id === selectedProdi)?.nama_prodi || "";

  // Initialize default values
  useEffect(() => {
    if (
      tahunAjaranList.length > 0 &&
      !selectedTahunAjaran &&
      !selectedTipeData
    ) {
      setSelectedTahunAjaran(tahunAjaranList[0].id_thn_ajaran);
      setSelectedTipeData("jabfung");
    }
  }, [tahunAjaranList, selectedTahunAjaran, selectedTipeData]);

  // Handle modal open
  const handleLihatData = () => {
    if (!selectedTipeData || !selectedTahunAjaran) {
      return;
    }
    setIsDataModalOpen(true);
  };

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
              <FiUsers className="w-8 h-8 text-myunila" />
              <h1 className="text-3xl font-bold text-gray-800">Data Dosen</h1>
            </div>
            <p className="text-gray-600 ml-11">
              Analisis data dosen berdasarkan jabatan fungsional, pangkat
              golongan, jenjang pendidikan, dan status kepegawaian
            </p>
          </div>

          {/* Filters */}
          <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
            <Alert
              color="warning"
              className="mb-6 bg-yellow-500 rounded-xl"
              title="Perhatian"
            >
              <p className="text-black">
                Silahkan pilih tipe data, fakultas, prodi, dan tahun ajaran di
                bawah ini!
              </p>
            </Alert>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Select Tipe Data */}
              <Select
                placeholder="Pilih tipe data"
                selectedKeys={selectedTipeData ? [selectedTipeData] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleTipeDataChange(value);
                }}
                variant="flat"
                labelPlacement="outside"
                classNames={{
                  base: "flex-1 min-w-[180px]",
                  trigger:
                    "bg-white/95 backdrop-blur-sm h-12 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-2 border-gray-300",
                  label: "text-gray-700 font-medium text-sm",
                  value: "text-slate-700 font-semibold text-sm",
                  popoverContent: "bg-white rounded-lg shadow-xl",
                  innerWrapper: "text-slate-700",
                }}
              >
                {TipeDataOptions.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </Select>

              {/* Select Fakultas */}
              <Select
                placeholder="Pilih fakultas"
                selectedKeys={selectedFakultas ? [selectedFakultas] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleFakultasChange(value);
                }}
                variant="flat"
                labelPlacement="outside"
                isDisabled={isLoadingFakultas}
                isLoading={isLoadingFakultas}
                classNames={{
                  base: "flex-1 min-w-[180px]",
                  trigger:
                    "bg-white/95 backdrop-blur-sm h-12 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-2 border-gray-300",
                  label: "text-gray-700 font-medium text-sm",
                  value: "text-slate-700 font-semibold text-sm",
                  popoverContent: "bg-white rounded-lg shadow-xl",
                  innerWrapper: "text-slate-700",
                }}
              >
                {fakultasList.map((fakultas) => (
                  <SelectItem key={fakultas.id}>
                    {fakultas.nama_fakultas}
                  </SelectItem>
                ))}
              </Select>

              {/* Select Prodi */}
              <Select
                placeholder="Pilih prodi"
                selectedKeys={selectedProdi ? [selectedProdi] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleProdiChange(value);
                }}
                variant="flat"
                labelPlacement="outside"
                isDisabled={!selectedFakultas || isLoadingProdi}
                isLoading={isLoadingProdi}
                classNames={{
                  base: "flex-1 min-w-[180px]",
                  trigger:
                    "bg-white/95 backdrop-blur-sm h-12 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-2 border-gray-300",
                  label: "text-gray-700 font-medium text-sm",
                  value: "text-slate-700 font-semibold text-sm",
                  popoverContent: "bg-white rounded-lg shadow-xl",
                  innerWrapper: "text-slate-700",
                }}
              >
                {prodiList.map((prodi) => (
                  <SelectItem key={prodi.id}>{prodi.nama_prodi}</SelectItem>
                ))}
              </Select>

              {/* Select Tahun Ajaran */}
              <Select
                placeholder="Pilih tahun ajaran"
                selectedKeys={selectedTahunAjaran ? [selectedTahunAjaran] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleTahunAjaranChange(value);
                }}
                variant="flat"
                labelPlacement="outside"
                isLoading={isLoadingTahunAjaran}
                classNames={{
                  base: "flex-1 min-w-[180px]",
                  trigger:
                    "bg-white/95 backdrop-blur-sm h-12 shadow-sm hover:bg-white hover:shadow-md transition-all rounded-lg border-2 border-gray-300",
                  label: "text-gray-700 font-medium text-sm",
                  value: "text-slate-700 font-semibold text-sm",
                  popoverContent: "bg-white rounded-lg shadow-xl",
                  innerWrapper: "text-slate-700",
                }}
              >
                {tahunAjaranList.map((ta) => (
                  <SelectItem key={ta.id_thn_ajaran}>
                    {ta.nm_thn_ajaran}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Stats Cards - jabfung */}
          {selectedTipeData === "jabfung" && selectedTahunAjaran && (
            <JabfungStatsCards stats={stats} />
          )}

          {/* Stats Cards - jenjang pendidikan */}
          {selectedTipeData === "jenjang_pendidikan" && selectedTahunAjaran && (
            <JenjangStatsCards stats={stats} />
          )}

          {/* Chart Card */}
          <DosenChart
            data={chartData}
            chartType={currentTipeOption?.chartType || "bar"}
            title={getChartTitle(
              selectedTipeData,
              selectedProdi,
              selectedFakultas,
              prodiList,
              fakultasList,
              TipeDataOptions,
            )}
            subtitle={getChartSubtitle(selectedTahunAjaran, tahunAjaranList)}
            onLihatData={handleLihatData}
            xAxisKey="name"
            disabled={isChartDisabled}
          />
        </motion.div>
      </div>

      {/* Data Modal */}
      {(selectedTipeData === "jabfung" ||
        selectedTipeData === "jenjang_pendidikan") && (
        <DosenDataModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          selectedTipeData={selectedTipeData}
          selectedTahunAjaran={selectedTahunAjaran}
          selectedTahunAjaranName={selectedTahunAjaranName}
          selectedFakultas={selectedFakultas}
          selectedFakultasName={selectedFakultasName}
          selectedProdi={selectedProdi}
          selectedProdiName={selectedProdiName}
        />
      )}
    </>
  );
}
