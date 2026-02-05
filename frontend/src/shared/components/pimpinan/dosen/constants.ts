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
