package unit_organisasi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// RegisterRoutes registers unit organisasi routes and returns the service
func RegisterRoutes(api fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	handler := NewHandler(svc)

	// Group routes under /manakses/unit-organisasi
	group := api.Group("/manakses/unit-organisasi")

	// Stats
	group.Get("/stats", handler.GetStats)

	// SMS (source data from pdrd.sms)
	group.Get("/sms", handler.GetSMSList)

	// Unit Organisasi (target data in man_akses.unit_organisasi)
	group.Get("/", handler.GetUnitOrganisasiList)

	// Comparison view
	group.Get("/comparison", handler.GetComparisonList)

	// Sync operation
	group.Post("/sync", handler.SyncFromSMS)

	return svc
}
