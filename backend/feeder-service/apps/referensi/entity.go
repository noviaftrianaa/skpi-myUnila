package referensi

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

// FlexibleInt handles both string and int values from JSON
type FlexibleInt int

func (fi *FlexibleInt) UnmarshalJSON(b []byte) error {
	var i int
	if err := json.Unmarshal(b, &i); err == nil {
		*fi = FlexibleInt(i)
		return nil
	}

	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	if s == "" {
		*fi = 0
		return nil
	}

	i, err := strconv.Atoi(s)
	if err != nil {
		return fmt.Errorf("cannot convert %q to int: %w", s, err)
	}

	*fi = FlexibleInt(i)
	return nil
}

// ReferensiEndpoint defines a referensi endpoint configuration
type ReferensiEndpoint struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TableName   string `json:"table_name"`   // Target table name in database
	FeederAct   string `json:"feeder_act"`   // Feeder API action
	PKField     string `json:"pk_field"`     // Primary key field name
}

// GetReferensiEndpoints returns list of available referensi endpoints
func GetReferensiEndpoints() []ReferensiEndpoint {
	return []ReferensiEndpoint{
		{Key: "jalur_masuk", Name: "Jalur Masuk", Description: "Data jalur masuk mahasiswa", TableName: "ref.jalur_daftar", FeederAct: "GetJalurMasuk", PKField: "id_jalur_daftar"},
		{Key: "jenis_evaluasi", Name: "Jenis Evaluasi", Description: "Data jenis evaluasi perkuliahan", TableName: "ref.jenis_evaluasi", FeederAct: "GetJenisEvaluasi", PKField: "id_jns_eval"},
		{Key: "jenis_pendaftaran", Name: "Jenis Pendaftaran", Description: "Data jenis pendaftaran mahasiswa", TableName: "ref.jenis_pendaftaran", FeederAct: "GetJenisPendaftaran", PKField: "id_jns_daftar"},
		{Key: "jenis_keluar", Name: "Jenis Keluar", Description: "Data jenis keluar mahasiswa", TableName: "ref.jenis_keluar", FeederAct: "GetJenisKeluar", PKField: "id_jns_keluar"},
		{Key: "status_mahasiswa", Name: "Status Mahasiswa", Description: "Data status mahasiswa", TableName: "ref.status_mahasiswa", FeederAct: "GetStatusMahasiswa", PKField: "id_stat_mhs"},
		{Key: "tahun_ajaran", Name: "Tahun Ajaran", Description: "Data tahun ajaran", TableName: "ref.tahun_ajaran", FeederAct: "GetTahunAjaran", PKField: "id_thn_ajaran"},
		{Key: "semester", Name: "Semester", Description: "Data semester", TableName: "ref.semester", FeederAct: "GetSemester", PKField: "id_smt"},
		{Key: "jenis_prestasi", Name: "Jenis Prestasi", Description: "Data jenis prestasi mahasiswa", TableName: "ref.jenis_prestasi", FeederAct: "GetJenisPrestasi", PKField: "id_jenis_prestasi"},
		{Key: "tingkat_prestasi", Name: "Tingkat Prestasi", Description: "Data tingkat prestasi", TableName: "ref.tingkat_prestasi", FeederAct: "GetTingkatPrestasi", PKField: "id_tkt_prestasi"},
		{Key: "kebutuhan_khusus", Name: "Kebutuhan Khusus", Description: "Data kebutuhan khusus mahasiswa", TableName: "ref.kebutuhan_khusus", FeederAct: "GetKebutuhanKhusus", PKField: "id_kk"},
		{Key: "wilayah", Name: "Wilayah", Description: "Data wilayah", TableName: "ref.wilayah", FeederAct: "GetWilayah", PKField: "id_wil"},
		{Key: "agama", Name: "Agama", Description: "Data agama", TableName: "ref.agama", FeederAct: "GetAgama", PKField: "id_agama"},
		{Key: "jenis_tinggal", Name: "Jenis Tinggal", Description: "Data jenis tinggal", TableName: "ref.jenis_tinggal", FeederAct: "GetJenisTinggal", PKField: "id_jns_tinggal"},
		{Key: "pekerjaan", Name: "Pekerjaan", Description: "Data pekerjaan", TableName: "ref.pekerjaan", FeederAct: "GetPekerjaan", PKField: "id_pekerjaan"},
		{Key: "penghasilan", Name: "Penghasilan", Description: "Data penghasilan", TableName: "ref.penghasilan", FeederAct: "GetPenghasilan", PKField: "id_penghasilan"},
		{Key: "jenjang_pendidikan", Name: "Jenjang Pendidikan", Description: "Data jenjang pendidikan", TableName: "ref.jenjang_pendidikan", FeederAct: "GetJenjangPendidikan", PKField: "id_jenj_didik"},
		{Key: "pembiayaan", Name: "Pembiayaan", Description: "Data pembiayaan", TableName: "ref.pembiayaan", FeederAct: "GetPembiayaan", PKField: "id_pembiayaan"},
		{Key: "jenis_aktivitas", Name: "Jenis Aktivitas", Description: "Data jenis aktivitas mahasiswa", TableName: "ref.jenis_akt_mhs", FeederAct: "GetJenisAktivitasMahasiswa", PKField: "id_jns_akt_mhs"},
	}
}

// FindEndpoint finds endpoint by key
func FindEndpoint(key string) *ReferensiEndpoint {
	for _, ep := range GetReferensiEndpoints() {
		if ep.Key == key {
			return &ep
		}
	}
	return nil
}

// ReferensiStats represents stats for a referensi endpoint
type ReferensiStats struct {
	EndpointKey  string     `json:"endpoint_key"`
	EndpointName string     `json:"endpoint_name"`
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync,omitempty"`
}

// AllReferensiStats represents all referensi stats
type AllReferensiStats struct {
	TotalEndpoints  int              `json:"total_endpoints"`
	TotalRecords    int              `json:"total_records"`
	SyncedEndpoints int              `json:"synced_endpoints"`
	ReferensiList   []ReferensiStats `json:"referensi_list"`
}

// ReferensiItem represents a generic referensi record
type ReferensiItem struct {
	ID          string            `json:"id"`
	Nama        string            `json:"nama"`
	Kode        *string           `json:"kode,omitempty"`
	Keterangan  *string           `json:"keterangan,omitempty"`
	IsActive    bool              `json:"is_active"`
	CreatedAt   *time.Time        `json:"created_at,omitempty"`
	UpdatedAt   *time.Time        `json:"updated_at,omitempty"`
	LastSync    *time.Time        `json:"last_sync,omitempty"`
	ExtraFields map[string]interface{} `json:"extra_fields,omitempty"`
}

// ReferensiListResponse represents paginated referensi list
type ReferensiListResponse struct {
	Data  []ReferensiItem `json:"data"`
	Total int             `json:"total"`
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
}

// SyncResult represents sync result for a single endpoint
type SyncResult struct {
	EndpointKey   string `json:"endpoint_key"`
	EndpointName  string `json:"endpoint_name"`
	Status        string `json:"status"` // success, failed, skipped
	TotalRecords  int    `json:"total_records"`
	InsertedCount int    `json:"inserted_count"`
	UpdatedCount  int    `json:"updated_count"`
	FailedCount   int    `json:"failed_count"`
	Message       string `json:"message,omitempty"`
}

// BatchSyncResult represents batch sync result
type BatchSyncResult struct {
	TotalEndpoints int          `json:"total_endpoints"`
	TotalRecords   int          `json:"total_records"`
	InsertedCount  int          `json:"inserted_count"`
	UpdatedCount   int          `json:"updated_count"`
	FailedCount    int          `json:"failed_count"`
	SkippedCount   int          `json:"skipped_count"`
	Details        []SyncResult `json:"details"`
	Message        string       `json:"message"`
}

// === Specific Entity Types for each referensi ===

// JalurMasuk entity
type JalurMasuk struct {
	IDJalurMasuk  int        `json:"id_jalur_masuk" db:"id_jalur_masuk"`
	NmJalurMasuk  string     `json:"nama_jalur_masuk" db:"nm_jalur_masuk"`
	CreateDate    time.Time  `json:"create_date" db:"create_date"`
	LastUpdate    time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate   *time.Time `json:"expired_date" db:"expired_date"`
	LastSync      time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisEvaluasi entity
type JenisEvaluasi struct {
	IDJenisEvaluasi int        `json:"id_jenis_evaluasi" db:"id_jenis_evaluasi"`
	NmJenisEvaluasi string     `json:"nama_jenis_evaluasi" db:"nm_jenis_evaluasi"`
	CreateDate      time.Time  `json:"create_date" db:"create_date"`
	LastUpdate      time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate     *time.Time `json:"expired_date" db:"expired_date"`
	LastSync        time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisPendaftaran entity
type JenisPendaftaran struct {
	IDJenisDaftar int        `json:"id_jenis_daftar" db:"id_jns_daftar"`
	NmJenisDaftar string     `json:"nama_jenis_daftar" db:"nm_jns_daftar"`
	CreateDate    time.Time  `json:"create_date" db:"create_date"`
	LastUpdate    time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate   *time.Time `json:"expired_date" db:"expired_date"`
	LastSync      time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisKeluar entity
type JenisKeluar struct {
	IDJenisKeluar    int        `json:"id_jenis_keluar" db:"id_jns_keluar"`
	NmJenisKeluar    string     `json:"nama_jenis_keluar" db:"nm_jns_keluar"`
	JenisKeluar      *string    `json:"jenis_keluar" db:"jenis_keluar"`
	AKelasKaryawan   *int       `json:"a_kelas_karyawan" db:"a_kelas_karyawan"`
	CreateDate       time.Time  `json:"create_date" db:"create_date"`
	LastUpdate       time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate      *time.Time `json:"expired_date" db:"expired_date"`
	LastSync         time.Time  `json:"last_sync" db:"last_sync"`
}

// StatusMahasiswa entity
type StatusMahasiswa struct {
	IDStatMhs   string     `json:"id_stat_mhs" db:"id_stat_mhs"`
	NmStatMhs   string     `json:"nama_stat_mhs" db:"nm_stat_mhs"`
	CreateDate  time.Time  `json:"create_date" db:"create_date"`
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate *time.Time `json:"expired_date" db:"expired_date"`
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`
}

// TahunAjaran entity
type TahunAjaran struct {
	IDThnAjaran  string     `json:"id_thn_ajaran" db:"id_thn_ajaran"`
	ThnAjaran    string     `json:"thn_ajaran" db:"thn_ajaran"`
	APeriodeBl   int        `json:"a_periode_bl" db:"a_periode_bl"`
	CreateDate   time.Time  `json:"create_date" db:"create_date"`
	LastUpdate   time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate  *time.Time `json:"expired_date" db:"expired_date"`
	LastSync     time.Time  `json:"last_sync" db:"last_sync"`
}

// Semester entity
type Semester struct {
	IDSmt          string     `json:"id_smt" db:"id_smt"`
	IDThnAjaran    string     `json:"id_thn_ajaran" db:"id_thn_ajaran"`
	NmSmt          string     `json:"nm_smt" db:"nm_smt"`
	Semester       int        `json:"semester" db:"smt"`
	APeriodeAktif  int        `json:"a_periode_aktif" db:"a_periode_aktif"`
	TglMulai       *time.Time `json:"tgl_mulai" db:"tgl_mulai"`
	TglSelesai     *time.Time `json:"tgl_selesai" db:"tgl_selesai"`
	CreateDate     time.Time  `json:"create_date" db:"create_date"`
	LastUpdate     time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate    *time.Time `json:"expired_date" db:"expired_date"`
	LastSync       time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisPrestasi entity
type JenisPrestasi struct {
	IDJenisPrestasi int        `json:"id_jenis_prestasi" db:"id_jenis_prestasi"`
	NmJenisPrestasi string     `json:"nama_jenis_prestasi" db:"nm_jenis_prestasi"`
	CreateDate      time.Time  `json:"create_date" db:"create_date"`
	LastUpdate      time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate     *time.Time `json:"expired_date" db:"expired_date"`
	LastSync        time.Time  `json:"last_sync" db:"last_sync"`
}

// TingkatPrestasi entity
type TingkatPrestasi struct {
	IDTingkatPrestasi int        `json:"id_tingkat_prestasi" db:"id_tingkat_prestasi"`
	NmTingkatPrestasi string     `json:"nama_tingkat_prestasi" db:"nm_tingkat_prestasi"`
	CreateDate        time.Time  `json:"create_date" db:"create_date"`
	LastUpdate        time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate       *time.Time `json:"expired_date" db:"expired_date"`
	LastSync          time.Time  `json:"last_sync" db:"last_sync"`
}

// KebutuhanKhusus entity
type KebutuhanKhusus struct {
	IDKebutuhanKhusus int        `json:"id_kebutuhan_khusus" db:"id_kebutuhan_khusus"`
	NmKebutuhanKhusus string     `json:"nama_kebutuhan_khusus" db:"nm_kebutuhan_khusus"`
	CreateDate        time.Time  `json:"create_date" db:"create_date"`
	LastUpdate        time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate       *time.Time `json:"expired_date" db:"expired_date"`
	LastSync          time.Time  `json:"last_sync" db:"last_sync"`
}

// Wilayah entity
type Wilayah struct {
	IDWil        string     `json:"id_wil" db:"id_wil"`
	NmWil        string     `json:"nm_wil" db:"nm_wil"`
	IDLevelWil   int        `json:"id_level_wil" db:"id_level_wil"`
	IDIndukWil   *string    `json:"id_induk_wil" db:"id_induk_wil"`
	NmIndukWil   *string    `json:"nm_induk_wil" db:"nm_induk_wil"`
	CreateDate   time.Time  `json:"create_date" db:"create_date"`
	LastUpdate   time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate  *time.Time `json:"expired_date" db:"expired_date"`
	LastSync     time.Time  `json:"last_sync" db:"last_sync"`
}

// Agama entity
type Agama struct {
	IDAgama     int        `json:"id_agama" db:"id_agama"`
	NmAgama     string     `json:"nm_agama" db:"nm_agama"`
	CreateDate  time.Time  `json:"create_date" db:"create_date"`
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate *time.Time `json:"expired_date" db:"expired_date"`
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisTinggal entity
type JenisTinggal struct {
	IDJnsTinggal int        `json:"id_jns_tinggal" db:"id_jns_tinggal"`
	NmJnsTinggal string     `json:"nm_jns_tinggal" db:"nm_jns_tinggal"`
	CreateDate   time.Time  `json:"create_date" db:"create_date"`
	LastUpdate   time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate  *time.Time `json:"expired_date" db:"expired_date"`
	LastSync     time.Time  `json:"last_sync" db:"last_sync"`
}

// Pekerjaan entity
type Pekerjaan struct {
	IDPekerjaan int        `json:"id_pekerjaan" db:"id_pekerjaan"`
	NmPekerjaan string     `json:"nm_pekerjaan" db:"nm_pekerjaan"`
	CreateDate  time.Time  `json:"create_date" db:"create_date"`
	LastUpdate  time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate *time.Time `json:"expired_date" db:"expired_date"`
	LastSync    time.Time  `json:"last_sync" db:"last_sync"`
}

// Penghasilan entity
type Penghasilan struct {
	IDPenghasilan int        `json:"id_penghasilan" db:"id_penghasilan"`
	NmPenghasilan string     `json:"nm_penghasilan" db:"nm_penghasilan"`
	BatasBawah    *int64     `json:"batas_bawah" db:"batas_bawah"`
	BatasAtas     *int64     `json:"batas_atas" db:"batas_atas"`
	CreateDate    time.Time  `json:"create_date" db:"create_date"`
	LastUpdate    time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate   *time.Time `json:"expired_date" db:"expired_date"`
	LastSync      time.Time  `json:"last_sync" db:"last_sync"`
}

// JenjangPendidikan entity
type JenjangPendidikan struct {
	IDJenjDidik     string     `json:"id_jenj_didik" db:"id_jenj_didik"`
	NmJenjDidik     string     `json:"nm_jenj_didik" db:"nm_jenj_didik"`
	CreateDate      time.Time  `json:"create_date" db:"create_date"`
	LastUpdate      time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate     *time.Time `json:"expired_date" db:"expired_date"`
	LastSync        time.Time  `json:"last_sync" db:"last_sync"`
}

// Pembiayaan entity
type Pembiayaan struct {
	IDPembiayaan int        `json:"id_pembiayaan" db:"id_pembiayaan"`
	NmPembiayaan string     `json:"nm_pembiayaan" db:"nm_pembiayaan"`
	CreateDate   time.Time  `json:"create_date" db:"create_date"`
	LastUpdate   time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate  *time.Time `json:"expired_date" db:"expired_date"`
	LastSync     time.Time  `json:"last_sync" db:"last_sync"`
}

// JenisAktivitas entity (ref.jenis_akt_mhs)
type JenisAktivitas struct {
	IDJnsAktMhs           int        `json:"id_jns_akt_mhs" db:"id_jns_akt_mhs"`
	NmJnsAktMhs           string     `json:"nm_jns_akt_mhs" db:"nm_jns_akt_mhs"`
	KetJnsAktMhs          *string    `json:"ket_jns_akt_mhs" db:"ket_jns_akt_mhs"`
	ARefPddikti           int        `json:"a_ref_pddikti" db:"a_ref_pddikti"`
	ARefUnila             int        `json:"a_ref_unila" db:"a_ref_unila"`
	AKegiatanKampusMerdeka int       `json:"a_kegiatan_kampus_merdeka" db:"a_kegiatan_kampus_merdeka"`
	CreateDate            time.Time  `json:"create_date" db:"create_date"`
	LastUpdate            time.Time  `json:"last_update" db:"last_update"`
	ExpiredDate           *time.Time `json:"expired_date" db:"expired_date"`
	LastSync              time.Time  `json:"last_sync" db:"last_sync"`
}
