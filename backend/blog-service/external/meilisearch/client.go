// Package meilisearch wraps the meilisearch-go SDK for blog-service.
// Index name + searchable/filterable attributes are configured on Init so the
// rest of the app just calls Index() / Remove() / Search().
package meilisearch

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	mscli "github.com/meilisearch/meilisearch-go"

	"github.com/myunila/blog-service/config"
)

type Client struct {
	cli       mscli.ServiceManager
	indexName string
	host      string
	apiKey    string
}

var Default *Client

// Init connects to Meilisearch, ensures the index exists, and applies our
// settings (searchable/filterable/sortable attributes). When config is empty,
// returns (nil, nil) — caller can soft-fail just like MinIO.
func Init(cfg config.MeilisearchConfig) (*Client, error) {
	if cfg.URL == "" || cfg.APIKey == "" {
		log.Printf("⚠️  Meilisearch not configured (URL/APIKey empty) — search will fall back to SQL LIKE")
		return nil, nil
	}
	cli := mscli.New(cfg.URL, mscli.WithAPIKey(cfg.APIKey))
	// Trip a quick health check so we fail fast on bad config.
	if _, err := cli.HealthWithContext(context.Background()); err != nil {
		return nil, fmt.Errorf("meilisearch health: %w", err)
	}

	c := &Client{cli: cli, indexName: cfg.Index, host: cfg.URL, apiKey: cfg.APIKey}

	// Ensure the index exists. Create returns a Task; we don't strictly need
	// to wait because subsequent operations queue against the same instance.
	if _, err := cli.CreateIndexWithContext(context.Background(), &mscli.IndexConfig{
		Uid:        cfg.Index,
		PrimaryKey: "id_post",
	}); err != nil {
		// 409 (already exists) is fine; anything else is fatal.
		var apiErr *mscli.Error
		if !(errors.As(err, &apiErr) && apiErr.StatusCode == 409) {
			// Non-409 error means the create actually failed.
			log.Printf("meilisearch CreateIndex: %v (continuing — may already exist)", err)
		}
	}

	idx := cli.Index(cfg.Index)
	searchable := []string{"judul", "ringkasan", "konten_text", "nm_blog", "kategori_nama", "tags_csv"}
	filterable := []interface{}{"id_blog", "subdomain", "kategori_slug", "status", "a_publik"}
	sortable := []string{"tgl_terbit", "jumlah_view", "jumlah_like", "skor_trending"}

	// Searchable attributes: order matters — Meilisearch weights earlier
	// fields higher when ranking.
	if _, err := idx.UpdateSearchableAttributesWithContext(context.Background(), &searchable); err != nil {
		return nil, fmt.Errorf("update searchable attrs: %w", err)
	}
	if _, err := idx.UpdateFilterableAttributesWithContext(context.Background(), &filterable); err != nil {
		return nil, fmt.Errorf("update filterable attrs: %w", err)
	}
	if _, err := idx.UpdateSortableAttributesWithContext(context.Background(), &sortable); err != nil {
		return nil, fmt.Errorf("update sortable attrs: %w", err)
	}

	Default = c
	log.Printf("✅ Meilisearch connected (url=%s, index=%s)", cfg.URL, cfg.Index)
	return Default, nil
}

func (c *Client) Index() string { return c.indexName }

// Document — what we store per post. Keep flat (no nested objects) for
// Meilisearch best perf. konten_text is the HTML-stripped body so we don't
// match against tags/attributes.
type Document struct {
	IDPost        string  `json:"id_post"`
	IDBlog        string  `json:"id_blog"`
	Subdomain     string  `json:"subdomain"`
	NmBlog        string  `json:"nm_blog"`
	NmTampilan    string  `json:"nm_tampilan,omitempty"`
	AvatarURL     string  `json:"avatar_url,omitempty"`
	Judul         string  `json:"judul"`
	Slug          string  `json:"slug"`
	Ringkasan     string  `json:"ringkasan,omitempty"`
	KontenText    string  `json:"konten_text,omitempty"`
	CoverURL      string  `json:"cover_url,omitempty"`
	Status        string  `json:"status"`
	APublik       bool    `json:"a_publik"`
	KategoriSlug  string  `json:"kategori_slug,omitempty"`
	KategoriNama  string  `json:"kategori_nama,omitempty"`
	KategoriWarna string  `json:"kategori_warna,omitempty"`
	TagsCSV       string  `json:"tags_csv,omitempty"`
	TglTerbit     int64   `json:"tgl_terbit,omitempty"`
	JumlahView    int     `json:"jumlah_view"`
	JumlahLike    int     `json:"jumlah_like"`
	WaktuBaca     int     `json:"waktu_baca_menit"`
	SkorTrending  float64 `json:"skor_trending"`
}

// IndexBatch upserts the supplied documents. Use a single call for bulk re-sync
// (much faster than individual AddDocuments calls).
func (c *Client) IndexBatch(ctx context.Context, docs []Document) error {
	if c == nil || len(docs) == 0 {
		return nil
	}
	_, err := c.cli.Index(c.indexName).AddDocumentsWithContext(ctx, docs, nil)
	if err != nil {
		return fmt.Errorf("index batch: %w", err)
	}
	return nil
}

// IndexOne upserts a single document. Convenience for the post-publish hook.
func (c *Client) IndexOne(ctx context.Context, doc Document) error {
	return c.IndexBatch(ctx, []Document{doc})
}

// RemoveOne deletes a document from the index. Called when a post is soft-deleted
// or unpublished.
func (c *Client) RemoveOne(ctx context.Context, idPost string) error {
	if c == nil {
		return nil
	}
	_, err := c.cli.Index(c.indexName).DeleteDocumentWithContext(ctx, idPost, nil)
	if err != nil {
		return fmt.Errorf("remove doc: %w", err)
	}
	return nil
}

// SearchOpts — parameters passed straight to the Meilisearch SearchRequest.
type SearchOpts struct {
	Query           string
	Limit           int
	Offset          int
	Subdomain       string // filter to one blog (tenant search)
	KategoriSlug    string
	Sort            string // "latest" / "trending" / "" (=relevance)
	HighlightFields []string
}

// SearchResult mirrors what we return to the client. Mapped from raw
// meilisearch.SearchResponse so callers don't depend on the SDK types.
type SearchResult struct {
	Hits       []Document `json:"hits"`
	Total      int64      `json:"total"`
	Limit      int        `json:"limit"`
	Offset     int        `json:"offset"`
	Highlights []map[string]any `json:"highlights,omitempty"`
}

// Search queries the blog_post index with the supplied options. Always
// constrains to status=published + a_publik=true.
//
// Implementation note: we POST raw JSON to /indexes/<idx>/search instead of
// using the SDK's Search method because newer SDK versions inject a `hybrid`
// field that older Meilisearch servers (1.5) reject as unknown. Building the
// payload ourselves keeps us compatible across versions.
func (c *Client) Search(ctx context.Context, opts SearchOpts) (*SearchResult, error) {
	if c == nil {
		return nil, errors.New("meilisearch not configured")
	}
	if opts.Limit <= 0 || opts.Limit > 50 {
		opts.Limit = 20
	}
	filters := []string{"status = \"published\"", "a_publik = true"}
	if opts.Subdomain != "" {
		filters = append(filters, fmt.Sprintf("subdomain = %q", opts.Subdomain))
	}
	if opts.KategoriSlug != "" {
		filters = append(filters, fmt.Sprintf("kategori_slug = %q", opts.KategoriSlug))
	}
	filterExpr := strings.Join(filters, " AND ")

	payload := map[string]any{
		"q":                     opts.Query,
		"limit":                 opts.Limit,
		"offset":                opts.Offset,
		"filter":                filterExpr,
		"attributesToHighlight": opts.HighlightFields,
		"highlightPreTag":       "<mark>",
		"highlightPostTag":      "</mark>",
	}
	switch opts.Sort {
	case "latest":
		payload["sort"] = []string{"tgl_terbit:desc"}
	case "trending":
		// Use the recency-weighted score maintained by the trending scheduler;
		// fall back to jumlah_view as a tiebreaker via two-key sort.
		payload["sort"] = []string{"skor_trending:desc", "jumlah_view:desc"}
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/indexes/%s/search", strings.TrimRight(c.host, "/"), c.indexName)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build search req: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("search http: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("search: %s — %s", resp.Status, string(respBody))
	}

	var raw struct {
		Hits               []map[string]any `json:"hits"`
		EstimatedTotalHits int64            `json:"estimatedTotalHits"`
	}
	if err := json.Unmarshal(respBody, &raw); err != nil {
		return nil, fmt.Errorf("parse search resp: %w", err)
	}

	out := &SearchResult{
		Total:  raw.EstimatedTotalHits,
		Limit:  opts.Limit,
		Offset: opts.Offset,
	}
	highlights := make([]map[string]any, 0, len(raw.Hits))
	for _, m := range raw.Hits {
		doc := documentFromMap(m)
		out.Hits = append(out.Hits, doc)
		if f, ok := m["_formatted"].(map[string]any); ok && len(opts.HighlightFields) > 0 {
			h := map[string]any{"id_post": doc.IDPost}
			for _, k := range opts.HighlightFields {
				if v, ok := f[k]; ok {
					h[k] = v
				}
			}
			highlights = append(highlights, h)
		}
	}
	out.Highlights = highlights
	return out, nil
}

// documentFromMap decodes a single search hit map into a Document struct.
// Meilisearch returns JSON-as-interface so we round-trip carefully.
func documentFromMap(m map[string]any) Document {
	getStr := func(k string) string {
		if v, ok := m[k].(string); ok {
			return v
		}
		return ""
	}
	getInt := func(k string) int {
		switch v := m[k].(type) {
		case float64:
			return int(v)
		case int:
			return v
		case int64:
			return int(v)
		}
		return 0
	}
	getInt64 := func(k string) int64 {
		switch v := m[k].(type) {
		case float64:
			return int64(v)
		case int:
			return int64(v)
		case int64:
			return v
		}
		return 0
	}
	getBool := func(k string) bool {
		if v, ok := m[k].(bool); ok {
			return v
		}
		return false
	}
	getFloat := func(k string) float64 {
		switch v := m[k].(type) {
		case float64:
			return v
		case int:
			return float64(v)
		case int64:
			return float64(v)
		}
		return 0
	}
	return Document{
		IDPost:        getStr("id_post"),
		IDBlog:        getStr("id_blog"),
		Subdomain:     getStr("subdomain"),
		NmBlog:        getStr("nm_blog"),
		NmTampilan:    getStr("nm_tampilan"),
		AvatarURL:     getStr("avatar_url"),
		Judul:         getStr("judul"),
		Slug:          getStr("slug"),
		Ringkasan:     getStr("ringkasan"),
		KontenText:    getStr("konten_text"),
		CoverURL:      getStr("cover_url"),
		Status:        getStr("status"),
		APublik:       getBool("a_publik"),
		KategoriSlug:  getStr("kategori_slug"),
		KategoriNama:  getStr("kategori_nama"),
		KategoriWarna: getStr("kategori_warna"),
		TagsCSV:       getStr("tags_csv"),
		TglTerbit:     getInt64("tgl_terbit"),
		JumlahView:    getInt("jumlah_view"),
		JumlahLike:    getInt("jumlah_like"),
		WaktuBaca:     getInt("waktu_baca_menit"),
		SkorTrending:  getFloat("skor_trending"),
	}
}

