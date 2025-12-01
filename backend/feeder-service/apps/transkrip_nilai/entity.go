package transkrip_nilai

import "time"

// TranskripNilai represents the pdrd.nilai_transkrip table
type TranskripNilai struct {
	IDRegPD             string     `db:"id_reg_pd" json:"id_reg_pd"`
	IDMK                string     `db:"id_mk" json:"id_mk"`
	IDKls               string     `db:"id_kls" json:"id_kls"`
	IDKonversiAktivitas *string    `db:"id_konversi_aktivitas" json:"id_konversi_aktivitas"`
	IDEkuivalensi       *string    `db:"id_ekuivalensi" json:"id_ekuivalensi"`
	NilaiAngka          *float64   `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf          *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks         *float64   `db:"nilai_indeks" json:"nilai_indeks"`
	SmtKe               int        `db:"smt_ke" json:"smt_ke"`
	SksMK               float64    `db:"sks_mk" json:"sks_mk"`
	CreateDate          time.Time  `db:"create_date" json:"create_date"`
	IDCreator           string     `db:"id_creator" json:"id_creator"`
	LastUpdate          time.Time  `db:"last_update" json:"last_update"`
	IDUpdater           *string    `db:"id_updater" json:"id_updater"`
	SoftDelete          int        `db:"soft_delete" json:"soft_delete"`
	LastSync            time.Time  `db:"last_sync" json:"last_sync"`
}

// TranskripNilaiListItem represents a row in the combined view
type TranskripNilaiListItem struct {
	ID                  string     `db:"id" json:"id"`
	IDRegPD             string     `db:"id_reg_pd" json:"id_reg_pd"`
	NIM                 *string    `db:"nim" json:"nim"`
	NamaMahasiswa       *string    `db:"nama_mahasiswa" json:"nama_mahasiswa"`
	NamaProdi           *string    `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang         *string    `db:"nama_jenjang" json:"nama_jenjang"`
	IDMK                string     `db:"id_mk" json:"id_mk"`
	KodeMK              *string    `db:"kode_mk" json:"kode_mk"`
	NamaMK              *string    `db:"nama_mk" json:"nama_mk"`
	SksMK               float64    `db:"sks_mk" json:"sks_mk"`
	NilaiAngka          *float64   `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf          *string    `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks         *float64   `db:"nilai_indeks" json:"nilai_indeks"`
	SmtKe               int        `db:"smt_ke" json:"smt_ke"`
	IDKls               *string    `db:"id_kls" json:"id_kls"`
	NamaKelas           *string    `db:"nama_kelas" json:"nama_kelas"`
	IDKonversiAktivitas *string    `db:"id_konversi_aktivitas" json:"id_konversi_aktivitas"`
	IDEkuivalensi       *string    `db:"id_ekuivalensi" json:"id_ekuivalensi"`
	SumberNilai         string     `db:"sumber_nilai" json:"sumber_nilai"` // "kelas", "konversi", "transfer"
	LastSync            *time.Time `db:"last_sync" json:"last_sync"`
}

// TranskripNilaiStats represents statistics for the transkrip nilai
type TranskripNilaiStats struct {
	TotalTranskrip   int        `json:"total_transkrip"`
	TotalMahasiswa   int        `json:"total_mahasiswa"`
	TotalProdi       int        `json:"total_prodi"`
	TotalNilaiKelas  int        `json:"total_nilai_kelas"`
	TotalKonversi    int        `json:"total_konversi"`
	TotalTransfer    int        `json:"total_transfer"`
	LastSync         *time.Time `json:"last_sync"`
}

// ProdiListItem represents a prodi item for the helper dropdown
type ProdiListItem struct {
	IDProdi     string `db:"id_prodi" json:"id_prodi"`
	KodeProdi   string `db:"kode_prodi" json:"kode_prodi"`
	NamaProdi   string `db:"nama_prodi" json:"nama_prodi"`
	NamaJenjang string `db:"nama_jenjang" json:"nama_jenjang"`
}

// SemesterListItem represents a semester item for the helper dropdown
type SemesterListItem struct {
	IDSemester   string `db:"id_semester" json:"id_semester"`
	NamaSemester string `db:"nama_semester" json:"nama_semester"`
}

// ListFilter represents filter parameters for the list query
type ListFilter struct {
	Page         int     `query:"page"`
	Limit        int     `query:"limit"`
	Search       string  `query:"search"`
	IDProdi      *string `query:"id_prodi"`
	IDRegPD      *string `query:"id_reg_pd"`
	SumberNilai  *string `query:"sumber_nilai"` // "all", "kelas", "konversi", "transfer"
	SmtKe        *int    `query:"smt_ke"`
	OrderBy      string  `query:"order_by"`
	OrderDir     string  `query:"order_dir"`
}

// SyncFilter represents filter for sync operation
type SyncFilter struct {
	IDSemester []string `json:"id_semester"`
	IDProdi    *string  `json:"id_prodi"`
}

// PaginatedResponse represents paginated list response
type PaginatedResponse struct {
	Data       []*TranskripNilaiListItem `json:"data"`
	Total      int                       `json:"total"`
	Page       int                       `json:"page"`
	Limit      int                       `json:"limit"`
	TotalPages int                       `json:"total_pages"`
}

// FeederTranskripResponse represents the response from Feeder API GetTranskripMahasiswa
type FeederTranskripResponse struct {
	IDRegistrasiMahasiswa string  `json:"id_registrasi_mahasiswa"`
	IDMK                  string  `json:"id_matkul"`
	IDKelasKuliah         string  `json:"id_kelas_kuliah"`
	IDKonversiAktivitas   *string `json:"id_konversi_aktivitas"`
	IDNilaiTransfer       *string `json:"id_nilai_transfer"`
	NilaiAngka            *string `json:"nilai_angka"`
	NilaiHuruf            *string `json:"nilai_huruf"`
	NilaiIndeks           *string `json:"nilai_indeks"`
	SmtDiambil            *string `json:"smt_diambil"`
	SksMatkuliah          *string `json:"sks_mata_kuliah"`
}

// SyncResult represents the result of a sync operation
type SyncResult struct {
	TotalFetched int    `json:"total_fetched"`
	TotalSynced  int    `json:"total_synced"`
	TotalFailed  int    `json:"total_failed"`
	Message      string `json:"message"`
}
