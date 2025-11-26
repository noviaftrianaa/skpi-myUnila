package rencana_evaluasi

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes rencana_evaluasi routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Rencana Evaluasi routes
	reRouter := router.Group("/rencana-evaluasi")
	{
		// GET /rencana-evaluasi - Get paginated list with search and filters
		reRouter.Get("/", ctrl.GetRencanaEvaluasiList)

		// GET /rencana-evaluasi/stats - Get statistics
		reRouter.Get("/stats", ctrl.GetStats)

		// GET /rencana-evaluasi/jenis-evaluasi - Get list of jenis evaluasi
		reRouter.Get("/jenis-evaluasi", ctrl.GetJenisEvaluasiList)

		// GET /rencana-evaluasi/helper/prodi - Get list of prodi (helper endpoint)
		reRouter.Get("/helper/prodi", ctrl.GetProdiList)

		// POST /rencana-evaluasi/sync - Sync rencana evaluasi from Neo Feeder API
		reRouter.Post("/sync", ctrl.SyncRencanaEvaluasi)

		// GET /rencana-evaluasi/:id - Get rencana evaluasi detail by ID (MUST BE LAST to avoid catching other routes)
		reRouter.Get("/:id", ctrl.GetRencanaEvaluasiByID)
	}

	return svc
}
