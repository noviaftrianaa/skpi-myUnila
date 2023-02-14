<?php

namespace Database\Seeders;

use App\Models\PDUT\Man_akses\TableAplikasi;
use Illuminate\Database\Seeder;
use Rap2hpoutre\FastExcel\FastExcel;

class ImportTableAplikasi extends Seeder
{
    public function run()
    {
        $this->importData();
    }

    public function importData()
    {
        $file_path = storage_path('uploads/table_aplikasi_20221027.xlsx');

        (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {

            TableAplikasi::updateOrInsert([
                'id_table_app' => $each_data['id_table_app']
            ], [
                'skema_tbl' => $each_data['skema_tbl'],
                'nm_tbl' => $each_data['nm_tbl'],
                'tabel_alias' => $each_data['tabel_alias'],
                'kode_primary' => $each_data['kode_primary'],
                'sync_type' => $each_data['sync_type'],
                'sync_seq' => $each_data['sync_seq'],
                'kolom_kecuali' => $each_data['kolom_kecuali'],
                'table_status' => $each_data['table_status'],
                'table_ket' => $each_data['table_ket'],
                'jml_thread' => $each_data['jml_thread'],
                'baris_per_thread' => $each_data['baris_per_thread'],
                'order_ekstra' => $each_data['order_ekstra'],
                'a_table_aktif' => $each_data['a_table_aktif'],
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime()
            ]);

            echo " Data berhasil diimport no ".$each_data['no'] ."\n";
        });

    }
}
