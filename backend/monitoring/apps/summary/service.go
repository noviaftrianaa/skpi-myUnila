package summary

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

const sysUserID = "00000000-0000-0000-0000-000000000001"

type Service interface {
	GetStatus() (*PublicStatus, error)
	GetStats() (*PublicStats, error)
	ListLast30Days() ([]*DailySummary, error)
	ComputeToday() error
}

type service struct {
	repo Repository
	db   *sqlx.DB
}

func NewService(repo Repository, db *sqlx.DB) Service {
	return &service{repo: repo, db: db}
}

func (s *service) ListLast30Days() ([]*DailySummary, error) {
	return s.repo.ListLast(30)
}

func (s *service) GetStatus() (*PublicStatus, error) {
	now := time.Now()
	st := &PublicStatus{UpdatedAt: now}

	// Sites counts
	s.db.QueryRow(`
		SELECT
		    COUNT(*),
		    ISNULL(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0),
		    ISNULL(SUM(CASE WHEN status = 'inactive' OR status = 'maintenance' THEN 1 ELSE 0 END), 0)
		FROM monitoring.sites WHERE soft_delete = 0 AND is_active = 1`).
		Scan(&st.SitesMonitored, &st.SitesOnline, &st.SitesOffline)

	// Active threats
	s.db.QueryRow(`
		SELECT ISNULL(COUNT(*), 0) FROM monitoring.detected_threats
		WHERE status IN ('pending','confirmed') AND soft_delete = 0`).Scan(&st.ActiveThreats)

	// Online/offline from last checks
	s.db.QueryRow(`
		SELECT
		    ISNULL(SUM(CASE WHEN c.is_up = 1 THEN 1 ELSE 0 END), 0),
		    ISNULL(SUM(CASE WHEN c.is_up = 0 THEN 1 ELSE 0 END), 0)
		FROM (
		    SELECT site_id, is_up,
		           ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY checked_at DESC) AS rn
		    FROM monitoring.site_checks WHERE soft_delete = 0
		) c WHERE c.rn = 1`).Scan(&st.SitesOnline, &st.SitesOffline)

	// Last scan time
	lastScan, _ := s.repo.GetLastScanTime()
	st.LastScan = lastScan

	// Overall status
	switch {
	case st.ActiveThreats == 0:
		st.Status = "aman"
	case st.ActiveThreats <= 5:
		st.Status = "waspada"
	default:
		st.Status = "bahaya"
	}

	return st, nil
}

func (s *service) GetStats() (*PublicStats, error) {
	st := &PublicStats{}

	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.sites WHERE soft_delete=0 AND is_active=1`).Scan(&st.TotalSites)
	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.sites WHERE soft_delete=0 AND is_active=1 AND status='active'`).Scan(&st.ActiveSites)
	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.threat_keywords WHERE soft_delete=0 AND is_active=1`).Scan(&st.TotalKeywords)
	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats WHERE soft_delete=0`).Scan(&st.TotalThreats)
	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats WHERE soft_delete=0 AND status IN ('pending','confirmed')`).Scan(&st.ActiveThreats)
	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats WHERE soft_delete=0 AND status='resolved'`).Scan(&st.ResolvedThreats)

	rows, _ := s.db.Queryx(`
		SELECT category, COUNT(*) AS cnt
		FROM monitoring.detected_threats WHERE soft_delete=0
		GROUP BY category ORDER BY cnt DESC`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var cat string
			var cnt int
			if rows.Scan(&cat, &cnt) == nil {
				st.ThreatsByCategory = append(st.ThreatsByCategory, map[string]interface{}{"category": cat, "count": cnt})
			}
		}
	}

	return st, nil
}

func (s *service) ComputeToday() error {
	today := time.Now().Format("2006-01-02")
	sum := &DailySummary{
		SummaryDate: today,
		IDCreator:   sysUserID,
	}

	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.sites WHERE soft_delete=0 AND is_active=1`).Scan(&sum.TotalSitesMonitored)

	s.db.QueryRow(`
		SELECT
		    ISNULL(SUM(CASE WHEN c.is_up=1 THEN 1 ELSE 0 END),0),
		    ISNULL(SUM(CASE WHEN c.is_up=0 THEN 1 ELSE 0 END),0)
		FROM (
		    SELECT site_id, is_up,
		           ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY checked_at DESC) AS rn
		    FROM monitoring.site_checks WHERE soft_delete=0
		) c WHERE c.rn=1`).Scan(&sum.SitesOnline, &sum.SitesOffline)

	s.db.QueryRow(`SELECT ISNULL(COUNT(*),0) FROM monitoring.sites WHERE soft_delete=0 AND status='compromised'`).Scan(&sum.SitesCompromised)

	s.db.QueryRow(`
		SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats
		WHERE soft_delete=0 AND CONVERT(date,detected_at) = CONVERT(date,@p1)`, today).Scan(&sum.NewThreatsCount)

	s.db.QueryRow(`
		SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats
		WHERE soft_delete=0 AND status='resolved'
		AND CONVERT(date,resolved_at) = CONVERT(date,@p1)`, today).Scan(&sum.ResolvedThreatsCount)

	s.db.QueryRow(`
		SELECT ISNULL(COUNT(*),0) FROM monitoring.detected_threats
		WHERE soft_delete=0 AND status IN ('pending','confirmed')`).Scan(&sum.ActiveThreatsCount)

	switch {
	case sum.ActiveThreatsCount == 0:
		sum.OverallStatus = "aman"
	case sum.ActiveThreatsCount <= 5:
		sum.OverallStatus = "waspada"
	default:
		sum.OverallStatus = "bahaya"
	}

	// Build top_threat_categories JSON
	rows, _ := s.db.Queryx(`
		SELECT TOP 5 category, COUNT(*) AS cnt
		FROM monitoring.detected_threats WHERE soft_delete=0
		GROUP BY category ORDER BY cnt DESC`)
	if rows != nil {
		defer rows.Close()
		parts := []string{}
		for rows.Next() {
			var cat string
			var cnt int
			if rows.Scan(&cat, &cnt) == nil {
				parts = append(parts, fmt.Sprintf(`"%s":%d`, cat, cnt))
			}
		}
		if len(parts) > 0 {
			j := "{" + strings.Join(parts, ",") + "}"
			sum.TopThreatCategories = &j
		}
	}

	if err := s.repo.Upsert(sum); err != nil {
		log.Printf("⚠️  Summary: failed to upsert daily summary: %v", err)
		return err
	}
	log.Printf("✅ Summary: daily summary computed for %s (status=%s, active=%d)",
		today, sum.OverallStatus, sum.ActiveThreatsCount)
	return nil
}
