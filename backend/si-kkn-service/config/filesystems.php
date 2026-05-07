<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Opsi: 'kkn' (local storage, default) atau 'minio' (S3-compatible).
    | Local storage: file disimpan di /data/si-kkn-storage (volume mount).
    | MinIO: file disimpan di MinIO server (VM7 atau remote).
    |
    | Ganti via env: FILESYSTEM_DISK=minio (kalau sudah ada MinIO server).
    |
    */

    'default' => env('FILESYSTEM_DISK', 'kkn'),

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw' => false,
        ],

        // Local file storage — mounted volume di /data/si-kkn-storage
        // Aman saat rebuild karena di-mount dari host filesystem.
        // Path convention (sesuai schema header siknila):
        //   siknila/dokumen/{id_dokumen}/{filename}
        //   siknila/logbook/{id_logbook}/{filename}
        //   siknila/sertifikat/{id_sertifikat}/{filename}
        //   siknila/laporan/{id_laporan}/{filename}
        //   siknila/foto/{id_kelompok}/{filename}
        //   siknila/bimbingan/{id_bimbingan}/{filename}
        'kkn' => [
            'driver' => 'local',
            'root' => env('KKN_STORAGE_PATH', '/data/si-kkn-storage'),
            'throw' => true,
        ],

        // MinIO (S3-compatible) — gunakan jika MinIO server tersedia
        // Set FILESYSTEM_DISK=minio di .env untuk aktifkan
        'minio' => [
            'driver' => 's3',
            'key' => env('MINIO_ACCESS_KEY'),
            'secret' => env('MINIO_SECRET_KEY'),
            'region' => env('MINIO_REGION', 'us-east-1'),
            'bucket' => env('MINIO_BUCKET', 'myunila-storage'),
            'endpoint' => env('MINIO_ENDPOINT', 'http://192.168.120.47:9000'),
            'use_path_style_endpoint' => true,
            'throw' => true,
        ],

    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
