<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Radius API Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk mengakses SSO Radius via API
    | Menggantikan koneksi database langsung ke MySQL Radius
    |
    */

    // Base URL untuk Radius API (tanpa trailing slash)
    // Local: http://127.0.0.1:8000/api/live/v1
    // Production: https://akses.unila.ac.id/api/live/v1
    // Contoh endpoint: {base_url}/auth/login, {base_url}/sso-radius/users
    'base_url' => env('RADIUS_API_BASE_URL', ''),

    // App Key untuk autentikasi (format: base64:xxx)
    'app_key' => env('RADIUS_API_APP_KEY', ''),

    // Username untuk autentikasi
    'username' => env('RADIUS_API_USERNAME', ''),

    // Request timeout dalam detik
    'timeout' => env('RADIUS_API_TIMEOUT', 30),

    // Token cache duration dalam menit (default: 50 menit, asumsi token expire 60 menit)
    'token_cache_ttl' => env('RADIUS_API_TOKEN_CACHE_TTL', 50),

    // Username cache duration dalam menit untuk list semua username
    'username_cache_ttl' => env('RADIUS_API_USERNAME_CACHE_TTL', 5),

    // Stats cache duration dalam menit
    'stats_cache_ttl' => env('RADIUS_API_STATS_CACHE_TTL', 5),

    // Enable/disable Radius API (fallback to database if disabled)
    'enabled' => env('RADIUS_API_ENABLED', true),
];
