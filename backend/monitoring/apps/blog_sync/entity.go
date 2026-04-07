package blog_sync

import "time"

// BlogPost maps to monitoring.blog_posts_cache
type BlogPost struct {
	ID               string     `json:"id"                db:"id"`
	SiteID           string     `json:"site_id"           db:"site_id"`
	BloggerPostID    string     `json:"blogger_post_id"   db:"blogger_post_id"`
	Title            string     `json:"title"             db:"title"`
	Content          string     `json:"content,omitempty" db:"content"`
	Excerpt          *string    `json:"excerpt"           db:"excerpt"`
	Slug             string     `json:"slug"              db:"slug"`
	AuthorName       *string    `json:"author_name"       db:"author_name"`
	AuthorAvatarURL  *string    `json:"author_avatar_url" db:"author_avatar_url"`
	Labels           *string    `json:"labels"            db:"labels"`
	ThumbnailURL     *string    `json:"thumbnail_url"     db:"thumbnail_url"`
	PublishedAt      time.Time  `json:"published_at"      db:"published_at"`
	UpdatedAtSource  time.Time  `json:"updated_at_source" db:"updated_at_source"`
	SyncedAt         time.Time  `json:"synced_at"         db:"synced_at"`
	IsVisible        int        `json:"is_visible"        db:"is_visible"`
	// Audit
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-" db:"soft_delete"`

	// Joined from sites
	SiteName *string `json:"site_name,omitempty" db:"-"`
	SiteURL  *string `json:"site_url,omitempty"  db:"-"`
}

// BlogSyncLog maps to monitoring.blog_sync_logs
type BlogSyncLog struct {
	ID           int       `json:"id"            db:"id"`
	SiteID       string    `json:"site_id"       db:"site_id"`
	Status       string    `json:"status"        db:"status"` // success / failed / partial
	PostsFetched int       `json:"posts_fetched" db:"posts_fetched"`
	PostsNew     int       `json:"posts_new"     db:"posts_new"`
	PostsUpdated int       `json:"posts_updated" db:"posts_updated"`
	ErrorMessage *string   `json:"error_message" db:"error_message"`
	DurationMs   int       `json:"duration_ms"   db:"duration_ms"`
	SyncedAt     time.Time `json:"synced_at"     db:"synced_at"`
	// Audit
	CreateDate time.Time `json:"-" db:"create_date"`
	IDCreator  string    `json:"-" db:"id_creator"`
	LastUpdate time.Time `json:"-" db:"last_update"`
	IDUpdater  *string   `json:"-" db:"id_updater"`
	SoftDelete int       `json:"-" db:"soft_delete"`
}

// BloggerAPIPost is a single post from Blogger API v3
type BloggerAPIPost struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	URL     string `json:"url"`
	Labels  []string `json:"labels"`
	Author  struct {
		DisplayName string `json:"displayName"`
		Image       struct {
			URL string `json:"url"`
		} `json:"image"`
	} `json:"author"`
	Published string `json:"published"` // RFC3339
	Updated   string `json:"updated"`
	Images    []struct {
		URL string `json:"url"`
	} `json:"images"`
}

// BloggerAPIResponse is the response from Blogger API v3 /posts
type BloggerAPIResponse struct {
	Items         []BloggerAPIPost `json:"items"`
	NextPageToken *string          `json:"nextPageToken"`
}

// PostFilter for public post listing
type PostFilter struct {
	SiteID string `query:"site_id"`
	Search string `query:"search"`
	Label  string `query:"label"`
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
}

// SyncResult is returned by sync operations
type SyncResult struct {
	SiteID       string `json:"site_id"`
	SiteName     string `json:"site_name"`
	PostsFetched int    `json:"posts_fetched"`
	PostsNew     int    `json:"posts_new"`
	PostsUpdated int    `json:"posts_updated"`
	DurationMs   int    `json:"duration_ms"`
	Error        string `json:"error,omitempty"`
}
