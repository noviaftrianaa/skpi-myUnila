package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/sikep_api"
)

// Init initializes the referensi module and registers routes
func Init(router fiber.Router, db *sqlx.DB, sikepAPI *sikep_api.SikepClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, sikepAPI)
	handler := NewHandler(svc)

	// Register routes under /sikep/referensi
	refGroup := router.Group("/sikep/referensi")

	// Metadata endpoint
	refGroup.Get("/metadata", handler.GetMetadata)

	// Batch sync endpoint
	refGroup.Post("/batch-sync", handler.BatchSync)

	// Paginated data endpoint (generic for all types)
	refGroup.Get("/data/:key", handler.GetEndpointDataPaginated)

	// Individual data endpoints (legacy - returns all data)
	refGroup.Get("/organisasi", handler.GetOrganisasi)
	refGroup.Get("/fungsional", handler.GetFungsional)
	refGroup.Get("/struktural", handler.GetStruktural)
	refGroup.Get("/golongan-pns", handler.GetGolonganPNS)
	refGroup.Get("/golongan-pppk", handler.GetGolonganPPPK)
	refGroup.Get("/pendidikan", handler.GetPendidikan)

	// Individual sync endpoints
	refGroup.Post("/organisasi/sync", handler.SyncOrganisasi)
	refGroup.Post("/fungsional/sync", handler.SyncFungsional)
	refGroup.Post("/struktural/sync", handler.SyncStruktural)
	refGroup.Post("/golongan-pns/sync", handler.SyncGolonganPNS)
	refGroup.Post("/golongan-pppk/sync", handler.SyncGolonganPPPK)
	refGroup.Post("/pendidikan/sync", handler.SyncPendidikan)

	return svc
}
