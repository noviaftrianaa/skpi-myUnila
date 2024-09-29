<?php

namespace Database\Seeders\iku;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class BobotIku5Seeder extends Seeder
{
    public function run()
    {
        $file_path = storage_path('app/bobot_iku5.xlsx');
        Excel::import(new class implements \Maatwebsite\Excel\Concerns\ToCollection {
            public function collection($rows)
            {
                foreach ($rows as $index => $row) {
                    try {

                        if ($index > 0) {
                            $jns_karya = $row[0];
                            $nm_kat = $row[1];
                            $bobot = $row[2];

                            $kategori = DB::table('ref.kategori_kegiatan')
                                ->where('nm_kat', $nm_kat)
                                ->first();
                            $thn_ajaran = 2023;

                            if ($kategori) {
                                $existingData = DB::table('temp_iku.bobot_iku_5')
                                    ->where('id_katgiat', $kategori->id_katgiat)
                                    ->where('thn_ajaran', $thn_ajaran)
                                    ->where('jns_karya', $jns_karya)
                                    ->first();

                                if ($existingData) {
                                    DB::table('temp_iku.bobot_iku_5')
                                        ->where('id_katgiat', $kategori->id_katgiat)
                                        ->where('jns_karya', $jns_karya)
                                        ->update([
                                            'bobot'        => $bobot,
                                            'last_update'  => CurrDateTime(),
                                            'last_sync'    => CurrDateTime(),
                                        ]);

                                    echo "Berhasil update data bobot_iku_5 : " . $kategori->id_katgiat . " - " . $jns_karya . "\n";

                                } else {
                                    DB::table('temp_iku.bobot_iku_5')->insert([
                                        'id_katgiat'   => $kategori->id_katgiat,
                                        'thn_ajaran'   => $thn_ajaran,
                                        'nm_kat'       => $nm_kat,
                                        'jns_karya'    => $jns_karya,
                                        'bobot'        => $bobot,
                                        'create_date'  => CurrDateTime(),
                                        'last_update'  => CurrDateTime(),
                                        'expired_date' => null,
                                        'last_sync'    => CurrDateTime(),
                                    ]);

                                    echo "Berhasil input data bobot_iku_5 : " . $kategori->id_katgiat . " - " . $jns_karya . "\n";
                                }

                            } else {
                                echo "Gagal input data bobot_iku_5: " . $nm_kat . " - " . $jns_karya . " tidak ditemukan di table ref.kategori_kegiatan\n";
                            }
                        }

                    } catch (\Exception $e) {
                        echo "Error processing row: " . $e->getMessage() . "\n";
                        continue;
                    }
                }
            }
        }, $file_path);
    }
}
