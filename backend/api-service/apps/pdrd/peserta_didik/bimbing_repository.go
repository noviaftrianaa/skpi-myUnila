package pesertadidik

import (
	"context"
	"fmt"
	"strings"

	"github.com/myunila/api-service/apps/pdrd/helper"
	"github.com/myunila/api-service/apps/pdrd/types"
)

// GetBimbingMhs — pivot bimbingan: dosen → aktivitas (akt_mhs)
func (r *repository) GetBimbingMhs(ctx context.Context, p types.BimbingMhsParams) ([]BimbingMhs, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("b.id_sdm", p.IDSDM)
	cb.AppendUUID("b.id_akt_mhs", p.IDAktMhs)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "b.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.bimbing_mhs b
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = b.id_sdm
		LEFT JOIN pdrd.akt_mhs am ON am.id_akt_mhs = b.id_akt_mhs
		LEFT JOIN ref.jenis_akt_mhs jam ON jam.id_jns_akt_mhs = am.id_jns_akt_mhs
		LEFT JOIN ref.kategori_kegiatan kat ON kat.id_katgiat = b.id_katgiat`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "sdm.nm_sdm", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT b.id_bimb_mhs,
			b.id_sdm, sdm.nm_sdm,
			(SELECT TOP 1 rptk.nidn FROM pdrd.reg_ptk rptk WHERE rptk.id_sdm = b.id_sdm AND rptk.soft_delete=0) AS nidn,
			b.id_akt_mhs, am.judul_akt_mhs,
			am.id_jns_akt_mhs, jam.nm_jns_akt_mhs,
			b.id_katgiat, kat.nm_katgiat,
			b.urutan_promotor, b.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []BimbingMhs
	for rows.Next() {
		var m BimbingMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// GetUjiMhs — pivot pengujian TA
func (r *repository) GetUjiMhs(ctx context.Context, p types.UjiMhsParams) ([]UjiMhs, int64, error) {
	p.NormalizePagination()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("u.id_sdm", p.IDSDM)
	cb.AppendUUID("u.id_akt_mhs", p.IDAktMhs)
	cb.Like("sdm.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "u.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM pdrd.uji_mhs u
		LEFT JOIN pdrd.sdm sdm ON sdm.id_sdm = u.id_sdm
		LEFT JOIN pdrd.akt_mhs am ON am.id_akt_mhs = u.id_akt_mhs
		LEFT JOIN ref.kategori_kegiatan kat ON kat.id_katgiat = u.id_katgiat`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "u.urutan_uji", p.Order
	if p.SortBy != "" { sortBy = p.SortBy }
	if order == "" { order = "ASC" }

	q := fmt.Sprintf(`
		SELECT u.id_uji_mhs,
			u.id_sdm, sdm.nm_sdm,
			(SELECT TOP 1 rptk.nidn FROM pdrd.reg_ptk rptk WHERE rptk.id_sdm = u.id_sdm AND rptk.soft_delete=0) AS nidn,
			u.id_akt_mhs, am.judul_akt_mhs,
			u.id_katgiat, kat.nm_katgiat,
			u.urutan_uji, u.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	var result []UjiMhs
	for rows.Next() {
		var m UjiMhs
		if err := rows.StructScan(&m); err != nil { return nil, 0, err }
		result = append(result, m)
	}
	return result, total, rows.Err()
}
