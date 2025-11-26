package rencana_evaluasi

import (
	"encoding/json"
	"strconv"
	"time"
)

// =============================================================================
// CUSTOM TYPES FOR JSON PARSING
// =============================================================================

// FlexFloat is a float64 that can be unmarshalled from a JSON string or number
type FlexFloat struct {
	Value *float64
}

func (f *FlexFloat) UnmarshalJSON(data []byte) error {
	// Try to unmarshal as float64 first
	var floatVal float64
	if err := json.Unmarshal(data, &floatVal); err == nil {
		f.Value = &floatVal
		return nil
	}

	// Try to unmarshal as string
	var strVal string
	if err := json.Unmarshal(data, &strVal); err == nil {
		if strVal == "" || strVal == "null" {
			f.Value = nil
			return nil
		}
		floatVal, err := strconv.ParseFloat(strVal, 64)
		if err != nil {
			return err
		}
		f.Value = &floatVal
		return nil
	}

	// If null
	f.Value = nil
	return nil
}

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

// RencanaEvaluasi - Entity for rencana evaluasi mata kuliah (pdrd.re_mk)
type RencanaEvaluasi struct {
	// Primary Key
	IDReMk string `json:"id_re_mk" db:"id_re_mk"`

	// Foreign Keys
	IDJnsEval *int    `json:"id_jns_eval" db:"id_jns_eval"`
	IDMk      *string `json:"id_mk" db:"id_mk"`

	// Data Fields
	NoUrut            *int     `json:"no_urut" db:"no_urut"`
	KomponenEvaluasi  *string  `json:"komponen_evaluasi" db:"komponen_evaluasi"` // TGS/QIZ/UTS/UAS
	DeskIndo          *string  `json:"desk_indo" db:"desk_indo"`
	DeskIng           *string  `json:"desk_ing" db:"desk_ing"`
	BobotEvaluasi     *float64 `json:"bobot_evaluasi" db:"bobot_evaluasi"` // 0-100

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// JenisEvaluasi - Entity for jenis evaluasi reference (ref.jenis_evaluasi)
type JenisEvaluasi struct {
	IDJnsEval  int       `json:"id_jns_eval" db:"id_jns_eval"`
	NmJnsEval  string    `json:"nm_jns_eval" db:"nm_jns_eval"`
	CreateDate time.Time `json:"create_date" db:"create_date"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// FEEDER API RESPONSE DTOs
// =============================================================================

// FeederRencanaEvaluasiData - Response from GetListRencanaEvaluasi
type FeederRencanaEvaluasiData struct {
	IDRencanaEvaluasi  string    `json:"id_rencana_evaluasi"`
	IDJenisEvaluasi    FlexInt   `json:"id_jenis_evaluasi"`
	IDMatkul           *string   `json:"id_matkul"`
	NamaEvaluasi       *string   `json:"nama_evaluasi"`       // komponen_evaluasi
	DeskripsiIndonesia *string   `json:"deskripsi_indonesia"` // desk_indo
	DeskripsiInggris   *string   `json:"deskrips_inggris"`    // desk_ing (typo di API)
	BobotEvaluasi      FlexFloat `json:"bobot_evaluasi"`
	NomorUrut          FlexInt   `json:"nomor_urut"`
}

// FeederJenisEvaluasiData - Response from GetJenisEvaluasi
type FeederJenisEvaluasiData struct {
	IDJenisEvaluasi   int    `json:"id_jenis_evaluasi"`
	NamaJenisEvaluasi string `json:"nama_jenis_evaluasi"`
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// RencanaEvaluasiListItem - Item for list view with additional info
type RencanaEvaluasiListItem struct {
	IDReMk            string     `db:"id_re_mk" json:"id_re_mk"`
	IDJnsEval         *int       `db:"id_jns_eval" json:"id_jns_eval"`
	JenisEvaluasi     *string    `db:"jenis_evaluasi" json:"jenis_evaluasi"`
	IDMk              *string    `db:"id_mk" json:"id_mk"`
	KodeMatkul        *string    `db:"kode_matkul" json:"kode_matkul"`
	NamaMatkul        *string    `db:"nama_matkul" json:"nama_matkul"`
	SksMatkul         *float64   `db:"sks_matkul" json:"sks_matkul"`
	NoUrut            *int       `db:"no_urut" json:"no_urut"`
	KomponenEvaluasi  *string    `db:"komponen_evaluasi" json:"komponen_evaluasi"`
	DeskIndo          *string    `db:"desk_indo" json:"desk_indo"`
	DeskIng           *string    `db:"desk_ing" json:"desk_ing"`
	BobotEvaluasi     *float64   `db:"bobot_evaluasi" json:"bobot_evaluasi"`
	LastSync          time.Time  `db:"last_sync" json:"last_sync"`
}

// RencanaEvaluasiListResult - Paginated list result
type RencanaEvaluasiListResult struct {
	Data       []*RencanaEvaluasiListItem `json:"data"`
	Total      int                        `json:"total"`
	Page       int                        `json:"page"`
	Limit      int                        `json:"limit"`
	TotalPages int                        `json:"total_pages"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// RencanaEvaluasiStats - Statistics for rencana evaluasi
type RencanaEvaluasiStats struct {
	TotalRencanaEvaluasi int        `json:"total_rencana_evaluasi" db:"total_rencana_evaluasi"`
	TotalMatkul          int        `json:"total_matkul" db:"total_matkul"`
	TotalJenisEvaluasi   int        `json:"total_jenis_evaluasi" db:"total_jenis_evaluasi"`
	LastSync             *time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// SYNC RESULT DTOs
// =============================================================================

// RencanaEvaluasiSyncResult - Result for single rencana evaluasi sync
type RencanaEvaluasiSyncResult struct {
	IDReMk      string `json:"id_re_mk"`
	IDMatkul    string `json:"id_matkul"`
	NamaMatkul  string `json:"nama_matkul"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
}

// BatchRencanaEvaluasiSyncResult - Result for batch sync
type BatchRencanaEvaluasiSyncResult struct {
	TotalJenisEvaluasi     int                          `json:"total_jenis_evaluasi"`
	TotalRencanaEvaluasi   int                          `json:"total_rencana_evaluasi"`
	TotalSuccess           int                          `json:"total_success"`
	TotalFailed            int                          `json:"total_failed"`
	Duration               string                       `json:"duration"`
	Results                []RencanaEvaluasiSyncResult  `json:"results,omitempty"`
	SyncedBy               string                       `json:"synced_by"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDMatkul  *string `json:"id_matkul,omitempty"` // Optional - filter by matkul
	ForceSync bool    `json:"force_sync,omitempty"` // Optional - force re-sync
}
