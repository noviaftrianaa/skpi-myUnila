package aktivitas_mahasiswa

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

// FlexibleInt handles both string and int values from JSON
type FlexibleInt int

func (fi *FlexibleInt) UnmarshalJSON(b []byte) error {
	// Try to unmarshal as int first
	var i int
	if err := json.Unmarshal(b, &i); err == nil {
		*fi = FlexibleInt(i)
		return nil
	}

	// Try to unmarshal as string
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	// Convert string to int
	i, err := strconv.Atoi(s)
	if err != nil {
		return fmt.Errorf("cannot convert %q to int: %w", s, err)
	}

	*fi = FlexibleInt(i)
	return nil
}

// AktMhs - Main entity for aktivitas mahasiswa data (pdrd.akt_mhs)
type AktMhs struct {
	// Primary Key
	IDAktMhs string `json:"id_akt_mhs" db:"id_akt_mhs"`

	// Foreign Keys
	IDJnsAktMhs *int    `json:"id_jns_akt_mhs" db:"id_jns_akt_mhs"`
	IDSMS       *string `json:"id_sms" db:"id_sms"`
	IDSmt       *string `json:"id_smt" db:"id_smt"`

	// Activity Information
	JudulAktMhs    *string    `json:"judul_akt_mhs" db:"judul_akt_mhs"`
	LokasiKegiatan *string    `json:"lokasi_kegiatan" db:"lokasi_kegiatan"`
	SKTugas        *string    `json:"sk_tugas" db:"sk_tugas"`
	TglSKTugas     *time.Time `json:"tgl_sk_tugas" db:"tgl_sk_tugas"`
	KetAkt         *string    `json:"ket_akt" db:"ket_akt"`
	AKomunal       *int       `json:"a_komunal" db:"a_komunal"` // untuk kampus merdeka

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// AnggotaAktMhs - Entity for aktivitas members (pdrd.anggota_akt_mhs)
type AnggotaAktMhs struct {
	// Primary Key
	IDAngAktMhs string `json:"id_ang_akt_mhs" db:"id_ang_akt_mhs"`

	// Foreign Keys
	IDAktMhs string  `json:"id_akt_mhs" db:"id_akt_mhs"`
	IDRegPd  *string `json:"id_reg_pd" db:"id_reg_pd"`

	// Member Information
	NmPd        *string `json:"nm_pd" db:"nm_pd"`
	NIPD        *string `json:"nipd" db:"nipd"`
	JnsPeranMhs *int    `json:"jns_peran_mhs" db:"jns_peran_mhs"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// --- DTOs for Feeder API Responses ---

// FeederAktivitasData - Response from GetListAktivitasMahasiswa
type FeederAktivitasData struct {
	IDAktivitas          string        `json:"id_aktivitas"`
	IDJenisAktivitas     *FlexibleInt  `json:"id_jenis_aktivitas"`
	IDProdi              *string       `json:"id_prodi"`
	IDSemester           *string       `json:"id_semester"`
	Judul                *string       `json:"judul"`
	Lokasi               *string       `json:"lokasi"`
	SKTugas              *string       `json:"sk_tugas"`
	TanggalSKTugas       *string       `json:"tanggal_sk_tugas"`
	Keterangan           *string       `json:"keterangan"`
	UntukKampusMerdeka   *FlexibleInt  `json:"untuk_kampus_merdeka"`
}

// FeederAnggotaAktivitasData - Response from GetListAnggotaAktivitasMahasiswa
type FeederAnggotaAktivitasData struct {
	IDAnggota              string        `json:"id_anggota"`
	IDAktivitas            string        `json:"id_aktivitas"`
	IDRegistrasiMahasiswa  *string       `json:"id_registrasi_mahasiswa"`
	NamaMahasiswa          *string       `json:"nama_mahasiswa"`
	NIM                    *string       `json:"nim"`
	JenisPeran             *FlexibleInt  `json:"jenis_peran"`
}

// --- List & Pagination DTOs ---

// AktivitasListItem - Aktivitas with calculated fields for list view
type AktivitasListItem struct {
	IDAktMhs           string     `db:"id_akt_mhs" json:"id_akt_mhs"`
	JudulAktMhs        string     `db:"judul_akt_mhs" json:"judul_akt_mhs"` // NOT NULL in DB
	NamaJenisAktivitas *string    `db:"nama_jenis_aktivitas" json:"nama_jenis_aktivitas"`
	IDSemester         string     `db:"id_semester" json:"id_semester"`       // NOT NULL in DB (id_smt)
	NamaSemester       *string    `db:"nama_semester" json:"nama_semester"`   // From ref.semester
	LokasiKegiatan     *string    `db:"lokasi_kegiatan" json:"lokasi_kegiatan"`
	SKTugas            *string    `db:"sk_tugas" json:"sk_tugas"`
	TglSKTugas         *time.Time `db:"tgl_sk_tugas" json:"tgl_sk_tugas,omitempty"`
	AKomunal           int        `db:"a_komunal" json:"a_komunal"`           // NOT NULL in DB, has default 0
	JumlahAnggota      int        `db:"jumlah_anggota" json:"jumlah_anggota"` // COUNT from anggota_akt_mhs, COALESCE to 0
	LastSync           time.Time  `db:"last_sync" json:"last_sync"`           // NOT NULL in DB
	IDProdi            string     `db:"id_prodi" json:"id_prodi"`             // NOT NULL in DB
	NamaProdi          *string    `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang        *string    `db:"nama_jenjang" json:"nama_jenjang"`
}

// AktivitasListResult - Paginated list result
type AktivitasListResult struct {
	Data       []*AktivitasListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// --- Stats DTOs ---

// AktivitasStats - Statistics for aktivitas mahasiswa
type AktivitasStats struct {
	TotalAktivitas int        `json:"total_aktivitas" db:"total_aktivitas"`
	TotalAnggota   int        `json:"total_anggota" db:"total_anggota"`
	TotalProdi     int        `json:"total_prodi" db:"total_prodi"`
	LastSync       *time.Time `json:"last_sync" db:"last_sync"`
}

// --- Sync Result DTOs ---

// AktivitasSyncResult - Result for single aktivitas sync
type AktivitasSyncResult struct {
	IDAktivitas string `json:"id_aktivitas"`
	Judul       string `json:"judul"`
	JumlahAnggota int  `json:"jumlah_anggota"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
}

// BatchAktivitasSyncResult - Result for batch sync
type BatchAktivitasSyncResult struct {
	TotalProcessed int                      `json:"total_processed"`
	TotalSuccess   int                      `json:"total_success"`
	TotalFailed    int                      `json:"total_failed"`
	Duration       string                   `json:"duration"`
	Results        []AktivitasSyncResult    `json:"results,omitempty"`
	SyncedBy       string                   `json:"synced_by"`
	Filter         *SyncFilter              `json:"filter,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDSemester []string `json:"id_semester"` // Optional - format: ["20251", "20241"], support multiple semester. If empty, sync all semesters
	IDProdi    *string  `json:"id_prodi,omitempty"` // Optional
	ForceSync  bool     `json:"force_sync,omitempty"` // Optional
}

// --- Sync Log Entity ---

// LogSyncAktivitas - Sync log for aktivitas sync (logger.sync_logs)
type LogSyncAktivitas struct {
	ID             int64      `db:"id" json:"id"`
	EndpointName   string     `db:"endpoint_name" json:"endpoint_name"` // 'aktivitas_mahasiswa'
	EndpointKey    *string    `db:"endpoint_key" json:"endpoint_key"` // filter identifier
	SyncType       string     `db:"sync_type" json:"sync_type"` // 'manual', 'scheduled', 'auto'
	Status         *string    `db:"status" json:"status"` // 'success', 'failed', 'partial'
	TotalRecords   *int       `db:"total_records" json:"total_records"`
	InsertedCount  *int       `db:"inserted_count" json:"inserted_count"`
	UpdatedCount   *int       `db:"updated_count" json:"updated_count"`
	FailedCount    *int       `db:"failed_count" json:"failed_count"`
	SkippedCount   *int       `db:"skipped_count" json:"skipped_count"`
	DurationMs     *int       `db:"duration_ms" json:"duration_ms"`
	ErrorMessage   *string    `db:"error_message" json:"error_message"`
	ErrorDetails   *string    `db:"error_details" json:"error_details"`
	SyncedBy       *string    `db:"synced_by" json:"synced_by"`
	SyncedAt       time.Time  `db:"synced_at" json:"synced_at"`
}

// LogSyncAktivitasWithInfo - Sync log with additional info for list view
type LogSyncAktivitasWithInfo struct {
	LogSyncAktivitas
	DurationMs *int64 `json:"duration_ms,omitempty"` // Calculated field
	Status     string `json:"status"`                // success/failed/partial
}

// SyncLogListResult - Paginated sync log result
type SyncLogListResult struct {
	Data       []*LogSyncAktivitasWithInfo `json:"data"`
	Total      int                           `json:"total"`
	Page       int                           `json:"page"`
	Limit      int                           `json:"limit"`
	TotalPages int                           `json:"total_pages"`
}
