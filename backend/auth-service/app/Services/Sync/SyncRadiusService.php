<?php

namespace App\Services\Sync;

use App\Services\RadiusApi\RadiusApiClient;
use App\Services\RadiusApi\RadiusUserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Sync Radius Service
 *
 * Sync data pengguna dari database Radius (MySQL) ke ManAkses (SQL Server)
 * Menggunakan pattern dari UpdateSSOVersi2Seeder dengan optimasi:
 * - Chunking (500 users per chunk)
 * - Batch transactions (50 per transaction)
 * - Native SQL queries (no Eloquent)
 * - Progress tracking via Cache
 * - Logging ke database
 */
class SyncRadiusService
{
    private const CHUNK_SIZE = 500;
    private const BATCH_SIZE = 50;
    private const CACHE_KEY_PROGRESS = 'sync_radius_progress';
    private const CACHE_KEY_STATUS = 'sync_radius_status';

    private array $stats = [
        'total' => 0,
        'processed' => 0,
        'success' => 0,
        'failed' => 0,
        'mahasiswa' => 0,
        'dosen' => 0,
        'tendik' => 0,
        'guest' => 0,
    ];

    private array $errors = [];

    // Cache untuk preload data per chunk
    private array $mahasiswaCache = [];
    private array $tendikCache = [];
    private array $dosenCache = [];
    private array $fakultasCache = [];

    private ?int $syncLogId = null;
    private string $syncedBy;
    private float $syncStartTime;

    // Radius API support
    private ?RadiusUserService $radiusService = null;
    private bool $useApi = false;

    public function __construct()
    {
        $this->syncedBy = '00000000-0000-0000-0000-000000000000'; // System user

        // Check if Radius API is enabled
        $apiEnabled = config('radius_api.enabled', false);
        $apiConfigured = !empty(config('radius_api.base_url'));

        if ($apiEnabled && $apiConfigured) {
            $client = new RadiusApiClient();
            $this->radiusService = new RadiusUserService($client);
            $this->useApi = $this->radiusService->isAvailable();
        }
    }

    /**
     * Start sync process
     *
     * @param string|null $userId User yang menjalankan sync
     * @param array $options Filter options [role_filter, username_filter]
     * @return array
     */
    public function startSync(?string $userId = null, array $options = []): array
    {
        // Check if sync is already running
        if ($this->isSyncRunning()) {
            return [
                'success' => false,
                'message' => 'Sync sedang berjalan. Silakan tunggu hingga selesai.',
                'status' => 'running',
            ];
        }

        if ($userId) {
            $this->syncedBy = $userId;
        }

        try {
            // Set memory limit
            ini_set('memory_limit', '512M');

            // Initialize progress
            $this->initProgress();

            // Create sync log entry
            $this->createSyncLog();

            // Count total users
            $this->stats['total'] = $this->countSsoUsers($options);
            $this->updateProgress();

            if ($this->stats['total'] === 0) {
                $this->completeSyncLog('completed', 'Tidak ada data untuk disync');
                return [
                    'success' => true,
                    'message' => 'Tidak ada data untuk disync',
                    'stats' => $this->stats,
                ];
            }

            // Preload fakultas domains
            $this->preloadFakultasDomains();

            // Process users in chunks
            $this->processUsersInChunks($options);

            // Complete sync log
            $this->completeSyncLog('completed');

            return [
                'success' => true,
                'message' => 'Sync selesai',
                'stats' => $this->stats,
                'errors' => array_slice($this->errors, 0, 10), // Return first 10 errors
            ];

        } catch (\Exception $e) {
            Log::error('SyncRadiusService::startSync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->completeSyncLog('failed', $e->getMessage());

            return [
                'success' => false,
                'message' => 'Sync gagal: ' . $e->getMessage(),
                'stats' => $this->stats,
            ];
        } finally {
            $this->clearProgress();
        }
    }

    /**
     * Get current sync progress
     */
    public function getProgress(): array
    {
        $progress = Cache::get(self::CACHE_KEY_PROGRESS, [
            'status' => 'idle',
            'total' => 0,
            'processed' => 0,
            'success' => 0,
            'failed' => 0,
            'percentage' => 0,
            'current_chunk' => 0,
            'total_chunks' => 0,
            'started_at' => null,
            'elapsed_time' => 0,
        ]);

        // Calculate elapsed time if running
        if ($progress['status'] === 'running' && $progress['started_at']) {
            $progress['elapsed_time'] = time() - $progress['started_at'];
        }

        return $progress;
    }

    /**
     * Check if sync is running
     */
    public function isSyncRunning(): bool
    {
        $status = Cache::get(self::CACHE_KEY_STATUS, 'idle');
        return $status === 'running';
    }

    /**
     * Get sync logs history
     * Uses logger.sync_logs table (same structure as sister/feeder/myunila)
     */
    public function getSyncLogs(int $limit = 10): array
    {
        $logs = DB::connection('sqlsrv')
            ->select("
                SELECT TOP (?)
                    id,
                    endpoint_name,
                    endpoint_key,
                    sync_type,
                    status,
                    total_records,
                    inserted_count,
                    updated_count,
                    failed_count,
                    skipped_count,
                    duration_ms,
                    error_message,
                    error_details,
                    synced_by,
                    synced_at
                FROM logger.sync_logs
                WHERE endpoint_name = 'radius_sync'
                ORDER BY synced_at DESC
            ", [$limit]);

        return array_map(function ($log) {
            return [
                'id' => $log->id,
                'endpoint_name' => $log->endpoint_name,
                'endpoint_key' => $log->endpoint_key,
                'sync_type' => $log->sync_type,
                'status' => $log->status,
                'total_records' => $log->total_records,
                'inserted_count' => $log->inserted_count,
                'updated_count' => $log->updated_count,
                'failed_count' => $log->failed_count,
                'skipped_count' => $log->skipped_count,
                'duration_ms' => $log->duration_ms,
                'error_message' => $log->error_message,
                'synced_by' => $log->synced_by,
                'synced_at' => $log->synced_at,
            ];
        }, $logs);
    }

    /**
     * Count total SSO users with filters
     */
    private function countSsoUsers(array $options = []): int
    {
        // Use API if available
        if ($this->useApi && $this->radiusService) {
            $stats = $this->radiusService->getStats();
            return $stats['total_sso'] ?? 0;
        }

        // Fallback to database
        $query = "
            SELECT COUNT(*) as total
            FROM radcheck
            WHERE a_aktif = 1
              AND soft_delete = 0
              AND username IS NOT NULL
              AND email IS NOT NULL
              AND tanggal_lahir IS NOT NULL
              AND tanggal_lahir != '0000-00-00'
        ";

        $params = [];

        // Filter by username if provided
        if (!empty($options['username_filter'])) {
            $query .= " AND username LIKE ?";
            $params[] = '%' . $options['username_filter'] . '%';
        }

        $result = DB::connection('radius')->selectOne($query, $params);

        return (int) $result->total;
    }

    /**
     * Preload fakultas domains
     */
    private function preloadFakultasDomains(): void
    {
        $fakultas = DB::connection('sqlsrv')->select("
            SELECT id_sms, singkatan
            FROM pdrd.sms
            WHERE soft_delete = 0
              AND singkatan IS NOT NULL
        ");

        foreach ($fakultas as $f) {
            $this->fakultasCache[strtolower($f->singkatan)] = $f->id_sms;
        }

        Log::info('SyncRadiusService: Preloaded fakultas domains', [
            'count' => count($this->fakultasCache)
        ]);
    }

    /**
     * Process users in chunks
     */
    private function processUsersInChunks(array $options = []): void
    {
        // Use API if available
        if ($this->useApi && $this->radiusService) {
            $this->processUsersInChunksViaApi($options);
            return;
        }

        // Fallback to database
        $this->processUsersInChunksViaDatabase($options);
    }

    /**
     * Process users in chunks via API
     */
    private function processUsersInChunksViaApi(array $options = []): void
    {
        $page = 1;
        $chunkNumber = 1;
        $totalChunks = ceil($this->stats['total'] / self::CHUNK_SIZE);

        while (true) {
            // Get page of users from API
            $result = $this->radiusService->getUsers($page, self::CHUNK_SIZE, $options['username_filter'] ?? null);

            if (!$result || empty($result['data'])) {
                break;
            }

            $ssoUsers = array_map(function ($user) {
                // Convert API response to object format matching database query
                return (object) [
                    'id' => $user['id'] ?? null,
                    'username' => $user['username'] ?? null,
                    'password_hash' => null, // API doesn't return password
                    'nm_pengguna' => $user['nm_pengguna'] ?? null,
                    'email' => $user['email'] ?? null,
                    'tanggal_lahir' => $user['tanggal_lahir'] ?? null,
                    'nip' => $user['nip'] ?? null,
                    'status' => $user['status'] ?? null,
                    'domain_email' => $user['domain_email'] ?? null,
                ];
            }, $result['data']);

            if (empty($ssoUsers)) {
                break;
            }

            // Update progress
            $progress = $this->getProgress();
            $progress['current_chunk'] = $chunkNumber;
            $progress['total_chunks'] = $totalChunks;
            $progress['source'] = 'api';
            Cache::put(self::CACHE_KEY_PROGRESS, $progress, 3600);

            Log::info("SyncRadiusService: Processing chunk {$chunkNumber}/{$totalChunks} via API", [
                'page' => $page,
                'count' => count($ssoUsers),
            ]);

            // Preload related data for this chunk
            $this->preloadDataForChunk($ssoUsers);

            // Process chunk
            $this->processChunk($ssoUsers);

            // Clear cache after chunk
            $this->clearCache();

            // Check if there are more pages
            $totalPages = $result['total_pages'] ?? 1;
            if ($page >= $totalPages) {
                break;
            }

            // Next page
            $page++;
            $chunkNumber++;

            // Force garbage collection
            gc_collect_cycles();
        }
    }

    /**
     * Process users in chunks via database (fallback)
     */
    private function processUsersInChunksViaDatabase(array $options = []): void
    {
        $offset = 0;
        $chunkNumber = 1;
        $totalChunks = ceil($this->stats['total'] / self::CHUNK_SIZE);

        while (true) {
            // Get chunk of users
            $query = "
                SELECT
                    id,
                    username,
                    value as password_hash,
                    nm_pengguna,
                    email,
                    tanggal_lahir,
                    nip,
                    status,
                    SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email
                FROM radcheck
                WHERE a_aktif = 1
                  AND soft_delete = 0
                  AND username IS NOT NULL
                  AND email IS NOT NULL
                  AND tanggal_lahir IS NOT NULL
                  AND tanggal_lahir != '0000-00-00'
            ";

            $params = [];

            if (!empty($options['username_filter'])) {
                $query .= " AND username LIKE ?";
                $params[] = '%' . $options['username_filter'] . '%';
            }

            $query .= " ORDER BY id DESC LIMIT ? OFFSET ?";
            $params[] = self::CHUNK_SIZE;
            $params[] = $offset;

            $ssoUsers = DB::connection('radius')->select($query, $params);

            if (empty($ssoUsers)) {
                break;
            }

            // Update progress
            $progress = $this->getProgress();
            $progress['current_chunk'] = $chunkNumber;
            $progress['total_chunks'] = $totalChunks;
            $progress['source'] = 'database';
            Cache::put(self::CACHE_KEY_PROGRESS, $progress, 3600);

            Log::info("SyncRadiusService: Processing chunk {$chunkNumber}/{$totalChunks} via database", [
                'offset' => $offset,
                'count' => count($ssoUsers),
            ]);

            // Preload related data for this chunk
            $this->preloadDataForChunk($ssoUsers);

            // Process chunk
            $this->processChunk($ssoUsers);

            // Clear cache after chunk
            $this->clearCache();

            // Next chunk
            $offset += self::CHUNK_SIZE;
            $chunkNumber++;

            // Force garbage collection
            gc_collect_cycles();
        }
    }

    /**
     * Preload related data for chunk
     */
    private function preloadDataForChunk(array $ssoUsers): void
    {
        $this->clearCache();

        $nips = array_filter(array_unique(array_column($ssoUsers, 'nip')));

        if (empty($nips)) {
            return;
        }

        // Chunk NIPs to avoid SQL IN limit
        $nipChunks = array_chunk($nips, 500);

        foreach ($nipChunks as $nipChunk) {
            $placeholders = implode(',', array_fill(0, count($nipChunk), '?'));

            // Preload mahasiswa
            $mahasiswa = DB::connection('sqlsrv')->select("
                SELECT id_pd, nipd, id_sms
                FROM pdrd.reg_pd
                WHERE nipd IN ({$placeholders})
            ", $nipChunk);

            foreach ($mahasiswa as $m) {
                $this->mahasiswaCache[$m->nipd] = $m;
            }

            // Preload tendik
            $tendik = DB::connection('sqlsrv')->select("
                SELECT id_pegawai, nip, jns_pegawai
                FROM sikep.pegawai
                WHERE nip IN ({$placeholders})
                  AND soft_delete = 0
            ", $nipChunk);

            foreach ($tendik as $t) {
                $this->tendikCache[$t->nip] = $t;
            }

            // Preload dosen
            $dosen = DB::connection('sqlsrv')->select("
                SELECT id_sdm, nip
                FROM pdrd.sdm
                WHERE nip IN ({$placeholders})
            ", $nipChunk);

            foreach ($dosen as $d) {
                $this->dosenCache[$d->nip] = $d;
            }
        }
    }

    /**
     * Process single chunk
     */
    private function processChunk(array $ssoUsers): void
    {
        $batches = array_chunk($ssoUsers, self::BATCH_SIZE);

        foreach ($batches as $batch) {
            DB::connection('sqlsrv')->transaction(function () use ($batch) {
                foreach ($batch as $user) {
                    try {
                        $this->syncUser($user);
                        $this->stats['success']++;
                    } catch (\Exception $e) {
                        $this->stats['failed']++;
                        $this->errors[] = [
                            'username' => $user->username ?? 'unknown',
                            'error' => $e->getMessage(),
                        ];

                        Log::warning('SyncRadiusService: Failed to sync user', [
                            'username' => $user->username ?? 'unknown',
                            'error' => $e->getMessage(),
                        ]);
                    }

                    $this->stats['processed']++;
                    $this->updateProgress();
                }
            });
        }
    }

    /**
     * Sync single user
     */
    private function syncUser(object $user): void
    {
        // Determine role
        $roleData = $this->determineRole($user);

        // Upsert user
        $userId = $this->upsertUser($user, $roleData);

        // Upsert role
        $this->upsertRole($userId, $roleData);

        // Update stats by role
        $roleName = $this->getRoleName($roleData['id_peran']);
        if (isset($this->stats[$roleName])) {
            $this->stats[$roleName]++;
        }
    }

    /**
     * Determine user role based on email domain
     */
    private function determineRole(object $user): array
    {
        $result = [
            'id_peran' => 40, // Default: Guest
            'id_pd_pengguna' => null,
            'id_sdm_pengguna' => null,
            'id_user_sikep' => null,
            'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515', // Default org (Unila)
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: @students.unila.ac.id
        if ($domain === 'students') {
            $result['id_peran'] = 39;

            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($mhs->id_sms);
            }
        }
        // TENDIK: @staff.unila.ac.id
        elseif ($domain === 'staff') {
            $result['id_peran'] = 111;

            if (!empty($user->nip) && isset($this->tendikCache[$user->nip])) {
                $tendik = $this->tendikCache[$user->nip];
                $result['id_user_sikep'] = $tendik->id_pegawai;
            }
        }
        // DOSEN: @ft, @fp, @fmipa, etc (fakultas domain)
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;

            if (!empty($user->nip) && isset($this->dosenCache[$user->nip])) {
                $dosen = $this->dosenCache[$user->nip];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($this->fakultasCache[$domain]);
            } else {
                // Not found in SDM, set to Guest
                $result['id_peran'] = 40;
            }
        }

        return $result;
    }

    /**
     * Get organisasi ID by lembaga
     */
    private function getOrganisasiByLembaga(string $idLembaga): string
    {
        static $cache = [];

        if (!isset($cache[$idLembaga])) {
            $result = DB::connection('sqlsrv')->selectOne("
                SELECT id_organisasi
                FROM man_akses.unit_organisasi
                WHERE id_lembaga_asal = ?
                  AND soft_delete = 0
            ", [$idLembaga]);

            $cache[$idLembaga] = $result->id_organisasi ?? 'e2b705a7-173e-464a-9fac-509128709515';
        }

        return $cache[$idLembaga];
    }

    /**
     * Upsert user to man_akses.pengguna
     */
    private function upsertUser(object $user, array $roleData): string
    {
        // Check existing user
        $existing = DB::connection('sqlsrv')->selectOne("
            SELECT id_pengguna
            FROM man_akses.pengguna
            WHERE username = ?
              AND soft_delete = 0
        ", [$user->username]);

        // Prepare password
        $passwordSha1 = !empty($user->password_hash) ? $user->password_hash : sha1('unilajaya');
        $passwordBcrypt = password_hash($passwordSha1, PASSWORD_BCRYPT, ['cost' => 12]);

        $now = now()->format('Y-m-d H:i:s');

        if ($existing) {
            // Update existing user
            DB::connection('sqlsrv')->update("
                UPDATE man_akses.pengguna
                SET nm_pengguna = ?,
                    email = ?,
                    tgl_lahir = ?,
                    password = ?,
                    password_encrypt = ?,
                    id_pd_pengguna = ?,
                    id_sdm_pengguna = ?,
                    id_user_sikep = ?,
                    last_sync = ?,
                    last_update = ?,
                    id_updater = ?
                WHERE id_pengguna = ?
            ", [
                $user->nm_pengguna,
                $user->email,
                $user->tanggal_lahir !== '0000-00-00' ? $user->tanggal_lahir : null,
                $passwordSha1,
                $passwordBcrypt,
                $roleData['id_pd_pengguna'],
                $roleData['id_sdm_pengguna'],
                $roleData['id_user_sikep'],
                $now,
                $now,
                $this->syncedBy,
                $existing->id_pengguna,
            ]);

            return $existing->id_pengguna;
        } else {
            // Insert new user
            $userId = Str::uuid()->toString();

            DB::connection('sqlsrv')->insert("
                INSERT INTO man_akses.pengguna (
                    id_pengguna, username, nm_pengguna, email, tgl_lahir,
                    password, password_encrypt, jenis_kelamin,
                    id_pd_pengguna, id_sdm_pengguna, id_user_sikep,
                    approval_pengguna, a_aktif, disable,
                    tgl_create, last_sync, last_update, id_updater, soft_delete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ", [
                $userId,
                $user->username,
                $user->nm_pengguna,
                $user->email,
                $user->tanggal_lahir !== '0000-00-00' ? $user->tanggal_lahir : null,
                $passwordSha1,
                $passwordBcrypt,
                'L', // Default gender
                $roleData['id_pd_pengguna'],
                $roleData['id_sdm_pengguna'],
                $roleData['id_user_sikep'],
                1, // approval_pengguna
                1, // a_aktif
                0, // disable
                $now,
                $now,
                $now,
                $this->syncedBy,
                0, // soft_delete
            ]);

            return $userId;
        }
    }

    /**
     * Upsert role to man_akses.role_pengguna
     */
    private function upsertRole(string $userId, array $roleData): void
    {
        // Check existing role
        $existing = DB::connection('sqlsrv')->selectOne("
            SELECT id_role_pengguna
            FROM man_akses.role_pengguna
            WHERE id_pengguna = ?
              AND id_peran = ?
              AND soft_delete = 0
        ", [$userId, $roleData['id_peran']]);

        $now = now()->format('Y-m-d H:i:s');

        if ($existing) {
            // Update existing role
            DB::connection('sqlsrv')->update("
                UPDATE man_akses.role_pengguna
                SET id_organisasi = ?,
                    last_sync = ?,
                    last_update = ?,
                    id_updater = ?
                WHERE id_role_pengguna = ?
            ", [
                $roleData['id_organisasi'],
                $now,
                $now,
                $userId,
                $existing->id_role_pengguna,
            ]);
        } else {
            // Insert new role
            DB::connection('sqlsrv')->insert("
                INSERT INTO man_akses.role_pengguna (
                    id_role_pengguna, id_pengguna, id_peran, id_organisasi,
                    approval_peran, tgl_create, last_sync, last_update,
                    last_active, id_updater, soft_delete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ", [
                Str::uuid()->toString(),
                $userId,
                $roleData['id_peran'],
                $roleData['id_organisasi'],
                1, // approval_peran
                $now,
                $now,
                $now,
                $now,
                $userId,
                0, // soft_delete
            ]);
        }
    }

    /**
     * Get role name by id_peran
     */
    private function getRoleName(int $idPeran): string
    {
        return match ($idPeran) {
            39 => 'mahasiswa',
            46 => 'dosen',
            111 => 'tendik',
            default => 'guest',
        };
    }

    /**
     * Initialize progress tracking
     */
    private function initProgress(): void
    {
        Cache::put(self::CACHE_KEY_STATUS, 'running', 3600);
        Cache::put(self::CACHE_KEY_PROGRESS, [
            'status' => 'running',
            'total' => 0,
            'processed' => 0,
            'success' => 0,
            'failed' => 0,
            'percentage' => 0,
            'current_chunk' => 0,
            'total_chunks' => 0,
            'started_at' => time(),
            'elapsed_time' => 0,
        ], 3600);
    }

    /**
     * Update progress in cache
     */
    private function updateProgress(): void
    {
        $percentage = $this->stats['total'] > 0
            ? round(($this->stats['processed'] / $this->stats['total']) * 100, 1)
            : 0;

        $progress = Cache::get(self::CACHE_KEY_PROGRESS, []);
        $progress['total'] = $this->stats['total'];
        $progress['processed'] = $this->stats['processed'];
        $progress['success'] = $this->stats['success'];
        $progress['failed'] = $this->stats['failed'];
        $progress['percentage'] = $percentage;

        Cache::put(self::CACHE_KEY_PROGRESS, $progress, 3600);
    }

    /**
     * Clear progress tracking
     */
    private function clearProgress(): void
    {
        $progress = Cache::get(self::CACHE_KEY_PROGRESS, []);
        $progress['status'] = 'completed';
        Cache::put(self::CACHE_KEY_PROGRESS, $progress, 300); // Keep for 5 minutes
        Cache::put(self::CACHE_KEY_STATUS, 'idle', 300);
    }

    /**
     * Clear data cache
     */
    private function clearCache(): void
    {
        $this->mahasiswaCache = [];
        $this->tendikCache = [];
        $this->dosenCache = [];
    }

    /**
     * Create sync log entry
     * Uses logger.sync_logs table (same structure as sister/feeder/myunila)
     */
    private function createSyncLog(): void
    {
        $this->syncStartTime = microtime(true);

        // Insert and get the ID
        DB::connection('sqlsrv')->insert("
            INSERT INTO logger.sync_logs (
                endpoint_name, endpoint_key, sync_type, status,
                total_records, inserted_count, updated_count, failed_count, skipped_count,
                synced_by, synced_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
        ", [
            'radius_sync',
            'pengguna',
            'manual',
            'running',
            0, 0, 0, 0, 0,
            $this->syncedBy,
        ]);

        // Get the inserted ID
        $result = DB::connection('sqlsrv')->selectOne("SELECT SCOPE_IDENTITY() as id");
        $this->syncLogId = $result->id ?? null;
    }

    /**
     * Complete sync log entry
     * Uses logger.sync_logs table (same structure as sister/feeder/myunila)
     */
    private function completeSyncLog(string $status, ?string $errorMessage = null): void
    {
        if (!$this->syncLogId) {
            return;
        }

        // Calculate duration in milliseconds
        $durationMs = isset($this->syncStartTime)
            ? (int) ((microtime(true) - $this->syncStartTime) * 1000)
            : 0;

        // Calculate inserted vs updated
        // Note: We track success = inserted + updated, need to differentiate
        // For simplicity, if user exists before = update, else = insert
        // This is approximated based on stats

        $errorDetails = null;
        if (!empty($this->errors)) {
            $errorDetails = json_encode(array_slice($this->errors, 0, 20));
        }

        DB::connection('sqlsrv')->update("
            UPDATE logger.sync_logs
            SET status = ?,
                total_records = ?,
                inserted_count = ?,
                updated_count = ?,
                failed_count = ?,
                skipped_count = ?,
                duration_ms = ?,
                error_message = ?,
                error_details = ?
            WHERE id = ?
        ", [
            $status === 'completed' ? 'success' : $status,
            $this->stats['total'],
            $this->stats['success'], // Approximate: all success as inserted
            0, // We don't track update vs insert separately for now
            $this->stats['failed'],
            0, // No skip logic implemented
            $durationMs,
            $errorMessage ? substr($errorMessage, 0, 1000) : null,
            $errorDetails,
            $this->syncLogId,
        ]);
    }
}
