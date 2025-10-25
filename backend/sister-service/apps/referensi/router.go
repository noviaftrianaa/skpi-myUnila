package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Init initializes referensi routes
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc logger.Service) {
	repo := NewRepository(db)
	svc := NewService(repo, sisterAPI, loggerSvc)
	ctrl := NewController(svc)

	// TEMPORARY: All auth middleware disabled for testing
	// TODO: Re-enable auth before production
	referensiRouter := router.Group("/referensi")
	// referensiRouter.Use(middleware.KongAuth())           // DISABLED for testing
	// referensiRouter.Use(middleware.RequireDeveloper())   // DISABLED for testing
	{
		// Agama routes
		agamaRouter := referensiRouter.Group("/agama")
		{
			agamaRouter.Get("/", ctrl.GetAllAgama)
			agamaRouter.Get("/:id", ctrl.GetAgamaByID)
			agamaRouter.Post("/sync", ctrl.SyncAgamaFromSister)
		}

		// Negara routes
		negaraRouter := referensiRouter.Group("/negara")
		{
			negaraRouter.Get("/", ctrl.GetAllNegara)
			negaraRouter.Get("/:id", ctrl.GetNegaraByID)
			negaraRouter.Post("/sync", ctrl.SyncNegaraFromSister)
		}

		// Jenjang Pendidikan routes
		jenjangRouter := referensiRouter.Group("/jenjang-pendidikan")
		{
			jenjangRouter.Get("/", ctrl.GetAllJenjangPendidikan)
			jenjangRouter.Post("/sync", ctrl.SyncJenjangPendidikanFromSister)
		}

		// Gelar Akademik routes
		gelarRouter := referensiRouter.Group("/gelar-akademik")
		{
			gelarRouter.Get("/", ctrl.GetAllGelarAkademik)
			gelarRouter.Post("/sync", ctrl.SyncGelarAkademikFromSister)
		}

		// Semester routes
		semesterRouter := referensiRouter.Group("/semester")
		{
			semesterRouter.Get("/", ctrl.GetAllSemester)
			semesterRouter.Post("/sync", ctrl.SyncSemesterFromSister)
		}

		// Metadata & Batch Sync routes
		referensiRouter.Get("/metadata", ctrl.GetAllReferensiMetadata)
		referensiRouter.Post("/batch-sync", ctrl.BatchSyncFromSister)
	}
}
