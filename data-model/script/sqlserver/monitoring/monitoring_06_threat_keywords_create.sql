-- ============================================================
-- monitoring_06_threat_keywords_create.sql
-- Daftar keyword judol yang dikonfigurasi (configurable)
-- category: slot / togel / casino / poker / generic
-- ============================================================

create table monitoring.threat_keywords (
    id          int identity(1,1)   not null,
    keyword     nvarchar(200)       not null,
    category    nvarchar(50)        not null,
    weight      int                 not null default 5,  -- severity 1-10
    is_regex    numeric(1)          not null default 0
        constraint ckc_is_regex_keywords check (is_regex in (0,1)),
    is_active   numeric(1)          not null default 1
        constraint ckc_is_active_keywords check (is_active in (0,1)),
    -- audit
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

print 'Table monitoring.threat_keywords created.'
go
