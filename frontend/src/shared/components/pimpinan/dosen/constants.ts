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
    chartType: "pie",
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
