package akademik

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/external/siakadu_api"
)

// Init initializes the akademik module and registers routes
func Init(router fiber.Router, db *sqlx.DB, siakaduAPI *siakadu_api.SiakaduClient) Service {
	repo := NewRepository(db)
	svc := NewService(repo, siakaduAPI)
	handler := NewHandler(svc)

	group := router.Group("/siakadu/akademik")
	{
		group.Get("/kelas/stats", handler.GetKelasStats)
		group.Get("/kelas/filters", handler.GetKelasFilters)
		group.Get("/kelas", handler.GetKelasList)
		group.Post("/kelas/sync", handler.SyncKelas)
		group.Get("/kurikulum/stats", handler.GetKurikulumStats)
		group.Get("/kurikulum/filters", handler.GetKurikulumFilters)
		group.Get("/kurikulum", handler.GetKurikulumList)
		group.Post("/kurikulum/sync", handler.SyncKurikulum)
		group.Get("/matakuliah/stats", handler.GetMatakuliahStats)
		group.Get("/matakuliah/filters", handler.GetMatakuliahFilters)
		group.Get("/matakuliah", handler.GetMatakuliahList)
		group.Post("/matakuliah/sync", handler.SyncMatakuliah)
		group.Get("/jadwal", handler.GetJadwalList)
		group.Post("/jadwal/sync", handler.SyncJadwal)
		group.Post("/sync-all", handler.SyncAll)
	}

	return svc
}
