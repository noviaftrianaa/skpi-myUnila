<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * SSO Filtered Sync Job
 *
 * Sync data dari MySQL radcheck (SSO) ke SQL Server man_akses.pengguna
 * dengan filter spesifik (username atau date range)
 */
class SyncSSOByFilterJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Job Configuration
     */
    public $timeout = 3600; // 1 hour timeout
    public $tries = 3; // Retry 3x jika gagal
    public $maxExceptions = 3;
    public $backoff = [60, 300, 900]; // Retry delay: 1min, 5min, 15min

    public $jobId;
    protected $syncId;
    protected $filterData;
    protected $chunkSize;
    protected $progressInterval;
    protected $totalUsers = 0;
    protected $processedUsers = 0;
    protected $successCount = 0;
    protected $failedCount = 0;

    // Role stats
    protected $mahasiswaCount = 0;
    protected $dosenCount = 0;
    protected $tendikCount = 0;
    protected $guestCount = 0;

    // Cache untuk preload data
    protected $mahasiswaCache = [];
    protected $tendikCache = [];
    protected $dosenCache = [];
    protected $fakultasCache = [];

    /**
     * Create a new job instance.
     */
    public function __construct(array $filterData, int $chunkSize = 100, int $progressInterval = 5)
    {
        $this->jobId = (string) Str::uuid();
        $this->filterData = $filterData;
        $this->chunkSize = $chunkSize;
        $this->progressInterval = $progressInterval;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('[SSO Filtered Sync Job] Starting', [
            'job_id' => $this->jobId,
            'filter' => $this->filterData,
            'chunk_size' => $this->chunkSize
        ]);

        try {
            // Initialize progress tracking
            $this->initializeProgress();

            // Set memory limit
            ini_set('memory_limit', '512M');

            // Preload fakultas domains (small data)
            $this->preloadFakultasDomains();

            // Get total users count with proper filters
            $query = $this->buildQuery();
            $this->totalUsers = $query->count();

            Log::info('[SSO Filtered Sync Job] Total users to sync', [
                'total' => $this->totalUsers,
                'filter' => $this->filterData
            ]);

            // Update progress with total
            $this->updateProgress(['total_records' => $this->totalUsers]);

            // Process users in chunks
            $this->processUsersInChunks();

            // Mark as completed
            $this->completeProgress();

            Log::info('[SSO Filtered Sync Job] Completed', [
                'job_id' => $this->jobId,
                'filter' => $this->filterData,
                'total' => $this->totalUsers,
                'success' => $this->successCount,
                'failed' => $this->failedCount,
                'mahasiswa' => $this->mahasiswaCount,
                'dosen' => $this->dosenCount,
                'tendik' => $this->tendikCount,
                'guest' => $this->guestCount,
            ]);

        } catch (\Exception $e) {
            Log::error('[SSO Filtered Sync Job] Failed', [
                'job_id' => $this->jobId,
                'filter' => $this->filterData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->failProgress($e->getMessage());
            throw $e;
        }
    }

    /**
     * Build query with filter
     */
    protected function buildQuery()
    {
        $query = DB::connection('mysql')
            ->table('radcheck')
            ->where('a_aktif', 1)
            ->where('soft_delete', 0)
            ->whereNotNull('username')
            ->whereNotNull('email')
            ->whereNotNull('tanggal_lahir')
            ->where('tanggal_lahir', '!=', 0000-00-00);

        // Apply specific filter
        switch ($this->filterData['type']) {
            case 'username':
                $query->where('username', $this->filterData['username']);
                break;

            case 'date':
                $query->whereDate('created_at', $this->filterData['date']);
                break;

            case 'date_range':
                if (isset($this->filterData['date_from'])) {
                    $query->whereDate('created_at', '>=', $this->filterData['date_from']);
                }
                if (isset($this->filterData['date_to'])) {
                    $query->whereDate('created_at', '<=', $this->filterData['date_to']);
                }
                break;
        }

        return $query;
    }

    /**
     * Preload fakultas domains (small data - aman di memory)
     */
    protected function preloadFakultasDomains(): void
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

        Log::info('[SSO Filtered Sync Job] Fakultas domains loaded', [
            'count' => count($this->fakultasCache)
        ]);
    }

    /**
     * Process users dalam chunks langsung dari DB
     */
    protected function processUsersInChunks(): void
    {
        $offset = 0;
        $chunkNumber = 1;

        while (true) {
            // Get chunk of users dari DB with filter
            $query = $this->buildQuery();

            $ssoUsers = $query
                ->select(
                    'id', 'username', 'value as password_hash',
                    'nm_pengguna', 'email', 'tanggal_lahir', 'nip', 'status',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->orderBy('id', 'desc')
                ->skip($offset)
                ->take($this->chunkSize)
                ->get();

            // Jika tidak ada data lagi, stop
            if ($ssoUsers->isEmpty()) {
                break;
            }

            $currentMemory = round(memory_get_usage(true) / 1024 / 1024, 2);
            $chunkEnd = $offset + $ssoUsers->count();
            $totalProgress = $this->totalUsers > 0 ? round(($chunkEnd / $this->totalUsers) * 100, 1) : 100;

            Log::info('[SSO Filtered Sync Job] Processing chunk', [
                'chunk' => $chunkNumber,
                'rows' => "{$offset}-{$chunkEnd}",
                'progress' => "{$totalProgress}%",
                'memory_mb' => $currentMemory
            ]);

            // Preload related data untuk chunk ini saja
            $this->preloadDataForChunk($ssoUsers->toArray());

            // Process users dalam chunk ini
            $this->processChunk($ssoUsers->toArray(), $chunkNumber);

            // Clear cache setelah selesai untuk free memory
            $this->clearCache();

            // Next chunk
            $offset += $this->chunkSize;
            $chunkNumber++;

            // Force garbage collection
            gc_collect_cycles();
        }
    }

    /**
     * Preload data untuk 1 chunk saja (memory efficient)
     */
    protected function preloadDataForChunk(array $ssoUsers): void
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
    protected function processChunk(array $ssoUsers, int $chunkNumber): void
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
                        $this->successCount++;
                        $processed++;

                        // Progress update every N rows
                        if ($processed % $this->progressInterval == 0 || $processed == $chunkTotal) {
                            $percentage = $this->totalUsers > 0
                                ? round(($this->processedUsers / $this->totalUsers) * 100, 2)
                                : 100;

                            $this->updateProgress([
                                'processed_records' => $this->processedUsers,
                                'success_count' => $this->successCount,
                                'failed_count' => $this->failedCount,
                                'current_chunk' => $chunkNumber
                            ]);

                            Log::info('[SSO Filtered Sync Job] Progress', [
                                'processed' => $this->processedUsers,
                                'total' => $this->totalUsers,
                                'percentage' => $percentage,
                                'success' => $this->successCount,
                                'failed' => $this->failedCount
                            ]);
                        }
                    } catch (\Exception $e) {
                        $this->failedCount++;
                        $processed++;
                        Log::error('[SSO Filtered Sync Job] User sync failed', [
                            'username' => $user->username ?? 'unknown',
                            'error' => $e->getMessage()
                        ]);
                    }

                    $this->processedUsers++;
                }
            });
        }
    }

    /**
     * Clear cache untuk free memory
     */
    protected function clearCache(): void
    {
        $this->mahasiswaCache = [];
        $this->tendikCache = [];
        $this->dosenCache = [];
    }

    /**
     * Sync single user
     */
    protected function syncUser($user): void
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
        if ($roleName === 'mahasiswa') {
            $this->mahasiswaCount++;
        } elseif ($roleName === 'dosen') {
            $this->dosenCount++;
        } elseif ($roleName === 'tendik') {
            $this->tendikCount++;
        } elseif ($roleName === 'guest') {
            $this->guestCount++;
        }
    }

    /**
     * Determine role dengan prioritas:
     * 1. Email domain
     * 2. Database verification
     * 3. Default to Guest jika tidak ketemu
     */
    protected function determineRole(object $user): array
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
                Log::warning('[SSO Filtered Sync Job] Mahasiswa not found in reg_pd', [
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

                // SET id_user_sikep (id_pegawai dari sikep.pegawai)
                $result['id_user_sikep'] = $tendik->id_pegawai;
            } else {
                Log::warning('[SSO Filtered Sync Job] Tendik not found in sikep.pegawai', [
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
                Log::warning('[SSO Filtered Sync Job] Dosen not found in pdrd.sdm', [
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
            Log::info('[SSO Filtered Sync Job] User set to Guest (unknown domain)', [
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
    protected function getOrganisasiByLembaga(string $idLembaga): string
    {
        static $cache = [];

        if (!isset($cache[$idLembaga])) {
            $org = DB::connection('sqlsrv')
                ->table('man_akses.unit_organisasi')
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
    protected function upsertUser(object $user, array $roleData): string
    {
        $existing = DB::connection('sqlsrv')
            ->table('man_akses.pengguna')
            ->where('username', $user->username)
            ->where('soft_delete', 0)
            ->first();

        // Password Strategy: SHA1 Rehashing dengan bcrypt
        $passwordSha1 = !empty($user->password_hash) ? $user->password_hash : sha1('unilajaya');

        // Wrap SHA1 dengan bcrypt untuk security layer
        $passwordBcrypt = password_hash($passwordSha1, PASSWORD_BCRYPT, ['cost' => 12]);

        $userData = [
            'username' => $user->username,
            'nm_pengguna' => $user->nm_pengguna,
            'email' => $user->email,
            'tgl_lahir' => $user->tanggal_lahir !== 0000-00-00 ? $user->tanggal_lahir : null,
            'password' => $passwordSha1, // SHA1 - untuk SSO & apps lain
            'password_encrypt' => $passwordBcrypt, // bcrypt(SHA1) - untuk auth service
            'id_pd_pengguna' => $roleData['id_pd_pengguna'],
            'id_sdm_pengguna' => $roleData['id_sdm_pengguna'],
            'id_user_sikep' => $roleData['id_user_sikep'],
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
    protected function upsertRole(string $userId, array $roleData): void
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
    protected function getRoleName(int $idPeran): string
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
     * Initialize progress tracking
     */
    protected function initializeProgress(): void
    {
        $this->syncId = Str::uuid()->toString();

        DB::connection('sqlsrv')->table('logger.sync_progress')->insert([
            'id_sync' => $this->syncId,
            'job_id' => $this->jobId,
            'sync_type' => 'sso_filtered_sync',
            'status' => 'running',
            'total_records' => 0,
            'processed_records' => 0,
            'success_count' => 0,
            'failed_count' => 0,
            'metadata' => json_encode(['filter' => $this->filterData]),
            'started_at' => now(),
            'created_by' => 'system',
        ]);
    }

    /**
     * Update progress
     */
    protected function updateProgress(array $data): void
    {
        DB::connection('sqlsrv')
            ->table('logger.sync_progress')
            ->where('id_sync', $this->syncId)
            ->update($data);
    }

    /**
     * Mark progress as completed
     */
    protected function completeProgress(): void
    {
        DB::connection('sqlsrv')
            ->table('logger.sync_progress')
            ->where('id_sync', $this->syncId)
            ->update([
                'status' => 'completed',
                'processed_records' => $this->processedUsers,
                'success_count' => $this->successCount,
                'failed_count' => $this->failedCount,
                'metadata' => json_encode([
                    'filter' => $this->filterData,
                    'mahasiswa' => $this->mahasiswaCount,
                    'dosen' => $this->dosenCount,
                    'tendik' => $this->tendikCount,
                    'guest' => $this->guestCount,
                ]),
                'completed_at' => now(),
            ]);
    }

    /**
     * Mark progress as failed
     */
    protected function failProgress(string $errorMessage): void
    {
        DB::connection('sqlsrv')
            ->table('logger.sync_progress')
            ->where('id_sync', $this->syncId)
            ->update([
                'status' => 'failed',
                'error_message' => $errorMessage,
                'completed_at' => now(),
            ]);
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('[SSO Filtered Sync Job] Job failed permanently', [
            'job_id' => $this->jobId,
            'filter' => $this->filterData,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        if ($this->syncId) {
            $this->failProgress($exception->getMessage());
        }
    }
}
