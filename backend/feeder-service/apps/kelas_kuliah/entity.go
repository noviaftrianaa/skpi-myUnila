package kelas_kuliah

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

// KelasKuliah - Entity for kelas kuliah (pdrd.kelas_kuliah)
type KelasKuliah struct {
	// Primary Key
	IDKls string `json:"id_kls" db:"id_kls"`

	// Foreign Keys
	IDSmt string `json:"id_smt" db:"id_smt"`
	IDSMS string `json:"id_sms" db:"id_sms"`
	IDMk  string `json:"id_mk" db:"id_mk"`

	// SKS Fields
	SksMk      *float64 `json:"sks_mk" db:"sks_mk"`
	SksTm      *float64 `json:"sks_tm" db:"sks_tm"`
	SksPrak    *float64 `json:"sks_prak" db:"sks_prak"`
	SksPrakLap *float64 `json:"sks_prak_lap" db:"sks_prak_lap"`
	SksSim     *float64 `json:"sks_sim" db:"sks_sim"`

	// Class Information
	NmKls          string  `json:"nm_kls" db:"nm_kls"`
	BahasanCase    *string `json:"bahasan_case" db:"bahasan_case"`
	ASelenggaraPditt int   `json:"a_selenggara_pditt" db:"a_selenggara_pditt"`
	APenggunaPditt   int   `json:"a_pengguna_pditt" db:"a_pengguna_pditt"`
	KuotaPditt       int   `json:"kuota_pditt" db:"kuota_pditt"`
	KodeVclass     *string `json:"kode_vclass" db:"kode_vclass"`
	UrlVclass      *string `json:"url_vclass" db:"url_vclass"`
	LingkupKelas   *int    `json:"lingkup_kelas" db:"lingkup_kelas"`
	ModeKuliah     *string `json:"mode_kuliah" db:"mode_kuliah"`

	// Audit Fields
	CreateDate time.Time `json:"create_date" db:"create_date"`
	IDCreator  string    `json:"id_creator" db:"id_creator"`
	LastUpdate time.Time `json:"last_update" db:"last_update"`
	IDUpdater  *string   `json:"id_updater" db:"id_updater"`
	SoftDelete int       `json:"soft_delete" db:"soft_delete"`
	LastSync   time.Time `json:"last_sync" db:"last_sync"`
}

// AktAjarDosen - Entity for aktivitas mengajar dosen (pdrd.akt_ajar_dosen)
type AktAjarDosen struct {
	// Primary Key
	IDAjar string `json:"id_ajar" db:"id_ajar"`

	// Foreign Keys
	IDRegPtk     string  `json:"id_reg_ptk" db:"id_reg_ptk"`
	IDSubst      *string `json:"id_subst" db:"id_subst"`
	IDKatgiat    int     `json:"id_katgiat" db:"id_katgiat"`
	KatgiatAjarIDKatgiat int `json:"katgiat_ajar_id_katgiat" db:"katgiat_ajar_id_katgiat"`
	IDJnsEval    int     `json:"id_jns_eval" db:"id_jns_eval"`
	IDKls        string  `json:"id_kls" db:"id_kls"`

	// SKS Fields
	SksSubstTot    float64 `json:"sks_subst_tot" db:"sks_subst_tot"`
	SksTmSubst     float64 `json:"sks_tm_subst" db:"sks_tm_subst"`
	SksPrakSubst   float64 `json:"sks_prak_subst" db:"sks_prak_subst"`
	SksPrakLapSubst float64 `json:"sks_prak_lap_subst" db:"sks_prak_lap_subst"`
	SksSimSubst    float64 `json:"sks_sim_subst" db:"sks_sim_subst"`

	// Teaching Info
	JmlTmRenc int  `json:"jml_tm_renc" db:"jml_tm_renc"`
	JmlTmReal *int `json:"jml_tm_real" db:"jml_tm_real"`
	JmlMhs    *int `json:"jml_mhs" db:"jml_mhs"`

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

// FeederKelasKuliahData - Response from GetListKelasKuliah
type FeederKelasKuliahData struct {
	IDKelasKuliah     string    `json:"id_kelas_kuliah"`
	IDProdi           *string   `json:"id_prodi"`
	NamaProgramStudi  *string   `json:"nama_program_studi"`
	IDSemester        *string   `json:"id_semester"`
	NamaSemester      *string   `json:"nama_semester"`
	IDMatkul          *string   `json:"id_matkul"`
	KodeMataKuliah    *string   `json:"kode_mata_kuliah"`
	NamaMataKuliah    *string   `json:"nama_mata_kuliah"`
	NamaKelasKuliah   *string   `json:"nama_kelas_kuliah"`
	SKS               FlexFloat `json:"sks"`
	IDDosen           *string   `json:"id_dosen"`
	NamaDosen         *string   `json:"nama_dosen"`
	JumlahMahasiswa   FlexInt   `json:"jumlah_mahasiswa"`
	ApaUntukPditt     FlexInt   `json:"apa_untuk_pditt"`
}

// FeederDosenPengajarData - Response from GetDosenPengajarKelasKuliah
type FeederDosenPengajarData struct {
	IDAktivitasMengajar    string    `json:"id_aktivitas_mengajar"`
	IDRegistrasiDosen      *string   `json:"id_registrasi_dosen"`
	IDDosen                *string   `json:"id_dosen"`
	NIDN                   *string   `json:"nidn"`
	NUPTK                  *string   `json:"nuptk"`
	NamaDosen              *string   `json:"nama_dosen"`
	IDKelasKuliah          *string   `json:"id_kelas_kuliah"`
	NamaKelasKuliah        *string   `json:"nama_kelas_kuliah"`
	IDSubstansi            *string   `json:"id_substansi"`
	SksSubstansiTotal      FlexFloat `json:"sks_substansi_total"`
	RencanaMingguPertemuan FlexInt   `json:"rencana_minggu_pertemuan"`
	RealisasiMingguPertemuan FlexInt `json:"realisasi_minggu_pertemuan"`
	IDJenisEvaluasi        FlexInt   `json:"id_jenis_evaluasi"`
	NamaJenisEvaluasi      *string   `json:"nama_jenis_evaluasi"`
	IDProdi                *string   `json:"id_prodi"`
	IDSemester             *string   `json:"id_semester"`
}

// =============================================================================
// LIST & PAGINATION DTOs
// =============================================================================

// KelasKuliahListItem - Item for list view with additional info
type KelasKuliahListItem struct {
	IDKls            string     `db:"id_kls" json:"id_kls"`
	NmKls            string     `db:"nm_kls" json:"nm_kls"`
	IDSemester       string     `db:"id_semester" json:"id_semester"`
	NamaSemester     *string    `db:"nama_semester" json:"nama_semester"`
	IDProdi          string     `db:"id_prodi" json:"id_prodi"`
	NamaProdi        *string    `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang      *string    `db:"nama_jenjang" json:"nama_jenjang"`
	KodeMatkul       *string    `db:"kode_matkul" json:"kode_matkul"`
	NamaMatkul       *string    `db:"nama_matkul" json:"nama_matkul"`
	SksMk            *float64   `db:"sks_mk" json:"sks_mk"`
	JumlahDosen      int        `db:"jumlah_dosen" json:"jumlah_dosen"`
	NamaDosen        *string    `db:"nama_dosen" json:"nama_dosen"`
	LastSync         time.Time  `db:"last_sync" json:"last_sync"`
}

// KelasKuliahListResult - Paginated list result
type KelasKuliahListResult struct {
	Data       []*KelasKuliahListItem `json:"data"`
	Total      int                    `json:"total"`
	Page       int                    `json:"page"`
	Limit      int                    `json:"limit"`
	TotalPages int                    `json:"total_pages"`
}

// DosenPengajarListItem - Item for dosen pengajar list
type DosenPengajarListItem struct {
	IDAjar           string    `db:"id_ajar" json:"id_ajar"`
	IDKls            string    `db:"id_kls" json:"id_kls"`
	NmKls            *string   `db:"nm_kls" json:"nm_kls"`
	IDRegPtk         string    `db:"id_reg_ptk" json:"id_reg_ptk"`
	NamaDosen        *string   `db:"nama_dosen" json:"nama_dosen"`
	NIDN             *string   `db:"nidn" json:"nidn"`
	SksSubstTot      float64   `db:"sks_subst_tot" json:"sks_subst_tot"`
	JmlTmRenc        int       `db:"jml_tm_renc" json:"jml_tm_renc"`
	JmlTmReal        *int      `db:"jml_tm_real" json:"jml_tm_real"`
	NamaJenisEvaluasi *string  `db:"nama_jenis_evaluasi" json:"nama_jenis_evaluasi"`
	LastSync         time.Time `db:"last_sync" json:"last_sync"`
}

// =============================================================================
// STATS DTOs
// =============================================================================

// KelasKuliahStats - Statistics for kelas kuliah
type KelasKuliahStats struct {
	TotalKelas   int        `json:"total_kelas" db:"total_kelas"`
	TotalDosen   int        `json:"total_dosen" db:"total_dosen"`
	TotalProdi   int        `json:"total_prodi" db:"total_prodi"`
	TotalMatkul  int        `json:"total_matkul" db:"total_matkul"`
	LastSync     *time.Time `json:"last_sync" db:"last_sync"`
}

// =============================================================================
// SYNC RESULT DTOs
// =============================================================================

// KelasKuliahSyncResult - Result for single kelas sync
type KelasKuliahSyncResult struct {
	IDKls        string `json:"id_kls"`
	NmKls        string `json:"nm_kls"`
	JumlahDosen  int    `json:"jumlah_dosen"`
	Success      bool   `json:"success"`
	Error        string `json:"error,omitempty"`
}

// BatchKelasKuliahSyncResult - Result for batch sync
type BatchKelasKuliahSyncResult struct {
	TotalKelas     int                      `json:"total_kelas"`
	TotalDosen     int                      `json:"total_dosen"`
	TotalSuccess   int                      `json:"total_success"`
	TotalFailed    int                      `json:"total_failed"`
	Duration       string                   `json:"duration"`
	Results        []KelasKuliahSyncResult  `json:"results,omitempty"`
	SyncedBy       string                   `json:"synced_by"`
	Filter         *SyncFilter              `json:"filter,omitempty"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	IDSemester []string `json:"id_semester"` // Optional - format: ["20251", "20241"], support multiple semester
	IDProdi    *string  `json:"id_prodi,omitempty"` // Optional
	ForceSync  bool     `json:"force_sync,omitempty"` // Optional
}
