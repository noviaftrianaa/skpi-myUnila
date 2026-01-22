package api_config

import (
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetByAPICode(apiCode string) (*APIConfig, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetByAPICode(apiCode string) (*APIConfig, error) {
	var config APIConfig
	query := `
		SELECT id, api_code, api_name, api_description, base_url, auth_type,
			   encrypted_credentials, additional_headers, timeout_seconds,
			   max_retries, retry_delay_ms, is_active, is_encrypted,
			   use_env_fallback, last_tested_at, last_test_status, last_test_message,
			   created_at, updated_at, created_by, updated_by, tags, notes
		FROM setting.api_configs
		WHERE api_code = @p1 AND deleted_at IS NULL
	`
	err := r.db.Get(&config, query, apiCode)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("api config with code %s not found", apiCode)
		}
		return nil, fmt.Errorf("failed to get api config: %v", err)
	}
	return &config, nil
}
