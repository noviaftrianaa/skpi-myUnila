package main

import (
	"log"

	"github.com/myunila/keuangan-service/apps/api_config"
	"github.com/myunila/keuangan-service/apps/daftar_ukt"
	"github.com/myunila/keuangan-service/apps/logger"
	"github.com/myunila/keuangan-service/apps/monitoring"
	"github.com/myunila/keuangan-service/apps/spp_mhs"
	"github.com/myunila/keuangan-service/external/database"
	"github.com/myunila/keuangan-service/external/simpedam"
	"github.com/myunila/keuangan-service/internal/config"
	"github.com/myunila/keuangan-service/pkg/crypto"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// @title Keuangan Service API
// @version 1.0
// @description API for synchronizing data from SIMPEDAM to MyUnila
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8088
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Println("🚀 Starting Keuangan Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to SQL Server
	db, err := database.ConnectSQLServer(config.Cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize encryption service for API credentials
	encryptor, err := crypto.NewEncryptionService("")
	if err != nil {
		log.Fatal("Failed to initialize encryption service:", err)
	}

	// Initialize API Config service (for reading credentials from database)
	apiConfigRepo := api_config.NewRepository(db)
	apiConfigService := api_config.NewService(apiConfigRepo, encryptor)
	api_config.SetService(apiConfigService)
	log.Println("✅ API Config service initialized (Database credentials)")

	// Initialize SIMPEDAM API client
	var simpedamAPI *simpedam.Client
	if config.Cfg.SimpedamAPI.Endpoint != "" && config.Cfg.SimpedamAPI.Username != "" {
		simpedamAPI, err = simpedam.NewClient()
		if err != nil {
			log.Printf("⚠️  Failed to initialize SIMPEDAM API client: %v", err)
		} else {
			log.Println("✅ SIMPEDAM API client initialized")
		}
	} else {
		log.Println("⚠️  SIMPEDAM API credentials not configured - sync features disabled")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Keuangan Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(fiberlogger.New(fiberlogger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-User-ID",
		AllowCredentials: true,
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
		})
	})

	// API routes
	apiV1 := app.Group("/api/v1")

	// Initialize Logger service (shared sync logs)
	loggerRepo := logger.NewRepository(db.DB)
	loggerService := logger.NewService(loggerRepo)
	loggerHandler := logger.NewHandler(loggerService)
	loggerHandler.RegisterRoutes(app)
	log.Println("✅ Logger service registered (Sync Logs)")

	// Initialize Monitoring service (in-memory sync progress tracking)
	monitoring.RegisterRoutes(app)
	log.Println("✅ Monitoring service registered (Sync Progress)")

	// Initialize Daftar UKT module
	daftarUktSvc := daftar_ukt.Init(apiV1, db, simpedamAPI, loggerService)
	log.Println("✅ Daftar UKT module initialized")

	// Initialize SPP Mhs module
	spp_mhs.Init(apiV1, db, simpedamAPI, loggerService)
	log.Println("✅ SPP Mhs module initialized")

	// Dashboard stats endpoint
	apiV1.Get("/dashboard/stats", func(c *fiber.Ctx) error {
		ctx := c.Context()

		// Get stats from daftar_ukt service
		stats, err := daftarUktSvc.GetStats(ctx)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   err.Error(),
			})
		}

		// Build response matching frontend expectations
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"total_records_synced": stats.TotalDaftarUkt,
				"total_endpoints":      3, // daftar_ukt, spp_mhs, mapping
				"synced_endpoints":     1, // assume at least daftar_ukt is active
				"success_rate":         100.0,
				"last_sync_time":       stats.LastSync,
				"api_status":           "healthy",
				"module_stats": []fiber.Map{
					{
						"name":        "Daftar UKT",
						"key":         "daftar_ukt",
						"description": "Daftar kelas UKT per prodi per tahun dari SIMPEDAM",
						"total_count": stats.TotalDaftarUkt,
						"last_sync":   stats.LastSync,
						"status":      "active",
						"href":        "/dashboard/integrator/keuangan/daftar-ukt",
					},
					{
						"name":        "SPP Mahasiswa",
						"key":         "spp_mhs",
						"description": "Data pembayaran SPP mahasiswa dari SIMPEDAM",
						"total_count": 0,
						"last_sync":   nil,
						"status":      "pending",
						"href":        "/dashboard/integrator/keuangan/spp-mhs",
					},
					{
						"name":        "Mapping Prodi",
						"key":         "mapping_prodi",
						"description": "Mapping prodi SIMPEDAM ke MyUnila",
						"total_count": stats.TotalMapped,
						"last_sync":   stats.LastSync,
						"status":      "active",
						"href":        "/dashboard/integrator/keuangan/mapping-prodi",
					},
				},
				"recent_syncs": []fiber.Map{},
				"quick_stats": fiber.Map{
					"total_daftar_ukt":    stats.TotalDaftarUkt,
					"total_spp_mhs":       0,
					"total_prodi_mapped":  stats.TotalMapped,
					"total_prodi_unmapped": stats.TotalUnmapped,
				},
			},
		})
	})

	// Welcome message
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "Keuangan Service - Data Synchronization from SIMPEDAM",
			"endpoints": fiber.Map{
				"health":     "/health",
				"api":        "/api/v1",
				"daftar_ukt": "/api/v1/daftar-ukt",
				"spp_mhs":    "/api/v1/spp-mhs",
				"sync_logs":  "/api/v1/sync-logs",
				"monitoring": "/api/v1/monitoring/active",
			},
		})
	})

	// Start server
	log.Printf("🚀 Server starting on port %s", config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
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
