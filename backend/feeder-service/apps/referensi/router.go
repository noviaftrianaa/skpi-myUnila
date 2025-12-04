package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes referensi routes
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, loggerSvc)
	ctrl := NewController(svc)

	// Referensi routes
	referensiRouter := router.Group("/referensi")
	{
		// GET /referensi/endpoints - Get available endpoints
		referensiRouter.Get("/endpoints", ctrl.GetAvailableEndpoints)

		// GET /referensi/stats - Get all referensi stats
		referensiRouter.Get("/stats", ctrl.GetAllStats)

		// POST /referensi/sync - Sync multiple endpoints
		referensiRouter.Post("/sync", ctrl.SyncMultiple)

		// GET /referensi/:endpoint_key - Get data for specific endpoint
		referensiRouter.Get("/:endpoint_key", ctrl.GetData)

		// GET /referensi/:endpoint_key/stats - Get stats for specific endpoint
		referensiRouter.Get("/:endpoint_key/stats", ctrl.GetEndpointStats)

		// POST /referensi/:endpoint_key/sync - Sync specific endpoint
		referensiRouter.Post("/:endpoint_key/sync", ctrl.SyncEndpoint)

		// GET /referensi/:endpoint_key/:id - Get detail for specific record
		referensiRouter.Get("/:endpoint_key/:id", ctrl.GetDetail)
	}

	return svc
}
