package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
)

// RequireRole checks if user has required role(s)
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get role from context (set by KongAuth middleware)
		role := c.Locals("role")
		if role == nil {
			return response.Forbidden(c, "Role information not found")
		}

		userRole := role.(string)

		// Check if user role is in allowed roles
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				return c.Next()
			}
		}

		return response.Forbidden(c, "Insufficient permissions. Developer role required.")
	}
}

// RequireDeveloper is a convenience middleware for Developer-only endpoints
func RequireDeveloper() fiber.Handler {
	return RequireRole("Developer")
}
