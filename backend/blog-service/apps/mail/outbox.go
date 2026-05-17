package mail

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// EMAIL OUTBOX
//
// Queue of emails to send. Worker (worker.go) picks pending rows where
// next_attempt_at <= NOW(), marks them "sending", attempts delivery, then
// transitions to "sent" or back to "pending" (with backoff) on failure.
// After 5 attempts the row terminates in "failed" — admin can re-queue
// manually if needed.
// =============================================================================

type EmailOutbox struct {
	IDEmail         uuid.UUID  `db:"id_email"         json:"id_email"`
	IDPenerimaPdut  uuid.UUID  `db:"id_penerima_pdut" json:"id_penerima_pdut"`
	IDNotifikasi    *uuid.UUID `db:"id_notifikasi"    json:"id_notifikasi,omitempty"`
	RecipientEmail  string     `db:"recipient_email"  json:"recipient_email"`
	Subject         string     `db:"subject"          json:"subject"`
	BodyHTML        string     `db:"body_html"        json:"body_html,omitempty"`
	BodyText        *string    `db:"body_text"        json:"body_text,omitempty"`
	Tipe            string     `db:"tipe"             json:"tipe"`
	Status          string     `db:"status"           json:"status"`
	Attempts        int        `db:"attempts"         json:"attempts"`
	NextAttemptAt   time.Time  `db:"next_attempt_at"  json:"next_attempt_at"`
	SentAt          *time.Time `db:"sent_at"          json:"sent_at,omitempty"`
	LastError       *string    `db:"last_error"       json:"last_error,omitempty"`
	CreatedAt       time.Time  `db:"created_at"       json:"created_at"`
}

const MaxEmailAttempts = 5

type OutboxRepository struct{ db *sqlx.DB }

func NewOutboxRepository(db *sqlx.DB) *OutboxRepository { return &OutboxRepository{db: db} }

type EnqueueInput struct {
	IDPenerimaPdut uuid.UUID
	IDNotifikasi   *uuid.UUID
	RecipientEmail string
	Subject        string
	BodyHTML       string
	BodyText       string
	Tipe           string
}

func (r *OutboxRepository) Enqueue(ctx context.Context, in EnqueueInput) (*EmailOutbox, error) {
	if in.RecipientEmail == "" {
		return nil, errors.New("recipient_email required")
	}
	var bodyText *string
	if in.BodyText != "" {
		bodyText = &in.BodyText
	}
	var e EmailOutbox
	err := r.db.GetContext(ctx, &e, `
		INSERT INTO interaction.email_outbox
		    (id_penerima_pdut, id_notifikasi, recipient_email, subject, body_html, body_text, tipe)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id_email, id_penerima_pdut, id_notifikasi, recipient_email, subject,
		          body_html, body_text, tipe, status, attempts, next_attempt_at,
		          sent_at, last_error, created_at`,
		in.IDPenerimaPdut, in.IDNotifikasi, in.RecipientEmail, in.Subject,
		in.BodyHTML, bodyText, in.Tipe)
	if err != nil {
		return nil, fmt.Errorf("enqueue email: %w", err)
	}
	return &e, nil
}

// ClaimBatch picks up to N pending rows that are due, atomically marks them
// "sending", and returns them for the worker to process. Uses FOR UPDATE
// SKIP LOCKED so two workers (if ever scaled) don't double-send.
func (r *OutboxRepository) ClaimBatch(ctx context.Context, limit int) ([]EmailOutbox, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	rows := make([]EmailOutbox, 0, limit)
	err := r.db.SelectContext(ctx, &rows, `
		WITH due AS (
			SELECT id_email FROM interaction.email_outbox
			WHERE status = 'pending' AND next_attempt_at <= NOW()
			ORDER BY next_attempt_at ASC
			LIMIT $1
			FOR UPDATE SKIP LOCKED
		)
		UPDATE interaction.email_outbox o
		SET status = 'sending', attempts = attempts + 1
		FROM due
		WHERE o.id_email = due.id_email
		RETURNING o.id_email, o.id_penerima_pdut, o.id_notifikasi, o.recipient_email,
		          o.subject, o.body_html, o.body_text, o.tipe, o.status, o.attempts,
		          o.next_attempt_at, o.sent_at, o.last_error, o.created_at`, limit)
	if err != nil {
		return nil, fmt.Errorf("claim batch: %w", err)
	}
	return rows, nil
}

// MarkSent finalises a successful delivery.
func (r *OutboxRepository) MarkSent(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE interaction.email_outbox
		SET status = 'sent', sent_at = NOW(), last_error = NULL
		WHERE id_email = $1`, id)
	return err
}

// MarkFailed schedules retry with exponential backoff. When attempts hits
// the cap the row terminates in 'failed' status and stays for audit.
func (r *OutboxRepository) MarkFailed(ctx context.Context, id uuid.UUID, attempts int, errMsg string) error {
	if attempts >= MaxEmailAttempts {
		_, err := r.db.ExecContext(ctx, `
			UPDATE interaction.email_outbox
			SET status = 'failed', last_error = $2
			WHERE id_email = $1`, id, errMsg)
		return err
	}
	// Backoff: 1m, 5m, 15m, 60m, 4h (capped at MaxEmailAttempts above)
	backoff := backoffFor(attempts)
	_, err := r.db.ExecContext(ctx, `
		UPDATE interaction.email_outbox
		SET status = 'pending', last_error = $3,
		    next_attempt_at = NOW() + ($2 || ' seconds')::INTERVAL
		WHERE id_email = $1`, id, int(backoff.Seconds()), errMsg)
	return err
}

func backoffFor(attempts int) time.Duration {
	switch attempts {
	case 1:
		return 1 * time.Minute
	case 2:
		return 5 * time.Minute
	case 3:
		return 15 * time.Minute
	case 4:
		return 60 * time.Minute
	default:
		return 4 * time.Hour
	}
}

// Stats — counts by status for the admin dashboard.
type OutboxStats struct {
	Pending int `db:"pending" json:"pending"`
	Sending int `db:"sending" json:"sending"`
	Sent    int `db:"sent"    json:"sent"`
	Failed  int `db:"failed"  json:"failed"`
}

func (r *OutboxRepository) Stats(ctx context.Context) (*OutboxStats, error) {
	var s OutboxStats
	err := r.db.GetContext(ctx, &s, `
		SELECT
			COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending,
			COUNT(*) FILTER (WHERE status = 'sending')::INT AS sending,
			COUNT(*) FILTER (WHERE status = 'sent')::INT    AS sent,
			COUNT(*) FILTER (WHERE status = 'failed')::INT  AS failed
		FROM interaction.email_outbox
		WHERE created_at > NOW() - INTERVAL '7 days'`)
	if err != nil {
		return nil, fmt.Errorf("outbox stats: %w", err)
	}
	return &s, nil
}

// ListRecent — admin diagnostics view (most recent 100 rows).
func (r *OutboxRepository) ListRecent(ctx context.Context, status string, limit int) ([]EmailOutbox, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	where := "1=1"
	args := []any{limit}
	if status != "" {
		where = "status = $2"
		args = append(args, status)
	}
	rows := make([]EmailOutbox, 0, limit)
	q := fmt.Sprintf(`
		SELECT id_email, id_penerima_pdut, id_notifikasi, recipient_email, subject,
		       body_html, body_text, tipe, status, attempts, next_attempt_at,
		       sent_at, last_error, created_at
		FROM interaction.email_outbox
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $1`, where)
	err := r.db.SelectContext(ctx, &rows, q, args...)
	if err != nil {
		return nil, fmt.Errorf("list outbox: %w", err)
	}
	return rows, nil
}
