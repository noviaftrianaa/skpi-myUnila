package dosen

import (
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/apps/logger"
	"sister-service/external/sister_api"
	minioClient "sister-service/internal/minio"
	"sister-service/pkg/crypto"
)

// Init initializes dosen routes (public endpoints) with Redis caching and returns the service
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client, redisClient *redis.Client, loggerSvc logger.Service, laravelCrypto *crypto.LaravelEncryption, minio *minioClient.Client) Service {
	repo := NewRepository(db)
	svc := NewService(sisterAPI, redisClient, repo, loggerSvc, minio)

	// Use controller with crypto for public routes that need encrypted ID
	ctrl := NewControllerWithCrypto(svc, laravelCrypto)

	// API routes (authenticated with JWT at Kong level)
	api := router.Group("/api/v1")
	dosenAPI := api.Group("/dosen")
	{
		// Sync routes (POST)
		dosenAPI.Post("/sync", ctrl.SyncDosenFromSister)
		dosenAPI.Post("/sync-photos", ctrl.SyncDosenPhotos)
		dosenAPI.Post("/sync-dokumen", ctrl.SyncDosenDokumen)
		dosenAPI.Post("/test/:id_sdm", ctrl.SyncSingleDosenTest)

		// GET routes (also protected with JWT)
		dosenAPI.Get("/", ctrl.GetDosenList)
		dosenAPI.Get("/stats", ctrl.GetDosenStats)
		dosenAPI.Get("/bidang_ilmu/:id_sdm", ctrl.GetDosenBidangIlmu)
		// Dokumen routes — download must be before /:id_sdm to avoid param collision
		dosenAPI.Get("/dokumen/download/:id_dok", ctrl.DownloadDosenDokumen)
		dosenAPI.Get("/dokumen/:id_sdm", ctrl.GetDosenDokumenList)
		dosenAPI.Get("/:id_sdm", ctrl.GetDosenDetail)
	}

	// Public routes (no JWT required) - photo uses encrypted_id
	publicAPI := router.Group("/public/api/v1")
	publicAPI.Get("/dosen/photo/:encrypted_id", ctrl.GetDosenPhoto)

	return svc
}

// InitPhotoRoute initializes the photo endpoint without authentication
// This route is registered directly on the app (not under /public group)
func InitPhotoRoute(app fiber.Router, svc Service, laravelCrypto *crypto.LaravelEncryption) {
	ctrl := NewControllerWithCrypto(svc, laravelCrypto)

	// Truly public photo route (no authentication required)
	// GET /dosen/photo/:encrypted_id - Get dosen photo from SISTER API (with Redis cache)
	app.Get("/dosen/photo/:encrypted_id", ctrl.GetDosenPhoto)
}
