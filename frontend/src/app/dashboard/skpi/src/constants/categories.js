export const KATEGORI_OPTIONS = [
  "PKKMB Universitas",
  "Organisasi",
  "Kepanitiaan",
  "Seminar/Lokakarya/Workshop",
  "Kuliah Umum",
  "Penelitian/Pengabdian",
  "Pelatihan",
  "Pelatihan Kepemimpinan",
  "Lomba",
  "Kekayaan Intelektual",
  "Kegiatan Bidang Sosial, kerohanian dan lainnya",
  "Publikasi",
  "Pendanaan",
];

export const KATEGORI_BADGE_STYLE = {
  "PKKMB Universitas": "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  "Organisasi": "bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  "Kepanitiaan": "bg-teal-100/70 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
  "Seminar/Lokakarya/Workshop": "bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  "Kuliah Umum": "bg-indigo-100/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  "Penelitian/Pengabdian": "bg-cyan-100/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300",
  "Pelatihan": "bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  "Pelatihan Kepemimpinan": "bg-orange-100/70 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
  "Lomba": "bg-sky-100/70 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
  "Kekayaan Intelektual": "bg-fuchsia-100/70 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300",
  "Kegiatan Bidang Sosial, kerohanian dan lainnya": "bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  "Publikasi": "bg-blue-100/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  "Pendanaan": "bg-lime-100/70 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300",
};

export const TINGKATAN_DEFAULT = [
  "Internasional",
  "Nasional",
  "Daerah/Regional",
  "Universitas",
  "Fakultas",
  "Jurusan/Program Studi",
];

export const TINGKATAN_PUBLIKASI = [
  "Internasional",
  "Nasional Akreditasi",
  "Nasional Non-Akreditasi",
];

export const TINGKATAN_PELATIHAN_KEPEMIMPINAN = [
  "Lanjut",
  "Menengah",
  "Dasar",
];

export const TINGKATAN_PENDANAAN = [
  "Belmawa",
  "Non-Belmawa",
];

export const JENIS_PENYELENGGARA_OPTIONS = [
  "Belmawa",
  "Non-Belmawa",
];

export const JENIS_PUBLIKASI_OPTIONS = [
  "Ilmiah",
  "Populer",
];

export function getTingkatanOptions(kategori) {
  if (kategori === "Pendanaan") {
    return TINGKATAN_PENDANAAN;
  }
  if (kategori === "Publikasi") {
    return TINGKATAN_PUBLIKASI;
  }
  if (kategori === "Pelatihan Kepemimpinan") {
    return TINGKATAN_PELATIHAN_KEPEMIMPINAN;
  }
  return TINGKATAN_DEFAULT;
}

export const JABATAN_DEFAULT = [
  "Peserta",
  "Pembicara",
  "Moderator",
  "Ketua",
  "Wakil Ketua",
  "Anggota",
];

export const JABATAN_ORGANISASI_KEPANITIAAN = [
  "Ketua",
  "Wakil Ketua",
  "Sekretaris",
  "Wakil Sekretaris",
  "Bendahara",
  "Wakil Bendahara",
  "Kepala Bidang/Koor/Departemen/Divisi/Seksi",
  "Anggota Pengurus",
];

export const JABATAN_PELATIHAN = [
  "Peserta",
  "Pembicara",
  "Ketua",
  "Anggota",
];

export const JABATAN_SEMINAR = [
  "Peserta",
  "Pembicara",
  "Moderator",
];

export function getJabatanOptions(kategori) {
  if (kategori === "Organisasi" || kategori === "Kepanitiaan") {
    return JABATAN_ORGANISASI_KEPANITIAAN;
  }
  if (kategori === "Pelatihan" || kategori === "Pelatihan Kepemimpinan") {
    return JABATAN_PELATIHAN;
  }
  if (kategori === "Seminar/Lokakarya/Workshop" || kategori === "Seminar" || kategori === "Kuliah Umum") {
    return JABATAN_SEMINAR;
  }
  return JABATAN_DEFAULT;
}

export const PRESTASI_LOMBA_OPTIONS = [
  "Juara 1",
  "Juara 2",
  "Juara 3",
  "Finalis",
  "Peserta",
];
