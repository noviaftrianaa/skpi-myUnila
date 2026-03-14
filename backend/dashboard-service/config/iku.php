<?php

/**
 * Konfigurasi IKU per tahun.
 *
 * 'default' berlaku untuk semua tahun kecuali di-override.
 * Tambahkan key tahun (string) untuk override target spesifik.
 *
 * Contoh override:
 * '2027' => [
 *     'iku1' => ['target' => 85.0],
 * ],
 */
return [
    /**
     * IKU wajib sesuai Kepmendikbudristek IKU Diktisaintek Berdampak 2025-2029.
     * Sisanya (4, 6, 8, 10, 11) bersifat opsional/pilihan PT.
     */
    'wajib' => [1, 2, 3, 5, 7, 9],

    /**
     * Semester yang dipakai per tahun IKU.
     * Sesuaikan jika aturan pusat berubah (misal hanya gasal, atau 3 semester).
     * Format id_smt: {tahun}{1=gasal, 2=genap, 3=pendek}
     */
    'semesters' => [
        'default' => ['1', '2'],       // gasal + genap
        // Override per tahun jika perlu:
        // '2026' => ['1', '2'],
        // '2027' => ['1', '2', '3'],  // misal ada semester pendek
    ],

    'default' => [
        // IKU Wajib
        'iku1'  => ['target' => 80.0],
        'iku2'  => ['target' => 80.0],
        'iku3'  => ['target' => 50.0],
        'iku5'  => ['target' => 100.0],
        'iku7'  => ['target' => 50.0],
        'iku9'  => ['target' => 40.0],
        // IKU Opsional
        'iku4'  => ['target' => 200.0],
        'iku6'  => ['target' => 50.0],
        'iku8'  => ['target' => 50.0],
        'iku10' => ['target' => 6.0],
        'iku11' => ['target' => 100.0],
    ],

    /**
     * Metadata IKU opsional (belum ada data di database).
     * Digunakan oleh frontend untuk menampilkan card kosong.
     */
    'opsional' => [
        4  => ['code' => 'IKU 4',  'title' => 'Dosen dengan Rekognisi Internasional',                   'color' => '#8b5cf6', 'unit' => 'Orang'],
        6  => ['code' => 'IKU 6',  'title' => 'Publikasi Bereputasi Internasional (Scopus/WoS)',        'color' => '#06b6d4'],
        8  => ['code' => 'IKU 8',  'title' => 'SDM Terlibat dalam Kebijakan',                           'color' => '#ef4444', 'unit' => 'Orang'],
        10 => ['code' => 'IKU 10', 'title' => 'Usulan Zona Integritas (WBK/WBBM)',                      'color' => '#14b8a6', 'unit' => 'Unit Kerja'],
        11 => ['code' => 'IKU 11', 'title' => 'Tata Kelola (WTP / SAKIP / Etik)',                       'color' => '#84cc16'],
    ],

    /**
     * SDG config untuk IKU 7.
     *
     * sdg_wajib: SDG yang wajib berkontribusi (1, 4, 17)
     * sdg_pilihan: 2 SDG pilihan sesuai keunggulan PT (diisi oleh PT di Renstra)
     * sdg_labels: Label 17 SDG untuk UI
     * sdg_keywords: Keyword matching per SDG pada judul litabmas
     *               (pendekatan proxy karena database belum punya tagging SDG)
     */
    'sdg' => [
        'sdg_wajib' => [1, 4, 17],
        'sdg_pilihan' => [], // Unila belum menetapkan, isi misal: [13, 15]

        'sdg_labels' => [
            1  => 'Tanpa Kemiskinan',
            2  => 'Tanpa Kelaparan',
            3  => 'Kesehatan yang Baik',
            4  => 'Pendidikan Berkualitas',
            5  => 'Kesetaraan Gender',
            6  => 'Air Bersih & Sanitasi',
            7  => 'Energi Bersih & Terjangkau',
            8  => 'Pekerjaan Layak & Pertumbuhan Ekonomi',
            9  => 'Industri, Inovasi & Infrastruktur',
            10 => 'Mengurangi Ketimpangan',
            11 => 'Kota & Komunitas Berkelanjutan',
            12 => 'Konsumsi & Produksi Bertanggung Jawab',
            13 => 'Penanganan Perubahan Iklim',
            14 => 'Ekosistem Laut',
            15 => 'Ekosistem Daratan',
            16 => 'Perdamaian, Keadilan & Kelembagaan',
            17 => 'Kemitraan untuk Mencapai Tujuan',
        ],

        'sdg_keywords' => [
            1  => ['kemiskinan', 'miskin', 'pengentasan kemiskinan', 'bantuan sosial', 'kesejahteraan sosial', 'ekonomi kerakyatan', 'rumah tangga miskin'],
            2  => ['kelaparan', 'ketahanan pangan', 'pangan', 'gizi buruk', 'pertanian berkelanjutan', 'malnutrisi'],
            3  => ['kesehatan', 'medis', 'penyakit', 'farmasi', 'obat', 'gizi masyarakat', 'epidemiologi', 'kedokteran'],
            4  => ['pendidikan', 'pembelajaran', 'kurikulum', 'literasi', 'edukasi', 'pengajaran', 'sekolah', 'pelatihan guru', 'belajar mengajar'],
            5  => ['gender', 'perempuan', 'kesetaraan gender', 'pemberdayaan perempuan', 'kekerasan perempuan'],
            6  => ['air bersih', 'sanitasi', 'air minum', 'pengolahan air', 'limbah cair', 'drainase'],
            7  => ['energi terbarukan', 'energi bersih', 'bioenergi', 'panel surya', 'energi listrik', 'biomassa'],
            8  => ['ketenagakerjaan', 'lapangan kerja', 'wirausaha', 'umkm', 'ekonomi kreatif', 'pertumbuhan ekonomi', 'kewirausahaan'],
            9  => ['industri', 'inovasi', 'infrastruktur', 'teknologi tepat guna', 'manufaktur', 'riset teknologi'],
            10 => ['ketimpangan', 'inklusif', 'disabilitas', 'marjinal', 'kesetaraan sosial'],
            11 => ['perkotaan', 'permukiman', 'tata ruang', 'transportasi berkelanjutan', 'kota layak huni'],
            12 => ['konsumsi berkelanjutan', 'produksi berkelanjutan', 'daur ulang', 'pengelolaan limbah', 'zero waste'],
            13 => ['perubahan iklim', 'emisi karbon', 'pemanasan global', 'mitigasi bencana', 'adaptasi iklim', 'gas rumah kaca'],
            14 => ['kelautan', 'perikanan', 'pesisir', 'oseanografi', 'ekosistem laut', 'terumbu karang', 'mangrove'],
            15 => ['kehutanan', 'hutan', 'keanekaragaman hayati', 'biodiversitas', 'konservasi', 'ekosistem darat', 'lahan basah', 'reboisasi'],
            16 => ['hukum', 'keadilan', 'antikorupsi', 'perdamaian', 'tata kelola pemerintahan', 'hak asasi manusia', 'demokrasi'],
            17 => ['kemitraan', 'kolaborasi internasional', 'kerjasama lembaga', 'transfer teknologi'],
        ],
    ],
];
