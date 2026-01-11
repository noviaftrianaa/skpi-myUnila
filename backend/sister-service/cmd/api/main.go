package main

import (
	"log"
	"sister-service/apps/apiconfig"
	"sister-service/apps/bidang_ilmu"
	"sister-service/apps/dosen"
	"sister-service/apps/jabatan_struktural"
	appLogger "sister-service/apps/logger"
	"sister-service/apps/monitoring"
	"sister-service/apps/pendidikan"
	"sister-service/apps/penelitian"
	"sister-service/apps/penugasan"
	"sister-service/apps/publikasi"
	"sister-service/apps/referensi"
	"sister-service/apps/riwayat_fungsional"
	"sister-service/apps/riwayat_pekerjaan"
	"sister-service/apps/scheduler"
	"sister-service/apps/sertifikasi_dosen"
	"sister-service/apps/synclog"
	"sister-service/apps/tugas_tambahan"
	_ "sister-service/docs"
	"sister-service/external/database"
	"sister-service/external/sister_api"
	"sister-service/internal/config"
	"sister-service/pkg/crypto"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	fiberSwagger "github.com/swaggo/fiber-swagger"
)

// @title Sister Service API
// @version 1.0
// @description API for synchronizing data from Sister Kemdikbud to MyUnila/OneData PDDIKTI
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8083
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

	log.Println("🚀 Starting Sister Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to SQL Server
	db, err := database.ConnectSQLServer(config.Cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize Sister API client
	sisterAPI := sister_api.NewClient(config.Cfg.SisterAPI)
	log.Println("✅ Sister API client initialized")

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
		ServerHeader: "Sister Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
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

	// Swagger documentation
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	// Alias for consistent documentation URL across all services
	app.Get("/api/documentation", func(c *fiber.Ctx) error {
		return c.Redirect("/swagger/index.html", fiber.StatusMovedPermanently)
	})

	// Initialize encryption service for API config
	var encryptor *crypto.EncryptionService
	if config.Cfg.EncryptionKey != "" && len(config.Cfg.EncryptionKey) == 32 {
		encryptor, _ = crypto.NewEncryptionService(config.Cfg.EncryptionKey)
		log.Println("✅ Encryption service initialized for API config")
	} else {
		log.Println("⚠️  No encryption key configured - API config encryption disabled")
	}

	// Initialize Laravel encryption service for decrypting encrypted IDs from public-service
	var laravelCrypto *crypto.LaravelEncryption
	if config.Cfg.LaravelAppKey != "" {
		var err error
		laravelCrypto, err = crypto.NewLaravelEncryption(config.Cfg.LaravelAppKey)
		if err != nil {
			log.Printf("⚠️  Failed to initialize Laravel encryption: %v", err)
		} else {
			log.Println("✅ Laravel encryption service initialized for decrypting encrypted IDs")
		}
	} else {
		log.Println("⚠️  No LARAVEL_APP_KEY configured - encrypted ID decryption disabled")
	}

	// Initialize logger service (needs to be initialized first for referensi)
	loggerRepo := appLogger.NewRepository(db.DB)
	loggerService := appLogger.NewService(loggerRepo)
	loggerHandler := appLogger.NewHandler(loggerService)
	loggerHandler.RegisterRoutes(app)

	// Initialize API Config routes (accessible without /public prefix)
	if encryptor != nil {
		apiConfigRepo := apiconfig.NewRepository(db)
		apiConfigService := apiconfig.NewService(apiConfigRepo, encryptor)
		apiConfigHandler := apiconfig.NewHandler(apiConfigService)
		apiconfig.RegisterRoutes(app, apiConfigHandler)
		log.Println("✅ API Configuration management enabled")
	}

	// Initialize domain routers and get services for scheduler
	// Note: All routers create their own /api/v1 group internally, so pass app not apiV1
	referensiService := referensi.Init(app, db, sisterAPI, loggerService) // Referensi routes (protected with JWT)

	// Initialize Dosen Service with public routes (no auth required)
	// Register on app directly so it's accessible at /dosen/* without /public prefix
	dosenService := dosen.Init(app, db, sisterAPI, redisClient, loggerService, laravelCrypto) // Dosen endpoints with Redis cache and DB

	// Initialize Penugasan module
	penugasanRepo := penugasan.NewRepository(db)
	penugasanService := penugasan.NewService(penugasanRepo, sisterAPI, loggerService)
	penugasanController := penugasan.NewController(penugasanService)
	penugasan.SetupRoutes(app, penugasanController)
	log.Println("✅ Penugasan routes registered")

	// Initialize Penelitian module
	penelitianService := penelitian.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Penelitian & Pengabdian routes registered")

	// Initialize Publikasi module
	publikasiService := publikasi.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Publikasi routes registered")

	// Initialize Pendidikan Formal module
	pendidikanService := pendidikan.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Pendidikan Formal routes registered")

	// Initialize Riwayat Pekerjaan module
	riwayatPekerjaanService := riwayat_pekerjaan.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Riwayat Pekerjaan routes registered")

	// Initialize Riwayat Fungsional module
	riwayatFungsionalService := riwayat_fungsional.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Riwayat Fungsional routes registered")

	// Initialize Jabatan Struktural module
	jabatanStrukturalService := jabatan_struktural.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Jabatan Struktural routes registered")

	// Initialize Tugas Tambahan module
	tugasTambahanService := tugas_tambahan.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Tugas Tambahan routes registered")

	// Initialize Sertifikasi Dosen module
	sertifikasiDosenService := sertifikasi_dosen.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Sertifikasi Dosen routes registered")

	// Initialize Bidang Ilmu module
	bidangIlmuService := bidang_ilmu.SetupRoutes(app, db, sisterAPI, loggerService)
	log.Println("✅ Bidang Ilmu routes registered")

	synclog.RegisterRoutes(app, db)                                      // Sync logs endpoints (public, no auth)
	monitoring.RegisterRoutes(app)                                       // Monitoring endpoints (public, no auth)

	// Initialize Scheduler Service
	schedulerRepo := scheduler.NewRepository(db)
	schedulerService := scheduler.NewService(schedulerRepo, dosenService, referensiService, penugasanService, penelitianService, publikasiService, pendidikanService, riwayatPekerjaanService, riwayatFungsionalService, jabatanStrukturalService, tugasTambahanService, sertifikasiDosenService, bidangIlmuService)
	schedulerRouter := scheduler.NewRouter(schedulerService)
	schedulerRouter.RegisterRoutes(app)

	// Start cron scheduler
	if err := schedulerService.Start(); err != nil {
		log.Printf("⚠️  Failed to start scheduler: %v", err)
	} else {
		log.Println("✅ Scheduler service started successfully")
	}

	// Welcome message
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "Sister Service - Data Synchronization from Sister Kemdikbud",
			"documentation": "http://localhost:8083/api/documentation",
			"endpoints": fiber.Map{
				"health":        "/health",
				"api":           "/api/v1",
				"documentation": "/api/documentation",
				"swagger":       "/swagger/index.html",
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
