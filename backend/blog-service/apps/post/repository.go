package post

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var ErrNotFound = errors.New("post not found")

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

const summaryFields = `
	p.id_post, p.id_blog, b.subdomain, b.nm_blog, b.avatar_url,
	p.id_kategori_post, k.slug AS kategori_slug, k.nm_kategori AS kategori_nama, k.warna AS kategori_warna,
	p.judul, p.slug, p.ringkasan, p.cover_url, p.status, p.visibilitas,
	p.tgl_terbit, p.tgl_jadwal, p.a_pinned, p.a_unggulan, p.a_unggulan_blog,
	p.jumlah_view, p.jumlah_like, p.jumlah_komentar, p.waktu_baca_menit, p.created_at`

const detailExtraFields = `
	, p.konten_html, p.konten_json, p.konten_md, p.jumlah_share, p.jumlah_kata,
	p.meta_seo_json, p.bahasa, p.id_series, p.urutan_series, p.updated_at`

const fromJoin = `
	FROM blog.post p
	JOIN blog.blog b ON p.id_blog = b.id_blog
	LEFT JOIN ref.kategori_post k ON p.id_kategori_post = k.id_kategori_post`

type ListParams struct {
	Limit         int
	Offset        int
	BlogSubdomain string  // filter ke 1 blog (untuk per-tenant view)
	IDBlog        *uuid.UUID
	KategoriSlug  string
	TagSlug       string  // filter posts dengan tag tertentu (apex landing /tag/:slug)
	Status        string  // "published" untuk public, "draft" untuk dashboard own
	Search        string
	OrderBy       string  // "latest" | "popular" | "oldest" | "trending"
	UnggulanOnly  bool
	PinnedOnly    bool
}

// List — public list (apex feed, per-tenant feed) atau private list (dashboard own posts).
func (r *Repository) List(ctx context.Context, p ListParams) ([]PostSummary, int, error) {
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 20
	}
	if p.OrderBy == "" {
		p.OrderBy = "latest"
	}

	where := []string{"p.soft_delete IS NULL", "b.soft_delete IS NULL"}
	args := []any{}
	idx := 1

	if p.Status != "" {
		where = append(where, fmt.Sprintf("p.status = $%d", idx))
		args = append(args, p.Status)
		idx++
	}
	if p.BlogSubdomain != "" {
		where = append(where, fmt.Sprintf("b.subdomain = $%d", idx))
		args = append(args, p.BlogSubdomain)
		idx++
	}
	if p.IDBlog != nil {
		where = append(where, fmt.Sprintf("p.id_blog = $%d", idx))
		args = append(args, *p.IDBlog)
		idx++
	}
	if p.KategoriSlug != "" {
		where = append(where, fmt.Sprintf("k.slug = $%d", idx))
		args = append(args, p.KategoriSlug)
		idx++
	}
	if p.Search != "" {
		where = append(where, fmt.Sprintf("(p.judul ILIKE $%d OR p.ringkasan ILIKE $%d)", idx, idx))
		args = append(args, "%"+p.Search+"%")
		idx++
	}
	if p.TagSlug != "" {
		// Filter via post_tag junction. Subquery lebih simpel daripada extra JOIN
		// karena kita gak butuh kolom tag di output.
		where = append(where, fmt.Sprintf(`p.id_post IN (
			SELECT pt.id_post FROM blog.post_tag pt
			JOIN ref.tag t ON pt.id_tag = t.id_tag
			WHERE t.slug = $%d AND t.soft_delete IS NULL
		)`, idx))
		args = append(args, p.TagSlug)
		idx++
	}
	if p.UnggulanOnly {
		where = append(where, "p.a_unggulan = TRUE")
	}
	if p.PinnedOnly {
		where = append(where, "p.a_pinned = TRUE")
	}
	// Public listing: hanya post yang sudah terbit
	if p.Status == "published" {
		where = append(where, "p.visibilitas IN ('public','unlisted')")
		where = append(where, "b.a_aktif = TRUE AND b.a_publik = TRUE")
	}

	whereSQL := "WHERE " + strings.Join(where, " AND ")

	orderSQL := "ORDER BY p.tgl_terbit DESC NULLS LAST"
	switch p.OrderBy {
	case "popular":
		orderSQL = "ORDER BY p.jumlah_view DESC, p.tgl_terbit DESC NULLS LAST"
	case "oldest":
		orderSQL = "ORDER BY p.tgl_terbit ASC NULLS LAST"
	case "trending":
		// Recency-weighted score: maintained by trending_scheduler.go every 15 min.
		// Falls back to lifetime view count when skor_trending is 0 (newly published
		// posts before first recompute, or posts with no recent activity).
		orderSQL = `ORDER BY p.skor_trending DESC, p.jumlah_view DESC, p.tgl_terbit DESC NULLS LAST`
	}

	// Count
	countQuery := fmt.Sprintf(`SELECT COUNT(*) %s %s`, fromJoin, whereSQL)
	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("count posts: %w", err)
	}

	// Data
	dataQuery := fmt.Sprintf(`SELECT %s %s %s %s LIMIT $%d OFFSET $%d`, summaryFields, fromJoin, whereSQL, orderSQL, idx, idx+1)
	args = append(args, p.Limit, p.Offset)

	items := make([]PostSummary, 0)
	if err := r.db.SelectContext(ctx, &items, dataQuery, args...); err != nil {
		return nil, 0, fmt.Errorf("list posts: %w", err)
	}
	return items, total, nil
}

// ListFeed — personalized feed: posts dari blog yang user follow.
// Hanya status='published', published-only blogs, recent first.
func (r *Repository) ListFeed(ctx context.Context, idUser uuid.UUID, limit, offset int) ([]PostSummary, int, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	countQ := `
		SELECT COUNT(*)
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		JOIN interaction.follower f ON f.id_blog = b.id_blog
		WHERE f.id_pengguna_pdut = $1
		  AND p.status = 'published'
		  AND p.soft_delete IS NULL
		  AND b.soft_delete IS NULL`
	var total int
	if err := r.db.GetContext(ctx, &total, countQ, idUser); err != nil {
		return nil, 0, fmt.Errorf("count feed: %w", err)
	}

	dataQ := fmt.Sprintf(`
		SELECT %s %s
		JOIN interaction.follower f ON f.id_blog = b.id_blog
		WHERE f.id_pengguna_pdut = $1
		  AND p.status = 'published'
		  AND p.soft_delete IS NULL
		  AND b.soft_delete IS NULL
		ORDER BY p.tgl_terbit DESC NULLS LAST, p.created_at DESC
		LIMIT $2 OFFSET $3`, summaryFields, fromJoin)

	items := make([]PostSummary, 0)
	if err := r.db.SelectContext(ctx, &items, dataQ, idUser, limit, offset); err != nil {
		return nil, 0, fmt.Errorf("list feed: %w", err)
	}
	return items, total, nil
}

// GetByID — detail post by id (untuk edit dashboard). Include tags array.
func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Post, error) {
	q := fmt.Sprintf(`SELECT %s %s %s WHERE p.id_post = $1 AND p.soft_delete IS NULL`,
		summaryFields, detailExtraFields, fromJoin)

	var po Post
	if err := r.db.GetContext(ctx, &po, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get post by id: %w", err)
	}

	// Populate tags (separate query, simple LEFT JOIN tetap manageable)
	tags := make([]TagBrief, 0)
	if err := r.db.SelectContext(ctx, &tags, `
		SELECT t.id_tag, t.slug, t.nm_tag
		FROM blog.post_tag pt
		JOIN ref.tag t ON pt.id_tag = t.id_tag
		WHERE pt.id_post = $1 AND t.soft_delete IS NULL
		ORDER BY t.nm_tag ASC`, id); err != nil {
		return nil, fmt.Errorf("get post tags: %w", err)
	}
	po.Tags = tags
	return &po, nil
}

// GetBySlug — public view post (by subdomain + slug). Include tags array.
func (r *Repository) GetBySlug(ctx context.Context, subdomain, slug string) (*Post, error) {
	q := fmt.Sprintf(`SELECT %s %s %s
		WHERE b.subdomain = $1 AND p.slug = $2
		  AND p.status = 'published' AND p.soft_delete IS NULL`,
		summaryFields, detailExtraFields, fromJoin)

	var po Post
	if err := r.db.GetContext(ctx, &po, q, subdomain, slug); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get post by slug: %w", err)
	}
	tags := make([]TagBrief, 0)
	if err := r.db.SelectContext(ctx, &tags, `
		SELECT t.id_tag, t.slug, t.nm_tag
		FROM blog.post_tag pt
		JOIN ref.tag t ON pt.id_tag = t.id_tag
		WHERE pt.id_post = $1 AND t.soft_delete IS NULL
		ORDER BY t.nm_tag ASC`, po.IDPost); err != nil {
		return nil, fmt.Errorf("get post tags: %w", err)
	}
	po.Tags = tags
	return &po, nil
}

// CountByStatus — untuk dashboard "Status Posts" widget (4 status counts).
type StatusCount struct {
	Status string `db:"status" json:"status"`
	Total  int    `db:"total"  json:"total"`
}

func (r *Repository) CountByStatus(ctx context.Context, idBlog uuid.UUID) ([]StatusCount, error) {
	q := `SELECT status, COUNT(*) AS total
	      FROM blog.post
	      WHERE id_blog = $1 AND soft_delete IS NULL
	      GROUP BY status
	      ORDER BY status`
	var rows []StatusCount
	if err := r.db.SelectContext(ctx, &rows, q, idBlog); err != nil {
		return nil, fmt.Errorf("count posts by status: %w", err)
	}
	return rows, nil
}

// =========================================================================
// Write operations — Insert / Update / Publish / SoftDelete
// =========================================================================

// CreateInput — payload create draft (status default 'draft').
type CreateInput struct {
	IDBlog          uuid.UUID  `json:"id_blog"`
	IDKategoriPost  *uuid.UUID `json:"id_kategori_post,omitempty"`
	Judul           string     `json:"judul"`
	Slug            string     `json:"slug"`
	Ringkasan       *string    `json:"ringkasan,omitempty"`
	KontenHTML      *string    `json:"konten_html,omitempty"`
	KontenJSON      *string    `json:"konten_json,omitempty"`
	CoverURL        *string    `json:"cover_url,omitempty"`
	Visibilitas     string     `json:"visibilitas,omitempty"`
	Tags            []string   `json:"tags,omitempty"` // list nm_tag atau slug
}

// UpdateInput — payload auto-save / manual save edit.
// Tags: kalau nil = jangan sentuh post_tag. Kalau pointer ke []string{} = clear all tags.
type UpdateInput struct {
	IDKategoriPost  *uuid.UUID `json:"id_kategori_post,omitempty"`
	Judul           *string    `json:"judul,omitempty"`
	Slug            *string    `json:"slug,omitempty"`
	Ringkasan       *string    `json:"ringkasan,omitempty"`
	KontenHTML      *string    `json:"konten_html,omitempty"`
	KontenJSON      *string    `json:"konten_json,omitempty"`
	CoverURL        *string    `json:"cover_url,omitempty"`
	Status          *string    `json:"status,omitempty"`
	Visibilitas     *string    `json:"visibilitas,omitempty"`
	TglJadwal       *string    `json:"tgl_jadwal,omitempty"`
	Tags            *[]string  `json:"tags,omitempty"` // nil=keep, []=clear, [...]=replace
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	out := make([]byte, 0, len(s))
	prevDash := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			out = append(out, byte(r))
			prevDash = false
		} else if !prevDash && len(out) > 0 {
			out = append(out, '-')
			prevDash = true
		}
	}
	return strings.Trim(string(out), "-")
}

func wordCount(s string) int {
	// Strip HTML tags rough — backend final estimate, frontend kirim juga
	text := s
	for {
		open := strings.Index(text, "<")
		if open < 0 {
			break
		}
		close := strings.Index(text[open:], ">")
		if close < 0 {
			break
		}
		text = text[:open] + " " + text[open+close+1:]
	}
	count := 0
	inWord := false
	for _, r := range text {
		if r == ' ' || r == '\t' || r == '\n' {
			inWord = false
		} else if !inWord {
			count++
			inWord = true
		}
	}
	return count
}

// syncTags — replace post_tag rows untuk post tertentu.
// tagNames bisa berisi nm_tag baru (auto-create di ref.tag) atau slug existing.
// Cara match: by slug. Kalau name tanpa slug, slugify dulu.
// Trigger fn_update_tag_frekuensi handle update count di ref.tag.
func (r *Repository) syncTags(ctx context.Context, tx *sqlx.Tx, idPost uuid.UUID, tagNames []string) error {
	// Clear existing junction rows dulu
	if _, err := tx.ExecContext(ctx,
		`DELETE FROM blog.post_tag WHERE id_post = $1`, idPost); err != nil {
		return fmt.Errorf("clear post_tag: %w", err)
	}
	if len(tagNames) == 0 {
		return nil
	}

	// Resolve / create each tag by slug
	seenSlug := map[string]bool{}
	for _, raw := range tagNames {
		name := strings.TrimSpace(raw)
		if name == "" {
			continue
		}
		slug := slugify(name)
		if slug == "" || seenSlug[slug] {
			continue
		}
		seenSlug[slug] = true

		// UPSERT tag by slug — return id
		var idTag uuid.UUID
		err := tx.GetContext(ctx, &idTag, `
			WITH ins AS (
				INSERT INTO ref.tag (slug, nm_tag, a_aktif)
				VALUES ($1, $2, TRUE)
				ON CONFLICT (slug) DO NOTHING
				RETURNING id_tag
			)
			SELECT id_tag FROM ins
			UNION ALL
			SELECT id_tag FROM ref.tag WHERE slug = $1 AND soft_delete IS NULL
			LIMIT 1`, slug, name)
		if err != nil {
			return fmt.Errorf("upsert tag %q: %w", slug, err)
		}

		if _, err := tx.ExecContext(ctx,
			`INSERT INTO blog.post_tag (id_post, id_tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			idPost, idTag); err != nil {
			return fmt.Errorf("insert post_tag: %w", err)
		}
	}
	return nil
}

// Create — INSERT draft post. Auto-compute slug + jumlah_kata + waktu_baca.
func (r *Repository) Create(ctx context.Context, in CreateInput) (*Post, error) {
	if strings.TrimSpace(in.Judul) == "" {
		return nil, errors.New("judul required")
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Judul)
	}
	if in.Visibilitas == "" {
		in.Visibilitas = "public"
	}
	var jumlahKata int
	if in.KontenHTML != nil {
		jumlahKata = wordCount(*in.KontenHTML)
	}
	waktuBaca := jumlahKata / 150
	if waktuBaca < 1 {
		waktuBaca = 1
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	q := `INSERT INTO blog.post
	        (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, konten_json,
	         cover_url, status, visibilitas, jumlah_kata, waktu_baca_menit)
	      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, 'draft', $9, $10, $11)
	      RETURNING id_post`
	var id uuid.UUID
	if err := tx.GetContext(ctx, &id, q,
		in.IDBlog, in.IDKategoriPost, in.Judul, in.Slug, in.Ringkasan,
		in.KontenHTML, in.KontenJSON, in.CoverURL, in.Visibilitas, jumlahKata, waktuBaca,
	); err != nil {
		return nil, fmt.Errorf("insert post: %w", err)
	}

	// Tag sync (skip kalau kosong, tapi tetap call untuk consistency)
	if len(in.Tags) > 0 {
		if err := r.syncTags(ctx, tx, id, in.Tags); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return r.GetByID(ctx, id)
}

// Update — partial update (only non-nil fields). Updates jumlah_kata kalau konten berubah.
func (r *Repository) Update(ctx context.Context, id uuid.UUID, idBlog uuid.UUID, in UpdateInput) (*Post, error) {
	sets := []string{"updated_at = NOW()"}
	args := []any{}
	idx := 1

	if in.Judul != nil {
		sets = append(sets, fmt.Sprintf("judul = $%d", idx))
		args = append(args, *in.Judul)
		idx++
	}
	if in.Slug != nil {
		s := *in.Slug
		if s == "" && in.Judul != nil {
			s = slugify(*in.Judul)
		}
		sets = append(sets, fmt.Sprintf("slug = $%d", idx))
		args = append(args, s)
		idx++
	}
	if in.IDKategoriPost != nil {
		sets = append(sets, fmt.Sprintf("id_kategori_post = $%d", idx))
		args = append(args, *in.IDKategoriPost)
		idx++
	}
	if in.Ringkasan != nil {
		sets = append(sets, fmt.Sprintf("ringkasan = $%d", idx))
		args = append(args, *in.Ringkasan)
		idx++
	}
	if in.KontenHTML != nil {
		sets = append(sets, fmt.Sprintf("konten_html = $%d", idx))
		args = append(args, *in.KontenHTML)
		idx++
		jk := wordCount(*in.KontenHTML)
		wb := jk / 150
		if wb < 1 {
			wb = 1
		}
		sets = append(sets, fmt.Sprintf("jumlah_kata = $%d, waktu_baca_menit = $%d", idx, idx+1))
		args = append(args, jk, wb)
		idx += 2
	}
	if in.KontenJSON != nil {
		sets = append(sets, fmt.Sprintf("konten_json = $%d::jsonb", idx))
		args = append(args, *in.KontenJSON)
		idx++
	}
	if in.CoverURL != nil {
		sets = append(sets, fmt.Sprintf("cover_url = $%d", idx))
		args = append(args, *in.CoverURL)
		idx++
	}
	if in.Status != nil {
		sets = append(sets, fmt.Sprintf("status = $%d", idx))
		args = append(args, *in.Status)
		idx++
	}
	if in.Visibilitas != nil {
		sets = append(sets, fmt.Sprintf("visibilitas = $%d", idx))
		args = append(args, *in.Visibilitas)
		idx++
	}
	if in.TglJadwal != nil {
		sets = append(sets, fmt.Sprintf("tgl_jadwal = $%d", idx))
		args = append(args, *in.TglJadwal)
		idx++
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	args = append(args, id, idBlog)
	q := fmt.Sprintf(`UPDATE blog.post SET %s
	                  WHERE id_post = $%d AND id_blog = $%d AND soft_delete IS NULL`,
		strings.Join(sets, ", "), idx, idx+1)

	res, err := tx.ExecContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("update post: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}

	// Tag sync: nil = jangan sentuh; pointer ke []string{} = clear; pointer ke [...] = replace
	if in.Tags != nil {
		if err := r.syncTags(ctx, tx, id, *in.Tags); err != nil {
			return nil, err
		}
	}

	// Snapshot revision kalau konten / judul / ringkasan berubah.
	// idBlog → resolve owner_pdut via blog join (creator buat audit row).
	if in.KontenHTML != nil || in.Judul != nil || in.Ringkasan != nil {
		var idOwner uuid.UUID
		_ = tx.GetContext(ctx, &idOwner,
			`SELECT id_pengguna_pdut FROM blog.blog WHERE id_blog = $1`, idBlog)
		if idOwner != uuid.Nil {
			if err := r.snapshotRevision(ctx, tx, id, idOwner, ""); err != nil {
				return nil, err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return r.GetByID(ctx, id)
}

// snapshotRevision — capture current post state ke post_revision.
// Auto-increment nomor_revisi per-post. Called dari Update only when content changed.
func (r *Repository) snapshotRevision(ctx context.Context, tx *sqlx.Tx, idPost, idCreator uuid.UUID, catatan string) error {
	// INSERT with snapshot from current post + computed next nomor_revisi.
	// Atomic dalam tx — gak ada race condition karena tx isolation.
	_, err := tx.ExecContext(ctx, `
		INSERT INTO blog.post_revision
		    (id_post, nomor_revisi, judul_snapshot, ringkasan_snapshot,
		     konten_html_snapshot, konten_json_snapshot, catatan, id_creator)
		SELECT
		    p.id_post,
		    COALESCE((SELECT MAX(nomor_revisi) FROM blog.post_revision WHERE id_post = p.id_post), 0) + 1,
		    p.judul, p.ringkasan, p.konten_html, p.konten_json, NULLIF($2, ''), $3
		FROM blog.post p
		WHERE p.id_post = $1`,
		idPost, catatan, idCreator)
	if err != nil {
		return fmt.Errorf("snapshot revision: %w", err)
	}
	return nil
}

// PostRevision — single snapshot row.
type PostRevision struct {
	IDPostRevision     uuid.UUID        `db:"id_post_revision"      json:"id_post_revision"`
	IDPost             uuid.UUID        `db:"id_post"               json:"id_post"`
	NomorRevisi        int              `db:"nomor_revisi"          json:"nomor_revisi"`
	JudulSnapshot      string           `db:"judul_snapshot"        json:"judul_snapshot"`
	RingkasanSnapshot  *string          `db:"ringkasan_snapshot"    json:"ringkasan_snapshot,omitempty"`
	KontenHTMLSnapshot *string          `db:"konten_html_snapshot"  json:"konten_html_snapshot,omitempty"`
	KontenJSONSnapshot *json.RawMessage `db:"konten_json_snapshot"  json:"konten_json_snapshot,omitempty"`
	Catatan            *string          `db:"catatan"               json:"catatan,omitempty"`
	IDCreator          uuid.UUID        `db:"id_creator"            json:"id_creator"`
	CreatedAt          time.Time        `db:"created_at"            json:"created_at"`
}

// PostRevisionSummary — versi ringan tanpa konten_html_snapshot (untuk list).
type PostRevisionSummary struct {
	IDPostRevision    uuid.UUID `db:"id_post_revision"   json:"id_post_revision"`
	IDPost            uuid.UUID `db:"id_post"            json:"id_post"`
	NomorRevisi       int       `db:"nomor_revisi"       json:"nomor_revisi"`
	JudulSnapshot     string    `db:"judul_snapshot"     json:"judul_snapshot"`
	RingkasanSnapshot *string   `db:"ringkasan_snapshot" json:"ringkasan_snapshot,omitempty"`
	Catatan           *string   `db:"catatan"            json:"catatan,omitempty"`
	IDCreator         uuid.UUID `db:"id_creator"         json:"id_creator"`
	CreatedAt         time.Time `db:"created_at"         json:"created_at"`
}

// ListRevisions — semua revisi untuk satu post (latest first). Owner-only via id_blog check.
func (r *Repository) ListRevisions(ctx context.Context, idPost, idBlog uuid.UUID) ([]PostRevisionSummary, error) {
	// Ownership check via JOIN
	rows := make([]PostRevisionSummary, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT pr.id_post_revision, pr.id_post, pr.nomor_revisi,
		       pr.judul_snapshot, pr.ringkasan_snapshot, pr.catatan,
		       pr.id_creator, pr.created_at
		FROM blog.post_revision pr
		JOIN blog.post p ON pr.id_post = p.id_post
		WHERE pr.id_post = $1 AND p.id_blog = $2 AND p.soft_delete IS NULL
		ORDER BY pr.nomor_revisi DESC`, idPost, idBlog)
	if err != nil {
		return nil, fmt.Errorf("list revisions: %w", err)
	}
	return rows, nil
}

// GetRevision — single snapshot dengan full konten. Owner-only.
func (r *Repository) GetRevision(ctx context.Context, idPost, idBlog uuid.UUID, nomor int) (*PostRevision, error) {
	var rev PostRevision
	err := r.db.GetContext(ctx, &rev, `
		SELECT pr.id_post_revision, pr.id_post, pr.nomor_revisi,
		       pr.judul_snapshot, pr.ringkasan_snapshot, pr.konten_html_snapshot,
		       pr.konten_json_snapshot, pr.catatan, pr.id_creator, pr.created_at
		FROM blog.post_revision pr
		JOIN blog.post p ON pr.id_post = p.id_post
		WHERE pr.id_post = $1 AND p.id_blog = $2 AND pr.nomor_revisi = $3
		  AND p.soft_delete IS NULL`, idPost, idBlog, nomor)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get revision: %w", err)
	}
	return &rev, nil
}

// ToggleAuthorPin — flip a_unggulan_blog for one of the owner's posts.
// The max-3-per-blog cap is enforced by a DB trigger (fn_pin_cap_3); when
// hit, postgres raises code 23514 which we surface as a clearer message.
// Returns the new pinned state.
func (r *Repository) ToggleAuthorPin(ctx context.Context, idPost, idBlog uuid.UUID) (bool, error) {
	var newState bool
	err := r.db.QueryRowContext(ctx, `
		UPDATE blog.post
		SET a_unggulan_blog = NOT a_unggulan_blog, updated_at = NOW()
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL
		RETURNING a_unggulan_blog`, idPost, idBlog).Scan(&newState)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, ErrNotFound
		}
		// Trigger-raised cap-violation (sqlstate 23514). Detect by message
		// since lib/pq doesn't expose SQLState as a typed field reliably.
		if strings.Contains(err.Error(), "Max 3 posts") {
			return false, errors.New("max 3 posts dapat di-pin per blog. Unpin salah satu dulu")
		}
		return false, fmt.Errorf("toggle pin: %w", err)
	}
	return newState, nil
}

// ListPinned — pinned posts for a blog, ordered by tgl_terbit DESC. Used by
// the public tenant home + dashboard.
func (r *Repository) ListPinned(ctx context.Context, idBlog uuid.UUID) ([]PostSummary, error) {
	rows := make([]PostSummary, 0, 3)
	q := `SELECT ` + summaryFields + `
		` + fromJoin + `
		WHERE p.id_blog = $1 AND p.a_unggulan_blog = TRUE
		  AND p.soft_delete IS NULL AND p.status = 'published'
		ORDER BY p.tgl_terbit DESC NULLS LAST
		LIMIT 3`
	if err := r.db.SelectContext(ctx, &rows, q, idBlog); err != nil {
		return nil, fmt.Errorf("list pinned: %w", err)
	}
	return rows, nil
}

// SetFlagsAdmin — admin curation: toggle a_unggulan / a_pinned tanpa cek ownership.
// Pakai pointer supaya bisa update salah satu atau keduanya (NULL = no change).
// Return updated post.
func (r *Repository) SetFlagsAdmin(ctx context.Context, id uuid.UUID, unggulan, pinned *bool) (*Post, error) {
	if unggulan == nil && pinned == nil {
		return nil, errors.New("nothing to update (a_unggulan + a_pinned both nil)")
	}
	sets := []string{}
	args := []any{}
	idx := 1
	if unggulan != nil {
		sets = append(sets, fmt.Sprintf("a_unggulan = $%d", idx))
		args = append(args, *unggulan)
		idx++
	}
	if pinned != nil {
		sets = append(sets, fmt.Sprintf("a_pinned = $%d", idx))
		args = append(args, *pinned)
		idx++
	}
	sets = append(sets, "updated_at = NOW()")

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE blog.post SET %s
	                  WHERE id_post = $%d AND soft_delete IS NULL`,
		strings.Join(sets, ", "), idx)
	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("admin set flags: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, id)
}

// Publish — transition status ke published. Set tgl_terbit kalau belum.
// Return `firstPublish=true` kalau tgl_terbit baru di-set (untuk gate notif ke followers).
// Republish (status balik ke published setelah unpublish) tidak emit notif lagi.
func (r *Repository) Publish(ctx context.Context, id uuid.UUID, idBlog uuid.UUID) (*Post, bool, error) {
	var alreadyHadTerbit bool
	err := r.db.GetContext(ctx, &alreadyHadTerbit, `
		SELECT tgl_terbit IS NOT NULL
		FROM blog.post
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL`, id, idBlog)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, false, ErrNotFound
	}
	if err != nil {
		return nil, false, fmt.Errorf("check tgl_terbit: %w", err)
	}

	q := `UPDATE blog.post
	      SET status = 'published',
	          tgl_terbit = COALESCE(tgl_terbit, NOW()),
	          updated_at = NOW()
	      WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL`
	res, err := r.db.ExecContext(ctx, q, id, idBlog)
	if err != nil {
		return nil, false, fmt.Errorf("publish post: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, false, ErrNotFound
	}
	p, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, false, err
	}
	return p, !alreadyHadTerbit, nil
}

// =========================================================================
// View tracking — anonymous (ip_hash dedup) + increment counter
// =========================================================================

// TrackView — log granular view ke interaction.view_post + increment counter
// di blog.post & blog.blog (denormalized). Dedup window 30 menit per (post, ip_hash):
// same ip viewing same post twice in 30 min counts as 1.
func (r *Repository) TrackView(ctx context.Context, idPost uuid.UUID, ipHash, referer string, idPenggunaPdut *uuid.UUID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Cek post exists + ambil id_blog
	var idBlog uuid.UUID
	err = tx.GetContext(ctx, &idBlog,
		`SELECT id_blog FROM blog.post WHERE id_post = $1 AND status = 'published' AND soft_delete IS NULL`,
		idPost)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("get post for view: %w", err)
	}

	// Dedup: cek view dari ip_hash yang sama untuk post ini dalam 30 menit terakhir
	if ipHash != "" {
		var existing int
		err = tx.GetContext(ctx, &existing,
			`SELECT COUNT(*) FROM interaction.view_post
			 WHERE id_post = $1 AND ip_hash = $2
			   AND created_at > NOW() - INTERVAL '30 minutes'`,
			idPost, ipHash)
		if err != nil {
			return fmt.Errorf("dedup check: %w", err)
		}
		if existing > 0 {
			// Already counted in dedup window — skip (return nil = success no-op)
			return tx.Commit()
		}
	}

	// Insert raw view event
	_, err = tx.ExecContext(ctx,
		`INSERT INTO interaction.view_post (id_post, id_pengguna_pdut, ip_hash, referer)
		 VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''))`,
		idPost, idPenggunaPdut, ipHash, referer)
	if err != nil {
		return fmt.Errorf("insert view_post: %w", err)
	}

	// Increment denormalized counter di blog.post + blog.blog
	_, err = tx.ExecContext(ctx,
		`UPDATE blog.post SET jumlah_view = jumlah_view + 1 WHERE id_post = $1`,
		idPost)
	if err != nil {
		return fmt.Errorf("inc post counter: %w", err)
	}
	_, err = tx.ExecContext(ctx,
		`UPDATE blog.blog SET jumlah_view = jumlah_view + 1 WHERE id_blog = $1`,
		idBlog)
	if err != nil {
		return fmt.Errorf("inc blog counter: %w", err)
	}

	return tx.Commit()
}

// ListTrash — soft-deleted posts for owner. Pagination via limit/offset.
func (r *Repository) ListTrash(ctx context.Context, idBlog uuid.UUID, limit, offset int) ([]PostSummary, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM blog.post WHERE id_blog = $1 AND soft_delete IS NOT NULL`, idBlog); err != nil {
		return nil, 0, fmt.Errorf("count trash: %w", err)
	}
	q := fmt.Sprintf(`SELECT %s %s
	                  WHERE p.id_blog = $1 AND p.soft_delete IS NOT NULL
	                  ORDER BY p.soft_delete DESC
	                  LIMIT $2 OFFSET $3`, summaryFields, fromJoin)
	items := make([]PostSummary, 0)
	if err := r.db.SelectContext(ctx, &items, q, idBlog, limit, offset); err != nil {
		return nil, 0, fmt.Errorf("list trash: %w", err)
	}
	return items, total, nil
}

// Restore — undo soft_delete. Status balik ke draft (paksa user review sebelum republish).
func (r *Repository) Restore(ctx context.Context, id, idBlog uuid.UUID) (*Post, error) {
	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.post
		SET soft_delete = NULL, status = 'draft', updated_at = NOW()
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NOT NULL`, id, idBlog)
	if err != nil {
		return nil, fmt.Errorf("restore: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, id)
}

// HardDelete — permanent delete. Cascade ke post_tag, post_revision, view_post, like_post, bookmark, komentar via FK.
// Hanya bisa pada post yang sudah di-soft-delete (safety).
func (r *Repository) HardDelete(ctx context.Context, id, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		DELETE FROM blog.post
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NOT NULL`, id, idBlog)
	if err != nil {
		return fmt.Errorf("hard delete: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// PostAnalytics — drill-down stats per post: daily chart + breakdown + summary.
type PostAnalytics struct {
	Daily      []DailyViews    `json:"daily"`
	Referrers  []ReferrerStat  `json:"referrers"`
	TotalViews int             `json:"total_views"`     // dari blog.post.jumlah_view (denorm)
	UniqueViews int            `json:"unique_views"`    // DISTINCT ip_hash
	AuthedViews int            `json:"authed_views"`    // views dengan id_pengguna_pdut not null
	WindowDays int             `json:"window_days"`
}

type ReferrerStat struct {
	Host  string `db:"host"  json:"host"`  // extracted host atau "(direct)"
	Views int    `db:"views" json:"views"`
}

// AnalyticsPerPost — granular analytics untuk satu post.
// Owner-only via id_blog check.
func (r *Repository) AnalyticsPerPost(ctx context.Context, idPost, idBlog uuid.UUID, days int) (*PostAnalytics, error) {
	if days <= 0 || days > 365 {
		days = 30
	}

	// Ownership + total views check
	var totalViews int
	err := r.db.GetContext(ctx, &totalViews, `
		SELECT jumlah_view FROM blog.post
		WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL`, idPost, idBlog)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get total views: %w", err)
	}

	// Daily series — gen_series + LEFT JOIN supaya hari kosong = 0.
	daily := make([]DailyViews, 0)
	if err := r.db.SelectContext(ctx, &daily, `
		WITH d AS (
			SELECT generate_series(
				DATE_TRUNC('day', NOW() - ($1 || ' days')::INTERVAL),
				DATE_TRUNC('day', NOW()),
				'1 day'::INTERVAL
			)::DATE AS dt
		),
		v AS (
			SELECT DATE_TRUNC('day', created_at)::DATE AS dt, COUNT(*) AS views
			FROM interaction.view_post
			WHERE id_post = $2 AND created_at > NOW() - ($1 || ' days')::INTERVAL
			GROUP BY 1
		)
		SELECT TO_CHAR(d.dt, 'YYYY-MM-DD') AS date, COALESCE(v.views, 0)::INT AS views
		FROM d LEFT JOIN v ON v.dt = d.dt
		ORDER BY d.dt ASC`, days, idPost); err != nil {
		return nil, fmt.Errorf("daily views: %w", err)
	}

	// Unique views (DISTINCT ip_hash, last N days)
	var unique int
	_ = r.db.GetContext(ctx, &unique, `
		SELECT COUNT(DISTINCT ip_hash) FROM interaction.view_post
		WHERE id_post = $1 AND ip_hash IS NOT NULL
		  AND created_at > NOW() - ($2 || ' days')::INTERVAL`, idPost, days)

	// Authenticated views (last N days)
	var authed int
	_ = r.db.GetContext(ctx, &authed, `
		SELECT COUNT(*) FROM interaction.view_post
		WHERE id_post = $1 AND id_pengguna_pdut IS NOT NULL
		  AND created_at > NOW() - ($2 || ' days')::INTERVAL`, idPost, days)

	// Top referrer hosts. Extract host via regexp (strip protocol + path).
	// "(direct)" untuk null/empty referer.
	refs := make([]ReferrerStat, 0)
	_ = r.db.SelectContext(ctx, &refs, `
		SELECT
			COALESCE(NULLIF(SUBSTRING(referer FROM '^https?://([^/]+)'), ''), '(direct)') AS host,
			COUNT(*) AS views
		FROM interaction.view_post
		WHERE id_post = $1 AND created_at > NOW() - ($2 || ' days')::INTERVAL
		GROUP BY 1
		ORDER BY views DESC
		LIMIT 10`, idPost, days)

	return &PostAnalytics{
		Daily:       daily,
		Referrers:   refs,
		TotalViews:  totalViews,
		UniqueViews: unique,
		AuthedViews: authed,
		WindowDays:  days,
	}, nil
}

// AnalyticsViewsPerDay — total views per day untuk blog tertentu (last N days).
// Untuk chart Engagement di dashboard.
type DailyViews struct {
	Date  string `db:"date"  json:"date"`
	Views int    `db:"views" json:"views"`
}

func (r *Repository) AnalyticsViewsPerDay(ctx context.Context, idBlog uuid.UUID, days int) ([]DailyViews, error) {
	if days <= 0 || days > 365 {
		days = 30
	}
	q := `
		WITH d AS (
			SELECT generate_series(
				DATE_TRUNC('day', NOW() - ($1 || ' days')::INTERVAL),
				DATE_TRUNC('day', NOW()),
				'1 day'::INTERVAL
			)::DATE AS dt
		),
		v AS (
			SELECT DATE_TRUNC('day', vp.created_at)::DATE AS dt, COUNT(*) AS views
			FROM interaction.view_post vp
			JOIN blog.post p ON vp.id_post = p.id_post
			WHERE p.id_blog = $2
			  AND vp.created_at > NOW() - ($1 || ' days')::INTERVAL
			GROUP BY 1
		)
		SELECT TO_CHAR(d.dt, 'YYYY-MM-DD') AS date, COALESCE(v.views, 0)::INT AS views
		FROM d LEFT JOIN v ON d.dt = v.dt
		ORDER BY d.dt`
	var rows []DailyViews
	if err := r.db.SelectContext(ctx, &rows, q, days, idBlog); err != nil {
		return nil, fmt.Errorf("analytics views: %w", err)
	}
	return rows, nil
}

// =============================================================================
// BLOG ANALYTICS SUMMARY — overview untuk owner dashboard.
// Single endpoint returns: totals + window comparison + top posts + referrers.
// =============================================================================

type BlogAnalyticsSummary struct {
	WindowDays    int            `json:"window_days"`
	Daily         []DailyViews   `json:"daily"`           // generate_series filled to today
	Totals        BlogTotals     `json:"totals"`          // lifetime denorm counters
	Window        BlogWindowStat `json:"window"`          // sum within window_days
	Previous      BlogWindowStat `json:"previous"`        // sum within prior window (for delta)
	TopPosts      []TopPostStat  `json:"top_posts"`       // top 5 by views in window
	TopReferrers  []ReferrerStat `json:"top_referrers"`   // top 10 hosts in window
}

type BlogTotals struct {
	Views     int64 `json:"views"     db:"views"`
	Likes     int64 `json:"likes"     db:"likes"`
	Komentar  int64 `json:"komentar"  db:"komentar"`
	Posts     int   `json:"posts"     db:"posts"`
	Followers int   `json:"followers" db:"followers"`
}

type BlogWindowStat struct {
	Views    int `json:"views"    db:"views"`
	Likes    int `json:"likes"    db:"likes"`
	Komentar int `json:"komentar" db:"komentar"`
}

type TopPostStat struct {
	IDPost          uuid.UUID `db:"id_post"           json:"id_post"`
	Judul           string    `db:"judul"             json:"judul"`
	Slug            string    `db:"slug"              json:"slug"`
	CoverURL        *string   `db:"cover_url"         json:"cover_url,omitempty"`
	Status          string    `db:"status"            json:"status"`
	TglTerbit       *time.Time `db:"tgl_terbit"       json:"tgl_terbit,omitempty"`
	WindowViews     int       `db:"window_views"      json:"window_views"`
	TotalViews      int       `db:"jumlah_view"       json:"jumlah_view"`
	TotalLikes      int       `db:"jumlah_like"       json:"jumlah_like"`
	TotalKomentar   int       `db:"jumlah_komentar"   json:"jumlah_komentar"`
}

func (r *Repository) AnalyticsBlogSummary(ctx context.Context, idBlog uuid.UUID, days int) (*BlogAnalyticsSummary, error) {
	if days <= 0 || days > 365 {
		days = 30
	}

	out := &BlogAnalyticsSummary{WindowDays: days}

	// 1) Daily series (reuse existing helper).
	daily, err := r.AnalyticsViewsPerDay(ctx, idBlog, days)
	if err != nil {
		return nil, err
	}
	out.Daily = daily

	// 2) Lifetime totals from blog denorm counters + sum across posts for likes/komentar.
	if err := r.db.GetContext(ctx, &out.Totals, `
		SELECT
			b.jumlah_view::BIGINT       AS views,
			COALESCE(SUM(p.jumlah_like), 0)::BIGINT     AS likes,
			COALESCE(SUM(p.jumlah_komentar), 0)::BIGINT AS komentar,
			COUNT(p.id_post) FILTER (WHERE p.status = 'published' AND p.soft_delete IS NULL)::INT AS posts,
			b.jumlah_follower::INT AS followers
		FROM blog.blog b
		LEFT JOIN blog.post p ON p.id_blog = b.id_blog AND p.soft_delete IS NULL
		WHERE b.id_blog = $1
		GROUP BY b.id_blog, b.jumlah_view, b.jumlah_follower`, idBlog); err != nil {
		return nil, fmt.Errorf("totals: %w", err)
	}

	// 3) Current window aggregates.
	if err := r.db.GetContext(ctx, &out.Window, `
		SELECT
			COALESCE((
				SELECT COUNT(*) FROM interaction.view_post vp
				JOIN blog.post p ON vp.id_post = p.id_post
				WHERE p.id_blog = $1 AND vp.created_at > NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS views,
			COALESCE((
				SELECT COUNT(*) FROM interaction.like_post lp
				JOIN blog.post p ON lp.id_post = p.id_post
				WHERE p.id_blog = $1 AND lp.created_at > NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS likes,
			COALESCE((
				SELECT COUNT(*) FROM interaction.komentar k
				JOIN blog.post p ON k.id_post = p.id_post
				WHERE p.id_blog = $1 AND k.created_at > NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS komentar`,
		idBlog, days); err != nil {
		return nil, fmt.Errorf("window: %w", err)
	}

	// 4) Previous window aggregates (same length, immediately preceding current).
	if err := r.db.GetContext(ctx, &out.Previous, `
		SELECT
			COALESCE((
				SELECT COUNT(*) FROM interaction.view_post vp
				JOIN blog.post p ON vp.id_post = p.id_post
				WHERE p.id_blog = $1
				  AND vp.created_at > NOW() - ($2 * 2 || ' days')::INTERVAL
				  AND vp.created_at <= NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS views,
			COALESCE((
				SELECT COUNT(*) FROM interaction.like_post lp
				JOIN blog.post p ON lp.id_post = p.id_post
				WHERE p.id_blog = $1
				  AND lp.created_at > NOW() - ($2 * 2 || ' days')::INTERVAL
				  AND lp.created_at <= NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS likes,
			COALESCE((
				SELECT COUNT(*) FROM interaction.komentar k
				JOIN blog.post p ON k.id_post = p.id_post
				WHERE p.id_blog = $1
				  AND k.created_at > NOW() - ($2 * 2 || ' days')::INTERVAL
				  AND k.created_at <= NOW() - ($2 || ' days')::INTERVAL
			), 0)::INT AS komentar`,
		idBlog, days); err != nil {
		return nil, fmt.Errorf("previous: %w", err)
	}

	// 5) Top posts in window — count window views per post, join post denorm.
	top := make([]TopPostStat, 0, 5)
	if err := r.db.SelectContext(ctx, &top, `
		SELECT p.id_post, p.judul, p.slug, p.cover_url, p.status, p.tgl_terbit,
		       p.jumlah_view, p.jumlah_like, p.jumlah_komentar,
		       COALESCE(vw.cnt, 0)::INT AS window_views
		FROM blog.post p
		LEFT JOIN (
			SELECT vp.id_post, COUNT(*) AS cnt
			FROM interaction.view_post vp
			JOIN blog.post p2 ON vp.id_post = p2.id_post
			WHERE p2.id_blog = $1 AND vp.created_at > NOW() - ($2 || ' days')::INTERVAL
			GROUP BY vp.id_post
		) vw ON vw.id_post = p.id_post
		WHERE p.id_blog = $1 AND p.soft_delete IS NULL AND p.status = 'published'
		ORDER BY window_views DESC, p.jumlah_view DESC
		LIMIT 5`, idBlog, days); err != nil {
		return nil, fmt.Errorf("top posts: %w", err)
	}
	out.TopPosts = top

	// 6) Aggregate referrers across all blog posts (window).
	refs := make([]ReferrerStat, 0)
	_ = r.db.SelectContext(ctx, &refs, `
		SELECT
			COALESCE(NULLIF(SUBSTRING(vp.referer FROM '^https?://([^/]+)'), ''), '(direct)') AS host,
			COUNT(*)::INT AS views
		FROM interaction.view_post vp
		JOIN blog.post p ON vp.id_post = p.id_post
		WHERE p.id_blog = $1 AND vp.created_at > NOW() - ($2 || ' days')::INTERVAL
		GROUP BY 1
		ORDER BY views DESC
		LIMIT 10`, idBlog, days)
	out.TopReferrers = refs

	return out, nil
}

// SoftDelete — set status='trash' + soft_delete timestamp (recoverable 30 hari).
func (r *Repository) SoftDelete(ctx context.Context, id uuid.UUID, idBlog uuid.UUID) error {
	q := `UPDATE blog.post
	      SET status = 'trash', soft_delete = NOW(), updated_at = NOW()
	      WHERE id_post = $1 AND id_blog = $2 AND soft_delete IS NULL`
	res, err := r.db.ExecContext(ctx, q, id, idBlog)
	if err != nil {
		return fmt.Errorf("soft delete post: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
