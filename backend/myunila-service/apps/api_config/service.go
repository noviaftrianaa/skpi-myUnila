package api_config

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/myunila/myunila-service/pkg/crypto"
)

type Service interface {
	GetAll() ([]APIConfigDTO, error)
	GetByAPICode(apiCode string) (*APIConfigDTO, error)
	GetCredentials(apiCode string) (map[string]interface{}, error)
	Create(req CreateAPIConfigRequest, createdBy string) (*APIConfigDTO, error)
	Update(id int, req UpdateAPIConfigRequest, updatedBy string) (*APIConfigDTO, error)
	Delete(id int, deletedBy string) error
	TestConnection(req TestConnectionRequest) (*TestConnectionResponse, error)
}

type service struct {
	repo      Repository
	encryptor *crypto.EncryptionService
}

func NewService(repo Repository, encryptor *crypto.EncryptionService) Service {
	return &service{
		repo:      repo,
		encryptor: encryptor,
	}
}

func (s *service) GetAll() ([]APIConfigDTO, error) {
	configs, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	dtos := make([]APIConfigDTO, len(configs))
	for i, config := range configs {
		dtos[i] = config.ToDTO()
	}

	return dtos, nil
}

func (s *service) GetByAPICode(apiCode string) (*APIConfigDTO, error) {
	config, err := s.repo.GetByAPICode(apiCode)
	if err != nil {
		return nil, err
	}

	dto := config.ToDTO()
	return &dto, nil
}

func (s *service) GetCredentials(apiCode string) (map[string]interface{}, error) {
	config, err := s.repo.GetByAPICode(apiCode)
	if err != nil {
		// If not found in database and it's a known API, try environment fallback
		if strings.Contains(err.Error(), "not found") {
			return s.getCredentialsFromEnv(apiCode)
		}
		return nil, err
	}

	// If config exists but has no credentials and fallback is enabled
	if (!config.EncryptedCredentials.Valid || config.EncryptedCredentials.String == "") && config.UseEnvFallback {
		return s.getCredentialsFromEnv(apiCode)
	}

	if config.EncryptedCredentials.Valid && config.EncryptedCredentials.String != "" {
		raw := config.EncryptedCredentials.String

		if !config.IsEncrypted {
			var credentials map[string]interface{}
			if err := json.Unmarshal([]byte(raw), &credentials); err != nil {
				return nil, fmt.Errorf("failed to parse credentials: %v", err)
			}
			return credentials, nil
		}

		decrypted, err := s.encryptor.Decrypt(raw)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt credentials: %v", err)
		}

		var credentials map[string]interface{}
		if err := json.Unmarshal([]byte(decrypted), &credentials); err != nil {
			return nil, fmt.Errorf("failed to parse credentials: %v", err)
		}

		return credentials, nil
	}

	return nil, fmt.Errorf("no credentials configured for %s", apiCode)
}

func (s *service) getCredentialsFromEnv(apiCode string) (map[string]interface{}, error) {
	switch strings.ToUpper(apiCode) {
	case "SIKEP":
		return map[string]interface{}{
			"username": os.Getenv("SIKEP_API_USERNAME"),
			"password": os.Getenv("SIKEP_API_PASSWORD"),
		}, nil

	default:
		return nil, fmt.Errorf("no environment fallback configured for %s", apiCode)
	}
}

func (s *service) Create(req CreateAPIConfigRequest, createdBy string) (*APIConfigDTO, error) {
	// Encrypt credentials if provided
	var encryptedCreds sql.NullString
	if req.Credentials != nil && len(req.Credentials) > 0 {
		credsJSON, err := json.Marshal(req.Credentials)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal credentials: %v", err)
		}

		encrypted, err := s.encryptor.Encrypt(string(credsJSON))
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt credentials: %v", err)
		}

		encryptedCreds = sql.NullString{String: encrypted, Valid: true}
	}

	// Set defaults
	if req.TimeoutSeconds == 0 {
		req.TimeoutSeconds = 30
	}
	if req.MaxRetries == 0 {
		req.MaxRetries = 3
	}
	if req.RetryDelayMs == 0 {
		req.RetryDelayMs = 1000
	}

	config := &APIConfig{
		APICode:              req.APICode,
		APIName:              req.APIName,
		APIDescription:       sql.NullString{String: req.APIDescription, Valid: req.APIDescription != ""},
		BaseURL:              req.BaseURL,
		AuthType:             req.AuthType,
		EncryptedCredentials: encryptedCreds,
		AdditionalHeaders:    sql.NullString{String: req.AdditionalHeaders, Valid: req.AdditionalHeaders != ""},
		TimeoutSeconds:       req.TimeoutSeconds,
		MaxRetries:           req.MaxRetries,
		RetryDelayMs:         req.RetryDelayMs,
		IsActive:             req.IsActive,
		IsEncrypted:          encryptedCreds.Valid,
		UseEnvFallback:       req.UseEnvFallback,
		CreatedBy:            sql.NullString{String: createdBy, Valid: true},
		Tags:                 sql.NullString{String: req.Tags, Valid: req.Tags != ""},
		Notes:                sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	}

	if err := s.repo.Create(config); err != nil {
		return nil, err
	}

	dto := config.ToDTO()
	return &dto, nil
}

func (s *service) Update(id int, req UpdateAPIConfigRequest, updatedBy string) (*APIConfigDTO, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.APIName != "" {
		existing.APIName = req.APIName
	}
	if req.APIDescription != "" {
		existing.APIDescription = sql.NullString{String: req.APIDescription, Valid: true}
	}
	if req.BaseURL != "" {
		existing.BaseURL = req.BaseURL
	}
	if req.AuthType != "" {
		existing.AuthType = req.AuthType
	}
	if req.AdditionalHeaders != "" {
		existing.AdditionalHeaders = sql.NullString{String: req.AdditionalHeaders, Valid: true}
	}
	if req.TimeoutSeconds > 0 {
		existing.TimeoutSeconds = req.TimeoutSeconds
	}
	if req.MaxRetries > 0 {
		existing.MaxRetries = req.MaxRetries
	}
	if req.RetryDelayMs > 0 {
		existing.RetryDelayMs = req.RetryDelayMs
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}
	if req.UseEnvFallback != nil {
		existing.UseEnvFallback = *req.UseEnvFallback
	}
	if req.Tags != "" {
		existing.Tags = sql.NullString{String: req.Tags, Valid: true}
	}
	if req.Notes != "" {
		existing.Notes = sql.NullString{String: req.Notes, Valid: true}
	}

	// Update credentials if provided
	if req.Credentials != nil && len(req.Credentials) > 0 {
		credsJSON, err := json.Marshal(req.Credentials)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal credentials: %v", err)
		}

		encrypted, err := s.encryptor.Encrypt(string(credsJSON))
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt credentials: %v", err)
		}

		existing.EncryptedCredentials = sql.NullString{String: encrypted, Valid: true}
		existing.IsEncrypted = true
	}

	existing.UpdatedBy = sql.NullString{String: updatedBy, Valid: true}

	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}

	dto := existing.ToDTO()
	return &dto, nil
}

func (s *service) Delete(id int, deletedBy string) error {
	return s.repo.Delete(id, deletedBy)
}

// Global service instance for external packages to use
var globalService Service

// SetService sets the global api_config service instance
func SetService(s Service) {
	globalService = s
}

// GetService returns the global api_config service instance
func GetService() Service {
	return globalService
}

// GetAPIConfigByCode is a helper function for external packages
func GetAPIConfigByCode(apiCode string) (*APIConfigDTO, error) {
	if globalService == nil {
		return nil, fmt.Errorf("api_config service not initialized")
	}
	return globalService.GetByAPICode(apiCode)
}

// GetAPICredentials is a helper function for external packages
func GetAPICredentials(apiCode string) (map[string]interface{}, error) {
	if globalService == nil {
		return nil, fmt.Errorf("api_config service not initialized")
	}
	return globalService.GetCredentials(apiCode)
}

func (s *service) TestConnection(req TestConnectionRequest) (*TestConnectionResponse, error) {
	startTime := time.Now()

	// Skip SSL certificate verification for self-signed certificates
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{
		Timeout:   30 * time.Second,
		Transport: tr,
	}

	httpReq, err := http.NewRequest("GET", req.BaseURL, nil)
	if err != nil {
		return &TestConnectionResponse{
			Success: false,
			Status:  "failed",
			Message: fmt.Sprintf("Failed to create request: %v", err),
		}, nil
	}

	resp, err := client.Do(httpReq)
	responseTime := time.Since(startTime).Milliseconds()

	if err != nil {
		result := &TestConnectionResponse{
			Success:      false,
			Status:       "failed",
			Message:      fmt.Sprintf("Connection failed: %v", err),
			ResponseTime: responseTime,
		}

		if req.APICode != "" {
			s.repo.UpdateTestResult(req.APICode, "failed", result.Message)
		}

		return result, nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// Connection is successful if we get ANY response from the server
	result := &TestConnectionResponse{
		Success:      true,
		Status:       "success",
		Message:      fmt.Sprintf("Connected successfully. Status: %d, Response time: %dms", resp.StatusCode, responseTime),
		ResponseTime: responseTime,
	}

	// Add note for non-2xx responses
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		result.Message = fmt.Sprintf("Server reachable (HTTP %d). Response time: %dms. Note: Base URL may require specific endpoint path.", resp.StatusCode, responseTime)
		bodyStr := string(body)
		if len(bodyStr) > 200 {
			bodyStr = bodyStr[:200] + "..."
		}
		if !strings.Contains(bodyStr, "<!DOCTYPE") && !strings.Contains(bodyStr, "<html") {
			result.Message += fmt.Sprintf(" Response: %s", bodyStr)
		}
	}

	if req.APICode != "" {
		s.repo.UpdateTestResult(req.APICode, result.Status, result.Message)
	}

	return result, nil
}
