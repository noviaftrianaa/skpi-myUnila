package sdm

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

type Repository interface {
	GetSDMList(ctx context.Context, params types.SDMParams) ([]SDM, int64, error)
	GetSDMDetail(ctx context.Context, params types.SDMDetailParams) ([]SDMDetail, int64, error)
	GetPenugasan(ctx context.Context, params types.RegPtkParams) ([]RegPtk, int64, error)
	GetRiwayatPendFormal(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatPendFormal, int64, error)
	GetRiwayatFungsional(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatFungsional, int64, error)
	GetRiwayatKepangkatan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatKepangkatan, int64, error)
	GetRiwayatTugasTambahan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatTugasTambahan, int64, error)
	GetRiwayatSertifikasi(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatSertifikasi, int64, error)

	// Batch 4
	GetKinerjaDosen(ctx context.Context, p types.KinerjaDosenParams) ([]KinerjaDosen, int64, error)
	GetRwyPekerjaan(ctx context.Context, p types.RwyPekerjaanParams) ([]RwyPekerjaan, int64, error)
	GetRwyStruktural(ctx context.Context, p types.RwyStrukturalParams) ([]RwyStruktural, int64, error)
	GetDiklat(ctx context.Context, p types.DiklatParams) ([]Diklat, int64, error)

	// Batch 6 — SDM specialized
	GetDetasering(ctx context.Context, p types.DetaseringParams) ([]Detasering, int64, error)
	GetVisitingScientist(ctx context.Context, p types.VisitingScientistParams) ([]VisitingScientist, int64, error)
	GetAnggotaOrgprof(ctx context.Context, p AnggotaOrgprofParams) ([]AnggotaOrgprof, int64, error)
	GetPenghargaan(ctx context.Context, p PenghargaanParams) ([]Penghargaan, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

// ---------------------------------------------------------------
// List SDM (ringkas, tanpa join ref)
// ---------------------------------------------------------------
func (r *repository) GetSDMList(ctx context.Context, p types.SDMParams) ([]SDM, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("sdm.id_sdm", p.IDSDM)
	cb.AppendInt("sdm.id_jns_sdm", p.IDJnsSDM)
	cb.AppendString("sdm.nidn", p.Nidn)
	cb.AppendString("sdm.nuptk", p.Nuptk)
	cb.AppendString("sdm.nip", p.Nip)
	cb.AppendString("sdm.jk", p.Jk)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "sdm.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.sdm sdm WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sdm.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT
			sdm.id_sdm, sdm.nm_sdm, sdm.jk, sdm.tmpt_lahir, sdm.tgl_lahir,
			sdm.nik, sdm.nuptk, sdm.nidn, sdm.nsdmi, sdm.nip, sdm.niy_nigk,
			sdm.email, sdm.no_hp, sdm.id_jns_sdm, sdm.id_stat_aktif,
			sdm.id_agama, sdm.id_wil, sdm.last_sync, sdm.soft_delete
		FROM pdrd.sdm sdm
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SDM
	for rows.Next() {
		var m SDM
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Detail SDM (join ref untuk FK+nama)
// ---------------------------------------------------------------
func (r *repository) GetSDMDetail(ctx context.Context, p types.SDMDetailParams) ([]SDMDetail, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("sdm.id_sdm", p.IDSDM)
	cb.AppendInt("sdm.id_jns_sdm", p.IDJnsSDM)
	cb.AppendString("sdm.nidn", p.Nidn)
	cb.AppendString("sdm.nuptk", p.Nuptk)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "sdm.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	baseJoin := `
		FROM pdrd.sdm sdm
		LEFT JOIN ref.jenis_sdm js ON js.id_jns_sdm = sdm.id_jns_sdm
		LEFT JOIN ref.status_keaktifan_pegawai sa ON sa.id_stat_aktif = sdm.id_stat_aktif
		LEFT JOIN ref.agama ag ON ag.id_agama = sdm.id_agama
		LEFT JOIN ref.wilayah wil ON wil.id_wil = sdm.id_wil
		LEFT JOIN ref.sumber_gaji sg ON sg.id_sumber_gaji = sdm.id_sumber_gaji`

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) "+baseJoin+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sdm.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT
			sdm.id_sdm, sdm.nm_sdm, sdm.jk, sdm.tmpt_lahir, sdm.tgl_lahir,
			sdm.nik, sdm.nuptk, sdm.nidn, sdm.nsdmi, sdm.nip, sdm.niy_nigk,
			sdm.npwp, sdm.nm_wp, sdm.stat_kawin,
			sdm.jln, sdm.rt, sdm.rw, sdm.nm_dsn, sdm.ds_kel, sdm.kode_pos,
			sdm.no_tel_rmh, sdm.no_hp, sdm.email,
			sdm.tmt_pns, sdm.sk_cpns, sdm.tgl_sk_cpns, sdm.sk_angkat, sdm.tmt_sk_angkat,
			sdm.kewarganegaraan,
			sdm.id_jns_sdm, ISNULL(js.nm_jns_sdm, '') AS nm_jns_sdm,
			sdm.id_stat_aktif, sa.nm_stat_aktif,
			sdm.id_agama, ag.nm_agama,
			sdm.id_wil, wil.nm_wil,
			sdm.id_sumber_gaji, sg.nm_sumber_gaji,
			sdm.last_sync
		%s
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		baseJoin, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SDMDetail
	for rows.Next() {
		var m SDMDetail
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Penugasan (reg_ptk)
// ---------------------------------------------------------------
func (r *repository) GetPenugasan(ctx context.Context, p types.RegPtkParams) ([]RegPtk, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("rp.id_reg_ptk", p.IDRegPtk)
	cb.AppendUUID("rp.id_sdm", p.IDSDM)
	cb.AppendUUID("rp.id_sp", p.IDSp)
	cb.AppendUUID("rp.id_sms", p.IDSms)
	cb.AppendString("rp.id_jns_keluar", p.IDJnsKeluar)
	cb.AppendInt("rp.id_stat_pegawai", p.IDStatPegawai)
	cb.AppendInt("rp.id_ikatan_kerja", p.IDIkatanKerja)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0")
	if p.OnlyAktif != nil && *p.OnlyAktif {
		conds = append(conds, "rp.id_jns_keluar IS NULL")
	}
	where := strings.Join(conds, " AND ")

	baseJoin := `
		FROM pdrd.reg_ptk rp
		INNER JOIN pdrd.sdm sdm ON sdm.id_sdm = rp.id_sdm
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = rp.id_sp
		LEFT JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
		LEFT JOIN ref.status_kepegawaian stp ON stp.id_stat_pegawai = rp.id_stat_pegawai
		LEFT JOIN ref.ikatan_kerja_sdm ik ON ik.id_ikatan_kerja = rp.id_ikatan_kerja
		LEFT JOIN ref.jenis_keluar jk ON jk.id_jns_keluar = rp.id_jns_keluar`

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) "+baseJoin+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sdm.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT
			rp.id_reg_ptk,
			rp.id_sdm, sdm.nm_sdm,
			rp.nidn,
			rp.id_sp, sp.nm_lemb AS nm_sp,
			rp.id_sms, sms.nm_lemb AS nm_sms,
			rp.id_stat_pegawai, stp.nm_stat_pegawai,
			rp.id_ikatan_kerja, ik.nm_ikatan_kerja,
			rp.id_jns_keluar, jk.ket_keluar AS nm_jns_keluar,
			rp.no_srt_tgs, rp.tgl_srt_tgs, rp.tmt_srt_tgs,
			rp.tgl_ptk_keluar, rp.jns_reg, rp.last_sync
		%s
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		baseJoin, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPtk
	for rows.Next() {
		var m RegPtk
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Riwayat: Pendidikan Formal
// ---------------------------------------------------------------
func (r *repository) GetRiwayatPendFormal(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatPendFormal, int64, error) {
	p.NormalizePagination()
	args := []interface{}{p.IDSDM}
	where := "r.soft_delete = 0 AND r.id_sdm = @p1"

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.rwy_pend_formal r WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT TOP (%d)
			r.id_rwy_pend_formal, r.id_sdm,
			r.id_jenj_didik, jp.nm_jenj_didik,
			r.id_bid_studi, bs.nm_bid_studi,
			r.id_gelar_akad, ga.nm_gelar_akad,
			r.nm_sp_formal, r.fak, r.a_kependidikan,
			r.thn_masuk, r.thn_lulus, r.nipd, r.ipk, r.sks_lulus,
			r.no_ijazah, r.judul_tesis, r.tgl_lulus
		FROM pdrd.rwy_pend_formal r
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = r.id_jenj_didik
		LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = r.id_bid_studi
		LEFT JOIN ref.gelar_akademik ga ON ga.id_gelar_akad = r.id_gelar_akad
		WHERE %s
		ORDER BY r.thn_lulus DESC`, p.Limit, where)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RiwayatPendFormal
	for rows.Next() {
		var m RiwayatPendFormal
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Riwayat: Fungsional
// ---------------------------------------------------------------
func (r *repository) GetRiwayatFungsional(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatFungsional, int64, error) {
	p.NormalizePagination()
	args := []interface{}{p.IDSDM}
	where := "r.soft_delete = 0 AND r.id_sdm = @p1"

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.rwy_fungsional r WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT TOP (%d)
			r.id_rwy_jabfung, r.id_sdm,
			r.id_jabfung, jf.nm_jabfung,
			r.id_kel_bidang, kb.nm_kel_bidang,
			r.sk_jabfung, r.tmt_sk_jabfung, r.angka_kredit, r.bidang_ilmu
		FROM pdrd.rwy_fungsional r
		LEFT JOIN ref.jabfung jf ON jf.id_jabfung = r.id_jabfung
		LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = r.id_kel_bidang
		WHERE %s
		ORDER BY r.tmt_sk_jabfung DESC`, p.Limit, where)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RiwayatFungsional
	for rows.Next() {
		var m RiwayatFungsional
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Riwayat: Kepangkatan
// ---------------------------------------------------------------
func (r *repository) GetRiwayatKepangkatan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatKepangkatan, int64, error) {
	p.NormalizePagination()
	args := []interface{}{p.IDSDM}
	where := "r.soft_delete = 0 AND r.id_sdm = @p1"

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.rwy_kepangkatan r WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT TOP (%d)
			r.id_rwy_pangkat, r.id_sdm,
			r.id_pangkat_gol, pg.nm_pangkat AS nm_pangkat_gol,
			r.sk_pangkat, r.tgl_sk_pangkat, r.tmt_sk_pangkat,
			r.masa_kerja_gol_thn, r.masa_kerja_gol_bln
		FROM pdrd.rwy_kepangkatan r
		LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = r.id_pangkat_gol
		WHERE %s
		ORDER BY r.tmt_sk_pangkat DESC`, p.Limit, where)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RiwayatKepangkatan
	for rows.Next() {
		var m RiwayatKepangkatan
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Riwayat: Tugas Tambahan (tabel pdrd.tugas_tambahan, tanpa prefix rwy_)
// ---------------------------------------------------------------
func (r *repository) GetRiwayatTugasTambahan(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatTugasTambahan, int64, error) {
	p.NormalizePagination()
	args := []interface{}{p.IDSDM}
	where := "r.soft_delete = 0 AND r.id_sdm = @p1"

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.tugas_tambahan r WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT TOP (%d)
			r.id_tgs_tambah, r.id_sdm,
			r.id_jab_tgs, jt.nm_jab_tgs,
			r.id_sp, sp.nm_lemb AS nm_sp,
			r.id_sms, sms.nm_lemb AS nm_sms,
			r.jml_jam, r.sk_tugas_tambah, r.tmt_sk_tambah, r.tst_sk_tambah
		FROM pdrd.tugas_tambahan r
		LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = r.id_jab_tgs
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = r.id_sp
		LEFT JOIN pdrd.sms sms ON sms.id_sms = r.id_sms
		WHERE %s
		ORDER BY r.tmt_sk_tambah DESC`, p.Limit, where)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RiwayatTugasTambahan
	for rows.Next() {
		var m RiwayatTugasTambahan
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------------------------------------------------------------
// Riwayat: Sertifikasi
// ---------------------------------------------------------------
func (r *repository) GetRiwayatSertifikasi(ctx context.Context, p types.RiwayatSDMParams) ([]RiwayatSertifikasi, int64, error) {
	p.NormalizePagination()
	args := []interface{}{p.IDSDM}
	where := "r.soft_delete = 0 AND r.id_sdm = @p1"

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.rwy_sertifikasi r WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT TOP (%d)
			r.id_rwy_sert, r.id_sdm,
			r.id_jns_sert, jns.nm_jns_sert,
			r.id_bid_studi, bs.nm_bid_studi,
			r.id_lemb_sert, ls.nm_lemb_sert,
			r.thn_sert, r.sk_sert, r.nrg, r.no_peserta, r.tmt_sert, r.tst_sert
		FROM pdrd.rwy_sertifikasi r
		LEFT JOIN ref.jenis_sert jns ON jns.id_jns_sert = r.id_jns_sert
		LEFT JOIN ref.bidang_studi bs ON bs.id_bid_studi = r.id_bid_studi
		LEFT JOIN ref.lembaga_sertifikasi ls ON ls.id_lemb_sert = r.id_lemb_sert
		WHERE %s
		ORDER BY r.thn_sert DESC`, p.Limit, where)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RiwayatSertifikasi
	for rows.Next() {
		var m RiwayatSertifikasi
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}
