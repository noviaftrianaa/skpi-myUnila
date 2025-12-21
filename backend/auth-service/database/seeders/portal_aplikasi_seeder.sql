-- ============================================================================
-- SEEDER: Portal Aplikasi Data
-- Description: Seed kategori_aplikasi and update aplikasi with portal data
-- Source: frontend/src/app/portal/page.tsx (static data)
-- Date: 2025-12-11
-- Updated: 2025-12-12 - Added id_organisasi mapping
-- ============================================================================

-- ============================================================================
-- STEP 0: Define Organisation IDs
-- ============================================================================
DECLARE @ORG_UPT_TIK UNIQUEIDENTIFIER = 'c4453e71-a6db-4487-8f5e-84cb4de54fec';      -- UPT TIK (Developer)
DECLARE @ORG_UNILA UNIQUEIDENTIFIER = 'e2b705a7-173e-464a-9fac-509128709515';         -- Universitas Lampung (Rektorat)
DECLARE @ORG_SEMUA_UNIT UNIQUEIDENTIFIER = '86942cdf-44f1-446e-8e9e-cb37bbbb16e6';    -- Semua Unit (Global access)

-- ============================================================================
-- STEP 1: Insert Kategori Aplikasi
-- ============================================================================
PRINT 'Seeding kategori_aplikasi...';

-- Clear existing data (optional - comment out if you want to preserve)
-- DELETE FROM man_akses.kategori_aplikasi;

-- Insert categories
DECLARE @kat_akademik UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_riset UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_kemahasiswaan UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_alumni UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_dashboard UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_data UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_layanan UNIQUEIDENTIFIER = NEWID();
DECLARE @kat_tools UNIQUEIDENTIFIER = NEWID();

-- Insert only if not exists
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Akademik')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_akademik, 'Akademik', 'heroicons:book-open', 'bg-blue-500', 1);
END
ELSE
    SELECT @kat_akademik = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Akademik';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Riset dan Kerjasama')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_riset, 'Riset dan Kerjasama', 'heroicons:magnifying-glass', 'bg-purple-500', 2);
END
ELSE
    SELECT @kat_riset = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Riset dan Kerjasama';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Kemahasiswaan')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_kemahasiswaan, 'Kemahasiswaan', 'heroicons:users', 'bg-green-500', 3);
END
ELSE
    SELECT @kat_kemahasiswaan = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Kemahasiswaan';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Alumni')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_alumni, 'Alumni', 'heroicons:academic-cap', 'bg-orange-500', 4);
END
ELSE
    SELECT @kat_alumni = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Alumni';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Dashboard & Akreditasi')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_dashboard, 'Dashboard & Akreditasi', 'heroicons:chart-bar-square', 'bg-indigo-500', 5);
END
ELSE
    SELECT @kat_dashboard = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Dashboard & Akreditasi';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Data dan Pelaporan')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_data, 'Data dan Pelaporan', 'heroicons:circle-stack', 'bg-cyan-500', 6);
END
ELSE
    SELECT @kat_data = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Data dan Pelaporan';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Layanan')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_layanan, 'Layanan', 'heroicons:phone', 'bg-red-500', 7);
END
ELSE
    SELECT @kat_layanan = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Layanan';

IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Tools & Utilities')
BEGIN
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan)
    VALUES (@kat_tools, 'Tools & Utilities', 'heroicons:cog-6-tooth', 'bg-slate-500', 8);
END
ELSE
    SELECT @kat_tools = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Tools & Utilities';

PRINT 'Kategori aplikasi seeded successfully';

-- ============================================================================
-- STEP 2: Insert/Update Aplikasi Portal
-- Using MERGE to handle both insert and update
-- ============================================================================
PRINT 'Seeding aplikasi portal...';

-- Create temp table for portal apps data (with id_organisasi)
CREATE TABLE #PortalApps (
    app_slug VARCHAR(100),
    nm_aplikasi VARCHAR(100),
    ket_aplikasi VARCHAR(500),
    url VARCHAR(256),
    icon_name VARCHAR(100),
    icon_color VARCHAR(50),
    kategori VARCHAR(100),
    urutan INT,
    id_organisasi UNIQUEIDENTIFIER
);

-- Insert all portal apps data with id_organisasi mapping:
-- @ORG_UPT_TIK      = Tools & Utilities (Developer only)
-- @ORG_UNILA        = Dashboard, Data, Riset, Kepegawaian (Rektorat level)
-- @ORG_SEMUA_UNIT   = Akademik, Kemahasiswaan, Alumni, Layanan (All units)

INSERT INTO #PortalApps VALUES
-- Akademik (Semua Unit - accessible by all homebase)
('presensi-sirandu', 'Presensi (SIRANDU)', 'Sistem Presensi Perkuliahan', '#', 'BsClipboardCheck', 'bg-green-500', 'Akademik', 1, @ORG_SEMUA_UNIT),
('siakadu', 'SIAKADU', 'Sistem Informasi Akademik', '#', 'HiClipboardList', 'bg-blue-600', 'Akademik', 2, @ORG_SEMUA_UNIT),
('e-kkn', 'E-KKN', 'Sistem Kuliah Kerja Nyata', '#', 'BsGlobe', 'bg-teal-600', 'Akademik', 3, @ORG_SEMUA_UNIT),
('berdampak-mbkm', 'Berdampak (MBKM)', 'Merdeka Belajar Kampus Merdeka', '#', 'HiPresentationChartLine', 'bg-teal-500', 'Akademik', 4, @ORG_SEMUA_UNIT),
('v-class', 'V-CLASS', 'Platform Pembelajaran Virtual', '#', 'HiLibrary', 'bg-cyan-500', 'Akademik', 5, @ORG_SEMUA_UNIT),
('wali', 'Wali', 'Sistem Perwalian', '#', 'BsPeopleFill', 'bg-blue-500', 'Akademik', 6, @ORG_SEMUA_UNIT),
('sikebas', 'SIKEBAS', 'Sistem Keringanan & Bebas UKT', '#', 'BsCash', 'bg-emerald-600', 'Akademik', 7, @ORG_SEMUA_UNIT),
('sikep', 'SIKEP', 'Sistem Kepegawaian', '#', 'FaIdCard', 'bg-slate-600', 'Akademik', 8, @ORG_UNILA),
('spmi', 'SPMI', 'Sistem Penjaminan Mutu Internal', '#', 'FaChartLine', 'bg-green-600', 'Akademik', 9, @ORG_SEMUA_UNIT),

-- Riset dan Kerjasama (Unila/Rektorat level)
('si-penelitian', 'SI Penelitian', 'Manajemen penelitian', '#', 'BsFileEarmarkText', 'bg-sky-500', 'Riset dan Kerjasama', 1, @ORG_UNILA),
('si-pengabdian', 'SI Pengabdian', 'Pengabdian masyarakat', '#', 'HiUserGroup', 'bg-fuchsia-500', 'Riset dan Kerjasama', 2, @ORG_UNILA),
('si-publikasi', 'SI Publikasi', 'Manajemen publikasi ilmiah', '#', 'BsNewspaper', 'bg-indigo-600', 'Riset dan Kerjasama', 3, @ORG_UNILA),
('sikerma', 'SIKERMA', 'Sistem Kerjasama Institusi', '#', 'RiGovernmentFill', 'bg-blue-700', 'Riset dan Kerjasama', 4, @ORG_UNILA),

-- Kemahasiswaan (Semua Unit)
('si-prestasi', 'SI Prestasi', 'Sistem Informasi Prestasi', '#', 'BsTrophy', 'bg-yellow-500', 'Kemahasiswaan', 1, @ORG_SEMUA_UNIT),
('beasiswa', 'Beasiswa', 'Sistem Informasi Beasiswa', '#', 'MdCardMembership', 'bg-emerald-500', 'Kemahasiswaan', 2, @ORG_SEMUA_UNIT),
('ormawa', 'Ormawa', 'Organisasi Kemahasiswaan', '#', 'RiTeamFill', 'bg-violet-500', 'Kemahasiswaan', 3, @ORG_SEMUA_UNIT),
('minat-bakat', 'Minat Bakat', 'Sistem Minat dan Bakat', '#', 'BsLightbulb', 'bg-amber-500', 'Kemahasiswaan', 4, @ORG_SEMUA_UNIT),

-- Alumni (Semua Unit)
('tracer-study', 'Tracer Study', 'Pelacakan Alumni', '#', 'heroicons:academic-cap', 'bg-orange-500', 'Alumni', 1, @ORG_SEMUA_UNIT),
('service-layanan', 'Service Layanan', 'Layanan untuk Alumni', '#', 'FaHandsHelping', 'bg-teal-500', 'Alumni', 2, @ORG_SEMUA_UNIT),

-- Dashboard & Akreditasi (Unila/Rektorat - Pimpinan only)
('iku-dashboard', 'IKU Dashboard', 'Dashboard Indikator Kinerja Utama', '#', 'heroicons:chart-bar-square', 'bg-blue-600', 'Dashboard & Akreditasi', 1, @ORG_UNILA),
('dashboard-pimpinan', 'Dashboard Pimpinan', 'Visualisasi Data dan Analitik untuk Pengambilan Keputusan', '#', 'RiBarChartBoxFill', 'bg-indigo-700', 'Dashboard & Akreditasi', 2, @ORG_UNILA),

-- Data dan Pelaporan (Unila/Rektorat)
('feeder-integrator', 'Feeder Integrator', 'Integrasi Data PDDikti', '/dashboard/feeder-integrator', 'heroicons:circle-stack', 'bg-cyan-600', 'Data dan Pelaporan', 1, @ORG_UNILA),
('sister-integrator', 'SISTER Integrator', 'Integrasi SISTER Kemenristekdikti', '/dashboard/sister-integrator', 'RiGovernmentFill', 'bg-purple-600', 'Data dan Pelaporan', 2, @ORG_UNILA),
('myunila-integrator', 'myUnila Integrator', 'Integrasi Apps Existing di Unila', '/dashboard/integrator', 'FaLink', 'bg-emerald-600', 'Data dan Pelaporan', 3, @ORG_UPT_TIK),
('data-unila', 'Data Unila', 'Raw Data Kebutuhan Pelaporan Data di Unila', '#', 'FaTable', 'bg-emerald-600', 'Data dan Pelaporan', 4, @ORG_UNILA),

-- Layanan (Semua Unit)
('helpdesk-tik', 'Helpdesk TIK', 'Layanan Bantuan TIK', 'https://helpdesktik.unila.ac.id', 'heroicons:phone', 'bg-red-500', 'Layanan', 1, @ORG_SEMUA_UNIT),
('blog-unila', 'Blog Unila', 'Portal Berita dan Artikel', '#', 'FaBlog', 'bg-pink-500', 'Layanan', 2, @ORG_SEMUA_UNIT),

-- Tools & Utilities (UPT TIK - Developer only)
('api-gateway', 'API Gateway', 'Kong Dashboard', '/portal/kong-admin', 'FaPlug', 'bg-slate-700', 'Tools & Utilities', 1, @ORG_UPT_TIK),
('monitoring', 'Monitoring & Observability', 'Grafana, Prometheus, Loki', '/portal/monitoring', 'FaChartLine', 'bg-orange-600', 'Tools & Utilities', 2, @ORG_UPT_TIK),
('manajemen-akses', 'Manajemen Akses', 'Identity & Access Management', '/dashboard/manajemen-akses', 'MdSecurity', 'bg-indigo-600', 'Tools & Utilities', 3, @ORG_UPT_TIK);

-- Insert new apps that don't exist yet
INSERT INTO man_akses.aplikasi (
    id_aplikasi,
    nm_aplikasi,
    ket_aplikasi,
    url,
    icon_name,
    icon_color,
    id_kategori,
    app_slug,
    urutan,
    a_tampil_portal,
    a_generate_menu,
    a_integrasi_cas,
    a_sistem_internal_pt,
    id_organisasi,
    tgl_create,
    last_update,
    last_sync
)
SELECT
    NEWID(),
    p.nm_aplikasi,
    p.ket_aplikasi,
    p.url,
    p.icon_name,
    p.icon_color,
    k.id_kategori,
    p.app_slug,
    p.urutan,
    1, -- a_tampil_portal
    0, -- a_generate_menu
    0, -- a_integrasi_cas
    0, -- a_sistem_internal_pt
    p.id_organisasi,
    GETDATE(),
    GETDATE(),
    GETDATE()
FROM #PortalApps p
INNER JOIN man_akses.kategori_aplikasi k ON k.nm_kategori = p.kategori
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi a
    WHERE a.app_slug = p.app_slug OR a.nm_aplikasi = p.nm_aplikasi
);

PRINT 'New aplikasi inserted';

-- Update existing apps with new columns (match by name)
UPDATE a
SET
    a.icon_name = p.icon_name,
    a.icon_color = p.icon_color,
    a.id_kategori = k.id_kategori,
    a.app_slug = COALESCE(a.app_slug, p.app_slug),
    a.urutan = p.urutan,
    a.a_tampil_portal = 1,
    a.id_organisasi = COALESCE(a.id_organisasi, p.id_organisasi),
    a.last_update = GETDATE()
FROM man_akses.aplikasi a
INNER JOIN #PortalApps p ON a.nm_aplikasi = p.nm_aplikasi
INNER JOIN man_akses.kategori_aplikasi k ON k.nm_kategori = p.kategori
WHERE a.icon_name IS NULL OR a.id_kategori IS NULL OR a.id_organisasi IS NULL;

PRINT 'Existing aplikasi updated';

-- Clean up temp table
DROP TABLE #PortalApps;

-- ============================================================================
-- STEP 3: Verify seeded data
-- ============================================================================
PRINT '';
PRINT '=== VERIFICATION ===';

SELECT 'Kategori Count: ' + CAST(COUNT(*) AS VARCHAR) as info
FROM man_akses.kategori_aplikasi WHERE soft_delete = 0;

SELECT 'Aplikasi Portal Count: ' + CAST(COUNT(*) AS VARCHAR) as info
FROM man_akses.aplikasi WHERE a_tampil_portal = 1;

-- Show summary
SELECT
    k.nm_kategori,
    COUNT(a.id_aplikasi) as app_count
FROM man_akses.kategori_aplikasi k
LEFT JOIN man_akses.aplikasi a ON a.id_kategori = k.id_kategori AND a.a_tampil_portal = 1
WHERE k.soft_delete = 0
GROUP BY k.nm_kategori, k.urutan
ORDER BY k.urutan;

PRINT '';
PRINT '=== Seeder completed successfully ===';
