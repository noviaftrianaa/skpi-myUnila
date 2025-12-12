package radius_api

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/myunila/myunila-service/apps/api_config"
)

// RadiusClient handles Radius SSO API communication
// API: https://akses.unila.ac.id/api/live/v1
type RadiusClient struct {
	BaseURL     string
	AppKey      string
	Username    string
	Token       string
	TokenExpiry time.Time
	HTTPClient  *http.Client
	mu          sync.RWMutex
}

// LoginResponse represents the response from auth/login
type LoginResponse struct {
	Status       bool   `json:"status"`
	Message      string `json:"message"`
	Data         struct {
		Type  string `json:"type"`
		Token string `json:"token"`
	} `json:"data"`
	WaktuExpired string `json:"waktu_expired"`
}

// UsersResponse represents the response from /sso-radius/users
type UsersResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Data    []SSOUser  `json:"data"`
	Meta    UsersMeta  `json:"meta"`
}

// UsersMeta represents pagination metadata
type UsersMeta struct {
	Total      int `json:"total"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalPages int `json:"total_pages"`
}

// SSOUser represents a user from SSO Radius API
type SSOUser struct {
	ID           int           `json:"id"`
	Username     string        `json:"username"`
	PasswordHash string        `json:"password_hash"` // SHA1 password from radcheck
	NmPengguna   string        `json:"nm_pengguna"`
	Email        string        `json:"email"`
	TanggalLahir string        `json:"tanggal_lahir"`
	NIP          string        `json:"nip"`
	Status       string        `json:"status"`
	DomainEmail  string        `json:"domain_email"`
	JenisKelamin string        `json:"jenis_kelamin"` // From peserta_didik/sdm (L/P)
	// Reference IDs (kolom di man_akses.pengguna) - moved to top level
	IDPdPengguna  *string       `json:"id_pd_pengguna"`
	IDSdmPengguna *string       `json:"id_sdm_pengguna"`
	IDUserSikep   *string       `json:"id_user_sikep"`
	RolePengguna  *RolePengguna `json:"role_pengguna"`
	FoundInPDUT   bool          `json:"found_in_pdut"`
}

// RolePengguna represents user role from SSO Radius API
type RolePengguna struct {
	IDPeran      int    `json:"id_peran"`
	NmPeran      string `json:"nm_peran"`
	IDOrganisasi string `json:"id_organisasi"`
	NmOrganisasi string `json:"nm_organisasi"`
}

var (
	globalClient *RadiusClient
	once         sync.Once
)

// NewRadiusClient creates a new Radius API client
// Priority: Database (api_configs) > Environment Variables
func NewRadiusClient() (*RadiusClient, error) {
	var initErr error

	once.Do(func() {
		// Default from environment variables
		baseURL := os.Getenv("RADIUS_API_BASE_URL")
		appKey := os.Getenv("RADIUS_API_APP_KEY")
		username := os.Getenv("RADIUS_API_USERNAME")

		// Try to load from database (api_configs) first
		if svc := api_config.GetService(); svc != nil {
			dbConfig, err := svc.GetByAPICode("RADIUS")
			if err == nil && dbConfig != nil {
				baseURL = dbConfig.BaseURL
				log.Printf("📁 Using Radius base URL from database: %s", baseURL)

				// Try to get credentials from database
				creds, err := svc.GetCredentials("RADIUS")
				if err == nil && creds != nil {
					// Support both "app_key" and "password" field for flexibility
					if key, ok := creds["app_key"].(string); ok && key != "" {
						appKey = key
					} else if pwd, ok := creds["password"].(string); ok && pwd != "" {
						// Fallback to password field if app_key not found
						appKey = pwd
					}
					if user, ok := creds["username"].(string); ok && user != "" {
						username = user
					}
					log.Println("🔐 Using Radius credentials from database")
				}
			}
		}

		// Validate credentials
		if baseURL == "" || appKey == "" || username == "" {
			initErr = errors.New("Radius API credentials not configured (check database setting.api_configs or .env: RADIUS_API_BASE_URL, RADIUS_API_APP_KEY, RADIUS_API_USERNAME)")
			return
		}

		// Create HTTP client with TLS skip verify (self-signed cert)
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}

		globalClient = &RadiusClient{
			BaseURL:  strings.TrimRight(baseURL, "/"),
			AppKey:   appKey,
			Username: username,
			HTTPClient: &http.Client{
				Timeout:   60 * time.Second,
				Transport: tr,
			},
		}

		log.Printf("🌐 Radius API client initialized with base URL: %s", baseURL)

		// Get initial token
		if err := globalClient.GetToken(); err != nil {
			log.Printf("⚠️  Warning: Failed to get initial Radius token: %v", err)
		}
	})

	if globalClient == nil {
		if initErr != nil {
			return nil, initErr
		}
		return nil, errors.New("failed to initialize Radius client")
	}

	return globalClient, nil
}

// GetToken authenticates and retrieves token from Radius API
func (c *RadiusClient) GetToken() error {
	if c == nil {
		return errors.New("Radius client is nil")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Check if token is still valid (with 5 min buffer)
	if c.Token != "" && time.Now().Add(5*time.Minute).Before(c.TokenExpiry) {
		return nil
	}

	// Prepare JSON body
	authBody := fmt.Sprintf(`{"app_key":"%s","username":"%s"}`, c.AppKey, c.Username)

	authURL := c.BaseURL + "/auth/login"
	req, err := http.NewRequest("POST", authURL, strings.NewReader(authBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
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

	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !loginResp.Status || loginResp.Data.Token == "" {
		return fmt.Errorf("failed to get token: %s", loginResp.Message)
	}

	c.Token = loginResp.Data.Token

	// Parse expiry time
	if loginResp.WaktuExpired != "" {
		expiry, err := time.Parse("2006-01-02 15:04:05", loginResp.WaktuExpired)
		if err == nil {
			c.TokenExpiry = expiry
		} else {
			// Default 50 minutes from now
			c.TokenExpiry = time.Now().Add(50 * time.Minute)
		}
	} else {
		c.TokenExpiry = time.Now().Add(50 * time.Minute)
	}

	log.Println("✅ Radius API token obtained successfully")

	return nil
}

// GetUsers fetches SSO users from Radius API with pagination
func (c *RadiusClient) GetUsers(page, limit int) (*UsersResponse, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	url := fmt.Sprintf("%s/sso-radius/users?page=%d&limit=%d", c.BaseURL, page, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.Token)
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
		c.mu.Lock()
		c.Token = ""
		c.mu.Unlock()
		if err := c.GetToken(); err != nil {
			return nil, fmt.Errorf("failed to refresh token: %w", err)
		}
		return c.GetUsers(page, limit)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var usersResp UsersResponse
	if err := json.Unmarshal(body, &usersResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !usersResp.Success {
		return nil, fmt.Errorf("API error: %s", usersResp.Message)
	}

	log.Printf("📊 [Radius API] GetUsers(page=%d, limit=%d) -> returned %d records, total: %d",
		page, limit, len(usersResp.Data), usersResp.Meta.Total)

	return &usersResp, nil
}

// GetAllUsers fetches all SSO users with automatic pagination
func (c *RadiusClient) GetAllUsers() ([]SSOUser, error) {
	var allUsers []SSOUser
	page := 1
	limit := 1000 // Large batch size

	for {
		resp, err := c.GetUsers(page, limit)
		if err != nil {
			if len(allUsers) > 0 {
				log.Printf("⚠️  [Radius API] Error at page %d, returning %d records collected so far: %v", page, len(allUsers), err)
				return allUsers, nil
			}
			return nil, err
		}

		if len(resp.Data) == 0 {
			break
		}

		allUsers = append(allUsers, resp.Data...)

		if page >= resp.Meta.TotalPages {
			break
		}

		page++
	}

	log.Printf("📊 [Radius API] GetAllUsers -> total %d records", len(allUsers))
	return allUsers, nil
}

// GetStats fetches SSO statistics
func (c *RadiusClient) GetStats() (int, error) {
	resp, err := c.GetUsers(1, 1)
	if err != nil {
		return 0, err
	}
	return resp.Meta.Total, nil
}

// TestConnection tests the connection to Radius API
func (c *RadiusClient) TestConnection() error {
	return c.GetToken()
}

// ForceRefreshToken clears current token and gets new one
func (c *RadiusClient) ForceRefreshToken() error {
	c.mu.Lock()
	c.Token = ""
	c.mu.Unlock()
	return c.GetToken()
}

// IsAvailable checks if Radius API is available
func (c *RadiusClient) IsAvailable() bool {
	if c == nil {
		return false
	}
	err := c.GetToken()
	return err == nil
}
