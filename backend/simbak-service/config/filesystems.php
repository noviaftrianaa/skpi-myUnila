<?php

return [

    'default' => env('FILESYSTEM_DISK', 'minio'),

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

        // MinIO (S3-compatible) - VM7: 192.168.120.47:9000
        // Bucket: myunila-storage
        // Path convention:
        //   simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}
        //   simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}
        //   simbak/batch/{id_batch}/{jenis_sk}/{filename}
        //   simbak/template/{kode_layanan}/{filename}
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
