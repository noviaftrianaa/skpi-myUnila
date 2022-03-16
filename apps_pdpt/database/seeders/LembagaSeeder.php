<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Database\Seeder;

class LembagaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $waktu_sekarang = currDateTime();
        $sms = \DB::connection('pgsql_sister')->table('pdrd.sms')
            ->select([
                'id_sms',
                'nm_lemb',
                'kd_kl',
                'kd_satker',
                'smt_mulai',
                'a_selenggara_subst',
                'kode_prodi',
                'nm_prodi_english',
                'jln',
                'rt',
                'rw',
                'nm_dsn',
                'ds_kel',
                'kode_pos',
                'lintang',
                'bujur',
                'no_tel',
                'no_fax',
                'email',
                'website',
                'singkatan',
                'tgl_berdiri',
                'sk_selenggara',
                'tgl_sk_selenggara',
                'tmt_sk_selenggara',
                'tst_sk_selenggara',
                'kpst_pd',
                'sks_lulus',
                'gelar_lulusan',
                'stat_prodi',
                'polesei_nilai',
                'a_kependidikan',
                'sistem_ajar',
                'a_pjj',
                'a_psdku',
                'luas_lab',
                'kapasitas_prak_satu_shift',
                'jml_mhs_pengguna',
                'jml_jam_penggunaan',
                'jml_prodi_pengguna',
                'jml_modul_prak_sendiri',
                'jml_modul_prak_lain',
                'fungsi_selain_prak',
                'penggunaan_lab',
                \DB::RAW('0 AS a_pkl'),
                'id_sp',
                'id_jenj_didik',
                'id_jns_sms',
                'id_fungsi_lab',
                'id_kel_usaha',
                \DB::RAW('NULL AS id_blob'),
                'id_wil',
                'id_jur',
                'id_induk_sms',
                'tgl_create AS create_date',
                'id_updater AS id_creator',
                'last_update',
                'id_updater',
                'soft_delete',
                'last_sync'
            ])->where('id_sp',env('APP_ID_SP'))
            ->whereNull('id_induk_sms')
            ->get();
        foreach ($sms AS $no_sms=>$each_sms) {
            $cek_sms = Sms::find($each_sms->id_sms);
            if (is_null($cek_sms)) {
                $input_sms = (array) $each_sms;
                $input_sms['last_update']   = $waktu_sekarang;
                $input_sms['last_sync']     = $waktu_sekarang;
                $simpan_sms = new Sms();
                $simpan_sms->fill($input_sms)->save();
            } else {
                if ($each_sms->last_update>$cek_sms->last_update) {
                    $input_sms = (array) $each_sms;
                    unset($input_sms['id_sms']);
                    $input_sms['last_update']   = $waktu_sekarang;
                    $input_sms['last_sync']     = $waktu_sekarang;
                    $update_sms = Sms::find($each_sms->id_sms);
                    $update_sms->fill($input_sms)->save();
                }
            }
            $level_1 = \DB::connection('pgsql_sister')->table('pdrd.sms')
                ->select([
                    'id_sms',
                    'nm_lemb',
                    'kd_kl',
                    'kd_satker',
                    'smt_mulai',
                    'a_selenggara_subst',
                    'kode_prodi',
                    'nm_prodi_english',
                    'jln',
                    'rt',
                    'rw',
                    'nm_dsn',
                    'ds_kel',
                    'kode_pos',
                    'lintang',
                    'bujur',
                    'no_tel',
                    'no_fax',
                    'email',
                    'website',
                    'singkatan',
                    'tgl_berdiri',
                    'sk_selenggara',
                    'tgl_sk_selenggara',
                    'tmt_sk_selenggara',
                    'tst_sk_selenggara',
                    'kpst_pd',
                    'sks_lulus',
                    'gelar_lulusan',
                    'stat_prodi',
                    'polesei_nilai',
                    'a_kependidikan',
                    'sistem_ajar',
                    'a_pjj',
                    'a_psdku',
                    'luas_lab',
                    'kapasitas_prak_satu_shift',
                    'jml_mhs_pengguna',
                    'jml_jam_penggunaan',
                    'jml_prodi_pengguna',
                    'jml_modul_prak_sendiri',
                    'jml_modul_prak_lain',
                    'fungsi_selain_prak',
                    'penggunaan_lab',
                    \DB::RAW('0 AS a_pkl'),
                    'id_sp',
                    'id_jenj_didik',
                    'id_jns_sms',
                    'id_fungsi_lab',
                    'id_kel_usaha',
                    \DB::RAW('NULL AS id_blob'),
                    'id_wil',
                    'id_jur',
                    'id_induk_sms',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])->where('id_sp',env('APP_ID_SP'))
                ->where('id_induk_sms',$each_sms->id_sms)
                ->get();
            foreach ($level_1 AS $no_lvl_1=>$each_lvl_1) {
                $cek_lvl_1 = Sms::find($each_lvl_1->id_sms);
                if (is_null($cek_lvl_1)) {
                    $input_lvl_1 = (array) $each_lvl_1;
                    $input_lvl_1['id_fak_unila']    = $each_sms->id_sms;
                    $input_lvl_1['last_update']     = $waktu_sekarang;
                    $input_lvl_1['last_sync']       = $waktu_sekarang;
                    $simpan_lvl_1 = new Sms();
                    $simpan_lvl_1->fill($input_lvl_1)->save();
                } else {
                    if ($each_lvl_1->last_update>$cek_lvl_1->last_update) {
                        $input_lvl_1 = (array) $each_lvl_1;
                        unset($input_lvl_1['id_sms']);
                        $input_lvl_1['id_fak_unila']= $each_sms->id_sms;
                        $input_lvl_1['last_update'] = $waktu_sekarang;
                        $input_lvl_1['last_sync']   = $waktu_sekarang;
                        $update_lvl_1 = Sms::find($each_lvl_1->id_sms);
                        $update_lvl_1->fill($input_lvl_1)->save();
                    }
                }
                $level_2 = \DB::connection('pgsql_sister')->table('pdrd.sms')
                    ->select([
                        'id_sms',
                        'nm_lemb',
                        'kd_kl',
                        'kd_satker',
                        'smt_mulai',
                        'a_selenggara_subst',
                        'kode_prodi',
                        'nm_prodi_english',
                        'jln',
                        'rt',
                        'rw',
                        'nm_dsn',
                        'ds_kel',
                        'kode_pos',
                        'lintang',
                        'bujur',
                        'no_tel',
                        'no_fax',
                        'email',
                        'website',
                        'singkatan',
                        'tgl_berdiri',
                        'sk_selenggara',
                        'tgl_sk_selenggara',
                        'tmt_sk_selenggara',
                        'tst_sk_selenggara',
                        'kpst_pd',
                        'sks_lulus',
                        'gelar_lulusan',
                        'stat_prodi',
                        'polesei_nilai',
                        'a_kependidikan',
                        'sistem_ajar',
                        'a_pjj',
                        'a_psdku',
                        'luas_lab',
                        'kapasitas_prak_satu_shift',
                        'jml_mhs_pengguna',
                        'jml_jam_penggunaan',
                        'jml_prodi_pengguna',
                        'jml_modul_prak_sendiri',
                        'jml_modul_prak_lain',
                        'fungsi_selain_prak',
                        'penggunaan_lab',
                        \DB::RAW('0 AS a_pkl'),
                        'id_sp',
                        'id_jenj_didik',
                        'id_jns_sms',
                        'id_fungsi_lab',
                        'id_kel_usaha',
                        \DB::RAW('NULL AS id_blob'),
                        'id_wil',
                        'id_jur',
                        'id_induk_sms',
                        'tgl_create AS create_date',
                        'id_updater AS id_creator',
                        'last_update',
                        'id_updater',
                        'soft_delete',
                        'last_sync'
                    ])->where('id_sp',env('APP_ID_SP'))
                    ->where('id_induk_sms',$each_lvl_1->id_sms)
                    ->get();
                foreach ($level_2 AS $no_lvl_2=>$each_lvl_2) {
                    $cek_lvl_2 = Sms::find($each_lvl_2->id_sms);
                    if (is_null($cek_lvl_2)) {
                        $input_lvl_2 = (array) $each_lvl_2;
                        $input_lvl_2['id_fak_unila']    = $each_sms->id_sms;
                        $input_lvl_2['id_jur_unila']= $each_lvl_1->id_sms;
                        $input_lvl_2['last_update']     = $waktu_sekarang;
                        $input_lvl_2['last_sync']       = $waktu_sekarang;
                        $simpan_lvl_2 = new Sms();
                        $simpan_lvl_2->fill($input_lvl_2)->save();
                    } else {
                        if ($each_lvl_2->last_update>$cek_lvl_2->last_update) {
                            $input_lvl_2 = (array) $each_lvl_2;
                            unset($input_lvl_2['id_sms']);
                            $input_lvl_2['id_fak_unila']= $each_sms->id_sms;
                            $input_lvl_2['id_jur_unila']= $each_lvl_1->id_sms;
                            $input_lvl_2['last_update'] = $waktu_sekarang;
                            $input_lvl_2['last_sync']   = $waktu_sekarang;
                            $update_lvl_2 = Sms::find($each_lvl_2->id_sms);
                            $update_lvl_2->fill($input_lvl_2)->save();
                        }
                    }
                }
            }
        }
    }
}
