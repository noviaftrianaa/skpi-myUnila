<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\RolePenggunaService;
use App\Services\UserContext\UserContextService;
use App\Repositories\ManAkses\RolePenggunaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Role Pengguna Controller
 * API endpoints for role pengguna management
 *
 * Setiap mutasi role-pengguna (store/update/destroy) otomatis trigger
 * cache invalidation untuk user terkait, supaya perubahan langsung terasa
 * tanpa perlu user logout / wait TTL 60 menit.
 */
class RolePenggunaController extends Controller
{
    protected RolePenggunaService $service;
    protected UserContextService $userContextService;

    public function __construct(UserContextService $userContextService)
    {
        $repository = new RolePenggunaRepository();
        $this->service = new RolePenggunaService($repository);
        $this->userContextService = $userContextService;
    }

    /**
     * Invalidate cache untuk user yang role-nya baru saja berubah.
     * Dipanggil setelah store/update/destroy supaya frontend user tsb
     * langsung dapat data baru saat refresh tanpa logout dulu.
     *
     * Cache yang di-clear:
     *   - user_context:<userId>   (peran/organisasi/active context)
     *   - portal_apps:role:*       (daftar app yang accessible per role)
     */
    private function invalidateUserCache(?string $userId, ?string $orgId = null): void
    {
        if (!$userId) {
            return;
        }
        try {
            $this->userContextService->clearContext($userId);
            $this->userContextService->invalidatePortalAppsCache($orgId);
            Log::info('Auto-invalidated cache after role-pengguna mutation', [
                'user_id' => $userId,
                'org_id' => $orgId,
            ]);
        } catch (\Exception $e) {
            // Cache invalidation failure jangan block response — cuma log warning.
            Log::warning('Failed to invalidate user cache: ' . $e->getMessage(), [
                'user_id' => $userId,
            ]);
        }
    }

    /**
     * Get paginated list of role pengguna
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'id_pengguna' => $request->get('id_pengguna'),
                'id_peran' => $request->get('id_peran'),
                'id_organisasi' => $request->get('id_organisasi'),
                'sort_by' => $request->get('sort_by'), // column name
                'sort_order' => $request->get('sort_order'), // 'asc', 'desc'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get role pengguna detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $result = $this->service->getDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get roles by pengguna ID
     *
     * @param string $idPengguna
     * @return JsonResponse
     */
    public function byPengguna(string $idPengguna): JsonResponse
    {
        try {
            $result = $this->service->getByPengguna($idPengguna);

            return response()->json([
                'success' => true,
                'message' => 'Data role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new role pengguna
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'id_pengguna' => 'required|string|max:36',
                'id_peran' => 'required|integer',
                'id_organisasi' => 'nullable|string|max:36',
                'sk_penugasan' => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'approval_peran' => 'nullable|boolean',
                'tgl_kadaluarsa' => 'nullable|date',
            ]);

            $data = $request->all();
            // Add id_updater from authenticated user
            $data['id_updater'] = $request->user()->id_pengguna ?? $request->user()->id ?? null;
            $result = $this->service->create($data);

            // Invalidate cache user yg role-nya baru di-tambah supaya realtime
            $this->invalidateUserCache($data['id_pengguna'] ?? null, $data['id_organisasi'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil ditambahkan',
                'data' => $result
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing role pengguna
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'id_peran' => 'required|integer',
                'id_organisasi' => 'nullable|string|max:36',
                'sk_penugasan' => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'approval_peran' => 'nullable|boolean',
                'tgl_kadaluarsa' => 'nullable|date',
            ]);

            $data = $request->all();
            // Add id_updater from authenticated user
            $data['id_updater'] = $request->user()->id_pengguna ?? $request->user()->id ?? null;
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            // Invalidate cache user yg role-nya baru di-update supaya realtime.
            // id_pengguna dari result (kalau service return), atau dari $data sebagai fallback.
            $userId = is_array($result) ? ($result['id_pengguna'] ?? null)
                                         : ($result->id_pengguna ?? null);
            $this->invalidateUserCache($userId ?? ($data['id_pengguna'] ?? null), $data['id_organisasi'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil diperbarui',
                'data' => $result
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete role pengguna (soft delete)
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Ambil id_pengguna SEBELUM delete supaya tahu user mana yg cache-nya
            // perlu di-invalidate (setelah delete, repository return null).
            $existing = $this->service->getDetail($id);
            $affectedUserId = is_array($existing) ? ($existing['id_pengguna'] ?? null)
                                                   : ($existing->id_pengguna ?? null);
            $affectedOrgId = is_array($existing) ? ($existing['id_organisasi'] ?? null)
                                                  : ($existing->id_organisasi ?? null);

            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            // Invalidate cache user yg role-nya baru di-hapus supaya realtime.
            $this->invalidateUserCache($affectedUserId, $affectedOrgId);

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    // ========================================================================
    // KANDIDAT REVIEW & PERPANJANGAN (Pilar 4 + Pilar 2 manual)
    // ========================================================================

    /**
     * GET /role-pengguna/kandidat
     *
     * List role_pengguna yang perlu di-review oleh admin TIK, by kategori.
     * Hanya peran fungsional (bukan a_peran_identitas) yang masuk.
     *
     * Query params:
     *   - kategori: alumni | mutasi | expired | akan_expire | tanpa_kadaluarsa  (wajib)
     *   - search: filter nama/username/email
     *   - page, limit
     *   - days: untuk akan_expire (default 30)
     *
     * Konteks per kategori:
     *   - alumni: pengguna yg id_pd_pengguna IS NOT NULL DAN pdrd.peserta_didik.id_jns_keluar=1
     *             (lulus) DAN sk_yudisium IS NOT NULL → role harus di-revoke (mhs sudah lulus)
     *   - mutasi: pengguna identitas dosen/tendik dgn id_jns_keluar !=1 ATAU id_unit homebase
     *             tidak match id_organisasi role_pengguna (mutasi unit)
     *   - expired: tgl_kadaluarsa < GETDATE()
     *   - akan_expire: tgl_kadaluarsa BETWEEN GETDATE() AND GETDATE()+days
     *   - tanpa_kadaluarsa: tgl_kadaluarsa IS NULL (perlu di-set masa berlakunya)
     */
    public function kandidat(Request $request): JsonResponse
    {
        try {
            $kategori = $request->get('kategori');
            $allowed = ['alumni', 'mutasi', 'expired', 'akan_expire', 'tanpa_kadaluarsa'];
            if (!$kategori || !in_array($kategori, $allowed, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter kategori wajib salah satu dari: ' . implode(', ', $allowed),
                ], 422);
            }

            $page  = max(1, (int) $request->get('page', 1));
            $limit = min(200, max(5, (int) $request->get('limit', 25)));
            $offset = ($page - 1) * $limit;
            $search = trim((string) $request->get('search', ''));
            $days  = max(1, min(365, (int) $request->get('days', 30)));

            // Common JOIN + WHERE base
            $baseFrom = "
                FROM man_akses.role_pengguna rp
                INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
                INNER JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            ";
            $baseWhere = " WHERE ISNULL(rp.soft_delete, 0) = 0 ";

            $bindings = [];
            $extraSelect = '';
            $extraJoin = '';

            switch ($kategori) {
                case 'alumni':
                    // Mhs yang sudah lulus (id_jns_keluar=1 + sk_yudisium tidak null)
                    // Sumber data: pdrd.reg_pd (BUKAN peserta_didik — kolom keluar di reg_pd)
                    $extraJoin = "
                        INNER JOIN pdrd.reg_pd rpd WITH(NOLOCK)
                            ON rpd.id_pd = p.id_pd_pengguna
                           AND rpd.soft_delete = 0
                        LEFT JOIN ref.jenis_keluar jk WITH(NOLOCK)
                            ON jk.id_jns_keluar = rpd.id_jns_keluar
                    ";
                    $baseWhere .= "
                        AND p.id_pd_pengguna IS NOT NULL
                        AND rpd.id_jns_keluar = '1'
                        AND rpd.sk_yudisium IS NOT NULL
                        AND rpd.sk_yudisium <> ''
                    ";
                    $extraSelect = ", rpd.tgl_keluar AS tgl_lulus, rpd.sk_yudisium, jk.ket_keluar AS nm_jns_keluar";
                    break;

                case 'mutasi':
                    // Mhs dgn id_jns_keluar selain 1 (lulus) — keluar lain.
                    // CATATAN: id_jns_keluar di pdrd.reg_pd adalah VARCHAR (bukan INT) — bisa berisi 'Z' dll.
                    $extraJoin = "
                        INNER JOIN pdrd.reg_pd rpd WITH(NOLOCK)
                            ON rpd.id_pd = p.id_pd_pengguna
                           AND rpd.soft_delete = 0
                        LEFT JOIN ref.jenis_keluar jk WITH(NOLOCK)
                            ON jk.id_jns_keluar = rpd.id_jns_keluar
                    ";
                    $baseWhere .= "
                        AND p.id_pd_pengguna IS NOT NULL
                        AND rpd.id_jns_keluar IS NOT NULL
                        AND rpd.id_jns_keluar <> '1'
                    ";
                    $extraSelect = ", rpd.tgl_keluar, rpd.id_jns_keluar, jk.ket_keluar AS nm_jns_keluar";
                    break;

                case 'expired':
                    $baseWhere .= " AND rp.tgl_kadaluarsa IS NOT NULL AND rp.tgl_kadaluarsa < GETDATE() ";
                    $extraSelect = ", DATEDIFF(DAY, rp.tgl_kadaluarsa, GETDATE()) AS days_overdue";
                    break;

                case 'akan_expire':
                    $baseWhere .= "
                        AND rp.tgl_kadaluarsa IS NOT NULL
                        AND rp.tgl_kadaluarsa >= GETDATE()
                        AND rp.tgl_kadaluarsa < DATEADD(DAY, ?, GETDATE())
                    ";
                    $bindings[] = $days;
                    $extraSelect = ", DATEDIFF(DAY, GETDATE(), rp.tgl_kadaluarsa) AS days_remaining";
                    break;

                case 'tanpa_kadaluarsa':
                    // Hanya peran fungsional (bukan identitas) yg perlu masa berlaku
                    $baseWhere .= "
                        AND rp.tgl_kadaluarsa IS NULL
                        AND ISNULL(pr.a_peran_identitas, 0) = 0
                        AND ISNULL(pr.a_universal, 0) = 0
                    ";
                    break;
            }

            // Search filter
            if ($search !== '') {
                $baseWhere .= ' AND (p.nm_pengguna LIKE ? OR p.username LIKE ? OR p.email LIKE ?)';
                $term = '%' . $search . '%';
                $bindings[] = $term; $bindings[] = $term; $bindings[] = $term;
            }

            // Count
            $countSql = "SELECT COUNT(*) AS total $baseFrom $extraJoin $baseWhere";
            $totalRow = DB::selectOne($countSql, $bindings);
            $total = (int) ($totalRow->total ?? 0);

            // Data
            $dataSql = "
                SELECT
                    CONVERT(VARCHAR(36), rp.id_role_pengguna) AS id_role_pengguna,
                    CONVERT(VARCHAR(36), rp.id_pengguna) AS id_pengguna,
                    p.nm_pengguna, p.username, p.email,
                    rp.id_peran, pr.nm_peran,
                    ISNULL(pr.a_peran_identitas, 0) AS a_peran_identitas,
                    ISNULL(pr.a_universal, 0) AS a_universal,
                    CONVERT(VARCHAR(36), rp.id_organisasi) AS id_organisasi,
                    uo.nm_lemb AS nm_organisasi,
                    rp.sk_penugasan, rp.tgl_sk_penugasan, rp.tgl_kadaluarsa,
                    rp.last_active, rp.tgl_create
                    $extraSelect
                $baseFrom $extraJoin $baseWhere
                ORDER BY p.nm_pengguna
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            ";
            $bindings[] = $offset; $bindings[] = $limit;
            $rows = DB::select($dataSql, $bindings);

            return response()->json([
                'success' => true,
                'data' => [
                    'kategori'    => $kategori,
                    'data'        => $rows,
                    'total'       => $total,
                    'page'        => $page,
                    'limit'       => $limit,
                    'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('kandidat error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar kandidat: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /role-pengguna/{id}/perpanjang
     *
     * Perpanjang masa berlaku 1 role_pengguna.
     * Body: { tgl_kadaluarsa, sk_penugasan?, tgl_sk_penugasan?, alasan? }
     *
     * Default suggestion frontend: tgl_kadaluarsa = today + 1 tahun.
     */
    public function perpanjang(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'tgl_kadaluarsa'   => 'required|date|after:today',
                'sk_penugasan'     => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'alasan'           => 'nullable|string|max:500',
            ]);

            $existing = DB::selectOne(
                "SELECT CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna,
                        CONVERT(VARCHAR(36), id_organisasi) AS id_organisasi
                 FROM man_akses.role_pengguna
                 WHERE id_role_pengguna = ? AND ISNULL(soft_delete, 0) = 0",
                [$id]
            );
            if (!$existing) {
                return response()->json(['success' => false, 'message' => 'Role pengguna tidak ditemukan'], 404);
            }

            $sets = [' tgl_kadaluarsa = ? ', ' last_update = GETDATE() '];
            $bindings = [$request->input('tgl_kadaluarsa')];
            if ($request->filled('sk_penugasan')) {
                $sets[] = ' sk_penugasan = ? ';
                $bindings[] = $request->input('sk_penugasan');
            }
            if ($request->filled('tgl_sk_penugasan')) {
                $sets[] = ' tgl_sk_penugasan = ? ';
                $bindings[] = $request->input('tgl_sk_penugasan');
            }
            $bindings[] = $id;

            DB::update(
                "UPDATE man_akses.role_pengguna SET " . implode(',', $sets)
                . " WHERE id_role_pengguna = ?",
                $bindings
            );

            $this->invalidateUserCache($existing->id_pengguna, $existing->id_organisasi);

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil diperpanjang',
                'data' => [
                    'id_role_pengguna' => $id,
                    'tgl_kadaluarsa'   => $request->input('tgl_kadaluarsa'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal perpanjang: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /role-pengguna/perpanjang-batch
     * Body: { ids: [...], tgl_kadaluarsa, sk_penugasan?, tgl_sk_penugasan?, alasan? }
     */
    public function perpanjangBatch(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'ids'              => 'required|array|min:1|max:500',
                'ids.*'            => 'string|max:36',
                'tgl_kadaluarsa'   => 'required|date|after:today',
                'sk_penugasan'     => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'alasan'           => 'nullable|string|max:500',
            ]);

            $ids = array_values(array_unique($request->input('ids')));
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            // Pre-fetch affected users untuk cache invalidation
            $affected = DB::select(
                "SELECT CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna,
                        CONVERT(VARCHAR(36), id_organisasi) AS id_organisasi
                 FROM man_akses.role_pengguna
                 WHERE id_role_pengguna IN ($placeholders) AND ISNULL(soft_delete, 0) = 0",
                $ids
            );

            $sets = [' tgl_kadaluarsa = ? ', ' last_update = GETDATE() '];
            $bindings = [$request->input('tgl_kadaluarsa')];
            if ($request->filled('sk_penugasan')) {
                $sets[] = ' sk_penugasan = ? ';
                $bindings[] = $request->input('sk_penugasan');
            }
            if ($request->filled('tgl_sk_penugasan')) {
                $sets[] = ' tgl_sk_penugasan = ? ';
                $bindings[] = $request->input('tgl_sk_penugasan');
            }
            $bindings = array_merge($bindings, $ids);

            $updated = DB::update(
                "UPDATE man_akses.role_pengguna SET " . implode(',', $sets)
                . " WHERE id_role_pengguna IN ($placeholders)
                       AND ISNULL(soft_delete, 0) = 0",
                $bindings
            );

            // Invalidate cache untuk semua user yg terdampak
            foreach ($affected as $a) {
                $this->invalidateUserCache($a->id_pengguna, $a->id_organisasi);
            }

            return response()->json([
                'success' => true,
                'message' => "$updated role berhasil diperpanjang",
                'data' => ['updated' => $updated, 'requested' => count($ids)],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal perpanjang batch: ' . $e->getMessage()], 500);
        }
    }

    // ========================================================================
    // BULK IMPORT (CSV)
    // ========================================================================

    /**
     * GET /role-pengguna/import-template?id_aplikasi=...
     *
     * Download CSV template untuk bulk import role pengguna.
     * Kalau id_aplikasi diberikan, list peran valid difilter ke peran yg punya
     * menu_role di app tsb. Peran identitas (a_peran_identitas=1) DIKECUALIKAN
     * (lifecycle-nya via SSO sync, bukan import manual).
     */
    public function importTemplate(Request $request)
    {
        try {
            $idAplikasi = $request->get('id_aplikasi');

            // Build daftar peran valid (untuk hint admin saat fill CSV)
            $peranSql = "
                SELECT p.id_peran, p.nm_peran
                FROM man_akses.peran p
                WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())
                  AND ISNULL(p.a_peran_identitas, 0) = 0
            ";
            $params = [];
            if ($idAplikasi) {
                $peranSql .= " AND EXISTS (
                    SELECT 1 FROM man_akses.menu_role mr
                    INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
                    WHERE mr.id_peran = p.id_peran
                      AND m.id_aplikasi = ?
                      AND ISNULL(mr.soft_delete, 0) = 0
                )";
                $params[] = $idAplikasi;
            }
            $peranSql .= " ORDER BY p.nm_peran";
            $peran = DB::select($peranSql, $params);

            $appName = '';
            if ($idAplikasi) {
                $app = DB::selectOne(
                    "SELECT nm_aplikasi FROM man_akses.aplikasi WHERE id_aplikasi = ?",
                    [$idAplikasi]
                );
                if ($app) $appName = $app->nm_aplikasi;
            }

            // Tahun depan (default tgl_kadaluarsa)
            $defaultExpiry = date('Y-m-d', strtotime('+1 year'));
            $today = date('Y-m-d');

            // Build CSV
            $output = fopen('php://temp', 'r+');
            // BOM UTF-8 untuk Excel
            fwrite($output, "\xEF\xBB\xBF");

            // Comment lines (akan di-skip oleh parser)
            fputcsv($output, ['# Template Bulk Import Role Pengguna' . ($appName ? " - $appName" : '')]);
            fputcsv($output, ['# Petunjuk:']);
            fputcsv($output, ['# 1. username = NIM (mahasiswa) / NIP (dosen-tendik) / username login']);
            fputcsv($output, ['# 2. id_peran = ID peran fungsional (lihat daftar di bawah)']);
            fputcsv($output, ['# 3. id_organisasi = UUID unit organisasi (kosong = pakai homebase user)']);
            fputcsv($output, ['# 4. tgl_sk dan tgl_kadaluarsa format YYYY-MM-DD']);
            fputcsv($output, ['# 5. tgl_kadaluarsa kosong = default 1 tahun dari hari ini']);
            fputcsv($output, ['#']);
            fputcsv($output, ['# Daftar peran fungsional yg valid:']);
            foreach ($peran as $p) {
                fputcsv($output, ["# id_peran=$p->id_peran : $p->nm_peran"]);
            }
            fputcsv($output, ['#']);

            // Header
            fputcsv($output, ['username', 'id_peran', 'id_organisasi', 'no_sk', 'tgl_sk', 'tgl_kadaluarsa', 'keterangan']);

            // 1 sample row
            $sampleIdPeran = $peran[0]->id_peran ?? 1;
            fputcsv($output, ['1234567890', $sampleIdPeran, '', 'SK-12345/UN26/2026', $today, $defaultExpiry, 'Sample row — hapus baris ini sebelum upload']);

            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);

            $filename = 'template_import_role'
                . ($appName ? '_' . preg_replace('/[^a-z0-9]+/i', '-', strtolower($appName)) : '')
                . '_' . date('Ymd') . '.csv';

            return response($csv, 200, [
                'Content-Type'        => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate template: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /role-pengguna/import
     *
     * Bulk import role pengguna dari file CSV.
     * Multipart body: file (csv) + dry_run (bool, default true) + id_aplikasi (untuk validasi peran)
     *
     * Process:
     *  1. Parse CSV (skip comment lines yg diawali #)
     *  2. Untuk tiap row: validasi & lookup pengguna/peran/unit
     *  3. Cek duplikat (id_pengguna + id_peran sudah punya role aktif)
     *  4. Kalau dry_run=true → return preview tanpa insert
     *  5. Kalau dry_run=false → bulk insert + cache invalidate per user
     */
    public function importBulk(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file'         => 'required|file|mimes:csv,txt|max:5120',
                'dry_run'      => 'sometimes|boolean',
                'id_aplikasi'  => 'nullable|string|max:36',
            ]);
            $dryRun = filter_var($request->input('dry_run', true), FILTER_VALIDATE_BOOLEAN);
            $idAplikasi = $request->input('id_aplikasi');

            $file = $request->file('file');
            $handle = fopen($file->getPathname(), 'r');
            if (!$handle) {
                return response()->json(['success' => false, 'message' => 'Gagal membuka file'], 422);
            }

            // Skip BOM kalau ada
            $first = fread($handle, 3);
            if ($first !== "\xEF\xBB\xBF") rewind($handle);

            $expectedHeader = ['username', 'id_peran', 'id_organisasi', 'no_sk', 'tgl_sk', 'tgl_kadaluarsa', 'keterangan'];
            $headerFound = null;
            $rows = [];
            $lineNo = 0;
            while (($row = fgetcsv($handle)) !== false) {
                $lineNo++;
                if (count($row) === 0 || (isset($row[0]) && str_starts_with(trim((string) $row[0]), '#'))) continue;
                if ($headerFound === null) {
                    // Normalisasi header (lowercase + trim)
                    $candidate = array_map(fn($c) => strtolower(trim((string) $c)), $row);
                    $intersect = array_intersect($expectedHeader, $candidate);
                    if (count($intersect) >= 4) {
                        $headerFound = $candidate;
                        continue;
                    }
                }
                if ($headerFound) {
                    // Skip baris kosong
                    if (count(array_filter($row, fn($c) => trim((string) $c) !== '')) === 0) continue;
                    $rows[] = ['_line' => $lineNo, '_data' => $row];
                }
            }
            fclose($handle);

            if (!$headerFound) {
                return response()->json([
                    'success' => false,
                    'message' => 'Header CSV tidak valid. Pastikan kolom: ' . implode(', ', $expectedHeader),
                ], 422);
            }
            if (empty($rows)) {
                return response()->json(['success' => false, 'message' => 'CSV tidak punya data row'], 422);
            }

            // Build kolom map dari header found
            $colIdx = array_flip($headerFound);
            $get = function (array $r, string $k) use ($colIdx) {
                $i = $colIdx[$k] ?? null;
                return $i !== null && isset($r[$i]) ? trim((string) $r[$i]) : '';
            };

            // Lookup peran valid + map id→a_peran_identitas (untuk reject identitas)
            $peranLookup = DB::select("
                SELECT id_peran, nm_peran, ISNULL(a_peran_identitas, 0) AS a_peran_identitas
                FROM man_akses.peran
                WHERE expired_date IS NULL OR expired_date > GETDATE()
            ");
            $peranMap = [];
            foreach ($peranLookup as $p) $peranMap[(int) $p->id_peran] = $p;

            // Build daftar peran yg valid utk app (kalau di-specify)
            $validPeranIdsForApp = null;
            if ($idAplikasi) {
                $rs = DB::select("
                    SELECT DISTINCT mr.id_peran
                    FROM man_akses.menu_role mr
                    INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
                    WHERE m.id_aplikasi = ? AND ISNULL(mr.soft_delete, 0) = 0
                ", [$idAplikasi]);
                $validPeranIdsForApp = array_map(fn($r) => (int) $r->id_peran, $rs);
            }

            // Process rows
            $defaultExpiry = date('Y-m-d', strtotime('+1 year'));
            $preview = [];
            $errors = 0;
            $okRows = [];
            $usernamesForLookup = [];
            foreach ($rows as $entry) {
                $r = $entry['_data'];
                $username = $get($r, 'username');
                if ($username !== '') $usernamesForLookup[] = $username;
            }

            // Bulk lookup pengguna by username (case-insensitive)
            $usernameMap = [];
            if (!empty($usernamesForLookup)) {
                $unique = array_values(array_unique($usernamesForLookup));
                $placeholders = implode(',', array_fill(0, count($unique), '?'));
                $rs = DB::select(
                    "SELECT CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna, username, id_pd_pengguna, id_sdm_pengguna
                     FROM man_akses.pengguna
                     WHERE LOWER(username) IN (" . implode(',', array_fill(0, count($unique), 'LOWER(?)')) . ")",
                    $unique
                );
                foreach ($rs as $u) $usernameMap[strtolower($u->username)] = $u;
            }

            foreach ($rows as $entry) {
                $r = $entry['_data'];
                $line = $entry['_line'];
                $rowErrors = [];

                $username     = $get($r, 'username');
                $idPeranRaw   = $get($r, 'id_peran');
                $idOrganisasi = $get($r, 'id_organisasi');
                $noSk         = $get($r, 'no_sk');
                $tglSk        = $get($r, 'tgl_sk');
                $tglKadaluarsa = $get($r, 'tgl_kadaluarsa');
                $keterangan   = $get($r, 'keterangan');

                if ($username === '') $rowErrors[] = 'username kosong';
                if ($idPeranRaw === '' || !is_numeric($idPeranRaw)) {
                    $rowErrors[] = 'id_peran kosong/invalid';
                }
                $idPeran = (int) $idPeranRaw;
                if ($idPeran && !isset($peranMap[$idPeran])) {
                    $rowErrors[] = "id_peran=$idPeran tidak ditemukan";
                }
                if ($idPeran && isset($peranMap[$idPeran]) && $peranMap[$idPeran]->a_peran_identitas) {
                    $rowErrors[] = "id_peran=$idPeran adalah peran identitas — tidak boleh di-import (auto via SSO)";
                }
                if ($validPeranIdsForApp !== null && $idPeran && !in_array($idPeran, $validPeranIdsForApp, true)) {
                    $rowErrors[] = "id_peran=$idPeran tidak punya akses ke aplikasi target";
                }

                $pengguna = $usernameMap[strtolower($username)] ?? null;
                if ($username !== '' && !$pengguna) {
                    $rowErrors[] = "username '$username' tidak ditemukan di pengguna";
                }

                // Default tgl_kadaluarsa
                if ($tglKadaluarsa === '') $tglKadaluarsa = $defaultExpiry;
                if ($tglKadaluarsa && !preg_match('/^\d{4}-\d{2}-\d{2}/', $tglKadaluarsa)) {
                    $rowErrors[] = 'tgl_kadaluarsa harus YYYY-MM-DD';
                }
                if ($tglSk !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}/', $tglSk)) {
                    $rowErrors[] = 'tgl_sk harus YYYY-MM-DD';
                }

                // Cek duplikat (kalau pengguna ditemukan)
                $isDuplicate = false;
                if ($pengguna && $idPeran && empty($rowErrors)) {
                    $dup = DB::selectOne(
                        "SELECT COUNT(*) AS c FROM man_akses.role_pengguna
                         WHERE id_pengguna = ? AND id_peran = ? AND ISNULL(soft_delete, 0) = 0",
                        [$pengguna->id_pengguna, $idPeran]
                    );
                    $isDuplicate = $dup && $dup->c > 0;
                }

                $status = !empty($rowErrors) ? 'error' : ($isDuplicate ? 'duplikat' : 'ok');
                if ($status === 'error') $errors++;

                $preview[] = [
                    'line'           => $line,
                    'status'         => $status,
                    'errors'         => $rowErrors,
                    'username'       => $username,
                    'id_pengguna'    => $pengguna->id_pengguna ?? null,
                    'id_peran'       => $idPeran ?: null,
                    'nm_peran'       => $peranMap[$idPeran]->nm_peran ?? null,
                    'id_organisasi'  => $idOrganisasi ?: null,
                    'no_sk'          => $noSk ?: null,
                    'tgl_sk'         => $tglSk ?: null,
                    'tgl_kadaluarsa' => $tglKadaluarsa,
                    'keterangan'     => $keterangan ?: null,
                ];

                if ($status === 'ok') {
                    $okRows[] = end($preview);
                }
            }

            // Kalau dry_run, balikin preview saja
            if ($dryRun) {
                return response()->json([
                    'success' => true,
                    'message' => 'Preview import',
                    'data' => [
                        'dry_run'       => true,
                        'total_rows'    => count($rows),
                        'rows_ok'       => count($okRows),
                        'rows_error'    => $errors,
                        'rows_duplikat' => count($preview) - count($okRows) - $errors,
                        'preview'       => $preview,
                    ],
                ]);
            }

            // Commit insert
            DB::beginTransaction();
            $inserted = 0;
            $affectedUsers = [];
            foreach ($okRows as $row) {
                DB::insert("
                    INSERT INTO man_akses.role_pengguna (
                        id_role_pengguna, id_pengguna, id_organisasi, id_peran,
                        sk_penugasan, tgl_sk_penugasan, tgl_kadaluarsa,
                        approval_peran, last_active, tgl_create, last_update, last_sync, soft_delete
                    ) VALUES (
                        NEWID(), ?, ?, ?,
                        ?, ?, ?,
                        1, NULL, GETDATE(), GETDATE(), GETDATE(), 0
                    )
                ", [
                    $row['id_pengguna'],
                    $row['id_organisasi'],
                    $row['id_peran'],
                    $row['no_sk'],
                    $row['tgl_sk'] ?: null,
                    $row['tgl_kadaluarsa'],
                ]);
                $inserted++;
                $affectedUsers[$row['id_pengguna']] = $row['id_organisasi'];
            }
            DB::commit();

            // Invalidate cache untuk semua user yg dapet role baru
            foreach ($affectedUsers as $userId => $orgId) {
                $this->invalidateUserCache($userId, $orgId);
            }

            return response()->json([
                'success' => true,
                'message' => "$inserted role pengguna berhasil di-import",
                'data' => [
                    'dry_run'    => false,
                    'inserted'   => $inserted,
                    'total_rows' => count($rows),
                    'rows_error' => $errors,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('importBulk error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal import: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /role-pengguna/revoke-batch
     * Body: { ids: [...], alasan: "Sudah lulus" }
     *
     * Soft-delete bulk role_pengguna dengan logging alasan.
     */
    public function revokeBatch(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'ids'    => 'required|array|min:1|max:500',
                'ids.*'  => 'string|max:36',
                'alasan' => 'required|string|max:500',
            ]);

            $ids = array_values(array_unique($request->input('ids')));
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            $affected = DB::select(
                "SELECT CONVERT(VARCHAR(36), id_pengguna) AS id_pengguna,
                        CONVERT(VARCHAR(36), id_organisasi) AS id_organisasi
                 FROM man_akses.role_pengguna
                 WHERE id_role_pengguna IN ($placeholders) AND ISNULL(soft_delete, 0) = 0",
                $ids
            );

            $deleted = DB::update(
                "UPDATE man_akses.role_pengguna
                 SET soft_delete = 1, last_update = GETDATE()
                 WHERE id_role_pengguna IN ($placeholders) AND ISNULL(soft_delete, 0) = 0",
                $ids
            );

            Log::info('Bulk role-pengguna revoke', [
                'count'  => $deleted,
                'alasan' => $request->input('alasan'),
                'ids'    => $ids,
            ]);

            foreach ($affected as $a) {
                $this->invalidateUserCache($a->id_pengguna, $a->id_organisasi);
            }

            return response()->json([
                'success' => true,
                'message' => "$deleted role berhasil dicabut",
                'data' => ['deleted' => $deleted, 'requested' => count($ids)],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal revoke batch: ' . $e->getMessage()], 500);
        }
    }
}
