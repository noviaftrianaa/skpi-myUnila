package tracer

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/myunila/api-service/apps/pdrd/helper"
)

var ErrNotFound = errors.New("tracer: record not found")

type Repository interface {
	// hasil_tracer_study
	ListHasilTracer(ctx context.Context, p HasilTracerParams) ([]HasilTracerStudy, int64, error)
	GetHasilTracer(ctx context.Context, id string) (*HasilTracerStudy, error)
	CreateHasilTracer(ctx context.Context, in HasilTracerCreate) (string, error)
	UpdateHasilTracer(ctx context.Context, id string, in HasilTracerUpdate) error
	DeleteHasilTracer(ctx context.Context, id, idUpdater string) error

	// hasil_tracer_atasan
	ListHasilTracerAtasan(ctx context.Context, p HasilTracerAtasanParams) ([]HasilTracerAtasan, int64, error)
	GetHasilTracerAtasan(ctx context.Context, id string) (*HasilTracerAtasan, error)
	CreateHasilTracerAtasan(ctx context.Context, in HasilTracerAtasanCreate) (string, error)
	UpdateHasilTracerAtasan(ctx context.Context, id string, in HasilTracerAtasanUpdate) error
	DeleteHasilTracerAtasan(ctx context.Context, id, idUpdater string) error

	// umr_wilayah (full CRUD)
	ListUmrWilayah(ctx context.Context, p UmrWilayahParams) ([]UmrWilayah, int64, error)
	GetUmrWilayah(ctx context.Context, id string) (*UmrWilayah, error)
	CreateUmrWilayah(ctx context.Context, in UmrWilayahCreate) (string, error)
	UpdateUmrWilayah(ctx context.Context, id string, in UmrWilayahUpdate) error
	DeleteUmrWilayah(ctx context.Context, id, idUpdater string) error
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

// ---------- hasil_tracer_study ----------

const hasilTracerSelect = `
	SELECT h.id_hasil_tracer_study,
		h.id_thn_ajaran, ta.nm_thn_ajaran,
		h.id_bid_kerja,
		h.id_wil, w.nm_wil,
		h.id_reg_pd, rp.id_pd, pd.nm_pd, rp.nipd,
		rp.id_sms, sms.nm_lemb AS nm_sms,
		h.id_smt, h.id_jns_jalur_kerja,
		h.wkt_pengisian, h.wkt_tunggu, h.status_lulusan,
		h.jns_tmpt_bekerja, h.nm_tmpt_bekerja,
		h.income_per_bln, h.total_instansi_dilamar,
		h.hub_bidang_kerja, h.tkt_kesesuaian, h.alasan_tidak_sesuai,
		h.a_kerja_sblm_lulus, h.ket, h.level_perusahaan, h.status_jabatan,
		h.jenis_wirausaha, h.c_kerja_terakhir, h.id_wil_kota,
		h.respon_perusahaan, h.wawancara,
		h.nm_pt_lnjt, h.nm_prodi_lnjt, h.wkt_masuk,
		h.create_date, h.last_update, h.last_sync
	FROM tracer.hasil_tracer_study h
	LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = h.id_reg_pd
	LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
	LEFT JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
	LEFT JOIN ref.tahun_ajaran ta ON ta.id_thn_ajaran = h.id_thn_ajaran
	LEFT JOIN ref.wilayah w ON w.id_wil = h.id_wil`

func (r *repository) ListHasilTracer(ctx context.Context, p HasilTracerParams) ([]HasilTracerStudy, int64, error) {
	normT(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("h.id_hasil_tracer_study", p.IDHasilTracerStudy)
	cb.AppendUUID("h.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("rp.id_pd", p.IDPd)
	cb.AppendUUID("rp.id_sms", p.IDSms)
	cb.AppendInt("h.id_thn_ajaran", p.IDThnAjaran)
	cb.AppendInt("h.status_lulusan", p.StatusLulusan)
	cb.AppendInt("h.tkt_kesesuaian", p.TktKesesuaian)
	cb.AppendInt("h.hub_bidang_kerja", p.HubBidangKerja)
	cb.Like("h.nm_tmpt_bekerja", p.Search) // search by nm_tmpt_bekerja (primary) / nipd filter via id_reg_pd

	conds, args := cb.Build()
	conds = append(conds, "h.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	countQ := `
		SELECT COUNT(*)
		FROM tracer.hasil_tracer_study h
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = h.id_reg_pd
		WHERE ` + where
	var total int64
	if err := r.db.QueryRowContext(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "h.wkt_pengisian DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		hasilTracerSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []HasilTracerStudy
	for rows.Next() {
		var m HasilTracerStudy
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetHasilTracer(ctx context.Context, id string) (*HasilTracerStudy, error) {
	q := hasilTracerSelect + ` WHERE h.id_hasil_tracer_study = @p1 AND h.soft_delete = 0`
	var m HasilTracerStudy
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateHasilTracer(ctx context.Context, in HasilTracerCreate) (string, error) {
	id := uuid.New().String()
	if in.IDHasilTracerStudy != nil && *in.IDHasilTracerStudy != "" {
		if _, err := uuid.Parse(*in.IDHasilTracerStudy); err == nil {
			id = *in.IDHasilTracerStudy
		}
	}

	q := `INSERT INTO tracer.hasil_tracer_study (
		id_hasil_tracer_study, id_thn_ajaran, id_bid_kerja, id_wil, id_reg_pd,
		id_smt, id_jns_jalur_kerja, wkt_pengisian, wkt_tunggu, status_lulusan,
		jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, total_instansi_dilamar,
		hub_bidang_kerja, tkt_kesesuaian, alasan_tidak_sesuai, a_kerja_sblm_lulus,
		ket, level_perusahaan, status_jabatan,
		jenis_wirausaha, c_kerja_terakhir, id_wil_kota, respon_perusahaan, wawancara,
		nm_pt_lnjt, nm_prodi_lnjt, wkt_masuk,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (
		@p1, @p2, @p3, @p4, @p5,
		@p6, @p7, @p8, @p9, @p10,
		@p11, @p12, @p13, @p14,
		@p15, @p16, @p17, @p18,
		@p19, @p20, @p21,
		@p22, @p23, @p24, @p25, @p26,
		@p27, @p28, @p29,
		@p30, @p31, @p32, 0, @p33)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDThnAjaran, in.IDBidKerja, in.IDWil, in.IDRegPd,
		in.IDSmt, in.IDJnsJalurKerja, in.WktPengisian, in.WktTunggu, in.StatusLulusan,
		in.JnsTmptBekerja, in.NmTmptBekerja, in.IncomePerBln, in.TotalInstansiDilamar,
		in.HubBidangKerja, in.TktKesesuaian, in.AlasanTidakSesuai, in.AKerjaSblmLulus,
		in.Ket, in.LevelPerusahaan, in.StatusJabatan,
		in.JenisWirausaha, in.CKerjaTerakhir, in.IDWilKota, in.ResponPerusahaan, in.Wawancara,
		in.NmPtLnjt, in.NmProdiLnjt, in.WktMasuk,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateHasilTracer(ctx context.Context, id string, in HasilTracerUpdate) error {
	sets := []string{}
	args := []interface{}{}
	i := 1

	addInt := func(col string, v *int) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}
	addStr := func(col string, v *string) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}
	addF := func(col string, v *float64) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}
	addTime := func(col string, v *time.Time) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}

	addInt("id_thn_ajaran", in.IDThnAjaran)
	addInt("id_bid_kerja", in.IDBidKerja)
	addStr("id_wil", in.IDWil)
	addStr("id_smt", in.IDSmt)
	addInt("id_jns_jalur_kerja", in.IDJnsJalurKerja)
	addTime("wkt_pengisian", in.WktPengisian)
	addInt("wkt_tunggu", in.WktTunggu)
	addInt("status_lulusan", in.StatusLulusan)
	addStr("jns_tmpt_bekerja", in.JnsTmptBekerja)
	addStr("nm_tmpt_bekerja", in.NmTmptBekerja)
	addF("income_per_bln", in.IncomePerBln)
	addInt("total_instansi_dilamar", in.TotalInstansiDilamar)
	addInt("hub_bidang_kerja", in.HubBidangKerja)
	addInt("tkt_kesesuaian", in.TktKesesuaian)
	addStr("alasan_tidak_sesuai", in.AlasanTidakSesuai)
	addInt("a_kerja_sblm_lulus", in.AKerjaSblmLulus)
	addStr("ket", in.Ket)
	addStr("level_perusahaan", in.LevelPerusahaan)
	addStr("status_jabatan", in.StatusJabatan)
	addStr("jenis_wirausaha", in.JenisWirausaha)
	addStr("c_kerja_terakhir", in.CKerjaTerakhir)
	addStr("id_wil_kota", in.IDWilKota)
	addStr("respon_perusahaan", in.ResponPerusahaan)
	addStr("wawancara", in.Wawancara)
	addStr("nm_pt_lnjt", in.NmPtLnjt)
	addStr("nm_prodi_lnjt", in.NmProdiLnjt)
	addTime("wkt_masuk", in.WktMasuk)

	// always update audit
	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE tracer.hasil_tracer_study SET %s
		WHERE id_hasil_tracer_study = @p%d AND soft_delete = 0`,
		strings.Join(sets, ", "), i)

	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) DeleteHasilTracer(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE tracer.hasil_tracer_study
		SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_hasil_tracer_study = @p3 AND soft_delete = 0`
	res, err := r.db.ExecContext(ctx, q, time.Now(), idUpdater, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---------- hasil_tracer_atasan ----------

const hasilTracerAtasanSelect = `
	SELECT a.id_hasil_tracer_atasan, a.id_hasil_tracer_study,
		a.id_negara, a.id_wil,
		a.email_atasan, a.nm_atasan, a.jabatan_atasan,
		a.nm_tmpt_bekerja, a.bidang_tempat_bekerja,
		CAST(a.saran AS VARCHAR(MAX)) AS saran,
		CAST(a.harapan AS VARCHAR(MAX)) AS harapan,
		CAST(a.kepuasan_terhadap_alumni AS VARCHAR(MAX)) AS kepuasan_terhadap_alumni,
		CAST(a.kompetensi_perusahaan AS VARCHAR(MAX)) AS kompetensi_perusahaan,
		a.alamat_tmpt_kerja,
		CAST(a.metode_pembelajaran AS VARCHAR(MAX)) AS metode_pembelajaran,
		a.create_date, a.last_update, a.last_sync
	FROM tracer.hasil_tracer_atasan a`

func (r *repository) ListHasilTracerAtasan(ctx context.Context, p HasilTracerAtasanParams) ([]HasilTracerAtasan, int64, error) {
	normT(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("a.id_hasil_tracer_atasan", p.IDHasilTracerAtasan)
	cb.AppendUUID("a.id_hasil_tracer_study", p.IDHasilTracerStudy)
	cb.Like("a.nm_atasan", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "a.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM tracer.hasil_tracer_atasan a WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "a.create_date DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		hasilTracerAtasanSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []HasilTracerAtasan
	for rows.Next() {
		var m HasilTracerAtasan
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetHasilTracerAtasan(ctx context.Context, id string) (*HasilTracerAtasan, error) {
	q := hasilTracerAtasanSelect + ` WHERE a.id_hasil_tracer_atasan = @p1 AND a.soft_delete = 0`
	var m HasilTracerAtasan
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateHasilTracerAtasan(ctx context.Context, in HasilTracerAtasanCreate) (string, error) {
	id := uuid.New().String()
	if in.IDHasilTracerAtasan != nil && *in.IDHasilTracerAtasan != "" {
		if _, err := uuid.Parse(*in.IDHasilTracerAtasan); err == nil {
			id = *in.IDHasilTracerAtasan
		}
	}
	q := `INSERT INTO tracer.hasil_tracer_atasan (
		id_hasil_tracer_atasan, id_hasil_tracer_study,
		id_negara, id_wil, email_atasan, nm_atasan, jabatan_atasan,
		nm_tmpt_bekerja, bidang_tempat_bekerja, saran, harapan,
		kepuasan_terhadap_alumni, kompetensi_perusahaan, alamat_tmpt_kerja, metode_pembelajaran,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (
		@p1, @p2,
		@p3, @p4, @p5, @p6, @p7,
		@p8, @p9, @p10, @p11,
		@p12, @p13, @p14, @p15,
		@p16, @p17, @p18, 0, @p19)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDHasilTracerStudy,
		in.IDNegara, in.IDWil, in.EmailAtasan, in.NmAtasan, in.JabatanAtasan,
		in.NmTmptBekerja, in.BidangTempatBekerja, in.Saran, in.Harapan,
		in.KepuasanTerhadapAlumni, in.KompetensiPerusahaan, in.AlamatTmptKerja, in.MetodePembelajaran,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateHasilTracerAtasan(ctx context.Context, id string, in HasilTracerAtasanUpdate) error {
	sets := []string{}
	args := []interface{}{}
	i := 1

	addStr := func(col string, v *string) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}

	addStr("id_negara", in.IDNegara)
	addStr("id_wil", in.IDWil)
	addStr("email_atasan", in.EmailAtasan)
	addStr("nm_atasan", in.NmAtasan)
	addStr("jabatan_atasan", in.JabatanAtasan)
	addStr("nm_tmpt_bekerja", in.NmTmptBekerja)
	addStr("bidang_tempat_bekerja", in.BidangTempatBekerja)
	addStr("saran", in.Saran)
	addStr("harapan", in.Harapan)
	addStr("kepuasan_terhadap_alumni", in.KepuasanTerhadapAlumni)
	addStr("kompetensi_perusahaan", in.KompetensiPerusahaan)
	addStr("alamat_tmpt_kerja", in.AlamatTmptKerja)
	addStr("metode_pembelajaran", in.MetodePembelajaran)

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE tracer.hasil_tracer_atasan SET %s
		WHERE id_hasil_tracer_atasan = @p%d AND soft_delete = 0`,
		strings.Join(sets, ", "), i)

	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) DeleteHasilTracerAtasan(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE tracer.hasil_tracer_atasan
		SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_hasil_tracer_atasan = @p3 AND soft_delete = 0`
	res, err := r.db.ExecContext(ctx, q, time.Now(), idUpdater, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---------- umr_wilayah (read-only) ----------

const umrSelect = `
	SELECT u.id_umr_wil, u.id_wil, w.nm_wil,
		u.id_tahun_anggaran, u.besaran_umr, u.last_sync
	FROM tracer.umr_wilayah u
	LEFT JOIN ref.wilayah w ON w.id_wil = u.id_wil`

func (r *repository) ListUmrWilayah(ctx context.Context, p UmrWilayahParams) ([]UmrWilayah, int64, error) {
	normT(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("u.id_umr_wil", p.IDUmrWil)
	cb.AppendString("u.id_wil", p.IDWil)
	cb.AppendInt("u.id_tahun_anggaran", p.IDTahunAnggaran)

	conds, args := cb.Build()
	conds = append(conds, "u.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM tracer.umr_wilayah u WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "u.id_tahun_anggaran DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		umrSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []UmrWilayah
	for rows.Next() {
		var m UmrWilayah
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetUmrWilayah(ctx context.Context, id string) (*UmrWilayah, error) {
	q := umrSelect + ` WHERE u.id_umr_wil = @p1 AND u.soft_delete = 0`
	var m UmrWilayah
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateUmrWilayah(ctx context.Context, in UmrWilayahCreate) (string, error) {
	id := uuid.New().String()
	if in.IDUmrWil != nil && *in.IDUmrWil != "" {
		if _, err := uuid.Parse(*in.IDUmrWil); err == nil {
			id = *in.IDUmrWil
		}
	}
	q := `INSERT INTO tracer.umr_wilayah (
		id_umr_wil, id_wil, id_tahun_anggaran, besaran_umr,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, 0, @p8)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDWil, in.IDTahunAnggaran, in.BesaranUmr,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateUmrWilayah(ctx context.Context, id string, in UmrWilayahUpdate) error {
	sets := []string{}
	args := []interface{}{}
	i := 1

	if in.IDWil != nil {
		sets = append(sets, fmt.Sprintf("id_wil = @p%d", i))
		args = append(args, *in.IDWil)
		i++
	}
	if in.IDTahunAnggaran != nil {
		sets = append(sets, fmt.Sprintf("id_tahun_anggaran = @p%d", i))
		args = append(args, *in.IDTahunAnggaran)
		i++
	}
	if in.BesaranUmr != nil {
		sets = append(sets, fmt.Sprintf("besaran_umr = @p%d", i))
		args = append(args, *in.BesaranUmr)
		i++
	}

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE tracer.umr_wilayah SET %s
		WHERE id_umr_wil = @p%d AND soft_delete = 0`,
		strings.Join(sets, ", "), i)

	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) DeleteUmrWilayah(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE tracer.umr_wilayah
		SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_umr_wil = @p3 AND soft_delete = 0`
	res, err := r.db.ExecContext(ctx, q, time.Now(), idUpdater, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

