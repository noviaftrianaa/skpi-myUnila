<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleScopeFilter middleware.
 *
 * Auto-inject server-authoritative scope (fakultas/prodi) ke request berdasarkan
 * active context user. Eliminate ketergantungan pada frontend yang bisa di-tamper
 * (mis. user edit localStorage utk bypass scope).
 *
 * Pipeline:
 *   1. Decode JWT dari Authorization: Bearer header — ambil claim `sub` (id_pengguna)
 *   2. Lookup active context dari Redis (key: <auth-prefix>user_context:<userId> di DB 1)
 *   3. Map level_organisasi → scope:
 *        - level <=3 atau peran universal (admin/dev/helpdesk) → no scope (rektor view)
 *        - level 4 (Dekan)  → id_fakultas = id_organisasi
 *        - level 5 (Kaprodi)→ id_prodi    = id_organisasi
 *                              id_fakultas = id_induk_organisasi
 *   4. Set $request->attributes->set('scope', [...])
 *   5. Untuk kompatibilitas tanpa edit repository, merge ke $request input.
 *      Nilai dari middleware OVERRIDE query param dari client → client tidak bisa
 *      expand scope via tampering.
 *
 * Failure-mode: setiap exception → log warning, continue request tanpa scope.
 * Tidak boleh block request demi telemetry/keamanan turunan; auth real handled
 * di layer Kong / dedicated auth middleware.
 */
class RoleScopeFilter
{
    private const UNIVERSAL_ROLE_KEYWORDS = ['administrator', 'developer', 'helpdesk', 'service api'];

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $userId = $this->resolveUserId($request);

            if (!$userId) {
                return $next($request);
            }

            $ctx = $this->resolveActiveContext($userId);
            if (!$ctx) {
                $request->attributes->set('scope', ['has_scope' => false, 'reason' => 'no_active_context']);
                return $next($request);
            }

            $level = (int) ($ctx['level_organisasi'] ?? 0);
            $namaPeran = strtolower((string) ($ctx['nm_peran'] ?? ''));
            $idOrg = $ctx['id_organisasi'] ?? null;
            $idInduk = $ctx['id_induk_organisasi'] ?? null;

            $isUniversal = $level === 0 || $level <= 3;
            foreach (self::UNIVERSAL_ROLE_KEYWORDS as $kw) {
                if ($namaPeran !== '' && str_contains($namaPeran, $kw)) {
                    $isUniversal = true;
                    break;
                }
            }

            // Detect Kajur/Admin Jurusan via nm_peran (jurusan TIDAK punya level
            // konsisten — kadang level=4 sama dgn fakultas, kadang NULL).
            $isJurusanRole = $namaPeran !== '' && (bool) preg_match(
                '/admin\s*jurusan|kepala\s*jurusan|ketua\s*jurusan|kajur/i',
                $namaPeran
            );

            $scope = [
                'has_scope'     => false,
                'level'         => $level,
                'id_fakultas'   => null,
                'id_jurusan'    => null,
                'id_prodi'      => null,
                'is_universal'  => $isUniversal,
                'id_peran'      => $ctx['id_peran'] ?? null,
                'nm_peran'      => $ctx['nm_peran'] ?? null,
                'nm_organisasi' => $ctx['nm_organisasi'] ?? null,
            ];

            if (!$isUniversal && $idOrg) {
                if ($isJurusanRole) {
                    // Kajur/Admin Jurusan → id_organisasi = jurusan UUID di pdrd.sms (id_jur_unila).
                    // id_induk_organisasi (unit_organisasi) BISA pointing ke fakultas atau UNILA root
                    // → kalau ke UNILA root, derive fakultas dari pdrd.sms.id_fak_unila lookup di sini.
                    $scope['id_jurusan']  = $idOrg;
                    $scope['id_fakultas'] = $this->resolveFakultasFromJurusan($idOrg, $idInduk);
                    $scope['has_scope']   = true;
                } elseif ($level === 4) {
                    $scope['id_fakultas'] = $idOrg;
                    $scope['has_scope']   = true;
                } elseif ($level === 5) {
                    $scope['id_prodi']    = $idOrg;
                    $scope['id_fakultas'] = $idInduk;
                    $scope['has_scope']   = true;
                }
            }

            $request->attributes->set('scope', $scope);

            // Compat: inject ke BOTH query bag dan input → controller existing
            // yg baca via $request->query() ATAU $request->input() auto-respect
            // scope tanpa refactor.
            if ($scope['has_scope']) {
                $merge = [];
                if ($scope['id_fakultas']) $merge['id_fakultas'] = $scope['id_fakultas'];
                if ($scope['id_jurusan'])  $merge['id_jurusan']  = $scope['id_jurusan'];
                if ($scope['id_prodi'])    $merge['id_prodi']    = $scope['id_prodi'];
                $request->merge($merge);
                foreach ($merge as $k => $v) {
                    $request->query->set($k, $v);
                }
            }

            return $next($request);
        } catch (\Throwable $e) {
            Log::warning('RoleScopeFilter exception', [
                'err' => $e->getMessage(),
                'url' => $request->fullUrl(),
            ]);
            return $next($request);
        }
    }

    /**
     * Lookup id_fakultas yang OWN jurusan tertentu via pdrd.sms.id_jur_unila → id_fak_unila.
     * Fallback ke $idInduk kalau lookup gagal (kalau unit_organisasi.id_induk_organisasi
     * sudah pointing ke fakultas, ini already valid; cuma harus diverify NOT UNILA root).
     */
    private function resolveFakultasFromJurusan(string $idJurusan, ?string $idInduk = null): ?string
    {
        // Cache per-request supaya tidak query berulang dalam 1 request.
        static $cache = [];
        if (isset($cache[$idJurusan])) return $cache[$idJurusan];

        try {
            $row = \Illuminate\Support\Facades\DB::connection('sqlsrv')->selectOne("
                SELECT TOP 1 CONVERT(VARCHAR(36), id_fak_unila) AS id_fak
                FROM pdrd.sms
                WHERE id_jur_unila = ? AND soft_delete = 0 AND id_fak_unila IS NOT NULL
            ", [$idJurusan]);
            if ($row && !empty($row->id_fak)) {
                return $cache[$idJurusan] = $row->id_fak;
            }
        } catch (\Throwable $e) { /* fall-through */ }

        // Fallback: pakai id_induk kalau bukan UNILA root.
        if ($idInduk && strtoupper($idInduk) !== 'E2B705A7-173E-464A-9FAC-509128709515') {
            return $cache[$idJurusan] = $idInduk;
        }
        return $cache[$idJurusan] = null;
    }

    /**
     * Resolve id_pengguna dari berbagai sumber dalam prioritas:
     *   1. `auth_user` request attribute (di-set oleh JwtAuthenticate kalau service
     *      ini punya middleware itu — mis. simbak, si-prestasi, auth)
     *   2. Decode JWT Bearer langsung (utk service tanpa JWT middleware — dashboard)
     *   3. Header X-User-Id (testing & internal service-to-service di belakang Kong)
     */
    private function resolveUserId(Request $request): ?string
    {
        // Prefer auth_user (sudah di-validate oleh JwtAuthenticate di service ini)
        $user = $request->attributes->get('auth_user');
        if ($user) {
            if (is_object($user) && isset($user->id_pengguna)) return (string) $user->id_pengguna;
            if (is_array($user) && isset($user['id_pengguna'])) return (string) $user['id_pengguna'];
        }

        $header = $request->header('Authorization', '');
        if (is_string($header) && str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
            $secret = env('JWT_SECRET');
            $algo = env('JWT_ALGORITHM', env('JWT_ALGO', 'HS256'));

            if ($secret && $token) {
                try {
                    $decoded = JWT::decode($token, new Key($secret, $algo));
                    if (isset($decoded->sub)) {
                        return (string) $decoded->sub;
                    }
                } catch (\Throwable $e) {
                    // Token invalid/expired — biarkan fallback ke header trust
                }
            }
        }

        $hdr = $request->header('X-User-Id');
        return $hdr ? (string) $hdr : null;
    }

    /**
     * Read user_context dari Redis (DB cache yang dipakai auth-service).
     *
     * Auth-service writes via Cache::put('user_context:{userId}') dengan APP_NAME
     * "myunila" dan separator underscore → real key = `myunila_database_myunila_cache_user_context:{userId}`.
     * Dashboard-service punya CACHE_PREFIX berbeda (hyphen style) → Cache::get
     * tidak akan ketemu. Karena itu pakai raw Redis dengan prefix eksplisit.
     *
     * Prefix bisa di-override via env SCOPE_FILTER_CACHE_PREFIX.
     */
    private function resolveActiveContext(string $userId): ?array
    {
        $prefix = env('SCOPE_FILTER_CACHE_PREFIX', 'myunila_database_myunila_cache_');
        $key = $prefix . 'user_context:' . $userId;

        try {
            // rawCommand bypass Laravel's automatic prefix (yg kalau service ini
            // pakai 'myunila-database-' style hyphen — beda dgn 'myunila_database_'
            // auth-service). Dgn rawCommand kita kontrol full key.
            $raw = Redis::connection('cache')->rawCommand('GET', $key);
        } catch (\Throwable $e) {
            Log::warning('RoleScopeFilter redis error', ['err' => $e->getMessage(), 'key' => $key]);
            return null;
        }

        if (!$raw) {
            return null;
        }

        // Laravel serializes via PHP serialize() by default; predis returns raw string.
        if (is_string($raw)) {
            // Try PHP unserialize first (default Laravel cache)
            $unser = @unserialize($raw);
            if ($unser !== false || $raw === 'b:0;') {
                return is_array($unser) ? $unser : (is_object($unser) ? (array) $unser : null);
            }
            // Fallback: try JSON
            $json = json_decode($raw, true);
            return is_array($json) ? $json : null;
        }

        if (is_array($raw))  return $raw;
        if (is_object($raw)) return (array) $raw;

        return null;
    }
}
