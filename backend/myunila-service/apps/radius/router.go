package radius

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/radius_api"
)

// Init initializes the radius module and registers routes
func Init(router fiber.Router, db *sqlx.DB, radiusAPI *radius_api.RadiusClient) Service {
	// Initialize repository
	repo := NewRepository(db)

	// Initialize service
	svc := NewService(repo, radiusAPI)

	// Set global service for scheduler access
	SetService(svc)

	// Initialize handler
	handler := NewHandler(svc)

	// Register routes under /radius
	radiusGroup := router.Group("/radius")
	{
		// Stats routes
		radiusGroup.Get("/stats", handler.GetRadiusStats)

		// Sync route
		radiusGroup.Post("/sync", handler.SyncFromRadius)

		// Pengguna routes
		penggunaGroup := radiusGroup.Group("/pengguna")
		{
			penggunaGroup.Get("/", handler.GetPenggunaList)
			penggunaGroup.Get("/stats", handler.GetPenggunaStats)
			penggunaGroup.Get("/:id", handler.GetPenggunaByID)
		}
	}

	return svc
}
