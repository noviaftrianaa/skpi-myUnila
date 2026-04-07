package middleware

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/myunila/feeder-service/pkg/response"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// KongJWTClaims represents the JWT claims from Kong header
// Supports both flat structure (from auth-service) and nested user structure
type KongJWTClaims struct {
	ISS      string `json:"iss"`
	IAT      int64  `json:"iat"`
	EXP      int64  `json:"exp"`
	NBF      int64  `json:"nbf"`
	SUB      string `json:"sub"`
	JTI      string `json:"jti"`
	Role     string `json:"role"`     // Flat structure: role at top level
	Username string `json:"username"` // Flat structure: username at top level
	User     struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	} `json:"user"` // Nested structure (if exists)
}

// KongAuth trusts Kong Gateway's JWT validation
// Kong already validated the JWT, we just extract user info from the token
// Also supports reading token from cookie for browser-based docs access
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

		// Fallback to cookie if no Authorization header
		// Try both cookie names: "token" (from frontend) and "access_token" (legacy)
		if tokenString == "" {
			tokenString = c.Cookies("token")
		}
		if tokenString == "" {
			tokenString = c.Cookies("access_token")
		}

		// If still no token, return unauthorized
		if tokenString == "" {
			return response.Unauthorized(c, "Missing authorization header or cookie")
		}

		// Parse JWT payload without verification (Kong already verified it)
		// JWT format: header.payload.signature
		tokenParts := strings.Split(tokenString, ".")
		if len(tokenParts) != 3 {
			return response.Unauthorized(c, "Invalid JWT format")
		}

		// Decode payload (base64url)
		payload := tokenParts[1]

		// Add padding if needed for base64 decoding
		if l := len(payload) % 4; l > 0 {
			payload += strings.Repeat("=", 4-l)
		}

		payloadBytes, err := base64.URLEncoding.DecodeString(payload)
		if err != nil {
			// Try standard encoding
			payloadBytes, err = base64.StdEncoding.DecodeString(payload)
			if err != nil {
				return response.Unauthorized(c, fmt.Sprintf("Failed to decode JWT payload: %v", err))
			}
		}

		// Parse claims
		var claims KongJWTClaims
		if err := json.Unmarshal(payloadBytes, &claims); err != nil {
			return response.Unauthorized(c, fmt.Sprintf("Failed to parse JWT claims: %v", err))
		}

		// Note: Token type verification removed - auth-service tokens don't have "type" field
		// Kong has already validated the token, so we trust it

		// Store user info in context for later use
		// Support both nested user object and flat claims structure
		if claims.User.ID != "" {
			c.Locals("user_id", claims.User.ID)
			c.Locals("username", claims.User.Username)
			c.Locals("email", claims.User.Email)
			c.Locals("name", claims.User.Name)
			c.Locals("role", claims.User.Role)
		} else {
			// Flat structure from auth-service: sub=user_id, role/username at top level
			c.Locals("user_id", claims.SUB)
			c.Locals("username", claims.Username)
			c.Locals("role", claims.Role)
		}

		return c.Next()
	}
}
