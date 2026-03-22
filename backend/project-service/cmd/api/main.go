package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/myunila/project-service/apps/project"
	"github.com/myunila/project-service/apps/webhook"
	"github.com/myunila/project-service/config"
	"github.com/myunila/project-service/database"
)

func main() {
	// Load config
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Println("🚀 Starting Project Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to PostgreSQL
	pgDB, err := database.ConnectPostgres(config.Cfg.Postgres)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pgDB.Close()

	// Connect to SQL Server (reference DB)
	msDB, err := database.ConnectSQLServer(config.Cfg.MSSQL)
	if err != nil {
		log.Printf("⚠️  Failed to connect to SQL Server (ref DB): %v", err)
		log.Println("⚠️  Continuing without SQL Server - user search will be unavailable")
		msDB = nil
	}
	if msDB != nil {
		defer msDB.Close()
	}

	// Connect to MinIO
	minioClient, err := database.ConnectMinIO(config.Cfg.MinIO)
	if err != nil {
		log.Printf("⚠️  Failed to connect to MinIO: %v", err)
		log.Println("⚠️  Continuing without MinIO - file upload will be unavailable")
		minioClient = nil
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Project Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800, *",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-User-ID",
		AllowCredentials: false,
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

	// Welcome
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "Project Management Service - MyUnila",
			"endpoints": fiber.Map{
				"health":   "/health",
				"api":      "/api/v1",
				"projects": "/api/v1/project",
				"tasks":    "/api/v1/tasks",
				"modules":  "/api/v1/modules",
				"webhooks": "/webhooks/bitbucket",
			},
		})
	})

	// API Routes
	apiV1 := app.Group("/api/v1")

	// Telegram notifier
	notifier := project.NewTelegramNotifier(
		config.Cfg.Telegram.BotToken,
		config.Cfg.Telegram.ChatID,
		config.Cfg.Telegram.Enabled,
	)
	log.Printf("📨 Telegram notifications: enabled=%v", config.Cfg.Telegram.Enabled)

	// Project module
	if minioClient != nil {
		project.InitWithMinIOAndNotifier(apiV1, pgDB, msDB, minioClient, config.Cfg.MinIO.Bucket, notifier)
	} else if msDB != nil {
		project.InitWithNotifier(apiV1, pgDB, msDB, notifier)
	} else {
		// Use a dummy ref repo if SQL Server is not available
		project.InitWithoutRefAndNotifier(apiV1, pgDB, notifier)
	}
	log.Println("✅ Project module initialized")

	// Webhook routes
	if msDB != nil {
		webhook.Init(app, pgDB, msDB)
	} else {
		webhook.InitWithoutRef(app, pgDB)
	}
	log.Println("✅ Webhook module initialized")

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("🛑 Shutting down server...")
		if err := app.Shutdown(); err != nil {
			log.Printf("⚠️  Error during shutdown: %v", err)
		}
	}()

	log.Printf("🚀 Server starting on port %s", config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

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
