package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/myunila/api-service/apps/akademik"
	"github.com/myunila/api-service/apps/auth"
	"github.com/myunila/api-service/apps/dashboard"
	"github.com/myunila/api-service/apps/diklat"
	"github.com/myunila/api-service/apps/institusi"
	"github.com/myunila/api-service/apps/kerjasama"
	"github.com/myunila/api-service/apps/kontribusi"
	"github.com/myunila/api-service/apps/mbkm"
	"github.com/myunila/api-service/apps/pdrd"
	"github.com/myunila/api-service/apps/referensi"
	"github.com/myunila/api-service/apps/siakadu"
	"github.com/myunila/api-service/apps/tracer"
	"github.com/myunila/api-service/docs"
	"github.com/myunila/api-service/external/database"
	extminio "github.com/myunila/api-service/external/minio"
	"github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/config"
	"github.com/myunila/api-service/internal/middleware"
	"github.com/myunila/api-service/internal/startup"
)

// @title MyUnila API Service
// @version 1.0
// @description API untuk integrasi data antar sistem di Universitas Lampung
// @termsOfService http://swagger.io/terms/

// @contact.name UPT TIK Universitas Lampung
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8085
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

// endpointPrefix kept for backward compat in deriveGroup; URL always /v1/
var endpointPrefix string

func main() {
	startTime := time.Now()

	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Println("🚀 Starting MyUnila API Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// APP_ENV for internal behavior only (logging, cache TTL)
	// URL prefix always /v1 regardless of environment
	endpointPrefix = "v1" // kept for deriveGroup compatibility

	// Connect to database
	db, err := database.ConnectSQLServer(database.DatabaseConfig{
		Driver:          config.Cfg.Database.Driver,
		Host:            config.Cfg.Database.Host,
		Port:            config.Cfg.Database.Port,
		User:            config.Cfg.Database.User,
		Password:        config.Cfg.Database.Password,
		Name:            config.Cfg.Database.Name,
		MaxOpenConns:    config.Cfg.Database.MaxOpenConns,
		MaxIdleConns:    config.Cfg.Database.MaxIdleConns,
		ConnMaxLifetime: config.Cfg.Database.ConnMaxLifetime,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()
	log.Println("✅ Database connected successfully")

	// Connect to Redis
	if err := redis.Connect(config.Cfg.Redis); err != nil {
		log.Printf("⚠️  Warning: Failed to connect to Redis: %v", err)
		log.Println("   JWT token caching will be disabled")
	} else {
		defer redis.Close()
	}

	// Connect to MinIO (untuk foto dosen/mahasiswa + dokumen)
	if _, err := extminio.Init(config.Cfg.MinIO); err != nil {
		log.Printf("⚠️  Warning: MinIO unavailable: %v", err)
		log.Println("   Upload/GET foto endpoint akan return 500.")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "MyUnila API Service",
		ErrorHandler: customErrorHandler,
		ReadTimeout:  time.Second * 30,
		WriteTimeout: time.Second * 30,
		IdleTimeout:  time.Second * 120,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(fiberlogger.New(fiberlogger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800, https://my.unila.ac.id",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))

	// Setup Swagger documentation
	docs.SetupSwagger(app)
	log.Println("✅ API Documentation available at /docs")

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		dbHealth := "up"
		if err := db.Ping(); err != nil {
			dbHealth = "down"
		}

		redisHealth := "up"
		if err := redis.Client.Ping(context.Background()).Err(); err != nil {
			redisHealth = "down"
		}

		return c.JSON(fiber.Map{
			"status":  "ok",
			"version": "1.0.0",
			"uptime":  time.Since(startTime).String(),
			"dependencies": fiber.Map{
				"database": dbHealth,
				"redis":    redisHealth,
			},
		})
	})

	// Welcome endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "MyUnila API Service - Integrasi Data Universitas Lampung",
			"endpoints": fiber.Map{
				"health":        "/health",
				"documentation": "/docs",
				"api":        "/v1",
				"auth_login": "/v1/auth/login",
				"auth_check": "/v1/auth/check-token",
			},
		})
	})

	// API routes - menggunakan /v1 tanpa /api prefix
	// Production URL: https://my.unila.ac.id/gateway/api-service/v1/...
	apiV1 := app.Group("/v1")

	// WS Authorization config
	// WS_AUTH_APP_ID: aplikasi ID di man_akses untuk endpoint authorization
	// WS_AUTH_ENABLED: enable/disable ws_authorization enforcement (default: false for backward compat)
	wsAuthEnabled := os.Getenv("WS_AUTH_ENABLED") == "true"
	wsAuthAppID := os.Getenv("WS_AUTH_APP_ID")

	// Build middleware chain for protected routes: KongAuth → WsAuth → Handler
	var protectedMiddlewares []fiber.Handler
	protectedMiddlewares = append(protectedMiddlewares, middleware.KongAuth())

	if wsAuthEnabled && wsAuthAppID != "" {
		protectedMiddlewares = append(protectedMiddlewares, middleware.WsAuthorization(middleware.WsAuthConfig{
			DB:       db,
			AppID:    wsAuthAppID,
			CacheTTL: 5 * time.Minute,
		}))
		protectedMiddlewares = append(protectedMiddlewares, middleware.WsAuthLog(db, wsAuthAppID))
		log.Printf("✅ WS Authorization ENABLED (app_id: %s)", wsAuthAppID[:8]+"...")
	} else {
		log.Println("⚠️  WS Authorization DISABLED (set WS_AUTH_ENABLED=true and WS_AUTH_APP_ID to enable)")
	}

	// Initialize Auth module (public - tanpa auth)
	auth.Init(apiV1, db)
	log.Println("✅ Auth module initialized")

	// Initialize protected modules with KongAuth + WsAuth middleware chain
	referensi.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Referensi module initialized")

	diklat.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Diklat module initialized")

	pdrd.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ PDRD module initialized (+ domain aliases: /mahasiswa /sdm /pegawai /penelitian)")

	// Akademik module (matkul, kelas_kuliah, jadwal_kelas, kurikulum_sp)
	akademik.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Akademik module initialized")

	// Institusi module (prodi, satuan_pendidikan, profil_prodi, akreditasi_prodi)
	institusi.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Institusi module initialized")

	// Kontribusi module (pembicara, pengelola_jurnal, buku_ajar, kepanitiaan, prestasi)
	kontribusi.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Kontribusi module initialized")

	// Tracer Study module (CRUD — hasil_tracer_study, hasil_tracer_atasan, umr_wilayah)
	tracer.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Tracer Study module initialized (CRUD)")

	// Siakadu module (GET-only — siakadu.* tables di pdut, enriched dgn pdrd UUID)
	siakadu.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Siakadu module initialized (GET-only, 18 endpoint)")

	// Kerjasama module (CRUD — mou + sms_kerjasama + dudi untuk LP2M/Bagian Kerjasama)
	kerjasama.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ Kerjasama module initialized (CRUD, 15 endpoint)")

	// MBKM module (GET-only — daftar/periode/mk_konversi/ekuiv/log_book dari pdut.mbkm.*)
	mbkm.RegisterRoutesWithMiddleware(apiV1, db, redis.Client, protectedMiddlewares)
	log.Println("✅ MBKM module initialized (GET-only, 6 endpoint)")

	// Auto-sync /system/routes → man_akses.ws_endpoint (background).
	// Supaya setiap rebuild, endpoint terbaru langsung ter-register untuk authorization.
	startup.SyncEndpointsAsync(startup.SyncEndpointsConfig{
		AppID: wsAuthAppID,
		DB:    db,
		App:   app,
	})
	if wsAuthAppID != "" {
		log.Println("✅ Endpoint auto-sync enabled (background)")
	}

	// Dashboard module (public — no JWT, but rate-limited).
	// Proxy ke service domain masing-masing (KTW → public-service).
	dashboard.RegisterRoutes(apiV1, redis.Client)
	log.Println("✅ Dashboard module initialized (ktw proxy)")

	// System routes (for endpoint management - self-report all registered routes)
	app.Get("/system/routes", func(c *fiber.Ctx) error {
		routes := app.GetRoutes()
		var result []fiber.Map
		seen := make(map[string]bool)

		for _, r := range routes {
			// Skip internal/system/docs routes
			if r.Path == "/" || r.Path == "/health" ||
				strings.HasPrefix(r.Path, "/system") ||
				strings.HasPrefix(r.Path, "/docs") {
				continue
			}
			// Skip DEPRECATED /v1/pdrd/* — kept registered untuk backward
			// compatibility, tapi jangan muncul di docs/Generate/auto-sync
			// supaya user tidak grant akses ke alias lama.
			if strings.HasPrefix(r.Path, "/v1/pdrd") {
				continue
			}
			// Only include standard HTTP methods (nm_method column is varchar(6))
			validMethods := map[string]bool{"GET": true, "POST": true, "PUT": true, "DELETE": true, "PATCH": true}
			if !validMethods[r.Method] {
				continue
			}

			key := r.Method + ":" + r.Path
			if seen[key] {
				continue
			}
			seen[key] = true

			// Derive group from path
			group := deriveGroup(r.Path, endpointPrefix)

			result = append(result, fiber.Map{
				"method":   r.Method,
				"path":     r.Path,
				"nm_group": group,
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"routes":  result,
			"total":   len(result),
		})
	})

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("🛑 Shutting down server...")
		if err := app.ShutdownWithTimeout(30 * time.Second); err != nil {
			log.Printf("⚠️  Error during shutdown: %v", err)
		}
		db.Close()
		redis.Close()
		log.Println("✅ Server shut down gracefully")
		os.Exit(0)
	}()

	// Start server
	log.Printf("🚀 Server starting on port %s", config.Cfg.App.Port)
	log.Printf("📚 API Docs: http://localhost%s/docs", config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// deriveGroup extracts the module/group name from route path
// e.g. /v1/referensi/agama → "referensi"
// e.g. /v1/auth/login → "auth"
// e.g. /v1/pdrd/list_mahasiswa → "pdrd"
func deriveGroup(path string, _ string) string {
	// Remove /v1/ prefix
	trimmed := strings.TrimPrefix(path, "/v1/")

	// Get first segment
	parts := strings.SplitN(trimmed, "/", 2)
	if len(parts) > 0 && parts[0] != "" {
		return parts[0]
	}
	return "uncategorized"
}

// customErrorHandler handles Fiber errors
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}
