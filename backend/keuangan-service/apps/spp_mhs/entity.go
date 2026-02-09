package spp_mhs

import (
	"time"

	"github.com/google/uuid"
)

// SppMhs represents student SPP/UKT payment data
type SppMhs struct {
	IDSppMhs       uuid.UUID  `json:"id_spp_mhs" db:"id_spp_mhs"`
	IDKelasUKT     *uuid.UUID `json:"id_kelas_ukt,omitempty" db:"id_kelas_ukt"`
	IDSmt          string     `json:"id_smt" db:"id_smt"`
	IDDaftarUKT    *uuid.UUID `json:"id_daftar_ukt,omitempty" db:"id_daftar_ukt"`
	IDRegPd        uuid.UUID  `json:"id_reg_pd" db:"id_reg_pd"`
	TglBayar       time.Time  `json:"tgl_bayar" db:"tgl_bayar"`
	Nominal        float64    `json:"nominal" db:"nominal"`

	// Tagihan detail (from SIMPEDAM GetListTagihan)
	NmSmt          *string    `json:"nm_smt,omitempty" db:"nm_smt"`
	TotalTagihan   float64    `json:"total_tagihan" db:"total_tagihan"`
	JumlahSPI      float64    `json:"jumlah_spi" db:"jumlah_spi"`
	JumlahDenda    float64    `json:"jumlah_denda" db:"jumlah_denda"`
	JumlahLainnya  float64    `json:"jumlah_lainnya" db:"jumlah_lainnya"`
	SisaTagihan    float64    `json:"sisa_tagihan" db:"sisa_tagihan"`
	ACicil         int        `json:"a_cicil" db:"a_cicil"`
	CicilanKe      int        `json:"cicilan_ke" db:"cicilan_ke"`

	// Reference & Status
	KodePembayaran string     `json:"kode_pembayaran" db:"kode_pembayaran"`
	NomorPin       *string    `json:"nomor_pin,omitempty" db:"nomor_pin"`
	KodeAkses      *string    `json:"kode_akses,omitempty" db:"kode_akses"`
	BillRef        *string    `json:"bill_ref,omitempty" db:"bill_ref"`
	FlagBy         string     `json:"flag_by" db:"flag_by"`
	Ket            *string    `json:"ket,omitempty" db:"ket"`

	// Audit fields
	CreateDate time.Time  `json:"create_date" db:"create_date"`
	IDCreator  uuid.UUID  `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time  `json:"last_update" db:"last_update"`
	IDUpdater  *uuid.UUID `json:"id_updater,omitempty" db:"id_updater"`
	SoftDelete int        `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time  `json:"last_sync" db:"last_sync"`
}

// SppMhsDetail represents student SPP with additional details
type SppMhsDetail struct {
	SppMhs
	NPM           string  `json:"npm" db:"npm"`
	NamaMahasiswa string  `json:"nama_mahasiswa" db:"nama_mahasiswa"`
	NamaProdi     string  `json:"nama_prodi" db:"nama_prodi"`
	NamaKelasUKT  *string `json:"nama_kelas_ukt,omitempty" db:"nama_kelas_ukt"`
	NominalUKT    *float64 `json:"nominal_ukt,omitempty" db:"nominal_ukt"`
}

// SppMhsListResult represents paginated result
type SppMhsListResult struct {
	Data       []SppMhsDetail `json:"data"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}

// MahasiswaPaymentSummary represents student payment summary
type MahasiswaPaymentSummary struct {
	NPM             string        `json:"npm"`
	NamaMahasiswa   string        `json:"nama_mahasiswa"`
	NamaProdi       string        `json:"nama_prodi"`
	KelasUKT        string        `json:"kelas_ukt"`
	NominalUKT      float64       `json:"nominal_ukt"`
	TotalTagihan    float64       `json:"total_tagihan"`
	TotalBayar      float64       `json:"total_bayar"`
	Tunggakan       float64       `json:"tunggakan"`
	RiwayatBayar    []RiwayatBayar `json:"riwayat_bayar"`
}

// RiwayatBayar represents payment history
type RiwayatBayar struct {
	IDSemester       string    `json:"id_semester"`
	NamaSemester     string    `json:"nama_semester"`
	TotalTagihan     float64   `json:"total_tagihan"`
	NominalUKT       float64   `json:"nominal_ukt"`
	JumlahSPI        float64   `json:"jumlah_spi"`
	JumlahDenda      float64   `json:"jumlah_denda"`
	FlagBayar        bool      `json:"flag_bayar"`
	KeteranganBayar  string    `json:"keterangan_bayar"`
	FlagKeringanan   bool      `json:"flag_keringanan"`
	JumlahKeringanan float64   `json:"jumlah_keringanan"`
	TglBayar         *time.Time `json:"tgl_bayar,omitempty"`
}

// RegPdMapping represents npm to id_reg_pd mapping
type RegPdMapping struct {
	NPM     string    `json:"npm" db:"nipd"`
	IDRegPd uuid.UUID `json:"id_reg_pd" db:"id_reg_pd"`
	IDPD    uuid.UUID `json:"id_pd" db:"id_pd"`
}

// SyncFilter represents filter options for sync
type SyncFilter struct {
	IDSmt       *string `json:"id_smt,omitempty"`       // e.g. "20252" (preferred input)
	NPM         *string `json:"npm,omitempty"`
	TahunAkd    *string `json:"tahun_akd,omitempty"`    // e.g. "2025/2026" (computed from id_smt)
	GanjilGenap *string `json:"ganjil_genap,omitempty"` // "1" = ganjil, "2" = genap (computed from id_smt)
	ForceSync   bool    `json:"force_sync"`
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
	APIMethod      string `json:"api_method"`
}

// SppMhsStats represents statistics for SPP Mahasiswa
type SppMhsStats struct {
	TotalSppMhs    int     `json:"total_spp_mhs"`
	TotalMahasiswa int     `json:"total_mahasiswa"`
	TotalBayar     float64 `json:"total_bayar"`
	LastSync       *string `json:"last_sync,omitempty"`
}

// SemesterOption represents semester dropdown option
type SemesterOption struct {
	IDSmt  string `json:"id_smt" db:"id_smt"`
	NmSmt  string `json:"nm_smt" db:"nm_smt"`
}
