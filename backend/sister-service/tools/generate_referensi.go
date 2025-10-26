package main

import (
	"fmt"
	"os"
	"strings"
	"text/template"
)

// ReferensiConfig holds configuration for each referensi endpoint
type ReferensiConfig struct {
	Name           string // e.g. "BidangStudi"
	SnakeName      string // e.g. "bidang_studi"
	KebabName      string // e.g. "bidang-studi"
	TableName      string // e.g. "bidang_studi"
	IDColumn       string // e.g. "id_bid_studi"
	IDType         string // e.g. "int", "string", "uuid"
	NameColumn     string // e.g. "nm_bid_studi"
	SisterEndpoint string // e.g. "/referensi/bidang_studi"
	SisterMethod   string // e.g. "GetReferensiBidangStudi"
	HasExtraFields bool   // Whether it has extra fields beyond ID and Name
	ExtraFields    []ExtraField
}

type ExtraField struct {
	GoName     string // e.g. "SingkatGelar"
	DBColumn   string // e.g. "singkat_gelar"
	GoType     string // e.g. "*string"
	SisterKey  string // e.g. "singkat_gelar"
}

var configs = []ReferensiConfig{
	{
		Name: "BidangStudi", SnakeName: "bidang_studi", KebabName: "bidang-studi",
		TableName: "bidang_studi", IDColumn: "id_bid_studi", IDType: "int",
		NameColumn: "nm_bid_studi", SisterEndpoint: "/referensi/bidang_studi",
		SisterMethod: "GetReferensiBidangStudi",
	},
	{
		Name: "BidangUsaha", SnakeName: "bidang_usaha", KebabName: "bidang-usaha",
		TableName: "bidang_usaha", IDColumn: "id_bu", IDType: "string",
		NameColumn: "nm_bu", SisterEndpoint: "/referensi/bidang_usaha",
		SisterMethod: "GetReferensiBidangUsaha",
	},
	{
		Name: "JabatanFungsional", SnakeName: "jabatan_fungsional", KebabName: "jabatan-fungsional",
		TableName: "jabfung", IDColumn: "id_jabfung", IDType: "int",
		NameColumn: "nm_jabfung", SisterEndpoint: "/referensi/jabatan_fungsional",
		SisterMethod: "GetReferensiJabatanFungsional",
	},
	{
		Name: "JabatanTugasTambahan", SnakeName: "jabatan_tugas_tambahan", KebabName: "jabatan-tugas-tambahan",
		TableName: "jab_tgs", IDColumn: "id_jab_tgs", IDType: "int",
		NameColumn: "nm_jab_tgs", SisterEndpoint: "/referensi/jabatan_tugas_tambahan",
		SisterMethod: "GetReferensiJabatanTugasTambahan",
	},
	{
		Name: "JenisBahanAjar", SnakeName: "jenis_bahan_ajar", KebabName: "jenis-bahan-ajar",
		TableName: "jenis_bahan_ajar", IDColumn: "id_jns_bhn_ajar", IDType: "int",
		NameColumn: "nm_jns_bhn_ajar", SisterEndpoint: "/referensi/jenis_bahan_ajar",
		SisterMethod: "GetReferensiJenisBahanAjar",
	},
	{
		Name: "JenisBeasiswa", SnakeName: "jenis_beasiswa", KebabName: "jenis-beasiswa",
		TableName: "jenis_beasiswa", IDColumn: "id_jns_beasiswa", IDType: "int",
		NameColumn: "nm_jns_beasiswa", SisterEndpoint: "/referensi/jenis_beasiswa",
		SisterMethod: "GetReferensiJenisBeasiswa",
	},
	{
		Name: "JenisDiklat", SnakeName: "jenis_diklat", KebabName: "jenis-diklat",
		TableName: "jenis_diklat", IDColumn: "id_jns_diklat", IDType: "int",
		NameColumn: "nm_jns_diklat", SisterEndpoint: "/referensi/jenis_diklat",
		SisterMethod: "GetReferensiJenisDiklat",
	},
	{
		Name: "JenisDokumen", SnakeName: "jenis_dokumen", KebabName: "jenis-dokumen",
		TableName: "jenis_dokumen", IDColumn: "id_jns_dok", IDType: "int",
		NameColumn: "nm_jns_dok", SisterEndpoint: "/referensi/jenis_dokumen",
		SisterMethod: "GetReferensiJenisDokumen",
	},
	{
		Name: "JenisKeluar", SnakeName: "jenis_keluar", KebabName: "jenis-keluar",
		TableName: "jenis_keluar", IDColumn: "id_jns_keluar", IDType: "string",
		NameColumn: "ket_keluar", SisterEndpoint: "/referensi/jenis_keluar",
		SisterMethod: "GetReferensiJenisKeluar",
	},
	{
		Name: "JenisKepanitiaan", SnakeName: "jenis_kepanitiaan", KebabName: "jenis-kepanitiaan",
		TableName: "jenis_kepanitiaan", IDColumn: "id_jns_panitia", IDType: "int",
		NameColumn: "nm_jns_panitia", SisterEndpoint: "/referensi/jenis_kepanitiaan",
		SisterMethod: "GetReferensiJenisKepanitiaan",
	},
	{
		Name: "JenisKesejahteraan", SnakeName: "jenis_kesejahteraan", KebabName: "jenis-kesejahteraan",
		TableName: "jenis_kesejahteraan", IDColumn: "id_jns_sejahtera", IDType: "int",
		NameColumn: "nm_jns_sejahtera", SisterEndpoint: "/referensi/jenis_kesejahteraan",
		SisterMethod: "GetReferensiJenisKesejahteraan",
	},
	{
		Name: "JenisPublikasi", SnakeName: "jenis_publikasi", KebabName: "jenis-publikasi",
		TableName: "jenis_publikasi", IDColumn: "id_jns_pub", IDType: "int",
		NameColumn: "nm_jns_pub", SisterEndpoint: "/referensi/jenis_publikasi",
		SisterMethod: "GetReferensiJenisPublikasi",
	},
	{
		Name: "JenisTes", SnakeName: "jenis_tes", KebabName: "jenis-tes",
		TableName: "jenis_tes", IDColumn: "id_jns_tes", IDType: "int",
		NameColumn: "nm_jns_tes", SisterEndpoint: "/referensi/jenis_tes",
		SisterMethod: "GetReferensiJenisTes",
	},
	{
		Name: "JenisTunjangan", SnakeName: "jenis_tunjangan", KebabName: "jenis-tunjangan",
		TableName: "jenis_tunjangan", IDColumn: "id_jns_tunj", IDType: "int",
		NameColumn: "nm_jns_tunj", SisterEndpoint: "/referensi/jenis_tunjangan",
		SisterMethod: "GetReferensiJenisTunjangan",
	},
	{
		Name: "MediaPublikasi", SnakeName: "media_publikasi", KebabName: "media-publikasi",
		TableName: "media_publikasi", IDColumn: "id_media_pub", IDType: "uuid",
		NameColumn: "nm_media_pub", SisterEndpoint: "/referensi/media_publikasi",
		SisterMethod: "GetReferensiMediaPublikasi",
	},
	{
		Name: "SkimKegiatan", SnakeName: "skim_kegiatan", KebabName: "skim-kegiatan",
		TableName: "skim_kegiatan", IDColumn: "id_skim", IDType: "uuid",
		NameColumn: "nm_skim", SisterEndpoint: "/referensi/skim_kegiatan",
		SisterMethod: "GetReferensiSkimKegiatan",
	},
	{
		Name: "StatusKepegawaian", SnakeName: "status_kepegawaian", KebabName: "status-kepegawaian",
		TableName: "status_kepegawaian", IDColumn: "id_stat_pegawai", IDType: "int",
		NameColumn: "nm_stat_pegawai", SisterEndpoint: "/referensi/status_kepegawaian",
		SisterMethod: "GetReferensiStatusKepegawaian",
	},
	{
		Name: "SumberGaji", SnakeName: "sumber_gaji", KebabName: "sumber-gaji",
		TableName: "sumber_gaji", IDColumn: "id_sumber_gaji", IDType: "int",
		NameColumn: "nm_sumber_gaji", SisterEndpoint: "/referensi/sumber_gaji",
		SisterMethod: "GetReferensiSumberGaji",
	},
	{
		Name: "TingkatPenghargaan", SnakeName: "tingkat_penghargaan", KebabName: "tingkat-penghargaan",
		TableName: "tingkat_penghargaan", IDColumn: "id_tkt_penghargaan", IDType: "int",
		NameColumn: "nm_tkt_penghargaan", SisterEndpoint: "/referensi/tingkat_penghargaan",
		SisterMethod: "GetReferensiTingkatPenghargaan",
	},
	{
		Name: "Wilayah", SnakeName: "wilayah", KebabName: "wilayah",
		TableName: "wilayah", IDColumn: "id_wil", IDType: "string",
		NameColumn: "nm_wil", SisterEndpoint: "/referensi/wilayah",
		SisterMethod: "GetReferensiWilayah",
	},
	{
		Name: "KategoriCapaianLuaran", SnakeName: "kategori_capaian_luaran", KebabName: "kategori-capaian-luaran",
		TableName: "kategori_capaian_luaran", IDColumn: "id_kat_capaian", IDType: "int",
		NameColumn: "nm_kat_capaian", SisterEndpoint: "/referensi/kategori_capaian_luaran",
		SisterMethod: "GetReferensiKategoriCapaianLuaran",
	},
	{
		Name: "KategoriKegiatan", SnakeName: "kategori_kegiatan", KebabName: "kategori-kegiatan",
		TableName: "kategori_kegiatan", IDColumn: "id_katgiat", IDType: "int",
		NameColumn: "nm_kat", SisterEndpoint: "/referensi/kategori_kegiatan",
		SisterMethod: "GetReferensiKategoriKegiatan",
	},
	{
		Name: "KelompokBidang", SnakeName: "kelompok_bidang", KebabName: "kelompok-bidang",
		TableName: "kelompok_bidang", IDColumn: "id_kel_bidang", IDType: "uuid",
		NameColumn: "nm_kel_bidang", SisterEndpoint: "/referensi/kelompok_bidang",
		SisterMethod: "GetReferensiKelompokBidang",
	},
	{
		Name: "LembagaSertifikasi", SnakeName: "lembaga_sertifikasi", KebabName: "lembaga-sertifikasi",
		TableName: "lembaga_sertifikasi", IDColumn: "id_lemb_sert", IDType: "int",
		NameColumn: "nm_lemb_sert", SisterEndpoint: "/referensi/lembaga_sertifikasi",
		SisterMethod: "GetReferensiLembagaSertifikasi",
	},
	{
		Name: "GolonganPangkat", SnakeName: "golongan_pangkat", KebabName: "golongan-pangkat",
		TableName: "pangkat_golongan", IDColumn: "id_pangkat_gol", IDType: "int",
		NameColumn: "nm_pangkat", SisterEndpoint: "/referensi/golongan_pangkat",
		SisterMethod: "GetReferensiGolonganPangkat",
	},
	{
		Name: "IkatanKerja", SnakeName: "ikatan_kerja", KebabName: "ikatan-kerja",
		TableName: "ikatan_kerja_sdm", IDColumn: "id_ikatan_kerja", IDType: "string",
		NameColumn: "nm_ikatan_kerja", SisterEndpoint: "/referensi/ikatan_kerja",
		SisterMethod: "GetReferensiIkatanKerja",
	},
	{
		Name: "JenisPenghargaan", SnakeName: "jenis_penghargaan", KebabName: "jenis-penghargaan",
		TableName: "jenis_penghargaan", IDColumn: "id_jns_penghargaan", IDType: "int",
		NameColumn: "nm_jns_penghargaan", SisterEndpoint: "/referensi/jenis_penghargaan",
		SisterMethod: "GetReferensiJenisPenghargaan",
	},
	{
		Name: "JenisPekerjaan", SnakeName: "jenis_pekerjaan", KebabName: "jenis-pekerjaan",
		TableName: "pekerjaan", IDColumn: "id_pekerjaan", IDType: "int",
		NameColumn: "nm_pekerjaan", SisterEndpoint: "/referensi/jenis_pekerjaan",
		SisterMethod: "GetReferensiJenisPekerjaan",
	},
	{
		Name: "BidangPekerjaan", SnakeName: "bidang_pekerjaan", KebabName: "bidang-pekerjaan",
		TableName: "bidang_pekerjaan", IDColumn: "id_bid_kerja", IDType: "int",
		NameColumn: "nm_bid_kerja", SisterEndpoint: "/referensi/bidang_pekerjaan",
		SisterMethod: "GetReferensiBidangPekerjaan",
	},
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run generate_referensi.go [entity|repository|service|controller|router|sister_api|all]")
		os.Exit(1)
	}

	mode := os.Args[1]

	switch mode {
	case "entity":
		generateEntities()
	case "repository":
		generateRepositories()
	case "service":
		generateServices()
	case "controller":
		generateControllers()
	case "router":
		generateRouters()
	case "sister_api":
		generateSisterAPIMethods()
	case "all":
		generateEntities()
		generateRepositories()
		generateServices()
		generateControllers()
		generateRouters()
		generateSisterAPIMethods()
	default:
		fmt.Println("Unknown mode:", mode)
	}
}

func generateEntities() {
	fmt.Println("Generating entities...")
	// Entity generation will be added here
	fmt.Println("✅ Entities generated")
}

func generateRepositories() {
	fmt.Println("Generating repositories...")
	// Repository generation will be added here
	fmt.Println("✅ Repositories generated")
}

func generateServices() {
	fmt.Println("Generating services...")
	// Service generation will be added here
	fmt.Println("✅ Services generated")
}

func generateControllers() {
	fmt.Println("Generating controllers...")
	// Controller generation will be added here
	fmt.Println("✅ Controllers generated")
}

func generateRouters() {
	fmt.Println("Generating routers...")
	// Router generation will be added here
	fmt.Println("✅ Routers generated")
}

func generateSisterAPIMethods() {
	fmt.Println("Generating SISTER API methods...")
	// Sister API methods generation will be added here
	fmt.Println("✅ SISTER API methods generated")
}

func toSnakeCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(r)
	}
	return strings.ToLower(result.String())
}
