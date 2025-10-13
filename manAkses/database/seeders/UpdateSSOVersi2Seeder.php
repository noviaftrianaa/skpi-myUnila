<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UpdateSSOVersi2Seeder extends Seeder
{
    private $stats = [
        'total' => 0,
        'success' => 0,
        'failed' => 0,
        'mahasiswa' => 0,
        'dosen' => 0,
        'tendik' => 0,
        'guest' => 0,
    ];

    // Cache untuk preload data
    private $mahasiswaCache = [];
    private $tendikCache = [];
    private $dosenCache = [];
    private $fakultasCache = [];

    /**
     * Run the database seeds.
     */
    public function run()
    {
        $start = microtime(true);
        echo "\n=== SSO User Sync Started ===\n";

        // Increase memory limit
        ini_set('memory_limit', '512M');
        echo "Memory limit: " . ini_get('memory_limit') . "\n";

        // Step 1: Count total users first
        $totalUsers = $this->countSsoUsers();
        $this->stats['total'] = $totalUsers;
        echo "Found {$totalUsers} users from radcheck\n";

        // Step 2: Preload fakultas domains (small data)
        echo "\nPreloading fakultas domains...\n";
        $this->preloadFakultasDomains();

        // Step 3: Process users dengan chunking (tidak load semua ke memory)
        echo "\nProcessing users in chunks...\n";
        $this->processUsersInChunks();

        // Step 4: Display stats
        $this->displayStats();

        $duration = round(microtime(true) - $start, 2);
        $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
        echo "\n=== Completed in {$duration}s | Peak Memory: {$peakMemory}MB ===\n";
    }

    /**
     * Count total SSO users
     */
    private function countSsoUsers(): int
    {
        return DB::connection('mysql')
            ->table('radcheck')
            ->where('a_aktif', 1)
            ->where('soft_delete', 0)
            ->whereNotNull('username')
            ->whereNotNull('email')
            ->whereNotNull('tanggal_lahir')
            ->where('tanggal_lahir', '!=', 0000-00-00)
            ->count();
    }

    /**
     * Preload fakultas domains (small data - aman di memory)
     */
    private function preloadFakultasDomains(): void
    {
        $fakultas = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->whereNotNull('singkatan')
            ->select('id_sms', 'singkatan')
            ->get();

        foreach ($fakultas as $f) {
            $this->fakultasCache[strtolower($f->singkatan)] = $f->id_sms;
        }
        echo "  Loaded: " . count($this->fakultasCache) . " domains\n";
    }

    /**
     * Process users dalam chunks langsung dari DB
     * TIDAK load semua users ke memory sekaligus
     */
    private function processUsersInChunks(): void
    {
        $chunkSize = 500; // Process 500 users at a time
        $offset = 0;
        $chunkNumber = 1;

        while (true) {
            // Get chunk of users dari DB
            $ssoUsers = DB::connection('mysql')
                ->table('radcheck')
                ->where('a_aktif', 1)
                ->where('soft_delete', 0)
                ->whereNotNull('username')
                ->whereNotNull('email')
                ->whereNotNull('tanggal_lahir')
                ->where('tanggal_lahir', '!=', 0000-00-00)
                ->select(
                    'id', 'username', 'value as password_hash',
                    'nm_pengguna', 'email', 'tanggal_lahir', 'nip', 'status',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->orderBy('id', 'desc')
                ->skip($offset)
                ->take($chunkSize)
                ->get();

            // Jika tidak ada data lagi, stop
            if ($ssoUsers->isEmpty()) {
                break;
            }

            $currentMemory = round(memory_get_usage(true) / 1024 / 1024, 2);
            $chunkEnd = $offset + $ssoUsers->count();
            $totalProgress = round(($chunkEnd / $this->stats['total']) * 100, 1);

            echo "  Chunk {$chunkNumber} | Rows: {$offset}-{$chunkEnd} ({$totalProgress}%) | Memory: {$currentMemory}MB\n";

            // Preload related data untuk chunk ini saja
            $this->preloadDataForChunk($ssoUsers->toArray());

            // Process users dalam chunk ini
            $this->processChunk($ssoUsers->toArray());

            // Clear cache setelah selesai untuk free memory
            $this->clearCache();

            // Next chunk
            $offset += $chunkSize;
            $chunkNumber++;

            // Force garbage collection
            gc_collect_cycles();
        }
    }

    /**
     * Preload data untuk 1 chunk saja (memory efficient)
     */
    private function preloadDataForChunk(array $ssoUsers): void
    {
        // Clear previous cache
        $this->clearCache();

        $nips = array_filter(array_unique(array_column($ssoUsers, 'nip')));

        if (empty($nips)) {
            return;
        }

        // Chunk NIPs jika terlalu besar (avoid SQL IN clause limit)
        $nipChunks = array_chunk($nips, 1000);

        // Preload mahasiswa
        foreach ($nipChunks as $nipChunk) {
            $mahasiswa = DB::connection('sqlsrv')
                ->table('pdrd.reg_pd')
                ->whereIn('nipd', $nipChunk)
                ->select('id_pd', 'nipd', 'id_sms')
                ->get();

            foreach ($mahasiswa as $m) {
                $this->mahasiswaCache[$m->nipd] = $m;
            }
        }

        // Preload tendik
        foreach ($nipChunks as $nipChunk) {
            $tendik = DB::connection('sqlsrv')
                ->table('sikep.pegawai')
                ->whereIn('nip', $nipChunk)
                ->where('soft_delete', 0)
                ->select('id_pegawai', 'nip', 'jns_pegawai')
                ->get();

            foreach ($tendik as $t) {
                $this->tendikCache[$t->nip] = $t;
            }
        }

        // Preload dosen
        foreach ($nipChunks as $nipChunk) {
            $dosen = DB::connection('sqlsrv')
                ->table('pdrd.sdm')
                ->whereIn('nip', $nipChunk)
                ->select('id_sdm', 'nip')
                ->get();

            foreach ($dosen as $d) {
                $this->dosenCache[$d->nip] = $d;
            }
        }
    }

    /**
     * Process 1 chunk of users
     */
    private function processChunk(array $ssoUsers): void
    {
        $batchSize = 50; // Process 50 per transaction
        $batches = array_chunk($ssoUsers, $batchSize);
        $chunkTotal = count($ssoUsers);
        $processed = 0;

        foreach ($batches as $batch) {
            DB::connection('sqlsrv')->transaction(function () use ($batch, &$processed, $chunkTotal) {
                foreach ($batch as $user) {
                    try {
                        $this->syncUser($user);
                        $this->stats['success']++;
                        $processed++;

                        // Show progress setiap 10 rows atau batch terakhir
                        if ($processed % 10 == 0 || $processed == $chunkTotal) {
                            $percentage = round(($processed / $chunkTotal) * 100);
                            echo "    Progress: {$processed}/{$chunkTotal} ({$percentage}%) - Success: {$this->stats['success']}, Failed: {$this->stats['failed']}\r";
                        }
                    } catch (\Exception $e) {
                        $this->stats['failed']++;
                        $processed++;
                        Log::error("SSO Sync Failed", [
                            'username' => $user->username ?? 'unknown',
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            });
        }
        echo "\n"; // New line setelah chunk selesai
    }

    /**
     * Clear cache untuk free memory
     */
    private function clearCache(): void
    {
        $this->mahasiswaCache = [];
        $this->tendikCache = [];
        $this->dosenCache = [];
    }

    /**
     * Sync single user
     */
    private function syncUser($user): void
    {
        // Convert array to object if needed
        if (is_array($user)) {
            $user = (object) $user;
        }

        // Determine role berdasarkan email domain dan database
        $roleData = $this->determineRole($user);

        // Upsert user
        $userId = $this->upsertUser($user, $roleData);

        // Upsert role
        $this->upsertRole($userId, $roleData);

        // Update stats
        $roleName = $this->getRoleName($roleData['id_peran']);
        if (isset($this->stats[$roleName])) {
            $this->stats[$roleName]++;
        }
    }

    /**
     * Determine role dengan prioritas:
     * 1. Email domain
     * 2. Database verification
     * 3. Default to Guest jika tidak ketemu
     */
    private function determineRole(object $user): array
    {
        $result = [
            'id_peran' => 40, // Default: Guest
            'id_pd_pengguna' => null,
            'id_sdm_pengguna' => null,
            'id_user_sikep' => null,
            'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515', // Default org
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: Email @students.unila.ac.id
        if ($domain === 'students') {
            $result['id_peran'] = 39;

            // Verify dengan reg_pd menggunakan nip (ini NPM/NIM)
            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;

                // Get organisasi by id_sms
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($mhs->id_sms);
            } else {
                Log::warning("Mahasiswa not found in reg_pd", [
                    'username' => $user->username,
                    'npm' => $user->nip
                ]);
            }
        }
        // TENDIK: Email @staff.unila.ac.id
        elseif ($domain === 'staff') {
            $result['id_peran'] = 111;

            // Verify dengan sikep.pegawai
            if (!empty($user->nip) && isset($this->tendikCache[$user->nip])) {
                $tendik = $this->tendikCache[$user->nip];

                // ✅ SET id_user_sikep (id_pegawai dari sikep.pegawai)
                $result['id_user_sikep'] = $tendik->id_pegawai;
            } else {
                Log::warning("Tendik not found in sikep.pegawai", [
                    'username' => $user->username,
                    'nip' => $user->nip
                ]);
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll (fakultas domain)
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;

            // Verify dengan pdrd.sdm
            if (!empty($user->nip) && isset($this->dosenCache[$user->nip])) {
                $dosen = $this->dosenCache[$user->nip];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;

                // Get organisasi by fakultas
                $id_sms = $this->fakultasCache[$domain];
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($id_sms);
            } else {
                Log::warning("Dosen not found in pdrd.sdm", [
                    'username' => $user->username,
                    'nip' => $user->nip,
                    'domain' => $domain
                ]);

                // Jika tidak ketemu di SDM, set ke Guest
                $result['id_peran'] = 40;
            }
        }
        // GUEST: Domain lain atau tidak dikenali
        else {
            Log::info("User set to Guest (unknown domain)", [
                'username' => $user->username,
                'email' => $user->email,
                'domain' => $domain
            ]);
        }

        return $result;
    }

    /**
     * Get organisasi ID by id_lembaga_asal
     */
    private function getOrganisasiByLembaga(string $idLembaga): string
    {
        static $cache = [];

        if (!isset($cache[$idLembaga])) {
            $org = DB::connection('sqlsrv')
                ->table('man_akses.unit_organisasi') // ✅ FIXED: unit_organisasi bukan organisasi
                ->where('id_lembaga_asal', $idLembaga)
                ->where('soft_delete', 0)
                ->value('id_organisasi');

            $cache[$idLembaga] = $org ?? 'e2b705a7-173e-464a-9fac-509128709515';
        }

        return $cache[$idLembaga];
    }

    /**
     * Upsert user ke man_akses.pengguna
     */
    private function upsertUser(object $user, array $roleData): string
    {
        $existing = DB::connection('sqlsrv')
            ->table('man_akses.pengguna')
            ->where('username', $user->username)
            ->where('soft_delete', 0)
            ->first();

        // Password Strategy: SHA1 Rehashing dengan bcrypt
        //
        // KONSEP: Wrap SHA1 hash dengan bcrypt (Password Rehashing)
        //
        // Flow:
        // 1. SSO store: SHA1(password) = "a94a8fe5..."
        // 2. Seeder sync:
        //    - password: SHA1 hash (untuk apps lain & SSO)
        //    - password_encrypt: bcrypt(SHA1 hash) = "$2y$12$..."
        // 3. Auth service verify:
        //    - User input: "unilajaya"
        //    - Compute: SHA1("unilajaya") = "a94a8fe5..."
        //    - Verify: bcrypt_verify("a94a8fe5...", password_encrypt)
        //    - Auth service TIDAK perlu tahu SHA1 langsung!
        //
        // Benefits:
        // ✅ Auth service hanya verify bcrypt (secure)
        // ✅ Auth service tidak perlu read/compare SHA1 langsung
        // ✅ SSO tetap pakai SHA1 (backward compatible)
        // ✅ Apps lain tetap bisa verify SHA1 dari password field
        // ✅ Best practice: Password rehashing
        // ✅ Performance: bcrypt ~300ms (acceptable)

        $passwordSha1 = !empty($user->password_hash) ? $user->password_hash : sha1('unilajaya');

        // Wrap SHA1 dengan bcrypt untuk security layer
        $passwordBcrypt = password_hash($passwordSha1, PASSWORD_BCRYPT, ['cost' => 12]);

        $userData = [
            'username' => $user->username,
            'nm_pengguna' => $user->nm_pengguna,
            'email' => $user->email,
            'tgl_lahir' => $user->tanggal_lahir !== 0000-00-00 ? $user->tanggal_lahir : null,
            'password' => $passwordSha1, // ✅ SHA1 - untuk SSO & apps lain
            'password_encrypt' => $passwordBcrypt, // ✅ bcrypt(SHA1) - untuk auth service
            'id_pd_pengguna' => $roleData['id_pd_pengguna'],
            'id_sdm_pengguna' => $roleData['id_sdm_pengguna'],
            'id_user_sikep' => $roleData['id_user_sikep'], // ✅ SET SIKEP ID
            'last_sync' => now(),
            'last_update' => now(),
            'id_updater' => '00000000-0000-0000-0000-000000000000',
            'soft_delete' => 0,
        ];

        if ($existing) {
            // Update existing user (termasuk password dari SSO)
            DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->where('id_pengguna', $existing->id_pengguna)
                ->update($userData);

            return $existing->id_pengguna;
        } else {
            // Insert new user dengan dual password
            $userId = Str::uuid()->toString();

            DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->insert(array_merge($userData, [
                    'id_pengguna' => $userId,
                    'jenis_kelamin' => 'L',
                    'approval_pengguna' => 1,
                    'a_aktif' => 1,
                    'disable' => 0,
                    'tgl_create' => now(),
                ]));

            return $userId;
        }
    }

    /**
     * Upsert user role ke man_akses.role_pengguna
     */
    private function upsertRole(string $userId, array $roleData): void
    {
        $existing = DB::connection('sqlsrv')
            ->table('man_akses.role_pengguna')
            ->where('id_pengguna', $userId)
            ->where('id_peran', $roleData['id_peran'])
            ->where('soft_delete', 0)
            ->first();

        $roleAttributes = [
            'id_peran' => $roleData['id_peran'],
            'id_organisasi' => $roleData['id_organisasi'],
            'last_sync' => now(),
            'last_update' => now(),
            'id_updater' => $userId,
            'soft_delete' => 0,
        ];

        if ($existing) {
            // Update existing role
            DB::connection('sqlsrv')
                ->table('man_akses.role_pengguna')
                ->where('id_role_pengguna', $existing->id_role_pengguna)
                ->update($roleAttributes);
        } else {
            // Insert new role
            DB::connection('sqlsrv')
                ->table('man_akses.role_pengguna')
                ->insert(array_merge($roleAttributes, [
                    'id_role_pengguna' => Str::uuid()->toString(),
                    'id_pengguna' => $userId,
                    'approval_peran' => 1,
                    'tgl_create' => now(),
                    'last_active' => now(),
                ]));
        }
    }

    /**
     * Get role name by id_peran
     */
    private function getRoleName(int $idPeran): string
    {
        $roles = [
            39 => 'mahasiswa',
            46 => 'dosen',
            111 => 'tendik',
            40 => 'guest',
        ];

        return $roles[$idPeran] ?? 'unknown';
    }

    /**
     * Display sync statistics
     */
    private function displayStats(): void
    {
        echo "\n=== Sync Statistics ===\n";
        echo "Total:      {$this->stats['total']}\n";
        echo "Success:    {$this->stats['success']}\n";
        echo "Failed:     {$this->stats['failed']}\n";
        echo "\nBy Role:\n";
        echo "Mahasiswa:  {$this->stats['mahasiswa']}\n";
        echo "Dosen:      {$this->stats['dosen']}\n";
        echo "Tendik:     {$this->stats['tendik']}\n";
        echo "Guest:      {$this->stats['guest']}\n";
    }
}
