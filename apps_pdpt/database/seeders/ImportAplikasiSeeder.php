<?php

namespace Database\Seeders;

use App\Models\Temp\Aplikasi;
use Illuminate\Database\Seeder;
use Rap2hpoutre\FastExcel\FastExcel;

class ImportAplikasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->importTingkatKerjasama();
        $this->importDataAplikasi();
    }

    public function importDataAplikasi()
    {
        $file_path = storage_path('uploads/sistem_informasi.xlsx');
        (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            $data_sistem_informasi = Aplikasi::create([
                'id_aplikasi' => guid(),
                'nm_aplikasi' => $each_data['nm_aplikasi'],
                'url' => $each_data['url'],
                'teknologi' => $each_data['teknologi'],
                'administrator' => $each_data['administrator'],
                'nm_pengguna' => $each_data['nm_pengguna'],
                'nm_lemb' => $each_data['nm_lemb'],
                'a_internal' => $each_data['a_internal'],
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime()
            ]);

        });
    }
}
