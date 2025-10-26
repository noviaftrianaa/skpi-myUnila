package main

import (
	"fmt"
	"os"
	"strings"
)

type RefConfig struct {
	StructName    string // BidangStudi
	VarName       string // bidangStudi
	TableName     string // bidang_studi
	IDColumn      string // id_bid_studi
	IDType        string // int/string/uuid
	NameColumn    string // nm_bid_studi
	SisterPath    string // /referensi/bidang_studi
	RouteParam    string // bidang-studi
}

var configs = []RefConfig{
	{StructName: "BidangStudi", VarName: "bidangStudi", TableName: "bidang_studi", IDColumn: "id_bid_studi", IDType: "int", NameColumn: "nm_bid_studi", SisterPath: "/referensi/bidang_studi", RouteParam: "bidang-studi"},
	{StructName: "BidangUsaha", VarName: "bidangUsaha", TableName: "bidang_usaha", IDColumn: "id_bu", IDType: "string", NameColumn: "nm_bu", SisterPath: "/referensi/bidang_usaha", RouteParam: "bidang-usaha"},
	{StructName: "JabatanFungsional", VarName: "jabatanFungsional", TableName: "jabfung", IDColumn: "id_jabfung", IDType: "int", NameColumn: "nm_jabfung", SisterPath: "/referensi/jabatan_fungsional", RouteParam: "jabatan-fungsional"},
	{StructName: "JabatanTugasTambahan", VarName: "jabatanTugasTambahan", TableName: "jab_tgs", IDColumn: "id_jab_tgs", IDType: "int", NameColumn: "nm_jab_tgs", SisterPath: "/referensi/jabatan_tugas_tambahan", RouteParam: "jabatan-tugas-tambahan"},
	{StructName: "JenisBahanAjar", VarName: "jenisBahanAjar", TableName: "jenis_bahan_ajar", IDColumn: "id_jns_bhn_ajar", IDType: "int", NameColumn: "nm_jns_bhn_ajar", SisterPath: "/referensi/jenis_bahan_ajar", RouteParam: "jenis-bahan-ajar"},
	{StructName: "JenisBeasiswa", VarName: "jenisBeasiswa", TableName: "jenis_beasiswa", IDColumn: "id_jns_beasiswa", IDType: "int", NameColumn: "nm_jns_beasiswa", SisterPath: "/referensi/jenis_beasiswa", RouteParam: "jenis-beasiswa"},
	{StructName: "JenisDiklat", VarName: "jenisDiklat", TableName: "jenis_diklat", IDColumn: "id_jns_diklat", IDType: "int", NameColumn: "nm_jns_diklat", SisterPath: "/referensi/jenis_diklat", RouteParam: "jenis-diklat"},
	{StructName: "JenisDokumen", VarName: "jenisDokumen", TableName: "jenis_dokumen", IDColumn: "id_jns_dok", IDType: "int", NameColumn: "nm_jns_dok", SisterPath: "/referensi/jenis_dokumen", RouteParam: "jenis-dokumen"},
	{StructName: "JenisKeluar", VarName: "jenisKeluar", TableName: "jenis_keluar", IDColumn: "id_jns_keluar", IDType: "string", NameColumn: "ket_keluar", SisterPath: "/referensi/jenis_keluar", RouteParam: "jenis-keluar"},
	{StructName: "JenisKepanitiaan", VarName: "jenisKepanitiaan", TableName: "jenis_kepanitiaan", IDColumn: "id_jns_panitia", IDType: "int", NameColumn: "nm_jns_panitia", SisterPath: "/referensi/jenis_kepanitiaan", RouteParam: "jenis-kepanitiaan"},
	{StructName: "JenisKesejahteraan", VarName: "jenisKesejahteraan", TableName: "jenis_kesejahteraan", IDColumn: "id_jns_sejahtera", IDType: "int", NameColumn: "nm_jns_sejahtera", SisterPath: "/referensi/jenis_kesejahteraan", RouteParam: "jenis-kesejahteraan"},
	{StructName: "JenisPublikasi", VarName: "jenisPublikasi", TableName: "jenis_publikasi", IDColumn: "id_jns_pub", IDType: "int", NameColumn: "nm_jns_pub", SisterPath: "/referensi/jenis_publikasi", RouteParam: "jenis-publikasi"},
	{StructName: "JenisTes", VarName: "jenisTes", TableName: "jenis_tes", IDColumn: "id_jns_tes", IDType: "int", NameColumn: "nm_jns_tes", SisterPath: "/referensi/jenis_tes", RouteParam: "jenis-tes"},
	{StructName: "JenisTunjangan", VarName: "jenisTunjangan", TableName: "jenis_tunjangan", IDColumn: "id_jns_tunj", IDType: "int", NameColumn: "nm_jns_tunj", SisterPath: "/referensi/jenis_tunjangan", RouteParam: "jenis-tunjangan"},
	{StructName: "MediaPublikasi", VarName: "mediaPublikasi", TableName: "media_publikasi", IDColumn: "id_media_pub", IDType: "uuid", NameColumn: "nm_media_pub", SisterPath: "/referensi/media_publikasi", RouteParam: "media-publikasi"},
	{StructName: "SkimKegiatan", VarName: "skimKegiatan", TableName: "skim_kegiatan", IDColumn: "id_skim", IDType: "uuid", NameColumn: "nm_skim", SisterPath: "/referensi/skim_kegiatan", RouteParam: "skim-kegiatan"},
	{StructName: "StatusKepegawaian", VarName: "statusKepegawaian", TableName: "status_kepegawaian", IDColumn: "id_stat_pegawai", IDType: "int", NameColumn: "nm_stat_pegawai", SisterPath: "/referensi/status_kepegawaian", RouteParam: "status-kepegawaian"},
	{StructName: "SumberGaji", VarName: "sumberGaji", TableName: "sumber_gaji", IDColumn: "id_sumber_gaji", IDType: "int", NameColumn: "nm_sumber_gaji", SisterPath: "/referensi/sumber_gaji", RouteParam: "sumber-gaji"},
	{StructName: "TingkatPenghargaan", VarName: "tingkatPenghargaan", TableName: "tingkat_penghargaan", IDColumn: "id_tkt_penghargaan", IDType: "int", NameColumn: "nm_tkt_penghargaan", SisterPath: "/referensi/tingkat_penghargaan", RouteParam: "tingkat-penghargaan"},
	{StructName: "Wilayah", VarName: "wilayah", TableName: "wilayah", IDColumn: "id_wil", IDType: "string", NameColumn: "nm_wil", SisterPath: "/referensi/wilayah", RouteParam: "wilayah"},
	{StructName: "KategoriCapaianLuaran", VarName: "kategoriCapaianLuaran", TableName: "kategori_capaian_luaran", IDColumn: "id_kat_capaian", IDType: "int", NameColumn: "nm_kat_capaian", SisterPath: "/referensi/kategori_capaian_luaran", RouteParam: "kategori-capaian-luaran"},
	{StructName: "KategoriKegiatan", VarName: "kategoriKegiatan", TableName: "kategori_kegiatan", IDColumn: "id_katgiat", IDType: "int", NameColumn: "nm_kat", SisterPath: "/referensi/kategori_kegiatan", RouteParam: "kategori-kegiatan"},
	{StructName: "KelompokBidang", VarName: "kelompokBidang", TableName: "kelompok_bidang", IDColumn: "id_kel_bidang", IDType: "uuid", NameColumn: "nm_kel_bidang", SisterPath: "/referensi/kelompok_bidang", RouteParam: "kelompok-bidang"},
	{StructName: "LembagaSertifikasi", VarName: "lembagaSertifikasi", TableName: "lembaga_sertifikasi", IDColumn: "id_lemb_sert", IDType: "int", NameColumn: "nm_lemb_sert", SisterPath: "/referensi/lembaga_sertifikasi", RouteParam: "lembaga-sertifikasi"},
	{StructName: "GolonganPangkat", VarName: "golonganPangkat", TableName: "pangkat_golongan", IDColumn: "id_pangkat_gol", IDType: "int", NameColumn: "nm_pangkat", SisterPath: "/referensi/golongan_pangkat", RouteParam: "golongan-pangkat"},
	{StructName: "IkatanKerja", VarName: "ikatanKerja", TableName: "ikatan_kerja_sdm", IDColumn: "id_ikatan_kerja", IDType: "string", NameColumn: "nm_ikatan_kerja", SisterPath: "/referensi/ikatan_kerja", RouteParam: "ikatan-kerja"},
	{StructName: "JenisPenghargaan", VarName: "jenisPenghargaan", TableName: "jenis_penghargaan", IDColumn: "id_jns_penghargaan", IDType: "int", NameColumn: "nm_jns_penghargaan", SisterPath: "/referensi/jenis_penghargaan", RouteParam: "jenis-penghargaan"},
	{StructName: "JenisPekerjaan", VarName: "jenisPekerjaan", TableName: "pekerjaan", IDColumn: "id_pekerjaan", IDType: "int", NameColumn: "nm_pekerjaan", SisterPath: "/referensi/jenis_pekerjaan", RouteParam: "jenis-pekerjaan"},
	{StructName: "BidangPekerjaan", VarName: "bidangPekerjaan", TableName: "bidang_pekerjaan", IDColumn: "id_bid_kerja", IDType: "int", NameColumn: "nm_bid_kerja", SisterPath: "/referensi/bidang_pekerjaan", RouteParam: "bidang-pekerjaan"},
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run generate_referensi_code.go <type>")
		fmt.Println("Types: repo-interface | repo-impl | service-interface | service-impl | controller | router | sister-api | batch-sync | all")
		os.Exit(1)
	}

	genType := os.Args[1]

	switch genType {
	case "repo-interface":
		generateRepositoryInterface()
	case "repo-impl":
		generateRepositoryImplementation()
	case "service-interface":
		generateServiceInterface()
	case "service-impl":
		generateServiceImplementation()
	case "controller":
		generateController()
	case "router":
		generateRouter()
	case "sister-api":
		generateSisterAPIMethods()
	case "batch-sync":
		generateBatchSyncUpdates()
	case "all":
		fmt.Println("Generating all code...")
		generateRepositoryInterface()
		generateRepositoryImplementation()
		generateServiceInterface()
		generateServiceImplementation()
		generateController()
		generateRouter()
		generateSisterAPIMethods()
		generateBatchSyncUpdates()
	default:
		fmt.Println("Unknown type:", genType)
	}
}

func generateRepositoryInterface() {
	fmt.Println("// Add to Repository interface in repository.go")
	fmt.Println()
	for _, cfg := range configs {
		fmt.Printf("\tGetAll%s() ([]%s, error)\n", cfg.StructName, cfg.StructName)
		fmt.Printf("\tBulkUpsert%s(data []Sister%s, syncedBy string) error\n", cfg.StructName, cfg.StructName)
	}
	fmt.Println()
}

func generateRepositoryImplementation() {
	for _, cfg := range configs {
		fmt.Printf(`
// GetAll%s retrieves all active %s records
func (r *repository) GetAll%s() ([]%s, error) {
	var result []%s
	query := ` + "`SELECT %s, %s, expired_date, last_sync FROM ref.%s WHERE expired_date IS NULL ORDER BY %s`" + `
	err := r.db.Select(&result, query)
	return result, err
}

// BulkUpsert%s performs bulk upsert for %s
func (r *repository) BulkUpsert%s(data []Sister%s, syncedBy string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %%w", err)
	}
	defer tx.Rollback()

	for _, item := range data {
		query := ` + "`" + `
			MERGE ref.%s AS target
			USING (SELECT @p1 AS %s, @p2 AS %s) AS source
			ON target.%s = source.%s
			WHEN MATCHED THEN
				UPDATE SET %s = source.%s,
						   last_update = DATEADD(HOUR, 7, GETUTCDATE()),
						   last_sync = DATEADD(HOUR, 7, GETUTCDATE()),
						   synced_by = @p3
			WHEN NOT MATCHED THEN
				INSERT (%s, %s, a_ref_pddikti, a_ref_unila, create_date, last_update, expired_date, last_sync, synced_by)
				VALUES (source.%s, source.%s, 1, 0, DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()), NULL, DATEADD(HOUR, 7, GETUTCDATE()), @p3);
		` + "`" + `
		_, err = tx.Exec(query, item.ID, item.Nama, syncedBy)
		if err != nil {
			return fmt.Errorf("failed to upsert %s %%v: %%w", item.ID, err)
		}
	}

	return tx.Commit()
}
`,
			// GetAll params
			cfg.StructName, cfg.VarName, cfg.StructName, cfg.StructName,
			cfg.StructName, cfg.IDColumn, cfg.NameColumn, cfg.TableName, cfg.NameColumn,
			// BulkUpsert params
			cfg.StructName, cfg.VarName,
			cfg.StructName, cfg.StructName,
			cfg.TableName, cfg.IDColumn, cfg.NameColumn,
			cfg.IDColumn, cfg.IDColumn,
			cfg.NameColumn, cfg.NameColumn,
			cfg.IDColumn, cfg.NameColumn,
			cfg.IDColumn, cfg.NameColumn,
			cfg.TableName,
		)
	}
}

func generateServiceInterface() {
	fmt.Println("// Add to Service interface in service.go")
	for _, cfg := range configs {
		fmt.Printf("\tSync%sFromSister(syncedBy string) (int, error)\n", cfg.StructName)
	}
}

func generateServiceImplementation() {
	for _, cfg := range configs {
		fmt.Printf(`
// Sync%sFromSister syncs %s data from Sister API to database
func (s *service) Sync%sFromSister(syncedBy string) (int, error) {
	data, err := s.sisterAPI.GetReferensi%s()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %%w", err)
	}

	err = s.repo.BulkUpsert%s(data, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %%w", err)
	}

	return len(data), nil
}
`, cfg.StructName, cfg.VarName, cfg.StructName, cfg.StructName, cfg.StructName)
	}
}

func generateController() {
	for _, cfg := range configs {
		fmt.Printf(`
// GetAll%s returns all %s
func (c *controller) GetAll%s(ctx *fiber.Ctx) error {
	data, err := c.svc.repo.GetAll%s()
	if err != nil {
		return APIResponse(ctx, fiber.StatusInternalServerError, "Failed to fetch data", nil, err.Error())
	}
	return APIResponse(ctx, fiber.StatusOK, "Success", data, "")
}

// Sync%s syncs %s from Sister API
func (c *controller) Sync%s(ctx *fiber.Ctx) error {
	syncedBy := getSyncedBy(ctx)
	count, err := c.svc.Sync%sFromSister(syncedBy)
	if err != nil {
		return APIResponse(ctx, fiber.StatusInternalServerError, "Sync failed", nil, err.Error())
	}
	return APIResponse(ctx, fiber.StatusOK, fmt.Sprintf("Successfully synced %%d records", count), fiber.Map{"count": count}, "")
}
`, cfg.StructName, cfg.VarName, cfg.StructName, cfg.StructName,
			cfg.StructName, cfg.VarName, cfg.StructName, cfg.StructName)
	}
}

func generateRouter() {
	fmt.Println("// Add to router.Init() in router.go")
	for _, cfg := range configs {
		fmt.Printf(`
	// %s routes
	%sRouter := router.Group("/referensi/%s")
	{
		%sRouter.Get("/", ctrl.GetAll%s)
		%sRouter.Post("/sync", ctrl.Sync%s)
	}
`, cfg.StructName, cfg.VarName, cfg.RouteParam, cfg.VarName, cfg.StructName, cfg.VarName, cfg.StructName)
	}
}

func generateSisterAPIMethods() {
	fmt.Println("// Add to Sister API client")
	for _, cfg := range configs {
		sisterIDType := "int"
		if cfg.IDType == "string" {
			sisterIDType = "string"
		} else if cfg.IDType == "uuid" {
			sisterIDType = "string"
		}

		fmt.Printf(`
// GetReferensi%s fetches %s from Sister API
func (c *Client) GetReferensi%s() ([]Sister%s, error) {
	var result []Sister%s
	err := c.get("%s", &result)
	return result, err
}
`, cfg.StructName, cfg.VarName, cfg.StructName, cfg.StructName, cfg.StructName, cfg.SisterPath)
		_ = sisterIDType // Use if needed for type conversion
	}
}

func generateBatchSyncUpdates() {
	fmt.Println("// Update batch sync case statement")
	fmt.Println("Add these cases to the switch in BatchSyncFromSister():")
	fmt.Println()

	for _, cfg := range configs {
		snakeName := toSnakeCase(cfg.StructName)
		fmt.Printf(`		case "%s":
			count, err := svc.Sync%sFromSister(syncedBy)
			result.TotalRecords = count
			result.Endpoint = endpoint
			if err != nil {
				result.Success = false
				result.Message = "Sync failed"
				result.Error = err.Error()
			} else {
				result.Success = true
				result.Message = fmt.Sprintf("Synced %%d records", count)
			}
`, snakeName, cfg.StructName)
	}

	fmt.Println()
	fmt.Println("// Also update GetAllReferensiMetadata() to include these endpoints")
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
