package prestasi

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

// Prestasi - Entity for pdrd.prestasi table
type Prestasi struct {
	IDPrestasi      string    `json:"id_prestasi" db:"id_prestasi"`             // PK - uniqueidentifier
	IDJenisPrestasi int       `json:"id_jenis_prestasi" db:"id_jenis_prestasi"` // FK to ref.jenis_prestasi
	IDAktMhs        *string   `json:"id_akt_mhs" db:"id_akt_mhs"`               // FK to aktivitas_mhs (optional)
	NmPrestasi      string    `json:"nm_prestasi" db:"nm_prestasi"`             // varchar(160)
	ThnPrestasi     int       `json:"thn_prestasi" db:"thn_prestasi"`           // numeric(4)
	Penyelenggara   *string   `json:"penyelenggara" db:"penyelenggara"`         // varchar(100)
	Peringkat       *int      `json:"peringkat" db:"peringkat"`                 // numeric(1)
	IDSP            string    `json:"id_sp" db:"id_sp"`                         // FK to satuan_pendidikan (universitas)
	IDPD            string    `json:"id_pd" db:"id_pd"`                         // FK to peserta_didik (mahasiswa)
	IDTktPrestasi   int       `json:"id_tkt_prestasi" db:"id_tkt_prestasi"`     // FK to ref.tingkat_prestasi

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

// FeederPrestasiData - Response from GetListPrestasiMahasiswa
type FeederPrestasiData struct {
	IDPrestasi         string  `json:"id_prestasi"`
	IDMahasiswa        string  `json:"id_mahasiswa"` // This is id_pd (peserta_didik)
	NamaMahasiswa      *string `json:"nama_mahasiswa"`
	IDJenisPrestasi    FlexInt `json:"id_jenis_prestasi"`
	NamaJenisPrestasi  *string `json:"nama_jenis_prestasi"`
	IDTingkatPrestasi  FlexInt `json:"id_tingkat_prestasi"`
	NamaTingkatPrestasi *string `json:"nama_tingkat_prestasi"`
	NamaPrestasi       string  `json:"nama_prestasi"`
	TahunPrestasi      string  `json:"tahun_prestasi"`
	Penyelenggara      *string `json:"penyelenggara"`
	Peringkat          FlexInt `json:"peringkat"`
	IDAktivitas        *string `json:"id_aktivitas"` // This is id_akt_mhs
	StatusSync         *string `json:"status_sync"`
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// PrestasiListItem - Item for list view with additional info
type PrestasiListItem struct {
	IDPrestasi          string     `db:"id_prestasi" json:"id_prestasi"`
	IDPD                string     `db:"id_pd" json:"id_pd"`
	NIM                 *string    `db:"nim" json:"nim"`
	NamaMahasiswa       *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NamaProdi           *string    `db:"nama_prodi" json:"nama_prodi"`
	IDJenisPrestasi     int        `db:"id_jenis_prestasi" json:"id_jenis_prestasi"`
	NamaJenisPrestasi   *string    `db:"nama_jenis_prestasi" json:"nama_jenis_prestasi"`
	IDTktPrestasi       int        `db:"id_tkt_prestasi" json:"id_tkt_prestasi"`
	NamaTingkatPrestasi *string    `db:"nama_tingkat_prestasi" json:"nama_tingkat_prestasi"`
	NmPrestasi          string     `db:"nm_prestasi" json:"nm_prestasi"`
	ThnPrestasi         int        `db:"thn_prestasi" json:"thn_prestasi"`
	Penyelenggara       *string    `db:"penyelenggara" json:"penyelenggara"`
	Peringkat           *int       `db:"peringkat" json:"peringkat"`
	IDAktMhs            *string    `db:"id_akt_mhs" json:"id_akt_mhs"`
	LastSync            *time.Time `db:"last_sync" json:"last_sync"`
}

// PrestasiListResult - Paginated list result
type PrestasiListResult struct {
	Data       []*PrestasiListItem `json:"data"`
	Total      int                 `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"total_pages"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// PrestasiStats - Statistics for prestasi
type PrestasiStats struct {
	TotalPrestasi    int        `json:"total_prestasi" db:"total_prestasi"`
	TotalMahasiswa   int        `json:"total_mahasiswa" db:"total_mahasiswa"`
	TotalNasional    int        `json:"total_nasional" db:"total_nasional"`
	TotalInternasional int      `json:"total_internasional" db:"total_internasional"`
	LastSync         *time.Time `json:"last_sync" db:"last_sync"`
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
	TahunPrestasi *string `json:"tahun_prestasi,omitempty"` // Optional - format: "2025"
}

// =============================================================================
// HELPER DTOs
// =============================================================================

// TahunListItem - Item for tahun dropdown
type TahunListItem struct {
	TahunPrestasi int `db:"thn_prestasi" json:"tahun_prestasi"`
}
