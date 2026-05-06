package kkn

import "time"

type SyncStats struct {
	TotalTables    int            `json:"total_tables"`
	TotalRows      int            `json:"total_rows"`
	TableStats     []TableStat    `json:"table_stats"`
	LastSync       *time.Time     `json:"last_sync"`
	SQLServerStats []SQLTableStat `json:"sqlserver_stats"`
}

type TableStat struct {
	Table string `json:"table"`
	Count int    `json:"count"`
}

type SQLTableStat struct {
	Table string `json:"table"`
	Count int    `json:"count"`
}

type SyncResult struct {
	Table    string `json:"table"`
	Fetched  int    `json:"fetched"`
	Inserted int    `json:"inserted"`
	Updated  int    `json:"updated"`
	Skipped  int    `json:"skipped"`
	Failed   int    `json:"failed"`
	Duration int64  `json:"duration_ms"`
}

type SyncAllResult struct {
	Results  []*SyncResult `json:"results"`
	Duration int64         `json:"duration_ms"`
	SyncedBy string        `json:"synced_by"`
}

type SyncFilter struct {
	Tables   []string `json:"tables"`
	SyncType string   `json:"sync_type"`
}

type PeriodeKKN struct {
	LegacyID int    `json:"legacy_id"`
	Periode  string `json:"periode"`
	Tahun    int    `json:"tahun"`
}

type LokasiKKN struct {
	LegacyIDDesa      int    `json:"legacy_id_desa"`
	LegacyIDKecamatan int    `json:"legacy_id_kecamatan"`
	LegacyIDKabupaten int    `json:"legacy_id_kabupaten"`
	NamaDesa          string `json:"nama_desa"`
	NamaKecamatan     string `json:"nama_kecamatan"`
	NamaKabupaten     string `json:"nama_kabupaten"`
}

var SyncTableGroups = map[string][]string{
	"referensi": {
		"kkn_periode", "ref_jenis_kkn", "ref_golongan", "ref_nilai", "persentase_nilai",
	},
	"lokasi": {
		"lokasi_kabupaten", "lokasi_kecamatan", "lokasi_desa", "lokasi_terdaftar",
	},
	"pendaftaran": {
		"mahasiswa_pendaftar", "mahasiswa_biodata",
	},
	"penempatan": {
		"penempatan_mahasiswa", "biodata_dpl", "penempatan_dpl", "biodata_kdpl", "penempatan_kdpl",
	},
	"nilai": {
		"nilai_dpl", "nilai_kdpl",
	},
	"laporan": {
		"mahasiswa_laporan_p", "mahasiswa_laporan_rk",
	},
}

var SyncOrder = []string{
	"referensi", "lokasi", "pendaftaran", "penempatan", "nilai", "laporan",
}
