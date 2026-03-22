package nilai

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/siakadu_api"
)

// Init initializes the nilai module and registers routes
func Init(router fiber.Router, db *sqlx.DB, siakaduAPI *siakadu_api.SiakaduClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siakaduAPI)
	handler := NewHandler(svc)

	group := router.Group("/siakadu/nilai")
	{
		group.Get("/khs", handler.GetKHSList)
		group.Post("/khs/sync", handler.SyncKHS)
		group.Get("/transkrip", handler.GetTranskripList)
		group.Post("/transkrip/sync", handler.SyncTranskrip)
		group.Get("/kuliah", handler.GetKuliahList)
		group.Post("/kuliah/sync", handler.SyncKuliah)
	}

	return svc
}
