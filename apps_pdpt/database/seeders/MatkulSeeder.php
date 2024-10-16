<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AktAjarDosen;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\Matkul;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatkulSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ini_set('memory_limit',-1);
        ini_set('max_execution_time',0);
        $data_mk_sister = \DB::connection('pgsql_sister')->SELECT("
            SELECT
                tsms.nm_lemb,
                tm.id_mk,
                tm.id_sms,
                tm.id_jenj_didik,
                tm.sks_mk,
                tm.sks_tm,
                tm.sks_prak,
                tm.sks_prak_lap,
                tm.sks_sim,
                tm.kode_mk,
                tm.nm_mk,
                tm.jns_mk,
                tm.kel_mk,
                tm.metode_pelaksanaan_kuliah,
                tm.a_sap,
                tm.a_silabus,
                tm.a_bahan_ajar,
                tm.acara_prak,
                tm.a_diktat,
                tm.tgl_mulai_efektif,
                tm.tgl_akhir_efektif,
                tm.tgl_create AS create_date,
                tm.id_updater AS id_creator,
                tm.last_update,
                tm.id_updater,
                tm.soft_delete,
                tm.last_sync
            FROM pdrd.matkul AS tm
            JOIN pdrd.sms AS tsms ON tsms.id_sms=tm.id_sms AND tsms.soft_delete=0
                AND tsms.id_sp='e2b705a7-173e-464a-9fac-509128709515'
            WHERE tm.soft_delete=0
            ORDER BY tsms.id_sms ASC
        ");
        $total_mk = count($data_mk_sister);
        foreach ($data_mk_sister AS $no_mk=>$each_mk) {
            echo "Cek MK: ".$each_mk->nm_mk.' ('.$each_mk->kode_mk.') '.($no_mk+1).'/'.$total_mk.' Prodi '.$each_mk->nm_lemb;
            $cari_mk = DB::table('pdrd.matkul')->where('id_mk',$each_mk->id_mk)->first();
            if (is_null($cari_mk)) {
                $input_mk = (array) $each_mk;
                $input_mk['last_update'] = date('Y-m-d H:i:s', strtotime($input_mk['last_update']));
                $input_mk['last_sync'] = date('Y-m-d H:i:s', strtotime($input_mk['last_sync']));
                unset($input_mk['nm_lemb']);
                $mk = new Matkul();
                $mk->fill($input_mk)->save();
            } else {
                if (strtotime($each_mk->last_update)>strtotime($cari_mk->last_update)) {
                    $input_mk = (array) $each_mk;
                    unset($input_mk['id_mk']);
                    unset($input_mk['nm_lemb']);
                    $input_mk['last_update'] = date('Y-m-d H:i:s', strtotime($input_mk['last_update']));
                    $input_mk['last_sync'] = date('Y-m-d H:i:s', strtotime($input_mk['last_sync']));
                    $mk = Matkul::find($cari_mk->id_mk);
                    $mk->fill($input_mk)->save();
                }
            }
            $kelas = \DB::connection('pgsql_sister')->table('pdrd.kelas_kuliah')->where('soft_delete',0)
                ->select([
                    'id_kls',
                    'id_sms',
                    'id_mk',
                    'id_smt',
                    'nm_kls',
                    'sks_mk',
                    'sks_tm',
                    'sks_prak',
                    'sks_prak_lap',
                    'sks_sim',
                    'bahasan_case',
                    'a_selenggara_pditt',
                    'a_pengguna_pditt',
                    'kuota_pditt',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_mk',$each_mk->id_mk)
                ->orderBy('id_smt')->get();
            if (count($kelas)>0) {
                foreach ($kelas AS $each_kelas) {
                    echo " ".$each_kelas->id_smt;
                    $cari_kelas = DB::table('pdrd.kelas_kuliah')->where('id_kls',$each_kelas->id_kls)->first();
                    if (is_null($cari_kelas)) {
                        $input_kelas = (array) $each_kelas;
                        $input_kelas['last_update'] = date('Y-m-d H:i:s', strtotime($input_kelas['last_update']));
                        $input_kelas['last_sync'] = date('Y-m-d H:i:s', strtotime($input_kelas['last_sync']));
                        $kelas = new KelasKuliah();
                        $kelas->fill($input_kelas)->save();
                    } else {
                        if (strtotime($each_kelas->last_update)>strtotime($cari_kelas->last_update)) {
                            $input_kelas = (array) $each_kelas;
                            unset($input_kelas['id_kls']);
                            $input_kelas['last_update'] = date('Y-m-d H:i:s', strtotime($input_kelas['last_update']));
                            $input_kelas['last_sync'] = date('Y-m-d H:i:s', strtotime($input_kelas['last_sync']));
                            $kelas = KelasKuliah::find($cari_kelas->id_kls);
                            $kelas->fill($input_kelas)->save();
                        }
                        $akt_ajar = \DB::connection('pgsql_sister')->table('pdrd.akt_ajar_dosen AS akt')
                            ->join('pdrd.reg_ptk AS tr','tr.id_reg_ptk','=','akt.id_reg_ptk')
                            ->where('tr.id_sp','e2b705a7-173e-464a-9fac-509128709515')
                            ->where('akt.id_kls',$each_kelas->id_kls)
                            ->where('akt.soft_delete',0)
                            ->select([
                                'akt.id_ajar',
                                'akt.id_reg_ptk',
                                'akt.id_subst',
                                'akt.id_katgiat',
                                'akt.id_jns_eval',
                                'akt.id_kls',
                                'akt.sks_subst_tot',
                                'akt.sks_tm_subst',
                                'akt.sks_prak_subst',
                                'akt.sks_prak_lap_subst',
                                'akt.sks_sim_subst',
                                'akt.jml_tm_renc',
                                'akt.jml_tm_real',
                                'akt.jml_mhs',
                                'akt.tgl_create AS create_date',
                                'akt.id_updater AS id_creator',
                                'akt.last_update',
                                'akt.id_updater',
                                'akt.soft_delete',
                                'akt.last_sync'
                            ])
                            ->get();
                        if (count($akt_ajar)>0) {
                            foreach ($akt_ajar AS $each_akt) {
                                $cari_akt = DB::table('pdrd.akt_ajar_dosen')->where('id_ajar',$each_akt->id_ajar)->first();
                                if (is_null($cari_akt)) {
                                    $input_akt = (array) $each_akt;
                                    $input_akt['last_update'] = date('Y-m-d H:i:s', strtotime($input_akt['last_update']));
                                    $input_akt['last_sync'] = date('Y-m-d H:i:s', strtotime($input_akt['last_sync']));
                                    $akt = new AktAjarDosen();
                                    $akt->fill($input_akt)->save();
                                    echo "(Tambah)";
                                } else {
                                    if (strtotime($each_akt->last_update)>strtotime($cari_akt->last_update)) {
                                        $input_akt = (array) $each_akt;
                                        $input_akt['last_update'] = date('Y-m-d H:i:s', strtotime($input_akt['last_update']));
                                        $input_akt['last_sync'] = date('Y-m-d H:i:s', strtotime($input_akt['last_sync']));
                                        unset($input_akt['id_ajar']);
                                        $akt = AktAjarDosen::find($cari_akt->id_ajar);
                                        $akt->fill($input_akt)->save();
                                        echo "(Update)";
                                    } else {
                                        echo "(Lewati)";
                                    }
                                }
                            }
                        }
                    }
                }
                echo " - OK\n";
            } else {
                echo " - Lewati\n";
            }
        }
    }
}
