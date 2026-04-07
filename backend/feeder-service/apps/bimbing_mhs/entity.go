package bimbing_mhs

import (
	"encoding/json"
	"strconv"
	"time"
)

// =============================================================================
// CUSTOM TYPES FOR JSON PARSING
// =============================================================================

// FlexInt is an int that can be unmarshalled from a JSON string or number
type FlexInt struct {
	Value *int
}

func (f *FlexInt) UnmarshalJSON(data []byte) error {
	// Try to unmarshal as int first
	var intVal int
	if err := json.Unmarshal(data, &intVal); err == nil {
		f.Value = &intVal
		return nil
	}

	// Try to unmarshal as string
	var strVal string
	if err := json.Unmarshal(data, &strVal); err == nil {
		if strVal == "" || strVal == "null" {
			f.Value = nil
			return nil
		}
		intVal, err := strconv.Atoi(strVal)
		if err != nil {
			return err
		}
		f.Value = &intVal
		return nil
	}

	// If null
	f.Value = nil
	return nil
}

// =============================================================================
// DATABASE ENTITIES
// =============================================================================

// BimbingMhs - Entity for pdrd.bimbing_mhs table
// Table structure based on pdut_sqlserver v10 database schema
type BimbingMhs struct {
	IDBimbMhs      string `json:"id_bimb_mhs" db:"id_bimb_mhs"`           // PK - uniqueidentifier (id_bimbing_mahasiswa from Feeder)
	IDKatGiat      int    `json:"id_katgiat" db:"id_katgiat"`             // FK to ref.kategori_kegiatan (id_kategori_kegiatan from Feeder)
	IDSDM          string `json:"id_sdm" db:"id_sdm"`                     // FK to sdm (id_dosen from Feeder)
	IDAktMhs       string `json:"id_akt_mhs" db:"id_akt_mhs"`             // FK to akt_mhs (id_aktivitas from Feeder)
	UrutanPromotor int    `json:"urutan_promotor" db:"urutan_promotor"`   // numeric(1) - pembimbing_ke from Feeder

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"`
	IDCreator  string     `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time  `json:"last_update" db:"last_update"`
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`
	SoftDelete int        `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time  `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// FEEDER API RESPONSE DTOs
// =============================================================================

// FeederDosenPembimbingData - Response from GetDosenPembimbing
// Based on the API response structure provided by user
type FeederDosenPembimbingData struct {
	IDKategoriKegiatan     FlexInt `json:"id_kategori_kegiatan"`       // e.g., 110600
	IDBimbingMahasiswa     string  `json:"id_bimbing_mahasiswa"`       // PK - UUID
	IDAktivitas            string  `json:"id_aktivitas"`               // FK to aktivitas - UUID
	IDRegistrasiMahasiswa  string  `json:"id_registrasi_mahasiswa"`    // FK to mahasiswa registration - UUID
	NamaMahasiswa          *string `json:"nama_mahasiswa"`
	NIM                    *string `json:"nim"`
	IDDosen                string  `json:"id_dosen"`                   // FK to dosen/SDM - UUID
	NIDN                   *string `json:"nidn"`
	NUPTK                  *string `json:"nuptk"`
	NamaDosen              *string `json:"nama_dosen"`
	PembimbingKe           string  `json:"pembimbing_ke"`              // "1", "2", etc. - urutan_promotor
	JenisAktivitas         *string `json:"jenis_aktivitas"`            // e.g., "Kompetisi", "Skripsi", etc.
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// BimbingMhsListItem - Item for list view with additional info
type BimbingMhsListItem struct {
	IDBimbMhs       string     `db:"id_bimb_mhs" json:"id_bimb_mhs"`
	IDSDM           string     `db:"id_sdm" json:"id_sdm"`
	IDAktMhs        string     `db:"id_akt_mhs" json:"id_akt_mhs"`
	UrutanPromotor  int        `db:"urutan_promotor" json:"urutan_promotor"`

	// Dosen info (from sdm table)
	NIDN            *string    `db:"nidn" json:"nidn"`
	NamaDosen       *string    `db:"nama_dosen" json:"nama_dosen"`

	// Aktivitas info (from akt_mhs table)
	JudulAktivitas  *string    `db:"judul_aktivitas" json:"judul_aktivitas"`
	JenisAktivitas  *string    `db:"jenis_aktivitas" json:"jenis_aktivitas"`

	// Mahasiswa info (from anggota_akt_mhs + peserta_didik)
	NamaMahasiswa   *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NIM             *string    `db:"nim" json:"nim"`

	// Prodi info
	NamaProdi       *string    `db:"nama_prodi" json:"nama_prodi"`

	LastSync        *time.Time `db:"last_sync" json:"last_sync"`
}

// BimbingMhsListResult - Paginated list result
type BimbingMhsListResult struct {
	Data       []*BimbingMhsListItem `json:"data"`
	Total      int                   `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// BimbingMhsStats - Statistics for bimbing_mhs
type BimbingMhsStats struct {
	TotalBimbingan     int        `json:"total_bimbingan" db:"total_bimbingan"`
	TotalDosen         int        `json:"total_dosen" db:"total_dosen"`
	TotalAktivitas     int        `json:"total_aktivitas" db:"total_aktivitas"`
	TotalMahasiswa     int        `json:"total_mahasiswa" db:"total_mahasiswa"`
	LastSync           *time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// SYNC RESULT DTOs
// =============================================================================

// SyncResult - Result for sync operation
type SyncResult struct {
	TotalFetched  int    `json:"total_fetched"`
	TotalSynced   int    `json:"total_synced"`
	TotalFailed   int    `json:"total_failed"`
	TotalSkipped  int    `json:"total_skipped"`
	Duration      string `json:"duration"`
	Message       string `json:"message"`
	SyncedBy      string `json:"synced_by"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDKategoriKegiatan *int    `json:"id_kategori_kegiatan,omitempty"` // Optional - filter by aktivitas type
	IDProdi            *string `json:"id_prodi,omitempty"`             // Optional - filter by prodi
}

// =============================================================================
// HELPER DTOs
// =============================================================================

// KategoriKegiatanItem - Item for kategori kegiatan dropdown
type KategoriKegiatanItem struct {
	IDKategoriKegiatan int    `db:"id_kategori_kegiatan" json:"id_kategori_kegiatan"`
	NamaKategori       string `db:"nama_kategori" json:"nama_kategori"`
}
