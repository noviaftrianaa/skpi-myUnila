package subscriber

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// NEWSLETTER SUBSCRIBER (Phase BB)
//
// Public newsletter opt-in per blog. Double opt-in: email → confirm link.
// Fanout broadcast saat blog publish post baru.
// =============================================================================

type Subscriber struct {
	IDSubscriber     uuid.UUID  `db:"id_subscriber"     json:"id_subscriber"`
	IDBlog           uuid.UUID  `db:"id_blog"           json:"id_blog"`
	Email            string     `db:"email"             json:"email"`
	Status           string     `db:"status"            json:"status"`
	TokenVerify      string     `db:"token_verify"      json:"-"`
	TokenUnsubscribe string     `db:"token_unsubscribe" json:"-"`
	CreatedAt        time.Time  `db:"created_at"        json:"created_at"`
	ConfirmedAt      *time.Time `db:"confirmed_at"      json:"confirmed_at,omitempty"`
	UnsubscribedAt   *time.Time `db:"unsubscribed_at"   json:"unsubscribed_at,omitempty"`
	LastSentAt       *time.Time `db:"last_sent_at"      json:"last_sent_at,omitempty"`
}

// SubscribeResult — distinguishable outcome supaya frontend bisa render pesan tepat.
type SubscribeResult struct {
	Status      string `json:"status"`       // "pending_confirmation" | "already_confirmed" | "resent"
	Email       string `json:"email"`
	IDBlog      string `json:"id_blog"`
	TokenVerify string `json:"-"`            // backend-internal, for sending email
}

// =============================================================================
// REPOSITORY
// =============================================================================

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// randToken — 32-byte urlsafe base64 (no padding). Cukup acak buat ngga
// brute-forceable (256 bits entropy).
func randToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// validateEmail — light syntax check + length cap. Real bounce handling
// di-deferred ke SMTP delivery (gak ada API verify gratis yang reliable).
func validateEmail(e string) error {
	e = strings.TrimSpace(strings.ToLower(e))
	if len(e) == 0 || len(e) > 200 {
		return errors.New("email panjang invalid")
	}
	if _, err := mail.ParseAddress(e); err != nil {
		return errors.New("format email invalid")
	}
	return nil
}

// Subscribe — public POST. Idempotent: kalau sudah confirmed, no-op. Kalau
// pending atau unsubscribed, rotate token_verify dan kirim ulang.
func (r *Repository) Subscribe(ctx context.Context, idBlog uuid.UUID, email string) (*SubscribeResult, error) {
	if err := validateEmail(email); err != nil {
		return nil, err
	}
	email = strings.TrimSpace(strings.ToLower(email))

	tokVerify, err := randToken()
	if err != nil {
		return nil, fmt.Errorf("token gen: %w", err)
	}
	tokUnsub, err := randToken()
	if err != nil {
		return nil, fmt.Errorf("token gen: %w", err)
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Cek existing row dulu — ada 3 branch behavior berdasar status.
	var existing struct {
		IDSubscriber uuid.UUID `db:"id_subscriber"`
		Status       string    `db:"status"`
	}
	err = tx.GetContext(ctx, &existing, `
		SELECT id_subscriber, status FROM interaction.subscriber
		WHERE id_blog = $1 AND email = $2`, idBlog, email)
	switch {
	case errors.Is(err, sql.ErrNoRows):
		// New subscriber → INSERT pending.
		_, ierr := tx.ExecContext(ctx, `
			INSERT INTO interaction.subscriber
			    (id_blog, email, status, token_verify, token_unsubscribe)
			VALUES ($1, $2, 'pending', $3, $4)`,
			idBlog, email, tokVerify, tokUnsub)
		if ierr != nil {
			return nil, fmt.Errorf("insert subscriber: %w", ierr)
		}
		if cerr := tx.Commit(); cerr != nil {
			return nil, cerr
		}
		return &SubscribeResult{
			Status: "pending_confirmation", Email: email,
			IDBlog: idBlog.String(), TokenVerify: tokVerify,
		}, nil
	case err != nil:
		return nil, fmt.Errorf("lookup subscriber: %w", err)
	}

	if existing.Status == "confirmed" {
		// Sudah confirmed → no-op (return result tanpa kirim email).
		return &SubscribeResult{
			Status: "already_confirmed", Email: email,
			IDBlog: idBlog.String(), TokenVerify: "",
		}, nil
	}

	// pending atau unsubscribed → rotate token + reset status ke pending.
	// Konfirmasi link sebelumnya jadi invalid (one-shot security).
	_, uerr := tx.ExecContext(ctx, `
		UPDATE interaction.subscriber
		SET token_verify = $1, status = 'pending', unsubscribed_at = NULL
		WHERE id_subscriber = $2`, tokVerify, existing.IDSubscriber)
	if uerr != nil {
		return nil, fmt.Errorf("rotate token: %w", uerr)
	}
	if cerr := tx.Commit(); cerr != nil {
		return nil, cerr
	}
	return &SubscribeResult{
		Status: "resent", Email: email,
		IDBlog: idBlog.String(), TokenVerify: tokVerify,
	}, nil
}

// ConfirmByToken — flip pending → confirmed. Token sekali pakai: cleared
// dengan random rotate setelah confirm supaya kalau email tertahan dan di-
// click ulang lewat archive, gak side-effect.
func (r *Repository) ConfirmByToken(ctx context.Context, token string) (*Subscriber, error) {
	if token == "" {
		return nil, errors.New("token required")
	}
	// Rotate ke token baru pasca-confirm supaya link basi gak bisa di-replay.
	newTok, err := randToken()
	if err != nil {
		return nil, err
	}
	var s Subscriber
	err = r.db.GetContext(ctx, &s, `
		UPDATE interaction.subscriber
		SET status = 'confirmed', confirmed_at = NOW(), token_verify = $2
		WHERE token_verify = $1 AND status = 'pending'
		RETURNING id_subscriber, id_blog, email, status, token_verify,
		          token_unsubscribe, created_at, confirmed_at,
		          unsubscribed_at, last_sent_at`, token, newTok)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("token expired atau sudah di-confirm")
		}
		return nil, fmt.Errorf("confirm: %w", err)
	}
	return &s, nil
}

// UnsubscribeByToken — set status=unsubscribed via permanent token dari
// email footer. Idempotent: sudah unsubscribed → 200 OK.
func (r *Repository) UnsubscribeByToken(ctx context.Context, token string) (*Subscriber, error) {
	if token == "" {
		return nil, errors.New("token required")
	}
	var s Subscriber
	err := r.db.GetContext(ctx, &s, `
		UPDATE interaction.subscriber
		SET status = 'unsubscribed', unsubscribed_at = NOW()
		WHERE token_unsubscribe = $1
		RETURNING id_subscriber, id_blog, email, status, token_verify,
		          token_unsubscribe, created_at, confirmed_at,
		          unsubscribed_at, last_sent_at`, token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("token tidak valid")
		}
		return nil, fmt.Errorf("unsubscribe: %w", err)
	}
	return &s, nil
}

// ListConfirmedForBlog — used oleh fanout broadcast saat publish.
func (r *Repository) ListConfirmedForBlog(ctx context.Context, idBlog uuid.UUID) ([]Subscriber, error) {
	rows := make([]Subscriber, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_subscriber, id_blog, email, status, token_verify,
		       token_unsubscribe, created_at, confirmed_at,
		       unsubscribed_at, last_sent_at
		FROM interaction.subscriber
		WHERE id_blog = $1 AND status = 'confirmed'`, idBlog)
	if err != nil {
		return nil, fmt.Errorf("list confirmed: %w", err)
	}
	return rows, nil
}

// MarkSent — update last_sent_at setelah broadcast terkirim (best-effort).
func (r *Repository) MarkSent(ctx context.Context, ids []uuid.UUID) {
	if len(ids) == 0 {
		return
	}
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = id.String()
	}
	_, _ = r.db.ExecContext(ctx, `
		UPDATE interaction.subscriber SET last_sent_at = NOW()
		WHERE id_subscriber = ANY($1::uuid[])`, strIDs)
}

// ListForOwner — dashboard list. Includes all statuses (owner can see who
// unsubscribed). Pagination + counts.
// db tags needed karena sqlx.GetContext scan aggregate counts.
type OwnerListResult struct {
	Items             []Subscriber `db:"-"                  json:"items"`
	Total             int          `db:"total"              json:"total"`
	ConfirmedCount    int          `db:"confirmed_count"    json:"confirmed_count"`
	PendingCount      int          `db:"pending_count"      json:"pending_count"`
	UnsubscribedCount int          `db:"unsubscribed_count" json:"unsubscribed_count"`
}

func (r *Repository) ListForOwner(ctx context.Context, idBlog uuid.UUID, limit, offset int) (*OwnerListResult, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	res := &OwnerListResult{Items: []Subscriber{}}
	err := r.db.GetContext(ctx, res, `
		SELECT
		  (SELECT COUNT(*) FROM interaction.subscriber WHERE id_blog = $1) AS total,
		  (SELECT COUNT(*) FROM interaction.subscriber WHERE id_blog = $1 AND status = 'confirmed') AS confirmed_count,
		  (SELECT COUNT(*) FROM interaction.subscriber WHERE id_blog = $1 AND status = 'pending') AS pending_count,
		  (SELECT COUNT(*) FROM interaction.subscriber WHERE id_blog = $1 AND status = 'unsubscribed') AS unsubscribed_count
		`, idBlog)
	if err != nil {
		return nil, fmt.Errorf("count subscribers: %w", err)
	}
	err = r.db.SelectContext(ctx, &res.Items, `
		SELECT id_subscriber, id_blog, email, status, token_verify,
		       token_unsubscribe, created_at, confirmed_at,
		       unsubscribed_at, last_sent_at
		FROM interaction.subscriber
		WHERE id_blog = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`, idBlog, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list owner subscribers: %w", err)
	}
	return res, nil
}

// =============================================================================
// HANDLER
// =============================================================================

// Mailer — interface untuk enqueue confirmation email + broadcast.
// Dipake supaya subscriber package gak depend langsung ke apps/mail.
type Mailer interface {
	EnqueueConfirmationEmail(ctx context.Context, idBlog uuid.UUID, email, confirmToken string) error
}

type Handler struct {
	repo   *Repository
	blogs  BlogResolver // resolve id_blog dari subdomain
	mailer Mailer
}

// BlogResolver — small interface: minimal slice dari blog.Repository yang
// kita butuhin di sini. Avoid full package import.
type BlogResolver interface {
	ResolveIDFromSubdomain(ctx context.Context, subdomain string) (uuid.UUID, error)
}

func NewHandler(repo *Repository, blogs BlogResolver, mailer Mailer) *Handler {
	return &Handler{repo: repo, blogs: blogs, mailer: mailer}
}

// POST /api/v1/blogs/by-subdomain/:subdomain/subscribe
// Body: { email }
func (h *Handler) Subscribe(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	if subdomain == "" {
		return fiber.NewError(fiber.StatusBadRequest, "subdomain required")
	}
	idBlog, err := h.blogs.ResolveIDFromSubdomain(c.Context(), subdomain)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "blog tidak ditemukan")
	}
	var body struct {
		Email string `json:"email"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	res, serr := h.repo.Subscribe(c.Context(), idBlog, body.Email)
	if serr != nil {
		return fiber.NewError(fiber.StatusBadRequest, serr.Error())
	}
	// Send confirmation email kalau status pending_confirmation atau resent.
	// already_confirmed → skip (gak resend).
	if h.mailer != nil && res.TokenVerify != "" {
		if eerr := h.mailer.EnqueueConfirmationEmail(c.Context(), idBlog, res.Email, res.TokenVerify); eerr != nil {
			// log only — frontend sees success message; admin sees stuck queue
			// di mail config UI kalau SMTP belum di-setup.
			c.Context().Logger().Printf("subscriber: confirm email enqueue: %v", eerr)
		}
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"status":  res.Status,
			"message": messageFor(res.Status),
		},
	})
}

func messageFor(status string) string {
	switch status {
	case "pending_confirmation":
		return "Cek email kamu untuk konfirmasi subscription. Link berlaku terbatas."
	case "resent":
		return "Email konfirmasi sudah dikirim ulang. Cek inbox / spam folder."
	case "already_confirmed":
		return "Email ini sudah subscribed. Cek inbox kalau ada post baru terbaru."
	}
	return "OK"
}

// GET /api/v1/blogs/subscribe/confirm/:token
// Public — clickable dari email confirmation. Return JSON yang tenant page
// bisa render sebagai success/error message.
func (h *Handler) Confirm(c *fiber.Ctx) error {
	token := c.Params("token")
	s, err := h.repo.ConfirmByToken(c.Context(), token)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id_blog": s.IDBlog,
			"email":   s.Email,
			"status":  s.Status,
		},
	})
}

// GET /api/v1/blogs/subscribe/unsubscribe/:token
// Public — clickable dari setiap broadcast footer.
func (h *Handler) Unsubscribe(c *fiber.Ctx) error {
	token := c.Params("token")
	s, err := h.repo.UnsubscribeByToken(c.Context(), token)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id_blog": s.IDBlog,
			"email":   s.Email,
			"status":  s.Status,
		},
	})
}

// GET /api/v1/me/blog/subscribers — owner dashboard list.
func (h *Handler) ListMine(c *fiber.Ctx) error {
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	res, lerr := h.repo.ListForOwner(c.Context(), idBlog, limit, offset)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

// =============================================================================
// ROUTING
// =============================================================================

// RegisterPublicRoutes registers public subscribe endpoints.
//
// limiter — rate limit middleware applied ke POST subscribe path (5/menit/IP)
// untuk prevent email spam abuse. nil = skip rate limit (dev convenience).
// Confirm/unsubscribe GET endpoints tidak di-rate-limit karena one-shot token
// (replay sudah dijaga di repo level).
func RegisterPublicRoutes(api fiber.Router, h *Handler, limiter fiber.Handler) {
	if limiter != nil {
		api.Post("/blogs/by-subdomain/:subdomain/subscribe", limiter, h.Subscribe)
	} else {
		api.Post("/blogs/by-subdomain/:subdomain/subscribe", h.Subscribe)
	}
	api.Get("/blogs/subscribe/confirm/:token", h.Confirm)
	api.Get("/blogs/subscribe/unsubscribe/:token", h.Unsubscribe)
}

func RegisterMineRoutes(me fiber.Router, h *Handler) {
	me.Get("/blog/subscribers", h.ListMine)
}
