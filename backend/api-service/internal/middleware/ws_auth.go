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
	DB            *sqlx.DB
	AppID         string        // ID aplikasi di man_akses.aplikasi
	CacheTTL      time.Duration // Cache duration for authorization checks
	DefaultRoleID int           // Kalau > 0: skip Redis user_context, langsung pakai role ini
	//                           sebagai role check (fit ws-api server-to-server flow,
	//                           dimana tidak ada UI buat select-role).
}

// WsAuthorization middleware checks if user's role has permission to access
// the requested endpoint based on man_akses.ws_authorization table.
//
// Flow:
// 1. Get user_id from c.Locals (set by KongAuth/JWTAuth)
// 2. Tentukan role:
//    a. Kalau cfg.DefaultRoleID > 0 (ws-api flow) → pakai itu langsung.
//    b. Else → baca active context (role_pengguna) dari Redis (frontend flow).
// 3. Check ws_authorization: role ini boleh akses method+path?
// 4. Cache result di Redis.
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

		if cfg.DefaultRoleID > 0 {
			// ws-api server-to-server flow:
			// - Login (apps/auth/service.go) sudah validasi user wajib punya
			//   peran cfg.DefaultRoleID (107 = Developer).
			// - JWT yang sampai ke sini = user pasti punya peran tsb.
			// - Tidak ada UI select-role di ws-api flow.
			// Jadi: trust JWT, lewati Redis user_context + ws_authorization
			//   per-endpoint. Login + JWT-validation = sufficient guard.
			c.Locals("ws_authorized", true)
			c.Locals("ws_role_id", cfg.DefaultRoleID)
			return c.Next()
		}

		// Frontend flow: baca user_context dari Redis (set saat user
		// pilih role via UI), lalu cek per-endpoint authorization.
		activeCtx, err := getActiveContext(userID)
		if err != nil {
			log.Printf("[WsAuth] Warning: failed to get active context for user %s: %v", userID, err)
			return response.Forbidden(c, "Unable to verify authorization. Please select a role first.")
		}
		if activeCtx == nil {
			return response.Forbidden(c, "No active context selected. Please select a role first.")
		}
		c.Locals("active_context", activeCtx)

		// Check authorization (with cache)
		allowed, err := checkAuthorization(cfg, method, path, activeCtx.IDPeran)
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

		// IMPORTANT: extract semua nilai dari c SEBELUM spawn goroutine.
		// Fiber recycle Ctx setelah handler return — akses c.Locals/c.Path/dll
		// di goroutine = nil pointer panic (pernah crash di prod, bikin Kong
		// dapat 'invalid response from upstream').
		userID, _ := c.Locals("user_id").(string)
		jti, _ := c.Locals("jti").(string)

		// Skip kalau tidak ada JWT context (public endpoint, preflight, dsb)
		if userID == "" {
			return err
		}

		status := c.Response().StatusCode()
		path := c.Path()
		method := c.Method()
		reqList := string(c.Request().URI().QueryString())

		// Log after response (async via goroutine — sekarang capture by value).
		go func(idLogJwt interface{}, path, method, reqList string, status int) {
			aSuccess := 0
			if status < 400 {
				aSuccess = 1
			}
			// ket = status code + method untuk quick-scan di log dashboard
			ket := fmt.Sprintf("%d %s", status, method)

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
				idLogJwt,
				path, method, reqList,
				aSuccess, ket,
			); logErr != nil {
				log.Printf("[WsAuthLog] Failed to log access: %v", logErr)
			}
		}(func() interface{} {
			// id_log_jwt (FK): dari JTI claim. Nullable di schema; kalau kosong
			// biarkan NULL (SQL Server reject uniqueidentifier '').
			if jti != "" {
				return jti
			}
			return nil
		}(), path, method, reqList, status)

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
