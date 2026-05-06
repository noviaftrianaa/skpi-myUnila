package kkn

import "time"

type SyncStats struct {
	TotalTables    int            `json:"total_tables"`
	TotalRows      int            `json:"total_rows"`
	TableStats     []TableStat    `json:"table_stats"`
	LastSync       *time.Time     `json:"last_sync"`
	SQLServerStats []SQLTableStat `json:"sqlserver_stats"`
}

type TableStat struct {
	Table string `json:"table"`
	Count int    `json:"count"`
}

type SQLTableStat struct {
	Table string `json:"table"`
	Count int    `json:"count"`
}

type SyncResult struct {
	Table    string `json:"table"`
	Fetched  int    `json:"fetched"`
	Inserted int    `json:"inserted"`
	Updated  int    `json:"updated"`
	Skipped  int    `json:"skipped"`
	Failed   int    `json:"failed"`
	Duration int64  `json:"duration_ms"`
}

type SyncAllResult struct {
	Results  []*SyncResult `json:"results"`
	Duration int64         `json:"duration_ms"`
	SyncedBy string        `json:"synced_by"`
}

type SyncFilter struct {
	Tables   []string `json:"tables"`
	SyncType string   `json:"sync_type"`
}

type PeriodeKKN struct {
	LegacyID int    `json:"legacy_id"`
	Periode  string `json:"periode"`
	Tahun    int    `json:"tahun"`
}

type LokasiKKN struct {
	LegacyIDDesa      int    `json:"legacy_id_desa"`
	LegacyIDKecamatan int    `json:"legacy_id_kecamatan"`
	LegacyIDKabupaten int    `json:"legacy_id_kabupaten"`
	NamaDesa          string `json:"nama_desa"`
	NamaKecamatan     string `json:"nama_kecamatan"`
	NamaKabupaten     string `json:"nama_kabupaten"`
}

var SyncTableGroups = map[string][]string{
	"referensi": {
		"kkn_periode", "ref_jenis_kkn", "ref_golongan", "ref_nilai", "persentase_nilai",
	},
	"lokasi": {
		"lokasi_kabupaten", "lokasi_kecamatan", "lokasi_desa", "lokasi_terdaftar",
	},
	"pendaftaran": {
		"mahasiswa_pendaftar", "mahasiswa_biodata",
	},
	"penempatan": {
		"penempatan_mahasiswa", "biodata_dpl", "penempatan_dpl", "biodata_kdpl", "penempatan_kdpl",
	},
	"nilai": {
		"nilai_dpl", "nilai_kdpl",
	},
	"laporan": {
		"mahasiswa_laporan_p", "mahasiswa_laporan_rk",
	},
}

var SyncOrder = []string{
	"referensi", "lokasi", "pendaftaran", "penempatan", "nilai", "laporan",
}

// ============================================================================
// LIST / PAGINATION STRUCTS
// ============================================================================

// ListFilter - reusable filter for paginated list endpoints
type ListFilter struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Search    string `json:"search"`
	SortBy    string `json:"sort_by"`
	SortOrder string `json:"sort_order"`
}

// ListResponse - wrapper for paginated list response
type ListResponse struct {
	Items interface{} `json:"items"`
	Meta  ListMeta    `json:"meta"`
}

// ListMeta - pagination metadata
type ListMeta struct {
	Total      int `json:"total"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalPages int `json:"total_pages"`
}

// ============================================================================
// ROW DTOs FOR LIST ENDPOINTS
// ============================================================================

// PeriodeKKNRow - row DTO for periode_kkn list
type PeriodeKKNRow struct {
	IDPeriode             string  `json:"id_periode_kkn" db:"id_periode_kkn"`
	KodePeriode           string  `json:"kode_periode" db:"kode_periode"`
	NmPeriode             string  `json:"nm_periode" db:"nm_periode"`
	TahunAkademik         string  `json:"tahun_akademik" db:"tahun_akademik"`
	Gelombang             int     `json:"gelombang" db:"gelombang"`
	TglDaftarMulai        *string `json:"tgl_daftar_mulai" db:"tgl_daftar_mulai"`
	TglDaftarSelesai      *string `json:"tgl_daftar_selesai" db:"tgl_daftar_selesai"`
	TglPelaksanaanMulai   *string `json:"tgl_pelaksanaan_mulai" db:"tgl_pelaksanaan_mulai"`
	TglPelaksanaanSelesai *string `json:"tgl_pelaksanaan_selesai" db:"tgl_pelaksanaan_selesai"`
	DurasiHari            int     `json:"durasi_hari" db:"durasi_hari"`
	KuotaTotal            int     `json:"kuota_total" db:"kuota_total"`
	AAktif                int     `json:"a_aktif" db:"a_aktif"`
}

// LokasiKKNRow - row DTO for lokasi_kkn list
type LokasiKKNRow struct {
	IDLokasi    string `json:"id_lokasi" db:"id_lokasi"`
	KodeLokasi  string `json:"kode_lokasi" db:"kode_lokasi"`
	NmDesa      string `json:"nm_desa" db:"nm_desa"`
	NmKecamatan string `json:"nm_kecamatan" db:"nm_kecamatan"`
	NmKabupaten string `json:"nm_kabupaten" db:"nm_kabupaten"`
	NmProvinsi  string `json:"nm_provinsi" db:"nm_provinsi"`
	KodePos     string `json:"kode_pos" db:"kode_pos"`
	AAktif      int    `json:"a_aktif" db:"a_aktif"`
}

// RegistrasiKKNRow - row DTO for registrasi_kkn list
type RegistrasiKKNRow struct {
	IDRegistrasi    string  `json:"id_registrasi" db:"id_registrasi"`
	NomorRegistrasi string  `json:"nomor_registrasi" db:"nomor_registrasi"`
	NPM             string  `json:"npm" db:"npm"`
	NmMahasiswa     string  `json:"nm_mahasiswa" db:"nm_mahasiswa"`
	NmProdi         string  `json:"nm_prodi" db:"nm_prodi"`
	NmFakultas      string  `json:"nm_fakultas" db:"nm_fakultas"`
	Status          string  `json:"status" db:"status"`
	TglDiajukan     *string `json:"tgl_diajukan" db:"tgl_diajukan"`
}

// KelompokKKNRow - row DTO for kelompok_kkn list
type KelompokKKNRow struct {
	IDKelompok    string `json:"id_kelompok" db:"id_kelompok"`
	KodeKelompok  string `json:"kode_kelompok" db:"kode_kelompok"`
	NmKelompok    string `json:"nm_kelompok" db:"nm_kelompok"`
	NmPeriode     string `json:"nm_periode" db:"nm_periode"`
	NmDesa        string `json:"nm_desa" db:"nm_desa"`
	Kuota         int    `json:"kuota" db:"kuota"`
	JumlahAnggota int    `json:"jumlah_anggota" db:"jumlah_anggota"`
	Status        string `json:"status" db:"status"`
}

// DPLKelompokRow - row DTO for dpl_kelompok list
type DPLKelompokRow struct {
	IDDPL      string `json:"id_dpl" db:"id_dpl"`
	NmDosen    string `json:"nm_dosen" db:"nm_dosen"`
	NIDN       string `json:"nidn" db:"nidn"`
	NIP        string `json:"nip" db:"nip"`
	Peran      string `json:"peran" db:"peran"`
	NmKelompok string `json:"nm_kelompok" db:"nm_kelompok"`
	AAktif     int    `json:"a_aktif" db:"a_aktif"`
}

// NilaiMahasiswaRow - row DTO for nilai_mahasiswa list
type NilaiMahasiswaRow struct {
	IDNilai      string  `json:"id_nilai" db:"id_nilai"`
	NPM          string  `json:"npm" db:"npm"`
	NmMahasiswa  string  `json:"nm_mahasiswa" db:"nm_mahasiswa"`
	NmKelompok   string  `json:"nm_kelompok" db:"nm_kelompok"`
	Nilai        float64 `json:"nilai" db:"nilai"`
	Catatan      string  `json:"catatan" db:"catatan"`
	TglPenilaian *string `json:"tgl_penilaian" db:"tgl_penilaian"`
	LegacySource string  `json:"legacy_source" db:"legacy_source"`
}

// ProgramKerjaRow - row DTO for program_kerja list
type ProgramKerjaRow struct {
	IDProker   string  `json:"id_proker" db:"id_proker"`
	NmKelompok string  `json:"nm_kelompok" db:"nm_kelompok"`
	NmPeriode  string  `json:"nm_periode" db:"nm_periode"`
	Judul      string  `json:"judul" db:"judul"`
	Bidang     string  `json:"bidang" db:"bidang"`
	Status     string  `json:"status" db:"status"`
	TglMulai   *string `json:"tgl_mulai" db:"tgl_mulai"`
	TglSelesai *string `json:"tgl_selesai" db:"tgl_selesai"`
}
