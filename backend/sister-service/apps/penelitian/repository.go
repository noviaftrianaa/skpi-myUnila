package penelitian

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
	// Litabmas operations
	UpsertLitabmas(litabmas *Litabmas) error
	GetLitabmasByID(idLitabmas string) (*Litabmas, error)
	GetLitabmasByIDSDM(idSDM string, jnsLitabmas string) ([]*Litabmas, error)
	GetPenelitianStats() (*PenelitianStats, error)
	GetPengabdianStats() (*PenelitianStats, error)
	GetPenelitianList(page, limit int, search string) (*LitabmasListResult, error)
	GetPengabdianList(page, limit int, search string) (*LitabmasListResult, error)
	GetPenelitianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error)
	GetPengabdianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error)

	// Anggota operations
	GetAnggotaSDMByLitabmas(idLitabmas string) ([]*AnggotaSDMLitabmas, error)
	GetAnggotaPDByLitabmas(idLitabmas string) ([]*AnggotaPDLitabmas, error)
	MergeAnggotaSDM(idLitabmas string, anggotaList []*AnggotaSDMLitabmas) error
	MergeAnggotaPD(idLitabmas string, anggotaList []*AnggotaPDLitabmas) error

	// Dokumen operations
	UpsertDokumen(dok *Dokumen) error
	GetDokumenByLitabmas(idLitabmas string) ([]*Dokumen, error)
	MergeDokumenLitabmas(idLitabmas string, dokList []*DokLitabmas) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// UpsertLitabmas inserts or updates litabmas record
func (r *repository) UpsertLitabmas(litabmas *Litabmas) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Check if exists
	var exists bool
	checkSQL := `SELECT CASE WHEN EXISTS (
		SELECT 1 FROM pdrd.litabmas WHERE id_litabmas = @p1 AND soft_delete = 0
	) THEN 1 ELSE 0 END`

	err := r.db.QueryRowContext(ctx, checkSQL, litabmas.IDLitabmas).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check litabmas existence: %w", err)
	}

	if exists {
		// UPDATE
		updateSQL := `
			UPDATE pdrd.litabmas SET
				id_lemb_iptek = @p1,
				judul_litabmas = @p2,
				lama_kegiatan = @p3,
				thn_laks_ke = @p4,
				dana_dikti = @p5,
				dana_pt = @p6,
				dana_institusi_lain = @p7,
				in_kind = @p8,
				stat_aktif = @p9,
				jns_litabmas = @p10,
				sk_tugas = @p11,
				tgl_sk_tugas = @p12,
				lokasi_kegiatan = @p13,
				id_skim = @p14,
				id_thn_usulan = @p15,
				id_thn_kegiatan = @p16,
				id_thn_laks = @p17,
				id_lanjutan_litabmas = @p18,
				id_kel_bidang = @p19,
				id_tse = @p20,
				id_smi = @p21,
				id_jns_lit = @p22,
				last_update = @p23,
				id_updater = @p24,
				last_sync = @p25
			WHERE id_litabmas = @p26 AND soft_delete = 0
		`
		_, err = r.db.ExecContext(ctx, updateSQL,
			litabmas.IDLembIptek,
			litabmas.JudulLitabmas,
			litabmas.LamaKegiatan,
			litabmas.ThnLaksKe,
			litabmas.DanaDikti,
			litabmas.DanaPT,
			litabmas.DanaInstLain,
			litabmas.InKind,
			litabmas.StatAktif,
			litabmas.JnsLitabmas,
			litabmas.SKTugas,
			litabmas.TglSKTugas,
			litabmas.LokasiKegiatan,
			litabmas.IDSkim,
			litabmas.IDThnUsulan,
			litabmas.IDThnKegiatan,
			litabmas.IDThnLaks,
			litabmas.IDLanjutanLitabmas,
			litabmas.IDKelBidang,
			litabmas.IDTse,
			litabmas.IDSMI,
			litabmas.IDJnsLit,
			litabmas.LastUpdate,
			litabmas.IDUpdater,
			litabmas.LastSync,
			litabmas.IDLitabmas,
		)
		if err != nil {
			return fmt.Errorf("failed to update litabmas: %w", err)
		}
		log.Printf("✅ Updated litabmas: %s", litabmas.IDLitabmas)
	} else {
		// INSERT
		insertSQL := `
			INSERT INTO pdrd.litabmas (
				id_litabmas, id_lemb_iptek, judul_litabmas, lama_kegiatan, thn_laks_ke,
				dana_dikti, dana_pt, dana_institusi_lain, in_kind, stat_aktif,
				jns_litabmas, sk_tugas, tgl_sk_tugas, lokasi_kegiatan, id_skim,
				id_thn_usulan, id_thn_kegiatan, id_thn_laks, id_lanjutan_litabmas,
				id_kel_bidang, id_tse, id_smi, id_jns_lit,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
				@p11, @p12, @p13, @p14, @p15, @p16, @p17, @p18, @p19, @p20,
				@p21, @p22, @p23, @p24, @p25, @p26, @p27, @p28, @p29
			)
		`
		_, err = r.db.ExecContext(ctx, insertSQL,
			litabmas.IDLitabmas,
			litabmas.IDLembIptek,
			litabmas.JudulLitabmas,
			litabmas.LamaKegiatan,
			litabmas.ThnLaksKe,
			litabmas.DanaDikti,
			litabmas.DanaPT,
			litabmas.DanaInstLain,
			litabmas.InKind,
			litabmas.StatAktif,
			litabmas.JnsLitabmas,
			litabmas.SKTugas,
			litabmas.TglSKTugas,
			litabmas.LokasiKegiatan,
			litabmas.IDSkim,
			litabmas.IDThnUsulan,
			litabmas.IDThnKegiatan,
			litabmas.IDThnLaks,
			litabmas.IDLanjutanLitabmas,
			litabmas.IDKelBidang,
			litabmas.IDTse,
			litabmas.IDSMI,
			litabmas.IDJnsLit,
			litabmas.CreateDate,
			litabmas.IDCreator,
			litabmas.LastUpdate,
			litabmas.IDUpdater,
			litabmas.SoftDelete,
			litabmas.LastSync,
		)
		if err != nil {
			return fmt.Errorf("failed to insert litabmas: %w", err)
		}
		log.Printf("✅ Inserted litabmas: %s", litabmas.IDLitabmas)
	}

	return nil
}

// GetLitabmasByID retrieves a single litabmas by ID
func (r *repository) GetLitabmasByID(idLitabmas string) (*Litabmas, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			id_litabmas, id_lemb_iptek, judul_litabmas, lama_kegiatan, thn_laks_ke,
			dana_dikti, dana_pt, dana_institusi_lain, in_kind, stat_aktif,
			jns_litabmas, sk_tugas, tgl_sk_tugas, lokasi_kegiatan, id_skim,
			id_thn_usulan, id_thn_kegiatan, id_thn_laks, id_lanjutan_litabmas,
			id_kel_bidang, id_tse, id_smi, id_jns_lit,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.litabmas
		WHERE id_litabmas = @p1 AND soft_delete = 0
	`

	var litabmas Litabmas
	err := r.db.GetContext(ctx, &litabmas, query, idLitabmas)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get litabmas: %w", err)
	}

	return &litabmas, nil
}

// GetLitabmasByIDSDM retrieves all litabmas for a given id_sdm and jns_litabmas
func (r *repository) GetLitabmasByIDSDM(idSDM string, jnsLitabmas string) ([]*Litabmas, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT DISTINCT
			l.id_litabmas, l.id_lemb_iptek, l.judul_litabmas, l.lama_kegiatan, l.thn_laks_ke,
			l.dana_dikti, l.dana_pt, l.dana_institusi_lain, l.in_kind, l.stat_aktif,
			l.jns_litabmas, l.sk_tugas, l.tgl_sk_tugas, l.lokasi_kegiatan, l.id_skim,
			l.id_thn_usulan, l.id_thn_kegiatan, l.id_thn_laks, l.id_lanjutan_litabmas,
			l.id_kel_bidang, l.id_tse, l.id_smi, l.id_jns_lit,
			l.create_date, l.id_creator, l.last_update, l.id_updater, l.soft_delete, l.last_sync
		FROM pdrd.litabmas l
		INNER JOIN pdrd.sdm_anggota_litabmas sal
			ON sal.id_litabmas = l.id_litabmas
			AND sal.soft_delete = 0
		WHERE sal.id_sdm = @p1
			AND l.jns_litabmas = @p2
			AND l.soft_delete = 0
		ORDER BY l.id_thn_kegiatan DESC, l.judul_litabmas
	`

	var result []*Litabmas
	err := r.db.SelectContext(ctx, &result, query, idSDM, jnsLitabmas)
	if err != nil {
		return nil, fmt.Errorf("failed to get litabmas by id_sdm: %w", err)
	}

	return result, nil
}

// GetAnggotaSDMByLitabmas retrieves all dosen anggota for a litabmas
func (r *repository) GetAnggotaSDMByLitabmas(idLitabmas string) ([]*AnggotaSDMLitabmas, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			id_litabmas, id_sdm, id_katgiat, peran_litabmas, stat_aktif,
			create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.sdm_anggota_litabmas
		WHERE id_litabmas = @p1 AND soft_delete = 0
		ORDER BY peran_litabmas, id_sdm
	`

	var result []*AnggotaSDMLitabmas
	err := r.db.SelectContext(ctx, &result, query, idLitabmas)
	if err != nil {
		return nil, fmt.Errorf("failed to get anggota sdm: %w", err)
	}

	return result, nil
}

// GetAnggotaPDByLitabmas retrieves all mahasiswa anggota for a litabmas
func (r *repository) GetAnggotaPDByLitabmas(idLitabmas string) ([]*AnggotaPDLitabmas, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			id_pd_ang_litabmas, id_litabmas, id_pd, peran_litabmas, stat_aktif,
			nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM pdrd.pd_anggota_litabmas
		WHERE id_litabmas = @p1 AND soft_delete = 0
		ORDER BY peran_litabmas, nm_pd
	`

	var result []*AnggotaPDLitabmas
	err := r.db.SelectContext(ctx, &result, query, idLitabmas)
	if err != nil {
		return nil, fmt.Errorf("failed to get anggota pd: %w", err)
	}

	return result, nil
}

// MergeAnggotaSDM performs MERGE operation: delete removed, insert new, update existing
func (r *repository) MergeAnggotaSDM(idLitabmas string, anggotaList []*AnggotaSDMLitabmas) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get existing anggota
	existing, err := r.GetAnggotaSDMByLitabmas(idLitabmas)
	if err != nil {
		return fmt.Errorf("failed to get existing anggota sdm: %w", err)
	}

	// Build maps for comparison
	existingMap := make(map[string]*AnggotaSDMLitabmas)
	for _, ang := range existing {
		key := fmt.Sprintf("%s-%s", ang.IDLitabmas, ang.IDSDM)
		existingMap[key] = ang
	}

	newMap := make(map[string]*AnggotaSDMLitabmas)
	for _, ang := range anggotaList {
		key := fmt.Sprintf("%s-%s", ang.IDLitabmas, ang.IDSDM)
		newMap[key] = ang
	}

	// Delete removed anggota (soft delete)
	for key, ang := range existingMap {
		if _, exists := newMap[key]; !exists {
			deleteSQL := `
				UPDATE pdrd.sdm_anggota_litabmas
				SET soft_delete = 1, last_update = @p1
				WHERE id_litabmas = @p2 AND id_sdm = @p3
			`
			_, err := r.db.ExecContext(ctx, deleteSQL, time.Now(), ang.IDLitabmas, ang.IDSDM)
			if err != nil {
				log.Printf("⚠️ Failed to delete anggota sdm %s: %v", ang.IDSDM, err)
			} else {
				log.Printf("🗑️ Deleted anggota sdm: %s", ang.IDSDM)
			}
		}
	}

	// Insert new or update existing
	for key, ang := range newMap {
		if _, exists := existingMap[key]; exists {
			// UPDATE
			updateSQL := `
				UPDATE pdrd.sdm_anggota_litabmas SET
					id_katgiat = @p1,
					peran_litabmas = @p2,
					stat_aktif = @p3,
					last_update = @p4,
					id_updater = @p5,
					last_sync = @p6,
					soft_delete = 0
				WHERE id_litabmas = @p7 AND id_sdm = @p8
			`
			_, err := r.db.ExecContext(ctx, updateSQL,
				ang.IDKatgiat,
				ang.PeranLitabmas,
				ang.StatAktif,
				ang.LastUpdate,
				ang.IDUpdater,
				ang.LastSync,
				ang.IDLitabmas,
				ang.IDSDM,
			)
			if err != nil {
				log.Printf("⚠️ Failed to update anggota sdm %s: %v", ang.IDSDM, err)
			}
		} else {
			// INSERT
			insertSQL := `
				INSERT INTO pdrd.sdm_anggota_litabmas (
					id_litabmas, id_sdm, id_katgiat, peran_litabmas, stat_aktif,
					create_date, id_creator, last_update, id_updater, soft_delete, last_sync
				) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11)
			`
			_, err := r.db.ExecContext(ctx, insertSQL,
				ang.IDLitabmas,
				ang.IDSDM,
				ang.IDKatgiat,
				ang.PeranLitabmas,
				ang.StatAktif,
				ang.CreateDate,
				ang.IDCreator,
				ang.LastUpdate,
				ang.IDUpdater,
				ang.SoftDelete,
				ang.LastSync,
			)
			if err != nil {
				log.Printf("⚠️ Failed to insert anggota sdm %s: %v", ang.IDSDM, err)
			}
		}
	}

	log.Printf("✅ Merged %d anggota sdm for litabmas %s", len(anggotaList), idLitabmas)
	return nil
}

// MergeAnggotaPD performs MERGE operation for mahasiswa anggota
func (r *repository) MergeAnggotaPD(idLitabmas string, anggotaList []*AnggotaPDLitabmas) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get existing anggota
	existing, err := r.GetAnggotaPDByLitabmas(idLitabmas)
	if err != nil {
		return fmt.Errorf("failed to get existing anggota pd: %w", err)
	}

	// Build maps for comparison (using id_pd_ang_litabmas as key)
	existingMap := make(map[string]*AnggotaPDLitabmas)
	for _, ang := range existing {
		existingMap[ang.IDPDAngLitabmas] = ang
	}

	newMap := make(map[string]*AnggotaPDLitabmas)
	for _, ang := range anggotaList {
		newMap[ang.IDPDAngLitabmas] = ang
	}

	// Delete removed anggota (soft delete)
	for key, ang := range existingMap {
		if _, exists := newMap[key]; !exists {
			deleteSQL := `
				UPDATE pdrd.pd_anggota_litabmas
				SET soft_delete = 1, last_update = @p1
				WHERE id_pd_ang_litabmas = @p2
			`
			_, err := r.db.ExecContext(ctx, deleteSQL, time.Now(), ang.IDPDAngLitabmas)
			if err != nil {
				log.Printf("⚠️ Failed to delete anggota pd %s: %v", ang.IDPDAngLitabmas, err)
			} else {
				log.Printf("🗑️ Deleted anggota pd: %s", ang.IDPDAngLitabmas)
			}
		}
	}

	// Insert new or update existing
	for key, ang := range newMap {
		if _, exists := existingMap[key]; exists {
			// UPDATE
			updateSQL := `
				UPDATE pdrd.pd_anggota_litabmas SET
					id_pd = @p1,
					peran_litabmas = @p2,
					stat_aktif = @p3,
					nm_pd = @p4,
					nipd = @p5,
					last_update = @p6,
					id_updater = @p7,
					last_sync = @p8,
					soft_delete = 0
				WHERE id_pd_ang_litabmas = @p9
			`
			_, err := r.db.ExecContext(ctx, updateSQL,
				ang.IDPD,
				ang.PeranLitabmas,
				ang.StatAktif,
				ang.NmPD,
				ang.NIPD,
				ang.LastUpdate,
				ang.IDUpdater,
				ang.LastSync,
				ang.IDPDAngLitabmas,
			)
			if err != nil {
				log.Printf("⚠️ Failed to update anggota pd %s: %v", ang.IDPDAngLitabmas, err)
			}
		} else {
			// INSERT
			insertSQL := `
				INSERT INTO pdrd.pd_anggota_litabmas (
					id_pd_ang_litabmas, id_litabmas, id_pd, peran_litabmas, stat_aktif,
					nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
				) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13)
			`
			_, err := r.db.ExecContext(ctx, insertSQL,
				ang.IDPDAngLitabmas,
				ang.IDLitabmas,
				ang.IDPD,
				ang.PeranLitabmas,
				ang.StatAktif,
				ang.NmPD,
				ang.NIPD,
				ang.CreateDate,
				ang.IDCreator,
				ang.LastUpdate,
				ang.IDUpdater,
				ang.SoftDelete,
				ang.LastSync,
			)
			if err != nil {
				log.Printf("⚠️ Failed to insert anggota pd %s: %v", ang.IDPDAngLitabmas, err)
			}
		}
	}

	log.Printf("✅ Merged %d anggota pd for litabmas %s", len(anggotaList), idLitabmas)
	return nil
}

// UpsertDokumen inserts or updates dokumen record
func (r *repository) UpsertDokumen(dok *Dokumen) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Check if exists
	var exists bool
	checkSQL := `SELECT CASE WHEN EXISTS (
		SELECT 1 FROM dok.dokumen WHERE id_dok = @p1 AND soft_delete = 0
	) THEN 1 ELSE 0 END`

	err := r.db.QueryRowContext(ctx, checkSQL, dok.IDDok).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check dokumen existence: %w", err)
	}

	if exists {
		// UPDATE (without file_dok binary)
		updateSQL := `
			UPDATE dok.dokumen SET
				id_jns_dok = @p1,
				nm_dok = @p2,
				ket_dok = @p3,
				wkt_unggah = @p4,
				url = @p5,
				media_type = @p6,
				file_name = @p7,
				last_update = @p8,
				id_updater = @p9,
				last_sync = @p10
			WHERE id_dok = @p11 AND soft_delete = 0
		`
		_, err = r.db.ExecContext(ctx, updateSQL,
			dok.IDJnsDok,
			dok.NmDok,
			dok.KetDok,
			dok.WktUnggah,
			dok.URL,
			dok.MediaType,
			dok.FileName,
			dok.LastUpdate,
			dok.IDUpdater,
			dok.LastSync,
			dok.IDDok,
		)
		if err != nil {
			return fmt.Errorf("failed to update dokumen: %w", err)
		}
	} else {
		// INSERT (without file_dok binary)
		insertSQL := `
			INSERT INTO dok.dokumen (
				id_dok, id_jns_dok, nm_dok, ket_dok, wkt_unggah, url, media_type, file_name,
				create_date, id_creator, last_update, id_updater, soft_delete, last_sync
			) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14)
		`
		_, err = r.db.ExecContext(ctx, insertSQL,
			dok.IDDok,
			dok.IDJnsDok,
			dok.NmDok,
			dok.KetDok,
			dok.WktUnggah,
			dok.URL,
			dok.MediaType,
			dok.FileName,
			dok.CreateDate,
			dok.IDCreator,
			dok.LastUpdate,
			dok.IDUpdater,
			dok.SoftDelete,
			dok.LastSync,
		)
		if err != nil {
			return fmt.Errorf("failed to insert dokumen: %w", err)
		}
	}

	return nil
}

// GetDokumenByLitabmas retrieves all dokumen for a litabmas
func (r *repository) GetDokumenByLitabmas(idLitabmas string) ([]*Dokumen, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			d.id_dok, d.id_jns_dok, d.nm_dok, d.ket_dok, d.wkt_unggah, d.url, d.media_type, d.file_name,
			d.create_date, d.id_creator, d.last_update, d.id_updater, d.soft_delete, d.last_sync
		FROM dok.dokumen d
		INNER JOIN dok.dok_litabmas dl
			ON dl.id_dok = d.id_dok
			AND dl.soft_delete = 0
		WHERE dl.id_litabmas = @p1 AND d.soft_delete = 0
		ORDER BY d.wkt_unggah DESC
	`

	var result []*Dokumen
	err := r.db.SelectContext(ctx, &result, query, idLitabmas)
	if err != nil {
		return nil, fmt.Errorf("failed to get dokumen: %w", err)
	}

	return result, nil
}

// MergeDokumenLitabmas performs MERGE operation for dokumen relations
func (r *repository) MergeDokumenLitabmas(idLitabmas string, dokList []*DokLitabmas) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get existing dok_litabmas relations
	var existing []*DokLitabmas
	query := `
		SELECT id_litabmas, id_dok, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
		FROM dok.dok_litabmas
		WHERE id_litabmas = @p1 AND soft_delete = 0
	`
	err := r.db.SelectContext(ctx, &existing, query, idLitabmas)
	if err != nil {
		return fmt.Errorf("failed to get existing dok_litabmas: %w", err)
	}

	// Build maps for comparison
	existingMap := make(map[string]*DokLitabmas)
	for _, dk := range existing {
		key := fmt.Sprintf("%s-%s", dk.IDLitabmas, dk.IDDok)
		existingMap[key] = dk
	}

	newMap := make(map[string]*DokLitabmas)
	for _, dk := range dokList {
		key := fmt.Sprintf("%s-%s", dk.IDLitabmas, dk.IDDok)
		newMap[key] = dk
	}

	// Delete removed relations (soft delete)
	for key, dk := range existingMap {
		if _, exists := newMap[key]; !exists {
			deleteSQL := `
				UPDATE dok.dok_litabmas
				SET soft_delete = 1, last_update = @p1
				WHERE id_litabmas = @p2 AND id_dok = @p3
			`
			_, err := r.db.ExecContext(ctx, deleteSQL, time.Now(), dk.IDLitabmas, dk.IDDok)
			if err != nil {
				log.Printf("⚠️ Failed to delete dok_litabmas %s: %v", dk.IDDok, err)
			}
		}
	}

	// Insert new relations (update not needed for relation table)
	for key, dk := range newMap {
		if _, exists := existingMap[key]; !exists {
			insertSQL := `
				INSERT INTO dok.dok_litabmas (
					id_litabmas, id_dok, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
				) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8)
			`
			_, err := r.db.ExecContext(ctx, insertSQL,
				dk.IDLitabmas,
				dk.IDDok,
				dk.CreateDate,
				dk.IDCreator,
				dk.LastUpdate,
				dk.IDUpdater,
				dk.SoftDelete,
				dk.LastSync,
			)
			if err != nil {
				log.Printf("⚠️ Failed to insert dok_litabmas %s: %v", dk.IDDok, err)
			}
		}
	}

	log.Printf("✅ Merged %d dokumen relations for litabmas %s", len(dokList), idLitabmas)
	return nil
}

// GetPenelitianStats retrieves statistics for penelitian
func (r *repository) GetPenelitianStats() (*PenelitianStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(*) as total_penelitian,
			SUM(CASE WHEN stat_aktif = 1 THEN 1 ELSE 0 END) as total_active,
			COALESCE(SUM(ISNULL(dana_dikti, 0) + ISNULL(dana_pt, 0) + ISNULL(dana_institusi_lain, 0)), 0) as total_dana,
			MAX(last_sync) as last_sync
		FROM pdrd.litabmas
		WHERE jns_litabmas = 'L' AND soft_delete = 0
	`

	var stats PenelitianStats
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalPenelitian,
		&stats.TotalActive,
		&stats.TotalDana,
		&stats.LastSync,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get penelitian stats: %w", err)
	}

	return &stats, nil
}

// GetPengabdianStats retrieves statistics for pengabdian
func (r *repository) GetPengabdianStats() (*PenelitianStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT
			COUNT(*) as total_penelitian,
			SUM(CASE WHEN stat_aktif = 1 THEN 1 ELSE 0 END) as total_active,
			COALESCE(SUM(ISNULL(dana_dikti, 0) + ISNULL(dana_pt, 0) + ISNULL(dana_institusi_lain, 0)), 0) as total_dana,
			MAX(last_sync) as last_sync
		FROM pdrd.litabmas
		WHERE jns_litabmas = 'M' AND soft_delete = 0
	`

	var stats PenelitianStats
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalPenelitian,
		&stats.TotalActive,
		&stats.TotalDana,
		&stats.LastSync,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get pengabdian stats: %w", err)
	}

	return &stats, nil
}

// GetPenelitianList retrieves paginated list of penelitian with search
func (r *repository) GetPenelitianList(page, limit int, search string) (*LitabmasListResult, error) {
	return r.getLitabmasList(page, limit, search, "L", "", "desc")
}

// GetPengabdianList retrieves paginated list of pengabdian with search
func (r *repository) GetPengabdianList(page, limit int, search string) (*LitabmasListResult, error) {
	return r.getLitabmasList(page, limit, search, "M", "", "desc")
}

// GetPenelitianListWithSort retrieves paginated list of penelitian with search and sorting
func (r *repository) GetPenelitianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error) {
	return r.getLitabmasList(page, limit, search, "L", sortBy, sortOrder)
}

// GetPengabdianListWithSort retrieves paginated list of pengabdian with search and sorting
func (r *repository) GetPengabdianListWithSort(page, limit int, search, sortBy, sortOrder string) (*LitabmasListResult, error) {
	return r.getLitabmasList(page, limit, search, "M", sortBy, sortOrder)
}

// getLitabmasList is the internal implementation for getting penelitian/pengabdian list
func (r *repository) getLitabmasList(page, limit int, search string, jnsLitabmas string, sortBy, sortOrder string) (*LitabmasListResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Printf("🔍 getLitabmasList called: page=%d, limit=%d, search=%s, jnsLitabmas=%s", page, limit, search, jnsLitabmas)

	// Build WHERE clause
	whereConditions := "WHERE l.jns_litabmas = @p1 AND l.soft_delete = 0"
	args := []interface{}{jnsLitabmas}
	argIndex := 2

	if search != "" {
		// Search in judul_litabmas OR anggota names (dosen or mahasiswa)
		whereConditions += fmt.Sprintf(` AND (
			l.judul_litabmas LIKE @p%d
			OR EXISTS (
				SELECT 1 FROM pdrd.sdm_anggota_litabmas sal
				INNER JOIN pdrd.sdm s ON s.id_sdm = sal.id_sdm AND s.soft_delete = 0
				WHERE sal.id_litabmas = l.id_litabmas
				AND sal.soft_delete = 0
				AND s.nm_sdm LIKE @p%d
			)
			OR EXISTS (
				SELECT 1 FROM pdrd.pd_anggota_litabmas pal
				WHERE pal.id_litabmas = l.id_litabmas
				AND pal.soft_delete = 0
				AND pal.nm_pd LIKE @p%d
			)
		)`, argIndex, argIndex+1, argIndex+2)
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
		argIndex += 3
	}

	// Get total count
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.litabmas l
		%s
	`, whereConditions)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count litabmas: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Build ORDER BY clause
	orderByClause := "ORDER BY l.id_thn_kegiatan DESC, l.judul_litabmas"
	if sortBy != "" {
		// Validate sort order
		if sortOrder != "asc" && sortOrder != "desc" {
			sortOrder = "desc"
		}

		// Map sortBy to actual column
		switch sortBy {
		case "judul_litabmas":
			orderByClause = fmt.Sprintf("ORDER BY l.judul_litabmas %s", strings.ToUpper(sortOrder))
		case "id_thn_kegiatan":
			orderByClause = fmt.Sprintf("ORDER BY l.id_thn_kegiatan %s", strings.ToUpper(sortOrder))
		case "pendanaan":
			// For pendanaan, calculate total dana and sort by it
			orderByClause = fmt.Sprintf("ORDER BY (l.dana_dikti + l.dana_pt + l.dana_institusi_lain) %s", strings.ToUpper(sortOrder))
		default:
			// Keep default sorting
			orderByClause = "ORDER BY l.id_thn_kegiatan DESC, l.judul_litabmas"
		}
	}

	// Get paginated data
	dataQuery := fmt.Sprintf(`
		SELECT
			CONVERT(VARCHAR(36), l.id_litabmas) as id_litabmas,
			l.judul_litabmas, l.id_thn_kegiatan,
			l.dana_dikti, l.dana_pt, l.dana_institusi_lain,
			l.jns_litabmas, l.stat_aktif, l.last_sync
		FROM pdrd.litabmas l
		%s
		%s
		OFFSET @p%d ROWS
		FETCH NEXT @p%d ROWS ONLY
	`, whereConditions, orderByClause, argIndex, argIndex+1)

	args = append(args, offset, limit)

	var items []*LitabmasListItem
	err = r.db.SelectContext(ctx, &items, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get litabmas list: %w", err)
	}

	log.Printf("📊 Retrieved %d litabmas items, now populating anggota...", len(items))

	// Populate anggota for each item
	for _, item := range items {
		anggota, err := r.getAnggotaInfoByLitabmas(item.IDLitabmas)
		if err != nil {
			log.Printf("⚠️ Failed to get anggota for litabmas %s: %v", item.IDLitabmas, err)
			item.Anggota = []*AnggotaLitabmasInfo{} // Empty array on error
		} else {
			item.Anggota = anggota
		}
	}

	totalPages := (total + limit - 1) / limit

	return &LitabmasListResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// getAnggotaInfoByLitabmas retrieves anggota information for a litabmas
func (r *repository) getAnggotaInfoByLitabmas(idLitabmas string) ([]*AnggotaLitabmasInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Printf("🔍 Getting anggota for litabmas: %s", idLitabmas)

	var result []*AnggotaLitabmasInfo

	// Get dosen anggota from sdm_anggota_litabmas
	dosenQuery := `
		SELECT
			s.nm_sdm as nama,
			CASE
				WHEN sal.peran_litabmas = 'K' THEN '(K)'
				ELSE '(A)'
			END as jenis_peran
		FROM pdrd.sdm_anggota_litabmas sal WITH (NOLOCK)
		INNER JOIN pdrd.sdm s WITH (NOLOCK) ON s.id_sdm = sal.id_sdm AND s.soft_delete = 0
		WHERE sal.id_litabmas = CONVERT(UNIQUEIDENTIFIER, @p1) AND sal.soft_delete = 0
		ORDER BY sal.peran_litabmas DESC
	`

	rows, err := r.db.QueryContext(ctx, dosenQuery, idLitabmas)
	if err != nil {
		log.Printf("⚠️ Error querying dosen anggota for %s: %v", idLitabmas, err)
	} else {
		defer rows.Close()
		dosenCount := 0
		for rows.Next() {
			var anggota AnggotaLitabmasInfo
			if err := rows.Scan(&anggota.Nama, &anggota.JenisPeran); err != nil {
				log.Printf("⚠️ Error scanning dosen anggota: %v", err)
				continue
			}
			result = append(result, &anggota)
			dosenCount++
		}
		log.Printf("📋 Found %d dosen anggota for %s", dosenCount, idLitabmas)
	}

	// Get mahasiswa anggota from pd_anggota_litabmas
	mahasiswaQuery := `
		SELECT
			pal.nm_pd as nama,
			CASE
				WHEN pal.peran_litabmas = 'K' THEN '(K)'
				ELSE '(A)'
			END as jenis_peran
		FROM pdrd.pd_anggota_litabmas pal WITH (NOLOCK)
		WHERE pal.id_litabmas = CONVERT(UNIQUEIDENTIFIER, @p1) AND pal.soft_delete = 0
		ORDER BY pal.peran_litabmas DESC
	`

	rows2, err := r.db.QueryContext(ctx, mahasiswaQuery, idLitabmas)
	if err != nil {
		log.Printf("⚠️ Error querying mahasiswa anggota for %s: %v", idLitabmas, err)
	} else {
		defer rows2.Close()
		mahasiswaCount := 0
		for rows2.Next() {
			var anggota AnggotaLitabmasInfo
			if err := rows2.Scan(&anggota.Nama, &anggota.JenisPeran); err != nil {
				log.Printf("⚠️ Error scanning mahasiswa anggota: %v", err)
				continue
			}
			result = append(result, &anggota)
			mahasiswaCount++
		}
		log.Printf("📋 Found %d mahasiswa anggota for %s", mahasiswaCount, idLitabmas)
	}

	log.Printf("✅ Total anggota for %s: %d", idLitabmas, len(result))
	return result, nil
}
