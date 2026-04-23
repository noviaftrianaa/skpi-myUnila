package pegawai

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

type Repository interface {
	GetList(ctx context.Context, p types.PegawaiParams) ([]Pegawai, int64, error)
	GetDetail(ctx context.Context, p types.PegawaiParams) ([]PegawaiDetail, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

func (r *repository) GetList(ctx context.Context, p types.PegawaiParams) ([]Pegawai, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("p.id_pegawai", p.IDPegawai)
	cb.AppendString("p.jns_pegawai", p.JnsPegawai)
	cb.AppendString("p.jns_tenaga", p.JnsTenaga)
	cb.AppendString("p.nip", p.Nip)
	cb.AppendInt("p.id_gol", p.IDGol)
	cb.AppendInt("p.id_jabfung", p.IDJabfung)
	cb.AppendInt("p.id_jabstruk", p.IDJabstruk)
	cb.AppendInt("p.id_unit_orga", p.IDUnitOrga)
	cb.AppendString("p.status", p.Status)
	cb.Like("p.nm_pegawai", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "p.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM sikep.pegawai p WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "p.nm_pegawai", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT
			p.id_pegawai, p.nm_pegawai, p.jk, p.nip, p.nidn,
			p.tmp_lahir, p.tgl_lahir,
			p.jns_pegawai, p.jns_tenaga, p.status,
			p.id_gol, p.id_jabfung, p.id_jabstruk, p.id_pend, p.id_unit_orga,
			p.last_sync
		FROM sikep.pegawai p
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

	var result []Pegawai
	for rows.Next() {
		var m Pegawai
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) GetDetail(ctx context.Context, p types.PegawaiParams) ([]PegawaiDetail, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("p.id_pegawai", p.IDPegawai)
	cb.AppendString("p.jns_pegawai", p.JnsPegawai)
	cb.AppendString("p.jns_tenaga", p.JnsTenaga)
	cb.AppendString("p.nip", p.Nip)
	cb.AppendInt("p.id_gol", p.IDGol)
	cb.AppendInt("p.id_jabfung", p.IDJabfung)
	cb.AppendInt("p.id_jabstruk", p.IDJabstruk)
	cb.AppendInt("p.id_unit_orga", p.IDUnitOrga)
	cb.AppendString("p.status", p.Status)
	cb.Like("p.nm_pegawai", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "p.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	baseJoin := `
		FROM sikep.pegawai p
		LEFT JOIN sikep.golongan_pns g ON g.id_gol = p.id_gol
		LEFT JOIN sikep.jabfung jf ON jf.id_jabfung = p.id_jabfung
		LEFT JOIN sikep.jabstruk js ON js.id_jabstruk = p.id_jabstruk
		LEFT JOIN sikep.pendidikan pd ON pd.id_pend = p.id_pend
		LEFT JOIN sikep.unit_orga uo ON uo.id_unit_orga = p.id_unit_orga`

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) "+baseJoin+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "p.nm_pegawai", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`
		SELECT
			p.id_pegawai, p.nm_pegawai, p.jk, p.nip, p.nidn,
			p.tmp_lahir, p.tgl_lahir, p.alamat,
			p.jns_pegawai, p.jns_tenaga,
			p.tmt_cpns, p.tmt_pns, p.status, p.tmt_pensiun,
			p.id_gol, g.nm_gol, g.nm_pangkat, g.kd_gol, p.tmt_gol,
			p.id_jabfung, jf.nm_jabfung, p.tmt_jabfung,
			p.id_jabstruk, js.nm_jabstruk, js.kd_jabstruk,
			p.id_pend, pd.nm_pend,
			p.id_unit_orga, uo.nm_unit_orga, uo.kd_unit_orga,
			p.last_sync
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

	var result []PegawaiDetail
	for rows.Next() {
		var m PegawaiDetail
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}
