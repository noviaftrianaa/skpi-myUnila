<?php

namespace App\Http\Middleware;

use App\Services\UserContext\UserContextService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check CRUD permissions based on user's active role context
 *
 * Usage in routes:
 *   Route::post('/aplikasi', [Controller::class, 'store'])->middleware('permission:insert');
 *   Route::put('/aplikasi/{id}', [Controller::class, 'update'])->middleware('permission:update');
 *   Route::delete('/aplikasi/{id}', [Controller::class, 'destroy'])->middleware('permission:delete');
 *
 * Permission types:
 *   - show: View/read data
 *   - insert: Create new data
 *   - update: Modify existing data
 *   - delete: Remove data
 *   - reject: Reject/sanggah actions
 *   - approve: Approval actions
 */
class CheckCrudPermission
{
    public function __construct(
        private UserContextService $userContextService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permissionType  The permission type to check (insert, update, delete, show, reject, approve)
     * @param  string|null  $appKey  Optional app key, defaults to request header or query
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $permissionType, ?string $appKey = null): Response
    {
        // Get authenticated user
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: User not authenticated',
            ], 401);
        }

        // TEMPORARY BYPASS: Allow developers full access without permission check
        // TODO: Remove this after production database sync is complete
        if (env('BYPASS_PERMISSION_CHECK', false)) {
            Log::info('BYPASS: Permission check bypassed for user', [
                'user_id' => $user->id_pengguna,
                'permission_type' => $permissionType,
            ]);

            // Attach super permissions
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

        // Get app key from parameter, header, or query string
        $appKey = $appKey
            ?? $request->header('X-App-Key')
            ?? $request->query('app_key')
            ?? $request->input('app_key');

        if (!$appKey) {
            return response()->json([
                'success' => false,
                'message' => 'Bad Request: App key is required for permission check',
            ], 400);
        }

        try {
            // Check app access and get permissions
            $accessResult = $this->userContextService->checkAppAccess(
                $user->id_pengguna,
                null,
                $appKey
            );

            // Check if user has access to the app
            if (!($accessResult['has_access'] ?? false)) {
                Log::warning('Permission denied: No app access', [
                    'user_id' => $user->id_pengguna,
                    'app_key' => $appKey,
                    'reason' => $accessResult['reason'] ?? 'Unknown',
                ]);

                return response()->json([
                    'success' => false,
                    'message' => $accessResult['reason'] ?? 'Anda tidak memiliki akses ke aplikasi ini',
                ], 403);
            }

            // Get permissions from the access result
            $permissions = $accessResult['permissions'] ?? [];

            // Map permission type to permission key
            $permissionMap = [
                'show' => 'can_show',
                'insert' => 'can_insert',
                'update' => 'can_update',
                'delete' => 'can_delete',
                'reject' => 'can_reject',
                'approve' => 'can_approve',
            ];

            $permissionKey = $permissionMap[$permissionType] ?? null;

            if (!$permissionKey) {
                Log::error('Invalid permission type', [
                    'permission_type' => $permissionType,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid permission type',
                ], 500);
            }

            // Super roles have all permissions
            if ($permissions['is_super_role'] ?? false) {
                // Attach permissions to request for controller use
                $request->attributes->set('crud_permissions', $permissions);
                $request->attributes->set('app_context', $accessResult['context'] ?? null);
                return $next($request);
            }

            // Check if user has the required permission
            if (!($permissions[$permissionKey] ?? false)) {
                $permissionLabels = [
                    'show' => 'melihat',
                    'insert' => 'menambah',
                    'update' => 'mengubah',
                    'delete' => 'menghapus',
                    'reject' => 'menolak/sanggah',
                    'approve' => 'menyetujui',
                ];

                $label = $permissionLabels[$permissionType] ?? $permissionType;
                $roleName = $accessResult['context']['nm_peran'] ?? 'Anda';

                Log::warning('Permission denied: Insufficient CRUD permission', [
                    'user_id' => $user->id_pengguna,
                    'app_key' => $appKey,
                    'permission_type' => $permissionType,
                    'role_name' => $roleName,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "Role {$roleName} tidak memiliki izin untuk {$label} data",
                    'permission_required' => $permissionType,
                ], 403);
            }

            // Attach permissions to request for controller use
            $request->attributes->set('crud_permissions', $permissions);
            $request->attributes->set('app_context', $accessResult['context'] ?? null);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Permission check error', [
                'user_id' => $user->id_pengguna ?? null,
                'app_key' => $appKey,
                'permission_type' => $permissionType,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error checking permissions',
            ], 500);
        }
    }
}
