package mail

import (
	"context"
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	cfgRepo    *ConfigRepository
	outboxRepo *OutboxRepository
	sender     *Sender
}

func NewHandler(cfgRepo *ConfigRepository, outboxRepo *OutboxRepository, sender *Sender) *Handler {
	return &Handler{cfgRepo: cfgRepo, outboxRepo: outboxRepo, sender: sender}
}

// =============================================================================
// ADMIN: CRUD over mail_config
// =============================================================================

// GET /api/v1/admin/mail-config — list all profiles
func (h *Handler) List(c *fiber.Ctx) error {
	rows, err := h.cfgRepo.List(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// POST /api/v1/admin/mail-config
func (h *Handler) Create(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idAdmin, _ := uuid.Parse(uid)
	var body configBody
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	cfg, err := h.cfgRepo.Create(c.Context(), body.toInput(true), idAdmin)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": cfg})
}

// PUT /api/v1/admin/mail-config/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	uid, _ := c.Locals("user_id").(string)
	idAdmin, _ := uuid.Parse(uid)
	var body configBody
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	cfg, uerr := h.cfgRepo.Update(c.Context(), id, body.toInput(false), idAdmin)
	if uerr != nil {
		if errors.Is(uerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "mail config not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": cfg})
}

// PATCH /api/v1/admin/mail-config/:id/activate — flip a_aktif on this row,
// deactivate all others. Singleton invariant kept by repo transaction.
func (h *Handler) Activate(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	if aerr := h.cfgRepo.SetActive(c.Context(), id); aerr != nil {
		if errors.Is(aerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "mail config not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, aerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/admin/mail-config/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	if derr := h.cfgRepo.Delete(c.Context(), id); derr != nil {
		if errors.Is(derr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "mail config not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, derr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// POST /api/v1/admin/mail-config/test-send
// Body: { recipient } — sends a synchronous test email using the ACTIVE config.
// Admin uses this after editing the profile to confirm SMTP works before
// flipping a_aktif on a new row.
func (h *Handler) TestSend(c *fiber.Ctx) error {
	var body struct {
		Recipient string `json:"recipient"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if body.Recipient == "" {
		return fiber.NewError(fiber.StatusBadRequest, "recipient required")
	}

	cfg, err := h.cfgRepo.GetActive(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusFailedDependency, err.Error())
	}

	subject := "Test email dari Blog Unila"
	html := wrapEmailHTML(
		"Test email",
		`<p>Email ini dikirim dari halaman admin SMTP config sebagai test delivery.</p>
<p style="color:#475569">Profil aktif: <strong>`+cfg.Label+`</strong> via <code>`+cfg.SMTPHost+`:`+fmt.Sprintf("%d", cfg.SMTPPort)+`</code></p>
<p>Kalau kamu lihat email ini, berarti konfigurasi SMTP sudah benar.</p>`,
		cfg.PublicURL+"/dashboard/blog-platform/admin/mail-config",
		cfg.PublicURL,
	)
	if serr := h.sender.Send(c.Context(), body.Recipient, subject, html, ""); serr != nil {
		return fiber.NewError(fiber.StatusBadGateway, "SMTP delivery failed: "+serr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"recipient": body.Recipient,
		"via":       fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort),
	}})
}

// GET /api/v1/admin/mail-config/outbox/stats
func (h *Handler) OutboxStats(c *fiber.Ctx) error {
	stats, err := h.outboxRepo.Stats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}

// GET /api/v1/admin/mail-config/outbox?status=&limit=50
func (h *Handler) OutboxList(c *fiber.Ctx) error {
	rows, err := h.outboxRepo.ListRecent(c.Context(), c.Query("status"), c.QueryInt("limit", 50))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// =============================================================================
// REQUEST BODY
// =============================================================================

type configBody struct {
	Label        string  `json:"label"`
	SMTPHost     string  `json:"smtp_host"`
	SMTPPort     int     `json:"smtp_port"`
	SMTPUsername *string `json:"smtp_username"`
	SMTPPassword *string `json:"smtp_password"`
	UseTLS       bool    `json:"use_tls"`
	UseSTARTTLS  bool    `json:"use_starttls"`
	FromAddress  string  `json:"from_address"`
	FromName     string  `json:"from_name"`
	PublicURL    string  `json:"public_url"`
	Catatan      *string `json:"catatan"`
}

func (b configBody) toInput(isCreate bool) ConfigInput {
	in := ConfigInput{
		Label:        b.Label,
		SMTPHost:     b.SMTPHost,
		SMTPPort:     b.SMTPPort,
		SMTPUsername: b.SMTPUsername,
		UseTLS:       b.UseTLS,
		UseSTARTTLS:  b.UseSTARTTLS,
		FromAddress:  b.FromAddress,
		FromName:     b.FromName,
		PublicURL:    b.PublicURL,
		Catatan:      b.Catatan,
	}
	// On create: always store the supplied password (nil → leave empty).
	// On update: nil = leave existing alone, empty string = clear.
	if isCreate {
		in.SMTPPassword = b.SMTPPassword
	} else {
		in.SMTPPassword = b.SMTPPassword
	}
	return in
}

// =============================================================================
// ROUTING
// =============================================================================

func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	g := admin.Group("/mail-config")
	g.Get("/", h.List)
	g.Post("/", h.Create)
	g.Put("/:id", h.Update)
	g.Patch("/:id/activate", h.Activate)
	g.Delete("/:id", h.Delete)
	g.Post("/test-send", h.TestSend)
	g.Get("/outbox/stats", h.OutboxStats)
	g.Get("/outbox", h.OutboxList)
}

// Avoid unused-import warning when context isn't referenced after refactor.
var _ = context.Background
