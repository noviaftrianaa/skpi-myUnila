// Package middleware — JWT auth middleware.
//
// Pattern: TRUST Kong Gateway's JWT validation. Kong sudah verify signature di
// route level (jwt plugin), service ini hanya parse payload untuk extract user
// info (sub, role, username) tanpa re-verify signature.
//
// Konsisten dgn pattern service Go lain di VM3 (sister/feeder/myunila/api/keuangan)
// yang pakai middleware Kong-trust serupa.
package middleware

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// UserClaims — claims yang diparse dari JWT payload (auth-service issued).
// Support 2 struktur claim:
//   1. Nested user object: {"user": {"id": "...", "role": "..."}}
//   2. Flat (legacy)     : {"sub": "...", "role": "...", "username": "..."}
type UserClaims struct {
	IDPengguna string `json:"sub"`
	// Flat fallback (kalau backend tidak pakai nested user object)
	Role     string `json:"role,omitempty"`
	Username string `json:"username,omitempty"`
	// Nested user (preferred — auth-service current format)
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"` // 'developer', 'admin', 'user'
	} `json:"user"`
}

// EffectiveRole returns role from nested user.role atau fallback ke flat role.
func (u *UserClaims) EffectiveRole() string {
	if u.User.Role != "" {
		return u.User.Role
	}
	return u.Role
}

// EffectiveID returns user id (sub atau nested user.id).
func (u *UserClaims) EffectiveID() string {
	if u.User.ID != "" {
		return u.User.ID
	}
	return u.IDPengguna
}

// RequireAuth — parse JWT payload tanpa verify signature.
// Trust Kong sudah verify; service hanya extract claims.
func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenString string

		// Try Authorization header first
		auth := c.Get("Authorization")
		if strings.HasPrefix(auth, "Bearer ") {
			tokenString = strings.TrimPrefix(auth, "Bearer ")
		}

		// Fallback to cookie (untuk akses docs di browser)
		if tokenString == "" {
			tokenString = c.Cookies("token")
		}
		if tokenString == "" {
			tokenString = c.Cookies("access_token")
		}

		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "missing or invalid bearer token",
			})
		}

		// Parse JWT payload tanpa verify signature
		parts := strings.Split(tokenString, ".")
		if len(parts) != 3 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "invalid JWT format",
			})
		}

		payload := parts[1]
		if l := len(payload) % 4; l > 0 {
			payload += strings.Repeat("=", 4-l)
		}

		payloadBytes, err := base64.URLEncoding.DecodeString(payload)
		if err != nil {
			payloadBytes, err = base64.StdEncoding.DecodeString(payload)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success": false,
					"message": fmt.Sprintf("failed to decode JWT payload: %v", err),
				})
			}
		}

		claims := &UserClaims{}
		if err := json.Unmarshal(payloadBytes, claims); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("failed to parse JWT claims: %v", err),
			})
		}

		c.Locals("user", claims)
		return c.Next()
	}
}

// RequireRole — middleware yg cek role exact match (mis. 'developer').
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*UserClaims)
		if !ok || user == nil {
			return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
		}
		role := user.EffectiveRole()
		for _, r := range roles {
			if strings.EqualFold(role, r) {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "insufficient role: " + role})
	}
}
