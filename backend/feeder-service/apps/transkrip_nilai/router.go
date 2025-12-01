package transkrip_nilai

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes transkrip_nilai routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Transkrip Nilai routes
	transkripRouter := router.Group("/transkrip-nilai")
	{
		// GET /transkrip-nilai - Get paginated list of transkrip nilai
		transkripRouter.Get("/", ctrl.GetTranskripNilaiList)

		// GET /transkrip-nilai/stats - Get statistics
		transkripRouter.Get("/stats", ctrl.GetStats)

		// Helper routes
		helperRouter := transkripRouter.Group("/helper")
		{
			// GET /transkrip-nilai/helper/prodi - Get list of prodi
			helperRouter.Get("/prodi", ctrl.GetProdiList)

			// GET /transkrip-nilai/helper/semester - Get list of semesters
			helperRouter.Get("/semester", ctrl.GetSemesterList)
		}

		// POST /transkrip-nilai/sync - Sync transkrip nilai from Neo Feeder API
		transkripRouter.Post("/sync", ctrl.SyncTranskripNilai)
	}

	return svc
}
