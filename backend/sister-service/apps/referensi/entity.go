package referensi

import (
	"encoding/json"
	"time"
)

// SisterResponse is a generic wrapper for SISTER API responses
// Some endpoints return direct arrays, others return wrapped objects
type SisterResponse[T any] struct {
	Data []T `json:"data"` // For wrapped responses
}

// UnmarshalSisterResponse handles both direct array and wrapped object responses
func UnmarshalSisterResponse[T any](rawData []byte) ([]T, error) {
	// Try direct array first
	var directArray []T
	if err := json.Unmarshal(rawData, &directArray); err == nil {
		return directArray, nil
	}

	// Try wrapped object with "data" field
	var wrappedResponse SisterResponse[T]
	if err := json.Unmarshal(rawData, &wrappedResponse); err == nil {
		return wrappedResponse.Data, nil
	}

	// If both fail, return error
	return nil, json.Unmarshal(rawData, &directArray) // Return original error
}

// Agama represents religion reference data from ref.agama table
type Agama struct {
	IDAgama     int        `json:"id_agama" db:"id_agama"`
	NamaAgama   string     `json:"nama_agama" db:"nama_agama"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
}

// SisterAgama represents religion data from Sister API
type SisterAgama struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// SyncRequest represents base sync request (empty - user info from JWT)
type SyncRequest struct {
	// No fields needed - user info extracted from JWT context
}

// Negara represents country reference data from ref.negara table
type Negara struct {
	IDNegara    string     `json:"id_negara" db:"id_negara"`
	NamaNegara  string     `json:"nama_negara" db:"nama_negara"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy    *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterNegara represents country data from Sister API
type SisterNegara struct {
	ID   string `json:"id"`   // 2-letter country code
	Nama string `json:"nama"` // Country name
}

// JenjangPendidikan represents education level reference data
type JenjangPendidikan struct {
	IDJenjangPendidikan int        `json:"id_jenjang_pendidikan" db:"id_jenj_didik"`
	NamaJenjang         string     `json:"nama_jenjang" db:"nama_jenjang"`
	ExpiredDate         *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync            *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy            *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterJenjangPendidikan from Sister API
type SisterJenjangPendidikan struct {
	ID   string `json:"id"`    // Sister API returns string
	Nama string `json:"nama"`
}

// GelarAkademik represents academic title reference data
type GelarAkademik struct {
	IDGelarAkademik int        `json:"id_gelar_akademik" db:"id_gelar_akad"`
	NamaGelar       string     `json:"nama_gelar" db:"nama_gelar"`
	SingkatGelar    *string    `json:"singkat_gelar,omitempty" db:"singkat_gelar"`
	PosisiGelar     *int       `json:"posisi_gelar,omitempty" db:"posisi_gelar"` // 1=depan, 2=belakang, 3=tengah
	ExpiredDate     *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync        *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy        *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterGelarAkademik from Sister API
type SisterGelarAkademik struct {
	ID   int    `json:"id"`    // Sister API returns int
	Nama string `json:"nama"`
}

// Semester represents semester reference data
type Semester struct {
	IDSemester    string     `json:"id_semester" db:"id_smt"`
	NamaSemester  string     `json:"nama_semester" db:"nama_semester"`
	IDTahunAjaran *int       `json:"id_tahun_ajaran,omitempty" db:"id_thn_ajaran"`
	PeriodeAktif  int        `json:"periode_aktif" db:"tahun_ajaran"` // 1=active, 0=inactive
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

// SisterSemester from Sister API
type SisterSemester struct {
	ID   string `json:"id"`   // Format: "20251" = 2025 Semester 1
	Nama string `json:"nama"` // Format: "2025/2026 Ganjil"
}

// ==================== BATCH SYNC & METADATA ====================

// ReferensiMetadata represents metadata for a single referensi endpoint
type ReferensiMetadata struct {
	Key         string     `json:"key"`           // e.g., "agama", "negara"
	Name        string     `json:"name"`          // Display name: "Agama", "Negara"
	Description string     `json:"description"`   // Brief description
	TotalRecords int       `json:"total_records"` // Count in database
	LastSync    *time.Time `json:"last_sync"`     // Last sync timestamp
	SyncedBy    string     `json:"synced_by"`     // Last synced by user
	Available   bool       `json:"available"`     // Is endpoint available in Sister API
}

// BatchSyncRequest represents request to sync multiple endpoints
type BatchSyncRequest struct {
	Endpoints []string `json:"endpoints"` // Array of endpoint keys: ["agama", "negara", "semester"]
}

// BatchSyncResult represents result of a single endpoint sync
type BatchSyncResult struct {
	Endpoint     string `json:"endpoint"`      // Endpoint key
	Success      bool   `json:"success"`       // Sync success status
	TotalRecords int    `json:"total_records"` // Records synced
	Message      string `json:"message"`       // Result message
	Error        string `json:"error,omitempty"` // Error message if failed
}

// BatchSyncResponse represents response for batch sync operation
type BatchSyncResponse struct {
	TotalRequested int               `json:"total_requested"` // Total endpoints requested
	TotalSuccess   int               `json:"total_success"`   // Successfully synced
	TotalFailed    int               `json:"total_failed"`    // Failed syncs
	Results        []BatchSyncResult `json:"results"`         // Individual results
	Duration       string            `json:"duration"`        // Total duration
}

// ==================== NEW REFERENSI ENTITIES (29 NEW) ====================

// BidangStudi represents field of study reference data
type BidangStudi struct {
	IDBidangStudi int        `json:"id_bidang_studi" db:"id_bid_studi"`
	NamaBidangStudi string   `json:"nama_bidang_studi" db:"nm_bid_studi"`
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterBidangStudi struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// BidangUsaha represents business sector reference data
type BidangUsaha struct {
	IDBidangUsaha string     `json:"id_bidang_usaha" db:"id_bu"`
	NamaBidangUsaha string   `json:"nama_bidang_usaha" db:"nm_bu"`
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterBidangUsaha struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JabatanFungsional represents functional position reference data
type JabatanFungsional struct {
	IDJabatanFungsional int        `json:"id_jabatan_fungsional" db:"id_jabfung"`
	NamaJabatanFungsional string   `json:"nama_jabatan_fungsional" db:"nm_jabfung"`
	ExpiredDate         *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync            *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy            *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJabatanFungsional struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JabatanTugasTambahan represents additional task position reference data
type JabatanTugasTambahan struct {
	IDJabatanTugasTambahan int        `json:"id_jabatan_tugas_tambahan" db:"id_jab_tgs"`
	NamaJabatanTugasTambahan string   `json:"nama_jabatan_tugas_tambahan" db:"nm_jab_tgs"`
	ExpiredDate            *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync               *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy               *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJabatanTugasTambahan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisBahanAjar represents teaching material type reference data
type JenisBahanAjar struct {
	IDJenisBahanAjar int        `json:"id_jenis_bahan_ajar" db:"id_jns_bhn_ajar"`
	NamaJenisBahanAjar string   `json:"nama_jenis_bahan_ajar" db:"nm_jns_bhn_ajar"`
	ExpiredDate      *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync         *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy         *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisBahanAjar struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisBeasiswa represents scholarship type reference data
type JenisBeasiswa struct {
	IDJenisBeasiswa int        `json:"id_jenis_beasiswa" db:"id_jns_beasiswa"`
	NamaJenisBeasiswa string   `json:"nama_jenis_beasiswa" db:"nm_jns_beasiswa"`
	ExpiredDate     *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync        *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy        *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisBeasiswa struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisDiklat represents training type reference data
type JenisDiklat struct {
	IDJenisDiklat int        `json:"id_jenis_diklat" db:"id_jns_diklat"`
	NamaJenisDiklat string   `json:"nama_jenis_diklat" db:"nm_jns_diklat"`
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisDiklat struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisDokumen represents document type reference data
type JenisDokumen struct {
	IDJenisDokumen int        `json:"id_jenis_dokumen" db:"id_jns_dok"`
	NamaJenisDokumen string   `json:"nama_jenis_dokumen" db:"nm_jns_dok"`
	ExpiredDate    *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync       *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy       *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisDokumen struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisKeluar represents exit type reference data
type JenisKeluar struct {
	IDJenisKeluar string     `json:"id_jenis_keluar" db:"id_jns_keluar"`
	KeteranganKeluar string  `json:"keterangan_keluar" db:"ket_keluar"`
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisKeluar struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// JenisKepanitiaan represents committee type reference data
type JenisKepanitiaan struct {
	IDJenisKepanitiaan int        `json:"id_jenis_kepanitiaan" db:"id_jns_panitia"`
	NamaJenisKepanitiaan string   `json:"nama_jenis_kepanitiaan" db:"nm_jns_panitia"`
	ExpiredDate        *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync           *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy           *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisKepanitiaan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisKesejahteraan represents welfare type reference data
type JenisKesejahteraan struct {
	IDJenisKesejahteraan int        `json:"id_jenis_kesejahteraan" db:"id_jns_sejahtera"`
	NamaJenisKesejahteraan string   `json:"nama_jenis_kesejahteraan" db:"nm_jns_sejahtera"`
	ExpiredDate          *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync             *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy             *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisKesejahteraan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisPublikasi represents publication type reference data
type JenisPublikasi struct {
	IDJenisPublikasi int        `json:"id_jenis_publikasi" db:"id_jns_pub"`
	NamaJenisPublikasi string   `json:"nama_jenis_publikasi" db:"nm_jns_pub"`
	ExpiredDate      *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync         *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy         *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisPublikasi struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisTes represents test type reference data
type JenisTes struct {
	IDJenisTes int        `json:"id_jenis_tes" db:"id_jns_tes"`
	NamaJenisTes string   `json:"nama_jenis_tes" db:"nm_jns_tes"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy    *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisTes struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisTunjangan represents allowance type reference data
type JenisTunjangan struct {
	IDJenisTunjangan int        `json:"id_jenis_tunjangan" db:"id_jns_tunj"`
	NamaJenisTunjangan string   `json:"nama_jenis_tunjangan" db:"nm_jns_tunj"`
	ExpiredDate      *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync         *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy         *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisTunjangan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// MediaPublikasi represents publication media reference data
type MediaPublikasi struct {
	IDMediaPublikasi string     `json:"id_media_publikasi" db:"id_media_pub"`
	NamaMediaPublikasi string   `json:"nama_media_publikasi" db:"nm_media_pub"`
	ExpiredDate      *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync         *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy         *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterMediaPublikasi struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// SkimKegiatan represents activity scheme reference data
type SkimKegiatan struct {
	IDSkimKegiatan string     `json:"id_skim_kegiatan" db:"id_skim"`
	NamaSkimKegiatan string   `json:"nama_skim_kegiatan" db:"nm_skim"`
	ExpiredDate    *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync       *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy       *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterSkimKegiatan struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// StatusKepegawaian represents employment status reference data
type StatusKepegawaian struct {
	IDStatusKepegawaian int        `json:"id_status_kepegawaian" db:"id_stat_pegawai"`
	NamaStatusKepegawaian string   `json:"nama_status_kepegawaian" db:"nm_stat_pegawai"`
	ExpiredDate         *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync            *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy            *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterStatusKepegawaian struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// SumberGaji represents salary source reference data
type SumberGaji struct {
	IDSumberGaji int        `json:"id_sumber_gaji" db:"id_sumber_gaji"`
	NamaSumberGaji string   `json:"nama_sumber_gaji" db:"nm_sumber_gaji"`
	ExpiredDate  *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync     *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy     *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterSumberGaji struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// TingkatPenghargaan represents award level reference data
type TingkatPenghargaan struct {
	IDTingkatPenghargaan int        `json:"id_tingkat_penghargaan" db:"id_tkt_penghargaan"`
	NamaTingkatPenghargaan string   `json:"nama_tingkat_penghargaan" db:"nm_tkt_penghargaan"`
	ExpiredDate          *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync             *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy             *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterTingkatPenghargaan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// Wilayah represents region reference data
type Wilayah struct {
	IDWilayah string     `json:"id_wilayah" db:"id_wil"`
	NamaWilayah string   `json:"nama_wilayah" db:"nm_wil"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy    *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterWilayah struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// KategoriCapaianLuaran represents output achievement category reference data
type KategoriCapaianLuaran struct {
	IDKategoriCapaianLuaran int        `json:"id_kategori_capaian_luaran" db:"id_kat_capaian"`
	NamaKategoriCapaianLuaran string   `json:"nama_kategori_capaian_luaran" db:"nm_kat_capaian"`
	ExpiredDate             *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync                *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy                *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterKategoriCapaianLuaran struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// KategoriKegiatan represents activity category reference data
type KategoriKegiatan struct {
	IDKategoriKegiatan int        `json:"id_kategori_kegiatan" db:"id_katgiat"`
	NamaKategoriKegiatan string   `json:"nama_kategori_kegiatan" db:"nm_kat"`
	ExpiredDate        *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync           *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy           *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterKategoriKegiatan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// KelompokBidang represents field group reference data
type KelompokBidang struct {
	IDKelompokBidang   string     `json:"id_kelompok_bidang" db:"id_kel_bidang"`
	KodeKelompokBidang string     `json:"kode_kelompok_bidang" db:"kode_kel_bidang"`
	NamaKelompokBidang string     `json:"nama_kelompok_bidang" db:"nm_kel_bidang"`
	ExpiredDate        *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync           *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy           *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterKelompokBidang struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// LembagaSertifikasi represents certification institution reference data
type LembagaSertifikasi struct {
	IDLembagaSertifikasi int        `json:"id_lembaga_sertifikasi" db:"id_lemb_sert"`
	NamaLembagaSertifikasi string   `json:"nama_lembaga_sertifikasi" db:"nm_lemb_sert"`
	ExpiredDate          *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync             *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy             *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterLembagaSertifikasi struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// GolonganPangkat represents rank/grade reference data
type GolonganPangkat struct {
	IDGolonganPangkat int        `json:"id_golongan_pangkat" db:"id_pangkat_gol"`
	NamaPangkat       string     `json:"nama_pangkat" db:"nm_pangkat"`
	ExpiredDate       *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync          *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy          *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterGolonganPangkat struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// IkatanKerja represents work bond reference data
type IkatanKerja struct {
	IDIkatanKerja string     `json:"id_ikatan_kerja" db:"id_ikatan_kerja"`
	NamaIkatanKerja string   `json:"nama_ikatan_kerja" db:"nm_ikatan_kerja"`
	ExpiredDate   *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync      *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy      *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterIkatanKerja struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

// JenisPenghargaan represents award type reference data
type JenisPenghargaan struct {
	IDJenisPenghargaan int        `json:"id_jenis_penghargaan" db:"id_jns_penghargaan"`
	NamaJenisPenghargaan string   `json:"nama_jenis_penghargaan" db:"nm_jns_penghargaan"`
	ExpiredDate        *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync           *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy           *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisPenghargaan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// JenisPekerjaan represents occupation type reference data
type JenisPekerjaan struct {
	IDJenisPekerjaan int        `json:"id_jenis_pekerjaan" db:"id_pekerjaan"`
	NamaJenisPekerjaan string   `json:"nama_jenis_pekerjaan" db:"nm_pekerjaan"`
	ExpiredDate      *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync         *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy         *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterJenisPekerjaan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// BidangPekerjaan represents work field reference data
type BidangPekerjaan struct {
	IDBidangPekerjaan int        `json:"id_bidang_pekerjaan" db:"id_bid_kerja"`
	NamaBidangPekerjaan string   `json:"nama_bidang_pekerjaan" db:"nm_bid_kerja"`
	ExpiredDate       *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync          *time.Time `json:"last_sync,omitempty" db:"last_sync"`
	SyncedBy          *string    `json:"synced_by,omitempty" db:"synced_by"`
}

type SisterBidangPekerjaan struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// ==================== UNIT KERJA ====================

// UnitKerja represents unit kerja (SMS) reference data from pdrd.sms table
type UnitKerja struct {
	IDSMS             string     `json:"id_sms" db:"id_sms"`                        // Primary key (UUID)
	IDSatuanPendidikan string    `json:"id_sp" db:"id_sp"`                         // FK ke pdrd.satuan_pendidikan (UUID)
	IDJenisSMS        int        `json:"id_jenis_sms" db:"id_jns_sms"`             // FK ke ref.jenis_sms (1-8)
	NamaJenisSMS      string     `json:"nama_jenis_sms" db:"nama_jenis_sms"`       // Nama jenis SMS (from JOIN)
	NamaLembaga       string     `json:"nama_lembaga" db:"nm_lemb"`                // Nama unit kerja
	KodeProdi         *string    `json:"kode_prodi,omitempty" db:"kode_prodi"`     // Kode unit
	StatusProdi       *string    `json:"status_prodi,omitempty" db:"stat_prodi"`   // A=Aktif, B=Alih Bentuk, K=Alih Kelola, N=Non Aktif, H=Dihapus
	TanggalBerdiri    *time.Time `json:"tanggal_berdiri,omitempty" db:"tgl_berdiri"` // Tanggal berdiri
	SKPenyelenggara   *string    `json:"sk_penyelenggara,omitempty" db:"sk_selenggara"` // SK penyelenggara
	TanggalSK         *time.Time `json:"tanggal_sk,omitempty" db:"tgl_sk_selenggara"` // Tanggal SK
	TMT               *time.Time `json:"tmt,omitempty" db:"tmt_sk_selenggara"`     // TMT SK
	TST               *time.Time `json:"tst,omitempty" db:"tst_sk_selenggara"`     // TST SK
	SKSLulus          *int       `json:"sks_lulus,omitempty" db:"sks_lulus"`       // SKS lulus
	GelarLulusan      *string    `json:"gelar_lulusan,omitempty" db:"gelar_lulusan"` // Gelar lulusan
	IDJenjangDidik    *int       `json:"id_jenjang_didik,omitempty" db:"id_jenj_didik"` // FK ke ref.jenjang_pendidikan
	IDWilayah         *string    `json:"id_wilayah,omitempty" db:"id_wil"`         // FK ke ref.wilayah
	IDFakultasUnila   *string    `json:"id_fakultas_unila,omitempty" db:"id_fak_unila"` // FK ke pdrd.sms (fakultas)
	IDJurusanUnila    *string    `json:"id_jurusan_unila,omitempty" db:"id_jur_unila"` // FK ke pdrd.sms (jurusan)
	IDJurusan         *string    `json:"id_jurusan,omitempty" db:"id_jur"`         // Copy dari id_jur_unila
	IDIndukSMS        *string    `json:"id_induk_sms,omitempty" db:"id_induk_sms"` // Parent unit

	// Audit fields
	CreateDate time.Time  `json:"-" db:"create_date"`  // Timestamp insert (internal)
	IDCreator  string     `json:"-" db:"id_creator"`    // UUID creator (internal)
	LastUpdate time.Time  `json:"-" db:"last_update"`  // Timestamp update (internal)
	IDUpdater  *string    `json:"-" db:"id_updater"` // UUID updater (internal)
	SoftDelete int        `json:"-" db:"soft_delete"`  // Default 0 (internal)
	LastSync   *time.Time `json:"last_sync,omitempty" db:"last_sync"` // Timestamp sync
}

// SisterUnitKerja represents unit kerja list response from Sister API
// GET /referensi/unit_kerja?id_perguruan_tinggi={id}
type SisterUnitKerja struct {
	ID          string `json:"id"`            // UUID
	Nama        string `json:"nama"`          // Nama unit kerja
	IDJenisUnit int    `json:"id_jenis_unit"` // 1-8 (Fakultas, Jurusan, Prodi, dll)
}

// SisterUnitKerjaDetail represents unit kerja detail response from Sister API
// GET /referensi/detail_unit_kerja?id_unit_kerja={id}
type SisterUnitKerjaDetail struct {
	ID                   string    `json:"id"`                          // UUID
	KodeUnit             string    `json:"kode_unit"`                   // Kode unit
	Nama                 string    `json:"nama"`                        // Nama unit
	IDJenisUnit          int       `json:"id_jenis_unit"`               // 1-8
	IDIndukUnit          *string   `json:"id_induk_unit"`               // Parent unit ID (nullable)
	StatusUnit           string    `json:"status_unit"`                 // A/B/K/N/H
	TanggalBerdiri       string    `json:"tanggal_berdiri"`             // Date string
	SKPenyelenggara      string    `json:"sk_penyelenggara"`            // Nomor SK
	TanggalSKPenyelenggara string  `json:"tanggal_sk_penyelenggara"`   // Date string
	TMTSK                string    `json:"terhitung_mulai_tanggal_penyelenggara"` // Date string
	TSTSK                *string   `json:"terhitung_sampai_tanggal_penyelenggara"` // Date string (nullable)
	SKSLulus             *int      `json:"sks_lulus"`                   // SKS lulus (nullable)
	GelarLulusan         *string   `json:"gelar_lulusan"`               // Gelar (nullable)
	WaktuDataUpdate      string          `json:"waktu_data_update"`    // Timestamp
	Wilayah              []interface{}   `json:"wilayah"`              // Array wilayah (ignored, can be objects)
	Jurusan              []interface{}   `json:"jurusan"`              // Array jurusan (ignored, can be objects)
}

// UnitKerjaSyncResult represents result of syncing unit kerja
type UnitKerjaSyncResult struct {
	IDSMS   string `json:"id_sms"`
	Nama    string `json:"nama"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// BatchUnitKerjaSyncResult represents batch sync result for unit kerja
type BatchUnitKerjaSyncResult struct {
	TotalProcessed int                   `json:"total_processed"`
	TotalSuccess   int                   `json:"total_success"`
	TotalFailed    int                   `json:"total_failed"`
	Duration       string                `json:"duration"`
	Results        []UnitKerjaSyncResult `json:"results,omitempty"`
	SyncedBy       string                `json:"synced_by"`
}
