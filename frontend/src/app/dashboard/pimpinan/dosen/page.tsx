"use client";

import { useState, useEffect, useMemo } from "react";
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
  DosenTrendChart,
  DosenPercentageChart,
  type DosenStats,
  type PercentageData,
} from "@/shared/components/pimpinan/dosen";
import { useUserContext } from "@/contexts/UserContextContext";

// Category keys for trend charts
const JABFUNG_CATEGORIES = [
  { key: "profesor", name: "Profesor", color: "#ef4444" },
  { key: "lektor_kepala", name: "Lektor Kepala", color: "#f59e0b" },
  { key: "lektor", name: "Lektor", color: "#22c55e" },
  { key: "asisten_ahli", name: "Asisten Ahli", color: "#3b82f6" },
  { key: "belum_jabfung", name: "Belum Jabfung", color: "#94a3b8" },
];

const IKATAN_KERJA_CATEGORIES = [
  { key: "dosen_tetap", name: "Dosen Tetap", color: "#3b82f6" },
  { key: "dosen_pns_dpk", name: "PNS DPK", color: "#6366f1" },
  { key: "dokter_pendidik_klinis", name: "Dokter Pendidik Klinis", color: "#8b5cf6" },
  { key: "dosen_tetap_bh", name: "Dosen Tetap BH", color: "#a855f7" },
  { key: "dosen_tidak_tetap", name: "Dosen Tidak Tetap", color: "#22c55e" },
  { key: "p3k_asn", name: "P3K ASN", color: "#14b8a6" },
  { key: "dosen_perjanjian_kerja", name: "Perjanjian Kerja", color: "#06b6d4" },
  { key: "instruktur", name: "Instruktur", color: "#f59e0b" },
  { key: "tutor", name: "Tutor", color: "#f97316" },
  { key: "jft", name: "JFT", color: "#ef4444" },
  { key: "pengajar_nondosen", name: "Pengajar Nondosen", color: "#dc2626" },
  { key: "dosen_tetap_pk_waktu_tertentu", name: "Tetap PKWTT", color: "#b91c1c" },
  { key: "belum_ikatan_kerja", name: "Belum Ikatan Kerja", color: "#cbd5e1" },
];

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
    jabfungFakultasHistorical,
    jabfungProdiHistorical,
    jenjangFakultasList,
    jenjangProdiList,
    panggolFakultasList,
    panggolProdiList,
    ikatanKerjaFakultasList,
    ikatanKerjaProdiList,
    ikatanKerjaFakultasHistorical,
    ikatanKerjaProdiHistorical,
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
    userContext: activeContext
      ? {
          id_organisasi: activeContext.id_organisasi || "",
          level_organisasi: activeContext.level_organisasi,
          id_induk_organisasi: activeContext.id_induk_organisasi || "",
        }
      : null,
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
      if (activeContext.id_organisasi) {
        setSelectedFakultas(activeContext.id_organisasi);
      }
    } else if (activeContext.level_organisasi == 5) {
      // Kaprodi: Auto-select parent fakultas, then their prodi
      if (activeContext.id_induk_organisasi) {
        setSelectedFakultas(activeContext.id_induk_organisasi);
      }
      // Wait for prodi list to load, then auto-select
      const timer = setTimeout(() => {
        if (activeContext.id_organisasi) {
          setSelectedProdi(activeContext.id_organisasi);
        }
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

  // Calculate percentage data for jabfung
  const jabfungPercentageData = useMemo(() => {
    if (selectedTipeData !== "jabfung") return [];

    let totalBelumJabfung = 0;
    let totalAsistenAhli = 0;
    let totalLektor = 0;
    let totalLektorKepala = 0;
    let totalProfesor = 0;

    if (selectedProdi && jabfungProdiList.length > 0) {
      // Prodi level - show data for selected prodi only
      const prodi = jabfungProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        totalBelumJabfung = prodi.belum_jabfung;
        totalAsistenAhli = prodi.asisten_ahli;
        totalLektor = prodi.lektor;
        totalLektorKepala = prodi.lektor_kepala;
        totalProfesor = prodi.profesor;
      }
    } else if (selectedFakultas && jabfungProdiList.length > 0) {
      // Fakultas level - aggregate all prodis in the fakultas
      jabfungProdiList.forEach((p) => {
        totalBelumJabfung += p.belum_jabfung;
        totalAsistenAhli += p.asisten_ahli;
        totalLektor += p.lektor;
        totalLektorKepala += p.lektor_kepala;
        totalProfesor += p.profesor;
      });
    } else if (jabfungFakultasList.length > 0) {
      // University level - aggregate all fakultas
      jabfungFakultasList.forEach((f) => {
        totalBelumJabfung += f.belum_jabfung;
        totalAsistenAhli += f.asisten_ahli;
        totalLektor += f.lektor;
        totalLektorKepala += f.lektor_kepala;
        totalProfesor += f.profesor;
      });
    }

    return [
      { name: "Belum Jabfung", value: totalBelumJabfung, color: "#94a3b8" },
      { name: "Asisten Ahli", value: totalAsistenAhli, color: "#3b82f6" },
      { name: "Lektor", value: totalLektor, color: "#22c55e" },
      { name: "Lektor Kepala", value: totalLektorKepala, color: "#f59e0b" },
      { name: "Profesor", value: totalProfesor, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jabfungFakultasList,
    jabfungProdiList,
  ]);

  // Get historical data based on filter
  const jabfungHistoricalData = useMemo(() => {
    if (selectedTipeData !== "jabfung") return [];

    // If prodi is selected, use prodi historical data (filtered by that prodi)
    if (selectedProdi && jabfungProdiHistorical.length > 0) {
      return jabfungProdiHistorical;
    }

    // If fakultas is selected (or no filter), use fakultas historical data
    // Note: jabfungFakultasHistorical is now filtered by selectedFakultas in the query
    return jabfungFakultasHistorical;
  }, [
    selectedTipeData,
    selectedProdi,
    jabfungFakultasHistorical,
    jabfungProdiHistorical,
  ]);

  // Get ikatan kerja historical data based on filter
  const ikatanKerjaHistoricalData = useMemo(() => {
    if (selectedTipeData !== "ikatan_kerja") return [];

    // If prodi is selected, use prodi historical data
    if (selectedProdi && ikatanKerjaProdiHistorical.length > 0) {
      return ikatanKerjaProdiHistorical;
    }

    // If fakultas is selected (or no filter), use fakultas historical data
    return ikatanKerjaFakultasHistorical;
  }, [
    selectedTipeData,
    selectedProdi,
    ikatanKerjaFakultasHistorical,
    ikatanKerjaProdiHistorical,
  ]);

  // Get chart title for percentage chart
  const getPercentageChartTitle = () => {
    const tipeDataName = TipeDataOptions.find(opt => opt.value === selectedTipeData)?.label || "";
    if (selectedProdi) {
      const prodi = prodiList.find((p) => p.id === selectedProdi);
      return `Presentase ${tipeDataName} - ${prodi?.nama_prodi || ""}`;
    } else if (selectedFakultas) {
      const fakultas = fakultasList.find((f) => f.id === selectedFakultas);
      return `Presentase ${tipeDataName} - ${fakultas?.nama_fakultas || ""}`;
    }
    return `Presentase ${tipeDataName} - Universitas`;
  };

  // Get chart title for trend chart
  const getTrendChartTitle = () => {
    const tipeDataName = TipeDataOptions.find(opt => opt.value === selectedTipeData)?.label || "";
    if (selectedProdi) {
      const prodi = prodiList.find((p) => p.id === selectedProdi);
      return `Tren ${tipeDataName} (5 Tahun) - ${prodi?.nama_prodi || ""}`;
    } else if (selectedFakultas) {
      const fakultas = fakultasList.find((f) => f.id === selectedFakultas);
      return `Tren ${tipeDataName} (5 Tahun) - ${fakultas?.nama_fakultas || ""}`;
    }
    return `Tren ${tipeDataName} (5 Tahun) - Universitas`;
  };

  // Calculate percentage data for ikatan kerja
  const ikatanKerjaPercentageData = useMemo(() => {
    if (selectedTipeData !== "ikatan_kerja") return [];

    let totalDosenTetap = 0;
    let totalDosenPnsDpk = 0;
    let totalDokterPendidikKlinis = 0;
    let totalDosenTetapBh = 0;
    let totalDosenTidakTetap = 0;
    let totalP3kAsn = 0;
    let totalDosenPerjanjianKerja = 0;
    let totalInstruktur = 0;
    let totalTutor = 0;
    let totalJft = 0;
    let totalPengajarNondosen = 0;
    let totalDosenTetapPkWaktuTertentu = 0;
    let totalBelumIkatanKerja = 0;

    if (selectedProdi && ikatanKerjaProdiList.length > 0) {
      // Prodi level - show data for selected prodi only
      const prodi = ikatanKerjaProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        totalDosenTetap = prodi.dosen_tetap;
        totalDosenPnsDpk = prodi.dosen_pns_dpk;
        totalDokterPendidikKlinis = prodi.dokter_pendidik_klinis;
        totalDosenTetapBh = prodi.dosen_tetap_bh;
        totalDosenTidakTetap = prodi.dosen_tidak_tetap;
        totalP3kAsn = prodi.p3k_asn;
        totalDosenPerjanjianKerja = prodi.dosen_perjanjian_kerja;
        totalInstruktur = prodi.instruktur;
        totalTutor = prodi.tutor;
        totalJft = prodi.jft;
        totalPengajarNondosen = prodi.pengajar_nondosen;
        totalDosenTetapPkWaktuTertentu = prodi.dosen_tetap_pk_waktu_tertentu;
        totalBelumIkatanKerja = prodi.belum_ikatan_kerja;
      }
    } else if (selectedFakultas && ikatanKerjaProdiList.length > 0) {
      // Fakultas level - aggregate all prodis in the fakultas
      ikatanKerjaProdiList.forEach((p) => {
        totalDosenTetap += p.dosen_tetap;
        totalDosenPnsDpk += p.dosen_pns_dpk;
        totalDokterPendidikKlinis += p.dokter_pendidik_klinis;
        totalDosenTetapBh += p.dosen_tetap_bh;
        totalDosenTidakTetap += p.dosen_tidak_tetap;
        totalP3kAsn += p.p3k_asn;
        totalDosenPerjanjianKerja += p.dosen_perjanjian_kerja;
        totalInstruktur += p.instruktur;
        totalTutor += p.tutor;
        totalJft += p.jft;
        totalPengajarNondosen += p.pengajar_nondosen;
        totalDosenTetapPkWaktuTertentu += p.dosen_tetap_pk_waktu_tertentu;
        totalBelumIkatanKerja += p.belum_ikatan_kerja;
      });
    } else if (ikatanKerjaFakultasList.length > 0) {
      // University level - aggregate all fakultas
      ikatanKerjaFakultasList.forEach((f) => {
        totalDosenTetap += f.dosen_tetap;
        totalDosenPnsDpk += f.dosen_pns_dpk;
        totalDokterPendidikKlinis += f.dokter_pendidik_klinis;
        totalDosenTetapBh += f.dosen_tetap_bh;
        totalDosenTidakTetap += f.dosen_tidak_tetap;
        totalP3kAsn += f.p3k_asn;
        totalDosenPerjanjianKerja += f.dosen_perjanjian_kerja;
        totalInstruktur += f.instruktur;
        totalTutor += f.tutor;
        totalJft += f.jft;
        totalPengajarNondosen += f.pengajar_nondosen;
        totalDosenTetapPkWaktuTertentu += f.dosen_tetap_pk_waktu_tertentu;
        totalBelumIkatanKerja += f.belum_ikatan_kerja;
      });
    }

    return [
      { name: "Dosen Tetap", value: totalDosenTetap, color: "#3b82f6" },
      { name: "PNS DPK", value: totalDosenPnsDpk, color: "#6366f1" },
      { name: "Dokter Pendidik Klinis", value: totalDokterPendidikKlinis, color: "#8b5cf6" },
      { name: "Dosen Tetap BH", value: totalDosenTetapBh, color: "#a855f7" },
      { name: "Dosen Tidak Tetap", value: totalDosenTidakTetap, color: "#22c55e" },
      { name: "P3K ASN", value: totalP3kAsn, color: "#14b8a6" },
      { name: "Perjanjian Kerja", value: totalDosenPerjanjianKerja, color: "#06b6d4" },
      { name: "Instruktur", value: totalInstruktur, color: "#f59e0b" },
      { name: "Tutor", value: totalTutor, color: "#f97316" },
      { name: "JFT", value: totalJft, color: "#ef4444" },
      { name: "Pengajar Nondosen", value: totalPengajarNondosen, color: "#dc2626" },
      { name: "Tetap PKWTT", value: totalDosenTetapPkWaktuTertentu, color: "#b91c1c" },
      { name: "Belum Ikatan Kerja", value: totalBelumIkatanKerja, color: "#cbd5e1" },
    ].filter((item) => item.value > 0);
  }, [
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    ikatanKerjaFakultasList,
    ikatanKerjaProdiList,
  ]);

  // Configuration for trend and percentage charts (must be after all useMemo hooks)
  const chartConfig: Record<string, {
    historicalData: typeof jabfungHistoricalData;
    percentageData: typeof jabfungPercentageData;
    categoryKeys: Array<{ key: string; name: string; color: string }>;
  }> = {
    jabfung: {
      historicalData: jabfungHistoricalData,
      percentageData: jabfungPercentageData,
      categoryKeys: JABFUNG_CATEGORIES,
    },
    ikatan_kerja: {
      historicalData: ikatanKerjaHistoricalData,
      percentageData: ikatanKerjaPercentageData,
      categoryKeys: IKATAN_KERJA_CATEGORIES,
    },
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

          {/* Historical Trend Chart & Percentage Chart */}
          {selectedTahunAjaran &&
            selectedTipeData &&
            chartConfig[selectedTipeData] && (
              <>
                {/* Historical Trend Chart */}
                {chartConfig[selectedTipeData].historicalData.length > 0 && (
                  <DosenTrendChart
                    data={chartConfig[selectedTipeData].historicalData}
                    title={getTrendChartTitle()}
                    categoryKeys={chartConfig[selectedTipeData].categoryKeys}
                  />
                )}

                {/* Percentage Chart */}
                {chartConfig[selectedTipeData].percentageData.length > 0 && (
                  <DosenPercentageChart
                    data={chartConfig[selectedTipeData].percentageData}
                    title={getPercentageChartTitle()}
                    subtitle={`Data tahun ${selectedTahunAjaran}`}
                  />
                )}
              </>
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
