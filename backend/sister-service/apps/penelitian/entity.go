package penelitian

import "time"

// Litabmas represents the penelitian/pengabdian entity in pdrd.litabmas table
type Litabmas struct {
	// Primary Key
	IDLitabmas string `json:"id_litabmas" db:"id_litabmas"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDLembIptek         *string `json:"id_lemb_iptek" db:"id_lemb_iptek"`                 // uniqueidentifier, FK to pdrd.lembaga_iptek (from id_afiliasi)
	IDSkim              *string `json:"id_skim" db:"id_skim"`                             // uniqueidentifier, FK to ref.skim_kegiatan, nullable
	IDThnUsulan         *int    `json:"id_thn_usulan" db:"id_thn_usulan"`                 // numeric(4,0), FK to ref.tahun_anggaran, nullable
	IDThnKegiatan       *int    `json:"id_thn_kegiatan" db:"id_thn_kegiatan"`             // numeric(4,0), FK to ref.tahun_anggaran, nullable
	IDThnLaks           *int    `json:"id_thn_laks" db:"id_thn_laks"`                     // numeric(4,0), FK to ref.tahun_anggaran, nullable
	IDLanjutanLitabmas  *string `json:"id_lanjutan_litabmas" db:"id_lanjutan_litabmas"`   // uniqueidentifier, FK to pdrd.litabmas (self), nullable
	IDKelBidang         *string `json:"id_kel_bidang" db:"id_kel_bidang"`                 // uniqueidentifier, FK to ref.kelompok_bidang, nullable
	IDTse               *int    `json:"id_tse" db:"id_tse"`                               // numeric(5,0), FK to ref.tse, nullable
	IDSMI               *string `json:"id_smi" db:"id_smi"`                               // uniqueidentifier, FK to pdrd.smi, nullable
	IDJnsLit            *int    `json:"id_jns_lit" db:"id_jns_lit"`                       // numeric(4,0), FK to ref.jenis_penelitian, nullable

	// Data Fields
	JudulLitabmas     string     `json:"judul_litabmas" db:"judul_litabmas"`         // varchar(500)
	LamaKegiatan      int        `json:"lama_kegiatan" db:"lama_kegiatan"`           // smallint
	ThnLaksKe         *int       `json:"thn_laks_ke" db:"thn_laks_ke"`               // smallint, nullable
	DanaDikti         float64    `json:"dana_dikti" db:"dana_dikti"`                 // numeric(16,2)
	DanaPT            float64    `json:"dana_pt" db:"dana_pt"`                       // numeric(16,2)
	DanaInstLain      float64    `json:"dana_institusi_lain" db:"dana_institusi_lain"` // numeric(16,2)
	InKind            *string    `json:"in_kind" db:"in_kind"`                       // text, nullable
	StatAktif         int        `json:"stat_aktif" db:"stat_aktif"`                 // numeric(1,0), default 1
	JnsLitabmas       string     `json:"jns_litabmas" db:"jns_litabmas"`             // char(1), L=Penelitian, M=Pengabdian
	SKTugas           *string    `json:"sk_tugas" db:"sk_tugas"`                     // varchar(80), nullable
	TglSKTugas        *time.Time `json:"tgl_sk_tugas" db:"tgl_sk_tugas"`             // date, nullable
	LokasiKegiatan    *string    `json:"lokasi_kegiatan" db:"lokasi_kegiatan"`       // varchar(80), nullable

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1,0), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// AnggotaSDMLitabmas represents dosen member in pdrd.sdm_anggota_litabmas table
type AnggotaSDMLitabmas struct {
	// Composite Primary Key
	IDLitabmas string `json:"id_litabmas" db:"id_litabmas"` // uniqueidentifier, PK, FK to pdrd.litabmas
	IDSDM      string `json:"id_sdm" db:"id_sdm"`           // uniqueidentifier, PK, FK to pdrd.sdm

	// Foreign Keys
	IDKatgiat int `json:"id_katgiat" db:"id_katgiat"` // int, FK to ref.kategori_kegiatan

	// Data Fields
	PeranLitabmas string `json:"peran_litabmas" db:"peran_litabmas"` // char(1), K=Ketua, A=Anggota
	StatAktif     int    `json:"stat_aktif" db:"stat_aktif"`         // numeric(1,0), default 0

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1,0), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// AnggotaPDLitabmas represents mahasiswa member in pdrd.pd_anggota_litabmas table
type AnggotaPDLitabmas struct {
	// Primary Key
	IDPDAngLitabmas string `json:"id_pd_ang_litabmas" db:"id_pd_ang_litabmas"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDLitabmas string  `json:"id_litabmas" db:"id_litabmas"` // uniqueidentifier, FK to pdrd.litabmas
	IDPD       *string `json:"id_pd" db:"id_pd"`             // uniqueidentifier, FK to pdrd.peserta_didik, nullable

	// Data Fields
	PeranLitabmas string  `json:"peran_litabmas" db:"peran_litabmas"` // char(1), K=Ketua, A=Anggota
	StatAktif     int     `json:"stat_aktif" db:"stat_aktif"`         // numeric(1,0), default 0
	NmPD          *string `json:"nm_pd" db:"nm_pd"`                   // varchar(120), nullable
	NIPD          *string `json:"nipd" db:"nipd"`                     // varchar(24), nullable

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1,0), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// SisterPenelitianListItem represents list item from Sister API GET /penelitian
type SisterPenelitianListItem struct {
	ID               string   `json:"id"`                // UUID, id_litabmas
	Judul            string   `json:"judul"`             // Judul penelitian
	LamaKegiatan     int      `json:"lama_kegiatan"`     // Durasi kegiatan
	TahunPelaksanaan int      `json:"tahun_pelaksanaan"` // Tahun pelaksanaan
	BidangKeilmuan   []string `json:"bidang_keilmuan"`   // Array of bidang keilmuan (not stored)
}

// SisterPenelitianDetail represents detail from Sister API GET /penelitian/{id}
type SisterPenelitianDetail struct {
	// Basic Info
	ID                 string  `json:"id"`                   // UUID, id_litabmas
	IDKategoriKegiatan int     `json:"id_kategori_kegiatan"` // ID kategori kegiatan
	Judul              string  `json:"judul"`                // Judul penelitian
	LamaKegiatan       int     `json:"lama_kegiatan"`        // Durasi kegiatan
	TahunPelaksanaanKe int     `json:"tahun_pelaksanaan_ke"` // Tahun ke berapa

	// Dana
	DanaDikti           float64 `json:"dana_dikti"`            // Dana dari DIKTI
	DanaPerguruanTinggi float64 `json:"dana_perguruan_tinggi"` // Dana dari PT
	DanaInstLain        float64 `json:"dana_institusi_lain"`   // Dana dari institusi lain
	InKind              *string `json:"in_kind"`               // In-kind contribution

	// SK & Lokasi
	SKPenugasan       *string `json:"sk_penugasan"`        // Nomor SK
	TanggalSKPenugasan *string `json:"tanggal_sk_penugasan"` // Tanggal SK
	Lokasi            *string `json:"lokasi"`              // Lokasi kegiatan

	// Skim
	IDJenisSkim *string `json:"id_jenis_skim"` // UUID, id_skim
	JenisSkim   *string `json:"jenis_skim"`    // Nama skim

	// Tahun
	TahunUsulan      int `json:"tahun_usulan"`      // Tahun usulan
	TahunKegiatan    int `json:"tahun_kegiatan"`    // Tahun kegiatan
	TahunPelaksanaan int `json:"tahun_pelaksanaan"` // Tahun pelaksanaan

	// Lanjutan
	IDLitabmasSebelumnya *string `json:"id_litabmas_sebelumnya"` // UUID, nullable
	LitabmasSebelumnya   *string `json:"litabmas_sebelumnya"`    // Nama litabmas sebelumnya

	// Afiliasi
	IDAfiliasi string `json:"id_afiliasi"` // UUID, id_lemb_iptek
	Afiliasi   string `json:"afiliasi"`    // Nama afiliasi

	// Kelompok Bidang
	IDKelompokBidang *string `json:"id_kelompok_bidang"` // UUID, nullable
	KelompokBidang   *string `json:"kelompok_bidang"`    // Nama kelompok bidang

	// Related Data
	Anggota       []SisterAnggotaLitabmas `json:"anggota"`        // Array of anggota
	Dokumen       []SisterDokumenLitabmas `json:"dokumen"`        // Array of dokumen
	MitraLitabmas []interface{}           `json:"mitra_litabmas"` // Array of mitra (not implemented yet)
}

// SisterAnggotaLitabmas represents anggota from Sister API response
type SisterAnggotaLitabmas struct {
	Jenis      string  `json:"jenis"`       // "Dosen" or "Mahasiswa"
	Nama       string  `json:"nama"`        // Nama anggota
	NIPD       *string `json:"nipd"`        // NIM/NIPD (for mahasiswa), nullable
	Peran      string  `json:"peran"`       // "Ketua" or "Anggota"
	IDSDM      *string `json:"id_sdm"`      // UUID (for dosen), nullable
	IDOrang    *string `json:"id_orang"`    // UUID, nullable
	IDPD       *string `json:"id_pd"`       // UUID (for mahasiswa), nullable
	StatAktif  bool    `json:"stat_aktif"`  // Status aktif
}

// Dokumen represents the dokumen entity in dok.dokumen table
type Dokumen struct {
	// Primary Key
	IDDok string `json:"id_dok" db:"id_dok"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDJnsDok *int `json:"id_jns_dok" db:"id_jns_dok"` // int, FK to ref.jenis_dokumen, nullable

	// Data Fields
	NmDok      *string    `json:"nm_dok" db:"nm_dok"`           // varchar(60), nullable
	KetDok     *string    `json:"ket_dok" db:"ket_dok"`         // varchar(200), nullable
	FileDok    []byte     `json:"-" db:"file_dok"`              // varbinary, SKIP (not stored from Sister API)
	WktUnggah  *time.Time `json:"wkt_unggah" db:"wkt_unggah"`   // datetime, nullable
	URL        *string    `json:"url" db:"url"`                 // varchar(256), nullable
	MediaType  *string    `json:"media_type" db:"media_type"`   // varchar(250), nullable
	FileName   *string    `json:"file_name" db:"file_name"`     // varchar(500), nullable

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1,0), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// DokLitabmas represents the relation table in dok.dok_litabmas
type DokLitabmas struct {
	// Composite Primary Key
	IDLitabmas string `json:"id_litabmas" db:"id_litabmas"` // uniqueidentifier, PK, FK to pdrd.litabmas
	IDDok      string `json:"id_dok" db:"id_dok"`           // uniqueidentifier, PK, FK to dok.dokumen

	// Audit Fields
	CreateDate time.Time  `json:"create_date" db:"create_date"` // datetime, NOT NULL
	IDCreator  string     `json:"id_creator" db:"id_creator"`   // uniqueidentifier, NOT NULL
	LastUpdate time.Time  `json:"last_update" db:"last_update"` // datetime, NOT NULL
	IDUpdater  *string    `json:"id_updater" db:"id_updater"`   // uniqueidentifier, nullable
	SoftDelete int        `json:"soft_delete" db:"soft_delete"` // numeric(1,0), default 0
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`     // datetime, nullable
}

// SisterDokumenLitabmas represents dokumen from Sister API response
type SisterDokumenLitabmas struct {
	ID             string  `json:"id"`              // UUID, id_dok
	Nama           string  `json:"nama"`            // Nama dokumen
	JenisDokumen   string  `json:"jenis_dokumen"`   // Jenis dokumen (display name)
	NamaFile       string  `json:"nama_file"`       // Nama file
	JenisFile      string  `json:"jenis_file"`      // MIME type
	TanggalUpload  string  `json:"tanggal_upload"`  // Tanggal upload
	Tautan         *string `json:"tautan"`          // URL tautan, nullable
	Keterangan     *string `json:"keterangan"`      // Keterangan, nullable
}

// PenelitianSyncResult represents the result of syncing one penelitian
type PenelitianSyncResult struct {
	IDLitabmas string `json:"id_litabmas"`
	IDSDM      string `json:"id_sdm"`
	Nama       string `json:"nama,omitempty"` // Nama dosen for display
	Judul      string `json:"judul"`          // Judul penelitian
	Success    bool   `json:"success"`
	Error      string `json:"error,omitempty"`
}

// BatchPenelitianSyncResult represents batch sync result for penelitian by id_sdm
type BatchPenelitianSyncResult struct {
	TotalProcessed int                    `json:"total_processed"`
	TotalSuccess   int                    `json:"total_success"`
	TotalFailed    int                    `json:"total_failed"`
	Duration       string                 `json:"duration"`
	Results        []PenelitianSyncResult `json:"results"`
	SyncedBy       string                 `json:"synced_by"`
}

// PenelitianListResult represents paginated list of penelitian
type PenelitianListResult struct {
	Data       []*Litabmas `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// PenelitianStats represents statistics for penelitian
type PenelitianStats struct {
	TotalPenelitian int        `json:"total_penelitian"`
	TotalActive     int        `json:"total_active"`
	TotalDana       float64    `json:"total_dana"`
	LastSync        *time.Time `json:"last_sync"`
}

// AnggotaLitabmasInfo represents member information for list view
type AnggotaLitabmasInfo struct {
	Nama       string `json:"nama" db:"nama"`
	JenisPeran string `json:"jenis_peran" db:"jenis_peran"` // "Dosen (Ketua)", "Mahasiswa (Anggota)", etc
}

// LitabmasListItem represents penelitian/pengabdian item for list view with anggota
type LitabmasListItem struct {
	IDLitabmas      string                 `json:"id_litabmas" db:"id_litabmas"`
	JudulLitabmas   string                 `json:"judul_litabmas" db:"judul_litabmas"`
	IDThnKegiatan   *int                   `json:"id_thn_kegiatan" db:"id_thn_kegiatan"`
	DanaDikti       float64                `json:"dana_dikti" db:"dana_dikti"`
	DanaPT          float64                `json:"dana_pt" db:"dana_pt"`
	DanaInstLain    float64                `json:"dana_institusi_lain" db:"dana_institusi_lain"`
	JnsLitabmas     string                 `json:"jns_litabmas" db:"jns_litabmas"`
	StatAktif       int                    `json:"stat_aktif" db:"stat_aktif"`
	LastSync        *time.Time             `json:"last_sync" db:"last_sync"`
	Anggota         []*AnggotaLitabmasInfo `json:"anggota"` // Populated separately
}

// LitabmasListResult represents paginated list result
type LitabmasListResult struct {
	Data       []*LitabmasListItem `json:"data"`
	Total      int                 `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"total_pages"`
}
