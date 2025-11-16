package middleware

import (
	"fmt"
	"sister-service/internal/config"
	"sister-service/pkg/response"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the JWT token claims from auth-service
type JWTClaims struct {
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
	jwt.RegisteredClaims
}

// JWTAuth validates JWT token from auth-service
func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Unauthorized(c, "Missing authorization header")
		}

		// Extract Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Unauthorized(c, "Invalid authorization header format")
		}

		tokenString := parts[1]

		// Parse and validate JWT
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Validate signing algorithm
			if token.Method.Alg() != config.Cfg.JWT.Algo {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(config.Cfg.JWT.Secret), nil
		})

		if err != nil {
			return response.Unauthorized(c, "Invalid or expired token")
		}

		// Extract claims
		claims, ok := token.Claims.(*JWTClaims)
		if !ok || !token.Valid {
			return response.Unauthorized(c, "Invalid token claims")
		}

		// Verify token type (should be "access" token)
		if claims.Type != "access" {
			return response.Unauthorized(c, "Invalid token type")
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
