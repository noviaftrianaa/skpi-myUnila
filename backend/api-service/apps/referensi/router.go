package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/internal/middleware"
)

// RegisterRoutes mendaftarkan routes untuk referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	// Group referensi dengan JWT auth middleware
	ref := router.Group("/referensi", middleware.JWTAuth())

	// Endpoints
	ref.Get("/semester", handler.GetSemesters)
	ref.Get("/tahun-ajaran", handler.GetTahunAjarans)
	ref.Get("/agama", handler.GetAgamas)
	ref.Get("/wilayah", handler.GetWilayahs)
}
