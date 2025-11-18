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

	// API routes (authenticated with JWT at Kong level)
	api := router.Group("/api/v1")
	dosenAPI := api.Group("/dosen")
	{
		// Sync routes (POST)
		dosenAPI.Post("/sync", ctrl.SyncDosenFromSister)
		dosenAPI.Post("/test/:id_sdm", ctrl.SyncSingleDosenTest)

		// GET routes (also protected with JWT)
		dosenAPI.Get("/", ctrl.GetDosenList)
		dosenAPI.Get("/stats", ctrl.GetDosenStats)
		dosenAPI.Get("/bidang_ilmu/:id_sdm", ctrl.GetDosenBidangIlmu)
		dosenAPI.Get("/:id_sdm", ctrl.GetDosenDetail)
	}

	// Public routes (no JWT required) - only for photo
	publicAPI := router.Group("/public/api/v1")
	publicAPI.Get("/dosen/photo/:id_sdm", ctrl.GetDosenPhoto)

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
