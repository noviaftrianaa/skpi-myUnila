package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/myunila/myunila-service/apps/api_config"
	"github.com/myunila/myunila-service/apps/logger"
	"github.com/myunila/myunila-service/apps/manakses/unit_organisasi"
	"github.com/myunila/myunila-service/apps/monitoring"
	"github.com/myunila/myunila-service/apps/scheduler"
	"github.com/myunila/myunila-service/apps/radius"
	"github.com/myunila/myunila-service/apps/sikep/pegawai"
	"github.com/myunila/myunila-service/apps/sikep/referensi"
	"github.com/myunila/myunila-service/docs"
	"github.com/myunila/myunila-service/external/database"
	"github.com/myunila/myunila-service/external/radius_api"
	"github.com/myunila/myunila-service/external/sikep_api"
	"github.com/myunila/myunila-service/internal/config"
	"github.com/myunila/myunila-service/pkg/crypto"
)

// @title MyUnila Service API
// @version 1.0
// @description API for synchronizing data from external systems (SIKEP, Siakadu, etc.) to MyUnila/OneData
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8086
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

	log.Println("🚀 Starting MyUnila Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to SQL Server
	db, err := database.ConnectSQLServer(config.Cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize encryption service for API config
	encryptor, err := crypto.NewEncryptionService(os.Getenv("API_CONFIG_ENCRYPTION_KEY"))
	if err != nil {
		log.Printf("⚠️  Failed to initialize encryption service: %v", err)
	} else {
		log.Println("✅ Encryption service initialized")
	}

	// Initialize API Config service first (before SIKEP client, so it can read DB config)
	apiConfigSvc := api_config.InitService(db.DB, encryptor)
	api_config.SetService(apiConfigSvc)
	log.Println("✅ API Config service initialized (for external clients)")

	// Initialize SIKEP API client (now can read config from database)
	sikepAPI, err := sikep_api.NewSikepClient()
	if err != nil {
		log.Printf("⚠️  Failed to initialize SIKEP API client: %v", err)
	} else {
		log.Println("✅ SIKEP API client initialized")
	}

	// Initialize Radius API client
	radiusAPI, err := radius_api.NewRadiusClient()
	if err != nil {
		log.Printf("⚠️  Failed to initialize Radius API client: %v", err)
	} else {
		log.Println("✅ Radius API client initialized")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "MyUnila Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares - CORS must be first to handle preflight requests properly
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800, *",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-User-ID",
		AllowCredentials: false, // Set to false when using * in AllowOrigins
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))
	app.Use(recover.New())
	app.Use(fiberlogger.New(fiberlogger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
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

	// Initialize API Config module
	api_config.Init(apiV1, db.DB, encryptor)
	log.Println("✅ API Config module initialized")

	// Initialize Logger module FIRST (before other modules that depend on it)
	logger.Init(apiV1, db.DB)
	log.Println("✅ Logger module initialized")

	// Initialize SIKEP Pegawai module
	pegawaiSvc := pegawai.Init(apiV1, db.DB, sikepAPI)
	log.Println("✅ SIKEP Pegawai module initialized")

	// Initialize SIKEP Referensi module
	referensi.Init(apiV1, db.DB, sikepAPI)
	log.Println("✅ SIKEP Referensi module initialized")

	// Initialize Radius module
	radiusSvc := radius.Init(apiV1, db.DB, radiusAPI)
	log.Println("✅ Radius module initialized")

	// Initialize ManAkses Unit Organisasi module
	unitOrgSvc := unit_organisasi.RegisterRoutes(apiV1, db.DB)
	log.Println("✅ ManAkses Unit Organisasi module initialized")

	// Initialize Monitoring module
	monitoring.Init(apiV1)
	log.Println("✅ Monitoring module initialized")

	// Initialize Scheduler module
	schedulerSvc := scheduler.Init(apiV1, db.DB)
	log.Println("✅ Scheduler module initialized")

	// Connect sync services to scheduler
	schedulerSvc.SetRadiusSyncService(radiusSvc)
	log.Println("✅ Radius sync service connected to scheduler")

	// Connect pegawai sync service to scheduler
	schedulerSvc.SetPegawaiSyncService(&pegawaiSyncAdapter{svc: pegawaiSvc})
	log.Println("✅ Pegawai sync service connected to scheduler")

	// Connect unit organisasi sync service to scheduler
	schedulerSvc.SetUnitOrganisasiSyncService(&unitOrgSyncAdapter{svc: unitOrgSvc})
	log.Println("✅ Unit Organisasi sync service connected to scheduler")

	// Start scheduler
	if err := schedulerSvc.Start(); err != nil {
		log.Printf("⚠️  Failed to start scheduler: %v", err)
	}

	// Setup API Documentation
	docs.SetupDocs(app)
	log.Println("✅ API Documentation available at /docs")

	// Welcome message
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "MyUnila Service - Data Synchronization from External Systems",
			"endpoints": fiber.Map{
				"docs":             "/docs",
				"health":           "/health",
				"api":              "/api/v1",
				"api_configs":      "/api/v1/api-configs",
				"sikep_pegawai":    "/api/v1/sikep/pegawai",
				"sikep_stats":      "/api/v1/sikep/pegawai/stats",
				"sikep_sync":       "/api/v1/sikep/pegawai/sync",
				"sikep_referensi":  "/api/v1/sikep/referensi",
				"sikep_ref_meta":   "/api/v1/sikep/referensi/metadata",
				"radius_pengguna":  "/api/v1/radius/pengguna",
				"radius_stats":     "/api/v1/radius/stats",
				"radius_sync":      "/api/v1/radius/sync",
				"logger":           "/api/v1/logger",
				"monitoring":       "/api/v1/monitoring",
				"scheduler":        "/api/v1/schedules",
			},
		})
	})

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("🛑 Shutting down server...")
		schedulerSvc.Stop()
		if err := app.Shutdown(); err != nil {
			log.Printf("⚠️  Error during shutdown: %v", err)
		}
	}()

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

// pegawaiSyncAdapter adapts pegawai.Service to scheduler.PegawaiSyncService
type pegawaiSyncAdapter struct {
	svc pegawai.Service
}

func (a *pegawaiSyncAdapter) SyncPegawai(ctx context.Context, filter interface{}, syncedBy string) (interface{}, error) {
	// Convert filter to pegawai.SyncFilter if needed
	var syncFilter *pegawai.SyncFilter
	if filter != nil {
		if f, ok := filter.(*pegawai.SyncFilter); ok {
			syncFilter = f
		}
	}
	return a.svc.SyncPegawai(ctx, syncFilter, syncedBy)
}

// unitOrgSyncAdapter adapts unit_organisasi.Service to scheduler.UnitOrganisasiSyncService
type unitOrgSyncAdapter struct {
	svc unit_organisasi.Service
}

func (a *unitOrgSyncAdapter) SyncFromSMS(ctx context.Context, syncedBy string) (interface{}, error) {
	return a.svc.SyncFromSMS(ctx, syncedBy)
}
