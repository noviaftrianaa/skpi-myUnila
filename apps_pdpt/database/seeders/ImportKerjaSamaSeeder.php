<?php

namespace Database\Seeders;

use App\Models\ManAkses\Pengguna;
use App\Models\PDUT\Kerjasama\Mou;
use App\Models\PDUT\Kerjasama\SmsKerjasama;
use App\Models\PDUT\Ref\TingkatKerjasama;
use Carbon\Carbon;
use DB;
use Illuminate\Database\Seeder;
use Rap2hpoutre\FastExcel\FastExcel;

class ImportKerjaSamaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->importTingkatKerjasama();
        $this->importMouKerjasama();
    }

    public function importTingkatKerjasama()
    {
        $file_path = storage_path('uploads/kerjasama.xlsx');
        (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            $data_tingkat_kerjasama = TingkatKerjasama::create([
                // 'id_tingkat_kerjasama' => $each_data['id_tingkat_kerjasama'],
                'nm_tingkat_kerjasama' => $each_data['nm_tingkat_kerjasama'],
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime()
            ]);

        });
    }

    public function importMouKerjasama()
    {
        $file_path = storage_path('uploads/kerjasama.xlsx');

        (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {
            $id_creator = 'b2e7b814-9789-45a6-bbb9-31d4cd8cbff9';
            $tgl_awal = Carbon::parse($each_data['tgl_akhir'])->format('Y-m-d');
            $tgl_akhir = Carbon::parse($each_data['tgl_akhir'])->format('Y-m-d');

            $cek_mou_kerma = DB::SELECT("
                SELECT *
                FROM
                    kerjasama.mou AS mou
                    LEFT JOIN kerjasama.sms_kerjasama AS kerma ON kerma.id_mou = mou.id_mou
                    AND kerma.soft_delete = 0
                    AND kerma.id_mou = '" . $each_data['id_kerma'] . "'
                    AND kerma.id_sms = '" . $each_data['id_sms'] . "'
                WHERE
                    mou.soft_delete = 0
                    AND mou.judul_mou = '" . $each_data['judul_kerma'] . "'
                    AND mou.tgl_mulai = '" . $tgl_awal . "'
                    AND mou.tgl_selesai = '" . $tgl_akhir . "'
            ");

            if (!sizeof($cek_mou_kerma)) {

                $cek_mou = Mou::where('id_mou', $each_data['id_kerma'])
                ->where('soft_delete', 0)
                ->first();

            if (is_null($cek_mou)) {
                $data_mou = Mou::create([
                    'id_mou' => $each_data['id_kerma'],
                    'id_sp' => $each_data['id_sp'],
                    'sk_mou' => $each_data['no_dokumen'] ?  $each_data['no_dokumen'] : '-',
                    'judul_mou' => $each_data['judul_kerma'] ?  $each_data['judul_kerma'] : '-',
                    'tgl_mulai' => $each_data['tgl_awal'],
                    'tgl_selesai' => $each_data['tgl_akhir'],
                    'nm_dudi' => $each_data['nm_mitra'] ?  $each_data['nm_mitra'] : '-',
                    'nm_bu' => $each_data['nm_klas_mitra'] ?  $each_data['nm_klas_mitra'] : '-',
                    // 'id_akt_kerjasama' => $each_data['id_akt_kerjasama'],
                    // 'id_dudi' => $each_data['id_dudi'],
                    // 'uraian_mou' => $each_data['uraian_mou'],
                    // 'npwp_dudi' => $each_data['npwp_dudi'],
                    // 'tel_kantor' => $each_data['tel_kantor'],
                    // 'fax' => $each_data['fax'],
                    // 'cp' => $each_data['cp'],
                    // 'tel_cp' => $each_data['tel_cp'],
                    // 'jab_cp' => $each_data['jab_cp'],
                    'id_creator' => $id_creator,
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime()
                ]);

                $data_sms_kerjasama = SmsKerjasama::create([
                    'id_sms_kerjasama' => guid(),
                    'id_tingkat_kerjasama' => 5,
                    'id_mou' => $each_data['id_kerma'],
                    'id_sms' => $each_data['id_sms'],
                    // 'id_sumber_dana' => $each_data['id_sumber_dana'],
                    // 'id_stat_kerjasama' => $each_data['id_stat_kerjasama'],
                    // 'id_bid_kerjasama' => $each_data['id_bid_kerjasama'],
                    // 'id_kriteria_mitra' => $each_data['id_kriteria_mitra'],
                    // 'id_bntk_giat_kerjasama' => $each_data['id_bntk_giat_kerjasama'],
                    // 'hsl_prod_brg' => $each_data['hsl_prod_brg'],
                    // 'hsl_prod_jasa' => $each_data['hsl_prod_jasa'],
                    // 'omzet_barang_per_bulan' => $each_data['omzet_barang_per_bulan'],
                    // 'omzet_jasa_per_bulan' => $each_data['omzet_jasa_per_bulan'],
                    // 'prestasi_penghargaan' => $each_data['prestasi_penghargaan'],
                    // 'pangsa_psr_brg' => $each_data['pangsa_psr_brg'],
                    // 'pangsa_psr_jasa' => $each_data['pangsa_psr_jasa'],
                    // 'besaran_kerjasama' => $each_data['besaran_kerjasama'],
                    'id_creator' => $id_creator,
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime()
                ]);

                echo " Data Kerjasama no " . $each_data['no'] . " Berhasil ditambahkan\n";
            } else {
                $data_sms_kerjasama = SmsKerjasama::create([
                    'id_sms_kerjasama' => guid(),
                    'id_tingkat_kerjasama' => 5,
                    'id_mou' => $each_data['id_kerma'],
                    'id_sms' => $each_data['id_sms'],
                    // 'id_sumber_dana' => $each_data['id_sumber_dana'],
                    // 'id_stat_kerjasama' => $each_data['id_stat_kerjasama'],
                    // 'id_bid_kerjasama' => $each_data['id_bid_kerjasama'],
                    // 'id_kriteria_mitra' => $each_data['id_kriteria_mitra'],
                    // 'id_bntk_giat_kerjasama' => $each_data['id_bntk_giat_kerjasama'],
                    // 'hsl_prod_brg' => $each_data['hsl_prod_brg'],
                    // 'hsl_prod_jasa' => $each_data['hsl_prod_jasa'],
                    // 'omzet_barang_per_bulan' => $each_data['omzet_barang_per_bulan'],
                    // 'omzet_jasa_per_bulan' => $each_data['omzet_jasa_per_bulan'],
                    // 'prestasi_penghargaan' => $each_data['prestasi_penghargaan'],
                    // 'pangsa_psr_brg' => $each_data['pangsa_psr_brg'],
                    // 'pangsa_psr_jasa' => $each_data['pangsa_psr_jasa'],
                    // 'besaran_kerjasama' => $each_data['besaran_kerjasama'],
                    'id_creator' => $id_creator,
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime()
                ]);
                echo " Data Kerjasama no " . $each_data['no'] . " Berhasil ditambahkan\n";
            }
            } else {
                echo "Data sudah ada no ". $each_data['no'] ."\n";
            }
        });
    }
}