package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// =============================================================================
// RATE LIMIT MIDDLEWARE
//
// Per-IP token bucket untuk public endpoint yang rentan abuse (subscribe,
// comment, search). Pakai built-in Fiber limiter (in-memory). Untuk
// multi-replica deploy, swap storage ke Redis di main.go.
//
// Client IP extraction:
//   - Default Fiber c.IP() = TCP RemoteAddr (loopback kalau di belakang proxy).
//   - Production di belakang Nginx/Kong → real IP di X-Forwarded-For.
//   - We use clientIP() helper yang parse XFF + fallback ke c.IP().
//
// Saat exceed limit, return 429 dengan body JSON yang frontend bisa parse.
// =============================================================================

// clientIP — extract real client IP. Trust X-Forwarded-For karena public
// endpoint selalu via reverse proxy di prod. Lokal dev (no proxy) → c.IP().
func clientIP(c *fiber.Ctx) string {
	if xff := c.Get("X-Forwarded-For"); xff != "" {
		// First IP di XFF chain = original client. Trim whitespace.
		if idx := strings.Index(xff, ","); idx > 0 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}
	if xri := c.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	return c.IP()
}

// limit429 — uniform error response saat client kena rate limit. Frontend
// SubscribeForm dst bisa render pesan ramah berdasar status 429 + body.
func limit429(c *fiber.Ctx) error {
	return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
		"success": false,
		"error":   "rate limit exceeded — coba lagi sebentar",
	})
}

// RateLimit creates a rate limiter middleware dengan config tertentu.
// Generic factory untuk dipakai di per-route.
//
//   max      — maks request per window
//   window   — window duration (mis. 1*time.Minute)
//   skipAuth — kalau true, request yang udah authenticated (ada user_id di
//              Locals) SKIP rate limit. Asumsi authenticated user lebih
//              trusted; rate limit terutama buat anonymous abuse.
func RateLimit(max int, window time.Duration, skipAuth bool) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: window,
		KeyGenerator: func(c *fiber.Ctx) string {
			return clientIP(c)
		},
		LimitReached: limit429,
		Next: func(c *fiber.Ctx) bool {
			if !skipAuth {
				return false
			}
			// Skip kalau user authenticated (asumsi JWTOptional middleware
			// sudah jalan duluan dan set user_id di Locals).
			if uid, _ := c.Locals("user_id").(string); uid != "" {
				return true
			}
			return false
		},
	})
}

// =============================================================================
// Pre-configured rate limit profiles
//
// Tunable di sini — kalau butuh adjust di prod, edit angka di sini lalu
// rebuild blog-service. Eventually bisa di-promote ke config.Config kalau
// per-deployment override diperlukan.
// =============================================================================

// SubscribeLimit — Phase BB public opt-in form. 5 req/menit/IP cukup untuk
// real user yang typo email beberapa kali; cukup ketat untuk block bot
// spam (bots typically 100+ rpm).
func SubscribeLimit() fiber.Handler {
	return RateLimit(5, time.Minute, false) // tidak skip auth karena form public
}

// CommentLimit — public komentar create. 5 req/menit/IP, anonymous + auth
// sama. Real reader gak akan post >5 komentar dalam 1 menit di blog post.
func CommentLimit() fiber.Handler {
	return RateLimit(5, time.Minute, false)
}

// SearchLimit — autocomplete + main search. 60 req/menit/IP karena
// debounced 200ms di frontend bisa generate banyak request saat typing.
// Skip authenticated supaya logged-in user gak ke-throttle saat browsing.
func SearchLimit() fiber.Handler {
	return RateLimit(60, time.Minute, true)
}

// EngagementLimit — toggle like / bookmark / follow. Auth required di
// handler, tapi rate limit tetap untuk prevent script abuse. 30/menit/IP.
func EngagementLimit() fiber.Handler {
	return RateLimit(30, time.Minute, true)
}

// PushSubscribeLimit — Phase BA. Browser kadang panggil subscribe ulang
// (saat token rotate dari push service). 10/menit cukup; auth required.
func PushSubscribeLimit() fiber.Handler {
	return RateLimit(10, time.Minute, true)
}
