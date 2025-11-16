package apiconfig

import (
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetAll() ([]APIConfig, error)
	GetByAPICode(apiCode string) (*APIConfig, error)
	GetByID(id int) (*APIConfig, error)
	Create(config *APIConfig) error
	Update(config *APIConfig) error
	Delete(id int, deletedBy string) error
	UpdateTestResult(apiCode string, status, message string) error
	LogAudit(log *APIConfigAuditLog) error
	GetAuditLogs(configID int, limit int) ([]APIConfigAuditLog, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetAll retrieves all active API configs
func (r *repository) GetAll() ([]APIConfig, error) {
	var configs []APIConfig
	query := `
		SELECT
			id, api_code, api_name, api_description, base_url, auth_type,
			encrypted_credentials, additional_headers, timeout_seconds,
			max_retries, retry_delay_ms, is_active, is_encrypted,
			use_env_fallback, last_tested_at, last_test_status,
			last_test_message, created_by, created_at, updated_by,
			updated_at, deleted_at, deleted_by, tags, notes
		FROM setting.api_configs
		WHERE deleted_at IS NULL
		ORDER BY api_code
	`
	err := r.db.Select(&configs, query)
	return configs, err
}

// GetByAPICode retrieves active config by API code
func (r *repository) GetByAPICode(apiCode string) (*APIConfig, error) {
	var config APIConfig
	query := `
		SELECT
			id, api_code, api_name, api_description, base_url, auth_type,
			encrypted_credentials, additional_headers, timeout_seconds,
			max_retries, retry_delay_ms, is_active, is_encrypted,
			use_env_fallback, last_tested_at, last_test_status,
			last_test_message, created_by, created_at, updated_by,
			updated_at, deleted_at, deleted_by, tags, notes
		FROM setting.api_configs
		WHERE api_code = @p1
			AND deleted_at IS NULL
	`
	err := r.db.Get(&config, query, apiCode)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("api config with code '%s' not found", apiCode)
	}
	return &config, err
}

// GetByID retrieves config by ID
func (r *repository) GetByID(id int) (*APIConfig, error) {
	var config APIConfig
	query := `
		SELECT
			id, api_code, api_name, api_description, base_url, auth_type,
			encrypted_credentials, additional_headers, timeout_seconds,
			max_retries, retry_delay_ms, is_active, is_encrypted,
			use_env_fallback, last_tested_at, last_test_status,
			last_test_message, created_by, created_at, updated_by,
			updated_at, deleted_at, deleted_by, tags, notes
		FROM setting.api_configs
		WHERE id = @p1
			AND deleted_at IS NULL
	`
	err := r.db.Get(&config, query, id)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("api config with id %d not found", id)
	}
	return &config, err
}

// Create inserts a new API config
func (r *repository) Create(config *APIConfig) error {
	query := `
		INSERT INTO setting.api_configs (
			api_code, api_name, api_description, base_url, auth_type,
			encrypted_credentials, additional_headers, timeout_seconds,
			max_retries, retry_delay_ms, is_active, is_encrypted,
			use_env_fallback, created_by, tags, notes
		)
		OUTPUT INSERTED.id
		VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
			@p11, @p12, @p13, @p14, @p15, @p16
		)
	`

	var id int
	err := r.db.QueryRow(
		query,
		config.APICode,
		config.APIName,
		nullString(config.APIDescription),
		config.BaseURL,
		config.AuthType,
		nullString(config.EncryptedCredentials),
		nullString(config.AdditionalHeaders),
		config.TimeoutSeconds,
		config.MaxRetries,
		config.RetryDelayMs,
		config.IsActive,
		config.IsEncrypted,
		config.UseEnvFallback,
		nullString(config.CreatedBy),
		nullString(config.Tags),
		nullString(config.Notes),
	).Scan(&id)

	if err != nil {
		return err
	}

	config.ID = id
	return nil
}

// Update updates existing API config
func (r *repository) Update(config *APIConfig) error {
	query := `
		UPDATE setting.api_configs
		SET
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
			tags = @p14,
			notes = @p15
		WHERE id = @p16
			AND deleted_at IS NULL
	`

	result, err := r.db.Exec(
		query,
		config.APIName,
		nullString(config.APIDescription),
		config.BaseURL,
		config.AuthType,
		nullString(config.EncryptedCredentials),
		nullString(config.AdditionalHeaders),
		config.TimeoutSeconds,
		config.MaxRetries,
		config.RetryDelayMs,
		config.IsActive,
		config.IsEncrypted,
		config.UseEnvFallback,
		nullString(config.UpdatedBy),
		nullString(config.Tags),
		nullString(config.Notes),
		config.ID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("api config with id %d not found or already deleted", config.ID)
	}

	return nil
}

// Delete soft deletes API config
func (r *repository) Delete(id int, deletedBy string) error {
	query := `
		UPDATE setting.api_configs
		SET
			deleted_at = GETDATE(),
			deleted_by = @p1,
			is_active = 0
		WHERE id = @p2
			AND deleted_at IS NULL
	`

	result, err := r.db.Exec(query, deletedBy, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("api config with id %d not found or already deleted", id)
	}

	return nil
}

// UpdateTestResult updates the last test result for an API config
func (r *repository) UpdateTestResult(apiCode string, status, message string) error {
	query := `
		UPDATE setting.api_configs
		SET
			last_tested_at = GETDATE(),
			last_test_status = @p1,
			last_test_message = @p2,
			updated_by = 'system'
		WHERE api_code = @p3
			AND deleted_at IS NULL
	`

	_, err := r.db.Exec(query, status, message, apiCode)
	return err
}

// LogAudit inserts an audit log entry
func (r *repository) LogAudit(log *APIConfigAuditLog) error {
	query := `
		INSERT INTO setting.api_config_audit_logs (
			config_id, api_code, action_type, old_values, new_values,
			performed_by, ip_address, user_agent, notes
		)
		VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9
		)
	`

	_, err := r.db.Exec(
		query,
		log.ConfigID,
		log.APICode,
		log.ActionType,
		nullString(log.OldValues),
		nullString(log.NewValues),
		log.PerformedBy,
		nullString(log.IPAddress),
		nullString(log.UserAgent),
		nullString(log.Notes),
	)

	return err
}

// GetAuditLogs retrieves audit logs for a config
func (r *repository) GetAuditLogs(configID int, limit int) ([]APIConfigAuditLog, error) {
	var logs []APIConfigAuditLog
	query := `
		SELECT TOP (@p1)
			id, config_id, api_code, action_type, old_values, new_values,
			performed_by, ip_address, user_agent, performed_at, notes
		FROM setting.api_config_audit_logs
		WHERE config_id = @p2
		ORDER BY performed_at DESC
	`

	if limit <= 0 {
		limit = 50
	}

	err := r.db.Select(&logs, query, limit, configID)
	return logs, err
}

// Helper function to convert sql.NullString to pointer for insertion
func nullString(ns sql.NullString) interface{} {
	if ns.Valid {
		return ns.String
	}
	return nil
}