package mahasiswa

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface for mahasiswa data access (v2.0 — siakadu.mahasiswa table)
type Repository interface {
	EnsureReferenceData(ctx context.Context) error
	UpsertMahasiswa(ctx context.Context, data map[string]interface{}) (isNew bool, err error)
	UpsertKeluargaMhs(ctx context.Context, nim string, keluarga []interface{}) error
	GetMahasiswaList(ctx context.Context, filter *MahasiswaListFilter) (*PaginatedResult, error)
	GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error)
	GetStats(ctx context.Context) (*SyncStats, error)
	GetFilterOptions(ctx context.Context) (*FilterOptions, error)
	ResolveUnit(ctx context.Context, kodeSiakad string) (string, error)
	GetAllProdiIDs(ctx context.Context) ([]ProdiInfo, error)
	GetStaleNIMs(ctx context.Context, olderThanHours int, limit int) ([]string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

func getSmallint(data map[string]interface{}, key string) *int16 {
	if v, ok := data[key]; ok && v != nil {
		switch i := v.(type) {
		case float64:
			ii := int16(i)
			return &ii
		case int:
			ii := int16(i)
			return &ii
		case string:
			var ii int16
			if _, err := fmt.Sscanf(i, "%d", &ii); err == nil {
				return &ii
			}
		}
	}
	return nil
}

func getStringDefault(data map[string]interface{}, key string, def string) *string {
	v := getString(data, key)
	if v == nil || *v == "" {
		return &def
	}
	return v
}

// ============================================================================
// EnsureReferenceData - seed reference tables if empty
// ============================================================================

func (r *repository) EnsureReferenceData(ctx context.Context) error {
	// Ensure siakadu.mahasiswa table exists (v2.0)
	// This is a safety check — table should be created by DDL script
	var tableExists int
	err := r.db.GetContext(ctx, &tableExists,
		"SELECT CASE WHEN OBJECT_ID('siakadu.mahasiswa', 'U') IS NOT NULL THEN 1 ELSE 0 END")
	if err != nil || tableExists == 0 {
		return fmt.Errorf("siakadu.mahasiswa table not found — run siakadu_schema_v2.0_mahasiswa.sql first")
	}

	// Seed status_mahasiswa
	type statMhs struct {
		ID   string
		Name string
	}
	statuses := []statMhs{
		{"A", "Aktif"}, {"C", "Cuti"}, {"D", "Drop Out"}, {"K", "Keluar"},
		{"L", "Lulus"}, {"N", "Non-Aktif"}, {"G", "Double Degree"},
		{"M", "Mutasi"}, {"W", "Wafat"},
	}
	now := time.Now()
	for _, s := range statuses {
		_, err := r.db.ExecContext(ctx, `
			IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = @p1)
			INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
			VALUES (@p1, 1, 1, @p2, @p3, @p3, @p3)
		`, s.ID, s.Name, now)
		if err != nil {
			log.Printf("⚠️  [EnsureReferenceData] Failed to seed status_mahasiswa %s: %v", s.ID, err)
		}
	}

	log.Printf("✅ [EnsureReferenceData] siakadu.mahasiswa v2.0 ready")
	return nil
}

// ============================================================================
// UpsertMahasiswa - MERGE into siakadu.mahasiswa on nim PK
// Replaces UpsertPesertaDidik + UpsertRegPd from v1.0
// ============================================================================

func (r *repository) UpsertMahasiswa(ctx context.Context, data map[string]interface{}) (bool, error) {
	nim := getString(data, "nim")
	if nim == nil || *nim == "" {
		return false, fmt.Errorf("nim is required")
	}

	now := time.Now()

	// Resolve id_unit → id_sms UUID via mapping_unit
	var idSms *string
	if idUnit := getString(data, "id_unit"); idUnit != nil {
		resolved, err := r.ResolveUnit(ctx, *idUnit)
		if err == nil && resolved != "" {
			idSms = &resolved
		}
	}

	// Lookup id_jenj_didik from pdrd.sms if we have id_sms
	var idJenjDidik *int
	if idSms != nil && *idSms != "" {
		var jenj int
		err := r.db.GetContext(ctx, &jenj,
			"SELECT CAST(id_jenj_didik AS INT) FROM pdrd.sms WHERE id_sms = CONVERT(uniqueidentifier, @p1)", *idSms)
		if err == nil {
			idJenjDidik = &jenj
		}
	}

	// Check if exists
	var existingNIM string
	err := r.db.GetContext(ctx, &existingNIM,
		"SELECT nim FROM siakadu.mahasiswa WHERE nim = @p1", *nim)

	if err == nil && existingNIM != "" {
		// ============ UPDATE ============
		setClauses := []string{}
		args := []interface{}{}
		p := 1

		// Build dynamic SET — only update non-nil fields
		addSet := func(col string, val interface{}) {
			if val != nil {
				setClauses = append(setClauses, fmt.Sprintf("%s = @p%d", col, p))
				args = append(args, val)
				p++
			}
		}

		// Core
		addSet("nama", getString(data, "nama"))
		addSet("angkatan", getString(data, "angkatan"))
		addSet("gelar_depan", getString(data, "gelar_depan"))
		addSet("gelar_belakang", getString(data, "gelar_belakang"))
		jk := getString(data, "jk")
		if jk == nil {
			jk = getString(data, "jns_kelamin")
		}
		addSet("jk", jk)
		addSet("tmpt_lahir", getString(data, "tmpt_lahir"))
		addSet("tgl_lahir", getString(data, "tgl_lahir"))
		addSet("status_nikah", getString(data, "status_nikah"))

		// Documents
		addSet("nik", getString(data, "nik"))
		addSet("nokk", getString(data, "nokk"))
		addSet("nisn", getString(data, "nisn"))
		addSet("nupn", getString(data, "nupn"))
		addSet("no_kps", getString(data, "no_kps"))
		addSet("npsn", getString(data, "npsn"))
		addSet("nomor_tes", getString(data, "nomor_tes"))
		addSet("no_skdo", getString(data, "no_skdo"))
		addSet("pt_nim", getString(data, "pt_nim"))

		// Contact
		addSet("alamat", getString(data, "alamat"))
		addSet("telepon", getString(data, "telepon"))
		addSet("hp", getString(data, "hp"))
		addSet("hp2", getString(data, "hp2"))
		addSet("email", getString(data, "email"))
		addSet("email_kampus", getString(data, "email_kampus"))
		addSet("email_ortu", getString(data, "email_ortu"))
		addSet("kode_pos", getString(data, "kode_pos"))

		// Address
		addSet("id_kota", getString(data, "id_kota"))
		addSet("nama_kota", getString(data, "nama_kota"))
		addSet("id_kecamatan", getString(data, "id_kecamatan"))
		addSet("kecamatan", getString(data, "kec"))
		addSet("rt", getString(data, "rt"))
		addSet("rw", getString(data, "rw"))
		addSet("dusun", getString(data, "dusun"))
		addSet("desa", getString(data, "desa"))

		// Academic
		addSet("id_unit", getString(data, "id_unit"))
		addSet("nm_fakultas", getString(data, "nm_fakultas"))
		addSet("nm_jurusan", getString(data, "nm_jurusan"))
		addSet("nm_prodi", getString(data, "nm_prodi"))
		addSet("nm_bidang_studi", getString(data, "nm_bidang_studi"))
		addSet("id_kurikulum", getString(data, "id_kurikulum"))
		addSet("semester", getString(data, "smt_mhs"))
		addSet("ipk", getFloat(data, "ipk"))
		addSet("sks_total", getInt(data, "sks_total"))
		addSet("sks_lulus", getInt(data, "sks_lulus"))
		addSet("id_periode", getString(data, "id_periode"))
		addSet("id_status_mhs", getString(data, "id_status_mhs"))
		addSet("status_mahasiswa", getString(data, "status_mahasiswa"))
		addSet("id_sistem_kuliah", getInt(data, "id_sistem_kuliah"))
		addSet("nm_sistem_kuliah", getString(data, "nm_sistem_kuliah"))
		addSet("id_periode_max", getString(data, "id_periode_max"))
		addSet("periode_terakhir", getString(data, "periode_terakhir"))
		addSet("nama_kelas", getString(data, "nama_kelas"))

		// Socio-economic
		addSet("id_agama", getInt(data, "id_agama"))
		addSet("nama_agama", getString(data, "nama_agama"))
		addSet("nama_negara", getString(data, "nama_negara"))
		addSet("jenis_tinggal", getString(data, "jenis_tinggal"))
		addSet("nama_transport", getString(data, "nama_transport"))
		addSet("nama_pekerjaan", getString(data, "nama_pekerjaan"))
		addSet("nama_penghasilan", getString(data, "nama_penghasilan"))
		addSet("id_suku", getInt(data, "id_suku"))
		addSet("nama_suku", getString(data, "nama_suku"))
		addSet("gol_darah", getString(data, "gol_darah"))
		addSet("berat_badan", getString(data, "berat_badan"))
		addSet("tinggi_badan", getString(data, "tinggi_badan"))
		addSet("nama_hobi", getString(data, "nama_hobbi"))
		addSet("nama_minat", getString(data, "nama_minat"))

		// Admission
		addSet("id_jalur_pendaftaran", getInt(data, "id_jalur_pendaftaran"))
		addSet("jalur_pendaftaran", getString(data, "jalur_pendaftaran"))
		addSet("id_jenis_pendaftaran", getInt(data, "id_jenis_pendaftaran"))
		addSet("tgl_daftar", getString(data, "tgl_daftar"))
		addSet("id_gelombang", getInt(data, "id_gelombang"))
		addSet("gelombang", getString(data, "gelombang"))
		addSet("nilai_tpa", getFloat(data, "nilai_tpa"))
		addSet("nilai_kesehatan", getFloat(data, "nilai_kesehatan"))
		addSet("nilai_psikotes", getFloat(data, "nilai_psikotes"))
		addSet("nilai_wawancara", getFloat(data, "nilai_wawancara"))
		addSet("is_beasiswa", getString(data, "a_beasiswa"))

		// Transfer
		addSet("is_transfer", getString(data, "is_transfer"))
		addSet("jenis_transfer", getInt(data, "id_jenis_transfer"))
		addSet("id_periode_transfer", getString(data, "id_periode_transfer"))
		addSet("tgl_transfer", getString(data, "tgl_transfer"))
		addSet("nim_lama", getString(data, "nim_lama"))
		addSet("univ_asal", getString(data, "univ_asal"))
		addSet("ipk_asal", getFloat(data, "ipk_asal"))
		addSet("sks_asal", getFloat(data, "sks_asal"))
		addSet("id_pendidikan_asal", getString(data, "id_pendidikan_asal"))
		addSet("tingkat_pendidikan_asal", getString(data, "tingkat_pendidikan_asal"))
		addSet("file_transkrip_asal", getString(data, "file_transkrip_asal"))
		addSet("file_surat_pindah", getString(data, "file_surat_pindah"))
		addSet("id_unit_asal", getString(data, "id_unit_asal"))
		addSet("id_kurikulum_asal", getString(data, "id_kurikulum_asal"))
		addSet("ipk_univ_asal", getFloat(data, "ipk_univ_asal"))
		addSet("prodi_asal", getString(data, "prodi_asal"))
		addSet("instansi", getString(data, "instansi"))

		// High school
		addSet("asal_smu", getString(data, "asal_smu"))
		addSet("alamat_smu", getString(data, "alamat_smu"))
		addSet("id_kota_smu", getString(data, "id_kota_smu"))
		addSet("telp_smu", getString(data, "telp_smu"))
		addSet("no_ijazah_smu", getString(data, "no_ijasah_smu"))
		addSet("jurusan_sekolah", getString(data, "jurusan_sekolah"))
		addSet("nem", getFloat(data, "nem"))
		addSet("thn_lulus_sekolah", getInt(data, "thn_lulus_sekolah"))

		// Finance
		addSet("kategori_ukt", getString(data, "kategori_ukt"))

		// Integration
		addSet("edlink_student_id", getInt(data, "ed_link_student_id"))

		// UUID mapping (only update if we have new values)
		if idSms != nil {
			setClauses = append(setClauses, fmt.Sprintf("id_sms = CONVERT(uniqueidentifier, @p%d)", p))
			args = append(args, *idSms)
			p++
		}
		if idJenjDidik != nil {
			setClauses = append(setClauses, fmt.Sprintf("id_jenj_didik = @p%d", p))
			args = append(args, *idJenjDidik)
			p++
		}

		// Always update audit
		setClauses = append(setClauses, fmt.Sprintf("last_update = @p%d", p))
		args = append(args, now)
		p++
		setClauses = append(setClauses, fmt.Sprintf("last_sync = @p%d", p))
		args = append(args, now)
		p++

		if len(setClauses) == 0 {
			return false, nil
		}

		// WHERE nim = @pN
		whereParam := fmt.Sprintf("@p%d", p)
		args = append(args, *nim)

		query := fmt.Sprintf("UPDATE siakadu.mahasiswa SET %s WHERE nim = %s",
			strings.Join(setClauses, ", "), whereParam)

		_, err := r.db.ExecContext(ctx, query, args...)
		if err != nil {
			return false, fmt.Errorf("failed to update mahasiswa %s: %w", *nim, err)
		}
		return false, nil // Updated
	}

	// ============ INSERT ============
	// Try to lookup existing PDDIKTI UUIDs from pdrd first
	var existingPdrdIdPd, existingPdrdIdRegPd string
	_ = r.db.GetContext(ctx, &existingPdrdIdPd,
		"SELECT CAST(rp.id_pd AS VARCHAR(36)) FROM pdrd.reg_pd rp WHERE rp.nipd = @p1 AND rp.soft_delete = 0", *nim)
	_ = r.db.GetContext(ctx, &existingPdrdIdRegPd,
		"SELECT CAST(rp.id_reg_pd AS VARCHAR(36)) FROM pdrd.reg_pd rp WHERE rp.nipd = @p1 AND rp.soft_delete = 0", *nim)

	newIdPd := existingPdrdIdPd
	if newIdPd == "" {
		newIdPd = uuid.New().String()
	}
	newIdRegPd := existingPdrdIdRegPd
	if newIdRegPd == "" {
		newIdRegPd = uuid.New().String()
	}

	insertQuery := `
		INSERT INTO siakadu.mahasiswa (
			nim, nama, angkatan, jk, tmpt_lahir, tgl_lahir,
			nik, email, email_kampus, hp, id_unit,
			nm_fakultas, nm_jurusan, nm_prodi,
			semester, ipk, sks_total, sks_lulus,
			id_status_mhs, status_mahasiswa, id_periode,
			id_agama,
			id_pd, id_reg_pd,
			create_date, last_update, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6,
			@p7, @p8, @p9, @p10, @p11,
			@p12, @p13, @p14,
			@p15, @p16, @p17, @p18,
			@p19, @p20, @p21,
			@p22,
			@p23, @p24,
			@p25, @p26, @p27
		)
	`

	_, err = r.db.ExecContext(ctx, insertQuery,
		nim,                                      // @p1
		getString(data, "nama"),                   // @p2
		getString(data, "angkatan"),               // @p3
		getString(data, "jk"),                     // @p4
		getStringDefault(data, "tmpt_lahir", "-"), // @p5
		getString(data, "tgl_lahir"),              // @p6
		getString(data, "nik"),                    // @p7
		getString(data, "email"),                  // @p8
		getString(data, "email_kampus"),            // @p9
		getString(data, "hp"),                     // @p10
		getString(data, "id_unit"),                // @p11
		getString(data, "nm_fakultas"),            // @p12
		getString(data, "nm_jurusan"),             // @p13
		getString(data, "nm_prodi"),               // @p14
		getString(data, "smt_mhs"),                // @p15
		getFloat(data, "ipk"),                     // @p16
		getInt(data, "sks_total"),                 // @p17
		getInt(data, "sks_lulus"),                 // @p18
		getString(data, "id_status_mhs"),           // @p19
		getString(data, "status_mahasiswa"),        // @p20
		getString(data, "id_periode"),              // @p21
		getInt(data, "id_agama"),                  // @p22
		newIdPd,                                   // @p23
		newIdRegPd,                                // @p24
		now,                                       // @p25
		now,                                       // @p26
		now,                                       // @p27
	)
	if err != nil {
		return false, fmt.Errorf("failed to insert mahasiswa %s: %w", *nim, err)
	}

	// Update id_sms and id_jenj_didik if resolved
	if idSms != nil {
		r.db.ExecContext(ctx, `
			UPDATE siakadu.mahasiswa SET
				id_sms = CONVERT(uniqueidentifier, @p1),
				id_jenj_didik = @p2
			WHERE nim = @p3
		`, *idSms, idJenjDidik, *nim)
	}

	return true, nil // Inserted
}

// ============================================================================
// UpsertKeluargaMhs - Replace family data for a NIM
// ============================================================================

func (r *repository) UpsertKeluargaMhs(ctx context.Context, nim string, keluarga []interface{}) error {
	if len(keluarga) == 0 {
		return nil
	}

	now := time.Now()

	for _, k := range keluarga {
		kMap, ok := k.(map[string]interface{})
		if !ok {
			continue
		}

		statusKeluarga := getString(kMap, "stat_keluarga")
		if statusKeluarga == nil || *statusKeluarga == "" {
			continue
		}

		_, err := r.db.ExecContext(ctx, `
			MERGE siakadu.keluarga_mhs AS target
			USING (SELECT @p1 AS nim, @p2 AS status_keluarga) AS source
			ON target.nim = source.nim AND target.status_keluarga = source.status_keluarga
			WHEN MATCHED THEN
				UPDATE SET
					nama = @p3, status_ortu = @p4, kondisi_ortu = @p5,
					pend_akhir = @p6, id_pekerjaan = @p7, pekerjaan = @p8,
					id_penghasilan = @p9, penghasilan = @p10,
					alamat = @p11, telepon = @p12, tgl_lahir = @p13,
					email = @p14, nik = @p15, instansi = @p16,
					last_update = @p17, last_sync = @p18
			WHEN NOT MATCHED THEN
				INSERT (nim, status_keluarga, nama, status_ortu, kondisi_ortu,
						pend_akhir, id_pekerjaan, pekerjaan, id_penghasilan, penghasilan,
						alamat, telepon, tgl_lahir, email, nik, instansi,
						create_date, last_update, last_sync)
				VALUES (@p1, @p2, @p3, @p4, @p5,
						@p6, @p7, @p8, @p9, @p10,
						@p11, @p12, @p13, @p14, @p15, @p16,
						@p17, @p18, @p19);
		`,
			nim,                               // @p1
			statusKeluarga,                    // @p2
			getString(kMap, "nama"),            // @p3
			getString(kMap, "status_ortu"),     // @p4
			getString(kMap, "kondisi_ortu"),    // @p5
			getString(kMap, "pend_akhir"),      // @p6
			getInt(kMap, "id_pekerjaan"),       // @p7
			getString(kMap, "pekerjaan"),       // @p8
			getInt(kMap, "id_penghasilan"),     // @p9
			getString(kMap, "penghasilan"),     // @p10
			getString(kMap, "alamat"),          // @p11
			getString(kMap, "telepon"),         // @p12
			getString(kMap, "tgllahir"),        // @p13
			getString(kMap, "email"),           // @p14
			getString(kMap, "nik"),             // @p15
			getString(kMap, "instansi"),        // @p16
			now,                               // @p17
			now,                               // @p18
			now,                               // @p19
		)
		if err != nil {
			log.Printf("⚠️ Failed to upsert keluarga %s/%s: %v", nim, *statusKeluarga, err)
		}
	}

	return nil
}

// ============================================================================
// READ OPERATIONS — query siakadu.mahasiswa directly
// ============================================================================

// allowedSortColumns is a whitelist of columns allowed for sorting to prevent SQL injection
var allowedSortColumns = map[string]string{
	"nim":      "m.nim",
	"nama":     "m.nama",
	"angkatan": "m.angkatan",
	"ipk":      "m.ipk",
	"nm_prodi": "s.nm_lemb",
}

func (r *repository) GetMahasiswaList(ctx context.Context, filter *MahasiswaListFilter) (*PaginatedResult, error) {
	offset := (filter.Page - 1) * filter.Limit

	// Status computed column used in both SELECT and WHERE
	statusExpr := `COALESCE(m.status_mahasiswa,
		CASE m.id_status_mhs
			WHEN 'A' THEN 'Aktif' WHEN 'C' THEN 'Cuti' WHEN 'D' THEN 'Drop Out'
			WHEN 'K' THEN 'Keluar' WHEN 'L' THEN 'Lulus' WHEN 'N' THEN 'Non-Aktif'
			WHEN 'G' THEN 'Double Degree' WHEN 'M' THEN 'Mutasi' WHEN 'W' THEN 'Wafat'
			ELSE NULL END,
		CASE WHEN m.id_jns_keluar IS NOT NULL THEN 'Keluar'
			 WHEN m.soft_delete = 0 THEN 'Aktif' ELSE NULL END
	)`

	whereConditions := []string{"m.soft_delete = 0"}
	args := []interface{}{}
	paramIndex := 1

	if filter.Search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf(
			"(m.nim LIKE @p%d OR m.nama LIKE @p%d)", paramIndex, paramIndex))
		args = append(args, "%"+filter.Search+"%")
		paramIndex++
	}

	if filter.IdUnit != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("m.id_unit = @p%d", paramIndex))
		args = append(args, filter.IdUnit)
		paramIndex++
	}

	if filter.Angkatan != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("m.angkatan = @p%d", paramIndex))
		args = append(args, filter.Angkatan)
		paramIndex++
	}

	if filter.Status != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("%s = @p%d", statusExpr, paramIndex))
		args = append(args, filter.Status)
		paramIndex++
	}

	whereClause := "WHERE " + strings.Join(whereConditions, " AND ")

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM siakadu.mahasiswa m %s", whereClause)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count mahasiswa: %w", err)
	}

	// Validate sort column against whitelist
	sortColumn := "nama"
	if col, ok := allowedSortColumns[filter.SortBy]; ok {
		sortColumn = col
	}

	sortOrder := "ASC"
	if strings.EqualFold(filter.SortOrder, "desc") {
		sortOrder = "DESC"
	}

	dataQuery := fmt.Sprintf(`
		SELECT
			m.nim, m.nama, m.angkatan, m.jk, m.id_unit,
			m.nm_fakultas, m.nm_jurusan,
			ISNULL(jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %%'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END, m.nm_prodi) AS nm_prodi,
			m.semester, m.ipk, m.sks_total, m.sks_lulus,
			m.id_status_mhs,
			%s AS status_mahasiswa,
			m.last_sync
		FROM siakadu.mahasiswa m
		LEFT JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		%s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, statusExpr, whereClause, sortColumn, sortOrder, paramIndex, paramIndex+1)

	dataArgs := append(args, offset, filter.Limit)
	var list []*MahasiswaListItem
	err = r.db.SelectContext(ctx, &list, dataQuery, dataArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to get mahasiswa list: %w", err)
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit
	return &PaginatedResult{
		Data:       list,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetFilterOptions(ctx context.Context) (*FilterOptions, error) {
	opts := &FilterOptions{}

	// Distinct prodi — from pdrd.sms joined with jenjang for consistent naming
	var prodis []ProdiOption
	err := r.db.SelectContext(ctx, &prodis, `
		SELECT
			m.id_unit,
			jp.nm_jenj_didik + ' - ' +
				CASE
					WHEN s.nm_lemb LIKE 'Program Studi ' + jp.nm_jenj_didik + ' %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ' + jp.nm_jenj_didik + ' ') + 1, 999))
					WHEN s.nm_lemb LIKE 'Program Studi %'
						THEN LTRIM(SUBSTRING(s.nm_lemb, LEN('Program Studi ') + 1, 999))
					ELSE s.nm_lemb
				END AS nm_prodi
		FROM (
			SELECT DISTINCT id_unit, id_sms
			FROM siakadu.mahasiswa
			WHERE soft_delete = 0 AND id_unit IS NOT NULL AND id_sms IS NOT NULL
		) m
		INNER JOIN pdrd.sms s ON s.id_sms = m.id_sms AND s.soft_delete = 0
		INNER JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = s.id_jenj_didik
		ORDER BY jp.id_jenj_didik, s.nm_lemb`)
	if err != nil {
		// Fallback to mahasiswa table if join fails
		err = r.db.SelectContext(ctx, &prodis, `
			SELECT DISTINCT id_unit, nm_prodi
			FROM siakadu.mahasiswa
			WHERE soft_delete = 0 AND id_unit IS NOT NULL AND nm_prodi IS NOT NULL
			ORDER BY nm_prodi`)
		if err != nil {
			return nil, fmt.Errorf("failed to get prodi options: %w", err)
		}
	}
	opts.Prodi = prodis

	// Distinct angkatan
	var angkatanList []string
	err = r.db.SelectContext(ctx, &angkatanList, `
		SELECT DISTINCT angkatan
		FROM siakadu.mahasiswa
		WHERE soft_delete = 0 AND angkatan IS NOT NULL
		ORDER BY angkatan DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to get angkatan options: %w", err)
	}
	opts.Angkatan = angkatanList

	// Distinct status (computed)
	var statusList []string
	err = r.db.SelectContext(ctx, &statusList, `
		SELECT DISTINCT COALESCE(status_mahasiswa,
			CASE id_status_mhs
				WHEN 'A' THEN 'Aktif' WHEN 'C' THEN 'Cuti' WHEN 'D' THEN 'Drop Out'
				WHEN 'K' THEN 'Keluar' WHEN 'L' THEN 'Lulus' WHEN 'N' THEN 'Non-Aktif'
				WHEN 'G' THEN 'Double Degree' WHEN 'M' THEN 'Mutasi' WHEN 'W' THEN 'Wafat'
				ELSE NULL END,
			CASE WHEN id_jns_keluar IS NOT NULL THEN 'Keluar'
				 WHEN soft_delete = 0 THEN 'Aktif' ELSE NULL END
		) AS status
		FROM siakadu.mahasiswa
		WHERE soft_delete = 0
		ORDER BY status`)
	if err != nil {
		return nil, fmt.Errorf("failed to get status options: %w", err)
	}
	opts.Status = statusList

	return opts, nil
}

func (r *repository) GetMahasiswaByNIM(ctx context.Context, nim string) (*MahasiswaDetail, error) {
	query := `SELECT
		nim, nama, angkatan, gelar_depan, gelar_belakang, jk, tmpt_lahir, tgl_lahir, status_nikah,
		nik, nokk, nisn, nupn, no_kps, npsn, nomor_tes, no_skdo, pt_nim,
		alamat, telepon, hp, hp2, email, email_kampus, email_ortu, kode_pos,
		id_kota, nama_kota, id_kecamatan, kecamatan, rt, rw, dusun, desa,
		id_unit, nm_fakultas, nm_jurusan, nm_prodi, nm_bidang_studi, id_kurikulum,
		semester, ipk, sks_total, sks_lulus, id_periode,
		id_status_mhs, status_mahasiswa, id_sistem_kuliah, nm_sistem_kuliah,
		id_periode_max, periode_terakhir, nama_kelas,
		id_agama, nama_agama, nama_negara, jenis_tinggal, nama_transport,
		nama_pekerjaan, nama_penghasilan, id_suku, nama_suku,
		gol_darah, berat_badan, tinggi_badan, nama_hobi, nama_minat,
		id_jalur_pendaftaran, jalur_pendaftaran, id_jenis_pendaftaran, tgl_daftar,
		id_gelombang, gelombang, nilai_tpa, nilai_kesehatan, nilai_psikotes, nilai_wawancara, is_beasiswa,
		is_transfer, jenis_transfer, id_periode_transfer, tgl_transfer, nim_lama,
		univ_asal, ipk_asal, sks_asal, id_pendidikan_asal, tingkat_pendidikan_asal,
		file_transkrip_asal, file_surat_pindah, id_unit_asal, id_kurikulum_asal, ipk_univ_asal, prodi_asal, instansi,
		asal_smu, alamat_smu, id_kota_smu, telp_smu, no_ijazah_smu, jurusan_sekolah, nem, thn_lulus_sekolah,
		kategori_ukt, edlink_student_id,
		CAST(id_pd AS VARCHAR(36)) AS id_pd,
		CAST(id_reg_pd AS VARCHAR(36)) AS id_reg_pd,
		CAST(id_sms AS VARCHAR(36)) AS id_sms,
		id_stat_mhs, id_jenj_didik, id_jns_keluar, id_jns_daftar, id_jalur_daftar, id_smt_masuk,
		tgl_keluar, ket_keluar,
		create_date, last_update, last_sync, soft_delete, update_user
	FROM siakadu.mahasiswa WHERE nim = @p1`
	var m MahasiswaDetail
	err := r.db.GetContext(ctx, &m, query, nim)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mahasiswa not found")
		}
		return nil, fmt.Errorf("failed to get mahasiswa: %w", err)
	}

	// Load keluarga
	var keluarga []Keluarga
	err = r.db.SelectContext(ctx, &keluarga,
		"SELECT * FROM siakadu.keluarga_mhs WHERE nim = @p1", nim)
	if err == nil {
		m.Keluarga = keluarga
	}

	return &m, nil
}

func (r *repository) GetStats(ctx context.Context) (*SyncStats, error) {
	stats := &SyncStats{}

	r.db.GetContext(ctx, &stats.TotalMahasiswa,
		"SELECT COUNT(*) FROM siakadu.mahasiswa WHERE soft_delete = 0")

	r.db.GetContext(ctx, &stats.TotalAktif,
		"SELECT COUNT(*) FROM siakadu.mahasiswa WHERE soft_delete = 0 AND status_mahasiswa = 'Aktif'")

	stats.TotalNonAktif = stats.TotalMahasiswa - stats.TotalAktif

	var lastSync time.Time
	err := r.db.GetContext(ctx, &lastSync,
		"SELECT ISNULL(MAX(last_sync), '1900-01-01') FROM siakadu.mahasiswa")
	if err == nil {
		stats.LastSync = &lastSync
	}

	return stats, nil
}

// ============================================================================
// UTILITY
// ============================================================================

func (r *repository) GetAllProdiIDs(ctx context.Context) ([]ProdiInfo, error) {
	var result []ProdiInfo
	err := r.db.SelectContext(ctx, &result,
		`SELECT id_unit, nm_unit FROM siakadu.ref_unit
		WHERE jns_unit = 'P' AND (is_aktif = '1' OR is_aktif IS NULL)
		ORDER BY id_unit`)
	if err != nil {
		return nil, fmt.Errorf("failed to get prodi IDs: %w", err)
	}
	return result, nil
}

func (r *repository) ResolveUnit(ctx context.Context, kodeSiakad string) (string, error) {
	var idSms string
	err := r.db.GetContext(ctx, &idSms,
		"SELECT CAST(id_sms AS VARCHAR(36)) FROM siakadu.mapping_unit WHERE kode_siakad = @p1", kodeSiakad)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", fmt.Errorf("failed to resolve unit: %w", err)
	}
	return idSms, nil
}

func (r *repository) GetStaleNIMs(ctx context.Context, olderThanHours int, limit int) ([]string, error) {
	var nims []string
	// Prioritas: NIM yang belum pernah detail-sync (jk IS NULL = hanya list sync)
	// lalu NIM yang last_sync sudah lama
	err := r.db.SelectContext(ctx, &nims, `
		SELECT TOP(@p1) nim FROM siakadu.mahasiswa
		WHERE soft_delete = 0
			AND (jk IS NULL OR last_sync IS NULL OR last_sync < DATEADD(HOUR, -@p2, GETDATE()))
		ORDER BY
			CASE WHEN jk IS NULL THEN 0 ELSE 1 END,
			last_sync ASC
	`, limit, olderThanHours)
	if err != nil {
		return nil, fmt.Errorf("failed to get stale NIMs: %w", err)
	}
	return nims, nil
}
