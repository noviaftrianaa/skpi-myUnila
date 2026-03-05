package site

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	List(filter SiteListFilter) ([]*Site, int, error)
	GetByID(id string) (*Site, error)
	Create(site *Site) error
	Update(id string, req UpdateSiteRequest, updaterID string) error
	SoftDelete(id string, updaterID string) error
	HealthHistory(siteID string, days int) ([]*SiteCheck, error)
	InsertCheck(check *SiteCheck) error
	GetLatestCheck(siteID string) (*SiteCheckSummary, error)
	ListActive() ([]*Site, error)
	ListAllSites() ([]*Site, error)
	UpdateStatus(siteID, status string, updaterID string) error
	Stats() (*SiteStats, error)
	ListPublic() ([]*PublicSite, error)
	CountConsecutiveDown(siteID string) (int, error)
	ListSMSUnits() ([]*SMSUnit, error)
	LookupNamaUnit(idSMS string) string
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) List(f SiteListFilter) ([]*Site, int, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 {
		f.Limit = 20
	} else if f.Limit > 100 {
		f.Limit = 100
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"s.soft_delete = 0"}
	args := []interface{}{}
	idx := 1

	if f.Status != "" {
		where = append(where, fmt.Sprintf("s.status = @p%d", idx))
		args = append(args, f.Status)
		idx++
	}
	if f.Platform != "" {
		where = append(where, fmt.Sprintf("s.platform = @p%d", idx))
		args = append(args, f.Platform)
		idx++
	}
	if f.FakultasID != "" {
		where = append(where, fmt.Sprintf("s.fakultas_id = @p%d", idx))
		args = append(args, f.FakultasID)
		idx++
	}
	if f.Search != "" {
		where = append(where, fmt.Sprintf("(s.name LIKE @p%d OR s.url LIKE @p%d)", idx, idx+1))
		args = append(args, "%"+f.Search+"%", "%"+f.Search+"%")
		idx += 2
	}

	whereClause := strings.Join(where, " AND ")

	// Count query
	countSQL := fmt.Sprintf(`SELECT COUNT(*) FROM monitoring.sites s WHERE %s`, whereClause)
	var total int
	if err := r.db.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Data query with pagination
	dataSQL := fmt.Sprintf(`
		SELECT CONVERT(nvarchar(36), s.id) AS id, s.url, s.name, s.platform, s.platform_version,
		       s.blogger_blog_id, s.sync_interval_min, s.last_synced_at,
		       s.status, s.is_active, s.fakultas_id, s.unit_id,
		       CONVERT(nvarchar(36), s.id_sms) AS id_sms,
		       s.admin_name, s.admin_email, s.admin_phone, s.admin_whatsapp, s.notes,
		       s.is_behind_kong, s.is_sso_enabled,
		       s.create_date, CONVERT(nvarchar(36), s.id_creator) AS id_creator,
		       s.last_update, CONVERT(nvarchar(36), s.id_updater) AS id_updater, s.soft_delete
		FROM monitoring.sites s
		WHERE %s
		ORDER BY s.name ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereClause, idx, idx+1)
	args = append(args, offset, f.Limit)

	rows, err := r.db.Queryx(dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sites []*Site
	for rows.Next() {
		s := &Site{}
		if err := rows.StructScan(s); err != nil {
			return nil, 0, err
		}
		// Get latest check
		if chk, err := r.GetLatestCheck(s.ID); err == nil {
			s.LastCheck = chk
		}
		// Enrich with unit name from pdrd.sms
		if s.IDSMS != nil && *s.IDSMS != "" {
			s.NamaUnit = strPtr(r.LookupNamaUnit(*s.IDSMS))
		}
		sites = append(sites, s)
	}
	return sites, total, nil
}

func (r *repository) GetByID(id string) (*Site, error) {
	s := &Site{}
	err := r.db.QueryRowx(`
		SELECT CONVERT(nvarchar(36), id) AS id, url, name, platform, platform_version,
		       blogger_blog_id, blogger_api_key, sync_interval_min, last_synced_at,
		       status, is_active, fakultas_id, unit_id,
		       CONVERT(nvarchar(36), id_sms) AS id_sms,
		       admin_name, admin_email, admin_phone, admin_whatsapp, notes,
		       is_behind_kong, is_sso_enabled,
		       create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		       last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.sites
		WHERE id = @p1 AND soft_delete = 0`, id).StructScan(s)
	if err != nil {
		return nil, err
	}
	if chk, err := r.GetLatestCheck(id); err == nil {
		s.LastCheck = chk
	}
	if s.IDSMS != nil && *s.IDSMS != "" {
		s.NamaUnit = strPtr(r.LookupNamaUnit(*s.IDSMS))
	}
	return s, nil
}

func (r *repository) Create(s *Site) error {
	_, err := r.db.Exec(`
		INSERT INTO monitoring.sites (
			id, url, name, platform, platform_version,
			blogger_blog_id, blogger_api_key, sync_interval_min,
			status, is_active, fakultas_id, unit_id, id_sms,
			admin_name, admin_email, admin_phone, admin_whatsapp, notes,
			is_behind_kong, is_sso_enabled,
			create_date, id_creator, last_update, soft_delete
		) VALUES (
			@p1, @p2, @p3, @p4, @p5,
			@p6, @p7, @p8,
			@p9, @p10, @p11, @p12, TRY_CONVERT(UNIQUEIDENTIFIER, @p13),
			@p14, @p15, @p16, @p17, @p18,
			@p19, @p20,
			@p21, @p22, @p23, 0
		)`,
		s.ID, s.URL, s.Name, s.Platform, s.PlatformVersion,
		s.BloggerBlogID, s.BloggerAPIKey, s.SyncIntervalMin,
		s.Status, s.IsActive, s.FakultasID, s.UnitID, s.IDSMS,
		s.AdminName, s.AdminEmail, s.AdminPhone, s.AdminWhatsApp, s.Notes,
		s.IsBehindKong, s.IsSSOEnabled,
		s.CreateDate, s.IDCreator, s.LastUpdate,
	)
	return err
}

func (r *repository) Update(id string, req UpdateSiteRequest, updaterID string) error {
	sets := []string{"last_update = @p1", "id_updater = @p2"}
	args := []interface{}{time.Now(), updaterID}
	idx := 3

	if req.URL != nil {
		sets = append(sets, fmt.Sprintf("url = @p%d", idx))
		args = append(args, *req.URL)
		idx++
	}
	if req.Name != nil {
		sets = append(sets, fmt.Sprintf("name = @p%d", idx))
		args = append(args, *req.Name)
		idx++
	}
	if req.Platform != nil {
		sets = append(sets, fmt.Sprintf("platform = @p%d", idx))
		args = append(args, *req.Platform)
		idx++
	}
	if req.PlatformVersion != nil {
		sets = append(sets, fmt.Sprintf("platform_version = @p%d", idx))
		args = append(args, *req.PlatformVersion)
		idx++
	}
	if req.BloggerBlogID != nil {
		sets = append(sets, fmt.Sprintf("blogger_blog_id = @p%d", idx))
		args = append(args, *req.BloggerBlogID)
		idx++
	}
	if req.BloggerAPIKey != nil {
		sets = append(sets, fmt.Sprintf("blogger_api_key = @p%d", idx))
		args = append(args, *req.BloggerAPIKey)
		idx++
	}
	if req.SyncIntervalMin != nil {
		sets = append(sets, fmt.Sprintf("sync_interval_min = @p%d", idx))
		args = append(args, *req.SyncIntervalMin)
		idx++
	}
	if req.Status != nil {
		sets = append(sets, fmt.Sprintf("status = @p%d", idx))
		args = append(args, *req.Status)
		idx++
	}
	if req.IsActive != nil {
		sets = append(sets, fmt.Sprintf("is_active = @p%d", idx))
		args = append(args, *req.IsActive)
		idx++
	}
	if req.FakultasID != nil {
		sets = append(sets, fmt.Sprintf("fakultas_id = @p%d", idx))
		args = append(args, *req.FakultasID)
		idx++
	}
	if req.UnitID != nil {
		sets = append(sets, fmt.Sprintf("unit_id = @p%d", idx))
		args = append(args, *req.UnitID)
		idx++
	}
	if req.AdminName != nil {
		sets = append(sets, fmt.Sprintf("admin_name = @p%d", idx))
		args = append(args, *req.AdminName)
		idx++
	}
	if req.AdminEmail != nil {
		sets = append(sets, fmt.Sprintf("admin_email = @p%d", idx))
		args = append(args, *req.AdminEmail)
		idx++
	}
	if req.AdminPhone != nil {
		sets = append(sets, fmt.Sprintf("admin_phone = @p%d", idx))
		args = append(args, *req.AdminPhone)
		idx++
	}
	if req.AdminWhatsApp != nil {
		sets = append(sets, fmt.Sprintf("admin_whatsapp = @p%d", idx))
		args = append(args, *req.AdminWhatsApp)
		idx++
	}
	if req.IDSMS != nil {
		sets = append(sets, fmt.Sprintf("id_sms = TRY_CONVERT(UNIQUEIDENTIFIER, @p%d)", idx))
		args = append(args, *req.IDSMS)
		idx++
	}
	if req.Notes != nil {
		sets = append(sets, fmt.Sprintf("notes = @p%d", idx))
		args = append(args, *req.Notes)
		idx++
	}
	if req.IsBehindKong != nil {
		sets = append(sets, fmt.Sprintf("is_behind_kong = @p%d", idx))
		args = append(args, *req.IsBehindKong)
		idx++
	}
	if req.IsSSOEnabled != nil {
		sets = append(sets, fmt.Sprintf("is_sso_enabled = @p%d", idx))
		args = append(args, *req.IsSSOEnabled)
		idx++
	}

	args = append(args, id)
	sql := fmt.Sprintf("UPDATE monitoring.sites SET %s WHERE id = @p%d AND soft_delete = 0",
		strings.Join(sets, ", "), idx)
	_, err := r.db.Exec(sql, args...)
	return err
}

func (r *repository) SoftDelete(id string, updaterID string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.sites
		SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id = @p3 AND soft_delete = 0`,
		time.Now(), updaterID, id)
	return err
}

func (r *repository) HealthHistory(siteID string, days int) ([]*SiteCheck, error) {
	rows, err := r.db.Queryx(`
		SELECT id, site_id, checked_at, http_code, response_time_ms,
		       is_up, ssl_valid, ssl_expiry_days, error_msg,
		       create_date, id_creator, last_update, id_updater, soft_delete
		FROM monitoring.site_checks
		WHERE site_id = @p1
		  AND checked_at >= DATEADD(day, -@p2, GETDATE())
		  AND soft_delete = 0
		ORDER BY checked_at DESC`,
		siteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*SiteCheck
	for rows.Next() {
		c := &SiteCheck{}
		if err := rows.StructScan(c); err != nil {
			return nil, err
		}
		checks = append(checks, c)
	}
	return checks, nil
}

func (r *repository) InsertCheck(c *SiteCheck) error {
	_, err := r.db.Exec(`
		INSERT INTO monitoring.site_checks (
			site_id, checked_at, http_code, response_time_ms,
			is_up, ssl_valid, ssl_expiry_days, error_msg,
			create_date, id_creator, last_update, soft_delete
		) VALUES (
			@p1, @p2, @p3, @p4,
			@p5, @p6, @p7, @p8,
			@p9, @p10, @p11, 0
		)`,
		c.SiteID, c.CheckedAt, c.HTTPCode, c.ResponseTimeMs,
		c.IsUp, c.SSLValid, c.SSLExpiryDays, c.ErrorMsg,
		c.CreateDate, c.IDCreator, c.LastUpdate,
	)
	return err
}

func (r *repository) GetLatestCheck(siteID string) (*SiteCheckSummary, error) {
	c := &SiteCheckSummary{}
	err := r.db.QueryRow(`
		SELECT TOP 1 checked_at, http_code, response_time_ms, is_up, ssl_expiry_days
		FROM monitoring.site_checks
		WHERE site_id = @p1 AND soft_delete = 0
		ORDER BY checked_at DESC`, siteID).
		Scan(&c.CheckedAt, &c.HTTPCode, &c.ResponseTimeMs, &c.IsUp, &c.SSLExpiryDays)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *repository) ListActive() ([]*Site, error) {
	rows, err := r.db.Queryx(`
		SELECT CONVERT(nvarchar(36), id) AS id, url, name, platform, platform_version,
		       blogger_blog_id, blogger_api_key, sync_interval_min, last_synced_at,
		       status, is_active, fakultas_id, unit_id,
		       CONVERT(nvarchar(36), id_sms) AS id_sms,
		       admin_name, admin_email, admin_phone, admin_whatsapp, notes,
		       is_behind_kong, is_sso_enabled,
		       create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		       last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.sites
		WHERE is_active = 1 AND soft_delete = 0
		ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []*Site
	for rows.Next() {
		s := &Site{}
		if err := rows.StructScan(s); err != nil {
			return nil, err
		}
		sites = append(sites, s)
	}
	return sites, nil
}

func (r *repository) ListAllSites() ([]*Site, error) {
	rows, err := r.db.Queryx(`
		SELECT CONVERT(nvarchar(36), id) AS id, url, name, platform, platform_version,
		       blogger_blog_id, blogger_api_key, sync_interval_min, last_synced_at,
		       status, is_active, fakultas_id, unit_id,
		       CONVERT(nvarchar(36), id_sms) AS id_sms,
		       admin_name, admin_email, admin_phone, admin_whatsapp, notes,
		       is_behind_kong, is_sso_enabled,
		       create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
		       last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete
		FROM monitoring.sites
		WHERE soft_delete = 0
		ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []*Site
	for rows.Next() {
		s := &Site{}
		if err := rows.StructScan(s); err != nil {
			return nil, err
		}
		sites = append(sites, s)
	}
	return sites, nil
}

func (r *repository) UpdateStatus(siteID, status, updaterID string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.sites
		SET status = @p1, last_update = @p2, id_updater = @p3
		WHERE id = @p4 AND soft_delete = 0`,
		status, time.Now(), updaterID, siteID)
	return err
}

func (r *repository) CountConsecutiveDown(siteID string) (int, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM (
			SELECT TOP 3 is_up
			FROM monitoring.site_checks
			WHERE site_id = @p1 AND soft_delete = 0
			ORDER BY checked_at DESC
		) last3
		WHERE is_up = 0`, siteID).Scan(&count)
	return count, err
}

func (r *repository) Stats() (*SiteStats, error) {
	s := &SiteStats{}

	// Aggregate counts
	err := r.db.QueryRow(`
		SELECT
			COUNT(*) AS total,
			ISNULL(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) AS active,
			ISNULL(SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END), 0) AS inactive,
			ISNULL(SUM(CASE WHEN status = 'compromised' THEN 1 ELSE 0 END), 0) AS compromised,
			ISNULL(SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END), 0) AS maintenance
		FROM monitoring.sites
		WHERE soft_delete = 0`).
		Scan(&s.Total, &s.Active, &s.Inactive, &s.Compromised, &s.Maintenance)
	if err != nil {
		return nil, err
	}

	// Online now: sites where latest check is_up = 1
	err = r.db.QueryRow(`
		SELECT COUNT(DISTINCT sc.site_id) FROM monitoring.site_checks sc
		INNER JOIN (
			SELECT site_id, MAX(checked_at) AS latest
			FROM monitoring.site_checks WHERE soft_delete = 0
			GROUP BY site_id
		) latest ON sc.site_id = latest.site_id AND sc.checked_at = latest.latest
		WHERE sc.is_up = 1`).Scan(&s.OnlineNow)
	if err != nil {
		s.OnlineNow = 0
	}
	s.OfflineNow = s.Total - s.OnlineNow

	// By platform
	rows, _ := r.db.Queryx(`
		SELECT platform, COUNT(*) AS cnt
		FROM monitoring.sites WHERE soft_delete = 0
		GROUP BY platform ORDER BY cnt DESC`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var platform string
			var cnt int
			if err := rows.Scan(&platform, &cnt); err == nil {
				s.ByPlatform = append(s.ByPlatform, map[string]interface{}{
					"platform": platform, "count": cnt,
				})
			}
		}
	}

	// By fakultas
	rows2, _ := r.db.Queryx(`
		SELECT ISNULL(fakultas_id, 'institutional') AS fakultas_id, COUNT(*) AS cnt
		FROM monitoring.sites WHERE soft_delete = 0
		GROUP BY fakultas_id ORDER BY cnt DESC`)
	if rows2 != nil {
		defer rows2.Close()
		for rows2.Next() {
			var fak string
			var cnt int
			if err := rows2.Scan(&fak, &cnt); err == nil {
				s.ByFakultas = append(s.ByFakultas, map[string]interface{}{
					"fakultas_id": fak, "count": cnt,
				})
			}
		}
	}

	return s, nil
}

func (r *repository) ListPublic() ([]*PublicSite, error) {
	rows, err := r.db.Queryx(`
		SELECT CONVERT(nvarchar(36), id) AS id, url, name, status, fakultas_id
		FROM monitoring.sites
		WHERE soft_delete = 0 AND is_active = 1
		ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []*PublicSite
	for rows.Next() {
		s := &PublicSite{}
		if err := rows.StructScan(s); err != nil {
			return nil, err
		}
		sites = append(sites, s)
	}
	return sites, nil
}

// LookupNamaUnit returns the unit name from pdrd.sms for a given id_sms
func (r *repository) LookupNamaUnit(idSMS string) string {
	var name string
	err := r.db.QueryRow(`
		SELECT nm_lemb FROM pdrd.sms
		WHERE CONVERT(nvarchar(36), id_sms) = @p1 AND soft_delete = 0`, idSMS).Scan(&name)
	if err != nil {
		return ""
	}
	return name
}

// ListSMSUnits returns program studi units from pdrd.sms for Unila
func (r *repository) ListSMSUnits() ([]*SMSUnit, error) {
	rows, err := r.db.Queryx(`
		SELECT CONVERT(nvarchar(36), sms.id_sms) AS id_sms,
		       sms.nm_lemb, sms.singkatan, sms.website, sms.email,
		       didik.nm_jenj_didik AS jenjang
		FROM pdrd.sms AS sms
		INNER JOIN ref.jenjang_pendidikan AS didik
		    ON didik.id_jenj_didik = sms.id_jenj_didik
		    AND didik.expired_date IS NULL
		WHERE sms.soft_delete = 0
		  AND sms.stat_prodi = 'A'
		  AND CAST(sms.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
		  AND sms.id_jns_sms = '3'
		  AND sms.id_fak_unila IS NOT NULL
		ORDER BY sms.nm_lemb ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []*SMSUnit
	for rows.Next() {
		u := &SMSUnit{}
		if err := rows.StructScan(u); err != nil {
			return nil, err
		}
		units = append(units, u)
	}
	return units, nil
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
