package dosen

import (
	"github.com/gofiber/fiber/v2"
	"sister-service/external/sister_api"
)

// Init initializes dosen routes (public endpoints)
func Init(router fiber.Router, sisterAPI *sister_api.Client) {
	svc := NewService(sisterAPI)
	ctrl := NewController(svc)

	// Public dosen routes (no authentication required)
	dosenRouter := router.Group("/dosen")
	{
		// GET /public/dosen/photo/:id_sdm - Get dosen photo from SISTER API
		dosenRouter.Get("/photo/:id_sdm", ctrl.GetDosenPhoto)

		// GET /public/dosen/bidang_ilmu/:id_sdm - Get dosen bidang keahlian from SISTER API
		dosenRouter.Get("/bidang_ilmu/:id_sdm", ctrl.GetDosenBidangIlmu)
	}
}
