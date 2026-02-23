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
  PangGolStatsCards,
  IkatanKerjaStatsCards,
  JenisKelaminStatsCards,
  StatusKepegawaianStatsCards,
  TipeDataOptions,
  JenjangDataKeys,
  PangGolDataKeys,
  IkatanKerjaDataKeys,
  JenisKelaminDataKeys,
  StatusKepegawaianDataKeys,
  useDosenData,
  getChartData,
  getStats,
  getCurrentTipeDataOption,
  getChartTitle,
  getChartSubtitle,
  type DosenStats,
} from "@/shared/components/pimpinan/dosen";
import { useUserContext } from "@/contexts/UserContextContext";

// ========================================
// Main Page Component
// ========================================

export default function DosenPage() {
  const { activeContext } = useUserContext();
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
    panggolFakultasList,
    panggolProdiList,
    ikatanKerjaFakultasList,
    ikatanKerjaProdiList,
    jenisKelaminFakultasList,
    jenisKelaminProdiList,
    statusKepegawaianFakultasList,
    statusKepegawaianProdiList,
    isLoadingChartData,
  } = useDosenData({
    selectedTipeData,
    selectedTahunAjaran,
    selectedFakultas,
    selectedProdi,
    userContext: activeContext,
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

  // Auto-select based on user role
  useEffect(() => {
    if (!activeContext || !fakultasList.length) return;

    // Level 3 = Rektor, Level 4 = Dekan, Level 5 = Kaprodi
    if (activeContext.level_organisasi == 4) {
      // Dekan: Auto-select their fakultas
      setSelectedFakultas(activeContext.id_organisasi);
    } else if (activeContext.level_organisasi == 5) {
      // Kaprodi: Auto-select parent fakultas, then their prodi
      setSelectedFakultas(activeContext.id_induk_organisasi);
      // Wait for prodi list to load, then auto-select
      const timer = setTimeout(() => {
        setSelectedProdi(activeContext.id_organisasi);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeContext, fakultasList]);

  // Get chart data and stats
  const chartData = getChartData(
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jabfungProdiList,
    jabfungFakultasList,
    jenjangProdiList,
    jenjangFakultasList,
    panggolProdiList,
    panggolFakultasList,
    ikatanKerjaProdiList,
    ikatanKerjaFakultasList,
    jenisKelaminProdiList,
    jenisKelaminFakultasList,
    statusKepegawaianProdiList,
    statusKepegawaianFakultasList,
  );

  const stats = getStats(
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jabfungProdiList,
    jabfungFakultasList,
    jenjangProdiList,
    jenjangFakultasList,
    panggolProdiList,
    panggolFakultasList,
    ikatanKerjaProdiList,
    ikatanKerjaFakultasList,
    jenisKelaminProdiList,
    jenisKelaminFakultasList,
    statusKepegawaianProdiList,
    statusKepegawaianFakultasList,
  ) as DosenStats;

  const currentTipeOption = getCurrentTipeDataOption(
    selectedTipeData,
    TipeDataOptions,
  );

  const isChartDisabled = !selectedTipeData || !selectedTahunAjaran;

  // Get selected names for modal
  const selectedTahunAjaranName =
    tahunAjaranList.find((t) => t.id_thn_ajaran == selectedTahunAjaran)
      ?.nm_thn_ajaran || "";
  const selectedFakultasName =
    fakultasList.find((f) => f.id == selectedFakultas)?.nama_fakultas || "";
  const selectedProdiName =
    prodiList.find((p) => p.id == selectedProdi)?.nama_prodi || "";

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

  const statsCardComponents: Record<string, React.ComponentType<any>> = {
    jabfung: JabfungStatsCards,
    jenjang_pendidikan: JenjangStatsCards,
    pang_gol: PangGolStatsCards,
    ikatan_kerja: IkatanKerjaStatsCards,
    jenis_kelamin: JenisKelaminStatsCards,
    status_pegawai: StatusKepegawaianStatsCards,
  };

  const dataKeysMap: Record<string, any> = {
    jenjang_pendidikan: JenjangDataKeys,
    pang_gol: PangGolDataKeys,
    ikatan_kerja: IkatanKerjaDataKeys,
    jenis_kelamin: JenisKelaminDataKeys,
    status_pegawai: StatusKepegawaianDataKeys,
  };

  const selectedDataKeys = selectedTipeData
    ? dataKeysMap[selectedTipeData]
    : undefined;
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
              golongan, ikatan kerja, jenjang pendidikan, dan status kepegawaian
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
                {activeContext?.level_organisasi == 3
                  ? "Silahkan pilih tipe data, fakultas, prodi, dan tahun ajaran di bawah ini!"
                  : activeContext?.level_organisasi == 4
                    ? "Menampilkan data untuk fakultas Anda. Silahkan pilih tipe data, prodi, dan tahun ajaran."
                    : "Menampilkan data untuk program studi Anda. Silahkan pilih tipe data dan tahun ajaran."}
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
                  value: "text-slate-700 font-semibold text-sm truncate",
                  popoverContent: "bg-white rounded-lg shadow-xl max-w-[350px]",
                  innerWrapper: "text-slate-700",
                }}
                listboxProps={{
                  itemClasses: {
                    base: "data-[hover=true]:bg-default-100",
                    title:
                      "text-sm font-medium text-foreground truncate max-w-full",
                  },
                }}
              >
                {TipeDataOptions.map((opt) => (
                  <SelectItem key={opt.value} textValue={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Select Fakultas */}
              {activeContext?.level_organisasi != 4 &&
                activeContext?.level_organisasi != 5 && (
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
                      value: "text-slate-700 font-semibold text-sm truncate",
                      popoverContent:
                        "bg-white rounded-lg shadow-xl max-w-[400px]",
                      innerWrapper: "text-slate-700",
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: "data-[hover=true]:bg-default-100",
                        title:
                          "text-sm font-medium text-foreground truncate max-w-full",
                      },
                    }}
                    renderValue={(items) => {
                      return items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center max-w-full gap-2 truncate"
                          title={item.textValue}
                        >
                          <span className="truncate">{item.textValue}</span>
                        </div>
                      ));
                    }}
                  >
                    {fakultasList.map((fakultas) => (
                      <SelectItem
                        key={fakultas.id}
                        textValue={fakultas.nama_fakultas}
                      >
                        {fakultas.nama_fakultas}
                      </SelectItem>
                    ))}
                  </Select>
                )}

              {/* Select Prodi */}
              {activeContext?.level_organisasi != 5 && (
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
                    value: "text-slate-700 font-semibold text-sm truncate",
                    popoverContent:
                      "bg-white rounded-lg shadow-xl max-w-[500px]",
                    innerWrapper: "text-slate-700",
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: "data-[hover=true]:bg-default-100",
                      title:
                        "text-sm font-medium text-foreground truncate max-w-full",
                    },
                  }}
                  renderValue={(items) => {
                    return items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center max-w-full gap-2 truncate"
                        title={item.textValue}
                      >
                        <span className="truncate">{item.textValue}</span>
                      </div>
                    ));
                  }}
                >
                  {prodiList.map((prodi) => (
                    <SelectItem key={prodi.id} textValue={prodi.nama_prodi}>
                      {prodi.nama_prodi}
                    </SelectItem>
                  ))}
                </Select>
              )}

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
                  value: "text-slate-700 font-semibold text-sm truncate",
                  popoverContent: "bg-white rounded-lg shadow-xl max-w-[300px]",
                  innerWrapper: "text-slate-700",
                }}
                listboxProps={{
                  itemClasses: {
                    base: "data-[hover=true]:bg-default-100",
                    title:
                      "text-sm font-medium text-foreground truncate max-w-full",
                  },
                }}
              >
                {tahunAjaranList.map((ta) => (
                  <SelectItem
                    key={ta.id_thn_ajaran}
                    textValue={ta.nm_thn_ajaran}
                  >
                    {ta.nm_thn_ajaran}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Komponen komponen total jumlah sesuai dengan tipe data misalkan : 

          - Jabatan Fungsional : Belum Jabfung, Asisten Ahli, Rektor (Jumlah dari total sesuai yang di drilldown)

          */}
          {selectedTahunAjaran &&
            selectedTipeData &&
            (() => {
              const SelectedComponent = statsCardComponents[selectedTipeData];
              return SelectedComponent ? (
                <SelectedComponent stats={stats} />
              ) : null;
            })()}

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
            dataKeys={selectedDataKeys}
            disabled={isChartDisabled}
            isLoading={isLoadingChartData}
          />
        </motion.div>
      </div>

      {/* Data Modal */}

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
    </>
  );
}
