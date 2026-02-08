package simpedam

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/myunila/keuangan-service/apps/api_config"
	"github.com/myunila/keuangan-service/internal/config"
)

// Client represents SIMPEDAM REST API client
type Client struct {
	endpoint   string
	username   string
	password   string
	token      string
	tokenTime  time.Time
	httpClient *http.Client
	mu         sync.RWMutex
}

const (
	// Token expires after 1 hour, refresh at 50 minutes
	TokenExpiryDuration = 50 * time.Minute
	// HTTP timeout
	HTTPTimeout = 300 * time.Second
)

// NewClient creates a new SIMPEDAM REST API client
func NewClient() (*Client, error) {
	cfg := config.Cfg.SimpedamAPI

	// Default values from environment/config
	endpoint := cfg.Endpoint
	username := cfg.Username
	password := cfg.Password

	// Try to get config from database first (endpoint + credentials)
	apiConfig, err := api_config.GetAPIConfigByCode("SIMPEDAM")
	if err == nil && apiConfig != nil {
		log.Println("🔐 [SIMPEDAM] Using configuration from database")
		// Use endpoint from database (already includes full path)
		if apiConfig.BaseURL != "" {
			endpoint = apiConfig.BaseURL
			log.Printf("📍 [SIMPEDAM] Endpoint from database: %s", endpoint)
		}

		// Get credentials from database
		credentials, credErr := api_config.GetAPICredentials("SIMPEDAM")
		if credErr == nil && credentials != nil {
			if user, ok := credentials["username"].(string); ok && user != "" {
				username = user
			}
			if pass, ok := credentials["password"].(string); ok && pass != "" {
				password = pass
			}
		}
	} else {
		log.Printf("🔑 [SIMPEDAM] Using configuration from environment (.env): %v", err)
	}

	if endpoint == "" {
		return nil, fmt.Errorf("SIMPEDAM endpoint not configured")
	}

	if username == "" || password == "" {
		return nil, fmt.Errorf("SIMPEDAM credentials not configured (username or password is empty)")
	}

	// Skip SSL verification (SIMPEDAM uses self-signed cert)
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	client := &Client{
		endpoint: endpoint,
		username: username,
		password: password,
		httpClient: &http.Client{
			Transport: tr,
			Timeout:   HTTPTimeout,
		},
	}

	log.Printf("🌐 [SIMPEDAM] REST API Client initialized - Endpoint: %s, Username: %s", endpoint, username)
	return client, nil
}

// TestConnection tests the API connection by getting a token
func (c *Client) TestConnection() error {
	_, err := c.ensureToken()
	return err
}

// ensureToken ensures we have a valid token, refreshing if necessary
func (c *Client) ensureToken() (string, error) {
	c.mu.RLock()
	if c.token != "" && time.Since(c.tokenTime) < TokenExpiryDuration {
		token := c.token
		c.mu.RUnlock()
		return token, nil
	}
	c.mu.RUnlock()

	// Need to refresh token
	return c.refreshToken()
}

// checkTokenValid calls CekExpired to verify token is still valid on SIMPEDAM side
func (c *Client) checkTokenValid(token string) bool {
	reqBody := BaseRequest{
		Service: "CekExpired",
		Token:   token,
	}

	respBody, err := c.doJSONRequest(reqBody)
	if err != nil {
		return false
	}

	var response BaseResponse
	if err := json.Unmarshal(respBody, &response); err != nil {
		return false
	}

	return response.ErrorCode == "0"
}

// refreshToken gets a new token from SIMPEDAM
func (c *Client) refreshToken() (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Double-check in case another goroutine already refreshed
	if c.token != "" && time.Since(c.tokenTime) < TokenExpiryDuration {
		return c.token, nil
	}

	log.Println("🔑 [SIMPEDAM] Refreshing token...")

	// Build JSON request for GetToken
	reqBody := BaseRequest{
		Service:  "GetToken",
		Username: c.username,
		Password: c.password,
	}

	respBody, err := c.doJSONRequest(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to get token: %w", err)
	}

	log.Printf("📄 [SIMPEDAM] GetToken raw response: %.500s", string(respBody))

	// Parse JSON response
	var response BaseResponse
	if err := json.Unmarshal(respBody, &response); err != nil {
		log.Printf("❌ [SIMPEDAM] Failed to parse GetToken response: %v", err)
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	// Check error code
	if response.ErrorCode != "0" {
		return "", fmt.Errorf("GetToken API error: error_code=%s, error_desc=%s", response.ErrorCode, response.ErrorDesc)
	}

	// Parse token data
	var tokenData TokenData
	if err := json.Unmarshal(response.Data, &tokenData); err != nil {
		log.Printf("❌ [SIMPEDAM] Failed to parse token data: %v", err)
		return "", fmt.Errorf("failed to parse token data: %w", err)
	}

	c.token = tokenData.Token
	c.tokenTime = time.Now()

	log.Printf("✅ [SIMPEDAM] Token refreshed successfully - length: %d, value: %.10s...", len(c.token), c.token)
	return c.token, nil
}

// ForceRefreshToken forces a token refresh (for external/non-concurrent use)
func (c *Client) ForceRefreshToken() (string, error) {
	c.mu.Lock()
	c.token = ""
	c.mu.Unlock()
	return c.refreshToken()
}

// invalidateToken marks a specific token as invalid so the next ensureToken call triggers a refresh.
// Only clears the cached token if it still matches failedToken (avoids stampede when multiple
// goroutines detect error_code 90 simultaneously — only the first one triggers a refresh).
func (c *Client) invalidateToken(failedToken string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.token == failedToken {
		log.Printf("🔄 [SIMPEDAM] Invalidating expired token %.10s...", failedToken)
		c.token = ""
		c.tokenTime = time.Time{}
	}
	// If token != failedToken, another goroutine already refreshed — do nothing
}

// callWithTokenRetry executes an API call, retrying once if error_code 90 (token expired/invalid).
// Uses invalidateToken to avoid token stampede in concurrent scenarios.
func (c *Client) callWithTokenRetry(service, filter, order string, limit, offset int) (*BaseResponse, error) {
	for attempt := 0; attempt < 2; attempt++ {
		token, err := c.ensureToken()
		if err != nil {
			return nil, err
		}

		reqBody := BaseRequest{
			Service: service,
			Token:   token,
			Filter:  filter,
			Order:   order,
			Limit:   fmt.Sprintf("%d", limit),
			Offset:  fmt.Sprintf("%d", offset),
		}

		respBody, err := c.doJSONRequest(reqBody)
		if err != nil {
			if attempt == 0 && c.isTokenError(err) {
				log.Printf("⚠️  [SIMPEDAM] HTTP token error on %s, invalidating and retrying...", service)
				c.invalidateToken(token)
				continue
			}
			return nil, err
		}

		var response BaseResponse
		if err := json.Unmarshal(respBody, &response); err != nil {
			return nil, fmt.Errorf("failed to parse %s response: %w", service, err)
		}

		// Check for token expiry in response body (error_code 90)
		if response.ErrorCode == "90" && attempt == 0 {
			log.Printf("⚠️  [SIMPEDAM] Token expired (error_code 90) on %s, invalidating and retrying...", service)
			c.invalidateToken(token)
			continue
		}

		if response.ErrorCode != "0" && response.ErrorCode != "" {
			log.Printf("❌ [SIMPEDAM] %s API Error - Code: %s, Desc: %s", service, response.ErrorCode, response.ErrorDesc)
			return nil, fmt.Errorf("SIMPEDAM API error: error_code=%s, error_desc=%s", response.ErrorCode, response.ErrorDesc)
		}

		return &response, nil
	}
	return nil, fmt.Errorf("SIMPEDAM %s failed after token retry", service)
}

// doJSONRequest performs a JSON REST API request
func (c *Client) doJSONRequest(reqBody interface{}) ([]byte, error) {
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

// GetDaftarUKT fetches UKT class list from SIMPEDAM
func (c *Client) GetDaftarUKT(filter string, order string, limit, offset int) ([]DaftarUKTItem, error) {
	if order == "" {
		order = "kode_fak ASC, nama_program_studi ASC"
	}

	log.Printf("📤 [SIMPEDAM] Requesting DaftarUKT - filter: %s, limit: %d, offset: %d", filter, limit, offset)

	response, err := c.callWithTokenRetry("DaftarUKT", filter, order, limit, offset)
	if err != nil {
		return nil, err
	}

	// Parse items from data
	var items []DaftarUKTItem
	if err := json.Unmarshal(response.Data, &items); err != nil {
		// Try single item case
		var singleItem DaftarUKTItem
		if err2 := json.Unmarshal(response.Data, &singleItem); err2 == nil {
			items = []DaftarUKTItem{singleItem}
		} else {
			log.Printf("📭 [SIMPEDAM] DaftarUKT returned empty or invalid data: %s", string(response.Data))
			return []DaftarUKTItem{}, nil
		}
	}

	log.Printf("📦 [SIMPEDAM] DaftarUKT returned %d items", len(items))
	return items, nil
}

// GetMasterBiayaMahasiswa fetches student payment data from SIMPEDAM
func (c *Client) GetMasterBiayaMahasiswa(filter string, order string, limit, offset int) ([]MasterBiayaMahasiswaItem, error) {
	log.Printf("📤 [SIMPEDAM] Requesting MasterBiayaMahasiswa - filter: %s, limit: %d, offset: %d", filter, limit, offset)

	response, err := c.callWithTokenRetry("MasterBiayaMahasiswa", filter, order, limit, offset)
	if err != nil {
		return nil, err
	}

	// Parse items from data
	var items []MasterBiayaMahasiswaItem
	if err := json.Unmarshal(response.Data, &items); err != nil {
		log.Printf("📭 [SIMPEDAM] MasterBiayaMahasiswa returned empty or invalid data: %s", string(response.Data))
		return []MasterBiayaMahasiswaItem{}, nil
	}

	log.Printf("📦 [SIMPEDAM] MasterBiayaMahasiswa returned %d items", len(items))
	return items, nil
}

// GetKelasUKT fetches UKT class master from SIMPEDAM
func (c *Client) GetKelasUKT(filter string, order string, limit, offset int) ([]KelasUKTItem, error) {
	log.Printf("📤 [SIMPEDAM] Requesting KelasUKT - filter: %s, limit: %d, offset: %d", filter, limit, offset)

	response, err := c.callWithTokenRetry("KelasUKT", filter, order, limit, offset)
	if err != nil {
		return nil, err
	}

	// Parse items from data
	var items []KelasUKTItem
	if err := json.Unmarshal(response.Data, &items); err != nil {
		log.Printf("📭 [SIMPEDAM] KelasUKT returned empty or invalid data: %s", string(response.Data))
		return []KelasUKTItem{}, nil
	}

	log.Printf("📦 [SIMPEDAM] KelasUKT returned %d items", len(items))
	return items, nil
}

// GetListTagihan fetches tagihan (bills) list from SIMPEDAM
func (c *Client) GetListTagihan(filter string, order string, limit, offset int) ([]ListTagihanItem, error) {
	log.Printf("📤 [SIMPEDAM] Requesting GetListTagihan - filter: %s, limit: %d, offset: %d", filter, limit, offset)

	response, err := c.callWithTokenRetry("GetListTagihan", filter, order, limit, offset)
	if err != nil {
		return nil, err
	}

	// Parse items from data
	var items []ListTagihanItem
	if err := json.Unmarshal(response.Data, &items); err != nil {
		log.Printf("📭 [SIMPEDAM] GetListTagihan returned empty or invalid data: %s", string(response.Data))
		return []ListTagihanItem{}, nil
	}

	log.Printf("📦 [SIMPEDAM] GetListTagihan returned %d items", len(items))
	return items, nil
}

// isTokenError checks if error is related to token expiration
func (c *Client) isTokenError(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return bytes.Contains([]byte(errStr), []byte("token")) ||
		bytes.Contains([]byte(errStr), []byte("Token")) ||
		bytes.Contains([]byte(errStr), []byte("expired")) ||
		bytes.Contains([]byte(errStr), []byte("invalid"))
}
