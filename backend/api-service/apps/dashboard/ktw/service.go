package ktw

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	cache "github.com/myunila/api-service/external/redis"
	"github.com/redis/go-redis/v9"
)

// Service adalah orchestrator: cache check → proxy fetch → cache store.
// Pattern mengikuti apps/referensi/common/service.go.
type Service interface {
	Get(ctx context.Context, endpoint string, params map[string]string) (UpstreamResponse, int, error)
}

type service struct {
	proxy *ProxyClient
	rConn *redis.Client
}

func NewService(proxy *ProxyClient, rConn *redis.Client) Service {
	return &service{proxy: proxy, rConn: rConn}
}

// cacheTTL untuk KTW — 5 menit (upstream juga 10 menit, ini sedikit lebih pendek
// supaya api-service cache di-refresh lebih sering).
const cacheTTL = 5 * time.Minute

// Get panggil cache dulu, kalau miss fetch upstream + simpan.
// Key dipakai: "dashboard:ktw:{endpoint}:{hash(params)}".
func (s *service) Get(ctx context.Context, endpoint string, params map[string]string) (UpstreamResponse, int, error) {
	cacheKey := buildCacheKey(endpoint, params)

	if s.rConn != nil {
		if body, err := cache.Get(ctx, cacheKey); err == nil && body != "" {
			log.Printf("Cache hit: %s", cacheKey)
			return UpstreamResponse(body), 200, nil
		}
	}

	body, statusCode, err := s.proxy.Fetch(ctx, endpoint, params)
	if err != nil {
		return nil, statusCode, err
	}

	// Cache cuma kalau 200 OK
	if statusCode == 200 && s.rConn != nil {
		if setErr := cache.Set(ctx, cacheKey, string(body), cacheTTL); setErr != nil {
			log.Printf("Cache set failed for %s: %v", cacheKey, setErr)
		}
	}
	return body, statusCode, nil
}

// buildCacheKey bikin key deterministik dari endpoint + params.
func buildCacheKey(endpoint string, params map[string]string) string {
	// Sort keys supaya hash deterministik
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var b strings.Builder
	for _, k := range keys {
		v := params[k]
		if v == "" {
			continue
		}
		b.WriteString(k)
		b.WriteString("=")
		b.WriteString(v)
		b.WriteString("&")
	}
	h := sha1.Sum([]byte(b.String()))
	return fmt.Sprintf("dashboard:ktw:%s:%s", endpoint, hex.EncodeToString(h[:8]))
}
