package dosen

import (
	"context"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

// Repository defines the dosen repository interface
type Repository interface {
	BulkUpsertDosen(data []*Dosen) error
	GetReferenceCache() (*ReferenceCache, error)
}

type repository struct {
	db    *sqlx.DB
	cache *ReferenceCache
}

// ReferenceCache holds reference data for lookup
type ReferenceCache struct {
	JenisSDM    map[string]int    // key: nama_jenis_sdm, value: id_jns_sdm
	StatusAktif map[string]string // key: nama_status_aktif, value: id_stat_aktif
}

// NewRepository creates a new dosen repository
func NewRepository(db *sqlx.DB) Repository {
	return &repository{
		db: db,
	}
}

// GetReferenceCache loads and caches reference data for fast lookup
func (r *repository) GetReferenceCache() (*ReferenceCache, error) {
	if r.cache != nil {
		return r.cache, nil
	}

	cache := &ReferenceCache{
		JenisSDM:    make(map[string]int),
		StatusAktif: make(map[string]string),
	}

	// Load jenis_sdm
	queryJenisSDM := `SELECT id_jns_sdm, nm_jns_sdm FROM ref.jenis_sdm WHERE expired_date IS NULL`
	rows, err := r.db.Query(queryJenisSDM)
	if err != nil {
		return nil, fmt.Errorf("failed to load jenis_sdm: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var nama string
		if err := rows.Scan(&id, &nama); err != nil {
			log.Printf("⚠️ Failed to scan jenis_sdm row: %v", err)
			continue
		}
		cache.JenisSDM[nama] = id
	}

	// Load status_keaktifan_pegawai
	queryStatusAktif := `SELECT id_stat_aktif, nm_stat_aktif FROM ref.status_keaktifan_pegawai WHERE expired_date IS NULL`
	rows, err = r.db.Query(queryStatusAktif)
	if err != nil {
		return nil, fmt.Errorf("failed to load status_keaktifan_pegawai: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id, nama string
		if err := rows.Scan(&id, &nama); err != nil {
			log.Printf("⚠️ Failed to scan status_aktif row: %v", err)
			continue
		}
		cache.StatusAktif[nama] = id
	}

	r.cache = cache
	log.Printf("✅ Reference cache loaded: %d jenis_sdm, %d status_aktif",
		len(cache.JenisSDM), len(cache.StatusAktif))

	return cache, nil
}

// BulkUpsertDosen performs bulk upsert of dosen data to pdrd.sdm table
func (r *repository) BulkUpsertDosen(data []*Dosen) error {
	ctx := context.Background()
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// MERGE query sesuai dengan schema pdrd.sdm
	query := `
		MERGE pdrd.sdm AS target
		USING (SELECT
			@p1 AS id_sdm,
			@p2 AS nm_sdm,
			@p3 AS jk,
			@p4 AS tmpt_lahir,
			@p5 AS tgl_lahir,
			@p6 AS nik,
			@p7 AS niy_nigk,
			@p8 AS nuptk,
			@p9 AS nidn,
			@p10 AS nsdmi,
			@p11 AS stat_kawin,
			@p12 AS no_tel_rmh,
			@p13 AS no_hp,
			@p14 AS email,
			@p15 AS nip,
			@p16 AS tmt_pns,
			@p17 AS nm_suami_istri,
			@p18 AS nip_suami_istri,
			@p19 AS sk_cpns,
			@p20 AS tgl_sk_cpns,
			@p21 AS sk_angkat,
			@p22 AS tmt_sk_angkat,
			@p23 AS npwp,
			@p24 AS nm_wp,
			@p25 AS stat_data,
			@p26 AS akta_ijin_ajar,
			@p27 AS nira,
			@p28 AS jns_reg,
			@p29 AS kewarganegaraan,
			@p30 AS id_jns_sdm,
			@p31 AS id_wil,
			@p32 AS id_stat_aktif,
			@p33 AS id_agama,
			@p34 AS id_keahlian_lab,
			@p35 AS id_pekerjaan_suami_istri,
			@p36 AS id_lemb_angkat,
			@p37 AS id_sumber_gaji,
			@p38 AS jln,
			@p39 AS rt,
			@p40 AS rw,
			@p41 AS nm_dsn,
			@p42 AS ds_kel,
			@p43 AS kode_pos,
			@p44 AS create_date,
			@p45 AS id_creator,
			@p46 AS last_update,
			@p47 AS id_updater,
			@p48 AS soft_delete,
			@p49 AS last_sync
		) AS source
		ON target.id_sdm = source.id_sdm
		WHEN MATCHED THEN
			UPDATE SET
				nm_sdm = source.nm_sdm,
				jk = source.jk,
				tmpt_lahir = source.tmpt_lahir,
				tgl_lahir = source.tgl_lahir,
				nik = source.nik,
				niy_nigk = source.niy_nigk,
				nuptk = source.nuptk,
				nidn = source.nidn,
				nsdmi = source.nsdmi,
				stat_kawin = source.stat_kawin,
				no_tel_rmh = source.no_tel_rmh,
				no_hp = source.no_hp,
				email = source.email,
				nip = source.nip,
				tmt_pns = source.tmt_pns,
				nm_suami_istri = source.nm_suami_istri,
				nip_suami_istri = source.nip_suami_istri,
				sk_cpns = source.sk_cpns,
				tgl_sk_cpns = source.tgl_sk_cpns,
				sk_angkat = source.sk_angkat,
				tmt_sk_angkat = source.tmt_sk_angkat,
				npwp = source.npwp,
				nm_wp = source.nm_wp,
				stat_data = source.stat_data,
				akta_ijin_ajar = source.akta_ijin_ajar,
				nira = source.nira,
				jns_reg = source.jns_reg,
				kewarganegaraan = source.kewarganegaraan,
				id_jns_sdm = source.id_jns_sdm,
				id_wil = source.id_wil,
				id_stat_aktif = source.id_stat_aktif,
				id_agama = source.id_agama,
				id_keahlian_lab = source.id_keahlian_lab,
				id_pekerjaan_suami_istri = source.id_pekerjaan_suami_istri,
				id_lemb_angkat = source.id_lemb_angkat,
				id_sumber_gaji = source.id_sumber_gaji,
				jln = source.jln,
				rt = source.rt,
				rw = source.rw,
				nm_dsn = source.nm_dsn,
				ds_kel = source.ds_kel,
				kode_pos = source.kode_pos,
				last_update = source.last_update,
				id_updater = source.id_updater,
				last_sync = source.last_sync
		WHEN NOT MATCHED THEN
			INSERT (
				id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi,
				stat_kawin, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri,
				sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data,
				akta_ijin_ajar, nira, jns_reg, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif,
				id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, id_sumber_gaji,
				jln, rt, rw, nm_dsn, ds_kel, kode_pos, create_date, id_creator, last_update,
				id_updater, soft_delete, last_sync
			)
			VALUES (
				source.id_sdm, source.nm_sdm, source.jk, source.tmpt_lahir, source.tgl_lahir,
				source.nik, source.niy_nigk, source.nuptk, source.nidn, source.nsdmi,
				source.stat_kawin, source.no_tel_rmh, source.no_hp, source.email, source.nip,
				source.tmt_pns, source.nm_suami_istri, source.nip_suami_istri, source.sk_cpns,
				source.tgl_sk_cpns, source.sk_angkat, source.tmt_sk_angkat, source.npwp, source.nm_wp,
				source.stat_data, source.akta_ijin_ajar, source.nira, source.jns_reg,
				source.kewarganegaraan, source.id_jns_sdm, source.id_wil, source.id_stat_aktif,
				source.id_agama, source.id_keahlian_lab, source.id_pekerjaan_suami_istri,
				source.id_lemb_angkat, source.id_sumber_gaji, source.jln, source.rt, source.rw,
				source.nm_dsn, source.ds_kel, source.kode_pos, source.create_date, source.id_creator,
				source.last_update, source.id_updater, source.soft_delete, source.last_sync
			);
	`

	for _, dosen := range data {
		_, err = tx.Exec(query,
			dosen.IDSDM,            // @p1
			dosen.NamaSDM,          // @p2
			dosen.JK,               // @p3
			dosen.TempatLahir,      // @p4
			dosen.TanggalLahir,     // @p5
			dosen.NIK,              // @p6
			dosen.NIYIGK,           // @p7
			dosen.NUPTK,            // @p8
			dosen.NIDN,             // @p9
			dosen.NSDMI,            // @p10
			dosen.StatKawin,        // @p11
			dosen.NoTelRumah,       // @p12
			dosen.NoHP,             // @p13
			dosen.Email,            // @p14
			dosen.NIP,              // @p15
			dosen.TMTPNS,           // @p16
			dosen.NamaSuamiIstri,   // @p17
			dosen.NIPSuamiIstri,    // @p18
			dosen.SKCPNS,           // @p19
			dosen.TglSKCPNS,        // @p20
			dosen.SKAngkat,         // @p21
			dosen.TMTSKAngkat,      // @p22
			dosen.NPWP,             // @p23
			dosen.NmWP,             // @p24
			dosen.StatData,         // @p25
			dosen.AktaIjinAjar,     // @p26
			dosen.NIRA,             // @p27
			dosen.JnsReg,           // @p28
			dosen.Kewarganegaraan,  // @p29
			dosen.IDJenisSDM,       // @p30
			dosen.IDWilayah,        // @p31
			dosen.IDStatusAktif,    // @p32
			dosen.IDAgama,          // @p33
			dosen.IDKeahlianLab,    // @p34
			dosen.IDPekerjaanSuamiIstri, // @p35
			dosen.IDLembagaAngkat,  // @p36
			dosen.IDSumberGaji,     // @p37
			dosen.Jalan,            // @p38
			dosen.RT,               // @p39
			dosen.RW,               // @p40
			dosen.NamaDusun,        // @p41
			dosen.DesaKel,          // @p42
			dosen.KodePos,          // @p43
			dosen.CreateDate,       // @p44
			dosen.IDCreator,        // @p45
			dosen.LastUpdate,       // @p46
			dosen.IDUpdater,        // @p47
			dosen.SoftDelete,       // @p48
			dosen.LastSync,         // @p49
		)
		if err != nil {
			return fmt.Errorf("failed to upsert dosen %s: %w", dosen.IDSDM, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Successfully upserted %d dosen records", len(data))
	return nil
}
