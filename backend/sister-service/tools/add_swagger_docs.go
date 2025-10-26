package main

import (
	"fmt"
	"strings"
)

// Configuration for each endpoint
type EndpointConfig struct {
	Name        string // e.g. "BidangStudi"
	NameLower   string // e.g. "bidang-studi"
	NameSnake   string // e.g. "bidang_studi"
	Description string // e.g. "field of study"
	DescID      string // e.g. "bidang studi/keilmuan"
}

var endpoints = []EndpointConfig{
	{Name: "BidangStudi", NameLower: "bidang-studi", NameSnake: "bidang_studi", Description: "field of study", DescID: "bidang studi/keilmuan"},
	{Name: "BidangUsaha", NameLower: "bidang-usaha", NameSnake: "bidang_usaha", Description: "business field", DescID: "bidang usaha"},
	{Name: "JabatanFungsional", NameLower: "jabatan-fungsional", NameSnake: "jabatan_fungsional", Description: "functional position", DescID: "jabatan fungsional"},
	{Name: "JabatanTugasTambahan", NameLower: "jabatan-tugas-tambahan", NameSnake: "jabatan_tugas_tambahan", Description: "additional duty position", DescID: "jabatan tugas tambahan"},
	{Name: "JenisBahanAjar", NameLower: "jenis-bahan-ajar", NameSnake: "jenis_bahan_ajar", Description: "teaching material type", DescID: "jenis bahan ajar"},
	{Name: "JenisBeasiswa", NameLower: "jenis-beasiswa", NameSnake: "jenis_beasiswa", Description: "scholarship type", DescID: "jenis beasiswa"},
	{Name: "JenisDiklat", NameLower: "jenis-diklat", NameSnake: "jenis_diklat", Description: "training type", DescID: "jenis diklat/pelatihan"},
	{Name: "JenisDokumen", NameLower: "jenis-dokumen", NameSnake: "jenis_dokumen", Description: "document type", DescID: "jenis dokumen"},
	{Name: "JenisKeluar", NameLower: "jenis-keluar", NameSnake: "jenis_keluar", Description: "exit type", DescID: "jenis keluar mahasiswa/dosen"},
	{Name: "JenisKepanitiaan", NameLower: "jenis-kepanitiaan", NameSnake: "jenis_kepanitiaan", Description: "committee type", DescID: "jenis kepanitiaan"},
	{Name: "JenisKesejahteraan", NameLower: "jenis-kesejahteraan", NameSnake: "jenis_kesejahteraan", Description: "welfare type", DescID: "jenis kesejahteraan"},
	{Name: "JenisPublikasi", NameLower: "jenis-publikasi", NameSnake: "jenis_publikasi", Description: "publication type", DescID: "jenis publikasi ilmiah"},
	{Name: "JenisTes", NameLower: "jenis-tes", NameSnake: "jenis_tes", Description: "test type", DescID: "jenis tes"},
	{Name: "JenisTunjangan", NameLower: "jenis-tunjangan", NameSnake: "jenis_tunjangan", Description: "allowance type", DescID: "jenis tunjangan"},
	{Name: "MediaPublikasi", NameLower: "media-publikasi", NameSnake: "media_publikasi", Description: "publication media", DescID: "media publikasi"},
	{Name: "SkimKegiatan", NameLower: "skim-kegiatan", NameSnake: "skim_kegiatan", Description: "activity scheme", DescID: "skim kegiatan penelitian/pengabdian"},
	{Name: "StatusKepegawaian", NameLower: "status-kepegawaian", NameSnake: "status_kepegawaian", Description: "employment status", DescID: "status kepegawaian"},
	{Name: "SumberGaji", NameLower: "sumber-gaji", NameSnake: "sumber_gaji", Description: "salary source", DescID: "sumber gaji"},
	{Name: "TingkatPenghargaan", NameLower: "tingkat-penghargaan", NameSnake: "tingkat_penghargaan", Description: "award level", DescID: "tingkat penghargaan"},
	{Name: "Wilayah", NameLower: "wilayah", NameSnake: "wilayah", Description: "region", DescID: "wilayah Indonesia"},
	{Name: "KategoriCapaianLuaran", NameLower: "kategori-capaian-luaran", NameSnake: "kategori_capaian_luaran", Description: "output achievement category", DescID: "kategori capaian luaran penelitian"},
	{Name: "KategoriKegiatan", NameLower: "kategori-kegiatan", NameSnake: "kategori_kegiatan", Description: "activity category", DescID: "kategori kegiatan"},
	{Name: "KelompokBidang", NameLower: "kelompok-bidang", NameSnake: "kelompok_bidang", Description: "field group", DescID: "kelompok bidang ilmu"},
	{Name: "LembagaSertifikasi", NameLower: "lembaga-sertifikasi", NameSnake: "lembaga_sertifikasi", Description: "certification institution", DescID: "lembaga sertifikasi"},
	{Name: "GolonganPangkat", NameLower: "golongan-pangkat", NameSnake: "golongan_pangkat", Description: "rank grade", DescID: "golongan/pangkat pegawai"},
	{Name: "IkatanKerja", NameLower: "ikatan-kerja", NameSnake: "ikatan_kerja", Description: "work bond", DescID: "ikatan kerja SDM"},
	{Name: "JenisPenghargaan", NameLower: "jenis-penghargaan", NameSnake: "jenis_penghargaan", Description: "award type", DescID: "jenis penghargaan"},
	{Name: "JenisPekerjaan", NameLower: "jenis-pekerjaan", NameSnake: "jenis_pekerjaan", Description: "job type", DescID: "jenis pekerjaan"},
	{Name: "BidangPekerjaan", NameLower: "bidang-pekerjaan", NameSnake: "bidang_pekerjaan", Description: "job field", DescID: "bidang pekerjaan"},
}

func main() {
	fmt.Println("// Add these Swagger annotations to controller.go")
	fmt.Println()

	for _, ep := range endpoints {
		// GetAll documentation
		fmt.Printf(`// GetAll%s handles GET /api/v1/referensi/%s
// @Summary Get all %s
// @Description Retrieve all %s (%s) reference data
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]referensi.%s}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/%s [get]

`, ep.Name, ep.NameLower, ep.NameSnake, ep.NameSnake, ep.Description, ep.Name, ep.NameLower)

		// Sync documentation
		nameParts := strings.Split(ep.NameLower, "-")
		nameTitle := ""
		for _, part := range nameParts {
			nameTitle += strings.Title(part) + " "
		}
		nameTitle = strings.TrimSpace(nameTitle)

		fmt.Printf(`// Sync%s handles POST /api/v1/referensi/%s/sync
// @Summary Sync %s from Sister API
// @Description Synchronize %s (%s) data from Sister Kemdikbud API. User identity is automatically extracted from JWT token.
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=referensi.SyncResponse}
// @Failure 401 {object} response.APIResponse "Unauthorized - Missing or invalid JWT token"
// @Failure 403 {object} response.APIResponse "Forbidden - Requires Developer role"
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/%s/sync [post]

`, ep.Name, ep.NameLower, ep.NameSnake, ep.NameSnake, ep.Description, ep.NameLower)
	}
}
