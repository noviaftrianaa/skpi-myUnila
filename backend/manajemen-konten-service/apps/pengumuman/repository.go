package pengumuman

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	List(ctx context.Context, f *ListFilter) (*ListResult, error)
	GetByID(ctx context.Context, id string) (*Pengumuman, error)
	GetBySlug(ctx context.Context, slug string) (*Pengumuman, error)
	Create(ctx context.Context, req *CreatePengumumanRequest, creatorID string) (string, error)
	Update(ctx context.Context, id string, req *UpdatePengumumanRequest, updaterID string) error
	SoftDelete(ctx context.Context, id string) error
	IncrementView(ctx context.Context, id string) error
	UpdateStatus(ctx context.Context, id, status string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

const baseSelect = `
	SELECT
		CAST(p.id_pengumuman AS VARCHAR(36)) AS id_pengumuman,
		p.tipe, p.judul, p.slug, p.ringkasan, p.isi,
		CAST(p.id_kategori AS VARCHAR(36)) AS id_kategori,
		k.nama AS nama_kategori, k.icon_name AS icon_kategori, k.color AS color_kategori,
		p.banner_url, p.author, p.tags,
		CAST(p.is_pinned AS BIT) AS is_pinned,
		CAST(p.is_featured AS BIT) AS is_featured,
		p.tgl_terbit, p.tgl_expiry, p.status, p.target_role, p.view_count,
		CAST(p.allow_comment AS BIT) AS allow_comment,
		CAST(p.allow_like AS BIT) AS allow_like,
		p.create_date, p.last_update
	FROM man_konten.pengumuman p
	LEFT JOIN man_konten.kategori k ON k.id_kategori = p.id_kategori AND k.soft_delete = 0
`

func (r *repository) List(ctx context.Context, f *ListFilter) (*ListResult, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Limit < 1 || f.Limit > 200 {
		f.Limit = 20
	}
	args := []any{}
	where := "WHERE p.soft_delete = 0"
	if f.Tipe != "" {
		// Support comma-separated tipe (e.g. "berita,artikel")
		tipes := strings.Split(f.Tipe, ",")
		if len(tipes) == 1 {
			args = append(args, strings.TrimSpace(tipes[0]))
			where += fmt.Sprintf(" AND p.tipe = @p%d", len(args))
		} else {
			placeholders := make([]string, 0, len(tipes))
			for _, t := range tipes {
				args = append(args, strings.TrimSpace(t))
				placeholders = append(placeholders, fmt.Sprintf("@p%d", len(args)))
			}
			where += " AND p.tipe IN (" + strings.Join(placeholders, ",") + ")"
		}
	}
	if f.IDKategori != "" {
		args = append(args, f.IDKategori)
		where += fmt.Sprintf(" AND p.id_kategori = @p%d", len(args))
	}
	if f.Status != "" {
		args = append(args, f.Status)
		where += fmt.Sprintf(" AND p.status = @p%d", len(args))
	}
	if f.TargetRole != "" {
		args = append(args, f.TargetRole)
		where += fmt.Sprintf(" AND p.target_role = @p%d", len(args))
	}
	if f.Search != "" {
		args = append(args, "%"+f.Search+"%")
		where += fmt.Sprintf(" AND (p.judul LIKE @p%d OR p.ringkasan LIKE @p%d)", len(args), len(args))
	}

	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM man_konten.pengumuman p "+where, args...); err != nil {
		return nil, fmt.Errorf("count: %w", err)
	}

	offset := (f.Page - 1) * f.Limit
	args = append(args, offset, f.Limit)
	q := baseSelect + where + fmt.Sprintf(`
		ORDER BY p.is_pinned DESC, p.tgl_terbit DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, len(args)-1, len(args))

	var items []Pengumuman
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}
	return &ListResult{Items: items, Total: total, Page: f.Page, Limit: f.Limit}, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Pengumuman, error) {
	var p Pengumuman
	if err := r.db.GetContext(ctx, &p, baseSelect+" WHERE p.id_pengumuman = @p1 AND p.soft_delete = 0", id); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) GetBySlug(ctx context.Context, slug string) (*Pengumuman, error) {
	var p Pengumuman
	if err := r.db.GetContext(ctx, &p, baseSelect+" WHERE p.slug = @p1 AND p.soft_delete = 0", slug); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) Create(ctx context.Context, req *CreatePengumumanRequest, creatorID string) (string, error) {
	tipe := req.Tipe
	if tipe == "" {
		tipe = "pengumuman"
	}
	status := req.Status
	if status == "" {
		status = "draft"
	}
	target := req.TargetRole
	if target == "" {
		target = "all"
	}
	tglTerbit := time.Now()
	if req.TglTerbit != nil && *req.TglTerbit != "" {
		if t, err := time.Parse(time.RFC3339, *req.TglTerbit); err == nil {
			tglTerbit = t
		} else if t, err := time.Parse("2006-01-02", *req.TglTerbit); err == nil {
			tglTerbit = t
		}
	}
	var tglExpiry *time.Time
	if req.TglExpiry != nil && *req.TglExpiry != "" {
		if t, err := time.Parse(time.RFC3339, *req.TglExpiry); err == nil {
			tglExpiry = &t
		} else if t, err := time.Parse("2006-01-02", *req.TglExpiry); err == nil {
			tglExpiry = &t
		}
	}
	slug := req.Slug
	if slug == nil && (tipe == "berita" || tipe == "artikel") {
		s := slugify(req.Judul)
		slug = &s
	}

	var creatorUUID interface{}
	if creatorID != "" {
		creatorUUID = creatorID
	}

	var id string
	row := r.db.QueryRowxContext(ctx, `
		INSERT INTO man_konten.pengumuman
			(id_pengumuman, tipe, judul, slug, ringkasan, isi, id_kategori, banner_url,
			 author, tags, is_pinned, is_featured, tgl_terbit, tgl_expiry, status,
			 target_role, view_count, allow_comment, allow_like,
			 id_creator, create_date, last_update, soft_delete)
		OUTPUT CAST(INSERTED.id_pengumuman AS VARCHAR(36))
		VALUES (NEWID(), @p1, @p2, @p3, @p4, @p5, @p6, @p7,
		        @p8, @p9, @p10, @p11, @p12, @p13, @p14,
		        @p15, 0, @p16, @p17,
		        @p18, GETDATE(), GETDATE(), 0)
	`, tipe, req.Judul, slug, req.Ringkasan, req.Isi, req.IDKategori, req.BannerURL,
		req.Author, req.Tags, req.IsPinned, req.IsFeatured, tglTerbit, tglExpiry, status,
		target, req.AllowComment, req.AllowLike, creatorUUID)
	if err := row.Scan(&id); err != nil {
		return "", fmt.Errorf("create: %w", err)
	}
	return id, nil
}

func (r *repository) Update(ctx context.Context, id string, req *UpdatePengumumanRequest, updaterID string) error {
	sets := []string{}
	args := []any{}
	add := func(col string, val any) {
		args = append(args, val)
		sets = append(sets, fmt.Sprintf("%s = @p%d", col, len(args)))
	}
	if req.Tipe != nil {
		add("tipe", *req.Tipe)
	}
	if req.Judul != nil {
		add("judul", *req.Judul)
	}
	if req.Slug != nil {
		add("slug", *req.Slug)
	}
	if req.Ringkasan != nil {
		add("ringkasan", *req.Ringkasan)
	}
	if req.Isi != nil {
		add("isi", *req.Isi)
	}
	if req.IDKategori != nil {
		add("id_kategori", *req.IDKategori)
	}
	if req.BannerURL != nil {
		add("banner_url", *req.BannerURL)
	}
	if req.Author != nil {
		add("author", *req.Author)
	}
	if req.Tags != nil {
		add("tags", *req.Tags)
	}
	if req.IsPinned != nil {
		add("is_pinned", *req.IsPinned)
	}
	if req.IsFeatured != nil {
		add("is_featured", *req.IsFeatured)
	}
	if req.TglTerbit != nil && *req.TglTerbit != "" {
		if t, err := time.Parse(time.RFC3339, *req.TglTerbit); err == nil {
			add("tgl_terbit", t)
		} else if t, err := time.Parse("2006-01-02", *req.TglTerbit); err == nil {
			add("tgl_terbit", t)
		}
	}
	if req.TglExpiry != nil {
		if *req.TglExpiry == "" {
			add("tgl_expiry", nil)
		} else if t, err := time.Parse(time.RFC3339, *req.TglExpiry); err == nil {
			add("tgl_expiry", t)
		} else if t, err := time.Parse("2006-01-02", *req.TglExpiry); err == nil {
			add("tgl_expiry", t)
		}
	}
	if req.Status != nil {
		add("status", *req.Status)
	}
	if req.TargetRole != nil {
		add("target_role", *req.TargetRole)
	}
	if req.AllowComment != nil {
		add("allow_comment", *req.AllowComment)
	}
	if req.AllowLike != nil {
		add("allow_like", *req.AllowLike)
	}
	if updaterID != "" {
		add("id_updater", updaterID)
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, id)
	q := fmt.Sprintf(`UPDATE man_konten.pengumuman SET %s, last_update = GETDATE() WHERE id_pengumuman = @p%d`,
		strings.Join(sets, ", "), len(args))
	_, err := r.db.ExecContext(ctx, q, args...)
	return err
}

func (r *repository) SoftDelete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.pengumuman SET soft_delete = 1, last_update = GETDATE()
		WHERE id_pengumuman = @p1
	`, id)
	return err
}

func (r *repository) IncrementView(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.pengumuman SET view_count = view_count + 1
		WHERE id_pengumuman = @p1 AND soft_delete = 0
	`, id)
	return err
}

func (r *repository) UpdateStatus(ctx context.Context, id, status string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.pengumuman SET status = @p2, last_update = GETDATE()
		WHERE id_pengumuman = @p1
	`, id, status)
	return err
}

// slugify — normalize judul ke slug URL-friendly.
func slugify(s string) string {
	s = strings.ToLower(s)
	out := strings.Builder{}
	prevDash := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			out.WriteRune(r)
			prevDash = false
		} else if r == ' ' || r == '-' || r == '_' {
			if !prevDash {
				out.WriteRune('-')
				prevDash = true
			}
		}
	}
	res := out.String()
	res = strings.Trim(res, "-")
	if len(res) > 200 {
		res = res[:200]
	}
	return res
}
