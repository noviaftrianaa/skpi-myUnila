package penugasan

import (
	"fmt"
	"time"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Penugasan operations
	GetPenugasanByIDRegPTK(idRegPTK string) (*Penugasan, error)
	GetAllPenugasanByIDSDM(idSDM string) ([]Penugasan, error)
	GetPenugasanList(page, limit int, search string) (*PenugasanListResult, error)
	UpsertPenugasan(p *Penugasan) error

	// Statistics
	GetPenugasanStats() (*PenugasanStats, error)

	// Keaktifan PTK operations
	DeleteKeaktifanByIDRegPTK(idRegPTK string) error
	InsertKeaktifan(k *KeaktifanPTK) error
	GetKeaktifanByIDRegPTK(idRegPTK string) ([]KeaktifanPTK, error)

	// Lookup helpers
	GetNIDNByIDSDM(idSDM string) (*string, error)
	GetAllActiveDosen() ([]DosenInfo, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetPenugasanByIDRegPTK retrieves a single penugasan by id_reg_ptk
func (r *repository) GetPenugasanByIDRegPTK(idRegPTK string) (*Penugasan, error) {
	query := `
		SELECT
			id_reg_ptk, id_sdm, id_sp, id_stat_pegawai, id_ikatan_kerja, id_sms,
			id_jns_keluar, no_srt_tgs, tgl_srt_tgs, tmt_srt_tgs, tgl_ptk_keluar,
			nidn, jns_reg, create_date, id_creator, last_update, id_updater,
			soft_delete, last_sync
		FROM pdrd.reg_ptk
		WHERE id_reg_ptk = @p1 AND soft_delete = 0
	`

	var penugasan Penugasan
	err := r.db.Get(&penugasan, query, idRegPTK)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get penugasan: %w", err)
	}

	return &penugasan, nil
}

// GetAllPenugasanByIDSDM retrieves all penugasan for a dosen
func (r *repository) GetAllPenugasanByIDSDM(idSDM string) ([]Penugasan, error) {
	query := `
		SELECT
			id_reg_ptk, id_sdm, id_sp, id_stat_pegawai, id_ikatan_kerja, id_sms,
			id_jns_keluar, no_srt_tgs, tgl_srt_tgs, tmt_srt_tgs, tgl_ptk_keluar,
			nidn, jns_reg, create_date, id_creator, last_update, id_updater,
			soft_delete, last_sync
		FROM pdrd.reg_ptk
		WHERE id_sdm = @p1 AND soft_delete = 0
		ORDER BY tmt_srt_tgs DESC
	`

	var penugasanList []Penugasan
	err := r.db.Select(&penugasanList, query, idSDM)
	if err != nil {
		return nil, fmt.Errorf("failed to get all penugasan: %w", err)
	}

	return penugasanList, nil
}

// UpsertPenugasan inserts or updates a penugasan record
func (r *repository) UpsertPenugasan(p *Penugasan) error {
	// Check if exists
	existing, err := r.GetPenugasanByIDRegPTK(p.IDRegPTK)
	if err != nil {
		return fmt.Errorf("failed to check existing penugasan: %w", err)
	}

	if existing == nil {
		// INSERT
		query := `
			INSERT INTO pdrd.reg_ptk (
				id_reg_ptk, id_sdm, id_sp, id_stat_pegawai, id_ikatan_kerja, id_sms,
				id_jns_keluar, no_srt_tgs, tgl_srt_tgs, tmt_srt_tgs, tgl_ptk_keluar,
				nidn, jns_reg, create_date, id_creator, last_update, id_updater,
				soft_delete, last_sync
			) VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6,
				@p7, @p8, @p9, @p10, @p11,
				@p12, @p13, @p14, @p15, @p16, @p17,
				@p18, @p19
			)
		`
		_, err = r.db.Exec(query,
			p.IDRegPTK, p.IDSDM, p.IDSP, p.IDStatPegawai, p.IDIkatanKerja, p.IDSMS,
			p.IDJnsKeluar, p.NoSrtTgs, p.TglSrtTgs, p.TMTSrtTgs, p.TglPTKKeluar,
			p.NIDN, p.JnsReg, p.CreateDate, p.IDCreator, p.LastUpdate, nil,
			p.SoftDelete, p.LastSync,
		)
		if err != nil {
			return fmt.Errorf("failed to insert penugasan: %w", err)
		}
	} else {
		// UPDATE
		query := `
			UPDATE pdrd.reg_ptk SET
				id_sp = @p1,
				id_stat_pegawai = @p2,
				id_ikatan_kerja = @p3,
				id_sms = @p4,
				id_jns_keluar = @p5,
				no_srt_tgs = @p6,
				tgl_srt_tgs = @p7,
				tmt_srt_tgs = @p8,
				tgl_ptk_keluar = @p9,
				nidn = @p10,
				last_update = @p11,
				id_updater = @p12,
				last_sync = @p13
			WHERE id_reg_ptk = @p14 AND soft_delete = 0
		`
		_, err = r.db.Exec(query,
			p.IDSP, p.IDStatPegawai, p.IDIkatanKerja, p.IDSMS,
			p.IDJnsKeluar, p.NoSrtTgs, p.TglSrtTgs, p.TMTSrtTgs, p.TglPTKKeluar,
			p.NIDN, p.LastUpdate, p.IDUpdater, p.LastSync,
			p.IDRegPTK,
		)
		if err != nil {
			return fmt.Errorf("failed to update penugasan: %w", err)
		}
	}

	return nil
}

// DeleteKeaktifanByIDRegPTK deletes all keaktifan records for a penugasan
func (r *repository) DeleteKeaktifanByIDRegPTK(idRegPTK string) error {
	query := `DELETE FROM pdrd.keaktifan_ptk WHERE id_reg_ptk = @p1`
	_, err := r.db.Exec(query, idRegPTK)
	if err != nil {
		return fmt.Errorf("failed to delete keaktifan: %w", err)
	}
	return nil
}

// InsertKeaktifan inserts a keaktifan record
func (r *repository) InsertKeaktifan(k *KeaktifanPTK) error {
	query := `
		INSERT INTO pdrd.keaktifan_ptk (
			id_keaktifan_ptk, id_reg_ptk, id_thn_ajaran, a_sp_homebase,
			create_date, id_creator, last_update, id_updater, soft_delete
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8, @p9
		)
	`
	_, err := r.db.Exec(query,
		k.IDKeaktifanPTK, k.IDRegPTK, k.IDThnAjaran, k.ASPHomebase,
		k.CreateDate, k.IDCreator, k.LastUpdate, k.IDUpdater, k.SoftDelete,
	)
	if err != nil {
		return fmt.Errorf("failed to insert keaktifan: %w", err)
	}
	return nil
}

// GetKeaktifanByIDRegPTK retrieves all keaktifan for a penugasan
func (r *repository) GetKeaktifanByIDRegPTK(idRegPTK string) ([]KeaktifanPTK, error) {
	query := `
		SELECT
			id_keaktifan_ptk, id_reg_ptk, id_thn_ajaran, a_sp_homebase,
			create_date, id_creator, last_update, id_updater, soft_delete
		FROM pdrd.keaktifan_ptk
		WHERE id_reg_ptk = @p1 AND soft_delete = 0
		ORDER BY id_thn_ajaran DESC
	`

	var keaktifanList []KeaktifanPTK
	err := r.db.Select(&keaktifanList, query, idRegPTK)
	if err != nil {
		return nil, fmt.Errorf("failed to get keaktifan: %w", err)
	}

	return keaktifanList, nil
}

// GetNIDNByIDSDM retrieves NIDN from pdrd.sdm by id_sdm
func (r *repository) GetNIDNByIDSDM(idSDM string) (*string, error) {
	query := `SELECT nidn FROM pdrd.sdm WHERE id_sdm = @p1 AND soft_delete = 0`

	var nidn *string
	err := r.db.Get(&nidn, query, idSDM)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get NIDN: %w", err)
	}

	return nidn, nil
}

// GetAllActiveDosen retrieves all active dosen for batch sync
func (r *repository) GetAllActiveDosen() ([]DosenInfo, error) {
	query := `
		SELECT
			id_sdm,
			nm_sdm,
			nidn
		FROM pdrd.sdm
		WHERE soft_delete = 0 AND id_sdm IS NOT NULL
		ORDER BY nm_sdm
	`

	rows, err := r.db.Queryx(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query active dosen: %w", err)
	}
	defer rows.Close()

	var dosenList []DosenInfo
	for rows.Next() {
		var d DosenInfo
		if err := rows.Scan(&d.IDSDM, &d.Nama, &d.NIDN); err != nil {
			return nil, fmt.Errorf("failed to scan dosen: %w", err)
		}
		dosenList = append(dosenList, d)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating dosen rows: %w", err)
	}

	return dosenList, nil
}

// GetPenugasanList retrieves paginated list of penugasan with search
func (r *repository) GetPenugasanList(page, limit int, search string) (*PenugasanListResult, error) {
	offset := (page - 1) * limit

	// Build WHERE clause
	whereConditions := "WHERE p.soft_delete = 0"
	args := []interface{}{}
	argIndex := 1

	if search != "" {
		whereConditions += fmt.Sprintf(" AND (s.nm_sdm LIKE @p%d OR s.nidn LIKE @p%d OR s.nip LIKE @p%d OR p.no_srt_tgs LIKE @p%d)", argIndex, argIndex, argIndex, argIndex)
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern)
		argIndex++
	}

	// Count total records
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_ptk p
		LEFT JOIN pdrd.sdm s ON p.id_sdm = s.id_sdm
		%s
	`, whereConditions)

	var total int
	err := r.db.Get(&total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count penugasan: %w", err)
	}

	// Get paginated data with all JOINs
	dataQuery := fmt.Sprintf(`
		SELECT
			p.id_reg_ptk, p.id_sdm, p.id_sp, p.id_stat_pegawai, p.id_ikatan_kerja, p.id_sms,
			p.id_jns_keluar, p.no_srt_tgs, p.tgl_srt_tgs, p.tmt_srt_tgs, p.tgl_ptk_keluar,
			p.nidn, p.jns_reg, p.create_date, p.id_creator, p.last_update, p.id_updater,
			p.soft_delete, p.last_sync,
			s.nm_sdm AS nama_dosen,
			s.nip,
			sk.nm_stat_pegawai AS status_kepegawaian,
			ik.nm_ikatan_kerja AS ikatan_kerja,
			kp_latest.a_sp_homebase AS homebase,
			CAST(kp_latest.id_thn_ajaran AS varchar(10)) AS homebase_tahun_ajaran,
			CAST(kp_latest.id_thn_ajaran AS varchar(10)) AS tahun_aktif,
			sms.nm_lemb AS nama_prodi,
			sms.kode_prodi,
			jp.nm_jenj_didik AS nama_jenjang_pendidikan
		FROM pdrd.reg_ptk p
		LEFT JOIN pdrd.sdm s ON p.id_sdm = s.id_sdm
		LEFT JOIN ref.status_kepegawaian sk ON p.id_stat_pegawai = sk.id_stat_pegawai
		LEFT JOIN ref.ikatan_kerja_sdm ik ON p.id_ikatan_kerja = ik.id_ikatan_kerja
		LEFT JOIN (
			SELECT
				id_reg_ptk,
				id_thn_ajaran,
				a_sp_homebase,
				ROW_NUMBER() OVER (PARTITION BY id_reg_ptk ORDER BY id_thn_ajaran DESC) as rn
			FROM pdrd.keaktifan_ptk
			WHERE soft_delete = 0
		) kp_latest ON p.id_reg_ptk = kp_latest.id_reg_ptk AND kp_latest.rn = 1
		LEFT JOIN pdrd.sms sms ON p.id_sms = sms.id_sms
		LEFT JOIN ref.jenjang_pendidikan jp ON sms.id_jenj_didik = jp.id_jenj_didik
		%s
		ORDER BY p.tmt_srt_tgs DESC, p.create_date DESC
		OFFSET @p%d ROWS
		FETCH NEXT @p%d ROWS ONLY
	`, whereConditions, argIndex, argIndex+1)

	args = append(args, offset, limit)

	var penugasanList []*Penugasan
	err = r.db.Select(&penugasanList, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get penugasan list: %w", err)
	}

	totalPages := (total + limit - 1) / limit

	return &PenugasanListResult{
		Data:       penugasanList,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetPenugasanStats retrieves penugasan statistics
func (r *repository) GetPenugasanStats() (*PenugasanStats, error) {
	stats := &PenugasanStats{}

	// Get total penugasan
	err := r.db.Get(&stats.TotalPenugasan, "SELECT COUNT(*) FROM pdrd.reg_ptk WHERE soft_delete = 0")
	if err != nil {
		return nil, fmt.Errorf("failed to get total penugasan: %w", err)
	}

	// Get total active penugasan (not yet keluar)
	err = r.db.Get(&stats.TotalActive, "SELECT COUNT(*) FROM pdrd.reg_ptk WHERE soft_delete = 0 AND (tgl_ptk_keluar IS NULL OR tgl_ptk_keluar > GETDATE())")
	if err != nil {
		stats.TotalActive = 0
	}

	// Get last sync time
	var lastSync *time.Time
	err = r.db.Get(&lastSync, "SELECT TOP 1 last_sync FROM pdrd.reg_ptk WHERE last_sync IS NOT NULL ORDER BY last_sync DESC")
	if err != nil {
		// If no sync yet, lastSync remains nil
		lastSync = nil
	}
	stats.LastSync = lastSync

	return stats, nil
}
