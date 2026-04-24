package penelitian

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 9b — pivot penelitian & pengabdian:
//   - pdrd.tulis_pub                 (penulis publikasi: dosen/mhs/non-civitas)
//   - pdrd.mitra_litabmas            (mitra DUDI per litabmas)
//   - pdrd.pd_anggota_litabmas       (mahasiswa anggota litabmas)
//   - pdrd.sdm_anggota_litabmas      (dosen anggota litabmas)
//   - pdrd.non_ca_anggota_litabmas   (non-civitas anggota litabmas)
//   - pdrd.non_ca                    (master non-civitas / orang luar)
// ============================================================================

const b9bCacheTTL = 10 * time.Minute

// ---------- Entities ----------

type TulisPub struct {
	IDTulisPub   utils.UUID       `db:"id_tulis_pub" json:"id_tulis_pub"`
	IDPublikasi  utils.UUID       `db:"id_publikasi" json:"id_publikasi"`
	JudulPub     *string          `db:"judul_pub" json:"judul_pub"`
	IDKatgiat    int              `db:"id_katgiat" json:"id_katgiat"`
	IDSDM        utils.NullUUID   `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string          `db:"nm_sdm" json:"nm_sdm"`
	IDPd         utils.NullUUID   `db:"id_pd" json:"id_pd"`
	NmPd         *string          `db:"nm_pd" json:"nm_pd"`
	Nipd         *string          `db:"nipd" json:"nipd"`
	IDOrang      utils.NullUUID   `db:"id_orang" json:"id_orang"`
	NmOrang      *string          `db:"nm_orang" json:"nm_orang"`
	Urutan       int              `db:"urutan" json:"urutan"`
	Afiliasi     *string          `db:"afiliasi" json:"afiliasi"`
	PeranTulis   string           `db:"peran_tulis" json:"peran_tulis"`
	JnsPenulis   string           `db:"jns_penulis" json:"jns_penulis"`
	ACorrAuthor  int              `db:"a_corr_author" json:"a_corr_author"`
	JnsAfiliasi  *string          `db:"jns_afiliasi" json:"jns_afiliasi"`
	LastSync     pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type MitraLitabmas struct {
	IDDudi      utils.UUID       `db:"id_dudi" json:"id_dudi"`
	IDLitabmas  utils.UUID       `db:"id_litabmas" json:"id_litabmas"`
	NmLitabmas  *string          `db:"nm_litabmas" json:"nm_litabmas"`
	NmLemb      *string          `db:"nm_lemb" json:"nm_lemb"`
	LastSync    pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type PdAngLitabmas struct {
	IDPdAngLitabmas utils.UUID       `db:"id_pd_ang_litabmas" json:"id_pd_ang_litabmas"`
	IDLitabmas      utils.UUID       `db:"id_litabmas" json:"id_litabmas"`
	NmLitabmas      *string          `db:"nm_litabmas" json:"nm_litabmas"`
	IDPd            utils.UUID       `db:"id_pd" json:"id_pd"`
	NmPd            *string          `db:"nm_pd" json:"nm_pd"`
	Nipd            *string          `db:"nipd" json:"nipd"`
	PeranLitabmas   string           `db:"peran_litabmas" json:"peran_litabmas"` // A=Anggota, K=Kontributor
	StatAktif       int              `db:"stat_aktif" json:"stat_aktif"`
	LastSync        pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type SdmAnggotaLitabmas struct {
	IDLitabmas    utils.UUID       `db:"id_litabmas" json:"id_litabmas"`
	NmLitabmas    *string          `db:"nm_litabmas" json:"nm_litabmas"`
	IDSDM         utils.UUID       `db:"id_sdm" json:"id_sdm"`
	NmSDM         *string          `db:"nm_sdm" json:"nm_sdm"`
	Nidn          *string          `db:"nidn" json:"nidn"`
	IDKatgiat     int              `db:"id_katgiat" json:"id_katgiat"`
	PeranLitabmas string           `db:"peran_litabmas" json:"peran_litabmas"`
	StatAktif     int              `db:"stat_aktif" json:"stat_aktif"`
	LastSync      pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type NonCaAnggotaLitabmas struct {
	IDLitabmas    utils.UUID       `db:"id_litabmas" json:"id_litabmas"`
	NmLitabmas    *string          `db:"nm_litabmas" json:"nm_litabmas"`
	IDOrang       utils.UUID       `db:"id_orang" json:"id_orang"`
	NmOrang       *string          `db:"nm_orang" json:"nm_orang"`
	PeranLitabmas string           `db:"peran_litabmas" json:"peran_litabmas"`
	StatAktif     int              `db:"stat_aktif" json:"stat_aktif"`
	LastSync      pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type NonCa struct {
	IDOrang   utils.UUID        `db:"id_orang" json:"id_orang"`
	NmOrang   string            `db:"nm_orang" json:"nm_orang"`
	Jk        string            `db:"jk" json:"jk"` // L/P/*
	Nik       *string           `db:"nik" json:"nik"`
	TmptLahir *string           `db:"tmpt_lahir" json:"tmpt_lahir"`
	TglLahir  *pk.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	IDNegara  string            `db:"id_negara" json:"id_negara"`
	NoHp      *string           `db:"no_hp" json:"no_hp"`
	Email     *string           `db:"email" json:"email"`
	Npwp      *string           `db:"npwp" json:"npwp"`
	Jln       *string           `db:"jln" json:"jln"`
	DsKel     *string           `db:"ds_kel" json:"ds_kel"`
	KodePos   *string           `db:"kode_pos" json:"kode_pos"`
	LastSync  pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// ---------- Params ----------

type TulisPubParams struct {
	IDTulisPub  *string `query:"id_tulis_pub"`
	IDPublikasi *string `query:"id_publikasi"`
	IDSDM       *string `query:"id_sdm"`
	IDPd        *string `query:"id_pd"`
	PeranTulis  *string `query:"peran_tulis"`
	JnsPenulis  *string `query:"jns_penulis"`
	ACorrAuthor *int    `query:"a_corr_author"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	Search      string  `query:"search"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

type MitraLitabmasParams struct {
	IDLitabmas *string `query:"id_litabmas"`
	IDDudi     *string `query:"id_dudi"`
	Page       int     `query:"page"`
	Limit      int     `query:"limit"`
	SortBy     string  `query:"sort_by"`
	Order      string  `query:"order"`
}

type PdAngLitabmasParams struct {
	IDLitabmas    *string `query:"id_litabmas"`
	IDPd          *string `query:"id_pd"`
	PeranLitabmas *string `query:"peran_litabmas"`
	StatAktif     *int    `query:"stat_aktif"`
	Page          int     `query:"page"`
	Limit         int     `query:"limit"`
	SortBy        string  `query:"sort_by"`
	Order         string  `query:"order"`
}

type SdmAnggotaLitabmasParams struct {
	IDLitabmas    *string `query:"id_litabmas"`
	IDSDM         *string `query:"id_sdm"`
	IDKatgiat     *int    `query:"id_katgiat"`
	PeranLitabmas *string `query:"peran_litabmas"`
	StatAktif     *int    `query:"stat_aktif"`
	Page          int     `query:"page"`
	Limit         int     `query:"limit"`
	SortBy        string  `query:"sort_by"`
	Order         string  `query:"order"`
}

type NonCaAnggotaLitabmasParams struct {
	IDLitabmas    *string `query:"id_litabmas"`
	IDOrang       *string `query:"id_orang"`
	PeranLitabmas *string `query:"peran_litabmas"`
	StatAktif     *int    `query:"stat_aktif"`
	Page          int     `query:"page"`
	Limit         int     `query:"limit"`
	SortBy        string  `query:"sort_by"`
	Order         string  `query:"order"`
}

type NonCaParams struct {
	IDOrang  *string `query:"id_orang"`
	Jk       *string `query:"jk"`
	IDNegara *string `query:"id_negara"`
	Page     int     `query:"page"`
	Limit    int     `query:"limit"`
	Search   string  `query:"search"` // nm_orang
	SortBy   string  `query:"sort_by"`
	Order    string  `query:"order"`
}

func n9b(page, limit *int, order *string) {
	if *page < 1 {
		*page = 1
	}
	if *limit < 1 {
		*limit = 10
	}
	if *limit > 100 {
		*limit = 100
	}
	if *order == "" {
		*order = "ASC"
	}
}
func off9b(page, limit int) int { return (page - 1) * limit }

// ---------- Repository impls ----------

func (r *repository) GetTulisPub(ctx context.Context, p TulisPubParams) ([]TulisPub, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("t.id_tulis_pub", p.IDTulisPub)
	cb.AppendUUID("t.id_publikasi", p.IDPublikasi)
	cb.AppendUUID("t.id_sdm", p.IDSDM)
	cb.AppendUUID("t.id_pd", p.IDPd)
	cb.AppendString("t.peran_tulis", p.PeranTulis)
	cb.AppendString("t.jns_penulis", p.JnsPenulis)
	cb.AppendInt("t.a_corr_author", p.ACorrAuthor)
	cb.Like("pb.judul", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "t.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.tulis_pub t
		LEFT JOIN pdrd.publikasi pb ON pb.id_publikasi = t.id_publikasi
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = t.id_sdm
		LEFT JOIN pdrd.non_ca nc ON nc.id_orang = t.id_orang`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "pb.tgl_terbit DESC, t.urutan", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT t.id_tulis_pub,
			t.id_publikasi, pb.judul AS judul_pub,
			t.id_katgiat,
			t.id_sdm, sd.nm_sdm,
			t.id_pd, t.nm_pd, t.nipd,
			t.id_orang, nc.nm_orang,
			t.urutan, t.afiliasi, t.peran_tulis, t.jns_penulis,
			t.a_corr_author, t.jns_afiliasi, t.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []TulisPub
	for rows.Next() {
		var m TulisPub
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetMitraLitabmas(ctx context.Context, p MitraLitabmasParams) ([]MitraLitabmas, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("m.id_litabmas", p.IDLitabmas)
	cb.AppendUUID("m.id_dudi", p.IDDudi)

	conds, args := cb.Build()
	conds = append(conds, "m.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	// mitra DUDI bisa nunjuk ke lembaga_non_sp atau satuan_pendidikan; fallback nama kosong
	join := `
		FROM pdrd.mitra_litabmas m
		LEFT JOIN pdrd.litabmas lit ON lit.id_litabmas = m.id_litabmas
		LEFT JOIN pdrd.lembaga_non_sp ln ON ln.id_lemb_non_sp = m.id_dudi`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "m.last_sync DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT m.id_dudi, m.id_litabmas,
			lit.nm_litabmas, ln.nm_lemb, m.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []MitraLitabmas
	for rows.Next() {
		var m MitraLitabmas
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetPdAngLitabmas(ctx context.Context, p PdAngLitabmasParams) ([]PdAngLitabmas, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("pa.id_litabmas", p.IDLitabmas)
	cb.AppendUUID("pa.id_pd", p.IDPd)
	cb.AppendString("pa.peran_litabmas", p.PeranLitabmas)
	cb.AppendInt("pa.stat_aktif", p.StatAktif)

	conds, args := cb.Build()
	conds = append(conds, "pa.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.pd_anggota_litabmas pa
		LEFT JOIN pdrd.litabmas lit ON lit.id_litabmas = pa.id_litabmas`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "lit.nm_litabmas, pa.nipd", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT pa.id_pd_ang_litabmas,
			pa.id_litabmas, lit.nm_litabmas,
			pa.id_pd, pa.nm_pd, pa.nipd,
			pa.peran_litabmas, pa.stat_aktif, pa.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PdAngLitabmas
	for rows.Next() {
		var m PdAngLitabmas
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetSdmAnggotaLitabmas(ctx context.Context, p SdmAnggotaLitabmasParams) ([]SdmAnggotaLitabmas, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("sa.id_litabmas", p.IDLitabmas)
	cb.AppendUUID("sa.id_sdm", p.IDSDM)
	cb.AppendInt("sa.id_katgiat", p.IDKatgiat)
	cb.AppendString("sa.peran_litabmas", p.PeranLitabmas)
	cb.AppendInt("sa.stat_aktif", p.StatAktif)

	conds, args := cb.Build()
	conds = append(conds, "sa.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.sdm_anggota_litabmas sa
		LEFT JOIN pdrd.litabmas lit ON lit.id_litabmas = sa.id_litabmas
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = sa.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "lit.nm_litabmas, sd.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT sa.id_litabmas, lit.nm_litabmas,
			sa.id_sdm, sd.nm_sdm, sd.nidn,
			sa.id_katgiat, sa.peran_litabmas, sa.stat_aktif, sa.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SdmAnggotaLitabmas
	for rows.Next() {
		var m SdmAnggotaLitabmas
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetNonCaAnggotaLitabmas(ctx context.Context, p NonCaAnggotaLitabmasParams) ([]NonCaAnggotaLitabmas, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("na.id_litabmas", p.IDLitabmas)
	cb.AppendUUID("na.id_orang", p.IDOrang)
	cb.AppendString("na.peran_litabmas", p.PeranLitabmas)
	cb.AppendInt("na.stat_aktif", p.StatAktif)

	conds, args := cb.Build()
	conds = append(conds, "na.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.non_ca_anggota_litabmas na
		LEFT JOIN pdrd.litabmas lit ON lit.id_litabmas = na.id_litabmas
		LEFT JOIN pdrd.non_ca nc ON nc.id_orang = na.id_orang`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "lit.nm_litabmas, nc.nm_orang", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT na.id_litabmas, lit.nm_litabmas,
			na.id_orang, nc.nm_orang,
			na.peran_litabmas, na.stat_aktif, na.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []NonCaAnggotaLitabmas
	for rows.Next() {
		var m NonCaAnggotaLitabmas
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetNonCa(ctx context.Context, p NonCaParams) ([]NonCa, int64, error) {
	n9b(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("n.id_orang", p.IDOrang)
	cb.AppendString("n.jk", p.Jk)
	cb.AppendString("n.id_negara", p.IDNegara)
	cb.Like("n.nm_orang", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "n.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM pdrd.non_ca n WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "n.nm_orang", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT n.id_orang, n.nm_orang, n.jk,
			n.nik, n.tmpt_lahir, n.tgl_lahir,
			n.id_negara, n.no_hp, n.email, n.npwp,
			n.jln, n.ds_kel, n.kode_pos, n.last_sync
		FROM pdrd.non_ca n
		WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, off9b(p.Page, p.Limit), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []NonCa
	for rows.Next() {
		var m NonCa
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------- Service cache + methods ----------

func penelitianCached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "penelitian:"+key+":data", "penelitian:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tk); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
				log.Printf("Cache hit %s", key)
				return data, total, nil
			}
		}
	}
	data, total, err := fetch()
	if err != nil {
		return nil, 0, err
	}
	dj, _ := json.Marshal(data)
	tj, _ := json.Marshal(total)
	cache.Set(ctx, d, string(dj), b9bCacheTTL)
	cache.Set(ctx, tk, string(tj), b9bCacheTTL)
	return data, total, nil
}

func (s *service) GetTulisPub(ctx context.Context, p TulisPubParams) ([]TulisPub, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("tulis_pub:%s", utils.HashParams(p)),
		func() ([]TulisPub, int64, error) { return s.repo.GetTulisPub(ctx, p) })
}
func (s *service) GetMitraLitabmas(ctx context.Context, p MitraLitabmasParams) ([]MitraLitabmas, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("mitra:%s", utils.HashParams(p)),
		func() ([]MitraLitabmas, int64, error) { return s.repo.GetMitraLitabmas(ctx, p) })
}
func (s *service) GetPdAngLitabmas(ctx context.Context, p PdAngLitabmasParams) ([]PdAngLitabmas, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("pd_ang:%s", utils.HashParams(p)),
		func() ([]PdAngLitabmas, int64, error) { return s.repo.GetPdAngLitabmas(ctx, p) })
}
func (s *service) GetSdmAnggotaLitabmas(ctx context.Context, p SdmAnggotaLitabmasParams) ([]SdmAnggotaLitabmas, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("sdm_ang:%s", utils.HashParams(p)),
		func() ([]SdmAnggotaLitabmas, int64, error) { return s.repo.GetSdmAnggotaLitabmas(ctx, p) })
}
func (s *service) GetNonCaAnggotaLitabmas(ctx context.Context, p NonCaAnggotaLitabmasParams) ([]NonCaAnggotaLitabmas, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("nonca_ang:%s", utils.HashParams(p)),
		func() ([]NonCaAnggotaLitabmas, int64, error) { return s.repo.GetNonCaAnggotaLitabmas(ctx, p) })
}
func (s *service) GetNonCa(ctx context.Context, p NonCaParams) ([]NonCa, int64, error) {
	return penelitianCached(ctx, fmt.Sprintf("nonca:%s", utils.HashParams(p)),
		func() ([]NonCa, int64, error) { return s.repo.GetNonCa(ctx, p) })
}

// ---------- Handlers ----------

func (h *Handler) GetTulisPub(c *fiber.Ctx) error {
	var p TulisPubParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetTulisPub(c.Context(), p)
	if err != nil {
		log.Printf("tulis_pub: %v", err)
		return response.InternalError(c, "Gagal mengambil data penulis publikasi")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data penulis publikasi", data, p.Page, p.Limit, total)
}

func (h *Handler) GetMitraLitabmas(c *fiber.Ctx) error {
	var p MitraLitabmasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetMitraLitabmas(c.Context(), p)
	if err != nil {
		log.Printf("mitra_litabmas: %v", err)
		return response.InternalError(c, "Gagal mengambil data mitra litabmas")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data mitra litabmas", data, p.Page, p.Limit, total)
}

func (h *Handler) GetPdAngLitabmas(c *fiber.Ctx) error {
	var p PdAngLitabmasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetPdAngLitabmas(c.Context(), p)
	if err != nil {
		log.Printf("pd_anggota_litabmas: %v", err)
		return response.InternalError(c, "Gagal mengambil data mahasiswa anggota litabmas")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data mahasiswa anggota litabmas", data, p.Page, p.Limit, total)
}

func (h *Handler) GetSdmAnggotaLitabmas(c *fiber.Ctx) error {
	var p SdmAnggotaLitabmasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetSdmAnggotaLitabmas(c.Context(), p)
	if err != nil {
		log.Printf("sdm_anggota_litabmas: %v", err)
		return response.InternalError(c, "Gagal mengambil data dosen anggota litabmas")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data dosen anggota litabmas", data, p.Page, p.Limit, total)
}

func (h *Handler) GetNonCaAnggotaLitabmas(c *fiber.Ctx) error {
	var p NonCaAnggotaLitabmasParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetNonCaAnggotaLitabmas(c.Context(), p)
	if err != nil {
		log.Printf("non_ca_anggota_litabmas: %v", err)
		return response.InternalError(c, "Gagal mengambil data non-civitas anggota litabmas")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data non-civitas anggota litabmas", data, p.Page, p.Limit, total)
}

func (h *Handler) GetNonCa(c *fiber.Ctx) error {
	var p NonCaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetNonCa(c.Context(), p)
	if err != nil {
		log.Printf("non_ca: %v", err)
		return response.InternalError(c, "Gagal mengambil data non-civitas")
	}
	n9b(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data non-civitas", data, p.Page, p.Limit, total)
}
