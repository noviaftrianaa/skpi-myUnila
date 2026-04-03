-- Seed data for myunila_project database
-- Run via: sudo -u postgres psql -d myunila_project -f seed.sql

-- Project: MyUnila Portal
INSERT INTO projects (id_project, kode_project, nm_project, deskripsi, status, repo_url, repo_provider)
VALUES (uuid_generate_v4(), 'MYUNILA', 'MyUnila Portal', 'Portal Terpadu Universitas Lampung', 'active', 'https://bitbucket.org/mahendraunila/my-unila', 'bitbucket')
ON CONFLICT (kode_project) DO NOTHING;

-- Modules
INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan)
SELECT uuid_generate_v4(), id_project, 'Manajemen Akses', 'Module untuk manajemen pengguna dan hak akses', 'in_progress', 1
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan)
SELECT uuid_generate_v4(), id_project, 'Data Unila', 'Module integrasi data akademik Unila', 'in_progress', 2
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan)
SELECT uuid_generate_v4(), id_project, 'Monitoring', 'Module monitoring dan dashboard', 'backlog', 3
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan)
SELECT uuid_generate_v4(), id_project, 'Keuangan', 'Module integrasi data keuangan', 'in_progress', 4
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan)
SELECT uuid_generate_v4(), id_project, 'Public Portal', 'Module portal publik Universitas Lampung', 'backlog', 5
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

-- Webhook Config
INSERT INTO webhook_config (id_webhook, id_project, provider, webhook_secret, repo_full_name, a_active)
SELECT uuid_generate_v4(), id_project, 'bitbucket', 'webhook_secret_change_me', 'mahendraunila/my-unila', TRUE
FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

-- Sample Labels
INSERT INTO labels (id_label, id_project, nm_label, warna)
SELECT uuid_generate_v4(), id_project, 'bug', '#EF4444' FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO labels (id_label, id_project, nm_label, warna)
SELECT uuid_generate_v4(), id_project, 'feature', '#3B82F6' FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO labels (id_label, id_project, nm_label, warna)
SELECT uuid_generate_v4(), id_project, 'improvement', '#10B981' FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

INSERT INTO labels (id_label, id_project, nm_label, warna)
SELECT uuid_generate_v4(), id_project, 'urgent', '#F59E0B' FROM projects WHERE kode_project = 'MYUNILA'
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'Projects:' AS info, COUNT(*) AS count FROM projects WHERE soft_delete = FALSE
UNION ALL
SELECT 'Modules:', COUNT(*) FROM modules WHERE soft_delete = FALSE
UNION ALL
SELECT 'Labels:', COUNT(*) FROM labels
UNION ALL
SELECT 'Webhook configs:', COUNT(*) FROM webhook_config WHERE a_active = TRUE;
