package mahasiswa

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes mahasiswa routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Mahasiswa routes
	mahasiswaRouter := router.Group("/mahasiswa")
	{
		// GET /mahasiswa - Get paginated list of mahasiswa with search and filters
		mahasiswaRouter.Get("/", ctrl.GetMahasiswaList)

		// GET /mahasiswa/stats - Get mahasiswa statistics (must be before /:id_pd to avoid conflict)
		mahasiswaRouter.Get("/stats", ctrl.GetMahasiswaStats)

		// Helper endpoints
		helperRouter := mahasiswaRouter.Group("/helper")
		{
			// GET /mahasiswa/helper/angkatan - Get list of available angkatan
			helperRouter.Get("/angkatan", ctrl.GetAngkatanList)

			// GET /mahasiswa/helper/prodi - Get list of active prodi
			helperRouter.Get("/prodi", ctrl.GetProdiList)
		}

		// POST /mahasiswa/sync - Sync mahasiswa from Neo Feeder API by angkatan
		mahasiswaRouter.Post("/sync", ctrl.SyncMahasiswaByAngkatan)

		// POST /mahasiswa/sync-one/:id_pd - Test sync single mahasiswa (for debugging)
		mahasiswaRouter.Post("/sync-one/:id_pd", ctrl.SyncSingleMahasiswaTest)

		// GET /mahasiswa/:id_pd - Get mahasiswa detail by ID (MUST BE LAST to avoid catching other routes)
		mahasiswaRouter.Get("/:id_pd", ctrl.GetMahasiswaDetail)
	}

	return svc
}
