package daftar_ukt

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/external/simpedam"
)

// Init initializes the daftar_ukt module
func Init(router fiber.Router, db *sqlx.DB, simpedamAPI *simpedam.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, simpedamAPI, loggerSvc)
	ctrl := NewController(svc)

	// Register routes
	daftarUKT := router.Group("/daftar-ukt")
	daftarUKT.Get("/", ctrl.GetDaftarUKTList)
	daftarUKT.Get("/stats", ctrl.GetStats)
	daftarUKT.Get("/fakultas", ctrl.GetFakultasList)
	daftarUKT.Get("/prodi", ctrl.GetProdiList)
	daftarUKT.Get("/mappings", ctrl.GetProdiMappings)
	daftarUKT.Get("/:id", ctrl.GetDaftarUKTByID)
	daftarUKT.Post("/sync", ctrl.SyncDaftarUKT)

	return svc
}
