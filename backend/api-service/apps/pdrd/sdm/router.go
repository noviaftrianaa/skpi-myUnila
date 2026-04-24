package sdm

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan route modul SDM (dosen + tendik, source: SISTER).
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	h := NewHandler(svc)

	// List + detail SDM — filter via ?id_jns_sdm=12 untuk dosen, 13 tendik, dst
	router.Get("/list_sdm", h.GetSDMList)
	router.Get("/detail_sdm", h.GetSDMDetail)

	// Penugasan / homebase SDM (reg_ptk)
	router.Get("/penugasan_sdm", h.GetPenugasan)

	// Riwayat SDM generic — pakai ?type=pend_formal|fungsional|kepangkatan|tugas_tambahan|sertifikasi
	router.Get("/riwayat_sdm", h.GetRiwayat)

	// Batch 4 — SDM lanjutan (BKD + riwayat kerja/struktural + diklat)
	router.Get("/list_kinerja_dosen", h.GetKinerjaDosen)
	router.Get("/list_rwy_pekerjaan", h.GetRwyPekerjaan)
	router.Get("/list_rwy_struktural", h.GetRwyStruktural)
	router.Get("/list_diklat", h.GetDiklat)

	// Batch 6 — SDM specialized (detasering, visiting, orgprof, penghargaan)
	router.Get("/list_detasering", h.GetDetasering)
	router.Get("/list_visiting_scientist", h.GetVisitingScientist)
	router.Get("/list_anggota_orgprof", h.GetAnggotaOrgprof)
	router.Get("/list_penghargaan", h.GetPenghargaan)

	// Batch 9a — Foto dosen (MinIO-only, photos/sdm/{id_sdm}.jpg)
	router.Get("/foto_dosen", h.GetFotoDosen)
	router.Post("/foto_dosen", h.UploadFotoDosen)

	// Batch 9b — bimbing_dosen (kegiatan bimbingan dosen, SK + bid ahli)
	router.Get("/list_bimbing_dosen", h.GetBimbingDosen)
}
