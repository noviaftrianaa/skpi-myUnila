<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\AplikasiService;
use App\Repositories\ManAkses\AplikasiRepository;
use App\Repositories\UserContext\UserContextRepository;
use App\Services\UserContext\UserContextService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

/**
 * Aplikasi Controller
 * API endpoints for aplikasi (application) management
 */
class AplikasiController extends Controller
{
    protected AplikasiService $service;

    public function __construct()
    {
        $repository = new AplikasiRepository();
        $userContextRepository = new UserContextRepository();
        $userContextService = new UserContextService($userContextRepository);
        $this->service = new AplikasiService($repository, $userContextService);
    }

    /**
     * Get paginated list of aplikasi
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
                'status' => $request->get('status'), // 'aktif', 'nonaktif'
                'jenis' => $request->get('jenis'), // 'internal', 'external'
                'mode' => $request->get('mode'), // 'production', 'development'
                'portal' => $request->get('portal'), // 'ya', 'tidak'
                'terintegrasi' => $request->get('terintegrasi'), // 'ya', 'tidak'
                'sso_cas' => $request->get('sso_cas'), // 'ya', 'tidak'
                'maintenance' => $request->get('maintenance'), // 'ya', 'tidak'
                'coming_soon' => $request->get('coming_soon'), // 'ya', 'tidak'
                'sort_by' => $request->get('sort_by'), // column name
                'sort_order' => $request->get('sort_order'), // 'asc', 'desc'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get aplikasi detail
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
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get aplikasi statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get categories for dropdown
     *
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {
        try {
            $result = $this->service->getCategories();

            return response()->json([
                'success' => true,
                'message' => 'Kategori aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kategori aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new aplikasi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_aplikasi' => 'required|string|max:255',
                'ket_aplikasi' => 'nullable|string',
                'id_organisasi' => 'nullable|string|max:36',
                'id_kategori' => 'nullable|string|max:36',
                'url' => 'nullable|string|max:255',
                'port' => 'nullable|string|max:10',
                'teknologi' => 'nullable|string|max:100',
                'endpoint_ws' => 'nullable|string|max:255',
                'icon_name' => 'nullable|string|max:100',
                'icon_color' => 'nullable|string|max:50',
                'app_slug' => 'nullable|string|max:100',
                'urutan' => 'nullable|integer',
                'a_generate_menu' => 'nullable|boolean',
                'a_integrasi_cas' => 'nullable|boolean',
                'a_sistem_internal_pt' => 'nullable|boolean',
                'a_tampil_portal' => 'nullable|boolean',
                'a_maintenance' => 'nullable|boolean',
                'a_coming_soon' => 'nullable|boolean',
                'a_terintegrasi' => 'nullable|boolean',
                'a_live' => 'nullable|boolean',
                'a_filter_organisasi' => 'nullable|boolean',
                'status' => 'nullable|string|in:Aktif,Tidak Aktif',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi', 'a_live', 'a_filter_organisasi',
                'status'
            ]);

            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil ditambahkan',
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
                'message' => 'Gagal menambahkan aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing aplikasi
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_aplikasi' => 'required|string|max:255',
                'ket_aplikasi' => 'nullable|string',
                'id_organisasi' => 'nullable|string|max:36',
                'id_kategori' => 'nullable|string|max:36',
                'url' => 'nullable|string|max:255',
                'port' => 'nullable|string|max:10',
                'teknologi' => 'nullable|string|max:100',
                'endpoint_ws' => 'nullable|string|max:255',
                'icon_name' => 'nullable|string|max:100',
                'icon_color' => 'nullable|string|max:50',
                'app_slug' => 'nullable|string|max:100',
                'urutan' => 'nullable|integer',
                'a_generate_menu' => 'nullable|boolean',
                'a_integrasi_cas' => 'nullable|boolean',
                'a_sistem_internal_pt' => 'nullable|boolean',
                'a_tampil_portal' => 'nullable|boolean',
                'a_maintenance' => 'nullable|boolean',
                'a_coming_soon' => 'nullable|boolean',
                'a_terintegrasi' => 'nullable|boolean',
                'a_live' => 'nullable|boolean',
                'status' => 'nullable|string|in:Aktif,Tidak Aktif',
                'a_filter_organisasi' => 'nullable|boolean',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi', 'a_live', 'a_filter_organisasi',
                'status'
            ]);

            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil diperbarui',
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
                'message' => 'Gagal memperbarui aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete aplikasi (soft delete)
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Regenerate app_key for aplikasi
     *
     * @param string $id
     * @return JsonResponse
     */
    public function regenerateAppKey(string $id): JsonResponse
    {
        try {
            $result = $this->service->regenerateAppKey($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'App Key berhasil di-generate ulang',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate app key: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get whitelisted organisations for an application
     */
    public function getOrganisasi(string $id): JsonResponse
    {
        try {
            $orgs = DB::select("
                SELECT ao.id_app_org, CONVERT(VARCHAR(36), ao.id_organisasi) as id_organisasi, 
                       ao.a_include_children, ao.ket,
                       uo.nm_lemb as nm_organisasi
                FROM man_akses.aplikasi_organisasi ao
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ao.id_organisasi
                WHERE ao.id_aplikasi = ? AND ISNULL(ao.soft_delete, 0) = 0
                ORDER BY uo.nm_lemb
            ", [$id]);

            return response()->json([
                'success' => true,
                'data' => $orgs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data organisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add organisation to app whitelist
     */
    public function addOrganisasi(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'id_organisasi' => 'required|string|max:36',
                'a_include_children' => 'nullable|boolean',
                'ket' => 'nullable|string|max:255',
            ]);

            // Cek duplicate
            $exists = DB::selectOne("
                SELECT COUNT(*) as cnt FROM man_akses.aplikasi_organisasi 
                WHERE id_aplikasi = ? AND id_organisasi = ? AND ISNULL(soft_delete, 0) = 0
            ", [$id, $request->id_organisasi]);

            if ($exists && $exists->cnt > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Organisasi sudah terdaftar untuk aplikasi ini'
                ], 409);
            }

            DB::insert("
                INSERT INTO man_akses.aplikasi_organisasi 
                (id_app_org, id_aplikasi, id_organisasi, a_include_children, ket, tgl_create, last_update, soft_delete, last_sync, id_updater)
                VALUES (NEWID(), ?, ?, ?, ?, GETDATE(), GETDATE(), 0, GETDATE(), '00000000-0000-0000-0000-000000000000')
            ", [$id, $request->id_organisasi, $request->a_include_children ?? 1, $request->ket]);

            return response()->json([
                'success' => true,
                'message' => 'Organisasi berhasil ditambahkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah organisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove organisation from app whitelist
     */
    public function removeOrganisasi(string $id, string $orgId): JsonResponse
    {
        try {
            $affected = DB::update("
                UPDATE man_akses.aplikasi_organisasi 
                SET soft_delete = 1, last_update = GETDATE()
                WHERE id_aplikasi = ? AND id_organisasi = ? AND ISNULL(soft_delete, 0) = 0
            ", [$id, $orgId]);

            if ($affected === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Organisasi berhasil dihapus dari whitelist'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus organisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    // ========================================================================
    // Default Role per Aplikasi (Pilar 6 — peran identitas Mhs/Dosen/Tendik)
    // ========================================================================

    /**
     * Get default-role checklist untuk satu aplikasi.
     *
     * Return SEMUA peran identitas (a_peran_identitas=1) dengan flag has_default
     * = apakah peran tersebut sudah aktif di aplikasi_default_role.
     *
     * Dipakai utk render 3 checkbox (Mhs/Dosen/Tendik) di Edit Aplikasi modal.
     */
    public function getDefaultRoles(string $id): JsonResponse
    {
        try {
            $rows = DB::select("
                SELECT
                    p.id_peran,
                    p.nm_peran,
                    CASE
                        WHEN adr.id_aplikasi IS NOT NULL THEN 1
                        ELSE 0
                    END AS has_default
                FROM man_akses.peran p
                LEFT JOIN man_akses.aplikasi_default_role adr
                    ON adr.id_peran = p.id_peran
                   AND adr.id_aplikasi = ?
                   AND adr.a_aktif = 1
                   AND ISNULL(adr.soft_delete, 0) = 0
                WHERE p.a_peran_identitas = 1
                  AND (p.expired_date IS NULL OR p.expired_date > GETDATE())
                ORDER BY p.id_peran
            ", [$id]);

            return response()->json([
                'success' => true,
                'data' => array_map(fn($r) => [
                    'id_peran' => (int) $r->id_peran,
                    'nm_peran' => $r->nm_peran,
                    'has_default' => (bool) $r->has_default,
                ], $rows),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil default roles: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync default-role checklist untuk satu aplikasi.
     *
     * Body: {"role_ids": [39, 46]}  // peran identitas yg dicentang
     *
     * Strategi:
     *   1. Validasi semua role_ids harus a_peran_identitas=1 (tidak boleh peran
     *      fungsional masuk ke default-role — itu domain menu_role).
     *   2. INSERT yg belum ada (skip duplicate).
     *   3. Soft-delete row yg dulu ada tapi sekarang tidak dicentang.
     *   4. Invalidate cache (default_access:* + portal_apps:*).
     */
    public function syncDefaultRoles(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'role_ids'   => 'required|array',
                'role_ids.*' => 'integer',
            ]);
            $roleIds = array_unique(array_map('intval', $request->input('role_ids', [])));

            // Pastikan aplikasi exists (man_akses.aplikasi pakai expired_date, bukan soft_delete)
            $appExists = DB::selectOne(
                "SELECT 1 AS x FROM man_akses.aplikasi WHERE id_aplikasi = ? AND expired_date IS NULL",
                [$id]
            );
            if (!$appExists) {
                return response()->json(['success' => false, 'message' => 'Aplikasi tidak ditemukan'], 404);
            }

            // Validasi: semua role_ids HARUS peran identitas
            if (!empty($roleIds)) {
                $placeholders = implode(',', array_fill(0, count($roleIds), '?'));
                $valid = DB::select("
                    SELECT id_peran FROM man_akses.peran
                    WHERE id_peran IN ($placeholders)
                      AND a_peran_identitas = 1
                      AND (expired_date IS NULL OR expired_date > GETDATE())
                ", $roleIds);
                $validIds = array_map(fn($r) => (int) $r->id_peran, $valid);
                $invalidIds = array_diff($roleIds, $validIds);
                if (!empty($invalidIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya peran identitas (a_peran_identitas=1) yg boleh di-set sebagai default. Invalid: '
                            . implode(',', $invalidIds),
                    ], 422);
                }
            }

            DB::beginTransaction();

            // 1. UPSERT: untuk setiap role yg dicentang, pastikan ada row aktif
            $inserted = 0; $reactivated = 0;
            foreach ($roleIds as $idPeran) {
                $existing = DB::selectOne(
                    "SELECT a_aktif, soft_delete FROM man_akses.aplikasi_default_role
                     WHERE id_aplikasi = ? AND id_peran = ?",
                    [$id, $idPeran]
                );
                if (!$existing) {
                    DB::insert("
                        INSERT INTO man_akses.aplikasi_default_role
                            (id_aplikasi, id_peran, a_aktif, soft_delete, tgl_create, last_update, last_sync, id_creator, id_updater)
                        VALUES (?, ?, 1, 0, GETDATE(), GETDATE(), GETDATE(),
                                '00000000-0000-0000-0000-000000000000',
                                '00000000-0000-0000-0000-000000000000')
                    ", [$id, $idPeran]);
                    $inserted++;
                } elseif (!$existing->a_aktif || $existing->soft_delete) {
                    DB::update("
                        UPDATE man_akses.aplikasi_default_role
                        SET a_aktif = 1, soft_delete = 0, last_update = GETDATE()
                        WHERE id_aplikasi = ? AND id_peran = ?
                    ", [$id, $idPeran]);
                    $reactivated++;
                }
            }

            // 2. Soft-delete row yg sebelumnya aktif tapi sekarang tidak dicentang
            $deleted = 0;
            if (empty($roleIds)) {
                $deleted = DB::update("
                    UPDATE man_akses.aplikasi_default_role
                    SET a_aktif = 0, soft_delete = 1, last_update = GETDATE()
                    WHERE id_aplikasi = ? AND a_aktif = 1 AND ISNULL(soft_delete, 0) = 0
                ", [$id]);
            } else {
                $placeholders = implode(',', array_fill(0, count($roleIds), '?'));
                $deleted = DB::update("
                    UPDATE man_akses.aplikasi_default_role
                    SET a_aktif = 0, soft_delete = 1, last_update = GETDATE()
                    WHERE id_aplikasi = ?
                      AND a_aktif = 1 AND ISNULL(soft_delete, 0) = 0
                      AND id_peran NOT IN ($placeholders)
                ", array_merge([$id], $roleIds));
            }

            DB::commit();

            // 3. Invalidate cache (default_access + portal_apps)
            $userContextRepository = new UserContextRepository();
            $userContextService = new UserContextService($userContextRepository);
            $userContextService->invalidateDefaultAccessCache(null, $id);

            return response()->json([
                'success' => true,
                'message' => 'Default role berhasil disimpan',
                'data' => [
                    'inserted'    => $inserted,
                    'reactivated' => $reactivated,
                    'deactivated' => $deleted,
                    'role_ids'    => $roleIds,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal sync default roles: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Read-only listing siapa saja yg punya akses ke 1 aplikasi.
     *
     * Sumber akses (UNION):
     *   1. role_pengguna dgn id_peran yg punya menu_role utk aplikasi ini
     *      (peran fungsional dgn SK + assignment manual).
     *   2. role_pengguna dgn id_peran yg punya aplikasi_default_role utk app ini
     *      (peran identitas Mhs/Dosen/Tendik — Pilar 6).
     *   3. role_pengguna dgn peran.a_universal=1 (super role — selalu akses).
     *
     * Output:
     *   - summary: jumlah user per peran + total + breakdown identitas vs fungsional
     *   - data: paginated list user (nama, username, peran, unit, sk, tgl_sk)
     *
     * Query params: page, limit, search, id_peran, akses_via (identitas|fungsional|universal)
     */
    public function aksesPengguna(Request $request, string $id): JsonResponse
    {
        try {
            $page  = max(1, (int) $request->get('page', 1));
            $limit = min(200, max(5, (int) $request->get('limit', 25)));
            $search = trim((string) $request->get('search', ''));
            $idPeran = $request->get('id_peran');
            $aksesVia = $request->get('akses_via'); // 'identitas' | 'fungsional' | 'universal'

            $offset = ($page - 1) * $limit;

            // Validasi app (man_akses.aplikasi pakai expired_date, bukan soft_delete)
            $app = DB::selectOne(
                "SELECT CONVERT(VARCHAR(36), id_aplikasi) AS id_aplikasi, nm_aplikasi, app_slug
                 FROM man_akses.aplikasi
                 WHERE id_aplikasi = ? AND expired_date IS NULL",
                [$id]
            );
            if (!$app) {
                return response()->json(['success' => false, 'message' => 'Aplikasi tidak ditemukan'], 404);
            }

            // CTE: peran yg punya akses ke app ini, dgn label sumber akses
            $peranAccessCte = "
                WITH peran_akses AS (
                    -- peran identitas via aplikasi_default_role
                    SELECT DISTINCT
                        adr.id_peran,
                        'identitas' AS akses_via
                    FROM man_akses.aplikasi_default_role adr
                    INNER JOIN man_akses.peran p ON p.id_peran = adr.id_peran
                    WHERE adr.id_aplikasi = ?
                      AND adr.a_aktif = 1
                      AND ISNULL(adr.soft_delete, 0) = 0
                      AND (p.expired_date IS NULL OR p.expired_date > GETDATE())

                    UNION

                    -- peran fungsional via menu_role
                    SELECT DISTINCT
                        mr.id_peran,
                        'fungsional' AS akses_via
                    FROM man_akses.menu_role mr
                    INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
                    INNER JOIN man_akses.peran p ON p.id_peran = mr.id_peran
                    WHERE m.id_aplikasi = ?
                      AND ISNULL(mr.soft_delete, 0) = 0
                      AND (m.expired_date IS NULL OR m.expired_date > GETDATE())
                      AND (p.expired_date IS NULL OR p.expired_date > GETDATE())
                      AND p.id_peran NOT IN (
                          SELECT id_peran FROM man_akses.aplikasi_default_role
                          WHERE id_aplikasi = ? AND a_aktif = 1 AND ISNULL(soft_delete, 0) = 0
                      )

                    UNION

                    -- peran universal (super role) — selalu akses semua app
                    SELECT
                        p.id_peran,
                        'universal' AS akses_via
                    FROM man_akses.peran p
                    WHERE p.a_universal = 1
                      AND (p.expired_date IS NULL OR p.expired_date > GETDATE())
                )
            ";

            // ============================================================
            // SUMMARY: count per peran (utk header card)
            // ============================================================
            $summaryRows = DB::select($peranAccessCte . "
                SELECT
                    pa.id_peran,
                    pr.nm_peran,
                    pr.a_peran_identitas,
                    pr.a_universal,
                    pa.akses_via,
                    COUNT(DISTINCT rp.id_pengguna) AS jumlah_user
                FROM peran_akses pa
                INNER JOIN man_akses.peran pr ON pr.id_peran = pa.id_peran
                LEFT JOIN man_akses.role_pengguna rp
                    ON rp.id_peran = pa.id_peran
                   AND ISNULL(rp.soft_delete, 0) = 0
                GROUP BY pa.id_peran, pr.nm_peran, pr.a_peran_identitas, pr.a_universal, pa.akses_via
                ORDER BY pa.akses_via, pr.nm_peran
            ", [$id, $id, $id]);

            // ============================================================
            // DATA: paginated user list
            // ============================================================
            $whereExtra = '';
            $bindings = [$id, $id, $id];
            if ($idPeran) {
                $whereExtra .= ' AND rp.id_peran = ?';
                $bindings[] = (int) $idPeran;
            }
            if ($aksesVia && in_array($aksesVia, ['identitas', 'fungsional', 'universal'], true)) {
                $whereExtra .= " AND pa.akses_via = ?";
                $bindings[] = $aksesVia;
            }
            if ($search !== '') {
                $whereExtra .= ' AND (p.nm_pengguna LIKE ? OR p.username LIKE ? OR p.email LIKE ?)';
                $term = '%' . $search . '%';
                $bindings[] = $term; $bindings[] = $term; $bindings[] = $term;
            }

            $countSql = $peranAccessCte . "
                SELECT COUNT(DISTINCT rp.id_role_pengguna) AS total
                FROM peran_akses pa
                INNER JOIN man_akses.role_pengguna rp ON rp.id_peran = pa.id_peran AND ISNULL(rp.soft_delete, 0) = 0
                INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
                INNER JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
                WHERE 1=1 $whereExtra
            ";
            $countRow = DB::selectOne($countSql, $bindings);
            $total = (int) ($countRow->total ?? 0);

            $dataSql = $peranAccessCte . "
                SELECT
                    CONVERT(VARCHAR(36), rp.id_role_pengguna) AS id_role_pengguna,
                    CONVERT(VARCHAR(36), rp.id_pengguna) AS id_pengguna,
                    p.nm_pengguna,
                    p.username,
                    p.email,
                    rp.id_peran,
                    pr.nm_peran,
                    ISNULL(pr.a_peran_identitas, 0) AS a_peran_identitas,
                    ISNULL(pr.a_universal, 0) AS a_universal,
                    pa.akses_via,
                    CONVERT(VARCHAR(36), rp.id_organisasi) AS id_organisasi,
                    uo.nm_lemb AS nm_organisasi,
                    rp.sk_penugasan,
                    rp.tgl_sk_penugasan,
                    rp.approval_peran,
                    rp.last_active,
                    rp.tgl_create
                FROM peran_akses pa
                INNER JOIN man_akses.role_pengguna rp ON rp.id_peran = pa.id_peran AND ISNULL(rp.soft_delete, 0) = 0
                INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
                INNER JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
                WHERE 1=1 $whereExtra
                ORDER BY pa.akses_via, pr.nm_peran, p.nm_pengguna
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            ";
            $bindings[] = $offset;
            $bindings[] = $limit;
            $rows = DB::select($dataSql, $bindings);

            // Aggregate summary buckets
            $totalUser = 0; $totalIdentitas = 0; $totalFungsional = 0; $totalUniversal = 0;
            $byPeran = [];
            foreach ($summaryRows as $r) {
                $j = (int) $r->jumlah_user;
                $totalUser += $j;
                if ($r->akses_via === 'identitas')  $totalIdentitas += $j;
                if ($r->akses_via === 'fungsional') $totalFungsional += $j;
                if ($r->akses_via === 'universal')  $totalUniversal += $j;
                $byPeran[] = [
                    'id_peran'        => (int) $r->id_peran,
                    'nm_peran'        => $r->nm_peran,
                    'a_peran_identitas' => (bool) $r->a_peran_identitas,
                    'a_universal'     => (bool) $r->a_universal,
                    'akses_via'       => $r->akses_via,
                    'jumlah_user'     => $j,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'app' => [
                        'id_aplikasi' => $app->id_aplikasi,
                        'nm_aplikasi' => $app->nm_aplikasi,
                        'app_slug'    => $app->app_slug,
                    ],
                    'summary' => [
                        'total_user'       => $totalUser,
                        'total_identitas'  => $totalIdentitas,
                        'total_fungsional' => $totalFungsional,
                        'total_universal'  => $totalUniversal,
                        'per_peran'        => $byPeran,
                    ],
                    'pengguna' => [
                        'data'        => array_map(fn($r) => [
                            'id_role_pengguna' => $r->id_role_pengguna,
                            'id_pengguna'      => $r->id_pengguna,
                            'nm_pengguna'      => $r->nm_pengguna,
                            'username'         => $r->username,
                            'email'            => $r->email,
                            'id_peran'         => (int) $r->id_peran,
                            'nm_peran'         => $r->nm_peran,
                            'a_peran_identitas' => (bool) $r->a_peran_identitas,
                            'a_universal'      => (bool) $r->a_universal,
                            'akses_via'        => $r->akses_via,
                            'id_organisasi'    => $r->id_organisasi,
                            'nm_organisasi'    => $r->nm_organisasi,
                            'sk_penugasan'     => $r->sk_penugasan,
                            'tgl_sk_penugasan' => $r->tgl_sk_penugasan,
                            'approval_peran'   => $r->approval_peran,
                            'last_active'      => $r->last_active,
                            'tgl_create'       => $r->tgl_create,
                        ], $rows),
                        'total'       => $total,
                        'page'        => $page,
                        'limit'       => $limit,
                        'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil akses pengguna: ' . $e->getMessage(),
            ], 500);
        }
    }
}
