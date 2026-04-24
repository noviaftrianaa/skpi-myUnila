package kerjasama

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

var ErrNotFound = errors.New("kerjasama: record not found")

type Repository interface {
	// mou
	ListMou(ctx context.Context, p MouParams) ([]Mou, int64, error)
	GetMou(ctx context.Context, id string) (*Mou, error)
	CreateMou(ctx context.Context, in MouCreate) (string, error)
	UpdateMou(ctx context.Context, id string, in MouUpdate) error
	DeleteMou(ctx context.Context, id, idUpdater string) error

	// sms_kerjasama
	ListSmsKerjasama(ctx context.Context, p SmsKerjasamaParams) ([]SmsKerjasama, int64, error)
	GetSmsKerjasama(ctx context.Context, id string) (*SmsKerjasama, error)
	CreateSmsKerjasama(ctx context.Context, in SmsKerjasamaCreate) (string, error)
	UpdateSmsKerjasama(ctx context.Context, id string, in SmsKerjasamaUpdate) error
	DeleteSmsKerjasama(ctx context.Context, id, idUpdater string) error

	// dudi (pdrd.dudi)
	ListDudi(ctx context.Context, p DudiParams) ([]Dudi, int64, error)
	GetDudi(ctx context.Context, id string) (*Dudi, error)
	CreateDudi(ctx context.Context, in DudiCreate) (string, error)
	UpdateDudi(ctx context.Context, id string, in DudiUpdate) error
	DeleteDudi(ctx context.Context, id, idUpdater string) error
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

// ============================================================================
// MOU
// ============================================================================

const mouSelect = `
	SELECT m.id_mou,
		m.id_sp, sp.nm_lemb AS nm_sp,
		m.id_akt_kerjasama, ak.nm_akt_kerjasama,
		m.id_dudi, d.nm_lemb AS nm_lemb_dudi,
		m.sk_mou, m.judul_mou, m.uraian_mou,
		m.tgl_mulai, m.tgl_selesai,
		m.nm_dudi, m.npwp_dudi, m.nm_bu,
		m.tel_kantor, m.fax, m.cp, m.tel_cp, m.jab_cp,
		m.create_date, m.last_update, m.last_sync
	FROM kerjasama.mou m
	LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = m.id_sp
	LEFT JOIN ref.aktifitas_kerjasama ak ON ak.id_akt_kerjasama = m.id_akt_kerjasama
	LEFT JOIN pdrd.dudi d ON d.id_dudi = m.id_dudi`

func (r *repository) ListMou(ctx context.Context, p MouParams) ([]Mou, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("m.id_mou", p.IDMou)
	cb.AppendUUID("m.id_sp", p.IDSp)
	cb.AppendInt("m.id_akt_kerjasama", p.IDAktKerjasama)
	cb.AppendUUID("m.id_dudi", p.IDDudi)
	cb.AppendString("m.sk_mou", p.SkMou)
	cb.Like("m.judul_mou", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "m.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM kerjasama.mou m WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "m.tgl_mulai DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		mouSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Mou
	for rows.Next() {
		var m Mou
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetMou(ctx context.Context, id string) (*Mou, error) {
	q := mouSelect + ` WHERE m.id_mou = @p1 AND m.soft_delete = 0`
	var m Mou
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateMou(ctx context.Context, in MouCreate) (string, error) {
	id := uuid.New().String()
	if in.IDMou != nil && *in.IDMou != "" {
		if _, err := uuid.Parse(*in.IDMou); err == nil {
			id = *in.IDMou
		}
	}
	q := `INSERT INTO kerjasama.mou (
		id_mou, id_sp, id_akt_kerjasama, id_dudi,
		sk_mou, judul_mou, uraian_mou, tgl_mulai, tgl_selesai,
		nm_dudi, npwp_dudi, nm_bu, tel_kantor, fax, cp, tel_cp, jab_cp,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9,
		@p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17,
		@p18, @p19, @p20, 0, @p21)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDSp, in.IDAktKerjasama, in.IDDudi,
		in.SkMou, in.JudulMou, in.UraianMou, in.TglMulai, in.TglSelesai,
		in.NmDudi, in.NpwpDudi, in.NmBu, in.TelKantor, in.Fax, in.Cp, in.TelCp, in.JabCp,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateMou(ctx context.Context, id string, in MouUpdate) error {
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
	addInt := func(col string, v *int) {
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

	addStr("id_sp", in.IDSp)
	addInt("id_akt_kerjasama", in.IDAktKerjasama)
	addStr("id_dudi", in.IDDudi)
	addStr("sk_mou", in.SkMou)
	addStr("judul_mou", in.JudulMou)
	addStr("uraian_mou", in.UraianMou)
	addTime("tgl_mulai", in.TglMulai)
	addTime("tgl_selesai", in.TglSelesai)
	addStr("nm_dudi", in.NmDudi)
	addStr("npwp_dudi", in.NpwpDudi)
	addStr("nm_bu", in.NmBu)
	addStr("tel_kantor", in.TelKantor)
	addStr("fax", in.Fax)
	addStr("cp", in.Cp)
	addStr("tel_cp", in.TelCp)
	addStr("jab_cp", in.JabCp)

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE kerjasama.mou SET %s
		WHERE id_mou = @p%d AND soft_delete = 0`, strings.Join(sets, ", "), i)

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

func (r *repository) DeleteMou(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE kerjasama.mou SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_mou = @p3 AND soft_delete = 0`
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

// ============================================================================
// SMS_KERJASAMA
// ============================================================================

const smsKerjasamaSelect = `
	SELECT sk.id_sms_kerjasama,
		sk.id_sms, s.nm_lemb AS nm_sms,
		sk.id_mou, m.judul_mou, m.sk_mou,
		sk.id_tingkat_kerjasama, tk.nm_tingkat_kerjasama,
		sk.id_sumber_dana,
		sk.id_stat_kerjasama, stk.nm_stat_kerjasama,
		sk.id_bid_kerjasama, bk.nm_bid_kerjasama,
		sk.id_kriteria_mitra, km.nm_kriteria_mitra,
		sk.id_bntk_giat_kerjasama, bgk.nm_bntk_giat_kerjasama,
		sk.hsl_prod_brg, sk.hsl_prod_jasa,
		sk.omzet_barang_per_bulan, sk.omzet_jasa_per_bulan,
		sk.prestasi_penghargaan, sk.pangsa_psr_brg, sk.pangsa_psr_jasa,
		sk.besaran_kerjasama,
		sk.create_date, sk.last_update, sk.last_sync
	FROM kerjasama.sms_kerjasama sk
	LEFT JOIN pdrd.sms s ON s.id_sms = sk.id_sms
	LEFT JOIN kerjasama.mou m ON m.id_mou = sk.id_mou
	LEFT JOIN ref.tingkat_kerjasama tk ON tk.id_tingkat_kerjasama = sk.id_tingkat_kerjasama
	LEFT JOIN ref.status_kerjasama stk ON stk.id_stat_kerjasama = sk.id_stat_kerjasama
	LEFT JOIN ref.bidang_kerjasama bk ON bk.id_bid_kerjasama = sk.id_bid_kerjasama
	LEFT JOIN ref.kriteria_mitra km ON km.id_kriteria_mitra = sk.id_kriteria_mitra
	LEFT JOIN ref.bentuk_kegiatan_kerjasama bgk ON bgk.id_bntk_giat_kerjasama = sk.id_bntk_giat_kerjasama`

func (r *repository) ListSmsKerjasama(ctx context.Context, p SmsKerjasamaParams) ([]SmsKerjasama, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("sk.id_sms_kerjasama", p.IDSmsKerjasama)
	cb.AppendUUID("sk.id_sms", p.IDSms)
	cb.AppendUUID("sk.id_mou", p.IDMou)
	cb.AppendInt("sk.id_tingkat_kerjasama", p.IDTingkatKerjasama)
	cb.AppendInt("sk.id_stat_kerjasama", p.IDStatKerjasama)
	cb.AppendInt("sk.id_bid_kerjasama", p.IDBidKerjasama)
	cb.AppendInt("sk.id_bntk_giat_kerjasama", p.IDBntkGiatKerjasama)
	cb.AppendInt("sk.id_kriteria_mitra", p.IDKriteriaMitra)
	cb.Like("m.judul_mou", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "sk.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM kerjasama.sms_kerjasama sk
		 LEFT JOIN kerjasama.mou m ON m.id_mou = sk.id_mou WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sk.create_date DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		smsKerjasamaSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SmsKerjasama
	for rows.Next() {
		var m SmsKerjasama
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetSmsKerjasama(ctx context.Context, id string) (*SmsKerjasama, error) {
	q := smsKerjasamaSelect + ` WHERE sk.id_sms_kerjasama = @p1 AND sk.soft_delete = 0`
	var m SmsKerjasama
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateSmsKerjasama(ctx context.Context, in SmsKerjasamaCreate) (string, error) {
	id := uuid.New().String()
	if in.IDSmsKerjasama != nil && *in.IDSmsKerjasama != "" {
		if _, err := uuid.Parse(*in.IDSmsKerjasama); err == nil {
			id = *in.IDSmsKerjasama
		}
	}
	q := `INSERT INTO kerjasama.sms_kerjasama (
		id_sms_kerjasama, id_sms, id_mou, id_tingkat_kerjasama, id_sumber_dana,
		id_stat_kerjasama, id_bid_kerjasama, id_kriteria_mitra, id_bntk_giat_kerjasama,
		hsl_prod_brg, hsl_prod_jasa, omzet_barang_per_bulan, omzet_jasa_per_bulan,
		prestasi_penghargaan, pangsa_psr_brg, pangsa_psr_jasa, besaran_kerjasama,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9,
		@p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17,
		@p18, @p19, @p20, 0, @p21)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDSms, in.IDMou, in.IDTingkatKerjasama, in.IDSumberDana,
		in.IDStatKerjasama, in.IDBidKerjasama, in.IDKriteriaMitra, in.IDBntkGiatKerjasama,
		in.HslProdBrg, in.HslProdJasa, in.OmzetBarangPerBulan, in.OmzetJasaPerBulan,
		in.PrestasiPenghargaan, in.PangsaPsrBrg, in.PangsaPsrJasa, in.BesaranKerjasama,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateSmsKerjasama(ctx context.Context, id string, in SmsKerjasamaUpdate) error {
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
	addInt := func(col string, v *int) {
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

	addStr("id_sms", in.IDSms)
	addStr("id_mou", in.IDMou)
	addInt("id_tingkat_kerjasama", in.IDTingkatKerjasama)
	addInt("id_sumber_dana", in.IDSumberDana)
	addInt("id_stat_kerjasama", in.IDStatKerjasama)
	addInt("id_bid_kerjasama", in.IDBidKerjasama)
	addInt("id_kriteria_mitra", in.IDKriteriaMitra)
	addInt("id_bntk_giat_kerjasama", in.IDBntkGiatKerjasama)
	addStr("hsl_prod_brg", in.HslProdBrg)
	addStr("hsl_prod_jasa", in.HslProdJasa)
	addF("omzet_barang_per_bulan", in.OmzetBarangPerBulan)
	addF("omzet_jasa_per_bulan", in.OmzetJasaPerBulan)
	addStr("prestasi_penghargaan", in.PrestasiPenghargaan)
	addStr("pangsa_psr_brg", in.PangsaPsrBrg)
	addStr("pangsa_psr_jasa", in.PangsaPsrJasa)
	addF("besaran_kerjasama", in.BesaranKerjasama)

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE kerjasama.sms_kerjasama SET %s
		WHERE id_sms_kerjasama = @p%d AND soft_delete = 0`, strings.Join(sets, ", "), i)

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

func (r *repository) DeleteSmsKerjasama(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE kerjasama.sms_kerjasama SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_sms_kerjasama = @p3 AND soft_delete = 0`
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

// ============================================================================
// DUDI (pdrd.dudi)
// ============================================================================

const dudiSelect = `
	SELECT d.id_dudi, d.nm_lemb, d.nm_wp,
		d.jln, d.rt, d.rw, d.nm_dsn, d.ds_kel, d.kode_pos,
		d.lintang, d.bujur, d.no_tel, d.no_fax, d.email, d.website,
		d.npwp, d.kip,
		d.alamat_kanpus, d.email_kanpus, d.telp_kanpus, d.fax_kanpus, d.website_kanpus,
		d.jml_tmpt_tidur, d.jml_pasien_rawat_inap, d.jml_pasien_rawat_jln,
		CAST(d.variasi_kasus AS VARCHAR(MAX)) AS variasi_kasus,
		d.id_wil, w.nm_wil,
		d.id_bu,
		d.create_date, d.last_update, d.last_sync
	FROM pdrd.dudi d
	LEFT JOIN ref.wilayah w ON w.id_wil = d.id_wil`

func (r *repository) ListDudi(ctx context.Context, p DudiParams) ([]Dudi, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("d.id_dudi", p.IDDudi)
	cb.AppendString("d.id_wil", p.IDWil)
	cb.AppendString("d.id_bu", p.IDBu)
	cb.AppendString("d.npwp", p.Npwp)
	cb.Like("d.nm_lemb", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "d.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.dudi d WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "d.nm_lemb", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		dudiSelect, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Dudi
	for rows.Next() {
		var m Dudi
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetDudi(ctx context.Context, id string) (*Dudi, error) {
	q := dudiSelect + ` WHERE d.id_dudi = @p1 AND d.soft_delete = 0`
	var m Dudi
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateDudi(ctx context.Context, in DudiCreate) (string, error) {
	id := uuid.New().String()
	if in.IDDudi != nil && *in.IDDudi != "" {
		if _, err := uuid.Parse(*in.IDDudi); err == nil {
			id = *in.IDDudi
		}
	}
	q := `INSERT INTO pdrd.dudi (
		id_dudi, nm_lemb, nm_wp,
		jln, rt, rw, nm_dsn, ds_kel, kode_pos,
		lintang, bujur, no_tel, no_fax, email, website,
		npwp, kip,
		alamat_kanpus, email_kanpus, telp_kanpus, fax_kanpus, website_kanpus,
		id_wil, id_bu,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9,
		@p10, @p11, @p12, @p13, @p14, @p15, @p16, @p17,
		@p18, @p19, @p20, @p21, @p22, @p23, @p24,
		@p25, @p26, @p27, 0, @p28)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.NmLemb, in.NmWp,
		in.Jln, in.Rt, in.Rw, in.NmDsn, in.DsKel, in.KodePos,
		in.Lintang, in.Bujur, in.NoTel, in.NoFax, in.Email, in.Website,
		in.Npwp, in.Kip,
		in.AlamatKanpus, in.EmailKanpus, in.TelpKanpus, in.FaxKanpus, in.WebsiteKanpus,
		in.IDWil, in.IDBu,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateDudi(ctx context.Context, id string, in DudiUpdate) error {
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
	addInt := func(col string, v *int) {
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

	addStr("nm_lemb", in.NmLemb)
	addStr("nm_wp", in.NmWp)
	addStr("jln", in.Jln)
	addInt("rt", in.Rt)
	addInt("rw", in.Rw)
	addStr("nm_dsn", in.NmDsn)
	addStr("ds_kel", in.DsKel)
	addStr("kode_pos", in.KodePos)
	addF("lintang", in.Lintang)
	addF("bujur", in.Bujur)
	addStr("no_tel", in.NoTel)
	addStr("no_fax", in.NoFax)
	addStr("email", in.Email)
	addStr("website", in.Website)
	addStr("npwp", in.Npwp)
	addStr("kip", in.Kip)
	addStr("alamat_kanpus", in.AlamatKanpus)
	addStr("email_kanpus", in.EmailKanpus)
	addStr("telp_kanpus", in.TelpKanpus)
	addStr("fax_kanpus", in.FaxKanpus)
	addStr("website_kanpus", in.WebsiteKanpus)
	addStr("id_wil", in.IDWil)
	addStr("id_bu", in.IDBu)

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE pdrd.dudi SET %s
		WHERE id_dudi = @p%d AND soft_delete = 0`, strings.Join(sets, ", "), i)

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

func (r *repository) DeleteDudi(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE pdrd.dudi SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_dudi = @p3 AND soft_delete = 0`
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
