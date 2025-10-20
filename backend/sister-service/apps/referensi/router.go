package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/external/sister_api"
	"sister-service/internal/middleware"
)

// Init initializes referensi routes
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, sisterAPI)
	ctrl := NewController(svc)

	// All referensi routes require JWT authentication and Developer role
	referensiRouter := router.Group("/referensi")
	referensiRouter.Use(middleware.JWTAuth())
	referensiRouter.Use(middleware.RequireDeveloper())
	{
		// Agama routes
		agamaRouter := referensiRouter.Group("/agama")
		{
			agamaRouter.Get("/", ctrl.GetAllAgama)
			agamaRouter.Get("/:id", ctrl.GetAgamaByID)
			agamaRouter.Post("/sync", ctrl.SyncAgamaFromSister)
		}
	}
}
