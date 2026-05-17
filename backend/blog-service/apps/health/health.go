package health

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	db *sqlx.DB
}

func NewHandler(db *sqlx.DB) *Handler { return &Handler{db: db} }

// GET /health
func (h *Handler) Health(c *fiber.Ctx) error {
	resp := fiber.Map{
		"service": "blog-service",
		"status":  "ok",
		"time":    time.Now().Format(time.RFC3339),
	}

	// DB ping (timeout 2s biar tidak block lama kalau down)
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()
	if err := h.db.PingContext(ctx); err != nil {
		resp["status"] = "degraded"
		resp["db"] = "error: " + err.Error()
		return c.Status(fiber.StatusServiceUnavailable).JSON(resp)
	}
	resp["db"] = "ok"
	return c.JSON(resp)
}

func RegisterRoutes(app *fiber.App, h *Handler) {
	app.Get("/health", h.Health)
	app.Get("/healthz", h.Health) // K8s-style
}
