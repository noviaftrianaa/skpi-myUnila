-- ============================================================
-- monitoring_09_crawl_pages_create.sql
-- Setiap halaman yang dicrawl dalam satu sesi
-- ============================================================

create table monitoring.crawl_pages (
    id              bigint identity(1,1)    not null,
    session_id      uniqueidentifier        not null,
    site_id         uniqueidentifier        not null,
    url             nvarchar(2000)          not null,
    http_status     int                     null,
    content_length  int                     null,
    content_hash    nvarchar(64)            null,   -- SHA256 untuk deteksi perubahan
    threat_score    int                     not null default 0,
    scanned_at      datetime                not null,
    -- audit
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_crawl_pages check (soft_delete in (0,1)),

    constraint pk_crawl_pages primary key (id),
    constraint fk_crawl_pages_session foreign key (session_id)
        references monitoring.crawl_sessions (id),
    constraint fk_crawl_pages_site foreign key (site_id)
        references monitoring.sites (id)
)
go

create index idx_crawl_pages_1 on monitoring.crawl_pages (session_id)
go
create index idx_crawl_pages_2 on monitoring.crawl_pages (threat_score desc) where threat_score > 0
go
create index idx_crawl_pages_3 on monitoring.crawl_pages (site_id, scanned_at desc)
go

print 'Table monitoring.crawl_pages created.'
go
