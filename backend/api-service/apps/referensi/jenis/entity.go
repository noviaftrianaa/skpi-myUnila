package jenis

import "time"

type JenisAktMhs struct {
	IDJnsAktMhs            int        `db:"id_jns_akt_mhs" json:"id_jns_akt_mhs"`
	NmJnsAktMhs            string     `db:"nm_jns_akt_mhs" json:"nm_jns_akt_mhs"`
	KetJnsMhs              *string    `db:"ket_jns_mhs" json:"ket_jns_mhs"`
	AKegiatanKampusMerdeka int        `db:"a_kegiatan_kampus_merdeka" json:"a_kegiatan_kampus_merdeka"`
	CreateDate             time.Time  `db:"create_date" json:"-"`
	LastUpdate             time.Time  `db:"last_update" json:"-"`
	ExpiredDate            *time.Time `db:"expired_date" json:"-"`
}

type JenisBahanAjar struct {
	IDJnsBhnAjar int        `db:"id_jns_bhn_ajar" json:"id_jns_bhn_ajar"`
	NmJnsBhnAjar string     `db:"nm_jns_bhn_ajar" json:"nm_jns_bhn_ajar"`
	CreateDate   time.Time  `db:"create_date" json:"-"`
	LastUpdate   time.Time  `db:"last_update" json:"-"`
	ExpiredDate  *time.Time `db:"expired_date" json:"-"`
}

type JenisBeasiswa struct {
	IDJnsBeasiswa int        `db:"id_jns_beasiswa" json:"id_jns_beasiswa"`
	IDSumberDana  int        `db:"id_sumber_dana" json:"id_sumber_dana"`
	NmJnsBeasiswa string     `db:"nm_jns_beasiswa" json:"nm_jns_beasiswa"`
	UPd           int        `db:"u_pd" json:"u_pd"`
	UPtk          int        `db:"u_ptk" json:"u_ptk"`
	UNonCa        int        `db:"u_non_ca" json:"u_non_ca"`
	KatBeasiswa   int        `db:"kat_beasiswa" json:"kat_beasiswa"`
	CreateDate    time.Time  `db:"create_date" json:"-"`
	LastUpdate    time.Time  `db:"last_update" json:"-"`
	ExpiredDate   *time.Time `db:"expired_date" json:"-"`
}

type JenisDiklat struct {
	IDJnsDiklat int        `db:"id_jns_diklat" json:"id_jns_diklat"`
	NmJnsDiklat string     `db:"nm_jns_diklat" json:"nm_jns_diklat"`
	UGuru       int        `db:"u_guru" json:"u_guru"`
	UDosen      int        `db:"u_dosen" json:"u_dosen"`
	UTendik     int        `db:"u_tendik" json:"u_tendik"`
	AValidasi   int        `db:"a_validasi" json:"a_validasi"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

type JenisDokumen struct {
	IDJnsDok    int        `db:"id_jns_dok" json:"id_jns_dok"`
	NmJnsDok    string     `db:"nm_jns_dok" json:"nm_jns_dok"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

type JenisEvaluasi struct {
	IDJnsEval   int        `db:"id_jns_eval" json:"id_jns_eval"`
	NmJnsEval   string     `db:"nm_jns_eval" json:"nm_jns_eval"`
	KetJnsEval  *string    `db:"ket_jns_eval" json:"ket_jns_eval,omitempty"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

type JenisHapusBuku struct {
	IDHapusBuku  string     `db:"id_hapus_buku" json:"id_hapus_buku"`
	KetHapusBuku string     `db:"ket_hapus_buku" json:"ket_hapus_buku"`
	CreateDate   time.Time  `db:"create_date" json:"-"`
	LastUpdate   time.Time  `db:"last_update" json:"-"`
	ExpiredDate  *time.Time `db:"expired_date" json:"-"`
}

type JenisJalurPekerjaan struct {
	IDJnsJalurKerja int        `db:"id_jns_jalur_kerja" json:"id_jns_jalur_kerja"`
	NmJnsJalurKerja string     `db:"nm_jns_jalur_kerja" json:"nm_jns_jalur_kerja"`
	CreateDate      time.Time  `db:"create_date" json:"-"`
	LastUpdate      time.Time  `db:"last_update" json:"-"`
	ExpiredDate     *time.Time `db:"expired_date" json:"-"`
}

type JenisKeluar struct {
	IDJnsKeluar string     `db:"id_jns_keluar" json:"id_jns_keluar"`
	KetKeluar   string     `db:"ket_keluar" json:"ket_keluar"`
	APd         int        `db:"a_pd" json:"a_pd"`
	APtk        int        `db:"a_ptk" json:"a_ptk"`
	ASdmIptek   int        `db:"a_sdm_iptek" json:"a_sdm_iptek"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}

type JenisKepanitiaan struct {
	IDJnsPanitia int        `db:"id_jns_panitia" json:"id_jns_panitia"`
	NmJnsPanitia string     `db:"nm_jns_panitia" json:"nm_jns_panitia"`
	CreateDate   time.Time  `db:"create_date" json:"-"`
	LastUpdate   time.Time  `db:"last_update" json:"-"`
	ExpiredDate  *time.Time `db:"expired_date" json:"-"`
}

type JenisKesejahteraan struct {
	IDJnsSejahtera int        `db:"id_jns_sejahtera" json:"id_jns_sejahtera"`
	NmJnsSejahtera string     `db:"nm_jns_sejahtera" json:"nm_jns_sejahtera"`
	CreateDate     time.Time  `db:"create_date" json:"-"`
	LastUpdate     time.Time  `db:"last_update" json:"-"`
	ExpiredDate    *time.Time `db:"expired_date" json:"-"`
}

type JenisKeuangan struct {
	IDJnsKeuangan int        `db:"id_jns_keuangan" json:"id_jns_keuangan"`
	NmJnsKeuangan string     `db:"nm_jns_keuangan" json:"nm_jns_keuangan"`
	APengeluaraan int        `db:"a_pengeluaran" json:"a_pengeluaran"`
	APemasukan    int        `db:"a_pemasukan" json:"a_pemasukan"`
	CreateDate    time.Time  `db:"create_date" json:"-"`
	LastUpdate    time.Time  `db:"last_update" json:"-"`
	ExpiredDate   *time.Time `db:"expired_date" json:"-"`
}

type JenisLembaga struct {
	IDJnsLemb            int        `db:"id_jns_lemb" json:"id_jns_lemb"`
	NmJnsLemb            string     `db:"nm_jns_lemb" json:"nm_jns_lemb"`
	ASp                  int        `db:"a_sp" json:"a_sp"`
	ALembAkred           int        `db:"a_lemb_akred" json:"a_lemb_akred"`
	APengelolaPendidikan int        `db:"a_pengelola_pendidikan" json:"a_pengelola_pendidikan"`
	ASms                 int        `db:"a_sms" json:"a_sms"`
	ATmptPengawas        int        `db:"a_tmpt_pengawas" json:"a_tmpt_pengawas"`
	ALembIptek           int        `db:"a_lemb_iptek" json:"a_lemb_iptek"`
	ASmi                 int        `db:"a_smi" json:"a_smi"`
	Sort                 int        `db:"sort" json:"sort"`
	CreateDate           time.Time  `db:"create_date" json:"-"`
	LastUpdate           time.Time  `db:"last_update" json:"-"`
	ExpiredDate          *time.Time `db:"expired_date" json:"-"`
}

type JenisMediaPub struct {
	IDJnsMedia  int        `db:"id_jns_media" json:"id_jns_media"`
	NmJnsMedia  string     `db:"nm_jns_media" json:"nm_jns_media"`
	CreateDate  time.Time  `db:"create_date" json:"-"`
	LastUpdate  time.Time  `db:"last_update" json:"-"`
	ExpiredDate *time.Time `db:"expired_date" json:"-"`
}
