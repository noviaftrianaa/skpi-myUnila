-- ============================================================
-- monitoring_08_crawl_sessions_create.sql
-- Satu eksekusi crawl (satu run dari crawl_job)
-- status: queued / running / completed / failed / cancelled
-- ============================================================

create table monitoring.crawl_sessions (
    id              uniqueidentifier    not null,
    job_id          int                 not null,
    status          nvarchar(20)        not null default 'queued',
    sites_scanned   int                 not null default 0,
    pages_scanned   int                 not null default 0,
    threats_found   int                 not null default 0,
    error_message   nvarchar(max)       null,
    started_at      datetime            null,
    completed_at    datetime            null,
    duration_ms     bigint              not null default 0,
    -- audit
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_crawl_sessions check (soft_delete in (0,1)),

    constraint pk_crawl_sessions primary key (id),
    constraint fk_crawl_sessions_job foreign key (job_id)
        references monitoring.crawl_jobs (id)
)
go

create index idx_crawl_sessions_1 on monitoring.crawl_sessions (job_id, started_at desc)
go
create index idx_crawl_sessions_2 on monitoring.crawl_sessions (status)
go

print 'Table monitoring.crawl_sessions created.'
go
