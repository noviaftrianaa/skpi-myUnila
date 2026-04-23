package sdm

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Entities
// ============================================================================

type KinerjaDosen struct {
	IDRegPtk          utils.UUID         `db:"id_reg_ptk" json:"id_reg_ptk"`
	NmSDM             *string            `db:"nm_sdm" json:"nm_sdm"`
	Nidn              *string            `db:"nidn" json:"nidn"`
	IDSmt             *int               `db:"id_smt" json:"id_smt"`
	NmSmt             *string            `db:"nm_smt" json:"nm_smt"`
	IDJabfung         *int               `db:"id_jabfung" json:"id_jabfung"`
	NmJabfung         *string            `db:"nm_jabfung" json:"nm_jabfung"`
	StatTugas         *string            `db:"stat_tugas" json:"stat_tugas"`
	StatBelajar       *string            `db:"stat_belajar" json:"stat_belajar"`
	MasaLaksTgsAwal   *pk.SQLServerTime  `db:"masa_laks_tgs_awal" json:"masa_laks_tgs_awal"`
	MasaLaksTgsAkhir  *pk.SQLServerTime  `db:"masa_laks_tgs_akhir" json:"masa_laks_tgs_akhir"`
	SksTotal          *float64           `db:"sks_total" json:"sks_total"`
	SksKinerja        *float64           `db:"sks_kinerja" json:"sks_kinerja"`
	SksLebih          *float64           `db:"sks_lebih" json:"sks_lebih"`
	SksKinerjaDidik   *float64           `db:"sks_kinerja_didik" json:"sks_kinerja_didik"`
	SksKinerjaLit     *float64           `db:"sks_kinerja_lit" json:"sks_kinerja_lit"`
	SksKinerjaPengmas *float64           `db:"sks_kinerja_pengmas" json:"sks_kinerja_pengmas"`
	Ewmp              *float64           `db:"ewmp" json:"ewmp"`
	StatKewajiban     *string            `db:"stat_kewajiban" json:"stat_kewajiban"`
	LastSync          pk.SQLServerTime   `db:"last_sync" json:"last_sync"`
}

type RwyPekerjaan struct {
	IDRwyKerja   utils.UUID           `db:"id_rwy_kerja" json:"id_rwy_kerja"`
	IDSDM        utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDPekerjaan  *int                 `db:"id_pekerjaan" json:"id_pekerjaan"`
	NmPekerjaan  *string              `db:"nm_pekerjaan" json:"nm_pekerjaan"`
	NmJabatan    *string              `db:"nm_jabatan" json:"nm_jabatan"`
	DeskKerja    *string              `db:"deskripsi_kerja" json:"deskripsi_kerja"`
	Instansi     *string              `db:"instansi" json:"instansi"`
	Divisi       *string              `db:"divisi" json:"divisi"`
	MulaiBekerja *pk.SQLServerTime    `db:"mulai_bekerja" json:"mulai_bekerja"`
	SelesaiBkrja *pk.SQLServerTime    `db:"selesai_bekerja" json:"selesai_bekerja"`
	ALn          *int                 `db:"a_ln" json:"a_ln"`
}

type RwyStruktural struct {
	IDRwyJabstruk utils.UUID           `db:"id_rwy_jabstruk" json:"id_rwy_jabstruk"`
	IDSDM         utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJabTgs      *int                 `db:"id_jab_tgs" json:"id_jab_tgs"`
	NmJabTgs      *string              `db:"nm_jab_tgs" json:"nm_jab_tgs"`
	SkJabstruk    *string              `db:"sk_jabstruk" json:"sk_jabstruk"`
	TmtSkJabstruk *pk.SQLServerTime    `db:"tmt_sk_jabstruk" json:"tmt_sk_jabstruk"`
	TstSkJabstruk *pk.SQLServerTime    `db:"tst_sk_jabstruk" json:"tst_sk_jabstruk"`
	LokasiTugas   *string              `db:"lokasi_tugas" json:"lokasi_tugas"`
}

type Diklat struct {
	IDDiklat      utils.UUID           `db:"id_diklat" json:"id_diklat"`
	IDSDM         utils.UUID           `db:"id_sdm" json:"id_sdm"`
	IDJnsDiklat   *int                 `db:"id_jns_diklat" json:"id_jns_diklat"`
	NmJnsDiklat   *string              `db:"nm_jns_diklat" json:"nm_jns_diklat"`
	IDKelBidang   *string              `db:"id_kel_bidang" json:"id_kel_bidang"`
	NmKelBidang   *string              `db:"nm_kel_bidang" json:"nm_kel_bidang"`
	NmDiklat      string               `db:"nm_diklat" json:"nm_diklat"`
	Penyelenggara *string              `db:"penyelenggara" json:"penyelenggara"`
	Thn           *int                 `db:"thn" json:"thn"`
	Peran         *string              `db:"peran" json:"peran"`
	Tkt           *string              `db:"tkt" json:"tkt"`
	JmlJam        *int                 `db:"jml_jam" json:"jml_jam"`
	NoSert        *string              `db:"no_sert" json:"no_sert"`
	TglSert       *pk.SQLServerTime    `db:"tgl_sert" json:"tgl_sert"`
	Tempat        *string              `db:"tempat" json:"tempat"`
	TglMulai      *pk.SQLServerTime    `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai    *pk.SQLServerTime    `db:"tgl_selesai" json:"tgl_selesai"`
	SkTugas       *string              `db:"sk_tugas" json:"sk_tugas"`
	AValid        *int                 `db:"a_valid" json:"a_valid"`
}

// ============================================================================
// Repository methods
// ============================================================================

func (r *repository) GetKinerjaDosen(ctx context.Context, p types.KinerjaDosenParams) ([]KinerjaDosen, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("kd.id_reg_ptk", p.IDRegPtk)
	cb.AppendInt("kd.id_smt", p.IDSmt)
	cb.AppendInt("kd.id_jabfung", p.IDJabfung)
	cb.AppendString("kd.stat_tugas", p.StatTugas)
	cb.AppendString("kd.stat_belajar", p.StatBelajar)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "kd.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.kinerja_dosen kd
		LEFT JOIN pdrd.reg_ptk rptk ON rptk.id_reg_ptk = kd.id_reg_ptk
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = rptk.id_sdm
		LEFT JOIN ref.semester smt ON smt.id_smt = kd.id_smt
		LEFT JOIN ref.jabfung jf ON jf.id_jabfung = kd.id_jabfung`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "kd.id_smt DESC, sdm.nm_sdm", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT kd.id_reg_ptk, sdm.nm_sdm, rptk.nidn,
			kd.id_smt, smt.nm_smt,
			kd.id_jabfung, jf.nm_jabfung,
			kd.stat_tugas, kd.stat_belajar,
			kd.masa_laks_tgs_awal, kd.masa_laks_tgs_akhir,
			kd.sks_total, kd.sks_kinerja, kd.sks_lebih,
			kd.sks_kinerja_didik, kd.sks_kinerja_lit, kd.sks_kinerja_pengmas,
			kd.ewmp, kd.stat_kewajiban, kd.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []KinerjaDosen
	for rows.Next() {
		var m KinerjaDosen
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetRwyPekerjaan(ctx context.Context, p types.RwyPekerjaanParams) ([]RwyPekerjaan, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("r.id_sdm", p.IDSDM)
	cb.AppendInt("r.id_pekerjaan", p.IDPekerjaan)
	cb.AppendInt("r.a_ln", p.ALn)

	conds, args := cb.Build()
	conds = append(conds, "r.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.rwy_pekerjaan r LEFT JOIN ref.pekerjaan p ON p.id_pekerjaan = r.id_pekerjaan`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) "+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT r.id_rwy_kerja, r.id_sdm,
			r.id_pekerjaan, p.nm_pekerjaan,
			r.nm_jabatan, r.deskripsi_kerja, r.instansi, r.divisi,
			r.mulai_bekerja, r.selesai_bekerja, r.a_ln
		%s WHERE %s ORDER BY r.mulai_bekerja DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []RwyPekerjaan
	for rows.Next() {
		var m RwyPekerjaan
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetRwyStruktural(ctx context.Context, p types.RwyStrukturalParams) ([]RwyStruktural, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("r.id_sdm", p.IDSDM)
	cb.AppendInt("r.id_jab_tgs", p.IDJabTgs)

	conds, args := cb.Build()
	conds = append(conds, "r.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `FROM pdrd.rwy_struktural r LEFT JOIN ref.jab_tgs jt ON jt.id_jab_tgs = r.id_jab_tgs`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) "+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT r.id_rwy_jabstruk, r.id_sdm,
			r.id_jab_tgs, jt.nm_jab_tgs,
			r.sk_jabstruk, r.tmt_sk_jabstruk, r.tst_sk_jabstruk, r.lokasi_tugas
		%s WHERE %s ORDER BY r.tmt_sk_jabstruk DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []RwyStruktural
	for rows.Next() {
		var m RwyStruktural
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetDiklat(ctx context.Context, p types.DiklatParams) ([]Diklat, int64, error) {
	p.NormalizePagination()
	cb := helper.NewCondBuilder()
	cb.AppendUUID("d.id_diklat", p.IDDiklat)
	cb.AppendUUID("d.id_sdm", p.IDSDM)
	cb.AppendInt("d.id_jns_diklat", p.IDJnsDiklat)
	cb.AppendInt("d.thn", p.Thn)
	cb.AppendInt("d.a_valid", p.AValid)
	cb.Like("d.nm_diklat", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "d.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.diklat d
		LEFT JOIN ref.jenis_diklat jd ON jd.id_jns_diklat = d.id_jns_diklat
		LEFT JOIN ref.kelompok_bidang kb ON kb.id_kel_bidang = d.id_kel_bidang`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	q := fmt.Sprintf(`
		SELECT d.id_diklat, d.id_sdm,
			d.id_jns_diklat, jd.nm_jns_diklat,
			d.id_kel_bidang, kb.nm_kel_bidang,
			d.nm_diklat, d.penyelenggara, d.thn, d.peran, d.tkt,
			d.jml_jam, d.no_sert, d.tgl_sert, d.tempat,
			d.tgl_mulai, d.tgl_selesai, d.sk_tugas, d.a_valid
		%s WHERE %s ORDER BY d.thn DESC, d.tgl_mulai DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []Diklat
	for rows.Next() {
		var m Diklat
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// Service wrappers (cached)
// ============================================================================

func (s *service) GetKinerjaDosen(ctx context.Context, p types.KinerjaDosenParams) ([]KinerjaDosen, int64, error) {
	k := fmt.Sprintf("kinerja_dosen:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]KinerjaDosen, int64, error) { return s.repo.GetKinerjaDosen(ctx, p) })
}
func (s *service) GetRwyPekerjaan(ctx context.Context, p types.RwyPekerjaanParams) ([]RwyPekerjaan, int64, error) {
	k := fmt.Sprintf("rwy_pekerjaan:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]RwyPekerjaan, int64, error) { return s.repo.GetRwyPekerjaan(ctx, p) })
}
func (s *service) GetRwyStruktural(ctx context.Context, p types.RwyStrukturalParams) ([]RwyStruktural, int64, error) {
	k := fmt.Sprintf("rwy_struktural:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]RwyStruktural, int64, error) { return s.repo.GetRwyStruktural(ctx, p) })
}
func (s *service) GetDiklat(ctx context.Context, p types.DiklatParams) ([]Diklat, int64, error) {
	k := fmt.Sprintf("diklat:%s", utils.HashParams(p))
	return cached(ctx, k, cacheTTL, func() ([]Diklat, int64, error) { return s.repo.GetDiklat(ctx, p) })
}

// ============================================================================
// Handlers
// ============================================================================

func (h *Handler) GetKinerjaDosen(c *fiber.Ctx) error {
	var p types.KinerjaDosenParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKinerjaDosen(c.Context(), p)
	if err != nil {
		log.Printf("kinerja_dosen: %v", err)
		return response.InternalError(c, "Gagal mengambil kinerja dosen")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kinerja dosen (BKD)", data, p.Page, p.Limit, total)
}
func (h *Handler) GetRwyPekerjaan(c *fiber.Ctx) error {
	var p types.RwyPekerjaanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetRwyPekerjaan(c.Context(), p)
	if err != nil {
		log.Printf("rwy_pekerjaan: %v", err)
		return response.InternalError(c, "Gagal mengambil riwayat pekerjaan")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil riwayat pekerjaan", data, p.Page, p.Limit, total)
}
func (h *Handler) GetRwyStruktural(c *fiber.Ctx) error {
	var p types.RwyStrukturalParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetRwyStruktural(c.Context(), p)
	if err != nil {
		log.Printf("rwy_struktural: %v", err)
		return response.InternalError(c, "Gagal mengambil riwayat struktural")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil riwayat jabatan struktural", data, p.Page, p.Limit, total)
}
func (h *Handler) GetDiklat(c *fiber.Ctx) error {
	var p types.DiklatParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetDiklat(c.Context(), p)
	if err != nil {
		log.Printf("diklat: %v", err)
		return response.InternalError(c, "Gagal mengambil data diklat")
	}
	p.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data diklat", data, p.Page, p.Limit, total)
}
