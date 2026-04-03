/**
 * Dummy data untuk SI MBAK frontend demo
 * Data ini akan diganti dengan API calls saat integrasi backend
 */

import type {
  JenisLayanan,
  PersyaratanLayanan,
  TahapanLayanan,
  TemplateDokumen,
  Pengajuan,
  DataPemohon,
  DokumenPengajuan,
  RiwayatPengajuan,
  PersetujuanPengajuan,
  BatchPenetapan,
  KandidatBatch,
  DashboardStats,
  StatusPengajuan,
} from "./types";

// ============ ref.jenis_layanan (10 records) ============

export const dummyJenisLayanan: JenisLayanan[] = [
  { id_jenis_layanan: "jl-001", kode_layanan: "LOA", nm_layanan: "Letter of Acceptance", kategori: "surat_mandiri", deskripsi: "Surat keterangan aktif kuliah untuk keperluan beasiswa, visa, dll", apakah_aktif: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-002", kode_layanan: "GANTI_KTM", nm_layanan: "Penggantian KTM", kategori: "surat_mandiri", deskripsi: "Penggantian Kartu Tanda Mahasiswa yang hilang atau rusak", apakah_aktif: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-003", kode_layanan: "GANTI_PKKMB", nm_layanan: "Penggantian Sertifikat PKKMB", kategori: "surat_mandiri", deskripsi: "Penggantian sertifikat PKKMB yang hilang atau rusak", apakah_aktif: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-004", kode_layanan: "HERREGISTRASI", nm_layanan: "Surat Keterangan Herregistrasi", kategori: "surat_mandiri", deskripsi: "Surat keterangan sudah melakukan herregistrasi semester berjalan", apakah_aktif: true, urutan: 4, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-005", kode_layanan: "CUTI", nm_layanan: "Cuti Akademik", kategori: "permohonan_akademik", deskripsi: "Permohonan cuti akademik (maks 2 semester)", apakah_aktif: true, urutan: 5, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-006", kode_layanan: "UNDUR_DIRI", nm_layanan: "Undur Diri / Pengunduran Diri", kategori: "permohonan_akademik", deskripsi: "Permohonan pengunduran diri dari status mahasiswa aktif", apakah_aktif: true, urutan: 6, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-007", kode_layanan: "ALIH_PROGRAM", nm_layanan: "Alih Program Studi", kategori: "permohonan_akademik", deskripsi: "Permohonan pindah program studi (IPK min 2.75, SKS min 40)", apakah_aktif: true, urutan: 7, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-008", kode_layanan: "HABIS_MASA_MUKIM", nm_layanan: "Habis Masa Mukim (HMM)", kategori: "batch_administrasi", deskripsi: "Penetapan mahasiswa yang melampaui batas waktu studi (>14 semester)", apakah_aktif: true, urutan: 8, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-009", kode_layanan: "PUTUS_STUDI", nm_layanan: "Putus Studi", kategori: "batch_administrasi", deskripsi: "Penetapan mahasiswa yang tidak registrasi 2 semester berturut-turut", apakah_aktif: true, urutan: 9, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_jenis_layanan: "jl-010", kode_layanan: "MONITORING", nm_layanan: "Monitoring Mahasiswa", kategori: "monitoring", deskripsi: "Monitoring data dan status mahasiswa aktif", apakah_aktif: true, urutan: 10, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
];

// ============ ref.persyaratan_layanan ============

export const dummyPersyaratan: PersyaratanLayanan[] = [
  // LOA
  { id_persyaratan: "ps-001", id_jenis_layanan: "jl-001", nm_persyaratan: "KTM (scan)", kode_dokumen: "DOC_KTM", tipe_file: "image/jpeg,image/png,application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-002", id_jenis_layanan: "jl-001", nm_persyaratan: "KRS Semester Berjalan", kode_dokumen: "DOC_KRS", tipe_file: "application/pdf", ukuran_maks_mb: 5, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-003", id_jenis_layanan: "jl-001", nm_persyaratan: "Pas Foto 3x4", kode_dokumen: "DOC_FOTO", tipe_file: "image/jpeg,image/png", ukuran_maks_mb: 1, apakah_wajib: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // GANTI_KTM
  { id_persyaratan: "ps-004", id_jenis_layanan: "jl-002", nm_persyaratan: "Surat Kehilangan dari Kepolisian", kode_dokumen: "DOC_SURAT_HILANG", tipe_file: "application/pdf,image/jpeg", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-005", id_jenis_layanan: "jl-002", nm_persyaratan: "Pas Foto 3x4", kode_dokumen: "DOC_FOTO", tipe_file: "image/jpeg,image/png", ukuran_maks_mb: 1, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-006", id_jenis_layanan: "jl-002", nm_persyaratan: "Bukti Pembayaran Denda", kode_dokumen: "DOC_BUKTI_BAYAR", tipe_file: "application/pdf,image/jpeg", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // GANTI_PKKMB
  { id_persyaratan: "ps-007", id_jenis_layanan: "jl-003", nm_persyaratan: "Surat Pernyataan Kehilangan", kode_dokumen: "DOC_SURAT_PERNYATAAN", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-008", id_jenis_layanan: "jl-003", nm_persyaratan: "Fotokopi KTM", kode_dokumen: "DOC_FC_KTM", tipe_file: "application/pdf,image/jpeg", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // HERREGISTRASI
  { id_persyaratan: "ps-009", id_jenis_layanan: "jl-004", nm_persyaratan: "Bukti Pembayaran UKT", kode_dokumen: "DOC_UKT", tipe_file: "application/pdf,image/jpeg", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-010", id_jenis_layanan: "jl-004", nm_persyaratan: "KRS Semester Berjalan", kode_dokumen: "DOC_KRS", tipe_file: "application/pdf", ukuran_maks_mb: 5, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // CUTI
  { id_persyaratan: "ps-011", id_jenis_layanan: "jl-005", nm_persyaratan: "Surat Permohonan Cuti (bermaterai)", kode_dokumen: "DOC_SURAT_CUTI", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-012", id_jenis_layanan: "jl-005", nm_persyaratan: "Surat Persetujuan Orang Tua", kode_dokumen: "DOC_PERSETUJUAN_ORTU", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-013", id_jenis_layanan: "jl-005", nm_persyaratan: "Bukti Lunas SPP", kode_dokumen: "DOC_LUNAS_SPP", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // UNDUR_DIRI
  { id_persyaratan: "ps-014", id_jenis_layanan: "jl-006", nm_persyaratan: "Surat Pernyataan Mengundurkan Diri (bermaterai)", kode_dokumen: "DOC_SURAT_UNDUR", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-015", id_jenis_layanan: "jl-006", nm_persyaratan: "Surat Persetujuan Orang Tua (bermaterai)", kode_dokumen: "DOC_PERSETUJUAN_ORTU", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-016", id_jenis_layanan: "jl-006", nm_persyaratan: "Bukti Bebas Tanggungan Perpustakaan", kode_dokumen: "DOC_BEBAS_PERPUS", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-017", id_jenis_layanan: "jl-006", nm_persyaratan: "Bukti Bebas Tanggungan Keuangan", kode_dokumen: "DOC_BEBAS_KEUANGAN", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: false, urutan: 4, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // ALIH_PROGRAM
  { id_persyaratan: "ps-018", id_jenis_layanan: "jl-007", nm_persyaratan: "Surat Permohonan Alih Program", kode_dokumen: "DOC_SURAT_ALIH", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-019", id_jenis_layanan: "jl-007", nm_persyaratan: "Transkrip Nilai Sementara", kode_dokumen: "DOC_TRANSKRIP", tipe_file: "application/pdf", ukuran_maks_mb: 5, apakah_wajib: true, urutan: 2, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_persyaratan: "ps-020", id_jenis_layanan: "jl-007", nm_persyaratan: "Surat Rekomendasi Dekan Asal", kode_dokumen: "DOC_REKOMENDASI", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 3, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
];

// ============ ref.tahapan_layanan ============

export const dummyTahapan: TahapanLayanan[] = [
  // Surat Mandiri (semua 4 layanan pakai tahapan yang sama)
  { id_tahapan: "th-001", id_jenis_layanan: "jl-001", nm_tahapan: "Pengajuan Mahasiswa", urutan: 1, role_penanggung_jawab: "Mahasiswa", deskripsi: "Mahasiswa mengisi form dan upload dokumen", created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-002", id_jenis_layanan: "jl-001", nm_tahapan: "Verifikasi Admin BAK", urutan: 2, role_penanggung_jawab: "Admin BAK", deskripsi: "Admin memverifikasi kelengkapan dokumen", created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-003", id_jenis_layanan: "jl-001", nm_tahapan: "Penerbitan Surat", urutan: 3, role_penanggung_jawab: "Admin BAK", deskripsi: "Generate dan terbitkan surat/dokumen", created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  // Permohonan Akademik
  { id_tahapan: "th-004", id_jenis_layanan: "jl-005", nm_tahapan: "Pengajuan Mahasiswa", urutan: 1, role_penanggung_jawab: "Mahasiswa", deskripsi: null, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-005", id_jenis_layanan: "jl-005", nm_tahapan: "Verifikasi Admin Fakultas", urutan: 2, role_penanggung_jawab: "Admin Fakultas", deskripsi: null, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-006", id_jenis_layanan: "jl-005", nm_tahapan: "Verifikasi Admin BAK", urutan: 3, role_penanggung_jawab: "Admin BAK", deskripsi: null, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-007", id_jenis_layanan: "jl-005", nm_tahapan: "Persetujuan Dekan", urutan: 4, role_penanggung_jawab: "Dekan", deskripsi: null, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_tahapan: "th-008", id_jenis_layanan: "jl-005", nm_tahapan: "Persetujuan Wakil Rektor", urutan: 5, role_penanggung_jawab: "Wakil Rektor", deskripsi: null, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
];

// ============ ref.template_dokumen ============

export const dummyTemplate: TemplateDokumen[] = [
  { id_template: "tp-001", id_jenis_layanan: "jl-001", nm_template: "Template LOA Bahasa Indonesia", jenis_output: "PDF", file_path: "/templates/loa_id.docx", versi: "1.0", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-002", id_jenis_layanan: "jl-001", nm_template: "Template LOA Bahasa Inggris", jenis_output: "PDF", file_path: "/templates/loa_en.docx", versi: "1.0", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-003", id_jenis_layanan: "jl-005", nm_template: "Template SK Cuti Akademik", jenis_output: "PDF", file_path: "/templates/sk_cuti.docx", versi: "2.1", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-004", id_jenis_layanan: "jl-006", nm_template: "Template SK Undur Diri", jenis_output: "PDF", file_path: "/templates/sk_undur_diri.docx", versi: "1.2", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-005", id_jenis_layanan: "jl-007", nm_template: "Template SK Alih Program", jenis_output: "PDF", file_path: "/templates/sk_alih_program.docx", versi: "1.0", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-006", id_jenis_layanan: "jl-008", nm_template: "Template SK Habis Masa Mukim", jenis_output: "PDF", file_path: "/templates/sk_hmm.docx", versi: "3.0", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-007", id_jenis_layanan: "jl-009", nm_template: "Template SK Putus Studi", jenis_output: "PDF", file_path: "/templates/sk_putus_studi.docx", versi: "2.0", apakah_aktif: true, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
  { id_template: "tp-008", id_jenis_layanan: "jl-004", nm_template: "Template Surat Herregistrasi", jenis_output: "PDF", file_path: null, versi: "1.0", apakah_aktif: false, created_at: "2026-01-15T08:00:00Z", updated_at: "2026-01-15T08:00:00Z" },
];

// ============ Dummy Pengajuan Data ============

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

function makePemohon(idx: number, idPengajuan: string): DataPemohon {
  const prodi = prodiList[idx % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  const names = [
    "Andi Pratama", "Siti Nurhaliza", "Budi Santoso", "Dewi Anggraini", "Rizky Maulana",
    "Putri Rahayu", "Ahmad Fauzi", "Lina Marlina", "Dimas Saputra", "Nadia Safitri",
    "Hendra Gunawan", "Mega Puspita", "Fajar Ramadhan", "Rina Wulandari", "Yoga Prasetyo",
    "Anisa Fitri", "Bayu Nugroho", "Citra Dewi", "Doni Setiawan", "Eva Susanti",
  ];
  return {
    id_data_pemohon: `dp-${String(idx + 1).padStart(3, "0")}`,
    id_pengajuan: idPengajuan,
    nm_lengkap: names[idx % names.length],
    npm: `22${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1100 + idx).padStart(4, "0")}`,
    no_hp: `0812${String(30000000 + idx * 1111)}`,
    email: `${names[idx % names.length].toLowerCase().replace(/ /g, ".")}@students.unila.ac.id`,
    id_prodi: prodi.id,
    nm_prodi: prodi.nama,
    id_fakultas: fak.id,
    nm_fakultas: fak.nama,
    semester: (idx % 8) + 2,
    ipk: parseFloat((2.5 + Math.random() * 1.5).toFixed(2)),
    total_sks: 20 + idx * 6,
    data_tambahan: null,
    created_at: "2026-03-01T08:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
  };
}

const statusOptions: StatusPengajuan[] = ["draft", "diajukan", "perlu_perbaikan", "diverifikasi", "menunggu_persetujuan", "disetujui", "ditolak", "terbit"];
const layananKodes = ["LOA", "GANTI_KTM", "GANTI_PKKMB", "HERREGISTRASI", "CUTI", "UNDUR_DIRI", "ALIH_PROGRAM"];

export const dummyPengajuan: Pengajuan[] = Array.from({ length: 20 }, (_, i) => {
  const kode = layananKodes[i % layananKodes.length];
  const jl = dummyJenisLayanan.find((j) => j.kode_layanan === kode)!;
  const status = statusOptions[i % statusOptions.length];
  const id = `peng-${String(i + 1).padStart(3, "0")}`;
  const pemohon = makePemohon(i, id);
  return {
    id_pengajuan: id,
    id_jenis_layanan: jl.id_jenis_layanan,
    kode_layanan: kode,
    no_pengajuan: `SIMBAK/2026/${String(i + 1).padStart(4, "0")}`,
    id_pemohon: `user-${String(i + 1).padStart(3, "0")}`,
    status,
    catatan_pemohon: i % 3 === 0 ? "Mohon diproses segera, terima kasih" : null,
    tgl_pengajuan: status !== "draft" ? `2026-03-${String(1 + (i % 25)).padStart(2, "0")}T${String(8 + (i % 10))}:00:00Z` : null,
    tgl_selesai: status === "terbit" ? `2026-03-${String(5 + (i % 20)).padStart(2, "0")}T14:00:00Z` : null,
    created_at: `2026-03-${String(1 + (i % 25)).padStart(2, "0")}T08:00:00Z`,
    updated_at: `2026-03-${String(1 + (i % 25)).padStart(2, "0")}T10:00:00Z`,
    nm_layanan: jl.nm_layanan,
    nm_pemohon: pemohon.nm_lengkap,
    data_pemohon: pemohon,
  };
});

// ============ Dummy Dokumen Pengajuan ============

export const dummyDokumen: DokumenPengajuan[] = [
  { id_dokumen: "dok-001", id_pengajuan: "peng-001", kode_dokumen: "DOC_KTM", nm_file: "ktm_andi.jpg", file_path: "/uploads/dok-001.jpg", tipe_file: "image/jpeg", ukuran_byte: 245000, status_verifikasi: "valid", catatan_verifikasi: null, created_at: "2026-03-01T08:30:00Z" },
  { id_dokumen: "dok-002", id_pengajuan: "peng-001", kode_dokumen: "DOC_KRS", nm_file: "krs_genap_2026.pdf", file_path: "/uploads/dok-002.pdf", tipe_file: "application/pdf", ukuran_byte: 512000, status_verifikasi: "valid", catatan_verifikasi: null, created_at: "2026-03-01T08:31:00Z" },
  { id_dokumen: "dok-003", id_pengajuan: "peng-001", kode_dokumen: "DOC_FOTO", nm_file: "foto_3x4.jpg", file_path: "/uploads/dok-003.jpg", tipe_file: "image/jpeg", ukuran_byte: 180000, status_verifikasi: "belum_dicek", catatan_verifikasi: null, created_at: "2026-03-01T08:32:00Z" },
  { id_dokumen: "dok-004", id_pengajuan: "peng-002", kode_dokumen: "DOC_SURAT_HILANG", nm_file: "surat_hilang_polisi.pdf", file_path: "/uploads/dok-004.pdf", tipe_file: "application/pdf", ukuran_byte: 320000, status_verifikasi: "tidak_valid", catatan_verifikasi: "Surat sudah expired, perlu yang terbaru", created_at: "2026-03-02T09:00:00Z" },
];

// ============ Dummy Riwayat Pengajuan ============

export const dummyRiwayat: RiwayatPengajuan[] = [
  { id_riwayat: "rw-001", id_pengajuan: "peng-001", status_dari: null, status_ke: "draft", catatan: "Pengajuan dibuat", id_aktor: "user-001", nm_aktor: "Andi Pratama", created_at: "2026-03-01T08:00:00Z" },
  { id_riwayat: "rw-002", id_pengajuan: "peng-001", status_dari: "draft", status_ke: "diajukan", catatan: "Dokumen lengkap, pengajuan dikirim", id_aktor: "user-001", nm_aktor: "Andi Pratama", created_at: "2026-03-01T09:00:00Z" },
  { id_riwayat: "rw-003", id_pengajuan: "peng-001", status_dari: "diajukan", status_ke: "diverifikasi", catatan: "Dokumen valid, pengajuan diverifikasi", id_aktor: "admin-001", nm_aktor: "Admin BAK", created_at: "2026-03-02T10:00:00Z" },
  { id_riwayat: "rw-004", id_pengajuan: "peng-001", status_dari: "diverifikasi", status_ke: "terbit", catatan: "Surat LOA telah diterbitkan", id_aktor: "admin-001", nm_aktor: "Admin BAK", created_at: "2026-03-03T14:00:00Z" },
  { id_riwayat: "rw-005", id_pengajuan: "peng-002", status_dari: null, status_ke: "draft", catatan: "Pengajuan dibuat", id_aktor: "user-002", nm_aktor: "Siti Nurhaliza", created_at: "2026-03-02T08:00:00Z" },
  { id_riwayat: "rw-006", id_pengajuan: "peng-002", status_dari: "draft", status_ke: "diajukan", catatan: null, id_aktor: "user-002", nm_aktor: "Siti Nurhaliza", created_at: "2026-03-02T09:00:00Z" },
  { id_riwayat: "rw-007", id_pengajuan: "peng-002", status_dari: "diajukan", status_ke: "perlu_perbaikan", catatan: "Surat kehilangan sudah expired, mohon upload yang baru", id_aktor: "admin-002", nm_aktor: "Admin BAK", created_at: "2026-03-03T11:00:00Z" },
];

// ============ Dummy Persetujuan (Approval Chain) ============

export const dummyPersetujuan: PersetujuanPengajuan[] = [
  { id_persetujuan: "prs-001", id_pengajuan: "peng-005", urutan: 1, role_penyetuju: "Admin Fakultas", id_penyetuju: "adm-fak-01", nm_penyetuju: "Dr. Sumardi, M.Si.", status: "disetujui", catatan: "Data mahasiswa sudah sesuai", tgl_respon: "2026-03-08T10:00:00Z", created_at: "2026-03-05T08:00:00Z", updated_at: "2026-03-08T10:00:00Z" },
  { id_persetujuan: "prs-002", id_pengajuan: "peng-005", urutan: 2, role_penyetuju: "Admin BAK", id_penyetuju: "adm-bak-01", nm_penyetuju: "Dra. Hartini", status: "disetujui", catatan: "Persyaratan lengkap", tgl_respon: "2026-03-09T14:00:00Z", created_at: "2026-03-05T08:00:00Z", updated_at: "2026-03-09T14:00:00Z" },
  { id_persetujuan: "prs-003", id_pengajuan: "peng-005", urutan: 3, role_penyetuju: "Dekan", id_penyetuju: "dekan-01", nm_penyetuju: "Prof. Dr. Ir. Lusmeilia Afriani, D.E.A.", status: "disetujui", catatan: null, tgl_respon: "2026-03-10T09:00:00Z", created_at: "2026-03-05T08:00:00Z", updated_at: "2026-03-10T09:00:00Z" },
  { id_persetujuan: "prs-004", id_pengajuan: "peng-005", urutan: 4, role_penyetuju: "Wakil Rektor", id_penyetuju: null, nm_penyetuju: null, status: "menunggu", catatan: null, tgl_respon: null, created_at: "2026-03-05T08:00:00Z", updated_at: "2026-03-05T08:00:00Z" },
];

// ============ Dummy Batch ============

export const dummyBatch: BatchPenetapan[] = [
  { id_batch: "batch-001", jenis_sk: "HABIS_MASA_MUKIM", no_sk: "SK/HMM/2026/001", tgl_sk: "2026-02-28", periode_akademik: "2025/2026 Genap", status: "terbit", jumlah_kandidat: 45, catatan: "Batch HMM semester genap", file_sk_path: "/sk/hmm_2026_001.pdf", created_at: "2026-02-15T08:00:00Z", updated_at: "2026-02-28T14:00:00Z" },
  { id_batch: "batch-002", jenis_sk: "PUTUS_STUDI", no_sk: "SK/PS/2026/001", tgl_sk: "2026-02-28", periode_akademik: "2025/2026 Genap", status: "terbit", jumlah_kandidat: 23, catatan: null, file_sk_path: "/sk/ps_2026_001.pdf", created_at: "2026-02-15T08:00:00Z", updated_at: "2026-02-28T14:00:00Z" },
  { id_batch: "batch-003", jenis_sk: "HABIS_MASA_MUKIM", no_sk: null, tgl_sk: null, periode_akademik: "2025/2026 Genap", status: "verifikasi_fakultas", jumlah_kandidat: 38, catatan: "Menunggu verifikasi dari fakultas", file_sk_path: null, created_at: "2026-03-10T08:00:00Z", updated_at: "2026-03-15T10:00:00Z" },
  { id_batch: "batch-004", jenis_sk: "PUTUS_STUDI", no_sk: null, tgl_sk: null, periode_akademik: "2025/2026 Genap", status: "draft", jumlah_kandidat: 15, catatan: "Draft batch putus studi", file_sk_path: null, created_at: "2026-03-20T08:00:00Z", updated_at: "2026-03-20T08:00:00Z" },
];

export const dummyKandidat: KandidatBatch[] = Array.from({ length: 15 }, (_, i) => {
  const prodi = prodiList[i % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  const statuses: KandidatBatch["status_verifikasi"][] = ["belum_dicek", "valid", "tidak_valid", "dikecualikan"];
  const names = ["Rudi Hartono", "Sari Indah", "Teguh Prabowo", "Umi Kalsum", "Wahyu Hidayat",
    "Xena Putri", "Yanto Sugiarto", "Zahra Amelia", "Arif Rahman", "Bella Safira",
    "Cahyo Wibowo", "Diana Sari", "Eko Prasetyo", "Fina Maharani", "Galih Permana"];
  return {
    id_kandidat: `kand-${String(i + 1).padStart(3, "0")}`,
    id_batch: i < 8 ? "batch-003" : "batch-004",
    id_mahasiswa: `mhs-${String(i + 100)}`,
    npm: `18${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1000 + i)}`,
    nm_mahasiswa: names[i],
    id_prodi: prodi.id,
    nm_prodi: prodi.nama,
    id_fakultas: fak.id,
    nm_fakultas: fak.nama,
    semester_terakhir: 14 + (i % 3),
    ipk_terakhir: parseFloat((1.5 + Math.random() * 2).toFixed(2)),
    alasan: i < 8 ? "Melampaui batas 14 semester" : "Tidak registrasi 2 semester berturut-turut",
    status_verifikasi: statuses[i % statuses.length],
    catatan_verifikasi: i % 4 === 2 ? "Data mahasiswa tidak ditemukan di PDUT" : null,
    created_at: "2026-03-10T08:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
  };
});

// ============ Dashboard Stats ============

export const dummyDashboardStats: DashboardStats = {
  total_pengajuan: 156,
  pengajuan_baru: 24,
  pengajuan_proses: 18,
  pengajuan_selesai: 108,
  pengajuan_ditolak: 6,
  sla_compliance: 92.5,
};

export const dummyTrendData = [
  { bulan: "Okt 2025", surat_mandiri: 15, permohonan: 8, batch: 0 },
  { bulan: "Nov 2025", surat_mandiri: 22, permohonan: 12, batch: 1 },
  { bulan: "Des 2025", surat_mandiri: 10, permohonan: 5, batch: 0 },
  { bulan: "Jan 2026", surat_mandiri: 28, permohonan: 15, batch: 2 },
  { bulan: "Feb 2026", surat_mandiri: 35, permohonan: 18, batch: 1 },
  { bulan: "Mar 2026", surat_mandiri: 42, permohonan: 22, batch: 2 },
];

export const dummyRecentActivity = [
  { id: "1", aksi: "Pengajuan LOA disetujui", aktor: "Admin BAK", waktu: "5 menit lalu", tipe: "success" as const },
  { id: "2", aksi: "Pengajuan Cuti Akademik diajukan", aktor: "Andi Pratama", waktu: "15 menit lalu", tipe: "info" as const },
  { id: "3", aksi: "Dokumen perlu diperbaiki — Ganti KTM", aktor: "Admin BAK", waktu: "1 jam lalu", tipe: "warning" as const },
  { id: "4", aksi: "Batch HMM dikirim ke fakultas", aktor: "Admin BAK", waktu: "2 jam lalu", tipe: "info" as const },
  { id: "5", aksi: "Pengajuan Undur Diri ditolak", aktor: "Dekan FT", waktu: "3 jam lalu", tipe: "danger" as const },
  { id: "6", aksi: "SK Putus Studi diterbitkan", aktor: "Admin BAK", waktu: "5 jam lalu", tipe: "success" as const },
  { id: "7", aksi: "Pengajuan Alih Program diverifikasi", aktor: "Admin Fakultas", waktu: "6 jam lalu", tipe: "success" as const },
];

// ============ Monitoring Dummy ============

export const dummyMahasiswaAktif = Array.from({ length: 50 }, (_, i) => {
  const prodi = prodiList[i % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  const names = [
    "Adi Nugroho", "Bella Permata", "Chandra Wijaya", "Dina Mariana", "Eko Saputra",
    "Fitri Handayani", "Gilang Ramadhan", "Hana Pertiwi", "Irfan Maulana", "Jasmine Putri",
    "Kevin Anggara", "Laras Setiawati", "Muhamad Rizki", "Nisa Amalia", "Oscar Pratama",
    "Puspita Sari", "Qori Alamsyah", "Rosa Melinda", "Surya Darma", "Tania Agustina",
    "Umar Faruq", "Vina Oktaviani", "Wawan Kurniawan", "Xenia Rahayu", "Yusuf Habibi",
    "Zainal Abidin", "Ayu Lestari", "Bima Sakti", "Clara Devita", "Deni Hermawan",
    "Elsa Fitriani", "Farel Prayoga", "Gita Savitri", "Hadi Santoso", "Intan Permata",
    "Joko Widodo", "Kartika Sari", "Lukman Hakim", "Maya Angelica", "Naufal Azzam",
    "Olivia Putri", "Pandu Wijaya", "Queen Azizah", "Raka Pratama", "Siska Amelia",
    "Taufik Hidayat", "Ulfa Nurjannah", "Vicky Prasetyo", "Wulan Sari", "Xavier Rendi",
  ];
  return {
    id: `mhs-aktif-${i + 1}`,
    npm: `22${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1000 + i)}`,
    nama: names[i],
    prodi: prodi.nama,
    fakultas: fak.nama,
    semester: (i % 8) + 1,
    ipk: parseFloat((2.0 + Math.random() * 2.0).toFixed(2)),
    status: i % 10 === 0 ? "Cuti" : "Aktif",
  };
});

export const dummyLulusan = Array.from({ length: 30 }, (_, i) => {
  const prodi = prodiList[i % prodiList.length];
  const fak = fakultasList.find((f) => f.id === prodi.id_fak)!;
  return {
    id: `lulus-${i + 1}`,
    npm: `19${String(prodi.id_fak.replace("fak-", "")).padStart(2, "0")}${String(1000 + i)}`,
    nama: `Lulusan ${i + 1}`,
    prodi: prodi.nama,
    fakultas: fak.nama,
    tahun_lulus: 2025 + (i % 2),
    ipk: parseFloat((2.8 + Math.random() * 1.2).toFixed(2)),
    lama_studi: 8 + (i % 6),
  };
});
