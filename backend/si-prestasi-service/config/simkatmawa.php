<?php

/**
 * Konfigurasi SIMKATMAWA client.
 *
 * Kredensial (email, password) TIDAK ditaruh di sini atau di .env —
 * baca dari setting.api_config (encrypted) via ApiConfigService.
 *
 * File ini hanya untuk nilai default dan switch global.
 */

return [
    // Identifier row di setting.api_config yang dipakai
    'config_kode' => env('SIMKATMAWA_CONFIG_KODE', 'simkatmawa'),

    // Global kill switch — override a_dry_run di setting.api_config kalau perlu
    'force_dry_run' => env('SIMKATMAWA_FORCE_DRY_RUN', false),

    // Redis key untuk cache JWT token
    'token_cache_key' => env('SIMKATMAWA_TOKEN_CACHE_KEY', 'simkatmawa:token'),

    // Safety margin sebelum JWT exp (detik) — refresh token sebelum benar-benar expire
    'token_refresh_buffer_seconds' => env('SIMKATMAWA_TOKEN_REFRESH_BUFFER', 60),

    // Queue name untuk SubmitToSimkatmawaJob
    'queue_name' => env('SIMKATMAWA_QUEUE_NAME', 'simkatmawa'),

    // Logging: redact sensitive keys di response log
    'log_redact_keys' => ['token', 'password', 'authorization', 'bearer'],
];
