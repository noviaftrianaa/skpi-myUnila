// ========================================
// Types
// ========================================

export type TipeData =
  | "jabfung"
  | "pang_gol"
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

// Combined stats type
export type DosenStats = JabfungStats | JenjangStats;

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
