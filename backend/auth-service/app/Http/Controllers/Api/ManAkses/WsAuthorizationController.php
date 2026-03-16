<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * WS Authorization Controller
 * Manage endpoint access per role (ws_authorization by id_peran)
 */
class WsAuthorizationController extends Controller
{
    /**
     * Get authorization list with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $page = (int) $request->query('page', 1);
            $limit = (int) $request->query('limit', 20);
            $peranId = $request->query('id_peran');
            $appId = $request->query('id_aplikasi');
            $search = $request->query('search', '');
            $offset = ($page - 1) * $limit;

            $where = "WHERE wa.soft_delete = 0 AND wa.id_peran IS NOT NULL";
            $params = [];

            if ($peranId) {
                $where .= " AND wa.id_peran = ?";
                $params[] = (int) $peranId;
            }

            if ($appId) {
                $where .= " AND wa.id_aplikasi = ?";
                $params[] = $appId;
            }

            if ($search) {
                $where .= " AND (e.path_url LIKE ? OR e.nm_endpoint LIKE ? OR e.nm_group LIKE ?)";
                $params = array_merge($params, ["%{$search}%", "%{$search}%", "%{$search}%"]);
            }

            $total = DB::selectOne("
                SELECT COUNT(*) as cnt 
                FROM man_akses.ws_authorization wa
                LEFT JOIN man_akses.ws_endpoint e ON e.id_ws_endpoint = wa.id_ws_endpoint
                {$where}
            ", $params)->cnt;

            $data = DB::select("
                SELECT 
                    CONVERT(VARCHAR(36), wa.id_ws_authorization) as id_ws_authorization,
                    wa.id_peran,
                    CONVERT(VARCHAR(36), wa.id_aplikasi) as id_aplikasi,
                    CONVERT(VARCHAR(36), wa.id_ws_endpoint) as id_ws_endpoint,
                    wa.a_active,
                    e.nm_group,
                    e.nm_method,
                    e.nm_endpoint,
                    e.path_url,
                    p.nm_peran,
                    a.nm_aplikasi
                FROM man_akses.ws_authorization wa
                LEFT JOIN man_akses.ws_endpoint e ON e.id_ws_endpoint = wa.id_ws_endpoint
                LEFT JOIN man_akses.peran p ON p.id_peran = wa.id_peran
                LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = wa.id_aplikasi
                {$where}
                ORDER BY e.nm_group, e.path_url
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            ", array_merge($params, [$offset, $limit]));

            return response()->json([
                'success' => true,
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all authorized endpoint IDs for a specific role + app
     */
    public function byRole(Request $request, $idPeran): JsonResponse
    {
        try {
            $appId = $request->query('id_aplikasi');

            $where = "WHERE wa.soft_delete = 0 AND wa.id_peran = ? AND wa.a_active = 1";
            $params = [(int) $idPeran];

            if ($appId) {
                $where .= " AND wa.id_aplikasi = ?";
                $params[] = $appId;
            }

            $data = DB::select("
                SELECT 
                    CONVERT(VARCHAR(36), wa.id_ws_endpoint) as id_ws_endpoint,
                    CONVERT(VARCHAR(36), wa.id_aplikasi) as id_aplikasi,
                    e.nm_group,
                    e.nm_method,
                    e.path_url,
                    e.nm_endpoint
                FROM man_akses.ws_authorization wa
                LEFT JOIN man_akses.ws_endpoint e ON e.id_ws_endpoint = wa.id_ws_endpoint
                {$where}
                ORDER BY e.nm_group, e.path_url
            ", $params);

            // Return as flat array of endpoint IDs for easy checkbox mapping
            $endpointIds = array_map(fn($row) => $row->id_ws_endpoint, $data);

            return response()->json([
                'success' => true,
                'data' => $data,
                'endpoint_ids' => $endpointIds,
                'total' => count($data),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk assign endpoints to a role
     * Expects: { id_peran, id_aplikasi, endpoint_ids: [...] }
     */
    public function bulkAssign(Request $request): JsonResponse
    {
        try {
            $idPeran = (int) $request->input('id_peran');
            $idAplikasi = $request->input('id_aplikasi');
            $endpointIds = $request->input('endpoint_ids', []);

            if (!$idPeran || !$idAplikasi || empty($endpointIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'id_peran, id_aplikasi, dan endpoint_ids wajib diisi',
                ], 422);
            }

            $inserted = 0;
            $skipped = 0;

            foreach ($endpointIds as $epId) {
                // Check if already exists (including soft-deleted)
                $existing = DB::selectOne("
                    SELECT id_ws_authorization, soft_delete 
                    FROM man_akses.ws_authorization 
                    WHERE id_peran = ? AND id_ws_endpoint = ? AND id_aplikasi = ?
                ", [$idPeran, $epId, $idAplikasi]);

                if ($existing && $existing->soft_delete == 0) {
                    $skipped++;
                    continue;
                }

                if ($existing && $existing->soft_delete == 1) {
                    // Reactivate soft-deleted record
                    DB::update("
                        UPDATE man_akses.ws_authorization 
                        SET soft_delete = 0, a_active = 1, updated_at = GETDATE()
                        WHERE id_ws_authorization = ?
                    ", [$existing->id_ws_authorization]);
                    $inserted++;
                } else {
                    // Get any valid pengguna id (use first admin as placeholder for role-based records)
                    $adminUser = DB::selectOne("
                        SELECT TOP 1 CONVERT(VARCHAR(36), p.id_pengguna) as id_pengguna 
                        FROM man_akses.pengguna p
                        JOIN man_akses.role_pengguna rp ON rp.id_pengguna = p.id_pengguna AND rp.id_peran = 1 AND rp.soft_delete = 0
                        WHERE p.soft_delete = 0
                    ");
                    $placeholderUserId = $adminUser ? $adminUser->id_pengguna : null;
                    if (!$placeholderUserId) continue;

                    // Insert new per-role record
                    DB::insert("
                        INSERT INTO man_akses.ws_authorization 
                        (id_ws_authorization, id_pengguna, id_aplikasi, id_ws_endpoint, id_peran, a_active, created_at, updated_at, soft_delete)
                        VALUES (?, ?, ?, ?, ?, 1, GETDATE(), GETDATE(), 0)
                    ", [Str::uuid()->toString(), $placeholderUserId, $idAplikasi, $epId, $idPeran]);
                    $inserted++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil assign {$inserted} endpoint, {$skipped} sudah ada",
                'inserted' => $inserted,
                'skipped' => $skipped,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal assign: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk revoke endpoints from a role
     * Expects: { id_peran, id_aplikasi, endpoint_ids: [...] }
     */
    public function bulkRevoke(Request $request): JsonResponse
    {
        try {
            $idPeran = (int) $request->input('id_peran');
            $idAplikasi = $request->input('id_aplikasi');
            $endpointIds = $request->input('endpoint_ids', []);

            if (!$idPeran || empty($endpointIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'id_peran dan endpoint_ids wajib diisi',
                ], 422);
            }

            $revoked = 0;
            foreach ($endpointIds as $epId) {
                $affected = DB::update("
                    UPDATE man_akses.ws_authorization 
                    SET soft_delete = 1, updated_at = GETDATE()
                    WHERE id_peran = ? AND id_ws_endpoint = ? AND id_aplikasi = ? AND soft_delete = 0
                ", [$idPeran, $epId, $idAplikasi]);
                $revoked += $affected;
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil revoke {$revoked} endpoint",
                'revoked' => $revoked,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal revoke: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync: compare current vs desired, auto assign/revoke diff
     * Expects: { id_peran, id_aplikasi, endpoint_ids: [...] (desired state) }
     */
    public function sync(Request $request): JsonResponse
    {
        try {
            $idPeran = (int) $request->input('id_peran');
            $idAplikasi = $request->input('id_aplikasi');
            $desiredIds = $request->input('endpoint_ids', []);

            if (!$idPeran || !$idAplikasi) {
                return response()->json([
                    'success' => false,
                    'message' => 'id_peran dan id_aplikasi wajib diisi',
                ], 422);
            }

            // Get current authorized endpoints
            $current = DB::select("
                SELECT CONVERT(VARCHAR(36), id_ws_endpoint) as id_ws_endpoint
                FROM man_akses.ws_authorization 
                WHERE id_peran = ? AND id_aplikasi = ? AND soft_delete = 0 AND a_active = 1
            ", [$idPeran, $idAplikasi]);

            $currentIds = array_map(fn($r) => $r->id_ws_endpoint, $current);

            // Diff
            $toAssign = array_values(array_diff($desiredIds, $currentIds));
            $toRevoke = array_values(array_diff($currentIds, $desiredIds));

            $assigned = 0;
            $revoked = 0;

            // Assign new
            if (!empty($toAssign)) {
                $assignRequest = new Request([
                    'id_peran' => $idPeran,
                    'id_aplikasi' => $idAplikasi,
                    'endpoint_ids' => $toAssign,
                ]);
                $result = $this->bulkAssign($assignRequest);
                $resultData = json_decode($result->getContent(), true);
                $assigned = $resultData['inserted'] ?? 0;
            }

            // Revoke removed
            if (!empty($toRevoke)) {
                $revokeRequest = new Request([
                    'id_peran' => $idPeran,
                    'id_aplikasi' => $idAplikasi,
                    'endpoint_ids' => $toRevoke,
                ]);
                $result = $this->bulkRevoke($revokeRequest);
                $resultData = json_decode($result->getContent(), true);
                $revoked = $resultData['revoked'] ?? 0;
            }

            return response()->json([
                'success' => true,
                'message' => "Sync selesai: +{$assigned} assigned, -{$revoked} revoked",
                'assigned' => $assigned,
                'revoked' => $revoked,
                'unchanged' => count($desiredIds) - $assigned,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal sync: ' . $e->getMessage(),
            ], 500);
        }
    }
}
