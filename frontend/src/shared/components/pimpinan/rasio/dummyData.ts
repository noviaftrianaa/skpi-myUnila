// ========================================
// Dummy Data Types
// ========================================

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  fakultas: string;
  angkatan: string;
}

export interface Dosen {
  id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  status: "PNS" | "Non-PNS";
}

export interface Prodi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  jumlah_dosen: number;
  jumlah_mahasiswa: number;
  rasio: string;
  detail_mahasiswa: Mahasiswa[];
  detail_dosen: Dosen[];
}

export interface Fakultas {
  id: string;
  nama_fakultas: string;
  total_dosen: number;
  total_mahasiswa: number;
  rasio: string;
}

// ========================================
// Dummy Data
// ========================================

export const dummyFakultas: Fakultas[] = [
  {
    id: "f1",
    nama_fakultas: "Fakultas Ekonomi dan Bisnis",
    total_dosen: 85,
    total_mahasiswa: 3200,
    rasio: "1:38",
  },
  {
    id: "f2",
    nama_fakultas: "Fakultas Hukum",
    total_dosen: 45,
    total_mahasiswa: 1800,
    rasio: "1:40",
  },
  {
    id: "f3",
    nama_fakultas: "Fakultas Teknik",
    total_dosen: 120,
    total_mahasiswa: 3800,
    rasio: "1:32",
  },
  {
    id: "f4",
    nama_fakultas: "Fakultas Pertanian",
    total_dosen: 65,
    total_mahasiswa: 2100,
    rasio: "1:32",
  },
  {
    id: "f5",
    nama_fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",
    total_dosen: 150,
    total_mahasiswa: 5500,
    rasio: "1:37",
  },
];

// Helper function to generate dummy mahasiswa
const generateMahasiswa = (
  count: number,
  prodi: string,
  fakultas: string,
  startId: number
): Mahasiswa[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `mhs-${startId + i}`,
    nim: `${2020 + Math.floor(Math.random() * 5)}${10000 + i}`,
    nama: `Mahasiswa ${startId + i}`,
    prodi,
    fakultas,
    angkatan: `${2020 + Math.floor(Math.random() * 5)}`,
  }));
};

// Helper function to generate dummy dosen
const generateDosen = (
  count: number,
  prodi: string,
  fakultas: string,
  startId: number
): Dosen[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `dsn-${startId + i}`,
    nidn: `04${100000 + i}`,
    nama: `Dr. Dosen ${startId + i}`,
    prodi,
    fakultas,
    status: Math.random() > 0.3 ? "PNS" : "Non-PNS",
  }));
};

export const dummyProdi: Prodi[] = [
  {
    id: "p1",
    nama_prodi: "Manajemen",
    fakultas_id: "f1",
    jumlah_dosen: 45,
    jumlah_mahasiswa: 1800,
    rasio: "1:40",
    detail_mahasiswa: generateMahasiswa(100, "Manajemen", "Fakultas Ekonomi dan Bisnis", 1),
    detail_dosen: generateDosen(45, "Manajemen", "Fakultas Ekonomi dan Bisnis", 1),
  },
  {
    id: "p2",
    nama_prodi: "Akuntansi",
    fakultas_id: "f1",
    jumlah_dosen: 40,
    jumlah_mahasiswa: 1400,
    rasio: "1:35",
    detail_mahasiswa: generateMahasiswa(80, "Akuntansi", "Fakultas Ekonomi dan Bisnis", 101),
    detail_dosen: generateDosen(40, "Akuntansi", "Fakultas Ekonomi dan Bisnis", 46),
  },
  {
    id: "p3",
    nama_prodi: "Ilmu Hukum",
    fakultas_id: "f2",
    jumlah_dosen: 45,
    jumlah_mahasiswa: 1800,
    rasio: "1:40",
    detail_mahasiswa: generateMahasiswa(100, "Ilmu Hukum", "Fakultas Hukum", 181),
    detail_dosen: generateDosen(45, "Ilmu Hukum", "Fakultas Hukum", 86),
  },
  {
    id: "p4",
    nama_prodi: "Teknik Sipil",
    fakultas_id: "f3",
    jumlah_dosen: 40,
    jumlah_mahasiswa: 1200,
    rasio: "1:30",
    detail_mahasiswa: generateMahasiswa(80, "Teknik Sipil", "Fakultas Teknik", 281),
    detail_dosen: generateDosen(40, "Teknik Sipil", "Fakultas Teknik", 131),
  },
  {
    id: "p5",
    nama_prodi: "Teknik Mesin",
    fakultas_id: "f3",
    jumlah_dosen: 35,
    jumlah_mahasiswa: 1100,
    rasio: "1:31",
    detail_mahasiswa: generateMahasiswa(75, "Teknik Mesin", "Fakultas Teknik", 361),
    detail_dosen: generateDosen(35, "Teknik Mesin", "Fakultas Teknik", 171),
  },
  {
    id: "p6",
    nama_prodi: "Teknik Elektro",
    fakultas_id: "f3",
    jumlah_dosen: 45,
    jumlah_mahasiswa: 1500,
    rasio: "1:33",
    detail_mahasiswa: generateMahasiswa(90, "Teknik Elektro", "Fakultas Teknik", 436),
    detail_dosen: generateDosen(45, "Teknik Elektro", "Fakultas Teknik", 206),
  },
  {
    id: "p7",
    nama_prodi: "Agroteknologi",
    fakultas_id: "f4",
    jumlah_dosen: 35,
    jumlah_mahasiswa: 1100,
    rasio: "1:31",
    detail_mahasiswa: generateMahasiswa(75, "Agroteknologi", "Fakultas Pertanian", 526),
    detail_dosen: generateDosen(35, "Agroteknologi", "Fakultas Pertanian", 251),
  },
  {
    id: "p8",
    nama_prodi: "Agribisnis",
    fakultas_id: "f4",
    jumlah_dosen: 30,
    jumlah_mahasiswa: 1000,
    rasio: "1:33",
    detail_mahasiswa: generateMahasiswa(70, "Agribisnis", "Fakultas Pertanian", 601),
    detail_dosen: generateDosen(30, "Agribisnis", "Fakultas Pertanian", 286),
  },
  {
    id: "p9",
    nama_prodi: "Pendidikan Matematika",
    fakultas_id: "f5",
    jumlah_dosen: 40,
    jumlah_mahasiswa: 1400,
    rasio: "1:35",
    detail_mahasiswa: generateMahasiswa(85, "Pendidikan Matematika", "FKIP", 671),
    detail_dosen: generateDosen(40, "Pendidikan Matematika", "FKIP", 316),
  },
  {
    id: "p10",
    nama_prodi: "Pendidikan Bahasa Inggris",
    fakultas_id: "f5",
    jumlah_dosen: 50,
    jumlah_mahasiswa: 1800,
    rasio: "1:36",
    detail_mahasiswa: generateMahasiswa(100, "Pendidikan Bahasa Inggris", "FKIP", 756),
    detail_dosen: generateDosen(50, "Pendidikan Bahasa Inggris", "FKIP", 356),
  },
  {
    id: "p11",
    nama_prodi: "Pendidikan Biologi",
    fakultas_id: "f5",
    jumlah_dosen: 35,
    jumlah_mahasiswa: 1200,
    rasio: "1:34",
    detail_mahasiswa: generateMahasiswa(80, "Pendidikan Biologi", "FKIP", 856),
    detail_dosen: generateDosen(35, "Pendidikan Biologi", "FKIP", 406),
  },
  {
    id: "p12",
    nama_prodi: "PGSD",
    fakultas_id: "f5",
    jumlah_dosen: 25,
    jumlah_mahasiswa: 1100,
    rasio: "1:44",
    detail_mahasiswa: generateMahasiswa(70, "PGSD", "FKIP", 936),
    detail_dosen: generateDosen(25, "PGSD", "FKIP", 441),
  },
];
