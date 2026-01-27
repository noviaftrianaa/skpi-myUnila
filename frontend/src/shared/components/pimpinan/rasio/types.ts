// Types untuk Rasio Dosen-Mahasiswa

export interface FakultasRasio {
  id: string;
  nama_fakultas: string;
  total_dosen: number;
  total_mahasiswa: number;
  rasio: number;
  prodi_count: number;
}

export interface ProdiRasio {
  id: string;
  nama_prodi: string;
  jenjang: string;
  total_dosen: number;
  total_mahasiswa: number;
  rasio: number;
  fakultas_id: string;
}

export interface Dosen {
  id: string;
  nama_dosen: string;
  nidn: string;
  prodi: string;
  fakultas: string;
  jabatan_fungsional: string;
  pendidikan_terakhir: string;
  status: string;
}

export interface Mahasiswa {
  id: string;
  nama_mahasiswa: string;
  nim: string;
  prodi: string;
  fakultas: string;
  jenjang: string;
  angkatan: number;
  status: string;
}
