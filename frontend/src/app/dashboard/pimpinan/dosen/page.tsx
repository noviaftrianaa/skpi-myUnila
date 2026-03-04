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
  JABFUNG_CATEGORIES,
  IKATAN_KERJA_CATEGORIES,
  JENJANG_PENDIDIKAN_CATEGORIES,
  JENIS_KELAMIN_CATEGORIES,
  STATUS_KEPEGAWAIAN_CATEGORIES,
  type DosenStats,
  type PercentageData,
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
    jabfungFakultasHistorical,
    jabfungProdiHistorical,
    jenjangFakultasList,
    jenjangProdiList,
    jenjangFakultasHistorical,
    jenjangProdiHistorical,
    panggolFakultasList,
    panggolProdiList,
    ikatanKerjaFakultasList,
    ikatanKerjaProdiList,
    ikatanKerjaFakultasHistorical,
    ikatanKerjaProdiHistorical,
    jenisKelaminFakultasList,
    jenisKelaminProdiList,
    jenisKelaminFakultasHistorical,
    jenisKelaminProdiHistorical,
    statusKepegawaianFakultasList,
    statusKepegawaianProdiList,
    statusKepegawaianFakultasHistorical,
    statusKepegawaianProdiHistorical,
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

  // Get jenjang pendidikan historical data based on filter
  const jenjangHistoricalData = useMemo(() => {
    if (selectedTipeData !== "jenjang_pendidikan") return [];

    // If prodi is selected, use prodi historical data
    if (selectedProdi && jenjangProdiHistorical.length > 0) {
      return jenjangProdiHistorical;
    }

    // If fakultas is selected (or no filter), use fakultas historical data
    return jenjangFakultasHistorical;
  }, [
    selectedTipeData,
    selectedProdi,
    jenjangFakultasHistorical,
    jenjangProdiHistorical,
  ]);

  // Calculate percentage data for jenjang pendidikan
  const jenjangPercentageData = useMemo(() => {
    if (selectedTipeData !== "jenjang_pendidikan") return [];

    let totalD3 = 0;
    let totalD4 = 0;
    let totalS1 = 0;
    let totalS2 = 0;
    let totalS2Terapan = 0;
    let totalS3 = 0;
    let totalProfesi = 0;
    let totalSp1 = 0;
    let totalSp2 = 0;
    let totalBelumJenjang = 0;

    if (selectedProdi && jenjangProdiList.length > 0) {
      // Prodi level - show data for selected prodi only
      const prodi = jenjangProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        totalD3 = prodi.d3;
        totalD4 = prodi.d4;
        totalS1 = prodi.s1;
        totalS2 = prodi.s2;
        totalS2Terapan = prodi.s2_terapan;
        totalS3 = prodi.s3;
        totalProfesi = prodi.profesi;
        totalSp1 = prodi.sp1;
        totalSp2 = prodi.sp2;
        totalBelumJenjang = prodi.belum_jenjang;
      }
    } else if (selectedFakultas && jenjangProdiList.length > 0) {
      // Fakultas level - aggregate all prodis in the fakultas
      jenjangProdiList.forEach((p) => {
        totalD3 += p.d3;
        totalD4 += p.d4;
        totalS1 += p.s1;
        totalS2 += p.s2;
        totalS2Terapan += p.s2_terapan;
        totalS3 += p.s3;
        totalProfesi += p.profesi;
        totalSp1 += p.sp1;
        totalSp2 += p.sp2;
        totalBelumJenjang += p.belum_jenjang;
      });
    } else if (jenjangFakultasList.length > 0) {
      // University level - aggregate all fakultas
      jenjangFakultasList.forEach((f) => {
        totalD3 += f.d3;
        totalD4 += f.d4;
        totalS1 += f.s1;
        totalS2 += f.s2;
        totalS2Terapan += f.s2_terapan;
        totalS3 += f.s3;
        totalProfesi += f.profesi;
        totalSp1 += f.sp1;
        totalSp2 += f.sp2;
        totalBelumJenjang += f.belum_jenjang;
      });
    }

    return [
      { name: "S3", value: totalS3, color: "#ef4444" },
      { name: "S2", value: totalS2, color: "#f59e0b" },
      { name: "S2 Terapan", value: totalS2Terapan, color: "#22c55e" },
      { name: "Profesi", value: totalProfesi, color: "#14b8a6" },
      { name: "Sp1", value: totalSp1, color: "#06b6d4" },
      { name: "Sp2", value: totalSp2, color: "#0ea5e9" },
      { name: "S1", value: totalS1, color: "#3b82f6" },
      { name: "D4", value: totalD4, color: "#6366f1" },
      { name: "D3", value: totalD3, color: "#8b5cf6" },
      { name: "Belum Jenjang", value: totalBelumJenjang, color: "#cbd5e1" },
    ].filter((item) => item.value > 0);
  }, [
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jenjangFakultasList,
    jenjangProdiList,
  ]);

  // Get jenis kelamin historical data based on filter
  const jenisKelaminHistoricalData = useMemo(() => {
    if (selectedTipeData !== "jenis_kelamin") return [];

    // If prodi is selected, use prodi historical data
    if (selectedProdi && jenisKelaminProdiHistorical.length > 0) {
      return jenisKelaminProdiHistorical;
    }

    // If fakultas is selected (or no filter), use fakultas historical data
    return jenisKelaminFakultasHistorical;
  }, [
    selectedTipeData,
    selectedProdi,
    jenisKelaminFakultasHistorical,
    jenisKelaminProdiHistorical,
  ]);

  // Calculate percentage data for jenis kelamin
  const jenisKelaminPercentageData = useMemo(() => {
    if (selectedTipeData !== "jenis_kelamin") return [];

    let totalLakiLaki = 0;
    let totalPerempuan = 0;

    if (selectedProdi && jenisKelaminProdiList.length > 0) {
      // Prodi level - show data for selected prodi only
      const prodi = jenisKelaminProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        totalLakiLaki = prodi.laki_laki;
        totalPerempuan = prodi.perempuan;
      }
    } else if (selectedFakultas && jenisKelaminProdiList.length > 0) {
      // Fakultas level - aggregate all prodis in the fakultas
      jenisKelaminProdiList.forEach((p) => {
        totalLakiLaki += p.laki_laki;
        totalPerempuan += p.perempuan;
      });
    } else if (jenisKelaminFakultasList.length > 0) {
      // University level - aggregate all fakultas
      jenisKelaminFakultasList.forEach((f) => {
        totalLakiLaki += f.laki_laki;
        totalPerempuan += f.perempuan;
      });
    }

    return [
      { name: "Laki-laki", value: totalLakiLaki, color: "#3b82f6" },
      { name: "Perempuan", value: totalPerempuan, color: "#ec4899" },
    ].filter((item) => item.value > 0);
  }, [
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    jenisKelaminFakultasList,
    jenisKelaminProdiList,
  ]);

  // Get status kepegawaian historical data based on filter
  const statusKepegawaianHistoricalData = useMemo(() => {
    if (selectedTipeData !== "status_pegawai") return [];

    // If prodi is selected, use prodi historical data
    if (selectedProdi && statusKepegawaianProdiHistorical.length > 0) {
      return statusKepegawaianProdiHistorical;
    }

    // If fakultas is selected (or no filter), use fakultas historical data
    return statusKepegawaianFakultasHistorical;
  }, [
    selectedTipeData,
    selectedProdi,
    statusKepegawaianFakultasHistorical,
    statusKepegawaianProdiHistorical,
  ]);

  // Calculate percentage data for status kepegawaian
  const statusKepegawaianPercentageData = useMemo(() => {
    if (selectedTipeData !== "status_pegawai") return [];

    let totalPns = 0;
    let totalCpns = 0;
    let totalPppk = 0;
    let totalNonAsn = 0;
    let totalAsnJfNonDosen = 0;
    let totalDokterPendidikKlinis = 0;
    let totalLainnya = 0;

    if (selectedProdi && statusKepegawaianProdiList.length > 0) {
      // Prodi level - show data for selected prodi only
      const prodi = statusKepegawaianProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        totalPns = prodi.pns;
        totalCpns = prodi.cpns;
        totalPppk = prodi.pppk;
        totalNonAsn = prodi.non_asn;
        totalAsnJfNonDosen = prodi.asn_jf_non_dosen;
        totalDokterPendidikKlinis = prodi.dokter_pendidik_klinis;
        totalLainnya = prodi.lainnya;
      }
    } else if (selectedFakultas && statusKepegawaianProdiList.length > 0) {
      // Fakultas level - aggregate all prodis in the fakultas
      statusKepegawaianProdiList.forEach((p) => {
        totalPns += p.pns;
        totalCpns += p.cpns;
        totalPppk += p.pppk;
        totalNonAsn += p.non_asn;
        totalAsnJfNonDosen += p.asn_jf_non_dosen;
        totalDokterPendidikKlinis += p.dokter_pendidik_klinis;
        totalLainnya += p.lainnya;
      });
    } else if (statusKepegawaianFakultasList.length > 0) {
      // University level - aggregate all fakultas
      statusKepegawaianFakultasList.forEach((f) => {
        totalPns += f.pns;
        totalCpns += f.cpns;
        totalPppk += f.pppk;
        totalNonAsn += f.non_asn;
        totalAsnJfNonDosen += f.asn_jf_non_dosen;
        totalDokterPendidikKlinis += f.dokter_pendidik_klinis;
        totalLainnya += f.lainnya;
      });
    }

    return [
      { name: "PNS", value: totalPns, color: "#3b82f6" },
      { name: "CPNS", value: totalCpns, color: "#22c55e" },
      { name: "PPPK", value: totalPppk, color: "#f59e0b" },
      { name: "ASN JF Non Dosen", value: totalAsnJfNonDosen, color: "#8b5cf6" },
      { name: "Dokter Pendidik Klinis", value: totalDokterPendidikKlinis, color: "#06b6d4" },
      { name: "Non-ASN", value: totalNonAsn, color: "#ef4444" },
      { name: "Lainnya", value: totalLainnya, color: "#94a3b8" },
    ].filter((item) => item.value > 0);
  }, [
    selectedTipeData,
    selectedProdi,
    selectedFakultas,
    statusKepegawaianFakultasList,
    statusKepegawaianProdiList,
  ]);

  // Configuration for trend and percentage charts (must be after all useMemo hooks)
  const chartConfig: Record<string, {
    historicalData: typeof jabfungHistoricalData | typeof jenjangHistoricalData | typeof ikatanKerjaHistoricalData | typeof jenisKelaminHistoricalData | typeof statusKepegawaianHistoricalData;
    percentageData: typeof jabfungPercentageData | typeof jenjangPercentageData | typeof ikatanKerjaPercentageData | typeof jenisKelaminPercentageData | typeof statusKepegawaianPercentageData;
    categoryKeys: Array<{ key: string; name: string; color: string }>;
  }> = {
    jabfung: {
      historicalData: jabfungHistoricalData,
      percentageData: jabfungPercentageData,
      categoryKeys: JABFUNG_CATEGORIES,
    },
    jenjang_pendidikan: {
      historicalData: jenjangHistoricalData,
      percentageData: jenjangPercentageData,
      categoryKeys: JENJANG_PENDIDIKAN_CATEGORIES,
    },
    ikatan_kerja: {
      historicalData: ikatanKerjaHistoricalData,
      percentageData: ikatanKerjaPercentageData,
      categoryKeys: IKATAN_KERJA_CATEGORIES,
    },
    jenis_kelamin: {
      historicalData: jenisKelaminHistoricalData,
      percentageData: jenisKelaminPercentageData,
      categoryKeys: JENIS_KELAMIN_CATEGORIES,
    },
    status_pegawai: {
      historicalData: statusKepegawaianHistoricalData,
      percentageData: statusKepegawaianPercentageData,
      categoryKeys: STATUS_KEPEGAWAIAN_CATEGORIES,
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
