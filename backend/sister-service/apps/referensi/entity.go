package referensi

import "time"

// Agama represents religion reference data from ref.agama table
type Agama struct {
	IDAgama     int        `json:"id_agama" db:"id_agama"`
	NamaAgama   string     `json:"nama_agama" db:"nama_agama"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
}

// SisterAgama represents religion data from Sister API
type SisterAgama struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// SyncRequest represents base sync request (empty - user info from JWT)
type SyncRequest struct {
	// No fields needed - user info extracted from JWT context
}

// Negara represents country reference data from ref.negara table
type Negara struct {
	IDNegara    string     `json:"id_negara" db:"id_negara"`
	NamaNegara  string     `json:"nama_negara" db:"nama_negara"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy    *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterNegara represents country data from Sister API
type SisterNegara struct {
	ID   string `json:"id"`   // 2-letter country code
	Nama string `json:"nama"` // Country name
}

// JenjangPendidikan represents education level reference data
type JenjangPendidikan struct {
	IDJenjangPendidikan int        `json:"id_jenjang_pendidikan" db:"id_jenj_didik"`
	NamaJenjang         string     `json:"nama_jenjang" db:"nama_jenjang"`
	ExpiredDate         *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync            *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy            *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterJenjangPendidikan from Sister API
type SisterJenjangPendidikan struct {
	ID   string `json:"id"`    // Sister API returns string
	Nama string `json:"nama"`
}

// GelarAkademik represents academic title reference data
type GelarAkademik struct {
	IDGelarAkademik int        `json:"id_gelar_akademik" db:"id_gelar_akad"`
	NamaGelar       string     `json:"nama_gelar" db:"nama_gelar"`
	SingkatGelar    *string    `json:"singkat_gelar,omitempty" db:"singkat_gelar"`
	PosisiGelar     *int       `json:"posisi_gelar,omitempty" db:"posisi_gelar"` // 1=depan, 2=belakang, 3=tengah
	ExpiredDate     *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync        *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy        *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterGelarAkademik from Sister API
type SisterGelarAkademik struct {
	ID   int    `json:"id"`    // Sister API returns int
	Nama string `json:"nama"`
}

// Semester represents semester reference data
type Semester struct {
	IDSemester    string     `json:"id_semester" db:"id_smt"`
	NamaSemester  string     `json:"nama_semester" db:"nama_semester"`
	IDTahunAjaran *int       `json:"id_tahun_ajaran,omitempty" db:"id_thn_ajaran"`
	PeriodeAktif  int        `json:"periode_aktif" db:"tahun_ajaran"` // 1=active, 0=inactive
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterSemester from Sister API
type SisterSemester struct {
	ID   string `json:"id"`   // Format: "20251" = 2025 Semester 1
	Nama string `json:"nama"` // Format: "2025/2026 Ganjil"
}

// ==================== BATCH SYNC & METADATA ====================

// ReferensiMetadata represents metadata for a single referensi endpoint
type ReferensiMetadata struct {
	Key         string     `json:"key"`           // e.g., "agama", "negara"
	Name        string     `json:"name"`          // Display name: "Agama", "Negara"
	Description string     `json:"description"`   // Brief description
	TotalRecords int       `json:"total_records"` // Count in database
	LastSync    *time.Time `json:"last_sync"`     // Last sync timestamp
	SyncedBy    string     `json:"synced_by"`     // Last synced by user
	Available   bool       `json:"available"`     // Is endpoint available in Sister API
}

// BatchSyncRequest represents request to sync multiple endpoints
type BatchSyncRequest struct {
	Endpoints []string `json:"endpoints"` // Array of endpoint keys: ["agama", "negara", "semester"]
}

// BatchSyncResult represents result of a single endpoint sync
type BatchSyncResult struct {
	Endpoint     string `json:"endpoint"`      // Endpoint key
	Success      bool   `json:"success"`       // Sync success status
	TotalRecords int    `json:"total_records"` // Records synced
	Message      string `json:"message"`       // Result message
	Error        string `json:"error,omitempty"` // Error message if failed
}

// BatchSyncResponse represents response for batch sync operation
type BatchSyncResponse struct {
	TotalRequested int               `json:"total_requested"` // Total endpoints requested
	TotalSuccess   int               `json:"total_success"`   // Successfully synced
	TotalFailed    int               `json:"total_failed"`    // Failed syncs
	Results        []BatchSyncResult `json:"results"`         // Individual results
	Duration       string            `json:"duration"`        // Total duration
}
