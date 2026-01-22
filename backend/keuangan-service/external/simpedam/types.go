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

// TokenResponse represents GetToken response
type TokenResponse struct {
	Token string `json:"token"`
}

// DaftarUKTItem represents a single UKT class from DaftarUKT response
type DaftarUKTItem struct {
	IDDaftarUKT   string        `json:"id_daftar_ukt"`
	Tahun         FlexibleInt   `json:"tahun"`
	IDProdi       string        `json:"id_prodi"`
	NamaProdi     string        `json:"nama_prodi"`
	KodeFakultas  string        `json:"kode_fakultas"`
	NamaFakultas  string        `json:"nama_fakultas"`
	KodeKelas     string        `json:"kode_kelas"`
	NamaKelas     string        `json:"nama_kelas"`
	Nominal       FlexibleFloat `json:"nominal"`
	KodeDikti     *string       `json:"kode_dikti"`
	KodeStrata    FlexibleInt   `json:"kode_strata"`
}

// MasterBiayaMahasiswaItem represents student payment data
type MasterBiayaMahasiswaItem struct {
	NPM            string        `json:"npm"`
	NamaMahasiswa  string        `json:"nama_mahasiswa"`
	IDProdi        string        `json:"id_prodi"`
	NamaProdi      string        `json:"nama_prodi"`
	KodeFakultas   string        `json:"kode_fakultas"`
	NamaFakultas   string        `json:"nama_fakultas"`
	KodeStrata     FlexibleInt   `json:"kode_strata"`
	KodeKelas      string        `json:"kode_kelas"`
	NamaKelas      string        `json:"nama_kelas"`
	NominalUKT     FlexibleFloat `json:"nominal_ukt"`
	TahunMasuk     FlexibleInt   `json:"tahun_masuk"`
	RiwayatBayar   []RiwayatBayarItem `json:"riwayat_bayar"`
}

// RiwayatBayarItem represents a single payment history
type RiwayatBayarItem struct {
	IDSemester       string        `json:"id_semester"`
	NamaSemester     string        `json:"nama_semester"`
	TotalTagihan     FlexibleFloat `json:"total_tagihan"`
	NominalUKT       FlexibleFloat `json:"nominal_ukt"`
	JumlahSPI        FlexibleFloat `json:"jumlah_spi"`
	JumlahDenda      FlexibleFloat `json:"jumlah_denda"`
	FlagBayar        FlexibleInt   `json:"flag_bayar"`
	KeteranganBayar  string        `json:"keterangan_bayar"`
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

// SoapEnvelope represents SOAP envelope structure
type SoapEnvelope struct {
	Body SoapBody `xml:"Body"`
}

// SoapBody represents SOAP body
type SoapBody struct {
	GetTokenResponse           *GetTokenResponse           `xml:"GetTokenResponse,omitempty"`
	DaftarUKTResponse          *DaftarUKTResponse          `xml:"DaftarUKTResponse,omitempty"`
	MasterBiayaMahasiswaResponse *MasterBiayaMahasiswaResponse `xml:"MasterBiayaMahasiswaResponse,omitempty"`
	KelasUKTResponse           *KelasUKTResponse           `xml:"KelasUKTResponse,omitempty"`
	Fault                      *SoapFault                  `xml:"Fault,omitempty"`
}

// GetTokenResponse represents GetToken SOAP response
type GetTokenResponse struct {
	Return string `xml:"return"`
}

// DaftarUKTResponse represents DaftarUKT SOAP response
type DaftarUKTResponse struct {
	Return string `xml:"return"`
}

// MasterBiayaMahasiswaResponse represents MasterBiayaMahasiswa SOAP response
type MasterBiayaMahasiswaResponse struct {
	Return string `xml:"return"`
}

// KelasUKTResponse represents KelasUKT SOAP response
type KelasUKTResponse struct {
	Return string `xml:"return"`
}

// SoapFault represents SOAP fault
type SoapFault struct {
	FaultCode   string `xml:"faultcode"`
	FaultString string `xml:"faultstring"`
}

// APIResponse represents general API response from SIMPEDAM
type APIResponse struct {
	ErrorCode int         `json:"error_code"`
	ErrorDesc string      `json:"error_desc"`
	Data      interface{} `json:"data"`
}
