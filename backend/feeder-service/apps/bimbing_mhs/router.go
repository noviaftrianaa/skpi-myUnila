package bimbing_mhs

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes bimbing_mhs routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Bimbing Mhs routes
	bimbingMhsRouter := router.Group("/bimbing-mhs")
	{
		// GET /bimbing-mhs - Get paginated list
		bimbingMhsRouter.Get("/", ctrl.GetList)

		// GET /bimbing-mhs/stats - Get statistics
		bimbingMhsRouter.Get("/stats", ctrl.GetStats)

		// GET /bimbing-mhs/prodi - Get list of active prodi
		bimbingMhsRouter.Get("/prodi", ctrl.GetProdiList)

		// POST /bimbing-mhs/sync - Sync from Feeder API
		bimbingMhsRouter.Post("/sync", ctrl.SyncBimbingMhs)

		// Test endpoints - for comparing API response structures
		testRouter := bimbingMhsRouter.Group("/test")
		{
			// GET /bimbing-mhs/test/dosen-pembimbing - Test GetDosenPembimbing endpoint
			testRouter.Get("/dosen-pembimbing", ctrl.TestGetDosenPembimbing)

			// GET /bimbing-mhs/test/mahasiswa-bimbingan - Test GetMahasiswaBimbinganDosen endpoint
			testRouter.Get("/mahasiswa-bimbingan", ctrl.TestGetMahasiswaBimbinganDosen)

			// GET /bimbing-mhs/test/list-bimbing - Test GetListBimbingMahasiswa endpoint
			testRouter.Get("/list-bimbing", ctrl.TestGetListBimbingMahasiswa)

			// GET /bimbing-mhs/test/compare - Compare all three endpoints
			testRouter.Get("/compare", ctrl.TestCompareEndpoints)
		}
	}

	return svc
}
