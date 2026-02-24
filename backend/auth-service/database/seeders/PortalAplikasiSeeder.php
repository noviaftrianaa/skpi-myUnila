<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Portal Aplikasi Seeder
 *
 * Seeds kategori_aplikasi and aplikasi tables with portal data
 * Source: frontend/src/app/portal/page.tsx (static data)
 *
 * Usage:
 *   php artisan db:seed --class=PortalAplikasiSeeder
 */
class PortalAplikasiSeeder extends Seeder
{
    // Organisasi IDs
    private const ORG_UPT_TIK = 'c4453e71-a6db-4487-8f5e-84cb4de54fec';      // UPT TIK (Developer)
    private const ORG_UNILA = 'e2b705a7-173e-464a-9fac-509128709515';         // Universitas Lampung
    private const ORG_SEMUA_UNIT = '86942cdf-44f1-446e-8e9e-cb37bbbb16e6';    // Semua Unit

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Portal Aplikasi data...');

        // Step 1: Seed Kategori
        $kategoris = $this->seedKategori();

        // Step 2: Seed Aplikasi
        $this->seedAplikasi($kategoris);

        $this->command->info('Portal Aplikasi seeding completed!');
    }

    /**
     * Seed kategori_aplikasi table
     */
    private function seedKategori(): array
    {
        // Using Iconify format for consistency with frontend
        $kategoris = [
            ['nm_kategori' => 'Akademik', 'icon_kategori' => 'heroicons:book-open', 'icon_color' => 'bg-blue-500', 'urutan' => 1],
            ['nm_kategori' => 'Riset dan Kerjasama', 'icon_kategori' => 'heroicons:magnifying-glass', 'icon_color' => 'bg-purple-500', 'urutan' => 2],
            ['nm_kategori' => 'Kemahasiswaan', 'icon_kategori' => 'heroicons:users', 'icon_color' => 'bg-green-500', 'urutan' => 3],
            ['nm_kategori' => 'Alumni', 'icon_kategori' => 'heroicons:academic-cap', 'icon_color' => 'bg-orange-500', 'urutan' => 4],
            ['nm_kategori' => 'Dashboard & Akreditasi', 'icon_kategori' => 'heroicons:chart-bar-square', 'icon_color' => 'bg-indigo-500', 'urutan' => 5],
            ['nm_kategori' => 'Data dan Pelaporan', 'icon_kategori' => 'heroicons:circle-stack', 'icon_color' => 'bg-cyan-500', 'urutan' => 6],
            ['nm_kategori' => 'Layanan', 'icon_kategori' => 'heroicons:phone', 'icon_color' => 'bg-red-500', 'urutan' => 7],
            ['nm_kategori' => 'Tools & Utilities', 'icon_kategori' => 'heroicons:cog-6-tooth', 'icon_color' => 'bg-slate-500', 'urutan' => 8],
        ];

        $kategoriMap = [];

        foreach ($kategoris as $kategori) {
            $existing = DB::selectOne(
                "SELECT id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = ?",
                [$kategori['nm_kategori']]
            );

            if ($existing) {
                $kategoriMap[$kategori['nm_kategori']] = $existing->id_kategori;
                $this->command->line("  - Kategori '{$kategori['nm_kategori']}' already exists");
            } else {
                $id = Str::uuid()->toString();
                DB::insert(
                    "INSERT INTO man_akses.kategori_aplikasi
                    (id_kategori, nm_kategori, icon_kategori, icon_color, urutan, a_aktif, tgl_create, last_update, soft_delete)
                    VALUES (?, ?, ?, ?, ?, 1, GETDATE(), GETDATE(), 0)",
                    [$id, $kategori['nm_kategori'], $kategori['icon_kategori'], $kategori['icon_color'], $kategori['urutan']]
                );
                $kategoriMap[$kategori['nm_kategori']] = $id;
                $this->command->line("  + Kategori '{$kategori['nm_kategori']}' created");
            }
        }

        return $kategoriMap;
    }

    /**
     * Seed aplikasi table
     * Validation: Check by nm_aplikasi AND url (both must match)
     * - If nm_aplikasi AND url both match existing record → UPDATE
     * - Otherwise → INSERT new
     */
    private function seedAplikasi(array $kategoris): void
    {
        $apps = $this->getAplikasiData();

        $inserted = 0;
        $updated = 0;

        foreach ($apps as $app) {
            $kategoriId = $kategoris[$app['kategori']] ?? null;

            if (!$kategoriId) {
                $this->command->warn("  ! Kategori '{$app['kategori']}' not found for app '{$app['nm_aplikasi']}'");
                continue;
            }

            // Get id_organisasi from app data or use default (UNILA)
            $idOrganisasi = $app['id_organisasi'] ?? self::ORG_UNILA;

            // Get status flags with defaults
            $aTerintegrasi = $app['a_terintegrasi'] ?? false;
            $aComingSoon = $app['a_coming_soon'] ?? false;
            $aMaintenance = $app['a_maintenance'] ?? false;

            // Check if app exists by nm_aplikasi AND url (both must match)
            // Case-insensitive comparison for nm_aplikasi
            $existing = DB::selectOne(
                "SELECT id_aplikasi FROM man_akses.aplikasi
                 WHERE LOWER(nm_aplikasi) = LOWER(?) AND url = ?",
                [$app['nm_aplikasi'], $app['url']]
            );

            if ($existing) {
                // UPDATE existing app
                // Boolean flags:
                // - a_tampil_portal = 1 (show in portal)
                // - a_aktif = 1 (active)
                // - a_generate_menu = 0 (false)
                // - a_integrasi_cas = 0 (false)
                // - a_sistem_internal_pt = 0 (false)
                // - a_terintegrasi, a_coming_soon, a_maintenance from data
                // - expired_date = NULL (no expiry)
                DB::update(
                    "UPDATE man_akses.aplikasi SET
                        ket_aplikasi = ?,
                        icon_name = ?,
                        icon_color = ?,
                        id_kategori = ?,
                        id_organisasi = ?,
                        app_slug = ?,
                        urutan = ?,
                        a_tampil_portal = 1,
                        a_generate_menu = 0,
                        a_integrasi_cas = 0,
                        a_sistem_internal_pt = 0,
                        a_terintegrasi = ?,
                        a_coming_soon = ?,
                        a_maintenance = ?,
                        a_aktif = 1,
                        expired_date = NULL,
                        last_update = GETDATE(),
                        last_sync = GETDATE()
                    WHERE id_aplikasi = ?",
                    [
                        $app['ket_aplikasi'],
                        $app['icon_name'],
                        $app['icon_color'],
                        $kategoriId,
                        $idOrganisasi,
                        $app['app_slug'],
                        $app['urutan'],
                        $aTerintegrasi ? 1 : 0,
                        $aComingSoon ? 1 : 0,
                        $aMaintenance ? 1 : 0,
                        $existing->id_aplikasi
                    ]
                );
                $updated++;
                $this->command->line("  ~ Updated '{$app['nm_aplikasi']}'");
            } else {
                // INSERT new app
                DB::insert(
                    "INSERT INTO man_akses.aplikasi
                    (id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color, id_kategori, id_organisasi, app_slug, urutan,
                     a_tampil_portal, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, a_terintegrasi, a_coming_soon, a_maintenance,
                     a_aktif, expired_date, tgl_create, last_update, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, ?, ?, ?, 1, NULL, GETDATE(), GETDATE(), GETDATE())",
                    [
                        Str::uuid()->toString(),
                        $app['nm_aplikasi'],
                        $app['ket_aplikasi'],
                        $app['url'],
                        $app['icon_name'],
                        $app['icon_color'],
                        $kategoriId,
                        $idOrganisasi,
                        $app['app_slug'],
                        $app['urutan'],
                        $aTerintegrasi ? 1 : 0,
                        $aComingSoon ? 1 : 0,
                        $aMaintenance ? 1 : 0
                    ]
                );
                $inserted++;
                $this->command->line("  + Inserted '{$app['nm_aplikasi']}'");
            }
        }

        $this->command->info("  Aplikasi: {$inserted} inserted, {$updated} updated");
    }

    /**
     * Get aplikasi data from frontend static definition
     *
     * Organization mapping:
     * - ORG_SEMUA_UNIT: Apps accessible by all users regardless of homebase (Akademik, Kemahasiswaan, Alumni, Layanan)
     * - ORG_UNILA: Apps for Rektorat/Pimpinan (Dashboard, Data, Riset, Kepegawaian)
     * - ORG_UPT_TIK: Developer-only tools (Tools & Utilities)
     *
     * Status flags:
     * - a_terintegrasi: App integrated with portal SSO (true = can navigate directly)
     * - a_coming_soon: App is coming soon / not yet available
     * - a_maintenance: App is under maintenance
     *
     * Icon format: heroicons:xxx (Iconify format - compatible with frontend)
     * Color format: text-xxx-600/700 (Tailwind text color class - brighter colors)
     */
    private function getAplikasiData(): array
    {
        return [
            // Akademik - Semua Unit (accessible by all homebase: Mahasiswa, Dosen, etc.)
            ['app_slug' => 'presensi-sirandu', 'nm_aplikasi' => 'Presensi (SIRANDU)', 'ket_aplikasi' => 'Sistem Presensi Perkuliahan', 'url' => '#', 'icon_name' => 'heroicons:clipboard-document-check', 'icon_color' => 'text-green-600', 'kategori' => 'Akademik', 'urutan' => 1, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'siakadu', 'nm_aplikasi' => 'SIAKADU', 'ket_aplikasi' => 'Sistem Informasi Akademik', 'url' => '#', 'icon_name' => 'heroicons:clipboard-document-list', 'icon_color' => 'text-blue-600', 'kategori' => 'Akademik', 'urutan' => 2, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'e-kkn', 'nm_aplikasi' => 'E-KKN', 'ket_aplikasi' => 'Sistem Kuliah Kerja Nyata', 'url' => '#', 'icon_name' => 'heroicons:map-pin', 'icon_color' => 'text-teal-600', 'kategori' => 'Akademik', 'urutan' => 3, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'berdampak-mbkm', 'nm_aplikasi' => 'Berdampak (MBKM)', 'ket_aplikasi' => 'Merdeka Belajar Kampus Merdeka', 'url' => '#', 'icon_name' => 'heroicons:presentation-chart-line', 'icon_color' => 'text-cyan-600', 'kategori' => 'Akademik', 'urutan' => 4, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'v-class', 'nm_aplikasi' => 'V-CLASS', 'ket_aplikasi' => 'Platform Pembelajaran Virtual', 'url' => '#', 'icon_name' => 'heroicons:building-library', 'icon_color' => 'text-sky-600', 'kategori' => 'Akademik', 'urutan' => 5, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'wali', 'nm_aplikasi' => 'Wali', 'ket_aplikasi' => 'Sistem Perwalian', 'url' => '#', 'icon_name' => 'heroicons:users', 'icon_color' => 'text-violet-600', 'kategori' => 'Akademik', 'urutan' => 6, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'sikebas', 'nm_aplikasi' => 'SIKEBAS', 'ket_aplikasi' => 'Sistem Keringanan & Bebas UKT', 'url' => '#', 'icon_name' => 'heroicons:banknotes', 'icon_color' => 'text-emerald-600', 'kategori' => 'Akademik', 'urutan' => 7, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'sikep', 'nm_aplikasi' => 'SIKEP', 'ket_aplikasi' => 'Sistem Kepegawaian', 'url' => '#', 'icon_name' => 'heroicons:identification', 'icon_color' => 'text-rose-600', 'kategori' => 'Akademik', 'urutan' => 8, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'spmi', 'nm_aplikasi' => 'SPMI', 'ket_aplikasi' => 'Sistem Penjaminan Mutu Internal', 'url' => '#', 'icon_name' => 'heroicons:chart-bar', 'icon_color' => 'text-lime-600', 'kategori' => 'Akademik', 'urutan' => 9, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Riset dan Kerjasama - Universitas Lampung (Rektorat/Dosen)
            ['app_slug' => 'si-penelitian', 'nm_aplikasi' => 'SI Penelitian', 'ket_aplikasi' => 'Manajemen penelitian', 'url' => '#', 'icon_name' => 'heroicons:document-text', 'icon_color' => 'text-sky-600', 'kategori' => 'Riset dan Kerjasama', 'urutan' => 1, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'si-pengabdian', 'nm_aplikasi' => 'SI Pengabdian', 'ket_aplikasi' => 'Pengabdian masyarakat', 'url' => '#', 'icon_name' => 'heroicons:user-group', 'icon_color' => 'text-pink-600', 'kategori' => 'Riset dan Kerjasama', 'urutan' => 2, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'si-publikasi', 'nm_aplikasi' => 'SI Publikasi', 'ket_aplikasi' => 'Manajemen publikasi ilmiah', 'url' => '#', 'icon_name' => 'heroicons:newspaper', 'icon_color' => 'text-indigo-600', 'kategori' => 'Riset dan Kerjasama', 'urutan' => 3, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'sikerma', 'nm_aplikasi' => 'SIKERMA', 'ket_aplikasi' => 'Sistem Kerjasama Institusi', 'url' => '#', 'icon_name' => 'heroicons:building-office', 'icon_color' => 'text-fuchsia-600', 'kategori' => 'Riset dan Kerjasama', 'urutan' => 4, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Kemahasiswaan - Semua Unit (accessible by all: Mahasiswa)
            ['app_slug' => 'si-prestasi', 'nm_aplikasi' => 'SI Prestasi', 'ket_aplikasi' => 'Sistem Informasi Prestasi', 'url' => '#', 'icon_name' => 'heroicons:trophy', 'icon_color' => 'text-yellow-600', 'kategori' => 'Kemahasiswaan', 'urutan' => 1, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'beasiswa', 'nm_aplikasi' => 'Beasiswa', 'ket_aplikasi' => 'Sistem Informasi Beasiswa', 'url' => '#', 'icon_name' => 'heroicons:academic-cap', 'icon_color' => 'text-emerald-600', 'kategori' => 'Kemahasiswaan', 'urutan' => 2, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'ormawa', 'nm_aplikasi' => 'Ormawa', 'ket_aplikasi' => 'Organisasi Kemahasiswaan', 'url' => '#', 'icon_name' => 'heroicons:users', 'icon_color' => 'text-purple-600', 'kategori' => 'Kemahasiswaan', 'urutan' => 3, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'minat-bakat', 'nm_aplikasi' => 'Minat Bakat', 'ket_aplikasi' => 'Sistem Minat dan Bakat', 'url' => '#', 'icon_name' => 'heroicons:light-bulb', 'icon_color' => 'text-amber-600', 'kategori' => 'Kemahasiswaan', 'urutan' => 4, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Alumni - Semua Unit (accessible by all)
            ['app_slug' => 'tracer-study', 'nm_aplikasi' => 'Tracer Study', 'ket_aplikasi' => 'Pelacakan Alumni', 'url' => '#', 'icon_name' => 'heroicons:academic-cap', 'icon_color' => 'text-orange-600', 'kategori' => 'Alumni', 'urutan' => 1, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'service-layanan', 'nm_aplikasi' => 'Service Layanan', 'ket_aplikasi' => 'Layanan untuk Alumni', 'url' => '#', 'icon_name' => 'heroicons:hand-raised', 'icon_color' => 'text-teal-600', 'kategori' => 'Alumni', 'urutan' => 2, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Dashboard & Akreditasi - Universitas Lampung (Pimpinan only)
            ['app_slug' => 'iku-dashboard', 'nm_aplikasi' => 'IKU Dashboard', 'ket_aplikasi' => 'Dashboard Indikator Kinerja Utama', 'url' => '#', 'icon_name' => 'heroicons:chart-pie', 'icon_color' => 'text-blue-600', 'kategori' => 'Dashboard & Akreditasi', 'urutan' => 1, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],
            ['app_slug' => 'dashboard-pimpinan', 'nm_aplikasi' => 'Dashboard Pimpinan', 'ket_aplikasi' => 'Visualisasi Data dan Analitik untuk Pengambilan Keputusan', 'url' => '#', 'icon_name' => 'heroicons:chart-bar', 'icon_color' => 'text-indigo-600', 'kategori' => 'Dashboard & Akreditasi', 'urutan' => 2, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Data dan Pelaporan - Universitas Lampung/UPT TIK (INTEGRATED)
            ['app_slug' => 'feeder-integrator', 'nm_aplikasi' => 'Feeder Integrator', 'ket_aplikasi' => 'Integrasi Data PDDikti', 'url' => '/dashboard/feeder-integrator', 'icon_name' => 'heroicons:server', 'icon_color' => 'text-cyan-600', 'kategori' => 'Data dan Pelaporan', 'urutan' => 1, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'sister-integrator', 'nm_aplikasi' => 'SISTER Integrator', 'ket_aplikasi' => 'Integrasi SISTER Kemenristekdikti', 'url' => '/dashboard/sister-integrator', 'icon_name' => 'heroicons:building-office', 'icon_color' => 'text-purple-600', 'kategori' => 'Data dan Pelaporan', 'urutan' => 2, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'myunila-integrator', 'nm_aplikasi' => 'myUnila Integrator', 'ket_aplikasi' => 'Integrasi Apps Internal Unila (SIKEP, Siakadu, Sirandu, SIMPEDAM)', 'url' => '/dashboard/integrator', 'icon_name' => 'heroicons:link', 'icon_color' => 'text-emerald-600', 'kategori' => 'Data dan Pelaporan', 'urutan' => 3, 'id_organisasi' => self::ORG_UPT_TIK, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'data-unila', 'nm_aplikasi' => 'Data Unila', 'ket_aplikasi' => 'Raw Data Kebutuhan Pelaporan Data di Unila', 'url' => '#', 'icon_name' => 'heroicons:table-cells', 'icon_color' => 'text-emerald-600', 'kategori' => 'Data dan Pelaporan', 'urutan' => 4, 'id_organisasi' => self::ORG_UNILA, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Layanan - Semua Unit (publik/accessible by all)
            ['app_slug' => 'helpdesk-tik', 'nm_aplikasi' => 'Helpdesk TIK', 'ket_aplikasi' => 'Layanan Bantuan TIK', 'url' => 'https://helpdesktik.unila.ac.id', 'icon_name' => 'heroicons:phone', 'icon_color' => 'text-red-600', 'kategori' => 'Layanan', 'urutan' => 1, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => false],
            ['app_slug' => 'blog-unila', 'nm_aplikasi' => 'Blog Unila', 'ket_aplikasi' => 'Portal Berita dan Artikel', 'url' => '#', 'icon_name' => 'heroicons:newspaper', 'icon_color' => 'text-pink-600', 'kategori' => 'Layanan', 'urutan' => 2, 'id_organisasi' => self::ORG_SEMUA_UNIT, 'a_terintegrasi' => false, 'a_coming_soon' => true],

            // Tools & Utilities - UPT TIK (Developer only, INTEGRATED)
            ['app_slug' => 'api-gateway', 'nm_aplikasi' => 'API Gateway', 'ket_aplikasi' => 'Kong Dashboard', 'url' => '/portal/kong-admin', 'icon_name' => 'heroicons:cube', 'icon_color' => 'text-blue-600', 'kategori' => 'Tools & Utilities', 'urutan' => 1, 'id_organisasi' => self::ORG_UPT_TIK, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'monitoring', 'nm_aplikasi' => 'Monitoring & Observability', 'ket_aplikasi' => 'Grafana, Prometheus, Loki', 'url' => '/portal/monitoring', 'icon_name' => 'heroicons:chart-bar', 'icon_color' => 'text-orange-600', 'kategori' => 'Tools & Utilities', 'urutan' => 2, 'id_organisasi' => self::ORG_UPT_TIK, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'manajemen-akses', 'nm_aplikasi' => 'Manajemen Akses myUnila', 'ket_aplikasi' => 'Identity & Access Management', 'url' => '/dashboard/manajemen-akses', 'icon_name' => 'heroicons:key', 'icon_color' => 'text-indigo-600', 'kategori' => 'Tools & Utilities', 'urutan' => 3, 'id_organisasi' => self::ORG_UPT_TIK, 'a_terintegrasi' => true, 'a_coming_soon' => false],
            ['app_slug' => 'webmon', 'nm_aplikasi' => 'Web Monitoring', 'ket_aplikasi' => 'Web Monitoring & Early Warning System', 'url' => '/dashboard/monitoring', 'icon_name' => 'heroicons:shield-check', 'icon_color' => 'text-orange-600', 'kategori' => 'Tools & Utilities', 'urutan' => 4, 'id_organisasi' => self::ORG_UPT_TIK, 'a_terintegrasi' => true, 'a_coming_soon' => false],
        ];
    }
}
