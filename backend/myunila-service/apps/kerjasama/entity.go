// Package kerjasama — integrator SIKERMA Unila ke pdut.kerjasama.
//
// SIKERMA expose 2 endpoint:
//   - GET /api/v1/unit-kerja                      → list 110+ unit (univ/fak/prodi/UPT)
//   - GET /api/v1/unit-kerja/{id}/kerjasama       → list MoU per unit
//
// Akses via proxy VM1 (sikerma-proxy nginx sidecar) untuk bypass Cloudflare
// TLS fingerprint discrimination dari VM3:
//   SIKERMA_BASE_URL=http://192.168.120.41:9803/sikerma/api/v1
//
// Mapping ke pdut:
//   sikerma.unit_kerja (kode_unit 5-digit) → pdrd.sms (kode_prodi)
//   sikerma.kerjasama                       → kerjasama.mou + kerjasama.sms_kerjasama
//   sikerma.daftar_mitra                    → pdrd.dudi
package kerjasama

import "time"

// =============================================================================
// SIKERMA API DTOs (response shape dari endpoint SIKERMA via proxy)
// =============================================================================

// SikermaUnitKerja — item dari GET /unit-kerja
type SikermaUnitKerja struct {
	ID          int    `json:"id"`
	KodeUnit    string `json:"kode_unit"`    // "UN26" / "UN26.01" / "57201" (kode_prodi)
	Jenjang     string `json:"jenjang"`      // "" / "N" / "S1" / "S2" / "D3"
	Unit        string `json:"unit"`         // Nama lengkap
	NamaPendek  string `json:"nama_pendek"`  // Singkatan (FK, FT, S2 Bio, dst)
}

// SikermaUnitKerjaResponse — response /unit-kerja
type SikermaUnitKerjaResponse struct {
	Status  string             `json:"status"`
	Message string             `json:"message"`
	Data    []SikermaUnitKerja `json:"data"`
}

// SikermaMitra — sub-element daftar_mitra di kerjasama
type SikermaMitra struct {
	IDMitra              int     `json:"id_mitra"`
	Pihak                int     `json:"pihak"`                // 1 / 2 (pihak pertama/kedua)
	NamaMitra            string  `json:"nama_mitra"`
	JenisMitra           string  `json:"jenis_mitra"`           // "IKU" dst
	KlasifikasiMitra     string  `json:"klasifikasi_mitra"`     // "Organisasi" / "Institusi Pendidikan" / dst
	NamaPenandatangan    *string `json:"nama_penandatangan"`
	JabatanPenandatangan *string `json:"jabatan_penandatangan"`
	NamaPj               *string `json:"nama_pj"`
	JabatanPj            *string `json:"jabatan_pj"`
	Email                *string `json:"email"`
}

// SikermaKerjasama — item kerjasama dari /unit-kerja/{id}/kerjasama
type SikermaKerjasama struct {
	ID              int            `json:"id"`
	IDJenisDokumen  string         `json:"id_jenis_dokumen"` // "IA" / "MoA" / "MoU"
	NomorDokumen    string         `json:"nomor_dokumen"`
	JudulKerjasama  string         `json:"judul_kerjasama"`
	TglAwal         string         `json:"tgl_awal"`         // "2025-11-29"
	TglBerakhir     string         `json:"tgl_berakhir"`
	DaftarMitra     []SikermaMitra `json:"daftar_mitra"`
}

// SikermaKerjasamaResponse — response /unit-kerja/{id}/kerjasama
type SikermaKerjasamaResponse struct {
	Status    string             `json:"status"`
	Message   string             `json:"message"`
	UnitKerja SikermaUnitKerja   `json:"unit_kerja"` // sub-set fields here, full mirror tetap valid
	TotalData int                `json:"total_data"`
	Data      []SikermaKerjasama `json:"data"`
}

// =============================================================================
// pdut Entities (kerjasama schema + pdrd.dudi)
// =============================================================================

// MoU — pdrd.kerjasama.mou row
type MoU struct {
	IDMou           string     `db:"id_mou" json:"id_mou"`
	IDSp            *string    `db:"id_sp" json:"id_sp,omitempty"`
	IDAktKerjasama  *int       `db:"id_akt_kerjasama" json:"id_akt_kerjasama,omitempty"`
	IDDudi          *string    `db:"id_dudi" json:"id_dudi,omitempty"`
	SkMou           *string    `db:"sk_mou" json:"sk_mou,omitempty"`
	JudulMou        *string    `db:"judul_mou" json:"judul_mou,omitempty"`
	UraianMou       *string    `db:"uraian_mou" json:"uraian_mou,omitempty"`
	TglMulai        *time.Time `db:"tgl_mulai" json:"tgl_mulai,omitempty"`
	TglSelesai      *time.Time `db:"tgl_selesai" json:"tgl_selesai,omitempty"`
	NmDudi          *string    `db:"nm_dudi" json:"nm_dudi,omitempty"`
	NpwpDudi        *string    `db:"npwp_dudi" json:"npwp_dudi,omitempty"`
	NmBu            *string    `db:"nm_bu" json:"nm_bu,omitempty"`
	TelKantor       *string    `db:"tel_kantor" json:"tel_kantor,omitempty"`
	Fax             *string    `db:"fax" json:"fax,omitempty"`
	Cp              *string    `db:"cp" json:"cp,omitempty"`
	TelCp           *string    `db:"tel_cp" json:"tel_cp,omitempty"`
	JabCp           *string    `db:"jab_cp" json:"jab_cp,omitempty"`
	IDSikerma       *int       `db:"id_sikerma" json:"id_sikerma,omitempty"` // ALTER TABLE add
	IDJenisDokumen  *string    `db:"id_jenis_dokumen" json:"id_jenis_dokumen,omitempty"` // ALTER TABLE add
	CreateDate      *time.Time `db:"create_date" json:"create_date,omitempty"`
	LastUpdate      *time.Time `db:"last_update" json:"last_update,omitempty"`
	SoftDelete      *float64   `db:"soft_delete" json:"soft_delete,omitempty"`
	LastSync        *time.Time `db:"last_sync" json:"last_sync,omitempty"`
}

// DUDI — pdrd.dudi row (subset)
type DUDI struct {
	IDDudi    string  `db:"id_dudi" json:"id_dudi"`
	NmDudi    *string `db:"nm_dudi" json:"nm_dudi,omitempty"`
	IDSikerma *int    `db:"id_sikerma" json:"id_sikerma,omitempty"`
}

// =============================================================================
// API request/response DTOs (untuk frontend integrator)
// =============================================================================

// SyncFilter — opsi filter saat sync (mis. cuma unit tertentu)
type SyncFilter struct {
	UnitIDs []int `json:"unit_ids,omitempty"` // kosong = sync semua unit
}

// SyncResult — ringkasan hasil sync
type SyncResult struct {
	StartedAt       time.Time `json:"started_at"`
	FinishedAt      time.Time `json:"finished_at"`
	DurationMs      int64     `json:"duration_ms"`
	UnitTotal       int       `json:"unit_total"`        // total unit yang di-loop
	UnitProcessed   int       `json:"unit_processed"`    // unit yang sukses ke-fetch
	UnitFailed      int       `json:"unit_failed"`
	MouUpserted     int       `json:"mou_upserted"`
	MouSkipped      int       `json:"mou_skipped"`
	MitraUpserted   int       `json:"mitra_upserted"`
	Errors          []string  `json:"errors,omitempty"`
}

// MouListItem — row tampil di table frontend
type MouListItem struct {
	IDMou          string  `db:"id_mou" json:"id_mou"`
	IDSikerma      *int    `db:"id_sikerma" json:"id_sikerma,omitempty"`
	IDJenisDokumen *string `db:"id_jenis_dokumen" json:"id_jenis_dokumen,omitempty"`
	SkMou          *string `db:"sk_mou" json:"sk_mou,omitempty"`
	JudulMou       *string `db:"judul_mou" json:"judul_mou,omitempty"`
	NmDudi         *string `db:"nm_dudi" json:"nm_dudi,omitempty"`
	TglMulai       *string `db:"tgl_mulai" json:"tgl_mulai,omitempty"`
	TglSelesai     *string `db:"tgl_selesai" json:"tgl_selesai,omitempty"`
	LastSync       *string `db:"last_sync" json:"last_sync,omitempty"`
}

// MouStats — stat card di header
type MouStats struct {
	TotalMou        int     `json:"total_mou"`
	TotalAktif      int     `json:"total_aktif"`        // tgl_selesai > now
	TotalExpired    int     `json:"total_expired"`
	TotalMitra      int     `json:"total_mitra"`        // distinct id_dudi
	LastSync        *string `json:"last_sync,omitempty"`
}

// UnitMapping — kerjasama.unit_mapping row, audit + manual override.
// Setiap unit dari SIKERMA di-record di sini, dengan strategy mapping ke
// pdrd.sms (kode_prodi / fakultas / manual / univ / skip).
// Admin bisa CRUD via frontend untuk fix unit yang unmapped.
type UnitMapping struct {
	IDUnitMapping  string  `db:"id_unit_mapping" json:"id_unit_mapping"`
	SikermaUnitID  int     `db:"sikerma_unit_id" json:"sikerma_unit_id"`
	KodeUnit       *string `db:"kode_unit" json:"kode_unit,omitempty"`
	Jenjang        *string `db:"jenjang" json:"jenjang,omitempty"`
	UnitNama       *string `db:"unit_nama" json:"unit_nama,omitempty"`
	NamaPendek     *string `db:"nama_pendek" json:"nama_pendek,omitempty"`
	IDSms          *string `db:"id_sms" json:"id_sms,omitempty"`
	NmSms          *string `db:"nm_sms" json:"nm_sms,omitempty"` // computed via JOIN
	Strategy       *string `db:"strategy" json:"strategy,omitempty"` // kode_prodi/fakultas/manual/univ/skip/unmapped
	Notes          *string `db:"notes" json:"notes,omitempty"`
	LastCheck      *string `db:"last_check" json:"last_check,omitempty"`
	LastMatch      *string `db:"last_match" json:"last_match,omitempty"`
}

// UnitMappingUpdate — payload PATCH endpoint (manual override admin).
type UnitMappingUpdate struct {
	IDSms *string `json:"id_sms"` // null untuk unmap, atau UUID baru
	Notes *string `json:"notes"`
}

// UnitMappingStats — quick stats card untuk halaman mapping admin
type UnitMappingStats struct {
	Total     int `json:"total"`
	Mapped    int `json:"mapped"`
	Unmapped  int `json:"unmapped"`
	ByStrategy map[string]int `json:"by_strategy"` // {kode_prodi: 80, fakultas: 9, ...}
}
