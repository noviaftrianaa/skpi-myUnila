package matkul_kurikulum

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes matkul_kurikulum routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Matkul Kurikulum routes
	kurikulumRouter := router.Group("/kurikulum")
	{
		// GET /kurikulum - Get paginated list of kurikulum with search and filters
		kurikulumRouter.Get("/", ctrl.GetKurikulumList)

		// GET /kurikulum/stats - Get statistics
		kurikulumRouter.Get("/stats", ctrl.GetStats)

		// GET /kurikulum/prodi - Get list of active prodi
		kurikulumRouter.Get("/prodi", ctrl.GetProdiList)

		// POST /kurikulum/sync - Sync kurikulum from Neo Feeder API
		kurikulumRouter.Post("/sync", ctrl.SyncKurikulum)

		// GET /kurikulum/:id/matkul - Get list of matkul for a kurikulum
		kurikulumRouter.Get("/:id/matkul", ctrl.GetMatkulByKurikulum)

		// GET /kurikulum/:id - Get kurikulum detail by ID (MUST BE LAST to avoid catching other routes)
		kurikulumRouter.Get("/:id", ctrl.GetKurikulumDetail)
	}

	// Matkul routes (separate from kurikulum)
	matkulRouter := router.Group("/matkul")
	{
		// POST /matkul/sync - Sync all matkul from Neo Feeder API (bulk sync)
		matkulRouter.Post("/sync", ctrl.SyncMatkul)
	}

	return svc
}
