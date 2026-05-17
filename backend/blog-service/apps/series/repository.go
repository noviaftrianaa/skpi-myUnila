// Package series — group posts into ordered sequences (lecture series,
// tutorial, paper series). Schema: blog.series + post.id_series + post.urutan_series.
// One post belongs to at most one series; counter denorm via DB trigger.
package series

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var ErrNotFound = errors.New("series not found")
var ErrSlugTaken = errors.New("slug already taken in this blog")

type Series struct {
	IDSeries    uuid.UUID  `db:"id_series"   json:"id_series"`
	IDBlog      uuid.UUID  `db:"id_blog"     json:"id_blog"`
	Judul       string     `db:"judul"       json:"judul"`
	Slug        string     `db:"slug"        json:"slug"`
	Deskripsi   *string    `db:"deskripsi"   json:"deskripsi,omitempty"`
	CoverURL    *string    `db:"cover_url"   json:"cover_url,omitempty"`
	AAktif      bool       `db:"a_aktif"     json:"a_aktif"`
	JumlahPost  int        `db:"jumlah_post" json:"jumlah_post"`
	CreatedAt   time.Time  `db:"created_at"  json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"  json:"updated_at"`
	SoftDelete  *time.Time `db:"soft_delete" json:"soft_delete,omitempty"`
}

// SeriesPost — light view of a post entry within a series (for series detail page).
type SeriesPost struct {
	IDPost        uuid.UUID  `db:"id_post"         json:"id_post"`
	Judul         string     `db:"judul"           json:"judul"`
	Slug          string     `db:"slug"            json:"slug"`
	Ringkasan     *string    `db:"ringkasan"       json:"ringkasan,omitempty"`
	CoverURL      *string    `db:"cover_url"       json:"cover_url,omitempty"`
	Status        string     `db:"status"          json:"status"`
	TglTerbit     *time.Time `db:"tgl_terbit"      json:"tgl_terbit,omitempty"`
	UrutanSeries  *int       `db:"urutan_series"   json:"urutan_series,omitempty"`
	WaktuBacaMin  int        `db:"waktu_baca_menit" json:"waktu_baca_menit"`
	JumlahView    int        `db:"jumlah_view"     json:"jumlah_view"`
	JumlahLike    int        `db:"jumlah_like"     json:"jumlah_like"`
	JumlahKomentar int       `db:"jumlah_komentar" json:"jumlah_komentar"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// =============================================================================
// MUTATIONS
// =============================================================================

type CreateInput struct {
	IDBlog    uuid.UUID
	Judul     string
	Slug      string
	Deskripsi *string
	CoverURL  *string
}

func (r *Repository) Create(ctx context.Context, in CreateInput) (*Series, error) {
	slug := strings.TrimSpace(in.Slug)
	if slug == "" {
		slug = SlugFrom(in.Judul)
	}
	if !isValidSlug(slug) {
		return nil, errors.New("slug must be 2-120 chars, lowercase alphanumerics + dashes only")
	}

	var s Series
	err := r.db.GetContext(ctx, &s, `
		INSERT INTO blog.series (id_blog, judul, slug, deskripsi, cover_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_series, id_blog, judul, slug, deskripsi, cover_url,
		          a_aktif, jumlah_post, created_at, updated_at, soft_delete`,
		in.IDBlog, strings.TrimSpace(in.Judul), slug, in.Deskripsi, in.CoverURL)
	if err != nil {
		// Unique violation (id_blog, slug) → friendlier message.
		if strings.Contains(err.Error(), "uq_series_blog_slug") {
			return nil, ErrSlugTaken
		}
		return nil, fmt.Errorf("insert series: %w", err)
	}
	return &s, nil
}

type UpdateInput struct {
	Judul     *string
	Slug      *string
	Deskripsi *string
	CoverURL  *string
	AAktif    *bool
}

func (r *Repository) Update(ctx context.Context, idSeries, idBlog uuid.UUID, in UpdateInput) (*Series, error) {
	// Only allow slug update when the new value is valid.
	if in.Slug != nil {
		s := strings.TrimSpace(*in.Slug)
		if !isValidSlug(s) {
			return nil, errors.New("slug invalid: 2-120 chars, lowercase alphanumerics + dashes only")
		}
		in.Slug = &s
	}
	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.series SET
		    judul     = COALESCE($3, judul),
		    slug      = COALESCE($4, slug),
		    deskripsi = COALESCE($5, deskripsi),
		    cover_url = COALESCE($6, cover_url),
		    a_aktif   = COALESCE($7, a_aktif),
		    updated_at = NOW()
		WHERE id_series = $1 AND id_blog = $2 AND soft_delete IS NULL`,
		idSeries, idBlog, in.Judul, in.Slug, in.Deskripsi, in.CoverURL, in.AAktif)
	if err != nil {
		if strings.Contains(err.Error(), "uq_series_blog_slug") {
			return nil, ErrSlugTaken
		}
		return nil, fmt.Errorf("update series: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, idSeries, idBlog)
}

// SoftDelete marks the series deleted. Posts referencing it keep their
// id_series pointer (so a future restore is clean) — but the public list/show
// queries filter by `soft_delete IS NULL`, so they vanish from view.
func (r *Repository) SoftDelete(ctx context.Context, idSeries, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.series
		SET soft_delete = NOW(), updated_at = NOW()
		WHERE id_series = $1 AND id_blog = $2 AND soft_delete IS NULL`, idSeries, idBlog)
	if err != nil {
		return fmt.Errorf("soft delete series: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// =============================================================================
// READS
// =============================================================================

func (r *Repository) GetByID(ctx context.Context, idSeries, idBlog uuid.UUID) (*Series, error) {
	var s Series
	err := r.db.GetContext(ctx, &s, `
		SELECT id_series, id_blog, judul, slug, deskripsi, cover_url,
		       a_aktif, jumlah_post, created_at, updated_at, soft_delete
		FROM blog.series
		WHERE id_series = $1 AND id_blog = $2 AND soft_delete IS NULL`,
		idSeries, idBlog)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get series: %w", err)
	}
	return &s, nil
}

func (r *Repository) GetBySlug(ctx context.Context, idBlog uuid.UUID, slug string) (*Series, error) {
	var s Series
	err := r.db.GetContext(ctx, &s, `
		SELECT id_series, id_blog, judul, slug, deskripsi, cover_url,
		       a_aktif, jumlah_post, created_at, updated_at, soft_delete
		FROM blog.series
		WHERE id_blog = $1 AND slug = $2 AND soft_delete IS NULL`,
		idBlog, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get series by slug: %w", err)
	}
	return &s, nil
}

func (r *Repository) ListByBlog(ctx context.Context, idBlog uuid.UUID, onlyActive bool) ([]Series, error) {
	where := "id_blog = $1 AND soft_delete IS NULL"
	if onlyActive {
		where += " AND a_aktif = TRUE"
	}
	rows := make([]Series, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_series, id_blog, judul, slug, deskripsi, cover_url,
		       a_aktif, jumlah_post, created_at, updated_at, soft_delete
		FROM blog.series
		WHERE `+where+`
		ORDER BY created_at DESC`, idBlog)
	if err != nil {
		return nil, fmt.Errorf("list series: %w", err)
	}
	return rows, nil
}

// PostsInSeries returns the ordered list of posts in a series. For owner view
// (`includeUnpublished=true`) returns all statuses; for public view returns
// only published posts.
func (r *Repository) PostsInSeries(ctx context.Context, idSeries uuid.UUID, includeUnpublished bool) ([]SeriesPost, error) {
	where := "id_series = $1 AND soft_delete IS NULL"
	if !includeUnpublished {
		where += " AND status = 'published'"
	}
	rows := make([]SeriesPost, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_post, judul, slug, ringkasan, cover_url, status, tgl_terbit,
		       urutan_series, waktu_baca_menit, jumlah_view, jumlah_like, jumlah_komentar
		FROM blog.post
		WHERE `+where+`
		ORDER BY urutan_series NULLS LAST, tgl_terbit ASC, created_at ASC`, idSeries)
	if err != nil {
		return nil, fmt.Errorf("posts in series: %w", err)
	}
	return rows, nil
}

// SeriesContext returns prev/next post for the supplied post within its series.
// Returns nils when no series, no neighbour, or post not found.
type SeriesContext struct {
	Series *Series      `json:"series,omitempty"`
	Prev   *SeriesPost  `json:"prev,omitempty"`
	Next   *SeriesPost  `json:"next,omitempty"`
	Index  int          `json:"index"`  // 1-based index in the series (0 if not in one)
	Total  int          `json:"total"`  // total *published* posts in the series
	All    []SeriesPost `json:"all,omitempty"` // optional, for sidebar
}

func (r *Repository) SeriesContextForPost(ctx context.Context, idPost uuid.UUID) (*SeriesContext, error) {
	// Read the post's series ID + its own urutan/created_at for ordering.
	var row struct {
		IDSeries     *uuid.UUID `db:"id_series"`
		IDBlog       uuid.UUID  `db:"id_blog"`
		UrutanSeries *int       `db:"urutan_series"`
		TglTerbit    *time.Time `db:"tgl_terbit"`
		CreatedAt    time.Time  `db:"created_at"`
	}
	err := r.db.GetContext(ctx, &row, `
		SELECT id_series, id_blog, urutan_series, tgl_terbit, created_at
		FROM blog.post
		WHERE id_post = $1 AND soft_delete IS NULL`, idPost)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("post lookup: %w", err)
	}
	if row.IDSeries == nil {
		return &SeriesContext{}, nil // post has no series
	}
	s, serr := r.GetByID(ctx, *row.IDSeries, row.IDBlog)
	if serr != nil {
		return nil, serr
	}

	all, perr := r.PostsInSeries(ctx, *row.IDSeries, false)
	if perr != nil {
		return nil, perr
	}

	ctxOut := &SeriesContext{Series: s, Total: len(all), All: all}
	for i, p := range all {
		if p.IDPost == idPost {
			ctxOut.Index = i + 1
			if i > 0 {
				prev := all[i-1]
				ctxOut.Prev = &prev
			}
			if i < len(all)-1 {
				next := all[i+1]
				ctxOut.Next = &next
			}
			break
		}
	}
	return ctxOut, nil
}

// =============================================================================
// POST ↔ SERIES MEMBERSHIP
// =============================================================================

// AttachPost places a post into a series at the supplied order (or appends if
// urutan is nil). Ownership is enforced by the caller (post must belong to
// idBlog).
func (r *Repository) AttachPost(ctx context.Context, idPost, idSeries, idBlog uuid.UUID, urutan *int) error {
	// Ensure both post and series belong to the same blog.
	var count int
	if err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*) FROM blog.post p
		JOIN blog.series s ON s.id_blog = p.id_blog AND s.id_series = $2
		WHERE p.id_post = $1 AND p.id_blog = $3 AND p.soft_delete IS NULL AND s.soft_delete IS NULL`,
		idPost, idSeries, idBlog); err != nil {
		return fmt.Errorf("attach pre-check: %w", err)
	}
	if count == 0 {
		return ErrNotFound
	}

	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.post
		SET id_series = $1, urutan_series = $2, updated_at = NOW()
		WHERE id_post = $3 AND id_blog = $4 AND soft_delete IS NULL`,
		idSeries, urutan, idPost, idBlog)
	if err != nil {
		return fmt.Errorf("attach post: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// DetachPost removes a post from its current series. Idempotent — succeeds
// even if the post wasn't in a series.
func (r *Repository) DetachPost(ctx context.Context, idPost, idBlog uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE blog.post
		SET id_series = NULL, urutan_series = NULL, updated_at = NOW()
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL`,
		idPost, idBlog)
	if err != nil {
		return fmt.Errorf("detach post: %w", err)
	}
	return nil
}

// Reorder reassigns urutan_series for the supplied list of post IDs (in the
// new order). Runs in a single transaction.
func (r *Repository) Reorder(ctx context.Context, idSeries, idBlog uuid.UUID, orderedPostIDs []uuid.UUID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	for i, idPost := range orderedPostIDs {
		urutan := i + 1
		_, err := tx.ExecContext(ctx, `
			UPDATE blog.post
			SET urutan_series = $1, updated_at = NOW()
			WHERE id_post = $2 AND id_blog = $3 AND id_series = $4 AND soft_delete IS NULL`,
			urutan, idPost, idBlog, idSeries)
		if err != nil {
			return fmt.Errorf("reorder #%d: %w", i, err)
		}
	}
	return tx.Commit()
}

// =============================================================================
// UTIL
// =============================================================================

var slugRe = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func isValidSlug(s string) bool {
	if len(s) < 2 || len(s) > 120 {
		return false
	}
	return slugRe.MatchString(s)
}

// SlugFrom generates a URL-safe slug from a title. Best-effort — caller can
// override before passing to Create.
func SlugFrom(title string) string {
	s := strings.ToLower(strings.TrimSpace(title))
	// Replace anything that's not lower-alnum with a hyphen.
	var out strings.Builder
	prevHyphen := false
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			out.WriteRune(r)
			prevHyphen = false
		default:
			if !prevHyphen && out.Len() > 0 {
				out.WriteRune('-')
				prevHyphen = true
			}
		}
	}
	result := strings.Trim(out.String(), "-")
	if len(result) > 120 {
		result = result[:120]
	}
	if result == "" {
		result = "series"
	}
	return result
}
