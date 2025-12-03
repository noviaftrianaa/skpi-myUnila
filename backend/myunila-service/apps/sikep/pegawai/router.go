package pegawai

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/sikep_api"
)

// Init initializes the pegawai module and registers routes
func Init(router fiber.Router, db *sqlx.DB, sikepAPI *sikep_api.SikepClient) Service {
	// Initialize repository
	repo := NewRepository(db)

	// Initialize service
	svc := NewService(repo, sikepAPI)

	// Initialize handler
	handler := NewHandler(svc)

	// Register routes under /sikep/pegawai
	pegawaiGroup := router.Group("/sikep/pegawai")
	{
		pegawaiGroup.Get("/", handler.GetPegawaiList)
		pegawaiGroup.Get("/stats", handler.GetPegawaiStats)
		pegawaiGroup.Get("/:id", handler.GetPegawaiByID)
		pegawaiGroup.Post("/sync", handler.SyncPegawai)
	}

	return svc
}
