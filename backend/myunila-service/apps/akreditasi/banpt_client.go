package akreditasi

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// BanptClient — HTTP fetcher ke direktori publik banpt.or.id.
// API mengembalikan JSON: {"data": [["PT", "Prodi", "Jenjang", ...], ...]}.
// Filter UNILA dilakukan di sini (case-insensitive substring + exclude PT lain
// yang punya kata "LAMPUNG" tapi bukan Universitas Lampung).
type BanptClient struct {
	baseURL    string
	httpClient *http.Client
}

const banptURL = "https://banpt.or.id/direktori/model/dir_prodi/get_hasil_pencariannew.php"

func NewBanptClient() *BanptClient {
	return &BanptClient{
		baseURL: banptURL,
		httpClient: &http.Client{
			Timeout: 90 * time.Second,
		},
	}
}

// FetchUnila — panggil banpt API, decode array-of-array, filter UNILA only,
// dan kembalikan slice BanptRecord. Network/timeout error di-return apa adanya
// supaya caller bisa log + audit ke sync_log dengan status=failed.
func (c *BanptClient) FetchUnila(ctx context.Context) ([]BanptRecord, int, error) {
	url := fmt.Sprintf("%s?_=%d", c.baseURL, time.Now().UnixMilli())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, fmt.Errorf("new request: %w", err)
	}
	// BAN-PT cek User-Agent dan X-Requested-With; tanpa header ini balik HTML.
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MyUnila/1.0")
	req.Header.Set("Accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")
	req.Header.Set("Referer", "https://banpt.or.id/direktori/prodi/pencarian_prodi.php")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("fetch banpt: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, 0, fmt.Errorf("banpt returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, fmt.Errorf("read banpt body: %w", err)
	}

	var raw struct {
		Data [][]any `json:"data"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, 0, fmt.Errorf("parse banpt json: %w", err)
	}
	totalFetched := len(raw.Data)

	out := make([]BanptRecord, 0, 200)
	for _, row := range raw.Data {
		if len(row) < 9 {
			continue
		}
		pt := toString(row[0])
		if !isUnila(pt) {
			continue
		}
		expired := toString(row[7])
		if expired == "-" {
			expired = ""
		}
		out = append(out, BanptRecord{
			PerguruanTinggi: pt,
			NamaProdi:       strings.TrimSpace(toString(row[1])),
			Jenjang:         strings.TrimSpace(toString(row[2])),
			Wilayah:         toString(row[3]),
			NoSK:            toString(row[4]),
			TahunSK:         toString(row[5]),
			Akreditasi:      strings.TrimSpace(toString(row[6])),
			TanggalExpired:  expired,
			Status:          toString(row[8]),
		})
	}
	return out, totalFetched, nil
}

// isUnila — copy logic dari fetch_banpt_api.py: cocok kalau nama mengandung
// "UNIV LAMPUNG" / "UNIVERSITAS LAMPUNG" / "UNILA" tapi tidak mengandung
// kata kunci PT lain di Lampung (Teknokrat, Muhammadiyah Bandar, dll).
func isUnila(ptName string) bool {
	upper := strings.ToUpper(strings.TrimSpace(ptName))
	hasUniv := strings.Contains(upper, "UNIV LAMPUNG") ||
		strings.Contains(upper, "UNIVERSITAS LAMPUNG") ||
		strings.Contains(upper, "UNILA")
	if !hasUniv {
		return false
	}
	// Exclude PT lain yang nama-nya bisa kena false-match.
	excludes := []string{"TEKNOKRAT", "MUHAMMADIYAH", "BANDAR LAMPUNG", "INFORMATIKA"}
	for _, ex := range excludes {
		if strings.Contains(upper, ex) {
			return false
		}
	}
	return true
}

func toString(v any) string {
	if v == nil {
		return ""
	}
	switch x := v.(type) {
	case string:
		return x
	case float64:
		return fmt.Sprintf("%g", x)
	default:
		b, _ := json.Marshal(x)
		return strings.Trim(string(b), `"`)
	}
}
