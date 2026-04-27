package kerjasama

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init initializes the kerjasama module and registers routes.
// Mengikuti pola apps/radius dan apps/siakadu (Init return Service supaya
// bisa di-pass ke scheduler.NewService).
func Init(router fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	client := NewSikermaClient()
	svc := NewService(repo, client)
	handler := NewHandler(svc)

	group := router.Group("/kerjasama")
	{
		// MoU read
		group.Get("/mou", handler.ListMou)
		group.Get("/mou/stats", handler.MouStats)
		group.Get("/mou/:id", handler.MouDetail)

		// Sync
		group.Post("/sync", handler.Sync)

		// Unit mapping (audit + manual override)
		group.Get("/unit-mapping", handler.ListUnitMapping)
		group.Get("/unit-mapping/stats", handler.UnitMappingStats)
		group.Patch("/unit-mapping/:sikerma_unit_id", handler.UpdateUnitMapping)
	}

	return svc
}
