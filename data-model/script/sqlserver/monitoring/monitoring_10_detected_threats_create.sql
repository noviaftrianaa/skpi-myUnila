-- ============================================================
-- monitoring_10_detected_threats_create.sql
-- Temuan konten judol per halaman
-- status: new / confirmed / false_positive / resolved
-- ============================================================

create table monitoring.detected_threats (
    id                  uniqueidentifier    not null,
    session_id          uniqueidentifier    not null,
    page_id             bigint              not null,
    site_id             uniqueidentifier    not null,
    url                 nvarchar(2000)      not null,
    matched_keywords    nvarchar(max)       not null,   -- JSON: [{keyword,category,weight}]
    threat_score        int                 not null,
    snippet             nvarchar(max)       null,       -- 200 char context sekitar match
    page_title          nvarchar(500)       null,
    status              nvarchar(20)        not null default 'new',
    gsc_removal_submitted numeric(1)        not null default 0
        constraint ckc_gsc_removal_submitted check (gsc_removal_submitted in (0,1)),
    resolved_by         nvarchar(200)       null,
    resolved_at         datetime            null,
    resolution_notes    nvarchar(max)       null,
    detected_at         datetime            not null,
    -- audit
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_threats check (soft_delete in (0,1)),

    constraint pk_detected_threats primary key (id),
    constraint fk_threats_session foreign key (session_id)
        references monitoring.crawl_sessions (id),
    constraint fk_threats_page foreign key (page_id)
        references monitoring.crawl_pages (id),
    constraint fk_threats_site foreign key (site_id)
        references monitoring.sites (id)
)
go

create index idx_threats_1 on monitoring.detected_threats (status, detected_at desc) where soft_delete = 0
go
create index idx_threats_2 on monitoring.detected_threats (site_id, status) where soft_delete = 0
go
create index idx_threats_3 on monitoring.detected_threats (threat_score desc) where soft_delete = 0
go

print 'Table monitoring.detected_threats created.'
go
