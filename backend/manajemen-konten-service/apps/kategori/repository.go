package kategori

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	List(ctx context.Context, jenis string, isActive *bool) ([]Kategori, error)
	GetByID(ctx context.Context, id string) (*Kategori, error)
	Create(ctx context.Context, req *CreateKategoriRequest) (string, error)
	Update(ctx context.Context, id string, req *UpdateKategoriRequest) error
	SoftDelete(ctx context.Context, id string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

const baseSelect = `
	SELECT
		CAST(id_kategori AS VARCHAR(36)) AS id_kategori,
		kode, nama, icon_name, color, jenis, urutan,
		CAST(is_active AS BIT) AS is_active,
		create_date, last_update
	FROM man_konten.kategori
`

func (r *repository) List(ctx context.Context, jenis string, isActive *bool) ([]Kategori, error) {
	args := []any{}
	where := "WHERE soft_delete = 0"
	if jenis != "" {
		args = append(args, jenis)
		where += fmt.Sprintf(" AND (jenis = @p%d OR jenis = 'both')", len(args))
	}
	if isActive != nil {
		args = append(args, *isActive)
		where += fmt.Sprintf(" AND is_active = @p%d", len(args))
	}
	q := baseSelect + where + " ORDER BY urutan ASC, nama ASC"
	var items []Kategori
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, fmt.Errorf("list kategori: %w", err)
	}
	return items, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Kategori, error) {
	var k Kategori
	if err := r.db.GetContext(ctx, &k, baseSelect+" WHERE id_kategori = @p1 AND soft_delete = 0", id); err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *repository) Create(ctx context.Context, req *CreateKategoriRequest) (string, error) {
	var id string
	row := r.db.QueryRowxContext(ctx, `
		INSERT INTO man_konten.kategori
			(id_kategori, kode, nama, icon_name, color, jenis, urutan, is_active,
			 create_date, last_update, soft_delete)
		OUTPUT CAST(INSERTED.id_kategori AS VARCHAR(36))
		VALUES (NEWID(), @p1, @p2, @p3, @p4, @p5, @p6, @p7,
		        GETDATE(), GETDATE(), 0)
	`, req.Kode, req.Nama, req.IconName, req.Color, req.Jenis, req.Urutan, req.IsActive)
	if err := row.Scan(&id); err != nil {
		return "", fmt.Errorf("create kategori: %w", err)
	}
	return id, nil
}

func (r *repository) Update(ctx context.Context, id string, req *UpdateKategoriRequest) error {
	// Build dynamic SET clause — only update non-nil fields.
	sets := []string{}
	args := []any{}
	if req.Nama != nil {
		args = append(args, *req.Nama)
		sets = append(sets, fmt.Sprintf("nama = @p%d", len(args)))
	}
	if req.IconName != nil {
		args = append(args, *req.IconName)
		sets = append(sets, fmt.Sprintf("icon_name = @p%d", len(args)))
	}
	if req.Color != nil {
		args = append(args, *req.Color)
		sets = append(sets, fmt.Sprintf("color = @p%d", len(args)))
	}
	if req.Jenis != nil {
		args = append(args, *req.Jenis)
		sets = append(sets, fmt.Sprintf("jenis = @p%d", len(args)))
	}
	if req.Urutan != nil {
		args = append(args, *req.Urutan)
		sets = append(sets, fmt.Sprintf("urutan = @p%d", len(args)))
	}
	if req.IsActive != nil {
		args = append(args, *req.IsActive)
		sets = append(sets, fmt.Sprintf("is_active = @p%d", len(args)))
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, id)
	q := fmt.Sprintf(`UPDATE man_konten.kategori SET %s, last_update = GETDATE() WHERE id_kategori = @p%d`,
		joinComma(sets), len(args))
	_, err := r.db.ExecContext(ctx, q, args...)
	return err
}

func (r *repository) SoftDelete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.kategori SET soft_delete = 1, last_update = GETDATE()
		WHERE id_kategori = @p1
	`, id)
	return err
}

func joinComma(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ", "
		}
		out += p
	}
	return out
}
