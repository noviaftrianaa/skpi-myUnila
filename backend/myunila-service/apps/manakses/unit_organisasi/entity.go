package unit_organisasi

import "time"

// UnitOrganisasi - Entity for man_akses.unit_organisasi
type UnitOrganisasi struct {
	IDOrganisasi      string     `json:"id_organisasi" db:"id_organisasi"`
	NmLemb            string     `json:"nm_lemb" db:"nm_lemb"`
	Jln               *string    `json:"jln" db:"jln"`
	Rt                *int       `json:"rt" db:"rt"`
	Rw                *int       `json:"rw" db:"rw"`
	NmDsn             *string    `json:"nm_dsn" db:"nm_dsn"`
	DsKel             string     `json:"ds_kel" db:"ds_kel"`
	KodePos           *string    `json:"kode_pos" db:"kode_pos"`
	Lintang           *float64   `json:"lintang" db:"lintang"`
	Bujur             *float64   `json:"bujur" db:"bujur"`
	NoTel             *string    `json:"no_tel" db:"no_tel"`
	NoFax             *string    `json:"no_fax" db:"no_fax"`
	Email             *string    `json:"email" db:"email"`
	Website           *string    `json:"website" db:"website"`
	KdKl              *string    `json:"kd_kl" db:"kd_kl"`
	KdSatker          *string    `json:"kd_satker" db:"kd_satker"`
	LevelOrganisasi   *int       `json:"level_organisasi" db:"level_organisasi"`
	IDLembagaAsal     string     `json:"id_lembaga_asal" db:"id_lembaga_asal"`
	AAktif            int        `json:"a_aktif" db:"a_aktif"`
	IDJnsLemb         int        `json:"id_jns_lemb" db:"id_jns_lemb"`
	IDIndukOrganisasi *string    `json:"id_induk_organisasi" db:"id_induk_organisasi"`
	IDWil             string     `json:"id_wil" db:"id_wil"`
	TglCreate         time.Time  `json:"tgl_create" db:"tgl_create"`
	LastUpdate        time.Time  `json:"last_update" db:"last_update"`
	SoftDelete        int        `json:"soft_delete" db:"soft_delete"`
	LastSync          time.Time  `json:"last_sync" db:"last_sync"`
	IDUpdater         string     `json:"id_updater" db:"id_updater"`
}

// SMS - Entity for pdrd.sms (source data)
type SMS struct {
	IDSMS             string     `json:"id_sms" db:"id_sms"`
	IDFakUnila        *string    `json:"id_fak_unila" db:"id_fak_unila"`
	IDLembNonSP       *string    `json:"id_lemb_non_sp" db:"id_lemb_non_sp"`
	IDJurUnila        *string    `json:"id_jur_unila" db:"id_jur_unila"`
	IDJur             *string    `json:"id_jur" db:"id_jur"`
	IDJenjDidik       int        `json:"id_jenj_didik" db:"id_jenj_didik"`
	NmLemb            string     `json:"nm_lemb" db:"nm_lemb"`
	KdKl              *string    `json:"kd_kl" db:"kd_kl"`
	KdSatker          *string    `json:"kd_satker" db:"kd_satker"`
	SmtMulai          *string    `json:"smt_mulai" db:"smt_mulai"`
	StatProdiUnila    *string    `json:"stat_prodi_unila" db:"stat_prodi_unila"`
	TglTutup          *time.Time `json:"tgl_tutup" db:"tgl_tutup"`
	KodeSNPMB         *string    `json:"kode_snpmb" db:"kode_snpmb"`
	KodeProdi         *string    `json:"kode_prodi" db:"kode_prodi"`
	NmProdiEnglish    *string    `json:"nm_prodi_english" db:"nm_prodi_english"`
	KpstPD            *int       `json:"kpst_pd" db:"kpst_pd"`
	SKSLulus          *int       `json:"sks_lulus" db:"sks_lulus"`
	GelarLulusan      *string    `json:"gelar_lulusan" db:"gelar_lulusan"`
	StatProdi         *string    `json:"stat_prodi" db:"stat_prodi"`
	PoleseiNilai      *string    `json:"polesei_nilai" db:"polesei_nilai"`
	AKependidikan     *int       `json:"a_kependidikan" db:"a_kependidikan"`
	Jln               *string    `json:"jln" db:"jln"`
	Rt                *int       `json:"rt" db:"rt"`
	Rw                *int       `json:"rw" db:"rw"`
	NmDsn             *string    `json:"nm_dsn" db:"nm_dsn"`
	DsKel             *string    `json:"ds_kel" db:"ds_kel"`
	KodePos           *string    `json:"kode_pos" db:"kode_pos"`
	Lintang           *float64   `json:"lintang" db:"lintang"`
	Bujur             *float64   `json:"bujur" db:"bujur"`
	NoTel             *string    `json:"no_tel" db:"no_tel"`
	NoFax             *string    `json:"no_fax" db:"no_fax"`
	Email             *string    `json:"email" db:"email"`
	Website           *string    `json:"website" db:"website"`
	Singkatan         *string    `json:"singkatan" db:"singkatan"`
	TglBerdiri        *time.Time `json:"tgl_berdiri" db:"tgl_berdiri"`
	SKSelenggara      *string    `json:"sk_selenggara" db:"sk_selenggara"`
	TglSKSelenggara   *time.Time `json:"tgl_sk_selenggara" db:"tgl_sk_selenggara"`
	TmtSKSelenggara   *time.Time `json:"tmt_sk_selenggara" db:"tmt_sk_selenggara"`
	TstSKSelenggara   *time.Time `json:"tst_sk_selenggara" db:"tst_sk_selenggara"`
	SistemAjar        *int       `json:"sistem_ajar" db:"sistem_ajar"`
	APJJ              *int       `json:"a_pjj" db:"a_pjj"`
	APSDKU            *int       `json:"a_psdku" db:"a_psdku"`
	IDSP              string     `json:"id_sp" db:"id_sp"`
	IDJnsSMS          int        `json:"id_jns_sms" db:"id_jns_sms"`
	IDFungsiLab       string     `json:"id_fungsi_lab" db:"id_fungsi_lab"`
	IDKelUsaha        string     `json:"id_kel_usaha" db:"id_kel_usaha"`
	IDWil             string     `json:"id_wil" db:"id_wil"`
	IDIndukSMS        *string    `json:"id_induk_sms" db:"id_induk_sms"`
	CreateDate        time.Time  `json:"create_date" db:"create_date"`
	IDCreator         string     `json:"id_creator" db:"id_creator"`
	LastUpdate        time.Time  `json:"last_update" db:"last_update"`
	IDUpdater         *string    `json:"id_updater" db:"id_updater"`
	SoftDelete        int        `json:"soft_delete" db:"soft_delete"`
	LastSync          time.Time  `json:"last_sync" db:"last_sync"`
}

// UnitOrganisasiListItem - Unit organisasi for list view
type UnitOrganisasiListItem struct {
	IDOrganisasi string     `json:"id_organisasi" db:"id_organisasi"`
	NmLemb       string     `json:"nm_lemb" db:"nm_lemb"`
	DsKel        string     `json:"ds_kel" db:"ds_kel"`
	KodePos      *string    `json:"kode_pos" db:"kode_pos"`
	NoTel        *string    `json:"no_tel" db:"no_tel"`
	Email        *string    `json:"email" db:"email"`
	AAktif       int        `json:"a_aktif" db:"a_aktif"`
	LastSync     *time.Time `json:"last_sync" db:"last_sync"`
}

// UnitOrganisasiListResult - Paginated list result
type UnitOrganisasiListResult struct {
	Data       []*UnitOrganisasiListItem `json:"data"`
	Total      int                       `json:"total"`
	Page       int                       `json:"page"`
	Limit      int                       `json:"limit"`
	TotalPages int                       `json:"total_pages"`
}

// SyncStats - Statistics for dashboard
type SyncStats struct {
	TotalUnitOrganisasi int        `json:"total_unit_organisasi"`
	TotalSMS            int        `json:"total_sms"`
	TotalSynced         int        `json:"total_synced"`
	TotalNotSynced      int        `json:"total_not_synced"`
	LastSync            *time.Time `json:"last_sync"`
}

// SyncResult - Result for sync operation
type SyncResult struct {
	TotalProcessed int      `json:"total_processed"`
	TotalInserted  int      `json:"total_inserted"`
	TotalUpdated   int      `json:"total_updated"`
	TotalFailed    int      `json:"total_failed"`
	Duration       string   `json:"duration"`
	SyncedBy       string   `json:"synced_by"`
	Errors         []string `json:"errors,omitempty"`
}

// ComparisonItem - Item for comparison view
type ComparisonItem struct {
	IDSMS            string  `json:"id_sms" db:"id_sms"`
	NmLembSMS        string  `json:"nm_lemb_sms" db:"nm_lemb_sms"`
	ExistsInManakses int     `json:"exists_in_manakses" db:"exists_in_manakses"`
	NmLembManakses   *string `json:"nm_lemb_manakses,omitempty" db:"nm_lemb_manakses"`
}
