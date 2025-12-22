-- ============================================================================
-- SEEDER: Portal Aplikasi Data
-- Description: Seed kategori_aplikasi and aplikasi with portal data
-- Source: PortalAplikasiSeeder.php
-- Date: 2025-12-22
-- Updated: Sync with latest Laravel seeder (icon colors, all apps)
-- ============================================================================

-- ============================================================================
-- STEP 0: Define Organisation IDs (Get from database to ensure they exist)
-- ============================================================================
DECLARE @ORG_UPT_TIK UNIQUEIDENTIFIER;
DECLARE @ORG_UNILA UNIQUEIDENTIFIER;
DECLARE @ORG_SEMUA_UNIT UNIQUEIDENTIFIER;

-- Get existing organization IDs or use NULL if not found
SELECT @ORG_UPT_TIK = id_organisasi FROM man_akses.unit_organisasi WHERE LOWER(nm_organisasi) LIKE '%upt%tik%' OR LOWER(nm_organisasi) LIKE '%teknologi informasi%';
SELECT @ORG_UNILA = id_organisasi FROM man_akses.unit_organisasi WHERE LOWER(nm_organisasi) LIKE '%universitas lampung%' OR LOWER(nm_organisasi) = 'unila';
SELECT @ORG_SEMUA_UNIT = id_organisasi FROM man_akses.unit_organisasi WHERE LOWER(nm_organisasi) LIKE '%semua%unit%';

-- If not found, try to get any organization as fallback
IF @ORG_UPT_TIK IS NULL
    SELECT TOP 1 @ORG_UPT_TIK = id_organisasi FROM man_akses.unit_organisasi;

IF @ORG_UNILA IS NULL
    SELECT TOP 1 @ORG_UNILA = id_organisasi FROM man_akses.unit_organisasi;

IF @ORG_SEMUA_UNIT IS NULL
    SELECT TOP 1 @ORG_SEMUA_UNIT = id_organisasi FROM man_akses.unit_organisasi;

PRINT 'Organization IDs resolved:';
PRINT '  UPT TIK: ' + ISNULL(CONVERT(VARCHAR(36), @ORG_UPT_TIK), 'NULL');
PRINT '  UNILA: ' + ISNULL(CONVERT(VARCHAR(36), @ORG_UNILA), 'NULL');
PRINT '  SEMUA UNIT: ' + ISNULL(CONVERT(VARCHAR(36), @ORG_SEMUA_UNIT), 'NULL');
PRINT '';

-- ============================================================================
-- STEP 1: Insert/Update Kategori Aplikasi
-- ============================================================================
PRINT 'Seeding kategori_aplikasi...';

DECLARE @kat_akademik UNIQUEIDENTIFIER;
DECLARE @kat_riset UNIQUEIDENTIFIER;
DECLARE @kat_kemahasiswaan UNIQUEIDENTIFIER;
DECLARE @kat_alumni UNIQUEIDENTIFIER;
DECLARE @kat_dashboard UNIQUEIDENTIFIER;
DECLARE @kat_data UNIQUEIDENTIFIER;
DECLARE @kat_layanan UNIQUEIDENTIFIER;
DECLARE @kat_tools UNIQUEIDENTIFIER;

-- Akademik
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Akademik')
BEGIN
    SET @kat_akademik = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_akademik, 'Akademik', 'heroicons:book-open', 'bg-blue-500', 1, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Akademik created';
END
ELSE
BEGIN
    SELECT @kat_akademik = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Akademik';
    PRINT '  - Kategori Akademik already exists';
END

-- Riset dan Kerjasama
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Riset dan Kerjasama')
BEGIN
    SET @kat_riset = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_riset, 'Riset dan Kerjasama', 'heroicons:magnifying-glass', 'bg-purple-500', 2, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Riset dan Kerjasama created';
END
ELSE
BEGIN
    SELECT @kat_riset = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Riset dan Kerjasama';
    PRINT '  - Kategori Riset dan Kerjasama already exists';
END

-- Kemahasiswaan
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Kemahasiswaan')
BEGIN
    SET @kat_kemahasiswaan = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_kemahasiswaan, 'Kemahasiswaan', 'heroicons:users', 'bg-green-500', 3, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Kemahasiswaan created';
END
ELSE
BEGIN
    SELECT @kat_kemahasiswaan = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Kemahasiswaan';
    PRINT '  - Kategori Kemahasiswaan already exists';
END

-- Alumni
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Alumni')
BEGIN
    SET @kat_alumni = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_alumni, 'Alumni', 'heroicons:academic-cap', 'bg-orange-500', 4, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Alumni created';
END
ELSE
BEGIN
    SELECT @kat_alumni = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Alumni';
    PRINT '  - Kategori Alumni already exists';
END

-- Dashboard & Akreditasi
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Dashboard & Akreditasi')
BEGIN
    SET @kat_dashboard = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_dashboard, 'Dashboard & Akreditasi', 'heroicons:chart-bar-square', 'bg-indigo-500', 5, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Dashboard & Akreditasi created';
END
ELSE
BEGIN
    SELECT @kat_dashboard = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Dashboard & Akreditasi';
    PRINT '  - Kategori Dashboard & Akreditasi already exists';
END

-- Data dan Pelaporan
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Data dan Pelaporan')
BEGIN
    SET @kat_data = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_data, 'Data dan Pelaporan', 'heroicons:circle-stack', 'bg-cyan-500', 6, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Data dan Pelaporan created';
END
ELSE
BEGIN
    SELECT @kat_data = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Data dan Pelaporan';
    PRINT '  - Kategori Data dan Pelaporan already exists';
END

-- Layanan
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Layanan')
BEGIN
    SET @kat_layanan = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_layanan, 'Layanan', 'heroicons:phone', 'bg-red-500', 7, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Layanan created';
END
ELSE
BEGIN
    SELECT @kat_layanan = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Layanan';
    PRINT '  - Kategori Layanan already exists';
END

-- Tools & Utilities
IF NOT EXISTS (SELECT 1 FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Tools & Utilities')
BEGIN
    SET @kat_tools = NEWID();
    INSERT INTO man_akses.kategori_aplikasi (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
    VALUES (@kat_tools, 'Tools & Utilities', 'heroicons:cog-6-tooth', 'bg-slate-500', 8, 1, GETDATE(), GETDATE(), 0);
    PRINT '  + Kategori Tools & Utilities created';
END
ELSE
BEGIN
    SELECT @kat_tools = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Tools & Utilities';
    PRINT '  - Kategori Tools & Utilities already exists';
END

PRINT 'Kategori aplikasi seeded successfully';
PRINT '';

-- ============================================================================
-- STEP 2: Insert/Update Aplikasi
-- ============================================================================
PRINT 'Seeding aplikasi...';

-- Akademik Applications (Semua Unit)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Presensi (SIRANDU)', @ket = 'Sistem Presensi Perkuliahan', @url = '#', @icon_name = 'heroicons:clipboard-document-check', @icon_color = 'text-green-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'presensi-sirandu', @urutan = 1, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SIAKADU', @ket = 'Sistem Informasi Akademik', @url = '#', @icon_name = 'heroicons:clipboard-document-list', @icon_color = 'text-blue-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'siakadu', @urutan = 2, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'E-KKN', @ket = 'Sistem Kuliah Kerja Nyata', @url = '#', @icon_name = 'heroicons:map-pin', @icon_color = 'text-teal-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'e-kkn', @urutan = 3, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Berdampak (MBKM)', @ket = 'Merdeka Belajar Kampus Merdeka', @url = '#', @icon_name = 'heroicons:presentation-chart-line', @icon_color = 'text-cyan-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'berdampak-mbkm', @urutan = 4, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'V-CLASS', @ket = 'Platform Pembelajaran Virtual', @url = '#', @icon_name = 'heroicons:building-library', @icon_color = 'text-sky-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'v-class', @urutan = 5, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Wali', @ket = 'Sistem Perwalian', @url = '#', @icon_name = 'heroicons:users', @icon_color = 'text-violet-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'wali', @urutan = 6, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SIKEBAS', @ket = 'Sistem Keringanan & Bebas UKT', @url = '#', @icon_name = 'heroicons:banknotes', @icon_color = 'text-emerald-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'sikebas', @urutan = 7, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SIKEP', @ket = 'Sistem Kepegawaian', @url = '#', @icon_name = 'heroicons:identification', @icon_color = 'text-rose-600', @kategori = @kat_akademik, @org = @ORG_UNILA, @slug = 'sikep', @urutan = 8, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SPMI', @ket = 'Sistem Penjaminan Mutu Internal', @url = '#', @icon_name = 'heroicons:chart-bar', @icon_color = 'text-lime-600', @kategori = @kat_akademik, @org = @ORG_SEMUA_UNIT, @slug = 'spmi', @urutan = 9, @terintegrasi = 0, @coming_soon = 1;

-- Riset dan Kerjasama (UNILA)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SI Penelitian', @ket = 'Manajemen penelitian', @url = '#', @icon_name = 'heroicons:document-text', @icon_color = 'text-sky-600', @kategori = @kat_riset, @org = @ORG_UNILA, @slug = 'si-penelitian', @urutan = 1, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SI Pengabdian', @ket = 'Pengabdian masyarakat', @url = '#', @icon_name = 'heroicons:user-group', @icon_color = 'text-pink-600', @kategori = @kat_riset, @org = @ORG_UNILA, @slug = 'si-pengabdian', @urutan = 2, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SI Publikasi', @ket = 'Manajemen publikasi ilmiah', @url = '#', @icon_name = 'heroicons:newspaper', @icon_color = 'text-indigo-600', @kategori = @kat_riset, @org = @ORG_UNILA, @slug = 'si-publikasi', @urutan = 3, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SIKERMA', @ket = 'Sistem Kerjasama Institusi', @url = '#', @icon_name = 'heroicons:building-office', @icon_color = 'text-fuchsia-600', @kategori = @kat_riset, @org = @ORG_UNILA, @slug = 'sikerma', @urutan = 4, @terintegrasi = 0, @coming_soon = 1;

-- Kemahasiswaan (Semua Unit)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SI Prestasi', @ket = 'Sistem Informasi Prestasi', @url = '#', @icon_name = 'heroicons:trophy', @icon_color = 'text-yellow-600', @kategori = @kat_kemahasiswaan, @org = @ORG_SEMUA_UNIT, @slug = 'si-prestasi', @urutan = 1, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Beasiswa', @ket = 'Sistem Informasi Beasiswa', @url = '#', @icon_name = 'heroicons:academic-cap', @icon_color = 'text-emerald-600', @kategori = @kat_kemahasiswaan, @org = @ORG_SEMUA_UNIT, @slug = 'beasiswa', @urutan = 2, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Ormawa', @ket = 'Organisasi Kemahasiswaan', @url = '#', @icon_name = 'heroicons:users', @icon_color = 'text-purple-600', @kategori = @kat_kemahasiswaan, @org = @ORG_SEMUA_UNIT, @slug = 'ormawa', @urutan = 3, @terintegrasi = 0, @coming_soon = 1;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Minat Bakat', @ket = 'Sistem Minat dan Bakat', @url = '#', @icon_name = 'heroicons:light-bulb', @icon_color = 'text-amber-600', @kategori = @kat_kemahasiswaan, @org = @ORG_SEMUA_UNIT, @slug = 'minat-bakat', @urutan = 4, @terintegrasi = 0, @coming_soon = 1;

-- Alumni (Semua Unit)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Tracer Alumni', @ket = 'Sistem Pelacakan Alumni', @url = '#', @icon_name = 'heroicons:user-group', @icon_color = 'text-orange-600', @kategori = @kat_alumni, @org = @ORG_SEMUA_UNIT, @slug = 'tracer-alumni', @urutan = 1, @terintegrasi = 0, @coming_soon = 1;

-- Dashboard & Akreditasi (UNILA)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Dashboard Unila', @ket = 'Dashboard Institusi Unila', @url = '/dashboard', @icon_name = 'heroicons:presentation-chart-bar', @icon_color = 'text-indigo-600', @kategori = @kat_dashboard, @org = @ORG_UNILA, @slug = 'dashboard-unila', @urutan = 1, @terintegrasi = 1, @coming_soon = 0;

-- Data dan Pelaporan (UPT TIK)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Feeder Integrator', @ket = 'Integrasi Feeder PDDikti', @url = '/dashboard/integrator/feeder', @icon_name = 'heroicons:circle-stack', @icon_color = 'text-blue-600', @kategori = @kat_data, @org = @ORG_UPT_TIK, @slug = 'feeder-integrator', @urutan = 1, @terintegrasi = 1, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'SISTER Integrator', @ket = 'Integrasi SISTER (PDDIKTI)', @url = '/dashboard/integrator/sister', @icon_name = 'heroicons:share', @icon_color = 'text-purple-600', @kategori = @kat_data, @org = @ORG_UPT_TIK, @slug = 'sister-integrator', @urutan = 2, @terintegrasi = 1, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'myUnila Integrator', @ket = 'Integrasi Apps Existing di Unila', @url = '/dashboard/integrator', @icon_name = 'heroicons:link', @icon_color = 'text-emerald-600', @kategori = @kat_data, @org = @ORG_UPT_TIK, @slug = 'myunila-integrator', @urutan = 3, @terintegrasi = 1, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Data Unila', @ket = 'Raw Data Kebutuhan Pelaporan Data di Unila', @url = '#', @icon_name = 'heroicons:table-cells', @icon_color = 'text-emerald-600', @kategori = @kat_data, @org = @ORG_UNILA, @slug = 'data-unila', @urutan = 4, @terintegrasi = 0, @coming_soon = 1;

-- Layanan (Semua Unit)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Helpdesk TIK', @ket = 'Layanan Bantuan TIK', @url = 'https://helpdesktik.unila.ac.id', @icon_name = 'heroicons:phone', @icon_color = 'text-red-600', @kategori = @kat_layanan, @org = @ORG_SEMUA_UNIT, @slug = 'helpdesk-tik', @urutan = 1, @terintegrasi = 0, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Blog Unila', @ket = 'Portal Berita dan Artikel', @url = '#', @icon_name = 'heroicons:newspaper', @icon_color = 'text-pink-600', @kategori = @kat_layanan, @org = @ORG_SEMUA_UNIT, @slug = 'blog-unila', @urutan = 2, @terintegrasi = 0, @coming_soon = 1;

-- Tools & Utilities (UPT TIK - Developer Only, INTEGRATED)
EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'API Gateway', @ket = 'Kong Dashboard', @url = '/portal/kong-admin', @icon_name = 'heroicons:cube', @icon_color = 'text-blue-600', @kategori = @kat_tools, @org = @ORG_UPT_TIK, @slug = 'api-gateway', @urutan = 1, @terintegrasi = 1, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Monitoring & Observability', @ket = 'Grafana, Prometheus, Loki', @url = '/portal/monitoring', @icon_name = 'heroicons:chart-bar', @icon_color = 'text-orange-600', @kategori = @kat_tools, @org = @ORG_UPT_TIK, @slug = 'monitoring', @urutan = 2, @terintegrasi = 1, @coming_soon = 0;

EXEC sp_executesql N'
    IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url)
    BEGIN
        INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan, a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance, a_aktif, expired_date, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @nm, @ket, @url, @icon_name, @icon_color, @kategori, @org, @slug, @urutan, 1, 0, 0, 0, @terintegrasi, @coming_soon, 0, 1, NULL, GETDATE(), GETDATE(), GETDATE());
        PRINT ''  + '' + @nm;
    END
    ELSE
    BEGIN
        UPDATE man_akses.aplikasi SET ket_aplikasi = @ket, icon_name = @icon_name, icon_color = @icon_color, id_kategori = @kategori, id_organisasi = @org, app_slug = @slug, urutan = @urutan, a_terintegrasi = @terintegrasi, a_coming_soon = @coming_soon, last_update = GETDATE(), last_sync = GETDATE()
        WHERE LOWER(nm_aplikasi) = LOWER(@nm) AND url = @url;
        PRINT ''  ~ '' + @nm;
    END',
N'@nm NVARCHAR(255), @ket NVARCHAR(500), @url NVARCHAR(500), @icon_name NVARCHAR(100), @icon_color NVARCHAR(50), @kategori UNIQUEIDENTIFIER, @org UNIQUEIDENTIFIER, @slug NVARCHAR(100), @urutan INT, @terintegrasi BIT, @coming_soon BIT',
@nm = 'Manajemen Akses myUnila', @ket = 'Identity & Access Management', @url = '/dashboard/manajemen-akses', @icon_name = 'heroicons:key', @icon_color = 'text-indigo-600', @kategori = @kat_tools, @org = @ORG_UPT_TIK, @slug = 'manajemen-akses', @urutan = 3, @terintegrasi = 1, @coming_soon = 0;

PRINT '';
PRINT 'Aplikasi seeded successfully';
PRINT '';
PRINT '============================================================================';
PRINT 'SEEDER COMPLETED SUCCESSFULLY';
PRINT '============================================================================';
