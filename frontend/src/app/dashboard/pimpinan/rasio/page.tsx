"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, Select, SelectItem } from "@heroui/react";
import { FiBarChart2 } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { executiveRasioService } from "@/lib/services/executive";
import { RasioStatsCard } from "@/shared/components/pimpinan/rasio/RasioStatsCard";
import { RasioChart } from "@/shared/components/pimpinan/rasio/RasioChart";
import { RasioDataModal } from "@/shared/components/pimpinan/rasio/RasioDataModal";

// ========================================
// Main Page Component
// ========================================

export default function RasioPage() {
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>("");
  const [selectedFakultas, setSelectedFakultas] = useState<string>("");
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Fetch tahun ajaran list
  const { data: tahunAjaranList = [], isLoading: isLoadingTahunAjaran } =
    useQuery({
      queryKey: ["rasio", "tahun-ajaran"],
      queryFn: () => executiveRasioService.getTahunAjaranList(),
    });

  // Auto-select tahun ajaran terbaru saat pertama kali load
  useEffect(() => {
    if (tahunAjaranList.length > 0 && !selectedTahunAjaran) {
      setSelectedTahunAjaran(tahunAjaranList[0].id_smt);
    }
  }, [tahunAjaranList, selectedTahunAjaran]);

  // Fetch fakultas list
  const { data: fakultasList = [], isLoading: isLoadingFakultas } = useQuery({
    queryKey: ["rasio", "fakultas", selectedTahunAjaran],
    queryFn: () =>
      executiveRasioService.getFakultas({
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled: !!selectedTahunAjaran,
  });

  // Fetch prodi list
  const { data: prodiList = [], isLoading: isLoadingProdi } = useQuery({
    queryKey: ["rasio", "prodi", selectedFakultas, selectedTahunAjaran],
    queryFn: () =>
      executiveRasioService.getProdiByFakultas({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran,
  });

  // Handle tahun ajaran change
  const handleTahunAjaranChange = (value: string) => {
    setSelectedTahunAjaran(value);
    setSelectedFakultas("");
    setSelectedProdi("");
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

  // Get chart data based on selection
  const getChartData = () => {
    if (selectedProdi) {
      const prodi = prodiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            dosen: prodi.jumlah_dosen,
            mahasiswa: prodi.jumlah_mahasiswa,
            rasio: prodi.rasio,
          },
        ];
      }
    }

    if (selectedFakultas) {
      return prodiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        dosen: p.jumlah_dosen,
        mahasiswa: p.jumlah_mahasiswa,
        rasio: p.rasio,
      }));
    }

    return fakultasList.map((f) => ({
      name:
        f.nama_fakultas.substring(0, 20) +
        (f.nama_fakultas.length > 20 ? "..." : ""),
      dosen: f.total_dosen,
      mahasiswa: f.total_mahasiswa,
      rasio: f.rasio,
    }));
  };

  // Get stats based on selection
  const getStats = () => {
    if (selectedProdi) {
      const prodi = prodiList.find((p) => p.id === selectedProdi);
      return {
        totalDosen: prodi?.jumlah_dosen || 0,
        totalMahasiswa: prodi?.jumlah_mahasiswa || 0,
        rasio: prodi?.rasio || "0:0",
      };
    }

    if (selectedFakultas) {
      const fakultas = fakultasList.find((f) => f.id === selectedFakultas);
      return {
        totalDosen: fakultas?.total_dosen || 0,
        totalMahasiswa: fakultas?.total_mahasiswa || 0,
        rasio: fakultas?.rasio || "0:0",
      };
    }

    return {
      totalDosen: fakultasList.reduce((sum, f) => sum + f.total_dosen, 0),
      totalMahasiswa: fakultasList.reduce(
        (sum, f) => sum + f.total_mahasiswa,
        0,
      ),
      rasio: fakultasList.length > 0 ? fakultasList[0].rasio : "0:0",
    };
  };

  // Handle modal open
  const handleLihatData = () => {
    setIsDataModalOpen(true);
  };

  const chartData = getChartData();
  const stats = getStats();

  // Get selected names for modal subtitle
  const selectedFakultasName =
    fakultasList.find((f) => f.id === selectedFakultas)?.nama_fakultas || "";
  const selectedProdiName =
    prodiList.find((p) => p.id === selectedProdi)?.nama_prodi || "";

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FiBarChart2 className="w-8 h-8 text-myunila" />
              <h1 className="text-3xl font-bold text-gray-800">
                Rasio Dosen-Mahasiswa
              </h1>
            </div>
            <p className="text-gray-600 ml-11">
              Analisis rasio dosen terhadap mahasiswa per fakultas dan program
              studi
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
                Silahkan pilih tahun ajaran, fakultas, dan prodi di bawah ini!
              </p>
            </Alert>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Select Tahun Ajaran */}
              <Select
                // label="Tahun Ajaran"
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
                  <SelectItem key={ta.id_smt}>{ta.nm_smt}</SelectItem>
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
                isDisabled={!selectedTahunAjaran || isLoadingFakultas}
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
                placeholder="Pilih Prodi"
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
                    "h-12 bg-white shadow-sm hover:shadow-md transition-all rounded-lg border-2 border-gray-300",
                  label: "text-gray-700 font-medium text-sm",
                  selectorIcon: "text-gray-500",
                  value: "text-gray-900 text-sm font-medium",
                  popoverContent: "bg-white rounded-lg shadow-xl",
                }}
              >
                {prodiList.map((prodi) => (
                  <SelectItem key={prodi.id}>{prodi.nama_prodi}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
            <RasioStatsCard
              title="Total Dosen"
              value={stats.totalDosen}
              icon="dosen"
              color="blue"
            />
            <RasioStatsCard
              title="Total Mahasiswa"
              value={stats.totalMahasiswa}
              icon="mahasiswa"
              color="green"
            />
            <RasioStatsCard
              title="Rasio (Dosen:Mhs)"
              value={stats.rasio}
              icon="rasio"
              color="purple"
            />
          </div>

          {/* Chart Card */}
          <RasioChart data={chartData} onLihatData={handleLihatData} />
        </motion.div>
      </div>

      {/* Data Modal */}
      <RasioDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        selectedTahunAjaran={selectedTahunAjaran}
        selectedFakultas={selectedFakultas}
        selectedFakultasName={selectedFakultasName}
        selectedProdi={selectedProdi}
        selectedProdiName={selectedProdiName}
      />
    </>
  );
}
