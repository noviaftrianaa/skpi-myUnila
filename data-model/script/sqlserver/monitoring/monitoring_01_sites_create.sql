-- ============================================================
-- monitoring_01_sites_create.sql
-- Registry semua situs CMS yang dimonitor
-- ============================================================

create table monitoring.sites (
    id                  uniqueidentifier    not null,
    url                 nvarchar(500)       not null,
    name                nvarchar(200)       not null,
    platform            nvarchar(50)        not null default 'blogger',
        -- blogger / wordpress / joomla / drupal / custom
    platform_version    nvarchar(50)        null,
    blogger_blog_id     nvarchar(100)       null,
    blogger_api_key     nvarchar(200)       null,
    sync_interval_min   int                 not null default 15,
    last_synced_at      datetime            null,
    status              nvarchar(20)        not null default 'active',
        -- active / inactive / compromised / maintenance
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
    -- audit
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

print 'Table monitoring.sites created.'
go
