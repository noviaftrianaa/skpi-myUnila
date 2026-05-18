package main

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/myunila/blog-service/apps/audit"
	"github.com/myunila/blog-service/apps/blog"
	"github.com/myunila/blog-service/apps/coauthor"
	"github.com/myunila/blog-service/apps/health"
	"github.com/myunila/blog-service/apps/interaction"
	"github.com/myunila/blog-service/apps/kategori"
	"github.com/myunila/blog-service/apps/mail"
	"github.com/myunila/blog-service/apps/media"
	"github.com/myunila/blog-service/apps/moderation"
	"github.com/myunila/blog-service/apps/og"
	"github.com/myunila/blog-service/apps/post"
	"github.com/myunila/blog-service/apps/push"
	"github.com/myunila/blog-service/apps/search"
	"github.com/myunila/blog-service/apps/series"
	"github.com/myunila/blog-service/apps/subdomain"
	"github.com/myunila/blog-service/apps/subscriber"
	"github.com/myunila/blog-service/apps/tag"
	"github.com/myunila/blog-service/config"
	"github.com/myunila/blog-service/database"
	"github.com/myunila/blog-service/external/meilisearch"
	storage "github.com/myunila/blog-service/external/minio"
	"github.com/myunila/blog-service/middleware"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	log.Println("🚀 Starting blog-service…")
	log.Printf("📝 App: %s  |  Env: %s  |  Port: %s", cfg.App.Name, cfg.App.Env, cfg.App.Port)

	db, err := database.ConnectPostgres(cfg.Postgres)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer db.Close()

	// MinIO storage — soft-fail (returns nil client if config empty for local dev).
	minioClient, merr := storage.Init(cfg.MinIO)
	if merr != nil {
		log.Fatalf("minio: %v", merr)
	}

	// Meilisearch — soft-fail. When nil, search endpoint returns empty results
	// and the indexing hooks become no-ops.
	msClient, mserr := meilisearch.Init(cfg.Meilisearch)
	if mserr != nil {
		log.Printf("meilisearch init: %v (continuing without search)", mserr)
	}

	app := fiber.New(fiber.Config{
		AppName:      cfg.App.Name,
		ServerHeader: "blog-service",
	})

	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Authorization,X-Requested-With",
		AllowCredentials: false,
	}))

	// Health
	health.RegisterRoutes(app, health.NewHandler(db))

	// API v1 — public endpoints (read-only)
	api := app.Group("/api/v1")

	// Blogs
	blogRepo := blog.NewRepository(db)
	blog.RegisterRoutes(api, blog.NewHandler(blogRepo))

	// Template Theme (public list + admin CRUD)
	templateThemeRepo := blog.NewTemplateThemeRepository(db)
	templateThemeHandler := blog.NewTemplateThemeHandler(templateThemeRepo)
	blog.RegisterTemplateThemeRoutes(api, templateThemeHandler)

	// RSS feeds (apex + per-blog)
	apexHost := "blog.unila.ac.id"
	feedHandler := blog.NewFeedHandler(db, blogRepo, apexHost)
	blog.RegisterFeedRoutes(api, feedHandler)
	blog.RegisterSitemapRoutes(api, feedHandler)

	// Dynamic OG image generator — public, no auth, heavy cache.
	og.RegisterRoutes(api, og.NewHandler())

	// Co-author public byline (for post detail page).
	// Notifier wired below once notifService is initialised.
	coAuthorRepo := coauthor.NewRepository(db)
	coAuthorHandler := coauthor.NewHandler(coAuthorRepo)
	coauthor.RegisterPublicRoutes(api, coAuthorHandler)

	// Series/Collections — public endpoints (by-subdomain + series-context).
	seriesRepo := series.NewRepository(db)
	seriesHandler := series.NewHandler(seriesRepo)
	series.RegisterPublicRoutes(api, seriesHandler, func(sub string) (uuid.UUID, error) {
		b, err := blogRepo.GetBySubdomain(context.Background(), sub)
		if err != nil {
			return uuid.Nil, err
		}
		return b.IDBlog, nil
	})

	// Audit log (di-share dengan post mutations untuk logging)
	auditRepo := audit.NewRepository(db)

	// Posts (public read + me/admin write)
	postRepo := post.NewRepository(db)
	postHandler := post.NewHandler(postRepo)
	postHandler.SetBlogRepo(blogRepo)
	postHandler.SetAuditRepo(auditRepo)
	post.RegisterRoutes(api, postHandler)

	// Search — Meilisearch index over published posts. Hooked into post
	// mutations so the index stays warm. Public read endpoint at /search/posts.
	searchRepo := search.NewRepository(db)
	searchSvc := search.NewService(searchRepo, msClient)
	searchHandler := search.NewHandler(searchSvc, msClient)
	postHandler.SetSearcher(searchSvc)
	// Note: search public routes registered di bawah pada apiOpt group dengan
	// rate limit (60/menit/IP, skip-auth) — moved untuk pakai JWTOptional supaya
	// SearchLimit bisa skip authenticated user.

	// Kategori (public read)
	kategoriRepo := kategori.NewRepository(db)
	kategoriHandler := kategori.NewHandler(kategoriRepo)
	kategori.RegisterRoutes(api, kategoriHandler)

	// Tag (public read)
	tagRepo := tag.NewRepository(db)
	tagHandler := tag.NewHandler(tagRepo)
	tag.RegisterRoutes(api, tagHandler)

	// =========================================================================
	// Interaction (Like + Komentar) — mix public + auth-optional + auth-required
	// =========================================================================
	likeRepo := interaction.NewLikeRepository(db)
	likeHandler := interaction.NewLikeHandler(likeRepo)
	komentarRepo := interaction.NewKomentarRepository(db)
	komentarHandler := interaction.NewKomentarHandler(komentarRepo)
	followerRepo := interaction.NewFollowerRepository(db)
	followerHandler := interaction.NewFollowerHandler(followerRepo)
	bookmarkRepo := interaction.NewBookmarkRepository(db)
	bookmarkHandler := interaction.NewBookmarkHandler(bookmarkRepo)
	likeKomentarRepo := interaction.NewLikeKomentarRepository(db)
	likeKomentarHandler := interaction.NewLikeKomentarHandler(likeKomentarRepo)
	bannedCommenterRepo := interaction.NewBannedCommenterRepository(db)
	bannedCommenterHandler := interaction.NewBannedCommenterHandler(bannedCommenterRepo, komentarRepo)

	// Mail subsystem — admin-managed SMTP profile + outbox worker + notif bridge.
	// Bridge plugs into NotifRepository.Insert so every in-app notif also
	// enqueues an email (when recipient has email + tipe not muted).
	mailConfigRepo := mail.NewConfigRepository(db)
	mailOutboxRepo := mail.NewOutboxRepository(db)
	mailSender := mail.NewSender(mailConfigRepo)
	mailBridge := mail.NewBridge(db, mailOutboxRepo, mailConfigRepo)
	mailHandler := mail.NewHandler(mailConfigRepo, mailOutboxRepo, mailSender)
	mailWorker := mail.NewWorker(mailConfigRepo, mailOutboxRepo, mailSender)

	// Phase BE — weekly email digest. 6h tick; per-user max 1x/7-days.
	digestService := mail.NewDigestService(db, mailOutboxRepo, mailConfigRepo)
	digestWorker := mail.NewDigestWorker(digestService)
	mailHandler.SetDigestService(digestService) // admin trigger + stats endpoints

	// Phase BA — web push subsystem (VAPID + service worker bridge).
	pushRepo := push.NewRepository(db)
	pushSender := push.NewSender(pushRepo, cfg.WebPush.PublicKey, cfg.WebPush.PrivateKey, cfg.WebPush.Subject)
	pushHandler := push.NewHandler(pushRepo, cfg.WebPush.PublicKey, pushSender)
	pushBridge := push.NewBridge(pushSender)
	push.LogConfigured(pushSender.Configured())

	// Phase BB — newsletter subscribers (public opt-in, double opt-in, broadcast).
	subscriberRepo := subscriber.NewRepository(db)
	subscriberMailer := mail.NewSubscriberMailer(db, mailOutboxRepo, mailConfigRepo)
	subscriberBlogResolver := subscriber.NewBlogResolverAdapter(blogRepo)
	subscriberHandler := subscriber.NewHandler(subscriberRepo, subscriberBlogResolver, subscriberMailer)
	subscriberBroadcaster := subscriber.NewBroadcaster(db, subscriberRepo, subscriberMailer)
	postHandler.SetSubscriberBroadcaster(subscriberBroadcaster) // hook publish → broadcast

	// Notif service — emitter dipakai oleh handler engagement lainnya via SetNotif().
	notifRepo := interaction.NewNotifRepository(db)
	notifRepo.SetEmailEnqueuer(mailBridge) // hook in→ email outbox
	notifRepo.SetPushNotifier(pushBridge)  // Phase BA — web push fan-out
	notifService := interaction.NewNotifService(notifRepo, db)
	notifHandler := interaction.NewNotifHandler(notifRepo)
	likeHandler.SetNotif(notifService)
	komentarHandler.SetNotif(notifService)
	followerHandler.SetNotif(notifService)
	postHandler.SetNotif(notifService) // emit new_post_from_following on first publish
	coAuthorHandler.SetNotifier(notifService) // invite + response notifs (Phase AU)

	// Moderation (laporan_post) — public read (alasan list) + auth-required submit + admin
	laporanRepo := moderation.NewRepository(db)
	laporanHandler := moderation.NewHandler(laporanRepo)
	reservedWordsRepo := moderation.NewReservedWordsRepository(db)
	reservedWordsHandler := moderation.NewReservedWordsHandler(reservedWordsRepo)

	// Banned user — middleware repo + admin handler.
	banRepo := moderation.NewBanRepository(db)
	banHandler := moderation.NewBanHandler(banRepo)
	banGuard := moderation.RejectBannedUser(banRepo)

	// Public routes — auth-optional: JWTOptional supaya user_id ke-extract kalau ada token.
	// banGuard skips read-only methods, so banned users can still browse public
	// content while their write actions (like/komentar/follow/bookmark POST) are
	// blocked with a clear 403 reason.
	apiOpt := app.Group("/api/v1", middleware.JWTOptional(cfg.JWT), banGuard)
	// Per-route rate limits untuk public/auth-optional write endpoints (security tuneup).
	interactionRL := interaction.RateLimits{
		Comment:    middleware.CommentLimit(),
		Engagement: middleware.EngagementLimit(),
	}
	interaction.RegisterPublicRoutes(apiOpt, likeHandler, komentarHandler, followerHandler, bookmarkHandler, likeKomentarHandler, interactionRL)
	moderation.RegisterPublicRoutes(apiOpt, laporanHandler)
	push.RegisterPublicRoutes(apiOpt, pushHandler) // Phase BA — GET /push/vapid-public
	subscriber.RegisterPublicRoutes(apiOpt, subscriberHandler, middleware.SubscribeLimit()) // Phase BB
	search.RegisterPublicRoutes(apiOpt, searchHandler, middleware.SearchLimit())

	// =========================================================================
	// Authenticated owner endpoints — JWT required, ownership via id_pengguna_pdut
	// =========================================================================
	me := app.Group("/api/v1/me", middleware.JWTAuth(cfg.JWT), banGuard, mail.CaptureEmailMiddleware(db))
	post.RegisterMineRoutes(me, postHandler)

	// Subdomain claim flow (generator + 4-layer validation + claim)
	subdomainRepo := subdomain.NewRepository(db)
	subdomainHandler := subdomain.NewHandler(subdomainRepo)
	klaimRepo := moderation.NewKlaimRepository(db)
	subdomainHandler.SetClaimLogger(klaimRepo) // log every successful claim
	subdomain.RegisterRoutes(me, subdomainHandler)

	// Audit log (activity timeline) — auditRepo dibuat di atas, share dgn post
	audit.RegisterMineRoutes(me, audit.NewHandler(auditRepo))

	// Bookmark "reading list" — milik user, bukan blog (tanpa resolveBlogID middleware)
	interaction.RegisterBookmarkMineRoutes(me, bookmarkHandler)

	// Notif inbox — feed engagement (like/komentar/reply/follower)
	interaction.RegisterNotifMineRoutes(me, notifHandler)
	push.RegisterMineRoutes(me, pushHandler, middleware.PushSubscribeLimit()) // Phase BA — subscribe/list/test/unsubscribe

	// Reading progress — scroll position + Continue Reading widget. Auth-required
	// upsert + list under /me; public auth-optional GET for restore-on-revisit.
	readingProgressRepo := interaction.NewReadingProgressRepository(db)
	readingProgressHandler := interaction.NewReadingProgressHandler(readingProgressRepo)
	interaction.RegisterReadingProgressMineRoutes(me, readingProgressHandler)
	interaction.RegisterReadingProgressPublicRoutes(apiOpt, readingProgressHandler)

	// Komentar moderation + Followers list (per-blog owner)
	meBlog := me.Group("", interaction.ResolveBlogMiddleware(blogRepo))
	interaction.RegisterMineRoutes(meBlog, komentarHandler, followerHandler, bannedCommenterHandler)
	subscriber.RegisterMineRoutes(meBlog, subscriberHandler) // Phase BB — owner dashboard list

	// Media library — upload/list/delete files di MinIO bucket blog-media.
	// Pakai meBlog group supaya id_blog ke-set di Locals via ResolveBlogMiddleware.
	mediaRepo := media.NewRepository(db)
	mediaHandler := media.NewHandler(mediaRepo, minioClient, db)
	media.RegisterMineRoutes(meBlog, mediaHandler)

	// Series — group posts into ordered sequences. Owner endpoints need id_blog
	// from the ResolveBlogMiddleware group too.
	series.RegisterMineRoutes(meBlog, seriesHandler)

	// Co-author management — owner endpoints for adding contributors to own posts
	// and a separate list of "posts I'm credited in".
	coauthor.RegisterMineRoutes(meBlog, coAuthorHandler)

	// =========================================================================
	// Admin endpoints — JWT + Role check (Administrator/Developer)
	// =========================================================================
	admin := app.Group("/api/v1/admin",
		middleware.JWTAuth(cfg.JWT),
		middleware.RequireRole("Administrator", "Developer"),
	)
	kategori.RegisterAdminRoutes(admin, kategoriHandler)
	tag.RegisterAdminRoutes(admin, tagHandler)
	moderation.RegisterAdminRoutes(admin, laporanHandler)
	moderation.RegisterReservedWordsAdminRoutes(admin, reservedWordsHandler)
	post.RegisterAdminRoutes(admin, postHandler) // curation: a_unggulan + a_pinned toggle
	blog.RegisterAdminRoutes(admin, blog.NewHandler(blogRepo)) // verify/suspend blogs
	blog.RegisterTemplateThemeAdminRoutes(admin, templateThemeHandler)
	audit.RegisterAdminRoutes(admin, audit.NewHandler(auditRepo))
	blog.RegisterStatsAdminRoutes(admin, blog.NewStatsHandler(db))
	moderation.RegisterKlaimAdminRoutes(admin, moderation.NewKlaimHandler(klaimRepo))
	moderation.RegisterBanAdminRoutes(admin, banHandler)
	search.RegisterAdminRoutes(admin, searchHandler) // POST /admin/search/reindex
	mail.RegisterAdminRoutes(admin, mailHandler)     // SMTP profile CRUD + test-send + outbox stats

	// Background scheduler — publish scheduled posts (status='scheduled') saat tgl_jadwal tiba.
	// Tick every 60s. Notif emit via NotifService (followers).
	go post.RunScheduler(context.Background(), db, notifService)

	// Trending score worker — recompute every 15 min so the "Trending" feed
	// reflects current activity instead of lifetime views. The search service
	// is passed as TrendingReindexer so Meilisearch's sortable score stays
	// in sync after each compute.
	go post.RunTrendingScheduler(context.Background(), db, searchSvc)

	// Email outbox worker — drains queue every 60s via the active SMTP profile.
	go mailWorker.Run(context.Background())

	// Weekly email digest worker (Phase BE) — 6h tick; per-user max 1x/7-days.
	go digestWorker.Run(context.Background())

	addr := ":" + cfg.App.Port
	log.Printf("✅ Listening on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("listen: %v", err)
	}
}
