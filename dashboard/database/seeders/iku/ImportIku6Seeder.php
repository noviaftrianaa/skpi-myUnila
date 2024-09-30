<?php

namespace Database\Seeders\iku;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ImportIku6Seeder extends Seeder
{
    public function run()
    {
        // $this->referensi();
        $this->mou();
    }

    public function referensi()
    {
        $file_path = storage_path('app/import_iku6.xlsx');

        Excel::import(new class implements \Maatwebsite\Excel\Concerns\ToCollection {
            public function collection($rows)
            {
                foreach ($rows as $index => $row) {
                    try {
                        if ($index > 0) {
                            $nm_kriteria_mitra = $row[5];
                            $nm_akt_kerjasama = $row[6];
                            $nm_bntk_giat_kerjasama = $row[9];
                            $thn_ajaran = 2023;

                            // $this->insertOrUpdateAktifitasKerjasama($nm_akt_kerjasama);
                            //  flush();
                            // $this->insertOrUpdateKriteriaMitra($nm_kriteria_mitra);
                            //  flush();
                            // $this->insertOrUpdateBentukKegiatan($nm_bntk_giat_kerjasama);
                            //  flush();
                        }
                    } catch (\Exception $e) {
                        echo "Error processing row at index {$index}: " . $e->getMessage() . "\n";
                        // flush();
                        continue;
                    }
                }
            }
            // Function to handle Aktifitas Kerjasama insertion/check
            private function insertOrUpdateAktifitasKerjasama($nm_akt_kerjasama)
            {
                $akt_kerjasama = DB::table('ref.aktifitas_kerjasama')
                    ->where('nm_akt_kerjasama', $nm_akt_kerjasama)
                    ->whereNull('expired_date')
                    ->first();

                if (!$akt_kerjasama) {
                    DB::table('ref.aktifitas_kerjasama')->insert([
                        'nm_akt_kerjasama' => $nm_akt_kerjasama,
                        'a_ref_pddikti' => 1,
                        'a_ref_unila' => 0,
                        'ket' => null,
                        'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                        'create_date' => CurrDateTime(),
                        'last_update' => CurrDateTime(),
                        'expired_date' => null,
                        'last_sync' => CurrDateTime(),
                    ]);
                    echo "Berhasil input: " . $nm_akt_kerjasama . "\n";
                } else {
                    echo "Sudah ada: " . $nm_akt_kerjasama . "\n";
                }
            }
            // Function to handle Kriteria Mitra insertion/check
            private function insertOrUpdateKriteriaMitra($nm_kriteria_mitra)
            {
                $kriteria_mitra = DB::table('ref.kriteria_mitra')
                    ->where('nm_kriteria_mitra', $nm_kriteria_mitra)
                    ->whereNull('expired_date')
                    ->first();

                if (!$kriteria_mitra) {
                    DB::table('ref.kriteria_mitra')->insert([
                        'nm_kriteria_mitra' => $nm_kriteria_mitra,
                        'a_ref_pddikti' => 1,
                        'a_ref_unila' => 0,
                        'ket' => null,
                        'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                        'create_date' => CurrDateTime(),
                        'last_update' => CurrDateTime(),
                        'expired_date' => null,
                        'last_sync' => CurrDateTime(),
                    ]);
                    echo "Berhasil input: " . $nm_kriteria_mitra . "\n";
                } else {
                    echo "Sudah ada: " . $nm_kriteria_mitra . "\n";
                }
            }
            private function insertOrUpdateBentukKegiatan($nm_bntk_giat_kerjasama)
            {
                $bentuk_kegiatan_kerjasama = DB::table('ref.bentuk_kegiatan_kerjasama')
                    ->where('nm_bntk_giat_kerjasama', $nm_bntk_giat_kerjasama)
                    ->whereNull('expired_date')
                    ->first();

                if (!$bentuk_kegiatan_kerjasama) {
                    DB::table('ref.bentuk_kegiatan_kerjasama')->insert([
                        'nm_bntk_giat_kerjasama' => $nm_bntk_giat_kerjasama,
                        'a_ref_pddikti' => 1,
                        'a_ref_unila' => 0,
                        'ket' => null,
                        'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                        'create_date' => CurrDateTime(),
                        'last_update' => CurrDateTime(),
                        'expired_date' => null,
                        'last_sync' => CurrDateTime(),
                    ]);
                    echo "Berhasil input: " . $nm_bntk_giat_kerjasama . "\n";
                } else {
                    echo "Sudah ada: " . $nm_bntk_giat_kerjasama . "\n";
                }
            }

        }, $file_path);
    }

    public function mou()
    {
        $file_path = storage_path('app/import_iku6.xlsx');

        DB::beginTransaction();
        try {
            Excel::import(new class implements \Maatwebsite\Excel\Concerns\ToCollection {
                public function collection($rows)
                {
                    foreach ($rows as $index => $row) {
                        try {
                            if ($index > 0) {
                                $data = [
                                    'no' => $row[0],
                                    'nm_sp' => $row[1],
                                    'nm_prodi' => $row[2],
                                    'nm_jenj_didik' => $row[3],
                                    'nm_dudi' => $row[4],
                                    'nm_kriteria_mitra' => $row[5],
                                    'nm_akt_kerjasama' => $row[6],
                                    'tgl_mulai' => $row[7],
                                    'tgl_selesai' => $row[8],
                                    'nm_bntk_giat_kerjasama' => $row[9],
                                    'judul_mou' => $row[10],
                                    'verifikasi' => $row[11],
                                    'bobot' => $row[12],
                                    'thn_ajaran' => 2023,
                                ];

                                echo "Proses Data No: " . $data['no'] . "\n";

                                // Insert or Update Kerjasama MOU
                                $this->insertOrUpdateKerjasama($data);
                                flush(); // Flush the output buffer
                            }
                        } catch (\Exception $e) {
                            // Log the error message
                            Log::error($e->getMessage() . ' on line ' . $e->getLine());
                            echo "Error processing row at index {$index}: " . $e->getMessage() . "\n";
                            flush();
                            continue;
                        }
                    }
                }

                private function excelSerialDateToDate($serialDate)
                {
                    return Carbon::createFromDate(1900, 1, 1)->addDays($serialDate - 2)->toDateString();
                }

                private function insertOrUpdateKerjasama($data)
                {
                    try {
                        // Look up foreign key references
                        $id_akt_kerjasama = DB::table('ref.aktifitas_kerjasama')
                            ->where('nm_akt_kerjasama', $data['nm_akt_kerjasama'])
                            ->value('id_akt_kerjasama');

                        $id_kriteria_mitra = DB::table('ref.kriteria_mitra')
                            ->where('nm_kriteria_mitra', $data['nm_kriteria_mitra'])
                            ->value('id_kriteria_mitra');

                        $id_bntk_giat_kerjasama = DB::table('ref.bentuk_kegiatan_kerjasama')
                            ->where('nm_bntk_giat_kerjasama', $data['nm_bntk_giat_kerjasama'])
                            ->value('id_bntk_giat_kerjasama');

                        $id_sms = DB::table('pdrd.sms as prodi')
                            ->join('ref.jenjang_pendidikan as jenj', function ($join) {
                                $join->on('jenj.id_jenj_didik', '=', 'prodi.id_jenj_didik')
                                    ->whereNull('jenj.expired_date');
                            })
                            ->where('prodi.soft_delete', 0)
                            ->where('prodi.id_jns_sms', 3)
                            ->where('prodi.stat_prodi', 'A')
                            ->whereNotNull('prodi.id_fak_unila')
                            ->when(!empty($data['nm_prodi']), function ($query) use ($data) {
                                $query->whereRaw('prodi.nm_lemb COLLATE Latin1_General_CI_AS LIKE ?', ["%{$data['nm_prodi']}%"]);
                            })
                            ->when(!empty($data['nm_jenj_didik']), function ($query) use ($data) {
                                $query->whereRaw('jenj.nm_jenj_didik COLLATE Latin1_General_CI_AS LIKE ?', ["%{$data['nm_jenj_didik']}%"]);
                            })
                            ->value('prodi.id_sms');

                        // Find or create MOU
                        $mou = DB::table('kerjasama.mou')
                            ->where('judul_mou', $data['judul_mou'])
                            ->where('id_akt_kerjasama', $id_akt_kerjasama)
                            ->where('nm_dudi', $data['nm_dudi'])
                            ->where('tgl_mulai',  $this->excelSerialDateToDate($data['tgl_mulai']))
                            ->where('tgl_selesai',  $this->excelSerialDateToDate($data['tgl_selesai']))
                            ->where('soft_delete', 0)
                            ->first();

                        if (!$mou) {
                            // Insert into 'kerjasama.mou' if not found
                            $id_mou = guid();
                            DB::table('kerjasama.mou')->insert([
                                'id_mou' => $id_mou,
                                'id_sp' => 'E2B705A7-173E-464A-9FAC-509128709515', // Unila
                                'id_akt_kerjasama' => $id_akt_kerjasama,
                                'sk_mou' => '-',
                                'judul_mou' => $data['judul_mou'],
                                'tgl_mulai' => $this->excelSerialDateToDate($data['tgl_mulai']),
                                'tgl_selesai' => $this->excelSerialDateToDate($data['tgl_selesai']),
                                'nm_dudi' => $data['nm_dudi'],
                                'nm_bu' => '-',
                                'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                                'create_date' => CurrDateTime(),
                                'last_update' => CurrDateTime(),
                                'last_sync' => CurrDateTime(),
                                'soft_delete' => 0,
                            ]);

                            echo "Berhasil input MOU mitra: " . $data['nm_dudi'] . "\n";
                        } else {
                            // Update existing MOU
                            $id_mou = $mou->id_mou;
                            DB::table('kerjasama.mou')
                                ->where('id_mou', $id_mou)
                                ->update([
                                    'id_akt_kerjasama' => $id_akt_kerjasama,
                                    'sk_mou' => '-',
                                    'judul_mou' => $data['judul_mou'],
                                    'tgl_mulai' => $this->excelSerialDateToDate($data['tgl_mulai']),
                                    'tgl_selesai' => $this->excelSerialDateToDate($data['tgl_selesai']),
                                    'nm_dudi' => $data['nm_dudi'],
                                    'nm_bu' => '-',
                                    'last_update' => CurrDateTime(),
                                    'last_sync' => CurrDateTime(),
                                    'soft_delete' => 0,
                                ]);

                            echo "Berhasil update MOU mitra: " . $data['nm_dudi'] . "\n";
                        }

                        // Check for existing sms_kerjasama
                        $sms_kerjasama = DB::table('kerjasama.sms_kerjasama')
                            ->where('id_mou', $id_mou)
                            ->where('id_sms', $id_sms)
                            ->where('id_kriteria_mitra', $id_kriteria_mitra)
                            ->where('id_bntk_giat_kerjasama', $id_bntk_giat_kerjasama)
                            ->where('soft_delete', 0)
                            ->first();

                        if (!$sms_kerjasama) {
                            // Insert into 'kerjasama.sms_kerjasama' if not found
                            $id_sms_kerjasama = guid();
                            DB::table('kerjasama.sms_kerjasama')->insert([
                                'id_sms_kerjasama' => $id_sms_kerjasama,
                                'id_mou' => $id_mou,
                                'id_sms' => $id_sms,
                                'id_kriteria_mitra' => $id_kriteria_mitra,
                                'id_bntk_giat_kerjasama' => $id_bntk_giat_kerjasama,
                                'id_creator' => '26004417-6e92-463c-bf35-f741817121dc',
                                'create_date' => CurrDateTime(),
                                'last_update' => CurrDateTime(),
                                'last_sync' => CurrDateTime(),
                                'soft_delete' => 0,
                            ]);

                            // Insert to 'temp_iku.verifikasi_kerjasama_iku_6'
                            DB::table('temp_iku.verifikasi_kerjasama_iku_6')->insert([
                                'id_sms_kerjasama' => $id_sms_kerjasama,
                                'thn_ajaran' => $data['thn_ajaran'],
                                'verifikasi' => $data['verifikasi'],
                                'bobot' => $data['bobot'],
                                'create_date' => CurrDateTime(),
                                'last_update' => CurrDateTime(),
                                'last_sync' => CurrDateTime(),
                                'expired_date' => null,
                            ]);
                        } else {
                            // Update existing sms_kerjasama
                            DB::table('kerjasama.sms_kerjasama')
                                ->where('id_sms_kerjasama', $sms_kerjasama->id_sms_kerjasama)
                                ->update([
                                    'id_sms' => $id_sms,
                                    'id_kriteria_mitra' => $id_kriteria_mitra,
                                    'id_bntk_giat_kerjasama' => $id_bntk_giat_kerjasama,
                                    'last_update' => CurrDateTime(),
                                    'last_sync' => CurrDateTime(),
                                    'soft_delete' => 0,
                                ]);

                            // Update related 'temp_iku.verifikasi_kerjasama_iku_6'
                            DB::table('temp_iku.verifikasi_kerjasama_iku_6')
                                ->where('id_sms_kerjasama', $sms_kerjasama->id_sms_kerjasama)
                                ->update([
                                    'thn_ajaran' => $data['thn_ajaran'],
                                    'verifikasi' => $data['verifikasi'],
                                    'bobot' => $data['bobot'],
                                    'last_update' => CurrDateTime(),
                                    'last_sync' => CurrDateTime(),
                                    'expired_date' => null,
                                ]);
                        }

                    } catch (\Exception $e) {
                        Log::error($e->getMessage() . ' on line ' . $e->getLine());
                        throw $e;
                    }
                }

            }, $file_path);

            DB::commit();
        } catch (\Exception $e) {
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            echo "Transaction Error: " . $e->getMessage() . "\n";
            DB::rollBack();
        }
    }


}
