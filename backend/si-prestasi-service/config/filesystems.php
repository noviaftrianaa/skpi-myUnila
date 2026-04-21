<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Opsi: 'siprestasi' (local storage, default) atau 'minio' (S3-compatible)
    | Local storage: file disimpan di /data/siprestasi-storage (volume mount)
    | MinIO: file disimpan di MinIO server (VM7 atau remote)
    |
    | Ganti via env: FILESYSTEM_DISK=minio (kalau MinIO server ready)
    |
    */

    'default' => env('FILESYSTEM_DISK', 'siprestasi'),

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

        // Local file storage — mounted volume di /data/siprestasi-storage
        // Aman saat rebuild karena di-mount dari host filesystem
        // Path convention:
        //   prestasi-mandiri/{id}/{jenis}/{uuid}.{ext}
        //   sertifikasi/{id}/{jenis}/{uuid}.{ext}
        //   rekognisi/{id}/{jenis}/{uuid}.{ext}
        //   surat-tugas/{id_peserta_dosen}/{uuid}.{ext}
        //
        // jenis dokumen: peserta, sertifikat, foto_upp, undangan, surat_tugas
        'siprestasi' => [
            'driver' => 'local',
            'root' => env('SIPRESTASI_STORAGE_PATH', '/data/siprestasi-storage'),
            'url' => env('APP_URL') . '/files',
            'visibility' => 'public',
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
