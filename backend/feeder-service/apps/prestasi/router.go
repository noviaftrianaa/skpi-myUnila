package prestasi

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes prestasi routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Prestasi routes
	prestasiRouter := router.Group("/prestasi")
	{
		// GET /prestasi - Get paginated list of prestasi
		prestasiRouter.Get("/", ctrl.GetList)

		// GET /prestasi/stats - Get statistics
		prestasiRouter.Get("/stats", ctrl.GetStats)

		// GET /prestasi/tahun - Get list of available years for dropdown
		prestasiRouter.Get("/tahun", ctrl.GetTahunList)

		// POST /prestasi/sync - Sync prestasi from Neo Feeder API
		prestasiRouter.Post("/sync", ctrl.Sync)
	}

	return svc
}
