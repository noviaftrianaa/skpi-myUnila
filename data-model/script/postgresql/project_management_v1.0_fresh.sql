-- =====================================================
-- Script: Project Management Module - CREATE Tables
-- Database: PostgreSQL (dedicated DB: myunila_project)
-- Version: 1.0
-- Date: 2026-03-17
-- Author: Vibe Bot + Mizar
-- Description:
--   Modul project management internal MyUnila Portal.
--   DB terpisah menggunakan PostgreSQL.
--
--   Tables:
--     1. projects           - Data project
--     2. modules            - Modul/epic dalam project
--     3. tasks              - Task/issue dalam modul
--     4. task_comments      - Komentar pada task
--     5. task_commits       - Link commit git ke task
--     6. activity_log       - Log aktivitas project
--     7. webhook_config     - Konfigurasi webhook git
--     8. labels             - Label/tag per project
--     9. task_labels        - Relasi task-label (many-to-many)
--
--   Relasi:
--     projects 1──N modules 1──N tasks
--     tasks 1──N task_comments
--     tasks 1──N task_commits
--     tasks N──M labels (via task_labels)
--     projects 1──N activity_log
--     projects 1──N webhook_config
--     projects 1──N labels
-- =====================================================

-- =====================================================
-- Step 0: Create Database & Extensions
-- =====================================================
-- CREATE DATABASE myunila_project;
-- \c myunila_project

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- NOTE: Dual Database Connection
-- =====================================================
-- Primary DB  : PostgreSQL (myunila_project) — tabel project management
-- Secondary DB: SQL Server (pdut) — READ ONLY untuk referensi:
--   - man_akses.pengguna (data user, nama, username)
--   - man_akses.peran (data role)
--   - man_akses.role_pengguna (mapping user-role)
--   - man_akses.organisasi (unit organisasi)
--
-- Field id_owner, id_assignee, id_reporter, id_pengguna
-- menyimpan UUID yang merujuk ke man_akses.pengguna.id_pengguna di SQL Server.
-- Backend resolve nama pengguna via dual connection (bukan FK langsung).
-- =====================================================

-- =====================================================
-- Step 1: CREATE TABLE projects
-- =====================================================
-- Data project utama (MyUnila, SIAKAD, dll)

CREATE TABLE IF NOT EXISTS projects (
    id_project      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_project    VARCHAR(20)     NOT NULL UNIQUE,
    nm_project      VARCHAR(200)    NOT NULL,
    deskripsi       TEXT            NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'active',
                                    -- active, archived, completed
    repo_url        VARCHAR(500)    NULL,
    repo_provider   VARCHAR(20)     NULL DEFAULT 'bitbucket',
                                    -- bitbucket, github, gitlab
    warna           VARCHAR(7)      NULL,
    tgl_mulai       DATE            NULL,
    tgl_target      DATE            NULL,
    id_owner        UUID            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE projects IS 'Data project utama';
COMMENT ON COLUMN projects.kode_project IS 'Kode singkat project, misal: MYUNILA, SIAKAD';
COMMENT ON COLUMN projects.status IS 'Status project: active, archived, completed';
COMMENT ON COLUMN projects.repo_provider IS 'Provider git: bitbucket, github, gitlab';
COMMENT ON COLUMN projects.id_owner IS 'UUID penanggung jawab project (ref ke auth-service pengguna)';

-- =====================================================
-- Step 2: CREATE TABLE modules
-- =====================================================
-- Modul/epic dalam project (misal: Manajemen Akses, Data Unila)

CREATE TABLE IF NOT EXISTS modules (
    id_module       UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    nm_module       VARCHAR(200)    NOT NULL,
    deskripsi       TEXT            NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'backlog',
                                    -- backlog, in_progress, completed
    urutan          INT             NOT NULL DEFAULT 0,
    warna           VARCHAR(7)      NULL,
    tgl_mulai       DATE            NULL,
    tgl_target      DATE            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE modules IS 'Modul/epic dalam project';
COMMENT ON COLUMN modules.urutan IS 'Urutan tampil modul';

-- =====================================================
-- Step 3: CREATE TABLE tasks
-- =====================================================
-- Task/issue individual (seperti Jira issue)

CREATE TABLE IF NOT EXISTS tasks (
    id_task         UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_module       UUID            NOT NULL REFERENCES modules(id_module)
                                    ON DELETE CASCADE,
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    kode_task       VARCHAR(20)     NOT NULL,
                                    -- Auto-generated: MYUNILA-1, MYUNILA-2
    nomor_task      INT             NOT NULL,
                                    -- Auto-increment per project
    judul           VARCHAR(500)    NOT NULL,
    deskripsi       TEXT            NULL,
    tipe            VARCHAR(20)     NOT NULL DEFAULT 'feature',
                                    -- feature, bugfix, improvement, chore, documentation
    prioritas       VARCHAR(20)     NOT NULL DEFAULT 'medium',
                                    -- urgent, high, medium, low
    status          VARCHAR(20)     NOT NULL DEFAULT 'backlog',
                                    -- backlog, todo, in_progress, review, done, cancelled
    id_assignee     UUID            NULL,
    id_reporter     UUID            NULL,
    tgl_mulai       DATE            NULL,
    tgl_target      DATE            NULL,
    tgl_selesai     DATE            NULL,
    progress        INT             NOT NULL DEFAULT 0
                                    CHECK (progress >= 0 AND progress <= 100),
    estimasi_jam    DECIMAL(5,1)    NULL,
    actual_jam      DECIMAL(5,1)    NULL,
    tags            VARCHAR(500)    NULL,
    urutan          INT             NOT NULL DEFAULT 0,
                                    -- Urutan dalam kanban column (untuk drag & drop)
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE tasks IS 'Task/issue individual (seperti Jira issue)';
COMMENT ON COLUMN tasks.kode_task IS 'Kode unik task, format: KODE_PROJECT-NOMOR';
COMMENT ON COLUMN tasks.nomor_task IS 'Nomor urut task dalam project (auto-increment)';
COMMENT ON COLUMN tasks.tipe IS 'Tipe task: feature, bugfix, improvement, chore, documentation';
COMMENT ON COLUMN tasks.prioritas IS 'Priority: urgent, high, medium, low';
COMMENT ON COLUMN tasks.status IS 'Kanban status: backlog, todo, in_progress, review, done, cancelled';
COMMENT ON COLUMN tasks.urutan IS 'Urutan posisi dalam kanban column (drag & drop ordering)';
COMMENT ON COLUMN tasks.id_assignee IS 'UUID pengguna yang ditugaskan (ref ke auth-service)';
COMMENT ON COLUMN tasks.id_reporter IS 'UUID pengguna yang membuat task (ref ke auth-service)';

-- =====================================================
-- Step 4: CREATE TABLE task_comments
-- =====================================================
-- Komentar/diskusi pada task

CREATE TABLE IF NOT EXISTS task_comments (
    id_comment      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_task         UUID            NOT NULL REFERENCES tasks(id_task)
                                    ON DELETE CASCADE,
    id_pengguna     UUID            NULL,
    konten          TEXT            NOT NULL,
    tipe            VARCHAR(20)     NOT NULL DEFAULT 'comment',
                                    -- comment, note, system
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE task_comments IS 'Komentar/diskusi pada task';
COMMENT ON COLUMN task_comments.tipe IS 'Tipe: comment (user), note (internal), system (auto-generated)';

-- =====================================================
-- Step 5: CREATE TABLE task_commits
-- =====================================================
-- Link commit dari git repository ke task

CREATE TABLE IF NOT EXISTS task_commits (
    id_task_commit  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_task         UUID            NULL REFERENCES tasks(id_task)
                                    ON DELETE SET NULL,
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    commit_hash     VARCHAR(40)     NOT NULL,
    commit_hash_short VARCHAR(12)   NOT NULL,
    commit_message  VARCHAR(500)    NULL,
    author_name     VARCHAR(200)    NULL,
    author_email    VARCHAR(200)    NULL,
    branch          VARCHAR(200)    NULL,
    commit_url      VARCHAR(500)    NULL,
    committed_at    TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE task_commits IS 'Link commit git ke task (via Bitbucket webhook)';
COMMENT ON COLUMN task_commits.id_task IS 'NULL jika commit tidak terhubung ke task manapun';
COMMENT ON COLUMN task_commits.commit_url IS 'Direct link ke halaman commit di Bitbucket/GitHub';

-- =====================================================
-- Step 6: CREATE TABLE activity_log
-- =====================================================
-- Log semua aktivitas dalam project

CREATE TABLE IF NOT EXISTS activity_log (
    id_activity     UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    id_task         UUID            NULL REFERENCES tasks(id_task)
                                    ON DELETE SET NULL,
    id_pengguna     UUID            NULL,
    aksi            VARCHAR(50)     NOT NULL,
                                    -- project_created, task_created, task_updated,
                                    -- status_changed, commented, committed, auto_closed,
                                    -- module_created, assigned
    detail          TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Log aktivitas project (audit trail)';
COMMENT ON COLUMN activity_log.aksi IS 'Jenis aksi: project_created, task_created, status_changed, committed, dll';
COMMENT ON COLUMN activity_log.id_pengguna IS 'NULL untuk aksi otomatis (webhook, system)';

-- =====================================================
-- Step 7: CREATE TABLE webhook_config
-- =====================================================
-- Konfigurasi webhook untuk integrasi git

CREATE TABLE IF NOT EXISTS webhook_config (
    id_webhook      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    provider        VARCHAR(20)     NOT NULL DEFAULT 'bitbucket',
                                    -- bitbucket, github, gitlab
    webhook_secret  VARCHAR(200)    NOT NULL,
    repo_full_name  VARCHAR(200)    NOT NULL,
                                    -- Format: "owner/repo-name"
    a_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE webhook_config IS 'Konfigurasi webhook integrasi git repository';
COMMENT ON COLUMN webhook_config.repo_full_name IS 'Nama lengkap repo, format: mahendraunila/my-unila';
COMMENT ON COLUMN webhook_config.webhook_secret IS 'Secret untuk verifikasi signature webhook';

-- =====================================================
-- Step 8: CREATE TABLE labels
-- =====================================================
-- Label/tag kustom per project

CREATE TABLE IF NOT EXISTS labels (
    id_label        UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_project      UUID            NOT NULL REFERENCES projects(id_project)
                                    ON DELETE CASCADE,
    nm_label        VARCHAR(100)    NOT NULL,
    warna           VARCHAR(7)      NOT NULL DEFAULT '#6B7280',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE labels IS 'Label/tag kustom per project';

-- =====================================================
-- Step 9: CREATE TABLE task_labels (junction)
-- =====================================================
-- Relasi many-to-many antara task dan label

CREATE TABLE IF NOT EXISTS task_labels (
    id_task         UUID            NOT NULL REFERENCES tasks(id_task)
                                    ON DELETE CASCADE,
    id_label        UUID            NOT NULL REFERENCES labels(id_label)
                                    ON DELETE CASCADE,
    PRIMARY KEY (id_task, id_label)
);

COMMENT ON TABLE task_labels IS 'Relasi many-to-many task ↔ label';

-- =====================================================
-- Step 10: INDEXES
-- =====================================================

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status
    ON projects(status) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_projects_kode
    ON projects(kode_project);

-- Modules
CREATE INDEX IF NOT EXISTS idx_modules_project
    ON modules(id_project) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_modules_urutan
    ON modules(id_project, urutan) WHERE soft_delete = FALSE;

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project
    ON tasks(id_project) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_module
    ON tasks(id_module) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks(id_project, status) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_kode
    ON tasks(kode_task);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee
    ON tasks(id_assignee) WHERE soft_delete = FALSE AND id_assignee IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_prioritas
    ON tasks(id_project, prioritas) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_target
    ON tasks(tgl_target) WHERE soft_delete = FALSE AND status NOT IN ('done', 'cancelled');

-- Task Comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task
    ON task_comments(id_task) WHERE soft_delete = FALSE;

-- Task Commits
CREATE INDEX IF NOT EXISTS idx_task_commits_task
    ON task_commits(id_task);

CREATE INDEX IF NOT EXISTS idx_task_commits_project
    ON task_commits(id_project);

CREATE INDEX IF NOT EXISTS idx_task_commits_hash
    ON task_commits(commit_hash);

-- Activity Log
CREATE INDEX IF NOT EXISTS idx_activity_project
    ON activity_log(id_project, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_task
    ON activity_log(id_task) WHERE id_task IS NOT NULL;

-- Webhook
CREATE INDEX IF NOT EXISTS idx_webhook_repo
    ON webhook_config(repo_full_name) WHERE a_active = TRUE;

-- Labels
CREATE INDEX IF NOT EXISTS idx_labels_project
    ON labels(id_project);

-- =====================================================
-- Step 11: TRIGGER auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke tabel yang punya updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['projects', 'modules', 'tasks', 'task_comments'])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- =====================================================
-- DONE
-- =====================================================
-- Relasi Summary:
--
--   projects ──┬── modules ──── tasks ──┬── task_comments
--              │                        ├── task_commits
--              │                        └── task_labels ── labels
--              ├── activity_log
--              ├── webhook_config
--              └── labels
--
-- Architecture:
--   ┌─────────────────┐          ┌──────────────────┐
--   │   PostgreSQL     │          │   SQL Server     │
--   │ myunila_project  │          │   pdut           │
--   ├─────────────────┤          ├──────────────────┤
--   │ projects         │  ref──▶ │ man_akses.       │
--   │ modules          │         │   pengguna       │
--   │ tasks            │  ref──▶ │   peran          │
--   │ task_comments    │         │   role_pengguna  │
--   │ task_commits     │         │   organisasi     │
--   │ activity_log     │         └──────────────────┘
--   │ webhook_config   │         (READ ONLY reference)
--   │ labels           │
--   │ task_labels      │
--   └─────────────────┘
--   (Primary - READ/WRITE)
--
-- Next Steps:
--   1. Review relasi & tipe data
--   2. Buat backend Go service (project-service) dengan dual DB connection
--   3. Buat frontend Next.js pages
--   4. Setup Bitbucket webhook
-- =====================================================
