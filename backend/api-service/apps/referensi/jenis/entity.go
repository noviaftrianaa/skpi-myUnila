package jenis

import (
	"time"

	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
	"github.com/shopspring/decimal"
)

type JenisAktMhs struct {
	IDJnsAktMhs            int                 `db:"id_jns_akt_mhs" json:"id_jns_akt_mhs"`
	NmJnsAktMhs            string              `db:"nm_jns_akt_mhs" json:"nm_jns_akt_mhs"`
	KetJnsAktMhs           *string             `db:"ket_jns_akt_mhs" json:"ket_jns_akt_mhs"`
	AKegiatanKampusMerdeka int                 `db:"a_kegiatan_kampus_merdeka" json:"a_kegiatan_kampus_merdeka"`
	CreateDate             types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate             types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate            *time.Time          `db:"expired_date" json:"-"`
}

type JenisBahanAjar struct {
	IDJnsBhnAjar int                 `db:"id_jns_bhn_ajar" json:"id_jns_bhn_ajar"`
	NmJnsBhnAjar string              `db:"nm_jns_bhn_ajar" json:"nm_jns_bhn_ajar"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type JenisBeasiswa struct {
	IDJnsBeasiswa int                 `db:"id_jns_beasiswa" json:"id_jns_beasiswa"`
	IDSumberDana  int                 `db:"id_sumber_dana" json:"id_sumber_dana"`
	NmSumberDana  string              `db:"nm_sumber_dana" json:"nm_sumber_dana"`
	NmJnsBeasiswa string              `db:"nm_jns_beasiswa" json:"nm_jns_beasiswa"`
	UPd           int                 `db:"u_pd" json:"u_pd"`
	UPtk          int                 `db:"u_ptk" json:"u_ptk"`
	UNonCa        int                 `db:"u_non_ca" json:"u_non_ca"`
	KatBeasiswa   *int                `db:"kat_beasiswa" json:"kat_beasiswa"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type JenisDiklat struct {
	IDJnsDiklat int                 `db:"id_jns_diklat" json:"id_jns_diklat"`
	NmJnsDiklat string              `db:"nm_jns_diklat" json:"nm_jns_diklat"`
	UGuru       int                 `db:"u_guru" json:"u_guru"`
	UDosen      int                 `db:"u_dosen" json:"u_dosen"`
	UTendik     int                 `db:"u_tendik" json:"u_tendik"`
	AValidasi   int                 `db:"a_validasi" json:"a_validasi"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisDokumen struct {
	IDJnsDok    int                 `db:"id_jns_dok" json:"id_jns_dok"`
	NmJnsDok    string              `db:"nm_jns_dok" json:"nm_jns_dok"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisEvaluasi struct {
	IDJnsEval   int                 `db:"id_jns_eval" json:"id_jns_eval"`
	NmJnsEval   string              `db:"nm_jns_eval" json:"nm_jns_eval"`
	KetJnsEval  *string             `db:"ket_jns_eval" json:"ket_jns_eval,omitempty"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisHapusBuku struct {
	IDHapusBuku  string              `db:"id_hapus_buku" json:"id_hapus_buku"`
	KetHapusBuku string              `db:"ket_hapus_buku" json:"ket_hapus_buku"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type JenisJalurPekerjaan struct {
	IDJnsJalurKerja int                 `db:"id_jns_jalur_kerja" json:"id_jns_jalur_kerja"`
	NmJnsJalurKerja string              `db:"nm_jns_jalur_kerja" json:"nm_jns_jalur_kerja"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type JenisKeluar struct {
	IDJnsKeluar string              `db:"id_jns_keluar" json:"id_jns_keluar"`
	KetKeluar   string              `db:"ket_keluar" json:"ket_keluar"`
	APd         int                 `db:"a_pd" json:"a_pd"`
	APtk        int                 `db:"a_ptk" json:"a_ptk"`
	ASdmIptek   int                 `db:"a_sdm_iptek" json:"a_sdm_iptek"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisKepanitiaan struct {
	IDJnsPanitia int                 `db:"id_jns_panitia" json:"id_jns_panitia"`
	NmJnsPanitia string              `db:"nm_jns_panitia" json:"nm_jns_panitia"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type JenisKesejahteraan struct {
	IDJnsSejahtera int                 `db:"id_jns_sejahtera" json:"id_jns_sejahtera"`
	NmJnsSejahtera string              `db:"nm_jns_sejahtera" json:"nm_jns_sejahtera"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type JenisKeuangan struct {
	IDJnsKeuangan int                 `db:"id_jns_keuangan" json:"id_jns_keuangan"`
	NmJnsKeuangan string              `db:"nm_jns_keuangan" json:"nm_jns_keuangan"`
	APengeluaraan int                 `db:"a_pengeluaran" json:"a_pengeluaran"`
	APemasukan    int                 `db:"a_pemasukan" json:"a_pemasukan"`
	CreateDate    types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate    types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate   *time.Time          `db:"expired_date" json:"-"`
}

type JenisLembaga struct {
	IDJnsLemb            int                 `db:"id_jns_lemb" json:"id_jns_lemb"`
	NmJnsLemb            string              `db:"nm_jns_lemb" json:"nm_jns_lemb"`
	ASp                  int                 `db:"a_sp" json:"a_sp"`
	ALembAkred           int                 `db:"a_lemb_akred" json:"a_lemb_akred"`
	APengelolaPendidikan int                 `db:"a_pengelola_pendidikan" json:"a_pengelola_pendidikan"`
	ASms                 int                 `db:"a_sms" json:"a_sms"`
	ATmptPengawas        int                 `db:"a_tmpt_pengawas" json:"a_tmpt_pengawas"`
	ALembIptek           int                 `db:"a_lemb_iptek" json:"a_lemb_iptek"`
	ASmi                 int                 `db:"a_smi" json:"a_smi"`
	Sort                 *int                `db:"sort" json:"sort"`
	CreateDate           types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate           types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate          *time.Time          `db:"expired_date" json:"-"`
}

type JenisMediaPub struct {
	IDJnsMedia  int                 `db:"id_jns_media" json:"id_jns_media"`
	NmJnsMedia  string              `db:"nm_jns_media" json:"nm_jns_media"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisMk struct {
	IDJnsMk     string              `db:"id_jns_mk" json:"id_jns_mk"`
	NmJnsMk     string              `db:"nm_jns_mk" json:"nm_jns_mk"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisPendaftaran struct {
	IDJnsDaftar    int                 `db:"id_jns_daftar" json:"id_jns_daftar"`
	NmJnsDaftar    string              `db:"nm_jns_daftar" json:"nm_jns_daftar"`
	UDaftarSekolah int                 `db:"u_daftar_sekolah" json:"u_daftar_sekolah"`
	UDaftarRombel  int                 `db:"u_daftar_rombel" json:"u_daftar_rombel"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type JenisPenelitian struct {
	IDJnsLit    int                 `db:"id_jns_lit" json:"id_jns_lit"`
	NmJnsLit    string              `db:"nm_jns_lit" json:"nm_jns_lit"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisPenghargaan struct {
	IDJnsPenghargaan int                 `db:"id_jns_penghargaan" json:"id_jns_penghargaan"`
	NmJnsPenghargaan string              `db:"nm_jns_penghargaan" json:"nm_jns_penghargaan"`
	USdm             int                 `db:"u_sdm" json:"u_sdm"`
	ULembaga         int                 `db:"u_lembaga" json:"u_lembaga"`
	CreateDate       types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate       types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate      *time.Time          `db:"expired_date" json:"-"`
}

type JenisPrasarana struct {
	IDJnsPrasarana int                 `db:"id_jns_prasarana" json:"id_jns_prasarana"`
	NmJnsPrasarana string              `db:"nm_jns_prasarana" json:"nm_jns_prasarana"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type JenisPrestasi struct {
	IDJenisPrestasi int                 `db:"id_jenis_prestasi" json:"id_jenis_prestasi"`
	NmJenisPrestasi string              `db:"nm_jenis_prestasi" json:"nm_jenis_prestasi"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate     *time.Time          `db:"expired_date" json:"-"`
}

type JenisPublikasi struct {
	IDJnsPub     int                 `db:"id_jns_pub" json:"id_jns_pub"`
	NmJnsPub     string              `db:"nm_jns_pub" json:"nm_jns_pub"`
	APubPrestasi *int                `db:"a_pub_prestasi" json:"a_pub_prestasi"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type JenisSarana struct {
	IDJnsSarana int                 `db:"id_jns_sarana" json:"id_jns_sarana"`
	NmJnsSarana string              `db:"nm_jns_sarana" json:"nm_jns_sarana"`
	Kel         string              `db:"kel" json:"kel"`
	APenempatan int                 `db:"a_penempatan" json:"a_penempatan"`
	Ket         string              `db:"ket" json:"ket"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisSdm struct {
	IDJnsSdm       int                 `db:"id_jns_sdm" json:"id_jns_sdm"`
	NmJnsSdm       string              `db:"nm_jns_sdm" json:"nm_jns_sdm"`
	AGuruKelas     int                 `db:"a_guru_kelas" json:"a_guru_kelas"`
	AGuruMapel     int                 `db:"a_guru_mapel" json:"a_guru_mapel"`
	AGuruBk        int                 `db:"a_guru_bk" json:"a_guru_bk"`
	AGuruInklusi   int                 `db:"a_guru_inklusi" json:"a_guru_inklusi"`
	APengawasSp    int                 `db:"a_pengawas_sp" json:"a_pengawas_sp"`
	APengawasPlb   int                 `db:"a_pengawas_plb" json:"a_pengawas_plb"`
	APengawasMapel int                 `db:"a_pengawas_mapel" json:"a_pengawas_mapel"`
	APengawasBid   int                 `db:"a_pengawas_bid" json:"a_pengawas_bid"`
	ATas           int                 `db:"a_tas" json:"a_tas"`
	AFormal        int                 `db:"a_formal" json:"a_formal"`
	ADosen         int                 `db:"a_dosen" json:"a_dosen"`
	APeneliti      int                 `db:"a_peneliti" json:"a_peneliti"`
	APerekayasa    int                 `db:"a_perekayasa" json:"a_perekayasa"`
	APranata1      int                 `db:"a_pranata_1" json:"a_pranata_1"`
	APranata2      int                 `db:"a_pranata_2" json:"a_pranata_2"`
	APranata3      int                 `db:"a_pranata_3" json:"a_pranata_3"`
	APranata4      int                 `db:"a_pranata_4" json:"a_pranata_4"`
	APranata5      int                 `db:"a_pranata_5" json:"a_pranata_5"`
	APranata6      int                 `db:"a_pranata_6" json:"a_pranata_6"`
	APranata7      int                 `db:"a_pranata_7" json:"a_pranata_7"`
	APranata8      int                 `db:"a_pranata_8" json:"a_pranata_8"`
	APranata9      int                 `db:"a_pranata_9" json:"a_pranata_9"`
	CreateDate     types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate     types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate    *time.Time          `db:"expired_date" json:"-"`
}

type JenisSert struct {
	IDJnsSert   int                 `db:"id_jns_sert" json:"id_jns_sert"`
	NmJnsSert   string              `db:"nm_jns_sert" json:"nm_jns_sert"`
	UProfGuru   int                 `db:"u_prof_guru" json:"u_prof_guru"`
	UKepsek     int                 `db:"u_kepsek" json:"u_kepsek"`
	ULaboran    int                 `db:"u_laboran" json:"u_laboran"`
	UProfDosen  int                 `db:"u_prof_dosen" json:"u_prof_dosen"`
	ULembaga    int                 `db:"u_lembaga" json:"u_lembaga"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisSms struct {
	IDJnsSms    int                 `db:"id_jns_sms" json:"id_jns_sms"`
	NmJnsSms    string              `db:"nm_jns_sms" json:"nm_jns_sms"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisSubst struct {
	IDJnsSubst  string              `db:"id_jns_subst" json:"id_jns_subst"`
	NmJnsSubst  string              `db:"nm_jns_subst" json:"nm_jns_subst"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisTes struct {
	IDJnsTes    int                 `db:"id_jns_tes" json:"id_jns_tes"`
	NmJnsTes    string              `db:"nm_jns_tes" json:"nm_jns_tes"`
	Ket         *string             `db:"ket" json:"ket"`
	NilaiMaks   decimal.Decimal     `db:"nilai_maks" json:"nilai_maks"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisTinggal struct {
	IDJnsTinggal int                 `db:"id_jns_tinggal" json:"id_jns_tinggal"`
	NmJnsTinggal string              `db:"nm_jns_tinggal" json:"nm_jns_tinggal"`
	CreateDate   types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate   types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate  *time.Time          `db:"expired_date" json:"-"`
}

type JenisTunjangan struct {
	IDJnsTunj   int                 `db:"id_jns_tunj" json:"id_jns_tunj"`
	NmJnsTunj   string              `db:"nm_jns_tunj" json:"nm_jns_tunj"`
	CreateDate  types.SQLServerTime `db:"create_date" json:"waktu_ditambahkan"`
	LastUpdate  types.SQLServerTime `db:"last_update" json:"terakhir_diubah"`
	ExpiredDate *time.Time          `db:"expired_date" json:"-"`
}

type JenisUnit struct {
	IDSms                  utils.UUID           `db:"id_sms" json:"id_sms"`
	IDFakUnila             utils.NullUUID       `db:"id_fak_unila" json:"id_fak_unila"`
	IDLembNonSP            *string              `db:"id_lemb_non_sp" json:"id_lemb_non_sp"`
	IDJurUnila             utils.NullUUID       `db:"id_jur_unila" json:"id_jur_unila"`
	IDJur                  *string              `db:"id_jur" json:"id_jur"`
	NmJur                  *string              `db:"nm_jur" json:"nm_jur"`
	IDJenjDidik            string               `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik            string               `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	NmLemb                 string               `db:"nm_lemb" json:"nm_lemb"`
	KdKl                   *string              `db:"kd_kl" json:"kd_kl"`
	KdSatker               *string              `db:"kd_satker" json:"kd_satker"`
	SmtMulai               *string              `db:"smt_mulai" json:"smt_mulai"`
	ASelenggaraSubst       int                  `db:"a_selenggara_subst" json:"a_selenggara_subst"`
	StatProdiUnila         *string              `db:"stat_prodi_unila" json:"stat_prodi_unila"`
	TglTutup               *time.Time           `db:"tgl_tutup" json:"tgl_tutup"`
	KodeSnpmb              *string              `db:"kode_snpmb" json:"kode_snpmb"`
	KodeProdi              *string              `db:"kode_prodi" json:"kode_prodi"`
	NmProdiEnglish         *string              `db:"nm_prodi_english" json:"nm_prodi_english"`
	KpstPd                 *int                 `db:"kpst_pd" json:"kpst_pd"`
	SKsLulus               *int                 `db:"sks_lulus" json:"sks_lulus"`
	GelarLulusan           *string              `db:"gelar_lulusan" json:"gelar_lulusan"`
	StatProdi              *string              `db:"stat_prodi" json:"stat_prodi"`
	PoleseiNilai           *string              `db:"polesei_nilai" json:"polesei_nilai"`
	AKependidikan          *string              `db:"a_kependidikan" json:"a_kependidikan"`
	Jln                    *string              `db:"jln" json:"jln"`
	Rt                     *int                 `db:"rt" json:"rt"`
	Rw                     *int                 `db:"rw" json:"rw"`
	NmDsn                  *string              `db:"nm_dsn" json:"nm_dsn"`
	DsKel                  *string              `db:"ds_kel" json:"ds_kel"`
	KodePos                *string              `db:"kode_pos" json:"kode_pos"`
	Lintang                *decimal.Decimal     `db:"lintang" json:"lintang"`
	Bujur                  *decimal.Decimal     `db:"bujur" json:"bujur"`
	NoTel                  *string              `db:"no_tel" json:"no_tel"`
	NoFax                  *string              `db:"no_fax" json:"no_fax"`
	Email                  *string              `db:"email" json:"email"`
	Website                *string              `db:"website" json:"website"`
	Singkatan              *string              `db:"singkatan" json:"singkatan"`
	TglBerdiri             *types.SQLServerTime `db:"tgl_berdiri" json:"tgl_berdiri"`
	SkSelenggara           *string              `db:"sk_selenggara" json:"sk_selenggara"`
	TglSkSelenggara        *types.SQLServerTime `db:"tgl_sk_selenggara" json:"tgl_sk_selenggara"`
	TmtSkSelenggara        *types.SQLServerTime `db:"tmt_sk_selenggara" json:"tmt_sk_selenggara"`
	TstSkSelenggara        *types.SQLServerTime `db:"tst_sk_selenggara" json:"tst_sk_selenggara"`
	SistemAjar             *int                 `db:"sistem_ajar" json:"sistem_ajar"`
	APjj                   *int                 `db:"a_pjj" json:"a_pjj"`
	APsdku                 *int                 `db:"a_psdku" json:"a_psdku"`
	LuasLab                *decimal.Decimal     `db:"luas_lab" json:"luas_lab"`
	KapasitasPrakSatuShift *int                 `db:"kapasitas_prak_satu_shift" json:"kapasitas_prak_satu_shift"`
	JmlMhsPengguna         *int                 `db:"jml_mhs_pengguna" json:"jml_mhs_pengguna"`
	JmlJamPengguna         *int                 `db:"jml_jam_pengguna" json:"jml_jam_pengguna"`
	JmlJamPenggunaan       *int                 `db:"jml_jam_penggunaan" json:"jml_jam_penggunaan"`
	JmlProdiPengguna       *int                 `db:"jml_prodi_pengguna" json:"jml_prodi_pengguna"`
	JmlModulPrakSendiri    *int                 `db:"jml_modul_prak_sendiri" json:"jml_modul_prak_sendiri"`
	JmlModulPrakLain       *int                 `db:"jml_modul_prak_lain" json:"jml_modul_prak_lain"`
	FungsiSelainPrak       *string              `db:"fungsi_selain_prak" json:"fungsi_selain_prak"`
	PenggunaanLab          *string              `db:"penggunaan_lab" json:"penggunaan_lab"`
	APkl                   *int                 `db:"a_pkl" json:"a_pkl"`
	IDSp                   utils.UUID           `db:"id_sp" json:"id_sp"`
	IDJnsSms               int                  `db:"id_jns_sms" json:"id_jns_sms"`
	NmJnsSms               string               `db:"nm_jns_sms" json:"nm_jns_sms"`
	IDFungsiLab            string               `db:"id_fungsi_lab" json:"id_fungsi_lab"`
	NmFungsiLab            string               `db:"nm_fungsi_lab" json:"nm_fungsi_lab"`
	IDKelUsaha             string               `db:"id_kel_usaha" json:"id_kel_usaha"`
	NmKelUsaha             string               `db:"nm_kel_usaha" json:"nm_kel_usaha"`
	IDBlob                 *string              `db:"id_blob" json:"id_blob"`
	IDWil                  string               `db:"id_wil" json:"id_wil"`
	NmWil                  string               `db:"nm_wil" json:"nm_wil"`
	IDIndukSms             utils.NullUUID       `db:"id_induk_sms" json:"id_induk_sms"`
	CreateDate             types.SQLServerTime  `db:"create_date" json:"waktu_ditambahkan"`
	IDCreator              utils.UUID           `db:"id_creator" json:"-"`
	LastUpdate             types.SQLServerTime  `db:"last_update" json:"-"`
	IDUpdater              *utils.NullUUID      `db:"id_updater" json:"-"`
	SoftDelete             int                  `db:"soft_delete" json:"-"`
	LastSync               types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}
