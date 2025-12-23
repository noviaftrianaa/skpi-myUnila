package main

import (
	"log"

	"github.com/myunila/api-service/external/database"
	"github.com/myunila/api-service/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// @title Api Service API
// @version 1.0
// @description API for Api Service
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8087
// @BasePath /
// @schemes http https

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Println("🚀 Starting Api Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

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

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Api Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[\] \ - \ \ \\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: true,
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
		})
	})

	// Welcome endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "Api Service API",
			"endpoints": fiber.Map{
				"health": "/health",
				"api":    "/api/v1",
			},
		})
	})

	// API routes
	api := app.Group("/api/v1")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Api Service API v1",
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
