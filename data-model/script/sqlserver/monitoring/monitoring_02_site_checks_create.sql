-- ============================================================
-- monitoring_02_site_checks_create.sql
-- Log hasil health check per situs
-- ============================================================

create table monitoring.site_checks (
    id                      bigint identity(1,1)    not null,
    site_id                 uniqueidentifier        not null,
    is_online               numeric(1)              not null
        constraint ckc_is_online_site_checks check (is_online in (0,1)),
    http_status             int                     null,
    response_time_ms        int                     null,
    ssl_valid               numeric(1)              null
        constraint ckc_ssl_valid_site_checks check (ssl_valid in (0,1)),
    ssl_expiry              datetime                null,
    ssl_days_remaining      int                     null,
    cms_version_detected    nvarchar(50)            null,
    error_message           nvarchar(500)           null,
    checked_at              datetime                not null,
    -- audit
    create_date             datetime                not null,
    id_creator              uniqueidentifier        not null,
    last_update             datetime                not null,
    id_updater              uniqueidentifier        null,
    soft_delete             numeric(1)              not null default 0
        constraint ckc_soft_delete_site_checks check (soft_delete in (0,1)),

    constraint pk_site_checks primary key (id),
    constraint fk_site_checks_site foreign key (site_id)
        references monitoring.sites (id)
)
go

create index idx_site_checks_1 on monitoring.site_checks (site_id, checked_at desc)
go
create index idx_site_checks_2 on monitoring.site_checks (checked_at desc)
go

print 'Table monitoring.site_checks created.'
go
