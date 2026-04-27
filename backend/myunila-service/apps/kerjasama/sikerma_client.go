package kerjasama

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// SikermaClient — HTTP client ke SIKERMA via VM1 proxy (sikerma-proxy nginx).
// Base URL ambil dari env SIKERMA_BASE_URL, default ke VM1 internal IP:9803.
type SikermaClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewSikermaClient — read SIKERMA_BASE_URL env. Default proxy VM1.
func NewSikermaClient() *SikermaClient {
	base := os.Getenv("SIKERMA_BASE_URL")
	if base == "" {
		// Default: VM1 sikerma-proxy (internal LAN)
		base = "http://192.168.120.41:9803/sikerma/api/v1"
	}
	return &SikermaClient{
		baseURL: base,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetUnitKerja — fetch list unit-kerja dari SIKERMA.
// Pakai untuk mapping kode_unit ↔ pdrd.sms.kode_prodi.
func (c *SikermaClient) GetUnitKerja(ctx context.Context) ([]SikermaUnitKerja, error) {
	url := c.baseURL + "/unit-kerja"
	body, err := c.get(ctx, url)
	if err != nil {
		return nil, err
	}

	var resp SikermaUnitKerjaResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("unmarshal unit-kerja: %w", err)
	}
	if resp.Status != "success" {
		return nil, fmt.Errorf("unit-kerja API status not success: %s", resp.Message)
	}
	return resp.Data, nil
}

// GetKerjasamaByUnit — fetch kerjasama untuk 1 unit-kerja id.
// Bisa kosong (total_data: 0) — return slice kosong, no error.
func (c *SikermaClient) GetKerjasamaByUnit(ctx context.Context, unitID int) (*SikermaKerjasamaResponse, error) {
	url := fmt.Sprintf("%s/unit-kerja/%d/kerjasama", c.baseURL, unitID)
	body, err := c.get(ctx, url)
	if err != nil {
		return nil, err
	}

	var resp SikermaKerjasamaResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("unmarshal kerjasama unit %d: %w", unitID, err)
	}
	if resp.Status != "success" {
		return nil, fmt.Errorf("kerjasama unit %d status not success: %s", unitID, resp.Message)
	}
	return &resp, nil
}

// get — GET request internal helper, handles non-2xx + body close.
func (c *SikermaClient) get(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("new request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http GET %s: %w", url, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("HTTP %d from %s: %s", resp.StatusCode, url, string(body[:min(200, len(body))]))
	}
	return body, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
