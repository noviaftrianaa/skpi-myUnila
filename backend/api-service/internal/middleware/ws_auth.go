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

// WsAuthLog logs access attempts to logger.log_akses_jwt
// Should be used as a separate middleware after WsAuthorization.
//
// Schema target (logger.log_akses_jwt):
//   id_log_akses_jwt (PK), id_log_jwt (FK to logger.log_jwt, dari JWT claim "jti"),
//   menu_akses (= path_url), method, request_list (query string),
//   waktu_akses, a_berhasil (1=success, 0=fail), ket (status code + error),
//   hasil_akses (response summary, optional)
func WsAuthLog(db *sqlx.DB, appID string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Process request first
		err := c.Next()

		// Log after response (async-ish via goroutine)
		go func() {
			userID, _ := c.Locals("user_id").(string)
			jti, _ := c.Locals("jti").(string)

			// Skip kalau tidak ada JWT context (public endpoint, preflight, dsb)
			if userID == "" {
				return
			}

			status := c.Response().StatusCode()
			aSuccess := 0
			if status < 400 {
				aSuccess = 1
			}

			// Query string (kalau ada) ke request_list
			reqList := string(c.Request().URI().QueryString())
			if reqList == "" {
				reqList = "" // simpan string kosong, bukan NULL
			}

			// ket = status code + method untuk quick-scan di log dashboard
			ket := fmt.Sprintf("%d %s", status, c.Method())

			// id_log_jwt (FK): dari JTI claim. Nullable di schema, jadi kalau JTI
			// kosong kita biarkan NULL (bukan string kosong — SQL Server reject uniqueidentifier empty).
			var idLogJwtArg interface{}
			if jti != "" {
				idLogJwtArg = jti
			} else {
				idLogJwtArg = nil
			}

			logQuery := `
				INSERT INTO logger.log_akses_jwt (
					id_log_akses_jwt, id_log_jwt,
					menu_akses, method, request_list,
					waktu_akses, a_berhasil, ket
				) VALUES (
					NEWID(), @p1,
					@p2, @p3, @p4,
					GETDATE(), @p5, @p6
				)
			`

			if _, logErr := db.Exec(logQuery,
				idLogJwtArg,
				c.Path(), c.Method(), reqList,
				aSuccess, ket,
			); logErr != nil {
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
