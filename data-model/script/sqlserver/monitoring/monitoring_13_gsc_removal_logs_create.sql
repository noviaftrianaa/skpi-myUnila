-- ============================================================
-- monitoring_13_gsc_removal_logs_create.sql
-- Log Google Search Console URL removal / recrawl requests
-- action: removal / recrawl
-- status: submitted / completed / failed
-- ============================================================

create table monitoring.gsc_removal_logs (
    id              bigint identity(1,1)    not null,
    threat_id       uniqueidentifier        not null,
    url             nvarchar(2000)          not null,
    action          nvarchar(20)            not null,   -- removal / recrawl
    gsc_request_id  nvarchar(200)           null,
    status          nvarchar(20)            not null default 'submitted',
    submitted_by    nvarchar(200)           null,       -- 'auto' atau user email
    submitted_at    datetime                not null,
    error_message   nvarchar(max)           null,
    -- audit
    create_date     datetime                not null,
    id_creator      uniqueidentifier        not null,
    last_update     datetime                not null,
    id_updater      uniqueidentifier        null,
    soft_delete     numeric(1)              not null default 0
        constraint ckc_soft_delete_gsc_logs check (soft_delete in (0,1)),

    constraint pk_gsc_removal_logs primary key (id),
    constraint fk_gsc_logs_threat foreign key (threat_id)
        references monitoring.detected_threats (id)
)
go

create index idx_gsc_logs_1 on monitoring.gsc_removal_logs (threat_id)
go
create index idx_gsc_logs_2 on monitoring.gsc_removal_logs (submitted_at desc)
go

print 'Table monitoring.gsc_removal_logs created.'
go
