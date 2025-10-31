package penugasan

import (
	"fmt"
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Penugasan operations
	GetPenugasanByIDRegPTK(idRegPTK string) (*Penugasan, error)
	GetAllPenugasanByIDSDM(idSDM string) ([]Penugasan, error)
	UpsertPenugasan(p *Penugasan) error

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
			nama_sdm,
			nidn
		FROM pdrd.sdm
		WHERE soft_delete = 0 AND id_sdm IS NOT NULL
		ORDER BY nama_sdm
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
