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

// IKU
export interface IkuJenjangDetail {
  jenjang: string;
  lulus_tepat_waktu: number;
  total_aktif: number;
  aee_realisasi: number;
  aee_ideal: number;
  tingkat_pencapaian: number;
}

export interface IkuDrilldownChild {
  id: string;
  name: string;
  value: number;
  target: number;
  status: string;
}

export interface IkuDrilldownItem {
  id: string;
  name: string;
  value: number;
  target: number;
  status: string;
  children?: IkuDrilldownChild[];
}

export interface IkuItem {
  id: number;
  code: string;
  title: string;
  definition: string;
  value: number;
  target: number;
  color: string;
  description?: string;
  perJenjang?: IkuJenjangDetail[];
  trendData: SimpleData[];
  drilldownData?: IkuDrilldownItem[];
}

// IKU 2 specific types
export interface Iku2StatusBreakdown {
  bekerja: number;
  wiraswasta: number;
  kuliah_lanjut: number;
  belum_bekerja: number;
}

export interface Iku2KategoriKerja {
  kat1: number; // <6bln, >1.2xUMP (Bobot 10)
  kat2: number; // <12bln, >1.2xUMP (Bobot 6)
  kat3: number; // <12bln, <1.2xUMP (Bobot 4)
}

export interface Iku2Item extends IkuItem {
  statusBreakdown?: Iku2StatusBreakdown;
  kategoriKerja?: Iku2KategoriKerja;
  totalLulusan?: number;
  totalResponden?: number;
  responseRate?: number;
}

// IKU 3 specific types
export interface Iku3KegiatanBreakdown {
  jenis_kegiatan: string;
  jumlah_mahasiswa: number;
}

export interface Iku3Item extends IkuItem {
  kegiatanBreakdown?: Iku3KegiatanBreakdown[];
  mbkm?: number;
  prestasiNasional?: number;
  totalAktif?: number;
  totalBerkegiatan?: number;
}

// IKU 5 specific types
export interface Iku5Item extends IkuItem {
  totalLuaran?: number;
  totalDosen?: number;
  kerjasamaBreakdown?: { name: string; value: number }[];
}

// IKU 7 specific types
export interface Iku7SdgBreakdownItem {
  sdg: number;
  name: string;
  value: number;
}

export interface Iku7Item extends IkuItem {
  kegiatanSDG?: number;
  litabmasSDG?: number;
  kerjasamaSDG?: number;
  totalKegiatan?: number;
  totalLitabmas?: number;
  totalKerjasama?: number;
  sdgBreakdown?: Iku7SdgBreakdownItem[];
  sdgWajib?: number[];
  sdgPilihan?: number[];
}

// IKU 9 specific types
export interface Iku9Item extends IkuItem {
  pendapatanMahasiswa?: number;
  pendapatanNonMahasiswa?: number;
  totalPendapatan?: number;
  detailLitabmas?: number;
  detailKerjasama?: number;
  detailOperasional?: number;
  revenueBreakdown?: { name: string; value: number }[];
}

export interface IkuOpsionalItem {
  id: number;
  code: string;
  title: string;
  definition: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
  trendData: SimpleData[];
  drilldownData?: IkuDrilldownItem[];
}

export interface IkuData {
  ikuWajib?: number[];
  ikuOpsional?: IkuOpsionalItem[];
  iku1: IkuItem;
  iku2?: Iku2Item;
  iku3?: Iku3Item;
  iku5?: Iku5Item;
  iku7?: Iku7Item;
  iku9?: Iku9Item;
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
