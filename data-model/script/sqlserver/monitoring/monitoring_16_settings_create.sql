-- ============================================================
-- monitoring_16_settings_create.sql
-- Tabel konfigurasi monitoring (non-sensitif, manageable dari dashboard)
-- key_group: gsc / crawler / alert / blogger / general
-- ============================================================

IF OBJECT_ID('monitoring.settings', 'U') IS NOT NULL DROP TABLE monitoring.settings
go

create table monitoring.settings (
    id              int identity(1,1)   not null,
    key_group       nvarchar(50)        not null,   -- gsc / crawler / alert / general
    setting_key     nvarchar(100)       not null,   -- e.g. gsc_site_url, gsc_service_account_email
    setting_value   nvarchar(max)       null,
    description     nvarchar(500)       null,
    is_sensitive    numeric(1)          not null default 0
        constraint ckc_is_sensitive_settings check (is_sensitive in (0,1)),
        -- 1 = jangan tampilkan di API response, hanya untuk referensi
    -- audit
    create_date     datetime            not null,
    id_creator      uniqueidentifier    not null,
    last_update     datetime            not null,
    id_updater      uniqueidentifier    null,
    soft_delete     numeric(1)          not null default 0
        constraint ckc_soft_delete_settings check (soft_delete in (0,1)),

    constraint pk_monitoring_settings primary key (id),
    constraint uq_settings_key unique (key_group, setting_key)
)
go

create index idx_settings_1 on monitoring.settings (key_group) where soft_delete = 0
go

print '>> monitoring.settings created.'
go

-- Seed: konfigurasi GSC
declare @now datetime = getdate()
declare @sys uniqueidentifier = '00000000-0000-0000-0000-000000000001'

insert into monitoring.settings
    (key_group, setting_key, setting_value, description, is_sensitive, create_date, id_creator, last_update, soft_delete)
values
    ('gsc', 'site_url',
     'sc-domain:unila.ac.id',
     'Google Search Console site URL (sc-domain atau https://)',
     0, @now, @sys, @now, 0),

    ('gsc', 'service_account_email',
     'webmon-gsc-bot@imperial-berm-489006-p6.iam.gserviceaccount.com',
     'Email service account yang didelegasikan ke GSC property',
     0, @now, @sys, @now, 0),

    ('gsc', 'service_account_json_path',
     '/app/secrets/gsc-service-account.json',
     'Path ke file JSON service account di dalam container',
     1, @now, @sys, @now, 0),

    ('gsc', 'auto_remove_threshold',
     '15',
     'Score minimum untuk auto-submit URL removal ke GSC',
     0, @now, @sys, @now, 0),

    ('gsc', 'enabled',
     'true',
     'Aktifkan integrasi Google Search Console',
     0, @now, @sys, @now, 0),

    ('crawler', 'max_depth',
     '3',
     'Kedalaman crawl maksimum per domain',
     0, @now, @sys, @now, 0),

    ('crawler', 'max_pages_per_site',
     '500',
     'Jumlah halaman maksimum per site per crawl',
     0, @now, @sys, @now, 0),

    ('crawler', 'rate_limit_ms',
     '1000',
     'Delay antar request per domain (ms)',
     0, @now, @sys, @now, 0),

    ('crawler', 'max_concurrent_sites',
     '3',
     'Jumlah site yang di-crawl bersamaan',
     0, @now, @sys, @now, 0),

    ('alert', 'admin_email',
     '',
     'Email penerima notifikasi alert (kosongkan jika tidak dipakai)',
     0, @now, @sys, @now, 0),

    ('general', 'monitoring_name',
     'Unila Web Monitoring',
     'Nama sistem monitoring',
     0, @now, @sys, @now, 0)
go

print '>> monitoring.settings seeded (GSC + crawler + alert config).'
go
