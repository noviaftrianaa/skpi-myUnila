package ktwraw

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// RegisterRoutes mount endpoint KTW raw di bawah parent (mis. /v1/dashboard/ktw/raw).
// Caller harus pasang middleware JWT/WsAuthorization di parent group sebelum
// passing router ke sini — endpoint raw selalu protected.
func RegisterRoutes(router fiber.Router, db *sqlx.DB) {
	repo := NewRepository(db)
	svc := NewService(repo)
	h := NewHandler(svc)

	g := router.Group("/raw")
	g.Get("/per-fakultas", h.PerFakultas)
	g.Get("/per-prodi", h.PerProdi)
	g.Get("/per-jenjang", h.PerJenjang)
	g.Get("/mahasiswa", h.ListMahasiswa)
}
