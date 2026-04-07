package blog_sync

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"monitoring-service/apps/site"
	"monitoring-service/internal/config"

	"github.com/google/uuid"
)

const sysUserID = "00000000-0000-0000-0000-000000000001"

type Service interface {
	// SyncSite fetches all posts from Blogger API for a site
	SyncSite(siteID, triggeredBy string) (*SyncResult, error)
	// SyncAll syncs all blogger sites (called by scheduler)
	SyncAll() error
	// List posts (public)
	ListPosts(f PostFilter) ([]*BlogPost, int, error)
	// Get post by slug (public)
	GetPostBySlug(slug string) (*BlogPost, error)
	// Get sync logs for a site
	ListSyncLogs(siteID string, limit int) ([]*BlogSyncLog, error)
}

type service struct {
	repo    Repository
	siteSvc site.Service
	cfg     config.BloggerConfig
	client  *http.Client
}

func NewService(repo Repository, siteSvc site.Service, cfg config.BloggerConfig) Service {
	return &service{
		repo:    repo,
		siteSvc: siteSvc,
		cfg:     cfg,
		client:  &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *service) ListPosts(f PostFilter) ([]*BlogPost, int, error) {
	return s.repo.ListPosts(f)
}

func (s *service) GetPostBySlug(slug string) (*BlogPost, error) {
	return s.repo.GetPostBySlug(slug)
}

func (s *service) ListSyncLogs(siteID string, limit int) ([]*BlogSyncLog, error) {
	return s.repo.ListSyncLogs(siteID, limit)
}

func (s *service) SyncAll() error {
	sites, err := s.siteSvc.ListActive()
	if err != nil {
		return err
	}

	synced := 0
	for _, sv := range sites {
		if sv.BloggerBlogID == nil || sv.Platform != "blogger" {
			continue
		}
		result, err := s.SyncSite(sv.ID, sysUserID)
		if err != nil {
			log.Printf("⚠️  BlogSync: site %s sync failed: %v", sv.URL, err)
			continue
		}
		log.Printf("✅ BlogSync: %s - %d new, %d updated", sv.Name, result.PostsNew, result.PostsUpdated)
		synced++
	}
	log.Printf("✅ BlogSync: synced %d blogger sites", synced)
	return nil
}

func (s *service) SyncSite(siteID, triggeredBy string) (*SyncResult, error) {
	start := time.Now()

	sv, err := s.siteSvc.GetByID(siteID)
	if err != nil {
		return nil, fmt.Errorf("site not found: %w", err)
	}
	if sv.BloggerBlogID == nil {
		return nil, fmt.Errorf("site %s has no blogger_blog_id", sv.URL)
	}

	// Use site-specific API key or fall back to global
	apiKey := s.cfg.APIKey
	if sv.BloggerAPIKey != nil && *sv.BloggerAPIKey != "" {
		apiKey = *sv.BloggerAPIKey
	}
	if apiKey == "" {
		return nil, fmt.Errorf("no Blogger API key configured for site %s", sv.URL)
	}

	result := &SyncResult{SiteID: siteID, SiteName: sv.Name}
	var pageToken string

	for {
		posts, nextToken, err := s.fetchPage(*sv.BloggerBlogID, apiKey, pageToken)
		if err != nil {
			s.saveLog(siteID, "failed", result, err, start, triggeredBy)
			return nil, err
		}

		for _, p := range posts {
			result.PostsFetched++
			post := s.mapPost(sv.ID, p)
			isNew, err := s.repo.UpsertPost(post)
			if err != nil {
				log.Printf("⚠️  BlogSync: upsert failed for post %s: %v", p.ID, err)
				continue
			}
			if isNew {
				result.PostsNew++
			} else {
				result.PostsUpdated++
			}
		}

		if nextToken == nil {
			break
		}
		pageToken = *nextToken
	}

	result.DurationMs = int(time.Since(start).Milliseconds())
	s.saveLog(siteID, "success", result, nil, start, triggeredBy)
	return result, nil
}

func (s *service) fetchPage(blogID, apiKey, pageToken string) ([]BloggerAPIPost, *string, error) {
	u := fmt.Sprintf("https://www.googleapis.com/blogger/v3/blogs/%s/posts", blogID)
	params := url.Values{
		"key":        {apiKey},
		"maxResults": {"500"},
		"fields":     {"items(id,title,content,url,labels,author,published,updated,images),nextPageToken"},
	}
	if pageToken != "" {
		params.Set("pageToken", pageToken)
	}

	resp, err := s.client.Get(u + "?" + params.Encode())
	if err != nil {
		return nil, nil, fmt.Errorf("blogger API request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	if resp.StatusCode != 200 {
		return nil, nil, fmt.Errorf("blogger API error %d: %s", resp.StatusCode, string(body[:min(200, len(body))]))
	}

	var result BloggerAPIResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, nil, err
	}

	return result.Items, result.NextPageToken, nil
}

func (s *service) mapPost(siteID string, p BloggerAPIPost) *BlogPost {
	now := time.Now()
	id := uuid.NewSHA1(uuid.NameSpaceURL, []byte(siteID+":"+p.ID)).String()

	published, _ := time.Parse(time.RFC3339, p.Published)
	updated, _ := time.Parse(time.RFC3339, p.Updated)

	slug := slugify(p.URL)
	excerpt := buildExcerpt(p.Content, 300)

	var authorName, authorAvatar, labels, thumbnail *string
	if p.Author.DisplayName != "" {
		s := p.Author.DisplayName
		authorName = &s
	}
	if p.Author.Image.URL != "" {
		s := p.Author.Image.URL
		authorAvatar = &s
	}
	if len(p.Labels) > 0 {
		s := strings.Join(p.Labels, ",")
		labels = &s
	}
	if len(p.Images) > 0 {
		s := p.Images[0].URL
		thumbnail = &s
	}

	return &BlogPost{
		ID:              id,
		SiteID:          siteID,
		BloggerPostID:   p.ID,
		Title:           p.Title,
		Content:         p.Content,
		Excerpt:         &excerpt,
		Slug:            slug,
		AuthorName:      authorName,
		AuthorAvatarURL: authorAvatar,
		Labels:          labels,
		ThumbnailURL:    thumbnail,
		PublishedAt:     published,
		UpdatedAtSource: updated,
		SyncedAt:        now,
		CreateDate:      now,
		IDCreator:       sysUserID,
		LastUpdate:      now,
	}
}

func (s *service) saveLog(siteID, status string, result *SyncResult, syncErr error, start time.Time, creatorID string) {
	now := time.Now()
	l := &BlogSyncLog{
		SiteID:       siteID,
		Status:       status,
		PostsFetched: result.PostsFetched,
		PostsNew:     result.PostsNew,
		PostsUpdated: result.PostsUpdated,
		DurationMs:   int(time.Since(start).Milliseconds()),
		SyncedAt:     now,
		CreateDate:   now,
		IDCreator:    creatorID,
		LastUpdate:   now,
	}
	if syncErr != nil {
		msg := syncErr.Error()
		l.ErrorMessage = &msg
	}
	if err := s.repo.InsertSyncLog(l); err != nil {
		log.Printf("⚠️  BlogSync: failed to insert sync log: %v", err)
	}
}

// slugify extracts the last path segment from a Blogger URL as slug
func slugify(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	parts := strings.Split(strings.Trim(u.Path, "/"), "/")
	if len(parts) == 0 {
		return rawURL
	}
	slug := parts[len(parts)-1]
	// Remove .html suffix if present
	slug = strings.TrimSuffix(slug, ".html")
	return slug
}

// buildExcerpt strips HTML tags and returns first n characters
var htmlTagRe = regexp.MustCompile(`<[^>]+>`)

func buildExcerpt(html string, maxLen int) string {
	text := htmlTagRe.ReplaceAllString(html, " ")
	// Collapse whitespace
	fields := strings.Fields(text)
	text = strings.Join(fields, " ")
	if len([]rune(text)) > maxLen {
		runes := []rune(text)
		return string(runes[:maxLen]) + "..."
	}
	return text
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
