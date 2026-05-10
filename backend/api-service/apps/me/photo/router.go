package photo

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// RegisterRoutes mount endpoint /me/foto pada router yang sudah include
// auth middleware (KongAuth) dari caller.
func RegisterRoutes(router fiber.Router, db *sqlx.DB) {
	h := NewHandler(db)

	router.Get("/foto", h.GetMyPhoto)
	router.Post("/foto", h.UploadMyPhoto)
	router.Delete("/foto", h.DeleteMyPhoto)
}
