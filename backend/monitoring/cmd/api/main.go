package main

import (
	"log"

	"monitoring-service/apps/blog_sync"
	"monitoring-service/apps/crawler"
	"monitoring-service/apps/detector"
	"monitoring-service/apps/google_gsc"
	"monitoring-service/apps/keywords"
	"monitoring-service/apps/scheduler"
	"monitoring-service/apps/settings"
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

	// 2b. Auto-migrate: ensure new columns exist
	db.Exec(`
		IF NOT EXISTS (
			SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA='monitoring' AND TABLE_NAME='detected_threats' AND COLUMN_NAME='snippet'
		)
		ALTER TABLE monitoring.detected_threats ADD snippet NVARCHAR(MAX) NULL
	`)
	db.Exec(`
		IF NOT EXISTS (
			SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA='monitoring' AND TABLE_NAME='sites' AND COLUMN_NAME='admin_whatsapp'
		)
		ALTER TABLE monitoring.sites ADD admin_whatsapp NVARCHAR(50) NULL
	`)
	db.Exec(`
		IF NOT EXISTS (
			SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA='monitoring' AND TABLE_NAME='sites' AND COLUMN_NAME='id_sms'
		)
		ALTER TABLE monitoring.sites ADD id_sms UNIQUEIDENTIFIER NULL
	`)
	// Auto-seed: whatsapp_template setting
	db.Exec(`
		INSERT INTO monitoring.settings
			(key_group, setting_key, setting_value, description, is_sensitive, create_date, id_creator, last_update, soft_delete)
		SELECT 'alert', 'whatsapp_template',
			'Yth. {nama_pj},' + CHAR(10) + CHAR(10)
			+ 'Kami dari Tim Monitoring Web Universitas Lampung menginformasikan bahwa website *{nama_situs}* ({url_situs}) terdeteksi memerlukan perhatian.' + CHAR(10) + CHAR(10)
			+ 'Mohon segera lakukan pengecekan dan penanganan:' + CHAR(10)
			+ '1. Periksa konten website dari sisipan ilegal (judi online, dll)' + CHAR(10)
			+ '2. Ganti password admin & FTP' + CHAR(10)
			+ '3. Update CMS dan plugin ke versi terbaru' + CHAR(10)
			+ '4. Scan malware dan hapus file mencurigakan' + CHAR(10) + CHAR(10)
			+ 'Detail lengkap dapat dilihat di dashboard monitoring.' + CHAR(10) + CHAR(10)
			+ 'Terima kasih.',
			'Template pesan WhatsApp ke PJ situs. Placeholder: {nama_pj}, {nama_situs}, {url_situs}',
			0, GETDATE(), '00000000-0000-0000-0000-000000000001', GETDATE(), 0
		WHERE NOT EXISTS (
			SELECT 1 FROM monitoring.settings
			WHERE key_group='alert' AND setting_key='whatsapp_template' AND soft_delete=0
		)
	`)

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

	// Settings module
	settings.Init(app, db)

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
