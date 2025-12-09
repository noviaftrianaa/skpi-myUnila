<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SSO Radius Controller
 * API untuk fetch data SSO dari radius database (MySQL)
 * Response berupa JSON tanpa insert ke database
 */
class SsoRadiusController extends Controller
{
    // Cache untuk preload data
    private $mahasiswaCache = [];
    private $tendikCache = [];
    private $dosenCache = [];
    private $fakultasCache = [];

    /**
     * Get SSO users stats from radius database
     * GET /api/live/sso-radius/stats
     */
    public function stats()
    {
        try {
            $stats = [
                'total_sso_users' => $this->countSsoUsers(),
                'by_status' => $this->countByStatus(),
                'by_domain' => $this->countByDomain(),
                'database' => 'radius (MySQL)',
                'timestamp' => now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'SSO Radius statistics retrieved successfully',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Radius stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get SSO stats: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get SSO users list with pagination
     * GET /api/live/sso-radius/users?page=1&limit=10&search=
     */
    public function users(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 10);
            $search = $request->input('search', '');
            $offset = ($page - 1) * $limit;

            // Build query
            $query = DB::connection('mysql')
                ->table('radcheck')
                ->where('a_aktif', 1)
                ->where('soft_delete', 0)
                ->whereNotNull('username')
                ->whereNotNull('email')
                ->whereNotNull('tanggal_lahir')
                ->whereRaw("CAST(tanggal_lahir AS CHAR) <> '0000-00-00'");

            // Apply search
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                      ->orWhere('nm_pengguna', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%");
                });
            }

            // Get total count
            $total = $query->count();

            // Get paginated data
            $users = $query
                ->select(
                    'id',
                    'username',
                    'nm_pengguna',
                    'email',
                    'tanggal_lahir',
                    'nip',
                    'status',
                    'a_aktif',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->orderBy('id', 'desc')
                ->skip($offset)
                ->take($limit)
                ->get();

            // Preload related data for this chunk
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk($users->toArray());

            // Enrich users with role info from determineRole logic
            $enrichedUsers = $users->map(function ($user) {
                $roleData = $this->determineRoleWithDetails($user);

                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'nm_pengguna' => $user->nm_pengguna,
                    'email' => $user->email,
                    'tanggal_lahir' => $user->tanggal_lahir,
                    'nip' => $user->nip,
                    'status' => $user->status,
                    'domain_email' => $user->domain_email,
                    'role_pengguna' => [
                        'id_peran' => $roleData['id_peran'],
                        'nm_peran' => $roleData['nm_peran'],
                        'id_organisasi' => $roleData['id_organisasi'],
                        'nm_organisasi' => $roleData['nm_organisasi'],
                        'id_pd_pengguna' => $roleData['id_pd_pengguna'],
                        'id_sdm_pengguna' => $roleData['id_sdm_pengguna'],
                        'id_user_sikep' => $roleData['id_user_sikep'],
                    ],
                    'found_in_pdut' => $roleData['id_pd_pengguna'] || $roleData['id_sdm_pengguna'] || $roleData['id_user_sikep'] ? true : false,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'SSO users retrieved successfully',
                'data' => $enrichedUsers,
                'meta' => [
                    'total' => $total,
                    'page' => (int) $page,
                    'limit' => (int) $limit,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Radius users error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get SSO users: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview sync data for specific user
     * GET /api/live/sso-radius/preview/{username}
     */
    public function preview(string $username)
    {
        try {
            $user = DB::connection('mysql')
                ->table('radcheck')
                ->where('username', $username)
                ->select(
                    'id',
                    'username',
                    'value as password_hash',
                    'nm_pengguna',
                    'email',
                    'tanggal_lahir',
                    'nip',
                    'status',
                    'a_aktif',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found in radius database',
                ], 404);
            }

            // Preload data
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk([$user]);

            // Determine role
            $roleData = $this->determineRole($user);

            // Check if user exists in man_akses.pengguna
            $existingPengguna = DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->where('username', $username)
                ->where('soft_delete', 0)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'User preview generated successfully',
                'data' => [
                    'radius_data' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'nm_pengguna' => $user->nm_pengguna,
                        'email' => $user->email,
                        'tanggal_lahir' => $user->tanggal_lahir,
                        'nip' => $user->nip,
                        'status' => $user->status,
                        'domain_email' => $user->domain_email,
                        'has_password' => !empty($user->password_hash),
                    ],
                    'detected_role' => [
                        'id_peran' => $roleData['id_peran'],
                        'role_name' => $this->getRoleName($roleData['id_peran']),
                        'id_pd_pengguna' => $roleData['id_pd_pengguna'],
                        'id_sdm_pengguna' => $roleData['id_sdm_pengguna'],
                        'id_user_sikep' => $roleData['id_user_sikep'],
                        'id_organisasi' => $roleData['id_organisasi'],
                    ],
                    'existing_pengguna' => $existingPengguna ? [
                        'id_pengguna' => $existingPengguna->id_pengguna,
                        'username' => $existingPengguna->username,
                        'nm_pengguna' => $existingPengguna->nm_pengguna,
                        'email' => $existingPengguna->email,
                        'last_sync' => $existingPengguna->last_sync ?? null,
                    ] : null,
                    'sync_action' => $existingPengguna ? 'UPDATE' : 'INSERT',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Radius preview error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview user: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Count SSO users
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
            ->whereRaw("CAST(tanggal_lahir AS CHAR) <> '0000-00-00'")
            ->count();
    }

    /**
     * Count by status
     */
    private function countByStatus(): array
    {
        $result = DB::connection('mysql')
            ->table('radcheck')
            ->select('a_aktif', DB::raw('COUNT(*) as total'))
            ->whereNotNull('username')
            ->groupBy('a_aktif')
            ->get();

        $stats = ['aktif' => 0, 'nonaktif' => 0];
        foreach ($result as $row) {
            if ($row->a_aktif == 1) {
                $stats['aktif'] = $row->total;
            } else {
                $stats['nonaktif'] = $row->total;
            }
        }
        return $stats;
    }

    /**
     * Count by email domain
     */
    private function countByDomain(): array
    {
        $result = DB::connection('mysql')
            ->table('radcheck')
            ->select(DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain"), DB::raw('COUNT(*) as total'))
            ->where('a_aktif', 1)
            ->where('soft_delete', 0)
            ->whereNotNull('email')
            ->groupBy('domain')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        $stats = [];
        foreach ($result as $row) {
            $stats[$row->domain] = $row->total;
        }
        return $stats;
    }

    /**
     * Preload fakultas domains
     */
    private function preloadFakultasDomains(): void
    {
        if (!empty($this->fakultasCache)) {
            return;
        }

        $fakultas = DB::connection('sqlsrv')
            ->table('pdrd.sms')
            ->where('soft_delete', 0)
            ->whereNotNull('singkatan')
            ->select('id_sms', 'singkatan')
            ->get();

        foreach ($fakultas as $f) {
            $this->fakultasCache[strtolower($f->singkatan)] = $f->id_sms;
        }
    }

    /**
     * Preload data for chunk
     */
    private function preloadDataForChunk(array $ssoUsers): void
    {
        $this->mahasiswaCache = [];
        $this->tendikCache = [];
        $this->dosenCache = [];

        $nips = array_filter(array_unique(array_column($ssoUsers, 'nip')));

        if (empty($nips)) {
            return;
        }

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
     * Determine role based on email domain and database
     */
    private function determineRole(object $user): array
    {
        $result = [
            'id_peran' => 40, // Default: Guest
            'id_pd_pengguna' => null,
            'id_sdm_pengguna' => null,
            'id_user_sikep' => null,
            'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: Email @students.unila.ac.id
        if ($domain === 'students') {
            $result['id_peran'] = 39;

            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($mhs->id_sms);
            }
        }
        // TENDIK: Email @staff.unila.ac.id
        elseif ($domain === 'staff') {
            $result['id_peran'] = 111;

            if (!empty($user->nip) && isset($this->tendikCache[$user->nip])) {
                $tendik = $this->tendikCache[$user->nip];
                $result['id_user_sikep'] = $tendik->id_pegawai;
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;

            if (!empty($user->nip) && isset($this->dosenCache[$user->nip])) {
                $dosen = $this->dosenCache[$user->nip];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;
                $id_sms = $this->fakultasCache[$domain];
                $result['id_organisasi'] = $this->getOrganisasiByLembaga($id_sms);
            } else {
                $result['id_peran'] = 40; // Set to Guest if not found
            }
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
                ->table('man_akses.unit_organisasi')
                ->where('id_lembaga_asal', $idLembaga)
                ->where('soft_delete', 0)
                ->value('id_organisasi');

            $cache[$idLembaga] = $org ?? 'e2b705a7-173e-464a-9fac-509128709515';
        }

        return $cache[$idLembaga];
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
     * Determine role with full details (nm_peran, nm_organisasi)
     * Based on email domain and PDUT database verification
     */
    private function determineRoleWithDetails(object $user): array
    {
        $result = [
            'id_peran' => 40, // Default: Guest
            'nm_peran' => 'Guest',
            'id_pd_pengguna' => null,
            'id_sdm_pengguna' => null,
            'id_user_sikep' => null,
            'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
            'nm_organisasi' => 'Universitas Lampung',
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: Email @students.unila.ac.id
        if ($domain === 'students') {
            $result['id_peran'] = 39;
            $result['nm_peran'] = 'Mahasiswa';

            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;
                $orgData = $this->getOrganisasiWithName($mhs->id_sms);
                $result['id_organisasi'] = $orgData['id_organisasi'];
                $result['nm_organisasi'] = $orgData['nm_organisasi'];
            }
        }
        // TENDIK: Email @staff.unila.ac.id
        elseif ($domain === 'staff') {
            $result['id_peran'] = 111;
            $result['nm_peran'] = 'Tendik';

            if (!empty($user->nip) && isset($this->tendikCache[$user->nip])) {
                $tendik = $this->tendikCache[$user->nip];
                $result['id_user_sikep'] = $tendik->id_pegawai;
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll (fakultas domain)
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;
            $result['nm_peran'] = 'Dosen';

            if (!empty($user->nip) && isset($this->dosenCache[$user->nip])) {
                $dosen = $this->dosenCache[$user->nip];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;
                $id_sms = $this->fakultasCache[$domain];
                $orgData = $this->getOrganisasiWithName($id_sms);
                $result['id_organisasi'] = $orgData['id_organisasi'];
                $result['nm_organisasi'] = $orgData['nm_organisasi'];
            } else {
                // Jika tidak ketemu di SDM, set ke Guest
                $result['id_peran'] = 40;
                $result['nm_peran'] = 'Guest';
            }
        }

        return $result;
    }

    /**
     * Get organisasi ID and name by id_lembaga_asal
     */
    private function getOrganisasiWithName(string $idLembaga): array
    {
        static $cache = [];

        if (!isset($cache[$idLembaga])) {
            $org = DB::connection('sqlsrv')
                ->table('man_akses.unit_organisasi')
                ->where('id_lembaga_asal', $idLembaga)
                ->where('soft_delete', 0)
                ->select('id_organisasi', 'nm_lemb')
                ->first();

            $cache[$idLembaga] = [
                'id_organisasi' => $org->id_organisasi ?? 'e2b705a7-173e-464a-9fac-509128709515',
                'nm_organisasi' => $org->nm_lemb ?? 'Universitas Lampung',
            ];
        }

        return $cache[$idLembaga];
    }

    /**
     * Get user detail with assigned role_pengguna
     * GET /api/live/sso-radius/user-role/{username}
     */
    public function userRole(string $username)
    {
        try {
            // Get user from radius database
            $radiusUser = DB::connection('mysql')
                ->table('radcheck')
                ->where('username', $username)
                ->select(
                    'id',
                    'username',
                    'nm_pengguna',
                    'email',
                    'tanggal_lahir',
                    'nip',
                    'status',
                    'a_aktif',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->first();

            if (!$radiusUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found in radius database',
                ], 404);
            }

            // Get user from man_akses.pengguna
            $pengguna = DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->where('username', $username)
                ->where('soft_delete', 0)
                ->first();

            if (!$pengguna) {
                // User exists in radius but not synced to man_akses yet
                $this->preloadFakultasDomains();
                $this->preloadDataForChunk([$radiusUser]);
                $detectedRole = $this->determineRole($radiusUser);

                return response()->json([
                    'success' => true,
                    'message' => 'User found in radius but not synced to man_akses',
                    'data' => [
                        'radius_data' => [
                            'id' => $radiusUser->id,
                            'username' => $radiusUser->username,
                            'nm_pengguna' => $radiusUser->nm_pengguna,
                            'email' => $radiusUser->email,
                            'tanggal_lahir' => $radiusUser->tanggal_lahir,
                            'nip' => $radiusUser->nip,
                            'status' => $radiusUser->status,
                            'domain_email' => $radiusUser->domain_email,
                        ],
                        'pengguna' => null,
                        'role_pengguna' => [],
                        'detected_role' => [
                            'id_peran' => $detectedRole['id_peran'],
                            'role_name' => $this->getRoleName($detectedRole['id_peran']),
                        ],
                        'sync_status' => 'NOT_SYNCED',
                    ],
                ]);
            }

            // Get role_pengguna with peran and organisasi details
            $rolePengguna = DB::connection('sqlsrv')
                ->table('man_akses.role_pengguna as rp')
                ->leftJoin('man_akses.peran as p', 'rp.id_peran', '=', 'p.id_peran')
                ->leftJoin('man_akses.unit_organisasi as uo', 'rp.id_organisasi', '=', 'uo.id_organisasi')
                ->where('rp.id_pengguna', $pengguna->id_pengguna)
                ->where('rp.soft_delete', 0)
                ->select(
                    'rp.id_role_pengguna',
                    'rp.id_pengguna',
                    'rp.id_peran',
                    'p.nm_peran',
                    'rp.id_organisasi',
                    'uo.nm_lemb as nm_organisasi',
                    'rp.sk_penugasan',
                    'rp.tgl_sk_penugasan',
                    'rp.approval_peran',
                    'rp.tgl_kadaluarsa',
                    'rp.last_active',
                    'rp.tgl_create',
                    'rp.last_sync'
                )
                ->get();

            // Preload for detected role
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk([$radiusUser]);
            $detectedRole = $this->determineRole($radiusUser);

            return response()->json([
                'success' => true,
                'message' => 'User and role_pengguna retrieved successfully',
                'data' => [
                    'radius_data' => [
                        'id' => $radiusUser->id,
                        'username' => $radiusUser->username,
                        'nm_pengguna' => $radiusUser->nm_pengguna,
                        'email' => $radiusUser->email,
                        'tanggal_lahir' => $radiusUser->tanggal_lahir,
                        'nip' => $radiusUser->nip,
                        'status' => $radiusUser->status,
                        'domain_email' => $radiusUser->domain_email,
                    ],
                    'pengguna' => [
                        'id_pengguna' => $pengguna->id_pengguna,
                        'username' => $pengguna->username,
                        'nm_pengguna' => $pengguna->nm_pengguna,
                        'email' => $pengguna->email,
                        'tgl_lahir' => $pengguna->tgl_lahir ?? null,
                        'id_pd_pengguna' => $pengguna->id_pd_pengguna ?? null,
                        'id_sdm_pengguna' => $pengguna->id_sdm_pengguna ?? null,
                        'id_user_sikep' => $pengguna->id_user_sikep ?? null,
                        'last_sync' => $pengguna->last_sync ?? null,
                        'a_aktif' => $pengguna->a_aktif ?? null,
                    ],
                    'role_pengguna' => $rolePengguna->map(function ($role) {
                        return [
                            'id_role_pengguna' => $role->id_role_pengguna,
                            'id_peran' => $role->id_peran,
                            'nm_peran' => $role->nm_peran,
                            'id_organisasi' => $role->id_organisasi,
                            'nm_organisasi' => $role->nm_organisasi,
                            'sk_penugasan' => $role->sk_penugasan,
                            'tgl_sk_penugasan' => $role->tgl_sk_penugasan,
                            'approval_peran' => $role->approval_peran,
                            'tgl_kadaluarsa' => $role->tgl_kadaluarsa,
                            'last_active' => $role->last_active,
                            'tgl_create' => $role->tgl_create,
                            'last_sync' => $role->last_sync,
                        ];
                    }),
                    'detected_role' => [
                        'id_peran' => $detectedRole['id_peran'],
                        'role_name' => $this->getRoleName($detectedRole['id_peran']),
                        'id_pd_pengguna' => $detectedRole['id_pd_pengguna'],
                        'id_sdm_pengguna' => $detectedRole['id_sdm_pengguna'],
                        'id_user_sikep' => $detectedRole['id_user_sikep'],
                        'id_organisasi' => $detectedRole['id_organisasi'],
                    ],
                    'sync_status' => 'SYNCED',
                    'total_roles' => $rolePengguna->count(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Radius user-role error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user role: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get users list with their assigned role_pengguna (paginated)
     * GET /api/live/sso-radius/users-with-roles?page=1&limit=10&search=
     */
    public function usersWithRoles(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 10);
            $search = $request->input('search', '');
            $offset = ($page - 1) * $limit;

            // Build query for radius users
            $query = DB::connection('mysql')
                ->table('radcheck')
                ->where('a_aktif', 1)
                ->where('soft_delete', 0)
                ->whereNotNull('username')
                ->whereNotNull('email')
                ->whereNotNull('tanggal_lahir')
                ->whereRaw("CAST(tanggal_lahir AS CHAR) <> '0000-00-00'");

            // Apply search
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                      ->orWhere('nm_pengguna', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%");
                });
            }

            // Get total count
            $total = $query->count();

            // Get paginated radius users
            $radiusUsers = $query
                ->select(
                    'id',
                    'username',
                    'nm_pengguna',
                    'email',
                    'tanggal_lahir',
                    'nip',
                    'status',
                    'a_aktif',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->orderBy('id', 'desc')
                ->skip($offset)
                ->take($limit)
                ->get();

            // Get usernames for batch query
            $usernames = $radiusUsers->pluck('username')->toArray();

            // Get pengguna data from man_akses
            $penggunaData = DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->whereIn('username', $usernames)
                ->where('soft_delete', 0)
                ->get()
                ->keyBy('username');

            // Get all pengguna IDs
            $penggunaIds = $penggunaData->pluck('id_pengguna')->toArray();

            // Get all role_pengguna for these users
            $rolePenggunaData = DB::connection('sqlsrv')
                ->table('man_akses.role_pengguna as rp')
                ->leftJoin('man_akses.peran as p', 'rp.id_peran', '=', 'p.id_peran')
                ->leftJoin('man_akses.unit_organisasi as uo', 'rp.id_organisasi', '=', 'uo.id_organisasi')
                ->whereIn('rp.id_pengguna', $penggunaIds)
                ->where('rp.soft_delete', 0)
                ->select(
                    'rp.id_role_pengguna',
                    'rp.id_pengguna',
                    'rp.id_peran',
                    'p.nm_peran',
                    'rp.id_organisasi',
                    'uo.nm_lemb as nm_organisasi',
                    'rp.approval_peran',
                    'rp.last_active'
                )
                ->get()
                ->groupBy('id_pengguna');

            // Preload for role detection
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk($radiusUsers->toArray());

            // Build enriched response
            $enrichedUsers = $radiusUsers->map(function ($user) use ($penggunaData, $rolePenggunaData) {
                $pengguna = $penggunaData->get($user->username);
                $roles = $pengguna ? ($rolePenggunaData->get($pengguna->id_pengguna) ?? collect()) : collect();
                $detectedRole = $this->determineRole($user);

                return [
                    'radius_data' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'nm_pengguna' => $user->nm_pengguna,
                        'email' => $user->email,
                        'nip' => $user->nip,
                        'domain_email' => $user->domain_email,
                    ],
                    'sync_status' => $pengguna ? 'SYNCED' : 'NOT_SYNCED',
                    'id_pengguna' => $pengguna->id_pengguna ?? null,
                    'detected_role' => [
                        'id_peran' => $detectedRole['id_peran'],
                        'role_name' => $this->getRoleName($detectedRole['id_peran']),
                    ],
                    'role_pengguna' => $roles->map(function ($role) {
                        return [
                            'id_role_pengguna' => $role->id_role_pengguna,
                            'id_peran' => $role->id_peran,
                            'nm_peran' => $role->nm_peran,
                            'id_organisasi' => $role->id_organisasi,
                            'nm_organisasi' => $role->nm_organisasi,
                            'approval_peran' => $role->approval_peran,
                            'last_active' => $role->last_active,
                        ];
                    })->values(),
                    'total_roles' => $roles->count(),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Users with roles retrieved successfully',
                'data' => $enrichedUsers,
                'meta' => [
                    'total' => $total,
                    'page' => (int) $page,
                    'limit' => (int) $limit,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('SSO Radius users-with-roles error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get users with roles: ' . $e->getMessage(),
            ], 500);
        }
    }
}
