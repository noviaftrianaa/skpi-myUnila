-- =====================================================
-- Demo Seed: blog_unila v1.0 — Dummy Demo Data
-- Date: 2026-05-13
-- Description:
--   Demo/dummy data untuk showcase Blog Platform sebelum production launch:
--     - 5 blog dari berbagai role (MHS, DOSEN, STAF, ALUMNI)
--     - 18 post dengan status mixed (published, draft, scheduled, archived)
--     - 12 tag populer
--     - post_tag relations
--     - view_post simulasi untuk analytics demo
--     - 4 komentar sample
--
-- Prerequisites:
--   - 01-blog_unila_v1.0_fresh.sql (schema)
--   - 02-blog_unila_v1.0_seed.sql  (master data: kategori, kata_terlarang, dll)
--
-- Catatan:
--   - id_pengguna_pdut: gunakan UUID placeholder. Saat sync ke pdut.man_akses.pengguna,
--     mapping perlu di-update sesuai NIM/NIP asli.
--   - URL avatar/cover: placeholder picsum.photos & ui-avatars.com.
--     Ganti ke MinIO bucket setelah upload service ready.
--
-- Reset (kalau perlu re-seed):
--   TRUNCATE blog.post, blog.blog, ref.tag, blog.post_tag,
--            interaction.view_post, interaction.komentar RESTART IDENTITY CASCADE;
-- =====================================================

BEGIN;

-- =====================================================
-- Variables: tipe_role IDs (resolve dari ref.tipe_role)
-- =====================================================
DO $$
DECLARE
    v_tipe_mhs UUID;
    v_tipe_dosen UUID;
    v_tipe_staf UUID;
    v_tipe_alumni UUID;
    v_kat_teknologi UUID;
    v_kat_tutorial UUID;
    v_kat_opini UUID;
    v_kat_riset UUID;
    v_kat_pendidikan UUID;
    v_kat_karir UUID;
    v_kat_berita UUID;

    v_blog_mizar UUID;
    v_blog_rina UUID;
    v_blog_bambang UUID;
    v_blog_aulia UUID;
    v_blog_siti UUID;

    v_tag_nextjs UUID;
    v_tag_go UUID;
    v_tag_database UUID;
    v_tag_unila UUID;
    v_tag_skripsi UUID;
    v_tag_docker UUID;
    v_tag_pendidikan UUID;
    v_tag_riset UUID;
    v_tag_karir UUID;
    v_tag_mahasiswa UUID;
    v_tag_dosen UUID;
    v_tag_opensource UUID;
BEGIN
    -- Lookup tipe_role
    SELECT id_tipe_role INTO v_tipe_mhs    FROM ref.tipe_role WHERE kode = 'MHS';
    SELECT id_tipe_role INTO v_tipe_dosen  FROM ref.tipe_role WHERE kode = 'DOSEN';
    SELECT id_tipe_role INTO v_tipe_staf   FROM ref.tipe_role WHERE kode = 'STAF';
    SELECT id_tipe_role INTO v_tipe_alumni FROM ref.tipe_role WHERE kode = 'ALUMNI';

    -- Lookup kategori
    SELECT id_kategori_post INTO v_kat_teknologi  FROM ref.kategori_post WHERE slug = 'teknologi';
    SELECT id_kategori_post INTO v_kat_tutorial   FROM ref.kategori_post WHERE slug = 'tutorial';
    SELECT id_kategori_post INTO v_kat_opini      FROM ref.kategori_post WHERE slug = 'opini';
    SELECT id_kategori_post INTO v_kat_riset      FROM ref.kategori_post WHERE slug = 'riset';
    SELECT id_kategori_post INTO v_kat_pendidikan FROM ref.kategori_post WHERE slug = 'pendidikan';
    SELECT id_kategori_post INTO v_kat_karir      FROM ref.kategori_post WHERE slug = 'karir';
    SELECT id_kategori_post INTO v_kat_berita     FROM ref.kategori_post WHERE slug = 'berita-kampus';

    -- =====================================================
    -- TAGS
    -- =====================================================
    INSERT INTO ref.tag (slug, nm_tag, deskripsi) VALUES
        ('nextjs',      'Next.js',       'React framework untuk production'),
        ('go',          'Go',            'Bahasa pemrograman Google'),
        ('database',    'Database',      'Database, SQL, NoSQL'),
        ('unila',       'Unila',         'Universitas Lampung'),
        ('skripsi',     'Skripsi',       'Tugas akhir mahasiswa'),
        ('docker',      'Docker',        'Containerization platform'),
        ('pendidikan',  'Pendidikan',    'Topik pendidikan tinggi'),
        ('riset',       'Riset',         'Penelitian akademik'),
        ('karir',       'Karir',         'Karir & pengembangan diri'),
        ('mahasiswa',   'Mahasiswa',     'Kehidupan mahasiswa'),
        ('dosen',       'Dosen',         'Sudut pandang dosen'),
        ('opensource',  'Open Source',   'Open source software & komunitas')
    ON CONFLICT (slug) DO NOTHING;

    SELECT id_tag INTO v_tag_nextjs     FROM ref.tag WHERE slug = 'nextjs';
    SELECT id_tag INTO v_tag_go         FROM ref.tag WHERE slug = 'go';
    SELECT id_tag INTO v_tag_database   FROM ref.tag WHERE slug = 'database';
    SELECT id_tag INTO v_tag_unila      FROM ref.tag WHERE slug = 'unila';
    SELECT id_tag INTO v_tag_skripsi    FROM ref.tag WHERE slug = 'skripsi';
    SELECT id_tag INTO v_tag_docker     FROM ref.tag WHERE slug = 'docker';
    SELECT id_tag INTO v_tag_pendidikan FROM ref.tag WHERE slug = 'pendidikan';
    SELECT id_tag INTO v_tag_riset      FROM ref.tag WHERE slug = 'riset';
    SELECT id_tag INTO v_tag_karir      FROM ref.tag WHERE slug = 'karir';
    SELECT id_tag INTO v_tag_mahasiswa  FROM ref.tag WHERE slug = 'mahasiswa';
    SELECT id_tag INTO v_tag_dosen      FROM ref.tag WHERE slug = 'dosen';
    SELECT id_tag INTO v_tag_opensource FROM ref.tag WHERE slug = 'opensource';

    -- =====================================================
    -- BLOGS (5 demo blogs)
    -- id_pengguna_pdut: placeholder UUID — mapping ke pdut.man_akses.pengguna
    -- dilakukan oleh admin saat onboarding real users
    -- =====================================================
    v_blog_mizar   := gen_random_uuid();
    v_blog_rina    := gen_random_uuid();
    v_blog_bambang := gen_random_uuid();
    v_blog_aulia   := gen_random_uuid();
    v_blog_siti    := gen_random_uuid();

    INSERT INTO blog.blog (
        id_blog, id_pengguna_pdut, id_tipe_role, subdomain, nm_blog, nm_tampilan,
        tagline, deskripsi, avatar_url, cover_url, bio, lokasi, sosmed_json,
        bahasa, a_aktif, a_publik, a_terverifikasi, tgl_klaim,
        jumlah_post, jumlah_view, jumlah_follower
    ) VALUES
        (
            v_blog_mizar, gen_random_uuid(), v_tipe_mhs,
            '2117051070-mhs', 'Catatan Mizar', 'Mizar Zulmi',
            'Belajar Next.js dan Go di sela kuliah',
            'Mahasiswa Ilmu Komputer FMIPA Unila yang antusias di dunia open source dan web development.',
            'https://ui-avatars.com/api/?name=Mizar+Zulmi&background=0B5EA8&color=fff&size=200',
            'https://picsum.photos/seed/mizar/1200/400',
            'Mahasiswa Ilmu Komputer FMIPA Unila yang antusias di dunia open source dan web development. Suka eksplorasi tech stack baru dan dokumentasiin learning journey.',
            'Bandar Lampung',
            '{"twitter": "mizarunila", "github": "mizar", "linkedin": "mizar-zulmi"}'::JSONB,
            'id', TRUE, TRUE, FALSE,
            '2024-01-15 08:00:00', 4, 12340, 87
        ),
        (
            v_blog_rina, gen_random_uuid(), v_tipe_dosen,
            'rina-dosen', 'Riset & Refleksi', 'Dr. Rina Hartanti, S.Si., M.Si.',
            'Catatan riset dan pembelajaran di FMIPA Unila',
            'Dosen Matematika FMIPA Universitas Lampung. Fokus riset di Statistika Komputasi dan Machine Learning.',
            'https://ui-avatars.com/api/?name=Rina+Hartanti&background=059669&color=fff&size=200',
            'https://picsum.photos/seed/rina/1200/400',
            'Dosen Matematika FMIPA Unila sejak 2015. Penelitian utama: statistika spasial, ML untuk data kesehatan publik. Aktif di komunitas R-Indonesia.',
            'Bandar Lampung',
            '{"linkedin": "rina-hartanti", "orcid": "0000-0002-1234-5678", "scholar": "abc123"}'::JSONB,
            'id', TRUE, TRUE, TRUE,
            '2023-09-15 10:00:00', 5, 34520, 234
        ),
        (
            v_blog_bambang, gen_random_uuid(), v_tipe_dosen,
            'bambang-dosen', 'Engineering Insight', 'Prof. Dr. Bambang Surya, S.T., M.T.',
            'Ulasan teknologi rekayasa dan inovasi kampus',
            'Profesor Teknik Sipil Universitas Lampung. Menulis tentang structural engineering, smart city, dan transformasi digital konstruksi.',
            'https://ui-avatars.com/api/?name=Bambang+Surya&background=7C3AED&color=fff&size=200',
            'https://picsum.photos/seed/bambang/1200/400',
            'Profesor Teknik Sipil Unila. Riset di structural engineering, computational mechanics, dan smart infrastructure.',
            'Bandar Lampung',
            '{"linkedin": "bambang-surya", "scholar": "xyz789", "website": "https://bambangsurya.id"}'::JSONB,
            'id', TRUE, TRUE, TRUE,
            '2023-11-01 09:00:00', 3, 18700, 156
        ),
        (
            v_blog_aulia, gen_random_uuid(), v_tipe_mhs,
            '1957081076-mhs', 'Aulia Bercerita', 'Aulia Rahma',
            'Cerita harian mahasiswa FKIP — pendidikan, literasi, kampus',
            'Mahasiswa Pendidikan Bahasa Indonesia FKIP Unila. Senang menulis tentang sastra, pendidikan, dan kegiatan kemahasiswaan.',
            'https://ui-avatars.com/api/?name=Aulia+Rahma&background=DC2626&color=fff&size=200',
            'https://picsum.photos/seed/aulia/1200/400',
            'Mahasiswi FKIP Unila yang suka literatur dan menulis essay. Aktif di UKM Pers Mahasiswa.',
            'Bandar Lampung',
            '{"instagram": "aulia.rahma", "twitter": "auliarahma"}'::JSONB,
            'id', TRUE, TRUE, FALSE,
            '2024-02-10 14:00:00', 3, 8760, 45
        ),
        (
            v_blog_siti, gen_random_uuid(), v_tipe_staf,
            'siti-staf', 'Layanan Akademik Hub', 'Siti Nurhaliza, S.A.P.',
            'Catatan pelayanan administrasi mahasiswa & dokumentasi proses BAK',
            'Staf BAK Universitas Lampung. Membagikan panduan praktis layanan administrasi mahasiswa & pengalaman onboarding sistem baru.',
            'https://ui-avatars.com/api/?name=Siti+Nurhaliza&background=EA580C&color=fff&size=200',
            'https://picsum.photos/seed/siti/1200/400',
            'Staf BAK Unila sejak 2018. Concerns: digital transformation di layanan kampus, user experience untuk mahasiswa.',
            'Bandar Lampung',
            '{"linkedin": "siti-nurhaliza"}'::JSONB,
            'id', TRUE, TRUE, TRUE,
            '2024-03-05 11:00:00', 3, 5600, 78
        );

    -- =====================================================
    -- POSTS (18 demo posts, mixed status)
    -- =====================================================

    -- ===== Mizar's posts (4 published) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, cover_url, status, visibilitas, tgl_terbit, a_pinned, a_unggulan, jumlah_view, jumlah_like, jumlah_komentar, waktu_baca_menit, jumlah_kata)
    VALUES
        (v_blog_mizar, v_kat_teknologi,
         'Belajar Next.js 15 App Router untuk Pemula',
         'belajar-nextjs-15-app-router-pemula',
         'Panduan komprehensif memulai Next.js 15 App Router dari nol — file-based routing, server components, dan layout patterns.',
         '<p>Next.js 15 membawa banyak perubahan signifikan dengan App Router yang mature...</p><h2>Apa itu App Router?</h2><p>App Router adalah cara baru routing di Next.js berbasis filesystem...</p>',
         'https://picsum.photos/seed/nextjs/1200/630',
         'published', 'public', '2026-05-10 08:00:00', TRUE, TRUE, 1234, 89, 23, 8, 1200),

        (v_blog_mizar, v_kat_teknologi,
         'PostgreSQL vs SQL Server: Pengalaman Migrasi Project Skripsi',
         'postgresql-vs-sqlserver-migrasi',
         'Dokumentasi proses migrasi database project skripsi dari SQL Server ke PostgreSQL — gotchas, lessons learned, dan benchmark.',
         '<p>Sebagai bagian dari skripsi, saya harus migrasi DB dari SQL Server ke PostgreSQL...</p>',
         'https://picsum.photos/seed/db/1200/630',
         'published', 'public', '2026-05-02 13:00:00', FALSE, FALSE, 876, 56, 23, 12, 1800),

        (v_blog_mizar, v_kat_tutorial,
         'Menulis Test untuk REST API Go (Bagian 1)',
         'menulis-test-rest-api-go-1',
         'Step-by-step menulis unit test dan integration test untuk REST API menggunakan Go + testify.',
         '<p>Testing adalah pilar penting dalam software engineering...</p>',
         'https://picsum.photos/seed/go-test/1200/630',
         'published', 'public', '2026-04-28 09:00:00', FALSE, FALSE, 543, 42, 11, 10, 1500),

        (v_blog_mizar, v_kat_teknologi,
         'Review Buku: Designing Data-Intensive Applications',
         'review-ddia',
         'Refleksi setelah baca DDIA — konsep-konsep yang relevan untuk engineer yang ingin level-up.',
         '<p>"Designing Data-Intensive Applications" by Martin Kleppmann adalah salah satu buku wajib...</p>',
         'https://picsum.photos/seed/ddia/1200/630',
         'published', 'public', '2026-04-15 20:00:00', FALSE, FALSE, 387, 34, 8, 7, 1100);

    -- ===== Mizar's drafts (3) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, status, visibilitas, jumlah_kata, waktu_baca_menit)
    VALUES
        (v_blog_mizar, v_kat_karir,
         'Refleksi Magang di UPA TIK Unila Semester Ini',
         'refleksi-magang-upa-tik',
         'Pengalaman 6 bulan magang sebagai engineer di UPA TIK — apa yang dipelajari, struggle, dan plans next.',
         'draft', 'public', 450, 3),

        (v_blog_mizar, v_kat_tutorial,
         'Tutorial Setup Docker Compose untuk Project Multi-Service',
         'setup-docker-compose-multi-service',
         'Step-by-step Docker Compose untuk project dengan frontend + backend + database.',
         'scheduled', 'public', 1200, 8),

        (v_blog_mizar, v_kat_opini,
         'Catatan Acak: Filosofi Open Source',
         'catatan-acak-filosofi-opensource',
         'Pemikiran random tentang community-driven development dan masa depan open source di Indonesia.',
         'draft', 'private', 200, 2);

    -- Scheduled post needs tgl_jadwal
    UPDATE blog.post SET tgl_jadwal = '2026-05-20 08:00:00' WHERE slug = 'setup-docker-compose-multi-service' AND id_blog = v_blog_mizar;

    -- ===== Rina's posts (5 published) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, cover_url, status, visibilitas, tgl_terbit, a_unggulan, jumlah_view, jumlah_like, jumlah_komentar, waktu_baca_menit, jumlah_kata)
    VALUES
        (v_blog_rina, v_kat_riset,
         'Pemodelan Spasial Penyebaran DBD di Lampung dengan R',
         'pemodelan-spasial-dbd-lampung-r',
         'Hasil riset terbaru tim Statistika FMIPA Unila — pemodelan SAR untuk peta risiko DBD per kecamatan.',
         '<p>Demam Berdarah Dengue (DBD) menjadi masalah kesehatan publik yang persisten di Lampung...</p>',
         'https://picsum.photos/seed/dbd/1200/630',
         'published', 'public', '2026-05-08 10:00:00', TRUE, 8456, 234, 56, 15, 2400),

        (v_blog_rina, v_kat_pendidikan,
         'Mengajar Statistika untuk Generasi Z: Tantangan & Adaptasi',
         'mengajar-statistika-gen-z',
         'Catatan refleksi 8 tahun mengajar — bagaimana adaptasi metode untuk mahasiswa Gen Z yang short attention span.',
         '<p>Generasi Z lahir di era smartphone dan TikTok...</p>',
         'https://picsum.photos/seed/teaching/1200/630',
         'published', 'public', '2026-04-25 14:00:00', FALSE, 6234, 187, 34, 11, 1700),

        (v_blog_rina, v_kat_riset,
         'Roadmap Machine Learning untuk Mahasiswa FMIPA',
         'roadmap-ml-mahasiswa-fmipa',
         'Panduan learning path ML untuk mahasiswa matematika/statistika yang ingin terjun ke data science.',
         '<p>Banyak mahasiswa FMIPA bertanya bagaimana mulai belajar ML...</p>',
         'https://picsum.photos/seed/ml-roadmap/1200/630',
         'published', 'public', '2026-04-10 09:00:00', TRUE, 9876, 412, 78, 18, 2800),

        (v_blog_rina, v_kat_riset,
         'Publikasi Q1 vs Sinta 2: Strategi untuk Dosen Baru',
         'publikasi-q1-sinta2-dosen-baru',
         'Tips strategis target jurnal — kapan Q1 layak dicoba, kapan fokus Sinta dulu.',
         '<p>Untuk dosen muda yang baru memulai karir akademik...</p>',
         'https://picsum.photos/seed/publikasi/1200/630',
         'published', 'public', '2026-03-20 11:00:00', FALSE, 5432, 145, 23, 10, 1600),

        (v_blog_rina, v_kat_opini,
         'Reproducible Research: Mengapa Kita Harus Pakai Git untuk Skripsi',
         'reproducible-research-git-skripsi',
         'Argumen mengapa skripsi sebaiknya tracked di Git — bukan cuma kode tapi juga data dan dokumen.',
         '<p>Setiap semester saya jadi pembimbing skripsi, dan setiap semester saya ketemu masalah yang sama...</p>',
         'https://picsum.photos/seed/git-skripsi/1200/630',
         'published', 'public', '2026-03-05 16:00:00', FALSE, 4522, 178, 45, 9, 1300);

    -- ===== Bambang's posts (3 published) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, cover_url, status, visibilitas, tgl_terbit, a_unggulan, jumlah_view, jumlah_like, jumlah_komentar, waktu_baca_menit, jumlah_kata)
    VALUES
        (v_blog_bambang, v_kat_riset,
         'Smart City Lampung 2030: Roadmap & Tantangan Infrastruktur',
         'smart-city-lampung-2030',
         'Analisis komprehensif arah pengembangan smart city Lampung — dari traffic management hingga IoT sensors.',
         '<p>Visi Lampung sebagai smart city sudah dideklarasikan...</p>',
         'https://picsum.photos/seed/smart-city/1200/630',
         'published', 'public', '2026-04-30 08:00:00', TRUE, 12340, 567, 89, 22, 3500),

        (v_blog_bambang, v_kat_pendidikan,
         'Mengintegrasikan AI dalam Kurikulum Teknik Sipil',
         'ai-kurikulum-teknik-sipil',
         'Refleksi pengalaman memasukkan ML dan AI dalam mata kuliah Analisis Struktur.',
         '<p>Teknik sipil di Indonesia masih kurikulum tradisional...</p>',
         'https://picsum.photos/seed/ai-tekniksipil/1200/630',
         'published', 'public', '2026-04-12 10:00:00', FALSE, 4567, 198, 34, 14, 2100),

        (v_blog_bambang, v_kat_riset,
         'Computational Mechanics: Pengantar untuk Praktisi',
         'computational-mechanics-pengantar',
         'Penjelasan accessible tentang FEA, simulasi numerik, dan tools yang dipakai di industri.',
         '<p>Computational mechanics adalah cabang teknik yang krusial...</p>',
         'https://picsum.photos/seed/comp-mech/1200/630',
         'published', 'public', '2026-03-15 13:00:00', FALSE, 1793, 89, 12, 16, 2400);

    -- ===== Aulia's posts (3 published) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, cover_url, status, visibilitas, tgl_terbit, jumlah_view, jumlah_like, jumlah_komentar, waktu_baca_menit, jumlah_kata)
    VALUES
        (v_blog_aulia, v_kat_opini,
         'Sastra di Era Digital: Apakah Buku Masih Relevan?',
         'sastra-era-digital-buku-relevan',
         'Refleksi mahasiswa Sastra Indonesia tentang masa depan buku fisik di tengah audiobook & podcast.',
         '<p>Saya tumbuh dengan rak buku ayah saya...</p>',
         'https://picsum.photos/seed/sastra-digital/1200/630',
         'published', 'public', '2026-05-05 19:00:00', 3456, 178, 45, 8, 1200),

        (v_blog_aulia, v_kat_pendidikan,
         'Pengalaman PPL di SMA: Realitas Mengajar Generasi Z',
         'pengalaman-ppl-sma-gen-z',
         'Cerita 3 bulan PPL di SMA Negeri — surprise, frustasi, dan momen-momen inspiratif.',
         '<p>Hari pertama saya masuk kelas, saya gugup setengah mati...</p>',
         'https://picsum.photos/seed/ppl-sma/1200/630',
         'published', 'public', '2026-04-18 15:00:00', 3890, 234, 67, 10, 1500),

        (v_blog_aulia, v_kat_berita,
         'Festival Bahasa & Budaya FKIP 2026: Mengangkat Tradisi Lampung',
         'festival-bahasa-budaya-fkip-2026',
         'Liputan event tahunan FKIP — workshop nyangking, lomba tulisan aksara Lampung, dan refleksi pelestarian budaya.',
         '<p>Aula FKIP Unila riuh oleh ratusan peserta...</p>',
         'https://picsum.photos/seed/festival-lampung/1200/630',
         'published', 'public', '2026-03-25 09:00:00', 1414, 67, 12, 7, 1000);

    -- ===== Siti's posts (3 published) =====
    INSERT INTO blog.post (id_blog, id_kategori_post, judul, slug, ringkasan, konten_html, cover_url, status, visibilitas, tgl_terbit, jumlah_view, jumlah_like, jumlah_komentar, waktu_baca_menit, jumlah_kata)
    VALUES
        (v_blog_siti, v_kat_pendidikan,
         'Panduan Lengkap KRS Online untuk Mahasiswa Baru',
         'panduan-krs-online-maba',
         'Step-by-step proses KRS via SIAKADU — termasuk troubleshooting umum yang sering ditanyakan ke BAK.',
         '<p>Setiap awal semester, BAK menerima ratusan pertanyaan KRS...</p>',
         'https://picsum.photos/seed/krs-maba/1200/630',
         'published', 'public', '2026-05-01 08:00:00', 2890, 145, 67, 6, 900),

        (v_blog_siti, v_kat_berita,
         'Transformasi Layanan Mahasiswa: Dari Antrian Fisik ke Digital',
         'transformasi-layanan-mahasiswa-digital',
         'Perjalanan digitalisasi layanan BAK dari paperwork ke sistem SI MBAK — pelajaran dari sisi staf.',
         '<p>Dulu di tahun 2018, antrian di BAK bisa sampai jam 4 sore...</p>',
         'https://picsum.photos/seed/transformasi-bak/1200/630',
         'published', 'public', '2026-04-08 11:00:00', 1789, 89, 23, 9, 1300),

        (v_blog_siti, v_kat_karir,
         'Tips Surat Rekomendasi Beasiswa: Apa yang Pembuat Beasiswa Cari',
         'tips-surat-rekomendasi-beasiswa',
         'Insight dari sisi staf yang sering review surat rekomendasi — common mistakes dan strategi.',
         '<p>Setiap kali musim beasiswa, mahasiswa antri minta surat rekomendasi...</p>',
         'https://picsum.photos/seed/surat-rekomendasi/1200/630',
         'published', 'public', '2026-03-12 14:00:00', 921, 45, 11, 5, 800);

    -- =====================================================
    -- POST_TAG relations (sample)
    -- =====================================================
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_nextjs FROM blog.post p WHERE p.slug = 'belajar-nextjs-15-app-router-pemula';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_database FROM blog.post p WHERE p.slug = 'postgresql-vs-sqlserver-migrasi';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_skripsi FROM blog.post p WHERE p.slug = 'postgresql-vs-sqlserver-migrasi';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_go FROM blog.post p WHERE p.slug = 'menulis-test-rest-api-go-1';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_docker FROM blog.post p WHERE p.slug = 'setup-docker-compose-multi-service';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_riset FROM blog.post p WHERE p.slug = 'pemodelan-spasial-dbd-lampung-r';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_pendidikan FROM blog.post p WHERE p.slug = 'mengajar-statistika-gen-z';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_dosen FROM blog.post p WHERE p.slug = 'mengajar-statistika-gen-z';
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_unila FROM blog.post p WHERE p.slug IN ('festival-bahasa-budaya-fkip-2026', 'panduan-krs-online-maba');
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_mahasiswa FROM blog.post p WHERE p.slug IN ('panduan-krs-online-maba', 'refleksi-magang-upa-tik');
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_karir FROM blog.post p WHERE p.slug IN ('refleksi-magang-upa-tik', 'tips-surat-rekomendasi-beasiswa');
    INSERT INTO blog.post_tag (id_post, id_tag)
    SELECT p.id_post, v_tag_opensource FROM blog.post p WHERE p.slug = 'catatan-acak-filosofi-opensource';

    -- =====================================================
    -- VIEW_POST simulasi (untuk analytics demo, 30 hari terakhir)
    -- Cukup beberapa rekod sample — di production via cron aggregate dari raw events
    -- Schema: id_post, id_pengguna_pdut (NULL=guest), ip_hash, referer, created_at
    -- =====================================================
    INSERT INTO interaction.view_post (id_post, ip_hash, referer, created_at)
    SELECT p.id_post,
           encode(sha256(('demo-ip-' || i::text)::bytea), 'hex'),
           CASE (i % 4) WHEN 0 THEN 'https://google.com' WHEN 1 THEN 'https://twitter.com' WHEN 2 THEN 'https://blog.unila.ac.id' ELSE NULL END,
           NOW() - (random() * INTERVAL '30 days')
    FROM blog.post p
    CROSS JOIN generate_series(1, 5) i
    WHERE p.status = 'published';

    -- =====================================================
    -- KOMENTAR sample (4 komentar approved di top posts)
    -- Schema: id_post, id_komentar_parent, id_pengguna_pdut, nm_komentator,
    --         email_komentator, isi, status_moderasi, ip_alamat, user_agent, ...
    -- =====================================================
    INSERT INTO interaction.komentar (id_post, nm_komentator, email_komentator, isi, status_moderasi, created_at)
    SELECT p.id_post, 'Ahmad Fauzi', 'ahmad@students.unila.ac.id',
           'Mantap kak, sangat membantu untuk pemula yang baru migrasi dari Pages Router!',
           'approved', '2026-05-11 10:30:00'
    FROM blog.post p WHERE p.slug = 'belajar-nextjs-15-app-router-pemula';

    INSERT INTO interaction.komentar (id_post, nm_komentator, email_komentator, isi, status_moderasi, created_at)
    SELECT p.id_post, 'Dewi Lestari', 'dewi@students.unila.ac.id',
           'Untuk Server Components, apakah masih bisa pakai hooks seperti useState?',
           'approved', '2026-05-12 08:15:00'
    FROM blog.post p WHERE p.slug = 'belajar-nextjs-15-app-router-pemula';

    INSERT INTO interaction.komentar (id_post, nm_komentator, email_komentator, isi, status_moderasi, created_at)
    SELECT p.id_post, 'Iqbal Maulana', 'iqbal@students.unila.ac.id',
           'Sangat bermanfaat Dr. Rina! Saya tertarik lebih lanjut tentang SAR model.',
           'approved', '2026-05-09 14:00:00'
    FROM blog.post p WHERE p.slug = 'pemodelan-spasial-dbd-lampung-r';

    INSERT INTO interaction.komentar (id_post, nm_komentator, email_komentator, isi, status_moderasi, created_at)
    SELECT p.id_post, 'Putri Hidayah', 'putri@students.unila.ac.id',
           'Bu Aulia, saya juga sering merindukan buku fisik. Setuju banget!',
           'approved', '2026-05-06 20:30:00'
    FROM blog.post p WHERE p.slug = 'sastra-era-digital-buku-relevan';

    -- =====================================================
    -- Defensive recompute denormalized counts
    -- (Trigger sebenarnya sudah handle INSERT, tapi ini guarantee konsistensi
    --  kalau trigger di-disable atau ada race condition saat batch insert)
    -- =====================================================
    UPDATE blog.blog b SET
        jumlah_post = (SELECT COUNT(*) FROM blog.post p WHERE p.id_blog = b.id_blog AND p.status = 'published' AND p.soft_delete IS NULL),
        jumlah_view = COALESCE((SELECT SUM(p.jumlah_view) FROM blog.post p WHERE p.id_blog = b.id_blog AND p.soft_delete IS NULL), 0);

    UPDATE ref.kategori_post k SET
        jumlah_post = (SELECT COUNT(*) FROM blog.post p WHERE p.id_kategori_post = k.id_kategori_post AND p.status = 'published' AND p.soft_delete IS NULL);

    UPDATE ref.tag t SET
        frekuensi = (SELECT COUNT(*) FROM blog.post_tag pt WHERE pt.id_tag = t.id_tag);

    RAISE NOTICE 'Demo seed completed: 5 blogs, 18 posts, 12 tags, view samples + 4 komentar';
END $$;

COMMIT;

-- =====================================================
-- Verification queries (uncomment to run):
-- =====================================================
-- SELECT subdomain, nm_tampilan, jumlah_post, jumlah_view FROM blog.blog ORDER BY jumlah_view DESC;
-- SELECT b.subdomain, p.judul, p.status, p.jumlah_view FROM blog.post p JOIN blog.blog b ON p.id_blog = b.id_blog ORDER BY p.tgl_terbit DESC NULLS LAST;
-- SELECT t.nm_tag, COUNT(pt.id_post) AS jumlah_post FROM ref.tag t LEFT JOIN blog.post_tag pt ON pt.id_tag = t.id_tag GROUP BY t.nm_tag ORDER BY jumlah_post DESC;
