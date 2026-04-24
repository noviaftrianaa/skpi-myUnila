package pesertadidik

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

// Repository adalah interface untuk akses data mahasiswa/peserta didik
type Repository interface {
	GetPesertaDidik(ctx context.Context, params types.PaginationParams) ([]PesertaDidik, int64, error)
	GetPesertaDidikDetail(ctx context.Context, params types.PesertaDidikDetailParams) ([]PesertaDidikDetail, int64, error)
	GetRegPd(ctx context.Context, params types.RegPdParams) ([]RegPd, int64, error)
	GetStatusKuliahMahasiswa(ctx context.Context, params types.StatusKuliahMahasiswaParams) ([]StatusKuliahMahasiswa, int64, error)

	// Batch 2: Nilai & Aktivitas
	GetNilaiSmtMhs(ctx context.Context, p types.NilaiSmtParams) ([]NilaiSmtMhs, int64, error)
	GetNilaiTranskrip(ctx context.Context, p types.NilaiTranskripParams) ([]NilaiTranskrip, int64, error)
	GetKehadiranMhs(ctx context.Context, p types.KehadiranMhsParams) ([]KehadiranMhs, int64, error)
	GetAktMhs(ctx context.Context, p types.AktMhsParams) ([]AktMhs, int64, error)

	// Batch 3: Bimbingan & Uji
	GetBimbingMhs(ctx context.Context, p types.BimbingMhsParams) ([]BimbingMhs, int64, error)
	GetUjiMhs(ctx context.Context, p types.UjiMhsParams) ([]UjiMhs, int64, error)

	// Batch 9b: pivot tables
	GetAnggotaAktMhs(ctx context.Context, p AnggotaAktMhsParams) ([]AnggotaAktMhs, int64, error)
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
	params types.PaginationParams,
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
// GetPesertaDidikDetail - Dapatkan peserta didik dengan join lookup tables
// ============================================================================
func (r *repository) GetPesertaDidikDetail(
	ctx context.Context,
	params types.PesertaDidikDetailParams,
) ([]PesertaDidikDetail, int64, error) {

	params.NormalizePagination()

	// ===== BUILD CONDITIONS =====
	cb := helper.NewCondBuilder()
	cb.AppendUUID("pd.id_pd", params.IDPd)
	cb.AppendString("pd.id_stat_mhs", params.IDStatMhs)
	cb.AppendString("pd.id_kewarganegaraan", params.IDKewarganegaraan)
	cb.AppendString("pd.id_wil", params.IDWil)
	cb.AppendString("pd.id_jns_tinggal", params.IDJnsTinggal)
	cb.AppendString("pd.id_alat_transport", params.IDAlatTransport)
	cb.AppendString("pd.id_agama", params.IDAgama)
	cb.AppendString("pd.id_kk", params.IDKk)
	cb.AppendString("pd.id_kk_ayah", params.IDKkAyah)
	cb.AppendString("pd.id_kk_ibu", params.IDKkIbu)
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "pd.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.peserta_didik pd
		LEFT JOIN ref.wilayah wil ON wil.id_wil = pd.id_wil
		LEFT JOIN ref.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
		LEFT JOIN ref.jenis_tinggal jt ON jt.id_jns_tinggal = pd.id_jns_tinggal
		LEFT JOIN ref.agama ag ON ag.id_agama = pd.id_agama
		LEFT JOIN ref.kebutuhan_khusus kk ON kk.id_kk = pd.id_kk
		LEFT JOIN ref.kebutuhan_khusus kk_ibu ON kk_ibu.id_kk = pd.id_kk_ibu
		LEFT JOIN ref.kebutuhan_khusus kk_ayah ON kk_ayah.id_kk = pd.id_kk_ayah
		LEFT JOIN ref.penghasilan ph_ayah ON ph_ayah.id_penghasilan = pd.id_penghasilan_ayah
		LEFT JOIN ref.penghasilan ph_ibu ON ph_ibu.id_penghasilan = pd.id_penghasilan_ibu
		LEFT JOIN ref.penghasilan ph_wali ON ph_wali.id_penghasilan = pd.id_penghasilan_wali
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== SORTING =====
	sortBy := "pd.nm_pd"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			pd.id_pd, pd.nm_pd, pd.jk, pd.nisn, pd.nik,
			pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw,
			pd.nm_dsn, pd.ds_kel, pd.kode_pos, pd.tlpn_rumah, pd.tlpn_hp, pd.email,
			pd.a_pmpap, pd.a_bidikmisi, pd.a_bebas_biaya,
			pd.nm_wali, pd.tgl_lahir_wali, pd.id_pendidikan_wali, pd.id_pekerjaan_wali, pd.id_penghasilan_wali,
			ph_wali.nm_penghasilan AS nm_penghasilan_wali,
			pd.nm_ayah, pd.tgl_lahir_ayah, pd.nik_ayah, pd.id_pendidikan_ayah, pd.id_pekerjaan_ayah, pd.id_penghasilan_ayah,
			ph_ayah.nm_penghasilan AS nm_penghasilan_ayah,
			pd.id_kk_ayah,
			kk_ayah.nm_kk AS nm_kk_ayah,
			pd.nm_ibu_kandung, pd.tgl_lahir_ibu, pd.nik_ibu, pd.id_pendidikan_ibu, pd.id_pekerjaan_ibu, pd.id_penghasilan_ibu,
			ph_ibu.nm_penghasilan AS nm_penghasilan_ibu,
			pd.id_kk_ibu,
			kk_ibu.nm_kk AS nm_kk_ibu,
			pd.a_terima_kps, pd.no_kps, pd.id_kk,
			kk.nm_kk AS nm_kk,
			pd.id_kewarganegaraan, pd.id_agama,
			ag.nm_agama,
			pd.id_blob, pd.id_jns_tinggal,
			jt.nm_jns_tinggal,
			pd.id_stat_mhs,
			sm.nm_stat_mhs,
			pd.id_alat_transport, pd.id_wil,
			wil.nm_wil,
			pd.create_date, pd.id_creator, pd.last_update, pd.id_updater, pd.soft_delete, pd.last_sync
		FROM pdrd.peserta_didik pd
		LEFT JOIN ref.wilayah wil ON wil.id_wil = pd.id_wil
		LEFT JOIN ref.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
		LEFT JOIN ref.jenis_tinggal jt ON jt.id_jns_tinggal = pd.id_jns_tinggal
		LEFT JOIN ref.agama ag ON ag.id_agama = pd.id_agama
		LEFT JOIN ref.kebutuhan_khusus kk ON kk.id_kk = pd.id_kk
		LEFT JOIN ref.kebutuhan_khusus kk_ibu ON kk_ibu.id_kk = pd.id_kk_ibu
		LEFT JOIN ref.kebutuhan_khusus kk_ayah ON kk_ayah.id_kk = pd.id_kk_ayah
		LEFT JOIN ref.penghasilan ph_ayah ON ph_ayah.id_penghasilan = pd.id_penghasilan_ayah
		LEFT JOIN ref.penghasilan ph_ibu ON ph_ibu.id_penghasilan = pd.id_penghasilan_ibu
		LEFT JOIN ref.penghasilan ph_wali ON ph_wali.id_penghasilan = pd.id_penghasilan_wali
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PesertaDidikDetail
	for rows.Next() {
		var m PesertaDidikDetail
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

// ============================================================================
// GetRegPd - Dapatkan data reg_pd dengan join ke lookup tables
// ============================================================================
func (r *repository) GetRegPd(
	ctx context.Context,
	params types.RegPdParams,
) ([]RegPd, int64, error) {

	params.NormalizePagination()

	// ===== BUILD CONDITIONS =====
	cb := helper.NewCondBuilder()
	cb.AppendUUID("rp.id_reg_pd", strPtr(params.IDRegPd))
	cb.AppendUUID("rp.id_sp", params.IDSP)
	cb.AppendUUID("rp.id_sms", params.IDSms)
	cb.AppendUUID("rp.id_pd", params.IDPd)
	cb.AppendInt("rp.id_jns_daftar", params.IDJnsDaftar)
	cb.AppendInt("rp.id_jalur_daftar", params.IDJalurDaftar)
	cb.AppendInt("rp.id_pembiayaan", params.IDPembiayaan)
	cb.AppendInt("rp.id_smt", params.IDSmt)
	cb.AppendUUID("rp.id_pt_asal", params.IDPtAsal)
	cb.AppendUUID("rp.id_prodi_asal", params.IDProdiAsal)
	cb.AppendString("rp.id_jns_keluar", params.IDJnsKeluar)
	cb.Like("pd.nm_pd", params.Search)

	conds, args := cb.Build()
	conds = append(conds, "rp.soft_delete = 0", "pd.soft_delete = 0")

	whereClause := strings.Join(conds, " AND ")

	// ===== COUNT QUERY (JOIN WAJIB SAMA) =====
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM pdrd.reg_pd rp
		INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = rp.id_sp
		LEFT JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
		LEFT JOIN ref.jenis_pendaftaran jd ON jd.id_jns_daftar = rp.id_jns_daftar
		LEFT JOIN ref.jalur_daftar jal ON jal.id_jalur_daftar = rp.id_jalur_daftar
		LEFT JOIN ref.pembiayaan pb ON pb.id_pembiayaan = rp.id_pembiayaan
		LEFT JOIN ref.semester smt ON smt.id_smt = rp.id_smt
		WHERE %s`,
		whereClause,
	)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// ===== SORTING =====
	sortBy := "pd.nm_pd"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	// ===== MAIN QUERY =====
	query := fmt.Sprintf(`
		SELECT
			rp.id_reg_pd,
			rp.id_sp,
			sp.nm_lemb,
			rp.id_sms,
			sms.nm_lemb AS nm_lemb_sms,
			rp.id_pd,
			pd.nm_pd, pd.jk, pd.nisn, pd.nik,
			pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw,
			pd.nm_dsn, pd.ds_kel, pd.kode_pos, pd.tlpn_rumah, pd.tlpn_hp, pd.email,
			pd.a_pmpap, pd.a_bidikmisi, pd.a_bebas_biaya,
			pd.nm_wali, pd.tgl_lahir_wali, pd.id_pendidikan_wali, pd.id_pekerjaan_wali, pd.id_penghasilan_wali,
			pd.nm_ayah, pd.tgl_lahir_ayah, pd.nik_ayah, pd.id_pendidikan_ayah, pd.id_pekerjaan_ayah, pd.id_penghasilan_ayah, pd.id_kk_ayah,
			pd.nm_ibu_kandung, pd.tgl_lahir_ibu, pd.nik_ibu, pd.id_pendidikan_ibu, pd.id_pekerjaan_ibu, pd.id_penghasilan_ibu, pd.id_kk_ibu,
			pd.a_terima_kps, pd.no_kps, pd.id_kk,
			pd.id_kewarganegaraan, pd.id_agama, pd.id_blob,
			pd.id_jns_tinggal, pd.id_stat_mhs, pd.id_alat_transport, pd.id_wil,
			pd.create_date, pd.id_creator, pd.last_update, pd.id_updater, pd.soft_delete, pd.last_sync,
			rp.id_jns_daftar,
			ISNULL(jd.nm_jns_daftar, '') AS nm_jns_daftar,
			rp.id_jalur_daftar,
			jal.nm_jalur_daftar AS nm_jalur_daftar,
			rp.id_pembiayaan,
			pb.nm_pembiayaan,
			rp.id_smt,
			smt.nm_smt,
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
		INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = rp.id_sp
		LEFT JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
		LEFT JOIN ref.jenis_pendaftaran jd ON jd.id_jns_daftar = rp.id_jns_daftar
		LEFT JOIN ref.jalur_daftar jal ON jal.id_jalur_daftar = rp.id_jalur_daftar
		LEFT JOIN ref.pembiayaan pb ON pb.id_pembiayaan = rp.id_pembiayaan
		LEFT JOIN ref.semester smt ON smt.id_smt = rp.id_smt
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, sortBy, order, len(args)+1, len(args)+2,
	)

	args = append(args, params.Offset(), params.Limit)

	// ===== EXECUTE + STRUCTSCAN =====
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

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (r *repository) GetStatusKuliahMahasiswa(ctx context.Context, params types.StatusKuliahMahasiswaParams) ([]StatusKuliahMahasiswa, int64, error) {
	params.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("km.id_reg_pd", strPtr(params.IDRegPd))
	cb.AppendInt("km.id_smt", params.IDSmt)
	cb.AppendString("km.id_stat_mhs", params.IDStatMhs)

	conds, args := cb.Build()
	conds = append(conds, "km.soft_delete = 0")
	whereClause := strings.Join(conds, " AND ")

	// COUNT
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM pdrd.kuliah_mhs km WHERE %s`, whereClause)
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := "km.id_smt"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	order := params.Order
	if order == "" {
		order = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT
			km.id_reg_pd,
			km.id_smt,
			km.id_pembiayaan,
			km.id_stat_mhs,
			km.ips,
			km.sks_semester,
			km.ipk,
			km.total_sks,
			km.biaya_smt,
			km.create_date,
			km.id_creator,
			km.last_update,
			km.id_updater,
			km.soft_delete,
			km.last_sync
		FROM pdrd.kuliah_mhs km
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

	var result []StatusKuliahMahasiswa
	for rows.Next() {
		var m StatusKuliahMahasiswa
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// strPtr mengkonversi string kosong menjadi nil untuk filter UUID
func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
