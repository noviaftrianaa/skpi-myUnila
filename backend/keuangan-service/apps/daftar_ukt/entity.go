package daftar_ukt

import (
	"time"

	"github.com/google/uuid"
)

// DaftarUKT represents UKT class data from SIMPEDAM with MyUnila mapping
type DaftarUKT struct {
	IDDaftarUKT     uuid.UUID  `json:"id_daftar_ukt" db:"id_daftar_ukt"`
	IDProdiSimpedam uuid.UUID  `json:"id_prodi_simpedam" db:"id_prodi_simpedam"`
	NamaProdi       string     `json:"nama_prodi" db:"nama_prodi"`
	Tahun           int        `json:"tahun" db:"tahun"`
	KodeFakultas    string     `json:"kode_fakultas" db:"kode_fakultas"`
	NamaFakultas    string     `json:"nama_fakultas" db:"nama_fakultas"`
	KodeKelas       string     `json:"kode_kelas" db:"kode_kelas"`
	NamaKelas       string     `json:"nama_kelas" db:"nama_kelas"`
	Nominal         float64    `json:"nominal" db:"nominal"`
	KodeStrata      int        `json:"kode_strata" db:"kode_strata"`

	// MyUnila mapping (from mapping_prodi_simpedam)
	IDSMS           *uuid.UUID `json:"id_sms,omitempty" db:"id_sms"`
	IDJenjDidik     *int       `json:"id_jenj_didik,omitempty" db:"id_jenj_didik"`

	// Audit fields
	CreateDate      time.Time  `json:"create_date" db:"create_date"`
	IDCreator       uuid.UUID  `json:"id_creator" db:"id_creator"`
	LastUpdate      time.Time  `json:"last_update" db:"last_update"`
	IDUpdater       *uuid.UUID `json:"id_updater,omitempty" db:"id_updater"`
	SoftDelete      int        `json:"soft_delete" db:"soft_delete"`
	LastSync        time.Time  `json:"last_sync" db:"last_sync"`
}

// DaftarUKTListResult represents paginated result
type DaftarUKTListResult struct {
	Data       []DaftarUKT `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// SyncFilter represents filter options for sync
type SyncFilter struct {
	Tahun     int     `json:"tahun"`
	IDProdi   *string `json:"id_prodi,omitempty"`
	ForceSync bool    `json:"force_sync"`
	SyncedBy  string  `json:"synced_by,omitempty"`
}

// SyncResult represents sync operation result
type SyncResult struct {
	TotalProcessed int    `json:"total_processed"`
	TotalInserted  int    `json:"total_inserted"`
	TotalUpdated   int    `json:"total_updated"`
	TotalFailed    int    `json:"total_failed"`
	TotalMapped    int    `json:"total_mapped"`
	TotalUnmapped  int    `json:"total_unmapped"`
	Duration       string `json:"duration"`
	SyncedBy       string `json:"synced_by"`
}

// ProdiMapping represents prodi mapping from SIMPEDAM to MyUnila
type ProdiMapping struct {
	IDMapping        int        `json:"id_mapping" db:"id_mapping"`
	IDProdiSimpedam  uuid.UUID  `json:"id_prodi_simpedam" db:"id_prodi_simpedam"`
	NamaProdiSimpedam string    `json:"nama_prodi_simpedam" db:"nama_prodi_simpedam"`
	KodeStrata       int        `json:"kode_strata" db:"kode_strata"`
	IDSMS            uuid.UUID  `json:"id_sms" db:"id_sms"`
	NamaProdiMyunila *string    `json:"nama_prodi_myunila,omitempty" db:"nama_prodi_myunila"`
	IsActive         int        `json:"is_active" db:"is_active"`
}

// DaftarUktStats represents statistics for DaftarUKT
type DaftarUktStats struct {
	TotalDaftarUkt int     `json:"total_daftar_ukt"`
	TotalProdi     int     `json:"total_prodi"`
	TotalMapped    int     `json:"total_mapped"`
	TotalUnmapped  int     `json:"total_unmapped"`
	LastSync       *string `json:"last_sync,omitempty"`
}

// FakultasOption represents fakultas option for dropdown
type FakultasOption struct {
	KodeFakultas string `json:"kode_fakultas" db:"kode_fakultas"`
	NamaFakultas string `json:"nama_fakultas" db:"nama_fakultas"`
}

// ProdiOption represents prodi option for dropdown
type ProdiOption struct {
	IDProdiSimpedam string `json:"id_prodi_simpedam" db:"id_prodi_simpedam"`
	NamaProdi       string `json:"nama_prodi" db:"nama_prodi"`
}
