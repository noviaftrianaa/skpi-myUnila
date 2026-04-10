package dashboard

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetModuleStats(ctx context.Context) ([]ModuleStat, error)
	GetRecentSyncs(ctx context.Context, limit int) ([]RecentSync, error)
	GetQuickStats(ctx context.Context) (*QuickStats, error)
	GetLastSyncTime(ctx context.Context) (*time.Time, error)
	GetTotalRecordsSynced(ctx context.Context) (int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// convertToWIB converts UTC time to WIB (UTC+7)
func convertToWIB(t time.Time) time.Time {
	wib := time.FixedZone("WIB", 7*60*60)
	return t.In(wib)
}

// GetModuleStats returns statistics for each data module
func (r *repository) GetModuleStats(ctx context.Context) ([]ModuleStat, error) {
	modules := []ModuleStat{}

	// Mahasiswa stats
	var mahasiswaCount int64
	var mahasiswaLastSync sql.NullTime
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.reg_pd WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&mahasiswaCount, &mahasiswaLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	mahasiswaStatus := "inactive"
	if mahasiswaCount > 0 {
		mahasiswaStatus = "active"
	}
	var mahasiswaLastSyncPtr *time.Time
	if mahasiswaLastSync.Valid {
		t := convertToWIB(mahasiswaLastSync.Time)
		mahasiswaLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Data Mahasiswa",
		Key:         "mahasiswa",
		Description: "Data registrasi mahasiswa dari Neo Feeder PDDIKTI",
		TotalCount:  mahasiswaCount,
		LastSync:    mahasiswaLastSyncPtr,
		Status:      mahasiswaStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/mahasiswa",
	})

	// Aktivitas Mahasiswa stats
	var aktivitasCount int64
	var aktivitasLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.akt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&aktivitasCount, &aktivitasLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	aktivitasStatus := "inactive"
	if aktivitasCount > 0 {
		aktivitasStatus = "active"
	}
	var aktivitasLastSyncPtr *time.Time
	if aktivitasLastSync.Valid {
		t := convertToWIB(aktivitasLastSync.Time)
		aktivitasLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Aktivitas Mahasiswa",
		Key:         "aktivitas_mahasiswa",
		Description: "Data aktivitas mahasiswa (KKN, PKL, Skripsi, dll)",
		TotalCount:  aktivitasCount,
		LastSync:    aktivitasLastSyncPtr,
		Status:      aktivitasStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/aktivitas-mahasiswa",
	})

	// Kelas Kuliah stats
	var kelasCount int64
	var kelasLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.kelas_kuliah WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&kelasCount, &kelasLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	kelasStatus := "inactive"
	if kelasCount > 0 {
		kelasStatus = "active"
	}
	var kelasLastSyncPtr *time.Time
	if kelasLastSync.Valid {
		t := convertToWIB(kelasLastSync.Time)
		kelasLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Kelas Kuliah",
		Key:         "kelas_kuliah",
		Description: "Data kelas kuliah dan peserta kelas",
		TotalCount:  kelasCount,
		LastSync:    kelasLastSyncPtr,
		Status:      kelasStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/kelas-kuliah",
	})

	// Nilai Perkuliahan stats
	var nilaiCount int64
	var nilaiLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.nilai_smt_mhs WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&nilaiCount, &nilaiLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	nilaiStatus := "inactive"
	if nilaiCount > 0 {
		nilaiStatus = "active"
	}
	var nilaiLastSyncPtr *time.Time
	if nilaiLastSync.Valid {
		t := convertToWIB(nilaiLastSync.Time)
		nilaiLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Nilai Perkuliahan",
		Key:         "nilai_perkuliahan",
		Description: "Data nilai perkuliahan mahasiswa",
		TotalCount:  nilaiCount,
		LastSync:    nilaiLastSyncPtr,
		Status:      nilaiStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/nilai-perkuliahan",
	})

	// Transkrip Nilai stats
	var transkripCount int64
	var transkripLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.nilai_transkrip WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&transkripCount, &transkripLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	transkripStatus := "inactive"
	if transkripCount > 0 {
		transkripStatus = "active"
	}
	var transkripLastSyncPtr *time.Time
	if transkripLastSync.Valid {
		t := convertToWIB(transkripLastSync.Time)
		transkripLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Transkrip Nilai",
		Key:         "transkrip_nilai",
		Description: "Data transkrip nilai mahasiswa",
		TotalCount:  transkripCount,
		LastSync:    transkripLastSyncPtr,
		Status:      transkripStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/transkrip-nilai",
	})

	// Prestasi stats
	var prestasiCount int64
	var prestasiLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.prestasi WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&prestasiCount, &prestasiLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	prestasiStatus := "inactive"
	if prestasiCount > 0 {
		prestasiStatus = "active"
	}
	var prestasiLastSyncPtr *time.Time
	if prestasiLastSync.Valid {
		t := convertToWIB(prestasiLastSync.Time)
		prestasiLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Prestasi Mahasiswa",
		Key:         "prestasi",
		Description: "Data prestasi mahasiswa",
		TotalCount:  prestasiCount,
		LastSync:    prestasiLastSyncPtr,
		Status:      prestasiStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/prestasi",
	})

	// Matkul Kurikulum stats
	var matkulCount int64
	var matkulLastSync sql.NullTime
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MAX(last_sync)
		FROM pdrd.matkul_kurikulum WITH(NOLOCK)
		WHERE soft_delete = 0
	`).Scan(&matkulCount, &matkulLastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	matkulStatus := "inactive"
	if matkulCount > 0 {
		matkulStatus = "active"
	}
	var matkulLastSyncPtr *time.Time
	if matkulLastSync.Valid {
		t := convertToWIB(matkulLastSync.Time)
		matkulLastSyncPtr = &t
	}
	modules = append(modules, ModuleStat{
		Name:        "Mata Kuliah Kurikulum",
		Key:         "matkul_kurikulum",
		Description: "Data mata kuliah dalam kurikulum",
		TotalCount:  matkulCount,
		LastSync:    matkulLastSyncPtr,
		Status:      matkulStatus,
		Href:        "/dashboard/feeder-integrator/pdrd/matkul-kurikulum",
	})

	return modules, nil
}

// GetRecentSyncs returns recent sync activities
func (r *repository) GetRecentSyncs(ctx context.Context, limit int) ([]RecentSync, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT TOP (@p1)
			id, endpoint_name, endpoint_key, status,
			total_records, inserted_count, failed_count,
			duration_ms, synced_by, synced_at
		FROM logger.sync_logs
		WHERE api_code = 'FEEDER'
		ORDER BY synced_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var syncs []RecentSync
	for rows.Next() {
		var s RecentSync
		err := rows.Scan(
			&s.ID,
			&s.EndpointName,
			&s.EndpointKey,
			&s.Status,
			&s.TotalRecords,
			&s.SyncedCount,
			&s.FailedCount,
			&s.DurationMs,
			&s.SyncedBy,
			&s.SyncedAt,
		)
		if err != nil {
			return nil, err
		}
		s.SyncedAt = convertToWIB(s.SyncedAt)
		syncs = append(syncs, s)
	}

	return syncs, nil
}

// GetQuickStats returns quick statistics summary
func (r *repository) GetQuickStats(ctx context.Context) (*QuickStats, error) {
	stats := &QuickStats{}

	// Total Mahasiswa
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.reg_pd WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalMahasiswa)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Mahasiswa Aktif (belum keluar/lulus berdasarkan reg.id_jns_keluar IS NULL)
	// NOTE: pd.id_stat_mhs = 'A' tidak dipakai karena master status tidak selalu konsisten
	// dengan reg.id_jns_keluar (lihat LAPORAN_VERIFIKASI_MHS_AKTIF.md)
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM pdrd.reg_pd AS reg WITH(NOLOCK)
		INNER JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd AND pd.soft_delete = 0
		WHERE reg.soft_delete = 0 AND reg.id_jns_keluar IS NULL
	`).Scan(&stats.TotalMahasiswaAktif)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Kelas Kuliah
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.kelas_kuliah WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalKelasKuliah)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Nilai Perkuliahan
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.nilai_smt_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalNilaiPerkuliahan)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Transkrip Nilai
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalTranskripNilai)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Prestasi
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.prestasi WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalPrestasi)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Aktivitas
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.akt_mhs WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalAktivitas)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Total Matkul
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM pdrd.matkul_kurikulum WITH(NOLOCK) WHERE soft_delete = 0
	`).Scan(&stats.TotalMatkul)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	return stats, nil
}

// GetLastSyncTime returns the most recent sync time
func (r *repository) GetLastSyncTime(ctx context.Context) (*time.Time, error) {
	var lastSync sql.NullTime
	err := r.db.QueryRowContext(ctx, `
		SELECT MAX(synced_at) FROM logger.sync_logs WHERE api_code = 'FEEDER'
	`).Scan(&lastSync)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	if lastSync.Valid {
		t := convertToWIB(lastSync.Time)
		return &t, nil
	}
	return nil, nil
}

// GetTotalRecordsSynced returns total records synced across all modules
func (r *repository) GetTotalRecordsSynced(ctx context.Context) (int64, error) {
	var total int64

	// Sum from all tables
	tables := []string{
		"SELECT COUNT(*) FROM pdrd.reg_pd WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.akt_mhs WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.kelas_kuliah WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.nilai_smt_mhs WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.nilai_transkrip WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.prestasi WITH(NOLOCK) WHERE soft_delete = 0",
		"SELECT COUNT(*) FROM pdrd.matkul_kurikulum WITH(NOLOCK) WHERE soft_delete = 0",
	}

	for _, q := range tables {
		var count int64
		err := r.db.QueryRowContext(ctx, q).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			continue // Skip on error
		}
		total += count
	}

	return total, nil
}
