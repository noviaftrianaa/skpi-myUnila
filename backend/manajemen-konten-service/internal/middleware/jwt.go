// Package middleware — JWT validation untuk auth-protected routes.
// Decode token issued by auth-service (shared JWT_SECRET env).
package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/myunila/manajemen-konten-service/internal/config"
)

// UserClaims — claims dari auth-service JWT.
// Auth-service menempatkan user info di nested "user" object, bukan flat top-level.
type UserClaims struct {
	IDPengguna string `json:"sub"`
	User       struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"` // 'developer', 'admin', 'user'
	} `json:"user"`
	jwt.RegisteredClaims
}

// Username returns the username from nested user object.
func (u *UserClaims) UsernameValue() string { return u.User.Username }

// Role returns the role from nested user object.
func (u *UserClaims) RoleValue() string { return u.User.Role }

// RequireAuth — middleware yang validate Bearer token dan store claims di Locals("user").
func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{"success": false, "message": "missing or invalid bearer token"})
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims := &UserClaims{}
		_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(config.Cfg.JWT.Secret), nil
		})
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"success": false, "message": "invalid token: " + err.Error()})
		}
		c.Locals("user", claims)
		return c.Next()
	}
}

// RequireRole — middleware yg cek role exact match (mis. 'developer').
// Dipakai untuk admin-only endpoints.
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*UserClaims)
		if !ok || user == nil {
			return c.Status(401).JSON(fiber.Map{"success": false, "message": "unauthenticated"})
		}
		for _, r := range roles {
			if strings.EqualFold(user.User.Role, r) {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "insufficient role: " + user.User.Role})
	}
}
