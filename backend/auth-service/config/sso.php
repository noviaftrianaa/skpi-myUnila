<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SSO Unila Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for SSO Unila integration
    | Supports both OAuth2 and CAS SSO flows
    |
    */

    // OAuth2 Configuration (Old)
    'base_url' => env('SSO_BASE_URL', 'https://sso.unila.ac.id'),
    'client_id' => env('SSO_CLIENT_ID'),
    'client_secret' => env('SSO_CLIENT_SECRET'),
    'redirect_uri' => env('SSO_REDIRECT_URI', env('APP_URL') . '/auth/callback'),

    // CAS SSO Configuration (New - Direct SSO)
    'unila' => [
        'base_url' => env('SSO_UNILA_BASE_URL', 'https://akses.unila.ac.id'),
        'app_key' => env('SSO_UNILA_APP_KEY', env('APP_KEY')),
        'jwt_secret' => env('SSO_UNILA_JWT_SECRET', env('JWT_SECRET')),
        'callback_url' => env('SSO_UNILA_CALLBACK_URL', env('APP_URL') . '/api/v1/auth/sso/callback'),
        'login_endpoint' => '/api/live/v1/auth/login/sso',
        'auto_create_user' => env('SSO_AUTO_CREATE_USER', true),
        'check_legacy_database' => env('SSO_CHECK_LEGACY_DB', true),
        'legacy_db_connection' => env('SSO_LEGACY_DB_CONNECTION', 'sqlsrv'),
        'default_role' => env('SSO_DEFAULT_ROLE', 'user'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SSO Endpoints
    |--------------------------------------------------------------------------
    */

    'endpoints' => [
        'authorize' => env('SSO_AUTHORIZE_ENDPOINT', '/oauth/authorize'),
        'token' => env('SSO_TOKEN_ENDPOINT', '/oauth/token'),
        'user' => env('SSO_USER_ENDPOINT', '/api/user'),
        'logout' => env('SSO_LOGOUT_ENDPOINT', '/oauth/logout'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SSO Scopes
    |--------------------------------------------------------------------------
    |
    | Define the scopes required for authentication
    |
    */

    'scopes' => [
        'read-user',
        'read-profile',
    ],

    /*
    |--------------------------------------------------------------------------
    | Token Storage
    |--------------------------------------------------------------------------
    |
    | Where to store SSO tokens (session, database, redis)
    |
    */

    'token_storage' => env('SSO_TOKEN_STORAGE', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Auto Create User
    |--------------------------------------------------------------------------
    |
    | Automatically create user account on first SSO login
    |
    */

    'auto_create_user' => env('SSO_AUTO_CREATE_USER', true),

    /*
    |--------------------------------------------------------------------------
    | User Mapping
    |--------------------------------------------------------------------------
    |
    | Map SSO user fields to local user model fields
    |
    */

    'user_mapping' => [
        'sso_id' => 'id',
        'npm' => 'npm',
        'nip' => 'nip',
        'name' => 'name',
        'email' => 'email',
        'phone' => 'phone',
        'role' => 'role',
        'fakultas' => 'fakultas',
        'prodi' => 'prodi',
    ],

    /*
    |--------------------------------------------------------------------------
    | Role Mapping
    |--------------------------------------------------------------------------
    |
    | Map SSO roles to local roles
    |
    */

    'role_mapping' => [
        'mahasiswa' => 'mahasiswa',
        'dosen' => 'dosen',
        'tendik' => 'tendik',
        'alumni' => 'alumni',
        'stakeholder' => 'stakeholder',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    */

    'cache' => [
        'enabled' => env('SSO_CACHE_ENABLED', true),
        'ttl' => env('SSO_CACHE_TTL', 3600), // 1 hour
        'prefix' => env('SSO_CACHE_PREFIX', 'sso_'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Timeout Settings
    |--------------------------------------------------------------------------
    */

    'timeout' => [
        'connect' => env('SSO_CONNECT_TIMEOUT', 10),
        'request' => env('SSO_REQUEST_TIMEOUT', 30),
    ],

];
