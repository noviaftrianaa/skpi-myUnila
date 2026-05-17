// Package coauthor — multi-author per post.
// One post (owned by primary author's blog) can have additional contributors
// each linked via their primary blog. Roles cover the common academic
// crediting patterns (co_author, editor, reviewer, kontributor).
package coauthor

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var (
	ErrNotFound        = errors.New("co-author not found")
	ErrAlreadyExists   = errors.New("co-author already added")
	ErrSelfReference   = errors.New("cannot add yourself as co-author of your own post")
	ErrInvalidPeran    = errors.New("peran invalid (allowed: co_author, editor, reviewer, kontributor)")
	ErrCoBlogNotFound  = errors.New("co-author blog not found or inactive")
)

// PeranAllowed mirrors the chk_pca_peran constraint. Single source of truth
// for both Insert validation and frontend dropdowns.
var PeranAllowed = map[string]bool{
	"co_author":   true,
	"editor":      true,
	"reviewer":    true,
	"kontributor": true,
}

// CoAuthor — raw row from blog.post_co_author. For display we usually wrap
// in CoAuthorView (joined with blog.blog for nm_tampilan/avatar).
type CoAuthor struct {
	IDPost          uuid.UUID  `db:"id_post"          json:"id_post"`
	IDBlogCo        uuid.UUID  `db:"id_blog_co"       json:"id_blog_co"`
	Peran           string     `db:"peran"            json:"peran"`
	Urutan          int        `db:"urutan"           json:"urutan"`
	Catatan         *string    `db:"catatan"          json:"catatan,omitempty"`
	Status          string     `db:"status"           json:"status"`
	RespondedAt     *time.Time `db:"responded_at"     json:"responded_at,omitempty"`
	AlasanResponse  *string    `db:"alasan_response"  json:"alasan_response,omitempty"`
	CreatedAt       time.Time  `db:"created_at"       json:"created_at"`
}

// CoAuthorView — denorm-joined row for the post detail page. Includes
// everything the public byline needs.
type CoAuthorView struct {
	IDBlogCo       uuid.UUID  `db:"id_blog_co"       json:"id_blog_co"`
	Subdomain      string     `db:"subdomain"        json:"subdomain"`
	NmTampilan     string     `db:"nm_tampilan"      json:"nm_tampilan"`
	NmBlog         string     `db:"nm_blog"          json:"nm_blog"`
	AvatarURL      *string    `db:"avatar_url"       json:"avatar_url,omitempty"`
	Peran          string     `db:"peran"            json:"peran"`
	Urutan         int        `db:"urutan"           json:"urutan"`
	Catatan        *string    `db:"catatan"          json:"catatan,omitempty"`
	Status         string     `db:"status"           json:"status"`
	RespondedAt    *time.Time `db:"responded_at"     json:"responded_at,omitempty"`
	AlasanResponse *string    `db:"alasan_response"  json:"alasan_response,omitempty"`
	CreatedAt      time.Time  `db:"created_at"       json:"created_at"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// DisplayName returns the human-friendly name for a blog (prefers nm_tampilan,
// falls back to nm_blog). Exposed so handlers can label notifs without
// re-importing apps/blog.
func (r *Repository) DisplayName(ctx context.Context, idBlog uuid.UUID) (string, error) {
	var row struct {
		NmBlog     string  `db:"nm_blog"`
		NmTampilan *string `db:"nm_tampilan"`
	}
	if err := r.db.GetContext(ctx, &row, `
		SELECT nm_blog, nm_tampilan FROM blog.blog WHERE id_blog = $1`, idBlog); err != nil {
		return "", err
	}
	if row.NmTampilan != nil && *row.NmTampilan != "" {
		return *row.NmTampilan, nil
	}
	return row.NmBlog, nil
}

// =============================================================================
// READS
// =============================================================================

// ListForPost returns all co-authors for a post in display order.
// onlyAccepted=true is used by the public byline (hides pending/declined).
// Owner editor view passes false so the dashboard can show every status.
func (r *Repository) ListForPost(ctx context.Context, idPost uuid.UUID, onlyAccepted bool) ([]CoAuthorView, error) {
	where := "pca.id_post = $1 AND b.soft_delete IS NULL AND b.a_aktif = TRUE"
	if onlyAccepted {
		where += " AND pca.status = 'accepted'"
	}
	rows := make([]CoAuthorView, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT pca.id_blog_co, b.subdomain, b.nm_tampilan, b.nm_blog, b.avatar_url,
		       pca.peran, pca.urutan, pca.catatan, pca.status, pca.responded_at,
		       pca.alasan_response, pca.created_at
		FROM blog.post_co_author pca
		JOIN blog.blog b ON b.id_blog = pca.id_blog_co
		WHERE `+where+`
		ORDER BY pca.urutan ASC, pca.created_at ASC`, idPost)
	if err != nil {
		return nil, fmt.Errorf("list co-authors: %w", err)
	}
	return rows, nil
}

// ListPostsForBlogCo returns posts where this blog is credited as a co-author.
// Used by the invitee's "Diundang sebagai" inbox; pass inviteStatus to filter
// to pending invites (or "" for all). Includes the inviter info via JOIN.
func (r *Repository) ListPostsForBlogCo(ctx context.Context, idBlogCo uuid.UUID, inviteStatus string, limit int) ([]CoAuthorPostRef, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	where := "pca.id_blog_co = $1 AND p.soft_delete IS NULL"
	args := []any{idBlogCo}
	if inviteStatus != "" {
		where += " AND pca.status = $2"
		args = append(args, inviteStatus)
	}
	limitArg := len(args) + 1
	args = append(args, limit)

	rows := make([]CoAuthorPostRef, 0)
	q := fmt.Sprintf(`
		SELECT p.id_post, p.judul, p.slug, p.status AS post_status, p.tgl_terbit,
		       b.subdomain, b.nm_blog, b.nm_tampilan AS owner_nm_tampilan, b.avatar_url AS owner_avatar,
		       pca.peran, pca.status, pca.catatan, pca.responded_at, pca.created_at AS added_at
		FROM blog.post_co_author pca
		JOIN blog.post p ON p.id_post = pca.id_post
		JOIN blog.blog b ON b.id_blog = p.id_blog
		WHERE %s
		ORDER BY pca.created_at DESC
		LIMIT $%d`, where, limitArg)
	err := r.db.SelectContext(ctx, &rows, q, args...)
	if err != nil {
		return nil, fmt.Errorf("list invites: %w", err)
	}
	return rows, nil
}

type CoAuthorPostRef struct {
	IDPost           uuid.UUID  `db:"id_post"            json:"id_post"`
	Judul            string     `db:"judul"              json:"judul"`
	Slug             string     `db:"slug"               json:"slug"`
	PostStatus       string     `db:"post_status"        json:"post_status"`
	TglTerbit        *time.Time `db:"tgl_terbit"         json:"tgl_terbit,omitempty"`
	Subdomain        string     `db:"subdomain"          json:"subdomain"`
	NmBlog           string     `db:"nm_blog"            json:"nm_blog"`
	OwnerNmTampilan  *string    `db:"owner_nm_tampilan"  json:"owner_nm_tampilan,omitempty"`
	OwnerAvatar      *string    `db:"owner_avatar"       json:"owner_avatar,omitempty"`
	Peran            string     `db:"peran"              json:"peran"`
	Status           string     `db:"status"             json:"status"`
	Catatan          *string    `db:"catatan"            json:"catatan,omitempty"`
	RespondedAt      *time.Time `db:"responded_at"       json:"responded_at,omitempty"`
	AddedAt          time.Time  `db:"added_at"           json:"added_at"`
}

// =============================================================================
// MUTATIONS
// =============================================================================

type AddInput struct {
	IDPost     uuid.UUID
	IDBlog     uuid.UUID // primary author's blog (post owner) — used for self-check
	IDBlogCo   uuid.UUID
	Peran      string
	Urutan     *int
	Catatan    *string
}

// Add inserts a co-author. Enforces:
//   - peran is in the allow-list
//   - id_blog_co != id_blog (no self-credit)
//   - the co-author's blog exists and is active
//   - the (post, co-blog) pair is unique
func (r *Repository) Add(ctx context.Context, in AddInput) (*CoAuthor, error) {
	if !PeranAllowed[in.Peran] {
		return nil, ErrInvalidPeran
	}
	if in.IDBlog == in.IDBlogCo {
		return nil, ErrSelfReference
	}

	// Verify the co-author blog exists.
	var exists bool
	if err := r.db.GetContext(ctx, &exists, `
		SELECT EXISTS(
			SELECT 1 FROM blog.blog
			WHERE id_blog = $1 AND soft_delete IS NULL AND a_aktif = TRUE
		)`, in.IDBlogCo); err != nil {
		return nil, fmt.Errorf("verify co blog: %w", err)
	}
	if !exists {
		return nil, ErrCoBlogNotFound
	}

	urutan := 1
	if in.Urutan != nil && *in.Urutan > 0 {
		urutan = *in.Urutan
	} else {
		// Auto-assign next order
		_ = r.db.GetContext(ctx, &urutan, `
			SELECT COALESCE(MAX(urutan), 0) + 1 FROM blog.post_co_author WHERE id_post = $1`, in.IDPost)
	}

	var ca CoAuthor
	// status defaults to 'pending' via the schema default. We let the
	// caller (handler) emit the invite notif after this returns.
	err := r.db.GetContext(ctx, &ca, `
		INSERT INTO blog.post_co_author (id_post, id_blog_co, peran, urutan, catatan)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_post, id_blog_co, peran, urutan, catatan, status,
		          responded_at, alasan_response, created_at`,
		in.IDPost, in.IDBlogCo, in.Peran, urutan, in.Catatan)
	if err != nil {
		if strings.Contains(err.Error(), "post_co_author_pkey") {
			return nil, ErrAlreadyExists
		}
		return nil, fmt.Errorf("insert co-author: %w", err)
	}
	return &ca, nil
}

// Respond — invitee accepts or declines a pending invite. Returns enough
// context for the caller to emit a back-notif to the post owner.
type RespondResult struct {
	IDPost      uuid.UUID `db:"id_post"`
	IDBlogCo    uuid.UUID `db:"id_blog_co"`
	IDBlogOwner uuid.UUID `db:"id_blog_owner"`
	Accepted    bool      `db:"accepted"`
	Peran       string    `db:"peran"`
}

func (r *Repository) Respond(ctx context.Context, idPost, idBlogCo uuid.UUID, accept bool, alasan *string) (*RespondResult, error) {
	newStatus := "declined"
	if accept {
		newStatus = "accepted"
	}
	var res RespondResult
	err := r.db.GetContext(ctx, &res, `
		WITH upd AS (
			UPDATE blog.post_co_author
			SET status = $3, responded_at = NOW(), alasan_response = $4
			WHERE id_post = $1 AND id_blog_co = $2 AND status = 'pending'
			RETURNING id_post, id_blog_co, peran
		)
		SELECT upd.id_post, upd.id_blog_co, upd.peran,
		       p.id_blog AS id_blog_owner, $5::BOOL AS accepted
		FROM upd JOIN blog.post p ON p.id_post = upd.id_post`,
		idPost, idBlogCo, newStatus, alasan, accept)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("respond invite: %w", err)
	}
	return &res, nil
}

type UpdateInput struct {
	Peran   *string
	Urutan  *int
	Catatan *string
}

func (r *Repository) Update(ctx context.Context, idPost, idBlogCo uuid.UUID, in UpdateInput) (*CoAuthor, error) {
	if in.Peran != nil && !PeranAllowed[*in.Peran] {
		return nil, ErrInvalidPeran
	}
	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.post_co_author SET
		    peran   = COALESCE($3, peran),
		    urutan  = COALESCE($4, urutan),
		    catatan = COALESCE($5, catatan)
		WHERE id_post = $1 AND id_blog_co = $2`,
		idPost, idBlogCo, in.Peran, in.Urutan, in.Catatan)
	if err != nil {
		return nil, fmt.Errorf("update co-author: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	var ca CoAuthor
	if err := r.db.GetContext(ctx, &ca, `
		SELECT id_post, id_blog_co, peran, urutan, catatan, created_at
		FROM blog.post_co_author WHERE id_post = $1 AND id_blog_co = $2`, idPost, idBlogCo); err != nil {
		return nil, fmt.Errorf("reload co-author: %w", err)
	}
	return &ca, nil
}

func (r *Repository) Remove(ctx context.Context, idPost, idBlogCo uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		DELETE FROM blog.post_co_author
		WHERE id_post = $1 AND id_blog_co = $2`, idPost, idBlogCo)
	if err != nil {
		return fmt.Errorf("remove co-author: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// PostBlog returns the primary author's blog for a given post. Used by the
// handler to enforce ownership before any add/update/remove call.
func (r *Repository) PostBlog(ctx context.Context, idPost uuid.UUID) (uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.GetContext(ctx, &id, `
		SELECT id_blog FROM blog.post
		WHERE id_post = $1 AND soft_delete IS NULL`, idPost)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return uuid.Nil, ErrNotFound
		}
		return uuid.Nil, fmt.Errorf("post blog lookup: %w", err)
	}
	return id, nil
}
