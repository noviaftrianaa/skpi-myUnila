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
