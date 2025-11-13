package riwayat_fungsional

import (
	"database/sql"
	"encoding/json"
	"time"
)

// RwyFungsional represents pdrd.rwy_fungsional table
type RwyFungsional struct {
	// Primary Key
	IDRwyJabfung string `json:"id_rwy_jabfung" db:"id_rwy_jabfung"` // uniqueidentifier, PRIMARY KEY

	// Foreign Keys
	IDSDM        string  `json:"id_sdm" db:"id_sdm"`                 // uniqueidentifier, FK to pdrd.sdm, NOT NULL
	IDKelBidang  *string `json:"id_kel_bidang" db:"id_kel_bidang"`   // uniqueidentifier, FK to ref.kelompok_bidang, nullable
	IDJabfung    int     `json:"id_jabfung" db:"id_jabfung"`         // int, FK to ref.jabfung, NOT NULL

	// Data Fields
	SkJabfung      string          `json:"sk_jabfung" db:"sk_jabfung"`           // varchar(60), NOT NULL
	TmtSkJabfung   time.Time       `json:"tmt_sk_jabfung" db:"tmt_sk_jabfung"`   // date, NOT NULL
	AngkaKredit    sql.NullFloat64 `json:"angka_kredit" db:"angka_kredit"`       // decimal/numeric, nullable
	LebihAjar      sql.NullFloat64 `json:"lebih_ajar" db:"lebih_ajar"`           // decimal/numeric, nullable, default 0
	LebihLit       sql.NullFloat64 `json:"lebih_lit" db:"lebih_lit"`             // decimal/numeric, nullable, default 0
	LebihPengmas   sql.NullFloat64 `json:"lebih_pengmas" db:"lebih_pengmas"`     // decimal/numeric, nullable, default 0
	LebihTunjang   sql.NullFloat64 `json:"lebih_tunjang" db:"lebih_tunjang"`     // decimal/numeric, nullable, default 0
	BidangIlmu     *string         `json:"bidang_ilmu" db:"bidang_ilmu"`         // varchar(100), nullable

	// Audit Fields
	CreateDate  time.Time  `json:"create_date" db:"create_date"`   // datetime, NOT NULL
	IDCreator   string     `json:"id_creator" db:"id_creator"`     // uniqueidentifier, NOT NULL
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`   // datetime, NOT NULL
	IDUpdater   *string    `json:"id_updater" db:"id_updater"`     // uniqueidentifier, nullable
	SoftDelete  int        `json:"soft_delete" db:"soft_delete"`   // numeric(1), NOT NULL, default 0
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`       // datetime, NOT NULL
}

// Sister API Response structures
// SisterJabatanFungsionalListItem represents item in GET /jabatan_fungsional response
type SisterJabatanFungsionalListItem struct {
	ID                   string  `json:"id"`                      // UUID, id_rwy_jabfung
	JabatanFungsional    string  `json:"jabatan_fungsional"`      // Display name
	SK                   string  `json:"sk"`                      // SK number
	TanggalMulai         string  `json:"tanggal_mulai"`           // date format "2023-02-01"
	AngkaKredit          float64 `json:"angka_kredit"`            // decimal/numeric
	KelebihanPengajaran  float64 `json:"kelebihan_pengajaran"`    // decimal/numeric, default 0
	KelebihanPenelitian  float64 `json:"kelebihan_penelitian"`    // decimal/numeric, default 0
	KelebihanPengabdian  float64 `json:"kelebihan_pengabdian"`    // decimal/numeric, default 0
	KelebihanPenunjang   float64 `json:"kelebihan_penunjang"`     // decimal/numeric, default 0
}

// SisterJabatanFungsionalDetail represents GET /jabatan_fungsional/{id} response
type SisterJabatanFungsionalDetail struct {
	SisterJabatanFungsionalListItem                                  // Embed list item fields

	IDSDM                 string `json:"id_sdm"`                    // UUID
	IDJabatanFungsional   int    `json:"id_jabatan_fungsional"`     // Integer, maps to id_jabfung
}

// RiwayatFungsionalListResult represents paginated list result
type RiwayatFungsionalListResult struct {
	Data       []*RwyFungsionalWithDetail `json:"data"`
	Total      int                        `json:"total"`
	Page       int                        `json:"page"`
	Limit      int                        `json:"limit"`
	TotalPages int                        `json:"total_pages"`
}

// RwyFungsionalWithDetail combines rwy_fungsional with related data for display
type RwyFungsionalWithDetail struct {
	RwyFungsional

	// Related display fields
	NamaDosen   sql.NullString `json:"-" db:"nama_dosen"`
	NIDN        sql.NullString `json:"-" db:"nidn"`
	NmJabfung   sql.NullString `json:"-" db:"nm_jabfung"`
	NmKelBidang sql.NullString `json:"-" db:"nm_kel_bidang"`
}

// RiwayatFungsionalStats represents statistics for riwayat fungsional sync
type RiwayatFungsionalStats struct {
	TotalRiwayat      int        `json:"total_riwayat" db:"total_riwayat"`
	TotalProfesor     int        `json:"total_profesor" db:"total_profesor"`
	TotalLektorKepala int        `json:"total_lektor_kepala" db:"total_lektor_kepala"`
	TotalLektor       int        `json:"total_lektor" db:"total_lektor"`
	LastSyncDate      *time.Time `json:"last_sync_date" db:"last_sync_date"`
}

// MarshalJSON custom marshaler for RwyFungsional to handle sql.NullFloat64
func (r *RwyFungsional) MarshalJSON() ([]byte, error) {
	type Alias RwyFungsional
	return json.Marshal(&struct {
		AngkaKredit  *float64 `json:"angka_kredit"`
		LebihAjar    *float64 `json:"lebih_ajar"`
		LebihLit     *float64 `json:"lebih_lit"`
		LebihPengmas *float64 `json:"lebih_pengmas"`
		LebihTunjang *float64 `json:"lebih_tunjang"`
		*Alias
	}{
		AngkaKredit:  nullFloat64ToPtr(r.AngkaKredit),
		LebihAjar:    nullFloat64ToPtr(r.LebihAjar),
		LebihLit:     nullFloat64ToPtr(r.LebihLit),
		LebihPengmas: nullFloat64ToPtr(r.LebihPengmas),
		LebihTunjang: nullFloat64ToPtr(r.LebihTunjang),
		Alias:        (*Alias)(r),
	})
}

// Helper function to convert sql.NullFloat64 to *float64
func nullFloat64ToPtr(nf sql.NullFloat64) *float64 {
	if nf.Valid {
		return &nf.Float64
	}
	return nil
}

// MarshalJSON custom marshaler for RwyFungsionalWithDetail
func (r *RwyFungsionalWithDetail) MarshalJSON() ([]byte, error) {
	// Create a map to hold all fields
	m := make(map[string]interface{})

	// Marshal the embedded RwyFungsional first
	rwyJSON, err := json.Marshal(&r.RwyFungsional)
	if err != nil {
		return nil, err
	}

	// Unmarshal into map
	if err := json.Unmarshal(rwyJSON, &m); err != nil {
		return nil, err
	}

	// Add related fields as sql.NullString (they will be serialized properly by default)
	m["nama_dosen"] = r.NamaDosen
	m["nidn"] = r.NIDN
	m["jabatan"] = r.NmJabfung  // Renamed to match frontend expectation
	m["kelompok_bidang"] = r.NmKelBidang

	return json.Marshal(m)
}
