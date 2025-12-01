package nilai_konversi

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes nilai_konversi routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Nilai Konversi routes
	nilaiRouter := router.Group("/nilai-konversi")
	{
		// GET /nilai-konversi - Get paginated list of nilai konversi (combined view)
		nilaiRouter.Get("/", ctrl.GetNilaiKonversiList)

		// GET /nilai-konversi/stats - Get statistics
		nilaiRouter.Get("/stats", ctrl.GetStats)

		// Helper routes
		helperRouter := nilaiRouter.Group("/helper")
		{
			// GET /nilai-konversi/helper/prodi - Get list of active prodi
			helperRouter.Get("/prodi", ctrl.GetProdiList)

			// GET /nilai-konversi/helper/semester - Get list of semesters with nilai konversi/transfer data
			helperRouter.Get("/semester", ctrl.GetSemesterList)
		}

		// POST /nilai-konversi/sync - Sync nilai konversi from Neo Feeder API
		nilaiRouter.Post("/sync", ctrl.SyncNilaiKonversi)
	}

	return svc
}
