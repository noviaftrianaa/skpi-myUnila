-- =====================================================
-- myUnila Survey System - SQL Server Migration
-- Schema: survey
-- Description: Flexible survey system with multi-survey support
-- Created: 2025-01-24
-- =====================================================

-- Create Schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'survey')
BEGIN
    EXEC('CREATE SCHEMA survey');
END
GO

-- =====================================================
-- Table 1: survey.surveys (Master Survey)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'surveys' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.surveys (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        uuid UNIQUEIDENTIFIER DEFAULT NEWID() UNIQUE NOT NULL,

        -- Survey Info
        title NVARCHAR(500) NOT NULL,
        description NVARCHAR(MAX),
        slug NVARCHAR(200) UNIQUE NOT NULL,

        -- Status & Visibility
        is_active BIT DEFAULT 1 NOT NULL,
        is_published BIT DEFAULT 0 NOT NULL,
        allow_anonymous BIT DEFAULT 1 NOT NULL,
        allow_multiple_submissions BIT DEFAULT 0 NOT NULL,

        -- Period
        start_date DATETIME2,
        end_date DATETIME2,

        -- Settings (JSON for flexibility)
        settings NVARCHAR(MAX) CHECK (ISJSON(settings) = 1),
        -- Example settings: {"show_progress": true, "require_login": false, "thank_you_message": "..."}

        -- Metadata
        created_by BIGINT,
        created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        deleted_at DATETIME2,

        INDEX IX_surveys_slug (slug),
        INDEX IX_surveys_active (is_active, is_published) WHERE deleted_at IS NULL,
        INDEX IX_surveys_dates (start_date, end_date) WHERE is_active = 1
    );
END
GO

-- =====================================================
-- Table 2: survey.questions (Bank Pertanyaan)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'questions' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.questions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        uuid UNIQUEIDENTIFIER DEFAULT NEWID() UNIQUE NOT NULL,
        survey_id BIGINT NOT NULL FOREIGN KEY REFERENCES survey.surveys(id) ON DELETE CASCADE,

        -- Question Info
        question_code NVARCHAR(50) NOT NULL, -- 'A1', 'B2', 'C3', etc
        question_text NVARCHAR(MAX) NOT NULL,
        description NVARCHAR(MAX), -- Helper text / subtitle

        -- Question Type
        question_type NVARCHAR(50) NOT NULL,
        -- Types: 'text', 'textarea', 'radio', 'checkbox', 'select', 'scale', 'matrix', 'file'

        -- Options (JSON for flexibility)
        options NVARCHAR(MAX) CHECK (ISJSON(options) = 1),
        -- Example: ["Option 1", "Option 2"] or [{"value": "opt1", "label": "Option 1", "emoji": "😊"}]

        -- Validation Rules (JSON)
        validation_rules NVARCHAR(MAX) CHECK (ISJSON(validation_rules) = 1),
        -- Example: {"required": true, "min": 1, "max": 3, "pattern": "^[0-9]+$"}

        -- Display Settings
        section NVARCHAR(100), -- 'A. Identitas', 'B. Kondisi Saat Ini', etc
        order_number INT NOT NULL,
        is_required BIT DEFAULT 0 NOT NULL,

        -- Conditional Logic (JSON)
        conditional_logic NVARCHAR(MAX) CHECK (ISJSON(conditional_logic) = 1),
        -- Example: {"show_if": {"question_id": 5, "answer": "Ya"}}

        -- Metadata
        created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        deleted_at DATETIME2,

        INDEX IX_questions_survey (survey_id, order_number) WHERE deleted_at IS NULL,
        INDEX IX_questions_code (survey_id, question_code),
        INDEX IX_questions_section (survey_id, section, order_number)
    );
END
GO

-- =====================================================
-- Table 3: survey.responses (Jawaban Survey)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'responses' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.responses (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        uuid UNIQUEIDENTIFIER DEFAULT NEWID() UNIQUE NOT NULL,
        survey_id BIGINT NOT NULL FOREIGN KEY REFERENCES survey.surveys(id),

        -- Responder Info (Normalized untuk quick filter/analytics)
        responder_status NVARCHAR(100), -- 'Dosen', 'Mahasiswa', etc
        responder_unit NVARCHAR(200), -- Fakultas/Unit
        responder_name NVARCHAR(200),
        responder_contact NVARCHAR(200),

        -- Full Response Data (JSON)
        response_data NVARCHAR(MAX) CHECK (ISJSON(response_data) = 1) NOT NULL,
        -- Store complete survey response as JSON for flexibility

        -- Submission Info
        submitted_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        submission_ip NVARCHAR(45), -- IPv6 support
        user_agent NVARCHAR(500),
        session_id NVARCHAR(100),
        completion_time_seconds INT, -- Time taken to complete

        -- User Association (if logged in)
        user_id BIGINT,
        user_type NVARCHAR(50), -- 'dosen', 'mahasiswa', 'staff', etc

        -- Status
        is_complete BIT DEFAULT 1 NOT NULL,
        is_draft BIT DEFAULT 0 NOT NULL,

        -- Metadata
        created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        deleted_at DATETIME2,

        INDEX IX_responses_survey (survey_id, submitted_at DESC) WHERE deleted_at IS NULL,
        INDEX IX_responses_status (responder_status) INCLUDE (responder_unit),
        INDEX IX_responses_submitted (submitted_at DESC),
        INDEX IX_responses_user (user_id, survey_id) WHERE user_id IS NOT NULL
    );
END
GO

-- =====================================================
-- Table 4: survey.answers (Parsed Individual Answers)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'answers' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.answers (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        response_id BIGINT NOT NULL FOREIGN KEY REFERENCES survey.responses(id) ON DELETE CASCADE,
        question_id BIGINT NOT NULL FOREIGN KEY REFERENCES survey.questions(id),

        -- Answer Data
        answer_text NVARCHAR(MAX), -- For text/textarea
        answer_value NVARCHAR(500), -- For radio/select single value
        answer_values NVARCHAR(MAX), -- For checkbox multiple values (JSON array)
        answer_numeric DECIMAL(18,4), -- For numeric/scale answers

        -- For Matrix/Table Questions
        matrix_row NVARCHAR(200), -- e.g., "freq_dosen"
        matrix_column NVARCHAR(200), -- e.g., "Sangat Sering"

        -- Metadata
        created_at DATETIME2 DEFAULT GETDATE() NOT NULL,

        INDEX IX_answers_response (response_id, question_id),
        INDEX IX_answers_question (question_id) INCLUDE (answer_value),
        INDEX IX_answers_matrix (question_id, matrix_row, matrix_column)
    );
END
GO

-- =====================================================
-- Table 5: survey.analytics_cache (Cache untuk Dashboard)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'analytics_cache' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.analytics_cache (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        survey_id BIGINT NOT NULL FOREIGN KEY REFERENCES survey.surveys(id),

        -- Cache Key
        cache_key NVARCHAR(200) NOT NULL, -- e.g., "total_responses", "by_status", "top_kendala"
        cache_data NVARCHAR(MAX) NOT NULL, -- JSON result

        -- Cache Metadata
        calculated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        expires_at DATETIME2 NOT NULL,
        is_valid BIT DEFAULT 1 NOT NULL,

        INDEX IX_cache_survey_key (survey_id, cache_key, expires_at) WHERE is_valid = 1,
        UNIQUE (survey_id, cache_key)
    );
END
GO

-- =====================================================
-- Table 6: survey.audit_logs (Audit Trail)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs' AND schema_id = SCHEMA_ID('survey'))
BEGIN
    CREATE TABLE survey.audit_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,

        -- Entity
        entity_type NVARCHAR(50) NOT NULL, -- 'survey', 'question', 'response'
        entity_id BIGINT NOT NULL,

        -- Action
        action NVARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'published'
        changes NVARCHAR(MAX), -- JSON of before/after values

        -- Actor
        user_id BIGINT,
        user_type NVARCHAR(50),
        ip_address NVARCHAR(45),

        -- Timestamp
        created_at DATETIME2 DEFAULT GETDATE() NOT NULL,

        INDEX IX_audit_entity (entity_type, entity_id, created_at DESC),
        INDEX IX_audit_user (user_id, created_at DESC)
    );
END
GO

-- =====================================================
-- Create Views for Easy Querying
-- =====================================================

-- View: Survey Statistics
IF OBJECT_ID('survey.vw_survey_statistics', 'V') IS NOT NULL
    DROP VIEW survey.vw_survey_statistics;
GO

CREATE VIEW survey.vw_survey_statistics AS
SELECT
    s.id as survey_id,
    s.uuid as survey_uuid,
    s.title as survey_title,
    s.slug,
    s.is_active,
    s.is_published,
    COUNT(DISTINCT r.id) as total_responses,
    COUNT(DISTINCT CASE WHEN r.is_complete = 1 THEN r.id END) as completed_responses,
    COUNT(DISTINCT CASE WHEN r.is_draft = 1 THEN r.id END) as draft_responses,
    AVG(CAST(r.completion_time_seconds AS FLOAT)) as avg_completion_time,
    MIN(r.submitted_at) as first_response_at,
    MAX(r.submitted_at) as last_response_at
FROM survey.surveys s
LEFT JOIN survey.responses r ON r.survey_id = s.id AND r.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.uuid, s.title, s.slug, s.is_active, s.is_published;
GO

-- View: Response Summary (for dashboard)
IF OBJECT_ID('survey.vw_response_summary', 'V') IS NOT NULL
    DROP VIEW survey.vw_response_summary;
GO

CREATE VIEW survey.vw_response_summary AS
SELECT
    r.id as response_id,
    r.uuid as response_uuid,
    s.title as survey_title,
    r.responder_status,
    r.responder_unit,
    r.responder_name,
    r.submitted_at,
    r.completion_time_seconds,
    r.is_complete,
    COUNT(DISTINCT a.id) as total_answers
FROM survey.responses r
INNER JOIN survey.surveys s ON s.id = r.survey_id
LEFT JOIN survey.answers a ON a.response_id = r.id
WHERE r.deleted_at IS NULL AND s.deleted_at IS NULL
GROUP BY r.id, r.uuid, s.title, r.responder_status, r.responder_unit,
         r.responder_name, r.submitted_at, r.completion_time_seconds, r.is_complete;
GO

-- =====================================================
-- Insert Default Data
-- =====================================================

PRINT '✅ Survey schema created successfully!';
PRINT '📊 Tables: surveys, questions, responses, answers, analytics_cache, audit_logs';
PRINT '📈 Views: vw_survey_statistics, vw_response_summary';
GO
