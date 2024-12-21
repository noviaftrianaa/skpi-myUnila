<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ImportMapProdiSiakaduSeeder extends Seeder
{
    public function run()
    {
        $this->importData();
    }

    public function importData()
    {
        $file_path = storage_path('app/prodi_siakadu.csv');

        Excel::import(new class implements \Maatwebsite\Excel\Concerns\ToCollection {
            public function collection($rows)
            {
                foreach ($rows as $index => $row) {
                    try {
                        if ($index > 0) {
                            $kode_siakad = $row[0];
                            $nm_lemb = $row[1];
                            $jenjang = $row[2];
                            $kode_prodi = $row[3];

                            $this->insertProdi($kode_siakad, $nm_lemb, $jenjang, $kode_prodi);
                        }
                    } catch (\Exception $e) {
                        echo "Error processing row at index {$index}: " . $e->getMessage() . "\n";
                        continue;
                    }
                }
            }

            private function insertProdi($kode_siakad, $nm_lemb, $jenjang, $kode_prodi)
            {
                $kode_siakad = (string) $kode_siakad;
                $kode_prodi = (string) $kode_prodi;

                $existingSms = DB::table('pdrd.sms')
                    ->where('kode_prodi', $kode_prodi)
                    ->whereNotNull('id_fak_unila')
                    ->orderBy('create_date', 'desc')
                    ->first();

                if ($existingSms) {
                    $existingProdi = DB::table('temp.map_prodi_siakad')
                        ->where('kode_siakad', $kode_siakad)
                        ->where('kode_prodi', $kode_prodi)
                        ->first();

                    if (!$existingProdi) {
                        DB::table('temp.map_prodi_siakad')->insert([
                            'id_sms' => $existingSms->id_sms,
                            'nm_lemb' => $nm_lemb,
                            'kode_prodi' => $kode_prodi,
                            'kode_siakad' => $kode_siakad,
                            'jenjang' => $jenjang,
                            'create_date' => CurrDateTime(),
                            'last_update' => CurrDateTime(),
                            'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                            'id_updater' => '26004417-6e92-463c-bf35-f741817121dc',
                            'soft_delete' => 0,
                            'last_sync' => CurrDateTime(),
                        ]);
                        echo "Berhasil input: " . $kode_siakad . "\n";
                    }else{
                        echo "Sudah ada: " . $kode_siakad . "\n";
                    }

                } else {
                    echo "--------------- Data sms tidak ada: " . $kode_siakad . "\n";
                }
            }
        }, $file_path);
    }
}
