<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PjAplikasiController extends Controller
{
    /**
     * List PJ by aplikasi
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $appId = $request->query('id_aplikasi');
            $page = (int) $request->query('page', 1);
            $limit = (int) $request->query('limit', 20);
            $search = $request->query('search', '');
            $offset = ($page - 1) * $limit;

            $where = "WHERE pj.soft_delete = 0";
            $params = [];

            if ($appId) {
                $where .= " AND pj.id_aplikasi = ?";
                $params[] = $appId;
            }

            if ($search) {
                $where .= " AND (pj.nm_pj LIKE ? OR pj.jabatan_pj LIKE ? OR pj.email LIKE ?)";
                $params = array_merge($params, ["%{$search}%", "%{$search}%", "%{$search}%"]);
            }

            // Count
            $total = DB::selectOne("SELECT COUNT(*) as cnt FROM man_akses.pj_aplikasi pj {$where}", $params)->cnt;

            // Data
            $data = DB::select("
                SELECT 
                    CONVERT(VARCHAR(36), pj.id_pj_aplikasi) as id_pj_aplikasi,
                    CONVERT(VARCHAR(36), pj.id_pengguna) as id_pengguna,
                    CONVERT(VARCHAR(36), pj.id_aplikasi) as id_aplikasi,
                    pj.nm_pj, pj.jabatan_pj, pj.no_hp, pj.email,
                    pj.a_masih,
                    CONVERT(VARCHAR(30), pj.wkt_selesai, 126) as wkt_selesai,
                    CONVERT(VARCHAR(30), pj.tgl_create, 126) as tgl_create,
                    CONVERT(VARCHAR(30), pj.last_update, 126) as last_update,
                    a.nm_aplikasi,
                    pg.nm_pengguna, pg.username
                FROM man_akses.pj_aplikasi pj
                LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = pj.id_aplikasi
                LEFT JOIN man_akses.pengguna pg ON pg.id_pengguna = pj.id_pengguna
                {$where}
                ORDER BY pj.nm_pj
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            ", array_merge($params, [$offset, $limit]));

            return response()->json([
                'success' => true,
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data PJ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get PJ by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $pj = DB::selectOne("
                SELECT 
                    CONVERT(VARCHAR(36), pj.id_pj_aplikasi) as id_pj_aplikasi,
                    CONVERT(VARCHAR(36), pj.id_pengguna) as id_pengguna,
                    CONVERT(VARCHAR(36), pj.id_aplikasi) as id_aplikasi,
                    pj.nm_pj, pj.jabatan_pj, pj.no_hp, pj.email,
                    pj.a_masih,
                    CONVERT(VARCHAR(30), pj.wkt_selesai, 126) as wkt_selesai,
                    a.nm_aplikasi,
                    pg.nm_pengguna, pg.username
                FROM man_akses.pj_aplikasi pj
                LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = pj.id_aplikasi
                LEFT JOIN man_akses.pengguna pg ON pg.id_pengguna = pj.id_pengguna
                WHERE pj.id_pj_aplikasi = ? AND pj.soft_delete = 0
            ", [$id]);

            if (!$pj) {
                return response()->json(['success' => false, 'message' => 'PJ tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'data' => $pj]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Create PJ
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'id_aplikasi' => 'required|string|max:36',
                'id_pengguna' => 'nullable|string|max:36',
                'nm_pj' => 'required|string|max:255',
                'jabatan_pj' => 'required|string|max:255',
                'no_hp' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'a_masih' => 'nullable|boolean',
            ]);

            $id = Str::uuid()->toString();
            $now = now();

            DB::insert("
                INSERT INTO man_akses.pj_aplikasi 
                (id_pj_aplikasi, id_pengguna, id_aplikasi, nm_pj, jabatan_pj, no_hp, email, a_masih, tgl_create, last_update, soft_delete, last_sync, id_updater)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, '00000000-0000-0000-0000-000000000000')
            ", [
                $id,
                $request->id_pengguna,
                $request->id_aplikasi,
                $request->nm_pj,
                $request->jabatan_pj,
                $request->no_hp,
                $request->email,
                $request->a_masih ?? 1,
                $now, $now, $now,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PJ Aplikasi berhasil ditambahkan',
                'data' => ['id_pj_aplikasi' => $id]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update PJ
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_pj' => 'required|string|max:255',
                'jabatan_pj' => 'required|string|max:255',
                'no_hp' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'a_masih' => 'nullable|boolean',
                'wkt_selesai' => 'nullable|date',
            ]);

            $affected = DB::update("
                UPDATE man_akses.pj_aplikasi SET
                    nm_pj = ?, jabatan_pj = ?, no_hp = ?, email = ?,
                    a_masih = ?, wkt_selesai = ?, last_update = ?, last_sync = ?
                WHERE id_pj_aplikasi = ? AND soft_delete = 0
            ", [
                $request->nm_pj,
                $request->jabatan_pj,
                $request->no_hp,
                $request->email,
                $request->a_masih ?? 1,
                $request->wkt_selesai,
                now(), now(),
                $id,
            ]);

            if ($affected === 0) {
                return response()->json(['success' => false, 'message' => 'PJ tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'message' => 'PJ berhasil diperbarui']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete PJ (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $affected = DB::update("
                UPDATE man_akses.pj_aplikasi 
                SET soft_delete = 1, last_update = ?, last_sync = ?
                WHERE id_pj_aplikasi = ? AND soft_delete = 0
            ", [now(), now(), $id]);

            if ($affected === 0) {
                return response()->json(['success' => false, 'message' => 'PJ tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'message' => 'PJ berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }
}
