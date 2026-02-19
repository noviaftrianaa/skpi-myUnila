package pesertadidik

import (
	"time"

	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// PesertaDidik adalah entity dari tabel pdrd.peserta_didik
type PesertaDidik struct {
	IDPd              utils.UUID           `db:"id_pd" json:"id_pd"`
	NmPd              string               `db:"nm_pd" json:"nm_pd"`
	Jk                *string              `db:"jk" json:"jk"`
	Nisn              *string              `db:"nisn" json:"nisn"`
	Nik               *string              `db:"nik" json:"nik"`
	TmptLahir         types.SQLServerTime  `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir          *types.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	Jln               *string              `db:"jln" json:"jln"`
	Rt                *int                 `db:"rt" json:"rt"`
	Rw                *int                 `db:"rw" json:"rw"`
	NmDsn             *string              `db:"nm_dsn" json:"nm_dsn"`
	DsKel             *string              `db:"ds_kel" json:"ds_kel"`
	KodePos           *string              `db:"kode_pos" json:"kode_pos"`
	TlpnRumah         *string              `db:"tlpn_rumah" json:"tlpn_rumah"`
	TlpnHp            *string              `db:"tlpn_hp" json:"tlpn_hp"`
	Email             *string              `db:"email" json:"email"`
	APmpap            int                  `db:"a_pmpap" json:"a_pmpap"`
	ABidikmisi        int                  `db:"a_bidikmisi" json:"a_bidikmisi"`
	ABebasBiaya       int                  `db:"a_bebas_biaya" json:"a_bebas_biaya"`
	NmWali            *string              `db:"nm_wali" json:"nm_wali"`
	TglLahirWali      *types.SQLServerTime `db:"tgl_lahir_wali" json:"tgl_lahir_wali"`
	IDPendidikanWali  *int                 `db:"id_pendidikan_wali" json:"id_pendidikan_wali"`
	IDPekerjaanWali   *int                 `db:"id_pekerjaan_wali" json:"id_pekerjaan_wali"`
	IDPenghasilanWali *int                 `db:"id_penghasilan_wali" json:"id_penghasilan_wali"`
	NMAyah            *string              `db:"nm_ayah" json:"nm_ayah"`
	TglLahirAyah      *types.SQLServerTime `db:"tgl_lahir_ayah" json:"tgl_lahir_ayah"`
	NikAyah           *string              `db:"nik_ayah" json:"nik_ayah"`
	IDPendidikanAyah  *int                 `db:"id_pendidikan_ayah" json:"id_pendidikan_ayah"`
	IDPekerjaanAyah   *int                 `db:"id_pekerjaan_ayah" json:"id_pekerjaan_ayah"`
	IDPenghasilanAyah *int                 `db:"id_penghasilan_ayah" json:"id_penghasilan_ayah"`
	IDKkAyah          *int                 `db:"id_kk_ayah" json:"id_kk_ayah"`
	NmIbuKandung      *string              `db:"nm_ibu_kandung" json:"nm_ibu_kandung"`
	TglLahitIbu       *types.SQLServerTime `db:"tgl_lahir_ibu" json:"tgl_lahir_ibu"`
	NikIbu            *string              `db:"nik_ibu" json:"nik_ibu"`
	IDPendidikanIbu   *int                 `db:"id_pendidikan_ibu" json:"id_pendidikan_ibu"`
	IDPekerjaanIbu    *int                 `db:"id_pekerjaan_ibu" json:"id_pekerjaan_ibu"`
	IDPenghasilanIbu  *int                 `db:"id_penghasilan_ibu" json:"id_penghasilan_ibu"`
	IDKkIbu           *int                 `db:"id_kk_ibu" json:"id_kk_ibu"`
	ATerimaKps        int                  `db:"a_terima_kps" json:"a_terima_kps"`
	NoKps             *string              `db:"no_kps" json:"no_kps"`
	IDKk              *int                 `db:"id_kk" json:"id_kk"`
	IDKewarganegaraan string               `db:"id_kewarganegaraan" json:"id_kewarganegaraan"`
	IDAgama           int                  `db:"id_agama" json:"id_agama"`
	IDBlob            utils.NullUUID       `db:"id_blob" json:"id_blob"`
	IDJnsTinggal      *int                 `db:"id_jns_tinggal" json:"id_jns_tinggal"`
	IDStatMhs         string               `db:"id_stat_mhs" json:"id_stat_mhs"`
	IDAlatTransport   *int                 `db:"id_alat_transport" json:"id_alat_transport"`
	IDWil             *string              `db:"id_wil" json:"id_wil"`
	CreateDate        types.SQLServerTime  `db:"create_date" json:"waktu_ditambahkan"`
	IDCreator         utils.UUID           `db:"id_creator" json:"id_creator"`
	LastUpdate        types.SQLServerTime  `db:"last_update" json:"terakhir_diubah"`
	IDUpdater         utils.NullUUID       `db:"id_updater" json:"id_updater"`
	SoftDelete        int                  `db:"soft_delete" json:"-"`
	LastSync          types.SQLServerTime  `db:"last_sync" json:"-"`
}

// RegPd adalah entity dari tabel pdrd.reg_pd (Registrasi Peserta Didik)
type RegPd struct {
	IDRegPd           utils.UUID           `db:"id_reg_pd" json:"id_reg_pd"`
	IDSp              utils.UUID           `db:"id_sp" json:"id_sp"`
	IDSms             *utils.UUID          `db:"id_sms" json:"id_sms"`
	IDPd              utils.UUID           `db:"id_pd" json:"id_pd"`
	IDJnsDaftar       *int                 `db:"id_jns_daftar" json:"id_jns_daftar"`
	IDJalurDaftar     *int                 `db:"id_jalur_daftar" json:"id_jalur_daftar"`
	IDPembiayaan      *int                 `db:"id_pembiayaan" json:"id_pembiayaan"`
	IDSmt             *string              `db:"id_smt" json:"id_smt"`
	TglMasukSp        *time.Time           `db:"tgl_masuk_sp" json:"tgl_masuk_sp"`
	Nipd              *string              `db:"nipd" json:"nipd"`
	IDSemesterMasuk   *string              `db:"id_semester_masuk" json:"id_semester_masuk"`
	IDPtAsal          *utils.UUID          `db:"id_pt_asal" json:"id_pt_asal"`
	NmPtAsal          *string              `db:"nm_pt_asal" json:"nm_pt_asal"`
	IDProdiAsal       *utils.UUID          `db:"id_prodi_asal" json:"id_prodi_asal"`
	NmProdiAsal       *string              `db:"nm_prodi_asal" json:"nm_prodi_asal"`
	IDJnsKeluar       *string              `db:"id_jns_keluar" json:"id_jns_keluar"`
	TglKeluar         *time.Time           `db:"tgl_keluar" json:"tgl_keluar"`
	Ket               *string              `db:"ket" json:"ket"`
	Skhun             *string              `db:"skhun" json:"skhun"`
	NoPesertaUjian    *string              `db:"no_peserta_ujian" json:"no_peserta_ujian"`
	NoSeriIjazah      *string              `db:"no_seri_ijazah" json:"no_seri_ijazah"`
	AsalDataIjazah    *string              `db:"asal_data_ijazah" json:"asal_data_ijazah"`
	BidangMayor       *string              `db:"bidang_mayor" json:"bidang_mayor"`
	BidangMinor       *string              `db:"bidang_minor" json:"bidang_minor"`
	SksDiakui         *float64             `db:"sks_diakui" json:"sks_diakui"`
	JalurSkripsi      *int                 `db:"jalur_skripsi" json:"jalur_skripsi"`
	JudulSkripsi      *string              `db:"judul_skripsi" json:"judul_skripsi"`
	BlnAwalBimbingan  *time.Time           `db:"bln_awal_bimbingan" json:"bln_awal_bimbingan"`
	BlnAkhirBimbingan *time.Time           `db:"bln_akhir_bimbingan" json:"bln_akhir_bimbingan"`
	SkYudisium        *string              `db:"sk_yudisium" json:"sk_yudisium"`
	TglSkYudisium     *time.Time           `db:"tgl_sk_yudisium" json:"tgl_sk_yudisium"`
	Ipk               *float64             `db:"ipk" json:"ipk"`
	SertProf          *string              `db:"sert_prof" json:"sert_prof"`
	APindahMhsAsing   *int                 `db:"a_pindah_mhs_asing" json:"a_pindah_mhs_asing"`
	BiayaMasukKuliah  *float64             `db:"biaya_masuk_kuliah" json:"biaya_masuk_kuliah"`
	CreateDate        types.SQLServerTime  `db:"create_date" json:"waktu_ditambahkan"`
	IDCreator         *utils.UUID          `db:"id_creator" json:"id_creator"`
	LastUpdate        types.SQLServerTime  `db:"last_update" json:"terakhir_diubah"`
	IDUpdater         *utils.UUID          `db:"id_updater" json:"id_updater"`
	SoftDelete        *int                 `db:"soft_delete" json:"-"`
	LastSync          *types.SQLServerTime `db:"last_sync" json:"-"`
}
