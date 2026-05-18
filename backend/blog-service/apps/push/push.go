package push

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	webpush "github.com/SherClockHolmes/webpush-go"
)

// =============================================================================
// WEB PUSH (Phase BA)
//
// VAPID-based push notifications via browser PushSubscription.
//
// Flow:
//   1. Frontend: ServiceWorker.register + pushManager.subscribe(applicationServerKey)
//      → returns {endpoint, keys:{p256dh, auth}}
//   2. Frontend POST ke /api/v1/me/notifications/push/subscribe → store row
//   3. Saat notif emit di backend → Bridge.SendForNotif fanout ke semua row
//      milik user → webpush.SendNotification ke setiap endpoint
//   4. Push gagal dengan 410 Gone (subscription expired) → row di-delete
//
// Best-effort: per-device error tidak fail notif insert. Browser akan
// re-subscribe sendiri saat user kembali ke dashboard.
// =============================================================================

var ErrNotConfigured = errors.New("web push not configured (set WEBPUSH_PUBLIC_KEY / PRIVATE_KEY)")

type Subscription struct {
	IDSubscription  uuid.UUID  `db:"id_subscription"   json:"id_subscription"`
	IDPenggunaPdut  uuid.UUID  `db:"id_pengguna_pdut"  json:"-"`
	Endpoint        string     `db:"endpoint"          json:"endpoint"`
	P256dh          string     `db:"p256dh"            json:"-"`
	Auth            string     `db:"auth"              json:"-"`
	UserAgent       *string    `db:"user_agent"        json:"user_agent,omitempty"`
	CreatedAt       time.Time  `db:"created_at"        json:"created_at"`
	LastUsedAt      *time.Time `db:"last_used_at"      json:"last_used_at,omitempty"`
	LastError       *string    `db:"last_error"        json:"last_error,omitempty"`
}

// =============================================================================
// REPOSITORY
// =============================================================================

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// Subscribe — upsert: kalau (user, endpoint) sudah ada, refresh keys.
// Idempotent untuk frontend yang re-register di setiap visit.
func (r *Repository) Subscribe(ctx context.Context, idUser uuid.UUID, endpoint, p256dh, auth, userAgent string) (*Subscription, error) {
	if strings.TrimSpace(endpoint) == "" || p256dh == "" || auth == "" {
		return nil, errors.New("endpoint + p256dh + auth required")
	}
	var s Subscription
	err := r.db.GetContext(ctx, &s, `
		INSERT INTO interaction.push_subscription
		    (id_pengguna_pdut, endpoint, p256dh, auth, user_agent)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''))
		ON CONFLICT (id_pengguna_pdut, endpoint) DO UPDATE
		SET p256dh = EXCLUDED.p256dh,
		    auth = EXCLUDED.auth,
		    user_agent = COALESCE(EXCLUDED.user_agent, push_subscription.user_agent),
		    last_error = NULL
		RETURNING id_subscription, id_pengguna_pdut, endpoint, p256dh, auth,
		          user_agent, created_at, last_used_at, last_error`,
		idUser, endpoint, p256dh, auth, userAgent)
	if err != nil {
		return nil, fmt.Errorf("subscribe: %w", err)
	}
	return &s, nil
}

// Unsubscribe — by id. Owner check via id_pengguna_pdut.
func (r *Repository) Unsubscribe(ctx context.Context, idSub, idUser uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		DELETE FROM interaction.push_subscription
		WHERE id_subscription = $1 AND id_pengguna_pdut = $2`, idSub, idUser)
	if err != nil {
		return fmt.Errorf("unsubscribe: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("subscription not found")
	}
	return nil
}

// UnsubscribeByEndpoint — frontend pakai ini saat user permission revoke;
// browser cuma punya endpoint, bukan UUID kita.
func (r *Repository) UnsubscribeByEndpoint(ctx context.Context, idUser uuid.UUID, endpoint string) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM interaction.push_subscription
		WHERE id_pengguna_pdut = $1 AND endpoint = $2`, idUser, endpoint)
	return err
}

// ListForUser — semua device subscriptions milik user. Untuk settings page.
func (r *Repository) ListForUser(ctx context.Context, idUser uuid.UUID) ([]Subscription, error) {
	rows := make([]Subscription, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_subscription, id_pengguna_pdut, endpoint, p256dh, auth,
		       user_agent, created_at, last_used_at, last_error
		FROM interaction.push_subscription
		WHERE id_pengguna_pdut = $1
		ORDER BY created_at DESC`, idUser)
	if err != nil {
		return nil, fmt.Errorf("list subscriptions: %w", err)
	}
	return rows, nil
}

// FetchActiveForUser — internal: hot path saat bridge fan-out. Kembalikan
// semua row yang valid untuk encrypt + push.
func (r *Repository) FetchActiveForUser(ctx context.Context, idUser uuid.UUID) ([]Subscription, error) {
	return r.ListForUser(ctx, idUser)
}

// MarkUsed — update last_used_at saat push terkirim sukses; clear last_error.
func (r *Repository) MarkUsed(ctx context.Context, idSub uuid.UUID) {
	_, _ = r.db.ExecContext(ctx, `
		UPDATE interaction.push_subscription
		SET last_used_at = NOW(), last_error = NULL
		WHERE id_subscription = $1`, idSub)
}

// MarkError — log error untuk diagnostics. Tidak delete row di sini —
// 410 cases dipanggil DeleteByID terpisah.
func (r *Repository) MarkError(ctx context.Context, idSub uuid.UUID, errMsg string) {
	_, _ = r.db.ExecContext(ctx, `
		UPDATE interaction.push_subscription
		SET last_error = $2
		WHERE id_subscription = $1`, idSub, errMsg)
}

// DeleteByID — hard delete (used saat 410 Gone dari push service).
func (r *Repository) DeleteByID(ctx context.Context, idSub uuid.UUID) {
	_, _ = r.db.ExecContext(ctx, `
		DELETE FROM interaction.push_subscription WHERE id_subscription = $1`, idSub)
}

// =============================================================================
// SENDER (VAPID web push)
// =============================================================================

// Payload — JSON yang dikirim ke service worker. Service worker JS akan parse
// dan call showNotification(title, options).
type Payload struct {
	Title   string `json:"title"`
	Body    string `json:"body"`
	URL     string `json:"url,omitempty"`
	Tipe    string `json:"tipe,omitempty"`
	IDNotif string `json:"id_notif,omitempty"`
}

type Sender struct {
	repo       *Repository
	publicKey  string
	privateKey string
	subject    string
}

func NewSender(repo *Repository, publicKey, privateKey, subject string) *Sender {
	return &Sender{repo: repo, publicKey: publicKey, privateKey: privateKey, subject: subject}
}

func (s *Sender) Configured() bool {
	return s.publicKey != "" && s.privateKey != ""
}

// SendToUser — fanout: kirim payload ke semua device subscription user.
// Per-device error tidak fail seluruh send — best effort.
// Return: (sent_count, deleted_count, err) — err hanya untuk infra errors
// (DB query), bukan individual push fail.
func (s *Sender) SendToUser(ctx context.Context, idUser uuid.UUID, p Payload) (int, int, error) {
	if !s.Configured() {
		return 0, 0, ErrNotConfigured
	}
	subs, err := s.repo.FetchActiveForUser(ctx, idUser)
	if err != nil {
		return 0, 0, err
	}
	if len(subs) == 0 {
		return 0, 0, nil
	}
	body, mErr := json.Marshal(p)
	if mErr != nil {
		return 0, 0, fmt.Errorf("marshal payload: %w", mErr)
	}

	sent, deleted := 0, 0
	for _, sub := range subs {
		wsub := &webpush.Subscription{
			Endpoint: sub.Endpoint,
			Keys: webpush.Keys{
				P256dh: sub.P256dh,
				Auth:   sub.Auth,
			},
		}
		resp, rerr := webpush.SendNotification(body, wsub, &webpush.Options{
			Subscriber:      s.subject,
			VAPIDPublicKey:  s.publicKey,
			VAPIDPrivateKey: s.privateKey,
			TTL:             86400, // 1 hari — push service hold kalau device offline
		})
		if rerr != nil {
			s.repo.MarkError(ctx, sub.IDSubscription, rerr.Error())
			continue
		}
		// Status code handling. 201/202 = OK. 410/404 = subscription
		// permanently gone (user unsubscribed di browser, atau tab closed).
		// 400-an lain biasanya transient.
		if resp.StatusCode == http.StatusOK ||
			resp.StatusCode == http.StatusCreated ||
			resp.StatusCode == http.StatusAccepted {
			s.repo.MarkUsed(ctx, sub.IDSubscription)
			sent++
		} else if resp.StatusCode == http.StatusGone ||
			resp.StatusCode == http.StatusNotFound {
			s.repo.DeleteByID(ctx, sub.IDSubscription)
			deleted++
		} else {
			s.repo.MarkError(ctx, sub.IDSubscription,
				fmt.Sprintf("push status %d", resp.StatusCode))
		}
		_ = resp.Body.Close()
	}
	return sent, deleted, nil
}

// =============================================================================
// HANDLER (frontend-facing)
// =============================================================================

type Handler struct {
	repo      *Repository
	publicKey string
	sender    *Sender
}

func NewHandler(repo *Repository, publicKey string, sender *Sender) *Handler {
	return &Handler{repo: repo, publicKey: publicKey, sender: sender}
}

// GET /api/v1/push/vapid-public — public endpoint. Frontend ambil sekali
// di onboarding flow lalu pass ke pushManager.subscribe.
func (h *Handler) GetPublicKey(c *fiber.Ctx) error {
	if h.publicKey == "" {
		return fiber.NewError(fiber.StatusServiceUnavailable, "web push not configured")
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    fiber.Map{"public_key": h.publicKey},
	})
}

// POST /api/v1/me/notifications/push/subscribe
// Body: { endpoint, keys: { p256dh, auth }, user_agent? }
func (h *Handler) Subscribe(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	var body struct {
		Endpoint string `json:"endpoint"`
		Keys     struct {
			P256dh string `json:"p256dh"`
			Auth   string `json:"auth"`
		} `json:"keys"`
		UserAgent string `json:"user_agent"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if body.UserAgent == "" {
		body.UserAgent = c.Get("User-Agent")
		if len(body.UserAgent) > 255 {
			body.UserAgent = body.UserAgent[:255]
		}
	}
	sub, serr := h.repo.Subscribe(c.Context(), idUser, body.Endpoint, body.Keys.P256dh, body.Keys.Auth, body.UserAgent)
	if serr != nil {
		return fiber.NewError(fiber.StatusBadRequest, serr.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": sub})
}

// DELETE /api/v1/me/notifications/push/subscribe — body { endpoint } untuk
// match yang frontend punya (browser tidak track UUID).
func (h *Handler) UnsubscribeByEndpoint(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	var body struct {
		Endpoint string `json:"endpoint"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if body.Endpoint == "" {
		return fiber.NewError(fiber.StatusBadRequest, "endpoint required")
	}
	if uerr := h.repo.UnsubscribeByEndpoint(c.Context(), idUser, body.Endpoint); uerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/me/notifications/push/:id — by id_subscription (settings UI
// "Lepas device ini").
func (h *Handler) Unsubscribe(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	idSub, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_subscription")
	}
	if uerr := h.repo.Unsubscribe(c.Context(), idSub, idUser); uerr != nil {
		return fiber.NewError(fiber.StatusNotFound, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/me/notifications/push — list devices yang ke-subscribe.
func (h *Handler) ListMine(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	rows, lerr := h.repo.ListForUser(c.Context(), idUser)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// POST /api/v1/me/notifications/push/test — kirim test push ke user diri
// sendiri. Untuk smoke test + debug "kenapa gak masuk?".
func (h *Handler) TestSend(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	if h.sender == nil || !h.sender.Configured() {
		return fiber.NewError(fiber.StatusServiceUnavailable, "web push not configured")
	}
	sent, deleted, perr := h.sender.SendToUser(c.Context(), idUser, Payload{
		Title: "🔔 Test notif dari Blog Unila",
		Body:  "Kalau kamu lihat ini, web push sudah aktif!",
		URL:   "/dashboard/blog-platform/notifications",
		Tipe:  "test",
	})
	if perr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, perr.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    fiber.Map{"sent": sent, "deleted_stale": deleted},
	})
}

// =============================================================================
// ROUTING
// =============================================================================

// RegisterPublicRoutes — VAPID public key endpoint (no auth).
func RegisterPublicRoutes(api fiber.Router, h *Handler) {
	api.Get("/push/vapid-public", h.GetPublicKey)
}

// RegisterMineRoutes — auth-required, di-mount di /me/notifications/push.
func RegisterMineRoutes(me fiber.Router, h *Handler) {
	g := me.Group("/notifications/push")
	g.Get("/", h.ListMine)
	g.Post("/subscribe", h.Subscribe)
	g.Delete("/subscribe", h.UnsubscribeByEndpoint)
	g.Post("/test", h.TestSend)
	g.Delete("/:id", h.Unsubscribe)
}

// LogConfigured — startup log to confirm push is wired.
func LogConfigured(configured bool) {
	if configured {
		log.Printf("🔔 Web push enabled (VAPID public key set)")
	} else {
		log.Printf("⚠️  Web push disabled (WEBPUSH_PUBLIC_KEY/PRIVATE_KEY not set)")
	}
}

// Avoid unused import warnings on minor refactor.
var _ = sql.ErrNoRows
