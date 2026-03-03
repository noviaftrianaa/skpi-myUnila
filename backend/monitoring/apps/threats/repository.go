package threats

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	List(filter ThreatFilter) ([]*DetectedThreat, int, error)
	GetByID(id int) (*DetectedThreat, error)
	UpdateStatus(id int, req UpdateStatusRequest, updaterID string) error
	Stats() (*ThreatStats, error)
	Insert(t *DetectedThreat) (int, error)
	ExistsByURL(pageURL string) (bool, error)
	UpdateSnippetByURL(pageURL string, snippet string) error
	InsertAlert(a *AlertNotification) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) List(f ThreatFilter) ([]*DetectedThreat, int, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 || f.Limit > 100 {
		f.Limit = 20
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"t.soft_delete = 0"}
	args := []interface{}{}
	idx := 1

	if f.Status != "" {
		where = append(where, fmt.Sprintf("t.status = @p%d", idx))
		args = append(args, f.Status)
		idx++
	}
	if f.SiteID != "" {
		where = append(where, fmt.Sprintf("t.site_id = @p%d", idx))
		args = append(args, f.SiteID)
		idx++
	}
	if f.Category != "" {
		where = append(where, fmt.Sprintf("t.category = @p%d", idx))
		args = append(args, f.Category)
		idx++
	}
	if f.MinScore > 0 {
		where = append(where, fmt.Sprintf("t.threat_score >= @p%d", idx))
		args = append(args, f.MinScore)
		idx++
	}

	whereStr := strings.Join(where, " AND ")

	var total int
	r.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM monitoring.detected_threats t WHERE %s", whereStr), args...).Scan(&total)

	dataSQL := fmt.Sprintf(`
		SELECT t.id, CONVERT(nvarchar(36), t.site_id) AS site_id, t.crawl_page_id,
		       t.page_url, t.page_title,
		       t.matched_keywords, t.threat_score, t.category, t.snippet, t.status,
		       t.detected_at, t.confirmed_at, CONVERT(nvarchar(36), t.confirmed_by) AS confirmed_by,
		       t.resolved_at, CONVERT(nvarchar(36), t.resolved_by) AS resolved_by, t.notes,
		       t.create_date, CONVERT(nvarchar(36), t.id_creator) AS id_creator,
		       t.last_update, CONVERT(nvarchar(36), t.id_updater) AS id_updater, t.soft_delete
		FROM monitoring.detected_threats t
		WHERE %s
		ORDER BY t.detected_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereStr, idx, idx+1)
	args = append(args, offset, f.Limit)

	rows, err := r.db.Queryx(dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*DetectedThreat
	for rows.Next() {
		t := &DetectedThreat{}
		if err := rows.StructScan(t); err != nil {
			return nil, 0, err
		}
		// Enrich with site info
		var siteName, siteURL string
		r.db.QueryRow(`SELECT name, url FROM monitoring.sites WHERE id = @p1`, t.SiteID).Scan(&siteName, &siteURL)
		t.SiteName = &siteName
		t.SiteURL = &siteURL
		list = append(list, t)
	}
	return list, total, nil
}

func (r *repository) GetByID(id int) (*DetectedThreat, error) {
	t := &DetectedThreat{}
	err := r.db.QueryRowx(`
		SELECT id, CONVERT(nvarchar(36), site_id) AS site_id, crawl_page_id,
		       page_url, page_title,
		       matched_keywords, threat_score, category, snippet, status,
		       detected_at, confirmed_at, CONVERT(nvarchar(36), confirmed_by) AS confirmed_by,
		       resolved_at, CONVERT(nvarchar(36), resolved_by) AS resolved_by, notes,
		       create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		       last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.detected_threats
		WHERE id = @p1 AND soft_delete = 0`, id).StructScan(t)
	if err != nil {
		return nil, err
	}
	var siteName, siteURL string
	r.db.QueryRow(`SELECT name, url FROM monitoring.sites WHERE id = @p1`, t.SiteID).Scan(&siteName, &siteURL)
	t.SiteName = &siteName
	t.SiteURL = &siteURL
	return t, nil
}

func (r *repository) UpdateStatus(id int, req UpdateStatusRequest, updaterID string) error {
	now := time.Now()
	switch req.Status {
	case "confirmed":
		_, err := r.db.Exec(`
			UPDATE monitoring.detected_threats
			SET status = @p1, confirmed_at = @p2, confirmed_by = @p3,
			    notes = ISNULL(@p4, notes), last_update = @p5, id_updater = @p3
			WHERE id = @p6 AND soft_delete = 0`,
			req.Status, now, updaterID, req.Notes, now, id)
		return err
	case "resolved":
		_, err := r.db.Exec(`
			UPDATE monitoring.detected_threats
			SET status = @p1, resolved_at = @p2, resolved_by = @p3,
			    notes = ISNULL(@p4, notes), last_update = @p5, id_updater = @p3
			WHERE id = @p6 AND soft_delete = 0`,
			req.Status, now, updaterID, req.Notes, now, id)
		return err
	default:
		_, err := r.db.Exec(`
			UPDATE monitoring.detected_threats
			SET status = @p1, notes = ISNULL(@p2, notes),
			    last_update = @p3, id_updater = @p4
			WHERE id = @p5 AND soft_delete = 0`,
			req.Status, req.Notes, now, updaterID, id)
		return err
	}
}

func (r *repository) Stats() (*ThreatStats, error) {
	s := &ThreatStats{}
	err := r.db.QueryRow(`
		SELECT
		       COUNT(*),
		       ISNULL(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0),
		       ISNULL(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0),
		       ISNULL(SUM(CASE WHEN status = 'false_positive' THEN 1 ELSE 0 END), 0),
		       ISNULL(SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END), 0)
		FROM monitoring.detected_threats WHERE soft_delete = 0`).
		Scan(&s.Total, &s.Pending, &s.Confirmed, &s.FalsePositive, &s.Resolved)
	if err != nil {
		return nil, err
	}

	rows, _ := r.db.Queryx(`
		SELECT category, COUNT(*) AS cnt
		FROM monitoring.detected_threats WHERE soft_delete = 0
		GROUP BY category ORDER BY cnt DESC`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var cat string
			var cnt int
			if rows.Scan(&cat, &cnt) == nil {
				s.ByCategory = append(s.ByCategory, map[string]interface{}{"category": cat, "count": cnt})
			}
		}
	}

	rows2, _ := r.db.Queryx(`
		SELECT TOP 10 CONVERT(nvarchar(36), t.site_id) AS site_id, s.name AS site_name, COUNT(*) AS cnt
		FROM monitoring.detected_threats t
		LEFT JOIN monitoring.sites s ON t.site_id = s.id
		WHERE t.soft_delete = 0
		GROUP BY CONVERT(nvarchar(36), t.site_id), s.name
		ORDER BY cnt DESC`)
	if rows2 != nil {
		defer rows2.Close()
		for rows2.Next() {
			var siteID, siteName string
			var cnt int
			if rows2.Scan(&siteID, &siteName, &cnt) == nil {
				s.TopSites = append(s.TopSites, map[string]interface{}{
					"site_id": siteID, "site_name": siteName, "count": cnt,
				})
			}
		}
	}

	return s, nil
}

func (r *repository) Insert(t *DetectedThreat) (int, error) {
	var id int
	err := r.db.QueryRow(`
		INSERT INTO monitoring.detected_threats (
			site_id, crawl_page_id, page_url, page_title,
			matched_keywords, threat_score, category, snippet, status, detected_at,
			create_date, id_creator, last_update, soft_delete
		)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, 0)`,
		t.SiteID, t.CrawlPageID, t.PageURL, t.PageTitle,
		t.MatchedKeywords, t.ThreatScore, t.Category, t.Snippet, t.Status, t.DetectedAt,
		t.CreateDate, t.IDCreator, t.LastUpdate,
	).Scan(&id)
	return id, err
}

func (r *repository) ExistsByURL(pageURL string) (bool, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM monitoring.detected_threats
		WHERE page_url = @p1 AND status IN ('pending','confirmed') AND soft_delete = 0`, pageURL).Scan(&count)
	return count > 0, err
}

func (r *repository) UpdateSnippetByURL(pageURL string, snippet string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.detected_threats
		SET snippet = @p1, last_update = @p2
		WHERE page_url = @p3 AND status IN ('pending','confirmed') AND soft_delete = 0`,
		snippet, time.Now(), pageURL,
	)
	return err
}

func (r *repository) InsertAlert(a *AlertNotification) error {
	_, err := r.db.Exec(`
		INSERT INTO monitoring.alert_notifications
		  (threat_id, channel, recipient, subject, body, is_sent,
		   create_date, id_creator, last_update, soft_delete)
		VALUES (@p1, @p2, @p3, @p4, @p5, 1,
		        @p6, @p7, @p8, 0)`,
		a.ThreatID, a.Channel, a.Recipient, a.Subject, a.Body,
		a.CreateDate, a.IDCreator, a.LastUpdate,
	)
	return err
}
