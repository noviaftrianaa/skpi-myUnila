package main

import (
	"log"

	"monitoring-service/apps/blog_sync"
	"monitoring-service/apps/crawler"
	"monitoring-service/apps/detector"
	"monitoring-service/apps/google_gsc"
	"monitoring-service/apps/keywords"
	"monitoring-service/apps/scheduler"
	"monitoring-service/apps/site"
	"monitoring-service/apps/summary"
	"monitoring-service/apps/threats"
	"monitoring-service/internal/config"
	"monitoring-service/internal/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// 1. Load configuration
	config.LoadConfig()

	// 2. Connect to database
	db := database.ConnectSQLServer(config.Cfg.DB)
	redisClient := database.ConnectRedis(config.Cfg.Redis)
	if redisClient != nil {
		log.Println("✅ Redis connected — caching enabled")
	} else {
		log.Println("⚠️  Redis not available — caching disabled")
	}

	// 3. Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "Monitoring Service",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// 4. Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:9800",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	// 5. Health check (no auth)
	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(); err != nil {
			return c.Status(503).JSON(fiber.Map{
				"status":  "error",
				"message": "Database unavailable",
			})
		}
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": config.Cfg.App.Name,
			"env":     config.Cfg.App.Env,
		})
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"docs":    "/health",
		})
	})

	// 6. Register modules
	siteSvc := site.Init(app, db)
	kwSvc := keywords.Init(app, db)
	thrSvc := threats.Init(app, db)

	// Phase 4b: Detector + Crawler
	det := detector.New(kwSvc, thrSvc)
	crawlerSvc := crawler.Init(app, db, siteSvc, det, &config.Cfg)

	// Phase 5: Blog Sync (Blogger API)
	blogSyncSvc := blog_sync.Init(app, db, siteSvc, config.Cfg.Blogger)

	// Phase 6: Google Search Console (Indexing API)
	google_gsc.Init(app, db, config.Cfg.GSC)

	// Phase 7: Public summary API + daily summary cron
	summarySvc := summary.Init(app, db)

	// 7. Start scheduler
	sched := scheduler.New(siteSvc, crawlerSvc, blogSyncSvc, summarySvc)
	sched.Start()
	defer sched.Stop()

	// 8. Start server
	log.Printf("🚀 %s starting on port %s", config.Cfg.App.Name, config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}
