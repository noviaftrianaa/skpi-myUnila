-- ============================================================
-- monitoring_03_site_metadata_create.sql
-- Info tambahan per situs (key-value store)
-- meta_key: theme / plugins / php_version / server / ip_address
-- ============================================================

create table monitoring.site_metadata (
    id          bigint identity(1,1)    not null,
    site_id     uniqueidentifier        not null,
    meta_key    nvarchar(100)           not null,
    meta_value  nvarchar(max)           null,
    -- audit
    create_date datetime                not null,
    id_creator  uniqueidentifier        not null,
    last_update datetime                not null,
    id_updater  uniqueidentifier        null,
    soft_delete numeric(1)              not null default 0
        constraint ckc_soft_delete_site_metadata check (soft_delete in (0,1)),

    constraint pk_site_metadata primary key (id),
    constraint fk_site_metadata_site foreign key (site_id)
        references monitoring.sites (id),
    constraint uq_site_metadata_key unique (site_id, meta_key)
)
go

create index idx_site_metadata_1 on monitoring.site_metadata (site_id)
go

print 'Table monitoring.site_metadata created.'
go
