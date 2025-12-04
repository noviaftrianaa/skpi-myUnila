package referensi

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Stats
	GetAllStats(ctx context.Context) (*AllReferensiStats, error)
	GetStats(ctx context.Context, endpointKey string) (*ReferensiStats, error)
	GetCount(ctx context.Context, tableName string) (int, error)
	GetLastSync(ctx context.Context, tableName string) (*time.Time, error)

	// Generic data retrieval
	GetData(ctx context.Context, tableName, pkField, nameField string, page, limit int, search string) ([]ReferensiItem, int, error)
	GetDetail(ctx context.Context, tableName, pkField string, id string) (map[string]interface{}, error)

	// Sync operations
	UpsertJalurMasuk(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenisEvaluasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenisPendaftaran(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenisKeluar(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertStatusMahasiswa(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertTahunAjaran(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertSemester(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenisPrestasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertTingkatPrestasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertKebutuhanKhusus(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertWilayah(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertAgama(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenisTinggal(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertPekerjaan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertPenghasilan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertJenjangPendidikan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
	UpsertPembiayaan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetAllStats gets stats for all referensi endpoints
func (r *repository) GetAllStats(ctx context.Context) (*AllReferensiStats, error) {
	endpoints := GetReferensiEndpoints()
	stats := &AllReferensiStats{
		TotalEndpoints: len(endpoints),
		ReferensiList:  make([]ReferensiStats, 0, len(endpoints)),
	}

	for _, ep := range endpoints {
		epStats, err := r.GetStats(ctx, ep.Key)
		if err != nil {
			log.Printf("⚠️  [Referensi] Failed to get stats for %s: %v", ep.Key, err)
			epStats = &ReferensiStats{
				EndpointKey:  ep.Key,
				EndpointName: ep.Name,
				TotalRecords: 0,
			}
		}
		stats.ReferensiList = append(stats.ReferensiList, *epStats)
		stats.TotalRecords += epStats.TotalRecords
		if epStats.TotalRecords > 0 {
			stats.SyncedEndpoints++
		}
	}

	return stats, nil
}

// GetStats gets stats for a specific endpoint
func (r *repository) GetStats(ctx context.Context, endpointKey string) (*ReferensiStats, error) {
	ep := FindEndpoint(endpointKey)
	if ep == nil {
		return nil, fmt.Errorf("unknown endpoint: %s", endpointKey)
	}

	count, err := r.GetCount(ctx, ep.TableName)
	if err != nil {
		return nil, err
	}

	lastSync, _ := r.GetLastSync(ctx, ep.TableName)

	return &ReferensiStats{
		EndpointKey:  ep.Key,
		EndpointName: ep.Name,
		TotalRecords: count,
		LastSync:     lastSync,
	}, nil
}

// GetCount gets record count for a table
func (r *repository) GetCount(ctx context.Context, tableName string) (int, error) {
	var count int
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE expired_date IS NULL", tableName)
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// GetLastSync gets last sync time for a table
func (r *repository) GetLastSync(ctx context.Context, tableName string) (*time.Time, error) {
	var lastSync time.Time
	query := fmt.Sprintf("SELECT MAX(last_sync) FROM %s", tableName)
	err := r.db.GetContext(ctx, &lastSync, query)
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

// GetData gets paginated data from a referensi table
func (r *repository) GetData(ctx context.Context, tableName, pkField, nameField string, page, limit int, search string) ([]ReferensiItem, int, error) {
	offset := (page - 1) * limit

	// Build search condition
	searchCond := ""
	args := []interface{}{}
	if search != "" {
		searchCond = fmt.Sprintf("AND (%s LIKE @p1 OR CAST(%s AS VARCHAR) LIKE @p1)", nameField, pkField)
		args = append(args, "%"+search+"%")
	}

	// Get total count
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*) FROM %s
		WHERE expired_date IS NULL %s
	`, tableName, searchCond)

	var total int
	if len(args) > 0 {
		err := r.db.GetContext(ctx, &total, countQuery, args...)
		if err != nil {
			return nil, 0, err
		}
	} else {
		err := r.db.GetContext(ctx, &total, countQuery)
		if err != nil {
			return nil, 0, err
		}
	}

	// Get data
	dataQuery := fmt.Sprintf(`
		SELECT %s as id, %s as nama, create_date, last_update, last_sync
		FROM %s
		WHERE expired_date IS NULL %s
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
	`, pkField, nameField, tableName, searchCond, pkField)

	// Build args for data query
	dataArgs := args
	dataArgs = append(dataArgs, sql.Named("offset", offset), sql.Named("limit", limit))

	rows, err := r.db.QueryxContext(ctx, dataQuery, dataArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []ReferensiItem{}
	for rows.Next() {
		var item ReferensiItem
		var createDate, lastUpdate, lastSync sql.NullTime
		err := rows.Scan(&item.ID, &item.Nama, &createDate, &lastUpdate, &lastSync)
		if err != nil {
			continue
		}
		item.IsActive = true
		if createDate.Valid {
			item.CreatedAt = &createDate.Time
		}
		if lastUpdate.Valid {
			item.UpdatedAt = &lastUpdate.Time
		}
		if lastSync.Valid {
			item.LastSync = &lastSync.Time
		}
		items = append(items, item)
	}

	return items, total, nil
}

// GetDetail gets detail of a single record
func (r *repository) GetDetail(ctx context.Context, tableName, pkField string, id string) (map[string]interface{}, error) {
	query := fmt.Sprintf("SELECT * FROM %s WHERE %s = @p1", tableName, pkField)

	rows, err := r.db.QueryxContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("record not found")
	}

	result := make(map[string]interface{})
	err = rows.MapScan(result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// Helper function to get string value from map (with trim)
func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok && v != nil {
		switch val := v.(type) {
		case string:
			return strings.TrimSpace(val)
		case float64:
			return fmt.Sprintf("%.0f", val)
		default:
			return strings.TrimSpace(fmt.Sprintf("%v", val))
		}
	}
	return ""
}

// Helper function to get int value from map
func getInt(m map[string]interface{}, key string) int {
	if v, ok := m[key]; ok && v != nil {
		switch val := v.(type) {
		case float64:
			return int(val)
		case int:
			return val
		case string:
			var i int
			fmt.Sscanf(val, "%d", &i)
			return i
		}
	}
	return 0
}

// UpsertJalurMasuk syncs jalur masuk data
func (r *repository) UpsertJalurMasuk(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jalur_masuk",
		EndpointName: "Jalur Masuk",
		Status:       "success",
	}

	// Use IDENTITY_INSERT for tables with identity columns
	query := `
		SET IDENTITY_INSERT ref.jalur_daftar ON;
		MERGE ref.jalur_daftar AS target
		USING (SELECT @p1 AS id_jalur_daftar) AS source
		ON target.id_jalur_daftar = source.id_jalur_daftar
		WHEN MATCHED THEN
			UPDATE SET nm_jalur_daftar = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jalur_daftar, nm_jalur_daftar, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
		SET IDENTITY_INSERT ref.jalur_daftar OFF;
	`

	now := time.Now()
	for _, item := range data {
		id := getString(item, "id_jalur_masuk")
		nama := getString(item, "nama_jalur_masuk")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jalur_masuk %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenisEvaluasi syncs jenis evaluasi data
func (r *repository) UpsertJenisEvaluasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenis_evaluasi",
		EndpointName: "Jenis Evaluasi",
		Status:       "success",
	}

	query := `
		SET IDENTITY_INSERT ref.jenis_evaluasi ON;
		MERGE ref.jenis_evaluasi AS target
		USING (SELECT @p1 AS id_jns_eval) AS source
		ON target.id_jns_eval = source.id_jns_eval
		WHEN MATCHED THEN
			UPDATE SET nm_jns_eval = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jns_eval, nm_jns_eval, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
		SET IDENTITY_INSERT ref.jenis_evaluasi OFF;
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_jenis_evaluasi")
		nama := getString(item, "nama_jenis_evaluasi")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenis_evaluasi %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenisPendaftaran syncs jenis pendaftaran data
func (r *repository) UpsertJenisPendaftaran(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenis_pendaftaran",
		EndpointName: "Jenis Pendaftaran",
		Status:       "success",
	}

	query := `
		SET IDENTITY_INSERT ref.jenis_pendaftaran ON;
		MERGE ref.jenis_pendaftaran AS target
		USING (SELECT @p1 AS id_jns_daftar) AS source
		ON target.id_jns_daftar = source.id_jns_daftar
		WHEN MATCHED THEN
			UPDATE SET nm_jns_daftar = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jns_daftar, nm_jns_daftar, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
		SET IDENTITY_INSERT ref.jenis_pendaftaran OFF;
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_jenis_daftar")
		nama := getString(item, "nama_jenis_daftar")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenis_pendaftaran %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenisKeluar syncs jenis keluar data
func (r *repository) UpsertJenisKeluar(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenis_keluar",
		EndpointName: "Jenis Keluar",
		Status:       "success",
	}

	query := `
		MERGE ref.jenis_keluar AS target
		USING (SELECT @p1 AS id_jns_keluar) AS source
		ON target.id_jns_keluar = source.id_jns_keluar
		WHEN MATCHED THEN
			UPDATE SET ket_keluar = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jns_keluar, ket_keluar, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		// API fields: id_jenis_keluar (ID like "5", "3") and jenis_keluar (description like "Putus Studi")
		id := getString(item, "id_jenis_keluar")
		jenisKeluar := getString(item, "jenis_keluar") // This is the description field

		_, err := r.db.ExecContext(ctx, query, id, jenisKeluar, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenis_keluar %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertStatusMahasiswa syncs status mahasiswa data
func (r *repository) UpsertStatusMahasiswa(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "status_mahasiswa",
		EndpointName: "Status Mahasiswa",
		Status:       "success",
	}

	query := `
		MERGE ref.status_mahasiswa AS target
		USING (SELECT @p1 AS id_stat_mhs) AS source
		ON target.id_stat_mhs = source.id_stat_mhs
		WHEN MATCHED THEN
			UPDATE SET nm_stat_mhs = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_stat_mhs, nm_stat_mhs, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getString(item, "id_status_mahasiswa")
		nama := getString(item, "nama_status_mahasiswa")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert status_mahasiswa %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertTahunAjaran syncs tahun ajaran data
func (r *repository) UpsertTahunAjaran(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "tahun_ajaran",
		EndpointName: "Tahun Ajaran",
		Status:       "success",
	}

	query := `
		MERGE ref.tahun_ajaran AS target
		USING (SELECT @p1 AS id_thn_ajaran) AS source
		ON target.id_thn_ajaran = source.id_thn_ajaran
		WHEN MATCHED THEN
			UPDATE SET nm_thn_ajaran = @p2, a_periode_aktif = @p3, last_update = @p4, last_sync = @p4
		WHEN NOT MATCHED THEN
			INSERT (id_thn_ajaran, nm_thn_ajaran, a_periode_aktif, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p4, @p4);
	`

	now := time.Now()
	for _, item := range data {
		id := getString(item, "id_tahun_ajaran")
		nama := getString(item, "tahun_ajaran")
		aPeriodeAktif := getInt(item, "a_periode_aktif")

		_, err := r.db.ExecContext(ctx, query, id, nama, aPeriodeAktif, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert tahun_ajaran %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertSemester syncs semester data
func (r *repository) UpsertSemester(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "semester",
		EndpointName: "Semester",
		Status:       "success",
	}

	query := `
		MERGE ref.semester AS target
		USING (SELECT @p1 AS id_smt) AS source
		ON target.id_smt = source.id_smt
		WHEN MATCHED THEN
			UPDATE SET id_thn_ajaran = @p2, nm_smt = @p3, smt = @p4, a_periode_aktif = @p5, last_update = @p6, last_sync = @p6
		WHEN NOT MATCHED THEN
			INSERT (id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p6, @p6);
	`

	now := time.Now()
	for _, item := range data {
		id := getString(item, "id_semester")
		idThnAjaran := getString(item, "id_tahun_ajaran")
		nama := getString(item, "nama_semester")
		smt := getInt(item, "semester")
		aPeriodeAktif := getInt(item, "a_periode_aktif")

		_, err := r.db.ExecContext(ctx, query, id, idThnAjaran, nama, smt, aPeriodeAktif, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert semester %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenisPrestasi syncs jenis prestasi data
func (r *repository) UpsertJenisPrestasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenis_prestasi",
		EndpointName: "Jenis Prestasi",
		Status:       "success",
	}

	query := `
		MERGE ref.jenis_prestasi AS target
		USING (SELECT @p1 AS id_jenis_prestasi) AS source
		ON target.id_jenis_prestasi = source.id_jenis_prestasi
		WHEN MATCHED THEN
			UPDATE SET nm_jenis_prestasi = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jenis_prestasi, nm_jenis_prestasi, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_jenis_prestasi")
		nama := getString(item, "nama_jenis_prestasi")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenis_prestasi %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertTingkatPrestasi syncs tingkat prestasi data
func (r *repository) UpsertTingkatPrestasi(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "tingkat_prestasi",
		EndpointName: "Tingkat Prestasi",
		Status:       "success",
	}

	query := `
		MERGE ref.tingkat_prestasi AS target
		USING (SELECT @p1 AS id_tkt_prestasi) AS source
		ON target.id_tkt_prestasi = source.id_tkt_prestasi
		WHEN MATCHED THEN
			UPDATE SET nm_tkt_prestasi = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_tkt_prestasi, nm_tkt_prestasi, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_tingkat_prestasi")
		nama := getString(item, "nama_tingkat_prestasi")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert tingkat_prestasi %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertKebutuhanKhusus syncs kebutuhan khusus data
func (r *repository) UpsertKebutuhanKhusus(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "kebutuhan_khusus",
		EndpointName: "Kebutuhan Khusus",
		Status:       "success",
	}

	query := `
		MERGE ref.kebutuhan_khusus AS target
		USING (SELECT @p1 AS id_kk) AS source
		ON target.id_kk = source.id_kk
		WHEN MATCHED THEN
			UPDATE SET nm_kk = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_kk, nm_kk, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_kebutuhan_khusus")
		nama := getString(item, "nama_kebutuhan_khusus")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert kebutuhan_khusus %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertWilayah syncs wilayah data
func (r *repository) UpsertWilayah(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "wilayah",
		EndpointName: "Wilayah",
		Status:       "success",
	}

	// Column name is id_induk_wilayah (not id_induk_wil) and id_negara is required
	query := `
		MERGE ref.wilayah AS target
		USING (SELECT @p1 AS id_wil) AS source
		ON target.id_wil = source.id_wil
		WHEN MATCHED THEN
			UPDATE SET nm_wil = @p2, id_level_wil = @p3, id_induk_wilayah = @p4, id_negara = @p5, last_update = @p6, last_sync = @p6
		WHEN NOT MATCHED THEN
			INSERT (id_wil, nm_wil, id_level_wil, id_induk_wilayah, id_negara, a_ref_pddikti, a_ref_unila, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, 1, 1, @p6, @p6, @p6);
	`

	now := time.Now()
	for _, item := range data {
		// getString already trims whitespace
		id := getString(item, "id_wilayah")
		nama := getString(item, "nama_wilayah")
		idLevel := getInt(item, "id_level_wilayah")
		idInduk := getString(item, "id_induk_wilayah")
		idNegara := getString(item, "id_negara")
		if idNegara == "" {
			idNegara = "ID" // Default to Indonesia
		}

		var idIndukPtr *string
		if idInduk != "" {
			idIndukPtr = &idInduk
		}

		_, err := r.db.ExecContext(ctx, query, id, nama, idLevel, idIndukPtr, idNegara, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert wilayah %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertAgama syncs agama data
func (r *repository) UpsertAgama(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "agama",
		EndpointName: "Agama",
		Status:       "success",
	}

	query := `
		MERGE ref.agama AS target
		USING (SELECT @p1 AS id_agama) AS source
		ON target.id_agama = source.id_agama
		WHEN MATCHED THEN
			UPDATE SET nm_agama = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_agama, nm_agama, a_ref_pddikti, a_ref_unila, create_date, last_update, last_sync)
			VALUES (@p1, @p2, 1, 1, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_agama")
		nama := getString(item, "nama_agama")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert agama %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenisTinggal syncs jenis tinggal data
func (r *repository) UpsertJenisTinggal(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenis_tinggal",
		EndpointName: "Jenis Tinggal",
		Status:       "success",
	}

	query := `
		MERGE ref.jenis_tinggal AS target
		USING (SELECT @p1 AS id_jns_tinggal) AS source
		ON target.id_jns_tinggal = source.id_jns_tinggal
		WHEN MATCHED THEN
			UPDATE SET nm_jns_tinggal = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jns_tinggal, nm_jns_tinggal, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_jenis_tinggal")
		nama := getString(item, "nama_jenis_tinggal")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenis_tinggal %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertPekerjaan syncs pekerjaan data
func (r *repository) UpsertPekerjaan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "pekerjaan",
		EndpointName: "Pekerjaan",
		Status:       "success",
	}

	query := `
		MERGE ref.pekerjaan AS target
		USING (SELECT @p1 AS id_pekerjaan) AS source
		ON target.id_pekerjaan = source.id_pekerjaan
		WHEN MATCHED THEN
			UPDATE SET nm_pekerjaan = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_pekerjaan, nm_pekerjaan, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_pekerjaan")
		nama := getString(item, "nama_pekerjaan")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert pekerjaan %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertPenghasilan syncs penghasilan data
func (r *repository) UpsertPenghasilan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "penghasilan",
		EndpointName: "Penghasilan",
		Status:       "success",
	}

	query := `
		MERGE ref.penghasilan AS target
		USING (SELECT @p1 AS id_penghasilan) AS source
		ON target.id_penghasilan = source.id_penghasilan
		WHEN MATCHED THEN
			UPDATE SET nm_penghasilan = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_penghasilan, nm_penghasilan, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_penghasilan")
		nama := getString(item, "nama_penghasilan")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert penghasilan %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertJenjangPendidikan syncs jenjang pendidikan data
func (r *repository) UpsertJenjangPendidikan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "jenjang_pendidikan",
		EndpointName: "Jenjang Pendidikan",
		Status:       "success",
	}

	query := `
		MERGE ref.jenjang_pendidikan AS target
		USING (SELECT @p1 AS id_jenj_didik) AS source
		ON target.id_jenj_didik = source.id_jenj_didik
		WHEN MATCHED THEN
			UPDATE SET nm_jenj_didik = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getString(item, "id_jenjang_didik")
		nama := getString(item, "nama_jenjang_didik")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert jenjang_pendidikan %s: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}

// UpsertPembiayaan syncs pembiayaan data
func (r *repository) UpsertPembiayaan(ctx context.Context, data []map[string]interface{}) (*SyncResult, error) {
	result := &SyncResult{
		EndpointKey:  "pembiayaan",
		EndpointName: "Pembiayaan",
		Status:       "success",
	}

	query := `
		MERGE ref.pembiayaan AS target
		USING (SELECT @p1 AS id_pembiayaan) AS source
		ON target.id_pembiayaan = source.id_pembiayaan
		WHEN MATCHED THEN
			UPDATE SET nm_pembiayaan = @p2, last_update = @p3, last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_pembiayaan, nm_pembiayaan, create_date, last_update, last_sync)
			VALUES (@p1, @p2, @p3, @p3, @p3);
	`

	now := time.Now()
	for _, item := range data {
		id := getInt(item, "id_pembiayaan")
		nama := getString(item, "nama_pembiayaan")

		_, err := r.db.ExecContext(ctx, query, id, nama, now)
		if err != nil {
			result.FailedCount++
			log.Printf("⚠️  [Referensi] Failed to upsert pembiayaan %d: %v", id, err)
		} else {
			result.InsertedCount++
		}
	}

	result.TotalRecords = len(data)
	return result, nil
}
