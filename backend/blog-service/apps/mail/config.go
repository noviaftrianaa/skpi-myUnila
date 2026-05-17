// Package mail — email notifications subsystem.
//
// Three layers:
//   1. ConfigRepository — CRUD over blog.mail_config (dynamic SMTP profile)
//   2. OutboxRepository — queue rows in interaction.email_outbox
//   3. Worker          — drains outbox via SMTP client (in worker.go)
//
// Admin manages the SMTP profile entirely via the dashboard. Env vars are
// fallback only — when no active row exists in mail_config, the worker
// stays idle (no panic, no boot crash). This lets the platform deploy with
// email disabled and turn it on later.
package mail

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var ErrNotFound = errors.New("mail config not found")
var ErrNoActiveConfig = errors.New("no active mail config — admin must configure SMTP")

// MailConfig — admin-managed SMTP profile.
type MailConfig struct {
	IDMailConfig uuid.UUID `db:"id_mail_config"  json:"id_mail_config"`
	Label        string    `db:"label"           json:"label"`
	SMTPHost     string    `db:"smtp_host"       json:"smtp_host"`
	SMTPPort     int       `db:"smtp_port"       json:"smtp_port"`
	SMTPUsername *string   `db:"smtp_username"   json:"smtp_username,omitempty"`
	SMTPPassword *string   `db:"smtp_password"   json:"-"`
	// Password intentionally excluded from JSON — admin sets it via PUT body,
	// never reads it back. Use a sentinel like "********" to indicate
	// "password set" in the GET response, handled in handler.
	UseTLS       bool      `db:"use_tls"         json:"use_tls"`
	UseSTARTTLS  bool      `db:"use_starttls"    json:"use_starttls"`
	FromAddress  string    `db:"from_address"    json:"from_address"`
	FromName     string    `db:"from_name"       json:"from_name"`
	PublicURL    string    `db:"public_url"      json:"public_url"`
	AAktif       bool      `db:"a_aktif"         json:"a_aktif"`
	Catatan      *string   `db:"catatan"         json:"catatan,omitempty"`
	CreatedAt    time.Time `db:"created_at"      json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"      json:"updated_at"`
	HasPassword  bool      `db:"-"               json:"has_password"`
	// HasPassword set in repo, surfaced to admin UI so the "Password" field
	// shows a placeholder rather than emptiness.
}

type ConfigRepository struct{ db *sqlx.DB }

func NewConfigRepository(db *sqlx.DB) *ConfigRepository { return &ConfigRepository{db: db} }

// GetActive returns the single active mail config, or ErrNoActiveConfig.
// Used by the SMTP client on every send (cached at the caller with short TTL).
func (r *ConfigRepository) GetActive(ctx context.Context) (*MailConfig, error) {
	var c MailConfig
	err := r.db.GetContext(ctx, &c, `
		SELECT id_mail_config, label, smtp_host, smtp_port, smtp_username, smtp_password,
		       use_tls, use_starttls, from_address, from_name, public_url, a_aktif,
		       catatan, created_at, updated_at
		FROM blog.mail_config
		WHERE a_aktif = TRUE LIMIT 1`)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNoActiveConfig
		}
		return nil, fmt.Errorf("get active mail config: %w", err)
	}
	c.HasPassword = c.SMTPPassword != nil && *c.SMTPPassword != ""
	return &c, nil
}

// List returns every config row (admin can flip between profiles).
func (r *ConfigRepository) List(ctx context.Context) ([]MailConfig, error) {
	rows := make([]MailConfig, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_mail_config, label, smtp_host, smtp_port, smtp_username, smtp_password,
		       use_tls, use_starttls, from_address, from_name, public_url, a_aktif,
		       catatan, created_at, updated_at
		FROM blog.mail_config
		ORDER BY a_aktif DESC, created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("list mail configs: %w", err)
	}
	for i := range rows {
		rows[i].HasPassword = rows[i].SMTPPassword != nil && *rows[i].SMTPPassword != ""
	}
	return rows, nil
}

type ConfigInput struct {
	Label        string
	SMTPHost     string
	SMTPPort     int
	SMTPUsername *string
	SMTPPassword *string // nil = don't touch (on update); "" = clear
	UseTLS       bool
	UseSTARTTLS  bool
	FromAddress  string
	FromName     string
	PublicURL    string
	Catatan      *string
}

// Create — inserts a new config row. New rows default to a_aktif=FALSE so
// they don't immediately replace the live profile. Admin flips active via
// SetActive after testing.
func (r *ConfigRepository) Create(ctx context.Context, in ConfigInput, idCreator uuid.UUID) (*MailConfig, error) {
	if in.SMTPHost == "" || in.FromAddress == "" || in.Label == "" {
		return nil, errors.New("label, smtp_host, dan from_address wajib diisi")
	}
	if in.SMTPPort <= 0 {
		in.SMTPPort = 587
	}
	if in.FromName == "" {
		in.FromName = "Blog Unila"
	}
	if in.PublicURL == "" {
		in.PublicURL = "https://blog.unila.ac.id"
	}
	var c MailConfig
	err := r.db.GetContext(ctx, &c, `
		INSERT INTO blog.mail_config (label, smtp_host, smtp_port, smtp_username,
		    smtp_password, use_tls, use_starttls, from_address, from_name,
		    public_url, catatan, a_aktif, id_creator)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,FALSE,$12)
		RETURNING id_mail_config, label, smtp_host, smtp_port, smtp_username,
		          smtp_password, use_tls, use_starttls, from_address, from_name,
		          public_url, a_aktif, catatan, created_at, updated_at`,
		in.Label, in.SMTPHost, in.SMTPPort, in.SMTPUsername, in.SMTPPassword,
		in.UseTLS, in.UseSTARTTLS, in.FromAddress, in.FromName, in.PublicURL,
		in.Catatan, idCreator)
	if err != nil {
		return nil, fmt.Errorf("create mail config: %w", err)
	}
	c.HasPassword = c.SMTPPassword != nil && *c.SMTPPassword != ""
	return &c, nil
}

// Update — partial update. SMTPPassword field semantics:
//   - nil pointer            → leave existing password alone
//   - pointer to empty string → clear the password
//   - pointer to non-empty   → replace
func (r *ConfigRepository) Update(ctx context.Context, id uuid.UUID, in ConfigInput, idUpdater uuid.UUID) (*MailConfig, error) {
	// Build SET clause dynamically so we don't clobber unsupplied fields.
	sets := []string{
		"label = $2", "smtp_host = $3", "smtp_port = $4", "smtp_username = $5",
		"use_tls = $6", "use_starttls = $7", "from_address = $8", "from_name = $9",
		"public_url = $10", "catatan = $11", "id_updater = $12", "updated_at = NOW()",
	}
	args := []any{
		id, in.Label, in.SMTPHost, in.SMTPPort, in.SMTPUsername,
		in.UseTLS, in.UseSTARTTLS, in.FromAddress, in.FromName,
		in.PublicURL, in.Catatan, idUpdater,
	}
	if in.SMTPPassword != nil {
		sets = append(sets, fmt.Sprintf("smtp_password = $%d", len(args)+1))
		args = append(args, *in.SMTPPassword)
	}
	q := fmt.Sprintf(`UPDATE blog.mail_config SET %s
	                  WHERE id_mail_config = $1`, joinComma(sets))
	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("update mail config: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, id)
}

func joinComma(s []string) string {
	out := ""
	for i, v := range s {
		if i > 0 {
			out += ", "
		}
		out += v
	}
	return out
}

func (r *ConfigRepository) GetByID(ctx context.Context, id uuid.UUID) (*MailConfig, error) {
	var c MailConfig
	err := r.db.GetContext(ctx, &c, `
		SELECT id_mail_config, label, smtp_host, smtp_port, smtp_username, smtp_password,
		       use_tls, use_starttls, from_address, from_name, public_url, a_aktif,
		       catatan, created_at, updated_at
		FROM blog.mail_config WHERE id_mail_config = $1`, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get mail config: %w", err)
	}
	c.HasPassword = c.SMTPPassword != nil && *c.SMTPPassword != ""
	return &c, nil
}

// SetActive flips a_aktif=TRUE on the chosen row and FALSE on all others.
// Wrapped in a transaction so partial-update never leaves the singleton
// invariant broken.
func (r *ConfigRepository) SetActive(ctx context.Context, id uuid.UUID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`UPDATE blog.mail_config SET a_aktif = FALSE, updated_at = NOW() WHERE a_aktif = TRUE`); err != nil {
		return fmt.Errorf("deactivate others: %w", err)
	}
	res, err := tx.ExecContext(ctx,
		`UPDATE blog.mail_config SET a_aktif = TRUE, updated_at = NOW() WHERE id_mail_config = $1`, id)
	if err != nil {
		return fmt.Errorf("activate: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return tx.Commit()
}

func (r *ConfigRepository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM blog.mail_config WHERE id_mail_config = $1`, id)
	if err != nil {
		return fmt.Errorf("delete mail config: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
