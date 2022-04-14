<?php

namespace Database\Seeders;

use App\Models\ManAkses\Pengguna;
use Illuminate\Database\Seeder;
use Rap2hpoutre\FastExcel\FastExcel;

class AkunSsoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->importData();
    }

    public function importData()
    {
        $file_path = storage_path('uploads/sso.csv');

        $data_sso = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';

            $data_sso = Pengguna::updateOrInsert([
                'username' => $each_data['username']
            ], [
                'id_pengguna' => guid(),
                'password' => $each_data['password'],
                'nm_pengguna' => $each_data['nm_pengguna'],
                'jenis_kelamin' => $each_data['jenis_kelamin'],
                'approval_pengguna' => $each_data['approval_pengguna'],
                'a_aktif' => $each_data['a_aktif'],
                'disable' => $each_data['disable'],
                'id_updater' => $each_data['id_updater'],
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);

        });

        echo " Data berhasil diimport\n";
    }
}

