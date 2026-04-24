package mbkm

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/myunila/api-service/internal/response"
)

// ============================================================================
// MBKM CRUD extension (Batch 15) — 6 resource × (GetByID + POST + PUT + DELETE)
// = 24 ops tambahan. Dipakai oleh aplikasi MBKM/KKN eksternal untuk manage data.
// ============================================================================

var ErrNotFound = errors.New("mbkm: record not found")

// ============================================================================
// DTO Create / Update
// ============================================================================

type DaftarCreate struct {
	IDDaftar      *string `json:"id_daftar_kampus_merdeka"`
	IDPeriodeMbkm string  `json:"id_periode_mbkm" validate:"required"`
	IDRegPd       *string `json:"id_reg_pd"`
	IDSp          *string `json:"id_sp"`
	LokasiMbkm    *string `json:"lokasi_mbkm"`
	NmPd          *string `json:"nm_pd"`
	Nipd          *string `json:"nipd"`
	ADiluarPt     *int    `json:"a_diluar_pt"`
	IDCreator     string  `json:"id_creator" validate:"required"`
}
type DaftarUpdate struct {
	IDPeriodeMbkm *string `json:"id_periode_mbkm"`
	IDRegPd       *string `json:"id_reg_pd"`
	IDSp          *string `json:"id_sp"`
	LokasiMbkm    *string `json:"lokasi_mbkm"`
	NmPd          *string `json:"nm_pd"`
	Nipd          *string `json:"nipd"`
	ADiluarPt     *int    `json:"a_diluar_pt"`
	IDUpdater     string  `json:"id_updater" validate:"required"`
}

type PeriodeCreate struct {
	IDPeriodeMbkm   *string `json:"id_periode_mbkm"`
	IDSmt           string  `json:"id_smt" validate:"required"`
	IDJnsAktMhs     int     `json:"id_jns_akt_mhs" validate:"required"`
	NmPeriodeMbkm   string  `json:"nm_periode_mbkm" validate:"required"`
	NmPenyelenggara *string `json:"nm_penyelenggara"`
	WaktuMulai      *string `json:"waktu_mulai"`
	WaktuSelesai    *string `json:"waktu_selesai"`
	AAktif          *int    `json:"a_aktif"`
	IDCreator       string  `json:"id_creator" validate:"required"`
}
type PeriodeUpdate struct {
	IDSmt           *string `json:"id_smt"`
	IDJnsAktMhs     *int    `json:"id_jns_akt_mhs"`
	NmPeriodeMbkm   *string `json:"nm_periode_mbkm"`
	NmPenyelenggara *string `json:"nm_penyelenggara"`
	WaktuMulai      *string `json:"waktu_mulai"`
	WaktuSelesai    *string `json:"waktu_selesai"`
	AAktif          *int    `json:"a_aktif"`
	IDUpdater       string  `json:"id_updater" validate:"required"`
}

type MkKonversiCreate struct {
	IDMkKonversi  *string    `json:"id_mk_konversi"`
	IDSp          *string    `json:"id_sp"`
	IDDaftar      string     `json:"id_daftar_kampus_merdeka" validate:"required"`
	NmVerifikator *string    `json:"nm_verifikator"`
	WktSelesaiVer *time.Time `json:"wkt_selesai_ver"`
	KetPeriksa    *string    `json:"ket_periksa"`
	NmMk          *string    `json:"nm_mk"`
	KodeMk        *string    `json:"kode_mk"`
	SksMk         *float64   `json:"sks_mk"`
	StatAjuan     string     `json:"stat_ajuan" validate:"required"`
	WktAjuan      time.Time  `json:"wkt_ajuan" validate:"required"`
	IDCreator     string     `json:"id_creator" validate:"required"`
}
type MkKonversiUpdate struct {
	IDSp          *string    `json:"id_sp"`
	IDDaftar      *string    `json:"id_daftar_kampus_merdeka"`
	NmVerifikator *string    `json:"nm_verifikator"`
	WktSelesaiVer *time.Time `json:"wkt_selesai_ver"`
	KetPeriksa    *string    `json:"ket_periksa"`
	NmMk          *string    `json:"nm_mk"`
	KodeMk        *string    `json:"kode_mk"`
	SksMk         *float64   `json:"sks_mk"`
	StatAjuan     *string    `json:"stat_ajuan"`
	WktAjuan      *time.Time `json:"wkt_ajuan"`
	IDUpdater     string     `json:"id_updater" validate:"required"`
}

type KonversiAktMhsCreate struct {
	IDKonversi  *string  `json:"id_konversi_aktivitas"`
	IDMk        string   `json:"id_mk" validate:"required"`
	IDAktMhs    string   `json:"id_akt_mhs" validate:"required"`
	IDAngAktMhs *string  `json:"id_ang_akt_mhs"`
	IDSmt       *string  `json:"id_smt"`
	IDDaftar    *string  `json:"id_daftar_kampus_merdeka"`
	NilaiAngka  *float64 `json:"nilai_angka"`
	NilaiHuruf  *string  `json:"nilai_huruf"`
	NilaiIndeks *float64 `json:"nilai_indeks"`
	SksMk       *float64 `json:"sks_mk"`
	IDCreator   string   `json:"id_creator" validate:"required"`
}
type KonversiAktMhsUpdate struct {
	IDMk        *string  `json:"id_mk"`
	IDAktMhs    *string  `json:"id_akt_mhs"`
	IDAngAktMhs *string  `json:"id_ang_akt_mhs"`
	IDSmt       *string  `json:"id_smt"`
	IDDaftar    *string  `json:"id_daftar_kampus_merdeka"`
	NilaiAngka  *float64 `json:"nilai_angka"`
	NilaiHuruf  *string  `json:"nilai_huruf"`
	NilaiIndeks *float64 `json:"nilai_indeks"`
	SksMk       *float64 `json:"sks_mk"`
	IDUpdater   string   `json:"id_updater" validate:"required"`
}

type EkuivTransferCreate struct {
	IDEkuivalensi    *string `json:"id_ekuivalensi"`
	IDAktMhs         *string `json:"id_akt_mhs"`
	IDMk             string  `json:"id_mk" validate:"required"`
	IDSmt            *string `json:"id_smt"`
	IDRegPd          string  `json:"id_reg_pd" validate:"required"`
	KodeMkAsal       string  `json:"kode_mk_asal" validate:"required"`
	NmMkAsal         string  `json:"nm_mk_asal" validate:"required"`
	SksAsal          float64 `json:"sks_asal" validate:"required"`
	SksDiakui        int     `json:"sks_diakui" validate:"required"`
	NilaiHurufAsal   string  `json:"nilai_huruf_asal" validate:"required"`
	NilaiHurufDiakui string  `json:"nilai_huruf_diakui" validate:"required"`
	NilaiAngkaDiakui float64 `json:"nilai_angka_diakui" validate:"required"`
	IDSp             *string `json:"id_sp"`
	IDCreator        string  `json:"id_creator" validate:"required"`
}
type EkuivTransferUpdate struct {
	IDAktMhs         *string  `json:"id_akt_mhs"`
	IDMk             *string  `json:"id_mk"`
	IDSmt            *string  `json:"id_smt"`
	IDRegPd          *string  `json:"id_reg_pd"`
	KodeMkAsal       *string  `json:"kode_mk_asal"`
	NmMkAsal         *string  `json:"nm_mk_asal"`
	SksAsal          *float64 `json:"sks_asal"`
	SksDiakui        *int     `json:"sks_diakui"`
	NilaiHurufAsal   *string  `json:"nilai_huruf_asal"`
	NilaiHurufDiakui *string  `json:"nilai_huruf_diakui"`
	NilaiAngkaDiakui *float64 `json:"nilai_angka_diakui"`
	IDSp             *string  `json:"id_sp"`
	IDUpdater        string   `json:"id_updater" validate:"required"`
}

type LogBookCreate struct {
	IDLogBook         *string    `json:"id_log_book_mbkm"`
	IDMkKonversi      string     `json:"id_mk_konversi" validate:"required"`
	JudulLogBook      string     `json:"judul_log_book" validate:"required"`
	AktivitasKegiatan string     `json:"aktivitas_kegiatan" validate:"required"`
	TglKegiatan       time.Time  `json:"tgl_kegiatan" validate:"required"`
	NmVerifikator     *string    `json:"nm_verifikator"`
	WktSelesaiVer     *time.Time `json:"wkt_selesai_ver"`
	KetPeriksa        *string    `json:"ket_periksa"`
	LokasiKegiatan    *string    `json:"lokasi_kegiatan"`
	StatAjuan         *string    `json:"stat_ajuan"`
	WktAjuan          *time.Time `json:"wkt_ajuan"`
	IDCreator         string     `json:"id_creator" validate:"required"`
}
type LogBookUpdate struct {
	IDMkKonversi      *string    `json:"id_mk_konversi"`
	JudulLogBook      *string    `json:"judul_log_book"`
	AktivitasKegiatan *string    `json:"aktivitas_kegiatan"`
	TglKegiatan       *time.Time `json:"tgl_kegiatan"`
	NmVerifikator     *string    `json:"nm_verifikator"`
	WktSelesaiVer     *time.Time `json:"wkt_selesai_ver"`
	KetPeriksa        *string    `json:"ket_periksa"`
	LokasiKegiatan    *string    `json:"lokasi_kegiatan"`
	StatAjuan         *string    `json:"stat_ajuan"`
	WktAjuan          *time.Time `json:"wkt_ajuan"`
	IDUpdater         string     `json:"id_updater" validate:"required"`
}

type DeleteBody struct {
	IDUpdater string `json:"id_updater" validate:"required"`
}

// ============================================================================
// Update helper — partial UPDATE builder (dipakai semua resource)
// ============================================================================

type setField struct {
	col string
	val interface{}
}

type setBuilder struct {
	fields []setField
}

func (b *setBuilder) addStr(col string, v *string) {
	if v != nil {
		b.fields = append(b.fields, setField{col, *v})
	}
}
func (b *setBuilder) addInt(col string, v *int) {
	if v != nil {
		b.fields = append(b.fields, setField{col, *v})
	}
}
func (b *setBuilder) addF(col string, v *float64) {
	if v != nil {
		b.fields = append(b.fields, setField{col, *v})
	}
}
func (b *setBuilder) addTime(col string, v *time.Time) {
	if v != nil {
		b.fields = append(b.fields, setField{col, *v})
	}
}
func (b *setBuilder) buildUpdate(table, pkCol, id, idUpdater string) (string, []interface{}) {
	sets := []string{}
	args := []interface{}{}
	for i, f := range b.fields {
		sets = append(sets, fmt.Sprintf("%s = @p%d", f.col, i+1))
		args = append(args, f.val)
	}
	sets = append(sets, fmt.Sprintf("last_update = @p%d", len(args)+1))
	args = append(args, time.Now())
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", len(args)+1))
	args = append(args, idUpdater)
	args = append(args, id)
	q := fmt.Sprintf(`UPDATE %s SET %s WHERE %s = @p%d AND soft_delete = 0`,
		table, strings.Join(sets, ", "), pkCol, len(args))
	return q, args
}

func generateID(opt *string) string {
	id := uuid.New().String()
	if opt != nil && *opt != "" {
		if _, err := uuid.Parse(*opt); err == nil {
			id = *opt
		}
	}
	return id
}

// ============================================================================
// Repository extension — 6 resources × (GetByID/Create/Update/Delete)
// ============================================================================

// ---------- DaftarKampusMerdeka ----------

func (r *repository) GetDaftar(ctx context.Context, id string) (*DaftarKampusMerdeka, error) {
	q := `SELECT d.id_daftar_kampus_merdeka, d.id_periode_mbkm, p.nm_periode_mbkm,
		d.id_reg_pd, d.id_sp, sp.nm_lemb AS nm_sp,
		d.lokasi_mbkm, d.nm_pd, d.nipd, d.a_diluar_pt, d.last_sync
		FROM mbkm.daftar_kampus_merdeka d
		LEFT JOIN mbkm.periode_kampus_merdeka p ON p.id_periode_mbkm = d.id_periode_mbkm
		LEFT JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = d.id_sp
		WHERE d.id_daftar_kampus_merdeka = @p1 AND d.soft_delete = 0`
	var m DaftarKampusMerdeka
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateDaftar(ctx context.Context, in DaftarCreate) (string, error) {
	id := generateID(in.IDDaftar)
	q := `INSERT INTO mbkm.daftar_kampus_merdeka (
		id_daftar_kampus_merdeka, id_periode_mbkm, id_reg_pd, id_sp,
		lokasi_mbkm, nm_pd, nipd, a_diluar_pt,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, 0, @p12)`
	now := time.Now()
	aDiluar := 0
	if in.ADiluarPt != nil {
		aDiluar = *in.ADiluarPt
	}
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDPeriodeMbkm, in.IDRegPd, in.IDSp,
		in.LokasiMbkm, in.NmPd, in.Nipd, aDiluar,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateDaftar(ctx context.Context, id string, in DaftarUpdate) error {
	b := &setBuilder{}
	b.addStr("id_periode_mbkm", in.IDPeriodeMbkm)
	b.addStr("id_reg_pd", in.IDRegPd)
	b.addStr("id_sp", in.IDSp)
	b.addStr("lokasi_mbkm", in.LokasiMbkm)
	b.addStr("nm_pd", in.NmPd)
	b.addStr("nipd", in.Nipd)
	b.addInt("a_diluar_pt", in.ADiluarPt)
	q, args := b.buildUpdate("mbkm.daftar_kampus_merdeka", "id_daftar_kampus_merdeka", id, in.IDUpdater)
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

func (r *repository) DeleteDaftar(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.daftar_kampus_merdeka", "id_daftar_kampus_merdeka", id, idUpdater)
}

// ---------- PeriodeKampusMerdeka ----------

func (r *repository) GetPeriode(ctx context.Context, id string) (*PeriodeKampusMerdeka, error) {
	q := `SELECT pk.id_periode_mbkm, pk.id_smt, rs.nm_smt,
		pk.id_jns_akt_mhs, ja.nm_jns_akt_mhs,
		pk.nm_periode_mbkm, pk.nm_penyelenggara,
		pk.waktu_mulai, pk.waktu_selesai, pk.a_aktif, pk.last_sync
		FROM mbkm.periode_kampus_merdeka pk
		LEFT JOIN ref.semester rs ON rs.id_smt = pk.id_smt
		LEFT JOIN ref.jenis_akt_mhs ja ON ja.id_jns_akt_mhs = pk.id_jns_akt_mhs
		WHERE pk.id_periode_mbkm = @p1 AND pk.soft_delete = 0`
	var m PeriodeKampusMerdeka
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreatePeriode(ctx context.Context, in PeriodeCreate) (string, error) {
	id := generateID(in.IDPeriodeMbkm)
	q := `INSERT INTO mbkm.periode_kampus_merdeka (
		id_periode_mbkm, id_smt, id_jns_akt_mhs, nm_periode_mbkm, nm_penyelenggara,
		waktu_mulai, waktu_selesai, a_aktif,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, 0, @p12)`
	now := time.Now()
	aAktif := 1
	if in.AAktif != nil {
		aAktif = *in.AAktif
	}
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDSmt, in.IDJnsAktMhs, in.NmPeriodeMbkm, in.NmPenyelenggara,
		in.WaktuMulai, in.WaktuSelesai, aAktif,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdatePeriode(ctx context.Context, id string, in PeriodeUpdate) error {
	b := &setBuilder{}
	b.addStr("id_smt", in.IDSmt)
	b.addInt("id_jns_akt_mhs", in.IDJnsAktMhs)
	b.addStr("nm_periode_mbkm", in.NmPeriodeMbkm)
	b.addStr("nm_penyelenggara", in.NmPenyelenggara)
	b.addStr("waktu_mulai", in.WaktuMulai)
	b.addStr("waktu_selesai", in.WaktuSelesai)
	b.addInt("a_aktif", in.AAktif)
	q, args := b.buildUpdate("mbkm.periode_kampus_merdeka", "id_periode_mbkm", id, in.IDUpdater)
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

func (r *repository) DeletePeriode(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.periode_kampus_merdeka", "id_periode_mbkm", id, idUpdater)
}

// ---------- MkKonversi ----------

func (r *repository) GetMkKonversi(ctx context.Context, id string) (*MkKonversi, error) {
	q := `SELECT mk.id_mk_konversi, mk.id_sp, mk.id_daftar_kampus_merdeka,
		mk.nm_verifikator, mk.wkt_selesai_ver, mk.ket_periksa,
		mk.nm_mk, mk.kode_mk, mk.sks_mk, mk.stat_ajuan, mk.wkt_ajuan, mk.last_sync
		FROM mbkm.mk_konversi mk
		WHERE mk.id_mk_konversi = @p1 AND mk.soft_delete = 0`
	var m MkKonversi
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateMkKonversi(ctx context.Context, in MkKonversiCreate) (string, error) {
	id := generateID(in.IDMkKonversi)
	q := `INSERT INTO mbkm.mk_konversi (
		id_mk_konversi, id_sp, id_daftar_kampus_merdeka,
		nm_verifikator, wkt_selesai_ver, ket_periksa,
		nm_mk, kode_mk, sks_mk, stat_ajuan, wkt_ajuan,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11,
		@p12, @p13, @p14, 0, @p15)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDSp, in.IDDaftar,
		in.NmVerifikator, in.WktSelesaiVer, in.KetPeriksa,
		in.NmMk, in.KodeMk, in.SksMk, in.StatAjuan, in.WktAjuan,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateMkKonversi(ctx context.Context, id string, in MkKonversiUpdate) error {
	b := &setBuilder{}
	b.addStr("id_sp", in.IDSp)
	b.addStr("id_daftar_kampus_merdeka", in.IDDaftar)
	b.addStr("nm_verifikator", in.NmVerifikator)
	b.addTime("wkt_selesai_ver", in.WktSelesaiVer)
	b.addStr("ket_periksa", in.KetPeriksa)
	b.addStr("nm_mk", in.NmMk)
	b.addStr("kode_mk", in.KodeMk)
	b.addF("sks_mk", in.SksMk)
	b.addStr("stat_ajuan", in.StatAjuan)
	b.addTime("wkt_ajuan", in.WktAjuan)
	q, args := b.buildUpdate("mbkm.mk_konversi", "id_mk_konversi", id, in.IDUpdater)
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

func (r *repository) DeleteMkKonversi(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.mk_konversi", "id_mk_konversi", id, idUpdater)
}

// ---------- KonversiAktMhs ----------

func (r *repository) GetKonversiAktMhs(ctx context.Context, id string) (*KonversiAktMhs, error) {
	q := `SELECT k.id_konversi_aktivitas,
		k.id_mk, mk.kode_mk, mk.nm_mk, k.id_ang_akt_mhs,
		k.id_smt, rs.nm_smt,
		k.id_akt_mhs, am.judul_akt_mhs,
		k.id_daftar_kampus_merdeka,
		k.nilai_angka, k.nilai_huruf, k.nilai_indeks, k.sks_mk, k.last_sync
		FROM mbkm.konversi_akt_mhs k
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = k.id_mk
		LEFT JOIN pdrd.akt_mhs am ON am.id_akt_mhs = k.id_akt_mhs
		LEFT JOIN ref.semester rs ON rs.id_smt = k.id_smt
		WHERE k.id_konversi_aktivitas = @p1 AND k.soft_delete = 0`
	var m KonversiAktMhs
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateKonversiAktMhs(ctx context.Context, in KonversiAktMhsCreate) (string, error) {
	id := generateID(in.IDKonversi)
	q := `INSERT INTO mbkm.konversi_akt_mhs (
		id_konversi_aktivitas, id_mk, id_ang_akt_mhs, id_smt, id_akt_mhs,
		id_daftar_kampus_merdeka, nilai_angka, nilai_huruf, nilai_indeks, sks_mk,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, 0, @p14)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDMk, in.IDAngAktMhs, in.IDSmt, in.IDAktMhs,
		in.IDDaftar, in.NilaiAngka, in.NilaiHuruf, in.NilaiIndeks, in.SksMk,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateKonversiAktMhs(ctx context.Context, id string, in KonversiAktMhsUpdate) error {
	b := &setBuilder{}
	b.addStr("id_mk", in.IDMk)
	b.addStr("id_akt_mhs", in.IDAktMhs)
	b.addStr("id_ang_akt_mhs", in.IDAngAktMhs)
	b.addStr("id_smt", in.IDSmt)
	b.addStr("id_daftar_kampus_merdeka", in.IDDaftar)
	b.addF("nilai_angka", in.NilaiAngka)
	b.addStr("nilai_huruf", in.NilaiHuruf)
	b.addF("nilai_indeks", in.NilaiIndeks)
	b.addF("sks_mk", in.SksMk)
	q, args := b.buildUpdate("mbkm.konversi_akt_mhs", "id_konversi_aktivitas", id, in.IDUpdater)
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

func (r *repository) DeleteKonversiAktMhs(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.konversi_akt_mhs", "id_konversi_aktivitas", id, idUpdater)
}

// ---------- EkuivTransfer ----------

func (r *repository) GetEkuivTransfer(ctx context.Context, id string) (*EkuivTransfer, error) {
	q := `SELECT e.id_ekuivalensi, e.id_akt_mhs,
		e.id_mk, mk.kode_mk, mk.nm_mk,
		e.id_smt, rs.nm_smt,
		e.id_reg_pd, rp.nipd,
		e.kode_mk_asal, e.nm_mk_asal, e.sks_asal, e.sks_diakui,
		e.nilai_huruf_asal, e.nilai_huruf_diakui, e.nilai_angka_diakui,
		e.id_sp, e.last_sync
		FROM mbkm.ekuiv_transfer e
		LEFT JOIN pdrd.matkul mk ON mk.id_mk = e.id_mk
		LEFT JOIN pdrd.reg_pd rp ON rp.id_reg_pd = e.id_reg_pd
		LEFT JOIN ref.semester rs ON rs.id_smt = e.id_smt
		WHERE e.id_ekuivalensi = @p1 AND e.soft_delete = 0`
	var m EkuivTransfer
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateEkuivTransfer(ctx context.Context, in EkuivTransferCreate) (string, error) {
	id := generateID(in.IDEkuivalensi)
	q := `INSERT INTO mbkm.ekuiv_transfer (
		id_ekuivalensi, id_akt_mhs, id_mk, id_smt, id_reg_pd,
		kode_mk_asal, nm_mk_asal, sks_asal, sks_diakui,
		nilai_huruf_asal, nilai_huruf_diakui, nilai_angka_diakui, id_sp,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13,
		@p14, @p15, @p16, 0, @p17)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDAktMhs, in.IDMk, in.IDSmt, in.IDRegPd,
		in.KodeMkAsal, in.NmMkAsal, in.SksAsal, in.SksDiakui,
		in.NilaiHurufAsal, in.NilaiHurufDiakui, in.NilaiAngkaDiakui, in.IDSp,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateEkuivTransfer(ctx context.Context, id string, in EkuivTransferUpdate) error {
	b := &setBuilder{}
	b.addStr("id_akt_mhs", in.IDAktMhs)
	b.addStr("id_mk", in.IDMk)
	b.addStr("id_smt", in.IDSmt)
	b.addStr("id_reg_pd", in.IDRegPd)
	b.addStr("kode_mk_asal", in.KodeMkAsal)
	b.addStr("nm_mk_asal", in.NmMkAsal)
	b.addF("sks_asal", in.SksAsal)
	b.addInt("sks_diakui", in.SksDiakui)
	b.addStr("nilai_huruf_asal", in.NilaiHurufAsal)
	b.addStr("nilai_huruf_diakui", in.NilaiHurufDiakui)
	b.addF("nilai_angka_diakui", in.NilaiAngkaDiakui)
	b.addStr("id_sp", in.IDSp)
	q, args := b.buildUpdate("mbkm.ekuiv_transfer", "id_ekuivalensi", id, in.IDUpdater)
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

func (r *repository) DeleteEkuivTransfer(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.ekuiv_transfer", "id_ekuivalensi", id, idUpdater)
}

// ---------- LogBook ----------

func (r *repository) GetLogBook(ctx context.Context, id string) (*LogBookMbkm, error) {
	q := `SELECT lb.id_log_book_mbkm,
		lb.id_mk_konversi, mk.nm_mk, mk.kode_mk,
		lb.nm_verifikator, lb.wkt_selesai_ver, lb.ket_periksa,
		lb.judul_log_book, lb.aktivitas_kegiatan, lb.lokasi_kegiatan,
		lb.tgl_kegiatan, lb.stat_ajuan, lb.wkt_ajuan, lb.last_sync
		FROM mbkm.log_book_mbkm lb
		LEFT JOIN mbkm.mk_konversi mk ON mk.id_mk_konversi = lb.id_mk_konversi
		WHERE lb.id_log_book_mbkm = @p1 AND lb.soft_delete = 0`
	var m LogBookMbkm
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreateLogBook(ctx context.Context, in LogBookCreate) (string, error) {
	id := generateID(in.IDLogBook)
	q := `INSERT INTO mbkm.log_book_mbkm (
		id_log_book_mbkm, id_mk_konversi, nm_verifikator, wkt_selesai_ver, ket_periksa,
		judul_log_book, aktivitas_kegiatan, lokasi_kegiatan, tgl_kegiatan, stat_ajuan, wkt_ajuan,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11,
		@p12, @p13, @p14, 0, @p15)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDMkKonversi, in.NmVerifikator, in.WktSelesaiVer, in.KetPeriksa,
		in.JudulLogBook, in.AktivitasKegiatan, in.LokasiKegiatan, in.TglKegiatan, in.StatAjuan, in.WktAjuan,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdateLogBook(ctx context.Context, id string, in LogBookUpdate) error {
	b := &setBuilder{}
	b.addStr("id_mk_konversi", in.IDMkKonversi)
	b.addStr("judul_log_book", in.JudulLogBook)
	b.addStr("aktivitas_kegiatan", in.AktivitasKegiatan)
	b.addTime("tgl_kegiatan", in.TglKegiatan)
	b.addStr("nm_verifikator", in.NmVerifikator)
	b.addTime("wkt_selesai_ver", in.WktSelesaiVer)
	b.addStr("ket_periksa", in.KetPeriksa)
	b.addStr("lokasi_kegiatan", in.LokasiKegiatan)
	b.addStr("stat_ajuan", in.StatAjuan)
	b.addTime("wkt_ajuan", in.WktAjuan)
	q, args := b.buildUpdate("mbkm.log_book_mbkm", "id_log_book_mbkm", id, in.IDUpdater)
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

func (r *repository) DeleteLogBook(ctx context.Context, id, idUpdater string) error {
	return softDelete(ctx, r.db.DB, "mbkm.log_book_mbkm", "id_log_book_mbkm", id, idUpdater)
}

// ---------- Helper soft-delete ----------

func softDelete(ctx context.Context, db *sql.DB, table, pk, id, idUpdater string) error {
	q := fmt.Sprintf(`UPDATE %s SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE %s = @p3 AND soft_delete = 0`, table, pk)
	res, err := db.ExecContext(ctx, q, time.Now(), idUpdater, id)
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
// Service + Handler + Router extension
// ============================================================================

// Daftar
func (s *service) GetDaftar(ctx context.Context, id string) (*DaftarKampusMerdeka, error) {
	return s.repo.GetDaftar(ctx, id)
}
func (s *service) CreateDaftar(ctx context.Context, in DaftarCreate) (string, error) {
	return s.repo.CreateDaftar(ctx, in)
}
func (s *service) UpdateDaftar(ctx context.Context, id string, in DaftarUpdate) error {
	return s.repo.UpdateDaftar(ctx, id, in)
}
func (s *service) DeleteDaftar(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteDaftar(ctx, id, idUpdater)
}

// Periode
func (s *service) GetPeriode(ctx context.Context, id string) (*PeriodeKampusMerdeka, error) {
	return s.repo.GetPeriode(ctx, id)
}
func (s *service) CreatePeriode(ctx context.Context, in PeriodeCreate) (string, error) {
	return s.repo.CreatePeriode(ctx, in)
}
func (s *service) UpdatePeriode(ctx context.Context, id string, in PeriodeUpdate) error {
	return s.repo.UpdatePeriode(ctx, id, in)
}
func (s *service) DeletePeriode(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeletePeriode(ctx, id, idUpdater)
}

// MkKonversi
func (s *service) GetMkKonversi(ctx context.Context, id string) (*MkKonversi, error) {
	return s.repo.GetMkKonversi(ctx, id)
}
func (s *service) CreateMkKonversi(ctx context.Context, in MkKonversiCreate) (string, error) {
	return s.repo.CreateMkKonversi(ctx, in)
}
func (s *service) UpdateMkKonversi(ctx context.Context, id string, in MkKonversiUpdate) error {
	return s.repo.UpdateMkKonversi(ctx, id, in)
}
func (s *service) DeleteMkKonversi(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteMkKonversi(ctx, id, idUpdater)
}

// KonversiAktMhs
func (s *service) GetKonversiAktMhs(ctx context.Context, id string) (*KonversiAktMhs, error) {
	return s.repo.GetKonversiAktMhs(ctx, id)
}
func (s *service) CreateKonversiAktMhs(ctx context.Context, in KonversiAktMhsCreate) (string, error) {
	return s.repo.CreateKonversiAktMhs(ctx, in)
}
func (s *service) UpdateKonversiAktMhs(ctx context.Context, id string, in KonversiAktMhsUpdate) error {
	return s.repo.UpdateKonversiAktMhs(ctx, id, in)
}
func (s *service) DeleteKonversiAktMhs(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteKonversiAktMhs(ctx, id, idUpdater)
}

// EkuivTransfer
func (s *service) GetEkuivTransfer(ctx context.Context, id string) (*EkuivTransfer, error) {
	return s.repo.GetEkuivTransfer(ctx, id)
}
func (s *service) CreateEkuivTransfer(ctx context.Context, in EkuivTransferCreate) (string, error) {
	return s.repo.CreateEkuivTransfer(ctx, in)
}
func (s *service) UpdateEkuivTransfer(ctx context.Context, id string, in EkuivTransferUpdate) error {
	return s.repo.UpdateEkuivTransfer(ctx, id, in)
}
func (s *service) DeleteEkuivTransfer(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteEkuivTransfer(ctx, id, idUpdater)
}

// LogBook
func (s *service) GetLogBook(ctx context.Context, id string) (*LogBookMbkm, error) {
	return s.repo.GetLogBook(ctx, id)
}
func (s *service) CreateLogBook(ctx context.Context, in LogBookCreate) (string, error) {
	return s.repo.CreateLogBook(ctx, in)
}
func (s *service) UpdateLogBook(ctx context.Context, id string, in LogBookUpdate) error {
	return s.repo.UpdateLogBook(ctx, id, in)
}
func (s *service) DeleteLogBook(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeleteLogBook(ctx, id, idUpdater)
}

// ============================================================================
// Handler helpers + handler methods
// ============================================================================

func extractUpdater(c *fiber.Ctx) string {
	var body DeleteBody
	_ = c.BodyParser(&body)
	if body.IDUpdater != "" {
		return body.IDUpdater
	}
	return strings.TrimSpace(c.Query("id_updater"))
}

func getIDParam(c *fiber.Ctx) (string, error) {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return "", errors.New("id kosong")
	}
	return id, nil
}

// ---- Daftar handlers ----

func (h *Handler) GetDaftar(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetDaftar(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Pendaftaran MBKM tidak ditemukan")
	}
	if err != nil {
		log.Printf("get daftar: %v", err)
		return response.InternalError(c, "Gagal mengambil detail pendaftaran MBKM")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreateDaftar(c *fiber.Ctx) error {
	var in DaftarCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDPeriodeMbkm == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_periode_mbkm, id_creator",
		})
	}
	id, err := h.svc.CreateDaftar(c.Context(), in)
	if err != nil {
		log.Printf("create daftar: %v", err)
		return response.InternalError(c, "Gagal menyimpan pendaftaran MBKM")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Pendaftaran MBKM berhasil disimpan", fiber.Map{"id_daftar_kampus_merdeka": id})
}
func (h *Handler) UpdateDaftar(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in DaftarUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateDaftar(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Pendaftaran MBKM tidak ditemukan")
		}
		log.Printf("update daftar: %v", err)
		return response.InternalError(c, "Gagal memperbarui pendaftaran MBKM")
	}
	return response.Success(c, "Pendaftaran MBKM berhasil diperbarui", fiber.Map{"id_daftar_kampus_merdeka": id})
}
func (h *Handler) DeleteDaftar(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteDaftar(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Pendaftaran MBKM tidak ditemukan")
		}
		log.Printf("delete daftar: %v", err)
		return response.InternalError(c, "Gagal menghapus pendaftaran MBKM")
	}
	return response.Success(c, "Pendaftaran MBKM berhasil dihapus", fiber.Map{"id_daftar_kampus_merdeka": id})
}

// ---- Periode handlers ----

func (h *Handler) GetPeriode(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetPeriode(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Periode MBKM tidak ditemukan")
	}
	if err != nil {
		log.Printf("get periode: %v", err)
		return response.InternalError(c, "Gagal mengambil detail periode MBKM")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreatePeriode(c *fiber.Ctx) error {
	var in PeriodeCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDSmt == "" || in.IDJnsAktMhs == 0 || in.NmPeriodeMbkm == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_smt, id_jns_akt_mhs, nm_periode_mbkm, id_creator",
		})
	}
	id, err := h.svc.CreatePeriode(c.Context(), in)
	if err != nil {
		log.Printf("create periode: %v", err)
		return response.InternalError(c, "Gagal menyimpan periode MBKM")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Periode MBKM berhasil disimpan", fiber.Map{"id_periode_mbkm": id})
}
func (h *Handler) UpdatePeriode(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in PeriodeUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdatePeriode(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Periode MBKM tidak ditemukan")
		}
		log.Printf("update periode: %v", err)
		return response.InternalError(c, "Gagal memperbarui periode MBKM")
	}
	return response.Success(c, "Periode MBKM berhasil diperbarui", fiber.Map{"id_periode_mbkm": id})
}
func (h *Handler) DeletePeriode(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeletePeriode(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Periode MBKM tidak ditemukan")
		}
		log.Printf("delete periode: %v", err)
		return response.InternalError(c, "Gagal menghapus periode MBKM")
	}
	return response.Success(c, "Periode MBKM berhasil dihapus", fiber.Map{"id_periode_mbkm": id})
}

// ---- MkKonversi handlers ----

func (h *Handler) GetMkKonversi(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetMkKonversi(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "MK konversi tidak ditemukan")
	}
	if err != nil {
		log.Printf("get mk_konversi: %v", err)
		return response.InternalError(c, "Gagal mengambil detail MK konversi")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreateMkKonversi(c *fiber.Ctx) error {
	var in MkKonversiCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDDaftar == "" || in.StatAjuan == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_daftar_kampus_merdeka, stat_ajuan, wkt_ajuan, id_creator",
		})
	}
	id, err := h.svc.CreateMkKonversi(c.Context(), in)
	if err != nil {
		log.Printf("create mk_konversi: %v", err)
		return response.InternalError(c, "Gagal menyimpan MK konversi")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "MK konversi berhasil disimpan", fiber.Map{"id_mk_konversi": id})
}
func (h *Handler) UpdateMkKonversi(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in MkKonversiUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateMkKonversi(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "MK konversi tidak ditemukan")
		}
		log.Printf("update mk_konversi: %v", err)
		return response.InternalError(c, "Gagal memperbarui MK konversi")
	}
	return response.Success(c, "MK konversi berhasil diperbarui", fiber.Map{"id_mk_konversi": id})
}
func (h *Handler) DeleteMkKonversi(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteMkKonversi(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "MK konversi tidak ditemukan")
		}
		log.Printf("delete mk_konversi: %v", err)
		return response.InternalError(c, "Gagal menghapus MK konversi")
	}
	return response.Success(c, "MK konversi berhasil dihapus", fiber.Map{"id_mk_konversi": id})
}

// ---- KonversiAktMhs handlers ----

func (h *Handler) GetKonversiAktMhs(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetKonversiAktMhs(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Konversi aktivitas tidak ditemukan")
	}
	if err != nil {
		log.Printf("get konversi_akt: %v", err)
		return response.InternalError(c, "Gagal mengambil detail konversi aktivitas")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreateKonversiAktMhs(c *fiber.Ctx) error {
	var in KonversiAktMhsCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDMk == "" || in.IDAktMhs == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_mk, id_akt_mhs, id_creator",
		})
	}
	id, err := h.svc.CreateKonversiAktMhs(c.Context(), in)
	if err != nil {
		log.Printf("create konversi_akt: %v", err)
		return response.InternalError(c, "Gagal menyimpan konversi aktivitas")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Konversi aktivitas berhasil disimpan", fiber.Map{"id_konversi_aktivitas": id})
}
func (h *Handler) UpdateKonversiAktMhs(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in KonversiAktMhsUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateKonversiAktMhs(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Konversi aktivitas tidak ditemukan")
		}
		log.Printf("update konversi_akt: %v", err)
		return response.InternalError(c, "Gagal memperbarui konversi aktivitas")
	}
	return response.Success(c, "Konversi aktivitas berhasil diperbarui", fiber.Map{"id_konversi_aktivitas": id})
}
func (h *Handler) DeleteKonversiAktMhs(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteKonversiAktMhs(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Konversi aktivitas tidak ditemukan")
		}
		log.Printf("delete konversi_akt: %v", err)
		return response.InternalError(c, "Gagal menghapus konversi aktivitas")
	}
	return response.Success(c, "Konversi aktivitas berhasil dihapus", fiber.Map{"id_konversi_aktivitas": id})
}

// ---- EkuivTransfer handlers ----

func (h *Handler) GetEkuivTransfer(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetEkuivTransfer(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Ekuivalensi transfer tidak ditemukan")
	}
	if err != nil {
		log.Printf("get ekuiv: %v", err)
		return response.InternalError(c, "Gagal mengambil detail ekuivalensi")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreateEkuivTransfer(c *fiber.Ctx) error {
	var in EkuivTransferCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDMk == "" || in.IDRegPd == "" || in.KodeMkAsal == "" || in.NmMkAsal == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_mk, id_reg_pd, kode_mk_asal, nm_mk_asal, sks_asal, sks_diakui, nilai_huruf_asal, nilai_huruf_diakui, nilai_angka_diakui, id_creator",
		})
	}
	id, err := h.svc.CreateEkuivTransfer(c.Context(), in)
	if err != nil {
		log.Printf("create ekuiv: %v", err)
		return response.InternalError(c, "Gagal menyimpan ekuivalensi transfer")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Ekuivalensi transfer berhasil disimpan", fiber.Map{"id_ekuivalensi": id})
}
func (h *Handler) UpdateEkuivTransfer(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in EkuivTransferUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateEkuivTransfer(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Ekuivalensi transfer tidak ditemukan")
		}
		log.Printf("update ekuiv: %v", err)
		return response.InternalError(c, "Gagal memperbarui ekuivalensi")
	}
	return response.Success(c, "Ekuivalensi transfer berhasil diperbarui", fiber.Map{"id_ekuivalensi": id})
}
func (h *Handler) DeleteEkuivTransfer(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteEkuivTransfer(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Ekuivalensi transfer tidak ditemukan")
		}
		log.Printf("delete ekuiv: %v", err)
		return response.InternalError(c, "Gagal menghapus ekuivalensi")
	}
	return response.Success(c, "Ekuivalensi transfer berhasil dihapus", fiber.Map{"id_ekuivalensi": id})
}

// ---- LogBook handlers ----

func (h *Handler) GetLogBook(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetLogBook(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Log book MBKM tidak ditemukan")
	}
	if err != nil {
		log.Printf("get logbook: %v", err)
		return response.InternalError(c, "Gagal mengambil detail log book")
	}
	return response.Success(c, "OK", m)
}
func (h *Handler) CreateLogBook(c *fiber.Ctx) error {
	var in LogBookCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDMkKonversi == "" || in.JudulLogBook == "" || in.AktivitasKegiatan == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_mk_konversi, judul_log_book, aktivitas_kegiatan, tgl_kegiatan, id_creator",
		})
	}
	id, err := h.svc.CreateLogBook(c.Context(), in)
	if err != nil {
		log.Printf("create logbook: %v", err)
		return response.InternalError(c, "Gagal menyimpan log book MBKM")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Log book MBKM berhasil disimpan", fiber.Map{"id_log_book_mbkm": id})
}
func (h *Handler) UpdateLogBook(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in LogBookUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateLogBook(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Log book MBKM tidak ditemukan")
		}
		log.Printf("update logbook: %v", err)
		return response.InternalError(c, "Gagal memperbarui log book MBKM")
	}
	return response.Success(c, "Log book MBKM berhasil diperbarui", fiber.Map{"id_log_book_mbkm": id})
}
func (h *Handler) DeleteLogBook(c *fiber.Ctx) error {
	id, err := getIDParam(c)
	if err != nil {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpd := extractUpdater(c)
	if idUpd == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteLogBook(c.Context(), id, idUpd); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Log book MBKM tidak ditemukan")
		}
		log.Printf("delete logbook: %v", err)
		return response.InternalError(c, "Gagal menghapus log book MBKM")
	}
	return response.Success(c, "Log book MBKM berhasil dihapus", fiber.Map{"id_log_book_mbkm": id})
}
