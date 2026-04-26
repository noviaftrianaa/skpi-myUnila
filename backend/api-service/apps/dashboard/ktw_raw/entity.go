// Package ktwraw — KTW (Kelulusan Tepat Waktu) raw data endpoints.
//
// Berbeda dengan apps/dashboard/ktw yang proxy ke public-service (data agregat
// untuk publik), modul ini query LANGSUNG ke pdrd untuk dapet RAW row level —
// dipakai aplikasi client (authenticated, per-user authorization).
//
// Formula KTW IDENTIK dengan public-service KtwRepository.php (definisi strict
// PDDIKTI) supaya data konsisten lintas kanal:
//
//   - Cohort filter: id_jns_daftar = 1 (Maba murni saja, exclude
//     Pindahan/RPL/Lintas Jalur/Alih Jenjang)
//   - Periode masuk: MONTH(tgl_masuk_sp) >= 7 (Gasal) + YEAR(...) = cohortYear
//   - id_sp = UNILA_ID_SP (filter institusi Unila)
//   - Masa studi (years) = ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25, 2)
//   - Status:
//       * lulus_tepat       = id_jns_keluar='1' AND tgl_keluar <= cutoff AND masa_studi <= masa_normatif
//       * lulus_terlambat   = id_jns_keluar='1' AND tgl_keluar <= cutoff AND masa_studi >  masa_normatif
//       * masih_aktif       = id_jns_keluar IS NULL
//       * keluar_non_lulus  = id_jns_keluar IN ('2','3','4','5','6','7')
package ktwraw

// MasaNormatif (tahun) per jenjang — sama dengan public-service.
var MasaNormatif = map[string]float64{
	"D3": 3.0,
	"D4": 4.0,
	"S1": 4.0,
	"S2": 2.0,
	"S3": 3.0,
}

// JenjangMap: id_jenj_didik (pdut) ke kode jenjang.
var JenjangMap = map[int]string{
	22: "D3",
	23: "D4",
	30: "S1",
	35: "S2",
	40: "S3",
}

// JenjangReverseMap: kode jenjang ke id_jenj_didik.
var JenjangReverseMap = map[string]int{
	"D3": 22,
	"D4": 23,
	"S1": 30,
	"S2": 35,
	"S3": 40,
}

// JnsDaftarMaba: id_jns_daftar = 1 → "Peserta didik baru" (Maba murni).
const JnsDaftarMaba = 1

// UnilaIDSP: ID Satuan Pendidikan Universitas Lampung di pdut.
// Hardcoded di public-service via env UNILA_ID_SP (default ini).
const UnilaIDSP = "E2B705A7-173E-464A-9FAC-509128709515"

// =============================================================================
// Request params
// =============================================================================

// PerFakultasParams — filter untuk endpoint per-fakultas.
type PerFakultasParams struct {
	Cohort  int    `query:"cohort"`  // tahun angkatan, wajib (mis. 2020)
	Jenjang string `query:"jenjang"` // S1|S2|S3|D3|D4, default S1
	Cutoff  string `query:"cutoff"`  // YYYY-MM-DD, default hari ini
}

// PerProdiParams — filter untuk endpoint per-prodi.
type PerProdiParams struct {
	Cohort     int    `query:"cohort"`
	Jenjang    string `query:"jenjang"`
	IDFakultas string `query:"id_fakultas"` // opsional, drill-down ke 1 fakultas
	Cutoff     string `query:"cutoff"`
}

// PerJenjangParams — filter untuk endpoint per-jenjang.
type PerJenjangParams struct {
	Cohort     int    `query:"cohort"`
	IDFakultas string `query:"id_fakultas"` // opsional
	Cutoff     string `query:"cutoff"`
}

// MahasiswaListParams — filter untuk list mahasiswa raw.
type MahasiswaListParams struct {
	Cohort     int    `query:"cohort"`     // wajib
	Jenjang    string `query:"jenjang"`    // wajib
	IDFakultas string `query:"id_fakultas"`
	IDProdi    string `query:"id_sms"`     // = id_sms prodi
	StatusKtw  string `query:"status_ktw"` // lulus_tepat | lulus_terlambat | masih_aktif | keluar_non_lulus
	Search     string `query:"search"`     // cari di nm_pd / nipd / nim
	Cutoff     string `query:"cutoff"`
	Page       int    `query:"page"`
	Limit      int    `query:"limit"`
}

// =============================================================================
// Response rows
// =============================================================================

// PerFakultasRow — agregat per fakultas.
type PerFakultasRow struct {
	IDFakultas      string  `db:"id_fakultas" json:"id_fakultas"`
	NmFakultas      string  `db:"nm_fakultas" json:"nm_fakultas"`
	Maba            int     `db:"maba" json:"maba"`
	SudahLulus      int     `db:"sudah_lulus" json:"sudah_lulus"`
	KtwStrict       int     `db:"ktw_strict" json:"ktw_strict"`
	MasihAktif      int     `db:"masih_aktif" json:"masih_aktif"`
	KeluarNonLulus  int     `db:"keluar_non_lulus" json:"keluar_non_lulus"`
	PctKtwStrict    float64 `db:"-" json:"pct_ktw_strict"` // computed: ktw_strict / maba
	PctSudahLulus   float64 `db:"-" json:"pct_sudah_lulus"`
}

// PerProdiRow — agregat per prodi (program studi).
type PerProdiRow struct {
	IDProdi         string  `db:"id_prodi" json:"id_prodi"`
	KodeDikti       string  `db:"kode_dikti" json:"kode_dikti"`
	NmProdi         string  `db:"nm_prodi" json:"nm_prodi"`
	IDFakultas      string  `db:"id_fakultas" json:"id_fakultas"`
	Maba            int     `db:"maba" json:"maba"`
	SudahLulus      int     `db:"sudah_lulus" json:"sudah_lulus"`
	KtwStrict       int     `db:"ktw_strict" json:"ktw_strict"`
	MasihAktif      int     `db:"masih_aktif" json:"masih_aktif"`
	KeluarNonLulus  int     `db:"keluar_non_lulus" json:"keluar_non_lulus"`
	PctKtwStrict    float64 `db:"-" json:"pct_ktw_strict"`
	PctSudahLulus   float64 `db:"-" json:"pct_sudah_lulus"`
}

// PerJenjangRow — agregat per jenjang (S1, S2, S3, D3, D4).
type PerJenjangRow struct {
	Jenjang         string  `db:"jenjang" json:"jenjang"`
	MasaNormatif    float64 `db:"-" json:"masa_normatif_tahun"`
	Maba            int     `db:"maba" json:"maba"`
	SudahLulus      int     `db:"sudah_lulus" json:"sudah_lulus"`
	KtwStrict       int     `db:"ktw_strict" json:"ktw_strict"`
	MasihAktif      int     `db:"masih_aktif" json:"masih_aktif"`
	KeluarNonLulus  int     `db:"keluar_non_lulus" json:"keluar_non_lulus"`
	PctKtwStrict    float64 `db:"-" json:"pct_ktw_strict"`
	PctSudahLulus   float64 `db:"-" json:"pct_sudah_lulus"`
}

// MahasiswaRow — row mahasiswa untuk list endpoint.
type MahasiswaRow struct {
	IDPD             string   `db:"id_pd" json:"id_pd"`
	IDRegPD          string   `db:"id_reg_pd" json:"id_reg_pd"`
	NIPD             *string  `db:"nipd" json:"nipd,omitempty"` // NPM
	NmPD             string   `db:"nm_pd" json:"nm_pd"`
	JK               *string  `db:"jk" json:"jk,omitempty"`
	Angkatan         int      `db:"angkatan" json:"angkatan"`
	Jenjang          string   `db:"jenjang" json:"jenjang"`
	IDProdi          string   `db:"id_prodi" json:"id_prodi"`
	NmProdi          string   `db:"nm_prodi" json:"nm_prodi"`
	IDFakultas       *string  `db:"id_fakultas" json:"id_fakultas,omitempty"`
	NmFakultas       *string  `db:"nm_fakultas" json:"nm_fakultas,omitempty"`
	TglMasukSP       string   `db:"tgl_masuk_sp" json:"tgl_masuk_sp"`
	IDJnsKeluar      *string  `db:"id_jns_keluar" json:"id_jns_keluar,omitempty"`
	TglKeluar        *string  `db:"tgl_keluar" json:"tgl_keluar,omitempty"`
	MasaStudiTahun   *float64 `db:"masa_studi_tahun" json:"masa_studi_tahun,omitempty"`
	StatusKtw        string   `db:"-" json:"status_ktw"` // computed
}

// =============================================================================
// Helpers
// =============================================================================

// ComputeStatusKtw determine status KTW per row.
//   - "lulus_tepat"      = lulus + masa_studi <= masa_normatif
//   - "lulus_terlambat"  = lulus + masa_studi > masa_normatif
//   - "masih_aktif"      = belum keluar (id_jns_keluar IS NULL)
//   - "keluar_non_lulus" = keluar selain lulus
func ComputeStatusKtw(idJnsKeluar *string, masaStudi *float64, masaNormatif float64) string {
	if idJnsKeluar == nil {
		return "masih_aktif"
	}
	if *idJnsKeluar == "1" && masaStudi != nil {
		if *masaStudi <= masaNormatif {
			return "lulus_tepat"
		}
		return "lulus_terlambat"
	}
	return "keluar_non_lulus"
}

// JenjangValid: cek apakah kode jenjang valid (return true + id_jenj_didik).
func JenjangValid(j string) (int, bool) {
	id, ok := JenjangReverseMap[j]
	return id, ok
}

// PercentRound: hitung pct dengan dibulatkan 2 desimal.
func PercentRound(numerator, denominator int) float64 {
	if denominator == 0 {
		return 0.0
	}
	pct := float64(numerator) / float64(denominator) * 100.0
	// round to 2 decimal places
	return float64(int(pct*100+0.5)) / 100
}
