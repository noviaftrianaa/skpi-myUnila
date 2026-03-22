package mahasiswa

import (
	"time"
)

// MahasiswaListItem - Mahasiswa for list view
type MahasiswaListItem struct {
	NIM       string     `db:"nim" json:"nim"`
	Nama      string     `db:"nama" json:"nama"`
	Angkatan  *string    `db:"angkatan" json:"angkatan"`
	JK        *string    `db:"jk" json:"jk"`
	IdUnit    *string    `db:"id_unit" json:"id_unit"`
	Fakultas  *string    `db:"nm_fakultas" json:"nm_fakultas"`
	Jurusan   *string    `db:"nm_jurusan" json:"nm_jurusan"`
	Prodi     *string    `db:"nm_prodi" json:"nm_prodi"`
	Semester  *string    `db:"semester" json:"semester"`
	IPK       *float64   `db:"ipk" json:"ipk"`
	Status    *string    `db:"status" json:"status"`
	LastSync  *time.Time `db:"last_sync" json:"last_sync"`
}

// MahasiswaDetail - Full mahasiswa detail
type MahasiswaDetail struct {
	NIM           string     `db:"nim" json:"nim"`
	Nama          string     `db:"nama" json:"nama"`
	Angkatan      *string    `db:"angkatan" json:"angkatan"`
	JK            *string    `db:"jk" json:"jk"`
	TmpLahir      *string    `db:"tmp_lahir" json:"tmp_lahir"`
	TglLahir      *string    `db:"tgl_lahir" json:"tgl_lahir"`
	NIK           *string    `db:"nik" json:"nik"`
	Alamat        *string    `db:"alamat" json:"alamat"`
	Email         *string    `db:"email" json:"email"`
	EmailKampus   *string    `db:"email_kampus" json:"email_kampus"`
	HP            *string    `db:"hp" json:"hp"`
	IdUnit        *string    `db:"id_unit" json:"id_unit"`
	Fakultas      *string    `db:"nm_fakultas" json:"nm_fakultas"`
	Jurusan       *string    `db:"nm_jurusan" json:"nm_jurusan"`
	Prodi         *string    `db:"nm_prodi" json:"nm_prodi"`
	Semester      *string    `db:"semester" json:"semester"`
	IPK           *float64   `db:"ipk" json:"ipk"`
	SKSTotal      *int       `db:"sks_total" json:"sks_total"`
	SKSLulus      *int       `db:"sks_lulus" json:"sks_lulus"`
	Status        *string    `db:"status" json:"status"`
	IdPeriode     *string    `db:"id_periode" json:"id_periode"`
	LastSync      *time.Time `db:"last_sync" json:"last_sync"`
}

// PaginatedResult - Paginated list result
type PaginatedResult struct {
	Data       []*MahasiswaListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// SyncStats - Sync statistics
type SyncStats struct {
	TotalMahasiswa    int        `json:"total_mahasiswa"`
	TotalAktif        int        `json:"total_aktif"`
	TotalNonAktif     int        `json:"total_non_aktif"`
	LastSync          *time.Time `json:"last_sync"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	Page      int    `json:"page"`
	PageSize  int    `json:"page_size"`
	IdUnit    string `json:"id_unit"`
	ForceSync bool   `json:"force_sync,omitempty"`
	SyncType  string `json:"sync_type,omitempty"`
}

// SyncResult - Result for mahasiswa sync
type SyncResult struct {
	TotalFetched   int    `json:"total_fetched"`
	TotalInserted  int    `json:"total_inserted"`
	TotalUpdated   int    `json:"total_updated"`
	TotalSkipped   int    `json:"total_skipped"`
	TotalErrors    int    `json:"total_errors"`
	Duration       string `json:"duration"`
	SyncedBy       string `json:"synced_by"`
}

// SyncLogEntry - Entry for sync log
type SyncLogEntry struct {
	EndpointName  string
	EndpointKey   string
	SyncType      string
	Status        string
	APICode       string
	TotalRecords  int
	InsertedCount int
	UpdatedCount  int
	FailedCount   int
	SkippedCount  int
	DurationMs    int
	ErrorMessage  *string
	ErrorDetails  *string
	SyncedBy      string
}
