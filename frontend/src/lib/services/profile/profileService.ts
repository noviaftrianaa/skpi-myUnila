/**
 * Profile Service
 * Service untuk mengambil data profil lengkap dari Auth Service (ManAkses)
 */

import axios from "axios";
import { getToken } from "@/lib/api/client";

// Base URL for auth service (env doesn't include /api/v1, so we add it)
const AUTH_SERVICE_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:9800/auth-service";
const AUTH_SERVICE_URL = `${AUTH_SERVICE_BASE}/api/v1`;

// Profile API endpoint
const PROFILE_API_URL = `${AUTH_SERVICE_URL}/profile`;

// Types
export interface RoleInfo {
  id_role_pengguna: string;
  id_peran: number;
  nama_peran: string;
  id_unit: string | null;
  nama_unit: string | null;
  approval_peran: boolean;
}

export interface AlamatInfo {
  jalan: string | null;
  rt: number | null;
  rw: number | null;
  desa_kelurahan: string | null;
  kode_pos: string | null;
}

export interface KontakInfo {
  telepon_rumah: string | null;
  no_hp: string | null;
  email: string | null;
}

export interface DosenAlamatInfo extends AlamatInfo {
  dusun: string | null;
  wilayah: string | null;
}

export interface DosenKepegawaianInfo {
  jenis_sdm: string | null;
  status_aktif: string | null;
  tmt_pns: string | null;
  sk_cpns: string | null;
  tanggal_sk_cpns: string | null;
  sk_angkat: string | null;
  tmt_sk_angkat: string | null;
  lembaga_pengangkat: string | null;
  sumber_gaji: string | null;
  akta_ijin_ajar: boolean;
  keahlian_lab: string | null;
}

export interface PasanganInfo {
  nama: string | null;
  nip: string | null;
  pekerjaan: string | null;
}

export interface PajakInfo {
  npwp: string | null;
  nama_wp: string | null;
}

export interface DosenProfileData {
  id_sdm: string;
  nama: string;
  nik: string | null;
  nidn: string | null;
  nip: string | null;
  nuptk: string | null;
  niy_nigk: string | null;
  nsdmi: string | null;
  nira: string | null;
  jenis_kelamin: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  status_kawin: string | null;
  kewarganegaraan: string | null;
  alamat: DosenAlamatInfo;
  kontak: KontakInfo;
  kepegawaian: DosenKepegawaianInfo;
  pasangan: PasanganInfo;
  pajak: PajakInfo;
  homebases: DosenHomebase[];
}

export interface KeluargaOrangTuaInfo {
  nama: string | null;
  tanggal_lahir: string | null;
  nik: string | null;
  pekerjaan: string | null;
  penghasilan: string | null;
  pendidikan: string | null;
  kebutuhan_khusus: string | null;
}

export interface KeluargaWaliInfo {
  nama: string | null;
  tanggal_lahir: string | null;
  pekerjaan: string | null;
  penghasilan: string | null;
  pendidikan: string | null;
}

export interface KeluargaInfo {
  ayah: KeluargaOrangTuaInfo;
  ibu: KeluargaOrangTuaInfo;
  wali: KeluargaWaliInfo;
}

export interface BeasiswaInfo {
  terima_kps: boolean;
  no_kps: string | null;
  bidikmisi: boolean;
  pmpap: boolean;
}

export interface StatusSemester {
  id_smt: string;
  semester: string;
  status: string;
  sks_diambil: number | null;
  total_sks: number | null;
  ips: number | null;
  ipk: number | null;
}

export interface PtAsal {
  id_pt_asal: string | null;
  nama_pt_asal: string | null;
  id_prodi_asal: string | null;
  nama_prodi_asal: string | null;
}

export interface MahasiswaHomebase {
  id_reg_pd: string;
  nim: string;
  id_sms: string;
  program_studi: string | null;
  kode_prodi: string | null;
  jenjang: string | null;
  id_jenjang: number | null;
  tanggal_masuk: string | null;
  tanggal_keluar: string | null;
  id_jenis_keluar: number | null;
  keterangan_keluar: string | null;
  sks_diakui: number | null;
  ipk: number | null;
  pt_asal: PtAsal;
  is_active: boolean;
  status_semester: StatusSemester[];
}

export interface DosenHomebase {
  id_reg_ptk: string;
  id_sms: string;
  nama_unit: string | null;
  kode_prodi: string | null;
  jenjang: string | null;
  no_surat_tugas: string | null;
  tanggal_surat_tugas: string | null;
  tmt_surat_tugas: string | null;
  tanggal_keluar: string | null;
  nidn: string | null;
  status_pegawai: string | null;
  ikatan_kerja: string | null;
  keterangan_keluar: string | null;
  is_active: boolean;
}

export interface MahasiswaAlamatInfo extends AlamatInfo {
  dusun: string | null;
  wilayah: string | null;
}

export interface MahasiswaProfileData {
  id_pd: string;
  nama: string;
  nik: string | null;
  nisn: string | null;
  jenis_kelamin: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  kewarganegaraan: string | null;
  status_mahasiswa: string | null;
  jenis_tinggal: string | null;
  kebutuhan_khusus: string | null;
  beasiswa: BeasiswaInfo;
  alamat: MahasiswaAlamatInfo;
  kontak: KontakInfo;
  keluarga: KeluargaInfo;
  homebases: MahasiswaHomebase[];
}

export interface TendikKepegawaianInfo {
  tmt_cpns: string | null;
  tmt_pns: string | null;
  tmt_pensiun: string | null;
  golongan: string | null;
  pangkat: string | null;
  tmt_golongan: string | null;
  jabatan_fungsional: string | null;
  tmt_fungsional: string | null;
  jabatan_struktural: string | null;
  pendidikan: string | null;
}

export interface TendikUnitKerja {
  unit_1: string | null;
  unit_2: string | null;
  unit_3: string | null;
}

export interface TendikProfileData {
  id_pegawai: string;
  nama: string;
  nip: string | null;
  nidn: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  jenis_pegawai: string | null;
  jenis_tenaga: string | null;
  status: string | null;
  kepegawaian: TendikKepegawaianInfo;
  unit_kerja: TendikUnitKerja;
}

export interface ProfileResponse {
  id_pengguna: string;
  username: string;
  nama: string;
  email: string | null;
  no_hp: string | null;
  alamat: string | null;
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  jenis_kelamin: string | null;
  roles: RoleInfo[];
  active_role: RoleInfo | null;
  profile_type: "dosen" | "mahasiswa" | "tendik" | null;
  profile_data: DosenProfileData | MahasiswaProfileData | TendikProfileData | null;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Alias for cleaner type
type ProfileApiResponse = ApiResponse<ProfileResponse>;

/**
 * Profile Service for ManAkses
 * Manages complete user profile data from auth-service
 */
export const profileService = {
  /**
   * Get complete user profile with roles and detailed data (dosen/mahasiswa)
   * Protected endpoint - requires JWT authentication
   */
  async getProfile(): Promise<ProfileResponse> {
    const token = getToken("ACCESS");

    const response = await axios.get<ProfileApiResponse>(
      PROFILE_API_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Gagal mengambil data profil");
    }

    // API returns: { success: true, message: "...", data: { ...profile } }
    return response.data.data;
  },

  /**
   * Check if profile is dosen type
   */
  isDosenProfile(
    profileData: DosenProfileData | MahasiswaProfileData | null
  ): profileData is DosenProfileData {
    return profileData !== null && "id_sdm" in profileData;
  },

  /**
   * Check if profile is mahasiswa type
   */
  isMahasiswaProfile(
    profileData: DosenProfileData | MahasiswaProfileData | null
  ): profileData is MahasiswaProfileData {
    return profileData !== null && "id_pd" in profileData;
  },

  /**
   * Format alamat lengkap from alamat info
   */
  formatAlamat(alamat: AlamatInfo | null): string {
    if (!alamat) return "-";

    const parts = [];
    if (alamat.jalan) parts.push(alamat.jalan);
    if (alamat.rt && alamat.rw) parts.push(`RT ${alamat.rt}/RW ${alamat.rw}`);
    if (alamat.desa_kelurahan) parts.push(alamat.desa_kelurahan);
    if (alamat.kode_pos) parts.push(alamat.kode_pos);

    return parts.length > 0 ? parts.join(", ") : "-";
  },

  /**
   * Format tanggal lahir to Indonesian format
   */
  formatTanggalLahir(tempat: string | null, tanggal: string | null): string {
    if (!tempat && !tanggal) return "-";

    const parts = [];
    if (tempat) parts.push(tempat);
    if (tanggal) {
      const date = new Date(tanggal);
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      parts.push(date.toLocaleDateString("id-ID", options));
    }

    return parts.join(", ");
  },
};

export default profileService;
