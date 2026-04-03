--
-- PostgreSQL database dump
--

\restrict fuWGRfwAgeR6oEWItoVQfPSaPhXuQGeZl1BzWX2fNcYg7gBjeg0evfuKN47pnO3

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.webhook_config DROP CONSTRAINT IF EXISTS webhook_config_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_id_sprint_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_id_module_fkey;
ALTER TABLE IF EXISTS ONLY public.task_labels DROP CONSTRAINT IF EXISTS task_labels_id_task_fkey;
ALTER TABLE IF EXISTS ONLY public.task_labels DROP CONSTRAINT IF EXISTS task_labels_id_label_fkey;
ALTER TABLE IF EXISTS ONLY public.task_commits DROP CONSTRAINT IF EXISTS task_commits_id_task_fkey;
ALTER TABLE IF EXISTS ONLY public.task_commits DROP CONSTRAINT IF EXISTS task_commits_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_id_task_fkey;
ALTER TABLE IF EXISTS ONLY public.sprints DROP CONSTRAINT IF EXISTS sprints_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.project_watchers DROP CONSTRAINT IF EXISTS project_watchers_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.project_org_nodes DROP CONSTRAINT IF EXISTS project_org_nodes_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.project_org_edges DROP CONSTRAINT IF EXISTS project_org_edges_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.project_org_edges DROP CONSTRAINT IF EXISTS project_org_edges_id_node_to_fkey;
ALTER TABLE IF EXISTS ONLY public.project_org_edges DROP CONSTRAINT IF EXISTS project_org_edges_id_node_from_fkey;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS project_members_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.labels DROP CONSTRAINT IF EXISTS labels_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_id_task_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_id_project_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_id_doc_category_fkey;
ALTER TABLE IF EXISTS ONLY public.document_versions DROP CONSTRAINT IF EXISTS document_versions_id_document_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_id_task_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_id_project_fkey;
DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS set_updated_at ON public.task_comments;
DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
DROP TRIGGER IF EXISTS set_updated_at ON public.modules;
DROP INDEX IF EXISTS public.idx_webhook_repo;
DROP INDEX IF EXISTS public.idx_tasks_target;
DROP INDEX IF EXISTS public.idx_tasks_status;
DROP INDEX IF EXISTS public.idx_tasks_sprint;
DROP INDEX IF EXISTS public.idx_tasks_project;
DROP INDEX IF EXISTS public.idx_tasks_prioritas;
DROP INDEX IF EXISTS public.idx_tasks_module;
DROP INDEX IF EXISTS public.idx_tasks_kode;
DROP INDEX IF EXISTS public.idx_tasks_assignee;
DROP INDEX IF EXISTS public.idx_task_commits_task;
DROP INDEX IF EXISTS public.idx_task_commits_project;
DROP INDEX IF EXISTS public.idx_task_commits_hash;
DROP INDEX IF EXISTS public.idx_task_comments_task;
DROP INDEX IF EXISTS public.idx_sprints_project;
DROP INDEX IF EXISTS public.idx_projects_visibility;
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_projects_kode;
DROP INDEX IF EXISTS public.idx_project_watchers_user;
DROP INDEX IF EXISTS public.idx_project_watchers_project;
DROP INDEX IF EXISTS public.idx_project_org_nodes_project;
DROP INDEX IF EXISTS public.idx_project_members_user;
DROP INDEX IF EXISTS public.idx_project_members_project;
DROP INDEX IF EXISTS public.idx_modules_urutan;
DROP INDEX IF EXISTS public.idx_modules_project;
DROP INDEX IF EXISTS public.idx_labels_project;
DROP INDEX IF EXISTS public.idx_doc_versions_document;
DROP INDEX IF EXISTS public.idx_activity_task;
DROP INDEX IF EXISTS public.idx_activity_project;
ALTER TABLE IF EXISTS ONLY public.webhook_config DROP CONSTRAINT IF EXISTS webhook_config_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.task_labels DROP CONSTRAINT IF EXISTS task_labels_pkey;
ALTER TABLE IF EXISTS ONLY public.task_commits DROP CONSTRAINT IF EXISTS task_commits_pkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.sprints DROP CONSTRAINT IF EXISTS sprints_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_kode_project_key;
ALTER TABLE IF EXISTS ONLY public.project_watchers DROP CONSTRAINT IF EXISTS project_watchers_pkey;
ALTER TABLE IF EXISTS ONLY public.project_watchers DROP CONSTRAINT IF EXISTS project_watchers_id_project_id_pengguna_key;
ALTER TABLE IF EXISTS ONLY public.project_org_nodes DROP CONSTRAINT IF EXISTS project_org_nodes_pkey;
ALTER TABLE IF EXISTS ONLY public.project_org_edges DROP CONSTRAINT IF EXISTS project_org_edges_pkey;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS project_members_pkey;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS project_members_id_project_id_pengguna_key;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_pkey;
ALTER TABLE IF EXISTS ONLY public.labels DROP CONSTRAINT IF EXISTS labels_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.document_versions DROP CONSTRAINT IF EXISTS document_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.document_categories DROP CONSTRAINT IF EXISTS document_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.document_categories DROP CONSTRAINT IF EXISTS document_categories_kode_kategori_key;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_pkey;
DROP TABLE IF EXISTS public.webhook_config;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.task_labels;
DROP TABLE IF EXISTS public.task_commits;
DROP TABLE IF EXISTS public.task_comments;
DROP TABLE IF EXISTS public.sprints;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.project_watchers;
DROP TABLE IF EXISTS public.project_org_nodes;
DROP TABLE IF EXISTS public.project_org_edges;
DROP TABLE IF EXISTS public.project_members;
DROP TABLE IF EXISTS public.modules;
DROP TABLE IF EXISTS public.labels;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.document_versions;
DROP TABLE IF EXISTS public.document_categories;
DROP TABLE IF EXISTS public.activity_log;
DROP FUNCTION IF EXISTS public.trigger_set_updated_at();
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id_activity uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    id_task uuid,
    id_pengguna uuid,
    aksi character varying(50) NOT NULL,
    detail text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE activity_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.activity_log IS 'Log aktivitas project (audit trail)';


--
-- Name: COLUMN activity_log.id_pengguna; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_log.id_pengguna IS 'NULL untuk aksi otomatis (webhook, system)';


--
-- Name: COLUMN activity_log.aksi; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_log.aksi IS 'Jenis aksi: project_created, task_created, status_changed, committed, dll';


--
-- Name: document_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_categories (
    id_doc_category uuid DEFAULT gen_random_uuid() NOT NULL,
    nm_kategori character varying(100) NOT NULL,
    kode_kategori character varying(20) NOT NULL,
    icon character varying(50),
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_versions (
    id_version uuid DEFAULT gen_random_uuid() NOT NULL,
    id_document uuid NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    file_path character varying(500) NOT NULL,
    file_name character varying(300) NOT NULL,
    file_size bigint DEFAULT 0,
    mime_type character varying(100),
    catatan text,
    id_uploader uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id_document uuid DEFAULT gen_random_uuid() NOT NULL,
    id_project uuid NOT NULL,
    id_doc_category uuid NOT NULL,
    id_task uuid,
    nm_dokumen character varying(300) NOT NULL,
    nomor_dokumen character varying(100),
    tgl_dokumen date,
    tgl_berlaku date,
    tgl_berakhir date,
    deskripsi text,
    file_path character varying(500) NOT NULL,
    file_name character varying(300) NOT NULL,
    file_size bigint DEFAULT 0,
    mime_type character varying(100),
    status character varying(20) DEFAULT 'active'::character varying,
    id_uploader uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    soft_delete boolean DEFAULT false,
    version_number integer DEFAULT 1
);


--
-- Name: labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.labels (
    id_label uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    nm_label character varying(100) NOT NULL,
    warna character varying(7) DEFAULT '#6B7280'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE labels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.labels IS 'Label/tag kustom per project';


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id_module uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    nm_module character varying(200) NOT NULL,
    deskripsi text,
    status character varying(20) DEFAULT 'backlog'::character varying NOT NULL,
    urutan integer DEFAULT 0 NOT NULL,
    warna character varying(7),
    tgl_mulai date,
    tgl_target date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    soft_delete boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE modules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.modules IS 'Modul/epic dalam project';


--
-- Name: COLUMN modules.urutan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modules.urutan IS 'Urutan tampil modul';


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    id_member uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    id_pengguna uuid NOT NULL,
    nm_pengguna character varying(200),
    role character varying(30) DEFAULT 'member'::character varying,
    added_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    soft_delete boolean DEFAULT false
);


--
-- Name: project_org_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_org_edges (
    id_edge uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    id_node_from uuid NOT NULL,
    id_node_to uuid NOT NULL,
    label character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_org_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_org_nodes (
    id_node uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    id_pengguna uuid,
    id_sdm uuid,
    nm_display character varying(200) NOT NULL,
    jabatan character varying(200),
    foto_url character varying(500),
    urutan integer DEFAULT 0,
    warna character varying(10),
    pos_x double precision DEFAULT 0,
    pos_y double precision DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    soft_delete boolean DEFAULT false
);


--
-- Name: project_watchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_watchers (
    id_watcher uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    id_pengguna uuid NOT NULL,
    id_sdm uuid,
    nm_pengguna character varying(200),
    jabatan character varying(200),
    nm_unit character varying(200),
    tipe_akses character varying(20) DEFAULT 'viewer'::character varying,
    added_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    soft_delete boolean DEFAULT false
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id_project uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    kode_project character varying(20) NOT NULL,
    nm_project character varying(200) NOT NULL,
    deskripsi text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    repo_url character varying(500),
    repo_provider character varying(20) DEFAULT 'bitbucket'::character varying,
    warna character varying(7),
    tgl_mulai date,
    tgl_target date,
    id_owner uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    soft_delete boolean DEFAULT false NOT NULL,
    id_unit character varying(50),
    nm_unit character varying(200),
    visibility character varying(20) DEFAULT 'private'::character varying
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Data project utama';


--
-- Name: COLUMN projects.kode_project; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.kode_project IS 'Kode singkat project, misal: MYUNILA, SIAKAD';


--
-- Name: COLUMN projects.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.status IS 'Status project: active, archived, completed';


--
-- Name: COLUMN projects.repo_provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.repo_provider IS 'Provider git: bitbucket, github, gitlab';


--
-- Name: COLUMN projects.id_owner; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.id_owner IS 'UUID penanggung jawab project (ref ke auth-service pengguna)';


--
-- Name: sprints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprints (
    id_sprint uuid DEFAULT gen_random_uuid() NOT NULL,
    id_project uuid NOT NULL,
    nm_sprint character varying(200) NOT NULL,
    deskripsi text,
    tgl_mulai date,
    tgl_selesai date,
    status character varying(20) DEFAULT 'planned'::character varying,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    soft_delete boolean DEFAULT false,
    CONSTRAINT sprints_status_check CHECK (((status)::text = ANY ((ARRAY['planned'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_comments (
    id_comment uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_task uuid NOT NULL,
    id_pengguna uuid,
    konten text NOT NULL,
    tipe character varying(20) DEFAULT 'comment'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    soft_delete boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE task_comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.task_comments IS 'Komentar/diskusi pada task';


--
-- Name: COLUMN task_comments.tipe; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.task_comments.tipe IS 'Tipe: comment (user), note (internal), system (auto-generated)';


--
-- Name: task_commits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_commits (
    id_task_commit uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_task uuid,
    id_project uuid NOT NULL,
    commit_hash character varying(40) NOT NULL,
    commit_hash_short character varying(12) NOT NULL,
    commit_message character varying(500),
    author_name character varying(200),
    author_email character varying(200),
    branch character varying(200),
    commit_url character varying(500),
    committed_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE task_commits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.task_commits IS 'Link commit git ke task (via Bitbucket webhook)';


--
-- Name: COLUMN task_commits.id_task; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.task_commits.id_task IS 'NULL jika commit tidak terhubung ke task manapun';


--
-- Name: COLUMN task_commits.commit_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.task_commits.commit_url IS 'Direct link ke halaman commit di Bitbucket/GitHub';


--
-- Name: task_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_labels (
    id_task uuid NOT NULL,
    id_label uuid NOT NULL
);


--
-- Name: TABLE task_labels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.task_labels IS 'Relasi many-to-many task ↔ label';


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id_task uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_module uuid NOT NULL,
    id_project uuid NOT NULL,
    kode_task character varying(20) NOT NULL,
    nomor_task integer NOT NULL,
    judul character varying(500) NOT NULL,
    deskripsi text,
    tipe character varying(20) DEFAULT 'feature'::character varying NOT NULL,
    prioritas character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    status character varying(20) DEFAULT 'backlog'::character varying NOT NULL,
    id_assignee uuid,
    id_reporter uuid,
    tgl_mulai date,
    tgl_target date,
    tgl_selesai date,
    progress integer DEFAULT 0 NOT NULL,
    estimasi_jam numeric(5,1),
    actual_jam numeric(5,1),
    tags character varying(500),
    urutan integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    soft_delete boolean DEFAULT false NOT NULL,
    id_sprint uuid,
    CONSTRAINT tasks_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tasks IS 'Task/issue individual (seperti Jira issue)';


--
-- Name: COLUMN tasks.kode_task; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.kode_task IS 'Kode unik task, format: KODE_PROJECT-NOMOR';


--
-- Name: COLUMN tasks.nomor_task; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.nomor_task IS 'Nomor urut task dalam project (auto-increment)';


--
-- Name: COLUMN tasks.tipe; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.tipe IS 'Tipe task: feature, bugfix, improvement, chore, documentation';


--
-- Name: COLUMN tasks.prioritas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.prioritas IS 'Priority: urgent, high, medium, low';


--
-- Name: COLUMN tasks.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.status IS 'Kanban status: backlog, todo, in_progress, review, done, cancelled';


--
-- Name: COLUMN tasks.id_assignee; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.id_assignee IS 'UUID pengguna yang ditugaskan (ref ke auth-service)';


--
-- Name: COLUMN tasks.id_reporter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.id_reporter IS 'UUID pengguna yang membuat task (ref ke auth-service)';


--
-- Name: COLUMN tasks.urutan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.urutan IS 'Urutan posisi dalam kanban column (drag & drop ordering)';


--
-- Name: webhook_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_config (
    id_webhook uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_project uuid NOT NULL,
    provider character varying(20) DEFAULT 'bitbucket'::character varying NOT NULL,
    webhook_secret character varying(200) NOT NULL,
    repo_full_name character varying(200) NOT NULL,
    a_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE webhook_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.webhook_config IS 'Konfigurasi webhook integrasi git repository';


--
-- Name: COLUMN webhook_config.webhook_secret; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.webhook_config.webhook_secret IS 'Secret untuk verifikasi signature webhook';


--
-- Name: COLUMN webhook_config.repo_full_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.webhook_config.repo_full_name IS 'Nama lengkap repo, format: mahendraunila/my-unila';


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id_activity);


--
-- Name: document_categories document_categories_kode_kategori_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_kode_kategori_key UNIQUE (kode_kategori);


--
-- Name: document_categories document_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id_doc_category);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id_version);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id_document);


--
-- Name: labels labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.labels
    ADD CONSTRAINT labels_pkey PRIMARY KEY (id_label);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id_module);


--
-- Name: project_members project_members_id_project_id_pengguna_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_id_project_id_pengguna_key UNIQUE (id_project, id_pengguna);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id_member);


--
-- Name: project_org_edges project_org_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_edges
    ADD CONSTRAINT project_org_edges_pkey PRIMARY KEY (id_edge);


--
-- Name: project_org_nodes project_org_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_nodes
    ADD CONSTRAINT project_org_nodes_pkey PRIMARY KEY (id_node);


--
-- Name: project_watchers project_watchers_id_project_id_pengguna_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_watchers
    ADD CONSTRAINT project_watchers_id_project_id_pengguna_key UNIQUE (id_project, id_pengguna);


--
-- Name: project_watchers project_watchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_watchers
    ADD CONSTRAINT project_watchers_pkey PRIMARY KEY (id_watcher);


--
-- Name: projects projects_kode_project_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_kode_project_key UNIQUE (kode_project);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id_project);


--
-- Name: sprints sprints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_pkey PRIMARY KEY (id_sprint);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id_comment);


--
-- Name: task_commits task_commits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_commits
    ADD CONSTRAINT task_commits_pkey PRIMARY KEY (id_task_commit);


--
-- Name: task_labels task_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_labels
    ADD CONSTRAINT task_labels_pkey PRIMARY KEY (id_task, id_label);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id_task);


--
-- Name: webhook_config webhook_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_config
    ADD CONSTRAINT webhook_config_pkey PRIMARY KEY (id_webhook);


--
-- Name: idx_activity_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_project ON public.activity_log USING btree (id_project, created_at DESC);


--
-- Name: idx_activity_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_task ON public.activity_log USING btree (id_task) WHERE (id_task IS NOT NULL);


--
-- Name: idx_doc_versions_document; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_versions_document ON public.document_versions USING btree (id_document);


--
-- Name: idx_labels_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_labels_project ON public.labels USING btree (id_project);


--
-- Name: idx_modules_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modules_project ON public.modules USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_modules_urutan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modules_urutan ON public.modules USING btree (id_project, urutan) WHERE (soft_delete = false);


--
-- Name: idx_project_members_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_members_project ON public.project_members USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_project_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_members_user ON public.project_members USING btree (id_pengguna) WHERE (soft_delete = false);


--
-- Name: idx_project_org_nodes_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_org_nodes_project ON public.project_org_nodes USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_project_watchers_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_watchers_project ON public.project_watchers USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_project_watchers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_watchers_user ON public.project_watchers USING btree (id_pengguna) WHERE (soft_delete = false);


--
-- Name: idx_projects_kode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_kode ON public.projects USING btree (kode_project);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status) WHERE (soft_delete = false);


--
-- Name: idx_projects_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_visibility ON public.projects USING btree (visibility) WHERE (soft_delete = false);


--
-- Name: idx_sprints_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sprints_project ON public.sprints USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_task_comments_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_comments_task ON public.task_comments USING btree (id_task) WHERE (soft_delete = false);


--
-- Name: idx_task_commits_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_commits_hash ON public.task_commits USING btree (commit_hash);


--
-- Name: idx_task_commits_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_commits_project ON public.task_commits USING btree (id_project);


--
-- Name: idx_task_commits_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_commits_task ON public.task_commits USING btree (id_task);


--
-- Name: idx_tasks_assignee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (id_assignee) WHERE ((soft_delete = false) AND (id_assignee IS NOT NULL));


--
-- Name: idx_tasks_kode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_kode ON public.tasks USING btree (kode_task);


--
-- Name: idx_tasks_module; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_module ON public.tasks USING btree (id_module) WHERE (soft_delete = false);


--
-- Name: idx_tasks_prioritas; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_prioritas ON public.tasks USING btree (id_project, prioritas) WHERE (soft_delete = false);


--
-- Name: idx_tasks_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_project ON public.tasks USING btree (id_project) WHERE (soft_delete = false);


--
-- Name: idx_tasks_sprint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_sprint ON public.tasks USING btree (id_sprint) WHERE (id_sprint IS NOT NULL);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (id_project, status) WHERE (soft_delete = false);


--
-- Name: idx_tasks_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_target ON public.tasks USING btree (tgl_target) WHERE ((soft_delete = false) AND ((status)::text <> ALL ((ARRAY['done'::character varying, 'cancelled'::character varying])::text[])));


--
-- Name: idx_webhook_repo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_repo ON public.webhook_config USING btree (repo_full_name) WHERE (a_active = true);


--
-- Name: modules set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: projects set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: task_comments set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: tasks set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: activity_log activity_log_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: activity_log activity_log_id_task_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_id_task_fkey FOREIGN KEY (id_task) REFERENCES public.tasks(id_task) ON DELETE SET NULL;


--
-- Name: document_versions document_versions_id_document_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_id_document_fkey FOREIGN KEY (id_document) REFERENCES public.documents(id_document);


--
-- Name: documents documents_id_doc_category_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_id_doc_category_fkey FOREIGN KEY (id_doc_category) REFERENCES public.document_categories(id_doc_category);


--
-- Name: documents documents_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project);


--
-- Name: documents documents_id_task_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_id_task_fkey FOREIGN KEY (id_task) REFERENCES public.tasks(id_task);


--
-- Name: labels labels_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.labels
    ADD CONSTRAINT labels_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: modules modules_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: project_members project_members_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: project_org_edges project_org_edges_id_node_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_edges
    ADD CONSTRAINT project_org_edges_id_node_from_fkey FOREIGN KEY (id_node_from) REFERENCES public.project_org_nodes(id_node) ON DELETE CASCADE;


--
-- Name: project_org_edges project_org_edges_id_node_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_edges
    ADD CONSTRAINT project_org_edges_id_node_to_fkey FOREIGN KEY (id_node_to) REFERENCES public.project_org_nodes(id_node) ON DELETE CASCADE;


--
-- Name: project_org_edges project_org_edges_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_edges
    ADD CONSTRAINT project_org_edges_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: project_org_nodes project_org_nodes_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_org_nodes
    ADD CONSTRAINT project_org_nodes_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: project_watchers project_watchers_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_watchers
    ADD CONSTRAINT project_watchers_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: sprints sprints_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project);


--
-- Name: task_comments task_comments_id_task_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_id_task_fkey FOREIGN KEY (id_task) REFERENCES public.tasks(id_task) ON DELETE CASCADE;


--
-- Name: task_commits task_commits_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_commits
    ADD CONSTRAINT task_commits_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: task_commits task_commits_id_task_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_commits
    ADD CONSTRAINT task_commits_id_task_fkey FOREIGN KEY (id_task) REFERENCES public.tasks(id_task) ON DELETE SET NULL;


--
-- Name: task_labels task_labels_id_label_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_labels
    ADD CONSTRAINT task_labels_id_label_fkey FOREIGN KEY (id_label) REFERENCES public.labels(id_label) ON DELETE CASCADE;


--
-- Name: task_labels task_labels_id_task_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_labels
    ADD CONSTRAINT task_labels_id_task_fkey FOREIGN KEY (id_task) REFERENCES public.tasks(id_task) ON DELETE CASCADE;


--
-- Name: tasks tasks_id_module_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_id_module_fkey FOREIGN KEY (id_module) REFERENCES public.modules(id_module) ON DELETE CASCADE;


--
-- Name: tasks tasks_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- Name: tasks tasks_id_sprint_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_id_sprint_fkey FOREIGN KEY (id_sprint) REFERENCES public.sprints(id_sprint);


--
-- Name: webhook_config webhook_config_id_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_config
    ADD CONSTRAINT webhook_config_id_project_fkey FOREIGN KEY (id_project) REFERENCES public.projects(id_project) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fuWGRfwAgeR6oEWItoVQfPSaPhXuQGeZl1BzWX2fNcYg7gBjeg0evfuKN47pnO3

