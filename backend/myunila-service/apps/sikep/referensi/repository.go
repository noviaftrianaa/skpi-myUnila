package referensi

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository interface for referensi data access
type Repository interface {
	// Metadata operations
	GetMetadata(ctx context.Context) ([]ReferensiMetadata, error)

	// Organisasi operations
	GetOrganisasiCount(ctx context.Context) (int, error)
	GetOrganisasiLastSync(ctx context.Context) (*time.Time, error)
	GetOrganisasiList(ctx context.Context) ([]Organisasi, error)
	GetOrganisasiPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertOrganisasi(ctx context.Context, data []Organisasi) (int, error)

	// Fungsional operations
	GetFungsionalCount(ctx context.Context) (int, error)
	GetFungsionalLastSync(ctx context.Context) (*time.Time, error)
	GetFungsionalList(ctx context.Context) ([]Fungsional, error)
	GetFungsionalPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertFungsional(ctx context.Context, data []Fungsional) (int, error)

	// Struktural operations
	GetStrukturalCount(ctx context.Context) (int, error)
	GetStrukturalLastSync(ctx context.Context) (*time.Time, error)
	GetStrukturalList(ctx context.Context) ([]Struktural, error)
	GetStrukturalPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertStruktural(ctx context.Context, data []Struktural) (int, error)

	// Golongan PNS operations
	GetGolonganPNSCount(ctx context.Context) (int, error)
	GetGolonganPNSLastSync(ctx context.Context) (*time.Time, error)
	GetGolonganPNSList(ctx context.Context) ([]GolonganPNS, error)
	GetGolonganPNSPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertGolonganPNS(ctx context.Context, data []GolonganPNS) (int, error)

	// Golongan PPPK operations
	GetGolonganPPPKCount(ctx context.Context) (int, error)
	GetGolonganPPPKLastSync(ctx context.Context) (*time.Time, error)
	GetGolonganPPPKList(ctx context.Context) ([]GolonganPPPK, error)
	GetGolonganPPPKPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertGolonganPPPK(ctx context.Context, data []GolonganPPPK) (int, error)

	// Pendidikan operations
	GetPendidikanCount(ctx context.Context) (int, error)
	GetPendidikanLastSync(ctx context.Context) (*time.Time, error)
	GetPendidikanList(ctx context.Context) ([]Pendidikan, error)
	GetPendidikanPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)
	BulkUpsertPendidikan(ctx context.Context, data []Pendidikan) (int, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new referensi repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ========================================
// Metadata Operations
// ========================================

func (r *repository) GetMetadata(ctx context.Context) ([]ReferensiMetadata, error) {
	configs := GetEndpointConfigs()
	metadata := make([]ReferensiMetadata, 0, len(configs))

	for _, cfg := range configs {
		m := ReferensiMetadata{
			Key:         cfg.Key,
			Name:        cfg.Name,
			Description: cfg.Description,
			Available:   true,
		}

		// Get count and last_sync based on endpoint
		switch cfg.Key {
		case "organisasi":
			m.TotalRecords, _ = r.GetOrganisasiCount(ctx)
			m.LastSync, _ = r.GetOrganisasiLastSync(ctx)
		case "fungsional":
			m.TotalRecords, _ = r.GetFungsionalCount(ctx)
			m.LastSync, _ = r.GetFungsionalLastSync(ctx)
		case "struktural":
			m.TotalRecords, _ = r.GetStrukturalCount(ctx)
			m.LastSync, _ = r.GetStrukturalLastSync(ctx)
		case "golongan_pns":
			m.TotalRecords, _ = r.GetGolonganPNSCount(ctx)
			m.LastSync, _ = r.GetGolonganPNSLastSync(ctx)
		case "golongan_pppk":
			m.TotalRecords, _ = r.GetGolonganPPPKCount(ctx)
			m.LastSync, _ = r.GetGolonganPPPKLastSync(ctx)
		case "pendidikan":
			m.TotalRecords, _ = r.GetPendidikanCount(ctx)
			m.LastSync, _ = r.GetPendidikanLastSync(ctx)
		}

		metadata = append(metadata, m)
	}

	return metadata, nil
}

// ========================================
// Organisasi Operations
// ========================================

func (r *repository) GetOrganisasiCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.unit_orga")
	return count, err
}

func (r *repository) GetOrganisasiLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.unit_orga")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetOrganisasiList(ctx context.Context) ([]Organisasi, error) {
	var list []Organisasi
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_unit_orga, id_unit_orga_induk, kd_unit_orga, nm_unit_orga,
		       alamat, no_tlp, no_fax, kd_pos, nm_singkat, nm_inisial,
		       create_date, last_sync
		FROM sikep.unit_orga
		ORDER BY nm_unit_orga
	`)
	return list, err
}

func (r *repository) BulkUpsertOrganisasi(ctx context.Context, data []Organisasi) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.unit_orga AS target
		USING (SELECT @p1 AS id_unit_orga) AS source
		ON target.id_unit_orga = source.id_unit_orga
		WHEN MATCHED THEN
			UPDATE SET
				id_unit_orga_induk = @p2,
				kd_unit_orga = @p3,
				nm_unit_orga = @p4,
				alamat = @p5,
				no_tlp = @p6,
				no_fax = @p7,
				kd_pos = @p8,
				nm_singkat = @p9,
				nm_inisial = @p10,
				last_sync = @p11
		WHEN NOT MATCHED THEN
			INSERT (id_unit_orga, id_unit_orga_induk, kd_unit_orga, nm_unit_orga,
			        alamat, no_tlp, no_fax, kd_pos, nm_singkat, nm_inisial,
			        create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p11);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.IDUnitOrga,
			item.IDUnitOrgaInduk,
			item.KdUnitOrga,
			item.NmUnitOrga,
			item.Alamat,
			item.NoTlp,
			item.NoFax,
			item.KdPos,
			item.NmSingkat,
			item.NmInisial,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [Organisasi Upsert] Skip error for %s: %v", item.IDUnitOrga, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// ========================================
// Fungsional Operations
// ========================================

func (r *repository) GetFungsionalCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.jabfung")
	return count, err
}

func (r *repository) GetFungsionalLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.jabfung")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetFungsionalList(ctx context.Context) ([]Fungsional, error) {
	var list []Fungsional
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_jabfung, nm_jabfung, kum, ispak, id_gol, tipe, grade,
		       create_date, last_sync
		FROM sikep.jabfung
		ORDER BY nm_jabfung
	`)
	return list, err
}

func (r *repository) BulkUpsertFungsional(ctx context.Context, data []Fungsional) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.jabfung AS target
		USING (SELECT @p1 AS id_jabfung) AS source
		ON target.id_jabfung = source.id_jabfung
		WHEN MATCHED THEN
			UPDATE SET
				nm_jabfung = @p2,
				kum = @p3,
				ispak = @p4,
				id_gol = @p5,
				tipe = @p6,
				grade = @p7,
				last_sync = @p8
		WHEN NOT MATCHED THEN
			INSERT (id_jabfung, nm_jabfung, kum, ispak, id_gol, tipe, grade, create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p8);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.IDJabfung,
			item.NmJabfung,
			item.Kum,
			item.IsPak,
			item.IDGol,
			item.Tipe,
			item.Grade,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [Fungsional Upsert] Skip error for %s: %v", item.IDJabfung, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// ========================================
// Struktural Operations
// ========================================

func (r *repository) GetStrukturalCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.jabstruk")
	return count, err
}

func (r *repository) GetStrukturalLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.jabstruk")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetStrukturalList(ctx context.Context) ([]Struktural, error) {
	var list []Struktural
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_jabstruk, kd_jabstruk, nm_jabstruk, create_date, last_sync
		FROM sikep.jabstruk
		ORDER BY nm_jabstruk
	`)
	return list, err
}

func (r *repository) BulkUpsertStruktural(ctx context.Context, data []Struktural) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.jabstruk AS target
		USING (SELECT @p1 AS id_jabstruk) AS source
		ON target.id_jabstruk = source.id_jabstruk
		WHEN MATCHED THEN
			UPDATE SET
				kd_jabstruk = @p2,
				nm_jabstruk = @p3,
				last_sync = @p4
		WHEN NOT MATCHED THEN
			INSERT (id_jabstruk, kd_jabstruk, nm_jabstruk, create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p4);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.IDJabstruk,
			item.KdJabstruk,
			item.NmJabstruk,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [Struktural Upsert] Skip error for %s: %v", item.IDJabstruk, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// ========================================
// Golongan PNS Operations
// ========================================

func (r *repository) GetGolonganPNSCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.golongan_pns")
	return count, err
}

func (r *repository) GetGolonganPNSLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.golongan_pns")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetGolonganPNSList(ctx context.Context) ([]GolonganPNS, error) {
	var list []GolonganPNS
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_gol, kd_gol, nm_gol, nm_pangkat, deskripsi, create_date, last_sync
		FROM sikep.golongan_pns
		ORDER BY kd_gol
	`)
	return list, err
}

func (r *repository) BulkUpsertGolonganPNS(ctx context.Context, data []GolonganPNS) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.golongan_pns AS target
		USING (SELECT @p1 AS id_gol) AS source
		ON target.id_gol = source.id_gol
		WHEN MATCHED THEN
			UPDATE SET
				kd_gol = @p2,
				nm_gol = @p3,
				nm_pangkat = @p4,
				deskripsi = @p5,
				last_sync = @p6
		WHEN NOT MATCHED THEN
			INSERT (id_gol, kd_gol, nm_gol, nm_pangkat, deskripsi, create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p6);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.IDGol,
			item.KdGol,
			item.NmGol,
			item.NmPangkat,
			item.Deskripsi,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [GolonganPNS Upsert] Skip error for %s: %v", item.IDGol, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// ========================================
// Golongan PPPK Operations
// ========================================

func (r *repository) GetGolonganPPPKCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.golongan_pppk")
	return count, err
}

func (r *repository) GetGolonganPPPKLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.golongan_pppk")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetGolonganPPPKList(ctx context.Context) ([]GolonganPPPK, error) {
	var list []GolonganPPPK
	err := r.db.SelectContext(ctx, &list, `
		SELECT id, golongan, pangkat, id_creator, create_date, last_sync, soft_delete
		FROM sikep.golongan_pppk
		WHERE soft_delete IS NULL
		ORDER BY id
	`)
	return list, err
}

func (r *repository) BulkUpsertGolonganPPPK(ctx context.Context, data []GolonganPPPK) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.golongan_pppk AS target
		USING (SELECT @p1 AS id) AS source
		ON target.id = source.id
		WHEN MATCHED THEN
			UPDATE SET
				golongan = @p2,
				pangkat = @p3,
				last_sync = @p4
		WHEN NOT MATCHED THEN
			INSERT (id, golongan, pangkat, create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p4, @p4);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.ID,
			item.Golongan,
			item.Pangkat,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [GolonganPPPK Upsert] Skip error for %s: %v", item.ID, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// ========================================
// Pendidikan Operations
// ========================================

func (r *repository) GetPendidikanCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM sikep.pendidikan")
	return count, err
}

func (r *repository) GetPendidikanLastSync(ctx context.Context) (*time.Time, error) {
	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync, "SELECT MAX(last_sync) FROM sikep.pendidikan")
	if err != nil {
		return nil, err
	}
	return &lastSync, nil
}

func (r *repository) GetPendidikanList(ctx context.Context) ([]Pendidikan, error) {
	var list []Pendidikan
	err := r.db.SelectContext(ctx, &list, `
		SELECT id_pend, nm_pend, create_date, last_sync
		FROM sikep.pendidikan
		ORDER BY nm_pend
	`)
	return list, err
}

func (r *repository) BulkUpsertPendidikan(ctx context.Context, data []Pendidikan) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}

	query := `
		MERGE sikep.pendidikan AS target
		USING (SELECT @p1 AS id_pend) AS source
		ON target.id_pend = source.id_pend
		WHEN MATCHED THEN
			UPDATE SET
				nm_pend = @p2,
				last_sync = @p3
		WHEN NOT MATCHED THEN
			INSERT (id_pend, nm_pend, create_date, last_sync)
			VALUES (@p1, @p2, @p3, @p3);
	`

	now := time.Now()
	successCount := 0

	for _, item := range data {
		_, err := r.db.ExecContext(ctx, query,
			item.IDPend,
			item.NmPend,
			now,
		)
		if err != nil {
			log.Printf("⚠️  [Pendidikan Upsert] Skip error for %s: %v", item.IDPend, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}

// Helper function to check if table exists
func (r *repository) tableExists(ctx context.Context, tableName string) bool {
	var count int
	err := r.db.GetContext(ctx, &count, fmt.Sprintf(`
		SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
		WHERE TABLE_SCHEMA = 'sikep' AND TABLE_NAME = '%s'
	`, tableName))
	return err == nil && count > 0
}

// ========================================
// Paginated Operations
// ========================================

func (r *repository) GetOrganisasiPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	// Build WHERE clause
	whereClause := ""
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE nm_unit_orga LIKE @p%d OR kd_unit_orga LIKE @p%d", paramIndex, paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.unit_orga %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count organisasi: %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT id_unit_orga, id_unit_orga_induk, kd_unit_orga, nm_unit_orga,
		       alamat, no_tlp, no_fax, kd_pos, nm_singkat, nm_inisial,
		       create_date, last_sync
		FROM sikep.unit_orga
		%s
		ORDER BY nm_unit_orga
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []Organisasi
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get organisasi: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetFungsionalPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereClause := ""
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE nm_jabfung LIKE @p%d", paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.jabfung %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count fungsional: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_jabfung, nm_jabfung, kum, ispak, id_gol, tipe, grade,
		       create_date, last_sync
		FROM sikep.jabfung
		%s
		ORDER BY nm_jabfung
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []Fungsional
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get fungsional: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetStrukturalPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereClause := ""
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE nm_jabstruk LIKE @p%d OR kd_jabstruk LIKE @p%d", paramIndex, paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.jabstruk %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count struktural: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_jabstruk, kd_jabstruk, nm_jabstruk, create_date, last_sync
		FROM sikep.jabstruk
		%s
		ORDER BY nm_jabstruk
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []Struktural
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get struktural: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetGolonganPNSPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereClause := ""
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE nm_gol LIKE @p%d OR nm_pangkat LIKE @p%d OR kd_gol LIKE @p%d", paramIndex, paramIndex, paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.golongan_pns %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count golongan_pns: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_gol, kd_gol, nm_gol, nm_pangkat, deskripsi, create_date, last_sync
		FROM sikep.golongan_pns
		%s
		ORDER BY kd_gol
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []GolonganPNS
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get golongan_pns: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetGolonganPPPKPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereClause := "WHERE soft_delete IS NULL"
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause += fmt.Sprintf(" AND (golongan LIKE @p%d OR pangkat LIKE @p%d)", paramIndex, paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.golongan_pppk %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count golongan_pppk: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id, golongan, pangkat, id_creator, create_date, last_sync, soft_delete
		FROM sikep.golongan_pppk
		%s
		ORDER BY id
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []GolonganPPPK
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get golongan_pppk: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetPendidikanPaginated(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereClause := ""
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE nm_pend LIKE @p%d", paramIndex)
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM sikep.pendidikan %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count pendidikan: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_pend, nm_pend, create_date, last_sync
		FROM sikep.pendidikan
		%s
		ORDER BY nm_pend
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []Pendidikan
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get pendidikan: %w", err)
	}

	totalPages := (total + limit - 1) / limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}
