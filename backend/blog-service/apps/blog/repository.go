package blog

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var ErrNotFound = errors.New("blog not found")

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// GetBySubdomain — untuk public per-tenant rendering (frontend-blog).
func (r *Repository) GetBySubdomain(ctx context.Context, subdomain string) (*Blog, error) {
	q := `SELECT id_blog, id_pengguna_pdut, id_tipe_role, subdomain, nm_blog, nm_tampilan,
	             tagline, deskripsi, avatar_url, cover_url, bio, lokasi, sosmed_json,
	             id_template_theme, theme_config_json, meta_seo_json, bahasa, timezone,
	             a_aktif, a_publik, a_komentar_aktif, a_terverifikasi, tgl_klaim,
	             jumlah_post, jumlah_view, jumlah_follower, rating_avg, rating_count, skor_seo,
	             created_at, updated_at
	      FROM blog.blog
	      WHERE subdomain = $1 AND soft_delete IS NULL AND a_aktif = TRUE`
	var b Blog
	if err := r.db.GetContext(ctx, &b, q, subdomain); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get blog by subdomain: %w", err)
	}
	return &b, nil
}

// GetByID — single blog by UUID.
func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Blog, error) {
	q := `SELECT id_blog, id_pengguna_pdut, id_tipe_role, subdomain, nm_blog, nm_tampilan,
	             tagline, deskripsi, avatar_url, cover_url, bio, lokasi, sosmed_json,
	             id_template_theme, theme_config_json, meta_seo_json, bahasa, timezone,
	             a_aktif, a_publik, a_komentar_aktif, a_terverifikasi, tgl_klaim,
	             jumlah_post, jumlah_view, jumlah_follower, rating_avg, rating_count, skor_seo,
	             created_at, updated_at
	      FROM blog.blog
	      WHERE id_blog = $1 AND soft_delete IS NULL`
	var b Blog
	if err := r.db.GetContext(ctx, &b, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get blog by id: %w", err)
	}
	return &b, nil
}

// GetByUserPdut — get blog yang dimiliki user tertentu (1 user = 1 blog).
func (r *Repository) GetByUserPdut(ctx context.Context, idPengguna uuid.UUID) (*Blog, error) {
	q := `SELECT id_blog, id_pengguna_pdut, id_tipe_role, subdomain, nm_blog, nm_tampilan,
	             tagline, deskripsi, avatar_url, cover_url, bio, lokasi, sosmed_json,
	             id_template_theme, theme_config_json, meta_seo_json, bahasa, timezone,
	             a_aktif, a_publik, a_komentar_aktif, a_terverifikasi, tgl_klaim,
	             jumlah_post, jumlah_view, jumlah_follower, rating_avg, rating_count, skor_seo,
	             created_at, updated_at
	      FROM blog.blog
	      WHERE id_pengguna_pdut = $1 AND soft_delete IS NULL`
	var b Blog
	if err := r.db.GetContext(ctx, &b, q, idPengguna); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get blog by pengguna: %w", err)
	}
	return &b, nil
}

// UpdateProfileInput — partial PATCH untuk profile blog.
// Semua field opsional (nil = skip). Sosmed pakai *json.RawMessage supaya bisa di-set ke null vs unchanged.
type UpdateProfileInput struct {
	NmBlog      *string          `json:"nm_blog,omitempty"`
	NmTampilan  *string          `json:"nm_tampilan,omitempty"`
	Tagline     *string          `json:"tagline,omitempty"`
	Deskripsi   *string          `json:"deskripsi,omitempty"`
	Bio         *string          `json:"bio,omitempty"`
	Lokasi      *string          `json:"lokasi,omitempty"`
	AvatarURL   *string          `json:"avatar_url,omitempty"`
	CoverURL    *string          `json:"cover_url,omitempty"`
	SosmedJSON      *json.RawMessage `json:"sosmed_json,omitempty"`
	MetaSeoJSON     *json.RawMessage `json:"meta_seo_json,omitempty"`
	ThemeConfigJSON *json.RawMessage `json:"theme_config_json,omitempty"`
	Bahasa          *string          `json:"bahasa,omitempty"`
	Timezone    *string          `json:"timezone,omitempty"`
}

// UpdateProfile — partial update fields blog. Validasi length di sini supaya
// error message konsisten (DB constraint juga ada, tapi user-friendly di app layer).
func (r *Repository) UpdateProfile(ctx context.Context, idBlog uuid.UUID, in UpdateProfileInput) (*Blog, error) {
	// Validations
	if in.NmBlog != nil && (len(*in.NmBlog) < 1 || len(*in.NmBlog) > 100) {
		return nil, errors.New("nm_blog harus 1-100 karakter")
	}
	if in.NmTampilan != nil && len(*in.NmTampilan) > 100 {
		return nil, errors.New("nm_tampilan max 100 karakter")
	}
	if in.Tagline != nil && len(*in.Tagline) > 255 {
		return nil, errors.New("tagline max 255 karakter")
	}
	if in.Bio != nil && len(*in.Bio) > 500 {
		return nil, errors.New("bio max 500 karakter")
	}
	if in.Lokasi != nil && len(*in.Lokasi) > 100 {
		return nil, errors.New("lokasi max 100 karakter")
	}
	if in.Deskripsi != nil && len(*in.Deskripsi) > 50000 {
		return nil, errors.New("deskripsi max 50000 karakter")
	}

	sets := []string{}
	args := []any{}
	idx := 1
	addStr := func(col string, v *string) {
		if v == nil {
			return
		}
		sets = append(sets, fmt.Sprintf("%s = NULLIF($%d, '')", col, idx))
		args = append(args, *v)
		idx++
	}
	addStr("nm_blog", in.NmBlog)
	addStr("nm_tampilan", in.NmTampilan)
	addStr("tagline", in.Tagline)
	addStr("deskripsi", in.Deskripsi)
	addStr("bio", in.Bio)
	addStr("lokasi", in.Lokasi)
	addStr("avatar_url", in.AvatarURL)
	addStr("cover_url", in.CoverURL)
	addStr("bahasa", in.Bahasa)
	addStr("timezone", in.Timezone)
	if in.SosmedJSON != nil {
		sets = append(sets, fmt.Sprintf("sosmed_json = $%d::jsonb", idx))
		args = append(args, string(*in.SosmedJSON))
		idx++
	}
	if in.MetaSeoJSON != nil {
		sets = append(sets, fmt.Sprintf("meta_seo_json = $%d::jsonb", idx))
		args = append(args, string(*in.MetaSeoJSON))
		idx++
	}
	if in.ThemeConfigJSON != nil {
		sets = append(sets, fmt.Sprintf("theme_config_json = $%d::jsonb", idx))
		args = append(args, string(*in.ThemeConfigJSON))
		idx++
	}
	if len(sets) == 0 {
		return nil, errors.New("tidak ada field untuk di-update")
	}
	sets = append(sets, "updated_at = NOW()")
	args = append(args, idBlog)
	q := fmt.Sprintf(`UPDATE blog.blog SET %s
	                  WHERE id_blog = $%d AND soft_delete IS NULL`,
		strings.Join(sets, ", "), idx)
	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("update profile: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, idBlog)
}

// AdminFlagsInput — admin curation flags (partial update).
type AdminFlagsInput struct {
	ATerverifikasi *bool `json:"a_terverifikasi,omitempty"`
	AAktif         *bool `json:"a_aktif,omitempty"`
}

// SetFlagsAdmin — admin toggle a_terverifikasi / a_aktif. Pointer = partial.
// Used untuk verify legit user (centang biru) atau suspend bad actor (a_aktif=false).
func (r *Repository) SetFlagsAdmin(ctx context.Context, idBlog uuid.UUID, in AdminFlagsInput) (*Blog, error) {
	if in.ATerverifikasi == nil && in.AAktif == nil {
		return nil, errors.New("tidak ada flag untuk di-update")
	}
	sets := []string{}
	args := []any{}
	idx := 1
	if in.ATerverifikasi != nil {
		sets = append(sets, fmt.Sprintf("a_terverifikasi = $%d", idx))
		args = append(args, *in.ATerverifikasi)
		idx++
	}
	if in.AAktif != nil {
		sets = append(sets, fmt.Sprintf("a_aktif = $%d", idx))
		args = append(args, *in.AAktif)
		idx++
	}
	sets = append(sets, "updated_at = NOW()")
	args = append(args, idBlog)
	q := fmt.Sprintf(`UPDATE blog.blog SET %s
	                  WHERE id_blog = $%d AND soft_delete IS NULL`,
		strings.Join(sets, ", "), idx)
	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("admin set flags: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, idBlog)
}

// List — listing untuk admin (semua blog) atau apex aggregator (top blogs).
type ListParams struct {
	Limit         int
	Offset        int
	Search        string  // search di nm_blog / subdomain / nm_tampilan
	TipeRoleKode  string  // filter "MHS" / "STAF" / "DOSEN" / "ALUMNI"
	AktifOnly     bool    // default true untuk public, false untuk admin
	VerifiedOnly  bool    // filter a_terverifikasi=TRUE (Featured Authors carousel)
	OrderBy       string  // "popular" | "latest" | "alphabetical"
}

func (r *Repository) List(ctx context.Context, p ListParams) ([]BlogSummary, int, error) {
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 20
	}
	if p.OrderBy == "" {
		p.OrderBy = "popular"
	}

	where := []string{"b.soft_delete IS NULL"}
	args := []any{}
	idx := 1

	if p.AktifOnly {
		where = append(where, "b.a_aktif = TRUE AND b.a_publik = TRUE")
	}
	if p.VerifiedOnly {
		where = append(where, "b.a_terverifikasi = TRUE")
	}
	if p.Search != "" {
		where = append(where, fmt.Sprintf("(b.nm_blog ILIKE $%d OR b.subdomain ILIKE $%d OR b.nm_tampilan ILIKE $%d)", idx, idx, idx))
		args = append(args, "%"+p.Search+"%")
		idx++
	}
	if p.TipeRoleKode != "" {
		where = append(where, fmt.Sprintf("t.kode = $%d", idx))
		args = append(args, p.TipeRoleKode)
		idx++
	}

	whereSQL := ""
	for i, w := range where {
		if i == 0 {
			whereSQL = "WHERE " + w
		} else {
			whereSQL += " AND " + w
		}
	}

	orderSQL := "ORDER BY b.jumlah_view DESC, b.jumlah_post DESC"
	switch p.OrderBy {
	case "latest":
		orderSQL = "ORDER BY b.tgl_klaim DESC NULLS LAST"
	case "alphabetical":
		orderSQL = "ORDER BY b.nm_blog ASC"
	}

	// Count total
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM blog.blog b
		JOIN ref.tipe_role t ON b.id_tipe_role = t.id_tipe_role
		%s`, whereSQL)
	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("count blogs: %w", err)
	}

	// Fetch data
	dataQuery := fmt.Sprintf(`
		SELECT b.id_blog, b.subdomain, b.nm_blog, b.nm_tampilan, b.tagline,
		       b.avatar_url, t.kode AS tipe_role_kode,
		       b.jumlah_post, b.jumlah_view, b.jumlah_follower,
		       b.a_terverifikasi, b.a_aktif, b.tgl_klaim
		FROM blog.blog b
		JOIN ref.tipe_role t ON b.id_tipe_role = t.id_tipe_role
		%s
		%s
		LIMIT $%d OFFSET $%d`, whereSQL, orderSQL, idx, idx+1)
	args = append(args, p.Limit, p.Offset)

	var items []BlogSummary
	if err := r.db.SelectContext(ctx, &items, dataQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("list blogs: %w", err)
	}
	return items, total, nil
}
