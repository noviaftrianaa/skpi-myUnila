package apiconfig

import (
	"database/sql"
	"time"
)

// APIConfig represents API configuration from setting.api_configs table
type APIConfig struct {
	ID                    int            `json:"id" db:"id"`
	APICode               string         `json:"api_code" db:"api_code"`
	APIName               string         `json:"api_name" db:"api_name"`
	APIDescription        sql.NullString `json:"api_description" db:"api_description"`
	BaseURL               string         `json:"base_url" db:"base_url"`
	AuthType              string         `json:"auth_type" db:"auth_type"`
	EncryptedCredentials  sql.NullString `json:"-" db:"encrypted_credentials"` // Never expose in JSON
	AdditionalHeaders     sql.NullString `json:"additional_headers" db:"additional_headers"`
	TimeoutSeconds        int            `json:"timeout_seconds" db:"timeout_seconds"`
	MaxRetries            int            `json:"max_retries" db:"max_retries"`
	RetryDelayMs          int            `json:"retry_delay_ms" db:"retry_delay_ms"`
	IsActive              bool           `json:"is_active" db:"is_active"`
	IsEncrypted           bool           `json:"is_encrypted" db:"is_encrypted"`
	UseEnvFallback        bool           `json:"use_env_fallback" db:"use_env_fallback"`
	LastTestedAt          sql.NullTime   `json:"last_tested_at" db:"last_tested_at"`
	LastTestStatus        sql.NullString `json:"last_test_status" db:"last_test_status"`
	LastTestMessage       sql.NullString `json:"last_test_message" db:"last_test_message"`
	CreatedBy             sql.NullString `json:"created_by" db:"created_by"`
	CreatedAt             time.Time      `json:"created_at" db:"created_at"`
	UpdatedBy             sql.NullString `json:"updated_by" db:"updated_by"`
	UpdatedAt             time.Time      `json:"updated_at" db:"updated_at"`
	DeletedAt             sql.NullTime   `json:"deleted_at" db:"deleted_at"`
	DeletedBy             sql.NullString `json:"deleted_by" db:"deleted_by"`
	Tags                  sql.NullString `json:"tags" db:"tags"`
	Notes                 sql.NullString `json:"notes" db:"notes"`
}

// APIConfigWithCredentials includes decrypted credentials (for internal use only)
type APIConfigWithCredentials struct {
	APIConfig
	Credentials map[string]interface{} `json:"credentials"`
}

// APIConfigDTO is the data transfer object for API/UI responses
type APIConfigDTO struct {
	ID                   int        `json:"id"`
	APICode              string     `json:"api_code"`
	APIName              string     `json:"api_name"`
	APIDescription       string     `json:"api_description"`
	BaseURL              string     `json:"base_url"`
	AuthType             string     `json:"auth_type"`
	HasCredentials       bool       `json:"has_credentials"`
	AdditionalHeaders    string     `json:"additional_headers"`
	TimeoutSeconds       int        `json:"timeout_seconds"`
	MaxRetries           int        `json:"max_retries"`
	RetryDelayMs         int        `json:"retry_delay_ms"`
	IsActive             bool       `json:"is_active"`
	UseEnvFallback       bool       `json:"use_env_fallback"`
	LastTestedAt         *time.Time `json:"last_tested_at"`
	LastTestStatus       string     `json:"last_test_status"`
	LastTestMessage      string     `json:"last_test_message"`
	CreatedBy            string     `json:"created_by"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedBy            string     `json:"updated_by"`
	UpdatedAt            time.Time  `json:"updated_at"`
	Tags                 string     `json:"tags"`
	Notes                string     `json:"notes"`
	CredentialSource     string     `json:"credential_source"` // 'database', 'environment', 'not_configured'
}

// CreateAPIConfigRequest represents request to create new config
type CreateAPIConfigRequest struct {
	APICode           string                 `json:"api_code" binding:"required"`
	APIName           string                 `json:"api_name" binding:"required"`
	APIDescription    string                 `json:"api_description"`
	BaseURL           string                 `json:"base_url" binding:"required,url"`
	AuthType          string                 `json:"auth_type" binding:"required"`
	Credentials       map[string]interface{} `json:"credentials"`
	AdditionalHeaders string                 `json:"additional_headers"`
	TimeoutSeconds    int                    `json:"timeout_seconds"`
	MaxRetries        int                    `json:"max_retries"`
	RetryDelayMs      int                    `json:"retry_delay_ms"`
	IsActive          bool                   `json:"is_active"`
	UseEnvFallback    bool                   `json:"use_env_fallback"`
	Tags              string                 `json:"tags"`
	Notes             string                 `json:"notes"`
}

// UpdateAPIConfigRequest represents request to update existing config
type UpdateAPIConfigRequest struct {
	APIName           string                 `json:"api_name"`
	APIDescription    string                 `json:"api_description"`
	BaseURL           string                 `json:"base_url" binding:"omitempty,url"`
	AuthType          string                 `json:"auth_type"`
	Credentials       map[string]interface{} `json:"credentials"`
	AdditionalHeaders string                 `json:"additional_headers"`
	TimeoutSeconds    int                    `json:"timeout_seconds"`
	MaxRetries        int                    `json:"max_retries"`
	RetryDelayMs      int                    `json:"retry_delay_ms"`
	IsActive          *bool                  `json:"is_active"`
	UseEnvFallback    *bool                  `json:"use_env_fallback"`
	Tags              string                 `json:"tags"`
	Notes             string                 `json:"notes"`
}

// TestConnectionRequest represents request to test API connection
type TestConnectionRequest struct {
	APICode     string                 `json:"api_code"`
	BaseURL     string                 `json:"base_url" binding:"required,url"`
	Credentials map[string]interface{} `json:"credentials"`
}

// TestConnectionResponse represents response from connection test
type TestConnectionResponse struct {
	Success      bool   `json:"success"`
	Status       string `json:"status"`
	Message      string `json:"message"`
	ResponseTime int64  `json:"response_time_ms"`
}

// APIConfigAuditLog represents audit trail for config changes
type APIConfigAuditLog struct {
	ID          int64          `json:"id" db:"id"`
	ConfigID    int            `json:"config_id" db:"config_id"`
	APICode     string         `json:"api_code" db:"api_code"`
	ActionType  string         `json:"action_type" db:"action_type"`
	OldValues   sql.NullString `json:"old_values" db:"old_values"`
	NewValues   sql.NullString `json:"new_values" db:"new_values"`
	PerformedBy string         `json:"performed_by" db:"performed_by"`
	IPAddress   sql.NullString `json:"ip_address" db:"ip_address"`
	UserAgent   sql.NullString `json:"user_agent" db:"user_agent"`
	PerformedAt time.Time      `json:"performed_at" db:"performed_at"`
	Notes       sql.NullString `json:"notes" db:"notes"`
}

// ToDTO converts APIConfig to APIConfigDTO
func (c *APIConfig) ToDTO() APIConfigDTO {
	dto := APIConfigDTO{
		ID:             c.ID,
		APICode:        c.APICode,
		APIName:        c.APIName,
		BaseURL:        c.BaseURL,
		AuthType:       c.AuthType,
		HasCredentials: c.EncryptedCredentials.Valid && c.EncryptedCredentials.String != "",
		TimeoutSeconds: c.TimeoutSeconds,
		MaxRetries:     c.MaxRetries,
		RetryDelayMs:   c.RetryDelayMs,
		IsActive:       c.IsActive,
		UseEnvFallback: c.UseEnvFallback,
		CreatedAt:      c.CreatedAt,
		UpdatedAt:      c.UpdatedAt,
	}

	if c.APIDescription.Valid {
		dto.APIDescription = c.APIDescription.String
	}
	if c.AdditionalHeaders.Valid {
		dto.AdditionalHeaders = c.AdditionalHeaders.String
	}
	if c.LastTestedAt.Valid {
		dto.LastTestedAt = &c.LastTestedAt.Time
	}
	if c.LastTestStatus.Valid {
		dto.LastTestStatus = c.LastTestStatus.String
	}
	if c.LastTestMessage.Valid {
		dto.LastTestMessage = c.LastTestMessage.String
	}
	if c.CreatedBy.Valid {
		dto.CreatedBy = c.CreatedBy.String
	}
	if c.UpdatedBy.Valid {
		dto.UpdatedBy = c.UpdatedBy.String
	}
	if c.Tags.Valid {
		dto.Tags = c.Tags.String
	}
	if c.Notes.Valid {
		dto.Notes = c.Notes.String
	}

	// Determine credential source
	if dto.HasCredentials {
		dto.CredentialSource = "database"
	} else if c.UseEnvFallback {
		dto.CredentialSource = "environment"
	} else {
		dto.CredentialSource = "not_configured"
	}

	return dto
}