package kkn

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/kkn_api"
)

func Init(router fiber.Router, db *sqlx.DB, kknAPI *kkn_api.KKNClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, kknAPI)
	handler := NewHandler(svc)

	group := router.Group("/kkn")
	{
		group.Get("/stats", handler.GetStats)
		group.Get("/groups", handler.GetGroups)
		group.Post("/sync/:group", handler.SyncGroup)
		group.Post("/sync-all", handler.SyncAll)
	}

	return svc
}
