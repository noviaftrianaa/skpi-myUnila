package project

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// RefRepository interface for SQL Server reference data
type RefRepository interface {
	SearchUsers(ctx context.Context, query string, limit int) ([]UserRef, error)
	GetUserByID(ctx context.Context, id string) (*UserRef, error)
}

type refRepository struct {
	db *sqlx.DB
}

func NewRefRepository(db *sqlx.DB) RefRepository {
	return &refRepository{db: db}
}

func (r *refRepository) SearchUsers(ctx context.Context, query string, limit int) ([]UserRef, error) {
	var users []UserRef
	sqlQuery := `
		SELECT TOP (@p2)
			CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna,
			nm_pengguna AS nama,
			username,
			email,
			NULL AS avatar
		FROM man_akses.pengguna
		WHERE soft_delete = 0
		  AND (nm_pengguna LIKE @p1 OR username LIKE @p1 OR email LIKE @p1)
		ORDER BY nm_pengguna ASC
	`
	if err := r.db.SelectContext(ctx, &users, sqlQuery, "%"+query+"%", limit); err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}
	return users, nil
}

func (r *refRepository) GetUserByID(ctx context.Context, id string) (*UserRef, error) {
	var user UserRef
	sqlQuery := `
		SELECT
			CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna,
			nm_pengguna AS nama,
			username,
			email,
			NULL AS avatar
		FROM man_akses.pengguna
		WHERE soft_delete = 0 AND CONVERT(VARCHAR(36), id_pengguna) = @p1
	`
	if err := r.db.GetContext(ctx, &user, sqlQuery, id); err != nil {
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}
	return &user, nil
}
