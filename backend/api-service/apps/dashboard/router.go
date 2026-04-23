// Package dashboard menggabungkan submodul dashboard (KTW, dan ke depan:
// Mahasiswa Aktif, Dosen, Prestasi) di bawah prefix /v1/dashboard/.
// Semua submodul di-proxy ke service domain masing-masing dgn cache + envelope.
package dashboard

import (
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"

	"github.com/myunila/api-service/apps/dashboard/ktw"
)

// RegisterRoutes register dashboard group — publik (tanpa JWT user).
// Rate limiting di-handle di level Kong (atau ditambah ke level Fiber kelak
// kalau perlu per-IP throttling).
func RegisterRoutes(router fiber.Router, rConn *redis.Client) {
	dash := router.Group("/dashboard")
	ktw.RegisterRoutes(dash, rConn)
}
