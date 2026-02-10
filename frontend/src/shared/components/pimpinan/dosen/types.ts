// ========================================
// Types
// ========================================

export type TipeData =
  | "jabfung"
  | "pang_gol"
  | "ikatan_kerja"
  | "jenjang_pendidikan"
  | "status_pegawai";

export interface TipeDataOption {
  key: string;
  label: string;
  value: TipeData;
  chartType: "bar" | "bar-stacked" | "pie" | "line";
}

// Stats types for jabfung
export interface JabfungStats {
  belumJabfung: number;
  asistenAhli: number;
  lektor: number;
  lektorKepala: number;
  profesor: number;
}

// Stats types for jenjang pendidikan
export interface JenjangStats {
  d3: number;
  d4: number;
  s1: number;
  s2: number;
  s2_terapan: number;
  s3: number;
  profesi: number;
  sp1: number;
  sp2: number;
  belumJenjang: number;
}

// Stats types for pangkat golongan
export interface PangGolStats {
  juruMuda: number;
  juruMudaTk1: number;
  juru: number;
  juruTk1: number;
  pengaturMuda: number;
  pengaturMudaTk1: number;
  pengatur: number;
  pengaturTk1: number;
  penataMuda: number;
  penataMudaTk1: number;
  penata: number;
  penataTk1: number;
  pembina: number;
  pembinaTk1: number;
  pembinaUtamaMuda: number;
  pembinaUtamaMadya: number;
  pembinaUtama: number;
  belumPangkatGol: number;
}

// Stats types for ikatan kerja
export interface IkatanKerjaStats {
  dosenTetap: number;
  dosenPnsDpk: number;
  dokterPendidikKlinis: number;
  dosenTetapBh: number;
  dosenTidakTetap: number;
  p3kAsn: number;
  dosenPerjanjianKerja: number;
  instruktur: number;
  tutor: number;
  jft: number;
  pengajarNondosen: number;
  dosenTetapPkWaktuTertentu: number;
  belumIkatanKerja: number;
}

// Combined stats type
export type DosenStats =
  | JabfungStats
  | JenjangStats
  | PangGolStats
  | IkatanKerjaStats;

export type DosenStatsColor =
  | "blue"
  | "green"
  | "purple"
  | "amber"
  | "red"
  | "cyan"
  | "indigo"
  | "pink"
  | "orange"
  | "teal";
