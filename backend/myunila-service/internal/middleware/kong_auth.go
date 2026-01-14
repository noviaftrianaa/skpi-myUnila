package middleware

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// KongJWTClaims represents the JWT claims from Kong header
type KongJWTClaims struct {
	ISS  string `json:"iss"`
	IAT  int64  `json:"iat"`
	EXP  int64  `json:"exp"`
	NBF  int64  `json:"nbf"`
	SUB  string `json:"sub"`
	JTI  string `json:"jti"`
	Type string `json:"type"`
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	} `json:"user"`
}

// KongAuth trusts Kong Gateway's JWT validation
// Kong already validated the JWT, we just extract user info from the token
func KongAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header (Kong will have already validated it)
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Missing authorization header",
			})
		}

		// Extract Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		// Parse JWT payload without verification (Kong already verified it)
		tokenParts := strings.Split(tokenString, ".")
		if len(tokenParts) != 3 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid JWT format",
			})
		}

		// Decode payload (base64url)
		payload := tokenParts[1]

		// Add padding if needed for base64 decoding
		if l := len(payload) % 4; l > 0 {
			payload += strings.Repeat("=", 4-l)
		}

		payloadBytes, err := base64.URLEncoding.DecodeString(payload)
		if err != nil {
			payloadBytes, err = base64.StdEncoding.DecodeString(payload)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success": false,
					"message": fmt.Sprintf("Failed to decode JWT payload: %v", err),
				})
			}
		}

		// Parse claims
		var claims KongJWTClaims
		if err := json.Unmarshal(payloadBytes, &claims); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Failed to parse JWT claims: %v", err),
			})
		}

		// Verify token type (should be "access" token)
		if claims.Type != "access" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid token type",
			})
		}

		// Store user info in context for later use
		c.Locals("user_id", claims.User.ID)
		c.Locals("username", claims.User.Username)
		c.Locals("email", claims.User.Email)
		c.Locals("name", claims.User.Name)
		c.Locals("role", claims.User.Role)

		return c.Next()
	}
}
