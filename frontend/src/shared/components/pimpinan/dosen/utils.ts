import type { TipeDataOption, DosenStats } from "./types";
import type { JabfungFakultas, JabfungProdi } from "@/lib/services/executive/jabfungService";
import type { JenjangFakultas, JenjangProdi } from "@/lib/services/executive/jenjangPendidikanService";

// ========================================
// Chart Data Types
// ========================================

export type ChartDataItem =
  | { name: string; total: number }
  | {
      name: string;
      belum_jabfung: number;
      asisten_ahli: number;
      lektor: number;
      lektor_kepala: number;
      profesor: number;
    };

// ========================================
// Utils Functions
// ========================================

/**
 * Get chart data based on selection
 */
export const getChartData = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  jabfungProdiList: JabfungProdi[],
  jabfungFakultasList: JabfungFakultas[],
  jenjangProdiList: JenjangProdi[],
  jenjangFakultasList: JenjangFakultas[],
): ChartDataItem[] => {
  if (selectedTipeData === "jabfung") {
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
  }

  if (selectedTipeData === "jenjang_pendidikan") {
    // For jenjang pendidikan data - aggregate for pie chart
    if (selectedProdi) {
      const prodi = jenjangProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          { name: "D3", total: prodi.d3 },
          { name: "D4", total: prodi.d4 },
          { name: "S1", total: prodi.s1 },
          { name: "S2", total: prodi.s2 },
          { name: "S2 Terapan", total: prodi.s2_terapan },
          { name: "S3", total: prodi.s3 },
          { name: "Profesi", total: prodi.profesi },
          { name: "Sp1", total: prodi.sp1 },
          { name: "Sp2", total: prodi.sp2 },
          { name: "Belum Jenjang", total: prodi.belum_jenjang },
        ].filter((item) => item.total > 0);
      }
    }

    if (selectedFakultas) {
      const aggregated = jenjangProdiList.reduce(
        (sum, p) => ({
          d3: sum.d3 + p.d3,
          d4: sum.d4 + p.d4,
          s1: sum.s1 + p.s1,
          s2: sum.s2 + p.s2,
          s2_terapan: sum.s2_terapan + p.s2_terapan,
          s3: sum.s3 + p.s3,
          profesi: sum.profesi + p.profesi,
          sp1: sum.sp1 + p.sp1,
          sp2: sum.sp2 + p.sp2,
          belum_jenjang: sum.belum_jenjang + p.belum_jenjang,
        }),
        {
          d3: 0,
          d4: 0,
          s1: 0,
          s2: 0,
          s2_terapan: 0,
          s3: 0,
          profesi: 0,
          sp1: 0,
          sp2: 0,
          belum_jenjang: 0,
        }
      );

      return [
        { name: "D3", total: aggregated.d3 },
        { name: "D4", total: aggregated.d4 },
        { name: "S1", total: aggregated.s1 },
        { name: "S2", total: aggregated.s2 },
        { name: "S2 Terapan", total: aggregated.s2_terapan },
        { name: "S3", total: aggregated.s3 },
        { name: "Profesi", total: aggregated.profesi },
        { name: "Sp1", total: aggregated.sp1 },
        { name: "Sp2", total: aggregated.sp2 },
        { name: "Belum Jenjang", total: aggregated.belum_jenjang },
      ].filter((item) => item.total > 0);
    }

    const aggregated = jenjangFakultasList.reduce(
      (sum, f) => ({
        d3: sum.d3 + f.d3,
        d4: sum.d4 + f.d4,
        s1: sum.s1 + f.s1,
        s2: sum.s2 + f.s2,
        s2_terapan: sum.s2_terapan + f.s2_terapan,
        s3: sum.s3 + f.s3,
        profesi: sum.profesi + f.profesi,
        sp1: sum.sp1 + f.sp1,
        sp2: sum.sp2 + f.sp2,
        belum_jenjang: sum.belum_jenjang + f.belum_jenjang,
      }),
      {
        d3: 0,
        d4: 0,
        s1: 0,
        s2: 0,
        s2_terapan: 0,
        s3: 0,
        profesi: 0,
        sp1: 0,
        sp2: 0,
        belum_jenjang: 0,
      }
    );

    return [
      { name: "D3", total: aggregated.d3 },
      { name: "D4", total: aggregated.d4 },
      { name: "S1", total: aggregated.s1 },
      { name: "S2", total: aggregated.s2 },
      { name: "S2 Terapan", total: aggregated.s2_terapan },
      { name: "S3", total: aggregated.s3 },
      { name: "Profesi", total: aggregated.profesi },
      { name: "Sp1", total: aggregated.sp1 },
      { name: "Sp2", total: aggregated.sp2 },
      { name: "Belum Jenjang", total: aggregated.belum_jenjang },
    ].filter((item) => item.total > 0);
  }

  return [];
};

/**
 * Get stats based on selection
 */
export const getStats = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  jabfungProdiList: JabfungProdi[],
  jabfungFakultasList: JabfungFakultas[],
  jenjangProdiList: JenjangProdi[],
  jenjangFakultasList: JenjangFakultas[],
): DosenStats => {
  if (selectedTipeData === "jabfung") {
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
  }

  if (selectedTipeData === "jenjang_pendidikan") {
    if (selectedProdi) {
      const prodi = jenjangProdiList?.find((p) => p.id === selectedProdi);
      return {
        d3: prodi?.d3 || 0,
        d4: prodi?.d4 || 0,
        s1: prodi?.s1 || 0,
        s2: prodi?.s2 || 0,
        s2_terapan: prodi?.s2_terapan || 0,
        s3: prodi?.s3 || 0,
        profesi: prodi?.profesi || 0,
        sp1: prodi?.sp1 || 0,
        sp2: prodi?.sp2 || 0,
        belumJenjang: prodi?.belum_jenjang || 0,
      };
    }

    if (selectedFakultas) {
      return (jenjangProdiList || []).reduce(
        (sum, p) => ({
          d3: sum.d3 + p.d3,
          d4: sum.d4 + p.d4,
          s1: sum.s1 + p.s1,
          s2: sum.s2 + p.s2,
          s2_terapan: sum.s2_terapan + p.s2_terapan,
          s3: sum.s3 + p.s3,
          profesi: sum.profesi + p.profesi,
          sp1: sum.sp1 + p.sp1,
          sp2: sum.sp2 + p.sp2,
          belumJenjang: sum.belumJenjang + p.belum_jenjang,
        }),
        {
          d3: 0,
          d4: 0,
          s1: 0,
          s2: 0,
          s2_terapan: 0,
          s3: 0,
          profesi: 0,
          sp1: 0,
          sp2: 0,
          belumJenjang: 0,
        },
      );
    }

    return jenjangFakultasList.reduce(
      (sum, f) => ({
        d3: sum.d3 + f.d3,
        d4: sum.d4 + f.d4,
        s1: sum.s1 + f.s1,
        s2: sum.s2 + f.s2,
        s2_terapan: sum.s2_terapan + f.s2_terapan,
        s3: sum.s3 + f.s3,
        profesi: sum.profesi + f.profesi,
        sp1: sum.sp1 + f.sp1,
        sp2: sum.sp2 + f.sp2,
        belumJenjang: sum.belumJenjang + f.belum_jenjang,
      }),
      {
        d3: 0,
        d4: 0,
        s1: 0,
        s2: 0,
        s2_terapan: 0,
        s3: 0,
        profesi: 0,
        sp1: 0,
        sp2: 0,
        belumJenjang: 0,
      },
    );
  }

  // Default stats for jabfung
  return {
    belumJabfung: 0,
    asistenAhli: 0,
    lektor: 0,
    lektorKepala: 0,
    profesor: 0,
  };
};

/**
 * Get current tipe data option from TipeDataOptions
 */
export const getCurrentTipeDataOption = (
  selectedTipeData: string,
  tipeDataOptions: TipeDataOption[],
): TipeDataOption | undefined => {
  return tipeDataOptions.find((opt) => opt.value === selectedTipeData);
};

/**
 * Get chart title based on selection
 */
export const getChartTitle = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  prodiList: Array<{ id: string; nama_prodi: string }>,
  fakultasList: Array<{ id: string; nama_fakultas: string }>,
  tipeDataOptions: TipeDataOption[],
): string => {
  const tipeOption = tipeDataOptions.find((opt) => opt.value === selectedTipeData);
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

/**
 * Get chart subtitle based on selection
 */
export const getChartSubtitle = (
  selectedTahunAjaran: string,
  tahunAjaranList: Array<{ id_thn_ajaran: string; nm_thn_ajaran: string }>,
): string => {
  if (selectedTahunAjaran) {
    const tahun = tahunAjaranList.find(
      (t) => t.id_thn_ajaran === selectedTahunAjaran,
    );
    return tahun?.nm_thn_ajaran || "";
  }
  return "";
};
