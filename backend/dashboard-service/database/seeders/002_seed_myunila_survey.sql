-- =====================================================
-- myUnila Survey Seeder
-- Seed data untuk survey "Kepuasan & Kebutuhan myUnila"
-- =====================================================

USE [your_database_name]; -- Sesuaikan dengan nama database Anda
GO

DECLARE @surveyId BIGINT;

-- =====================================================
-- 1. Create Survey
-- =====================================================
INSERT INTO survey.surveys (
    title,
    description,
    slug,
    is_active,
    is_published,
    allow_anonymous,
    allow_multiple_submissions,
    start_date,
    settings
)
VALUES (
    N'Survey Kepuasan & Kebutuhan myUnila',
    N'Mari bersama kita ciptakan sistem informasi yang lebih baik! Butuh 10-12 menit saja 😊',
    'myunila-kepuasan-kebutuhan-2025',
    1, -- is_active
    1, -- is_published
    1, -- allow_anonymous
    0, -- allow_multiple_submissions
    GETDATE(), -- start_date
    N'{"show_progress": true, "require_login": false, "thank_you_message": "Partisipasi Anda sangat berarti untuk pengembangan myUnila!", "estimated_time": "10-12 menit"}'
);

SET @surveyId = SCOPE_IDENTITY();
PRINT '✅ Survey created with ID: ' + CAST(@surveyId AS NVARCHAR(10));

-- =====================================================
-- 2. Insert Questions
-- =====================================================

-- SECTION A: IDENTITAS RESPONDEN (3 questions)
-- -----------------------------------------------------

-- A1. Status Anda
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'A1',
    N'Status Anda',
    N'Ceritakan sedikit tentang diri Anda',
    'radio',
    N'["Dosen", "Mahasiswa", "Staf Administrasi", "Pimpinan / Manajerial"]',
    N'{"required": true, "allow_other": true, "other_field": "status_lainnya"}',
    'A. Identitas',
    1,
    1
);

-- A2. Unit/Fakultas/Jurusan
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'A2',
    N'Unit/Fakultas/Jurusan',
    NULL,
    'text',
    N'{"required": true, "placeholder": "Contoh: Fakultas Teknik / Jurusan Informatika"}',
    'A. Identitas',
    2,
    1
);

-- A3. Lama bekerja/belajar di kampus
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'A3',
    N'Lama bekerja/belajar di kampus',
    NULL,
    'radio',
    N'["< 1 tahun", "1–3 tahun", "3–5 tahun", "> 5 tahun"]',
    N'{"required": true}',
    'A. Identitas',
    3,
    1
);

-- SECTION B: KONDISI SAAT INI (3 questions)
-- -----------------------------------------------------

-- B4. Apakah Anda menggunakan beberapa sistem berbeda?
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'B4',
    N'Apakah Anda menggunakan beberapa sistem berbeda?',
    N'Bagaimana pengalaman Anda dengan sistem yang ada?',
    'radio',
    N'["Ya", "Tidak"]',
    N'{"required": true, "conditional_question": {"if_yes": "B4_detail"}}',
    'B. Kondisi Saat Ini',
    4,
    1
);

-- B4_detail. Sebutkan sistem yang sering Anda gunakan (conditional)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, conditional_logic, section, order_number, is_required)
VALUES (
    @surveyId,
    'B4_detail',
    N'Sebutkan sistem yang sering Anda gunakan',
    NULL,
    'textarea',
    N'{"rows": 3, "placeholder": "Contoh: Siakadu, SISTER, SIMPONILA, dll."}',
    N'{"show_if": {"question_code": "B4", "answer": "Ya"}}',
    'B. Kondisi Saat Ini',
    5,
    0
);

-- B5. Seberapa sering Anda mengakses jenis data berikut (MATRIX TABLE)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'B5',
    N'Seberapa sering Anda mengakses jenis data berikut dalam pekerjaan/aktivitas Anda?',
    N'💡 Pilih tingkat frekuensi untuk setiap jenis data',
    'matrix',
    N'{
        "rows": [
            {"key": "freq_dosen", "label": "Data Dosen"},
            {"key": "freq_mahasiswa", "label": "Data Mahasiswa"},
            {"key": "freq_staf", "label": "Data Staf"},
            {"key": "freq_akademik", "label": "Data Akademik (jadwal, KRS, nilai, dll.)"},
            {"key": "freq_tridarma", "label": "Data Tridarma (penelitian, publikasi, pengabdian)"}
        ],
        "columns": ["Tidak Pernah", "Jarang", "Kadang", "Sering", "Sangat Sering"]
    }',
    N'{"required": true, "type": "radio_per_row"}',
    'B. Kondisi Saat Ini',
    6,
    1
);

-- B6. Apa kendala utama?
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'B6',
    N'Apa kendala utama? (pilih yang sesuai)',
    NULL,
    'checkbox',
    N'[
        {"text": "Data tidak terhubung antar sistem", "emoji": "🔗"},
        {"text": "Penginputan data berulang", "emoji": "🔄"},
        {"text": "Kesulitan mencari data", "emoji": "🔍"},
        {"text": "Tampilan tidak intuitif", "emoji": "🎨"},
        {"text": "Akses lambat / error", "emoji": "🐌"},
        {"text": "Kurang pelatihan", "emoji": "📚"},
        {"text": "Hak akses membingungkan", "emoji": "🔐"}
    ]',
    N'{"allow_other": true, "other_field": "kendala_lainnya"}',
    'B. Kondisi Saat Ini',
    7,
    0
);

-- SECTION C: KEBUTUHAN FITUR (3 questions)
-- -----------------------------------------------------

-- C7. Pilih fitur yang Anda anggap penting
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'C7',
    N'Pilih fitur yang Anda anggap penting',
    N'Fitur apa yang Anda butuhkan?',
    'checkbox',
    N'[
        {"text": "Dashboard ringkasan", "emoji": "📊"},
        {"text": "Integrasi data akademik", "emoji": "🎓"},
        {"text": "Rekam jejak tridarma", "emoji": "📝"},
        {"text": "Laporan otomatis (PDF/Excel)", "emoji": "📄"},
        {"text": "Pencarian cepat", "emoji": "🔍"},
        {"text": "Notifikasi otomatis", "emoji": "🔔"},
        {"text": "Upload dokumen", "emoji": "📁"},
        {"text": "Manajemen alumni", "emoji": "👥"},
        {"text": "API integrasi eksternal", "emoji": "🔌"},
        {"text": "Hak akses berbasis peran", "emoji": "🔐"},
        {"text": "Audit log", "emoji": "📋"},
        {"text": "Backup otomatis", "emoji": "💾"}
    ]',
    N'{"allow_other": true, "other_field": "fitur_lainnya"}',
    'C. Kebutuhan Fitur',
    8,
    0
);

-- C8. Modul mana yang paling penting? (opsional)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'C8',
    N'Modul mana yang paling penting? (opsional)',
    NULL,
    'textarea',
    N'{"rows": 3, "placeholder": "Ceritakan modul prioritas Anda..."}',
    'C. Kebutuhan Fitur',
    9,
    0
);

-- C9. Siapa yang perlu akses ke data ini?
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'C9',
    N'Siapa yang perlu akses ke data ini? (centang semua yang berlaku)',
    NULL,
    'checkbox',
    N'[
        {"text": "Dosen", "emoji": "👨‍🏫"},
        {"text": "Mahasiswa", "emoji": "🎓"},
        {"text": "Staf administrasi", "emoji": "👔"},
        {"text": "Pimpinan", "emoji": "👨‍💼"},
        {"text": "Alumni", "emoji": "🎖️"}
    ]',
    N'{"allow_other": true, "other_field": "akses_lainnya"}',
    'C. Kebutuhan Fitur',
    10,
    0
);

-- SECTION D: HARAPAN (4 questions)
-- -----------------------------------------------------

-- D10. Pilih 3 harapan terpenting Anda
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'D10',
    N'Pilih 3 harapan terpenting Anda',
    N'Apa yang Anda harapkan dari myUnila?',
    'checkbox',
    N'[
        "Akses data lintas unit",
        "Data akurat real-time",
        "Kurangi duplikasi input",
        "Efisiensi kerja lebih baik",
        "Visualisasi data mudah dipahami",
        "Integrasi SISTER/PDDikti",
        "Keamanan data tinggi",
        "Akses dari mana saja"
    ]',
    N'{"required": true, "max": 3, "min": 3}',
    'D. Harapan',
    11,
    1
);

-- D11. Harapan lainnya (opsional)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'D11',
    N'Harapan lainnya (opsional)',
    NULL,
    'textarea',
    N'{"rows": 2, "placeholder": "Tuliskan harapan lainnya yang tidak tercantum di atas..."}',
    'D. Harapan',
    12,
    0
);

-- D12. Seberapa penting portal terpadu?
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'D12',
    N'Seberapa penting menurut Anda memiliki satu portal terpadu untuk seluruh data dan layanan UNILA?',
    N'💡 Berikan penilaian pentingnya integrasi sistem dalam satu portal',
    'scale',
    N'["Tidak Penting", "Kurang Penting", "Cukup Penting", "Penting", "Sangat Penting"]',
    N'{"required": true, "type": "likert", "stars": 5}',
    'D. Harapan',
    13,
    1
);

-- D13. Harapan UI/UX
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'D13',
    N'Harapan UI/UX',
    NULL,
    'radio',
    N'[
        {"text": "Sederhana & mudah", "icon": "🎯"},
        {"text": "Lengkap & canggih", "icon": "⚡"},
        {"text": "Interaktif & menarik", "icon": "🎨"},
        {"text": "Konsisten dengan sistem lain", "icon": "🔄"}
    ]',
    N'{"required": true}',
    'D. Harapan',
    14,
    1
);

-- SECTION E: SARAN & MASUKAN (3 questions)
-- -----------------------------------------------------

-- E14. Tantangan terbesar
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'E14',
    N'Tantangan terbesar dalam membangun sistem terintegrasi?',
    N'Ide Anda sangat berharga!',
    'textarea',
    N'{"rows": 4, "placeholder": "Bagikan pandangan Anda..."}',
    'E. Saran & Masukan',
    15,
    0
);

-- E15. Satu ide penting untuk myUnila
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'E15',
    N'Satu ide penting untuk myUnila?',
    NULL,
    'textarea',
    N'{"rows": 4, "placeholder": "Ide terbaik Anda..."}',
    'E. Saran & Masukan',
    16,
    0
);

-- E16. Ideal jumlah tim pengembang
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, options, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'E16',
    N'Menurut Anda, berapa ideal jumlah tim pengembang (developer, designer, tester, dll.) untuk mengembangkan dan maintain myUnila secara optimal?',
    N'💡 Berikan estimasi jumlah personel yang dibutuhkan untuk pengembangan berkelanjutan',
    'radio',
    N'["1-3 orang", "4-6 orang", "7-10 orang", "> 10 orang"]',
    N'{"info_text": "💼 Info: Tim saat ini terdiri dari developer, UI/UX designer, QA tester, dan DevOps engineer"}',
    'E. Saran & Masukan',
    17,
    0
);

-- SECTION F: KONTAK (2 questions - Optional)
-- -----------------------------------------------------

-- F17. Nama (opsional)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'F17',
    N'Nama',
    N'Jika ingin kami hubungi untuk diskusi lebih lanjut',
    'text',
    N'{"placeholder": "Nama lengkap Anda"}',
    'F. Kontak (Opsional)',
    18,
    0
);

-- F18. Email / HP (opsional)
INSERT INTO survey.questions (survey_id, question_code, question_text, description, question_type, validation_rules, section, order_number, is_required)
VALUES (
    @surveyId,
    'F18',
    N'Email / HP',
    NULL,
    'text',
    N'{"placeholder": "email@unila.ac.id", "type": "email"}',
    'F. Kontak (Opsional)',
    19,
    0
);

-- =====================================================
-- Verification
-- =====================================================
DECLARE @questionCount INT;
SELECT @questionCount = COUNT(*) FROM survey.questions WHERE survey_id = @surveyId;

PRINT '✅ Seeder completed successfully!';
PRINT '📊 Survey ID: ' + CAST(@surveyId AS NVARCHAR(10));
PRINT '❓ Total Questions: ' + CAST(@questionCount AS NVARCHAR(10));
PRINT '📝 Sections: A (3), B (4), C (3), D (4), E (3), F (2) = 19 questions total';

-- Display summary
SELECT
    section,
    COUNT(*) as question_count,
    STRING_AGG(question_code, ', ') as question_codes
FROM survey.questions
WHERE survey_id = @surveyId
GROUP BY section
ORDER BY MIN(order_number);

GO
