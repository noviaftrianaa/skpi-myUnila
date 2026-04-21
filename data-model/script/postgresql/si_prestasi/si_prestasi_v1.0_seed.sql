-- =====================================================
-- Script:  SI-Prestasi - Seed Referensi v1.0
-- Database: si_prestasi
-- Version: 1.0
-- Date:    2026-04-19
-- Description:
--   Seed semua tabel ref.* dengan enum SIMKATMAWA + mapping pdut.
--   Seed awal setting.api_config untuk SIMKATMAWA (kredensial diisi ops via UI).
--
--   Idempotent: pakai ON CONFLICT (kode_simkatmawa) DO NOTHING
--   supaya bisa re-apply tanpa error.
-- =====================================================

SET search_path TO ref, prestasi, sync, setting, log;


-- =====================================================
-- 1. ref.level_prestasi — Level SIMKATMAWA
-- =====================================================
-- 4 level: KAB/PROV/NAS/INT dengan mapping ke pdut.ref.tingkat_prestasi
-- (3=Kab/kota, 4=Propinsi, 5=Nasional, 6=Internasional)

INSERT INTO ref.level_prestasi
    (kode_simkatmawa, nm_level, id_tkt_prestasi_pdut, urutan, a_active, a_ref_simkatmawa, a_ref_pddikti)
VALUES
    ('KAB',  'Kabupaten/Kota',  3, 1, TRUE, TRUE, TRUE),
    ('PROV', 'Provinsi',        4, 2, TRUE, TRUE, TRUE),
    ('NAS',  'Nasional',        5, 3, TRUE, TRUE, TRUE),
    ('INT',  'Internasional',   6, 4, TRUE, TRUE, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 2. ref.kategori_prestasi — Kategori prestasi mandiri SIMKATMAWA
-- =====================================================
-- 5 kategori; mapping pdut best-effort (pdut hanya punya 4 jenis)

INSERT INTO ref.kategori_prestasi
    (kode_simkatmawa, nm_kategori, id_jenis_prestasi_pdut, urutan, a_active, a_ref_simkatmawa)
VALUES
    ('RISNOV',    'Riset dan Inovasi STEM',               1, 1, TRUE, TRUE),
    ('RISNOVSSH', 'Riset dan Inovasi SSH (Sosial, Seni, Humaniora)', 1, 2, TRUE, TRUE),
    ('SENBUD',    'Seni dan Budaya',                      2, 3, TRUE, TRUE),
    ('OLAHRAGA',  'Olahraga',                             3, 4, TRUE, TRUE),
    ('MINAT',     'Minat Khusus',                         9, 5, TRUE, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 3. ref.peringkat — Peringkat prestasi SIMKATMAWA
-- =====================================================
-- 8 kode; mapping peringkat_pdut asumsi (perlu konfirmasi via query distribusi
-- data di pdut.pdrd.prestasi — lihat docs/prestasi/13-pdut-reference-mapping.md §7)

INSERT INTO ref.peringkat
    (kode_simkatmawa, nm_peringkat, peringkat_pdut, urutan, nilai_bobot, a_active)
VALUES
    ('JUARA1',    'Juara 1',    1, 1, 10.00, TRUE),
    ('JUARA2',    'Juara 2',    2, 2,  8.00, TRUE),
    ('JUARA3',    'Juara 3',    3, 3,  6.00, TRUE),
    ('HARAPAN1',  'Harapan 1',  4, 4,  5.00, TRUE),
    ('HARAPAN2',  'Harapan 2',  5, 5,  4.00, TRUE),
    ('HARAPAN3',  'Harapan 3',  6, 6,  3.00, TRUE),
    ('APRESIASI', 'Apresiasi',  7, 7,  2.00, TRUE),
    ('PESERTA',   'Peserta',    8, 8,  1.00, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 4. ref.kelompok_prestasi — INDIVIDU / KELOMPOK
-- =====================================================

INSERT INTO ref.kelompok_prestasi
    (kode_simkatmawa, nm_kelompok, urutan, a_active)
VALUES
    ('INDIVIDU', 'Individu', 1, TRUE),
    ('KELOMPOK', 'Kelompok', 2, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 5. ref.bentuk_pelaksanaan — DARING / LURING
-- =====================================================

INSERT INTO ref.bentuk_pelaksanaan
    (kode_simkatmawa, nm_bentuk, urutan, a_active)
VALUES
    ('LURING', 'Luring (Offline)', 1, TRUE),
    ('DARING', 'Daring (Online)',  2, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 6. ref.jenis_rekognisi — 14 jenis rekognisi SIMKATMAWA
-- =====================================================

INSERT INTO ref.jenis_rekognisi
    (kode_simkatmawa, nm_jenis, urutan, a_active)
VALUES
    ('SERKOM',  'Sertifikat Kompetensi',                                        1,  TRUE),
    ('JURIOR',  'Juri/Pelatih/Wasit Olahraga',                                  2,  TRUE),
    ('JURINOR', 'Juri/Pelatih/Wasit Non Olahraga',                              3,  TRUE),
    ('KEYCONF', 'Keynote Speaker Conference',                                   4,  TRUE),
    ('KEYWORK', 'Keynote Speaker Workshop/Pelatihan/Bimbingan Teknis',          5,  TRUE),
    ('PAMERAN', 'Pameran Karya Seni',                                           6,  TRUE),
    ('KARYA',   'Karya Cipta Lagu dan/atau Seni Tari',                          7,  TRUE),
    ('BUKU',    'Penulis Buku',                                                 8,  TRUE),
    ('PATEN',   'Paten / Paten Sederhana',                                      9,  TRUE),
    ('PUB',     'Publikasi Artikel Ilmiah',                                     10, TRUE),
    ('DUTA',    'Duta (Brand Ambassador)',                                      11, TRUE),
    ('PTG',     'Produk Teknologi Tepat Guna',                                  12, TRUE),
    ('PSB',     'Produk Seni dan Budaya',                                       13, TRUE),
    ('PKD',     'Produk Kreatif Dunia Usaha dan Industri',                      14, TRUE)
ON CONFLICT (kode_simkatmawa) DO NOTHING;


-- =====================================================
-- 7. ref.tipe_sync — Enum tipe laporan + path API SIMKATMAWA
-- =====================================================

INSERT INTO ref.tipe_sync
    (kode, nm_tipe, path_api, a_active)
VALUES
    ('PRESTASI',    'Prestasi Mandiri', '/api/prestasi-mandiri', TRUE),
    ('SERTIFIKASI', 'Sertifikasi',      '/api/sertifikasi',      TRUE),
    ('REKOGNISI',   'Rekognisi',        '/api/rekognisi',        TRUE)
ON CONFLICT (kode) DO NOTHING;


-- =====================================================
-- 8. setting.api_config — Seed konfigurasi SIMKATMAWA
-- =====================================================
-- Kredensial (email/password) DIKOSONGKAN — ops isi via UI Master Data setelah deploy.
-- Isian via UI akan encrypt otomatis pakai Laravel Crypt::encryptString.
--
-- Default a_dry_run = TRUE supaya staging tidak sengaja kirim ke DIKTI produksi.
-- Ops ubah ke FALSE via UI setelah QA selesai.

INSERT INTO setting.api_config
    (kode, nm_api, base_url, auth_type, auth_login_path,
     rate_limit_per_min, timeout_seconds, retry_policy,
     a_active, a_dry_run, deskripsi)
VALUES
    ('simkatmawa',
     'SIMKATMAWA Kemdiktisaintek',
     'https://simkatmawa.kemdiktisaintek.go.id',
     'bearer',
     '/api/login',
     30,   -- 30 req/menit konservatif
     30,   -- 30 detik timeout
     '{"max_attempts": 3, "backoff_ms": [0, 30000, 120000]}'::JSONB,
     TRUE,
     TRUE, -- dry_run default ON; ops matikan setelah siap
     'API pelaporan prestasi/sertifikasi/rekognisi mahasiswa ke Kemdiktisaintek. Auth: POST /api/login dapat JWT bearer. Endpoints: /api/prestasi-mandiri, /api/sertifikasi, /api/rekognisi (POST only — tidak ada GET per probe 2026-04-19).'
    )
ON CONFLICT (kode) DO NOTHING;


-- =====================================================
-- Ringkasan seed
-- =====================================================
-- 4  baris  ref.level_prestasi
-- 5  baris  ref.kategori_prestasi
-- 8  baris  ref.peringkat
-- 2  baris  ref.kelompok_prestasi
-- 2  baris  ref.bentuk_pelaksanaan
-- 14 baris  ref.jenis_rekognisi
-- 3  baris  ref.tipe_sync
-- 1  baris  setting.api_config (simkatmawa — ops isi email/password)
--
-- Total: 39 baris seed data
-- =====================================================
