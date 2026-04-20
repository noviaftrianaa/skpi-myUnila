package wisuda

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/siakadu_api"
)

// Init initializes the wisuda module and registers routes
func Init(router fiber.Router, db *sqlx.DB, siakaduAPI *siakadu_api.SiakaduClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siakaduAPI)
	handler := NewHandler(svc)

	group := router.Group("/siakadu/wisuda")
	{
		group.Get("/", handler.GetWisudaList)
		group.Get("/stats", handler.GetWisudaStats)
		group.Get("/filters", handler.GetWisudaFilters)
		group.Post("/sync", handler.SyncWisuda)
	}

	return svc
}
