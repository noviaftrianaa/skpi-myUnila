<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
    private $mahasiswaJkCache = [];  // Cache jenis kelamin mahasiswa
    private $dosenJkCache = [];      // Cache jenis kelamin dosen
    private $tendikJkCache = [];     // Cache jenis kelamin tendik
    private $tendikOrgCache = [];    // Cache organisasi tendik: ['nm_organisasi' => string, 'id_organisasi' => string|null]
    private $dosenOrgCache = [];     // Cache id_sms dosen dari reg_ptk (SEMUA, bukan hanya terbaru)
    private $mahasiswaOrgCache = []; // Cache id_sms mahasiswa dari reg_pd (SEMUA, bukan hanya terbaru)
    private $smsNameToIdCache = [];  // Cache mapping pdrd.sms.nm_lemb -> id_sms

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
     * GET /api/live/sso-radius/users?page=1&limit=10&search=&username=&nm_peran=&updated_at_from=&updated_at_to=
     */
    public function users(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 10);
            $search = $request->input('search', '');
            $usernameFilter = $request->input('username', '');
            $nmPeranFilter = $request->input('nm_peran', '');
            $updatedAtFrom = $request->input('updated_at_from', '');
            $updatedAtTo = $request->input('updated_at_to', '');
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

            // Apply username filter (exact or partial match)
            if (!empty($usernameFilter)) {
                $query->where('username', 'like', "%{$usernameFilter}%");
            }

            // Apply updated_at date range filter
            if (!empty($updatedAtFrom)) {
                $query->where('updated_at', '>=', $updatedAtFrom . ' 00:00:00');
            }
            if (!empty($updatedAtTo)) {
                $query->where('updated_at', '<=', $updatedAtTo . ' 23:59:59');
            }

            // Get total count
            $total = $query->count();

            // Get paginated data
            $users = $query
                ->select(
                    'id',
                    'username',
                    'value as password_hash', // SHA1 password from radcheck
                    'nm_pengguna',
                    'email',
                    'tanggal_lahir',
                    'nip',
                    'status',
                    'a_aktif',
                    'updated_at',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->orderBy('updated_at', 'desc')
                ->skip($offset)
                ->take($limit)
                ->get();

            // Preload related data for this chunk
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk($users->toArray());

            // Enrich users with role info from determineRole logic
            // Filter by nm_peran if specified
            $enrichedUsers = $users->map(function ($user) use ($nmPeranFilter) {
                $rolesData = $this->determineAllRoles($user);

                // Filter by nm_peran if specified
                $filteredRoles = $rolesData['roles'];
                if (!empty($nmPeranFilter)) {
                    $filteredRoles = array_filter($filteredRoles, function ($role) use ($nmPeranFilter) {
                        return stripos($role['nm_peran'], $nmPeranFilter) !== false;
                    });
                }

                // If filtering by role and no matching roles, return null (will be filtered out later)
                if (!empty($nmPeranFilter) && empty($filteredRoles)) {
                    return null;
                }

                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'password_hash' => $user->password_hash ?? null, // SHA1 password for sync
                    'nm_pengguna' => $user->nm_pengguna,
                    'email' => $user->email,
                    'tanggal_lahir' => $user->tanggal_lahir,
                    'nip' => $user->nip,
                    'status' => $user->status,
                    'domain_email' => $user->domain_email,
                    'updated_at' => $user->updated_at,
                    'jenis_kelamin' => $rolesData['jenis_kelamin'], // From peserta_didik/sdm
                    // Reference IDs at top level (kolom di man_akses.pengguna)
                    'id_pd_pengguna' => $rolesData['id_pd_pengguna'],
                    'id_sdm_pengguna' => $rolesData['id_sdm_pengguna'],
                    'id_user_sikep' => $rolesData['id_user_sikep'],
                    // MULTIPLE ROLES - array of roles for this user
                    'roles_pengguna' => array_values($filteredRoles), // re-index array after filter
                    'found_in_pdut' => $rolesData['id_pd_pengguna'] || $rolesData['id_sdm_pengguna'] || $rolesData['id_user_sikep'] ? true : false,
                ];
            })->filter()->values(); // Remove nulls from role filtering & re-index

            // Adjust total count if filtered by role
            $finalTotal = $total;
            if (!empty($nmPeranFilter)) {
                $finalTotal = $enrichedUsers->count();
            }

            return response()->json([
                'success' => true,
                'message' => 'SSO users retrieved successfully',
                'data' => $enrichedUsers,
                'meta' => [
                    'total' => $finalTotal,
                    'page' => (int) $page,
                    'limit' => (int) $limit,
                    'total_pages' => ceil($finalTotal / $limit),
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
     *
     * Logic mapping organisasi:
     * - Mahasiswa: pdrd.peserta_didik -> pdrd.reg_pd (terbaru, karena one-to-many) -> id_sms
     * - Dosen: pdrd.sdm -> pdrd.reg_ptk (terbaru, karena one-to-many) -> id_sms
     * - Tendik: sikep.pegawai -> sikep.unit_orga (nm_unit_orga langsung)
     */
    private function preloadDataForChunk(array $ssoUsers): void
    {
        $this->mahasiswaCache = [];
        $this->tendikCache = [];
        $this->dosenCache = [];
        $this->mahasiswaJkCache = [];
        $this->dosenJkCache = [];
        $this->tendikJkCache = [];
        $this->tendikOrgCache = [];
        $this->dosenOrgCache = [];

        $nips = array_filter(array_unique(array_column($ssoUsers, 'nip')));

        if (empty($nips)) {
            return;
        }

        $nipChunks = array_chunk($nips, 1000);

        // Preload mahasiswa - native SQL with jenis kelamin from peserta_didik
        // PENTING: Ambil SEMUA reg_pd (untuk multiple roles)
        foreach ($nipChunks as $nipChunk) {
            $placeholders = implode(',', array_fill(0, count($nipChunk), '?'));
            $sql = "
                SELECT rp.id_pd, rp.nipd, rp.id_sms, pd.jk, rp.id_reg_pd
                FROM pdrd.reg_pd rp
                LEFT JOIN pdrd.peserta_didik pd ON rp.id_pd = pd.id_pd
                WHERE rp.nipd IN ({$placeholders})
                ORDER BY rp.id_reg_pd DESC
            ";
            $mahasiswaList = DB::connection('sqlsrv')->select($sql, array_values($nipChunk));

            foreach ($mahasiswaList as $m) {
                // Set mahasiswa cache dengan data terbaru (untuk id_pd_pengguna)
                if (!isset($this->mahasiswaCache[$m->nipd])) {
                    $this->mahasiswaCache[$m->nipd] = $m;
                    $this->mahasiswaJkCache[$m->nipd] = $m->jk;
                }

                // Set organisasi cache - ARRAY untuk support multiple roles
                if (!isset($this->mahasiswaOrgCache[$m->nipd])) {
                    $this->mahasiswaOrgCache[$m->nipd] = [];
                }
                // Add id_sms jika belum ada (untuk distinct organisations)
                if (!in_array($m->id_sms, $this->mahasiswaOrgCache[$m->nipd])) {
                    $this->mahasiswaOrgCache[$m->nipd][] = $m->id_sms;
                }
            }
        }

        // Preload tendik - native SQL dengan join ke unit_orga untuk organisasi
        // Juga coba cari id_sms dari pdrd.sms dengan nama yang cocok
        // Prioritas: id_org3 (unit terkecil) > id_org2 > id_org1 (untuk nama unit yang paling spesifik)
        foreach ($nipChunks as $nipChunk) {
            $placeholders = implode(',', array_fill(0, count($nipChunk), '?'));
            // Query dengan LEFT JOIN ke pdrd.sms untuk cari id_sms yang namanya cocok
            $sql = "
                SELECT p.id_pegawai, RTRIM(LTRIM(p.nip)) as nip, p.jns_pegawai,
                       RTRIM(LTRIM(p.jk)) as jk, p.status, p.last_sync,
                       p.id_org1, p.id_org2, p.id_org3,
                       COALESCE(o3.nm_unit_orga, o2.nm_unit_orga, o1.nm_unit_orga) as nm_unit_orga,
                       CONVERT(VARCHAR(36), sms.id_sms) as matched_id_sms,
                       sms.nm_lemb as matched_nm_lemb
                FROM sikep.pegawai p
                LEFT JOIN sikep.unit_orga o1 ON p.id_org1 = o1.id_unit_orga
                LEFT JOIN sikep.unit_orga o2 ON p.id_org2 = o2.id_unit_orga
                LEFT JOIN sikep.unit_orga o3 ON p.id_org3 = o3.id_unit_orga
                -- Coba cari pdrd.sms dengan nama yang cocok (partial match)
                OUTER APPLY (
                    SELECT TOP 1 id_sms, nm_lemb
                    FROM pdrd.sms
                    WHERE soft_delete = 0
                      AND (
                          nm_lemb LIKE '%' + COALESCE(o3.nm_singkat, o2.nm_singkat, o1.nm_singkat, '') + '%'
                          OR nm_lemb LIKE '%' + COALESCE(o3.nm_unit_orga, o2.nm_unit_orga, o1.nm_unit_orga, '') + '%'
                      )
                    ORDER BY
                        CASE WHEN nm_lemb = COALESCE(o3.nm_unit_orga, o2.nm_unit_orga, o1.nm_unit_orga) THEN 0
                             WHEN nm_lemb LIKE '%' + COALESCE(o3.nm_singkat, o2.nm_singkat, o1.nm_singkat, '') + '%' THEN 1
                             ELSE 2
                        END
                ) sms
                WHERE p.nip IN ({$placeholders})
                  AND p.soft_delete = 0
                ORDER BY CASE WHEN p.status = 'Aktif' THEN 0 ELSE 1 END, p.last_sync DESC
            ";
            $tendik = DB::connection('sqlsrv')->select($sql, array_values($nipChunk));

            foreach ($tendik as $t) {
                $nipTrimmed = trim($t->nip);
                // Hanya set cache jika belum ada atau status saat ini 'Aktif' (replace non-aktif dengan aktif)
                if (!isset($this->tendikCache[$nipTrimmed]) || $t->status === 'Aktif') {
                    $this->tendikCache[$nipTrimmed] = $t;
                    $this->tendikJkCache[$nipTrimmed] = trim($t->jk ?? '');
                    // Simpan nama unit dan id_sms (jika ada match di pdrd.sms)
                    $this->tendikOrgCache[$nipTrimmed] = [
                        'nm_organisasi' => trim($t->nm_unit_orga ?? ''),
                        'id_sms' => $t->matched_id_sms ?? null,
                    ];
                }
            }
        }

        // Preload dosen - native SQL with jenis kelamin from sdm
        foreach ($nipChunks as $nipChunk) {
            $placeholders = implode(',', array_fill(0, count($nipChunk), '?'));
            $sql = "
                SELECT id_sdm, RTRIM(LTRIM(nip)) as nip, jk
                FROM pdrd.sdm
                WHERE nip IN ({$placeholders})
            ";
            $dosen = DB::connection('sqlsrv')->select($sql, array_values($nipChunk));

            foreach ($dosen as $d) {
                $nipTrimmed = trim($d->nip);
                $this->dosenCache[$nipTrimmed] = $d;
                $this->dosenJkCache[$nipTrimmed] = $d->jk;
            }
        }

        // Preload dosen organisasi dari reg_ptk - PENTING: Ambil SEMUA reg_ptk (untuk multiple roles)
        foreach ($nipChunks as $nipChunk) {
            $placeholders = implode(',', array_fill(0, count($nipChunk), '?'));
            $sql = "
                SELECT RTRIM(LTRIM(s.nip)) as nip, rp.id_sms, rp.id_reg_ptk
                FROM pdrd.sdm s
                INNER JOIN pdrd.reg_ptk rp ON s.id_sdm = rp.id_sdm
                WHERE s.nip IN ({$placeholders})
                ORDER BY rp.id_reg_ptk DESC
            ";
            $dosenOrgList = DB::connection('sqlsrv')->select($sql, array_values($nipChunk));

            foreach ($dosenOrgList as $do) {
                $nipTrimmed = trim($do->nip);

                // Set organisasi cache - ARRAY untuk support multiple roles
                if (!isset($this->dosenOrgCache[$nipTrimmed])) {
                    $this->dosenOrgCache[$nipTrimmed] = [];
                }
                // Add id_sms jika belum ada dan tidak null (untuk distinct organisations)
                if ($do->id_sms !== null && !in_array($do->id_sms, $this->dosenOrgCache[$nipTrimmed])) {
                    $this->dosenOrgCache[$nipTrimmed][] = $do->id_sms;
                }
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

            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->tendikCache[$nipTrimmed])) {
                $tendik = $this->tendikCache[$nipTrimmed];
                $result['id_user_sikep'] = $tendik->id_pegawai;
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;

            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->dosenCache[$nipTrimmed])) {
                $dosen = $this->dosenCache[$nipTrimmed];
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
     * Determine role with full details (nm_peran, nm_organisasi, jenis_kelamin)
     * Based on email domain and PDUT database verification
     *
     * Mapping logic:
     * - Mahasiswa: pdrd.peserta_didik -> pdrd.reg_pd (latest) -> id_sms -> man_akses.unit_organisasi
     * - Dosen: pdrd.sdm -> pdrd.reg_ptk (latest) -> id_sms -> man_akses.unit_organisasi
     * - Tendik: sikep.pegawai -> sikep.unit_orga (langsung return nm_unit_orga sebagai nm_organisasi)
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
            'jenis_kelamin' => 'L', // Default jenis kelamin
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: Email @students.unila.ac.id
        if ($domain === 'students') {
            $result['id_peran'] = 39;
            $result['nm_peran'] = 'Mahasiswa';

            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;
                // id_sms sudah diambil dari reg_pd terbaru di preload
                $orgData = $this->getOrganisasiWithName($mhs->id_sms);
                $result['id_organisasi'] = $orgData['id_organisasi'];
                $result['nm_organisasi'] = $orgData['nm_organisasi'];

                // Get jenis kelamin from peserta_didik
                if (isset($this->mahasiswaJkCache[$user->nip]) && $this->mahasiswaJkCache[$user->nip]) {
                    $result['jenis_kelamin'] = $this->mahasiswaJkCache[$user->nip];
                }
            }
        }
        // TENDIK: Email @staff.unila.ac.id
        elseif ($domain === 'staff') {
            $result['id_peran'] = 111;
            $result['nm_peran'] = 'Tendik';

            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->tendikCache[$nipTrimmed])) {
                $tendik = $this->tendikCache[$nipTrimmed];
                $result['id_user_sikep'] = $tendik->id_pegawai;

                // Get jenis kelamin from sikep.pegawai
                if (isset($this->tendikJkCache[$nipTrimmed]) && $this->tendikJkCache[$nipTrimmed]) {
                    $result['jenis_kelamin'] = $this->tendikJkCache[$nipTrimmed];
                }

                // Untuk tendik: gunakan nm_unit_orga dari sikep sebagai nm_organisasi
                // Jika ada matched_id_sms dari pdrd.sms, gunakan untuk lookup id_organisasi
                if (isset($this->tendikOrgCache[$nipTrimmed])) {
                    $orgCache = $this->tendikOrgCache[$nipTrimmed];
                    $result['nm_organisasi'] = $orgCache['nm_organisasi'] ?? 'Universitas Lampung';

                    // Jika ada id_sms yang cocok dari pdrd.sms, cari id_organisasi
                    if (!empty($orgCache['id_sms'])) {
                        $orgData = $this->getOrganisasiWithName($orgCache['id_sms']);
                        $result['id_organisasi'] = $orgData['id_organisasi'];
                        // Tetap gunakan nm_organisasi dari sikep.unit_orga (lebih akurat untuk tendik)
                    }
                }
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll (fakultas domain)
        elseif (isset($this->fakultasCache[$domain])) {
            $result['id_peran'] = 46;
            $result['nm_peran'] = 'Dosen';

            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->dosenCache[$nipTrimmed])) {
                $dosen = $this->dosenCache[$nipTrimmed];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;

                // Untuk dosen: gunakan id_sms dari reg_ptk terbaru (bukan dari fakultas domain)
                if (isset($this->dosenOrgCache[$nipTrimmed]) && !empty($this->dosenOrgCache[$nipTrimmed])) {
                    // Use first id_sms from array (determinRole only returns single role)
                    $firstIdSms = $this->dosenOrgCache[$nipTrimmed][0] ?? null;
                    $orgData = $this->getOrganisasiWithName($firstIdSms);
                    $result['id_organisasi'] = $orgData['id_organisasi'];
                    $result['nm_organisasi'] = $orgData['nm_organisasi'];
                } else {
                    // Fallback ke fakultas domain jika tidak ada data reg_ptk
                    $id_sms = $this->fakultasCache[$domain] ?? null;
                    $orgData = $this->getOrganisasiWithName($id_sms);
                    $result['id_organisasi'] = $orgData['id_organisasi'];
                    $result['nm_organisasi'] = $orgData['nm_organisasi'];
                }

                // Get jenis kelamin from sdm
                if (isset($this->dosenJkCache[$nipTrimmed]) && $this->dosenJkCache[$nipTrimmed]) {
                    $result['jenis_kelamin'] = $this->dosenJkCache[$nipTrimmed];
                }
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
    private function getOrganisasiWithName(?string $idLembaga): array
    {
        static $cache = [];

        // Return default if idLembaga is null or empty
        if (empty($idLembaga)) {
            return [
                'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                'nm_organisasi' => 'Universitas Lampung',
            ];
        }

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
     * Determine ALL roles for a user (support multiple roles dari multiple reg_pd/reg_ptk)
     * Returns array of roles with id_pd_pengguna, id_sdm_pengguna, id_user_sikep at top level
     */
    private function determineAllRoles(object $user): array
    {
        $result = [
            'id_pd_pengguna' => null,
            'id_sdm_pengguna' => null,
            'id_user_sikep' => null,
            'jenis_kelamin' => 'L', // Default
            'roles' => [], // Array of roles
        ];

        $domain = strtolower($user->domain_email ?? '');

        // MAHASISWA: Email @students.unila.ac.id - MULTIPLE ROLES jika punya multiple reg_pd
        if ($domain === 'students') {
            if (!empty($user->nip) && isset($this->mahasiswaCache[$user->nip])) {
                $mhs = $this->mahasiswaCache[$user->nip];
                $result['id_pd_pengguna'] = $mhs->id_pd;

                // Get jenis kelamin
                if (isset($this->mahasiswaJkCache[$user->nip]) && $this->mahasiswaJkCache[$user->nip]) {
                    $result['jenis_kelamin'] = $this->mahasiswaJkCache[$user->nip];
                }

                // Add ALL roles from ALL reg_pd (multiple organisations)
                if (isset($this->mahasiswaOrgCache[$user->nip])) {
                    foreach ($this->mahasiswaOrgCache[$user->nip] as $id_sms) {
                        $orgData = $this->getOrganisasiWithName($id_sms);
                        $result['roles'][] = [
                            'id_peran' => 39, // Mahasiswa
                            'nm_peran' => 'Mahasiswa',
                            'id_organisasi' => $orgData['id_organisasi'],
                            'nm_organisasi' => $orgData['nm_organisasi'],
                        ];
                    }
                }

                // If no organisasi data found, add default role
                if (empty($result['roles'])) {
                    $result['roles'][] = [
                        'id_peran' => 39,
                        'nm_peran' => 'Mahasiswa',
                        'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                        'nm_organisasi' => 'Universitas Lampung',
                    ];
                }
            } else {
                // Not found in PDUT, default role
                $result['roles'][] = [
                    'id_peran' => 39,
                    'nm_peran' => 'Mahasiswa',
                    'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                    'nm_organisasi' => 'Universitas Lampung',
                ];
            }
        }
        // TENDIK: Email @staff.unila.ac.id - Usually single role
        elseif ($domain === 'staff') {
            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->tendikCache[$nipTrimmed])) {
                $tendik = $this->tendikCache[$nipTrimmed];
                $result['id_user_sikep'] = $tendik->id_pegawai;

                // Get jenis kelamin
                if (isset($this->tendikJkCache[$nipTrimmed]) && $this->tendikJkCache[$nipTrimmed]) {
                    $result['jenis_kelamin'] = $this->tendikJkCache[$nipTrimmed];
                }

                // Get organisasi
                $nmOrganisasi = 'Universitas Lampung';
                $idOrganisasi = 'e2b705a7-173e-464a-9fac-509128709515';

                if (isset($this->tendikOrgCache[$nipTrimmed])) {
                    $orgCache = $this->tendikOrgCache[$nipTrimmed];
                    $nmOrganisasi = $orgCache['nm_organisasi'] ?? 'Universitas Lampung';

                    if (!empty($orgCache['id_sms'])) {
                        $orgData = $this->getOrganisasiWithName($orgCache['id_sms']);
                        $idOrganisasi = $orgData['id_organisasi'];
                    }
                }

                $result['roles'][] = [
                    'id_peran' => 111, // Tendik
                    'nm_peran' => 'Tendik',
                    'id_organisasi' => $idOrganisasi,
                    'nm_organisasi' => $nmOrganisasi,
                ];
            } else {
                // Default tendik role
                $result['roles'][] = [
                    'id_peran' => 111,
                    'nm_peran' => 'Tendik',
                    'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                    'nm_organisasi' => 'Universitas Lampung',
                ];
            }
        }
        // DOSEN: Email @ft, @fp, @fmipa, dll - MULTIPLE ROLES jika punya multiple reg_ptk
        elseif (isset($this->fakultasCache[$domain])) {
            $nipTrimmed = trim($user->nip ?? '');
            if (!empty($nipTrimmed) && isset($this->dosenCache[$nipTrimmed])) {
                $dosen = $this->dosenCache[$nipTrimmed];
                $result['id_sdm_pengguna'] = $dosen->id_sdm;

                // Get jenis kelamin
                if (isset($this->dosenJkCache[$nipTrimmed]) && $this->dosenJkCache[$nipTrimmed]) {
                    $result['jenis_kelamin'] = $this->dosenJkCache[$nipTrimmed];
                }

                // Add ALL roles from ALL reg_ptk (multiple organisations)
                if (isset($this->dosenOrgCache[$nipTrimmed]) && !empty($this->dosenOrgCache[$nipTrimmed])) {
                    foreach ($this->dosenOrgCache[$nipTrimmed] as $id_sms) {
                        $orgData = $this->getOrganisasiWithName($id_sms);
                        $result['roles'][] = [
                            'id_peran' => 46, // Dosen
                            'nm_peran' => 'Dosen',
                            'id_organisasi' => $orgData['id_organisasi'],
                            'nm_organisasi' => $orgData['nm_organisasi'],
                        ];
                    }
                } else {
                    // Fallback ke fakultas domain
                    $id_sms = $this->fakultasCache[$domain] ?? null;
                    $orgData = $this->getOrganisasiWithName($id_sms);
                    $result['roles'][] = [
                        'id_peran' => 46,
                        'nm_peran' => 'Dosen',
                        'id_organisasi' => $orgData['id_organisasi'],
                        'nm_organisasi' => $orgData['nm_organisasi'],
                    ];
                }
            } else {
                // Not found in SDM, set to Guest
                $result['roles'][] = [
                    'id_peran' => 40,
                    'nm_peran' => 'Guest',
                    'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                    'nm_organisasi' => 'Universitas Lampung',
                ];
            }
        } else {
            // Default Guest role
            $result['roles'][] = [
                'id_peran' => 40,
                'nm_peran' => 'Guest',
                'id_organisasi' => 'e2b705a7-173e-464a-9fac-509128709515',
                'nm_organisasi' => 'Universitas Lampung',
            ];
        }

        return $result;
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

    /**
     * Create SSO user in radcheck (MySQL) then sync to man_akses (SQL Server)
     * POST /api/live/v1/sso-radius/create
     *
     * Flow: validate username → create radcheck → sync man_akses.pengguna + role_pengguna
     * If username already exists, return existing data with IDs
     * Default password = SHA1(tanggal_lahir)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|max:255',
                'nm_pengguna' => 'required|string|max:255',
                'fname' => 'nullable|string|max:255',
                'lname' => 'nullable|string|max:255',
                'email' => 'required|email|max:255',
                'tanggal_lahir' => 'required|date',
                'nip' => 'nullable|string|max:255',
                'status' => 'nullable|string|max:255',
                'fakultas' => 'nullable|string|max:255',
                'jurusan' => 'nullable|string|max:255',
                'unit_kerja' => 'nullable|string|max:255',
                'alamat' => 'nullable|string|max:255',
                'no_telp' => 'nullable|string|max:255',
                'value' => 'nullable|string|max:255',
            ]);

            // Check if username already exists in radcheck
            $existing = DB::connection('mysql')
                ->table('radcheck')
                ->where('username', $validated['username'])
                ->first();

            if ($existing) {
                // User exists → return existing data with IDs
                $pengguna = DB::connection('sqlsrv')
                    ->table('man_akses.pengguna')
                    ->where('username', $validated['username'])
                    ->where('soft_delete', 0)
                    ->first();

                return response()->json([
                    'success' => true,
                    'message' => 'User already exists',
                    'data' => [
                        'radcheck_id' => $existing->id,
                        'username' => $existing->username,
                        'nm_pengguna' => $existing->nm_pengguna,
                        'email' => $existing->email,
                        'nip' => $existing->nip,
                        'tanggal_lahir' => $existing->tanggal_lahir,
                        'status' => $existing->status,
                        'a_aktif' => $existing->a_aktif,
                        'id_pengguna' => $pengguna->id_pengguna ?? null,
                        'synced' => $pengguna ? true : false,
                        'action' => 'EXISTING',
                    ],
                ], 200);
            }

            // Step 1: Create in radcheck (MySQL)
            // Password: SHA1(value) jika dikirim dari client, atau SHA1(tanggal_lahir) sebagai default
            $passwordSource = !empty($validated['value']) ? $validated['value'] : $validated['tanggal_lahir'];
            $passwordSha1 = sha1($passwordSource);

            $radcheckId = DB::connection('mysql')
                ->table('radcheck')
                ->insertGetId([
                    'username' => $validated['username'],
                    'attribute' => 'SHA1-Password',
                    'op' => ':=',
                    'value' => $passwordSha1,
                    'nm_pengguna' => $validated['nm_pengguna'],
                    'fname' => $validated['fname'] ?? null,
                    'lname' => $validated['lname'] ?? null,
                    'email' => $validated['email'],
                    'tanggal_lahir' => $validated['tanggal_lahir'],
                    'nip' => $validated['nip'] ?? $validated['username'],
                    'status' => $validated['status'] ?? null,
                    'fakultas' => $validated['fakultas'] ?? null,
                    'jurusan' => $validated['jurusan'] ?? null,
                    'unit_kerja' => $validated['unit_kerja'] ?? null,
                    'alamat' => $validated['alamat'] ?? null,
                    'no_telp' => $validated['no_telp'] ?? null,
                    'tanggal_daftar' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                    'soft_delete' => '0',
                    'a_aktif' => '1',
                ]);

            // Step 2: Sync to man_akses (SQL Server)
            // Fetch newly created user with computed domain_email
            $newUser = DB::connection('mysql')
                ->table('radcheck')
                ->where('id', $radcheckId)
                ->select(
                    'id', 'username', 'value as password_hash',
                    'nm_pengguna', 'email', 'tanggal_lahir', 'nip', 'status',
                    DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain_email")
                )
                ->first();

            // Preload related data for role determination
            $this->preloadFakultasDomains();
            $this->preloadDataForChunk([$newUser]);

            // Determine role based on email domain + PDUT verification
            $roleData = $this->determineRole($newUser);

            // Upsert man_akses.pengguna
            $idPengguna = $this->syncPengguna($newUser, $roleData);

            // Upsert man_akses.role_pengguna
            $this->syncRolePengguna($idPengguna, $roleData);

            return response()->json([
                'success' => true,
                'message' => 'User created and synced successfully',
                'data' => [
                    'radcheck_id' => $radcheckId,
                    'id_pengguna' => $idPengguna,
                    'username' => $validated['username'],
                    'nm_pengguna' => $validated['nm_pengguna'],
                    'email' => $validated['email'],
                    'nip' => $validated['nip'] ?? $validated['username'],
                    'tanggal_lahir' => $validated['tanggal_lahir'],
                    'role' => [
                        'id_peran' => $roleData['id_peran'],
                        'nm_peran' => $this->getRoleName($roleData['id_peran']),
                        'id_organisasi' => $roleData['id_organisasi'],
                    ],
                    'action' => 'CREATED',
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('SSO Radius store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upsert user ke man_akses.pengguna (SQL Server)
     * Password format: password = SHA1, password_encrypt = bcrypt(SHA1)
     */
    private function syncPengguna(object $user, array $roleData): string
    {
        $existing = DB::connection('sqlsrv')
            ->table('man_akses.pengguna')
            ->where('username', $user->username)
            ->where('soft_delete', 0)
            ->first();

        // Password strategy: SHA1 → bcrypt(SHA1) (same as UpdateSSOVersi2Seeder)
        $passwordSha1 = !empty($user->password_hash) ? $user->password_hash : sha1('unilajaya');
        $passwordBcrypt = password_hash($passwordSha1, PASSWORD_BCRYPT, ['cost' => 12]);

        $userData = [
            'username' => $user->username,
            'nm_pengguna' => $user->nm_pengguna,
            'email' => $user->email,
            'tgl_lahir' => ($user->tanggal_lahir && $user->tanggal_lahir !== '0000-00-00') ? $user->tanggal_lahir : null,
            'password' => $passwordSha1,
            'password_encrypt' => $passwordBcrypt,
            'id_pd_pengguna' => $roleData['id_pd_pengguna'],
            'id_sdm_pengguna' => $roleData['id_sdm_pengguna'],
            'id_user_sikep' => $roleData['id_user_sikep'],
            'last_sync' => now(),
            'last_update' => now(),
            'id_updater' => '00000000-0000-0000-0000-000000000000',
            'soft_delete' => 0,
        ];

        if ($existing) {
            DB::connection('sqlsrv')
                ->table('man_akses.pengguna')
                ->where('id_pengguna', $existing->id_pengguna)
                ->update($userData);

            return $existing->id_pengguna;
        }

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

    /**
     * Upsert role ke man_akses.role_pengguna (SQL Server)
     */
    private function syncRolePengguna(string $userId, array $roleData): void
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
            DB::connection('sqlsrv')
                ->table('man_akses.role_pengguna')
                ->where('id_role_pengguna', $existing->id_role_pengguna)
                ->update($roleAttributes);
        } else {
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
}
