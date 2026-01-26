package peta

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/helper"
	"github.com/myunila/api-service/apps/referensi/types"
)

type Repository interface {
	GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error)
	GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error)
	GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ============================================================================
// PetaKatgiatJabfung
// ============================================================================

func (r *repository) GetPetaKatgiatJabfung(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJabfung, int64, error) {
	cb := helper.NewCondBuilder()
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.peta_katgiat_jabfung",
			Select:      `id_katgiat, id_jabfung, create_date, last_update, expired_date`,
			DefaultSort: "id_katgiat, id_jabfung",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (PetaKatgiatJabfung, error) {
			var p PetaKatgiatJabfung
			err := rows.Scan(
				&p.IDKatgiat,
				&p.IDJabfung,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// PetaKatgiatJnsdok
// ============================================================================

func (r *repository) GetPetaKatgiatJnsdok(ctx context.Context, params types.PetaKatgiatJnsdokParams) ([]PetaKatgiatJnsdok, int64, error) {
	cb := helper.NewCondBuilder()
	if params.IDJnsDok != 0 {
		cb.AppendInt("id_jns_dok", &params.IDJnsDok)
	}
	if params.AWajib != 0 {
		cb.AppendInt("a_wajib", &params.AWajib)
	}
	if params.NoUrut != 0 {
		cb.AppendInt("no_urut", &params.NoUrut)
	}
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.peta_katgiat_jnsdok",
			Select:      `id_katgiat, id_jns_dok, a_wajib, no_urut, create_date, last_update, expired_date`,
			DefaultSort: "id_katgiat, id_jns_dok",
		},
		params.PaginationParams,
		conds,
		args,
		func(rows *sql.Rows) (PetaKatgiatJnsdok, error) {
			var p PetaKatgiatJnsdok
			err := rows.Scan(
				&p.IDKatgiat,
				&p.IDJnsDok,
				&p.AWajib,
				&p.NoUrut,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}

// ============================================================================
// PetaKatgiatJnspub
// ============================================================================

func (r *repository) GetPetaKatgiatJnspub(ctx context.Context, params types.PaginationParams) ([]PetaKatgiatJnspub, int64, error) {
	cb := helper.NewCondBuilder()
	conds, args := cb.Build()

	return helper.QueryPaged(
		ctx,
		r.db,
		helper.BaseQueryConfig{
			Table:       "ref.peta_katgiat_jnspub",
			Select:      `id_katgiat, id_jns_pub, create_date, last_update, expired_date`,
			DefaultSort: "id_katgiat, id_jns_pub",
		},
		params,
		conds,
		args,
		func(rows *sql.Rows) (PetaKatgiatJnspub, error) {
			var p PetaKatgiatJnspub
			err := rows.Scan(
				&p.IDKatgiat,
				&p.IDJnsPub,
				&p.CreateDate,
				&p.LastUpdate,
				&p.ExpiredDate,
			)
			return p, err
		},
	)
}
