// ========================================
// Types
// ========================================

export type TipeData =
  | "jabfung"
  | "pang_gol"
  | "ikatan_kerja"
  | "jenjang_pendidikan"
  | "jenis_kelamin"
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
  juru_muda: number;
  juru_muda_tk_1: number;
  juru: number;
  juru_tk_1: number;
  pengatur_muda: number;
  pengatur_muda_tk_1: number;
  pengatur: number;
  pengatur_tk_1: number;
  penata_muda: number;
  penata_muda_tk_1: number;
  penata: number;
  penata_tk_1: number;
  pembina: number;
  pembina_tk_1: number;
  pembina_utama_muda: number;
  pembina_utama_madya: number;
  pembina_utama: number;
  belum_pangkat_gol: number;
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

// Stats types for jenis kelamin
export interface JenisKelaminStats {
  lakiLaki: number;
  perempuan: number;
}

// Stats types for status kepegawaian
export interface StatusKepegawaianStats {
  pns: number;
  cpns: number;
  pppk: number;
  nonAsn: number;
  asnJfNonDosen: number;
  dokterPendidikKlinis: number;
  lainnya: number;
}

// Combined stats type
export type DosenStats =
  | JabfungStats
  | JenjangStats
  | PangGolStats
  | IkatanKerjaStats
  | JenisKelaminStats
  | StatusKepegawaianStats;

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
  | "teal"
  | "violet"
  | "fuchsia"
  | "rose"
  | "emerald"
  | "yellow"
  | "destructive"
  | "slate"
  | "gray";
