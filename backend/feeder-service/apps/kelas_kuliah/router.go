package kelas_kuliah

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes kelas_kuliah routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Kelas Kuliah routes
	kelasRouter := router.Group("/kelas-kuliah")
	{
		// GET /kelas-kuliah - Get paginated list of kelas kuliah with search and filters
		kelasRouter.Get("/", ctrl.GetKelasKuliahList)

		// GET /kelas-kuliah/stats - Get statistics
		kelasRouter.Get("/stats", ctrl.GetStats)

		// Helper routes
		helperRouter := kelasRouter.Group("/helper")
		{
			// GET /kelas-kuliah/helper/prodi - Get list of active prodi
			helperRouter.Get("/prodi", ctrl.GetProdiList)

			// GET /kelas-kuliah/helper/semester - Get list of semesters with kelas kuliah data
			helperRouter.Get("/semester", ctrl.GetSemesterList)
		}

		// POST /kelas-kuliah/sync - Sync kelas kuliah from Neo Feeder API
		kelasRouter.Post("/sync", ctrl.SyncKelasKuliah)

		// GET /kelas-kuliah/:id_kls - Get kelas kuliah detail by ID (MUST BE LAST)
		kelasRouter.Get("/:id_kls", ctrl.GetKelasKuliahDetail)
	}

	return svc
}
