<?php

namespace App\Repositories;

/**
 * University Profile Repository
 *
 * Handles data access for university profile information.
 * In the future, this can be connected to database or external API.
 * Currently returns static data.
 */
class UniversityProfileRepository
{
    /**
     * Get complete university profile data
     *
     * @return array
     */
    public function getProfile(): array
    {
        return [
            'name' => 'Universitas Lampung',
            'short_name' => 'UNILA',
            'tagline' => 'Universitas Terkemuka di Sumatera',
            'description' => 'Universitas Lampung (UNILA) adalah perguruan tinggi negeri yang berlokasi di Bandar Lampung, Provinsi Lampung, Indonesia. UNILA didirikan pada tanggal 23 September 1965 dan merupakan universitas pertama dan tertua di Provinsi Lampung.',
            'vision' => 'Menjadi universitas yang unggul, terkemuka, dan bermartabat di tingkat nasional pada tahun 2025 dan di tingkat internasional pada tahun 2035',
            'mission' => [
                'Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan pembangunan',
                'Mengembangkan ilmu pengetahuan, teknologi, dan seni melalui penelitian',
                'Mengabdikan keahlian kepada masyarakat',
                'Menyelenggarakan tata kelola yang baik dan bersih (good governance and clean governance)'
            ],
            'established' => '23 September 1965',
            'rector' => 'Prof. Dr. Ir. Lusmeilia Afriani, D.E.A., IPM',
            'address' => 'Jl. Prof. Dr. Ir. Sumantri Brojonegoro No.1, Gedong Meneng, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35141',
            'phone' => '(0721) 701609',
            'email' => 'humas@unila.ac.id',
            'website' => 'https://www.unila.ac.id',
            'logo' => 'https://www.unila.ac.id/wp-content/uploads/2020/02/logo-unila.png',
        ];
    }

    /**
     * Get list of faculties
     *
     * @return array
     */
    public function getFaculties(): array
    {
        return [
            [
                'name' => 'Fakultas Keguruan dan Ilmu Pendidikan',
                'abbreviation' => 'FKIP',
                'total_programs' => 22
            ],
            [
                'name' => 'Fakultas Ekonomi dan Bisnis',
                'abbreviation' => 'FEB',
                'total_programs' => 8
            ],
            [
                'name' => 'Fakultas Hukum',
                'abbreviation' => 'FH',
                'total_programs' => 4
            ],
            [
                'name' => 'Fakultas Pertanian',
                'abbreviation' => 'FP',
                'total_programs' => 12
            ],
            [
                'name' => 'Fakultas Teknik',
                'abbreviation' => 'FT',
                'total_programs' => 10
            ],
            [
                'name' => 'Fakultas Ilmu Sosial dan Ilmu Politik',
                'abbreviation' => 'FISIP',
                'total_programs' => 8
            ],
            [
                'name' => 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
                'abbreviation' => 'FMIPA',
                'total_programs' => 9
            ],
            [
                'name' => 'Fakultas Kedokteran',
                'abbreviation' => 'FK',
                'total_programs' => 3
            ]
        ];
    }

    /**
     * Get university statistics
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return [
            'total_students' => 35000,
            'total_lecturers' => 1200,
            'total_staff' => 800,
            'total_faculties' => 8,
            'total_programs' => 76,
            'total_postgraduate_programs' => 25,
            'total_doctorate_programs' => 12,
            'campus_area_hectares' => 123,
            'accreditation' => 'A (Unggul)',
            'international_collaborations' => 50
        ];
    }

    /**
     * Get social media links
     *
     * @return array
     */
    public function getSocialMedia(): array
    {
        return [
            'instagram' => 'https://instagram.com/unila.official',
            'facebook' => 'https://facebook.com/unila.official',
            'twitter' => 'https://twitter.com/unila_official',
            'youtube' => 'https://youtube.com/@unilaofficial',
            'linkedin' => 'https://linkedin.com/school/universitas-lampung',
            'tiktok' => 'https://tiktok.com/@unila.official'
        ];
    }

    /**
     * Get brand colors
     *
     * @return array
     */
    public function getColors(): array
    {
        return [
            'primary' => '#1e40af',   // Blue
            'secondary' => '#fbbf24', // Gold
            'accent' => '#10b981'     // Green
        ];
    }

    /**
     * Get quick facts for homepage
     *
     * @return array
     */
    public function getQuickFacts(): array
    {
        return [
            [
                'icon' => '🎓',
                'title' => 'Mahasiswa',
                'value' => '35,000+',
                'description' => 'Mahasiswa aktif dari seluruh Indonesia',
                'color' => 'blue'
            ],
            [
                'icon' => '👨‍🏫',
                'title' => 'Dosen',
                'value' => '1,200+',
                'description' => 'Dosen berkualifikasi tinggi',
                'color' => 'green'
            ],
            [
                'icon' => '🏛️',
                'title' => 'Fakultas',
                'value' => '8',
                'description' => 'Fakultas dengan berbagai program studi',
                'color' => 'purple'
            ],
            [
                'icon' => '⭐',
                'title' => 'Akreditasi',
                'value' => 'A',
                'description' => 'Terakreditasi Unggul oleh BAN-PT',
                'color' => 'yellow'
            ],
            [
                'icon' => '🏞️',
                'title' => 'Luas Kampus',
                'value' => '123 Ha',
                'description' => 'Kampus hijau dan asri',
                'color' => 'emerald'
            ],
            [
                'icon' => '📅',
                'title' => 'Berdiri Sejak',
                'value' => '1965',
                'description' => 'Lebih dari 50 tahun pengalaman',
                'color' => 'red'
            ]
        ];
    }

    /**
     * Get contact information
     *
     * @return array
     */
    public function getContactInfo(): array
    {
        return [
            'main_office' => [
                'name' => 'Rektorat Universitas Lampung',
                'address' => 'Jl. Prof. Dr. Ir. Sumantri Brojonegoro No.1, Gedong Meneng, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35141',
                'phone' => '(0721) 701609',
                'fax' => '(0721) 702767',
                'email' => 'humas@unila.ac.id',
                'website' => 'https://www.unila.ac.id'
            ],
            'departments' => [
                [
                    'name' => 'Humas & Publikasi',
                    'phone' => '(0721) 701609',
                    'email' => 'humas@unila.ac.id'
                ],
                [
                    'name' => 'Bagian Akademik',
                    'phone' => '(0721) 787030',
                    'email' => 'akademik@unila.ac.id'
                ],
                [
                    'name' => 'Bagian Kemahasiswaan',
                    'phone' => '(0721) 787032',
                    'email' => 'kemahasiswaan@unila.ac.id'
                ],
                [
                    'name' => 'PMB (Penerimaan Mahasiswa Baru)',
                    'phone' => '(0721) 787878',
                    'email' => 'pmb@unila.ac.id'
                ]
            ],
            'working_hours' => [
                'weekdays' => 'Senin - Jumat: 07:30 - 16:00 WIB',
                'saturday' => 'Sabtu: Tutup',
                'sunday' => 'Minggu: Tutup',
                'break_time' => 'Istirahat: 12:00 - 13:00 WIB'
            ],
            'location' => [
                'latitude' => -5.358883,
                'longitude' => 105.241700,
                'google_maps' => 'https://goo.gl/maps/xyz123',
                'embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.266!2d105.241700!3d-5.358883'
            ],
            'emergency' => [
                'security' => '(0721) 701609 ext. 999',
                'medical' => '(0721) 701609 ext. 888',
                'fire' => '(0721) 701609 ext. 777'
            ]
        ];
    }
}
