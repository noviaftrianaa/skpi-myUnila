package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init menginisialisasi auth module dan mendaftarkan routes
func Init(router fiber.Router, db *sqlx.DB) Service {
	// Initialize layers
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	// Register routes
	authGroup := router.Group("/auth")
	{
		// Public endpoints (no auth required)
		authGroup.Post("/login", handler.Login)
		authGroup.Post("/check-token", handler.CheckToken)
	}

	return svc
}
