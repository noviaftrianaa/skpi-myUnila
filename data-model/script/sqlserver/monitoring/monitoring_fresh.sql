-- ============================================================
-- monitoring_fresh.sql  [v2 - schema sesuai Go entities]
-- Fresh install schema monitoring (semua tabel dalam 1 file)
-- Web Monitoring & Early Warning System - my.unila.ac.id
-- ============================================================

-- DROP semua tabel (urut terbalik karena FK)
IF OBJECT_ID('monitoring.settings',             'U') IS NOT NULL DROP TABLE monitoring.settings
IF OBJECT_ID('monitoring.gsc_removal_logs',     'U') IS NOT NULL DROP TABLE monitoring.gsc_removal_logs
IF OBJECT_ID('monitoring.alert_notifications',  'U') IS NOT NULL DROP TABLE monitoring.alert_notifications
IF OBJECT_ID('monitoring.daily_summary',        'U') IS NOT NULL DROP TABLE monitoring.daily_summary
IF OBJECT_ID('monitoring.detected_threats',     'U') IS NOT NULL DROP TABLE monitoring.detected_threats
IF OBJECT_ID('monitoring.crawl_pages',          'U') IS NOT NULL DROP TABLE monitoring.crawl_pages
IF OBJECT_ID('monitoring.crawl_sessions',       'U') IS NOT NULL DROP TABLE monitoring.crawl_sessions
IF OBJECT_ID('monitoring.crawl_jobs',           'U') IS NOT NULL DROP TABLE monitoring.crawl_jobs
IF OBJECT_ID('monitoring.threat_keywords',      'U') IS NOT NULL DROP TABLE monitoring.threat_keywords
IF OBJECT_ID('monitoring.blog_sync_logs',       'U') IS NOT NULL DROP TABLE monitoring.blog_sync_logs
IF OBJECT_ID('monitoring.blog_posts_cache',     'U') IS NOT NULL DROP TABLE monitoring.blog_posts_cache
IF OBJECT_ID('monitoring.site_metadata',        'U') IS NOT NULL DROP TABLE monitoring.site_metadata
IF OBJECT_ID('monitoring.site_checks',          'U') IS NOT NULL DROP TABLE monitoring.site_checks
IF OBJECT_ID('monitoring.sites',                'U') IS NOT NULL DROP TABLE monitoring.sites
go

-- 1. SCHEMA
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'monitoring')
BEGIN EXEC('CREATE SCHEMA monitoring') PRINT '>> Schema monitoring created.' END
ELSE PRINT '>> Schema monitoring already exists.'
go

-- 2. monitoring.sites
create table monitoring.sites (
    id                  uniqueidentifier    not null,
    url                 nvarchar(500)       not null,
    name                nvarchar(200)       not null,
    platform            nvarchar(50)        not null default 'custom',
    platform_version    nvarchar(50)        null,
    blogger_blog_id     nvarchar(100)       null,
    blogger_api_key     nvarchar(200)       null,
    sync_interval_min   int                 not null default 15,
    last_synced_at      datetime            null,
    status              nvarchar(20)        not null default 'active',
    is_active           numeric(1)          not null default 1
        constraint ckc_is_active_sites check (is_active in (0,1)),
    fakultas_id         nvarchar(50)        null,
    unit_id             nvarchar(50)        null,
    id_sms              uniqueidentifier    null,
    admin_name          nvarchar(200)       null,
    admin_email         nvarchar(200)       null,
    admin_phone         nvarchar(50)        null,
    admin_whatsapp      nvarchar(50)        null,
    notes               nvarchar(max)       null,
    is_behind_kong      numeric(1)          not null default 0
        constraint ckc_is_behind_kong_sites check (is_behind_kong in (0,1)),
    is_sso_enabled      numeric(1)          not null default 0
        constraint ckc_is_sso_enabled_sites check (is_sso_enabled in (0,1)),
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_sites check (soft_delete in (0,1)),
    constraint pk_monitoring_sites primary key (id),
    constraint uq_sites_url unique (url)
)
go
create index idx_sites_1 on monitoring.sites (status) where soft_delete = 0
go
create index idx_sites_2 on monitoring.sites (platform) where soft_delete = 0
go
create index idx_sites_3 on monitoring.sites (fakultas_id) where soft_delete = 0
go
create index idx_sites_4 on monitoring.sites (is_active) where soft_delete = 0
go
print '>> monitoring.sites created.'
go

-- 3. monitoring.site_checks  (Go SiteCheck: is_up, http_code, ssl_expiry_days, error_msg)
create table monitoring.site_checks (
    id              bigint identity(1,1)    not null,
    site_id         uniqueidentifier        not null,
    checked_at      datetime                not null,
    http_code       int                     null,
    response_time_ms int                    null,
    is_up           numeric(1)              not null default 0
        constraint ckc_is_up_site_checks check (is_up in (0,1)),
    ssl_valid       numeric(1)              null
        constraint ckc_ssl_valid_site_checks check (ssl_valid in (0,1)),
    ssl_expiry_days int                     null,
    error_msg       nvarchar(500)           null,
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_site_checks check (soft_delete in (0,1)),
    constraint pk_site_checks primary key (id),
    constraint fk_site_checks_site foreign key (site_id) references monitoring.sites (id)
)
go
create index idx_site_checks_1 on monitoring.site_checks (site_id, checked_at desc)
go
create index idx_site_checks_2 on monitoring.site_checks (checked_at desc)
go
print '>> monitoring.site_checks created.'
go

-- 4. monitoring.site_metadata
create table monitoring.site_metadata (
    id          bigint identity(1,1)    not null,
    site_id     uniqueidentifier        not null,
    meta_key    nvarchar(100)           not null,
    meta_value  nvarchar(max)           null,
    create_date datetime                not null,
    id_creator  uniqueidentifier        not null,
    last_update datetime                not null,
    id_updater  uniqueidentifier        null,
    soft_delete numeric(1)              not null default 0
        constraint ckc_soft_delete_site_metadata check (soft_delete in (0,1)),
    constraint pk_site_metadata primary key (id),
    constraint fk_site_metadata_site foreign key (site_id) references monitoring.sites (id),
    constraint uq_site_metadata_key unique (site_id, meta_key)
)
go
create index idx_site_metadata_1 on monitoring.site_metadata (site_id)
go
print '>> monitoring.site_metadata created.'
go

-- 5. monitoring.blog_posts_cache
create table monitoring.blog_posts_cache (
    id                  uniqueidentifier    not null,
    site_id             uniqueidentifier    not null,
    blogger_post_id     nvarchar(100)       not null,
    title               nvarchar(500)       not null,
    content             nvarchar(max)       not null,
    excerpt             nvarchar(1000)      null,
    slug                nvarchar(500)       not null,
    author_name         nvarchar(200)       null,
    author_avatar_url   nvarchar(500)       null,
    labels              nvarchar(max)       null,
    thumbnail_url       nvarchar(500)       null,
    published_at        datetime            not null,
    updated_at_source   datetime            not null,
    synced_at           datetime            not null,
    is_visible          numeric(1)          not null default 1
        constraint ckc_is_visible_blog_posts check (is_visible in (0,1)),
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_blog_posts check (soft_delete in (0,1)),
    constraint pk_blog_posts_cache primary key (id),
    constraint fk_blog_posts_site foreign key (site_id) references monitoring.sites (id),
    constraint uq_blog_posts_external unique (site_id, blogger_post_id)
)
go
create index idx_blog_posts_1 on monitoring.blog_posts_cache (published_at desc) where soft_delete = 0
go
create index idx_blog_posts_2 on monitoring.blog_posts_cache (site_id, published_at desc) where soft_delete = 0
go
create index idx_blog_posts_3 on monitoring.blog_posts_cache (slug) where soft_delete = 0
go
print '>> monitoring.blog_posts_cache created.'
go

-- 6. monitoring.blog_sync_logs
create table monitoring.blog_sync_logs (
    id              bigint identity(1,1)    not null,
    site_id         uniqueidentifier        not null,
    status          nvarchar(20)            not null,
    posts_fetched   int                     not null default 0,
    posts_new       int                     not null default 0,
    posts_updated   int                     not null default 0,
    error_message   nvarchar(max)           null,
    duration_ms     int                     not null default 0,
    synced_at       datetime                not null,
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_blog_sync check (soft_delete in (0,1)),
    constraint pk_blog_sync_logs primary key (id),
    constraint fk_blog_sync_site foreign key (site_id) references monitoring.sites (id)
)
go
create index idx_blog_sync_1 on monitoring.blog_sync_logs (site_id, synced_at desc)
go
print '>> monitoring.blog_sync_logs created.'
go

-- 7. monitoring.threat_keywords  (Go ThreatKeyword: id int, keyword, category, weight, is_active, notes)
create table monitoring.threat_keywords (
    id          int identity(1,1)   not null,
    keyword     nvarchar(200)       not null,
    category    nvarchar(50)        not null,
    weight      int                 not null default 5,
    is_active   numeric(1)          not null default 1
        constraint ckc_is_active_keywords check (is_active in (0,1)),
    notes       nvarchar(max)       null,
    create_date datetime            not null,
    id_creator  uniqueidentifier    not null,
    last_update datetime            not null,
    id_updater  uniqueidentifier    null,
    soft_delete numeric(1)          not null default 0
        constraint ckc_soft_delete_keywords check (soft_delete in (0,1)),
    constraint pk_threat_keywords primary key (id),
    constraint uq_threat_keywords unique (keyword, category)
)
go
create index idx_keywords_1 on monitoring.threat_keywords (is_active, category) where soft_delete = 0
go
print '>> monitoring.threat_keywords created.'
go

-- 8. monitoring.crawl_jobs  (Go CrawlJob: id int, site_id nullable, job_type, status, triggered_by)
create table monitoring.crawl_jobs (
    id              int identity(1,1)   not null,
    site_id         uniqueidentifier    null,
    job_type        nvarchar(20)        not null default 'full',
    status          nvarchar(20)        not null default 'queued',
    triggered_by    nvarchar(100)       not null,
    started_at      datetime            null,
    finished_at     datetime            null,
    error_msg       nvarchar(max)       null,
    notes           nvarchar(max)       null,
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_crawl_jobs check (soft_delete in (0,1)),
    constraint pk_crawl_jobs primary key (id)
)
go
create index idx_crawl_jobs_1 on monitoring.crawl_jobs (status) where soft_delete = 0
go
create index idx_crawl_jobs_2 on monitoring.crawl_jobs (create_date desc) where soft_delete = 0
go
print '>> monitoring.crawl_jobs created.'
go

-- 9. monitoring.crawl_sessions  (Go CrawlSession: id int, job_id int, site_id, total_pages, threat_count)
create table monitoring.crawl_sessions (
    id              int identity(1,1)   not null,
    job_id          int                 not null,
    site_id         uniqueidentifier    not null,
    status          nvarchar(20)        not null default 'queued',
    total_pages     int                 not null default 0,
    threat_count    int                 not null default 0,
    started_at      datetime            null,
    finished_at     datetime            null,
    error_msg       nvarchar(max)       null,
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_crawl_sessions check (soft_delete in (0,1)),
    constraint pk_crawl_sessions primary key (id),
    constraint fk_crawl_sessions_job foreign key (job_id) references monitoring.crawl_jobs (id)
)
go
create index idx_crawl_sessions_1 on monitoring.crawl_sessions (job_id, id desc)
go
create index idx_crawl_sessions_2 on monitoring.crawl_sessions (status) where soft_delete = 0
go
create index idx_crawl_sessions_3 on monitoring.crawl_sessions (site_id) where soft_delete = 0
go
print '>> monitoring.crawl_sessions created.'
go

-- 10. monitoring.crawl_pages  (Go CrawlPage: page_url, page_title, http_code, has_threat, crawled_at)
create table monitoring.crawl_pages (
    id              int identity(1,1)   not null,
    session_id      int                 not null,
    site_id         uniqueidentifier    not null,
    page_url        nvarchar(2000)      not null,
    page_title      nvarchar(500)       null,
    http_code       int                 null,
    content_hash    nvarchar(64)        null,
    has_threat      numeric(1)          not null default 0
        constraint ckc_has_threat_crawl_pages check (has_threat in (0,1)),
    threat_score    int                 not null default 0,
    -- redirect chain tracking
    redirect_chain          nvarchar(max)   null,
    has_external_redirect   numeric(1)      not null default 0,
    -- cloaking detection
    is_cloaked              numeric(1)      not null default 0,
    cloaking_score          int             not null default 0,
    googlebot_threat_score  int             not null default 0,
    -- AMP scan
    amp_url                 nvarchar(2000)  null,
    amp_threat_score        int             not null default 0,
    -- timestamps
    crawled_at      datetime            not null,
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_crawl_pages check (soft_delete in (0,1)),
    constraint pk_crawl_pages primary key (id),
    constraint fk_crawl_pages_session foreign key (session_id) references monitoring.crawl_sessions (id)
)
go
create index idx_crawl_pages_1 on monitoring.crawl_pages (session_id)
go
create index idx_crawl_pages_2 on monitoring.crawl_pages (has_threat, threat_score desc) where has_threat = 1
go
create index idx_crawl_pages_3 on monitoring.crawl_pages (site_id, crawled_at desc) where soft_delete = 0
go
create index idx_crawl_pages_cloaked on monitoring.crawl_pages (is_cloaked) where is_cloaked = 1 and soft_delete = 0
go
print '>> monitoring.crawl_pages created.'
go

-- 11. monitoring.detected_threats  (Go DetectedThreat: id int, category, confirmed_at/by, status=pending)
create table monitoring.detected_threats (
    id                  int identity(1,1)   not null,
    site_id             uniqueidentifier    not null,
    crawl_page_id       int                 null,
    page_url            nvarchar(2000)      not null,
    page_title          nvarchar(500)       null,
    matched_keywords    nvarchar(max)       not null,
    threat_score        int                 not null,
    category            nvarchar(50)        not null default 'generic',
    snippet             nvarchar(max)       null,
    is_cloaked          numeric(1)          not null default 0,
    redirect_chain      nvarchar(max)       null,
    status              nvarchar(20)        not null default 'pending',
    detected_at         datetime            not null,
    confirmed_at        datetime            null,
    confirmed_by        nvarchar(100)       null,
    resolved_at         datetime            null,
    resolved_by         nvarchar(200)       null,
    notes               nvarchar(max)       null,
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_threats check (soft_delete in (0,1)),
    constraint pk_detected_threats primary key (id),
    constraint fk_threats_site foreign key (site_id) references monitoring.sites (id)
)
go
create index idx_threats_1 on monitoring.detected_threats (status, detected_at desc) where soft_delete = 0
go
create index idx_threats_2 on monitoring.detected_threats (site_id, status) where soft_delete = 0
go
create index idx_threats_3 on monitoring.detected_threats (threat_score desc) where soft_delete = 0
go
create index idx_threats_4 on monitoring.detected_threats (category) where soft_delete = 0
go
create index idx_threats_cloaked on monitoring.detected_threats (is_cloaked) where is_cloaked = 1 and soft_delete = 0
go
print '>> monitoring.detected_threats created.'
go

-- 12. monitoring.alert_notifications
create table monitoring.alert_notifications (
    id              bigint identity(1,1)    not null,
    threat_id       int                     null,
    channel         nvarchar(20)            not null,
    recipient       nvarchar(200)           not null,
    subject         nvarchar(500)           not null,
    body            nvarchar(max)           null,
    is_sent         numeric(1)              not null default 0
        constraint ckc_is_sent_alerts check (is_sent in (0,1)),
    sent_at         datetime                null,
    error_message   nvarchar(max)           null,
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_alerts check (soft_delete in (0,1)),
    constraint pk_alert_notifications primary key (id),
    constraint fk_alerts_threat foreign key (threat_id) references monitoring.detected_threats (id)
)
go
create index idx_alerts_1 on monitoring.alert_notifications (threat_id)
go
create index idx_alerts_2 on monitoring.alert_notifications (is_sent, create_date desc)
go
print '>> monitoring.alert_notifications created.'
go

-- 13. monitoring.daily_summary
create table monitoring.daily_summary (
    id                      int identity(1,1)   not null,
    summary_date            date                not null,
    total_sites_monitored   int                 not null default 0,
    sites_online            int                 not null default 0,
    sites_offline           int                 not null default 0,
    sites_compromised       int                 not null default 0,
    new_threats_count       int                 not null default 0,
    resolved_threats_count  int                 not null default 0,
    active_threats_count    int                 not null default 0,
    overall_status          nvarchar(20)        not null default 'aman',
    top_threat_categories   nvarchar(max)       null,
    create_date             datetime            not null,
    id_creator              uniqueidentifier    not null,
    last_update             datetime            not null,
    id_updater              uniqueidentifier    null,
    soft_delete             numeric(1)          not null default 0
        constraint ckc_soft_delete_daily_summary check (soft_delete in (0,1)),
    constraint pk_daily_summary primary key (id),
    constraint uq_daily_summary_date unique (summary_date)
)
go
create index idx_daily_summary_1 on monitoring.daily_summary (summary_date desc)
go
print '>> monitoring.daily_summary created.'
go

-- 14. monitoring.gsc_removal_logs
create table monitoring.gsc_removal_logs (
    id              bigint identity(1,1)    not null,
    threat_id       int                     not null,
    url             nvarchar(2000)          not null,
    action          nvarchar(20)            not null,
    gsc_request_id  nvarchar(200)           null,
    status          nvarchar(20)            not null default 'submitted',
    submitted_by    nvarchar(200)           null,
    submitted_at    datetime                not null,
    error_message   nvarchar(max)           null,
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_gsc_logs check (soft_delete in (0,1)),
    constraint pk_gsc_removal_logs primary key (id),
    constraint fk_gsc_logs_threat foreign key (threat_id) references monitoring.detected_threats (id)
)
go
create index idx_gsc_logs_1 on monitoring.gsc_removal_logs (threat_id)
go
create index idx_gsc_logs_2 on monitoring.gsc_removal_logs (submitted_at desc)
go
print '>> monitoring.gsc_removal_logs created.'
go

-- 15. SEED DATA: monitoring.threat_keywords
declare @sys_user uniqueidentifier = '00000000-0000-0000-0000-000000000001'
declare @now datetime = getdate()

insert into monitoring.threat_keywords (keyword, category, weight, is_active, notes, create_date, id_creator, last_update, soft_delete) values
('slot gacor',      'slot',    9, 1, null, @now, @sys_user, @now, 0),
('slot online',     'slot',    8, 1, null, @now, @sys_user, @now, 0),
('slot deposit',    'slot',    8, 1, null, @now, @sys_user, @now, 0),
('slot777',         'slot',    8, 1, null, @now, @sys_user, @now, 0),
('slot88',          'slot',    8, 1, null, @now, @sys_user, @now, 0),
('rtp slot',        'slot',    8, 1, null, @now, @sys_user, @now, 0),
('pragmatic play',  'slot',    7, 1, null, @now, @sys_user, @now, 0),
('scatter hitam',   'slot',    8, 1, null, @now, @sys_user, @now, 0),
('maxwin',          'slot',    7, 1, null, @now, @sys_user, @now, 0),
('gacor hari ini',  'slot',    8, 1, null, @now, @sys_user, @now, 0),
('slot dana',       'slot',    8, 1, null, @now, @sys_user, @now, 0),
('slot pulsa',      'slot',    8, 1, null, @now, @sys_user, @now, 0),
('bocoran slot',    'slot',    7, 1, null, @now, @sys_user, @now, 0),
('pola slot',       'slot',    6, 1, null, @now, @sys_user, @now, 0),
('togel online',    'togel',   9, 1, null, @now, @sys_user, @now, 0),
('bandar togel',    'togel',   9, 1, null, @now, @sys_user, @now, 0),
('togel sgp',       'togel',   8, 1, null, @now, @sys_user, @now, 0),
('togel hk',        'togel',   8, 1, null, @now, @sys_user, @now, 0),
('togel macau',     'togel',   8, 1, null, @now, @sys_user, @now, 0),
('prediksi togel',  'togel',   7, 1, null, @now, @sys_user, @now, 0),
('keluaran togel',  'togel',   7, 1, null, @now, @sys_user, @now, 0),
('judi online',     'casino',  9, 1, null, @now, @sys_user, @now, 0),
('casino online',   'casino',  8, 1, null, @now, @sys_user, @now, 0),
('live casino',     'casino',  8, 1, null, @now, @sys_user, @now, 0),
('baccarat online', 'casino',  7, 1, null, @now, @sys_user, @now, 0),
('roulette online', 'casino',  7, 1, null, @now, @sys_user, @now, 0),
('poker online',    'poker',   7, 1, null, @now, @sys_user, @now, 0),
('judi bola',       'poker',   7, 1, null, @now, @sys_user, @now, 0),
('situs judi',      'poker',   8, 1, null, @now, @sys_user, @now, 0),
('taruhan online',  'poker',   7, 1, null, @now, @sys_user, @now, 0),
('agen bola',       'poker',   7, 1, null, @now, @sys_user, @now, 0),
('ceme online',     'poker',   7, 1, null, @now, @sys_user, @now, 0),
('bonus new member','generic', 6, 1, null, @now, @sys_user, @now, 0),
('link alternatif', 'generic', 6, 1, null, @now, @sys_user, @now, 0),
('bo terpercaya',   'generic', 7, 1, null, @now, @sys_user, @now, 0),
('jackpot',         'generic', 5, 1, null, @now, @sys_user, @now, 0),
('deposit minimal', 'generic', 5, 1, null, @now, @sys_user, @now, 0),
('wd gampang',      'generic', 6, 1, null, @now, @sys_user, @now, 0),
('anti rungkad',    'generic', 6, 1, null, @now, @sys_user, @now, 0),
('server thailand', 'generic', 7, 1, null, @now, @sys_user, @now, 0),
('freespin',        'generic', 5, 1, null, @now, @sys_user, @now, 0)
go

select category, count(*) as total_keywords
from monitoring.threat_keywords where soft_delete = 0
group by category order by category
go

select t.name as table_name, p.rows as row_count
from sys.tables t
inner join sys.partitions p on t.object_id = p.object_id and p.index_id in (0,1)
where schema_name(t.schema_id) = 'monitoring'
order by t.name
go

-- 16. monitoring.settings
create table monitoring.settings (
    id              int identity(1,1)   not null,
    key_group       nvarchar(50)        not null,
    setting_key     nvarchar(100)       not null,
    setting_value   nvarchar(max)       null,
    description     nvarchar(500)       null,
    is_sensitive    numeric(1)          not null default 0
        constraint ckc_is_sensitive_settings check (is_sensitive in (0,1)),
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_settings check (soft_delete in (0,1)),
    constraint pk_monitoring_settings primary key (id),
    constraint uq_settings_key unique (key_group, setting_key)
)
go
create index idx_settings_1 on monitoring.settings (key_group) where soft_delete = 0
go

declare @s_now datetime = getdate()
declare @s_sys uniqueidentifier = '00000000-0000-0000-0000-000000000001'
insert into monitoring.settings (key_group, setting_key, setting_value, description, is_sensitive, create_date, id_creator, last_update, soft_delete)
values
    ('gsc','site_url','sc-domain:unila.ac.id','Google Search Console site URL',0,@s_now,@s_sys,@s_now,0),
    ('gsc','service_account_email','webmon-gsc-bot@imperial-berm-489006-p6.iam.gserviceaccount.com','Email service account GSC',0,@s_now,@s_sys,@s_now,0),
    ('gsc','service_account_json_path','/app/secrets/gsc-service-account.json','Path JSON service account di container',1,@s_now,@s_sys,@s_now,0),
    ('gsc','auto_remove_threshold','15','Score minimum untuk auto-submit URL removal',0,@s_now,@s_sys,@s_now,0),
    ('gsc','enabled','true','Aktifkan integrasi GSC',0,@s_now,@s_sys,@s_now,0),
    ('crawler','max_depth','3','Kedalaman crawl maksimum',0,@s_now,@s_sys,@s_now,0),
    ('crawler','max_pages_per_site','500','Halaman maks per site',0,@s_now,@s_sys,@s_now,0),
    ('crawler','rate_limit_ms','1000','Delay antar request (ms)',0,@s_now,@s_sys,@s_now,0),
    ('crawler','max_concurrent_sites','3','Site concurrent max',0,@s_now,@s_sys,@s_now,0),
    ('alert','admin_email','','Email penerima alert',0,@s_now,@s_sys,@s_now,0),
    ('general','monitoring_name','Unila Web Monitoring','Nama sistem',0,@s_now,@s_sys,@s_now,0)
go
print '>> monitoring.settings created and seeded.'
go

print '>> monitoring_fresh.sql v2 completed successfully.'
go
