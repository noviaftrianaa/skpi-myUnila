<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiConfigService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * ApiConfigController — manage setting.api_config (admin SIMKATMAWA credentials).
 *
 * - GET    /v1/master-data/api-config       — list all configs (kode, base_url, status; credentials masked)
 * - GET    /v1/master-data/api-config/{kode} — detail config (credentials masked)
 * - PUT    /v1/master-data/api-config/{kode} — update credentials (encrypted) + flags + base_url
 * - POST   /v1/master-data/api-config/{kode}/toggle — toggle a_active or a_dry_run
 *
 * Encryption: Laravel Crypt (AES-256-CBC dengan APP_KEY) — handled by ApiConfigService.
 */
class ApiConfigController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ApiConfigService $apiConfigSvc,
    ) {}

    public function index(): JsonResponse
    {
        $rows = DB::connection('pgsql')->select("
            SELECT id_api_config, kode, nm_api, base_url, auth_type, auth_login_path,
                   kode_pt, rate_limit_per_min, timeout_seconds, retry_policy,
                   a_active, a_dry_run, deskripsi,
                   (auth_username_encrypted IS NOT NULL) AS has_username,
                   (auth_password_encrypted IS NOT NULL) AS has_password,
                   (auth_api_key_encrypted IS NOT NULL) AS has_api_key,
                   created_at, updated_at
            FROM setting.api_config
            ORDER BY kode
        ");
        return $this->successResponse(array_map(fn($r) => (array) $r, $rows));
    }

    public function show(string $kode): JsonResponse
    {
        $row = DB::connection('pgsql')->selectOne("
            SELECT id_api_config, kode, nm_api, base_url, auth_type, auth_login_path,
                   kode_pt, rate_limit_per_min, timeout_seconds, retry_policy,
                   a_active, a_dry_run, deskripsi,
                   (auth_username_encrypted IS NOT NULL) AS has_username,
                   (auth_password_encrypted IS NOT NULL) AS has_password,
                   (auth_api_key_encrypted IS NOT NULL) AS has_api_key,
                   created_at, updated_at
            FROM setting.api_config
            WHERE kode = ?
        ", [$kode]);
        if (!$row) {
            return response()->json(['success' => false, 'message' => "Config '{$kode}' tidak ada"], 404);
        }
        return $this->successResponse((array) $row);
    }

    public function update(Request $request, string $kode): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'username'        => 'nullable|string|max:255',
            'password'        => 'nullable|string|max:255',
            'api_key'         => 'nullable|string|max:512',
            'base_url'        => 'nullable|string|max:255|url',
            'kode_pt'         => 'nullable|string|max:32',
            'rate_limit'      => 'nullable|integer|min:1|max:1000',
            'timeout'         => 'nullable|integer|min:5|max:300',
            'a_active'        => 'nullable|boolean',
            'a_dry_run'       => 'nullable|boolean',
        ]);
        if ($v->fails()) {
            return response()->json(['success'=>false,'message'=>'Validasi gagal','errors'=>$v->errors()], 422);
        }
        $data = $v->validated();

        // 1. Update credentials (jika ada)
        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;
        $apiKey   = $data['api_key'] ?? null;
        if ($username !== null || $password !== null || $apiKey !== null) {
            try {
                $this->apiConfigSvc->updateCredentials($kode, $username, $password, $apiKey);
            } catch (\Throwable $e) {
                return response()->json(['success'=>false,'message'=>'Gagal update credentials: '.$e->getMessage()], 500);
            }
        }

        // 2. Update non-credential fields (base_url, kode_pt, rate, timeout, a_active, a_dry_run)
        $nonCredFields = [];
        foreach (['base_url','kode_pt'] as $f) {
            if (array_key_exists($f, $data)) $nonCredFields[$f] = $data[$f];
        }
        if (array_key_exists('rate_limit', $data)) $nonCredFields['rate_limit_per_min'] = $data['rate_limit'];
        if (array_key_exists('timeout', $data))    $nonCredFields['timeout_seconds']    = $data['timeout'];
        foreach (['a_active','a_dry_run'] as $f) {
            if (array_key_exists($f, $data)) $nonCredFields[$f] = (bool) $data[$f];
        }
        if (!empty($nonCredFields)) {
            $nonCredFields['updated_at'] = now();
            DB::connection('pgsql')
                ->table('setting.api_config')
                ->where('kode', $kode)
                ->update($nonCredFields);
        }

        Log::info("api_config '{$kode}' diupdate", ['fields' => array_keys($data)]);

        return $this->show($kode);
    }

    public function toggle(Request $request, string $kode): JsonResponse
    {
        $flag = $request->input('flag');
        $value = (bool) $request->input('value');
        if (!in_array($flag, ['a_active', 'a_dry_run'], true)) {
            return response()->json(['success'=>false,'message'=>"flag harus 'a_active' atau 'a_dry_run'"], 400);
        }
        try {
            $this->apiConfigSvc->toggleFlag($kode, $flag, $value);
            return $this->show($kode);
        } catch (\Throwable $e) {
            return response()->json(['success'=>false,'message'=>'Gagal toggle: '.$e->getMessage()], 500);
        }
    }
}
