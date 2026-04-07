package scheduler

import (
	"log"

	"monitoring-service/apps/blog_sync"
	"monitoring-service/apps/crawler"
	"monitoring-service/apps/site"
	"monitoring-service/apps/summary"

	"github.com/robfig/cron/v3"
)

const schedulerUserID = "00000000-0000-0000-0000-000000000001"

type Scheduler struct {
	cron        *cron.Cron
	siteSvc     site.Service
	crawlerSvc  crawler.Service
	blogSyncSvc blog_sync.Service
	summarySvc  summary.Service
}

func New(siteSvc site.Service, crawlerSvc crawler.Service, blogSyncSvc blog_sync.Service, summarySvc summary.Service) *Scheduler {
	c := cron.New(cron.WithSeconds())
	return &Scheduler{
		cron:        c,
		siteSvc:     siteSvc,
		crawlerSvc:  crawlerSvc,
		blogSyncSvc: blogSyncSvc,
		summarySvc:  summarySvc,
	}
}

func (s *Scheduler) Start() {
	// Health check every 5 minutes
	s.cron.AddFunc("0 */5 * * * *", func() {
		log.Println("⏰ Scheduler: running health checks...")
		if err := s.siteSvc.RunHealthChecks(); err != nil {
			log.Printf("❌ Health check scheduler error: %v", err)
		}
	})

	// Full crawl once a day at 02:00 AM
	s.cron.AddFunc("0 0 2 * * *", func() {
		log.Println("⏰ Scheduler: triggering full crawl...")
		if err := s.crawlerSvc.TriggerFull(schedulerUserID); err != nil {
			log.Printf("❌ Crawler scheduler error: %v", err)
		}
	})

	// Blog sync every 15 minutes
	s.cron.AddFunc("0 */15 * * * *", func() {
		log.Println("⏰ Scheduler: running blog sync...")
		if err := s.blogSyncSvc.SyncAll(); err != nil {
			log.Printf("❌ Blog sync scheduler error: %v", err)
		}
	})

	// Daily summary at 05:00 AM
	s.cron.AddFunc("0 0 5 * * *", func() {
		log.Println("⏰ Scheduler: computing daily summary...")
		if err := s.summarySvc.ComputeToday(); err != nil {
			log.Printf("❌ Daily summary scheduler error: %v", err)
		}
	})

	s.cron.Start()
	log.Println("✅ Scheduler started (health: 5min | crawl: 02:00 | blog: 15min | summary: 05:00)")
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
	log.Println("Scheduler stopped")
}
