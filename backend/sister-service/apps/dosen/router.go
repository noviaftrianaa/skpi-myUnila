package dosen

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Init initializes dosen routes (public endpoints) with Redis caching and returns the service
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client, redisClient *redis.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(sisterAPI, redisClient, repo, loggerSvc)
	ctrl := NewController(svc)

	// Public dosen routes (with authentication)
	// NOTE: Photo endpoint is registered separately without auth in InitPhotoRoute()
	dosenRouter := router.Group("/dosen")
	{
		// GET /public/dosen - Get paginated list of dosen with search and filters
		dosenRouter.Get("/", ctrl.GetDosenList)

		// GET /public/dosen/stats - Get dosen statistics (must be before /:id_sdm to avoid conflict)
		dosenRouter.Get("/stats", ctrl.GetDosenStats)

		// GET /public/dosen/bidang_ilmu/:id_sdm - Get dosen bidang keahlian from SISTER API
		dosenRouter.Get("/bidang_ilmu/:id_sdm", ctrl.GetDosenBidangIlmu)

		// GET /public/dosen/:id_sdm - Get dosen detail by ID
		dosenRouter.Get("/:id_sdm", ctrl.GetDosenDetail)

		// POST /public/dosen/sync - Sync all Unila dosen from SISTER API to database
		dosenRouter.Post("/sync", ctrl.SyncDosenFromSister)

		// POST /public/dosen/test/:id_sdm - Test sync single dosen (for debugging)
		dosenRouter.Post("/test/:id_sdm", ctrl.SyncSingleDosenTest)
	}

	return svc
}

// InitPhotoRoute initializes the photo endpoint without authentication
// This route is registered directly on the app (not under /public group)
func InitPhotoRoute(app fiber.Router, svc Service) {
	ctrl := NewController(svc)

	// Truly public photo route (no authentication required)
	// GET /dosen/photo/:id_sdm - Get dosen photo from SISTER API (with Redis cache)
	app.Get("/dosen/photo/:id_sdm", ctrl.GetDosenPhoto)
}
