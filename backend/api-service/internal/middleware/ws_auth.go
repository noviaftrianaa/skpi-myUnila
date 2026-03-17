package middleware

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/response"
)

// WsAuthConfig holds configuration for WS Authorization middleware
type WsAuthConfig struct {
	DB       *sqlx.DB
	AppID    string        // ID aplikasi di man_akses.aplikasi
	CacheTTL time.Duration // Cache duration for authorization checks
}

// WsAuthorization middleware checks if user's active role has permission
// to access the requested endpoint based on man_akses.ws_authorization table.
//
// Flow:
// 1. Get user_id from c.Locals (set by KongAuth/JWTAuth)
// 2. Get active context from Redis (role_pengguna cache)
// 3. Check ws_authorization: does this role have access to this method+path?
// 4. Cache the result in Redis for performance
//
// This middleware should be placed AFTER KongAuth/JWTAuth middleware.
func WsAuthorization(cfg WsAuthConfig) fiber.Handler {
	if cfg.CacheTTL == 0 {
		cfg.CacheTTL = 5 * time.Minute
	}

	return func(c *fiber.Ctx) error {
		// Get user info from context (set by KongAuth)
		userID, _ := c.Locals("user_id").(string)
		if userID == "" {
			return response.Forbidden(c, "User information not found")
		}

		// Get request method and path
		method := c.Method()
		path := c.Path()

		// Normalize path: remove trailing slash
		path = strings.TrimRight(path, "/")

		// Get active context (role) from Redis
		activeCtx, err := getActiveContext(userID)
		if err != nil {
			log.Printf("[WsAuth] Warning: failed to get active context for user %s: %v", userID, err)
			// If Redis is down, deny access (fail-closed for security)
			return response.Forbidden(c, "Unable to verify authorization. Please select a role first.")
		}
		if activeCtx == nil {
			return response.Forbidden(c, "No active context selected. Please select a role first.")
		}

		roleID := activeCtx.IDPeran

		// Check authorization (with cache)
		allowed, err := checkAuthorization(cfg, method, path, roleID)
		if err != nil {
			log.Printf("[WsAuth] Error checking authorization: %v", err)
			// Fail-closed: deny on error
			return response.Forbidden(c, "Authorization check failed")
		}

		if !allowed {
			return response.Forbidden(c, fmt.Sprintf(
				"Access denied. Role '%s' is not authorized for %s %s",
				activeCtx.NmPeran, method, path,
			))
		}

		// Store active context for downstream handlers
		c.Locals("active_context", activeCtx)
		c.Locals("ws_authorized", true)

		return c.Next()
	}
}

// checkAuthorization verifies if a role has access to method+path
func checkAuthorization(cfg WsAuthConfig, method, path string, roleID int) (bool, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("ws_auth:%s:%d:%s:%s", cfg.AppID[:8], roleID, method, path)

	if redis.Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		cached, err := redis.Get(ctx, cacheKey)
		if err == nil && cached != "" {
			return cached == "1", nil
		}
	}

	// Query database
	allowed, err := queryAuthorization(cfg.DB, cfg.AppID, method, path, roleID)
	if err != nil {
		return false, err
	}

	// Cache result
	if redis.Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		val := "0"
		if allowed {
			val = "1"
		}
		redis.Client.Set(ctx, cacheKey, val, cfg.CacheTTL)
	}

	return allowed, nil
}

// authResult represents the result of authorization check
type authResult struct {
	endpointExists bool // endpoint is registered in ws_endpoint
	roleAllowed    bool // role has authorization for this endpoint
}

// queryAuthorization checks the database for endpoint authorization
// Strategy: PERMISSIVE — only enforce if endpoint is registered in ws_endpoint
// - Endpoint not registered → allow (backward compat, not yet configured)
// - Endpoint registered, role authorized → allow
// - Endpoint registered, role NOT authorized → deny
func queryAuthorization(db *sqlx.DB, appID, method, path string, roleID int) (bool, error) {
	// Step 1: Check if endpoint exists in ws_endpoint for this app
	checkEndpointQuery := `
		SELECT COUNT(*) as cnt
		FROM man_akses.ws_endpoint e
		WHERE e.soft_delete = 0
		  AND e.a_active = 1
		  AND e.id_aplikasi = @p1
		  AND e.nm_method = @p2
		  AND (
		    e.path_url = @p3
		    OR @p3 LIKE REPLACE(REPLACE(REPLACE(e.path_url, ':id', '%'), ':uuid', '%'), ':slug', '%')
		  )
	`

	var endpointCount int
	err := db.QueryRow(checkEndpointQuery, appID, method, path).Scan(&endpointCount)
	if err != nil {
		return false, fmt.Errorf("ws_endpoint check failed: %w", err)
	}

	// Endpoint not registered → allow (permissive)
	if endpointCount == 0 {
		return true, nil
	}

	// Step 2: Check if role is authorized for this endpoint
	checkAuthQuery := `
		SELECT COUNT(*) as cnt
		FROM man_akses.ws_authorization wsa
		JOIN man_akses.ws_endpoint e ON e.id_ws_endpoint = wsa.id_ws_endpoint
		WHERE wsa.soft_delete = 0
		  AND wsa.a_active = 1
		  AND e.soft_delete = 0
		  AND e.a_active = 1
		  AND e.id_aplikasi = @p1
		  AND e.nm_method = @p2
		  AND wsa.id_peran = @p3
		  AND (
		    e.path_url = @p4
		    OR @p4 LIKE REPLACE(REPLACE(REPLACE(e.path_url, ':id', '%'), ':uuid', '%'), ':slug', '%')
		  )
	`

	var authCount int
	err = db.QueryRow(checkAuthQuery, appID, method, roleID, path).Scan(&authCount)
	if err != nil {
		return false, fmt.Errorf("ws_authorization check failed: %w", err)
	}

	return authCount > 0, nil
}

// WsAuthLog logs access attempts to man_akses.logger.log_akses
// Should be used as a separate middleware after WsAuthorization
func WsAuthLog(db *sqlx.DB, appID string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Process request first
		err := c.Next()

		// Log after response (async-ish via goroutine)
		go func() {
			userID, _ := c.Locals("user_id").(string)
			authorized, _ := c.Locals("ws_authorized").(bool)

			if userID == "" {
				return
			}

			aSuccess := 0
			if authorized && c.Response().StatusCode() < 400 {
				aSuccess = 1
			}

			logQuery := `
				INSERT INTO logger.log_akses (
					id_pengguna, id_aplikasi, nm_method, path_url,
					ip_address, user_agent, a_berhasil,
					response_code, tgl_akses
				) VALUES (
					@p1, @p2, @p3, @p4,
					@p5, @p6, @p7,
					@p8, GETDATE()
				)
			`

			_, logErr := db.Exec(logQuery,
				userID, appID, c.Method(), c.Path(),
				c.IP(), string(c.Request().Header.UserAgent()), aSuccess,
				c.Response().StatusCode(),
			)
			if logErr != nil {
				log.Printf("[WsAuthLog] Failed to log access: %v", logErr)
			}
		}()

		return err
	}
}

// ClearWsAuthCache clears cached authorization for a specific role
// Call this when ws_authorization entries are updated
func ClearWsAuthCache(appID string, roleID int) {
	if redis.Client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pattern := fmt.Sprintf("ws_auth:%s:%d:*", appID[:8], roleID)
	redis.DelByPattern(ctx, pattern)
}

// ClearAllWsAuthCache clears all ws_auth cache entries
func ClearAllWsAuthCache() {
	if redis.Client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	redis.DelByPattern(ctx, "ws_auth:*")
}
