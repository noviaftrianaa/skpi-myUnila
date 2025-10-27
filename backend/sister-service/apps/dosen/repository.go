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

// BulkUpsertDosen performs bulk upsert of dosen data
func (r *repository) BulkUpsertDosen(data []*Dosen) error {
	ctx := context.Background()
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		MERGE sdm.dosen AS target
		USING (SELECT
			@p1 AS id_sdm,
			@p2 AS nm_sdm,
			@p3 AS jns_kelamin,
			@p4 AS tmpt_lahir,
			@p5 AS tgl_lahir,
			@p6 AS id_jns_sdm,
			@p7 AS nik,
			@p8 AS nidn,
			@p9 AS nip,
			@p10 AS nuptk,
			@p11 AS id_agama,
			@p12 AS id_stat_aktif,
			@p13 AS kewarganegaraan,
			@p14 AS stat_kawin,
			@p15 AS nm_pasangan,
			@p16 AS nip_pasangan,
			@p17 AS tgl_nikah,
			@p18 AS pekerjaan_psgn,
			@p19 AS jalan,
			@p20 AS rt,
			@p21 AS rw,
			@p22 AS dusun,
			@p23 AS ds_kel,
			@p24 AS kode_pos,
			@p25 AS id_wil,
			@p26 AS telepon,
			@p27 AS handphone,
			@p28 AS email,
			@p29 AS id_lemb_angkat,
			@p30 AS nipy,
			@p31 AS tgl_msk_pegawai,
			@p32 AS tgl_klr_pegawai,
			@p33 AS tgl_cpns,
			@p34 AS no_sk_cpns,
			@p35 AS tgl_sk_cpns,
			@p36 AS tgl_diangkat,
			@p37 AS no_sk_pengangkatan,
			@p38 AS npwp
		) AS source
		ON target.id_sdm = source.id_sdm
		WHEN MATCHED THEN
			UPDATE SET
				nm_sdm = source.nm_sdm,
				jns_kelamin = source.jns_kelamin,
				tmpt_lahir = source.tmpt_lahir,
				tgl_lahir = source.tgl_lahir,
				id_jns_sdm = source.id_jns_sdm,
				nik = source.nik,
				nidn = source.nidn,
				nip = source.nip,
				nuptk = source.nuptk,
				id_agama = source.id_agama,
				id_stat_aktif = source.id_stat_aktif,
				kewarganegaraan = source.kewarganegaraan,
				stat_kawin = source.stat_kawin,
				nm_pasangan = source.nm_pasangan,
				nip_pasangan = source.nip_pasangan,
				tgl_nikah = source.tgl_nikah,
				pekerjaan_psgn = source.pekerjaan_psgn,
				jalan = source.jalan,
				rt = source.rt,
				rw = source.rw,
				dusun = source.dusun,
				ds_kel = source.ds_kel,
				kode_pos = source.kode_pos,
				id_wil = source.id_wil,
				telepon = source.telepon,
				handphone = source.handphone,
				email = source.email,
				id_lemb_angkat = source.id_lemb_angkat,
				nipy = source.nipy,
				tgl_msk_pegawai = source.tgl_msk_pegawai,
				tgl_klr_pegawai = source.tgl_klr_pegawai,
				tgl_cpns = source.tgl_cpns,
				no_sk_cpns = source.no_sk_cpns,
				tgl_sk_cpns = source.tgl_sk_cpns,
				tgl_diangkat = source.tgl_diangkat,
				no_sk_pengangkatan = source.no_sk_pengangkatan,
				npwp = source.npwp,
				last_update = DATEADD(HOUR, 7, GETUTCDATE()),
				last_sync = DATEADD(HOUR, 7, GETUTCDATE())
		WHEN NOT MATCHED THEN
			INSERT (
				id_sdm, nm_sdm, jns_kelamin, tmpt_lahir, tgl_lahir, id_jns_sdm,
				nik, nidn, nip, nuptk, id_agama, id_stat_aktif, kewarganegaraan,
				stat_kawin, nm_pasangan, nip_pasangan, tgl_nikah, pekerjaan_psgn,
				jalan, rt, rw, dusun, ds_kel, kode_pos, id_wil, telepon, handphone,
				email, id_lemb_angkat, nipy, tgl_msk_pegawai, tgl_klr_pegawai,
				tgl_cpns, no_sk_cpns, tgl_sk_cpns, tgl_diangkat, no_sk_pengangkatan,
				npwp, create_date, last_update, last_sync
			)
			VALUES (
				source.id_sdm, source.nm_sdm, source.jns_kelamin, source.tmpt_lahir,
				source.tgl_lahir, source.id_jns_sdm, source.nik, source.nidn, source.nip,
				source.nuptk, source.id_agama, source.id_stat_aktif, source.kewarganegaraan,
				source.stat_kawin, source.nm_pasangan, source.nip_pasangan, source.tgl_nikah,
				source.pekerjaan_psgn, source.jalan, source.rt, source.rw, source.dusun,
				source.ds_kel, source.kode_pos, source.id_wil, source.telepon, source.handphone,
				source.email, source.id_lemb_angkat, source.nipy, source.tgl_msk_pegawai,
				source.tgl_klr_pegawai, source.tgl_cpns, source.no_sk_cpns, source.tgl_sk_cpns,
				source.tgl_diangkat, source.no_sk_pengangkatan, source.npwp,
				DATEADD(HOUR, 7, GETUTCDATE()), DATEADD(HOUR, 7, GETUTCDATE()),
				DATEADD(HOUR, 7, GETUTCDATE())
			);
	`

	for _, dosen := range data {
		_, err = tx.Exec(query,
			dosen.IDSDM,
			dosen.NamaSDM,
			dosen.JenisKelamin,
			dosen.TempatLahir,
			dosen.TanggalLahir,
			dosen.IDJenisSDM,
			dosen.NIK,
			dosen.NIDN,
			dosen.NIP,
			dosen.NUPTK,
			dosen.IDAgama,
			dosen.IDStatusAktif,
			dosen.Kewarganegaraan,
			dosen.StatusKawin,
			dosen.NamaPasangan,
			dosen.NIPPasangan,
			dosen.TanggalNikah,
			dosen.PekerjaanPsgn,
			dosen.Alamat,
			dosen.RT,
			dosen.RW,
			dosen.Dusun,
			dosen.DesaKelurahan,
			dosen.KodePos,
			dosen.IDWilayah,
			dosen.Telepon,
			dosen.Handphone,
			dosen.Email,
			dosen.IDLembagaPengangkat,
			dosen.NIPY,
			dosen.TanggalMasuk,
			dosen.TanggalKeluar,
			dosen.TanggalCPNS,
			dosen.NomorSKCPNS,
			dosen.TanggalSKCPNS,
			dosen.TanggalPengangkatan,
			dosen.NomorSKPengangkatan,
			dosen.NPWP,
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
