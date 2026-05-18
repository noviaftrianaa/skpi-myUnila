package mail

import (
	"context"
	"fmt"
	"html"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// SUBSCRIBER MAILER (Phase BB)
//
// Renders + enqueues:
//   1. Confirmation email saat user submit subscribe form
//   2. New-post broadcast saat blog publish post
//
// Satisfies subscriber.Mailer interface (duck-typed).
// =============================================================================

type SubscriberMailer struct {
	db         *sqlx.DB
	outboxRepo *OutboxRepository
	cfgRepo    *ConfigRepository
}

func NewSubscriberMailer(db *sqlx.DB, outboxRepo *OutboxRepository, cfgRepo *ConfigRepository) *SubscriberMailer {
	return &SubscriberMailer{db: db, outboxRepo: outboxRepo, cfgRepo: cfgRepo}
}

// resolveBlogContext — small helper: pull display info dari blog row sekali.
type blogCtx struct {
	NmBlog     string `db:"nm_blog"`
	NmTampilan string `db:"nm_tampilan"`
	Subdomain  string `db:"subdomain"`
}

func (m *SubscriberMailer) resolveBlogCtx(ctx context.Context, idBlog uuid.UUID) (*blogCtx, error) {
	var bc blogCtx
	err := m.db.GetContext(ctx, &bc, `
		SELECT nm_blog, COALESCE(nm_tampilan, nm_blog) AS nm_tampilan, subdomain
		FROM blog.blog WHERE id_blog = $1 AND soft_delete IS NULL LIMIT 1`, idBlog)
	if err != nil {
		return nil, err
	}
	return &bc, nil
}

func (m *SubscriberMailer) publicURL(ctx context.Context) string {
	publicURL := "https://blog.unila.ac.id"
	if cfg, cerr := m.cfgRepo.GetActive(ctx); cerr == nil {
		publicURL = cfg.PublicURL
	}
	return strings.TrimRight(publicURL, "/")
}

// EnqueueConfirmationEmail satisfies subscriber.Mailer.
// Token-based confirm link → public endpoint /api/v1/blogs/subscribe/confirm/:token.
// Frontend tenant nanti render success/error berdasar response.
func (m *SubscriberMailer) EnqueueConfirmationEmail(ctx context.Context, idBlog uuid.UUID, email, confirmToken string) error {
	bc, err := m.resolveBlogCtx(ctx, idBlog)
	if err != nil {
		return fmt.Errorf("resolve blog: %w", err)
	}
	base := m.publicURL(ctx)
	confirmURL := fmt.Sprintf("%s/api/v1/blogs/subscribe/confirm/%s", base, confirmToken)
	// Note: confirm URL hits backend lalu redirect-able ke tenant landing.
	// MVP: backend return JSON; bisa pasang front-end confirm page later.

	blogName := html.EscapeString(bc.NmBlog)
	subject := fmt.Sprintf("Konfirmasi subscription %s — Blog Unila", bc.NmBlog)

	body := fmt.Sprintf(`<p>Hai 👋</p>
<p>Kamu (atau seseorang dengan email ini) mendaftar untuk terima update post terbaru dari <strong>%s</strong>.</p>
<p>Klik link di bawah untuk konfirmasi subscription:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="%s" style="background:#0B5EA8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;">Konfirmasi Subscription</a>
</p>
<p style="font-size:12px;color:#64748b;">Kalau kamu tidak mendaftar, abaikan email ini — subscription tidak akan aktif tanpa konfirmasi.</p>`,
		blogName, confirmURL)

	htmlBody := wrapEmailHTML(subject, body, base+"/"+bc.Subdomain, base)
	plainBody := fmt.Sprintf("Konfirmasi subscription %s\n\nKlik link berikut untuk aktivasi:\n%s\n\nKalau tidak mendaftar, abaikan email ini.",
		bc.NmBlog, confirmURL)

	_, err = m.outboxRepo.Enqueue(ctx, EnqueueInput{
		IDPenerimaPdut: uuid.Nil, // subscriber bukan user pdut; OK pakai zero UUID
		IDNotifikasi:   nil,
		RecipientEmail: email,
		Subject:        subject,
		BodyHTML:       htmlBody,
		BodyText:       plainBody,
		Tipe:           "subscriber_confirm",
	})
	return err
}

// BroadcastNewPost — kirim new-post email ke semua confirmed subscribers
// dari blog. Dipake hook saat post publish. Returns count.
type BroadcastInput struct {
	IDBlog    uuid.UUID
	JudulPost string
	Ringkasan string
	Slug      string
	CoverURL  string
}

// Subscribers — minimal slice yang dibutuhin broadcast.
type Subscriber struct {
	IDSubscriber     uuid.UUID
	Email            string
	TokenUnsubscribe string
}

func (m *SubscriberMailer) BroadcastNewPost(ctx context.Context, in BroadcastInput, subs []Subscriber) (int, error) {
	if len(subs) == 0 {
		return 0, nil
	}
	bc, err := m.resolveBlogCtx(ctx, in.IDBlog)
	if err != nil {
		return 0, err
	}
	base := m.publicURL(ctx)
	postURL := fmt.Sprintf("%s/%s/posts/%s", base, bc.Subdomain, in.Slug)

	subject := fmt.Sprintf("📰 %s: %s", bc.NmBlog, in.JudulPost)
	judulEsc := html.EscapeString(in.JudulPost)
	blogNameEsc := html.EscapeString(bc.NmBlog)
	ringkasanEsc := ""
	if in.Ringkasan != "" {
		r := in.Ringkasan
		if len(r) > 280 {
			r = strings.TrimSpace(r[:280]) + "…"
		}
		ringkasanEsc = html.EscapeString(r)
	}
	coverBlock := ""
	if in.CoverURL != "" {
		coverBlock = fmt.Sprintf(`<p style="margin:16px 0;"><img src="%s" alt="" style="max-width:100%%;border-radius:8px;display:block;"></p>`, html.EscapeString(in.CoverURL))
	}

	sent := 0
	for _, s := range subs {
		unsubURL := fmt.Sprintf("%s/api/v1/blogs/subscribe/unsubscribe/%s", base, s.TokenUnsubscribe)

		body := fmt.Sprintf(`<p style="font-size:13px;color:#64748b;margin:0 0 8px 0;">Post baru dari <strong>%s</strong></p>
<h2 style="font-size:22px;line-height:1.3;margin:0 0 12px 0;color:#0f172a;">
  <a href="%s" style="color:#0f172a;text-decoration:none;">%s</a>
</h2>
%s%s
<p style="text-align:center;margin:24px 0;">
  <a href="%s" style="background:#0B5EA8;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;display:inline-block;">Baca selengkapnya →</a>
</p>
<p style="margin-top:24px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;">
  Kamu menerima email ini karena subscribe ke %s. <a href="%s" style="color:#0B5EA8;">Unsubscribe</a>.
</p>`,
			blogNameEsc, postURL, judulEsc, coverBlock,
			func() string {
				if ringkasanEsc != "" {
					return fmt.Sprintf(`<p style="font-size:14px;color:#475569;line-height:1.6;">%s</p>`, ringkasanEsc)
				}
				return ""
			}(),
			postURL, blogNameEsc, unsubURL)

		htmlBody := wrapEmailHTML(subject, body, postURL, base)
		plainBody := fmt.Sprintf("%s\n\nPost baru dari %s:\n%s\n\nBaca: %s\n\nUnsubscribe: %s",
			in.JudulPost, bc.NmBlog, in.Ringkasan, postURL, unsubURL)

		_, eerr := m.outboxRepo.Enqueue(ctx, EnqueueInput{
			IDPenerimaPdut: uuid.Nil, // subscriber bukan user pdut
			IDNotifikasi:   nil,
			RecipientEmail: s.Email,
			Subject:        subject,
			BodyHTML:       htmlBody,
			BodyText:       plainBody,
			Tipe:           "subscriber_broadcast",
		})
		if eerr != nil {
			continue
		}
		sent++
	}
	return sent, nil
}
