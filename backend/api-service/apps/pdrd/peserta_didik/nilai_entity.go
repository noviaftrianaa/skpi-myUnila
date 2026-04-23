package pesertadidik

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// NilaiSmtMhs — nilai per kelas per semester
type NilaiSmtMhs struct {
	IDRegPd     utils.UUID           `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd        *string              `db:"nipd" json:"nipd"`
	NmPd        *string              `db:"nm_pd" json:"nm_pd"`
	IDKls       utils.UUID           `db:"id_kls" json:"id_kls"`
	NmKls       *string              `db:"nm_kls" json:"nm_kls"`
	IDMk        utils.NullUUID       `db:"id_mk" json:"id_mk"`
	KodeMk      *string              `db:"kode_mk" json:"kode_mk"`
	NmMk        *string              `db:"nm_mk" json:"nm_mk"`
	IDSmt       *int                 `db:"id_smt" json:"id_smt"`
	NmSmt       *string              `db:"nm_smt" json:"nm_smt"`
	SksMk       *float64             `db:"sks_mk" json:"sks_mk"`
	NilaiAngka  *float64             `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf  *string              `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks *float64             `db:"nilai_indeks" json:"nilai_indeks"`
	LastSync    types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// NilaiTranskrip — transkrip akhir per mhs
type NilaiTranskrip struct {
	IDRegPd     utils.UUID           `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd        *string              `db:"nipd" json:"nipd"`
	NmPd        *string              `db:"nm_pd" json:"nm_pd"`
	IDMk        utils.UUID           `db:"id_mk" json:"id_mk"`
	KodeMk      *string              `db:"kode_mk" json:"kode_mk"`
	NmMk        *string              `db:"nm_mk" json:"nm_mk"`
	IDKls       utils.NullUUID       `db:"id_kls" json:"id_kls"`
	NmKls       *string              `db:"nm_kls" json:"nm_kls"`
	SmtKe       *int                 `db:"smt_ke" json:"smt_ke"`
	SksMk       *float64             `db:"sks_mk" json:"sks_mk"`
	NilaiAngka  *float64             `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf  *string              `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks *float64             `db:"nilai_indeks" json:"nilai_indeks"`
	LastSync    types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// KehadiranMhs — kehadiran per tanggal per kelas
type KehadiranMhs struct {
	IDHadirMhs     utils.UUID           `db:"id_hadir_mhs" json:"id_hadir_mhs"`
	IDRegPtk       utils.NullUUID       `db:"id_reg_ptk" json:"id_reg_ptk"`
	NmSdm          *string              `db:"nm_sdm" json:"nm_sdm"`
	IDKls          utils.UUID           `db:"id_kls" json:"id_kls"`
	NmKls          *string              `db:"nm_kls" json:"nm_kls"`
	KodeMk         *string              `db:"kode_mk" json:"kode_mk"`
	NmMk           *string              `db:"nm_mk" json:"nm_mk"`
	TglHadir       *types.SQLServerTime `db:"tgl_hadir" json:"tgl_hadir"`
	WaktuPresensi  *string              `db:"waktu_presensi" json:"waktu_presensi"`
	StatHadir      *string              `db:"stat_hadir" json:"stat_hadir"`
	LastSync       types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// AktMhs — aktivitas mahasiswa (KKN, magang, MBKM)
type AktMhs struct {
	IDAktMhs        utils.UUID           `db:"id_akt_mhs" json:"id_akt_mhs"`
	IDJnsAktMhs     *int                 `db:"id_jns_akt_mhs" json:"id_jns_akt_mhs"`
	NmJnsAktMhs     *string              `db:"nm_jns_akt_mhs" json:"nm_jns_akt_mhs"`
	IDSms           utils.NullUUID       `db:"id_sms" json:"id_sms"`
	NmSms           *string              `db:"nm_sms" json:"nm_sms"`
	IDSmt           *int                 `db:"id_smt" json:"id_smt"`
	NmSmt           *string              `db:"nm_smt" json:"nm_smt"`
	JudulAktMhs     string               `db:"judul_akt_mhs" json:"judul_akt_mhs"`
	LokasiKegiatan  *string              `db:"lokasi_kegiatan" json:"lokasi_kegiatan"`
	SkTugas         *string              `db:"sk_tugas" json:"sk_tugas"`
	TglSkTugas      *types.SQLServerTime `db:"tgl_sk_tugas" json:"tgl_sk_tugas"`
	TglMulai        *types.SQLServerTime `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai      *types.SQLServerTime `db:"tgl_selesai" json:"tgl_selesai"`
	KetAkt          *string              `db:"ket_akt" json:"ket_akt"`
	AKomunal        *int                 `db:"a_komunal" json:"a_komunal"`
	AFlagship       *int                 `db:"a_flagship" json:"a_flagship"`
	LastSync        types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}
