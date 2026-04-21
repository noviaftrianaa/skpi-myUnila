<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SimkatmawaClient — skeleton untuk Phase 2.
 *
 * Login: POST /api/login → bearer token
 * Kirim: POST /api/prestasi-mandiri | /api/sertifikasi | /api/rekognisi
 *
 * Token di-cache Redis dengan TTL = JWT exp - refresh_buffer.
 * Dry-run mode (setting.api_config.a_dry_run=true) hanya log payload, tidak call API.
 *
 * Caller biasanya SubmitToSimkatmawaJob (queue worker). Client ini stateless—
 * aman di-instantiate per-request.
 */
class SimkatmawaClient
{
    public function __construct(
        protected ApiConfigService $apiConfig,
    ) {}

    /**
     * Ping login endpoint untuk verify kredensial (ops utility).
     * Return array: {ok, message, kode_pt?, token_preview?, dry_run}.
     */
    public function ping(): array
    {
        $cfg = $this->apiConfig->get(config('simkatmawa.config_kode'));
        if (!$cfg) {
            return ['ok' => false, 'message' => 'api_config tidak ditemukan', 'dry_run' => false];
        }

        if ($this->isDryRun($cfg)) {
            return [
                'ok'       => true,
                'message'  => 'dry_run mode — tidak benar-benar login ke SIMKATMAWA',
                'dry_run'  => true,
            ];
        }

        if (empty($cfg['username']) || empty($cfg['password'])) {
            return ['ok' => false, 'message' => 'username/password belum di-set di setting.api_config', 'dry_run' => false];
        }

        $resp = Http::timeout($cfg['timeout'])
            ->asJson()
            ->acceptJson()
            ->post($cfg['base_url'] . $cfg['auth_login_path'], [
                'email'    => $cfg['username'],
                'password' => $cfg['password'],
            ]);

        $body = $resp->json();
        if (!$resp->successful() || !($body['success'] ?? false)) {
            return [
                'ok'       => false,
                'message'  => 'login gagal: ' . ($body['message'] ?? 'HTTP ' . $resp->status()),
                'dry_run'  => false,
            ];
        }

        $token = $body['token'] ?? null;
        return [
            'ok'             => true,
            'message'        => 'login sukses',
            'kode_pt'        => $body['kode_pt'] ?? null,
            'token_preview' => $token ? substr($token, 0, 20) . '...' : null,
            'dry_run'        => false,
        ];
    }

    /**
     * Kirim prestasi mandiri ke SIMKATMAWA.
     * Payload = array matching SIMKATMAWA /api/prestasi-mandiri schema.
     * Return: {ok, http_status, response_body, simkatmawa_id?, dry_run, error?}
     */
    public function submitPrestasiMandiri(array $payload): array
    {
        return $this->submit('/api/prestasi-mandiri', $payload);
    }

    public function submitSertifikasi(array $payload): array
    {
        return $this->submit('/api/sertifikasi', $payload);
    }

    public function submitRekognisi(array $payload): array
    {
        return $this->submit('/api/rekognisi', $payload);
    }

    protected function submit(string $path, array $payload): array
    {
        $cfg = $this->apiConfig->get(config('simkatmawa.config_kode'));
        if (!$cfg) {
            return ['ok' => false, 'http_status' => 0, 'response_body' => null, 'error' => 'api_config tidak ada', 'dry_run' => false];
        }

        if ($this->isDryRun($cfg)) {
            Log::info('SIMKATMAWA dry_run', ['path' => $path, 'payload' => $this->redact($payload)]);
            return [
                'ok'            => true,
                'http_status'   => 200,
                'response_body' => ['dry_run' => true, 'echo' => $payload],
                'dry_run'       => true,
            ];
        }

        $token = $this->getToken($cfg);
        if (!$token) {
            return ['ok' => false, 'http_status' => 0, 'response_body' => null, 'error' => 'tidak bisa dapatkan token', 'dry_run' => false];
        }

        $resp = Http::timeout($cfg['timeout'])
            ->withToken($token)
            ->asJson()
            ->acceptJson()
            ->post($cfg['base_url'] . $path, $payload);

        $body = $resp->json();

        return [
            'ok'            => $resp->successful() && ($body['status'] ?? false),
            'http_status'   => $resp->status(),
            'response_body' => $body,
            'simkatmawa_id' => $body['data']['id'] ?? null,
            'dry_run'       => false,
        ];
    }

    /**
     * Get token — dari Redis cache atau login ulang.
     * TODO Phase 2: decode JWT exp, cache dengan TTL yang benar, handle 401 refresh.
     */
    protected function getToken(array $cfg): ?string
    {
        $cacheKey = config('simkatmawa.token_cache_key');
        $cached = Cache::get($cacheKey);
        if ($cached) return $cached;

        $resp = Http::timeout($cfg['timeout'])
            ->asJson()
            ->acceptJson()
            ->post($cfg['base_url'] . $cfg['auth_login_path'], [
                'email'    => $cfg['username'],
                'password' => $cfg['password'],
            ]);

        if (!$resp->successful()) return null;

        $token = $resp->json('token');
        if (!$token) return null;

        // Cache sementara 50 menit — nanti di-replace dengan TTL dari JWT exp
        Cache::put($cacheKey, $token, now()->addMinutes(50));
        return $token;
    }

    protected function isDryRun(array $cfg): bool
    {
        return config('simkatmawa.force_dry_run') || $cfg['a_dry_run'];
    }

    /**
     * Redact sensitive keys sebelum log.
     */
    protected function redact(array $data): array
    {
        $redactKeys = config('simkatmawa.log_redact_keys', []);
        array_walk_recursive($data, function (&$v, $k) use ($redactKeys) {
            if (in_array(strtolower((string) $k), $redactKeys, true)) {
                $v = '[redacted]';
            }
        });
        return $data;
    }
}
