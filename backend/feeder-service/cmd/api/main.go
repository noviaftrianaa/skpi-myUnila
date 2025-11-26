package main

import (
	"log"
	"github.com/myunila/feeder-service/apps/aktivitas_mahasiswa"
	"github.com/myunila/feeder-service/apps/apiconfig"
	"github.com/myunila/feeder-service/apps/logger"
	"github.com/myunila/feeder-service/apps/mahasiswa"
	"github.com/myunila/feeder-service/apps/matkul_kurikulum"
	"github.com/myunila/feeder-service/apps/rencana_evaluasi"
	"github.com/myunila/feeder-service/apps/monitoring"
	"github.com/myunila/feeder-service/apps/scheduler"
	"github.com/myunila/feeder-service/external/database"
	"github.com/myunila/feeder-service/external/feeder_api"
	"github.com/myunila/feeder-service/internal/config"
	"github.com/myunila/feeder-service/pkg/crypto"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// @title Feeder Service API
// @version 1.0
// @description API for synchronizing data from Neo Feeder PDDIKTI to MyUnila/OneData PDDIKTI
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8084
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

	log.Println("🚀 Starting Feeder Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to SQL Server
	db, err := database.ConnectSQLServer(config.Cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize Feeder API client
	feederAPI, err := feeder_api.NewFeederClient()
	if err != nil {
		log.Printf("⚠️  Failed to initialize Feeder API client: %v", err)
	} else {
		log.Println("✅ Feeder API client initialized")
	}

	// Initialize Redis client for caching
	redisClient := database.ConnectRedis()
	if redisClient != nil {
		log.Println("✅ Redis client connected successfully")
	} else {
		log.Println("⚠️  Redis client not available - caching disabled")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Feeder Service",
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

	// Initialize encryption service for API config
	var encryptor *crypto.EncryptionService
	if config.Cfg.EncryptionKey != "" && len(config.Cfg.EncryptionKey) == 32 {
		encryptor, _ = crypto.NewEncryptionService(config.Cfg.EncryptionKey)
		log.Println("✅ Encryption service initialized for API config")
	} else {
		log.Println("⚠️  No encryption key configured - API config encryption disabled")
	}

	// Initialize API Config routes (under /api/v1 for consistency)
	if encryptor != nil {
		apiConfigRepo := apiconfig.NewRepository(db)
		apiConfigService := apiconfig.NewService(apiConfigRepo, encryptor)
		apiConfigHandler := apiconfig.NewHandler(apiConfigService)
		apiconfig.RegisterRoutes(apiV1, apiConfigHandler)
		log.Println("✅ API Configuration management enabled")
	}

	// Initialize Logger service (shared sync logs)
	loggerRepo := logger.NewRepository(db.DB)
	loggerService := logger.NewService(loggerRepo)
	loggerHandler := logger.NewHandler(loggerService)
	loggerHandler.RegisterRoutes(app)
	log.Println("✅ Logger service registered (Sync Logs)")

	// Initialize Monitoring service (in-memory sync progress tracking)
	monitoring.RegisterRoutes(app)
	log.Println("✅ Monitoring service registered (Sync Progress)")

	// Initialize Mahasiswa module (pass logger service for sync logging)
	mahasiswaService := mahasiswa.Init(apiV1, db, feederAPI, redisClient, loggerService)
	log.Println("✅ Mahasiswa routes registered")

	// Initialize Aktivitas Mahasiswa module (pass logger service for sync logging)
	aktivitasService := aktivitas_mahasiswa.Init(apiV1, db, feederAPI, redisClient, loggerService)
	log.Println("✅ Aktivitas Mahasiswa module initialized")

	// Initialize Matkul Kurikulum module (pass logger service for sync logging)
	kurikulumService := matkul_kurikulum.Init(apiV1, db, feederAPI, redisClient, loggerService)
	log.Println("✅ Matkul Kurikulum module initialized")

	// Initialize Rencana Evaluasi MK module (pass logger service for sync logging)
	_ = rencana_evaluasi.Init(apiV1, db, feederAPI, redisClient, loggerService)
	log.Println("✅ Rencana Evaluasi MK module initialized")

	// Initialize Scheduler service (supports mahasiswa, aktivitas_mahasiswa, and kurikulum syncs)
	schedulerRepo := scheduler.NewRepository(db)
	schedulerService := scheduler.NewService(schedulerRepo, mahasiswaService, aktivitasService, kurikulumService)
	schedulerHandler := scheduler.NewHandler(schedulerService)
	scheduler.RegisterRoutes(apiV1, schedulerHandler)

	// Start scheduler (load and register all active schedules)
	if err := schedulerService.Start(); err != nil {
		log.Printf("⚠️  Failed to start scheduler service: %v", err)
	}
	// Ensure scheduler stops gracefully on shutdown
	defer schedulerService.Stop()

	log.Println("✅ Scheduler service registered and started")

	// Welcome message
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "Feeder Service - Data Synchronization from Neo Feeder PDDIKTI",
			"endpoints": fiber.Map{
				"health":              "/health",
				"api":                 "/api/v1",
				"mahasiswa":           "/api/v1/mahasiswa",
				"aktivitas_mahasiswa": "/api/v1/aktivitas-mahasiswa",
				"kurikulum":           "/api/v1/kurikulum",
				"rencana_evaluasi":    "/api/v1/rencana-evaluasi",
				"schedules":           "/api/v1/schedules",
				"sync_logs":           "/api/v1/sync-logs",
				"monitoring":          "/api/v1/monitoring/active",
				"apiconfig":           "/apiconfig",
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
