package mail

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"html"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// WEEKLY EMAIL DIGEST (Phase BE)
//
// Worker yang tiap 6 jam scan user yang punya following + email + belum di-mute,
// lalu cek apakah sudah ≥7 hari sejak last_sent. Kalau iya + ada minimal 1 post
// baru dari blog yang di-follow, render digest + enqueue ke outbox + update
// digest_log.
//
// Opt-out: pakai existing interaction.notif_preference tipe='weekly_digest'.
// Telemetry: digest_log.last_post_count + last_period_{from,to}.
//
// Pilihan kenapa terpisah dari NotifService:
//   - Digest itu pull (worker query top posts), bukan push (trigger per-event)
//   - Recipient = follower (yang follow blog), bukan owner blog
//   - Period-scoped, butuh tracking last_sent supaya gak duplicate kirim
// =============================================================================

const (
	digestInterval = 6 * time.Hour
	digestPeriod   = 7 * 24 * time.Hour // tiap user dikirim max 1x per 7 hari
	digestBatch    = 30                 // user per tick (worker tick lagi 6 jam kemudian)
	digestTopN     = 5                  // top-N posts per digest
)

type DigestService struct {
	db         *sqlx.DB
	outboxRepo *OutboxRepository
	cfgRepo    *ConfigRepository
}

func NewDigestService(db *sqlx.DB, outboxRepo *OutboxRepository, cfgRepo *ConfigRepository) *DigestService {
	return &DigestService{db: db, outboxRepo: outboxRepo, cfgRepo: cfgRepo}
}

// digestCandidate — user yang due untuk digest. Worker fetch dalam batch
// supaya tiap tick cuma proses N user (sisa di tick berikutnya).
type digestCandidate struct {
	IDPengguna   uuid.UUID  `db:"id_pengguna_pdut"`
	Email        string     `db:"email_pengguna"`
	NmTampilan   string     `db:"nm_tampilan"`
	LastSentAt   *time.Time `db:"last_sent_at"`
	LastPeriodTo *time.Time `db:"last_period_to"`
}

// digestPost — single post that lands in the email body.
type digestPost struct {
	IDPost        uuid.UUID `db:"id_post"`
	Judul         string    `db:"judul"`
	Ringkasan     *string   `db:"ringkasan"`
	Subdomain     string    `db:"subdomain"`
	NmBlog        string    `db:"nm_blog"`
	Slug          string    `db:"slug"`
	TglTerbit     time.Time `db:"tgl_terbit"`
	JumlahView    int       `db:"jumlah_view"`
	JumlahLike    int       `db:"jumlah_like"`
	JumlahKomentar int      `db:"jumlah_komentar"`
}

// fetchDueCandidates — query users yang due untuk digest minggu ini.
// Kriteria:
//   - Punya minimal 1 row interaction.follower (mengikuti blog)
//   - Email ter-capture di blog.blog (so they actually have an inbox)
//   - Tidak mute "weekly_digest" di notif_preference
//   - last_sent_at IS NULL OR last_sent_at < NOW() - 7 days
//
// LIMIT supaya tiap tick proses max digestBatch user. Sisa lanjut tick
// berikutnya (yang next tick 6 jam lagi — masih dalam window per-user 7 hari).
func (s *DigestService) fetchDueCandidates(ctx context.Context, limit int) ([]digestCandidate, error) {
	rows := make([]digestCandidate, 0, limit)
	q := `
		SELECT DISTINCT
		       f.id_pengguna_pdut,
		       b.email_pengguna,
		       COALESCE(b.nm_tampilan, b.nm_blog) AS nm_tampilan,
		       dl.last_sent_at,
		       dl.last_period_to
		FROM interaction.follower f
		JOIN blog.blog b
		     ON b.id_pengguna_pdut = f.id_pengguna_pdut
		    AND b.soft_delete IS NULL
		    AND b.email_pengguna IS NOT NULL
		    AND b.email_pengguna <> ''
		LEFT JOIN interaction.notif_preference np
		     ON np.id_pengguna_pdut = f.id_pengguna_pdut
		LEFT JOIN interaction.digest_log dl
		     ON dl.id_pengguna_pdut = f.id_pengguna_pdut
		WHERE (np.muted_tipes IS NULL OR NOT ('weekly_digest' = ANY(np.muted_tipes)))
		  AND (dl.last_sent_at IS NULL OR dl.last_sent_at < NOW() - INTERVAL '7 days')
		LIMIT $1`
	if err := s.db.SelectContext(ctx, &rows, q, limit); err != nil {
		return nil, fmt.Errorf("fetch digest candidates: %w", err)
	}
	return rows, nil
}

// fetchTopPosts — top-N posts published in (since, until] across blogs that
// idUser follows. Skor sederhana: 3*komentar + 2*like + 1*view (lebih bobot ke
// engagement aktif). LIMIT digestTopN.
func (s *DigestService) fetchTopPosts(ctx context.Context, idUser uuid.UUID, since, until time.Time) ([]digestPost, error) {
	rows := make([]digestPost, 0, digestTopN)
	q := `
		SELECT p.id_post, p.judul, p.ringkasan, b.subdomain, b.nm_blog, p.slug,
		       p.tgl_terbit, p.jumlah_view, p.jumlah_like, p.jumlah_komentar
		FROM blog.post p
		JOIN blog.blog b ON b.id_blog = p.id_blog AND b.soft_delete IS NULL
		JOIN interaction.follower f ON f.id_blog = p.id_blog
		WHERE f.id_pengguna_pdut = $1
		  AND p.status = 'published'
		  AND p.soft_delete IS NULL
		  AND p.tgl_terbit > $2
		  AND p.tgl_terbit <= $3
		ORDER BY (p.jumlah_komentar*3 + p.jumlah_like*2 + p.jumlah_view) DESC, p.tgl_terbit DESC
		LIMIT $4`
	if err := s.db.SelectContext(ctx, &rows, q, idUser, since, until, digestTopN); err != nil {
		return nil, fmt.Errorf("fetch digest posts: %w", err)
	}
	return rows, nil
}

// recordSent — upsert digest_log untuk user yang barusan di-kirim digest.
func (s *DigestService) recordSent(ctx context.Context, idUser uuid.UUID, since, until time.Time, postCount int) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO interaction.digest_log
		    (id_pengguna_pdut, last_sent_at, last_post_count, last_period_from, last_period_to)
		VALUES ($1, NOW(), $2, $3, $4)
		ON CONFLICT (id_pengguna_pdut) DO UPDATE
		SET last_sent_at = EXCLUDED.last_sent_at,
		    last_post_count = EXCLUDED.last_post_count,
		    last_period_from = EXCLUDED.last_period_from,
		    last_period_to = EXCLUDED.last_period_to`,
		idUser, postCount, since, until)
	return err
}

// ProcessUser — build + enqueue digest untuk satu user. Returns (sent bool,
// error). sent=false ketika tidak ada post baru (gak kirim email kosong).
func (s *DigestService) ProcessUser(ctx context.Context, c digestCandidate) (bool, error) {
	now := time.Now()
	// Window: dari last_period_to (kalau ada) sampai NOW. Kalau belum pernah
	// dikirim, pakai default 7 hari ke belakang supaya digest pertama relevan.
	since := now.Add(-digestPeriod)
	if c.LastPeriodTo != nil && c.LastPeriodTo.After(since) {
		since = *c.LastPeriodTo
	}
	posts, err := s.fetchTopPosts(ctx, c.IDPengguna, since, now)
	if err != nil {
		return false, err
	}
	if len(posts) == 0 {
		// Tidak ada konten baru. Update digest_log supaya gak retry tiap tick,
		// tapi geser window ke "now" — next check 7 hari lagi.
		if err := s.recordSent(ctx, c.IDPengguna, since, now, 0); err != nil {
			return false, fmt.Errorf("update digest_log empty: %w", err)
		}
		return false, nil
	}

	publicURL := "https://blog.unila.ac.id"
	if cfg, cerr := s.cfgRepo.GetActive(ctx); cerr == nil {
		publicURL = cfg.PublicURL
	}

	subject, htmlBody, plainBody := renderDigestEmail(c.NmTampilan, posts, publicURL)

	_, err = s.outboxRepo.Enqueue(ctx, EnqueueInput{
		IDPenerimaPdut: c.IDPengguna,
		IDNotifikasi:   nil, // digest bukan notif row spesifik
		RecipientEmail: c.Email,
		Subject:        subject,
		BodyHTML:       htmlBody,
		BodyText:       plainBody,
		Tipe:           "weekly_digest",
	})
	if err != nil {
		return false, fmt.Errorf("enqueue digest: %w", err)
	}
	if err := s.recordSent(ctx, c.IDPengguna, since, now, len(posts)); err != nil {
		// Email sudah di-enqueue, tapi log gagal — log error, jangan retry
		// karena bisa menyebabkan duplicate kirim.
		log.Printf("✉️  digest: log update gagal untuk %s (email sudah enqueued): %v", c.IDPengguna, err)
	}
	return true, nil
}

// =============================================================================
// WORKER
// =============================================================================

type DigestWorker struct{ svc *DigestService }

func NewDigestWorker(svc *DigestService) *DigestWorker { return &DigestWorker{svc: svc} }

// Run — 6h tick. Best-effort: per-user error di-log, tidak block batch.
func (w *DigestWorker) Run(ctx context.Context) {
	log.Printf("📨 Weekly digest worker started (every %s, batch %d, top-%d posts/digest)",
		digestInterval, digestBatch, digestTopN)
	// First tick segera supaya admin bisa lihat ada output (skip kalau tidak
	// ada candidate). Lalu lanjut interval-based.
	w.tick(ctx)
	ticker := time.NewTicker(digestInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.tick(ctx)
		}
	}
}

func (w *DigestWorker) tick(ctx context.Context) {
	// Skip kalau SMTP belum di-set — gak ada gunanya antri di outbox kalau
	// nanti rentent gagal.
	if _, err := w.svc.cfgRepo.GetActive(ctx); err != nil {
		if errors.Is(err, ErrNoActiveConfig) {
			return
		}
		log.Printf("📨 digest worker: config lookup: %v", err)
		return
	}

	candidates, err := w.svc.fetchDueCandidates(ctx, digestBatch)
	if err != nil {
		log.Printf("📨 digest worker: fetch candidates: %v", err)
		return
	}
	if len(candidates) == 0 {
		return
	}

	sent, skipped, failed := 0, 0, 0
	for _, c := range candidates {
		sentNow, perr := w.svc.ProcessUser(ctx, c)
		switch {
		case perr != nil:
			failed++
			log.Printf("📨 digest user %s: %v", c.IDPengguna, perr)
		case sentNow:
			sent++
		default:
			skipped++
		}
	}
	log.Printf("📨 digest tick: %d sent, %d skipped (no new posts), %d failed of %d candidates",
		sent, skipped, failed, len(candidates))
}

// =============================================================================
// TEMPLATE — Digest-specific. Different layout from per-event notif emails:
// list of post cards instead of single-action block.
// =============================================================================

func renderDigestEmail(recipientName string, posts []digestPost, publicURL string) (subject, htmlBody, plainBody string) {
	base := strings.TrimRight(publicURL, "/")
	subject = fmt.Sprintf("📬 Digest mingguan: %d post baru dari blog yang kamu ikuti", len(posts))

	// Build post cards
	var cardsHTML strings.Builder
	var plainList strings.Builder
	for i, p := range posts {
		title := html.EscapeString(p.Judul)
		blogName := html.EscapeString(p.NmBlog)
		excerpt := ""
		if p.Ringkasan != nil && *p.Ringkasan != "" {
			r := *p.Ringkasan
			if len(r) > 180 {
				r = strings.TrimSpace(r[:180]) + "…"
			}
			excerpt = html.EscapeString(r)
		}
		postURL := fmt.Sprintf("%s/%s/%s", base, p.Subdomain, p.Slug)

		fmt.Fprintf(&cardsHTML, `
<div style="margin:16px 0;padding:16px;border:1px solid #e2e8f0;border-radius:10px;background:#ffffff;">
  <a href="%s" style="text-decoration:none;color:#0f172a;">
    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">%s</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px;">%s</div>`, postURL, blogName, title)
		if excerpt != "" {
			fmt.Fprintf(&cardsHTML, `<div style="font-size:13px;color:#475569;line-height:1.5;">%s</div>`, excerpt)
		}
		fmt.Fprintf(&cardsHTML, `
    <div style="font-size:11px;color:#94a3b8;margin-top:8px;">👁 %d &nbsp;·&nbsp; ❤️ %d &nbsp;·&nbsp; 💬 %d</div>
  </a>
</div>`, p.JumlahView, p.JumlahLike, p.JumlahKomentar)

		fmt.Fprintf(&plainList, "%d. %s — %s\n   %s\n   %d views · %d likes · %d komentar\n\n",
			i+1, p.Judul, p.NmBlog, postURL, p.JumlahView, p.JumlahLike, p.JumlahKomentar)
	}

	salutation := "Halo"
	if recipientName != "" {
		salutation = "Halo " + html.EscapeString(recipientName)
	}
	intro := fmt.Sprintf(`<p>%s 👋</p>
<p>Berikut <strong>%d post pilihan minggu ini</strong> dari blog-blog yang kamu ikuti — diurutkan berdasarkan engagement (komentar + like + view).</p>`,
		salutation, len(posts))

	bodyFragment := intro + cardsHTML.String() +
		`<p style="margin-top:24px;font-size:12px;color:#64748b;">Tidak mau lagi terima digest mingguan? Buka <a href="` + base + `/dashboard/blog-platform/notifications">Preferensi Notifikasi</a> dan mute tipe <code>weekly_digest</code>.</p>`

	htmlBody = wrapEmailHTML(subject, bodyFragment, base+"/dashboard/blog-platform", publicURL)

	plainBody = fmt.Sprintf("%s\n\nBerikut %d post pilihan minggu ini dari blog yang kamu ikuti:\n\n%s\n--\nKelola preferensi notifikasi: %s/dashboard/blog-platform/notifications",
		salutation, len(posts), plainList.String(), base)

	return subject, htmlBody, plainBody
}

// DigestStats — for admin: how many users have digest_log rows, last sent etc.
type DigestStats struct {
	TotalLogged   int        `db:"total_logged"      json:"total_logged"`
	SentLast7Days int        `db:"sent_last_7_days"  json:"sent_last_7_days"`
	UsersDueNow   int        `db:"users_due_now"     json:"users_due_now"`
	LastTickAt    *time.Time `db:"-"                 json:"last_tick_at,omitempty"`
}

// Stats — admin diagnostics endpoint.
func (s *DigestService) Stats(ctx context.Context) (*DigestStats, error) {
	var stats DigestStats
	err := s.db.GetContext(ctx, &stats, `
		SELECT
		  (SELECT COUNT(*) FROM interaction.digest_log) AS total_logged,
		  (SELECT COUNT(*) FROM interaction.digest_log
		   WHERE last_sent_at > NOW() - INTERVAL '7 days') AS sent_last_7_days,
		  (SELECT COUNT(DISTINCT f.id_pengguna_pdut)
		   FROM interaction.follower f
		   JOIN blog.blog b ON b.id_pengguna_pdut = f.id_pengguna_pdut
		     AND b.email_pengguna IS NOT NULL AND b.email_pengguna <> ''
		     AND b.soft_delete IS NULL
		   LEFT JOIN interaction.notif_preference np ON np.id_pengguna_pdut = f.id_pengguna_pdut
		   LEFT JOIN interaction.digest_log dl ON dl.id_pengguna_pdut = f.id_pengguna_pdut
		   WHERE (np.muted_tipes IS NULL OR NOT ('weekly_digest' = ANY(np.muted_tipes)))
		     AND (dl.last_sent_at IS NULL OR dl.last_sent_at < NOW() - INTERVAL '7 days')
		  ) AS users_due_now`)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &stats, nil
		}
		return nil, fmt.Errorf("digest stats: %w", err)
	}
	return &stats, nil
}
