package nilai

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for nilai data access
type Repository interface {
	// KHS
	UpsertKHS(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKHSList(ctx context.Context, page, limit int, search, idSemester, nim string) (*PaginatedResult, error)

	// Transkrip
	UpsertTranskrip(ctx context.Context, data map[string]interface{}) (bool, error)
	GetTranskripList(ctx context.Context, page, limit int, search, nim string) (*PaginatedResult, error)

	// Kuliah
	UpsertKuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKuliahList(ctx context.Context, page, limit int, search, idSemester, nim string) (*PaginatedResult, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// getString safely extracts a string from map
func getString(data map[string]interface{}, key string) *string {
	if v, ok := data[key]; ok && v != nil {
		switch s := v.(type) {
		case string:
			if s != "" {
				return &s
			}
		case float64:
			str := fmt.Sprintf("%v", s)
			return &str
		}
	}
	return nil
}

// getFloat safely extracts a float64 from map
func getFloat(data map[string]interface{}, key string) *float64 {
	if v, ok := data[key]; ok && v != nil {
		switch f := v.(type) {
		case float64:
			return &f
		case float32:
			ff := float64(f)
			return &ff
		}
	}
	return nil
}

// getInt safely extracts an int from map
func getInt(data map[string]interface{}, key string) *int {
	if v, ok := data[key]; ok && v != nil {
		switch i := v.(type) {
		case float64:
			ii := int(i)
			return &ii
		case int:
			return &i
		}
	}
	return nil
}

// ========================================
// KHS Operations
// ========================================

func (r *repository) UpsertKHS(ctx context.Context, data map[string]interface{}) (bool, error) {
	idKelas := getInt(data, "idkelas")
	nim := getString(data, "nim")
	idMK := getString(data, "idmk")

	if nim == nil || idMK == nil {
		return false, fmt.Errorf("nim and idmk are required for KHS")
	}

	now := time.Now()

	// Key: nim + id_semester + id_mk
	idSemester := getString(data, "idperiode")

	updateQuery := `
		UPDATE siakadu.nilai_smt_mhs SET
			id_kelas = @p1,
			nama_mk = @p2,
			sks_mk = @p3,
			nilai_huruf = @p4,
			nilai_index = @p5,
			nilai_angka = @p6,
			status_lulus = @p7,
			status_ulang = @p8,
			id_unit = @p9,
			last_sync = @p10
		WHERE nim = @p11 AND id_semester = @p12 AND id_mk = @p13
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		idKelas,                           // @p1
		getString(data, "namamk"),         // @p2
		getInt(data, "sksmk"),             // @p3
		getString(data, "nilai_huruf"),    // @p4
		getFloat(data, "nilai_index"),     // @p5
		getFloat(data, "nilai_angka"),     // @p6
		getString(data, "islulus"),         // @p7
		getString(data, "isulang"),         // @p8
		getString(data, "idunit"),          // @p9
		now,                               // @p10
		nim,                               // @p11
		idSemester,                        // @p12
		idMK,                              // @p13
	)
	if err != nil {
		return false, fmt.Errorf("failed to update nilai_smt_mhs: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.nilai_smt_mhs (
			id_nilai_smt, nim, id_semester, id_kelas, id_mk,
			nama_mk, sks_mk, nilai_huruf, nilai_index, nilai_angka,
			status_lulus, status_ulang, id_unit, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13, @p14, @p15
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                           // @p1
		nim,                               // @p2
		idSemester,                        // @p3
		idKelas,                           // @p4
		idMK,                              // @p5
		getString(data, "namamk"),         // @p6
		getInt(data, "sksmk"),             // @p7
		getString(data, "nilai_huruf"),    // @p8
		getFloat(data, "nilai_index"),     // @p9
		getFloat(data, "nilai_angka"),     // @p10
		getString(data, "islulus"),         // @p11
		getString(data, "isulang"),         // @p12
		getString(data, "idunit"),          // @p13
		now,                               // @p14
		now,                               // @p15
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert nilai_smt_mhs: %w", err)
	}

	return true, nil
}

func (r *repository) GetKHSList(ctx context.Context, page, limit int, search, idSemester, nim string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(nama_mk LIKE @p%d OR nim LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if idSemester != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("id_semester = @p%d", paramIndex))
		args = append(args, idSemester)
		paramIndex++
	}
	if nim != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("nim = @p%d", paramIndex))
		args = append(args, nim)
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.nilai_smt_mhs %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count khs: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_kelas, id_semester, nim, CAST(NULL AS VARCHAR(200)) AS nama_mahasiswa,
			id_mk AS id_mata_kuliah, nama_mk AS nama_mata_kuliah, sks_mk AS sks,
			nilai_huruf, nilai_index, nilai_angka, status_lulus, id_unit, last_sync
		FROM siakadu.nilai_smt_mhs
		%s ORDER BY nim ASC, id_semester ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KHSListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get khs list: %w", err)
	}

	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// ========================================
// Transkrip Operations
// ========================================

func (r *repository) UpsertTranskrip(ctx context.Context, data map[string]interface{}) (bool, error) {
	nim := getString(data, "nim")
	idMK := getString(data, "idmk")

	if nim == nil || idMK == nil {
		return false, fmt.Errorf("nim and idmk are required for transkrip")
	}

	now := time.Now()
	idSemester := getString(data, "idperiode")

	updateQuery := `
		UPDATE siakadu.nilai_transkrip SET
			nama_semester = @p1,
			id_kurikulum = @p2,
			nama_mk = @p3,
			sks_mk = @p4,
			nilai_huruf = @p5,
			nilai_index = @p6,
			nilai_bobot = @p7,
			status_lulus = @p8,
			semester_mk = @p9,
			jenis_mk = @p10,
			last_sync = @p11
		WHERE nim = @p12 AND id_mk = @p13 AND id_semester = @p14
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getString(data, "namaperiode"),    // @p1
		getInt(data, "idkurikulum"),       // @p2
		getString(data, "namamk"),         // @p3
		getInt(data, "sksmk"),             // @p4
		getString(data, "nilai_huruf"),    // @p5
		getFloat(data, "nilai_index"),     // @p6
		getFloat(data, "nilai_bobot"),     // @p7
		getString(data, "islulus"),         // @p8
		getString(data, "semmk"),           // @p9
		getString(data, "wajibpilihan"),   // @p10
		now,                               // @p11
		nim,                               // @p12
		idMK,                              // @p13
		idSemester,                        // @p14
	)
	if err != nil {
		return false, fmt.Errorf("failed to update nilai_transkrip: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.nilai_transkrip (
			id_nilai_transkrip, nim, id_semester, nama_semester,
			id_kurikulum, id_mk, nama_mk, sks_mk,
			nilai_huruf, nilai_index, nilai_bobot, status_lulus,
			semester_mk, jenis_mk, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10, @p11, @p12,
			@p13, @p14, @p15, @p16
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                           // @p1
		nim,                               // @p2
		idSemester,                        // @p3
		getString(data, "namaperiode"),    // @p4
		getInt(data, "idkurikulum"),       // @p5
		idMK,                              // @p6
		getString(data, "namamk"),         // @p7
		getInt(data, "sksmk"),             // @p8
		getString(data, "nilai_huruf"),    // @p9
		getFloat(data, "nilai_index"),     // @p10
		getFloat(data, "nilai_bobot"),     // @p11
		getString(data, "islulus"),         // @p12
		getString(data, "semmk"),           // @p13
		getString(data, "wajibpilihan"),   // @p14
		now,                               // @p15
		now,                               // @p16
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert nilai_transkrip: %w", err)
	}

	return true, nil
}

func (r *repository) GetTranskripList(ctx context.Context, page, limit int, search, nim string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(nama_mk LIKE @p%d OR nim LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if nim != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("nim = @p%d", paramIndex))
		args = append(args, nim)
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.nilai_transkrip %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count transkrip: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_semester, nama_semester, nim, CAST(NULL AS VARCHAR(200)) AS nama_mahasiswa,
			id_mk AS id_mata_kuliah, nama_mk AS nama_mata_kuliah, sks_mk AS sks,
			nilai_huruf, nilai_index, nilai_bobot, status_lulus, last_sync
		FROM siakadu.nilai_transkrip
		%s ORDER BY nim ASC, id_semester ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*TranskripListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get transkrip list: %w", err)
	}

	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

// ========================================
// Kuliah Operations
// ========================================

func (r *repository) UpsertKuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	nim := getString(data, "nim")
	idSemester := getString(data, "idperiode")

	if nim == nil || idSemester == nil {
		return false, fmt.Errorf("nim and idperiode are required for kuliah")
	}

	now := time.Now()

	updateQuery := `
		UPDATE siakadu.kuliah_mhs SET
			nama_periode = @p1,
			semester_kuliah = @p2,
			semester_mk = @p3,
			status_kuliah = @p4,
			status_akademik = @p5,
			status_keuangan = @p6,
			sks_semester = @p7,
			ips = @p8,
			total_sks = @p9,
			ipk = @p10,
			sks_lulus = @p11,
			ipk_lulus = @p12,
			dosen_wali = @p13,
			dosen_penasehat = @p14,
			last_sync = @p15
		WHERE nim = @p16 AND id_semester = @p17
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getString(data, "namaperiode"),     // @p1
		getString(data, "semmhs"),          // @p2
		getString(data, "semmk"),           // @p3
		getString(data, "namastatusmhs"),   // @p4
		getString(data, "cekalakademik"),   // @p5
		getString(data, "cekalkeuangan"),   // @p6
		getInt(data, "skssemester"),        // @p7
		getFloat(data, "ips"),             // @p8
		getInt(data, "skstotal"),          // @p9
		getFloat(data, "ipk"),             // @p10
		getInt(data, "skslulus"),           // @p11
		getFloat(data, "ipklulus"),         // @p12
		getString(data, "dosenwali"),       // @p13
		getString(data, "dosenpenasehat"),  // @p14
		now,                               // @p15
		nim,                               // @p16
		idSemester,                        // @p17
	)
	if err != nil {
		return false, fmt.Errorf("failed to update kuliah_mhs: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.kuliah_mhs (
			id_kuliah_mhs, nim, id_semester, nama_periode,
			semester_kuliah, semester_mk, status_kuliah, status_akademik,
			status_keuangan, sks_semester, ips, total_sks,
			ipk, sks_lulus, ipk_lulus, dosen_wali,
			dosen_penasehat, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10, @p11, @p12,
			@p13, @p14, @p15, @p16,
			@p17, @p18, @p19
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                           // @p1
		nim,                               // @p2
		idSemester,                        // @p3
		getString(data, "namaperiode"),    // @p4
		getString(data, "semmhs"),         // @p5
		getString(data, "semmk"),          // @p6
		getString(data, "namastatusmhs"),  // @p7
		getString(data, "cekalakademik"),  // @p8
		getString(data, "cekalkeuangan"),  // @p9
		getInt(data, "skssemester"),       // @p10
		getFloat(data, "ips"),            // @p11
		getInt(data, "skstotal"),         // @p12
		getFloat(data, "ipk"),            // @p13
		getInt(data, "skslulus"),          // @p14
		getFloat(data, "ipklulus"),        // @p15
		getString(data, "dosenwali"),      // @p16
		getString(data, "dosenpenasehat"), // @p17
		now,                              // @p18
		now,                              // @p19
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert kuliah_mhs: %w", err)
	}

	return true, nil
}

func (r *repository) GetKuliahList(ctx context.Context, page, limit int, search, idSemester, nim string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(nim LIKE @p%d OR dosen_wali LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if idSemester != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("id_semester = @p%d", paramIndex))
		args = append(args, idSemester)
		paramIndex++
	}
	if nim != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("nim = @p%d", paramIndex))
		args = append(args, nim)
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.kuliah_mhs %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kuliah: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT nim, id_semester, nama_periode, semester_kuliah,
			status_kuliah, sks_semester, ips, total_sks,
			ipk, sks_lulus, dosen_wali, last_sync
		FROM siakadu.kuliah_mhs
		%s ORDER BY nim ASC, id_semester ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KuliahListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kuliah list: %w", err)
	}

	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}
