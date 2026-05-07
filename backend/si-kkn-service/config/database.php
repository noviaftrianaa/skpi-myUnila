<?php

use Illuminate\Support\Str;

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        // PostgreSQL (siknila) - PRIMARY: transaksi data SI KKN
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'sikkn_myunila'),
            'username' => env('DB_USERNAME', 'postgres'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public,ref,pendaftaran,kelompok,kegiatan,penilaian,dokumen,log',
            'sslmode' => 'prefer',
        ],

        // SQL Server (pdut) - READ ONLY: referensi data akademik & akses
        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'host' => env('SQLSRV_HOST', '192.168.123.119'),
            'port' => env('SQLSRV_PORT', '1433'),
            'database' => env('SQLSRV_DATABASE', 'pdut'),
            'username' => env('SQLSRV_USERNAME', ''),
            'password' => env('SQLSRV_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'encrypt' => env('SQLSRV_ENCRYPT', 'yes'),
            'trust_server_certificate' => env('SQLSRV_TRUST_SERVER_CERTIFICATE', 'true'),
        ],

    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'kkn'), '_') . '_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],

    ],

];
