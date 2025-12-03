package api_config

import (
	"database/sql"
	"time"
)

// APIConfig represents the database model
type APIConfig struct {
	ID                   int            `db:"id"`
	APICode              string         `db:"api_code"`
	APIName              string         `db:"api_name"`
	APIDescription       sql.NullString `db:"api_description"`
	BaseURL              string         `db:"base_url"`
	AuthType             string         `db:"auth_type"`
	EncryptedCredentials sql.NullString `db:"encrypted_credentials"`
	AdditionalHeaders    sql.NullString `db:"additional_headers"`
	TimeoutSeconds       int            `db:"timeout_seconds"`
	MaxRetries           int            `db:"max_retries"`
	RetryDelayMs         int            `db:"retry_delay_ms"`
	IsActive             bool           `db:"is_active"`
	IsEncrypted          bool           `db:"is_encrypted"`
	UseEnvFallback       bool           `db:"use_env_fallback"`
	LastTestedAt         sql.NullTime   `db:"last_tested_at"`
	LastTestStatus       sql.NullString `db:"last_test_status"`
	LastTestMessage      sql.NullString `db:"last_test_message"`
	CreatedAt            time.Time      `db:"created_at"`
	UpdatedAt            time.Time      `db:"updated_at"`
	CreatedBy            sql.NullString `db:"created_by"`
	UpdatedBy            sql.NullString `db:"updated_by"`
	DeletedAt            sql.NullTime   `db:"deleted_at"`
	DeletedBy            sql.NullString `db:"deleted_by"`
	Tags                 sql.NullString `db:"tags"`
	Notes                sql.NullString `db:"notes"`
}

// APIConfigDTO is the data transfer object (without sensitive data)
type APIConfigDTO struct {
	ID                int       `json:"id"`
	APICode           string    `json:"api_code"`
	APIName           string    `json:"api_name"`
	APIDescription    string    `json:"api_description,omitempty"`
	BaseURL           string    `json:"base_url"`
	AuthType          string    `json:"auth_type"`
	HasCredentials    bool      `json:"has_credentials"`
	AdditionalHeaders string    `json:"additional_headers,omitempty"`
	TimeoutSeconds    int       `json:"timeout_seconds"`
	MaxRetries        int       `json:"max_retries"`
	RetryDelayMs      int       `json:"retry_delay_ms"`
	IsActive          bool      `json:"is_active"`
	UseEnvFallback    bool      `json:"use_env_fallback"`
	LastTestedAt      string    `json:"last_tested_at,omitempty"`
	LastTestStatus    string    `json:"last_test_status,omitempty"`
	LastTestMessage   string    `json:"last_test_message,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	Tags              string    `json:"tags,omitempty"`
	Notes             string    `json:"notes,omitempty"`
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
		dto.LastTestedAt = c.LastTestedAt.Time.Format(time.RFC3339)
	}
	if c.LastTestStatus.Valid {
		dto.LastTestStatus = c.LastTestStatus.String
	}
	if c.LastTestMessage.Valid {
		dto.LastTestMessage = c.LastTestMessage.String
	}
	if c.Tags.Valid {
		dto.Tags = c.Tags.String
	}
	if c.Notes.Valid {
		dto.Notes = c.Notes.String
	}

	return dto
}

// CreateAPIConfigRequest is the request for creating a new API config
type CreateAPIConfigRequest struct {
	APICode           string                 `json:"api_code"`
	APIName           string                 `json:"api_name"`
	APIDescription    string                 `json:"api_description,omitempty"`
	BaseURL           string                 `json:"base_url"`
	AuthType          string                 `json:"auth_type"`
	Credentials       map[string]interface{} `json:"credentials,omitempty"`
	AdditionalHeaders string                 `json:"additional_headers,omitempty"`
	TimeoutSeconds    int                    `json:"timeout_seconds,omitempty"`
	MaxRetries        int                    `json:"max_retries,omitempty"`
	RetryDelayMs      int                    `json:"retry_delay_ms,omitempty"`
	IsActive          bool                   `json:"is_active"`
	UseEnvFallback    bool                   `json:"use_env_fallback"`
	Tags              string                 `json:"tags,omitempty"`
	Notes             string                 `json:"notes,omitempty"`
}

// UpdateAPIConfigRequest is the request for updating an API config
type UpdateAPIConfigRequest struct {
	APIName           string                 `json:"api_name,omitempty"`
	APIDescription    string                 `json:"api_description,omitempty"`
	BaseURL           string                 `json:"base_url,omitempty"`
	AuthType          string                 `json:"auth_type,omitempty"`
	Credentials       map[string]interface{} `json:"credentials,omitempty"`
	AdditionalHeaders string                 `json:"additional_headers,omitempty"`
	TimeoutSeconds    int                    `json:"timeout_seconds,omitempty"`
	MaxRetries        int                    `json:"max_retries,omitempty"`
	RetryDelayMs      int                    `json:"retry_delay_ms,omitempty"`
	IsActive          *bool                  `json:"is_active,omitempty"`
	UseEnvFallback    *bool                  `json:"use_env_fallback,omitempty"`
	Tags              string                 `json:"tags,omitempty"`
	Notes             string                 `json:"notes,omitempty"`
}

// TestConnectionRequest is the request for testing API connection
type TestConnectionRequest struct {
	APICode string `json:"api_code,omitempty"`
	BaseURL string `json:"base_url"`
}

// TestConnectionResponse is the response for test connection
type TestConnectionResponse struct {
	Success      bool   `json:"success"`
	Status       string `json:"status"`
	Message      string `json:"message"`
	ResponseTime int64  `json:"response_time_ms,omitempty"`
}

// APIConfigWithCredentials includes decrypted credentials
type APIConfigWithCredentials struct {
	APIConfig
	Credentials map[string]interface{} `json:"credentials,omitempty"`
}
