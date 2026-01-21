package referensi

// import (
// 	"context"
// 	"fmt"
// 	"strings"

// 	"github.com/jmoiron/sqlx"
// )

// // Repository adalah interface untuk akses data referensi
// type Repository interface {
// 	// Semester
// 	GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error)

// 	// Tahun Ajaran
// 	GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error)

// 	// Agama
// 	GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error)

// 	// Wilayah
// 	GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error)

// 	// Aktifitas Kerjasama
// 	GetAktifitasKerjasama(ctx context.Context, params PaginationParams) ([]AktifitasKerjasama, int64, error)

// 	// Basis Evaluasi
// 	GetBasisEvaluasi(ctx context.Context, params PaginationParams) ([]BasisEvaluasi, int64, error)

// 	// Bentuk Kegiatan Kerjasama
// 	GetBentukKegiatanKerjasama(ctx context.Context, params PaginationParams) ([]BentukKegiatanKerjasama, int64, error)

// 	// Bentuk Pendidikan
// 	GetBentukPendidikan(ctx context.Context, params BentukPendidikanParams) ([]BentukPendidikan, int64, error)

// 	// Bidang Kerjasama
// 	GetBidangKerjasama(ctx context.Context, params PaginationParams) ([]BidangKerjasama, int64, error)

// 	// Bidang Pekerjaan
// 	GetBidangPekerjaan(ctx context.Context, params PaginationParams) ([]BidangPekerjaan, int64, error)

// 	// Bidang Studi
// 	GetBidangStudi(ctx context.Context, params BidangStudiParams) ([]BidangStudi, int64, error)

// 	// Bidang Usaha
// 	GetBidangUsaha(ctx context.Context, params PaginationParams) ([]BidangUsaha, int64, error)

// 	// Fungsi Lab
// 	GetFungsiLab(ctx context.Context, params PaginationParams) ([]FungsiLab, int64, error)

// 	// Gelar Akademik
// 	GetGelarAkademik(ctx context.Context, params GelarAkademikParams) ([]GelarAkademik, int64, error)

// 	// Ikatan Kerja SDM
// 	GetIkatanKerjaSdm(ctx context.Context, params PaginationParams) ([]IkatanKerjaSdm, int64, error)
// }

// type repository struct {
// 	db *sqlx.DB
// }

// // NewRepository membuat instance repository baru
// func NewRepository(db *sqlx.DB) Repository {
// 	return &repository{db: db}
// }

// // ============================================================================
// // Semester
// // ============================================================================

// func (r *repository) GetSemesters(ctx context.Context, params SemesterParams) ([]Semester, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.TahunAjaran != nil {
// 		conditions = append(conditions, fmt.Sprintf("id_thn_ajaran = @p%d", argIndex))
// 		args = append(args, *params.TahunAjaran)
// 		argIndex++
// 	}

// 	if params.PeriodeAktif != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_periode_aktif = @p%d", argIndex))
// 		args = append(args, *params.PeriodeAktif)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_smt LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.semester WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count semesters: %w", err)
// 	}

// 	// Get data with pagination
// 	sortBy := "id_smt"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif,
// 		       tgl_mulai, tgl_selesai, create_date, last_update, expired_date
// 		FROM ref.semester
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query semesters: %w", err)
// 	}
// 	defer rows.Close()

// 	var semesters []Semester
// 	for rows.Next() {
// 		var s Semester
// 		err := rows.Scan(
// 			&s.IDSmt, &s.IDThnAjaran, &s.NmSmt, &s.Smt, &s.APeriodeAktif,
// 			&s.TglMulai, &s.TglSelesai, &s.CreateDate, &s.LastUpdate, &s.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan semester: %w", err)
// 		}
// 		semesters = append(semesters, s)
// 	}

// 	return semesters, total, nil
// }

// // ============================================================================
// // Tahun Ajaran
// // ============================================================================

// func (r *repository) GetTahunAjarans(ctx context.Context, params TahunAjaranParams) ([]TahunAjaran, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.PeriodeAktif != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_periode_aktif = @p%d", argIndex))
// 		args = append(args, *params.PeriodeAktif)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_thn_ajaran LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.tahun_ajaran WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count tahun_ajaran: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_thn_ajaran"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_thn_ajaran, nm_thn_ajaran, a_periode_aktif,
// 		       tgl_mulai, tgl_selesai, create_date, last_update, expired_date
// 		FROM ref.tahun_ajaran
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query tahun_ajaran: %w", err)
// 	}
// 	defer rows.Close()

// 	var tahunAjarans []TahunAjaran
// 	for rows.Next() {
// 		var t TahunAjaran
// 		err := rows.Scan(
// 			&t.IDThnAjaran, &t.NmThnAjaran, &t.APeriodeAktif,
// 			&t.TglMulai, &t.TglSelesai, &t.CreateDate, &t.LastUpdate, &t.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan tahun_ajaran: %w", err)
// 		}
// 		tahunAjarans = append(tahunAjarans, t)
// 	}

// 	return tahunAjarans, total, nil
// }

// // ============================================================================
// // Agama
// // ============================================================================

// func (r *repository) GetAgamas(ctx context.Context, params PaginationParams) ([]Agama, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_agama LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.agama WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count agama: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_agama"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_agama, nm_agama, create_date, last_update, expired_date
// 		FROM ref.agama
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query agama: %w", err)
// 	}
// 	defer rows.Close()

// 	var agamas []Agama
// 	for rows.Next() {
// 		var a Agama
// 		err := rows.Scan(
// 			&a.IDAgama, &a.NmAgama, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan agama: %w", err)
// 		}
// 		agamas = append(agamas, a)
// 	}

// 	return agamas, total, nil
// }

// // ============================================================================
// // Wilayah
// // ============================================================================

// func (r *repository) GetWilayahs(ctx context.Context, params WilayahParams) ([]Wilayah, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Level != nil {
// 		conditions = append(conditions, fmt.Sprintf("id_level_wil = @p%d", argIndex))
// 		args = append(args, *params.Level)
// 		argIndex++
// 	}

// 	if params.IDIndukWilayah != nil {
// 		conditions = append(conditions, fmt.Sprintf("id_induk_wilayah = @p%d", argIndex))
// 		args = append(args, *params.IDIndukWilayah)
// 		argIndex++
// 	}

// 	if params.IDNegara != nil {
// 		conditions = append(conditions, fmt.Sprintf("id_negara = @p%d", argIndex))
// 		args = append(args, *params.IDNegara)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_wil LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.wilayah WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count wilayah: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_wil"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri,
// 		       kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date
// 		FROM ref.wilayah
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query wilayah: %w", err)
// 	}
// 	defer rows.Close()

// 	var wilayahs []Wilayah
// 	for rows.Next() {
// 		var w Wilayah
// 		err := rows.Scan(
// 			&w.IDWil, &w.IDNegara, &w.NmWil, &w.AsalWil, &w.KodeBps, &w.KodeDagri,
// 			&w.KodeKeu, &w.IDIndukWilayah, &w.IDLevelWil, &w.CreateDate, &w.LastUpdate, &w.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan wilayah: %w", err)
// 		}
// 		wilayahs = append(wilayahs, w)
// 	}

// 	return wilayahs, total, nil
// }

// // ============================================================================
// // Aktifitas Kerjasama
// // ============================================================================

// func (r *repository) GetAktifitasKerjasama(ctx context.Context, params PaginationParams) ([]AktifitasKerjasama, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_akt_kerjasama LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.aktifitas_kerjasama WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count aktifitas kerjasama: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_akt_kerjasama"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_akt_kerjasama, nm_akt_kerjasama, ket, create_date, last_update, expired_date
// 		FROM ref.aktifitas_kerjasama
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query aktifitas kerjasama: %w", err)
// 	}
// 	defer rows.Close()

// 	var aktifitasKerjasama []AktifitasKerjasama
// 	for rows.Next() {
// 		var a AktifitasKerjasama
// 		err := rows.Scan(
// 			&a.IDAktKerjasama, &a.NmAktKerjasama, &a.Ket, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan aktifitas kerjasama: %w", err)
// 		}
// 		aktifitasKerjasama = append(aktifitasKerjasama, a)
// 	}

// 	return aktifitasKerjasama, total, nil
// }

// // ============================================================================
// // Aktifitas Kerjasama
// // ============================================================================

// func (r *repository) GetBasisEvaluasi(ctx context.Context, params PaginationParams) ([]BasisEvaluasi, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_basis_evaluasi LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.basis_evaluasi WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count basis evaluasi: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_basis_evaluasi"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_basis_evaluasi, nm_basis_evaluasi, create_date, last_update, expired_date
// 		FROM ref.basis_evaluasi
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query basis evaluasi: %w", err)
// 	}
// 	defer rows.Close()

// 	var basisEvaluasi []BasisEvaluasi
// 	for rows.Next() {
// 		var a BasisEvaluasi
// 		err := rows.Scan(
// 			&a.IDBasisEvaluasi, &a.NmBasisEvaluasi, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan basis evaluasi: %w", err)
// 		}
// 		basisEvaluasi = append(basisEvaluasi, a)
// 	}

// 	return basisEvaluasi, total, nil
// }

// // ============================================================================
// // Bentuk Kegiatan Kerjasama
// // ============================================================================

// func (r *repository) GetBentukKegiatanKerjasama(ctx context.Context, params PaginationParams) ([]BentukKegiatanKerjasama, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bntk_giat_kerjasama LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bentuk_kegiatan_kerjasama WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bentuk kegiatan kerjasama: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bntk_giat_kerjasama"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bntk_giat_kerjasama, nm_bntk_giat_kerjasama, ket, create_date, last_update, expired_date
// 		FROM ref.bentuk_kegiatan_kerjasama
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bentuk kegiatan kerjasama: %w", err)
// 	}
// 	defer rows.Close()

// 	var bentukKegiatanKerjasama []BentukKegiatanKerjasama
// 	for rows.Next() {
// 		var a BentukKegiatanKerjasama
// 		err := rows.Scan(
// 			&a.IDBntkGiatKerjasama, &a.NmBntkGiatKerjasama, &a.Ket, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan basis evaluasi: %w", err)
// 		}
// 		bentukKegiatanKerjasama = append(bentukKegiatanKerjasama, a)
// 	}

// 	return bentukKegiatanKerjasama, total, nil
// }

// // ============================================================================
// // Bentuk Pendidikan
// // ============================================================================

// func (r *repository) GetBentukPendidikan(ctx context.Context, params BentukPendidikanParams) ([]BentukPendidikan, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.JenjangPaud != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_paud = @p%d", argIndex))
// 		args = append(args, *params.JenjangPaud)
// 		argIndex++
// 	}
// 	if params.JenjangTk != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_tk = @p%d", argIndex))
// 		args = append(args, *params.JenjangTk)
// 		argIndex++
// 	}
// 	if params.JenjangSd != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_sd = @p%d", argIndex))
// 		args = append(args, *params.JenjangSd)
// 		argIndex++
// 	}
// 	if params.JenjangSmp != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_smp = @p%d", argIndex))
// 		args = append(args, *params.JenjangSmp)
// 		argIndex++
// 	}
// 	if params.JenjangSma != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_sma = @p%d", argIndex))
// 		args = append(args, *params.JenjangSma)
// 		argIndex++
// 	}
// 	if params.JenjangTinggi != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_tinggi = @p%d", argIndex))
// 		args = append(args, *params.JenjangTinggi)
// 		argIndex++
// 	}
// 	if params.Aktif != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_aktif = @p%d", argIndex))
// 		args = append(args, *params.Aktif)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bp LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bentuk_pendidikan WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bentuk pendidikan: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bp"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bp, nm_bp, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, dir_bina, a_aktif, create_date, last_update, expired_date
// 		FROM ref.bentuk_pendidikan
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bentuk pendidikan: %w", err)
// 	}
// 	defer rows.Close()

// 	var bentukPendidikan []BentukPendidikan
// 	for rows.Next() {
// 		var a BentukPendidikan
// 		err := rows.Scan(
// 			&a.IDBp, &a.NmBp, &a.AJenjPaud, &a.AJenjTk, &a.AJenjSd, &a.AJenjSmp, &a.AJenjSma, &a.AJenjTinggi, &a.DirBina, &a.AAktif, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan bentuk pendidikan: %w", err)
// 		}
// 		bentukPendidikan = append(bentukPendidikan, a)
// 	}

// 	return bentukPendidikan, total, nil
// }

// // ============================================================================
// // Bidang Kerjasama
// // ============================================================================

// func (r *repository) GetBidangKerjasama(ctx context.Context, params PaginationParams) ([]BidangKerjasama, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bid_kerjasama LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bidang_kerjasama WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bidang kerjasama: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bid_kerjasama"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bid_kerjasama, nm_bid_kerjasama, create_date, last_update, expired_date
// 		FROM ref.bidang_kerjasama
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bidang kerjasama: %w", err)
// 	}
// 	defer rows.Close()

// 	var bidangKerjasama []BidangKerjasama
// 	for rows.Next() {
// 		var a BidangKerjasama
// 		err := rows.Scan(
// 			&a.IDBidKerjasama, &a.NmBidKerjasama, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan basis evaluasi: %w", err)
// 		}
// 		bidangKerjasama = append(bidangKerjasama, a)
// 	}

// 	return bidangKerjasama, total, nil
// }

// // ============================================================================
// // Bidang Pekerjaan
// // ============================================================================

// func (r *repository) GetBidangPekerjaan(ctx context.Context, params PaginationParams) ([]BidangPekerjaan, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bid_kerja LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bidang_pekerjaan WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bidang pekerjaan: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bid_kerja"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bid_kerja, nm_bid_kerja, create_date, last_update, expired_date
// 		FROM ref.bidang_pekerjaan
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bidang pekerjaan: %w", err)
// 	}
// 	defer rows.Close()

// 	var bidangPekerjaan []BidangPekerjaan
// 	for rows.Next() {
// 		var a BidangPekerjaan
// 		err := rows.Scan(
// 			&a.IDBidKerja, &a.NmBidKerja, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan basis evaluasi: %w", err)
// 		}
// 		bidangPekerjaan = append(bidangPekerjaan, a)
// 	}

// 	return bidangPekerjaan, total, nil
// }

// // ============================================================================
// // Bidang Pekerjaan
// // ============================================================================

// func (r *repository) GetBidangStudi(ctx context.Context, params BidangStudiParams) ([]BidangStudi, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.IDIndukBidangStudi != nil {
// 		conditions = append(conditions, fmt.Sprintf("id_induk_bidang_studi = @p%d", argIndex))
// 		args = append(args, *params.IDIndukBidangStudi)
// 		argIndex++
// 	}
// 	if params.Kelompok != nil {
// 		conditions = append(conditions, fmt.Sprintf("kelompok = @p%d", argIndex))
// 		args = append(args, *params.Kelompok)
// 		argIndex++
// 	}
// 	if params.JenjangPaud != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_paud = @p%d", argIndex))
// 		args = append(args, *params.JenjangPaud)
// 		argIndex++
// 	}
// 	if params.JenjangTk != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_tk = @p%d", argIndex))
// 		args = append(args, *params.JenjangTk)
// 		argIndex++
// 	}
// 	if params.JenjangSd != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_sd = @p%d", argIndex))
// 		args = append(args, *params.JenjangSd)
// 		argIndex++
// 	}
// 	if params.JenjangSmp != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_smp = @p%d", argIndex))
// 		args = append(args, *params.JenjangSmp)
// 		argIndex++
// 	}
// 	if params.JenjangSma != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_sma = @p%d", argIndex))
// 		args = append(args, *params.JenjangSma)
// 		argIndex++
// 	}
// 	if params.JenjangTinggi != nil {
// 		conditions = append(conditions, fmt.Sprintf("a_jenj_tinggi = @p%d", argIndex))
// 		args = append(args, *params.JenjangTinggi)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bid_studi LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bidang_studi WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bidang studi: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bid_studi"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bid_studi, id_induk_bidang_studi, kode_bid_studi, nm_bid_studi, a_kel, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, create_date, last_update, expired_date
// 		FROM ref.bidang_studi
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bidang studi: %w", err)
// 	}
// 	defer rows.Close()

// 	var bidangStudi []BidangStudi
// 	for rows.Next() {
// 		var a BidangStudi
// 		err := rows.Scan(
// 			&a.IDBidStudi, &a.IDIndukBidangStudi, &a.KodeBidStudi, &a.NmBidStudi, &a.AKel, &a.AJenjPaud, &a.AJenjTk, &a.AJenjSd, &a.AJenjSmp, &a.AJenjSma, &a.AJenjTinggi, &a.CreateDate, &a.LastUpdate, &a.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan basis evaluasi: %w", err)
// 		}
// 		bidangStudi = append(bidangStudi, a)
// 	}

// 	return bidangStudi, total, nil
// }

// // ============================================================================
// // Bidang Usaha
// // ============================================================================

// func (r *repository) GetBidangUsaha(ctx context.Context, params PaginationParams) ([]BidangUsaha, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_bu LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.bidang_usaha WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count bidang usaha: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_bu"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_bu, nm_bu, create_date, last_update, expired_date
// 		FROM ref.bidang_usaha
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query bidang usaha: %w", err)
// 	}
// 	defer rows.Close()

// 	var bidangUsaha []BidangUsaha
// 	for rows.Next() {
// 		var b BidangUsaha
// 		err := rows.Scan(
// 			&b.IDBu, &b.NmBu, &b.CreateDate, &b.LastUpdate, &b.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan bidang usaha: %w", err)
// 		}
// 		bidangUsaha = append(bidangUsaha, b)
// 	}

// 	return bidangUsaha, total, nil
// }

// // ============================================================================
// // Fungsi Lab
// // ============================================================================

// func (r *repository) GetFungsiLab(ctx context.Context, params PaginationParams) ([]FungsiLab, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_fungsi_lab LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.fungsi_lab WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count fungsi lab: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_fungsi_lab"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_fungsi_lab, nm_fungsi_lab, create_date, last_update, expired_date
// 		FROM ref.fungsi_lab
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query fungsi lab: %w", err)
// 	}
// 	defer rows.Close()

// 	var fungsiLab []FungsiLab
// 	for rows.Next() {
// 		var f FungsiLab
// 		err := rows.Scan(
// 			&f.IDFungsiLab, &f.NmFungsiLab, &f.CreateDate, &f.LastUpdate, &f.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan fungsi lab: %w", err)
// 		}
// 		fungsiLab = append(fungsiLab, f)
// 	}

// 	return fungsiLab, total, nil
// }

// // ============================================================================
// // Gelar Akademik
// // ============================================================================

// func (r *repository) GetGelarAkademik(ctx context.Context, params GelarAkademikParams) ([]GelarAkademik, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.PosisiGelar != nil {
// 		conditions = append(conditions, fmt.Sprintf("posisi_gelar = @p%d", argIndex))
// 		args = append(args, *params.PosisiGelar)
// 		argIndex++
// 	}

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_gelar_akad LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.gelar_akademik WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count gelar akademik: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_gelar_akad"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_gelar_akad, singkat_gelar, nm_gelar_akad, posisi_gelar, create_date, last_update, expired_date
// 		FROM ref.gelar_akademik
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query gelar akademik: %w", err)
// 	}
// 	defer rows.Close()

// 	var gelarAkademik []GelarAkademik
// 	for rows.Next() {
// 		var g GelarAkademik
// 		err := rows.Scan(
// 			&g.IDGelarAkad, &g.SingkatGelar, &g.NmGelarAkad, &g.PosisiGelar, &g.CreateDate, &g.LastUpdate, &g.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan gelar akademik: %w", err)
// 		}
// 		gelarAkademik = append(gelarAkademik, g)
// 	}

// 	return gelarAkademik, total, nil
// }

// // ============================================================================
// // Ikatan Kerja SDM
// // ============================================================================

// func (r *repository) GetIkatanKerjaSdm(ctx context.Context, params PaginationParams) ([]IkatanKerjaSdm, int64, error) {
// 	params.NormalizePagination()

// 	// Build WHERE clause
// 	conditions := []string{"expired_date IS NULL"}
// 	args := []interface{}{}
// 	argIndex := 1

// 	if params.Search != "" {
// 		conditions = append(conditions, fmt.Sprintf("nm_ikatan_kerja LIKE @p%d", argIndex))
// 		args = append(args, "%"+params.Search+"%")
// 		argIndex++
// 	}

// 	whereClause := strings.Join(conditions, " AND ")

// 	// Count total
// 	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM ref.ikatan_kerja_sdm WHERE %s", whereClause)
// 	var total int64
// 	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("count ikatan kerja sdm: %w", err)
// 	}

// 	// Get data
// 	sortBy := "id_ikatan_kerja"
// 	if params.SortBy != "" {
// 		sortBy = params.SortBy
// 	}

// 	query := fmt.Sprintf(`
// 		SELECT id_ikatan_kerja, nm_ikatan_kerja, ket_ikatan_kerja, create_date, last_update, expired_date
// 		FROM ref.ikatan_kerja_sdm
// 		WHERE %s
// 		ORDER BY %s %s
// 		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
// 		whereClause, sortBy, params.Order, argIndex, argIndex+1)

// 	args = append(args, params.Offset(), params.Limit)

// 	rows, err := r.db.QueryContext(ctx, query, args...)
// 	if err != nil {
// 		return nil, 0, fmt.Errorf("query ikatan kerja sdm: %w", err)
// 	}
// 	defer rows.Close()

// 	var ikatanKerjaSdm []IkatanKerjaSdm
// 	for rows.Next() {
// 		var i IkatanKerjaSdm
// 		err := rows.Scan(
// 			&i.IDIkatanKerja, &i.NmIkatanKerja, &i.KetIkatanKerja, &i.CreateDate, &i.LastUpdate, &i.ExpiredDate,
// 		)
// 		if err != nil {
// 			return nil, 0, fmt.Errorf("scan ikatan kerja sdm: %w", err)
// 		}
// 		ikatanKerjaSdm = append(ikatanKerjaSdm, i)
// 	}

// 	return ikatanKerjaSdm, total, nil
// }
