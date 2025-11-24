package matkul_kurikulum

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

// =============================================================================
// DATABASE ENTITIES
// =============================================================================

// KurikulumSP - Main entity for kurikulum data (pdrd.kurikulum_sp)
type KurikulumSP struct {
	// Primary Key
	IDKurikulumSP string `json:"id_kurikulum_sp" db:"id_kurikulum_sp"`

	// Foreign Keys
	IDSmt       *string `json:"id_smt" db:"id_smt"`
	IDJenjDidik *int    `json:"id_jenj_didik" db:"id_jenj_didik"`
	IDSMS       *string `json:"id_sms" db:"id_sms"`

	// Kurikulum Information
	NmKurikulumSP     *string  `json:"nm_kurikulum_sp" db:"nm_kurikulum_sp"`
	JmlhSmtNormal     *int     `json:"jmlh_smt_normal" db:"jmlh_smt_normal"`
	JmlhSksLulus      *float64 `json:"jmlh_sks_lulus" db:"jmlh_sks_lulus"`
	JmlhSksWajib      *float64 `json:"jmlh_sks_wajib" db:"jmlh_sks_wajib"`
	JmlhSksPilihan    *float64 `json:"jmlh_sks_pilihan" db:"jmlh_sks_pilihan"`
	JmlhSksMkWajib    *float64 `json:"jmlh_sks_mk_wajib" db:"jmlh_sks_mk_wajib"`
	JmlhSksMkPilih    *float64 `json:"jmlh_sks_mk_pilih" db:"jmlh_sks_mk_pilih"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// MatkulKurikulum - Entity for matkul kurikulum (pdrd.matkul_kurikulum)
type MatkulKurikulum struct {
	// Foreign Keys (Composite Primary Key)
	IDKurikulumSP string  `json:"id_kurikulum_sp" db:"id_kurikulum_sp"`
	IDMk          *string `json:"id_mk" db:"id_mk"`

	// Semester & SKS Information
	Smt         *int     `json:"smt" db:"smt"`
	SksMk       *float64 `json:"sks_mk" db:"sks_mk"`
	SksTm       *float64 `json:"sks_tm" db:"sks_tm"`
	SksPrak     *float64 `json:"sks_prak" db:"sks_prak"`
	SksPrakLap  *float64 `json:"sks_prak_lap" db:"sks_prak_lap"`
	SksSim      *float64 `json:"sks_sim" db:"sks_sim"`
	AWajib      *int     `json:"a_wajib" db:"a_wajib"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// Matkul - Entity for mata kuliah (pdrd.matkul)
type Matkul struct {
	// Primary Key
	IDMkPDDikti string `json:"id_mk_pddikti" db:"id_mk_pddikti"`

	// Foreign Keys
	IDJenjDidik *int    `json:"id_jenj_didik" db:"id_jenj_didik"`
	IDSMS       *string `json:"id_sms" db:"id_sms"`

	// SKS Information
	SksMk      *float64 `json:"sks_mk" db:"sks_mk"`
	SksTm      *float64 `json:"sks_tm" db:"sks_tm"`
	SksPrak    *float64 `json:"sks_prak" db:"sks_prak"`
	SksPrakLap *float64 `json:"sks_prak_lap" db:"sks_prak_lap"`
	SksSim     *float64 `json:"sks_sim" db:"sks_sim"`

	// Mata Kuliah Information
	KodeMk                    *string `json:"kode_mk" db:"kode_mk"`
	NmMk                      *string `json:"nm_mk" db:"nm_mk"`
	JnsMk                     *string `json:"jns_mk" db:"jns_mk"`
	KelMk                     *string `json:"kel_mk" db:"kel_mk"`
	MetodePelaksanaanKuliah   *string `json:"metode_pelaksanaan_kuliah" db:"metode_pelaksanaan_kuliah"`

	// Flags
	ASap        *int `json:"a_sap" db:"a_sap"`
	ASilabus    *int `json:"a_silabus" db:"a_silabus"`
	ABahanAjar  *int `json:"a_bahan_ajar" db:"a_bahan_ajar"`
	AcaraPrak   *int `json:"acara_prak" db:"acara_prak"`
	ADiktat     *int `json:"a_diktat" db:"a_diktat"`

	// Effectivity Period
	TglMulaiEfektif  *time.Time `json:"tgl_mulai_efektif" db:"tgl_mulai_efektif"`
	TglAkhirEfektif  *time.Time `json:"tgl_akhir_efektif" db:"tgl_akhir_efektif"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// FEEDER API RESPONSE DTOs
// =============================================================================

// FeederKurikulumData - Response from GetListKurikulum
type FeederKurikulumData struct {
	IDKurikulum                  string       `json:"id_kurikulum"`
	IDSemester                   *string      `json:"id_semester"`
	IDJenisDidik                 *FlexibleInt `json:"id_jenj_didik"`
	IDProdi                      *string      `json:"id_prodi"`
	NamaKurikulum                *string      `json:"nama_kurikulum"`
	JumlahSemesterNormal         *FlexibleInt `json:"jml_sem_normal"`
	JumlahSksLulus               *FlexibleInt `json:"jumlah_sks_lulus"`
	JumlahSksWajib               *FlexibleInt `json:"jumlah_sks_wajib"`
	JumlahSksPilihan             *FlexibleInt `json:"jumlah_sks_pilihan"`
	JumlahSksMataKuliahWajib     *FlexibleInt `json:"jumlah_sks_mata_kuliah_wajib"`
	JumlahSksMataKuliahPilihan   *FlexibleInt `json:"jumlah_sks_mata_kuliah_pilihan"`
}

// FeederMatkulKurikulumData - Response from GetMatkulKurikulum
type FeederMatkulKurikulumData struct {
	IDKurikulum             string       `json:"id_kurikulum"`
	IDMatkul                *string      `json:"id_matkul"`
	Semester                *FlexibleInt `json:"semester"`
	SksMatKul               *FlexibleInt `json:"sks_mata_kuliah"`
	SksTatapMuka            *FlexibleInt `json:"sks_tatap_muka"`
	SksPraktek              *FlexibleInt `json:"sks_praktek"`
	SksPraktekLapangan      *FlexibleInt `json:"sks_praktek_lapangan"`
	SksSimulasi             *FlexibleInt `json:"sks_simulasi"`
	ApakahWajib             *FlexibleInt `json:"apakah_wajib"`
}

// FeederMatkulData - Response from GetListMataKuliah
type FeederMatkulData struct {
	IDMatkul                string       `json:"id_matkul"`
	IDJenisDidik            *FlexibleInt `json:"id_jenj_didik"`
	IDProdi                 *string      `json:"id_prodi"`
	SksMatKul               *FlexibleInt `json:"sks_mata_kuliah"`
	SksTatapMuka            *FlexibleInt `json:"sks_tatap_muka"`
	SksPraktek              *FlexibleInt `json:"sks_praktek"`
	SksPraktekLapangan      *FlexibleInt `json:"sks_praktek_lapangan"`
	SksSimulasi             *FlexibleInt `json:"sks_simulasi"`
	KodeMataKuliah          *string      `json:"kode_mata_kuliah"`
	NamaMataKuliah          *string      `json:"nama_mata_kuliah"`
	JenisMk                 *string      `json:"jns_mk"`
	KelompokMk              *string      `json:"kel_mk"`
	MetodeKuliah            *string      `json:"metode_kuliah"`
	AdaSap                  *FlexibleInt `json:"ada_sap"`
	AdaSilabus              *FlexibleInt `json:"ada_silabus"`
	AdaBahanAjar            *FlexibleInt `json:"ada_bahan_ajar"`
	AdaAcaraPraktek         *FlexibleInt `json:"ada_acara_praktek"`
	AdaDiktat               *FlexibleInt `json:"ada_diktat"`
	TanggalMulaiEfektif     *string      `json:"tanggal_mulai_efektif"`
	TanggalAkhirEfektif     *string      `json:"tanggal_akhir_efektif"`
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// KurikulumListItem - Kurikulum with calculated fields for list view
type KurikulumListItem struct {
	IDKurikulumSP     string     `db:"id_kurikulum_sp" json:"id_kurikulum_sp"`
	NmKurikulumSP     string     `db:"nm_kurikulum_sp" json:"nm_kurikulum_sp"`
	IDSemester        string     `db:"id_semester" json:"id_semester"`
	NamaSemester      *string    `db:"nama_semester" json:"nama_semester"`
	IDProdi           string     `db:"id_prodi" json:"id_prodi"`
	NamaProdi         *string    `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang       *string    `db:"nama_jenjang" json:"nama_jenjang"`
	JmlhSmtNormal     int        `db:"jmlh_smt_normal" json:"jmlh_smt_normal"`
	JmlhSksLulus      float64    `db:"jmlh_sks_lulus" json:"jmlh_sks_lulus"`
	JmlhSksWajib      *float64   `db:"jmlh_sks_wajib" json:"jmlh_sks_wajib"`
	JmlhSksPilihan    *float64   `db:"jmlh_sks_pilihan" json:"jmlh_sks_pilihan"`
	JumlahMatkul      int        `db:"jumlah_matkul" json:"jumlah_matkul"`
	LastSync          time.Time  `db:"last_sync" json:"last_sync"`
}

// KurikulumListResult - Paginated kurikulum list result
type KurikulumListResult struct {
	Data       []*KurikulumListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// KurikulumStats - Statistics for kurikulum
type KurikulumStats struct {
	TotalKurikulum int        `json:"total_kurikulum" db:"total_kurikulum"`
	TotalMatkul    int        `json:"total_matkul" db:"total_matkul"`
	TotalProdi     int        `json:"total_prodi" db:"total_prodi"`
	LastSync       *time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// SYNC RESULT DTOs
// =============================================================================

// KurikulumSyncResult - Result for single kurikulum sync
type KurikulumSyncResult struct {
	IDKurikulum   string `json:"id_kurikulum"`
	NamaKurikulum string `json:"nama_kurikulum"`
	JumlahMatkul  int    `json:"jumlah_matkul"`
	Success       bool   `json:"success"`
	Error         string `json:"error,omitempty"`
}

// BatchKurikulumSyncResult - Result for batch sync
type BatchKurikulumSyncResult struct {
	TotalProcessed int                    `json:"total_processed"`
	TotalSuccess   int                    `json:"total_success"`
	TotalFailed    int                    `json:"total_failed"`
	Duration       string                 `json:"duration"`
	Results        []KurikulumSyncResult  `json:"results,omitempty"`
	SyncedBy       string                 `json:"synced_by"`
	Filter         *SyncFilter            `json:"filter,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDProdi   *string `json:"id_prodi,omitempty"` // Optional - filter by prodi (id_sms)
	ForceSync bool    `json:"force_sync,omitempty"` // Optional - force re-sync
}
