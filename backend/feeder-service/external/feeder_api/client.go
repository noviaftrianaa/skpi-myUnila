package feeder_api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/apiconfig"
)

type FeederClient struct {
	BaseURL    string
	Username   string
	Password   string
	Token      string
	HTTPClient *http.Client
	mu         sync.RWMutex
}

type FeederRequest struct {
	Act    string                 `json:"act"`
	Filter string                 `json:"filter,omitempty"`
	Limit  int                    `json:"limit,omitempty"`
	Offset int                    `json:"offset,omitempty"`
	Order  string                 `json:"order,omitempty"`
	Token  string                 `json:"token,omitempty"`
	Data   map[string]interface{} `json:"data,omitempty"`
}

type FeederResponse struct {
	ErrorCode    int                      `json:"error_code"`
	ErrorDesc    string                   `json:"error_desc"`
	Data         interface{}              `json:"data"`
	DataResponse []map[string]interface{} `json:"data,omitempty"`
}

var (
	globalClient *FeederClient
	once         sync.Once
)

// NewFeederClient creates a new Feeder API client with credentials from database or environment
func NewFeederClient() (*FeederClient, error) {
	var initErr error

	once.Do(func() {
		// Try to load config from database first
		baseURL := os.Getenv("FEEDER_API_BASE_URL")
		username := os.Getenv("FEEDER_API_USERNAME")
		password := os.Getenv("FEEDER_API_PASSWORD")

		// Try loading from database (apiconfig)
		if svc := apiconfig.GetService(); svc != nil {
			config, err := svc.GetByAPICode("feeder_api")
			if err == nil && config != nil {
				// Use database config
				baseURL = config.BaseURL

				// Try to get credentials (will return env fallback if DB not set)
				creds, err := svc.GetCredentials("feeder_api")
				if err == nil && creds != nil {
					if user, ok := creds["username"].(string); ok {
						username = user
					}
					if pass, ok := creds["password"].(string); ok {
						password = pass
					}
				}
			}
		}

		// Validate we have required credentials
		if baseURL == "" || username == "" || password == "" {
			initErr = errors.New("feeder API credentials not configured (check database setting.api_configs or .env)")
			return
		}

		globalClient = &FeederClient{
			BaseURL:  baseURL,
			Username: username,
			Password: password,
			HTTPClient: &http.Client{
				Timeout: 120 * time.Second,
			},
		}

		// Get token on initialization
		if err := globalClient.GetToken(); err != nil {
			initErr = fmt.Errorf("failed to get initial token: %w", err)
		}
	})

	if initErr != nil {
		return nil, initErr
	}

	return globalClient, nil
}

// GetToken gets authentication token from Feeder API
func (c *FeederClient) GetToken() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	req := FeederRequest{
		Act: "GetToken",
		Data: map[string]interface{}{
			"username": c.Username,
			"password": c.Password,
		},
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return fmt.Errorf("failed to get token: %w", err)
	}

	if resp.ErrorCode != 0 {
		return fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
	}

	// Extract token from response
	if dataMap, ok := resp.Data.(map[string]interface{}); ok {
		if token, ok := dataMap["token"].(string); ok {
			c.Token = token
			return nil
		}
	}

	return errors.New("token not found in response")
}

// GetReferensi fetches reference data from Feeder API
func (c *FeederClient) GetReferensi(table string, filter string, limit int, offset int) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetRecord",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return nil, fmt.Errorf("failed to get referensi: %w", err)
	}

	if resp.ErrorCode != 0 {
		// Token expired, retry with new token
		if resp.ErrorCode == 100 || resp.ErrorDesc == "Token tidak valid" {
			if err := c.GetToken(); err != nil {
				return nil, err
			}
			// Retry request with new token
			req.Token = c.Token
			if err := c.doRequest(req, &resp); err != nil {
				return nil, err
			}
		} else {
			return nil, fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
		}
	}

	// Parse response data
	if dataList, ok := resp.Data.([]interface{}); ok {
		result := make([]map[string]interface{}, 0, len(dataList))
		for _, item := range dataList {
			if record, ok := item.(map[string]interface{}); ok {
				result = append(result, record)
			}
		}
		return result, nil
	}

	return nil, errors.New("invalid response data format")
}

// GetMahasiswa fetches student data from Feeder API
func (c *FeederClient) GetMahasiswa(filter string, limit int, offset int) ([]map[string]interface{}, error) {
	return c.GetRecordTable("mahasiswa", filter, limit, offset)
}

// GetRecordTable fetches data from specific table
func (c *FeederClient) GetRecordTable(table string, filter string, limit int, offset int) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetRecordset",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	// Add table name to data
	req.Data = map[string]interface{}{
		"table": table,
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return nil, fmt.Errorf("failed to get records: %w", err)
	}

	if resp.ErrorCode != 0 {
		// Token expired, retry with new token
		if resp.ErrorCode == 100 || resp.ErrorDesc == "Token tidak valid" {
			if err := c.GetToken(); err != nil {
				return nil, err
			}
			// Retry request with new token
			req.Token = c.Token
			if err := c.doRequest(req, &resp); err != nil {
				return nil, err
			}
		} else {
			return nil, fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
		}
	}

	// Parse response data
	if dataList, ok := resp.Data.([]interface{}); ok {
		result := make([]map[string]interface{}, 0, len(dataList))
		for _, item := range dataList {
			if record, ok := item.(map[string]interface{}); ok {
				result = append(result, record)
			}
		}
		return result, nil
	}

	return nil, errors.New("invalid response data format")
}

// doRequest performs HTTP request to Feeder API
func (c *FeederClient) doRequest(req FeederRequest, result interface{}) error {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
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

	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

// TestConnection tests the connection to Feeder API
func (c *FeederClient) TestConnection() error {
	return c.GetToken()
}
