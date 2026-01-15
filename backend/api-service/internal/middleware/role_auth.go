package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/response"
)

// ActiveContext represents the user's active context from Redis cache
type ActiveContext struct {
	IDRolePengguna  string `json:"id_role_pengguna"`
	IDPeran         int    `json:"id_peran"`
	NmPeran         string `json:"nm_peran"`
	IDOrganisasi    string `json:"id_organisasi"`
	NmOrganisasi    string `json:"nm_organisasi"`
	LevelOrganisasi int    `json:"level_organisasi"`
	SelectedAt      string `json:"selected_at"`
}

// getCachePrefix returns the Laravel cache prefix from environment
func getCachePrefix() string {
	prefix := os.Getenv("AUTH_CACHE_PREFIX")
	if prefix == "" {
		prefix = "auth_" // Default Laravel auth-service cache prefix
	}
	return prefix
}

// RequireRole checks if user has required role(s) based on ACTIVE context
// This checks the user's currently selected role from Redis cache, not from JWT claims
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user_id from context (set by KongAuth middleware)
		userID := c.Locals("user_id")
		if userID == nil {
			return response.Forbidden(c, "User information not found")
		}

		// Get active context from Redis cache
		activeContext, err := getActiveContext(userID.(string))
		if err != nil {
			// Fallback to JWT role if Redis is unavailable
			role := c.Locals("role")
			if role == nil {
				return response.Forbidden(c, "Role information not found")
			}
			userRole := role.(string)
			for _, allowedRole := range allowedRoles {
				if userRole == allowedRole {
					return c.Next()
				}
			}
			return response.Forbidden(c, fmt.Sprintf("Insufficient permissions. Required role: %v", allowedRoles))
		}

		if activeContext == nil {
			return response.Forbidden(c, "No active context selected. Please select a role first.")
		}

		// Check if active role is in allowed roles
		for _, allowedRole := range allowedRoles {
			if activeContext.NmPeran == allowedRole {
				// Store active context in locals for later use
				c.Locals("active_context", activeContext)
				return c.Next()
			}
		}

		return response.Forbidden(c, fmt.Sprintf("Insufficient permissions. Your active role '%s' is not allowed. Required: %v", activeContext.NmPeran, allowedRoles))
	}
}

// getActiveContext retrieves user's active context from Redis cache
func getActiveContext(userID string) (*ActiveContext, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Laravel cache key format: {prefix}user_context:{user_id}
	cacheKey := getCachePrefix() + "user_context:" + userID

	// Get from Redis
	data, err := redis.Get(ctx, cacheKey)
	if err != nil {
		return nil, err
	}

	if data == "" {
		return nil, nil
	}

	// Laravel Cache stores data with serialization wrapper
	// Try to parse directly first (if stored as JSON)
	var activeContext ActiveContext
	if err := json.Unmarshal([]byte(data), &activeContext); err != nil {
		// Try to parse Laravel serialized format
		// Laravel uses PHP serialize format, but with Redis driver it often uses JSON
		return nil, fmt.Errorf("failed to parse active context: %w", err)
	}

	return &activeContext, nil
}

// RequireDeveloper is a convenience middleware for Developer-only endpoints
// Checks if user's ACTIVE (currently selected) role is Developer
func RequireDeveloper() fiber.Handler {
	return RequireRole("Developer")
}
