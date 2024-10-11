<?php

namespace Database\Seeders;

use App\Models\Pdrd\KuliahMhs;
use App\Models\Pdrd\RegPd;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleaningMahasiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        #get_reg_pd_temp_baru
        $get_update_reg_pd = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.reg_pd_temp AS rpd_new
            LEFT JOIN pdrd.reg_pd AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_reg_pd = count($get_update_reg_pd);
        if ($total_update_get_reg_pd>0) {
            foreach ($get_update_reg_pd AS $no_reg_pd_update=>$each_get_reg_pd_update) {
                echo "Mengupdate data reg_pd ".($no_reg_pd_update+1)." dari ".$total_update_get_reg_pd;
                $input = (array) $each_get_reg_pd_update;
                $cari_reg_pd = RegPd::find($input['id_reg_pd']);
                if (!is_null($cari_reg_pd)) {
                    unset($input['id_reg_pd']);
                    $input['last_sync'] = currDateTime();
                    $cari_reg_pd->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }

        #kuliah_mhs
        $get_update_kuliah_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.kuliah_mhs_temp AS rpd_new
            LEFT JOIN pdrd.kuliah_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_smt=rpd_new.id_smt
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_kuliah_mhs = count($get_update_kuliah_mhs);
        if ($total_update_get_kuliah_mhs>0) {
            foreach ($get_update_kuliah_mhs AS $no_kuliah_mhs_update=>$each_get_kuliah_mhs_update) {
                echo "Mengupdate data kuliah_mhs ".($no_kuliah_mhs_update+1)." dari ".$total_update_get_kuliah_mhs;
                $input = (array) $each_get_kuliah_mhs_update;
                $cari_kuliah_mhs = KuliahMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_smt',$input['id_smt'])->first();
                if (!is_null($cari_kuliah_mhs)) {
                    unset($input['id_reg_pd']);
                    unset($input['id_smt']);
                    $input['last_sync'] = currDateTime();
                    KuliahMhs::where('id_reg_pd',$cari_kuliah_mhs->id_reg_pd)
                        ->where('id_smt',$cari_kuliah_mhs->id_smt)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }

        $get_insert_kuliah_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.kuliah_mhs_temp AS rpd_new
            LEFT JOIN pdrd.kuliah_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_smt=rpd_new.id_smt
            WHERE (rpd_old.id_reg_pd IS NULL AND rpd_old.id_smt IS NULL)
        ");
        $total_insert_get_kuliah_mhs = count($get_insert_kuliah_mhs);
        if ($total_insert_get_kuliah_mhs>0) {
            foreach ($get_insert_kuliah_mhs AS $no_kuliah_mhs_insert=>$each_get_kuliah_mhs_insert) {
                echo "Menambahkan data kuliah_mhs ".($no_kuliah_mhs_insert+1)." dari ".$total_insert_get_kuliah_mhs;
                $input = (array) $each_get_kuliah_mhs_insert;
                $cari_kuliah_mhs = KuliahMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_smt',$input['id_smt'])->first();
                if (is_null($cari_kuliah_mhs)) {
                    $input['last_sync'] = currDateTime();
                    $data_kuliah = new KuliahMhs();
                    $data_kuliah->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }
    }
}
