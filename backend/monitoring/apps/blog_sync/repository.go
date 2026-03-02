package blog_sync

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// Posts
	UpsertPost(post *BlogPost) (bool, error) // returns true if new
	GetPostByBloggerID(siteID, bloggerPostID string) (*BlogPost, error)
	ListPosts(f PostFilter) ([]*BlogPost, int, error)
	GetPostBySlug(slug string) (*BlogPost, error)

	// Sync logs
	InsertSyncLog(log *BlogSyncLog) error
	ListSyncLogs(siteID string, limit int) ([]*BlogSyncLog, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// UpsertPost inserts or updates a blog post. Returns true if newly inserted.
func (r *repository) UpsertPost(post *BlogPost) (bool, error) {
	existing, err := r.GetPostByBloggerID(post.SiteID, post.BloggerPostID)
	if err != nil {
		// Not found — insert
		query := `
			INSERT INTO monitoring.blog_posts_cache (
				id, site_id, blogger_post_id, title, content, excerpt, slug,
				author_name, author_avatar_url, labels, thumbnail_url,
				published_at, updated_at_source, synced_at, is_visible,
				create_date, id_creator, last_update, soft_delete
			) VALUES (
				@p1, @p2, @p3, @p4, @p5, @p6, @p7,
				@p8, @p9, @p10, @p11,
				@p12, @p13, @p14, 1,
				@p15, @p16, @p17, 0
			)`
		_, err = r.db.Exec(query,
			post.ID, post.SiteID, post.BloggerPostID, post.Title, post.Content,
			post.Excerpt, post.Slug, post.AuthorName, post.AuthorAvatarURL,
			post.Labels, post.ThumbnailURL, post.PublishedAt, post.UpdatedAtSource,
			post.SyncedAt, post.CreateDate, post.IDCreator, post.LastUpdate,
		)
		return true, err
	}

	// Found — update if content changed
	if existing.UpdatedAtSource.Equal(post.UpdatedAtSource) {
		return false, nil // no change
	}
	now := time.Now()
	_, err = r.db.Exec(`
		UPDATE monitoring.blog_posts_cache
		SET title = @p1, content = @p2, excerpt = @p3, labels = @p4,
		    thumbnail_url = @p5, updated_at_source = @p6, synced_at = @p7,
		    last_update = @p8
		WHERE id = @p9`,
		post.Title, post.Content, post.Excerpt, post.Labels,
		post.ThumbnailURL, post.UpdatedAtSource, now, now, existing.ID,
	)
	return false, err
}

func (r *repository) GetPostByBloggerID(siteID, bloggerPostID string) (*BlogPost, error) {
	var p BlogPost
	err := r.db.Get(&p, `
		SELECT * FROM monitoring.blog_posts_cache
		WHERE site_id = @p1 AND blogger_post_id = @p2 AND soft_delete = 0`,
		siteID, bloggerPostID)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) ListPosts(f PostFilter) ([]*BlogPost, int, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 || f.Limit > 100 {
		f.Limit = 20
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"p.soft_delete = 0", "p.is_visible = 1"}
	args := []interface{}{}
	n := 1

	if f.SiteID != "" {
		where = append(where, fmt.Sprintf("p.site_id = @p%d", n))
		args = append(args, f.SiteID)
		n++
	}
	if f.Search != "" {
		where = append(where, fmt.Sprintf("(p.title LIKE @p%d OR p.excerpt LIKE @p%d)", n, n))
		args = append(args, "%"+f.Search+"%")
		n++
	}
	if f.Label != "" {
		where = append(where, fmt.Sprintf("p.labels LIKE @p%d", n))
		args = append(args, "%"+f.Label+"%")
		n++
	}

	whereStr := strings.Join(where, " AND ")

	var total int
	r.db.QueryRow(`SELECT COUNT(*) FROM monitoring.blog_posts_cache p WHERE `+whereStr, args...).Scan(&total)

	dataSQL := fmt.Sprintf(`
		SELECT p.id, p.site_id, p.blogger_post_id, p.title, p.excerpt, p.slug,
		       p.author_name, p.author_avatar_url, p.labels, p.thumbnail_url,
		       p.published_at, p.updated_at_source, p.synced_at, p.is_visible,
		       p.create_date, p.id_creator, p.last_update, p.id_updater, p.soft_delete,
		       s.name AS site_name, s.url AS site_url
		FROM monitoring.blog_posts_cache p
		LEFT JOIN monitoring.sites s ON p.site_id = s.id
		WHERE %s
		ORDER BY p.published_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereStr, n+1, n)
	args = append(args, offset, f.Limit)

	rows, err := r.db.Queryx(dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*BlogPost
	for rows.Next() {
		var post BlogPost
		// Manual scan to handle joined columns
		var siteName, siteURL *string
		if err := rows.Scan(
			&post.ID, &post.SiteID, &post.BloggerPostID, &post.Title, &post.Excerpt, &post.Slug,
			&post.AuthorName, &post.AuthorAvatarURL, &post.Labels, &post.ThumbnailURL,
			&post.PublishedAt, &post.UpdatedAtSource, &post.SyncedAt, &post.IsVisible,
			&post.CreateDate, &post.IDCreator, &post.LastUpdate, &post.IDUpdater, &post.SoftDelete,
			&siteName, &siteURL,
		); err != nil {
			return nil, 0, err
		}
		post.SiteName = siteName
		post.SiteURL = siteURL
		list = append(list, &post)
	}
	return list, total, nil
}

func (r *repository) GetPostBySlug(slug string) (*BlogPost, error) {
	var p BlogPost
	err := r.db.Get(&p, `
		SELECT * FROM monitoring.blog_posts_cache
		WHERE slug = @p1 AND is_visible = 1 AND soft_delete = 0`, slug)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) InsertSyncLog(l *BlogSyncLog) error {
	_, err := r.db.Exec(`
		INSERT INTO monitoring.blog_sync_logs
		  (site_id, status, posts_fetched, posts_new, posts_updated,
		   error_message, duration_ms, synced_at, create_date, id_creator, last_update, soft_delete)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, 0)`,
		l.SiteID, l.Status, l.PostsFetched, l.PostsNew, l.PostsUpdated,
		l.ErrorMessage, l.DurationMs, l.SyncedAt, l.CreateDate, l.IDCreator, l.LastUpdate,
	)
	return err
}

func (r *repository) ListSyncLogs(siteID string, limit int) ([]*BlogSyncLog, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	var list []*BlogSyncLog
	err := r.db.Select(&list, `
		SELECT TOP (@p1) * FROM monitoring.blog_sync_logs
		WHERE site_id = @p2 AND soft_delete = 0
		ORDER BY synced_at DESC`, limit, siteID)
	return list, err
}
