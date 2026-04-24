// Package mbkm — endpoint MBKM Kampus Merdeka (schema mbkm di pdut).
// GET-only — 6 tabel untuk sync data MBKM ke aplikasi konsumen.
// Note: full lifecycle KKN ada di si-kkn (service terpisah, Postgres), bukan di sini.
package mbkm

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/apps/pdrd/helper"
	cache "github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/myunila/api-service/internal/response"
	pk "github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

const cacheTTL = 10 * time.Minute

// ============================================================================
// Entities
// ============================================================================

type DaftarKampusMerdeka struct {
	IDDaftar       utils.UUID       `db:"id_daftar_kampus_merdeka" json:"id_daftar_kampus_merdeka"`
	IDPeriodeMbkm  utils.UUID       `db:"id_periode_mbkm" json:"id_periode_mbkm"`
	NmPeriodeMbkm  *string          `db:"nm_periode_mbkm" json:"nm_periode_mbkm"`
	IDRegPd        utils.NullUUID   `db:"id_reg_pd" json:"id_reg_pd"`
	IDSp           utils.NullUUID   `db:"id_sp" json:"id_sp"`
	NmSp           *string          `db:"nm_sp" json:"nm_sp"`
	LokasiMbkm     *string          `db:"lokasi_mbkm" json:"lokasi_mbkm"`
	NmPd           *string          `db:"nm_pd" json:"nm_pd"`
	Nipd           *string          `db:"nipd" json:"nipd"`
	ADiluarPt      int              `db:"a_diluar_pt" json:"a_diluar_pt"`
	LastSync       pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type PeriodeKampusMerdeka struct {
	IDPeriodeMbkm   utils.UUID       `db:"id_periode_mbkm" json:"id_periode_mbkm"`
	IDSmt           string           `db:"id_smt" json:"id_smt"`
	NmSmt           *string          `db:"nm_smt" json:"nm_smt"`
	IDJnsAktMhs     int              `db:"id_jns_akt_mhs" json:"id_jns_akt_mhs"`
	NmJnsAktMhs     *string          `db:"nm_jns_akt_mhs" json:"nm_jns_akt_mhs"`
	NmPeriodeMbkm   string           `db:"nm_periode_mbkm" json:"nm_periode_mbkm"`
	NmPenyelenggara *string          `db:"nm_penyelenggara" json:"nm_penyelenggara"`
	WaktuMulai      *string          `db:"waktu_mulai" json:"waktu_mulai"`
	WaktuSelesai    *string          `db:"waktu_selesai" json:"waktu_selesai"`
	AAktif          *int             `db:"a_aktif" json:"a_aktif"`
	LastSync        pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type MkKonversi struct {
	IDMkKonversi  utils.UUID        `db:"id_mk_konversi" json:"id_mk_konversi"`
	IDSp          utils.NullUUID    `db:"id_sp" json:"id_sp"`
	IDDaftar      utils.UUID        `db:"id_daftar_kampus_merdeka" json:"id_daftar_kampus_merdeka"`
	NmVerifikator *string           `db:"nm_verifikator" json:"nm_verifikator"`
	WktSelesaiVer *pk.SQLServerTime `db:"wkt_selesai_ver" json:"wkt_selesai_ver"`
	KetPeriksa    *string           `db:"ket_periksa" json:"ket_periksa"`
	NmMk          *string           `db:"nm_mk" json:"nm_mk"`
	KodeMk        *string           `db:"kode_mk" json:"kode_mk"`
	SksMk         *float64          `db:"sks_mk" json:"sks_mk"`
	StatAjuan     string            `db:"stat_ajuan" json:"stat_ajuan"`
	WktAjuan      pk.SQLServerTime  `db:"wkt_ajuan" json:"wkt_ajuan"`
	LastSync      pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

type KonversiAktMhs struct {
	IDKonversiAktivitas utils.UUID       `db:"id_konversi_aktivitas" json:"id_konversi_aktivitas"`
	IDMk                utils.UUID       `db:"id_mk" json:"id_mk"`
	KodeMk              *string          `db:"kode_mk" json:"kode_mk"`
	NmMk                *string          `db:"nm_mk" json:"nm_mk"`
	IDAngAktMhs         utils.NullUUID   `db:"id_ang_akt_mhs" json:"id_ang_akt_mhs"`
	IDSmt               *string          `db:"id_smt" json:"id_smt"`
	NmSmt               *string          `db:"nm_smt" json:"nm_smt"`
	IDAktMhs            utils.UUID       `db:"id_akt_mhs" json:"id_akt_mhs"`
	JudulAktMhs         *string          `db:"judul_akt_mhs" json:"judul_akt_mhs"`
	IDDaftar            utils.NullUUID   `db:"id_daftar_kampus_merdeka" json:"id_daftar_kampus_merdeka"`
	NilaiAngka          *float64         `db:"nilai_angka" json:"nilai_angka"`
	NilaiHuruf          *string          `db:"nilai_huruf" json:"nilai_huruf"`
	NilaiIndeks         *float64         `db:"nilai_indeks" json:"nilai_indeks"`
	SksMk               *float64         `db:"sks_mk" json:"sks_mk"`
	LastSync            pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type EkuivTransfer struct {
	IDEkuivalensi    utils.UUID       `db:"id_ekuivalensi" json:"id_ekuivalensi"`
	IDAktMhs         utils.NullUUID   `db:"id_akt_mhs" json:"id_akt_mhs"`
	IDMk             utils.UUID       `db:"id_mk" json:"id_mk"`
	KodeMk           *string          `db:"kode_mk" json:"kode_mk"`
	NmMk             *string          `db:"nm_mk" json:"nm_mk"`
	IDSmt            *string          `db:"id_smt" json:"id_smt"`
	NmSmt            *string          `db:"nm_smt" json:"nm_smt"`
	IDRegPd          utils.UUID       `db:"id_reg_pd" json:"id_reg_pd"`
	Nipd             *string          `db:"nipd" json:"nipd"`
	KodeMkAsal       string           `db:"kode_mk_asal" json:"kode_mk_asal"`
	NmMkAsal         string           `db:"nm_mk_asal" json:"nm_mk_asal"`
	SksAsal          float64          `db:"sks_asal" json:"sks_asal"`
	SksDiakui        int              `db:"sks_diakui" json:"sks_diakui"`
	NilaiHurufAsal   string           `db:"nilai_huruf_asal" json:"nilai_huruf_asal"`
	NilaiHurufDiakui string           `db:"nilai_huruf_diakui" json:"nilai_huruf_diakui"`
	NilaiAngkaDiakui float64          `db:"nilai_angka_diakui" json:"nilai_angka_diakui"`
	IDSp             utils.NullUUID   `db:"id_sp" json:"id_sp"`
	LastSync         pk.SQLServerTime `db:"last_sync" json:"last_sync"`
}

type LogBookMbkm struct {
	IDLogBook         utils.UUID        `db:"id_log_book_mbkm" json:"id_log_book_mbkm"`
	IDMkKonversi      utils.UUID        `db:"id_mk_konversi" json:"id_mk_konversi"`
	NmMk              *string           `db:"nm_mk" json:"nm_mk"`
	KodeMk            *string           `db:"kode_mk" json:"kode_mk"`
	NmVerifikator     *string           `db:"nm_verifikator" json:"nm_verifikator"`
	WktSelesaiVer     *pk.SQLServerTime `db:"wkt_selesai_ver" json:"wkt_selesai_ver"`
	KetPeriksa        *string           `db:"ket_periksa" json:"ket_periksa"`
	JudulLogBook      string            `db:"judul_log_book" json:"judul_log_book"`
	AktivitasKegiatan string            `db:"aktivitas_kegiatan" json:"aktivitas_kegiatan"`
	LokasiKegiatan    *string           `db:"lokasi_kegiatan" json:"lokasi_kegiatan"`
	TglKegiatan       pk.SQLServerTime  `db:"tgl_kegiatan" json:"tgl_kegiatan"`
	StatAjuan         *string           `db:"stat_ajuan" json:"stat_ajuan"`
	WktAjuan          *pk.SQLServerTime `db:"wkt_ajuan" json:"wkt_ajuan"`
	LastSync          pk.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// ============================================================================
// Params
// ============================================================================

type BaseParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"`
}

func (p *BaseParams) Normalize() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	if p.Order == "" {
		p.Order = "ASC"
	}
}
func (p *BaseParams) Offset() int { return (p.Page - 1) * p.Limit }

type DaftarParams struct {
	BaseParams
	IDDaftar      *string `query:"id_daftar_kampus_merdeka"`
	IDPeriodeMbkm *string `query:"id_periode_mbkm"`
	IDRegPd       *string `query:"id_reg_pd"`
	IDSp          *string `query:"id_sp"`
	ADiluarPt     *int    `query:"a_diluar_pt"`
}

type PeriodeParams struct {
	BaseParams
	IDPeriodeMbkm *string `query:"id_periode_mbkm"`
	IDSmt         *string `query:"id_smt"`
	IDJnsAktMhs   *int    `query:"id_jns_akt_mhs"`
	AAktif        *int    `query:"a_aktif"`
}

type MkKonversiParams struct {
	BaseParams
	IDMkKonversi *string `query:"id_mk_konversi"`
	IDSp         *string `query:"id_sp"`
	IDDaftar     *string `query:"id_daftar_kampus_merdeka"`
	StatAjuan    *string `query:"stat_ajuan"`
}

type KonversiAktMhsParams struct {
	BaseParams
	IDKonversi *string `query:"id_konversi_aktivitas"`
	IDMk       *string `query:"id_mk"`
	IDAktMhs   *string `query:"id_akt_mhs"`
	IDSmt      *string `query:"id_smt"`
	IDDaftar   *string `query:"id_daftar_kampus_merdeka"`
}

type EkuivTransferParams struct {
	BaseParams
	IDEkuivalensi *string `query:"id_ekuivalensi"`
	IDRegPd       *string `query:"id_reg_pd"`
	IDMk          *string `query:"id_mk"`
	IDSmt         *string `query:"id_smt"`
	IDSp          *string `query:"id_sp"`
}

type LogBookParams struct {
	BaseParams
	IDLogBook    *string `query:"id_log_book_mbkm"`
	IDMkKonversi *string `query:"id_mk_konversi"`
	StatAjuan    *string `query:"stat_ajuan"`
}

// ============================================================================
// Repository
// ============================================================================

type Repository interface {
	ListDaftar(ctx context.Context, p DaftarParams) ([]DaftarKampusMerdeka, int64, error)
	ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKampusMerdeka, int64, error)
	ListMkKonversi(ctx context.Context, p MkKonversiParams) ([]MkKonversi, int64, error)
	ListKonversiAktMhs(ctx context.Context, p KonversiAktMhsParams) ([]KonversiAktMhs, int64, error)
	ListEkuivTransfer(ctx context.Context, p EkuivTransferParams) ([]EkuivTransfer, int64, error)
	ListLogBook(ctx context.Context, p LogBookParams) ([]LogBookMbkm, int64, error)

	// Batch 15 — CRUD extension (24 methods, 6 resource × 4 op)
	GetDaftar(ctx context.Context, id string) (*DaftarKampusMerdeka, error)
	CreateDaftar(ctx context.Context, in DaftarCreate) (string, error)
	UpdateDaftar(ctx context.Context, id string, in DaftarUpdate) error
	DeleteDaftar(ctx context.Context, id, idUpdater string) error

	GetPeriode(ctx context.Context, id string) (*PeriodeKampusMerdeka, error)
	CreatePeriode(ctx context.Context, in PeriodeCreate) (string, error)
	UpdatePeriode(ctx context.Context, id string, in PeriodeUpdate) error
	DeletePeriode(ctx context.Context, id, idUpdater string) error

	GetMkKonversi(ctx context.Context, id string) (*MkKonversi, error)
	CreateMkKonversi(ctx context.Context, in MkKonversiCreate) (string, error)
	UpdateMkKonversi(ctx context.Context, id string, in MkKonversiUpdate) error
	DeleteMkKonversi(ctx context.Context, id, idUpdater string) error

	GetKonversiAktMhs(ctx context.Context, id string) (*KonversiAktMhs, error)
	CreateKonversiAktMhs(ctx context.Context, in KonversiAktMhsCreate) (string, error)
	UpdateKonversiAktMhs(ctx context.Context, id string, in KonversiAktMhsUpdate) error
	DeleteKonversiAktMhs(ctx context.Context, id, idUpdater string) error

	GetEkuivTransfer(ctx context.Context, id string) (*EkuivTransfer, error)
	CreateEkuivTransfer(ctx context.Context, in EkuivTransferCreate) (string, error)
	UpdateEkuivTransfer(ctx context.Context, id string, in EkuivTransferUpdate) error
	DeleteEkuivTransfer(ctx context.Context, id, idUpdater string) error

	GetLogBook(ctx context.Context, id string) (*LogBookMbkm, error)
	CreateLogBook(ctx context.Context, in LogBookCreate) (string, error)
	UpdateLogBook(ctx context.Context, id string, in LogBookUpdate) error
	DeleteLogBook(ctx context.Context, id, idUpdater string) error
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

func (r *repository) ListDaftar(ctx context.Context, p DaftarParams) ([]DaftarKampusMerdeka, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("d.id_daftar_kampus_merdeka", p.IDDaftar)
	cb.AppendUUID("d.id_periode_mbkm", p.IDPeriodeMbkm)
	cb.AppendUUID("d.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("d.id_sp", p.IDSp)
	cb.AppendInt("d.a_diluar_pt", p.ADiluarPt)
	cb.Like("d.nm_pd", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "d.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM mbkm.daftar_kampus_merdeka d
		LEFT JOIN mbkm.periode_kampus_merdeka p ON p.id_periode_mbkm = d.id_periode_mbkm
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = d.id_sp`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "d.nipd", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		d.id_daftar_kampus_merdeka,
		d.id_periode_mbkm, p.nm_periode_mbkm,
		d.id_reg_pd,
		d.id_sp, sp.nm_lemb AS nm_sp,
		d.lokasi_mbkm, d.nm_pd, d.nipd, d.a_diluar_pt, d.last_sync
		%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []DaftarKampusMerdeka
	for rows.Next() {
		var m DaftarKampusMerdeka
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKampusMerdeka, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("pk.id_periode_mbkm", p.IDPeriodeMbkm)
	cb.AppendString("pk.id_smt", p.IDSmt)
	cb.AppendInt("pk.id_jns_akt_mhs", p.IDJnsAktMhs)
	cb.AppendInt("pk.a_aktif", p.AAktif)
	cb.Like("pk.nm_periode_mbkm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pk.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM mbkm.periode_kampus_merdeka pk
		LEFT JOIN ref.semester rs ON rs.id_smt = pk.id_smt
		LEFT JOIN ref.jenis_akt_mhs ja ON ja.id_jns_akt_mhs = pk.id_jns_akt_mhs`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "pk.id_smt DESC, pk.nm_periode_mbkm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		pk.id_periode_mbkm,
		pk.id_smt, rs.nm_smt,
		pk.id_jns_akt_mhs, ja.nm_jns_akt_mhs,
		pk.nm_periode_mbkm, pk.nm_penyelenggara,
		pk.waktu_mulai, pk.waktu_selesai, pk.a_aktif, pk.last_sync
		%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PeriodeKampusMerdeka
	for rows.Next() {
		var m PeriodeKampusMerdeka
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListMkKonversi(ctx context.Context, p MkKonversiParams) ([]MkKonversi, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("mk.id_mk_konversi", p.IDMkKonversi)
	cb.AppendUUID("mk.id_sp", p.IDSp)
	cb.AppendUUID("mk.id_daftar_kampus_merdeka", p.IDDaftar)
	cb.AppendString("mk.stat_ajuan", p.StatAjuan)
	cb.Like("mk.nm_mk", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "mk.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM mbkm.mk_konversi mk WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "mk.wkt_ajuan DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		mk.id_mk_konversi, mk.id_sp, mk.id_daftar_kampus_merdeka,
		mk.nm_verifikator, mk.wkt_selesai_ver, mk.ket_periksa,
		mk.nm_mk, mk.kode_mk, mk.sks_mk, mk.stat_ajuan, mk.wkt_ajuan, mk.last_sync
		FROM mbkm.mk_konversi mk WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []MkKonversi
	for rows.Next() {
		var m MkKonversi
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKonversiAktMhs(ctx context.Context, p KonversiAktMhsParams) ([]KonversiAktMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_konversi_aktivitas", p.IDKonversi)
	cb.AppendUUID("k.id_mk", p.IDMk)
	cb.AppendUUID("k.id_akt_mhs", p.IDAktMhs)
	cb.AppendString("k.id_smt", p.IDSmt)
	cb.AppendUUID("k.id_daftar_kampus_merdeka", p.IDDaftar)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM mbkm.konversi_akt_mhs k
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN pdrd.akt_mhs am ON am.id_akt_mhs = k.id_akt_mhs
		LEFT JOIN ref.semester rs ON rs.id_smt = k.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_smt DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		k.id_konversi_aktivitas,
		k.id_mk, mk.kode_mk, mk.nm_mk,
		k.id_ang_akt_mhs,
		k.id_smt, rs.nm_smt,
		k.id_akt_mhs, am.judul_akt_mhs,
		k.id_daftar_kampus_merdeka,
		k.nilai_angka, k.nilai_huruf, k.nilai_indeks, k.sks_mk, k.last_sync
		%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KonversiAktMhs
	for rows.Next() {
		var m KonversiAktMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListEkuivTransfer(ctx context.Context, p EkuivTransferParams) ([]EkuivTransfer, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("e.id_ekuivalensi", p.IDEkuivalensi)
	cb.AppendUUID("e.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("e.id_mk", p.IDMk)
	cb.AppendString("e.id_smt", p.IDSmt)
	cb.AppendUUID("e.id_sp", p.IDSp)
	cb.Like("e.nm_mk_asal", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "e.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM mbkm.ekuiv_transfer e
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = e.id_mk
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = e.id_reg_pd
		LEFT JOIN ref.semester rs ON rs.id_smt = e.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "e.id_smt DESC, mk.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		e.id_ekuivalensi, e.id_akt_mhs,
		e.id_mk, mk.kode_mk, mk.nm_mk,
		e.id_smt, rs.nm_smt,
		e.id_reg_pd, rp.nipd,
		e.kode_mk_asal, e.nm_mk_asal, e.sks_asal, e.sks_diakui,
		e.nilai_huruf_asal, e.nilai_huruf_diakui, e.nilai_angka_diakui,
		e.id_sp, e.last_sync
		%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []EkuivTransfer
	for rows.Next() {
		var m EkuivTransfer
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListLogBook(ctx context.Context, p LogBookParams) ([]LogBookMbkm, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("lb.id_log_book_mbkm", p.IDLogBook)
	cb.AppendUUID("lb.id_mk_konversi", p.IDMkKonversi)
	cb.AppendString("lb.stat_ajuan", p.StatAjuan)
	cb.Like("lb.judul_log_book", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "lb.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM mbkm.log_book_mbkm lb
		LEFT JOIN mbkm.mk_konversi mk ON mk.id_mk_konversi = lb.id_mk_konversi`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "lb.tgl_kegiatan DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		lb.id_log_book_mbkm,
		lb.id_mk_konversi, mk.nm_mk, mk.kode_mk,
		lb.nm_verifikator, lb.wkt_selesai_ver, lb.ket_periksa,
		lb.judul_log_book, lb.aktivitas_kegiatan, lb.lokasi_kegiatan,
		lb.tgl_kegiatan, lb.stat_ajuan, lb.wkt_ajuan, lb.last_sync
		%s WHERE %s ORDER BY %s %s OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []LogBookMbkm
	for rows.Next() {
		var m LogBookMbkm
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// Service (with cache)
// ============================================================================

type Service interface {
	ListDaftar(ctx context.Context, p DaftarParams) ([]DaftarKampusMerdeka, int64, error)
	ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKampusMerdeka, int64, error)
	ListMkKonversi(ctx context.Context, p MkKonversiParams) ([]MkKonversi, int64, error)
	ListKonversiAktMhs(ctx context.Context, p KonversiAktMhsParams) ([]KonversiAktMhs, int64, error)
	ListEkuivTransfer(ctx context.Context, p EkuivTransferParams) ([]EkuivTransfer, int64, error)
	ListLogBook(ctx context.Context, p LogBookParams) ([]LogBookMbkm, int64, error)

	// Batch 15 — CRUD extension
	GetDaftar(ctx context.Context, id string) (*DaftarKampusMerdeka, error)
	CreateDaftar(ctx context.Context, in DaftarCreate) (string, error)
	UpdateDaftar(ctx context.Context, id string, in DaftarUpdate) error
	DeleteDaftar(ctx context.Context, id, idUpdater string) error

	GetPeriode(ctx context.Context, id string) (*PeriodeKampusMerdeka, error)
	CreatePeriode(ctx context.Context, in PeriodeCreate) (string, error)
	UpdatePeriode(ctx context.Context, id string, in PeriodeUpdate) error
	DeletePeriode(ctx context.Context, id, idUpdater string) error

	GetMkKonversi(ctx context.Context, id string) (*MkKonversi, error)
	CreateMkKonversi(ctx context.Context, in MkKonversiCreate) (string, error)
	UpdateMkKonversi(ctx context.Context, id string, in MkKonversiUpdate) error
	DeleteMkKonversi(ctx context.Context, id, idUpdater string) error

	GetKonversiAktMhs(ctx context.Context, id string) (*KonversiAktMhs, error)
	CreateKonversiAktMhs(ctx context.Context, in KonversiAktMhsCreate) (string, error)
	UpdateKonversiAktMhs(ctx context.Context, id string, in KonversiAktMhsUpdate) error
	DeleteKonversiAktMhs(ctx context.Context, id, idUpdater string) error

	GetEkuivTransfer(ctx context.Context, id string) (*EkuivTransfer, error)
	CreateEkuivTransfer(ctx context.Context, in EkuivTransferCreate) (string, error)
	UpdateEkuivTransfer(ctx context.Context, id string, in EkuivTransferUpdate) error
	DeleteEkuivTransfer(ctx context.Context, id, idUpdater string) error

	GetLogBook(ctx context.Context, id string) (*LogBookMbkm, error)
	CreateLogBook(ctx context.Context, in LogBookCreate) (string, error)
	UpdateLogBook(ctx context.Context, id string, in LogBookUpdate) error
	DeleteLogBook(ctx context.Context, id, idUpdater string) error
}

type service struct {
	repo  Repository
	rConn *redis.Client
}

func NewService(r Repository, c *redis.Client) Service { return &service{repo: r, rConn: c} }

func cached[T any](ctx context.Context, key string, fetch func() ([]T, int64, error)) ([]T, int64, error) {
	d, tk := "mbkm:"+key+":data", "mbkm:"+key+":total"
	if ds, err := cache.Get(ctx, d); err == nil {
		if ts, err2 := cache.Get(ctx, tk); err2 == nil {
			var data []T
			var total int64
			if json.Unmarshal([]byte(ds), &data) == nil && json.Unmarshal([]byte(ts), &total) == nil {
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
	cache.Set(ctx, d, string(dj), cacheTTL)
	cache.Set(ctx, tk, string(tj), cacheTTL)
	return data, total, nil
}

func (s *service) ListDaftar(ctx context.Context, p DaftarParams) ([]DaftarKampusMerdeka, int64, error) {
	return cached(ctx, fmt.Sprintf("daftar:%s", utils.HashParams(p)),
		func() ([]DaftarKampusMerdeka, int64, error) { return s.repo.ListDaftar(ctx, p) })
}
func (s *service) ListPeriode(ctx context.Context, p PeriodeParams) ([]PeriodeKampusMerdeka, int64, error) {
	return cached(ctx, fmt.Sprintf("periode:%s", utils.HashParams(p)),
		func() ([]PeriodeKampusMerdeka, int64, error) { return s.repo.ListPeriode(ctx, p) })
}
func (s *service) ListMkKonversi(ctx context.Context, p MkKonversiParams) ([]MkKonversi, int64, error) {
	return cached(ctx, fmt.Sprintf("mk_konv:%s", utils.HashParams(p)),
		func() ([]MkKonversi, int64, error) { return s.repo.ListMkKonversi(ctx, p) })
}
func (s *service) ListKonversiAktMhs(ctx context.Context, p KonversiAktMhsParams) ([]KonversiAktMhs, int64, error) {
	return cached(ctx, fmt.Sprintf("konv_akt:%s", utils.HashParams(p)),
		func() ([]KonversiAktMhs, int64, error) { return s.repo.ListKonversiAktMhs(ctx, p) })
}
func (s *service) ListEkuivTransfer(ctx context.Context, p EkuivTransferParams) ([]EkuivTransfer, int64, error) {
	return cached(ctx, fmt.Sprintf("ekuiv:%s", utils.HashParams(p)),
		func() ([]EkuivTransfer, int64, error) { return s.repo.ListEkuivTransfer(ctx, p) })
}
func (s *service) ListLogBook(ctx context.Context, p LogBookParams) ([]LogBookMbkm, int64, error) {
	return cached(ctx, fmt.Sprintf("logbook:%s", utils.HashParams(p)),
		func() ([]LogBookMbkm, int64, error) { return s.repo.ListLogBook(ctx, p) })
}

// ============================================================================
// Handlers
// ============================================================================

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

func (h *Handler) ListDaftar(c *fiber.Ctx) error {
	var p DaftarParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListDaftar(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.daftar: %v", err)
		return response.InternalError(c, "Gagal mengambil data pendaftaran MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pendaftaran MBKM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListPeriode(c *fiber.Ctx) error {
	var p PeriodeParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListPeriode(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.periode: %v", err)
		return response.InternalError(c, "Gagal mengambil data periode MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data periode MBKM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListMkKonversi(c *fiber.Ctx) error {
	var p MkKonversiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListMkKonversi(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.mk_konversi: %v", err)
		return response.InternalError(c, "Gagal mengambil data MK konversi MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data MK konversi MBKM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListKonversiAktMhs(c *fiber.Ctx) error {
	var p KonversiAktMhsParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListKonversiAktMhs(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.konversi_akt: %v", err)
		return response.InternalError(c, "Gagal mengambil data konversi aktivitas MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data konversi aktivitas MBKM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListEkuivTransfer(c *fiber.Ctx) error {
	var p EkuivTransferParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListEkuivTransfer(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.ekuiv: %v", err)
		return response.InternalError(c, "Gagal mengambil data ekuivalensi transfer MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data ekuivalensi transfer MBKM", data, p.Page, p.Limit, total)
}

func (h *Handler) ListLogBook(c *fiber.Ctx) error {
	var p LogBookParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListLogBook(c.Context(), p)
	if err != nil {
		log.Printf("mbkm.logbook: %v", err)
		return response.InternalError(c, "Gagal mengambil data log book MBKM")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data log book MBKM", data, p.Page, p.Limit, total)
}

// ============================================================================
// Router
// ============================================================================

func RegisterRoutesWithMiddleware(router fiber.Router, db *sqlx.DB, redisCli *redis.Client, middlewares []fiber.Handler) {
	repo := NewRepository(db)
	svc := NewService(repo, redisCli)
	h := NewHandler(svc)

	var g fiber.Router
	if len(middlewares) > 0 {
		g = router.Group("/mbkm", middlewares...)
	} else {
		g = router.Group("/mbkm", middleware.KongAuth())
	}
	g.Use(middleware.RateLimiterMiddleware(redisCli, middleware.DefaultRateLimiterConfig()))

	g.Get("/list_daftar_kampus_merdeka", h.ListDaftar)
	g.Get("/list_periode_kampus_merdeka", h.ListPeriode)
	g.Get("/list_mk_konversi", h.ListMkKonversi)
	g.Get("/list_konversi_akt_mhs", h.ListKonversiAktMhs)
	g.Get("/list_ekuiv_transfer", h.ListEkuivTransfer)
	g.Get("/list_log_book_mbkm", h.ListLogBook)

	// Batch 15 — CRUD (GET detail + POST + PUT + DELETE untuk 6 resource)
	g.Get("/daftar_kampus_merdeka/:id", h.GetDaftar)
	g.Post("/daftar_kampus_merdeka", h.CreateDaftar)
	g.Put("/daftar_kampus_merdeka/:id", h.UpdateDaftar)
	g.Delete("/daftar_kampus_merdeka/:id", h.DeleteDaftar)

	g.Get("/periode_kampus_merdeka/:id", h.GetPeriode)
	g.Post("/periode_kampus_merdeka", h.CreatePeriode)
	g.Put("/periode_kampus_merdeka/:id", h.UpdatePeriode)
	g.Delete("/periode_kampus_merdeka/:id", h.DeletePeriode)

	g.Get("/mk_konversi/:id", h.GetMkKonversi)
	g.Post("/mk_konversi", h.CreateMkKonversi)
	g.Put("/mk_konversi/:id", h.UpdateMkKonversi)
	g.Delete("/mk_konversi/:id", h.DeleteMkKonversi)

	g.Get("/konversi_akt_mhs/:id", h.GetKonversiAktMhs)
	g.Post("/konversi_akt_mhs", h.CreateKonversiAktMhs)
	g.Put("/konversi_akt_mhs/:id", h.UpdateKonversiAktMhs)
	g.Delete("/konversi_akt_mhs/:id", h.DeleteKonversiAktMhs)

	g.Get("/ekuiv_transfer/:id", h.GetEkuivTransfer)
	g.Post("/ekuiv_transfer", h.CreateEkuivTransfer)
	g.Put("/ekuiv_transfer/:id", h.UpdateEkuivTransfer)
	g.Delete("/ekuiv_transfer/:id", h.DeleteEkuivTransfer)

	g.Get("/log_book_mbkm/:id", h.GetLogBook)
	g.Post("/log_book_mbkm", h.CreateLogBook)
	g.Put("/log_book_mbkm/:id", h.UpdateLogBook)
	g.Delete("/log_book_mbkm/:id", h.DeleteLogBook)
}
