package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/siakadu_api"
)

func Init(router fiber.Router, db *sqlx.DB, siakaduAPI *siakadu_api.SiakaduClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siakaduAPI)
	handler := NewHandler(svc)

	group := router.Group("/siakadu/referensi")
	{
		group.Post("/unit/sync", handler.SyncUnits)
		group.Get("/prodi", handler.GetProdiList)
		group.Get("/pimpinan/:id_unit", handler.GetPimpinan)
	}

	return svc
}
