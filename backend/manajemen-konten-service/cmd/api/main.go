// Manajemen Konten Service — myUnila portal CMS service.
// Mengelola pengumuman, berita, artikel (1 tabel `pengumuman` dgn field `tipe`),
// kategori, dan notifikasi. Mengikuti pola backend/myunila-service.
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
	"github.com/myunila/manajemen-konten-service/apps/kategori"
	"github.com/myunila/manajemen-konten-service/apps/pengumuman"
	"github.com/myunila/manajemen-konten-service/external/database"
	"github.com/myunila/manajemen-konten-service/internal/config"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}
	log.Println("🚀 Starting Manajemen Konten Service...")
	log.Printf("📝 App: %s | Env: %s | Port: %s", config.Cfg.App.Name, config.Cfg.App.Env, config.Cfg.App.Port)

	db, err := database.ConnectSQLServer(config.Cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Manajemen Konten Service",
		ErrorHandler: customErrorHandler,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))
	app.Use(recover.New())
	app.Use(fiberlogger.New(fiberlogger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": config.Cfg.App.Name, "version": "1.0.0"})
	})

	apiV1 := app.Group("/api/v1")
	kategori.Init(apiV1, db.DB)
	log.Println("✅ Kategori module initialized")
	pengumuman.Init(apiV1, db.DB)
	log.Println("✅ Pengumuman module initialized (unified konten: pengumuman/berita/artikel)")

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"endpoints": fiber.Map{
				"health":       "/health",
				"kategori":     "/api/v1/kategori",
				"pengumuman":   "/api/v1/pengumuman",
				"pengumuman_dashboard": "/api/v1/pengumuman/dashboard?tipe=pengumuman&limit=5",
			},
		})
	})

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		log.Println("🛑 Shutting down...")
		_ = app.Shutdown()
	}()

	log.Printf("🚀 Listening on %s", config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatal("server:", err)
	}
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{"success": false, "message": err.Error()})
}
