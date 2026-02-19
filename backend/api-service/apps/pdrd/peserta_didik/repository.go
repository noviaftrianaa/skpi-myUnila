package pesertadidik

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
	pdrdtypes "github.com/myunila/api-service/apps/pdrd/types"
	internaltypes "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// KuliahMhs adalah struct untuk data semester keaktifan (pdrd.kuliah_mhs)
type KuliahMhs struct {
	IDRegPd      utils.UUID                  `db:"id_reg_pd"     json:"id_reg_pd"`
	IDSmt        string                      `db:"id_smt"        json:"id_smt"`
	IDPembiayaan *int                        `db:"id_pembiayaan" json:"id_pembiayaan"`
	IDStatMhs    *string                     `db:"id_stat_mhs"   json:"id_stat_mhs"`
	Ips          *float64                    `db:"ips"           json:"ips"`
	SksSemester  *float64                    `db:"sks_semester"  json:"sks_semester"`
	Ipk          *float64                    `db:"ipk"           json:"ipk"`
	TotalSks     *float64                    `db:"total_sks"     json:"total_sks"`
	BiayaSmt     *float64                    `db:"biaya_smt"     json:"biaya_smt"`
	CreateDate   internaltypes.SQLServerTime `db:"create_date"   json:"waktu_ditambahkan"`
	LastUpdate   internaltypes.SQLServerTime `db:"last_update"   json:"terakhir_diubah"`
}

// Repository adalah interface untuk akses data mahasiswa/peserta didik
type Repository interface {
	GetPesertaDidik(ctx context.Context, params pdrdtypes.PaginationParams) ([]PesertaDidik, int64, error)
	GetListMahasiswaByRegis(ctx context.Context, params pdrdtypes.ListRegisMahasiswaParams) ([]RegPd, int64, error)
	GetListMahasiswaByStatus(ctx context.Context, params pdrdtypes.ListStatusMahasiswaParams) ([]RegPd, int64, error)
	GetSemesterKeaktifan(ctx context.Context, params pdrdtypes.SemesterKeaktifanParams) ([]KuliahMhs, error)
	GetDetailMahasiswa(ctx context.Context, params pdrdtypes.DetailMahasiswaParams) (*PesertaDidik, error)
	GetListAlumni(ctx context.Context, params pdrdtypes.ListAlumniParams) ([]RegPd, int64, error)
	GetMahasiswaLuarPT(ctx context.Context, params pdrdtypes.LuarPTParams) ([]RegPd, int64, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository membuat instance repository baru
func NewRepository(DB *sqlx.DB) Repository {
	return &repository{db: DB}
}

// ============================================================================
// GetPesertaDidik - Dapatkan daftar peserta didik dari pdrd.peserta_didik
// ============================================================================
func (r *repository) GetPesertaDidik(
	ctx context.Context,
	params pdrdtypes.PaginationParams,
) ([]PesertaDidik, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "pd.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM pdrd.peserta_didik pd WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "pd.nm_pd"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT
			pd.id_pd, pd.nm_pd, pd.jk, pd.nisn, pd.nik,
			pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw,
			pd.nm_dsn, pd.ds_kel, pd.kode_pos, pd.tlpn_rumah, pd.tlpn_hp, pd.email,
			pd.a_pmpap, pd.a_bidikmisi, pd.a_bebas_biaya,
			pd.nm_wali, pd.tgl_lahir_wali, pd.id_pendidikan_wali, pd.id_pekerjaan_wali, pd.id_penghasilan_wali,
			pd.nm_ayah, pd.tgl_lahir_ayah, pd.nik_ayah, pd.id_pendidikan_ayah, pd.id_pekerjaan_ayah, pd.id_penghasilan_ayah, pd.id_kk_ayah,
			pd.nm_ibu_kandung, pd.tgl_lahir_ibu, pd.nik_ibu, pd.id_pendidikan_ibu, pd.id_pekerjaan_ibu, pd.id_penghasilan_ibu, pd.id_kk_ibu,
			pd.a_terima_kps, pd.no_kps, pd.id_kk,
			pd.id_kewarganegaraan, pd.id_agama, pd.id_blob,
			pd.id_jns_tinggal, pd.id_stat_mhs, pd.id_alat_transport, pd.id_wil,
			pd.create_date, pd.id_creator, pd.last_update, pd.id_updater, pd.soft_delete, pd.last_sync
		FROM pdrd.peserta_didik pd
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)
	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PesertaDidik
	for rows.Next() {
		var m PesertaDidik
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// GetListMahasiswaByRegis - Daftar reg_pd berdasarkan jenis pendaftaran
// ============================================================================
func (r *repository) GetListMahasiswaByRegis(
	ctx context.Context,
	params pdrdtypes.ListRegisMahasiswaParams,
) ([]RegPd, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendInt("rp.id_jns_daftar", params.IDJnsDaftar)
	cb.AppendUUID("rp.id_sp", params.IDProdi)
	if params.TahunMasuk != nil {
		cb.AppendYear("rp.tgl_masuk_sp", params.TahunMasuk)
	}
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0", "pd.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "rp.tgl_masuk_sp"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "DESC"
	}

	query := fmt.Sprintf(`
		SELECT
			rp.id_reg_pd, rp.id_sp, rp.id_sms, rp.id_pd,
			rp.id_jns_daftar, rp.id_jalur_daftar, rp.id_pembiayaan, rp.id_smt,
			rp.tgl_masuk_sp, rp.nipd, rp.id_semester_masuk,
			rp.id_pt_asal, rp.nm_pt_asal, rp.id_prodi_asal, rp.nm_prodi_asal,
			rp.id_jns_keluar, rp.tgl_keluar, rp.ket, rp.skhun,
			rp.no_peserta_ujian, rp.no_seri_ijazah, rp.asal_data_ijazah,
			rp.bidang_mayor, rp.bidang_minor, rp.sks_diakui,
			rp.jalur_skripsi, rp.judul_skripsi,
			rp.bln_awal_bimbingan, rp.bln_akhir_bimbingan,
			rp.sk_yudisium, rp.tgl_sk_yudisium, rp.ipk, rp.sert_prof,
			rp.a_pindah_mhs_asing, rp.biaya_masuk_kuliah,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)
	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPd
	for rows.Next() {
		var m RegPd
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// GetListMahasiswaByStatus - Daftar reg_pd berdasarkan status mahasiswa
// ============================================================================
func (r *repository) GetListMahasiswaByStatus(
	ctx context.Context,
	params pdrdtypes.ListStatusMahasiswaParams,
) ([]RegPd, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendString("km.id_stat_mhs", params.IDStatMhs)
	cb.AppendUUID("rp.id_sp", params.IDProdi)
	cb.AppendString("km.id_smt", params.IDSmt)
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0", "pd.soft_delete = 0", "km.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`
		SELECT COUNT(DISTINCT rp.id_reg_pd)
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		INNER JOIN pdrd.kuliah_mhs km ON rp.id_reg_pd = km.id_reg_pd
		WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "pd.nm_pd"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT DISTINCT
			rp.id_reg_pd, rp.id_sp, rp.id_sms, rp.id_pd,
			rp.id_jns_daftar, rp.id_jalur_daftar, rp.id_pembiayaan, rp.id_smt,
			rp.tgl_masuk_sp, rp.nipd, rp.id_semester_masuk,
			rp.id_pt_asal, rp.nm_pt_asal, rp.id_prodi_asal, rp.nm_prodi_asal,
			rp.id_jns_keluar, rp.tgl_keluar, rp.ket, rp.skhun,
			rp.no_peserta_ujian, rp.no_seri_ijazah, rp.asal_data_ijazah,
			rp.bidang_mayor, rp.bidang_minor, rp.sks_diakui,
			rp.jalur_skripsi, rp.judul_skripsi,
			rp.bln_awal_bimbingan, rp.bln_akhir_bimbingan,
			rp.sk_yudisium, rp.tgl_sk_yudisium, rp.ipk, rp.sert_prof,
			rp.a_pindah_mhs_asing, rp.biaya_masuk_kuliah,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		INNER JOIN pdrd.kuliah_mhs km ON rp.id_reg_pd = km.id_reg_pd
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)
	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPd
	for rows.Next() {
		var m RegPd
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// GetSemesterKeaktifan - Daftar semester keaktifan mahasiswa
// ============================================================================
func (r *repository) GetSemesterKeaktifan(
	ctx context.Context,
	params pdrdtypes.SemesterKeaktifanParams,
) ([]KuliahMhs, error) {

	query := `
		SELECT
			km.id_reg_pd, km.id_smt, km.id_pembiayaan, km.id_stat_mhs,
			km.ips, km.sks_semester, km.ipk, km.total_sks, km.biaya_smt,
			km.create_date, km.last_update
		FROM pdrd.kuliah_mhs km
		WHERE km.id_reg_pd = @p1 AND km.soft_delete = 0
		ORDER BY km.id_smt DESC`

	rows, err := r.db.QueryxContext(ctx, query, params.IDRegPd)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []KuliahMhs
	for rows.Next() {
		var km KuliahMhs
		if err := rows.StructScan(&km); err != nil {
			return nil, err
		}
		result = append(result, km)
	}
	return result, rows.Err()
}

// ============================================================================
// GetDetailMahasiswa - Detail profil peserta didik
// ============================================================================
func (r *repository) GetDetailMahasiswa(
	ctx context.Context,
	params pdrdtypes.DetailMahasiswaParams,
) (*PesertaDidik, error) {

	// Build manual WHERE dengan OR-like
	var conds []string
	var args []interface{}
	paramIdx := 1

	if params.IDPd != nil {
		conds = append(conds, fmt.Sprintf("pd.id_pd = @p%d", paramIdx))
		args = append(args, *params.IDPd)
		paramIdx++
	}
	if params.IDRegPd != nil {
		conds = append(conds, fmt.Sprintf("rp.id_reg_pd = @p%d", paramIdx))
		args = append(args, *params.IDRegPd)
		paramIdx++
	}
	if params.NIPD != nil {
		conds = append(conds, fmt.Sprintf("rp.nipd = @p%d", paramIdx))
		args = append(args, *params.NIPD)
		paramIdx++
	}

	if len(conds) == 0 {
		return nil, fmt.Errorf("at least one parameter (id_pd, id_reg_pd, or nipd) is required")
	}

	whereClause := "(" + strings.Join(conds, " OR ") + ") AND pd.soft_delete = 0"

	query := fmt.Sprintf(`
		SELECT TOP 1
			pd.id_pd, pd.nm_pd, pd.jk, pd.nisn, pd.nik,
			pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw,
			pd.nm_dsn, pd.ds_kel, pd.kode_pos, pd.tlpn_rumah, pd.tlpn_hp, pd.email,
			pd.a_pmpap, pd.a_bidikmisi, pd.a_bebas_biaya,
			pd.nm_wali, pd.tgl_lahir_wali, pd.id_pendidikan_wali, pd.id_pekerjaan_wali, pd.id_penghasilan_wali,
			pd.nm_ayah, pd.tgl_lahir_ayah, pd.nik_ayah, pd.id_pendidikan_ayah, pd.id_pekerjaan_ayah, pd.id_penghasilan_ayah, pd.id_kk_ayah,
			pd.nm_ibu_kandung, pd.tgl_lahir_ibu, pd.nik_ibu, pd.id_pendidikan_ibu, pd.id_pekerjaan_ibu, pd.id_penghasilan_ibu, pd.id_kk_ibu,
			pd.a_terima_kps, pd.no_kps, pd.id_kk,
			pd.id_kewarganegaraan, pd.id_agama, pd.id_blob,
			pd.id_jns_tinggal, pd.id_stat_mhs, pd.id_alat_transport, pd.id_wil,
			pd.create_date, pd.id_creator, pd.last_update, pd.id_updater, pd.soft_delete, pd.last_sync
		FROM pdrd.peserta_didik pd
		LEFT JOIN pdrd.reg_pd rp ON pd.id_pd = rp.id_pd
		WHERE %s`, whereClause)

	var detail PesertaDidik
	if err := r.db.QueryRowxContext(ctx, query, args...).StructScan(&detail); err != nil {
		return nil, err
	}
	return &detail, nil
}

// ============================================================================
// GetListAlumni - Daftar alumni (id_jns_keluar = '1' / Lulus)
// ============================================================================
func (r *repository) GetListAlumni(
	ctx context.Context,
	params pdrdtypes.ListAlumniParams,
) ([]RegPd, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("rp.id_sp", params.IDProdi)
	if params.TahunLulus != nil {
		cb.AppendYear("rp.tgl_keluar", params.TahunLulus)
	}
	if params.Bulan != nil {
		cb.AppendMonth("rp.tgl_keluar", params.Bulan)
	}
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0", "pd.soft_delete = 0", "rp.id_jns_keluar = '1'")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "rp.tgl_keluar"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "DESC"
	}

	query := fmt.Sprintf(`
		SELECT
			rp.id_reg_pd, rp.id_sp, rp.id_sms, rp.id_pd,
			rp.id_jns_daftar, rp.id_jalur_daftar, rp.id_pembiayaan, rp.id_smt,
			rp.tgl_masuk_sp, rp.nipd, rp.id_semester_masuk,
			rp.id_pt_asal, rp.nm_pt_asal, rp.id_prodi_asal, rp.nm_prodi_asal,
			rp.id_jns_keluar, rp.tgl_keluar, rp.ket, rp.skhun,
			rp.no_peserta_ujian, rp.no_seri_ijazah, rp.asal_data_ijazah,
			rp.bidang_mayor, rp.bidang_minor, rp.sks_diakui,
			rp.jalur_skripsi, rp.judul_skripsi,
			rp.bln_awal_bimbingan, rp.bln_akhir_bimbingan,
			rp.sk_yudisium, rp.tgl_sk_yudisium, rp.ipk, rp.sert_prof,
			rp.a_pindah_mhs_asing, rp.biaya_masuk_kuliah,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)
	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPd
	for rows.Next() {
		var m RegPd
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// GetMahasiswaLuarPT - Daftar mahasiswa luar PT (MBKM a_diluar_pt = 1)
// ============================================================================
func (r *repository) GetMahasiswaLuarPT(
	ctx context.Context,
	params pdrdtypes.LuarPTParams,
) ([]RegPd, int64, error) {

	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("rp.id_sp", params.IDProdi)
	cb.AppendUUID("dkm.id_periode_mbkm", params.IDPeriodeMbkm)
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0", "pd.soft_delete = 0", "dkm.soft_delete = 0", "dkm.a_diluar_pt = 1")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		INNER JOIN mbkm.daftar_kampus_merdeka dkm ON rp.id_reg_pd = dkm.id_reg_pd
		WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "pd.nm_pd"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT
			rp.id_reg_pd, rp.id_sp, rp.id_sms, rp.id_pd,
			rp.id_jns_daftar, rp.id_jalur_daftar, rp.id_pembiayaan, rp.id_smt,
			rp.tgl_masuk_sp, rp.nipd, rp.id_semester_masuk,
			rp.id_pt_asal, rp.nm_pt_asal, rp.id_prodi_asal, rp.nm_prodi_asal,
			rp.id_jns_keluar, rp.tgl_keluar, rp.ket, rp.skhun,
			rp.no_peserta_ujian, rp.no_seri_ijazah, rp.asal_data_ijazah,
			rp.bidang_mayor, rp.bidang_minor, rp.sks_diakui,
			rp.jalur_skripsi, rp.judul_skripsi,
			rp.bln_awal_bimbingan, rp.bln_akhir_bimbingan,
			rp.sk_yudisium, rp.tgl_sk_yudisium, rp.ipk, rp.sert_prof,
			rp.a_pindah_mhs_asing, rp.biaya_masuk_kuliah,
			rp.create_date, rp.id_creator, rp.last_update, rp.id_updater, rp.soft_delete, rp.last_sync
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
		INNER JOIN mbkm.daftar_kampus_merdeka dkm ON rp.id_reg_pd = dkm.id_reg_pd
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)
	args = append(args, params.Offset(), params.Limit)

	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPd
	for rows.Next() {
		var m RegPd
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}
