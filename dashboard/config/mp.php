<?php
return [
    'apps'  => [
        'id_app'    => '948DF317-78F7-4B92-A53F-0A56215E07DE',
        'title' => 'MY UNILA',
        'acronym_title' => 'ODU',
        'year_development' => 2021,
        'year_launch' => 2021,
        'first_development'  => '2021-03-01',
        'first_launch'      => '2021-11-31',
        'at_use'  => 1,
        'user'  => [
            'institute'     => 'Universitas Lampung',
            'acronym_institute' => 'UNILA',
            'logo'  => 'images/logo-unila.png'
        ],
        'version_apps'  => '0.1',
        'version_db'    => '0.01',
        'developer_mode'=> 0
    ],
    'copyright' => [
        'year'  => 2021,
        'institute' => 'Universitas Lampung',
        'acronym_institute' => 'UNILA',
        'logo'  => 'images/logo-sigma.png'
    ],
    'version_apps'  => [
        '0.1'   => '01-08-2020'
    ],
    'version_db'  => [
        '0.01'   => '01-08-2020'
    ],
    'exp_data_row'  => [
        'create_date'   => date('Y-m-d H:i:s'),
        'created_date'   => date('Y-m-d H:i:s'),
        'tgl_create'   => date('Y-m-d H:i:s'),
        'last_update'   => date('Y-m-d H:i:s'),
        'last_sync'   => date('Y-m-d H:i:s', time()-60),
        'waktu_expired_token'   => date('Y-m-d H:i:s', strtotime("+20 minutes")),
        'smt_batas_min' => 20101
    ],
    'data_master'   => [
        'smt_aktif' => 20231,
        'smt'   => [
            1   => 'Ganjil',
            2   => 'Genap',
            3   => 'Pendek'
        ],
        'semester'   => [
            1   => 'Semester Ganjil',
            2   => 'Semester Genap',
        ],
        'status_pd' => [
            'A' => 'Aktif',
            'C' => 'Cuti',
            'D' => 'Drop Out',
            'L' => 'Lulus',
            'P' => 'Pindah',
            'K' => 'Keluar',
            'N' => 'Non-Aktif'
        ],
        'jk'    => [
            'L' => 'Laki-laki',
            'P' => 'Perempuan'
        ],
        'jalur_skripsi' => [
            0   => 'Non Skripsi',
            1   => 'Jalur Skripsi'
        ],
        'jenis_matkul'  => [
            'A' => 'Wajib',
            'B' => 'Pilihan',
            'C' => 'Wajib peminatan',
            'D' => 'Pilihan peminatan',
            'S' => 'Tugas akhir/Skripsi/Thesis/Disertasi'
        ],
        'kelompok_matkul'   => [
            'A' => 'MPK (mata kuliah pengembangan kepribadian)',
            'B' => 'MKK (mata kuliah keilmuan dan keterampilan)',
            'C' => 'MKB (mata kuliah keahlian berkarya)',
            'D' => 'MPB (mata kuliah perilaku berkarya)',
            'E' => 'MBB (mata kuliah berkehidupan bermasyarakat)',
            'F' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
            'G' => 'MKDK (mata kuliah dasar keahlian)',
            'H' => 'MKK <perlu diisi>'
        ],
        'jenis_capaian'     => [
            'CPL-PRODI' => 'Capaian Pembelajaran Lulusan Program Studi',
            'CPMK'      => 'Capaian Pembelajaran Mata Kuliah'
        ],
        'kategori_kegiatan_pembelajaran'    => [
            'A' => 'Pendahuluan',
            'B' => 'Penyajian',
            'C' => 'Penutup'
        ],
        'stat_prodi'    => [
            'A' => 'Aktif',
            'B' => 'Alih bentuk',
            'K' => 'Alih kelola',
            'N' => 'Non aktif',
            'H' => 'Dihapus'
        ],
        'stat_hadir'    => [
            'A' => 'Alpha/Tanpa Keterangan',
            'C' => 'Cuti',
            'I' => 'Izin',
            'H' => 'Hadir'
        ],
        'mode_kuliah' => [
            'O' => 'Full Online',
            'F' => 'Full Offline',
            'M' => 'Online dan Offline',
        ],
        'lingkup_kelas' => [
            1 => 'Luar prodi (Eksternal)',
            2 => 'Campuran',
            3 => 'Dalam prodi (Internal)'
        ],
        'peran_publikasi' => [
            'A' => 'Penulis',
            'B' => 'Editor',
            'C' => 'Penerjemah',
            'D' => 'Penemu/Investor'
        ],
    ],
    'ws'    => [
        'pddikti'   => [
            'url'   => '',
            'token' => '',
        ],
        'feeder'    => [
            'url'   => '',
            'username'  => '',
            'password'  => '',
        ],
        'sister'    => [
            'url'   => '',
            'username'  => '',
            'password'  => '',
        ]
    ]
];
