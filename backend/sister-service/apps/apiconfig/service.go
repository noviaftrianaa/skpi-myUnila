package apiconfig

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"sister-service/pkg/crypto"
	"sister-service/pkg/timeutil"
)

type Service interface {
	GetAll() ([]APIConfigDTO, error)
	GetByAPICode(apiCode string) (*APIConfigDTO, error)
	GetCredentials(apiCode string) (map[string]interface{}, error)
	Create(req CreateAPIConfigRequest, createdBy string) (*APIConfigDTO, error)
	Update(id int, req UpdateAPIConfigRequest, updatedBy string) (*APIConfigDTO, error)
	Delete(id int, deletedBy string) error
	TestConnection(req TestConnectionRequest) (*TestConnectionResponse, error)
	GetAuditLogs(configID int) ([]APIConfigAuditLog, error)
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

// GetAll retrieves all API configs as DTOs (without credentials)
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

// GetByAPICode retrieves config by API code as DTO
func (s *service) GetByAPICode(apiCode string) (*APIConfigDTO, error) {
	config, err := s.repo.GetByAPICode(apiCode)
	if err != nil {
		return nil, err
	}

	dto := config.ToDTO()
	return &dto, nil
}

// GetCredentials retrieves decrypted credentials with fallback to environment
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

	// Decrypt credentials from database
	if config.EncryptedCredentials.Valid && config.EncryptedCredentials.String != "" {
		decrypted, err := s.encryptor.Decrypt(config.EncryptedCredentials.String)
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

// getCredentialsFromEnv retrieves credentials from environment variables
func (s *service) getCredentialsFromEnv(apiCode string) (map[string]interface{}, error) {
	switch strings.ToUpper(apiCode) {
	case "SISTER":
		return map[string]interface{}{
			"idpengguna": os.Getenv("SISTER_API_IDPENGGUNA"),
			"username":   os.Getenv("SISTER_API_USERNAME"),
			"password":   os.Getenv("SISTER_API_PASSWORD"),
		}, nil

	case "FEEDER":
		return map[string]interface{}{
			"act":      "GetToken",
			"username": os.Getenv("FEEDER_API_USERNAME"),
			"password": os.Getenv("FEEDER_API_PASSWORD"),
		}, nil

	default:
		return nil, fmt.Errorf("no environment fallback configured for %s", apiCode)
	}
}

// Create creates a new API config
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

	// Log audit
	s.logAudit(config.ID, config.APICode, "CREATE", nil, config, createdBy, "", "")

	dto := config.ToDTO()
	return &dto, nil
}

// Update updates an existing API config
func (s *service) Update(id int, req UpdateAPIConfigRequest, updatedBy string) (*APIConfigDTO, error) {
	// Get existing config
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

	// Log audit
	s.logAudit(existing.ID, existing.APICode, "UPDATE", nil, existing, updatedBy, "", "")

	dto := existing.ToDTO()
	return &dto, nil
}

// Delete soft deletes an API config
func (s *service) Delete(id int, deletedBy string) error {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(id, deletedBy); err != nil {
		return err
	}

	// Log audit
	s.logAudit(id, config.APICode, "DELETE", config, nil, deletedBy, "", "")

	return nil
}

// TestConnection tests connection to an API endpoint
func (s *service) TestConnection(req TestConnectionRequest) (*TestConnectionResponse, error) {
	startTime := timeutil.NowWIB()

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Build test request based on API type
	var httpReq *http.Request
	var err error

	// For now, just test basic connectivity
	httpReq, err = http.NewRequest("GET", req.BaseURL, nil)
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

		// Update test result in database if API code provided
		if req.APICode != "" {
			s.repo.UpdateTestResult(req.APICode, "failed", result.Message)
			s.logAudit(0, req.APICode, "TEST", nil, nil, "system", "", "")
		}

		return result, nil
	}
	defer resp.Body.Close()

	// Read response body
	body, _ := io.ReadAll(resp.Body)

	result := &TestConnectionResponse{
		Success:      resp.StatusCode >= 200 && resp.StatusCode < 300,
		Status:       "success",
		Message:      fmt.Sprintf("Connected successfully. Status: %d, Response time: %dms", resp.StatusCode, responseTime),
		ResponseTime: responseTime,
	}

	if !result.Success {
		result.Status = "failed"
		result.Message = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	// Update test result in database if API code provided
	if req.APICode != "" {
		s.repo.UpdateTestResult(req.APICode, result.Status, result.Message)
		s.logAudit(0, req.APICode, "TEST", nil, nil, "system", "", "")
	}

	return result, nil
}

// GetAuditLogs retrieves audit logs for a config
func (s *service) GetAuditLogs(configID int) ([]APIConfigAuditLog, error) {
	return s.repo.GetAuditLogs(configID, 50)
}

// logAudit logs changes to audit table
func (s *service) logAudit(configID int, apiCode, actionType string, oldConfig, newConfig *APIConfig, performedBy, ipAddress, userAgent string) {
	var oldValues, newValues sql.NullString

	if oldConfig != nil {
		old := map[string]interface{}{
			"api_name": oldConfig.APIName,
			"base_url": oldConfig.BaseURL,
			"is_active": oldConfig.IsActive,
		}
		oldJSON, _ := json.Marshal(old)
		oldValues = sql.NullString{String: string(oldJSON), Valid: true}
	}

	if newConfig != nil {
		new := map[string]interface{}{
			"api_name":  newConfig.APIName,
			"base_url":  newConfig.BaseURL,
			"is_active": newConfig.IsActive,
		}
		newJSON, _ := json.Marshal(new)
		newValues = sql.NullString{String: string(newJSON), Valid: true}
	}

	log := &APIConfigAuditLog{
		ConfigID:    configID,
		APICode:     apiCode,
		ActionType:  actionType,
		OldValues:   oldValues,
		NewValues:   newValues,
		PerformedBy: performedBy,
		IPAddress:   sql.NullString{String: ipAddress, Valid: ipAddress != ""},
		UserAgent:   sql.NullString{String: userAgent, Valid: userAgent != ""},
	}

	s.repo.LogAudit(log)
}