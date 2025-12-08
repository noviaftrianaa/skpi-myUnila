<?php

namespace App\Services\RadiusApi;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Radius API Client
 * HTTP client untuk mengakses data SSO Radius via API
 * Menggantikan koneksi database langsung
 *
 * Response format dari API:
 * Login success:
 * {
 *   "status": true,
 *   "message": "Berhasil mendapatkan token otorisasi!",
 *   "data": {
 *     "type": "bearer",
 *     "token": "xxx"
 *   },
 *   "waktu_expired": "2025-12-09 00:48:06"
 * }
 *
 * Token expired:
 * {
 *   "status": false,
 *   "message": "Otorisasi gagal!",
 *   "data": {
 *     "errors": "Token kadarluwasa"
 *   }
 * }
 */
class RadiusApiClient
{
    protected string $baseUrl;
    protected string $appKey;
    protected string $username;
    protected int $timeout;
    protected ?string $token = null;

    private const CACHE_KEY_TOKEN = 'radius_api_token';
    private const CACHE_KEY_EXPIRY = 'radius_api_token_expiry';

    public function __construct()
    {
        $this->baseUrl = rtrim(config('radius_api.base_url'), '/');
        $this->appKey = config('radius_api.app_key');
        $this->username = config('radius_api.username');
        $this->timeout = config('radius_api.timeout', 30);
    }

    /**
     * Check if Radius API is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->appKey) && !empty($this->username);
    }

    /**
     * Get authentication token from Radius API
     * Token di-cache berdasarkan waktu_expired dari response
     */
    public function getToken(): ?string
    {
        if (!$this->isConfigured()) {
            Log::warning('Radius API not configured');
            return null;
        }

        // Check cache first dan validasi expiry
        if (Cache::has(self::CACHE_KEY_TOKEN) && Cache::has(self::CACHE_KEY_EXPIRY)) {
            $cachedExpiry = Cache::get(self::CACHE_KEY_EXPIRY);
            // Cek apakah token masih valid (dengan buffer 5 menit sebelum expired)
            if (strtotime($cachedExpiry) > time() + 300) {
                return Cache::get(self::CACHE_KEY_TOKEN);
            }
            // Token akan expired dalam 5 menit, clear dan ambil baru
            $this->clearToken();
        }

        return $this->fetchNewToken();
    }

    /**
     * Fetch new token from API
     */
    private function fetchNewToken(): ?string
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/auth/login", [
                    'app_key' => $this->appKey,
                    'username' => $this->username,
                ]);

            $data = $response->json();

            // Check response format: status = true/false
            if ($response->successful() && ($data['status'] ?? false) === true) {
                $token = $data['data']['token'] ?? null;
                $expiry = $data['waktu_expired'] ?? null;

                if ($token) {
                    // Cache token dengan expiry time dari API
                    if ($expiry) {
                        // Hitung durasi cache (waktu expired - sekarang - 5 menit buffer)
                        $expiryTimestamp = strtotime($expiry);
                        $cacheDuration = max(1, ($expiryTimestamp - time() - 300) / 60); // dalam menit

                        Cache::put(self::CACHE_KEY_TOKEN, $token, now()->addMinutes($cacheDuration));
                        Cache::put(self::CACHE_KEY_EXPIRY, $expiry, now()->addMinutes($cacheDuration));
                    } else {
                        // Fallback: cache 50 menit jika tidak ada waktu_expired
                        Cache::put(self::CACHE_KEY_TOKEN, $token, now()->addMinutes(50));
                    }

                    $this->token = $token;
                    return $token;
                }
            }

            Log::error('Failed to get Radius API token', [
                'status' => $response->status(),
                'response_status' => $data['status'] ?? null,
                'message' => $data['message'] ?? 'Unknown error',
                'errors' => $data['data']['errors'] ?? null,
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Radius API login error', [
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Check if response indicates token expired
     */
    private function isTokenExpired(array $responseData): bool
    {
        // Check for "Token kadarluwasa" error
        if (($responseData['status'] ?? true) === false) {
            $errors = $responseData['data']['errors'] ?? '';
            if (stripos($errors, 'kadarluwasa') !== false || stripos($errors, 'expired') !== false) {
                return true;
            }
            // Also check message
            $message = $responseData['message'] ?? '';
            if (stripos($message, 'otorisasi gagal') !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Make authenticated GET request to Radius API
     */
    public function get(string $endpoint, array $params = []): ?array
    {
        $token = $this->getToken();
        if (!$token) {
            return null;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => $token, // Token langsung tanpa "Bearer"
                    'Accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}{$endpoint}", $params);

            $data = $response->json();

            // Check if request was successful (status = true or no status field)
            if ($response->successful() && ($data['status'] ?? true) !== false) {
                return $data;
            }

            // Check if token expired based on response
            if ($response->status() === 401 || $this->isTokenExpired($data ?? [])) {
                Log::info('Radius API token expired, attempting refresh');
                $this->clearToken();

                // Retry with new token
                $token = $this->fetchNewToken();
                if ($token) {
                    $retryResponse = Http::timeout($this->timeout)
                        ->withHeaders([
                            'Authorization' => $token,
                            'Accept' => 'application/json',
                        ])
                        ->get("{$this->baseUrl}{$endpoint}", $params);

                    $retryData = $retryResponse->json();

                    if ($retryResponse->successful() && ($retryData['status'] ?? true) !== false) {
                        return $retryData;
                    }
                }
            }

            Log::warning('Radius API GET request failed', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'response_status' => $data['status'] ?? null,
                'message' => $data['message'] ?? 'Unknown error',
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Radius API GET error', [
                'endpoint' => $endpoint,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Check if Radius API is available
     */
    public function isAvailable(): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        return $this->getToken() !== null;
    }

    /**
     * Clear cached token (useful for testing or force re-auth)
     */
    public function clearToken(): void
    {
        Cache::forget(self::CACHE_KEY_TOKEN);
        Cache::forget(self::CACHE_KEY_EXPIRY);
        $this->token = null;
    }
}
