<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku345Dosen;
use App\Models\PDUT\Temp_iku\Iku3Praktisi;
use App\Models\PDUT\Temp_iku\Iku4Sertifikasi;
use Illuminate\Database\Seeder;

class Iku4DasboardSeeder extends Seeder
{
    public function run()
    {
        $this->dasboard();
    }

    public function dasboard()
    {
        $s3 = Iku345Dosen::where('ikatan_kerja', 'Dosen Tetap')->where('jenjang_studi', 'S3')->count();
        $nidn = Iku345Dosen::whereNotNull('nidn')->where('ikatan_kerja', 'Dosen Tetap')->count();
        $nidk = Iku345Dosen::whereNotNull('nidk')->where('ikatan_kerja', 'Dosen Tetap')->count();
        $praktisi = Iku3Praktisi::distinct('id_sdm')->count();
        $sertifikasi = Iku4Sertifikasi::distinct('id_sdm')->count();

        $iku4 = $s3 + $sertifikasi + $praktisi;
        $dosen = $nidn + $nidk;
        $total = ($iku4 / $dosen) * 100;

        $data = [
            'jumlah_nidn' => $nidn,
            'jumlah_nidk' => $nidk,
            'jumlah_s3' => $s3,
            'jumlah_praktisi' => $praktisi,
            'jumlah_sertifikasi' => $sertifikasi,
            'total_memenuhi_iku4' => $iku4,
            'total_dosen_tetap' => $dosen,
            'target_tercapai' => $total
        ];

        dd($data);
    }
}
