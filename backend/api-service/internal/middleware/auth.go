package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
	"github.com/myunila/api-service/pkg/jwt"
)

// AuthRequired middleware untuk memvalidasi JWT token
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Ambil token dari header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// Coba dari query string
			authHeader = c.Query("token")
		}

		if authHeader == "" {
			return response.Unauthorized(c, "Token tidak ditemukan")
		}

		// Remove "Bearer " prefix jika ada
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		tokenString = strings.TrimSpace(tokenString)

		if tokenString == "" {
			return response.Unauthorized(c, "Token tidak valid")
		}

		// Validasi token
		claims, err := jwt.ValidateToken(tokenString)
		if err != nil {
			switch err {
			case jwt.ErrExpiredToken:
				return response.Unauthorized(c, "Token sudah kadaluarsa")
			case jwt.ErrBlacklistedToken:
				return response.Unauthorized(c, "Token sudah dicabut")
			default:
				return response.Unauthorized(c, "Token tidak valid")
			}
		}

		// Simpan claims ke context untuk digunakan di handler
		c.Locals("user", claims.User)
		c.Locals("claims", claims)
		c.Locals("token_id", claims.ID)

		return c.Next()
	}
}

// GetCurrentUser mengambil user dari context
func GetCurrentUser(c *fiber.Ctx) *jwt.UserClaim {
	user, ok := c.Locals("user").(jwt.UserClaim)
	if !ok {
		return nil
	}
	return &user
}

// GetClaims mengambil claims dari context
func GetClaims(c *fiber.Ctx) *jwt.Claims {
	claims, ok := c.Locals("claims").(*jwt.Claims)
	if !ok {
		return nil
	}
	return claims
}

// JWTAuth adalah alias untuk AuthRequired
func JWTAuth() fiber.Handler {
	return AuthRequired()
}
