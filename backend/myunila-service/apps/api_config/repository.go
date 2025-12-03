package api_config

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetAll() ([]APIConfig, error)
	GetByID(id int) (*APIConfig, error)
	GetByAPICode(apiCode string) (*APIConfig, error)
	Create(config *APIConfig) error
	Update(config *APIConfig) error
	Delete(id int, deletedBy string) error
	UpdateTestResult(apiCode, status, message string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll() ([]APIConfig, error) {
	var configs []APIConfig
	query := `
		SELECT id, api_code, api_name, api_description, base_url, auth_type,
			   encrypted_credentials, additional_headers, timeout_seconds,
			   max_retries, retry_delay_ms, is_active, is_encrypted,
			   use_env_fallback, last_tested_at, last_test_status, last_test_message,
			   created_at, updated_at, created_by, updated_by, tags, notes
		FROM setting.api_configs
		WHERE deleted_at IS NULL
		ORDER BY api_name ASC
	`
	err := r.db.Select(&configs, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all api configs: %v", err)
	}
	return configs, nil
}

func (r *repository) GetByID(id int) (*APIConfig, error) {
	var config APIConfig
	query := `
		SELECT id, api_code, api_name, api_description, base_url, auth_type,
			   encrypted_credentials, additional_headers, timeout_seconds,
			   max_retries, retry_delay_ms, is_active, is_encrypted,
			   use_env_fallback, last_tested_at, last_test_status, last_test_message,
			   created_at, updated_at, created_by, updated_by, tags, notes
		FROM setting.api_configs
		WHERE id = @p1 AND deleted_at IS NULL
	`
	err := r.db.Get(&config, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("api config with id %d not found", id)
		}
		return nil, fmt.Errorf("failed to get api config: %v", err)
	}
	return &config, nil
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

func (r *repository) Create(config *APIConfig) error {
	query := `
		INSERT INTO setting.api_configs (
			api_code, api_name, api_description, base_url, auth_type,
			encrypted_credentials, additional_headers, timeout_seconds,
			max_retries, retry_delay_ms, is_active, is_encrypted,
			use_env_fallback, created_by, tags, notes
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14, @p15, @p16
		);
		SELECT SCOPE_IDENTITY();
	`

	var id int
	err := r.db.QueryRow(
		query,
		config.APICode,
		config.APIName,
		config.APIDescription,
		config.BaseURL,
		config.AuthType,
		config.EncryptedCredentials,
		config.AdditionalHeaders,
		config.TimeoutSeconds,
		config.MaxRetries,
		config.RetryDelayMs,
		config.IsActive,
		config.IsEncrypted,
		config.UseEnvFallback,
		config.CreatedBy,
		config.Tags,
		config.Notes,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create api config: %v", err)
	}

	config.ID = id
	return nil
}

func (r *repository) Update(config *APIConfig) error {
	query := `
		UPDATE setting.api_configs SET
			api_name = @p1,
			api_description = @p2,
			base_url = @p3,
			auth_type = @p4,
			encrypted_credentials = @p5,
			additional_headers = @p6,
			timeout_seconds = @p7,
			max_retries = @p8,
			retry_delay_ms = @p9,
			is_active = @p10,
			is_encrypted = @p11,
			use_env_fallback = @p12,
			updated_by = @p13,
			updated_at = GETDATE(),
			tags = @p14,
			notes = @p15
		WHERE id = @p16 AND deleted_at IS NULL
	`

	_, err := r.db.Exec(
		query,
		config.APIName,
		config.APIDescription,
		config.BaseURL,
		config.AuthType,
		config.EncryptedCredentials,
		config.AdditionalHeaders,
		config.TimeoutSeconds,
		config.MaxRetries,
		config.RetryDelayMs,
		config.IsActive,
		config.IsEncrypted,
		config.UseEnvFallback,
		config.UpdatedBy,
		config.Tags,
		config.Notes,
		config.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update api config: %v", err)
	}

	return nil
}

func (r *repository) Delete(id int, deletedBy string) error {
	query := `
		UPDATE setting.api_configs SET
			deleted_at = @p1,
			deleted_by = @p2
		WHERE id = @p3 AND deleted_at IS NULL
	`

	_, err := r.db.Exec(query, time.Now(), deletedBy, id)
	if err != nil {
		return fmt.Errorf("failed to delete api config: %v", err)
	}

	return nil
}

func (r *repository) UpdateTestResult(apiCode, status, message string) error {
	query := `
		UPDATE setting.api_configs SET
			last_tested_at = @p1,
			last_test_status = @p2,
			last_test_message = @p3
		WHERE api_code = @p4 AND deleted_at IS NULL
	`

	_, err := r.db.Exec(query, time.Now(), status, message, apiCode)
	if err != nil {
		return fmt.Errorf("failed to update test result: %v", err)
	}

	return nil
}
