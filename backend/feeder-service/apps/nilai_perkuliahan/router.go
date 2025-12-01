package nilai_perkuliahan

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes nilai_perkuliahan routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Nilai Perkuliahan routes
	nilaiRouter := router.Group("/nilai-perkuliahan")
	{
		// GET /nilai-perkuliahan - Get paginated list of nilai perkuliahan with search and filters
		nilaiRouter.Get("/", ctrl.GetNilaiPerkuliahanList)

		// GET /nilai-perkuliahan/stats - Get statistics
		nilaiRouter.Get("/stats", ctrl.GetStats)

		// Helper routes
		helperRouter := nilaiRouter.Group("/helper")
		{
			// GET /nilai-perkuliahan/helper/prodi - Get list of active prodi
			helperRouter.Get("/prodi", ctrl.GetProdiList)

			// GET /nilai-perkuliahan/helper/semester - Get list of semesters with nilai data
			helperRouter.Get("/semester", ctrl.GetSemesterList)

			// GET /nilai-perkuliahan/helper/kelas - Get list of kelas for sync dropdown
			helperRouter.Get("/kelas", ctrl.GetKelasListBySemesterAndProdi)
		}

		// POST /nilai-perkuliahan/sync - Sync nilai perkuliahan from Neo Feeder API
		nilaiRouter.Post("/sync", ctrl.SyncNilaiPerkuliahan)

		// GET /nilai-perkuliahan/kelas/:id_kls - Get nilai by kelas ID (MUST BE LAST)
		nilaiRouter.Get("/kelas/:id_kls", ctrl.GetNilaiByKelas)
	}

	return svc
}
