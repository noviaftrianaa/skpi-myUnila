/**
 * Akademik-related TypeScript types
 *
 * All academic-related types (KRS, KHS, Nilai, Jadwal, etc.)
 */

export interface MataKuliah {
  kode_mk: string;
  nama_mk: string;
  sks: number;
  semester: number;
  jenis_mk: 'wajib' | 'pilihan';
  prasyarat?: string[];
}

export interface KRSMataKuliah extends MataKuliah {
  kelas: string;
  dosen: string;
  jadwal?: JadwalKuliah[];
  kuota: number;
  terisi: number;
}

export interface KRS {
  id: string;
  id_mahasiswa: string;
  semester: string;
  tahun_ajaran: string;
  mata_kuliah: KRSMataKuliah[];
  total_sks: number;
  max_sks: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  catatan?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Nilai {
  kode_mk: string;
  nama_mk: string;
  sks: number;
  nilai_huruf: 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'E';
  nilai_angka: number;
  bobot: number;
  mutu: number;
}

export interface KHS {
  id: string;
  id_mahasiswa: string;
  semester: string;
  tahun_ajaran: string;
  nilai: Nilai[];
  ips: number;
  ipk: number;
  total_sks_semester: number;
  total_sks_kumulatif: number;
  total_mutu_semester: number;
  total_mutu_kumulatif: number;
  created_at: string;
}

export interface JadwalKuliah {
  id: string;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  kelas: string;
  dosen: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  kapasitas: number;
  terisi: number;
}

export interface TugasAkhir {
  id: string;
  id_mahasiswa: string;
  judul: string;
  jenis: 'skripsi' | 'tesis' | 'disertasi';
  pembimbing_1: string;
  pembimbing_2?: string;
  penguji?: string[];
  status: 'proposal' | 'bimbingan' | 'sidang' | 'revisi' | 'selesai';
  tanggal_pengajuan: string;
  tanggal_sidang?: string;
  tanggal_selesai?: string;
  nilai?: string;
  file_proposal?: string;
  file_skripsi?: string;
}

export interface BimbinganTA {
  id: string;
  id_tugas_akhir: string;
  id_dosen: string;
  tanggal: string;
  topik: string;
  catatan: string;
  file_revisi?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Presensi {
  id: string;
  id_jadwal: string;
  kode_mk: string;
  nama_mk: string;
  pertemuan_ke: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  catatan?: string;
}

export interface PresensiSummary {
  kode_mk: string;
  nama_mk: string;
  total_pertemuan: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  persentase_kehadiran: number;
}
