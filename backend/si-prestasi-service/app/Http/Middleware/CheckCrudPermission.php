<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware permission check untuk bak-service.
 * Cek akses CRUD berdasarkan role pengguna di pdut.
 *
 * Usage: Route::post('/...')->middleware('permission:insert,sim-bak');
 */
class CheckCrudPermission
{
    public function handle(Request $request, Closure $next, string $permissionType, ?string $appKey = null): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: User not authenticated',
            ], 401);
        }

        // Bypass untuk development
        if (env('BYPASS_PERMISSION_CHECK', false)) {
            $request->attributes->set('crud_permissions', [
                'is_super_role' => true,
                'can_show' => true,
                'can_insert' => true,
                'can_update' => true,
                'can_delete' => true,
                'can_reject' => true,
                'can_approve' => true,
            ]);
            return $next($request);
        }

        $appKey = $appKey
            ?? $request->header('X-App-Key')
            ?? $request->query('app_key')
            ?? 'sim-bak';

        try {
            // Check role_pengguna di pdut
            $sql = "
                SELECT rp.id_role_pengguna, p.nm_peran, p.slug_peran,
                       rp.a_show, rp.a_insert, rp.a_update, rp.a_delete,
                       rp.a_reject, rp.a_approve
                FROM man_akses.role_pengguna rp
                JOIN man_akses.peran p ON p.id_peran = rp.id_peran
                JOIN man_akses.aplikasi a ON a.id_aplikasi = rp.id_aplikasi
                WHERE rp.id_pengguna = ?
                  AND a.slug_aplikasi = ?
                  AND rp.a_aktif = 1
                  AND (rp.soft_delete IS NULL OR rp.soft_delete = 0)
            ";

            $roleData = DB::connection('sqlsrv')->selectOne($sql, [$user->id_pengguna, $appKey]);

            if (!$roleData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke aplikasi ini',
                ], 403);
            }

            $permissions = [
                'is_super_role' => in_array($roleData->slug_peran ?? '', ['super_admin', 'developer']),
                'can_show' => (bool) ($roleData->a_show ?? false),
                'can_insert' => (bool) ($roleData->a_insert ?? false),
                'can_update' => (bool) ($roleData->a_update ?? false),
                'can_delete' => (bool) ($roleData->a_delete ?? false),
                'can_reject' => (bool) ($roleData->a_reject ?? false),
                'can_approve' => (bool) ($roleData->a_approve ?? false),
            ];

            // Super role bypass
            if ($permissions['is_super_role']) {
                $request->attributes->set('crud_permissions', array_merge($permissions, [
                    'can_show' => true, 'can_insert' => true, 'can_update' => true,
                    'can_delete' => true, 'can_reject' => true, 'can_approve' => true,
                ]));
                return $next($request);
            }

            $permissionMap = [
                'show' => 'can_show', 'insert' => 'can_insert', 'update' => 'can_update',
                'delete' => 'can_delete', 'reject' => 'can_reject', 'approve' => 'can_approve',
            ];

            $permissionKey = $permissionMap[$permissionType] ?? null;
            if (!$permissionKey || !($permissions[$permissionKey] ?? false)) {
                $labels = [
                    'show' => 'melihat', 'insert' => 'menambah', 'update' => 'mengubah',
                    'delete' => 'menghapus', 'reject' => 'menolak', 'approve' => 'menyetujui',
                ];
                return response()->json([
                    'success' => false,
                    'message' => sprintf('Role %s tidak memiliki izin untuk %s data',
                        $roleData->nm_peran ?? 'Anda', $labels[$permissionType] ?? $permissionType),
                ], 403);
            }

            $request->attributes->set('crud_permissions', $permissions);
            return $next($request);

        } catch (\Exception $e) {
            Log::error('Permission check error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking permissions',
            ], 500);
        }
    }
}
