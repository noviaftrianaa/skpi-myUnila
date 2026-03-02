-- ============================================================
-- monitoring_07_crawl_jobs_create.sql
-- Konfigurasi scheduled crawl jobs
-- target_scope: all / specific / custom_urls
-- ============================================================

create table monitoring.crawl_jobs (
    id                  int identity(1,1)   not null,
    name                nvarchar(200)       not null,
    description         nvarchar(max)       null,
    target_scope        nvarchar(20)        not null default 'all',
        -- all / specific / custom_urls
    target_site_ids     nvarchar(max)       null,   -- JSON array of site UUIDs
    custom_urls         nvarchar(max)       null,   -- JSON array of URLs
    max_depth           int                 not null default 3,
    max_pages_per_site  int                 not null default 500,
    cron_expression     nvarchar(100)       not null,
    is_active           numeric(1)          not null default 1
        constraint ckc_is_active_crawl_jobs check (is_active in (0,1)),
    last_run_at         datetime            null,
    next_run_at         datetime            null,
    -- audit
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_crawl_jobs check (soft_delete in (0,1)),

    constraint pk_crawl_jobs primary key (id)
)
go

create index idx_crawl_jobs_1 on monitoring.crawl_jobs (is_active) where soft_delete = 0
go

print 'Table monitoring.crawl_jobs created.'
go
