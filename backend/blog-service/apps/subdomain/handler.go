package subdomain

import (
	"context"
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ClaimLogger — interface untuk log klaim ke audit table (interaction.klaim_subdomain).
// Dipakai supaya subdomain package gak coupling ke moderation. Implementasi: moderation.KlaimRepository.
type ClaimLogger interface {
	LogClaim(ctx context.Context, idPengguna, idTipeRole uuid.UUID, subdomain string, validasi []byte) error
}

type Handler struct {
	repo        *Repository
	claimLogger ClaimLogger
}

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

// SetClaimLogger — optional logger; kalau nil, claim flow skip log.
func (h *Handler) SetClaimLogger(l ClaimLogger) { h.claimLogger = l }

// OptionWithValidation — pair generator output + per-option validation.
type OptionWithValidation struct {
	Option
	Available  bool   `json:"available"`
	Reason     string `json:"reason,omitempty"`
}

// GET /api/v1/me/blog/subdomain/options
// Generate 5 opsi dari profil JWT + pre-validate semua.
func (h *Handler) Options(c *fiber.Ctx) error {
	username, _ := c.Locals("username").(string)
	name, _ := c.Locals("name").(string)
	role, _ := c.Locals("role").(string)
	if username == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "username missing from JWT")
	}

	options := Generate(ProfileInput{
		Username: username,
		Name:     name,
		Role:     role,
	})

	// Pre-validate setiap opsi
	out := make([]OptionWithValidation, 0, len(options))
	for _, opt := range options {
		v, err := h.repo.ValidateOption(c.Context(), opt.Subdomain)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		out = append(out, OptionWithValidation{
			Option:    opt,
			Available: v.Available,
			Reason:    v.Reason,
		})
	}

	suffix := RoleToSuffix(role)
	tipeRoleKode := strings.ToUpper(suffix)
	if suffix == "mhs" {
		tipeRoleKode = "MHS"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"options":        out,
			"tipe_role_kode": tipeRoleKode,
			"profile": fiber.Map{
				"username": username,
				"name":     name,
				"role":     role,
			},
		},
	})
}

// POST /api/v1/me/blog/subdomain/check  body: { "subdomain": "..." }
// Validate satu subdomain tanpa generate (untuk manual appeal flow).
func (h *Handler) Check(c *fiber.Ctx) error {
	var body struct {
		Subdomain string `json:"subdomain"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if strings.TrimSpace(body.Subdomain) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "subdomain required")
	}
	v, err := h.repo.ValidateOption(c.Context(), strings.ToLower(strings.TrimSpace(body.Subdomain)))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": v})
}

// POST /api/v1/me/blog/claim
// Body: { subdomain, nm_blog, nm_tampilan, tagline }
// Create blog.blog row linked ke id_pengguna_pdut dari JWT.
func (h *Handler) Claim(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user_id in JWT")
	}
	idPengguna, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id UUID")
	}

	role, _ := c.Locals("role").(string)
	suffix := RoleToSuffix(role)
	tipeRoleKode := strings.ToUpper(suffix)
	if suffix == "mhs" {
		tipeRoleKode = "MHS"
	}

	var in ClaimInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	in.Subdomain = strings.ToLower(strings.TrimSpace(in.Subdomain))

	if in.NmTampilan == "" {
		// Fallback ke name dari JWT
		if name, _ := c.Locals("name").(string); name != "" {
			in.NmTampilan = name
		}
	}

	result, err := h.repo.Claim(c.Context(), idPengguna, tipeRoleKode, in)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidFormat),
			errors.Is(err, ErrAlreadyTaken),
			errors.Is(err, ErrAlreadyHasBlog),
			errors.Is(err, ErrTipeRoleInvalid):
			return fiber.NewError(fiber.StatusConflict, err.Error())
		case errors.Is(err, ErrReservedWord):
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		default:
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	}
	idBlog := result.IDBlog

	// Audit log ke moderation.klaim_subdomain (fire-and-forget, gak block response).
	if h.claimLogger != nil {
		_ = h.claimLogger.LogClaim(c.Context(), idPengguna, result.IDTipeRole, in.Subdomain, result.ValidasiJSON)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id_blog":   idBlog,
			"subdomain": in.Subdomain,
		},
	})
}

func RegisterRoutes(me fiber.Router, h *Handler) {
	g := me.Group("/blog")
	g.Get("/subdomain/options", h.Options)
	g.Post("/subdomain/check", h.Check)
	g.Post("/claim", h.Claim)
}
