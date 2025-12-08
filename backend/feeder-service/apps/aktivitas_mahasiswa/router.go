package aktivitas_mahasiswa

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/external/feeder_api"
)

// Init initializes aktivitas_mahasiswa routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, feederAPI *feeder_api.FeederClient, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, feederAPI, redisClient, loggerSvc)
	ctrl := NewController(svc)

	// Aktivitas Mahasiswa routes
	aktivitasRouter := router.Group("/aktivitas-mahasiswa")
	{
		// GET /aktivitas-mahasiswa - Get paginated list of aktivitas with search and filters
		aktivitasRouter.Get("/", ctrl.GetAktivitasList)

		// GET /aktivitas-mahasiswa/stats - Get statistics
		aktivitasRouter.Get("/stats", ctrl.GetStats)

		// GET /aktivitas-mahasiswa/prodi - Get list of active prodi
		aktivitasRouter.Get("/prodi", ctrl.GetProdiList)

		// GET /aktivitas-mahasiswa/semester - Get list of semesters with aktivitas data
		aktivitasRouter.Get("/semester", ctrl.GetSemesterList)

		// GET /aktivitas-mahasiswa/jenis - Get list of jenis aktivitas
		aktivitasRouter.Get("/jenis", ctrl.GetJenisAktivitasList)

		// POST /aktivitas-mahasiswa/sync - Sync aktivitas mahasiswa from Neo Feeder API
		aktivitasRouter.Post("/sync", ctrl.SyncAktivitasMahasiswa)

		// GET /aktivitas-mahasiswa/detail/:id_akt_mhs - Get aktivitas detail by ID
		aktivitasRouter.Get("/detail/:id_akt_mhs", ctrl.GetAktivitasDetail)
	}

	return svc
}
