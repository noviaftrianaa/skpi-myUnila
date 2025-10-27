package main

import (
	"fmt"
	"strings"
)

// This script generates the updated sync methods with logging
// Run: go run update_sync_methods_with_logging.go > /tmp/updated_sync_methods.txt

type EndpointInfo struct {
	Name        string // e.g., "BidangStudi"
	DisplayName string // e.g., "Bidang Studi"
	Key         string // e.g., "bidang_studi"
}

var endpoints = []EndpointInfo{
	{"BidangStudi", "Bidang Studi", "bidang_studi"},
	{"BidangUsaha", "Bidang Usaha", "bidang_usaha"},
	{"JabatanFungsional", "Jabatan Fungsional", "jabatan_fungsional"},
	{"JabatanTugasTambahan", "Jabatan Tugas Tambahan", "jabatan_tugas_tambahan"},
	{"JenisBahanAjar", "Jenis Bahan Ajar", "jenis_bahan_ajar"},
	{"JenisBeasiswa", "Jenis Beasiswa", "jenis_beasiswa"},
	{"JenisDiklat", "Jenis Diklat", "jenis_diklat"},
	{"JenisDokumen", "Jenis Dokumen", "jenis_dokumen"},
	{"JenisKeluar", "Jenis Keluar", "jenis_keluar"},
	{"JenisKepanitiaan", "Jenis Kepanitiaan", "jenis_kepanitiaan"},
	{"JenisKesejahteraan", "Jenis Kesejahteraan", "jenis_kesejahteraan"},
	{"JenisPublikasi", "Jenis Publikasi", "jenis_publikasi"},
	{"JenisTes", "Jenis Tes", "jenis_tes"},
	{"JenisTunjangan", "Jenis Tunjangan", "jenis_tunjangan"},
	{"MediaPublikasi", "Media Publikasi", "media_publikasi"},
	{"SkimKegiatan", "Skim Kegiatan", "skim_kegiatan"},
	{"StatusKepegawaian", "Status Kepegawaian", "status_kepegawaian"},
	{"SumberGaji", "Sumber Gaji", "sumber_gaji"},
	{"TingkatPenghargaan", "Tingkat Penghargaan", "tingkat_penghargaan"},
	{"Wilayah", "Wilayah", "wilayah"},
	{"KategoriCapaianLuaran", "Kategori Capaian Luaran", "kategori_capaian_luaran"},
	{"KategoriKegiatan", "Kategori Kegiatan", "kategori_kegiatan"},
	{"KelompokBidang", "Kelompok Bidang", "kelompok_bidang"},
	{"LembagaSertifikasi", "Lembaga Sertifikasi", "lembaga_sertifikasi"},
	{"GolonganPangkat", "Golongan Pangkat", "golongan_pangkat"},
	{"IkatanKerja", "Ikatan Kerja", "ikatan_kerja"},
	{"JenisPenghargaan", "Jenis Penghargaan", "jenis_penghargaan"},
	{"JenisPekerjaan", "Jenis Pekerjaan", "jenis_pekerjaan"},
	{"BidangPekerjaan", "Bidang Pekerjaan", "bidang_pekerjaan"},
}

func main() {
	for _, ep := range endpoints {
		generateSyncMethod(ep)
		fmt.Println()
	}
}

func generateSyncMethod(ep EndpointInfo) {
	// Get API method name (convert snake_case to PascalCase)
	apiMethod := toPascalCase(ep.Key)

	template := `// Sync%sFromSister syncs %s data from Sister API to database
func (s *service) Sync%sFromSister(syncedBy string) (int, error) {
	ctx := context.Background()
	startTime := time.Now()
	var totalRecords int
	var syncErr error

	defer func() {
		s.logSyncResult(ctx, "%s", "%s", "manual", syncedBy, totalRecords, startTime, syncErr)
	}()

	rawData, err := s.sisterAPI.GetReferensi%s()
	if err != nil {
		syncErr = fmt.Errorf("failed to fetch from Sister API: %%w", err)
		return 0, syncErr
	}

	sisterData, err := UnmarshalSisterResponse[Sister%s](rawData)
	if err != nil {
		syncErr = fmt.Errorf("failed to parse response: %%w", err)
		return 0, syncErr
	}

	err = s.repo.BulkUpsert%s(sisterData, syncedBy)
	if err != nil {
		syncErr = fmt.Errorf("failed to save to database: %%w", err)
		return 0, syncErr
	}

	totalRecords = len(sisterData)
	return totalRecords, nil
}`

	output := fmt.Sprintf(template,
		ep.Name,              // Method name
		ep.DisplayName,       // Comment description
		ep.Name,              // Method name (repeat)
		ep.DisplayName,       // Log display name
		ep.Key,               // Log endpoint key
		apiMethod,            // API method name
		ep.Name,              // Sister struct type
		ep.Name,              // BulkUpsert method name
	)

	fmt.Println(output)
}

func toPascalCase(snakeCase string) string {
	parts := strings.Split(snakeCase, "_")
	for i, part := range parts {
		if len(part) > 0 {
			parts[i] = strings.ToUpper(part[:1]) + part[1:]
		}
	}
	return strings.Join(parts, "")
}
