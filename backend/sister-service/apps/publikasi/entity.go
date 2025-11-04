package publikasi

import "time"

// Publikasi represents a publication record from SISTER
type Publikasi struct {
	IDPublikasi       string     `db:"id_publikasi" json:"id_publikasi"`
	IDJnsPub          *int       `db:"id_jns_pub" json:"id_jns_pub"`
	Judul             string     `db:"judul" json:"judul"`
	JudulChapter      *string    `db:"judul_chapter" json:"judul_chapter"`
	JudulAsli         *string    `db:"judul_asli" json:"judul_asli"`
	NamaJurnal        *string    `db:"nama_jurnal" json:"nama_jurnal"`
	TglTerbit         *time.Time `db:"tgl_terbit" json:"tgl_terbit"`
	Edisi             *string    `db:"edisi" json:"edisi"`
	Vol               *int       `db:"vol" json:"vol"`
	No                *int       `db:"no" json:"no"`
	Hal               *string    `db:"hal" json:"hal"`
	JmlHal            *int       `db:"jml_hal" json:"jml_hal"`
	Penerbit          *string    `db:"penerbit" json:"penerbit"`
	ASeminar          *int       `db:"a_seminar" json:"a_seminar"`
	AProsiding        *int       `db:"a_prosiding" json:"a_prosiding"`
	NoPaten           *string    `db:"no_paten" json:"no_paten"`
	PemberiPaten      *string    `db:"pemberi_paten" json:"pemberi_paten"`
	DOI               *string    `db:"doi" json:"doi"`
	ISBN              *string    `db:"isbn" json:"isbn"`
	ISSN              *string    `db:"issn" json:"issn"`
	EISSN             *string    `db:"e_issn" json:"e_issn"`
	URL               *string    `db:"url" json:"url"`
	Ket               *string    `db:"ket" json:"ket"`
	StatImporSinta    *int       `db:"stat_impor_sinta" json:"stat_impor_sinta"`
	Quartile          *int       `db:"quartile" json:"quartile"`
	IDKatCapaian      *int       `db:"id_kat_capaian" json:"id_kat_capaian"`
	IDLitabmas        *string    `db:"id_litabmas" json:"id_litabmas"`
	CreateDate        time.Time  `db:"create_date" json:"create_date"`
	IDCreator         string     `db:"id_creator" json:"id_creator"`
	LastUpdate        time.Time  `db:"last_update" json:"last_update"`
	IDUpdater         *string    `db:"id_updater" json:"id_updater"`
	SoftDelete        int        `db:"soft_delete" json:"soft_delete"`
	LastSync          *time.Time `db:"last_sync" json:"last_sync"`
}

// TulisPub represents an author/penulis relationship for a publication
type TulisPub struct {
	IDTulisPub    string     `db:"id_tulis_pub" json:"id_tulis_pub"`
	IDPublikasi   string     `db:"id_publikasi" json:"id_publikasi"`
	IDSDM         *string    `db:"id_sdm" json:"id_sdm"`
	IDKatgiat     *int       `db:"id_katgiat" json:"id_katgiat"`
	IDPD          *string    `db:"id_pd" json:"id_pd"`
	IDOrang       *string    `db:"id_orang" json:"id_orang"`
	Urutan        int        `db:"urutan" json:"urutan"`
	Afiliasi      *string    `db:"afiliasi" json:"afiliasi"`
	PeranTulis    string     `db:"peran_tulis" json:"peran_tulis"`     // A/B/C/D
	JnsPenulis    string     `db:"jns_penulis" json:"jns_penulis"`     // 1/2/3
	ACorrAuthor   int        `db:"a_corr_author" json:"a_corr_author"` // 0 or 1
	NmPD          *string    `db:"nm_pd" json:"nm_pd"`
	NIPD          *string    `db:"nipd" json:"nipd"`
	IDAfiliasi    *string    `db:"id_afiliasi" json:"id_afiliasi"`
	JnsAfiliasi   *string    `db:"jns_afiliasi" json:"jns_afiliasi"`
	CreateDate    time.Time  `db:"create_date" json:"create_date"`
	IDCreator     string     `db:"id_creator" json:"id_creator"`
	LastUpdate    time.Time  `db:"last_update" json:"last_update"`
	IDUpdater     *string    `db:"id_updater" json:"id_updater"`
	SoftDelete    int        `db:"soft_delete" json:"soft_delete"`
	LastSync      *time.Time `db:"last_sync" json:"last_sync"`
}

// Sister API response structures

// SisterPublikasiListItem represents a publikasi item from Sister API list endpoint
type SisterPublikasiListItem struct {
	IDKategoriKegiatan int      `json:"id_kategori_kegiatan"`
	ID                 string   `json:"id"`
	Judul              string   `json:"judul"`
	Quartile           *int     `json:"quartile"`
	JenisPublikasi     string   `json:"jenis_publikasi"`
	Tanggal            *string  `json:"tanggal"`
	KategoriKegiatan   string   `json:"kategori_kegiatan"`
	AsalData           string   `json:"asal_data"`
	BidangKeilmuan     []string `json:"bidang_keilmuan"`
}

// SisterPublikasiDetail represents detailed publikasi data from Sister API
type SisterPublikasiDetail struct {
	ID                        string                    `json:"id"`
	IDJenisPublikasi          int                       `json:"id_jenis_publikasi"`
	Judul                     string                    `json:"judul"`
	JudulArtikel              *string                   `json:"judul_artikel"`
	JudulAsli                 *string                   `json:"judul_asli"`
	NamaJurnal                *string                   `json:"nama_jurnal"`
	Tanggal                   *string                   `json:"tanggal"`
	Edisi                     *string                   `json:"edisi"`
	Volume                    int                       `json:"volume"`
	Nomor                     int                       `json:"nomor"`
	Halaman                   *string                   `json:"halaman"`
	JumlahHalaman             int                       `json:"jumlah_halaman"`
	Penerbit                  *string                   `json:"penerbit"`
	Seminar                   int                       `json:"seminar"`
	Prosiding                 int                       `json:"prosiding"`
	NomorPaten                *string                   `json:"nomor_paten"`
	PemberiPaten              *string                   `json:"pemberi_paten"`
	DOI                       *string                   `json:"doi"`
	ISBN                      *string                   `json:"isbn"`
	ISSN                      *string                   `json:"issn"`
	EISSN                     *string                   `json:"e_issn"`
	Tautan                    *string                   `json:"tautan"`
	Keterangan                *string                   `json:"keterangan"`
	IDLitabmas                *string                   `json:"id_litabmas"`
	IDKategoriCapaianLuaran   int                       `json:"id_kategori_capaian_luaran"`
	Quartile                  int                       `json:"quartile"`
	KategoriKegiatan          string                    `json:"kategori_kegiatan"`
	JenisPublikasi            string                    `json:"jenis_publikasi"`
	IDKategoriKegiatan        int                       `json:"id_kategori_kegiatan"`
	AsalData                  string                    `json:"asal_data"`
	Penulis                   []SisterPublikasiPenulis  `json:"penulis"`
	Dokumen                   []SisterPublikasiDokumen  `json:"dokumen"`
}

// SisterPublikasiPenulis represents an author/penulis in the Sister API response
type SisterPublikasiPenulis struct {
	IDPenulis                 string  `json:"id_penulis"`
	Nama                      string  `json:"nama"`
	Urutan                    int     `json:"urutan"`
	Afiliasi                  *string `json:"afiliasi"`
	Peran                     string  `json:"peran"` // "Penulis", "Editor", etc.
	Jenis                     string  `json:"jenis"` // "Dosen", "Mahasiswa"
	CorrespondingAuthor       int     `json:"corresponding_author"`
	IDSDM                     *string `json:"id_sdm"`
	IDPesertaDidik            *string `json:"id_peserta_didik"`
	IDOrang                   *string `json:"id_orang"`
	NomorIndukPesertaDidik    *string `json:"nomor_induk_peserta_didik"`
}

// SisterPublikasiDokumen represents a document in the Sister API response
type SisterPublikasiDokumen struct {
	ID            string  `json:"id"`
	Nama          string  `json:"nama"`
	JenisDokumen  string  `json:"jenis_dokumen"`
	JenisFile     string  `json:"jenis_file"`
	NamaFile      string  `json:"nama_file"`
	Tautan        *string `json:"tautan"`
	Keterangan    *string `json:"keterangan"`
}

// Sync result structures

// PublikasiSyncResult represents the result of syncing one publikasi
type PublikasiSyncResult struct {
	IDPublikasi string `json:"id_publikasi"`
	Judul       string `json:"judul"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
}

// BatchPublikasiSyncResult represents the result of syncing all publikasi for one dosen
type BatchPublikasiSyncResult struct {
	TotalProcessed int                   `json:"total_processed"`
	TotalSuccess   int                   `json:"total_success"`
	TotalFailed    int                   `json:"total_failed"`
	Duration       string                `json:"duration"`
	Results        []PublikasiSyncResult `json:"results"`
	SyncedBy       string                `json:"synced_by"`
}

// BatchAllSyncResult represents the result of batch sync all dosen
type BatchAllSyncResult struct {
	TotalDosen      int      `json:"total_dosen"`
	TotalSuccess    int      `json:"total_success"`
	TotalFailed     int      `json:"total_failed"`
	TotalPublikasi  int      `json:"total_publikasi"`
	Duration        string   `json:"duration"`
	SyncedBy        string   `json:"synced_by"`
	FailedDosen     []string `json:"failed_dosen,omitempty"`
}

// Statistics and list structures

// PublikasiStats represents publikasi statistics
type PublikasiStats struct {
	TotalPublikasi      int `json:"total_publikasi" db:"total_publikasi"`
	TotalJurnalNasional int `json:"total_jurnal_nasional" db:"total_jurnal_nasional"`
	TotalJurnalIntl     int `json:"total_jurnal_intl" db:"total_jurnal_intl"`
	TotalProseeding     int `json:"total_proseeding" db:"total_proseeding"`
	TotalBuku           int `json:"total_buku" db:"total_buku"`
}

// PenulisInfo represents simplified author info for list view
type PenulisInfo struct {
	Nama       string `json:"nama"`
	JenisPeran string `json:"jenis_peran"` // e.g., "Penulis (Dosen)", "Editor (Mahasiswa)"
}

// PublikasiListItem represents a publikasi item with additional fields for list view
type PublikasiListItem struct {
	Publikasi
	JenisPublikasiNama *string        `json:"jenis_publikasi_nama" db:"jenis_publikasi_nama"`
	Penulis            []*PenulisInfo `json:"penulis"`
}

// PublikasiListResult represents paginated publikasi list
type PublikasiListResult struct {
	Data       []*PublikasiListItem `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"total_pages"`
}

// PublikasiWithAuthors represents publikasi with author details
type PublikasiWithAuthors struct {
	Publikasi
	Penulis []TulisPub `json:"penulis"`
}
