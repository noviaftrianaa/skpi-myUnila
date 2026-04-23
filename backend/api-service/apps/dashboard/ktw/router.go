package ktw

import (
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan semua endpoint KTW di bawah router induk.
// Pattern: parent router sudah punya middleware (RateLimiter + opsional KongAuth).
// Handler delegasi ke Service → ProxyClient → public-service upstream.
func RegisterRoutes(router fiber.Router, rConn *redis.Client) {
	proxy := NewProxyClient()
	svc := NewService(proxy, rConn)
	h := NewHandler(svc)

	g := router.Group("/ktw")

	g.Get("/overview", h.Overview)
	g.Get("/fakultas", h.Fakultas)
	g.Get("/prodi", h.Prodi)
	g.Get("/prodi/:id_sms", h.ProdiDetail)
	g.Get("/trend", h.Trend)
	g.Get("/status-breakdown", h.StatusBreakdown)
	g.Get("/gender-breakdown", h.GenderBreakdown)
	g.Get("/jalur-breakdown", h.JalurBreakdown)
	g.Get("/masa-mukim-stats", h.MasaMukimStats)
	g.Get("/top-prodi", h.TopProdi)
	g.Get("/presets", h.Presets)
}
