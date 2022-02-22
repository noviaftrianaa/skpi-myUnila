<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku345Dosen;
use App\Models\PDUT\Temp_iku\Iku3Praktisi;
use App\Models\PDUT\Temp_iku\Iku3Tridharma;
use App\Models\PDUT\Temp_iku\Iku3TridharmaQs100;
use Illuminate\Database\Seeder;

class Iku3DasboardSeeder extends Seeder
{
    public function run()
    {
        $this->dasboard();
    }

    public function dasboard()
    {
        $tridharma = Iku3Tridharma::distinct('id_sdm')->count();
        $tridharmaqs100 = Iku3TridharmaQs100::distinct('id_sdm')->count();
        $praktisi = Iku3Praktisi::distinct('id_sdm')->count();

        $nidn = Iku345Dosen::whereNotNull('nidn')->where('ikatan_kerja', 'Dosen Tetap')->count();
        $nidk = Iku345Dosen::whereNotNull('nidk')->where('ikatan_kerja', 'Dosen Tetap')->count();

        $iku3 = $tridharma + $tridharmaqs100 + $praktisi;
        $dosen = $nidn + $nidk;
        $total = ($iku3 / $dosen) * 100;

        $data = [
            'jumlah_tridharma' => $tridharma,
            'jumlah_tridharma_qs100' => $tridharmaqs100,
            'jumlah_nidn' => $nidn,
            'jumlah_nidk' => $nidk,
            'jumlah_praktisi' => $praktisi,
            'total_memenuhi_iku3' => $iku3,
            'total_dosen_tetap' => $dosen,
            'target_tercapai' => $total
        ];

        dd($data);
    }
}
