package simpedam

import (
	"encoding/json"
	"strconv"
)

// FlexibleInt handles JSON numbers that can be either string or int
type FlexibleInt int

func (fi *FlexibleInt) UnmarshalJSON(data []byte) error {
	var intVal int
	if err := json.Unmarshal(data, &intVal); err == nil {
		*fi = FlexibleInt(intVal)
		return nil
	}

	var strVal string
	if err := json.Unmarshal(data, &strVal); err == nil {
		if strVal == "" || strVal == "null" {
			*fi = 0
			return nil
		}
		intVal, err := strconv.Atoi(strVal)
		if err != nil {
			return err
		}
		*fi = FlexibleInt(intVal)
		return nil
	}

	*fi = 0
	return nil
}

// FlexibleFloat handles JSON numbers that can be either string or float
type FlexibleFloat float64

func (ff *FlexibleFloat) UnmarshalJSON(data []byte) error {
	var floatVal float64
	if err := json.Unmarshal(data, &floatVal); err == nil {
		*ff = FlexibleFloat(floatVal)
		return nil
	}

	var strVal string
	if err := json.Unmarshal(data, &strVal); err == nil {
		if strVal == "" || strVal == "null" {
			*ff = 0
			return nil
		}
		floatVal, err := strconv.ParseFloat(strVal, 64)
		if err != nil {
			return err
		}
		*ff = FlexibleFloat(floatVal)
		return nil
	}

	*ff = 0
	return nil
}

// ========================================
// JSON Request/Response Structures
// ========================================

// BaseRequest represents common request structure for SIMPEDAM REST API
type BaseRequest struct {
	Service  string `json:"service"`
	Token    string `json:"token,omitempty"`
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	Filter   string `json:"filter,omitempty"`
	Order    string `json:"order,omitempty"`
	Limit    string `json:"limit,omitempty"`
	Offset   string `json:"offset,omitempty"`
}

// BaseResponse represents common response structure from SIMPEDAM REST API
type BaseResponse struct {
	ErrorCode string          `json:"error_code"`
	ErrorDesc string          `json:"error_desc"`
	Data      json.RawMessage `json:"data"`
}

// TokenData represents token data in GetToken response
type TokenData struct {
	Token string `json:"token"`
}

// DaftarUKTItem represents a single UKT class from DaftarUKT response
// Field names match SIMPEDAM's REST API schema
type DaftarUKTItem struct {
	IDUkt            string        `json:"id_ukt"`
	Tahun            FlexibleInt   `json:"tahun"`
	IDProdi          string        `json:"id_prodi"`
	NamaProgramStudi string        `json:"nama_program_studi"`
	KodeFak          string        `json:"kode_fak"`
	NamaFakultas     string        `json:"nama_fakultas"`
	KodeKelas        string        `json:"kode_kelas"`
	NamaKelas        string        `json:"nama_kelas"`
	Nominal          FlexibleFloat `json:"nominal"`
	KodeDikti        *string       `json:"kode_dikti"`
	KodeStrata       FlexibleInt   `json:"kode_strata"`
}

// MasterBiayaMahasiswaItem represents student payment data
// Field names match actual SIMPEDAM REST API response
type MasterBiayaMahasiswaItem struct {
	NPM           string             `json:"npm"`
	NamaMahasiswa string             `json:"nama"`                    // API returns "nama"
	IDProdi       string             `json:"id_prodi"`
	NamaProdi     string             `json:"fk_nama_program_studi"`   // API returns "fk_nama_program_studi"
	KodeFakultas  string             `json:"fk_kode_fak"`             // API returns "fk_kode_fak"
	NamaFakultas  string             `json:"fk_nama_fakultas"`        // API returns "fk_nama_fakultas"
	KodeStrata    FlexibleInt        `json:"kode_strata"`
	KodeKelas     string             `json:"fk_kode_kelas_ukt"`       // API returns "fk_kode_kelas_ukt"
	NamaKelas     string             `json:"fk_kelas_ukt"`            // API returns "fk_kelas_ukt"
	NominalUKT    FlexibleFloat      `json:"fk_nominal_biaya"`        // API returns "fk_nominal_biaya"
	TahunMasuk    FlexibleInt        `json:"tahun_masuk"`
	RiwayatBayar  []RiwayatBayarItem `json:"riwayat"`                 // API returns "riwayat" NOT "riwayat_bayar"
}

// RiwayatBayarItem represents a single payment history
// Field names match actual SIMPEDAM REST API response
type RiwayatBayarItem struct {
	TahunAkd         string        `json:"tahun_akd"`               // e.g. "2015/2016"
	GanjilGenap      string        `json:"ganjil_genap"`            // "1" or "2"
	IDSemester       string        `json:"id_semester"`             // e.g. "15" (semester ke-15)
	NamaSemester     string        `json:"fk_nama_semester"`        // API returns "fk_nama_semester"
	TotalTagihan     FlexibleFloat `json:"total_tagihan"`
	NominalUKT       FlexibleFloat `json:"nominal_ukt_spp"`         // API returns "nominal_ukt_spp"
	JumlahSPI        FlexibleFloat `json:"jumlah_spi"`
	JumlahDenda      FlexibleFloat `json:"jumlah_denda"`
	FlagBayar        FlexibleInt   `json:"flag_bayar"`              // 0=belum, 1=sudah
	KeteranganBayar  string        `json:"fk_flag_bayar"`           // API returns "fk_flag_bayar" ("Sudah Bayar")
	FlagKeringanan   FlexibleInt   `json:"flag_keringanan"`
	JumlahKeringanan FlexibleFloat `json:"jumlah_keringanan"`
}

// KelasUKTItem represents a UKT class master
type KelasUKTItem struct {
	IDKelasUKT string        `json:"id_kelas_ukt"`
	KodeKelas  string        `json:"kode_kelas"`
	NamaKelas  string        `json:"nama_kelas"`
	Nominal    FlexibleFloat `json:"nominal"`
	Tahun      FlexibleInt   `json:"tahun"`
}

// ListTagihanItem represents a single tagihan (bill) from GetListTagihan response
// Field names match actual SIMPEDAM REST API response
type ListTagihanItem struct {
	IDTagihan       string        `json:"id_tagihan"`
	NomorPeserta    string        `json:"nomor_peserta"`
	NPM             string        `json:"npm"`
	NamaMahasiswa   string        `json:"nama_mahasiswa"`
	TahunAkd        string        `json:"tahun_akd"`
	GanjilGenap     string        `json:"ganjil_genap"`
	JenisTagihan    string        `json:"jenis_tagihan"`
	NamaTagihan     string        `json:"nama_tagihan"`
	NominalTagihan  FlexibleFloat `json:"nominal_tagihan"`
	NominalBayar    FlexibleFloat `json:"nominal_bayar"`
	SisaTagihan     FlexibleFloat `json:"sisa_tagihan"`
	StatusBayar     string        `json:"status_bayar"`
	TglJatuhTempo   string        `json:"tgl_jatuh_tempo"`
	TglBayar        *string       `json:"tgl_bayar"`
	Keterangan      string        `json:"keterangan"`
	// Additional fields from actual API response
	TotalTagihan    FlexibleFloat `json:"total_tagihan"`
	NominalUKT      FlexibleFloat `json:"nominal_ukt_spp"`
	BillReference   string        `json:"bill_reference"`
}
