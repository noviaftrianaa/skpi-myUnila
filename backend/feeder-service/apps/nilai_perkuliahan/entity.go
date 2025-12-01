package nilai_perkuliahan

import (
	"encoding/json"
	"strconv"
	"time"
)

// =============================================================================
// CUSTOM TYPES FOR JSON PARSING
// =============================================================================

// FlexFloat is a float64 that can be unmarshalled from a JSON string or number
type FlexFloat struct {
	Value *float64
}

func (f *FlexFloat) UnmarshalJSON(data []byte) error {
	// Try to unmarshal as float64 first
	var floatVal float64
	if err := json.Unmarshal(data, &floatVal); err == nil {
		f.Value = &floatVal
		return nil
	}

	// Try to unmarshal as string
	var strVal string
	if err := json.Unmarshal(data, &strVal); err == nil {
		if strVal == "" || strVal == "null" {
			f.Value = nil
			return nil
		}
		floatVal, err := strconv.ParseFloat(strVal, 64)
		if err != nil {
			return err
		}
		f.Value = &floatVal
		return nil
	}

	// If null
	f.Value = nil
	return nil
}

// =============================================================================
// DATABASE ENTITIES
// =============================================================================

// NilaiSmtMhs - Entity for nilai semester mahasiswa (pdrd.nilai_smt_mhs)
// Composite Primary Key: id_reg_pd + id_kls
type NilaiSmtMhs struct {
	// Composite Primary Key
	IDRegPd string `json:"id_reg_pd" db:"id_reg_pd"` // FK to reg_pd (registrasi mahasiswa)
	IDKls   string `json:"id_kls" db:"id_kls"`       // FK to kelas_kuliah

	// Nilai Fields
	NilaiAngka  *float64 `json:"nilai_angka" db:"nilai_angka"`   // numeric(4,1)
	NilaiHuruf  *string  `json:"nilai_huruf" db:"nilai_huruf"`   // char(3)
	NilaiIndeks *float64 `json:"nilai_indeks" db:"nilai_indeks"` // numeric(4,2)

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// FEEDER API RESPONSE DTOs
// =============================================================================

// FeederNilaiPerkuliahanData - Response from GetDetailNilaiPerkuliahanKelas
type FeederNilaiPerkuliahanData struct {
	IDRegistrasiMahasiswa string    `json:"id_registrasi_mahasiswa"`
	NIM                   *string   `json:"nim"`
	NamaMahasiswa         *string   `json:"nama_mahasiswa"`
	IDKelasKuliah         string    `json:"id_kelas_kuliah"`
	NamaKelasKuliah       *string   `json:"nama_kelas_kuliah"`
	NilaiAngka            FlexFloat `json:"nilai_angka"`
	NilaiHuruf            *string   `json:"nilai_huruf"`
	NilaiIndeks           FlexFloat `json:"nilai_indeks"`
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// NilaiPerkuliahanListItem - Item for list view with additional info
type NilaiPerkuliahanListItem struct {
	IDRegPd       string     `db:"id_reg_pd" json:"id_reg_pd"`
	IDKls         string     `db:"id_kls" json:"id_kls"`
	NIM           *string    `db:"nim" json:"nim"`
	NamaMahasiswa *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NmKls         *string    `db:"nm_kls" json:"nm_kls"`
	KodeMatkul    *string    `db:"kode_matkul" json:"kode_matkul"`
	NamaMatkul    *string    `db:"nama_matkul" json:"nama_matkul"`
	SksMk         *float64   `db:"sks_mk" json:"sks_mk"`
	IDSemester    *string    `db:"id_semester" json:"id_semester"`
	NamaSemester  *string    `db:"nama_semester" json:"nama_semester"`
	NamaProdi     *string    `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang   *string    `db:"nama_jenjang" json:"nama_jenjang"`
	NilaiAngka    *float64   `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf    *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks   *float64   `db:"nilai_indeks" json:"nilai_indeks"`
	LastSync      time.Time  `db:"last_sync" json:"last_sync"`
}

// NilaiPerkuliahanListResult - Paginated list result
type NilaiPerkuliahanListResult struct {
	Data       []*NilaiPerkuliahanListItem `json:"data"`
	Total      int                         `json:"total"`
	Page       int                         `json:"page"`
	Limit      int                         `json:"limit"`
	TotalPages int                         `json:"total_pages"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// NilaiPerkuliahanStats - Statistics for nilai perkuliahan
type NilaiPerkuliahanStats struct {
	TotalNilai      int        `json:"total_nilai" db:"total_nilai"`
	TotalMahasiswa  int        `json:"total_mahasiswa" db:"total_mahasiswa"`
	TotalKelas      int        `json:"total_kelas" db:"total_kelas"`
	TotalProdi      int        `json:"total_prodi" db:"total_prodi"`
	LastSync        *time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// SYNC RESULT DTOs
// =============================================================================

// NilaiSyncResult - Result for single kelas nilai sync
type NilaiSyncResult struct {
	IDKls         string `json:"id_kls"`
	NmKls         string `json:"nm_kls"`
	JumlahNilai   int    `json:"jumlah_nilai"`
	Success       bool   `json:"success"`
	Error         string `json:"error,omitempty"`
}

// BatchNilaiSyncResult - Result for batch sync
type BatchNilaiSyncResult struct {
	TotalKelas     int               `json:"total_kelas"`
	TotalNilai     int               `json:"total_nilai"`
	TotalSuccess   int               `json:"total_success"`
	TotalFailed    int               `json:"total_failed"`
	Duration       string            `json:"duration"`
	Results        []NilaiSyncResult `json:"results,omitempty"`
	SyncedBy       string            `json:"synced_by"`
	Filter         *SyncFilter       `json:"filter,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDSemester []string `json:"id_semester"`          // Optional - format: ["20251", "20241"], support multiple semester
	IDProdi    *string  `json:"id_prodi,omitempty"`   // Optional
	IDKelas    *string  `json:"id_kelas,omitempty"`   // Optional - sync specific kelas
	ForceSync  bool     `json:"force_sync,omitempty"` // Optional
}
