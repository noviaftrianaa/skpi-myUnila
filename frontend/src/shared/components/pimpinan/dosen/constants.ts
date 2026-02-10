import type { TipeDataOption } from "./types";

// ========================================
// Constants
// ========================================

export const TipeDataOptions: TipeDataOption[] = [
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
    key: "ikatan_kerja",
    label: "Ikatan Kerja",
    value: "ikatan_kerja",
    chartType: "bar-stacked",
  },
  {
    key: "jenjang_pendidikan",
    label: "Jenjang Pendidikan",
    value: "jenjang_pendidikan",
    chartType: "bar-stacked",
  },
  {
    key: "status_pegawai",
    label: "Status Kepegawaian",
    value: "status_pegawai",
    chartType: "pie",
  },
];

// Tipe data display names
export const TipeDataNames: Record<string, string> = {
  jabfung: "Jabatan Fungsional",
  pang_gol: "Pangkat Golongan",
  ikatan_kerja: "Ikatan Kerja",
  jenjang_pendidikan: "Jenjang Pendidikan",
  status_pegawai: "Status Kepegawaian",
};

// Jenjang pendidikan data keys for bar/line charts
export const JenjangDataKeys = [
  { key: "d3", name: "D3", color: "#94a3b8" },
  { key: "d4", name: "D4", color: "#64748b" },
  { key: "s1", name: "S1", color: "#3b82f6" },
  { key: "s2", name: "S2", color: "#22c55e" },
  { key: "s2_terapan", name: "S2 Terapan", color: "#14b8a6" },
  { key: "s3", name: "S3", color: "#f59e0b" },
  { key: "profesi", name: "Profesi", color: "#ef4444" },
  { key: "sp1", name: "Sp1", color: "#8b5cf6" },
  { key: "sp2", name: "Sp2", color: "#ec4899" },
  { key: "belum_jenjang", name: "Belum Jenjang", color: "#cbd5e1" },
];

// Pangkat golongan data keys for bar/line charts
export const PangGolDataKeys = [
  { key: "juru_muda", name: "Juru Muda", color: "#94a3b8" },
  { key: "juru_muda_tk_1", name: "Juru Muda Tk. I", color: "#64748b" },
  { key: "juru", name: "Juru", color: "#475569" },
  { key: "juru_tk_1", name: "Juru Tk. I", color: "#334155" },
  { key: "pengatur_muda", name: "Pengatur Muda", color: "#3b82f6" },
  { key: "pengatur_muda_tk_1", name: "Pengatur Muda Tk. I", color: "#6366f1" },
  { key: "pengatur", name: "Pengatur", color: "#8b5cf6" },
  { key: "pengatur_tk_1", name: "Pengatur Tk. I", color: "#a855f7" },
  { key: "penata_muda", name: "Penata Muda", color: "#22c55e" },
  { key: "penata_muda_tk_1", name: "Penata Muda Tk. I", color: "#10b981" },
  { key: "penata", name: "Penata", color: "#14b8a6" },
  { key: "penata_tk_1", name: "Penata Tk. I", color: "#06b6d4" },
  { key: "pembina", name: "Pembina", color: "#f59e0b" },
  { key: "pembina_tk_1", name: "Pembina Tk. I", color: "#f97316" },
  { key: "pembina_utama_muda", name: "Pembina Utama Muda", color: "#ef4444" },
  { key: "pembina_utama_madya", name: "Pembina Utama Madya", color: "#dc2626" },
  { key: "pembina_utama", name: "Pembina Utama", color: "#b91c1c" },
  { key: "belum_pangkat_gol", name: "Belum Pangkat", color: "#cbd5e1" },
];

// Ikatan kerja data keys for bar/line charts
export const IkatanKerjaDataKeys = [
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
