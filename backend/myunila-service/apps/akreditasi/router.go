package akreditasi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init mounts /akreditasi/* di apiV1 group.
func Init(router fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo, NewBanptClient())
	h := NewHandler(svc)

	g := router.Group("/akreditasi")
	{
		g.Get("/", h.List)
		g.Get("/stats", h.Stats)
		g.Post("/sync", h.Sync)
		g.Get("/sync-log", h.ListLogs)
		g.Get("/sync-log/:id", h.GetLog)
		g.Get("/sync-log/:id/details", h.GetLogDetails)
		g.Get("/scheduler-config", h.SchedulerConfig)

		// Mapping (per-prodi pdrd.sms + akreditasi CRUD manual)
		g.Get("/mapping-unit", h.ListMapping)
		g.Get("/mapping-unit/stats", h.MappingStats)
		g.Put("/mapping-unit/:id_sms", h.UpsertMapping)
		g.Delete("/mapping-unit/:id_sms", h.DeleteMapping)

		// Referensi dropdown (lembaga + nilai akreditasi)
		g.Get("/ref-akreditasi", h.RefAkreditasi)

		// Unmatched BAN-PT — list nm_prodi BAN-PT yang gagal di-match ke pdrd.sms
		// dari sync log terakhir, untuk dimap manual oleh admin via Mapping Unit page.
		g.Get("/unmatched", h.UnmatchedBanpt)
	}
	return svc
}
