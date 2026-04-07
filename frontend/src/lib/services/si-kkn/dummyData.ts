/**
 * Dummy data untuk SI KKN frontend demo
 * Data ini akan diganti dengan API calls saat integrasi backend
 */

import type {
  PeriodeKkn,
  LokasiKkn,
  WilayahKkn,
  JenisDokumen,
  KomponenPenilaian,
  KriteriaPendaftaran,
  RegistrasiKkn,
  DataPemohonKkn,
  VerifikasiSyarat,
  KelompokKkn,
  AnggotaKelompok,
  DplKelompok,
  PamongDesa,
  ProgramKerja,
  LogbookHarian,
  Absensi,
  CatatanBimbingan,
  NilaiMahasiswa,
  NilaiAkhir,
  PenilaianPamong,
  DokumenKkn,
  Sertifikat,
  DashboardStatsKkn,
  StatusRegistrasi,
  StatusKelompok,
  PeranAnggota,
  StatusAnggota,
  BidangProker,
  StatusProker,
  StatusLogbook,
  StatusHadir,
  NilaiHuruf,
  LaporanKelompok,
} from "./types";

// ============ Shared Reference Data ============

const fakultasList = [
  { id: "fak-01", nama: "Fakultas Teknik" },
  { id: "fak-02", nama: "Fakultas MIPA" },
  { id: "fak-03", nama: "Fakultas Hukum" },
  { id: "fak-04", nama: "Fakultas Ekonomi dan Bisnis" },
  { id: "fak-05", nama: "Fakultas Pertanian" },
  { id: "fak-06", nama: "Fakultas Keguruan dan Ilmu Pendidikan" },
  { id: "fak-07", nama: "Fakultas Ilmu Sosial dan Ilmu Politik" },
  { id: "fak-08", nama: "Fakultas Kedokteran" },
];

const prodiList = [
  { id: "prodi-01", nama: "Teknik Informatika", id_fak: "fak-01" },
  { id: "prodi-02", nama: "Teknik Elektro", id_fak: "fak-01" },
  { id: "prodi-03", nama: "Matematika", id_fak: "fak-02" },
  { id: "prodi-04", nama: "Ilmu Hukum", id_fak: "fak-03" },
  { id: "prodi-05", nama: "Manajemen", id_fak: "fak-04" },
  { id: "prodi-06", nama: "Agroteknologi", id_fak: "fak-05" },
  { id: "prodi-07", nama: "Pendidikan Bahasa Inggris", id_fak: "fak-06" },
  { id: "prodi-08", nama: "Ilmu Komunikasi", id_fak: "fak-07" },
  { id: "prodi-09", nama: "Pendidikan Dokter", id_fak: "fak-08" },
  { id: "prodi-10", nama: "Akuntansi", id_fak: "fak-04" },
];

export { fakultasList, prodiList };

// ============ ref.periode_kkn (3 records) ============

export const dummyPeriodeKkn: PeriodeKkn[] = [
  {
    id_periode: "per-001",
    nm_periode: "KKN Periode 1 Tahun 2025",
    tahun_akademik: "2024/2025",
    semester: "genap",
    tgl_mulai_daftar: "2025-01-10T00:00:00Z",
    tgl_selesai_daftar: "2025-02-10T23:59:59Z",
    tgl_mulai_kkn: "2025-03-01T00:00:00Z",
    tgl_selesai_kkn: "2025-04-30T23:59:59Z",
    kuota_peserta: 500,
    apakah_aktif: false,
    created_at: "2025-01-05T08:00:00Z",
    updated_at: "2025-01-05T08:00:00Z",
  },
  {
    id_periode: "per-002",
    nm_periode: "KKN Periode 2 Tahun 2025",
    tahun_akademik: "2025/2026",
    semester: "ganjil",
    tgl_mulai_daftar: "2025-07-01T00:00:00Z",
    tgl_selesai_daftar: "2025-08-01T23:59:59Z",
    tgl_mulai_kkn: "2025-08-15T00:00:00Z",
    tgl_selesai_kkn: "2025-10-15T23:59:59Z",
    kuota_peserta: 600,
    apakah_aktif: false,
    created_at: "2025-06-20T08:00:00Z",
    updated_at: "2025-06-20T08:00:00Z",
  },
  {
    id_periode: "per-003",
    nm_periode: "KKN Periode 1 Tahun 2026",
    tahun_akademik: "2025/2026",
    semester: "genap",
    tgl_mulai_daftar: "2026-01-15T00:00:00Z",
    tgl_selesai_daftar: "2026-02-15T23:59:59Z",
    tgl_mulai_kkn: "2026-03-01T00:00:00Z",
    tgl_selesai_kkn: "2026-04-30T23:59:59Z",
    kuota_peserta: 550,
    apakah_aktif: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
];

// ============ ref.wilayah_kkn (4 records) ============

export const dummyWilayahKkn: WilayahKkn[] = [
  { id_wilayah: "wil-001", nm_wilayah: "Wilayah Lampung Selatan", nm_kabupaten: "Lampung Selatan", provinsi: "Lampung", deskripsi: "Wilayah KKN Kabupaten Lampung Selatan", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_wilayah: "wil-002", nm_wilayah: "Wilayah Lampung Tengah", nm_kabupaten: "Lampung Tengah", provinsi: "Lampung", deskripsi: "Wilayah KKN Kabupaten Lampung Tengah", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_wilayah: "wil-003", nm_wilayah: "Wilayah Lampung Utara", nm_kabupaten: "Lampung Utara", provinsi: "Lampung", deskripsi: "Wilayah KKN Kabupaten Lampung Utara", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_wilayah: "wil-004", nm_wilayah: "Wilayah Pesawaran", nm_kabupaten: "Pesawaran", provinsi: "Lampung", deskripsi: "Wilayah KKN Kabupaten Pesawaran", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
];

// ============ ref.lokasi_kkn (10 records) ============

export const dummyLokasiKkn: LokasiKkn[] = [
  { id_lokasi: "lok-001", id_wilayah: "wil-001", nm_desa: "Desa Way Huwi", nm_kecamatan: "Jati Agung", nm_kabupaten: "Lampung Selatan", provinsi: "Lampung", kode_pos: "35365", alamat_posko: "Jl. Raya Way Huwi No. 10", latitude: -5.3631, longitude: 105.2446, kuota_mahasiswa: 15, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-002", id_wilayah: "wil-001", nm_desa: "Desa Marga Agung", nm_kecamatan: "Jati Agung", nm_kabupaten: "Lampung Selatan", provinsi: "Lampung", kode_pos: "35365", alamat_posko: "Jl. Marga Agung Rt 02", latitude: -5.3721, longitude: 105.2312, kuota_mahasiswa: 12, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-003", id_wilayah: "wil-001", nm_desa: "Desa Karang Anyar", nm_kecamatan: "Tanjung Bintang", nm_kabupaten: "Lampung Selatan", provinsi: "Lampung", kode_pos: "35363", alamat_posko: "Balai Desa Karang Anyar", latitude: -5.4012, longitude: 105.3145, kuota_mahasiswa: 10, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-004", id_wilayah: "wil-002", nm_desa: "Desa Bandar Jaya", nm_kecamatan: "Terbanggi Besar", nm_kabupaten: "Lampung Tengah", provinsi: "Lampung", kode_pos: "34163", alamat_posko: "Kantor Desa Bandar Jaya", latitude: -4.8821, longitude: 105.2789, kuota_mahasiswa: 15, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-005", id_wilayah: "wil-002", nm_desa: "Desa Gunung Sugih", nm_kecamatan: "Gunung Sugih", nm_kabupaten: "Lampung Tengah", provinsi: "Lampung", kode_pos: "34161", alamat_posko: "Balai Desa Gunung Sugih", latitude: -4.9213, longitude: 105.1987, kuota_mahasiswa: 12, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-006", id_wilayah: "wil-002", nm_desa: "Desa Trimurjo", nm_kecamatan: "Trimurjo", nm_kabupaten: "Lampung Tengah", provinsi: "Lampung", kode_pos: "34165", alamat_posko: "Jl. Raya Trimurjo No. 5", latitude: -5.0112, longitude: 105.2045, kuota_mahasiswa: 10, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-007", id_wilayah: "wil-003", nm_desa: "Desa Kotabumi Udik", nm_kecamatan: "Kotabumi", nm_kabupaten: "Lampung Utara", provinsi: "Lampung", kode_pos: "34512", alamat_posko: "Kantor Lurah Kotabumi Udik", latitude: -4.8312, longitude: 104.8987, kuota_mahasiswa: 12, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-008", id_wilayah: "wil-003", nm_desa: "Desa Abung Selatan", nm_kecamatan: "Abung Selatan", nm_kabupaten: "Lampung Utara", provinsi: "Lampung", kode_pos: "34516", alamat_posko: "Balai Desa Abung Selatan", latitude: -4.7856, longitude: 104.9321, kuota_mahasiswa: 10, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-009", id_wilayah: "wil-004", nm_desa: "Desa Gedong Tataan", nm_kecamatan: "Gedong Tataan", nm_kabupaten: "Pesawaran", provinsi: "Lampung", kode_pos: "35371", alamat_posko: "Kantor Desa Gedong Tataan", latitude: -5.4231, longitude: 105.0823, kuota_mahasiswa: 15, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_lokasi: "lok-010", id_wilayah: "wil-004", nm_desa: "Desa Kedondong", nm_kecamatan: "Kedondong", nm_kabupaten: "Pesawaran", provinsi: "Lampung", kode_pos: "35372", alamat_posko: "Balai Desa Kedondong", latitude: -5.4567, longitude: 105.0512, kuota_mahasiswa: 12, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
];

// ============ ref.jenis_dokumen (8 records) ============

export const dummyJenisDokumen: JenisDokumen[] = [
  { id_jenis_dokumen: "jd-001", kode_dokumen: "PROPOSAL", nm_dokumen: "Proposal Program Kerja", deskripsi: "Proposal program kerja kelompok KKN", tipe_file: "application/pdf", ukuran_maks_mb: 10, apakah_wajib: true, urutan: 1, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-002", kode_dokumen: "LOGBOOK", nm_dokumen: "Logbook Kegiatan", deskripsi: "File logbook kegiatan harian", tipe_file: "application/pdf", ukuran_maks_mb: 5, apakah_wajib: true, urutan: 2, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-003", kode_dokumen: "LAPORAN_HARIAN", nm_dokumen: "Laporan Harian", deskripsi: "Laporan kegiatan harian mahasiswa", tipe_file: "application/pdf", ukuran_maks_mb: 5, apakah_wajib: false, urutan: 3, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-004", kode_dokumen: "LAPORAN_AKHIR", nm_dokumen: "Laporan Akhir KKN", deskripsi: "Laporan akhir pelaksanaan KKN kelompok", tipe_file: "application/pdf", ukuran_maks_mb: 20, apakah_wajib: true, urutan: 4, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-005", kode_dokumen: "FOTO_KEGIATAN", nm_dokumen: "Foto Dokumentasi Kegiatan", deskripsi: "Foto dokumentasi kegiatan KKN", tipe_file: "image/jpeg,image/png", ukuran_maks_mb: 5, apakah_wajib: false, urutan: 5, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-006", kode_dokumen: "SURAT_TUGAS", nm_dokumen: "Surat Tugas KKN", deskripsi: "Surat tugas pelaksanaan KKN dari LPPM", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 6, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-007", kode_dokumen: "SERTIFIKAT", nm_dokumen: "Sertifikat KKN", deskripsi: "Sertifikat kelulusan KKN", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: false, urutan: 7, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_jenis_dokumen: "jd-008", kode_dokumen: "LAINNYA", nm_dokumen: "Dokumen Lainnya", deskripsi: "Dokumen pendukung lainnya", tipe_file: "application/pdf,image/jpeg,image/png", ukuran_maks_mb: 10, apakah_wajib: false, urutan: 8, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
];

// ============ ref.komponen_penilaian (7 records) ============

export const dummyKomponenPenilaian: KomponenPenilaian[] = [
  { id_komponen: "kp-001", kode_komponen: "KEHADIRAN", nm_komponen: "Kehadiran", bobot_persen: 15, penilai: "dpl", deskripsi: "Kehadiran dan kedisiplinan mahasiswa selama KKN", urutan: 1, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-002", kode_komponen: "PARTISIPASI", nm_komponen: "Partisipasi", bobot_persen: 15, penilai: "dpl", deskripsi: "Keaktifan dan partisipasi dalam kegiatan", urutan: 2, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-003", kode_komponen: "LOGBOOK", nm_komponen: "Logbook", bobot_persen: 15, penilai: "dpl", deskripsi: "Kelengkapan dan kualitas logbook harian", urutan: 3, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-004", kode_komponen: "LAPORAN", nm_komponen: "Laporan", bobot_persen: 20, penilai: "dpl", deskripsi: "Kualitas laporan akhir KKN", urutan: 4, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-005", kode_komponen: "PRESENTASI", nm_komponen: "Presentasi", bobot_persen: 10, penilai: "dpl", deskripsi: "Presentasi hasil kegiatan KKN", urutan: 5, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-006", kode_komponen: "SIKAP", nm_komponen: "Sikap", bobot_persen: 10, penilai: "dpl", deskripsi: "Sikap dan perilaku selama KKN", urutan: 6, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_komponen: "kp-007", kode_komponen: "PAMONG", nm_komponen: "Penilaian Pamong", bobot_persen: 15, penilai: "pamong", deskripsi: "Penilaian dari pamong desa", urutan: 7, apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
];

// ============ ref.kriteria_pendaftaran (6 records) ============

export const dummyKriteriaPendaftaran: KriteriaPendaftaran[] = [
  { id_kriteria: "kr-001", kode_kriteria: "MIN_SKS", nm_kriteria: "Minimum SKS", nilai_minimum: "100", deskripsi: "Mahasiswa harus sudah menempuh minimal 100 SKS", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_kriteria: "kr-002", kode_kriteria: "MIN_IPK", nm_kriteria: "Minimum IPK", nilai_minimum: "2.0", deskripsi: "IPK mahasiswa minimal 2.00", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_kriteria: "kr-003", kode_kriteria: "LUNAS_UKT", nm_kriteria: "Lunas UKT", nilai_minimum: "true", deskripsi: "Mahasiswa harus lunas UKT semester berjalan", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_kriteria: "kr-004", kode_kriteria: "MIN_SEMESTER", nm_kriteria: "Minimum Semester", nilai_minimum: "6", deskripsi: "Mahasiswa minimal sudah semester 6", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_kriteria: "kr-005", kode_kriteria: "MAX_SEMESTER", nm_kriteria: "Maksimum Semester", nilai_minimum: "12", deskripsi: "Mahasiswa maksimal semester 12", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
  { id_kriteria: "kr-006", kode_kriteria: "STATUS_AKTIF", nm_kriteria: "Status Aktif", nilai_minimum: "true", deskripsi: "Mahasiswa berstatus aktif (bukan cuti atau non-aktif)", apakah_aktif: true, created_at: "2026-01-10T08:00:00Z", updated_at: "2026-01-10T08:00:00Z" },
];

// ============ pendaftaran.registrasi_kkn (15 records) ============

const mahasiswaNames = [
  "Andi Pratama", "Siti Nurhaliza", "Budi Santoso", "Dewi Anggraini", "Rizky Maulana",
  "Putri Rahayu", "Ahmad Fauzi", "Lina Marlina", "Dimas Saputra", "Nadia Safitri",
  "Hendra Gunawan", "Mega Puspita", "Fajar Ramadhan", "Rina Wulandari", "Yoga Prasetyo",
];

const statusRegistrasiOptions: StatusRegistrasi[] = ["draft", "diajukan", "diterima", "diterima", "diterima", "diterima", "ditolak", "diajukan", "diterima", "diterima", "mengundurkan_diri", "diterima", "diajukan", "draft", "diterima"];

export const dummyRegistrasiKkn: RegistrasiKkn[] = mahasiswaNames.map((nama, i) => {
  const prodi = prodiList[i % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  const status = statusRegistrasiOptions[i];
  return {
    id_registrasi: `reg-${String(i + 1).padStart(3, "0")}`,
    id_periode: "per-003",
    id_mahasiswa: `mhs-${String(i + 1).padStart(3, "0")}`,
    npm: `22${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1100 + i).padStart(4, "0")}`,
    nm_mahasiswa: nama,
    id_prodi: prodi.id,
    nm_prodi: prodi.nama,
    id_fakultas: fak.id,
    nm_fakultas: fak.nama,
    semester: 6 + (i % 5),
    ipk: parseFloat((2.5 + (i % 15) * 0.1).toFixed(2)),
    total_sks: 100 + (i % 8) * 5,
    no_hp: `0812${String(30000000 + i * 1111)}`,
    email: `${nama.toLowerCase().replace(/ /g, ".")}@students.unila.ac.id`,
    status,
    alasan_penolakan: status === "ditolak" ? "IPK belum memenuhi syarat minimum" : null,
    tgl_daftar: status !== "draft" ? `2026-01-${String(15 + (i % 15)).padStart(2, "0")}T08:00:00Z` : null,
    catatan: i % 4 === 0 ? "Mohon diproses segera" : null,
    created_at: `2026-01-${String(15 + (i % 15)).padStart(2, "0")}T08:00:00Z`,
    updated_at: `2026-01-${String(16 + (i % 15)).padStart(2, "0")}T10:00:00Z`,
    nm_periode: "KKN Periode 1 Tahun 2026",
  };
});

// ============ pendaftaran.data_pemohon_kkn ============

export const dummyDataPemohonKkn: DataPemohonKkn[] = dummyRegistrasiKkn.map((reg, i) => ({
  id_data_pemohon: `dpm-${String(i + 1).padStart(3, "0")}`,
  id_registrasi: reg.id_registrasi,
  alamat_asal: `Jl. ${["Merdeka", "Sudirman", "Kartini", "Diponegoro", "Ahmad Yani"][i % 5]} No. ${i + 10}, Bandar Lampung`,
  no_hp_ortu: `0813${String(40000000 + i * 2222)}`,
  riwayat_penyakit: i % 5 === 0 ? "Alergi debu" : null,
  ukuran_baju: ["S", "M", "L", "XL", "M"][i % 5],
  preferensi_lokasi: i % 3 === 0 ? "Lampung Selatan" : null,
  pengalaman_organisasi: i % 2 === 0 ? "BEM Fakultas, UKM Olahraga" : "Himpunan Mahasiswa Prodi",
  keahlian_khusus: ["Desain Grafis", "Pemrograman", "Public Speaking", "Fotografi", "Videografi"][i % 5],
  created_at: reg.created_at,
  updated_at: reg.updated_at,
}));

// ============ pendaftaran.verifikasi_syarat ============

export const dummyVerifikasiSyarat: VerifikasiSyarat[] = dummyRegistrasiKkn
  .filter((r) => r.status !== "draft")
  .flatMap((reg, idx) =>
    dummyKriteriaPendaftaran.map((kr, ki) => ({
      id_verifikasi: `vs-${String(idx * 6 + ki + 1).padStart(3, "0")}`,
      id_registrasi: reg.id_registrasi,
      id_kriteria: kr.id_kriteria,
      nm_kriteria: kr.nm_kriteria,
      nilai_aktual: kr.kode_kriteria === "MIN_SKS" ? String(reg.total_sks) :
        kr.kode_kriteria === "MIN_IPK" ? String(reg.ipk) :
        kr.kode_kriteria === "LUNAS_UKT" ? "true" :
        kr.kode_kriteria === "MIN_SEMESTER" ? String(reg.semester) :
        kr.kode_kriteria === "MAX_SEMESTER" ? String(reg.semester) : "true",
      apakah_terpenuhi: reg.status !== "ditolak" || ki < 4,
      catatan: null,
      created_at: reg.created_at,
      updated_at: reg.updated_at,
    }))
  );

// ============ kelompok.kelompok_kkn (8 records) ============

const statusKelompokOptions: StatusKelompok[] = ["aktif", "aktif", "aktif", "aktif", "aktif", "selesai", "selesai", "dibentuk"];

export const dummyKelompokKkn: KelompokKkn[] = Array.from({ length: 8 }, (_, i) => {
  const lokasi = dummyLokasiKkn[i % dummyLokasiKkn.length];
  const status = statusKelompokOptions[i];
  return {
    id_kelompok: `kel-${String(i + 1).padStart(3, "0")}`,
    id_periode: i < 5 ? "per-003" : i < 7 ? "per-002" : "per-003",
    id_lokasi: lokasi.id_lokasi,
    kode_kelompok: `KKN-2026-${String(i + 1).padStart(3, "0")}`,
    nm_kelompok: `Kelompok ${i + 1} - ${lokasi.nm_desa}`,
    status,
    jumlah_anggota: i < 5 ? [4, 5, 3, 4, 4][i] : [5, 4, 3][i - 5],
    tgl_mulai: status !== "dibentuk" ? "2026-03-01T00:00:00Z" : null,
    tgl_selesai: status === "selesai" ? "2026-04-30T23:59:59Z" : null,
    catatan: i === 7 ? "Kelompok baru dibentuk, menunggu penempatan final" : null,
    created_at: "2026-02-20T08:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
    nm_periode: i < 5 || i === 7 ? "KKN Periode 1 Tahun 2026" : "KKN Periode 2 Tahun 2025",
    nm_desa: lokasi.nm_desa,
    nm_kecamatan: lokasi.nm_kecamatan,
    nm_kabupaten: lokasi.nm_kabupaten,
  };
});

// ============ kelompok.anggota_kelompok (30 records) ============

const peranOptions: PeranAnggota[] = ["ketua", "sekretaris", "bendahara", "anggota"];
const statusAnggotaOptions: StatusAnggota[] = ["aktif"];
const anggotaNames = [
  "Andi Pratama", "Siti Nurhaliza", "Budi Santoso", "Dewi Anggraini",
  "Putri Rahayu", "Ahmad Fauzi", "Lina Marlina", "Dimas Saputra",
  "Nadia Safitri", "Hendra Gunawan", "Mega Puspita", "Fajar Ramadhan",
  "Rina Wulandari", "Yoga Prasetyo", "Citra Dewi", "Bayu Nugroho",
  "Anisa Fitri", "Doni Setiawan", "Eva Susanti", "Galih Permana",
  "Indah Lestari", "Joko Susilo", "Kartika Sari", "Lukman Hakim",
  "Maya Angelica", "Naufal Azzam", "Olivia Putri", "Pandu Wijaya",
  "Raka Pratama", "Siska Amelia",
];

export const dummyAnggotaKelompok: AnggotaKelompok[] = (() => {
  const result: AnggotaKelompok[] = [];
  let anggotaIdx = 0;
  const kelompokSizes = [4, 5, 3, 4, 4, 5, 4, 3]; // total = 32, we trim to 30

  for (let k = 0; k < 8; k++) {
    const size = Math.min(kelompokSizes[k], anggotaNames.length - anggotaIdx);
    for (let m = 0; m < size && anggotaIdx < 30; m++) {
      const prodi = prodiList[anggotaIdx % prodiList.length];
      const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
      const peran: PeranAnggota = m === 0 ? "ketua" : m === 1 ? "sekretaris" : m === 2 ? "bendahara" : "anggota";
      result.push({
        id_anggota: `ang-${String(anggotaIdx + 1).padStart(3, "0")}`,
        id_kelompok: `kel-${String(k + 1).padStart(3, "0")}`,
        id_registrasi: `reg-${String(anggotaIdx + 1).padStart(3, "0")}`,
        id_mahasiswa: `mhs-${String(anggotaIdx + 1).padStart(3, "0")}`,
        npm: `22${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1100 + anggotaIdx).padStart(4, "0")}`,
        nm_mahasiswa: anggotaNames[anggotaIdx],
        nm_prodi: prodi.nama,
        nm_fakultas: fak.nama,
        peran,
        status: anggotaIdx === 28 ? "keluar" as StatusAnggota : "aktif",
        tgl_bergabung: "2026-02-25T08:00:00Z",
        tgl_keluar: anggotaIdx === 28 ? "2026-03-15T08:00:00Z" : null,
        catatan: anggotaIdx === 28 ? "Mengundurkan diri karena alasan kesehatan" : null,
        created_at: "2026-02-25T08:00:00Z",
        updated_at: "2026-02-25T08:00:00Z",
      });
      anggotaIdx++;
    }
  }
  return result;
})();

// ============ kelompok.dpl_kelompok (8 records) ============

const dosenNames = [
  "Prof. Dr. Ir. Lusmeilia Afriani, D.E.A.",
  "Dr. Eng. Admi Syarif, M.T.",
  "Dr. Dwi Yulianti, M.Si.",
  "Dr. FX. Arinto Setyawan, S.H., M.Hum.",
  "Dr. Habiburrahman, S.E., M.Si.",
  "Prof. Dr. Ir. Setyo Dwi Utomo, M.Sc.",
  "Dr. Herpratiwi, M.Pd.",
  "Dr. Ari Wijayanti, M.Si.",
];

const dosenNidns = ["0015066301", "0020057501", "0008076802", "0012056301", "0025037801", "0010056201", "0005076201", "0018087501"];

export const dummyDplKelompok: DplKelompok[] = dosenNames.map((nama, i) => {
  const prodi = prodiList[i % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  return {
    id_dpl: `dpl-${String(i + 1).padStart(3, "0")}`,
    id_kelompok: `kel-${String(i + 1).padStart(3, "0")}`,
    id_dosen: `dsn-${String(i + 1).padStart(3, "0")}`,
    nidn: dosenNidns[i],
    nm_dosen: nama,
    nm_prodi: prodi.nama,
    nm_fakultas: fak.nama,
    no_hp: `0813${String(50000000 + i * 1234)}`,
    email: `${nama.split(",")[0].split(".").pop()?.trim().toLowerCase().replace(/ /g, ".")}@eng.unila.ac.id`,
    created_at: "2026-02-20T08:00:00Z",
    updated_at: "2026-02-20T08:00:00Z",
  };
});

// ============ kelompok.pamong_desa (8 records) ============

const pamongNames = [
  "H. Suryadi", "Slamet Riyadi", "Hj. Aminah", "Bambang Hermanto",
  "Suparman", "Hj. Nurjanah", "Agus Salim", "Warsito",
];

export const dummyPamongDesa: PamongDesa[] = pamongNames.map((nama, i) => ({
  id_pamong: `pmg-${String(i + 1).padStart(3, "0")}`,
  id_kelompok: `kel-${String(i + 1).padStart(3, "0")}`,
  nm_pamong: nama,
  jabatan: i % 2 === 0 ? "Kepala Desa" : "Sekretaris Desa",
  instansi: `Pemerintah ${dummyLokasiKkn[i % dummyLokasiKkn.length].nm_desa}`,
  no_hp: `0815${String(60000000 + i * 1111)}`,
  alamat: `${dummyLokasiKkn[i % dummyLokasiKkn.length].nm_desa}, ${dummyLokasiKkn[i % dummyLokasiKkn.length].nm_kecamatan}`,
  created_at: "2026-02-20T08:00:00Z",
  updated_at: "2026-02-20T08:00:00Z",
}));

// ============ kegiatan.program_kerja (20 records) ============

const bidangOptions: BidangProker[] = ["pendidikan", "kesehatan", "ekonomi", "infrastruktur", "lingkungan", "sosial_budaya", "teknologi"];
const statusProkerOptions: StatusProker[] = ["rencana", "berjalan", "selesai", "batal"];

const prokerJudul = [
  "Bimbingan Belajar Anak SD", "Penyuluhan Kesehatan Masyarakat", "Pelatihan UMKM Digital",
  "Perbaikan Jalan Desa", "Penghijauan Lingkungan", "Festival Budaya Desa",
  "Pelatihan Komputer Dasar", "Posyandu Balita dan Lansia", "Workshop Kewirausahaan",
  "Pembangunan Perpustakaan Desa", "Bank Sampah Desa", "Lomba 17 Agustus",
  "Les Bahasa Inggris Gratis", "Cek Kesehatan Gratis", "Pelatihan E-Commerce",
  "Renovasi Balai Desa", "Penanaman Mangrove", "Pertunjukan Seni Tradisional",
  "Digitalisasi Administrasi Desa", "Senam Sehat Bersama",
];

export const dummyProgramKerja: ProgramKerja[] = prokerJudul.map((judul, i) => ({
  id_proker: `pk-${String(i + 1).padStart(3, "0")}`,
  id_kelompok: `kel-${String((i % 8) + 1).padStart(3, "0")}`,
  judul,
  deskripsi: `Program kerja ${judul.toLowerCase()} untuk masyarakat desa`,
  bidang: bidangOptions[i % bidangOptions.length],
  status: statusProkerOptions[i % statusProkerOptions.length],
  tgl_mulai: `2026-03-${String(5 + (i % 20)).padStart(2, "0")}T08:00:00Z`,
  tgl_selesai: i % 4 === 2 ? `2026-04-${String(1 + (i % 20)).padStart(2, "0")}T17:00:00Z` : null,
  lokasi_kegiatan: `${dummyLokasiKkn[i % dummyLokasiKkn.length].nm_desa}, ${dummyLokasiKkn[i % dummyLokasiKkn.length].nm_kecamatan}`,
  anggaran: (i + 1) * 250000,
  target_sasaran: ["Anak SD", "Warga Desa", "Pelaku UMKM", "Masyarakat Umum", "Ibu Rumah Tangga"][i % 5],
  capaian: i % 4 === 2 ? "Target tercapai 100%" : null,
  created_at: "2026-03-01T08:00:00Z",
  updated_at: "2026-03-10T08:00:00Z",
}));

// ============ kegiatan.logbook_harian (40 records) ============

const logbookStatuses: StatusLogbook[] = ["draft", "diajukan", "disetujui_dpl"];

export const dummyLogbookHarian: LogbookHarian[] = Array.from({ length: 40 }, (_, i) => {
  const anggota = dummyAnggotaKelompok[i % dummyAnggotaKelompok.length];
  const hari = 1 + (i % 28);
  return {
    id_logbook: `lb-${String(i + 1).padStart(3, "0")}`,
    id_anggota: anggota.id_anggota,
    id_kelompok: anggota.id_kelompok,
    tanggal: `2026-03-${String(hari).padStart(2, "0")}`,
    judul_kegiatan: [
      "Survei lokasi kegiatan", "Sosialisasi program kerja ke warga",
      "Pelaksanaan bimbingan belajar", "Gotong royong bersama warga",
      "Penyuluhan kesehatan di posyandu", "Pembuatan konten media sosial desa",
      "Rapat koordinasi kelompok", "Pelatihan keterampilan ibu rumah tangga",
      "Pembersihan lingkungan desa", "Kunjungan ke rumah warga",
    ][i % 10],
    deskripsi_kegiatan: `Kegiatan hari ke-${hari}: ${["Melakukan survei dan identifikasi potensi desa", "Sosialisasi program kepada perangkat desa dan warga", "Mengajar anak-anak SD materi matematika dan bahasa Inggris", "Membersihkan dan memperbaiki fasilitas umum desa", "Memberikan edukasi kesehatan dan pemeriksaan tekanan darah"][i % 5]}`,
    jam_mulai: `0${7 + (i % 3)}:00`,
    jam_selesai: `${15 + (i % 3)}:00`,
    hasil_kegiatan: i % 3 === 0 ? "Kegiatan berjalan lancar sesuai rencana" : null,
    kendala: i % 5 === 0 ? "Cuaca kurang mendukung" : null,
    dokumentasi_path: i % 2 === 0 ? `/uploads/logbook/foto_${i + 1}.jpg` : null,
    status: logbookStatuses[i % logbookStatuses.length],
    catatan_dpl: i % 3 === 2 ? "Bagus, lanjutkan kegiatan serupa" : null,
    created_at: `2026-03-${String(hari).padStart(2, "0")}T${String(16 + (i % 3))}:00:00Z`,
    updated_at: `2026-03-${String(hari).padStart(2, "0")}T${String(17 + (i % 2))}:00:00Z`,
    nm_mahasiswa: anggota.nm_mahasiswa,
    npm: anggota.npm,
  };
});

// ============ kegiatan.absensi (30 records) ============

const statusHadirOptions: StatusHadir[] = ["hadir", "hadir", "hadir", "hadir", "izin", "sakit", "alpha"];

export const dummyAbsensi: Absensi[] = Array.from({ length: 30 }, (_, i) => {
  const anggota = dummyAnggotaKelompok[i % dummyAnggotaKelompok.length];
  const hari = 1 + (i % 25);
  const statusHadir = statusHadirOptions[i % statusHadirOptions.length];
  return {
    id_absensi: `abs-${String(i + 1).padStart(3, "0")}`,
    id_anggota: anggota.id_anggota,
    id_kelompok: anggota.id_kelompok,
    tanggal: `2026-03-${String(hari).padStart(2, "0")}`,
    status_hadir: statusHadir,
    jam_datang: statusHadir === "hadir" ? `0${7 + (i % 2)}:${String(i % 60).padStart(2, "0")}` : null,
    jam_pulang: statusHadir === "hadir" ? `${16 + (i % 2)}:${String(i % 60).padStart(2, "0")}` : null,
    keterangan: statusHadir === "izin" ? "Izin keperluan kampus" : statusHadir === "sakit" ? "Sakit demam" : statusHadir === "alpha" ? "Tanpa keterangan" : null,
    lokasi_lat: statusHadir === "hadir" ? -5.3631 + (i % 10) * 0.01 : null,
    lokasi_lng: statusHadir === "hadir" ? 105.2446 + (i % 10) * 0.01 : null,
    created_at: `2026-03-${String(hari).padStart(2, "0")}T08:00:00Z`,
    updated_at: `2026-03-${String(hari).padStart(2, "0")}T08:00:00Z`,
    nm_mahasiswa: anggota.nm_mahasiswa,
    npm: anggota.npm,
  };
});

// ============ kegiatan.catatan_bimbingan (10 records) ============

export const dummyCatatanBimbingan: CatatanBimbingan[] = Array.from({ length: 10 }, (_, i) => {
  const dpl = dummyDplKelompok[i % dummyDplKelompok.length];
  const kelompok = dummyKelompokKkn[i % dummyKelompokKkn.length];
  const anggotaKel = dummyAnggotaKelompok.filter((a) => a.id_kelompok === kelompok.id_kelompok);
  return {
    id_catatan: `cb-${String(i + 1).padStart(3, "0")}`,
    id_kelompok: kelompok.id_kelompok,
    id_dpl: dpl.id_dpl,
    tanggal: `2026-03-${String(5 + i * 3).padStart(2, "0")}`,
    topik: [
      "Evaluasi minggu pertama KKN",
      "Pembahasan program kerja",
      "Monitoring pelaksanaan kegiatan",
      "Evaluasi logbook dan dokumentasi",
      "Persiapan laporan akhir",
      "Evaluasi minggu kedua KKN",
      "Pembahasan kendala di lapangan",
      "Review capaian program kerja",
      "Persiapan presentasi hasil KKN",
      "Evaluasi akhir pelaksanaan KKN",
    ][i],
    isi_bimbingan: [
      "Membahas adaptasi di lokasi KKN dan perencanaan kegiatan minggu pertama",
      "Review proposal program kerja dan penyesuaian dengan kebutuhan masyarakat",
      "Monitoring pelaksanaan program kerja, kendala, dan solusi yang diambil",
      "Evaluasi kelengkapan logbook harian dan kualitas dokumentasi kegiatan",
      "Panduan penyusunan laporan akhir dan format yang diharapkan",
      "Evaluasi progres kegiatan dan koordinasi dengan perangkat desa",
      "Identifikasi kendala utama dan strategi penyelesaian",
      "Review capaian tiap program kerja terhadap target yang ditetapkan",
      "Latihan presentasi dan pemberian masukan untuk perbaikan",
      "Evaluasi keseluruhan pelaksanaan KKN dan penilaian akhir",
    ][i],
    catatan_tindak_lanjut: i % 2 === 0 ? "Perbaiki dokumentasi kegiatan dan lengkapi logbook" : null,
    peserta_hadir: anggotaKel.slice(0, Math.min(3, anggotaKel.length)).map((a) => a.nm_mahasiswa),
    created_at: `2026-03-${String(5 + i * 3).padStart(2, "0")}T10:00:00Z`,
    updated_at: `2026-03-${String(5 + i * 3).padStart(2, "0")}T11:00:00Z`,
    nm_dosen: dpl.nm_dosen,
  };
});

// ============ penilaian.nilai_mahasiswa (30 records) ============

export const dummyNilaiMahasiswa: NilaiMahasiswa[] = (() => {
  const result: NilaiMahasiswa[] = [];
  // First 10 anggota, 3 komponen each
  for (let a = 0; a < 10; a++) {
    const anggota = dummyAnggotaKelompok[a];
    const dpl = dummyDplKelompok.find((d) => d.id_kelompok === anggota.id_kelompok);
    for (let k = 0; k < 3; k++) {
      const komponen = dummyKomponenPenilaian[k];
      result.push({
        id_nilai: `nm-${String(result.length + 1).padStart(3, "0")}`,
        id_anggota: anggota.id_anggota,
        id_komponen: komponen.id_komponen,
        id_penilai: dpl?.id_dpl || "dpl-001",
        nm_penilai: dpl?.nm_dosen || "DPL",
        nilai: parseFloat((65 + Math.random() * 30).toFixed(1)),
        catatan: result.length % 5 === 0 ? "Sangat baik, pertahankan" : null,
        created_at: "2026-04-15T08:00:00Z",
        updated_at: "2026-04-15T08:00:00Z",
        nm_mahasiswa: anggota.nm_mahasiswa,
        npm: anggota.npm,
        nm_komponen: komponen.nm_komponen,
        kode_komponen: komponen.kode_komponen,
      });
    }
  }
  return result;
})();

// ============ penilaian.nilai_akhir (10 records) ============

const nilaiHurufMap = (total: number): NilaiHuruf => {
  if (total >= 85) return "A";
  if (total >= 80) return "AB";
  if (total >= 70) return "B";
  if (total >= 65) return "BC";
  if (total >= 55) return "C";
  if (total >= 40) return "D";
  return "E";
};

export const dummyNilaiAkhir: NilaiAkhir[] = Array.from({ length: 10 }, (_, i) => {
  const anggota = dummyAnggotaKelompok[i];
  const totalNilai = parseFloat((65 + Math.random() * 30).toFixed(1));
  const huruf = nilaiHurufMap(totalNilai);
  return {
    id_nilai_akhir: `na-${String(i + 1).padStart(3, "0")}`,
    id_anggota: anggota.id_anggota,
    id_kelompok: anggota.id_kelompok,
    id_mahasiswa: anggota.id_mahasiswa,
    npm: anggota.npm,
    nm_mahasiswa: anggota.nm_mahasiswa,
    nm_prodi: anggota.nm_prodi,
    nm_fakultas: anggota.nm_fakultas,
    total_nilai: totalNilai,
    nilai_huruf: huruf,
    apakah_lulus: huruf !== "D" && huruf !== "E",
    catatan: i % 3 === 0 ? "Mahasiswa menunjukkan dedikasi tinggi selama KKN" : null,
    created_at: "2026-04-28T08:00:00Z",
    updated_at: "2026-04-28T08:00:00Z",
  };
});

// ============ penilaian.penilaian_pamong ============

export const dummyPenilaianPamong: PenilaianPamong[] = Array.from({ length: 10 }, (_, i) => {
  const anggota = dummyAnggotaKelompok[i];
  const pamong = dummyPamongDesa.find((p) => p.id_kelompok === anggota.id_kelompok);
  const nilaiSikap = parseFloat((70 + Math.random() * 25).toFixed(1));
  const nilaiKerjasama = parseFloat((70 + Math.random() * 25).toFixed(1));
  const nilaiInisiatif = parseFloat((65 + Math.random() * 30).toFixed(1));
  const nilaiKehadiran = parseFloat((75 + Math.random() * 20).toFixed(1));
  return {
    id_penilaian_pamong: `pp-${String(i + 1).padStart(3, "0")}`,
    id_anggota: anggota.id_anggota,
    id_pamong: pamong?.id_pamong || "pmg-001",
    nm_pamong: pamong?.nm_pamong || "Pamong Desa",
    nilai_sikap: nilaiSikap,
    nilai_kerjasama: nilaiKerjasama,
    nilai_inisiatif: nilaiInisiatif,
    nilai_kehadiran: nilaiKehadiran,
    nilai_rata_rata: parseFloat(((nilaiSikap + nilaiKerjasama + nilaiInisiatif + nilaiKehadiran) / 4).toFixed(1)),
    catatan: i % 3 === 0 ? "Mahasiswa sangat membantu masyarakat desa" : null,
    created_at: "2026-04-25T08:00:00Z",
    updated_at: "2026-04-25T08:00:00Z",
    nm_mahasiswa: anggota.nm_mahasiswa,
    npm: anggota.npm,
  };
});

// ============ dokumen.dokumen_kkn ============

export const dummyDokumenKkn: DokumenKkn[] = [
  { id_dokumen: "dk-001", id_kelompok: "kel-001", id_anggota: null, id_jenis_dokumen: "jd-001", kode_dokumen: "PROPOSAL", nm_file: "proposal_kelompok_1.pdf", file_path: "/uploads/kkn/proposal_kel1.pdf", tipe_file: "application/pdf", ukuran_byte: 2500000, deskripsi: "Proposal program kerja Kelompok 1", created_at: "2026-03-01T08:00:00Z", updated_at: "2026-03-01T08:00:00Z" },
  { id_dokumen: "dk-002", id_kelompok: "kel-001", id_anggota: null, id_jenis_dokumen: "jd-004", kode_dokumen: "LAPORAN_AKHIR", nm_file: "laporan_akhir_kel1.pdf", file_path: "/uploads/kkn/laporan_kel1.pdf", tipe_file: "application/pdf", ukuran_byte: 5000000, deskripsi: "Laporan akhir KKN Kelompok 1", created_at: "2026-04-28T08:00:00Z", updated_at: "2026-04-28T08:00:00Z" },
  { id_dokumen: "dk-003", id_kelompok: null, id_anggota: "ang-001", id_jenis_dokumen: "jd-002", kode_dokumen: "LOGBOOK", nm_file: "logbook_andi_pratama.pdf", file_path: "/uploads/kkn/logbook_ang001.pdf", tipe_file: "application/pdf", ukuran_byte: 1200000, deskripsi: "Logbook harian Andi Pratama", created_at: "2026-04-20T08:00:00Z", updated_at: "2026-04-20T08:00:00Z" },
  { id_dokumen: "dk-004", id_kelompok: "kel-002", id_anggota: null, id_jenis_dokumen: "jd-006", kode_dokumen: "SURAT_TUGAS", nm_file: "surat_tugas_kel2.pdf", file_path: "/uploads/kkn/st_kel2.pdf", tipe_file: "application/pdf", ukuran_byte: 350000, deskripsi: "Surat tugas KKN Kelompok 2", created_at: "2026-02-28T08:00:00Z", updated_at: "2026-02-28T08:00:00Z" },
  { id_dokumen: "dk-005", id_kelompok: "kel-001", id_anggota: null, id_jenis_dokumen: "jd-005", kode_dokumen: "FOTO_KEGIATAN", nm_file: "foto_kegiatan_kel1.jpg", file_path: "/uploads/kkn/foto_kel1.jpg", tipe_file: "image/jpeg", ukuran_byte: 890000, deskripsi: "Dokumentasi kegiatan bimbingan belajar", created_at: "2026-03-15T08:00:00Z", updated_at: "2026-03-15T08:00:00Z" },
];

// ============ dokumen.sertifikat ============

export const dummySertifikat: Sertifikat[] = Array.from({ length: 5 }, (_, i) => {
  const anggota = dummyAnggotaKelompok[i];
  const kelompok = dummyKelompokKkn.find((k) => k.id_kelompok === anggota.id_kelompok)!;
  return {
    id_sertifikat: `srt-${String(i + 1).padStart(3, "0")}`,
    id_anggota: anggota.id_anggota,
    id_periode: "per-002",
    no_sertifikat: `SERT/KKN/UNILA/2025/${String(i + 1).padStart(4, "0")}`,
    nm_mahasiswa: anggota.nm_mahasiswa,
    npm: anggota.npm,
    nm_prodi: anggota.nm_prodi,
    nm_fakultas: anggota.nm_fakultas,
    nm_lokasi: kelompok.nm_desa || "Desa Way Huwi",
    nm_kelompok: kelompok.nm_kelompok,
    tgl_terbit: "2025-11-15T08:00:00Z",
    file_path: `/uploads/kkn/sertifikat/sert_${i + 1}.pdf`,
    created_at: "2025-11-15T08:00:00Z",
    updated_at: "2025-11-15T08:00:00Z",
  };
});

// ============ Dashboard Stats ============

export const dummyDashboardStatsKkn: DashboardStatsKkn = {
  total_peserta: 420,
  peserta_aktif: 380,
  total_kelompok: 45,
  kelompok_aktif: 38,
  total_lokasi: 45,
  total_dpl: 45,
  pendaftar_baru: 15,
  logbook_hari_ini: 285,
  rata_rata_nilai: 78.5,
  tingkat_kelulusan: 96.2,
};

// ============ Trend Data (per periode) ============

export const dummyTrendData = [
  { periode: "KKN 2024-1", peserta: 380, kelompok: 40, lokasi: 40, tingkat_kelulusan: 94.5 },
  { periode: "KKN 2024-2", peserta: 450, kelompok: 48, lokasi: 48, tingkat_kelulusan: 95.8 },
  { periode: "KKN 2025-1", peserta: 500, kelompok: 52, lokasi: 52, tingkat_kelulusan: 96.0 },
  { periode: "KKN 2025-2", peserta: 480, kelompok: 50, lokasi: 50, tingkat_kelulusan: 95.2 },
  { periode: "KKN 2026-1", peserta: 420, kelompok: 45, lokasi: 45, tingkat_kelulusan: 96.2 },
];

// ============ Recent Activity ============

export const dummyRecentActivity = [
  { id: "1", aksi: "Pendaftaran KKN diterima", aktor: "Admin LPPM", waktu: "5 menit lalu", tipe: "success" as const },
  { id: "2", aksi: "Logbook harian diajukan", aktor: "Andi Pratama", waktu: "10 menit lalu", tipe: "info" as const },
  { id: "3", aksi: "Program kerja baru ditambahkan", aktor: "Kelompok 3", waktu: "30 menit lalu", tipe: "info" as const },
  { id: "4", aksi: "Bimbingan DPL dijadwalkan", aktor: "Dr. Eng. Admi Syarif", waktu: "1 jam lalu", tipe: "info" as const },
  { id: "5", aksi: "Pendaftaran KKN ditolak — IPK belum memenuhi", aktor: "Admin LPPM", waktu: "2 jam lalu", tipe: "danger" as const },
  { id: "6", aksi: "Nilai komponen diinput oleh DPL", aktor: "Dr. Dwi Yulianti", waktu: "3 jam lalu", tipe: "success" as const },
  { id: "7", aksi: "Absensi hari ini sudah diisi", aktor: "Siti Nurhaliza", waktu: "4 jam lalu", tipe: "info" as const },
  { id: "8", aksi: "Kelompok baru dibentuk", aktor: "Admin LPPM", waktu: "5 jam lalu", tipe: "success" as const },
  { id: "9", aksi: "Sertifikat KKN diterbitkan", aktor: "Admin LPPM", waktu: "1 hari lalu", tipe: "success" as const },
  { id: "10", aksi: "Laporan akhir kelompok diupload", aktor: "Kelompok 1", waktu: "1 hari lalu", tipe: "info" as const },
];

// ============ Laporan Kelompok ============

export const dummyLaporanKelompok: LaporanKelompok[] = [
  { id_laporan: "lk-001", id_kelompok: "kel-001", jenis_laporan: "mingguan", judul: "Laporan Minggu 1 - Kelompok 1", isi_laporan: "Kegiatan minggu pertama berjalan lancar...", file_path: "/uploads/kkn/laporan/lk_001.pdf", tgl_laporan: "2026-03-07", created_at: "2026-03-07T17:00:00Z", updated_at: "2026-03-07T17:00:00Z" },
  { id_laporan: "lk-002", id_kelompok: "kel-001", jenis_laporan: "mingguan", judul: "Laporan Minggu 2 - Kelompok 1", isi_laporan: "Pelaksanaan program kerja mulai berjalan...", file_path: "/uploads/kkn/laporan/lk_002.pdf", tgl_laporan: "2026-03-14", created_at: "2026-03-14T17:00:00Z", updated_at: "2026-03-14T17:00:00Z" },
  { id_laporan: "lk-003", id_kelompok: "kel-002", jenis_laporan: "mingguan", judul: "Laporan Minggu 1 - Kelompok 2", isi_laporan: "Adaptasi dengan lingkungan desa...", file_path: "/uploads/kkn/laporan/lk_003.pdf", tgl_laporan: "2026-03-07", created_at: "2026-03-07T17:00:00Z", updated_at: "2026-03-07T17:00:00Z" },
  { id_laporan: "lk-004", id_kelompok: "kel-001", jenis_laporan: "akhir", judul: "Laporan Akhir KKN - Kelompok 1", isi_laporan: "Rangkuman seluruh kegiatan KKN selama 2 bulan...", file_path: "/uploads/kkn/laporan/lk_004.pdf", tgl_laporan: "2026-04-28", created_at: "2026-04-28T17:00:00Z", updated_at: "2026-04-28T17:00:00Z" },
];
