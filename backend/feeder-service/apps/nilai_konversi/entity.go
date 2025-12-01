package nilai_konversi

import (
	"encoding/json"
	"time"
)

// ============================================================================
// Database Entities - mbkm.konversi_akt_mhs
// ============================================================================

// KonversiAktMhs represents the mbkm.konversi_akt_mhs table
type KonversiAktMhs struct {
	IDKonversiAktivitas string    `db:"id_konversi_aktivitas" json:"id_konversi_aktivitas"`
	IDMK                string    `db:"id_mk" json:"id_mk"`
	IDAngAktMhs         *string   `db:"id_ang_akt_mhs" json:"id_ang_akt_mhs"`
	IDSmt               *string   `db:"id_smt" json:"id_smt"`
	IDAktMhs            string    `db:"id_akt_mhs" json:"id_akt_mhs"`
	IDDaftarKampusMerdeka *string `db:"id_daftar_kampus_merdeka" json:"id_daftar_kampus_merdeka"`
	NilaiAngka          *float64  `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf          *string   `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks         *float64  `db:"nilai_indeks" json:"nilai_indeks"`
	SksMK               *float64  `db:"sks_mk" json:"sks_mk"`
	CreateDate          time.Time `db:"create_date" json:"create_date"`
	IDCreator           string    `db:"id_creator" json:"id_creator"`
	LastUpdate          time.Time `db:"last_update" json:"last_update"`
	IDUpdater           *string   `db:"id_updater" json:"id_updater"`
	SoftDelete          int       `db:"soft_delete" json:"soft_delete"`
	LastSync            time.Time `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Database Entities - mbkm.ekuiv_transfer
// ============================================================================

// EkuivTransfer represents the mbkm.ekuiv_transfer table
type EkuivTransfer struct {
	IDEkuivalensi      string    `db:"id_ekuivalensi" json:"id_ekuivalensi"`
	IDAktMhs           *string   `db:"id_akt_mhs" json:"id_akt_mhs"`
	IDMK               string    `db:"id_mk" json:"id_mk"`
	IDSmt              *string   `db:"id_smt" json:"id_smt"`
	IDRegPD            string    `db:"id_reg_pd" json:"id_reg_pd"`
	KodeMKAsal         string    `db:"kode_mk_asal" json:"kode_mk_asal"`
	NmMKAsal           string    `db:"nm_mk_asal" json:"nm_mk_asal"`
	SksAsal            float64   `db:"sks_asal" json:"sks_asal"`
	SksDiakui          int       `db:"sks_diakui" json:"sks_diakui"`
	NilaiHurufAsal     string    `db:"nilai_huruf_asal" json:"nilai_huruf_asal"`
	NilaiHurufDiakui   string    `db:"nilai_huruf_diakui" json:"nilai_huruf_diakui"`
	NilaiAngkaDiakui   float64   `db:"nilai_angka_diakui" json:"nilai_angka_diakui"`
	IDSP               *string   `db:"id_sp" json:"id_sp"`
	CreateDate         time.Time `db:"create_date" json:"create_date"`
	IDCreator          string    `db:"id_creator" json:"id_creator"`
	LastUpdate         time.Time `db:"last_update" json:"last_update"`
	IDUpdater          *string   `db:"id_updater" json:"id_updater"`
	SoftDelete         int       `db:"soft_delete" json:"soft_delete"`
	LastSync           time.Time `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// List Item - Combined view for both tables
// ============================================================================

// NilaiKonversiListItem represents a combined view of konversi and transfer nilai
type NilaiKonversiListItem struct {
	// Common identifier
	ID              string  `db:"id" json:"id"`
	JenisKonversi   string  `db:"jenis_konversi" json:"jenis_konversi"` // "konversi" or "transfer"

	// Student info
	IDRegPD         *string `db:"id_reg_pd" json:"id_reg_pd"`
	NIM             *string `db:"nim" json:"nim"`
	NamaMahasiswa   *string `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NamaProdi       *string `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang     *string `db:"nama_jenjang" json:"nama_jenjang"`

	// Matkul info
	IDMK            string  `db:"id_mk" json:"id_mk"`
	KodeMK          *string `db:"kode_mk" json:"kode_mk"`
	NamaMK          *string `db:"nama_mk" json:"nama_mk"`
	SksMK           *float64 `db:"sks_mk" json:"sks_mk"`

	// Nilai info
	NilaiAngka      *float64 `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf      *string  `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks     *float64 `db:"nilai_indeks" json:"nilai_indeks"`

	// Transfer specific (for jenis_konversi = "transfer")
	KodeMKAsal      *string  `db:"kode_mk_asal" json:"kode_mk_asal"`
	NamaMKAsal      *string  `db:"nama_mk_asal" json:"nama_mk_asal"`
	SksAsal         *float64 `db:"sks_asal" json:"sks_asal"`
	NilaiHurufAsal  *string  `db:"nilai_huruf_asal" json:"nilai_huruf_asal"`
	NamaPTAsal      *string  `db:"nama_pt_asal" json:"nama_pt_asal"`

	// Semester
	IDSemester      *string `db:"id_semester" json:"id_semester"`
	NamaSemester    *string `db:"nama_semester" json:"nama_semester"`

	// Aktivitas info (for konversi)
	IDAktMhs        *string `db:"id_akt_mhs" json:"id_akt_mhs"`
	NamaAktivitas   *string `db:"nama_aktivitas" json:"nama_aktivitas"`

	// Sync info
	LastSync        time.Time `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Statistics
// ============================================================================

// NilaiKonversiStats represents statistics for nilai konversi
type NilaiKonversiStats struct {
	TotalKonversi   int        `json:"total_konversi"`
	TotalTransfer   int        `json:"total_transfer"`
	TotalMahasiswa  int        `json:"total_mahasiswa"`
	TotalProdi      int        `json:"total_prodi"`
	LastSync        *time.Time `json:"last_sync"`
}

// ============================================================================
// Sync Filter
// ============================================================================

// SyncFilter represents filter options for sync
type SyncFilter struct {
	IDSemester []string `json:"id_semester"`
	IDProdi    *string  `json:"id_prodi"`
	ForceSync  bool     `json:"force_sync"`
}

// ============================================================================
// Sync Result
// ============================================================================

// SyncResult represents the result of a sync operation
type SyncResult struct {
	TotalKonversi  int    `json:"total_konversi"`
	TotalTransfer  int    `json:"total_transfer"`
	InsertedCount  int    `json:"inserted_count"`
	UpdatedCount   int    `json:"updated_count"`
	FailedCount    int    `json:"failed_count"`
	SkippedCount   int    `json:"skipped_count"`
	Message        string `json:"message"`
}

// ============================================================================
// Feeder API Response - Konversi Kampus Merdeka
// ============================================================================

// FlexFloat handles JSON numbers that may come as strings or numbers
type FlexFloat struct {
	Value *float64
}

func (f *FlexFloat) UnmarshalJSON(data []byte) error {
	// Handle null
	if string(data) == "null" {
		f.Value = nil
		return nil
	}

	// Try as number first
	var num float64
	if err := json.Unmarshal(data, &num); err == nil {
		f.Value = &num
		return nil
	}

	// Try as string
	var str string
	if err := json.Unmarshal(data, &str); err == nil {
		if str == "" || str == "null" {
			f.Value = nil
			return nil
		}
		// Parse string to float
		var parsed float64
		if n, err := json.Number(str).Float64(); err == nil {
			parsed = n
			f.Value = &parsed
			return nil
		}
	}

	f.Value = nil
	return nil
}

// FlexInt handles JSON integers that may come as strings or numbers
type FlexInt struct {
	Value *int
}

func (f *FlexInt) UnmarshalJSON(data []byte) error {
	// Handle null
	if string(data) == "null" {
		f.Value = nil
		return nil
	}

	// Try as int first
	var num int
	if err := json.Unmarshal(data, &num); err == nil {
		f.Value = &num
		return nil
	}

	// Try as string
	var str string
	if err := json.Unmarshal(data, &str); err == nil {
		if str == "" || str == "null" {
			f.Value = nil
			return nil
		}
		// Parse string to int
		var parsed int64
		if n, err := json.Number(str).Int64(); err == nil {
			parsed := int(n)
			f.Value = &parsed
			return nil
		}
		_ = parsed
	}

	f.Value = nil
	return nil
}

// FeederKonversiKampusMerdeka represents the response from GetListKonversiKampusMerdeka
type FeederKonversiKampusMerdeka struct {
	IDKonversiAktivitas string    `json:"id_konversi_aktivitas"`
	IDMatkul            string    `json:"id_matkul"`
	IDAnggota           string    `json:"id_anggota"`
	IDAktivitas         string    `json:"id_aktivitas"`
	NilaiAngka          FlexFloat `json:"nilai_angka"`
	NilaiHuruf          *string   `json:"nilai_huruf"`
	NilaiIndeks         FlexFloat `json:"nilai_indeks"`
	SksMataKuliah       FlexFloat `json:"sks_mata_kuliah"`
}

// FeederNilaiTransfer represents the response from GetNilaiTransferPendidikanMahasiswa
type FeederNilaiTransfer struct {
	IDTransfer            string    `json:"id_transfer"`
	IDAktivitas           *string   `json:"id_aktivitas"`
	IDMatkul              string    `json:"id_matkul"`
	IDSemester            *string   `json:"id_semester"`
	IDRegistrasiMahasiswa string    `json:"id_registrasi_mahasiswa"`
	KodeMataKuliahAsal    *string   `json:"kode_mata_kuliah_asal"`
	NamaMataKuliahAsal    *string   `json:"nama_mata_kuliah_asal"`
	SksMataKuliahAsal     FlexFloat `json:"sks_mata_kuliah_asal"`
	SksMataKuliahDiakui   FlexInt   `json:"sks_mata_kuliah_diakui"`
	NilaiHurufAsal        *string   `json:"nilai_huruf_asal"`
	NilaiHurufDiakui      *string   `json:"nilai_huruf_diakui"`
	NilaiAngkaDiakui      FlexFloat `json:"nilai_angka_diakui"`
	IDPerguruanTinggi     *string   `json:"id_perguruan_tinggi"`
}

// ============================================================================
// Paginated Response
// ============================================================================

// PaginatedResponse represents a paginated list response
type PaginatedResponse struct {
	Data  []*NilaiKonversiListItem `json:"data"`
	Total int                      `json:"total"`
	Page  int                      `json:"page"`
	Limit int                      `json:"limit"`
}
