"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, Select, SelectItem } from "@heroui/react";
import { FiUsers } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { executiveJabfungService } from "@/lib/services/executive/jabfungService";
import { DosenChart, DosenDataModal } from "@/shared/components/pimpinan/dosen";

// ========================================
// Types
// ========================================

type TipeData =
  | "jabfung"
  | "pang_gol"
  | "jenjang_pendidikan"
  | "status_pegawai";

interface TipeDataOption {
  key: string;
  label: string;
  value: TipeData;
  chartType: "bar" | "bar-stacked" | "pie" | "line";
}

const TipeDataOptions: TipeDataOption[] = [
  {
    key: "jabfung",
    label: "Jabatan Fungsional",
    value: "jabfung",
    chartType: "bar-stacked",
  },
  {
    key: "pang_gol",
    label: "Pangkat Golongan",
    value: "pang_gol",
    chartType: "bar-stacked",
  },
  {
    key: "jenjang_pendidikan",
    label: "Jenjang Pendidikan",
    value: "jenjang_pendidikan",
    chartType: "pie",
  },
  {
    key: "status_pegawai",
    label: "Status Kepegawaian",
    value: "status_pegawai",
    chartType: "pie",
  },
];

// ========================================
// Stats Card Component
// ========================================

interface DosenStatsCardProps {
  title: string;
  value: number;
  color: "blue" | "green" | "purple" | "amber" | "red";
}

const DosenStatsCard = ({ title, value, color }: DosenStatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl border-2 p-6`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${iconColorClasses[color]} mt-2`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
};

// ========================================
// Main Page Component
// ========================================

export default function DosenPage() {
  const [selectedTipeData, setSelectedTipeData] = useState<string>("");
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>("");
  const [selectedFakultas, setSelectedFakultas] = useState<string>("");
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Fetch tahun ajaran list
  const { data: tahunAjaranList = [], isLoading: isLoadingTahunAjaran } =
    useQuery({
      queryKey: ["dosen", "tahun-ajaran"],
      queryFn: () => executiveJabfungService.getTahunAjaranList(),
    });

  // Fetch fakultas list (independent, not dependent on tipe data)
  const { data: fakultasList = [], isLoading: isLoadingFakultas } = useQuery({
    queryKey: ["dosen", "fakultas"],
    queryFn: () => executiveJabfungService.getFakultasList(),
  });

  // Fetch prodi list
  const { data: prodiList = [], isLoading: isLoadingProdi } = useQuery({
    queryKey: ["dosen", "prodi", selectedFakultas],
    queryFn: () =>
      executiveJabfungService.getProdiList({
        fakultas_id: selectedFakultas,
      }),
    enabled: !!selectedFakultas,
  });

  // Fetch jabfung fakultas data
  const {
    data: jabfungFakultasList = [],
    isLoading: isLoadingJabfungFakultas,
  } = useQuery({
    queryKey: ["dosen", "jabfung", "fakultas", selectedTahunAjaran],
    queryFn: () =>
      executiveJabfungService.getJabfungFakultas({
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jabfung",
  });

  // Fetch jabfung prodi data
  const { data: jabfungProdiList = [], isLoading: isLoadingJabfungProdi } =
    useQuery({
      queryKey: [
        "dosen",
        "jabfung",
        "prodi",
        selectedFakultas,
        selectedTahunAjaran,
      ],
      queryFn: () =>
        executiveJabfungService.getJabfungProdi({
          idFakultas: selectedFakultas,
          tahun_ajaran: selectedTahunAjaran,
        }),
      enabled:
        !!selectedFakultas &&
        !!selectedTahunAjaran &&
        selectedTipeData === "jabfung",
    });

  // Handle tipe data change
  const handleTipeDataChange = (value: string) => {
    setSelectedTipeData(value);
  };

  // Handle tahun ajaran change
  const handleTahunAjaranChange = (value: string) => {
    setSelectedTahunAjaran(value);
    // Keep fakultas and prodi selection
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

  // Get current tipe data option
  const getCurrentTipeDataOption = (): TipeDataOption | undefined => {
    return TipeDataOptions.find((opt) => opt.value === selectedTipeData);
  };

  // Get chart data based on selection
  const getChartData = () => {
    if (selectedTipeData !== "jabfung") {
      return [];
    }

    // For jabfung data
    if (selectedProdi) {
      const prodi = jabfungProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            belum_jabfung: prodi.belum_jabfung,
            asisten_ahli: prodi.asisten_ahli,
            lektor: prodi.lektor,
            lektor_kepala: prodi.lektor_kepala,
            profesor: prodi.profesor,
          },
        ];
      }
    }

    if (selectedFakultas) {
      return jabfungProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        belum_jabfung: p.belum_jabfung,
        asisten_ahli: p.asisten_ahli,
        lektor: p.lektor,
        lektor_kepala: p.lektor_kepala,
        profesor: p.profesor,
      }));
    }

    return jabfungFakultasList.map((f) => ({
      name:
        f.nama_fakultas.substring(0, 20) +
        (f.nama_fakultas.length > 20 ? "..." : ""),
      belum_jabfung: f.belum_jabfung,
      asisten_ahli: f.asisten_ahli,
      lektor: f.lektor,
      lektor_kepala: f.lektor_kepala,
      profesor: f.profesor,
    }));
  };

  // Get stats based on selection
  const getStats = () => {
    if (selectedTipeData !== "jabfung") {
      return {
        belumJabfung: 0,
        asistenAhli: 0,
        lektor: 0,
        lektorKepala: 0,
        profesor: 0,
      };
    }

    if (selectedProdi) {
      const prodi = jabfungProdiList?.find((p) => p.id === selectedProdi);
      return {
        belumJabfung: prodi?.belum_jabfung || 0,
        asistenAhli: prodi?.asisten_ahli || 0,
        lektor: prodi?.lektor || 0,
        lektorKepala: prodi?.lektor_kepala || 0,
        profesor: prodi?.profesor || 0,
      };
    }

    if (selectedFakultas) {
      return (jabfungProdiList || []).reduce(
        (sum, p) => ({
          belumJabfung: sum.belumJabfung + p.belum_jabfung,
          asistenAhli: sum.asistenAhli + p.asisten_ahli,
          lektor: sum.lektor + p.lektor,
          lektorKepala: sum.lektorKepala + p.lektor_kepala,
          profesor: sum.profesor + p.profesor,
        }),
        {
          belumJabfung: 0,
          asistenAhli: 0,
          lektor: 0,
          lektorKepala: 0,
          profesor: 0,
        },
      );
    }

    return jabfungFakultasList.reduce(
      (sum, f) => ({
        belumJabfung: sum.belumJabfung + f.belum_jabfung,
        asistenAhli: sum.asistenAhli + f.asisten_ahli,
        lektor: sum.lektor + f.lektor,
        lektorKepala: sum.lektorKepala + f.lektor_kepala,
        profesor: sum.profesor + f.profesor,
      }),
      {
        belumJabfung: 0,
        asistenAhli: 0,
        lektor: 0,
        lektorKepala: 0,
        profesor: 0,
      },
    );
  };

  // Handle modal open
  const handleLihatData = () => {
    if (!selectedTipeData || !selectedTahunAjaran) {
      return;
    }
    setIsDataModalOpen(true);
  };

  // Get chart title based on selection
  const getChartTitle = () => {
    const tipeOption = getCurrentTipeDataOption();
    if (!tipeOption) return "Grafik Data Dosen";

    let title = `Grafik ${tipeOption.label}`;
    if (selectedProdi) {
      const prodi = prodiList.find((p) => p.id === selectedProdi);
      title += ` - ${prodi?.nama_prodi || ""}`;
    } else if (selectedFakultas) {
      const fakultas = fakultasList.find((f) => f.id === selectedFakultas);
      title += ` - ${fakultas?.nama_fakultas || ""}`;
    }
    return title;
  };

  // Get chart subtitle based on selection
  const getChartSubtitle = () => {
    if (selectedTahunAjaran) {
      const tahun = tahunAjaranList.find(
        (t) => t.id_thn_ajaran === selectedTahunAjaran,
      );
      return tahun?.nm_thn_ajaran || "";
    }
    return "";
  };

  const chartData = getChartData();
  const stats = getStats();
  const currentTipeOption = getCurrentTipeDataOption();
  const isChartDisabled = !selectedTipeData || !selectedTahunAjaran;

  // Get selected names for modal
  const selectedTahunAjaranName =
    tahunAjaranList.find((t) => t.id_thn_ajaran === selectedTahunAjaran)
      ?.nm_thn_ajaran || "";
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

          {/* Stats Cards - only show when jabfung is selected */}
          {selectedTipeData === "jabfung" && selectedTahunAjaran && (
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
              <DosenStatsCard
                title="Belum Jabfung"
                value={stats.belumJabfung}
                color="blue"
              />
              <DosenStatsCard
                title="Asisten Ahli"
                value={stats.asistenAhli}
                color="green"
              />
              <DosenStatsCard
                title="Lektor"
                value={stats.lektor}
                color="purple"
              />
              <DosenStatsCard
                title="Lektor Kepala"
                value={stats.lektorKepala}
                color="amber"
              />
              <DosenStatsCard
                title="Profesor"
                value={stats.profesor}
                color="red"
              />
            </div>
          )}

          {/* Chart Card */}
          <DosenChart
            data={chartData}
            chartType={currentTipeOption?.chartType || "bar"}
            title={getChartTitle()}
            subtitle={getChartSubtitle()}
            onLihatData={handleLihatData}
            xAxisKey="name"
            disabled={isChartDisabled}
          />
        </motion.div>
      </div>

      {/* Data Modal */}
      {selectedTipeData === "jabfung" && (
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
