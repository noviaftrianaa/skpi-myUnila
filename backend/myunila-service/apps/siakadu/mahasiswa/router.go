package mahasiswa

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/siakadu_api"
)

// Init initializes the mahasiswa module and registers routes
func Init(router fiber.Router, db *sqlx.DB, siakaduAPI *siakadu_api.SiakaduClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siakaduAPI)
	handler := NewHandler(svc)

	group := router.Group("/siakadu/mahasiswa")
	{
		group.Get("/", handler.GetList)
		group.Get("/stats", handler.GetStats)
		group.Get("/:nim", handler.GetByNIM)
		group.Post("/sync", handler.Sync)
		group.Post("/sync-all", handler.SyncAll)
	}

	return svc
}
