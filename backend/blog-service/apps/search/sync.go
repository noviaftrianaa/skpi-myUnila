// Package search — bridges blog.post + blog.blog rows into Meilisearch
// documents. The Sync helper fetches all eligible posts and bulk-indexes them
// (used for initial backfill + admin re-sync). IndexPostByID is for the
// per-post hook called by post.Handler after publish/update.
package search

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/myunila/blog-service/external/meilisearch"
)

// Repository — read-only side of the post table for building Meilisearch
// documents. We don't reuse apps/post.Repository to avoid import cycle.
type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// docRow mirrors a single SELECT row used for both bulk + per-post indexing.
type docRow struct {
	IDPost         uuid.UUID  `db:"id_post"`
	IDBlog         uuid.UUID  `db:"id_blog"`
	Subdomain      string     `db:"subdomain"`
	NmBlog         string     `db:"nm_blog"`
	NmTampilan     *string    `db:"nm_tampilan"`
	AvatarURL      *string    `db:"avatar_url"`
	APublik        bool       `db:"a_publik"`
	Judul          string     `db:"judul"`
	Slug           string     `db:"slug"`
	Ringkasan      *string    `db:"ringkasan"`
	KontenHTML     *string    `db:"konten_html"`
	CoverURL       *string    `db:"cover_url"`
	Status         string     `db:"status"`
	KategoriSlug   *string    `db:"kategori_slug"`
	KategoriNama   *string    `db:"kategori_nama"`
	KategoriWarna  *string    `db:"kategori_warna"`
	TagsCSV        *string    `db:"tags_csv"`
	TglTerbit      *time.Time `db:"tgl_terbit"`
	JumlahView     int        `db:"jumlah_view"`
	JumlahLike     int        `db:"jumlah_like"`
	WaktuBacaMenit int        `db:"waktu_baca_menit"`
	SkorTrending   float64    `db:"skor_trending"`
}

const docSelect = `
	SELECT p.id_post, p.id_blog,
	       b.subdomain, b.nm_blog, b.nm_tampilan, b.avatar_url, b.a_publik,
	       p.judul, p.slug, p.ringkasan, p.konten_html, p.cover_url, p.status,
	       k.slug AS kategori_slug, k.nm_kategori AS kategori_nama, k.warna AS kategori_warna,
	       (SELECT string_agg(t.nm_tag, ',' ORDER BY t.nm_tag)
	          FROM blog.post_tag pt JOIN ref.tag t ON pt.id_tag = t.id_tag
	         WHERE pt.id_post = p.id_post) AS tags_csv,
	       p.tgl_terbit, p.jumlah_view, p.jumlah_like, p.waktu_baca_menit, p.skor_trending
	FROM blog.post p
	JOIN blog.blog b ON p.id_blog = b.id_blog
	LEFT JOIN ref.kategori_post k ON p.id_kategori_post = k.id_kategori_post
`

// ListEligibleForIndex returns every published, non-deleted, public-blog post.
// Used by the bulk sync command.
func (r *Repository) ListEligibleForIndex(ctx context.Context, limit, offset int) ([]docRow, error) {
	if limit <= 0 || limit > 1000 {
		limit = 500
	}
	rows := make([]docRow, 0, limit)
	q := docSelect + `
		WHERE p.status = 'published'
		  AND p.soft_delete IS NULL
		  AND b.soft_delete IS NULL
		  AND b.a_aktif = TRUE
		  AND b.a_publik = TRUE
		ORDER BY p.created_at ASC
		LIMIT $1 OFFSET $2`
	if err := r.db.SelectContext(ctx, &rows, q, limit, offset); err != nil {
		return nil, fmt.Errorf("list eligible: %w", err)
	}
	return rows, nil
}

// GetForIndex returns a single post regardless of status — caller decides
// whether to index or remove based on the returned status field.
func (r *Repository) GetForIndex(ctx context.Context, idPost uuid.UUID) (*docRow, error) {
	var row docRow
	if err := r.db.GetContext(ctx, &row, docSelect+`
		WHERE p.id_post = $1`, idPost); err != nil {
		return nil, err
	}
	return &row, nil
}

// =============================================================================
// SYNC SERVICE — wraps Repository + meilisearch.Client.
// =============================================================================

type Service struct {
	repo *Repository
	ms   *meilisearch.Client
}

func NewService(repo *Repository, ms *meilisearch.Client) *Service {
	return &Service{repo: repo, ms: ms}
}

// IndexPostByID looks up the post and either upserts it (if publishable) or
// removes it (if status != published, deleted, or blog not public). Errors
// here are non-fatal at the call site — the post write itself already
// succeeded, this is best-effort.
func (s *Service) IndexPostByID(ctx context.Context, idPost uuid.UUID) error {
	if s == nil || s.ms == nil {
		return nil // search disabled
	}
	row, err := s.repo.GetForIndex(ctx, idPost)
	if err != nil {
		// If the row doesn't exist (hard delete edge case), try to remove anyway.
		_ = s.ms.RemoveOne(ctx, idPost.String())
		return fmt.Errorf("get for index: %w", err)
	}
	if !shouldIndex(row) {
		return s.ms.RemoveOne(ctx, idPost.String())
	}
	doc := buildDoc(row)
	return s.ms.IndexOne(ctx, doc)
}

// RemovePostByID drops a post from the index regardless of current row state.
// Convenience for the hard-delete path.
func (s *Service) RemovePostByID(ctx context.Context, idPost uuid.UUID) error {
	if s == nil || s.ms == nil {
		return nil
	}
	return s.ms.RemoveOne(ctx, idPost.String())
}

// FullResync reindexes every eligible post. Returns the count of indexed docs.
// Called by an admin endpoint + boot-time if MEILISEARCH_RESYNC_ON_BOOT=true.
func (s *Service) FullResync(ctx context.Context) (int, error) {
	if s == nil || s.ms == nil {
		return 0, fmt.Errorf("search not configured")
	}
	indexed := 0
	const batch = 500
	offset := 0
	for {
		rows, err := s.repo.ListEligibleForIndex(ctx, batch, offset)
		if err != nil {
			return indexed, err
		}
		if len(rows) == 0 {
			break
		}
		docs := make([]meilisearch.Document, 0, len(rows))
		for _, r := range rows {
			docs = append(docs, buildDoc(&r))
		}
		if err := s.ms.IndexBatch(ctx, docs); err != nil {
			return indexed, err
		}
		indexed += len(docs)
		if len(rows) < batch {
			break
		}
		offset += batch
	}
	log.Printf("search.FullResync: indexed %d posts", indexed)
	return indexed, nil
}

// =============================================================================
// HELPERS
// =============================================================================

func shouldIndex(r *docRow) bool {
	return r.Status == "published" && r.APublik
}

// htmlTagRe — same regex used elsewhere in the codebase for HTML→text. Kept
// simple because Meilisearch tokenises so we don't need pristine output.
var htmlTagRe = regexp.MustCompile(`<[^>]+>`)
var wsRe = regexp.MustCompile(`\s+`)

func stripHTML(s string) string {
	if s == "" {
		return ""
	}
	clean := htmlTagRe.ReplaceAllString(s, " ")
	clean = wsRe.ReplaceAllString(clean, " ")
	clean = strings.TrimSpace(clean)
	// Cap body length so we don't ship 100KB documents through every search hit.
	if len(clean) > 8000 {
		clean = clean[:8000]
	}
	return clean
}

func buildDoc(r *docRow) meilisearch.Document {
	deref := func(p *string) string {
		if p == nil {
			return ""
		}
		return *p
	}
	doc := meilisearch.Document{
		IDPost:        r.IDPost.String(),
		IDBlog:        r.IDBlog.String(),
		Subdomain:     r.Subdomain,
		NmBlog:        r.NmBlog,
		NmTampilan:    deref(r.NmTampilan),
		AvatarURL:     deref(r.AvatarURL),
		Judul:         r.Judul,
		Slug:          r.Slug,
		Ringkasan:     deref(r.Ringkasan),
		KontenText:    stripHTML(deref(r.KontenHTML)),
		CoverURL:      deref(r.CoverURL),
		Status:        r.Status,
		APublik:       r.APublik,
		KategoriSlug:  deref(r.KategoriSlug),
		KategoriNama:  deref(r.KategoriNama),
		KategoriWarna: deref(r.KategoriWarna),
		TagsCSV:       deref(r.TagsCSV),
		JumlahView:    r.JumlahView,
		JumlahLike:    r.JumlahLike,
		WaktuBaca:     r.WaktuBacaMenit,
		SkorTrending:  r.SkorTrending,
	}
	if r.TglTerbit != nil {
		doc.TglTerbit = r.TglTerbit.Unix()
	}
	return doc
}
