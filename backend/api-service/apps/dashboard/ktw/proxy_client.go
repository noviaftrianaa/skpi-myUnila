package ktw

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// ProxyClient adalah HTTP client ke public-service /api/v1/ktw/*.
// Menggantikan peran Repository di modul lain (yang query SQL langsung).
type ProxyClient struct {
	baseURL string
	client  *http.Client
}

// NewProxyClient bikin client baru. Base URL dari env PUBLIC_SERVICE_BASE_URL
// (default http://myunila-nginx-staging:81 — alamat internal docker network).
func NewProxyClient() *ProxyClient {
	base := os.Getenv("PUBLIC_SERVICE_BASE_URL")
	if base == "" {
		base = "http://myunila-nginx-staging:81"
	}
	return &ProxyClient{
		baseURL: strings.TrimRight(base, "/"),
		client:  &http.Client{Timeout: 30 * time.Second},
	}
}

// Fetch GET /api/v1/ktw/{path}?{qs} dan return raw JSON body.
// Path contoh: "overview", "fakultas", "prodi/abc-uuid".
// Caller bertanggung jawab parse JSON ke UpstreamResponse.
func (p *ProxyClient) Fetch(ctx context.Context, path string, params map[string]string) (UpstreamResponse, int, error) {
	target := fmt.Sprintf("%s/api/v1/ktw/%s", p.baseURL, strings.TrimLeft(path, "/"))

	qs := url.Values{}
	for k, v := range params {
		if v == "" {
			continue
		}
		qs.Set(k, v)
	}
	if len(qs) > 0 {
		target += "?" + qs.Encode()
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, 0, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("call upstream: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, fmt.Errorf("read upstream body: %w", err)
	}

	// Validate JSON sebelum cache supaya tidak simpan body rusak
	if !json.Valid(body) {
		return nil, resp.StatusCode, fmt.Errorf("upstream returned invalid JSON (status %d)", resp.StatusCode)
	}
	return UpstreamResponse(body), resp.StatusCode, nil
}
