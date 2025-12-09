package radius

import (
	"time"
)

// Pengguna - Entity for user data (man_akses.pengguna)
// Maps to SQL Server table
type Pengguna struct {
	// Primary Key
	IDPengguna string `json:"id_pengguna" db:"id_pengguna"`

	// Personal Information
	Username    string  `json:"username" db:"username"`
	NmPengguna  string  `json:"nm_pengguna" db:"nm_pengguna"`
	Email       *string `json:"email" db:"email"`
	JenisKelamin *string `json:"jenis_kelamin" db:"jenis_kelamin"`
	TempatLahir  *string `json:"tempat_lahir" db:"tempat_lahir"`
	TglLahir     *string `json:"tgl_lahir" db:"tgl_lahir"`
	Alamat       *string `json:"alamat" db:"alamat"`
	NoTel        *string `json:"no_tel" db:"no_tel"`
	NoHP         *string `json:"no_hp" db:"no_hp"`

	// Status
	AAktif   int  `json:"a_aktif" db:"a_aktif"`     // 1=active, 0=inactive
	Disable  int  `json:"disable" db:"disable"`     // 1=disabled, 0=enabled
	SoftDelete int `json:"soft_delete" db:"soft_delete"` // 1=deleted, 0=active

	// Audit Fields
	TglCreate  *time.Time `json:"tgl_create" db:"tgl_create"`
	LastUpdate *time.Time `json:"last_update" db:"last_update"`
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`
}

// PenggunaListItem - Pengguna for list view
type PenggunaListItem struct {
	IDPengguna     string     `db:"id_pengguna" json:"id_pengguna"`
	Username       string     `db:"username" json:"username"`
	NmPengguna     string     `db:"nm_pengguna" json:"nm_pengguna"`
	Email          *string    `db:"email" json:"email"`
	AAktif         int        `db:"a_aktif" json:"a_aktif"`
	Disable        int        `db:"disable" json:"disable"`
	HasSSO         int        `json:"has_sso"`
	SumberData     string     `json:"sumber_data"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// PenggunaListResult - Paginated list result
type PenggunaListResult struct {
	Data       []*PenggunaListItem `json:"data"`
	Total      int                 `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"total_pages"`
}

// PenggunaStats - Statistics for dashboard
type PenggunaStats struct {
	TotalPengguna int        `json:"total_pengguna"`
	TotalAktif    int        `json:"total_aktif"`
	TotalNonaktif int        `json:"total_nonaktif"`
	TotalSSO      int        `json:"total_sso"`
	TotalNonSSO   int        `json:"total_non_sso"`
	LastSync      *time.Time `json:"last_sync"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	UsernameFilter string `json:"username_filter,omitempty"`
	RoleFilter     string `json:"role_filter,omitempty"`
	ForceSync      bool   `json:"force_sync,omitempty"`
	SyncType       string `json:"sync_type,omitempty"` // 'manual', 'scheduled'
}

// SyncResult - Result for radius sync
type SyncResult struct {
	TotalProcessed int    `json:"total_processed"`
	TotalSuccess   int    `json:"total_success"`
	TotalFailed    int    `json:"total_failed"`
	TotalInserted  int    `json:"total_inserted"`
	TotalUpdated   int    `json:"total_updated"`
	TotalSkipped   int    `json:"total_skipped"`
	Duration       string `json:"duration"`
	SyncedBy       string `json:"synced_by"`
	Source         string `json:"source"` // "api" or "database"
}

// SSOUserData - Data from Radius SSO API
type SSOUserData struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Nama     string `json:"nama"`
	Email    string `json:"email"`
	AAktif   int    `json:"a_aktif"`
}

// RadiusStats - Statistics from Radius API
type RadiusStats struct {
	TotalActive int    `json:"total_active"`
	Source      string `json:"source"` // "api" or "database"
}
