package sister_api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sister-service/internal/config"
	"time"
)

// Client handles Sister API requests
type Client struct {
	BaseURL    string
	IDPengguna string
	Username   string
	Password   string
	Token      string // JWT token received from login (cached)
	HTTPClient *http.Client
}

// NewClient creates a new Sister API client
func NewClient(cfg config.SisterAPIConfig) *Client {
	return &Client{
		BaseURL:    cfg.BaseURL,
		IDPengguna: cfg.IDPengguna,
		Username:   cfg.Username,
		Password:   cfg.Password,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ErrorResponse represents Sister API error response
type ErrorResponse struct {
	Message string `json:"message"`
	Detail  string `json:"detail"`
}

// LoginResponse represents Sister API login response
type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

// EnsureAuthenticated ensures client has valid token, login if needed
func (c *Client) EnsureAuthenticated() error {
	// If already have token, assume it's valid
	if c.Token != "" {
		return nil
	}

	log.Printf("🔐 Authenticating to Sister API...")
	log.Printf("   Base URL: %s", c.BaseURL)
	log.Printf("   Username: %s", c.Username)
	log.Printf("   ID Pengguna: %s", c.IDPengguna)

	// Need to login
	payload := map[string]string{
		"username":    c.Username,
		"password":    c.Password,
		"id_pengguna": c.IDPengguna,
	}

	// Login to Sister API
	body, err := c.Post("/1.0/authorize", payload)
	if err != nil {
		log.Printf("❌ Sister API authentication failed: %v", err)
		return fmt.Errorf("failed to authenticate with Sister API: %w", err)
	}

	// Parse response
	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		log.Printf("❌ Failed to parse Sister API login response: %v", err)
		return fmt.Errorf("failed to parse login response: %w", err)
	}

	// Validate response
	if loginResp.Token == "" {
		log.Printf("❌ Sister API returned empty token")
		return fmt.Errorf("Sister API returned empty token")
	}

	// Store token for future requests
	c.Token = loginResp.Token
	log.Printf("✅ Sister API authentication successful!")
	log.Printf("   Token: %s...", c.Token[:50]) // Show first 50 chars

	return nil
}

// Get performs GET request to Sister API
func (c *Client) Get(endpoint string) ([]byte, error) {
	// Ensure we have valid authentication token
	if err := c.EnsureAuthenticated(); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s%s", c.BaseURL, endpoint)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers - Sister API uses Bearer token
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Execute request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check HTTP status
	if resp.StatusCode != http.StatusOK {
		// Try to parse error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			// If token expired, try to re-authenticate once
			if errResp.Message == "Token expired" || errResp.Detail == "Token expired" {
				log.Printf("⚠️  Sister API token expired, re-authenticating...")
				c.Token = "" // Clear expired token

				// Retry with new token
				if err := c.EnsureAuthenticated(); err != nil {
					return nil, fmt.Errorf("failed to re-authenticate: %w", err)
				}

				// Retry the request with new token
				req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
				resp2, err := c.HTTPClient.Do(req)
				if err != nil {
					return nil, fmt.Errorf("failed to retry request: %w", err)
				}
				defer resp2.Body.Close()

				body2, err := io.ReadAll(resp2.Body)
				if err != nil {
					return nil, fmt.Errorf("failed to read retry response: %w", err)
				}

				if resp2.StatusCode != http.StatusOK {
					return nil, fmt.Errorf("retry failed with status %d: %s", resp2.StatusCode, string(body2))
				}

				log.Printf("✅ Successfully re-authenticated and retried request")
				return body2, nil
			}

			return nil, fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
		}
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Sister API returns direct array/object, not wrapped
	return body, nil
}

// Post performs POST request to Sister API
func (c *Client) Post(endpoint string, payload interface{}) ([]byte, error) {
	url := fmt.Sprintf("%s%s", c.BaseURL, endpoint)

	// Marshal payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers - Sister API uses Bearer token for most endpoints
	// But login endpoint might not require it
	if c.Token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Execute request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check HTTP status
	if resp.StatusCode != http.StatusOK {
		// Try to parse error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			return nil, fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
		}
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

// ==================== REFERENSI ENDPOINTS ====================

// GetReferensiAgama fetches list of religions from Sister API
func (c *Client) GetReferensiAgama() ([]byte, error) {
	return c.Get("/1.0/referensi/agama")
}

// GetReferensiNegara fetches list of countries from Sister API
func (c *Client) GetReferensiNegara() ([]byte, error) {
	return c.Get("/1.0/referensi/negara")
}

// GetReferensiJenjangPendidikan fetches list of education levels from Sister API
func (c *Client) GetReferensiJenjangPendidikan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenjang_pendidikan")
}

// GetReferensiGelarAkademik fetches list of academic titles from Sister API
func (c *Client) GetReferensiGelarAkademik() ([]byte, error) {
	return c.Get("/1.0/referensi/gelar_akademik")
}

// GetReferensiSemester fetches list of semesters from Sister API
func (c *Client) GetReferensiSemester() ([]byte, error) {
	return c.Get("/1.0/referensi/semester")
}
