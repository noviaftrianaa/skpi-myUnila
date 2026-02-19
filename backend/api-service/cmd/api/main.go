package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/myunila/api-service/apps/auth"
	"github.com/myunila/api-service/apps/diklat"
	"github.com/myunila/api-service/apps/pdrd"
	"github.com/myunila/api-service/apps/referensi"
	"github.com/myunila/api-service/docs"
	"github.com/myunila/api-service/external/database"
	"github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/config"
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

	if config.Cfg.App.Env == "production" {
		endpointPrefix = "live"
	} else {
		endpointPrefix = "dev"
	}

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
				"api":           "/v1",
				"auth_login":    "/v1/auth/login",
				"auth_check":    "/v1/auth/check-token",
			},
		})
	})

	// API routes - menggunakan /v1 tanpa /api prefix
	// Production URL: https://my.unila.ac.id/gateway/api-service/v1/...
	apiV1 := app.Group(fmt.Sprintf("/%s/v1", endpointPrefix))

	// Initialize Auth module (public - tanpa auth)
	auth.Init(apiV1, db)
	log.Println("✅ Auth module initialized")

	// Initialize Referensi module (protected - dengan JWT auth middleware)
	referensi.RegisterRoutes(apiV1, db, redis.Client)
	log.Println("✅ Referensi module initialized")

	// Initialize Diklat module (protected - dengan JWT auth middleware)
	diklat.RegisterRoutes(apiV1, db, redis.Client)
	log.Println("✅ Diklat module initialized")

	pdrd.RegisterRoutes(apiV1, db, redis.Client)
	log.Println("✅ PDRD module initialized")

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
