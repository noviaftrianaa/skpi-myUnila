// Package sdm — API untuk SDM (dosen + tendik) dari pdrd.sdm.
// Sumber data: SISTER (di-sync ke pdut.pdrd.sdm via sister-service).
// Filter utama: id_jns_sdm (12=Dosen, 13=Tendik, dst — lihat ref.jenis_sdm).
package sdm

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// SDM — list ringkas (FK id saja, tanpa join ref)
type SDM struct {
	IDSDM      utils.UUID           `db:"id_sdm" json:"id_sdm"`
	NmSDM      string               `db:"nm_sdm" json:"nm_sdm"`
	Jk         *string              `db:"jk" json:"jk"`
	TmptLahir  *string              `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir   *types.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	Nik        *string              `db:"nik" json:"nik"`
	Nuptk      *string              `db:"nuptk" json:"nuptk"`
	Nidn       *string              `db:"nidn" json:"nidn"`
	Nsdmi      *string              `db:"nsdmi" json:"nsdmi"`
	Nip        *string              `db:"nip" json:"nip"`
	NiyNigk    *string              `db:"niy_nigk" json:"niy_nigk"`
	Email      *string              `db:"email" json:"email"`
	NoHp       *string              `db:"no_hp" json:"no_hp"`
	IDJnsSDM   int                  `db:"id_jns_sdm" json:"id_jns_sdm"`
	IDStatAktif *int                `db:"id_stat_aktif" json:"id_stat_aktif"`
	IDAgama    *int                 `db:"id_agama" json:"id_agama"`
	IDWil      *string              `db:"id_wil" json:"id_wil"`
	LastSync   types.SQLServerTime  `db:"last_sync" json:"last_sync"`
	SoftDelete int                  `db:"soft_delete" json:"-"`
}

// SDMDetail — join ref supaya FK id + nama muncul (pola mahasiswa detail)
type SDMDetail struct {
	IDSDM          utils.UUID           `db:"id_sdm" json:"id_sdm"`
	NmSDM          string               `db:"nm_sdm" json:"nm_sdm"`
	Jk             *string              `db:"jk" json:"jk"`
	TmptLahir      *string              `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir       *types.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	Nik            *string              `db:"nik" json:"nik"`
	Nuptk          *string              `db:"nuptk" json:"nuptk"`
	Nidn           *string              `db:"nidn" json:"nidn"`
	Nsdmi          *string              `db:"nsdmi" json:"nsdmi"`
	Nip            *string              `db:"nip" json:"nip"`
	NiyNigk        *string              `db:"niy_nigk" json:"niy_nigk"`
	Npwp           *string              `db:"npwp" json:"npwp"`
	NmWp           *string              `db:"nm_wp" json:"nm_wp"`
	StatKawin      *string              `db:"stat_kawin" json:"stat_kawin"`
	Jln            *string              `db:"jln" json:"jln"`
	Rt             *int                 `db:"rt" json:"rt"`
	Rw             *int                 `db:"rw" json:"rw"`
	NmDsn          *string              `db:"nm_dsn" json:"nm_dsn"`
	DsKel          *string              `db:"ds_kel" json:"ds_kel"`
	KodePos        *string              `db:"kode_pos" json:"kode_pos"`
	NoTelRmh       *string              `db:"no_tel_rmh" json:"no_tel_rmh"`
	NoHp           *string              `db:"no_hp" json:"no_hp"`
	Email          *string              `db:"email" json:"email"`
	TmtPns         *types.SQLServerTime `db:"tmt_pns" json:"tmt_pns"`
	SkCpns         *string              `db:"sk_cpns" json:"sk_cpns"`
	TglSkCpns      *types.SQLServerTime `db:"tgl_sk_cpns" json:"tgl_sk_cpns"`
	SkAngkat       *string              `db:"sk_angkat" json:"sk_angkat"`
	TmtSkAngkat    *types.SQLServerTime `db:"tmt_sk_angkat" json:"tmt_sk_angkat"`
	Kewarganegaraan *string             `db:"kewarganegaraan" json:"kewarganegaraan"`
	IDJnsSDM       int                  `db:"id_jns_sdm" json:"id_jns_sdm"`
	NmJnsSDM       string               `db:"nm_jns_sdm" json:"nm_jns_sdm"`
	IDStatAktif    *int                 `db:"id_stat_aktif" json:"id_stat_aktif"`
	NmStatAktif    *string              `db:"nm_stat_aktif" json:"nm_stat_aktif"`
	IDAgama        *int                 `db:"id_agama" json:"id_agama"`
	NmAgama        *string              `db:"nm_agama" json:"nm_agama"`
	IDWil          *string              `db:"id_wil" json:"id_wil"`
	NmWil          *string              `db:"nm_wil" json:"nm_wil"`
	IDSumberGaji   *int                 `db:"id_sumber_gaji" json:"id_sumber_gaji"`
	NmSumberGaji   *string              `db:"nm_sumber_gaji" json:"nm_sumber_gaji"`
	LastSync       types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// RegPtk — penugasan/homebase SDM di prodi/sekolah
type RegPtk struct {
	IDRegPtk      utils.UUID           `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDSDM         utils.UUID           `db:"id_sdm" json:"id_sdm"`
	NmSDM         string               `db:"nm_sdm" json:"nm_sdm"`
	Nidn          *string              `db:"nidn" json:"nidn"`
	IDSp          *string              `db:"id_sp" json:"id_sp"`
	NmSp          *string              `db:"nm_sp" json:"nm_sp"`
	IDSms         *string              `db:"id_sms" json:"id_sms"`
	NmSms         *string              `db:"nm_sms" json:"nm_sms"`
	IDStatPegawai *int                 `db:"id_stat_pegawai" json:"id_stat_pegawai"`
	NmStatPegawai *string              `db:"nm_stat_pegawai" json:"nm_stat_pegawai"`
	IDIkatanKerja *int                 `db:"id_ikatan_kerja" json:"id_ikatan_kerja"`
	NmIkatanKerja *string              `db:"nm_ikatan_kerja" json:"nm_ikatan_kerja"`
	IDJnsKeluar   *string              `db:"id_jns_keluar" json:"id_jns_keluar"`
	NmJnsKeluar   *string              `db:"nm_jns_keluar" json:"nm_jns_keluar"`
	NoSrtTgs      *string              `db:"no_srt_tgs" json:"no_srt_tgs"`
	TglSrtTgs     *types.SQLServerTime `db:"tgl_srt_tgs" json:"tgl_srt_tgs"`
	TmtSrtTgs     *types.SQLServerTime `db:"tmt_srt_tgs" json:"tmt_srt_tgs"`
	TglPtkKeluar  *types.SQLServerTime `db:"tgl_ptk_keluar" json:"tgl_ptk_keluar"`
	JnsReg        *string              `db:"jns_reg" json:"jns_reg"`
	LastSync      types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// RiwayatPendidikanFormal
type RiwayatPendFormal struct {
	IDRwyPendFormal utils.UUID           `db:"id_rwy_pend_formal" json:"id_rwy_pend_formal"`
	IDSDM           utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJenjDidik     *int                 `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik     *string              `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	IDBidStudi      *string              `db:"id_bid_studi" json:"id_bid_studi"`
	NmBidStudi      *string              `db:"nm_bid_studi" json:"nm_bid_studi"`
	IDGelarAkad     *int                 `db:"id_gelar_akad" json:"id_gelar_akad"`
	NmGelarAkad     *string              `db:"nm_gelar_akad" json:"nm_gelar_akad"`
	NmSpFormal      *string              `db:"nm_sp_formal" json:"nm_sp_formal"`
	Fak             *string              `db:"fak" json:"fak"`
	AKependidikan   *int                 `db:"a_kependidikan" json:"a_kependidikan"`
	ThnMasuk        *int                 `db:"thn_masuk" json:"thn_masuk"`
	ThnLulus        *int                 `db:"thn_lulus" json:"thn_lulus"`
	Nipd            *string              `db:"nipd" json:"nipd"`
	Ipk             *float64             `db:"ipk" json:"ipk"`
	SksLulus        *int                 `db:"sks_lulus" json:"sks_lulus"`
	NoIjazah        *string              `db:"no_ijazah" json:"no_ijazah"`
	JudulTesis      *string              `db:"judul_tesis" json:"judul_tesis"`
	TglLulus        *types.SQLServerTime `db:"tgl_lulus" json:"tgl_lulus"`
}

// RiwayatFungsional
type RiwayatFungsional struct {
	IDRwyJabfung utils.UUID           `db:"id_rwy_jabfung" json:"id_rwy_jabfung"`
	IDSDM        utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJabfung    *int                 `db:"id_jabfung" json:"id_jabfung"`
	NmJabfung    *string              `db:"nm_jabfung" json:"nm_jabfung"`
	IDKelBidang  *string              `db:"id_kel_bidang" json:"id_kel_bidang"`
	NmKelBidang  *string              `db:"nm_kel_bidang" json:"nm_kel_bidang"`
	SkJabfung    *string              `db:"sk_jabfung" json:"sk_jabfung"`
	TmtSkJabfung *types.SQLServerTime `db:"tmt_sk_jabfung" json:"tmt_sk_jabfung"`
	AngkaKredit  *float64             `db:"angka_kredit" json:"angka_kredit"`
	BidangIlmu   *string              `db:"bidang_ilmu" json:"bidang_ilmu"`
}

// RiwayatKepangkatan
type RiwayatKepangkatan struct {
	IDRwyPangkat   utils.UUID           `db:"id_rwy_pangkat" json:"id_rwy_pangkat"`
	IDSDM          utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDPangkatGol   *int                 `db:"id_pangkat_gol" json:"id_pangkat_gol"`
	NmPangkatGol   *string              `db:"nm_pangkat_gol" json:"nm_pangkat_gol"`
	SkPangkat      *string              `db:"sk_pangkat" json:"sk_pangkat"`
	TglSkPangkat   *types.SQLServerTime `db:"tgl_sk_pangkat" json:"tgl_sk_pangkat"`
	TmtSkPangkat   *types.SQLServerTime `db:"tmt_sk_pangkat" json:"tmt_sk_pangkat"`
	MasaKerjaThn   *int                 `db:"masa_kerja_gol_thn" json:"masa_kerja_gol_thn"`
	MasaKerjaBln   *int                 `db:"masa_kerja_gol_bln" json:"masa_kerja_gol_bln"`
}

// RiwayatTugasTambahan
type RiwayatTugasTambahan struct {
	IDTgsTambah   utils.UUID           `db:"id_tgs_tambah" json:"id_tgs_tambah"`
	IDSDM         utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJabTgs      *int                 `db:"id_jab_tgs" json:"id_jab_tgs"`
	NmJabTgs      *string              `db:"nm_jab_tgs" json:"nm_jab_tgs"`
	IDSp          *string              `db:"id_sp" json:"id_sp"`
	NmSp          *string              `db:"nm_sp" json:"nm_sp"`
	IDSms         *string              `db:"id_sms" json:"id_sms"`
	NmSms         *string              `db:"nm_sms" json:"nm_sms"`
	JmlJam        *int                 `db:"jml_jam" json:"jml_jam"`
	SkTugasTambah *string              `db:"sk_tugas_tambah" json:"sk_tugas_tambah"`
	TmtSkTambah   *types.SQLServerTime `db:"tmt_sk_tambah" json:"tmt_sk_tambah"`
	TstSkTambah   *types.SQLServerTime `db:"tst_sk_tambah" json:"tst_sk_tambah"`
}

// RiwayatSertifikasi (sertifikasi dosen/pendidik)
type RiwayatSertifikasi struct {
	IDRwySert  utils.UUID           `db:"id_rwy_sert" json:"id_rwy_sert"`
	IDSDM      utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJnsSert  *int                 `db:"id_jns_sert" json:"id_jns_sert"`
	NmJnsSert  *string              `db:"nm_jns_sert" json:"nm_jns_sert"`
	IDBidStudi *string              `db:"id_bid_studi" json:"id_bid_studi"`
	NmBidStudi *string              `db:"nm_bid_studi" json:"nm_bid_studi"`
	IDLembSert *int                 `db:"id_lemb_sert" json:"id_lemb_sert"`
	NmLembSert *string              `db:"nm_lemb_sert" json:"nm_lemb_sert"`
	ThnSert    *int                 `db:"thn_sert" json:"thn_sert"`
	SkSert     *string              `db:"sk_sert" json:"sk_sert"`
	Nrg        *string              `db:"nrg" json:"nrg"`
	NoPeserta  *string              `db:"no_peserta" json:"no_peserta"`
	TmtSert    *types.SQLServerTime `db:"tmt_sert" json:"tmt_sert"`
	TstSert    *types.SQLServerTime `db:"tst_sert" json:"tst_sert"`
}
