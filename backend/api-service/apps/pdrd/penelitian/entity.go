package penelitian

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

type Publikasi struct {
	IDPublikasi      utils.UUID           `db:"id_publikasi" json:"id_publikasi"`
	IDJnsPub         int                  `db:"id_jns_pub" json:"id_jns_pub"`
	NmJnsPub         string               `db:"nm_jns_pub" json:"nm_jns_pub"`
	Judul            string               `db:"judul" json:"judul"`
	JudulChapter     *string              `db:"judul_chapter" json:"judul_chapter"`
	JudulAsli        *string              `db:"judul_asli" json:"judul_asli"`
	Abstrak          *string              `db:"abstrak" json:"abstrak"`
	NamaJurnal       *string              `db:"nama_jurnal" json:"nama_jurnal"`
	LamanJurnal      *string              `db:"laman_jurnal" json:"laman_jurnal"`
	TglTerbit        *types.SQLServerTime `db:"tgl_terbit" json:"tgl_terbit"`
	Edisi            *string              `db:"edisi" json:"edisi"`
	ImpactJurnal     *int                 `db:"impact_jurnal" json:"impact_jurnal"`
	Vol              *int                 `db:"vol" json:"vol"`
	No               *int                 `db:"no" json:"no"`
	Hal              *string              `db:"hal" json:"hal"`
	JmlHal           *int                 `db:"jml_hal" json:"jml_hal"`
	Penerbit         *string              `db:"penerbit" json:"penerbit"`
	Kota             *string              `db:"kota" json:"kota"`
	ASeminar         *int                 `db:"a_seminar" json:"a_seminar"`
	AProsiding       *int                 `db:"a_prosiding" json:"a_prosiding"`
	Dimensi          *string              `db:"dimensi" json:"dimensi"`
	Bahasa           *string              `db:"bahasa" json:"bahasa"`
	NoPaten          *string              `db:"no_paten" json:"no_paten"`
	PemberiPaten     *string              `db:"pemberi_paten" json:"pemberi_paten"`
	Doi              *string              `db:"doi" json:"doi"`
	Isbn             *string              `db:"isbn" json:"isbn"`
	Issn             *string              `db:"issn" json:"issn"`
	EIssn            *string              `db:"e_issn" json:"e_issn"`
	Url              *string              `db:"url" json:"url"`
	Ket              *string              `db:"ket" json:"ket"`
	PenggunaProdukJa *string              `db:"pengguna_produk_ja" json:"pengguna_produk_ja"`
	AKomersialisasi  int                  `db:"a_komersialisasi" json:"a_komersialisasi"`
	StatImporSinta   *int                 `db:"stat_impor_sinta" json:"stat_impor_sinta"`
	Quartile         *int                 `db:"quartile" json:"quartile"`
	IDKatCapaian     *int                 `db:"id_kat_capaian" json:"id_kat_capaian"`
	NmKatCapaian     *string              `db:"nm_kat_capaian" json:"nm_kat_capaian"`
	IDMediaPub       utils.UUID           `db:"id_media_pub" json:"id_media_pub"`
	NmJnsMedia       string               `db:"nm_jns_media" json:"nm_jns_media"`
	IDLitabmas       utils.NullUUID       `db:"id_litabmas" json:"id_litabmas"`
	JudulLitabmas    *string              `db:"judul_litabmas" json:"judul_litabmas"`
	CreateDate       types.SQLServerTime  `db:"create_date" json:"-"`
	IDCreator        utils.UUID           `db:"id_creator" json:"-"`
	LastUpdate       types.SQLServerTime  `db:"last_update" json:"terakhir_ditambahkan"`
	IDUpdater        utils.NullUUID       `db:"id_updater" json:"-"`
	SoftDelete       int                  `db:"soft_delete" json:"-"`
	LastSync         types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type Litabmas struct {
	IDLitabmas utils.UUID `db:"id_litabmas" json:"id_litabmas"`
	IDSdm      utils.UUID `db:"id_sdm" json:"id_sdm"`
	PdAnggotaLitabmas
	IDLembIptek        utils.UUID           `db:"id_lemb_iptek" json:"id_lemb_iptek"`
	NmLemb             string               `db:"nm_lemb" json:"nm_lemb"`
	JudulLitabmas      string               `db:"judul_litabmas" json:"judul_litabmas"`
	LamaKegiatan       int                  `db:"lama_kegiatan" json:"lama_kegiatan"`
	ThnLaksKe          int                  `db:"thn_laks_ke" json:"thn_laks_ke"`
	DanaDikti          int                  `db:"dana_dikti" json:"dana_dikti"`
	DanaPt             int                  `db:"dana_pt" json:"dana_pt"`
	DanaInstitusiLain  int                  `db:"dana_institusi_lain" json:"dana_institusi_lain"`
	InKind             *string              `db:"in_kind" json:"in_kind"`
	StatAktif          int                  `db:"stat_aktif" json:"stat_aktif"`
	JnsLitabmas        *string              `db:"jns_litabmas" json:"jns_litabmas"`
	SkTugas            *string              `db:"sk_tugas" json:"sk_tugas"`
	TglSkTugas         *types.SQLServerTime `db:"tgl_sk_tugas" json:"tgl_sk_tugas"`
	LokasiKegiatan     *string              `db:"lokasi_kegiatan" json:"lokasi_kegiatan"`
	IDSkim             utils.NullUUID       `db:"id_skim" json:"id_skim"`
	NmSkim             *string              `db:"nm_skim" json:"nm_skim"`
	IDThnUsulan        int                  `db:"id_thn_usulan" json:"id_thn_usulan"`
	IDThnKegiatan      int                  `db:"id_thn_kegiatan" json:"id_thn_kegiatan"`
	IDThnLaks          int                  `db:"id_thn_laks" json:"id_thn_laks"`
	IDLanjutanLitabmas utils.NullUUID       `db:"id_lanjutan_litabmas" json:"id_lanjutan_litabmas"`
	IDKelBidang        utils.NullUUID       `db:"id_kel_bidang" json:"id_kel_bidang"`
	NmKelBidang        *string              `db:"nm_kel_bidang" json:"nm_kel_bidang"`
	IDTse              *int                 `db:"id_tse" json:"id_tse"`
	NmTse              *string              `db:"nm_tse" json:"nm_tse"`
	IDSmi              utils.NullUUID       `db:"id_smi" json:"id_smi"`
	KodeSmi            *string              `db:"kode_smi" json:"kode_smi"`
	IDJnsLit           *int                 `db:"id_jns_lit" json:"id_jns_lit"`
	NmJnsLit           *string              `db:"nm_jns_lit" json:"nm_jns_lit"`
	CreateDate         types.SQLServerTime  `db:"create_date" json:"-"`
	IDCreator          utils.UUID           `db:"id_creator" json:"-"`
	LastUpdate         types.SQLServerTime  `db:"last_update" json:"terakhir_ditambahkan"`
	IDUpdater          utils.NullUUID       `db:"id_updater" json:"-"`
	SoftDelete         int                  `db:"soft_delete" json:"-"`
	LastSync           types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type PdAnggotaLitabmas struct {
	IDPdAngLitabmas utils.NullUUID      `db:"id_pd_ang_litabmas" json:"id_pd_ang_litabmas"`
	IDLitabmas      utils.NullUUID      `db:"id_litabmas" json:"id_litabmas"`
	IDPd            utils.NullUUID      `db:"id_pd" json:"id_pd"`
	PeranLitabmas   *string             `db:"peran_litabmas" json:"peran_litabmas"`
	StatAktif       *int                `db:"stat_aktif" json:"stat_aktif"`
	NmPd            *string             `db:"nm_pd" json:"nm_pd"`
	Nipd            *string             `db:"nipd" json:"nipd"`
	CreateDate      types.SQLServerTime `db:"create_date" json:"-"`
	IDCreator       utils.NullUUID      `db:"id_creator" json:"-"`
	LastUpdate      types.SQLServerTime `db:"last_update" json:"terakhir_ditambahkan"`
	IDUpdater       utils.NullUUID      `db:"id_updater" json:"-"`
	SoftDelete      *int                `db:"soft_delete" json:"-"`
	LastSync        types.SQLServerTime `db:"last_sync" json:"last_sync"`
}
