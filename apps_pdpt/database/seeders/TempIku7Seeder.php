<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\TempIku7;
use App\Models\PDUT\Dashboard\DetailIku7;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\Matkul;
use App\Models\PDUT\Pdrd\MatkulKurikulum;
use App\Models\PDUT\Pdrd\ReMk;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class TempIku7Seeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->importDataIku7();
    }

    public function importDataIku7()
    {
        $file_path = storage_path('uploads/detailMk.xlsx');
        $data_matkul = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            //tambah mata kuliah
            $data_matkul = Matkul::create([
                'id_mk' => guid(),
                'id_sms' => $each_data['id_sms'] ? $each_data['id_sms'] : NULL,
                'id_jenj_didik' => 30,
                'sks_mk' => 3,
                'sks_tm' => NULL,
                'sks_prak' => NULL,
                'sks_prak_lap' => NULL,
                'sks_sim' => NULL,
                'kode_mk' => $each_data['kode_mk'],
                'nm_mk' => $each_data['nm_mk'] ? $each_data['nm_mk'] : NULL,
                'jns_mk' => NULL,
                'kel_mk' => NULL,
                'metode_pelaksanaan_kuliah' => NULL,
                'a_sap' => NULL,
                'a_silabus' => NULL,
                'a_bahan_ajar' => NULL,
                'acara_prak' => NULL,
                'a_diktat' => NULL,
                'tgl_mulai_efektif' => NULL,
                'tgl_akhir_efektif' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            //tambah re_mk
            $data_remk = ReMk::create([
                'id_basis_evaluasi' => 1,
                'id_mk' => $data_matkul->id_mk,
                'komponen_evaluasi' => $each_data['komponen_evaluasi'] ? $each_data['komponen_evaluasi'] : NULL,
                'desk_indo' => $each_data['desk_indo'],
                'desk_ing' => $each_data['desk_ing'] ? $each_data['desk_ing'] : NULL,
                'bobot_evaluasi' => $each_data['bobot_evaluasi'] ? $each_data['bobot_evaluasi'] : NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

              
        });
    }
}
