-- =====================================================
-- Seed: blog_unila v1.0 — Master Data
-- Date: 2026-05-13
-- Description:
--   Seed data referensi untuk blog platform:
--     - ref.tipe_role           (4 baris)
--     - ref.template_theme      (2 baris: modern default + minimalist)
--     - ref.kategori_post       (~20 kategori)
--     - ref.kata_terlarang      (~200 reserved words)
-- =====================================================

\c blog_unila
SET search_path TO ref, blog, media, interaction, moderation, audit, public;


-- =====================================================
-- Seed: ref.tipe_role
-- =====================================================

INSERT INTO ref.tipe_role (kode, suffix_subdomain, nm_tipe, deskripsi, urutan) VALUES
('MHS',    '-mhs',    'Mahasiswa',     'Mahasiswa aktif Universitas Lampung. Subdomain auto-assigned dari NIM.', 1),
('STAF',   '-staf',   'Staf/Tendik',   'Tenaga kependidikan & staf administrasi. Subdomain via klaim 4-layer validation.', 2),
('DOSEN',  '-dosen',  'Dosen',         'Dosen tetap & dosen luar biasa. Subdomain via klaim 4-layer validation.', 3),
('ALUMNI', '-alumni', 'Alumni',        'Lulusan Unila (mahasiswa lulus → migrasi opsional ke -alumni).', 4)
ON CONFLICT (kode) DO NOTHING;


-- =====================================================
-- Seed: ref.template_theme
-- =====================================================

INSERT INTO ref.template_theme (kode, nm_template, deskripsi, manifest_json, versi, a_default, a_aktif) VALUES
(
    'modern',
    'Modern',
    'Theme modern dengan hero penulis, post grid, sidebar tag cloud. Cocok untuk blog umum civitas. Mobile-first, dark mode support.',
    '{
        "warna_primer": "#3B82F6",
        "warna_sekunder": "#1E40AF",
        "warna_aksen": "#F59E0B",
        "font_heading": "Inter",
        "font_body": "Source Serif Pro",
        "layout": "sidebar-right",
        "hero_style": "author-banner",
        "post_card_style": "cover-top"
    }'::JSONB,
    '1.0.0',
    TRUE,
    TRUE
),
(
    'minimalist',
    'Minimalist',
    'Theme ultra-minimal: single column, fokus pada teks tulisan. Cocok untuk blog literary, opini, esai panjang. No sidebar, generous whitespace.',
    '{
        "warna_primer": "#0F172A",
        "warna_sekunder": "#475569",
        "warna_aksen": "#0EA5E9",
        "font_heading": "Playfair Display",
        "font_body": "Lora",
        "layout": "single-column",
        "hero_style": "minimal-text",
        "post_card_style": "list-no-cover"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
),
(
    'magazine',
    'Magazine',
    'Layout multi-kolom ala majalah. Featured area besar di atas, grid asimetris. Cocok untuk blog editorial atau redaksi BEM/HMJ.',
    '{
        "warna_primer": "#DC2626",
        "warna_sekunder": "#1E293B",
        "warna_aksen": "#F59E0B",
        "font_heading": "Playfair Display",
        "font_body": "Source Serif Pro",
        "layout": "magazine",
        "hero_style": "featured-grid",
        "post_card_style": "asymmetric-cover"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
),
(
    'academic',
    'Academic',
    'Mirip ResearchGate / Google Scholar. Hero menampilkan publikasi & sertifikasi prominent. Cocok untuk dosen, peneliti, mahasiswa pasca.',
    '{
        "warna_primer": "#0E7490",
        "warna_sekunder": "#155E75",
        "warna_aksen": "#A78BFA",
        "font_heading": "Source Serif Pro",
        "font_body": "Source Serif Pro",
        "layout": "academic",
        "hero_style": "publication-list",
        "post_card_style": "list-detail"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
),
(
    'gallery',
    'Gallery',
    'Visual-first dengan masonry grid. Cover image dominant. Cocok untuk fotografer, desainer, mahasiswa Seni Rupa, FKIP Seni.',
    '{
        "warna_primer": "#A855F7",
        "warna_sekunder": "#7E22CE",
        "warna_aksen": "#EC4899",
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout": "masonry",
        "hero_style": "gallery-tiles",
        "post_card_style": "image-first-overlay"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
),
(
    'devlog',
    'Devlog',
    'Theme coder/tech aesthetic — dark default, monospace untuk heading, terminal-vibe. Cocok untuk mahasiswa Ilkom, Teknik Informatika, developer.',
    '{
        "warna_primer": "#10B981",
        "warna_sekunder": "#0F172A",
        "warna_aksen": "#F59E0B",
        "font_heading": "JetBrains Mono",
        "font_body": "Inter",
        "layout": "single-column-dark",
        "hero_style": "terminal",
        "post_card_style": "code-block",
        "default_theme": "dark"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
),
(
    'portfolio',
    'Portfolio',
    'Personal showcase ala designer/agency. Hero full-width statement, post grid besar dengan hover effects. Cocok untuk freelancer/wirausaha civitas.',
    '{
        "warna_primer": "#0F172A",
        "warna_sekunder": "#1E293B",
        "warna_aksen": "#F59E0B",
        "font_heading": "Plus Jakarta Sans",
        "font_body": "Inter",
        "layout": "showcase",
        "hero_style": "statement",
        "post_card_style": "card-large-hover"
    }'::JSONB,
    '1.0.0',
    FALSE,
    TRUE
)
ON CONFLICT (kode) DO NOTHING;


-- =====================================================
-- Seed: ref.kategori_post (~20 kategori curated)
-- =====================================================

INSERT INTO ref.kategori_post (slug, nm_kategori, deskripsi, icon_name, warna, urutan) VALUES
('teknologi',       'Teknologi',          'Pemrograman, software, gadget, AI, data science.',                     'FiCpu',          '#3B82F6', 1),
('pendidikan',      'Pendidikan',         'Pengalaman belajar, metode pembelajaran, refleksi pendidikan.',        'FiBook',         '#10B981', 2),
('riset',           'Riset & Penelitian', 'Hasil penelitian, ringkasan jurnal, eksperimen, opini ilmiah.',        'FiSearch',       '#8B5CF6', 3),
('opini',           'Opini',              'Esai opini, kolom, refleksi pribadi, komentar isu publik.',           'FiMessageSquare','#F59E0B', 4),
('sastra',          'Sastra & Karya',     'Cerpen, puisi, esai sastra, ulasan buku.',                            'FiFeather',      '#EC4899', 5),
('berita-kampus',   'Berita Kampus',      'Reportase aktivitas civitas Unila, event, prestasi mahasiswa.',       'FiNewspaper',    '#EF4444', 6),
('beasiswa',        'Beasiswa',           'Info beasiswa, tips aplikasi, pengalaman penerima beasiswa.',         'FiAward',        '#F97316', 7),
('kewirausahaan',   'Kewirausahaan',      'Bisnis mahasiswa, startup, UMKM, business model canvas.',             'FiTrendingUp',   '#14B8A6', 8),
('pengabdian',      'Pengabdian Masyarakat', 'Kegiatan KKN, PkM, kontribusi sosial.',                            'FiUsers',        '#06B6D4', 9),
('lingkungan',      'Lingkungan',         'Sustainability, climate change, konservasi, green campus.',           'FiLeaf',         '#22C55E', 10),
('seni-budaya',     'Seni & Budaya',      'Seni rupa, musik, tari, budaya Lampung, ulasan pertunjukan.',         'FiMusic',        '#A855F7', 11),
('kesehatan',       'Kesehatan',          'Tips kesehatan, gizi, mental health, info medis.',                    'FiHeart',        '#F43F5E', 12),
('hukum',           'Hukum',              'Analisis hukum, opini regulasi, studi kasus.',                        'FiShield',       '#6366F1', 13),
('ekonomi',         'Ekonomi',            'Analisis ekonomi, finansial, bisnis, kebijakan moneter.',             'FiDollarSign',   '#84CC16', 14),
('politik',         'Politik',            'Diskusi kebijakan publik, pemilu, governance.',                       'FiFlag',         '#0EA5E9', 15),
('internasional',   'Internasional',      'Pengalaman exchange, conference luar negeri, kolaborasi global.',     'FiGlobe',        '#6366F1', 16),
('tutorial',        'Tutorial',           'How-to, walkthrough, panduan praktis.',                               'FiBookOpen',     '#0891B2', 17),
('karir',           'Karir',              'Tips karir, magang, persiapan kerja, freelancing.',                   'FiBriefcase',    '#7C3AED', 18),
('olahraga',        'Olahraga',           'Berita olahraga, event, prestasi atlet, opini.',                      'FiActivity',     '#DC2626', 19),
('lainnya',         'Lainnya',            'Kategori catch-all untuk topik lain.',                                'FiMoreHorizontal','#64748B', 20)
ON CONFLICT (slug) DO NOTHING;


-- =====================================================
-- Seed: ref.kata_terlarang (~200 reserved words)
-- =====================================================

-- Kategori: system (path/route system)
INSERT INTO ref.kata_terlarang (kata, kategori, keterangan) VALUES
('admin',       'system', 'Path admin panel'),
('administrator', 'system', 'Path admin'),
('root',        'system', 'Reserved system'),
('www',         'system', 'Subdomain web standard'),
('mail',        'system', 'Email subdomain'),
('email',       'system', 'Email subdomain'),
('ftp',         'system', 'FTP standard'),
('ssh',         'system', 'SSH standard'),
('api',         'system', 'API endpoint subdomain'),
('app',         'system', 'Application subdomain'),
('apps',        'system', 'Apps subdomain'),
('blog',        'system', 'Reserved (apex blog itself)'),
('blogs',       'system', 'Reserved'),
('static',      'system', 'Static assets'),
('assets',      'system', 'Assets subdomain'),
('cdn',         'system', 'CDN subdomain'),
('media',       'system', 'Media subdomain'),
('uploads',     'system', 'Upload path'),
('login',       'system', 'Login path'),
('logout',      'system', 'Logout path'),
('register',    'system', 'Register path'),
('signup',      'system', 'Signup path'),
('signin',      'system', 'Signin path'),
('auth',        'system', 'Auth subdomain'),
('oauth',       'system', 'OAuth subdomain'),
('sso',         'system', 'Single sign-on'),
('search',      'system', 'Search path'),
('test',        'system', 'Test subdomain'),
('staging',     'system', 'Staging environment'),
('dev',         'system', 'Dev environment'),
('development', 'system', 'Development'),
('prod',        'system', 'Production'),
('production',  'system', 'Production'),
('demo',        'system', 'Demo subdomain'),
('beta',        'system', 'Beta subdomain'),
('alpha',       'system', 'Alpha subdomain'),
('preview',     'system', 'Preview subdomain'),
('docs',        'system', 'Docs subdomain'),
('help',        'system', 'Help subdomain'),
('support',     'system', 'Support subdomain'),
('faq',         'system', 'FAQ subdomain'),
('contact',     'system', 'Contact path'),
('about',       'system', 'About path'),
('home',        'system', 'Home path'),
('index',       'system', 'Index path'),
('public',      'system', 'Public path'),
('private',     'system', 'Private path'),
('internal',    'system', 'Internal path'),
('webmaster',   'system', 'Webmaster role'),
('postmaster',  'system', 'Postmaster role'),
('hostmaster',  'system', 'Hostmaster role'),
('abuse',       'system', 'Abuse contact'),
('security',    'system', 'Security contact'),
('noreply',     'system', 'No-reply email'),
('no-reply',    'system', 'No-reply email')
ON CONFLICT (kata) DO NOTHING;

-- Kategori: role (akademik & jabatan)
INSERT INTO ref.kata_terlarang (kata, kategori, keterangan) VALUES
('rektor',      'role', 'Reserved untuk akun resmi rektor (pre-claim VIP)'),
('warek',       'role', 'Wakil rektor'),
('wr',          'role', 'Wakil rektor abbrev'),
('dekan',       'role', 'Reserved untuk dekan (pre-claim per fakultas)'),
('wakil-dekan', 'role', 'Wakil dekan'),
('wadek',       'role', 'Wakil dekan abbrev'),
('kaprodi',     'role', 'Kepala prodi'),
('sekprodi',    'role', 'Sekretaris prodi'),
('kajur',       'role', 'Kepala jurusan'),
('sekjur',      'role', 'Sekretaris jurusan'),
('direktur',    'role', 'Direktur'),
('wakil-direktur', 'role', 'Wakil direktur'),
('koordinator', 'role', 'Koordinator'),
('koor',        'role', 'Koordinator abbrev'),
('kepala',      'role', 'Kepala unit'),
('staf',        'role', 'Reserved suffix'),
('staff',       'role', 'Reserved suffix'),
('dosen',       'role', 'Reserved suffix'),
('mahasiswa',   'role', 'Reserved'),
('mhs',         'role', 'Reserved suffix'),
('alumni',      'role', 'Reserved suffix'),
('tendik',      'role', 'Tenaga kependidikan'),
('pegawai',     'role', 'Pegawai'),
('karyawan',    'role', 'Karyawan'),
('pejabat',     'role', 'Pejabat'),
('profesor',    'role', 'Reserved untuk profesor (pre-claim VIP)'),
('prof',        'role', 'Profesor abbrev'),
('doktor',      'role', 'Reserved'),
('dr',          'role', 'Doktor abbrev'),
('drs',         'role', 'Drs gelar'),
('dra',         'role', 'Dra gelar'),
('drg',         'role', 'Drg gelar'),
('ir',          'role', 'Insinyur'),
('mt',          'role', 'MT gelar'),
('msc',         'role', 'MSc gelar'),
('phd',         'role', 'PhD gelar')
ON CONFLICT (kata) DO NOTHING;

-- Kategori: brand (Unila & unit)
INSERT INTO ref.kata_terlarang (kata, kategori, keterangan) VALUES
('unila',           'brand', 'Universitas Lampung brand'),
('universitas',     'brand', 'Brand'),
('universitas-lampung', 'brand', 'Brand'),
('university',      'brand', 'Brand english'),
('lampung',         'brand', 'Brand provinsi'),
('myunila',         'brand', 'Brand portal'),
('my-unila',        'brand', 'Brand portal'),
('siakad',          'brand', 'Brand siakad'),
('siakadu',         'brand', 'Brand siakad Unila'),
('upa',             'brand', 'Unit Pelaksana Akademik'),
('upt',             'brand', 'Unit Pelaksana Teknis'),
('lpm',             'brand', 'Lembaga Penjaminan Mutu'),
('lppm',            'brand', 'Lembaga Penelitian'),
('bak',             'brand', 'Biro Akademik & Kemahasiswaan'),
('bauk',            'brand', 'Biro Administrasi'),
('humas',           'brand', 'Humas'),
('puskom',          'brand', 'Pusat Komputer'),
('tik',             'brand', 'TIK'),
('it',              'brand', 'IT'),
('perpustakaan',    'brand', 'Perpus'),
('perpus',          'brand', 'Perpus'),
('library',         'brand', 'Library'),
('lab',             'brand', 'Laboratorium'),
('laboratorium',    'brand', 'Laboratorium'),
('fakultas',        'brand', 'Fakultas'),
('fk',              'brand', 'FK'),
('fkip',            'brand', 'FKIP'),
('ft',              'brand', 'FT'),
('fp',              'brand', 'FP'),
('fmipa',           'brand', 'FMIPA'),
('fh',              'brand', 'FH'),
('fe',              'brand', 'FE'),
('feb',             'brand', 'FEB'),
('fisip',           'brand', 'FISIP'),
('teknik',          'brand', 'Teknik'),
('kedokteran',      'brand', 'Kedokteran'),
('hukum',           'brand', 'Hukum fakultas'),
('pertanian',       'brand', 'Pertanian'),
('mipa',            'brand', 'MIPA'),
('ekonomi',         'brand', 'Ekonomi fakultas'),
('keguruan',        'brand', 'Keguruan'),
('sosial',          'brand', 'Sosial'),
('politik',         'brand', 'Politik fakultas')
ON CONFLICT (kata) DO NOTHING;

-- Kategori: offensive (sample, list final akan di-review humas/legal — open question #6)
INSERT INTO ref.kata_terlarang (kata, kategori, keterangan) VALUES
('porn',        'offensive', 'Adult content'),
('porno',       'offensive', 'Adult content'),
('xxx',         'offensive', 'Adult content marker'),
('sex',         'offensive', 'Reserved'),
('seks',        'offensive', 'Reserved'),
('judi',        'offensive', 'Gambling'),
('gambling',    'offensive', 'Gambling'),
('casino',      'offensive', 'Gambling'),
('togel',       'offensive', 'Gambling'),
('slot',        'offensive', 'Gambling marker'),
('jackpot',     'offensive', 'Gambling marker'),
('narkoba',     'offensive', 'Narcotics'),
('drug',        'offensive', 'Drug'),
('drugs',       'offensive', 'Drug')
-- NOTE: Daftar offensive perlu review legal/humas Unila (open question #6 di overview)
ON CONFLICT (kata) DO NOTHING;


-- =====================================================
-- DONE — Seed data ready
-- Total: ~140 kata_terlarang (final ~200 setelah review humas/legal)
-- =====================================================

-- Verifikasi seed:
SELECT 'tipe_role'      AS tabel, COUNT(*) AS jumlah FROM ref.tipe_role
UNION ALL SELECT 'template_theme',   COUNT(*) FROM ref.template_theme
UNION ALL SELECT 'kategori_post',    COUNT(*) FROM ref.kategori_post
UNION ALL SELECT 'kata_terlarang',   COUNT(*) FROM ref.kata_terlarang;
