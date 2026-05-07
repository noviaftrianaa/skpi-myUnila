package types

// ============================================================================
// Query Parameters for PDRD Module
// ============================================================================

// PaginationParams untuk parameter pagination standar
type PaginationParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"` // asc atau desc
}

// NormalizePagination set default values untuk pagination
func (p *PaginationParams) NormalizePagination() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	if p.Order == "" {
		p.Order = "ASC"
	}
}

// Offset menghitung offset untuk query pagination
func (p *PaginationParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

type RegPdParams struct {
	PaginationParams
	IDRegPd        string  `query:"id_reg_pd"`        // Filter by ID registrasi mahasiswa
	IDSP           *string `query:"id_sp"`            // Filter by ID sekolah/instansi
	IDSms          *string `query:"id_sms"`           // Filter
	IDPd           *string `query:"id_pd"`            // Filter by ID peserta didik
	IDJnsDaftar    *int    `query:"id_jns_daftar"`    // Filter by jenis pendaftaran
	IDJalurDaftar  *int    `query:"id_jalur_daftar"`  // Filter by jalur pendaftaran
	IDPembiayaan   *int    `query:"id_pembiayaan"`    // Filter by pembiayaan
	IDSmt          *int    `query:"id_smt"`           // Filter by semester
	IDPtAsal       *string `query:"id_pt_asal"`       // Filter by ID perguruan tinggi asal
	IDProdiAsal    *string `query:"id_prodi_asal"`    // Filter by ID prodi asal
	IDJnsKeluar    *string `query:"id_jns_keluar"`    // Filter by jenis keluar (1=Lulus)
	TahunLulus     *int    `query:"tahun_lulus"`      // Filter YEAR(tgl_keluar) = ? (untuk alumni per kohort)
	WithSkYudisium *bool   `query:"with_sk_yudisium"` // true = hanya yang tgl_sk_yudisium IS NOT NULL
}

type PesertaDidikDetailParams struct {
	PaginationParams
	IDPd              *string `query:"id_pd"`              // Filter by ID peserta didik
	IDKkAyah          *string `query:"id_kk_ayah"`         // Filter by ID KK ayah
	IDKkIbu           *string `query:"id_kk_ibu"`          // Filter by ID KK ibu
	IDKk              *string `query:"id_kk"`              // Filter by ID KK
	IDStatMhs         *string `query:"id_stat_mhs"`        // Filter by ID status mahasiswa
	IDAgama           *string `query:"id_agama"`           // Filter by ID agama
	IDKewarganegaraan *string `query:"id_kewarganegaraan"` // Filter by ID kewarganegaraan
	IDJnsTinggal      *string `query:"id_jns_tinggal"`     // Filter by ID jenis tinggal
	IDAlatTransport   *string `query:"id_alat_transport"`  // Filter by ID alat transport
	IDWil             *string `query:"id_wil"`             // Filter by ID wilayah
}

type StatusKuliahMahasiswaParams struct {
	PaginationParams
	IDRegPd   string  `query:"id_reg_pd"`   // Filter by ID registrasi mahasiswa
	IDSmt     *int    `query:"id_smt"`      // Filter by semester
	IDStatMhs *string `query:"id_stat_mhs"` // Filter by ID status mahasiswa
}

type PublikasiParams struct {
	PaginationParams
	IDJnsPub     *int    `query:"id_jns_pub"`     // Filter by ID jenis publikasi
	NamaJurnal   *string `query:"nama_jurnal"`    // Filter by nama jurnal
	Edisi        *string `query:"edisi"`          // Filter by edisi
	Penerbit     *string `query:"penerbit"`       // Filter by penerbit
	IDKatCapaian *int    `query:"id_kat_capaian"` // Filter by ID kategori capaian
	IDMediaPub   *string `query:"id_media_pub"`   // Filter by ID media publikasi
	IDLitabmas   *string `query:"id_litabmas"`    // Filter by ID litabmas
}

// ============================================================================
// SDM (Sumber Daya Manusia) — dosen + tendik dari pdrd.sdm (sync dari SISTER)
// ============================================================================
type SDMParams struct {
	PaginationParams
	IDSDM    *string `query:"id_sdm"`      // Filter by ID SDM
	IDJnsSDM *int    `query:"id_jns_sdm"`  // 12=Dosen, 13=Tendik, dst
	Nidn     *string `query:"nidn"`
	Nuptk    *string `query:"nuptk"`
	Nip      *string `query:"nip"`
	Jk       *string `query:"jk"`
}

type SDMDetailParams struct {
	PaginationParams
	IDSDM    *string `query:"id_sdm"`
	IDJnsSDM *int    `query:"id_jns_sdm"`
	Nidn     *string `query:"nidn"`
	Nuptk    *string `query:"nuptk"`
}

// Penugasan SDM (reg_ptk) — homebase dosen/tendik ke prodi/sekolah
type RegPtkParams struct {
	PaginationParams
	IDRegPtk      *string `query:"id_reg_ptk"`
	IDSDM         *string `query:"id_sdm"`
	IDSp          *string `query:"id_sp"`
	IDSms         *string `query:"id_sms"`
	IDJnsKeluar   *string `query:"id_jns_keluar"`   // null = aktif
	IDStatPegawai *int    `query:"id_stat_pegawai"`
	IDIkatanKerja *int    `query:"id_ikatan_kerja"`
	OnlyAktif     *bool   `query:"only_aktif"`      // short-circuit id_jns_keluar IS NULL
}

// Riwayat SDM generic — pakai ?type=pend|fungsional|pangkat|tugas_tambahan|sertifikasi
type RiwayatSDMParams struct {
	PaginationParams
	IDSDM string `query:"id_sdm"` // Wajib
	Type  string `query:"type"`   // pend_formal|fungsional|kepangkatan|tugas_tambahan|sertifikasi
}

// ============================================================================
// Pegawai (schema sikep) — tendik + pegawai struktural
// ============================================================================
type PegawaiParams struct {
	PaginationParams
	IDPegawai  *string `query:"id_pegawai"`
	JnsPegawai *string `query:"jns_pegawai"` // PNS / PPPK / Honorer / dst
	JnsTenaga  *string `query:"jns_tenaga"`  // Dosen / Tendik / Fungsional / Struktural
	Nip        *string `query:"nip"`
	IDGol      *int    `query:"id_gol"`
	IDJabfung  *int    `query:"id_jabfung"`
	IDJabstruk *int    `query:"id_jabstruk"`
	IDUnitOrga *int    `query:"id_unit_orga"`
	Status     *string `query:"status"`
}

// Batch 2: Nilai & Kehadiran & Aktivitas Mahasiswa
type NilaiSmtParams struct {
	PaginationParams
	IDRegPd *string `query:"id_reg_pd"`
	IDKls   *string `query:"id_kls"`
	IDSmt   *int    `query:"id_smt"`
	Nipd    *string `query:"nipd"`
}

type NilaiTranskripParams struct {
	PaginationParams
	IDRegPd *string `query:"id_reg_pd"` // Wajib
	IDMk    *string `query:"id_mk"`
	SmtKe   *int    `query:"smt_ke"`
	Nipd    *string `query:"nipd"`
}

type KehadiranMhsParams struct {
	PaginationParams
	IDHadirMhs *string `query:"id_hadir_mhs"`
	IDKls      *string `query:"id_kls"`
	IDRegPtk   *string `query:"id_reg_ptk"`
	StatHadir  *string `query:"stat_hadir"`
}

type AktMhsParams struct {
	PaginationParams
	IDAktMhs    *string `query:"id_akt_mhs"`
	IDJnsAktMhs *int    `query:"id_jns_akt_mhs"`
	IDSms       *string `query:"id_sms"`
	IDSmt       *int    `query:"id_smt"`
	AKomunal    *int    `query:"a_komunal"`
	AFlagship   *int    `query:"a_flagship"`
}

// ============================================================================
// Batch 3: Bimbingan & Uji Mahasiswa (dosen → akt_mhs pivot)
// ============================================================================
type BimbingMhsParams struct {
	PaginationParams
	IDSDM    *string `query:"id_sdm"`
	IDAktMhs *string `query:"id_akt_mhs"`
}

type UjiMhsParams struct {
	PaginationParams
	IDSDM    *string `query:"id_sdm"`
	IDAktMhs *string `query:"id_akt_mhs"`
}

// ============================================================================
// Batch 4: SDM lanjutan
// ============================================================================
type KinerjaDosenParams struct {
	PaginationParams
	IDRegPtk    *string `query:"id_reg_ptk"`
	IDSmt       *int    `query:"id_smt"`
	IDJabfung   *int    `query:"id_jabfung"`
	StatTugas   *string `query:"stat_tugas"`
	StatBelajar *string `query:"stat_belajar"`
}

type RwyPekerjaanParams struct {
	PaginationParams
	IDSDM       *string `query:"id_sdm"`
	IDPekerjaan *int    `query:"id_pekerjaan"`
	ALn         *int    `query:"a_ln"`
}

type RwyStrukturalParams struct {
	PaginationParams
	IDSDM    *string `query:"id_sdm"`
	IDJabTgs *int    `query:"id_jab_tgs"`
}

type DiklatParams struct {
	PaginationParams
	IDDiklat    *string `query:"id_diklat"`
	IDSDM       *string `query:"id_sdm"`
	IDJnsDiklat *int    `query:"id_jns_diklat"`
	Thn         *int    `query:"thn"`
	AValid      *int    `query:"a_valid"`
}

// ============================================================================
// Batch 6: SDM specialized
// ============================================================================
type DetaseringParams struct {
	PaginationParams
	IDSDM       *string `query:"id_sdm"`
	IDSpSumber  *string `query:"id_sp_sumber"`
	IDSpSasaran *string `query:"id_sp_sasaran"`
}

type VisitingScientistParams struct {
	PaginationParams
	IDSDM *string `query:"id_sdm"`
	IDSp  *string `query:"id_sp"`
}

// ============================================================================
// Batch 5: Institusi
// ============================================================================
type ProdiParams struct {
	PaginationParams
	IDSms       *string `query:"id_sms"`
	IDFakUnila  *string `query:"id_fak_unila"`
	IDJenjDidik *int    `query:"id_jenj_didik"`
	IDJnsSms    *int    `query:"id_jns_sms"`
	StatProdi   *string `query:"stat_prodi"` // A=Aktif, T=Tutup
	KodeProdi   *string `query:"kode_prodi"`
}

type SatuanPendidikanParams struct {
	PaginationParams
	IDSp *string `query:"id_sp"`
	Npsn *string `query:"npsn"`
}

type ProfilProdiParams struct {
	PaginationParams
	IDSms       *string `query:"id_sms"`
	IDThnAjaran *int    `query:"id_thn_ajaran"`
}

type AkreditasiProdiParams struct {
	PaginationParams
	IDSms       *string `query:"id_sms"`
	IDLembAkred *int    `query:"id_lemb_akred"`
	IDAkred     *int    `query:"id_akred"`
	AAktif      *int    `query:"a_aktif"`
}

type LitabmasParams struct {
	PaginationParams
	IDLitabmas    string  `query:"id_litabmas"`     // Filter by ID litabmas
	IDSdm         *string `query:"id_sdm"`          // Filter by ID SDM (wajib)
	JnsLitabmas   *string `query:"jns_litabmas"`    // Filter by jenis litabmas (L=Penelitian, M=Pengabdian)
	IDLembIptek   *string `query:"id_lemb_iptek"`   // Filter by ID lembaga iptek
	IDSkim        *string `query:"id_skim"`         // Filter by ID skim kegiatan
	IDThnKegiatan *int    `query:"id_thn_kegiatan"` // Filter by tahun kegiatan
	IDKelBidang   *string `query:"id_kel_bidang"`   // Filter by ID kelompok bidang
	IDTse         *int    `query:"id_tse"`          // Filter by ID tse
	IDSmi         *string `query:"id_smi"`          // Filter by ID smi
	IDJnsLit      *int    `query:"id_jns_lit"`      // Filter by ID jenis penelitian
}
