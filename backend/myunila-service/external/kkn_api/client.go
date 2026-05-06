package kkn_api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/myunila/myunila-service/apps/api_config"
)

type KKNClient struct {
	BaseURL    string
	Username   string
	Password   string
	Token      string
	HTTPClient *http.Client
	mu         sync.RWMutex
}

type AuthResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		Token     string `json:"token"`
		ExpiresAt string `json:"expires_at"`
	} `json:"data"`
}

type SyncResponse struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Data    []map[string]interface{} `json:"data"`
	Meta    *PaginationMeta          `json:"meta"`
}

type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

type TablesResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		Tables []string `json:"tables"`
		Total  int      `json:"total"`
	} `json:"data"`
}

type StatsResponse struct {
	Success bool `json:"success"`
	Data    []struct {
		Table string `json:"table"`
		Count int    `json:"count"`
	} `json:"data"`
}

var (
	globalClient *KKNClient
	once         sync.Once
)

func NewKKNClient() (*KKNClient, error) {
	var initErr error

	once.Do(func() {
		var baseURL, username, password string

		if svc := api_config.GetService(); svc != nil {
			dbConfig, err := svc.GetByAPICode("KKN_WS_API")
			if err == nil && dbConfig != nil {
				baseURL = dbConfig.BaseURL
				log.Printf("📁 Using KKN base URL from database: %s", baseURL)

				creds, err := svc.GetCredentials("KKN_WS_API")
				if err == nil && creds != nil {
					if user, ok := creds["username"].(string); ok {
						username = user
					}
					if pass, ok := creds["password"].(string); ok {
						password = pass
					}
					log.Println("🔐 Using KKN credentials from database")
				}
			}
		}

		if baseURL == "" || username == "" || password == "" {
			initErr = errors.New("KKN API credentials not configured (check setting.api_configs for KKN_WS_API)")
			return
		}

		globalClient = &KKNClient{
			BaseURL:  baseURL,
			Username: username,
			Password: password,
			HTTPClient: &http.Client{
				Timeout: 30 * time.Second,
			},
		}

		if err := globalClient.Login(); err != nil {
			log.Printf("⚠️  KKN API initial login failed: %v", err)
		} else {
			log.Println("✅ KKN API client authenticated")
		}
	})

	if initErr != nil {
		return nil, initErr
	}
	return globalClient, nil
}

func (c *KKNClient) Login() error {
	body, _ := json.Marshal(map[string]string{
		"username": c.Username,
		"password": c.Password,
	})

	resp, err := c.HTTPClient.Post(c.BaseURL+"/auth/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("login request failed: %w", err)
	}
	defer resp.Body.Close()

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return fmt.Errorf("login decode failed: %w", err)
	}

	if !authResp.Success || authResp.Data.Token == "" {
		return fmt.Errorf("login failed: %s", authResp.Message)
	}

	c.mu.Lock()
	c.Token = authResp.Data.Token
	c.mu.Unlock()

	return nil
}

func (c *KKNClient) doAuthRequest(method, url string) ([]byte, error) {
	c.mu.RLock()
	token := c.Token
	c.mu.RUnlock()

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		if err := c.Login(); err != nil {
			return nil, fmt.Errorf("re-login failed: %w", err)
		}
		c.mu.RLock()
		req.Header.Set("Authorization", "Bearer "+c.Token)
		c.mu.RUnlock()
		resp, err = c.HTTPClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
	}

	return io.ReadAll(resp.Body)
}

func (c *KKNClient) GetTables() ([]string, error) {
	data, err := c.doAuthRequest("GET", c.BaseURL+"/sync/tables")
	if err != nil {
		return nil, err
	}
	var resp TablesResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, err
	}
	return resp.Data.Tables, nil
}

func (c *KKNClient) GetStats() ([]map[string]interface{}, error) {
	data, err := c.doAuthRequest("GET", c.BaseURL+"/sync/stats")
	if err != nil {
		return nil, err
	}
	var resp SyncResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, err
	}
	return resp.Data, nil
}

func (c *KKNClient) GetData(table string, page, perPage int) ([]map[string]interface{}, *PaginationMeta, error) {
	url := fmt.Sprintf("%s/sync/%s?page=%d&per_page=%d", c.BaseURL, table, page, perPage)
	data, err := c.doAuthRequest("GET", url)
	if err != nil {
		return nil, nil, err
	}
	var resp SyncResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, nil, err
	}
	if !resp.Success {
		return nil, nil, fmt.Errorf("API error: %s", resp.Message)
	}
	return resp.Data, resp.Meta, nil
}

func (c *KKNClient) GetAllData(table string, batchSize int) ([]map[string]interface{}, error) {
	var allData []map[string]interface{}
	page := 1
	for {
		data, meta, err := c.GetData(table, page, batchSize)
		if err != nil {
			return allData, err
		}
		allData = append(allData, data...)
		if meta == nil || page >= meta.TotalPages {
			break
		}
		page++
	}
	return allData, nil
}

func (c *KKNClient) TestConnection() error {
	data, err := c.doAuthRequest("GET", c.BaseURL+"/sync/tables")
	if err != nil {
		return err
	}
	var resp TablesResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return err
	}
	if !resp.Success {
		return fmt.Errorf("test failed: tables endpoint returned success=false")
	}
	return nil
}
