package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
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
		prefix = "myunila_database_myunila_cache_" // Laravel auth-service cache prefix
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

	// Laravel Cache stores data as PHP serialize format
	// e.g. a:7:{s:16:"id_role_pengguna";s:36:"uuid";s:8:"id_peran";s:3:"107";...}
	// Try JSON first, then PHP serialize
	var activeContext ActiveContext
	if err := json.Unmarshal([]byte(data), &activeContext); err != nil {
		// Parse PHP serialized format
		parsed := parsePhpSerializedContext(data)
		if parsed == nil {
			return nil, fmt.Errorf("failed to parse active context from Redis")
		}
		activeContext = *parsed
	}

	return &activeContext, nil
}

// parsePhpSerializedContext parses PHP serialized array into ActiveContext
// Handles format: a:7:{s:16:"key";s:5:"value";s:8:"id_peran";s:3:"107";...}
func parsePhpSerializedContext(data string) *ActiveContext {
	ctx := &ActiveContext{}

	// Extract values using simple string parsing
	ctx.IDRolePengguna = phpSerialExtract(data, "id_role_pengguna")
	ctx.NmPeran = phpSerialExtract(data, "nm_peran")
	ctx.IDOrganisasi = phpSerialExtract(data, "id_organisasi")
	ctx.NmOrganisasi = phpSerialExtract(data, "nm_organisasi")
	ctx.SelectedAt = phpSerialExtract(data, "selected_at")

	// id_peran is integer
	peranStr := phpSerialExtract(data, "id_peran")
	if peranStr != "" {
		fmt.Sscanf(peranStr, "%d", &ctx.IDPeran)
	}

	// level_organisasi (may be N for null)
	levelStr := phpSerialExtract(data, "level_organisasi")
	if levelStr != "" && levelStr != "N" {
		fmt.Sscanf(levelStr, "%d", &ctx.LevelOrganisasi)
	}

	if ctx.NmPeran == "" {
		return nil
	}
	return ctx
}

// phpSerialExtract extracts a string value from PHP serialized data by key
// Handles: s:KEY_LEN:"key";s:VAL_LEN:"value"; or s:KEY_LEN:"key";N; (null) or s:KEY_LEN:"key";i:INT;
func phpSerialExtract(data, key string) string {
	keyToken := fmt.Sprintf(`s:%d:"%s"`, len(key), key)
	idx := strings.Index(data, keyToken)
	if idx == -1 {
		return ""
	}

	// Move past the key token and semicolon
	rest := data[idx+len(keyToken)+1:] // +1 for ;

	if len(rest) == 0 {
		return ""
	}

	// Parse value: s:LEN:"VALUE"; or i:INT; or N;
	if strings.HasPrefix(rest, "N;") {
		return ""
	}
	if strings.HasPrefix(rest, "i:") {
		end := strings.Index(rest, ";")
		if end > 2 {
			return rest[2:end]
		}
		return ""
	}
	if strings.HasPrefix(rest, "s:") {
		// Find the length
		colonIdx := strings.Index(rest[2:], ":")
		if colonIdx == -1 {
			return ""
		}
		var length int
		fmt.Sscanf(rest[2:2+colonIdx], "%d", &length)
		startIdx := 2 + colonIdx + 2 // skip s:LEN:"
		if startIdx+length > len(rest) {
			return ""
		}
		return rest[startIdx : startIdx+length]
	}

	return ""
}

// RequireDeveloper is a convenience middleware for Developer-only endpoints
// Checks if user's ACTIVE (currently selected) role is Developer
func RequireDeveloper() fiber.Handler {
	return RequireRole("Developer")
}
