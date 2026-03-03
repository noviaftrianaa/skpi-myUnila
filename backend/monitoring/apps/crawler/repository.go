package crawler

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	// CrawlJob
	InsertJob(job *CrawlJob) (int, error)
	GetJobByID(id int) (*CrawlJob, error)
	UpdateJobStatus(id int, status string, errMsg *string) error
	UpdateJobStarted(id int) error
	UpdateJobFinished(id int, status string, errMsg *string) error
	ListJobs(f JobFilter) ([]*CrawlJob, int, error)
	SoftDeleteJob(id int) error

	// CrawlSession
	InsertSession(sess *CrawlSession) (int, error)
	UpdateSessionStatus(id int, status string, errMsg *string) error
	UpdateSessionStarted(id int) error
	UpdateSessionFinished(id, totalPages, threatCount int, status string, errMsg *string) error
	ListSessionsByJob(jobID int) ([]*CrawlSession, error)

	// CrawlPage
	InsertPage(page *CrawlPage) (int, error)
	ListPagesBySession(sessionID int) ([]*CrawlPage, error)

	// Stats
	Stats() (*CrawlStats, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// Shared column lists with CONVERT for uniqueidentifier columns
const jobColumns = `id, CONVERT(nvarchar(36), site_id) AS site_id, job_type, status,
	CONVERT(nvarchar(36), triggered_by) AS triggered_by,
	started_at, finished_at, error_msg, notes,
	create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
	last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete`

const sessionColumns = `id, job_id, CONVERT(nvarchar(36), site_id) AS site_id, status,
	total_pages, threat_count, started_at, finished_at, error_msg,
	create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
	last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete`

const pageColumns = `id, session_id, CONVERT(nvarchar(36), site_id) AS site_id,
	page_url, page_title, http_code, content_hash, has_threat, threat_score, crawled_at,
	create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
	last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete`

// ─── CrawlJob ────────────────────────────────────────────────────────────────

func (r *repository) InsertJob(job *CrawlJob) (int, error) {
	query := `
		INSERT INTO monitoring.crawl_jobs
		  (site_id, job_type, status, triggered_by, notes, create_date, id_creator, last_update, soft_delete)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, 0)`
	var id int
	err := r.db.QueryRow(query,
		job.SiteID, job.JobType, job.Status, job.TriggeredBy,
		job.Notes, job.CreateDate, job.IDCreator, job.LastUpdate,
	).Scan(&id)
	return id, err
}

func (r *repository) GetJobByID(id int) (*CrawlJob, error) {
	var j CrawlJob
	err := r.db.Get(&j,
		`SELECT `+jobColumns+` FROM monitoring.crawl_jobs WHERE id = @p1 AND soft_delete = 0`, id)
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *repository) UpdateJobStatus(id int, status string, errMsg *string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_jobs SET status = @p1, error_msg = @p2, last_update = @p3
		WHERE id = @p4`, status, errMsg, time.Now(), id)
	return err
}

func (r *repository) UpdateJobStarted(id int) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_jobs SET status = 'running', started_at = @p1, last_update = @p2
		WHERE id = @p3`, now, now, id)
	return err
}

func (r *repository) UpdateJobFinished(id int, status string, errMsg *string) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_jobs
		SET status = @p1, finished_at = @p2, error_msg = @p3, last_update = @p4
		WHERE id = @p5`, status, now, errMsg, now, id)
	return err
}

func (r *repository) ListJobs(f JobFilter) ([]*CrawlJob, int, error) {
	args := []interface{}{}
	where := []string{"soft_delete = 0"}
	n := 1

	if f.Status != "" {
		where = append(where, fmt.Sprintf("status = @p%d", n))
		args = append(args, f.Status)
		n++
	}
	if f.SiteID != "" {
		where = append(where, fmt.Sprintf("site_id = @p%d", n))
		args = append(args, f.SiteID)
		n++
	}

	whereClause := strings.Join(where, " AND ")

	var total int
	if err := r.db.QueryRow(
		`SELECT COUNT(*) FROM monitoring.crawl_jobs WHERE `+whereClause,
		args...,
	).Scan(&total); err != nil {
		return nil, 0, err
	}

	page := f.Page
	limit := f.Limit
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}
	offset := (page - 1) * limit

	pageArgs := append(args, limit, offset)
	rows, err := r.db.Queryx(
		`SELECT `+jobColumns+` FROM monitoring.crawl_jobs WHERE `+whereClause+
			fmt.Sprintf(` ORDER BY id DESC OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, n+1, n),
		pageArgs...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*CrawlJob
	for rows.Next() {
		var j CrawlJob
		if err := rows.StructScan(&j); err != nil {
			return nil, 0, err
		}
		list = append(list, &j)
	}
	return list, total, nil
}

// ─── CrawlSession ────────────────────────────────────────────────────────────

func (r *repository) InsertSession(sess *CrawlSession) (int, error) {
	query := `
		INSERT INTO monitoring.crawl_sessions
		  (job_id, site_id, status, total_pages, threat_count, create_date, id_creator, last_update, soft_delete)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, 0, 0, @p4, @p5, @p6, 0)`
	var id int
	err := r.db.QueryRow(query,
		sess.JobID, sess.SiteID, sess.Status,
		sess.CreateDate, sess.IDCreator, sess.LastUpdate,
	).Scan(&id)
	return id, err
}

func (r *repository) UpdateSessionStatus(id int, status string, errMsg *string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_sessions SET status = @p1, error_msg = @p2, last_update = @p3
		WHERE id = @p4`, status, errMsg, time.Now(), id)
	return err
}

func (r *repository) UpdateSessionStarted(id int) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_sessions SET status = 'running', started_at = @p1, last_update = @p2
		WHERE id = @p3`, now, now, id)
	return err
}

func (r *repository) UpdateSessionFinished(id, totalPages, threatCount int, status string, errMsg *string) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_sessions
		SET status = @p1, finished_at = @p2, total_pages = @p3, threat_count = @p4,
		    error_msg = @p5, last_update = @p6
		WHERE id = @p7`, status, now, totalPages, threatCount, errMsg, now, id)
	return err
}

func (r *repository) ListSessionsByJob(jobID int) ([]*CrawlSession, error) {
	var list []*CrawlSession
	err := r.db.Select(&list,
		`SELECT `+sessionColumns+` FROM monitoring.crawl_sessions
		WHERE job_id = @p1 AND soft_delete = 0
		ORDER BY id DESC`, jobID)
	return list, err
}

// ─── CrawlPage ───────────────────────────────────────────────────────────────

func (r *repository) InsertPage(page *CrawlPage) (int, error) {
	query := `
		INSERT INTO monitoring.crawl_pages
		  (session_id, site_id, page_url, page_title, http_code, content_hash,
		   has_threat, threat_score, crawled_at, create_date, id_creator, last_update, soft_delete)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, 0)`
	var id int
	err := r.db.QueryRow(query,
		page.SessionID, page.SiteID, page.PageURL, page.PageTitle,
		page.HTTPCode, page.ContentHash, page.HasThreat, page.ThreatScore,
		page.CrawledAt, page.CreateDate, page.IDCreator, page.LastUpdate,
	).Scan(&id)
	return id, err
}

func (r *repository) ListPagesBySession(sessionID int) ([]*CrawlPage, error) {
	var list []*CrawlPage
	err := r.db.Select(&list,
		`SELECT `+pageColumns+` FROM monitoring.crawl_pages
		WHERE session_id = @p1 AND soft_delete = 0
		ORDER BY id DESC`, sessionID)
	return list, err
}

func (r *repository) SoftDeleteJob(id int) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE monitoring.crawl_jobs SET soft_delete = 1, last_update = @p1 WHERE id = @p2`, now, id)
	if err != nil {
		return err
	}
	// Also soft-delete related sessions and pages
	r.db.Exec(`
		UPDATE monitoring.crawl_sessions SET soft_delete = 1, last_update = @p1 WHERE job_id = @p2`, now, id)
	r.db.Exec(`
		UPDATE monitoring.crawl_pages SET soft_delete = 1, last_update = @p1
		WHERE session_id IN (SELECT id FROM monitoring.crawl_sessions WHERE job_id = @p2)`, now, id)
	return nil
}

// ─── Stats ───────────────────────────────────────────────────────────────────

func (r *repository) Stats() (*CrawlStats, error) {
	var s CrawlStats
	err := r.db.QueryRow(`
		SELECT
		  (SELECT COUNT(*) FROM monitoring.crawl_jobs WHERE soft_delete = 0)                        AS total_jobs,
		  (SELECT COUNT(*) FROM monitoring.crawl_jobs WHERE status = 'running' AND soft_delete = 0) AS running_jobs,
		  (SELECT COUNT(*) FROM monitoring.crawl_sessions WHERE soft_delete = 0)                    AS total_sessions,
		  (SELECT COUNT(*) FROM monitoring.crawl_pages WHERE soft_delete = 0)                       AS total_pages,
		  (SELECT COUNT(*) FROM monitoring.crawl_pages WHERE has_threat = 1 AND soft_delete = 0)    AS total_threats
	`).Scan(&s.TotalJobs, &s.RunningJobs, &s.TotalSessions, &s.TotalPages, &s.TotalThreats)
	return &s, err
}
