-- ============================================================
-- monitoring_11_alert_notifications_create.sql
-- History notifikasi yang dikirim
-- channel: email / webhook / telegram / dashboard
-- ============================================================

create table monitoring.alert_notifications (
    id          bigint identity(1,1)    not null,
    threat_id   uniqueidentifier        null,
    session_id  uniqueidentifier        null,
    channel     nvarchar(20)            not null,
    recipient   nvarchar(200)           not null,
    subject     nvarchar(500)           not null,
    body        nvarchar(max)           null,
    is_sent     numeric(1)              not null default 0
        constraint ckc_is_sent_alerts check (is_sent in (0,1)),
    sent_at     datetime                null,
    error_message nvarchar(max)         null,
    -- audit
    create_date datetime                not null,
    id_creator  uniqueidentifier        not null,
    last_update datetime                not null,
    id_updater  uniqueidentifier        null,
    soft_delete numeric(1)              not null default 0
        constraint ckc_soft_delete_alerts check (soft_delete in (0,1)),

    constraint pk_alert_notifications primary key (id),
    constraint fk_alerts_threat foreign key (threat_id)
        references monitoring.detected_threats (id),
    constraint fk_alerts_session foreign key (session_id)
        references monitoring.crawl_sessions (id)
)
go

create index idx_alerts_1 on monitoring.alert_notifications (threat_id)
go
create index idx_alerts_2 on monitoring.alert_notifications (is_sent, create_date desc)
go

print 'Table monitoring.alert_notifications created.'
go
