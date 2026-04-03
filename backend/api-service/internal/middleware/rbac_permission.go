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

// CRUDPermission represents CRUD permission flags for a menu
type CRUDPermission struct {
	Show   int `json:"show"`
	Insert int `json:"insert"`
	Update int `json:"update"`
	Delete int `json:"delete"`
}

// UserPermissions represents the full permission cache from Redis
type UserPermissions struct {
	IsSuperRole bool                                  `json:"is_super_role"`
	IDPeran     int                                   `json:"id_peran"`
	Apps        map[string]map[string]*CRUDPermission `json:"apps"` // app_id → menu_path → permissions
}

// Super roles that bypass all permission checks
var superRoles = []int{1, 107} // Administrator, Developer

// isSuperRoleID checks if a role ID is a super role
func isSuperRoleID(idPeran int) bool {
	for _, sr := range superRoles {
		if sr == idPeran {
			return true
		}
	}
	return false
}

// RBACPermission enforces CRUD permissions based on Redis-cached user permissions.
// Maps HTTP methods to permission types:
//   - GET    → show
//   - POST   → insert
//   - PUT    → update
//   - PATCH  → update
//   - DELETE → delete
//
// Permissive mode: if no permissions found in Redis, request is ALLOWED.
// This ensures backward compatibility and gradual rollout.
//
// Config via env:
//   - RBAC_ENFORCEMENT_ENABLED=true (default: false)
//   - RBAC_ENFORCEMENT_MODE=permissive|strict (default: permissive)
func RBACPermission() fiber.Handler {
	enabled := os.Getenv("RBAC_ENFORCEMENT_ENABLED") == "true"
	mode := os.Getenv("RBAC_ENFORCEMENT_MODE") // "permissive" or "strict"
	if mode == "" {
		mode = "permissive"
	}

	return func(c *fiber.Ctx) error {
		// Skip if not enabled
		if !enabled {
			return c.Next()
		}

		// Get user_id from context (set by KongAuth middleware)
		userID := c.Locals("user_id")
		if userID == nil {
			if mode == "strict" {
				return response.Forbidden(c, "User information not found")
			}
			return c.Next() // Permissive: allow
		}

		// Get user permissions from Redis
		perms, err := getUserPermissions(userID.(string))
		if err != nil || perms == nil {
			// Redis unavailable or no cache → permissive allow
			if mode == "strict" {
				return response.Forbidden(c, "Permission data unavailable")
			}
			return c.Next()
		}

		// Super role → bypass
		if perms.IsSuperRole || isSuperRoleID(perms.IDPeran) {
			c.Locals("permissions", perms)
			c.Locals("is_super_role", true)
			return c.Next()
		}

		// Map HTTP method to permission type
		method := c.Method()
		var permType string
		switch method {
		case "GET", "HEAD", "OPTIONS":
			permType = "show"
		case "POST":
			permType = "insert"
		case "PUT", "PATCH":
			permType = "update"
		case "DELETE":
			permType = "delete"
		default:
			return c.Next()
		}

		// Find matching menu permission
		menuPerm := findMenuPermission(perms, c.Path())
		if menuPerm == nil {
			// No matching menu → permissive allow
			c.Locals("permissions", perms)
			return c.Next()
		}

		// Check permission
		allowed := false
		switch permType {
		case "show":
			allowed = menuPerm.Show == 1
		case "insert":
			allowed = menuPerm.Insert == 1
		case "update":
			allowed = menuPerm.Update == 1
		case "delete":
			allowed = menuPerm.Delete == 1
		}

		if !allowed {
			labels := map[string]string{
				"show":   "melihat",
				"insert": "menambah",
				"update": "mengubah",
				"delete": "menghapus",
			}
			label := labels[permType]
			return response.Forbidden(c, fmt.Sprintf("Anda tidak memiliki izin untuk %s data", label))
		}

		// Store permissions in context for handlers
		c.Locals("permissions", perms)
		c.Locals("menu_permissions", menuPerm)
		return c.Next()
	}
}

// getUserPermissions retrieves user's cached permissions from Redis
func getUserPermissions(userID string) (*UserPermissions, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	prefix := getCachePrefix()
	cacheKey := prefix + "user_permissions:" + userID

	data, err := redis.Get(ctx, cacheKey)
	if err != nil {
		return nil, err
	}
	if data == "" {
		return nil, nil
	}

	// Laravel Cache stores data in PHP serialize format or JSON
	// Try JSON first
	var perms UserPermissions
	if err := json.Unmarshal([]byte(data), &perms); err != nil {
		// Try to extract from PHP serialize format
		parsed := parsePhpSerializedPermissions(data)
		if parsed == nil {
			return nil, fmt.Errorf("failed to parse permissions from Redis")
		}
		return parsed, nil
	}

	return &perms, nil
}

// findMenuPermission finds the matching menu permission for a given request path.
// Strategy: strip API prefix, try exact match, then longest prefix match.
func findMenuPermission(perms *UserPermissions, requestPath string) *CRUDPermission {
	// Normalize path: strip common API prefixes
	menuPath := requestPath
	prefixes := []string{"/api/v1", "/v1"}
	for _, p := range prefixes {
		if strings.HasPrefix(menuPath, p) {
			menuPath = menuPath[len(p):]
			break
		}
	}

	// Search across all apps
	for _, menus := range perms.Apps {
		// Exact match
		if perm, ok := menus[menuPath]; ok {
			return perm
		}

		// Longest prefix match
		var bestMatch *CRUDPermission
		bestLen := 0
		for path, perm := range menus {
			if strings.HasPrefix(menuPath, path) && len(path) > bestLen {
				bestMatch = perm
				bestLen = len(path)
			}
		}
		if bestMatch != nil {
			return bestMatch
		}
	}

	return nil // No match → caller decides (permissive/strict)
}

// parsePhpSerializedPermissions attempts to parse PHP serialized permission data.
// Falls back to checking for is_super_role flag.
func parsePhpSerializedPermissions(data string) *UserPermissions {
	// Check if it's a super role (simple check)
	if strings.Contains(data, `"is_super_role";b:1`) || strings.Contains(data, `"is_super_role":true`) {
		return &UserPermissions{IsSuperRole: true}
	}

	// PHP serialized permissions are complex to parse → return nil
	// The system will use permissive fallback
	return nil
}
