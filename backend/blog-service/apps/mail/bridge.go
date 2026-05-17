package mail

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// NOTIF → EMAIL BRIDGE
//
// Implements interaction.EmailEnqueuer. Called by NotifRepository.Insert
// after a row is created. Resolves the recipient's email from blog.blog
// (denorm from JWT, see middleware in main.go), renders the template, and
// drops a row into interaction.email_outbox.
//
// Best-effort: every failure mode (no email, no active SMTP, etc) just
// returns nil — in-app notification still works.
// =============================================================================

type Bridge struct {
	db         *sqlx.DB
	outboxRepo *OutboxRepository
	cfgRepo    *ConfigRepository
}

func NewBridge(db *sqlx.DB, outboxRepo *OutboxRepository, cfgRepo *ConfigRepository) *Bridge {
	return &Bridge{db: db, outboxRepo: outboxRepo, cfgRepo: cfgRepo}
}

// EnqueueForNotif satisfies interaction.EmailEnqueuer.
func (b *Bridge) EnqueueForNotif(ctx context.Context, idNotif uuid.UUID, idPenerima uuid.UUID, tipe string, aktorNama string, judulRef *string, urlTarget *string) error {
	// 1. Resolve recipient email + display name from their blog row.
	//    No email = no enqueue (admin sees the gap in mail_config UI).
	var row struct {
		Email      *string `db:"email_pengguna"`
		NmTampilan *string `db:"nm_tampilan"`
		NmBlog     string  `db:"nm_blog"`
	}
	err := b.db.GetContext(ctx, &row, `
		SELECT email_pengguna, nm_tampilan, nm_blog
		FROM blog.blog
		WHERE id_pengguna_pdut = $1 AND soft_delete IS NULL
		LIMIT 1`, idPenerima)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil // user has no blog yet — silent skip
		}
		return fmt.Errorf("resolve recipient: %w", err)
	}
	if row.Email == nil || strings.TrimSpace(*row.Email) == "" {
		return nil // email not captured yet
	}

	// 2. Pull current config (for public_url; the worker re-fetches on send,
	//    but we need it here for the dashboard link inside the template).
	publicURL := "https://blog.unila.ac.id"
	if cfg, cerr := b.cfgRepo.GetActive(ctx); cerr == nil {
		publicURL = cfg.PublicURL
	}

	// 3. Render template.
	judulStr := ""
	if judulRef != nil {
		judulStr = *judulRef
	}
	urlStr := ""
	if urlTarget != nil {
		urlStr = *urlTarget
	}
	recipientName := ""
	if row.NmTampilan != nil && *row.NmTampilan != "" {
		recipientName = *row.NmTampilan
	} else {
		recipientName = row.NmBlog
	}

	subject, htmlBody, plainBody := Render(TemplateInput{
		Tipe:      tipe,
		AktorNama: aktorNama,
		JudulRef:  judulStr,
		URLTarget: urlStr,
		PublicURL: publicURL,
		Recipient: recipientName,
	})

	// 4. Drop into outbox.
	_, err = b.outboxRepo.Enqueue(ctx, EnqueueInput{
		IDPenerimaPdut: idPenerima,
		IDNotifikasi:   &idNotif,
		RecipientEmail: strings.TrimSpace(*row.Email),
		Subject:        subject,
		BodyHTML:       htmlBody,
		BodyText:       plainBody,
		Tipe:           tipe,
	})
	return err
}
