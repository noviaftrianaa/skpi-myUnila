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

            // Enrich users with role info
            $enrichedUsers = $users->map(function ($user) {
                $roleData = $this->determineRole($user);
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'nm_pengguna' => $user->nm_pengguna,
                    'email' => $user->email,
                    'tanggal_lahir' => $user->tanggal_lahir,
                    'nip' => $user->nip,
                    'status' => $user->status,
                    'domain_email' => $user->domain_email,
                    'detected_role' => $this->getRoleName($roleData['id_peran']),
                    'id_peran' => $roleData['id_peran'],
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
}
