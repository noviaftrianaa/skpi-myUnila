package akademik

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for akademik data access
type Repository interface {
	// Kelas
	UpsertKelasKuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)

	// Kurikulum
	UpsertKurikulum(ctx context.Context, data map[string]interface{}) (bool, error)
	GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)

	// MataKuliah
	UpsertMatakuliah(ctx context.Context, data map[string]interface{}) (bool, error)
	GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error)

	// Jadwal
	UpsertJadwalKelas(ctx context.Context, data map[string]interface{}) (bool, error)
	GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new akademik repository
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
// Kelas Operations
// ========================================

func (r *repository) UpsertKelasKuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	idKelas := getInt(data, "idkelas")
	if idKelas == nil {
		return false, fmt.Errorf("idkelas is required")
	}

	now := time.Now()

	updateQuery := `
		UPDATE siakadu.kelas_kuliah SET
			id_semester = @p1,
			id_kurikulum = @p2,
			id_mk = @p3,
			nama_mk = @p4,
			sks_mk = @p5,
			nama_kelas = @p6,
			daya_tampung = @p7,
			jumlah_peserta = @p8,
			id_unit = @p9,
			last_sync = @p10
		WHERE id_kelas = @p11
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getString(data, "idperiode"),   // @p1
		getInt(data, "idkurikulum"),    // @p2
		getString(data, "idmk"),        // @p3
		getString(data, "namamk"),      // @p4
		getInt(data, "sksmk"),          // @p5
		getString(data, "namakelas"),   // @p6
		getInt(data, "dayatampung"),    // @p7
		getInt(data, "jumlahpeserta"), // @p8
		getString(data, "idunit"),      // @p9
		now,                            // @p10
		idKelas,                        // @p11
	)
	if err != nil {
		return false, fmt.Errorf("failed to update kelas_kuliah: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	// Insert with UUID mapping
	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.kelas_kuliah (
			id_kelas_kuliah, id_kelas, id_semester, id_kurikulum, id_mk,
			nama_mk, sks_mk, nama_kelas, daya_tampung, jumlah_peserta,
			id_unit, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                        // @p1 id_kelas_kuliah (UUID)
		idKelas,                        // @p2 id_kelas (original int)
		getString(data, "idperiode"),   // @p3
		getInt(data, "idkurikulum"),    // @p4
		getString(data, "idmk"),        // @p5
		getString(data, "namamk"),      // @p6
		getInt(data, "sksmk"),          // @p7
		getString(data, "namakelas"),   // @p8
		getInt(data, "dayatampung"),    // @p9
		getInt(data, "jumlahpeserta"), // @p10
		getString(data, "idunit"),      // @p11
		now,                            // @p12
		now,                            // @p13
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert kelas_kuliah: %w", err)
	}

	return true, nil
}

func (r *repository) GetKelasList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(nama_kelas LIKE @p%d OR nama_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}
	if idSemester != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("id_semester = @p%d", paramIndex))
		args = append(args, idSemester)
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM siakadu.kelas_kuliah %s", whereClause)
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kelas: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_kelas, id_semester, nama_kelas, nama_mk AS nama_mata_kuliah,
			sks_mk AS sks, daya_tampung, jumlah_peserta, id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi, last_sync
		FROM siakadu.kelas_kuliah
		%s ORDER BY nama_kelas ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KelasListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kelas list: %w", err)
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
// Kurikulum Operations
// ========================================

func (r *repository) UpsertKurikulum(ctx context.Context, data map[string]interface{}) (bool, error) {
	idKurikulum := getInt(data, "idkurikulum")
	idMK := getString(data, "idmk")
	if idKurikulum == nil || idMK == nil {
		return false, fmt.Errorf("idkurikulum and idmk are required")
	}

	now := time.Now()

	updateQuery := `
		UPDATE siakadu.matkul_kurikulum SET
			semester = @p1,
			nama_mk = @p2,
			sks_mk = @p3,
			jenis_mk = @p4,
			id_unit = @p5,
			last_sync = @p6
		WHERE id_kurikulum = @p7 AND id_mk = @p8
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getInt(data, "semmk"),          // @p1
		getString(data, "namamk"),      // @p2
		getInt(data, "sksmk"),          // @p3
		getString(data, "wajibpilihan"), // @p4
		getString(data, "idunit"),      // @p5
		now,                            // @p6
		idKurikulum,                    // @p7
		idMK,                           // @p8
	)
	if err != nil {
		return false, fmt.Errorf("failed to update matkul_kurikulum: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.matkul_kurikulum (
			id_matkul_kurikulum, id_kurikulum, id_mk, semester,
			nama_mk, sks_mk, jenis_mk, id_unit,
			create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                         // @p1
		idKurikulum,                     // @p2
		idMK,                            // @p3
		getInt(data, "semmk"),           // @p4
		getString(data, "namamk"),       // @p5
		getInt(data, "sksmk"),           // @p6
		getString(data, "wajibpilihan"), // @p7
		getString(data, "idunit"),       // @p8
		now,                             // @p9
		now,                             // @p10
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert matkul_kurikulum: %w", err)
	}

	return true, nil
}

func (r *repository) GetKurikulumList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(nama_mk LIKE @p%d OR id_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.matkul_kurikulum %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count kurikulum: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_kurikulum, semester, id_mk AS id_mata_kuliah, nama_mk AS nama_mata_kuliah,
			sks_mk AS sks, jenis_mk AS jenis_mk, id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi, last_sync
		FROM siakadu.matkul_kurikulum
		%s ORDER BY id_kurikulum ASC, id_mk ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*KurikulumListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get kurikulum list: %w", err)
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
// MataKuliah Operations
// ========================================

func (r *repository) UpsertMatakuliah(ctx context.Context, data map[string]interface{}) (bool, error) {
	idMK := getString(data, "idmk")
	if idMK == nil {
		return false, fmt.Errorf("idmk is required")
	}

	now := time.Now()

	updateQuery := `
		UPDATE siakadu.matkul SET
			nama_mk = @p1,
			sks_mk = @p2,
			id_kurikulum = @p3,
			id_jenis_mk = @p4,
			id_kelompok_mk = @p5,
			id_unit = @p6,
			last_sync = @p7
		WHERE id_mk = @p8
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getString(data, "namamk"),       // @p1
		getInt(data, "sksmk"),           // @p2
		getInt(data, "idkurikulum"),     // @p3
		getString(data, "idjenismk"),    // @p4
		getString(data, "idkelompok"),   // @p5
		getString(data, "idunit"),       // @p6
		now,                             // @p7
		idMK,                            // @p8
	)
	if err != nil {
		return false, fmt.Errorf("failed to update matkul: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.matkul (
			id_matkul, id_mk, nama_mk, sks_mk,
			id_kurikulum, id_jenis_mk, id_kelompok_mk, id_unit,
			create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                         // @p1
		idMK,                            // @p2
		getString(data, "namamk"),       // @p3
		getInt(data, "sksmk"),           // @p4
		getInt(data, "idkurikulum"),     // @p5
		getString(data, "idjenismk"),    // @p6
		getString(data, "idkelompok"),   // @p7
		getString(data, "idunit"),       // @p8
		now,                             // @p9
		now,                             // @p10
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert matkul: %w", err)
	}

	return true, nil
}

func (r *repository) GetMatakuliahList(ctx context.Context, page, limit int, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(nama_mk LIKE @p%d OR id_mk LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.matkul %s", whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count matakuliah: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_mk AS id_mata_kuliah, nama_mk AS nama_mata_kuliah, sks_mk AS sks,
			id_kurikulum, id_jenis_mk, id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi, last_sync
		FROM siakadu.matkul
		%s ORDER BY nama_mk ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*MatakuliahListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get matakuliah list: %w", err)
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
// Jadwal Operations
// ========================================

func (r *repository) UpsertJadwalKelas(ctx context.Context, data map[string]interface{}) (bool, error) {
	idJadwal := getInt(data, "idjadwal")
	if idJadwal == nil {
		return false, fmt.Errorf("idjadwal is required")
	}

	now := time.Now()

	updateQuery := `
		UPDATE siakadu.jadwal_kelas SET
			id_kelas = @p1,
			pertemuan_ke = @p2,
			jenis_pertemuan = @p3,
			jenis_jadwal = @p4,
			tgl_jadwal = @p5,
			hari = @p6,
			waktu_mulai = @p7,
			waktu_selesai = @p8,
			id_ruang = @p9,
			rencana_materi = @p10,
			id_unit = @p11,
			last_sync = @p12
		WHERE id_jadwal = @p13
	`

	result, err := r.db.ExecContext(ctx, updateQuery,
		getInt(data, "idkelas"),            // @p1
		getInt(data, "pertemuanke"),        // @p2
		getString(data, "jenis_pertemuan"), // @p3
		getString(data, "jenisjadwal"),     // @p4
		getString(data, "tgljadwal"),       // @p5
		getString(data, "hari"),            // @p6
		getString(data, "waktumulai"),      // @p7
		getString(data, "waktuselesai"),    // @p8
		getString(data, "idruang"),         // @p9
		getString(data, "rencanamateri"),   // @p10
		getString(data, "idunit"),          // @p11
		now,                                // @p12
		idJadwal,                           // @p13
	)
	if err != nil {
		return false, fmt.Errorf("failed to update jadwal_kelas: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return false, nil
	}

	newUUID := uuid.New().String()
	insertQuery := `
		INSERT INTO siakadu.jadwal_kelas (
			id_jadwal_kelas, id_jadwal, id_kelas, pertemuan_ke,
			jenis_pertemuan, jenis_jadwal, tgl_jadwal, hari,
			waktu_mulai, waktu_selesai, id_ruang, rencana_materi,
			id_unit, create_date, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10, @p11, @p12,
			@p13, @p14, @p15
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		newUUID,                            // @p1
		idJadwal,                           // @p2
		getInt(data, "idkelas"),            // @p3
		getInt(data, "pertemuanke"),        // @p4
		getString(data, "jenis_pertemuan"), // @p5
		getString(data, "jenisjadwal"),     // @p6
		getString(data, "tgljadwal"),       // @p7
		getString(data, "hari"),            // @p8
		getString(data, "waktumulai"),      // @p9
		getString(data, "waktuselesai"),    // @p10
		getString(data, "idruang"),         // @p11
		getString(data, "rencanamateri"),   // @p12
		getString(data, "idunit"),          // @p13
		now,                                // @p14
		now,                                // @p15
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert jadwal_kelas: %w", err)
	}

	return true, nil
}

func (r *repository) GetJadwalList(ctx context.Context, page, limit int, search, idSemester string) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	whereConditions := []string{}
	args := []interface{}{}
	paramIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(rencana_materi LIKE @p%d)", paramIndex))
		args = append(args, "%"+search+"%")
		paramIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM siakadu.jadwal_kelas %s", whereClause), args...)
	if err != nil {
		log.Printf("⚠️  Failed to count jadwal: %v", err)
		return nil, fmt.Errorf("failed to count jadwal: %w", err)
	}

	dataQuery := fmt.Sprintf(`
		SELECT id_jadwal, id_kelas, pertemuan_ke, jenis_pertemuan,
			tgl_jadwal, waktu_mulai, waktu_selesai, id_unit,
			CAST(NULL AS VARCHAR(200)) AS nm_prodi, last_sync
		FROM siakadu.jadwal_kelas
		%s ORDER BY tgl_jadwal DESC, waktu_mulai ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, whereClause, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, limit)
	var list []*JadwalListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get jadwal list: %w", err)
	}

	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}
