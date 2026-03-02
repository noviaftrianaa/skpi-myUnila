-- ============================================================
-- monitoring_05_blog_sync_logs_create.sql
-- Log history sync Blogger API per situs
-- ============================================================

create table monitoring.blog_sync_logs (
    id              bigint identity(1,1)    not null,
    site_id         uniqueidentifier        not null,
    status          nvarchar(20)            not null,   -- success / failed / partial
    posts_fetched   int                     not null default 0,
    posts_new       int                     not null default 0,
    posts_updated   int                     not null default 0,
    error_message   nvarchar(max)           null,
    duration_ms     int                     not null default 0,
    synced_at       datetime                not null,
    -- audit
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_blog_sync check (soft_delete in (0,1)),

    constraint pk_blog_sync_logs primary key (id),
    constraint fk_blog_sync_site foreign key (site_id)
        references monitoring.sites (id)
)
go

create index idx_blog_sync_1 on monitoring.blog_sync_logs (site_id, synced_at desc)
go

print 'Table monitoring.blog_sync_logs created.'
go
