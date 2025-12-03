package sikep_api

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/myunila/myunila-service/apps/api_config"
	"github.com/myunila/myunila-service/internal/config"
)

// SikepClient handles SIKEP API communication
type SikepClient struct {
	BaseURL    string
	Username   string
	Password   string
	Token      string
	HTTPClient *http.Client
	mu         sync.RWMutex
}

// TokenResponse represents the response from auth/generatetoken
type TokenResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Token   string `json:"token"`
}

// PegawaiResponse represents the response from /pegawai endpoint
type PegawaiResponse struct {
	Status  bool                     `json:"status"`
	Message string                   `json:"message"`
	Total   int                      `json:"total"`
	Data    []map[string]interface{} `json:"data"`
}

var (
	globalClient *SikepClient
	once         sync.Once
)

// NewSikepClient creates a new SIKEP API client
// Priority: Database (api_configs) > Environment Variables
func NewSikepClient() (*SikepClient, error) {
	var initErr error

	once.Do(func() {
		// Default from environment/config
		baseURL := config.Cfg.SikepAPI.BaseURL
		username := config.Cfg.SikepAPI.Username
		password := config.Cfg.SikepAPI.Password

		// Try to load from database (api_configs) first - priority over env
		if svc := api_config.GetService(); svc != nil {
			dbConfig, err := svc.GetByAPICode("SIKEP")
			if err == nil && dbConfig != nil {
				// Use database config for base URL
				baseURL = dbConfig.BaseURL
				fmt.Printf("📁 Using SIKEP base URL from database: %s\n", baseURL)

				// Try to get credentials from database
				creds, err := svc.GetCredentials("SIKEP")
				if err == nil && creds != nil {
					if user, ok := creds["username"].(string); ok && user != "" {
						username = user
					}
					if pass, ok := creds["password"].(string); ok && pass != "" {
						password = pass
					}
					fmt.Println("🔐 Using SIKEP credentials from database")
				}
			}
		}

		// Validate credentials
		if baseURL == "" || username == "" || password == "" {
			initErr = errors.New("SIKEP API credentials not configured (check database setting.api_configs or .env)")
			return
		}

		// Create HTTP client with TLS skip verify (SIKEP uses self-signed cert)
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}

		globalClient = &SikepClient{
			BaseURL:  baseURL,
			Username: username,
			Password: password,
			HTTPClient: &http.Client{
				Timeout:   60 * time.Second,
				Transport: tr,
			},
		}

		fmt.Printf("🌐 SIKEP API client initialized with base URL: %s\n", baseURL)

		// Get initial token
		if err := globalClient.GetToken(); err != nil {
			fmt.Printf("⚠️  Warning: Failed to get initial SIKEP token: %v\n", err)
		}
	})

	if globalClient == nil {
		if initErr != nil {
			return nil, initErr
		}
		return nil, errors.New("failed to initialize SIKEP client")
	}

	return globalClient, nil
}

// GetToken authenticates and retrieves token from SIKEP API
// Uses form-urlencoded data as per SIKEP API specification
func (c *SikepClient) GetToken() error {
	if c == nil {
		return errors.New("SIKEP client is nil")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Prepare form data (SIKEP API requires form-urlencoded, not JSON)
	formData := url.Values{}
	formData.Set("username", c.Username)
	formData.Set("password", c.Password)

	// Make request to auth endpoint
	authURL := c.BaseURL + "/auth/generatetoken"
	req, err := http.NewRequest("POST", authURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !tokenResp.Status || tokenResp.Token == "" {
		return fmt.Errorf("failed to get token: %s", tokenResp.Message)
	}

	c.Token = tokenResp.Token
	fmt.Println("✅ SIKEP API token obtained successfully")

	return nil
}

// GetPegawai fetches pegawai data from SIKEP API
// start: starting index (1-based)
// limit: number of records to fetch
func (c *SikepClient) GetPegawai(start, limit int) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/pegawai?start=%d&limit=%d", c.BaseURL, start, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", c.Token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Handle unauthorized - try to refresh token
	if resp.StatusCode == http.StatusUnauthorized {
		if err := c.GetToken(); err != nil {
			return nil, fmt.Errorf("failed to refresh token: %w", err)
		}
		// Retry request with new token
		return c.GetPegawai(start, limit)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var pegawaiResp PegawaiResponse
	if err := json.Unmarshal(body, &pegawaiResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !pegawaiResp.Status {
		return nil, fmt.Errorf("API error: %s", pegawaiResp.Message)
	}

	return pegawaiResp.Data, nil
}

// TestConnection tests the connection to SIKEP API
func (c *SikepClient) TestConnection() error {
	return c.GetToken()
}

// ForceRefreshToken clears current token and gets new one
func (c *SikepClient) ForceRefreshToken() error {
	c.mu.Lock()
	c.Token = ""
	c.mu.Unlock()
	return c.GetToken()
}

// ========================================
// Referensi Endpoints
// ========================================

// GenericResponse represents the generic response from SIKEP API
type GenericResponse struct {
	Status  bool                     `json:"status"`
	Message string                   `json:"message"`
	Data    []map[string]interface{} `json:"data"`
}

// getRefData is a generic method to fetch referensi data
func (c *SikepClient) getRefData(endpoint string) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	url := c.BaseURL + "/" + endpoint

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", c.Token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Handle unauthorized - try to refresh token
	if resp.StatusCode == http.StatusUnauthorized {
		if err := c.GetToken(); err != nil {
			return nil, fmt.Errorf("failed to refresh token: %w", err)
		}
		// Retry request with new token
		return c.getRefData(endpoint)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var apiResp GenericResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !apiResp.Status {
		return nil, fmt.Errorf("API error: %s", apiResp.Message)
	}

	return apiResp.Data, nil
}

// GetOrganisasi fetches organisasi data from SIKEP API
func (c *SikepClient) GetOrganisasi() ([]map[string]interface{}, error) {
	return c.getRefData("organisasi")
}

// GetFungsional fetches fungsional data from SIKEP API
func (c *SikepClient) GetFungsional() ([]map[string]interface{}, error) {
	return c.getRefData("fungsional")
}

// GetStruktural fetches struktural data from SIKEP API
func (c *SikepClient) GetStruktural() ([]map[string]interface{}, error) {
	return c.getRefData("struktural")
}

// GetGolongan fetches golongan data from SIKEP API
func (c *SikepClient) GetGolongan() ([]map[string]interface{}, error) {
	return c.getRefData("golongan")
}

// GetPendidikan fetches pendidikan data from SIKEP API
func (c *SikepClient) GetPendidikan() ([]map[string]interface{}, error) {
	return c.getRefData("pendidikan")
}

// GetGolonganPPPK fetches golongan PPPK data from SIKEP API
func (c *SikepClient) GetGolonganPPPK() ([]map[string]interface{}, error) {
	return c.getRefData("golonganpppk")
}
