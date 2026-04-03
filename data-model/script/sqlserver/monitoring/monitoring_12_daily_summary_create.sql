-- ============================================================
-- monitoring_12_daily_summary_create.sql
-- Ringkasan harian untuk public dashboard
-- overall_status: aman / waspada / bahaya
-- ============================================================

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
        -- aman / waspada / bahaya
    top_threat_categories   nvarchar(max)       null,   -- JSON: {slot:5, togel:3}
    -- audit
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

print 'Table monitoring.daily_summary created.'
go
