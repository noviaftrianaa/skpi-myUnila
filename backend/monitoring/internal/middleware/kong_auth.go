package middleware

import (
	"encoding/base64"
	"encoding/json"
	"strings"

	"monitoring-service/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type kongJWTClaims struct {
	SUB  string `json:"sub"`
	Type string `json:"type"`
	Role string `json:"role"`
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	} `json:"user"`
}

// KongAuth extracts JWT claims from a token already validated by Kong Gateway.
// No signature verification needed — Kong already did it.
func KongAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenString string

		// Try Authorization header first
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		// Fallback to cookie
		if tokenString == "" {
			tokenString = c.Cookies("token")
		}
		if tokenString == "" {
			tokenString = c.Cookies("access_token")
		}

		if tokenString == "" {
			return response.Unauthorized(c, "Missing authorization header or cookie")
		}

		parts := strings.Split(tokenString, ".")
		if len(parts) != 3 {
			return response.Unauthorized(c, "Invalid JWT format")
		}

		payload := parts[1]
		if l := len(payload) % 4; l > 0 {
			payload += strings.Repeat("=", 4-l)
		}

		payloadBytes, err := base64.URLEncoding.DecodeString(payload)
		if err != nil {
			return response.Unauthorized(c, "Failed to decode JWT payload")
		}

		var claims kongJWTClaims
		if err := json.Unmarshal(payloadBytes, &claims); err != nil {
			return response.Unauthorized(c, "Failed to parse JWT claims")
		}

		if claims.User.ID != "" {
			c.Locals("user_id", claims.User.ID)
			c.Locals("username", claims.User.Username)
			c.Locals("role", claims.User.Role)
		} else {
			c.Locals("user_id", claims.SUB)
			c.Locals("role", claims.Role)
		}

		return c.Next()
	}
}

func GetUserID(c *fiber.Ctx) string {
	if uid, ok := c.Locals("user_id").(string); ok {
		return uid
	}
	return "00000000-0000-0000-0000-000000000000"
}

func GetRole(c *fiber.Ctx) string {
	if role, ok := c.Locals("role").(string); ok {
		return role
	}
	return ""
}
