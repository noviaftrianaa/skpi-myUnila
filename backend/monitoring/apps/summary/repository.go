package summary

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	ListLast(n int) ([]*DailySummary, error)
	GetByDate(date string) (*DailySummary, error)
	Upsert(s *DailySummary) error
	GetLastScanTime() (*string, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) ListLast(n int) ([]*DailySummary, error) {
	if n <= 0 || n > 90 {
		n = 30
	}
	var list []*DailySummary
	err := r.db.Select(&list, `
		SELECT TOP (@p1)
		    id, CONVERT(varchar(10), summary_date, 120) AS summary_date,
		    total_sites_monitored, sites_online, sites_offline, sites_compromised,
		    new_threats_count, resolved_threats_count, active_threats_count,
		    overall_status, top_threat_categories,
		    create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		    last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.daily_summary
		WHERE soft_delete = 0
		ORDER BY summary_date DESC`, n)
	return list, err
}

func (r *repository) GetByDate(date string) (*DailySummary, error) {
	s := &DailySummary{}
	err := r.db.QueryRowx(`
		SELECT id, CONVERT(varchar(10), summary_date, 120) AS summary_date,
		    total_sites_monitored, sites_online, sites_offline, sites_compromised,
		    new_threats_count, resolved_threats_count, active_threats_count,
		    overall_status, top_threat_categories,
		    create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		    last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.daily_summary
		WHERE CONVERT(date, summary_date) = CONVERT(date, @p1) AND soft_delete = 0`, date).StructScan(s)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *repository) Upsert(s *DailySummary) error {
	now := time.Now()
	// Try update first
	res, err := r.db.Exec(`
		UPDATE monitoring.daily_summary
		SET total_sites_monitored  = @p1,
		    sites_online           = @p2,
		    sites_offline          = @p3,
		    sites_compromised      = @p4,
		    new_threats_count      = @p5,
		    resolved_threats_count = @p6,
		    active_threats_count   = @p7,
		    overall_status         = @p8,
		    top_threat_categories  = @p9,
		    last_update            = @p10
		WHERE CONVERT(date, summary_date) = CONVERT(date, @p11) AND soft_delete = 0`,
		s.TotalSitesMonitored, s.SitesOnline, s.SitesOffline, s.SitesCompromised,
		s.NewThreatsCount, s.ResolvedThreatsCount, s.ActiveThreatsCount,
		s.OverallStatus, s.TopThreatCategories, now, s.SummaryDate,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n > 0 {
		return nil
	}
	// Insert
	_, err = r.db.Exec(`
		INSERT INTO monitoring.daily_summary
		  (summary_date, total_sites_monitored, sites_online, sites_offline,
		   sites_compromised, new_threats_count, resolved_threats_count,
		   active_threats_count, overall_status, top_threat_categories,
		   create_date, id_creator, last_update, soft_delete)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
		        @p11, @p12, @p13, 0)`,
		s.SummaryDate, s.TotalSitesMonitored, s.SitesOnline, s.SitesOffline,
		s.SitesCompromised, s.NewThreatsCount, s.ResolvedThreatsCount,
		s.ActiveThreatsCount, s.OverallStatus, s.TopThreatCategories,
		now, s.IDCreator, now,
	)
	return err
}

func (r *repository) GetLastScanTime() (*string, error) {
	var t string
	err := r.db.QueryRow(`
		SELECT TOP 1 CONVERT(varchar(20), checked_at, 120)
		FROM monitoring.site_checks
		ORDER BY checked_at DESC`).Scan(&t)
	if err != nil {
		return nil, err
	}
	return &t, nil
}
