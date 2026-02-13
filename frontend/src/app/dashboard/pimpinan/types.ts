// ============================================
// Dashboard Pimpinan API Response Types
// ============================================

// Common data shapes
export interface SimpleData {
  name: string;
  value: number;
}

export interface CategoryData {
  name: string;
  value: number;
  category: string;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

export interface PyramidData {
  ageGroup: string;
  male: number;
  female: number;
}

export interface StatValue {
  total: number | string;
  trend?: number;
}

// API wrapper response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Per-page response types
// ============================================

// Beranda (page.tsx)
export interface BerandaData {
  summaryStats: {
    mahasiswa: { total: number; trend: number; active: number; cuti: number };
    sdm: { total: number; trend: number; dosen: number; tendik: number };
    akademik: { prodi: number; akrUnggul: number; akrInternasional: number };
    keuangan: { total: number; trend: number; serapan: number };
    penelitian: { judul: number; publikasi: number };
    kerjasama: { mitra: number; mou: number };
  };
  populasiTrend: CategoryData[];
  akreditasiDist: SimpleData[];
  fakultasData: CategoryData[];
}

// Mahasiswa
export interface MahasiswaData {
  stats: {
    aktif: StatValue;
    baru: StatValue;
    lulus: StatValue;
    cuti: StatValue;
    do: StatValue;
  };
  trendMahasiswa: SimpleData[];
  trendMahasiswaBaru: SimpleData[];
  sebaranFakultas: DrilldownItem[];
  distribusiJenjang: SimpleData[];
  jalurMasuk: SimpleData[];
  pembiayaan: SimpleData[];
  distribusiIPK: SimpleData[];
  ipkPerFakultas: SimpleData[];
  masaStudi: SimpleData[];
  beasiswa: SimpleData[];
  tugasAkhir: SimpleData[];
  asalProvinsi: SimpleData[];
  mahasiswaAsing: SimpleData[];
  warningMasaStudi: SimpleData[];
  genderDistribusi: SimpleData[];
  statusMahasiswa: SimpleData[];
  rasioDosenMahasiswa: SimpleData[];
}

export interface DrilldownItem {
  id: string;
  name: string;
  value: number;
  children?: DrilldownItem[];
}

// Dosen
export interface DosenData {
  stats: {
    total: number;
    guruBesar: number;
    doktor: number;
    rasio: string;
  };
  jenjangPendidikan: SimpleData[];
  sebaranFakultas: DrilldownItem[];
  heatmapPendidikanJabfung: HeatmapData[];
  heatmapUsiaJabfung: HeatmapData[];
  ikatanKerja: SimpleData[];
  genderUsia: PyramidData[];
  sertifikasiJabfung: CategoryData[];
  trendSertifikasi: SimpleData[];
  trendJabfung: CategoryData[];
}

// Akreditasi
export interface AkreditasiData {
  stats: {
    totalProdi: StatValue;
    unggul: StatValue;
    baikSekali: StatValue;
    baik: StatValue;
    internasional: StatValue;
  };
  distribusiAkreditasi: SimpleData[];
  statusKadaluarsa: SimpleData[];
  sebaranFakultas: DrilldownItem[];
  akreditasiPerFakultas: CategoryData[];
  internasional: SimpleData[];
  internasionalDetail: AkreditasiIntlDetail[];
  expiringProdi: AkreditasiDetail[];
  detailTable: AkreditasiDetail[];
}

export interface AkreditasiDetail {
  prodi: string;
  fak: string;
  strata: string;
  rank: string;
  int: string;
  exp: string;
}

export interface AkreditasiIntlDetail {
  prodi: string;
  fak: string;
  strata: string;
  lembaga: string;
  exp: string;
}

// Lulusan
export interface LulusanData {
  stats: {
    totalLulusan: StatValue;
    tepatWaktu: StatValue;
    rataIPK: StatValue;
  };
  trendKelulusan: SimpleData[];
  ketepatanWaktu: SimpleData[];
  ipkLulusan: SimpleData[];
  tracerStudyStatus: SimpleData[];
  masaTungguKerja: SimpleData[];
  incomeDistribusi: SimpleData[];
  kesesuaianBidang: SimpleData[];
  lulusanPerFakultas: SimpleData[];
  lulusanPerJenjang: SimpleData[];
}

// Litabmas
export interface LitabmasData {
  stats: {
    penelitian: StatValue;
    pengabdian: StatValue;
  };
  trendLitabmas: CategoryData[];
  sumberDana: SimpleData[];
  sebaranFakultas: CategoryData[];
  bidangFokus: SimpleData[];
  skimKegiatan: SimpleData[];
}

// Publikasi
export interface PublikasiData {
  stats: {
    total: StatValue;
  };
  trendPublikasi: SimpleData[];
  jenisPublikasi: SimpleData[];
  topAuthors: SimpleData[];
  perFakultas: SimpleData[];
}

// Pegawai
export interface PegawaiData {
  stats: {
    total: StatValue;
    pns: StatValue;
    nonPns: StatValue;
  };
  statusKepegawaian: SimpleData[];
  sebaranUnitKerja: SimpleData[];
  genderUsia: PyramidData[];
  pendidikan: SimpleData[];
}

// Keuangan
export interface KeuanganData {
  stats: {
    pendapatan: StatValue;
    spp: StatValue;
  };
  trendPendapatanSPP: SimpleData[];
  komposisiPendapatan: SimpleData[];
  statusPembayaran: SimpleData[];
  pendapatanPerUKT: SimpleData[];
  tunggakanFakultas: SimpleData[];
}

// Prestasi
export interface PrestasiData {
  stats: {
    total: StatValue;
    nasional: StatValue;
    internasional: StatValue;
    publikasi: StatValue;
  };
  trendPrestasi: SimpleData[];
  prestasiPerTingkat: CategoryData[];
  jenisPrestasi: SimpleData[];
  topProdiPrestasi: SimpleData[];
  prestasiPerFakultas: SimpleData[];
  mahasiswaVsDosen: SimpleData[];
  trendPublikasi: SimpleData[];
  jenisPublikasi: SimpleData[];
  hkiPerFakultas: SimpleData[];
}

// Kerjasama
export interface KerjasamaData {
  stats: {
    totalMitra: StatValue;
    mouAktif: StatValue;
  };
  mitraByScope: SimpleData[];
  trenKerjasama: SimpleData[];
  mitraByType: SimpleData[];
}

// Reference
export interface ReferenceItem {
  id: string;
  nama: string;
}

export interface SemesterItem {
  id_smt: string;
  label: string;
  tahun: string;
  aktif: boolean;
}
