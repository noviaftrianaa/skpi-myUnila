package spp_mhs

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/external/simpedam"
)

// Init initializes the spp_mhs module
func Init(router fiber.Router, db *sqlx.DB, simpedamAPI *simpedam.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, simpedamAPI, loggerSvc)
	ctrl := NewController(svc)

	// Register routes
	sppMhs := router.Group("/spp-mhs")
	sppMhs.Get("/", ctrl.GetSppMhsList)
	sppMhs.Get("/stats", ctrl.GetStats)
	sppMhs.Get("/semesters", ctrl.GetAvailableSemesters)
	sppMhs.Get("/semesters/all", ctrl.GetAllSemesters)
	sppMhs.Get("/mahasiswa/:npm", ctrl.GetSppMhsByNPM)
	sppMhs.Get("/mahasiswa/:npm/summary", ctrl.GetMahasiswaPaymentSummary)
	sppMhs.Get("/:id", ctrl.GetSppMhsByID)
	sppMhs.Post("/sync", ctrl.SyncSppMhs)

	return svc
}
