package sdm

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// ============================================================================
// Batch 10 — SDM tambahan (yang awalnya di-defer):
//   - pdrd.keaktifan_ptk   (status aktif bulanan dosen per thn ajaran)
//   - pdrd.inpassing       (penyetaraan pangkat dosen)
//   - pdrd.kesejahteraan   (BPJS, tunjangan kesejahteraan dosen)
//   - pdrd.tugas_belajar   (tubel dosen S2/S3)
//   - pdrd.tunjangan       (tunjangan fungsional / profesi dosen)
// ============================================================================

// ---------- Entities ----------

type KeaktifanPtk struct {
	IDRegPtk     utils.UUID       `db:"id_reg_ptk" json:"id_reg_ptk"`
	IDThnAjaran  int              `db:"id_thn_ajaran" json:"id_thn_ajaran"`
	NmThnAjaran  *string          `db:"nm_thn_ajaran" json:"nm_thn_ajaran"`
	IDSDM        utils.NullUUID   `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string          `db:"nm_sdm" json:"nm_sdm"`
	ASpHomebase  int              `db:"a_sp_homebase" json:"a_sp_homebase"`
	Bln1         int              `db:"a_aktif_bln_1" json:"a_aktif_bln_1"`
	Bln2         int              `db:"a_aktif_bln_2" json:"a_aktif_bln_2"`
	Bln3         int              `db:"a_aktif_bln_3" json:"a_aktif_bln_3"`
	Bln4         int              `db:"a_aktif_bln_4" json:"a_aktif_bln_4"`
	Bln5         int              `db:"a_aktif_bln_5" json:"a_aktif_bln_5"`
	Bln6         int              `db:"a_aktif_bln_6" json:"a_aktif_bln_6"`
	Bln7         int              `db:"a_aktif_bln_7" json:"a_aktif_bln_7"`
	Bln8         int              `db:"a_aktif_bln_8" json:"a_aktif_bln_8"`
	Bln9         int              `db:"a_aktif_bln_9" json:"a_aktif_bln_9"`
	Bln10        int              `db:"a_aktif_bln_10" json:"a_aktif_bln_10"`
	Bln11        int              `db:"a_aktif_bln_11" json:"a_aktif_bln_11"`
	Bln12        int              `db:"a_aktif_bln_12" json:"a_aktif_bln_12"`
	LastSync     pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type Inpassing struct {
	IDInpassing    utils.UUID        `db:"id_inpassing" json:"id_inpassing"`
	IDSDM          utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM          *string           `db:"nm_sdm" json:"nm_sdm"`
	IDPangkatGol   int               `db:"id_pangkat_gol" json:"id_pangkat_gol"`
	KodeGol        *string           `db:"kode_gol" json:"kode_gol"`
	NmPangkat      *string           `db:"nm_pangkat" json:"nm_pangkat"`
	SkInpassing    string            `db:"sk_inpassing" json:"sk_inpassing"`
	TglSkInpassing *pk.SQLServerTime `db:"tgl_sk_inpassing" json:"tgl_sk_inpassing"`
	TmtSkInpassing *pk.SQLServerTime `db:"tmt_sk_inpassing" json:"tmt_sk_inpassing"`
	AngkaKredit    float64           `db:"angka_kredit" json:"angka_kredit"`
	MasaKerjaThn   int               `db:"masa_kerja_thn" json:"masa_kerja_thn"`
	MasaKerjaBln   int               `db:"masa_kerja_bln" json:"masa_kerja_bln"`
	LastSync       pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type Kesejahteraan struct {
	IDKesejahteraan utils.UUID       `db:"id_kesejahteraan" json:"id_kesejahteraan"`
	IDSDM           utils.UUID       `db:"id_sdm" json:"id_sdm"`
	NmSDM           *string          `db:"nm_sdm" json:"nm_sdm"`
	IDJnsSejahtera  int              `db:"id_jns_sejahtera" json:"id_jns_sejahtera"`
	NmJnsSejahtera  *string          `db:"nm_jns_sejahtera" json:"nm_jns_sejahtera"`
	NmKesejahteraan string           `db:"nm_kesejahteraan" json:"nm_kesejahteraan"`
	Penyelenggara   string           `db:"penyelenggara" json:"penyelenggara"`
	DariThn         int              `db:"dari_thn" json:"dari_thn"`
	SampaiThn       *int             `db:"sampai_thn" json:"sampai_thn"`
	Stat            *int             `db:"stat" json:"stat"`
	NoPeserta       *string          `db:"no_peserta" json:"no_peserta"`
	LastSync        pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type TugasBelajarSDM struct {
	IDTb         utils.UUID        `db:"id_tb" json:"id_tb"`
	IDSDM        utils.UUID        `db:"id_sdm" json:"id_sdm"`
	NmSDM        *string           `db:"nm_sdm" json:"nm_sdm"`
	IDSp         utils.NullUUID    `db:"id_sp" json:"id_sp"`
	NmSp         *string           `db:"nm_sp" json:"nm_sp"`
	IDJenjDidik  int               `db:"id_jenj_didik" json:"id_jenj_didik"`
	NmJenjDidik  *string           `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	NmProdi      string            `db:"nm_prodi" json:"nm_prodi"`
	TglMulaiTb   *pk.SQLServerTime `db:"tgl_mulai_tb" json:"tgl_mulai_tb"`
	Domisili     string            `db:"domisili" json:"domisili"`
	SkTb         *string           `db:"sk_tb" json:"sk_tb"`
	TglSkTb      *pk.SQLServerTime `db:"tgl_sk_tb" json:"tgl_sk_tb"`
	Pembiayaan   *string           `db:"pembiayaan" json:"pembiayaan"`
	TglLulus     *pk.SQLServerTime `db:"tgl_lulus" json:"tgl_lulus"`
	IDNegara     string            `db:"id_negara" json:"id_negara"`
	LastSync     pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type Tunjangan struct {
	IDTunj     utils.UUID       `db:"id_tunj" json:"id_tunj"`
	IDSDM      utils.UUID       `db:"id_sdm" json:"id_sdm"`
	NmSDM      *string          `db:"nm_sdm" json:"nm_sdm"`
	IDJnsTunj  *int             `db:"id_jns_tunj" json:"id_jns_tunj"`
	NmJnsTunj  *string          `db:"nm_jns_tunj" json:"nm_jns_tunj"`
	NmTunj     string           `db:"nm_tunj" json:"nm_tunj"`
	Instansi   *string          `db:"instansi" json:"instansi"`
	SumberDana *string          `db:"sumber_dana" json:"sumber_dana"`
	DariThn    int              `db:"dari_thn" json:"dari_thn"`
	SampaiThn  *int             `db:"sampai_thn" json:"sampai_thn"`
	Nominal    float64          `db:"nominal" json:"nominal"`
	Stat       *int             `db:"stat" json:"stat"`
	LastSync   pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// ---------- Params ----------

type KeaktifanPtkParams struct {
	IDRegPtk    *string `query:"id_reg_ptk"`
	IDSDM       *string `query:"id_sdm"`
	IDThnAjaran *int    `query:"id_thn_ajaran"`
	ASpHomebase *int    `query:"a_sp_homebase"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

type InpassingParams struct {
	IDInpassing  *string `query:"id_inpassing"`
	IDSDM        *string `query:"id_sdm"`
	IDPangkatGol *int    `query:"id_pangkat_gol"`
	Page         int     `query:"page"`
	Limit        int     `query:"limit"`
	SortBy       string  `query:"sort_by"`
	Order        string  `query:"order"`
}

type KesejahteraanParams struct {
	IDKesejahteraan *string `query:"id_kesejahteraan"`
	IDSDM           *string `query:"id_sdm"`
	IDJnsSejahtera  *int    `query:"id_jns_sejahtera"`
	DariThn         *int    `query:"dari_thn"`
	Page            int     `query:"page"`
	Limit           int     `query:"limit"`
	Search          string  `query:"search"`
	SortBy          string  `query:"sort_by"`
	Order           string  `query:"order"`
}

type TugasBelajarSDMParams struct {
	IDTb        *string `query:"id_tb"`
	IDSDM       *string `query:"id_sdm"`
	IDSp        *string `query:"id_sp"`
	IDJenjDidik *int    `query:"id_jenj_didik"`
	IDNegara    *string `query:"id_negara"`
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	Search      string  `query:"search"`
	SortBy      string  `query:"sort_by"`
	Order       string  `query:"order"`
}

type TunjanganParams struct {
	IDTunj    *string `query:"id_tunj"`
	IDSDM     *string `query:"id_sdm"`
	IDJnsTunj *int    `query:"id_jns_tunj"`
	DariThn   *int    `query:"dari_thn"`
	Page      int     `query:"page"`
	Limit     int     `query:"limit"`
	Search    string  `query:"search"`
	SortBy    string  `query:"sort_by"`
	Order     string  `query:"order"`
}

func normB10(page, limit *int, order *string) {
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

// ---------- Repository ----------

func (r *repository) GetKeaktifanPtk(ctx context.Context, p KeaktifanPtkParams) ([]KeaktifanPtk, int64, error) {
	normB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_reg_ptk", p.IDRegPtk)
	cb.AppendUUID("rp.id_sdm", p.IDSDM)
	cb.AppendInt("k.id_thn_ajaran", p.IDThnAjaran)
	cb.AppendInt("k.a_sp_homebase", p.ASpHomebase)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.keaktifan_ptk k
		LEFT JOIN pdrd.reg_ptk rp ON rp.id_reg_ptk = k.id_reg_ptk
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = rp.id_sdm
		LEFT JOIN ref.tahun_ajaran ta ON ta.id_thn_ajaran = k.id_thn_ajaran`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_thn_ajaran DESC, sd.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT k.id_reg_ptk, k.id_thn_ajaran, ta.nm_thn_ajaran,
			rp.id_sdm, sd.nm_sdm,
			k.a_sp_homebase,
			k.a_aktif_bln_1, k.a_aktif_bln_2, k.a_aktif_bln_3, k.a_aktif_bln_4,
			k.a_aktif_bln_5, k.a_aktif_bln_6, k.a_aktif_bln_7, k.a_aktif_bln_8,
			k.a_aktif_bln_9, k.a_aktif_bln_10, k.a_aktif_bln_11, k.a_aktif_bln_12,
			k.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KeaktifanPtk
	for rows.Next() {
		var m KeaktifanPtk
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetInpassing(ctx context.Context, p InpassingParams) ([]Inpassing, int64, error) {
	normB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("i.id_inpassing", p.IDInpassing)
	cb.AppendUUID("i.id_sdm", p.IDSDM)
	cb.AppendInt("i.id_pangkat_gol", p.IDPangkatGol)

	conds, args := cb.Build()
	conds = append(conds, "i.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.inpassing i
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = i.id_sdm
		LEFT JOIN ref.pangkat_golongan pg ON pg.id_pangkat_gol = i.id_pangkat_gol`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "i.tmt_sk_inpassing DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT i.id_inpassing,
			i.id_sdm, sd.nm_sdm,
			i.id_pangkat_gol, pg.kode_gol, pg.nm_pangkat,
			i.sk_inpassing, i.tgl_sk_inpassing, i.tmt_sk_inpassing,
			i.angka_kredit, i.masa_kerja_thn, i.masa_kerja_bln, i.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Inpassing
	for rows.Next() {
		var m Inpassing
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetKesejahteraan(ctx context.Context, p KesejahteraanParams) ([]Kesejahteraan, int64, error) {
	normB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("kj.id_kesejahteraan", p.IDKesejahteraan)
	cb.AppendUUID("kj.id_sdm", p.IDSDM)
	cb.AppendInt("kj.id_jns_sejahtera", p.IDJnsSejahtera)
	cb.AppendInt("kj.dari_thn", p.DariThn)
	cb.Like("kj.nm_kesejahteraan", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "kj.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.kesejahteraan kj
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = kj.id_sdm
		LEFT JOIN ref.jenis_kesejahteraan js ON js.id_jns_sejahtera = kj.id_jns_sejahtera`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "kj.dari_thn DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT kj.id_kesejahteraan,
			kj.id_sdm, sd.nm_sdm,
			kj.id_jns_sejahtera, js.nm_jns_sejahtera,
			kj.nm_kesejahteraan, kj.penyelenggara,
			kj.dari_thn, kj.sampai_thn, kj.stat, kj.no_peserta, kj.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Kesejahteraan
	for rows.Next() {
		var m Kesejahteraan
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetTugasBelajarSDM(ctx context.Context, p TugasBelajarSDMParams) ([]TugasBelajarSDM, int64, error) {
	normB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("tb.id_tb", p.IDTb)
	cb.AppendUUID("tb.id_sdm", p.IDSDM)
	cb.AppendUUID("tb.id_sp", p.IDSp)
	cb.AppendInt("tb.id_jenj_didik", p.IDJenjDidik)
	cb.AppendString("tb.id_negara", p.IDNegara)
	cb.Like("tb.nm_prodi", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "tb.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.tugas_belajar tb
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = tb.id_sdm
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = tb.id_sp
		LEFT JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = tb.id_jenj_didik`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "tb.tgl_mulai_tb DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT tb.id_tb,
			tb.id_sdm, sd.nm_sdm,
			tb.id_sp, sp.nm_lemb AS nm_sp,
			tb.id_jenj_didik, jp.nm_jenj_didik,
			tb.nm_prodi, tb.tgl_mulai_tb, tb.domisili,
			tb.sk_tb, tb.tgl_sk_tb, tb.pembiayaan, tb.tgl_lulus, tb.id_negara, tb.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []TugasBelajarSDM
	for rows.Next() {
		var m TugasBelajarSDM
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetTunjangan(ctx context.Context, p TunjanganParams) ([]Tunjangan, int64, error) {
	normB10(&p.Page, &p.Limit, &p.Order)

	cb := helper.NewCondBuilder()
	cb.AppendUUID("t.id_tunj", p.IDTunj)
	cb.AppendUUID("t.id_sdm", p.IDSDM)
	cb.AppendInt("t.id_jns_tunj", p.IDJnsTunj)
	cb.AppendInt("t.dari_thn", p.DariThn)
	cb.Like("t.nm_tunj", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "t.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.tunjangan t
		LEFT JOIN pdrd.sdm sd ON sd.id_sdm = t.id_sdm
		LEFT JOIN ref.jenis_tunjangan jt ON jt.id_jns_tunj = t.id_jns_tunj`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "t.dari_thn DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT t.id_tunj,
			t.id_sdm, sd.nm_sdm,
			t.id_jns_tunj, jt.nm_jns_tunj,
			t.nm_tunj, t.instansi, t.sumber_dana,
			t.dari_thn, t.sampai_thn, t.nominal, t.stat, t.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, (p.Page-1)*p.Limit, p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Tunjangan
	for rows.Next() {
		var m Tunjangan
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ---------- Service ----------

func (s *service) GetKeaktifanPtk(ctx context.Context, p KeaktifanPtkParams) ([]KeaktifanPtk, int64, error) {
	return cached(ctx, fmt.Sprintf("keaktifan:%s", utils.HashParams(p)), cacheTTL,
		func() ([]KeaktifanPtk, int64, error) { return s.repo.GetKeaktifanPtk(ctx, p) })
}
func (s *service) GetInpassing(ctx context.Context, p InpassingParams) ([]Inpassing, int64, error) {
	return cached(ctx, fmt.Sprintf("inpassing:%s", utils.HashParams(p)), cacheTTL,
		func() ([]Inpassing, int64, error) { return s.repo.GetInpassing(ctx, p) })
}
func (s *service) GetKesejahteraan(ctx context.Context, p KesejahteraanParams) ([]Kesejahteraan, int64, error) {
	return cached(ctx, fmt.Sprintf("sejahtera:%s", utils.HashParams(p)), cacheTTL,
		func() ([]Kesejahteraan, int64, error) { return s.repo.GetKesejahteraan(ctx, p) })
}
func (s *service) GetTugasBelajarSDM(ctx context.Context, p TugasBelajarSDMParams) ([]TugasBelajarSDM, int64, error) {
	return cached(ctx, fmt.Sprintf("tubel_sdm:%s", utils.HashParams(p)), cacheTTL,
		func() ([]TugasBelajarSDM, int64, error) { return s.repo.GetTugasBelajarSDM(ctx, p) })
}
func (s *service) GetTunjangan(ctx context.Context, p TunjanganParams) ([]Tunjangan, int64, error) {
	return cached(ctx, fmt.Sprintf("tunjangan:%s", utils.HashParams(p)), cacheTTL,
		func() ([]Tunjangan, int64, error) { return s.repo.GetTunjangan(ctx, p) })
}

// ---------- Handlers ----------

func (h *Handler) GetKeaktifanPtk(c *fiber.Ctx) error {
	var p KeaktifanPtkParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKeaktifanPtk(c.Context(), p)
	if err != nil {
		log.Printf("keaktifan_ptk: %v", err)
		return response.InternalError(c, "Gagal mengambil data keaktifan PTK")
	}
	normB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data keaktifan PTK", data, p.Page, p.Limit, total)
}

func (h *Handler) GetInpassing(c *fiber.Ctx) error {
	var p InpassingParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetInpassing(c.Context(), p)
	if err != nil {
		log.Printf("inpassing: %v", err)
		return response.InternalError(c, "Gagal mengambil data inpassing")
	}
	normB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data inpassing", data, p.Page, p.Limit, total)
}

func (h *Handler) GetKesejahteraan(c *fiber.Ctx) error {
	var p KesejahteraanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetKesejahteraan(c.Context(), p)
	if err != nil {
		log.Printf("kesejahteraan: %v", err)
		return response.InternalError(c, "Gagal mengambil data kesejahteraan")
	}
	normB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data kesejahteraan", data, p.Page, p.Limit, total)
}

func (h *Handler) GetTugasBelajarSDM(c *fiber.Ctx) error {
	var p TugasBelajarSDMParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetTugasBelajarSDM(c.Context(), p)
	if err != nil {
		log.Printf("tugas_belajar_sdm: %v", err)
		return response.InternalError(c, "Gagal mengambil data tugas belajar SDM")
	}
	normB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data tugas belajar SDM", data, p.Page, p.Limit, total)
}

func (h *Handler) GetTunjangan(c *fiber.Ctx) error {
	var p TunjanganParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.GetTunjangan(c.Context(), p)
	if err != nil {
		log.Printf("tunjangan: %v", err)
		return response.InternalError(c, "Gagal mengambil data tunjangan")
	}
	normB10(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data tunjangan", data, p.Page, p.Limit, total)
}
