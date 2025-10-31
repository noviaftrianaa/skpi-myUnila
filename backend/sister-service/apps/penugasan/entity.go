package penugasan

import "time"

// Penugasan represents the penugasan/penempatan entity in pdrd.reg_ptk table
type Penugasan struct {
	// Primary Key
	IDRegPTK string `json:"id_reg_ptk" db:"id_reg_ptk"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDSDM          string  `json:"id_sdm" db:"id_sdm"`                     // uniqueidentifier, FK to pdrd.sdm
	IDSP           string  `json:"id_sp" db:"id_sp"`                       // uniqueidentifier, FK to pdrd.satuan_pendidikan
	IDStatPegawai  int     `json:"id_stat_pegawai" db:"id_stat_pegawai"`   // smallint, FK to ref.status_kepegawaian
	IDIkatanKerja  string  `json:"id_ikatan_kerja" db:"id_ikatan_kerja"`   // char(1), FK to ref.ikatan_kerja_sdm
	IDSMS          string  `json:"id_sms" db:"id_sms"`                     // uniqueidentifier, FK to pdrd.sms
	IDJnsKeluar    *string `json:"id_jns_keluar" db:"id_jns_keluar"`       // char(1), FK to ref.jenis_keluar, nullable

	// Data Fields
	NoSrtTgs    *string    `json:"no_srt_tgs" db:"no_srt_tgs"`       // varchar(80), Nomor surat tugas
	TglSrtTgs   *time.Time `json:"tgl_srt_tgs" db:"tgl_srt_tgs"`     // date, Tanggal surat tugas
	TMTSrtTgs   *time.Time `json:"tmt_srt_tgs" db:"tmt_srt_tgs"`     // date, TMT penugasan
	TglPTKKeluar *time.Time `json:"tgl_ptk_keluar" db:"tgl_ptk_keluar"` // date, Tanggal keluar, nullable
	NIDN        *string    `json:"nidn" db:"nidn"`                   // char(10), Lookup from pdrd.sdm
	JnsReg      *string    `json:"jns_reg" db:"jns_reg"`             // varchar(10), nullable

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// KeaktifanPTK represents the keaktifan per tahun ajaran in pdrd.keaktifan_ptk table
type KeaktifanPTK struct {
	// Primary Key
	IDKeaktifanPTK string `json:"id_keaktifan_ptk" db:"id_keaktifan_ptk"` // uniqueidentifier, PRIMARY KEY

	// Foreign Key
	IDRegPTK string `json:"id_reg_ptk" db:"id_reg_ptk"` // uniqueidentifier, FK to pdrd.reg_ptk

	// Data Fields
	IDThnAjaran  string `json:"id_thn_ajaran" db:"id_thn_ajaran"`   // char(4) or varchar, Tahun ajaran
	ASPHomebase  int    `json:"a_sp_homebase" db:"a_sp_homebase"`   // bit or tinyint, 1=homebase, 0=not homebase

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1), default 0
}

// SisterPenugasanListItem represents the list item from Sister API GET /penugasan
type SisterPenugasanListItem struct {
	ID                      string  `json:"id"`                          // UUID, id_reg_ptk
	StatusKepegawaian       string  `json:"status_kepegawaian"`          // Display only
	IkatanKerja             string  `json:"ikatan_kerja"`                // Display only
	JenjangPendidikan       *string `json:"jenjang_pendidikan"`          // Display only, nullable
	UnitKerja               *string `json:"unit_kerja"`                  // Display only, nullable
	PerguruanTinggi         string  `json:"perguruan_tinggi"`            // Display only
	TanggalMulai            string  `json:"tanggal_mulai"`               // date string
	TanggalKeluar           *string `json:"tanggal_keluar"`              // date string, nullable
	ApakahPenugasanHomebase string  `json:"apakah_penugasan_homebase"`   // "Ya"/"Tidak"
}

// SisterPenugasanDetail represents the detail from Sister API GET /penugasan/{id}
type SisterPenugasanDetail struct {
	// Inherits from list item
	ID                      string  `json:"id"`                          // UUID
	StatusKepegawaian       string  `json:"status_kepegawaian"`          // Display only
	IkatanKerja             string  `json:"ikatan_kerja"`                // Display only
	JenjangPendidikan       *string `json:"jenjang_pendidikan"`          // Display only, nullable
	UnitKerja               *string `json:"unit_kerja"`                  // Display only, nullable
	PerguruanTinggi         string  `json:"perguruan_tinggi"`            // Display only
	TanggalMulai            string  `json:"tanggal_mulai"`               // date string
	TanggalKeluar           *string `json:"tanggal_keluar"`              // date string, nullable

	// Additional fields from detail
	IDSDM                string                     `json:"id_sdm"`                  // UUID
	IDStatusKepegawaian  int                        `json:"id_status_kepegawaian"`   // int
	IDIkatanKerja        string                     `json:"id_ikatan_kerja"`         // char
	IDUnitKerja          string                     `json:"id_unit_kerja"`           // UUID
	IDPerguruanTinggi    string                     `json:"id_perguruan_tinggi"`     // UUID
	SuratTugas           *string                    `json:"surat_tugas"`             // string, nullable
	TanggalSuratTugas    *string                    `json:"tanggal_surat_tugas"`     // date string, nullable
	IDJenisKeluar        *string                    `json:"id_jenis_keluar"`         // char, nullable
	JenisKeluar          *string                    `json:"jenis_keluar"`            // string, nullable
	IDUpdater            *string                    `json:"id_updater"`              // UUID, nullable
	Dokumen              []interface{}              `json:"dokumen"`                 // array, not stored
	Keaktifan            []SisterPenugasanKeaktifan `json:"keaktifan"`               // array of keaktifan
}

// SisterPenugasanKeaktifan represents keaktifan item from Sister API detail response
type SisterPenugasanKeaktifan struct {
	IDThnAjaran      string `json:"id_thn_ajaran"`       // char(4), e.g. "2025"
	ApakahPTHomebase string `json:"apakah_pt_homebase"`  // "1" or "0"
}

// PenugasanSyncResult represents the result of syncing one penugasan
type PenugasanSyncResult struct {
	IDRegPTK string `json:"id_reg_ptk"`
	IDSDM    string `json:"id_sdm"`
	Nama     string `json:"nama,omitempty"` // Nama dosen for display
	Success  bool   `json:"success"`
	Error    string `json:"error,omitempty"`
}

// BatchPenugasanSyncResult represents batch sync result for penugasan by id_sdm
type BatchPenugasanSyncResult struct {
	TotalProcessed int                   `json:"total_processed"`
	TotalSuccess   int                   `json:"total_success"`
	TotalFailed    int                   `json:"total_failed"`
	Duration       string                `json:"duration"`
	Results        []PenugasanSyncResult `json:"results"`
	SyncedBy       string                `json:"synced_by"`
}

// BatchPenugasanSyncAllResult represents batch sync result for all penugasan (scheduler)
type BatchPenugasanSyncAllResult struct {
	TotalDosen     int                   `json:"total_dosen"`
	TotalProcessed int                   `json:"total_processed"`
	TotalSuccess   int                   `json:"total_success"`
	TotalFailed    int                   `json:"total_failed"`
	Duration       string                `json:"duration"`
	Results        []PenugasanSyncResult `json:"results"`
	SyncedBy       string                `json:"synced_by"`
}

// DosenInfo contains basic dosen info for worker processing
type DosenInfo struct {
	IDSDM string
	Nama  string
	NIDN  *string
}

// PenugasanListResult represents paginated list of penugasan
type PenugasanListResult struct {
	Data       []*Penugasan `json:"data"`
	Total      int          `json:"total"`
	Page       int          `json:"page"`
	Limit      int          `json:"limit"`
	TotalPages int          `json:"total_pages"`
}

// PenugasanStats represents statistics for penugasan
type PenugasanStats struct {
	TotalPenugasan int        `json:"total_penugasan"`
	TotalActive    int        `json:"total_active"`
	LastSync       *time.Time `json:"last_sync"`
}
