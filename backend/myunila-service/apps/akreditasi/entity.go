package akreditasi

import (
	"time"
)

// ============================================================================
// BAN-PT API record (raw fetch shape — array of arrays di JSON)
// ============================================================================

// BanptRecord — 1 baris hasil fetch banpt.or.id, sudah di-decode dari array.
// Mapping kolom: [PT, Prodi, Jenjang, Wilayah, NoSK, TahunSK, Akreditasi, Kadaluarsa, Status]
type BanptRecord struct {
	PerguruanTinggi string `json:"perguruan_tinggi"`
	NamaProdi       string `json:"nama_prodi"`
	Jenjang         string `json:"jenjang"` // S1, S2, S3, D-III, D-IV, dll
	Wilayah         string `json:"wilayah"`
	NoSK            string `json:"no_sk"`
	TahunSK         string `json:"tahun_sk"`
	Akreditasi      string `json:"akreditasi"` // Unggul | Baik Sekali | Baik | A | B | C | Tidak Terakreditasi
	TanggalExpired  string `json:"tanggal_expired"`
	Status          string `json:"status"`
}

// ============================================================================
// Pdrd entities (read source-of-truth)
// ============================================================================

// ProdiPdrd — minimal cols dari pdrd.sms + ref untuk matching.
type ProdiPdrd struct {
	IDSms       string  `db:"id_sms" json:"id_sms"`
	NmLemb      string  `db:"nm_lemb" json:"nm_lemb"`
	IDJenjDidik *int    `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik *string `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	KodeProdi   *string `db:"kode_prodi" json:"kode_prodi"`
}

// AkreditasiCurrent — current row di pdrd.akreditasi_prodi (a_aktif=1).
type AkreditasiCurrent struct {
	IDAkreditasiProdi  string     `db:"id_akreditasi_prodi" json:"id_akreditasi_prodi"`
	IDSms              string     `db:"id_sms" json:"id_sms"`
	IDLembAkred        *string    `db:"id_lemb_akred" json:"id_lemb_akred"`
	IDAkred            *int       `db:"id_akred" json:"id_akred"`
	NmAkred            *string    `db:"nm_akred" json:"nm_akred"`
	SkAkreditasiProdi  *string    `db:"sk_akreditasi_prodi" json:"sk_akreditasi_prodi"`
	TanggalSkAkred     *time.Time `db:"tanggal_sk_akreditasi_prodi" json:"tanggal_sk_akreditasi_prodi"`
	TstSkAkred         *time.Time `db:"tst_sk_akreditasi_prodi" json:"tst_sk_akreditasi_prodi"`
	AsalData           *string    `db:"asal_data" json:"asal_data"`
}

// ============================================================================
// Akreditasi listing (untuk halaman frontend)
// ============================================================================

// AkreditasiRow — flat row gabungan pdrd.sms + akreditasi_prodi + ref.
type AkreditasiRow struct {
	IDSms             string     `db:"id_sms" json:"id_sms"`
	NmProdi           string     `db:"nm_prodi" json:"nm_prodi"`
	NmJenjDidik       *string    `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	KodeProdi         *string    `db:"kode_prodi" json:"kode_prodi"`
	NmFakultas        *string    `db:"nm_fakultas" json:"nm_fakultas"`
	IDLembAkred       *string    `db:"id_lemb_akred" json:"id_lemb_akred"`
	NmLembAkred       *string    `db:"nm_lemb_akred" json:"nm_lemb_akred"`
	IDAkred           *int       `db:"id_akred" json:"id_akred"`
	NmAkred           *string    `db:"nm_akred" json:"nm_akred"`
	SkAkreditasi      *string    `db:"sk_akreditasi_prodi" json:"sk_akreditasi"`
	TanggalSk         *time.Time `db:"tanggal_sk_akreditasi_prodi" json:"tanggal_sk"`
	TstSk             *time.Time `db:"tst_sk_akreditasi_prodi" json:"tst_sk"`
	AsalData          *string    `db:"asal_data" json:"asal_data"`
	LastUpdate        *time.Time `db:"last_update" json:"last_update"`
}

type AkreditasiListParams struct {
	Search      string
	IDLembAkred string
	IDAkred     string // pakai string supaya bisa kosong
	Page        int
	Limit       int
	SortBy      string
	Order       string // ASC|DESC
}

// ============================================================================
// Sync log
// ============================================================================

type SyncLogRow struct {
	IDLog            string     `db:"id_log" json:"id_log"`
	Sumber           string     `db:"sumber" json:"sumber"`
	Mode             string     `db:"mode" json:"mode"`
	TriggeredBy      *string    `db:"triggered_by" json:"triggered_by"`
	TriggeredUser    *string    `db:"triggered_username" json:"triggered_username"`
	Status           string     `db:"status" json:"status"`
	StartedAt        time.Time  `db:"started_at" json:"started_at"`
	FinishedAt       *time.Time `db:"finished_at" json:"finished_at"`
	DurationMs       *int       `db:"duration_ms" json:"duration_ms"`
	TotalFetched     *int       `db:"total_fetched" json:"total_fetched"`
	TotalMatched     *int       `db:"total_matched" json:"total_matched"`
	TotalUnmatched   *int       `db:"total_unmatched" json:"total_unmatched"`
	TotalInserted    *int       `db:"total_inserted" json:"total_inserted"`
	TotalUpdated     *int       `db:"total_updated" json:"total_updated"`
	TotalUnchanged   *int       `db:"total_unchanged" json:"total_unchanged"`
	ErrorMessage     *string    `db:"error_message" json:"error_message"`
}

type SyncLogDetail struct {
	IDDetail        string     `db:"id_detail" json:"id_detail"`
	IDLog           string     `db:"id_log" json:"id_log"`
	IDSms           *string    `db:"id_sms" json:"id_sms"`
	NmProdiExternal *string    `db:"nm_prodi_external" json:"nm_prodi_external"`
	JenjangExternal *string    `db:"jenjang_external" json:"jenjang_external"`
	NmProdiPdrd     *string    `db:"nm_prodi_pdrd" json:"nm_prodi_pdrd"`
	JenjangPdrd     *string    `db:"jenjang_pdrd" json:"jenjang_pdrd"`
	Action          string     `db:"action" json:"action"` // insert | update | unchanged | unmatched | skipped | error
	OldIDAkred      *int       `db:"old_id_akred" json:"old_id_akred"`
	NewIDAkred      *int       `db:"new_id_akred" json:"new_id_akred"`
	OldNmAkred      *string    `db:"old_nm_akred" json:"old_nm_akred"`
	NewNmAkred      *string    `db:"new_nm_akred" json:"new_nm_akred"`
	OldSk           *string    `db:"old_sk" json:"old_sk"`
	NewSk           *string    `db:"new_sk" json:"new_sk"`
	OldTglSk        *time.Time `db:"old_tgl_sk" json:"old_tgl_sk"`
	NewTglSk        *time.Time `db:"new_tgl_sk" json:"new_tgl_sk"`
	OldTstSk        *time.Time `db:"old_tst_sk" json:"old_tst_sk"`
	NewTstSk        *time.Time `db:"new_tst_sk" json:"new_tst_sk"`
	IDLembAkred     *string    `db:"id_lemb_akred" json:"id_lemb_akred"`
	Notes           *string    `db:"notes" json:"notes"`
}

// ============================================================================
// Sync request/result (in-memory shape untuk handler)
// ============================================================================

// SyncResult — ringkasan hasil sync (preview atau apply).
type SyncResult struct {
	IDLog          string                   `json:"id_log"`
	Sumber         string                   `json:"sumber"`
	Mode           string                   `json:"mode"`
	Status         string                   `json:"status"`
	StartedAt      time.Time                `json:"started_at"`
	FinishedAt     time.Time                `json:"finished_at"`
	DurationMs     int                      `json:"duration_ms"`
	TotalFetched   int                      `json:"total_fetched"`
	TotalMatched   int                      `json:"total_matched"`
	TotalUnmatched int                      `json:"total_unmatched"`
	TotalInserted  int                      `json:"total_inserted"`
	TotalUpdated   int                      `json:"total_updated"`
	TotalUnchanged int                      `json:"total_unchanged"`
	Changes        []SyncLogDetail          `json:"changes"` // detail rows for UI table
	Error          string                   `json:"error,omitempty"`
}

// SyncRequest — body POST /akreditasi/sync atau /preview.
type SyncRequest struct {
	Mode string `json:"mode"` // "preview" (default) | "apply"
}

// ============================================================================
// Mapping Unit (siakadu.mapping_unit) — bridge antara kode_unit di SIAKADU
// dengan id_sms di PDDIKTI / pdrd.sms. Penting untuk akurasi sync akreditasi.
// ============================================================================

type MappingUnitRow struct {
	KodeSiakad     string     `db:"kode_siakad" json:"kode_siakad"`
	IDSms          *string    `db:"id_sms" json:"id_sms"`
	NmUnit         *string    `db:"nm_unit" json:"nm_unit"`           // nama dari mapping_unit (snapshot)
	Jenjang        *string    `db:"jenjang" json:"jenjang"`
	CreateDate     *time.Time `db:"create_date" json:"create_date"`
	LastUpdate     *time.Time `db:"last_update" json:"last_update"`

	// Enrichment dari ref_unit & pdrd.sms (read-only join):
	RefUnitName    *string `db:"ref_unit_name" json:"ref_unit_name"`
	RefUnitJns     *string `db:"ref_unit_jns" json:"ref_unit_jns"`     // P/J/F
	RefUnitJenjang *string `db:"ref_unit_jenjang" json:"ref_unit_jenjang"`
	PdrdNmLemb     *string `db:"pdrd_nm_lemb" json:"pdrd_nm_lemb"`     // nama prodi di pdrd.sms
	PdrdJenjang    *string `db:"pdrd_jenjang" json:"pdrd_jenjang"`     // nm_jenj_didik
	PdrdKodeProdi  *string `db:"pdrd_kode_prodi" json:"pdrd_kode_prodi"`
	PdrdStatProdi  *string `db:"pdrd_stat_prodi" json:"pdrd_stat_prodi"`
}

type MappingUnitListParams struct {
	Search   string // search di kode_siakad, nm_unit, atau pdrd nm_lemb
	Status   string // all | mapped | unmapped | broken (id_sms tidak ada di pdrd.sms)
	Page     int
	Limit    int
	SortBy   string
	Order    string
}

type MappingUnitUpsertReq struct {
	KodeSiakad string  `json:"kode_siakad"`
	IDSms      *string `json:"id_sms"`
	NmUnit     *string `json:"nm_unit"`
	Jenjang    *string `json:"jenjang"`
}
