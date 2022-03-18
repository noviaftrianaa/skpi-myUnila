<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AktAjarDosen;
use App\Models\PDUT\Pdrd\KeaktifanPtk;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\RegPtk;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Pdrd\TulisPub;
use Illuminate\Database\Seeder;

class PublikasiDanPatenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data_dosen_sister = \DB::connection('pgsql_sister')->SELECT("
            SELECT tsdm.id_sdm FROM pdrd.sdm AS tsdm
            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_sp='e2b705a7-173e-464a-9fac-509128709515'
            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk AND ta.soft_delete=0
                AND ta.id_thn_ajaran=2021
            -- WHERE tsdm.soft_delete=0
            GROUP BY tsdm.id_sdm
        ");
//        $total = count($data_dosen_sister);
//        foreach ($data_dosen_sister AS $urutan => $each_data_dosen_sister) {
//            echo "Proses ".($urutan+1)." dari ".$total;
//            $cari = Sdm::find($each_data_dosen_sister->id_sdm);
//            if (is_null($cari)) {
//                echo " simpan baru id: ".$each_data_dosen_sister->id_sdm;
//                $cari_sdm = \DB::connection('pgsql_sister')->table('pdrd.sdm')
//                    ->where('id_sdm',$each_data_dosen_sister->id_sdm)
//                    ->first();
//                $input = (array) $cari_sdm;
//                $input['create_date'] = $cari_sdm->tgl_create;
//                $input['id_creator'] = $cari_sdm->id_updater;
//                unset($input['nm_ibu_kandung']);
//                unset($input['id_blob']);
//                unset($input['id_pangkat_gol']);
//                unset($input['csf']);
//                unset($input['tgl_create']);
//                $sdm = new Sdm();
//                $sdm->fill($input)->save();
//
//                $reg_sister = \DB::connection('pgsql_sister')->table('pdrd.reg_ptk')
//                    ->where('id_sdm',$each_data_dosen_sister->id_sdm)
//                    ->where('id_sp','e2b705a7-173e-464a-9fac-509128709515')
//                    ->select([
//                        'id_reg_ptk',
//                        'id_jns_keluar',
//                        'id_sdm',
//                        'id_sp',
//                        'id_stat_pegawai',
//                        'id_ikatan_kerja',
//                        'id_sms',
//                        'no_srt_tgs',
//                        'tgl_srt_tgs',
//                        'tmt_srt_tgs',
//                        'tgl_ptk_keluar',
//                        'nidn',
//                        'tgl_create AS create_date',
//                        'id_updater AS id_creator',
//                        'last_update',
//                        'id_updater',
//                        'soft_delete',
//                        'last_sync'
//                    ])
//                    ->get();
//                foreach ($reg_sister AS $each_reg_sister) {
//                    $cari_sms = Sms::find($each_reg_sister->id_sms);
//                    if (is_null($cari_sms)) {
//                        $prodi = \DB::connection('pgsql_sister')->table('pdrd.sms')
//                            ->select([
//                                'id_sms',
//                                'nm_lemb',
//                                'kd_kl',
//                                'kd_satker',
//                                'smt_mulai',
//                                'a_selenggara_subst',
//                                'kode_prodi',
//                                'nm_prodi_english',
//                                'jln',
//                                'rt',
//                                'rw',
//                                'nm_dsn',
//                                'ds_kel',
//                                'kode_pos',
//                                'lintang',
//                                'bujur',
//                                'no_tel',
//                                'no_fax',
//                                'email',
//                                'website',
//                                'singkatan',
//                                'tgl_berdiri',
//                                'sk_selenggara',
//                                'tgl_sk_selenggara',
//                                'tmt_sk_selenggara',
//                                'tst_sk_selenggara',
//                                'kpst_pd',
//                                'sks_lulus',
//                                'gelar_lulusan',
//                                'stat_prodi',
//                                'polesei_nilai',
//                                'a_kependidikan',
//                                'sistem_ajar',
//                                'a_pjj',
//                                'a_psdku',
//                                'luas_lab',
//                                'kapasitas_prak_satu_shift',
//                                'jml_mhs_pengguna',
//                                'jml_jam_penggunaan',
//                                'jml_prodi_pengguna',
//                                'jml_modul_prak_sendiri',
//                                'jml_modul_prak_lain',
//                                'fungsi_selain_prak',
//                                'penggunaan_lab',
//                                \DB::RAW('0 AS a_pkl'),
//                                'id_sp',
//                                'id_jenj_didik',
//                                'id_jns_sms',
//                                'id_fungsi_lab',
//                                'id_kel_usaha',
//                                'id_blob',
//                                'id_wil',
//                                'id_jur',
//                                'id_induk_sms',
//                                'tgl_create AS create_date',
//                                'id_updater AS id_creator',
//                                'last_update',
//                                'id_updater',
//                                'soft_delete',
//                                'last_sync'
//                            ])->where('id_sms',$each_reg_sister->id_sms)
//                            ->first();
//                        $prodi_baru_lama = (array) $prodi;
//                        $simpan_prodi = new Sms();
//                        $simpan_prodi->fill($prodi_baru_lama)->save();
//                    }
//                    $input_reg = (array) $each_reg_sister;
//                    $reg_ptk = new RegPtk();
//                    $reg_ptk->fill($input_reg)->save();
//
//                    $keaktifan_sister = \DB::connection('pgsql_sister')->table('pdrd.keaktifan_ptk')
//                        ->select([
//                            'id_reg_ptk',
//                            'id_thn_ajaran',
//                            'a_sp_homebase',
//                            'a_aktif_bln_1',
//                            'a_aktif_bln_2',
//                            'a_aktif_bln_3',
//                            'a_aktif_bln_4',
//                            'a_aktif_bln_5',
//                            'a_aktif_bln_6',
//                            'a_aktif_bln_7',
//                            'a_aktif_bln_8',
//                            'a_aktif_bln_9',
//                            'a_aktif_bln_10',
//                            'a_aktif_bln_11',
//                            'a_aktif_bln_12',
//                            'tgl_create AS create_date',
//                            'id_updater AS id_creator',
//                            'last_update',
//                            'id_updater',
//                            'soft_delete',
//                            'last_sync'
//                        ])->where('id_reg_ptk',$each_reg_sister->id_reg_ptk)
//                        ->get();
//                    foreach ($keaktifan_sister AS $each_keaktifan_sister)
//                    {
//                        $input_keaktifan = (array) $each_keaktifan_sister;
//                        $keaktifan = new KeaktifanPtk();
//                        $keaktifan->fill($input_keaktifan)->save();
//                    }
//                }
//                echo " (OK)\n";
//            } else {
//                echo " lewati\n";
//            }
//        }
//
//        // pengajaran
//        $dosen_sister_ajar = \DB::connection('pgsql_sister')->SELECT("
//            SELECT tsdm.id_sdm, tr.id_reg_ptk FROM pdrd.sdm AS tsdm
//            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
//                AND tr.id_sp='e2b705a7-173e-464a-9fac-509128709515'
//            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk AND ta.soft_delete=0
//                AND ta.id_thn_ajaran=2021
//            WHERE tsdm.soft_delete=0
//            GROUP BY tsdm.id_sdm, tr.id_reg_ptk
//        ");
//        foreach ($dosen_sister_ajar AS $each_dosen_ajar_sister) {
//            $ajar_sister = \DB::connection('pgsql_sister')->table('pdrd.akt_ajar_dosen')
//                ->select([
//                    'id_ajar',
//                    'id_reg_ptk',
//                    'id_subst',
//                    'id_katgiat',
//                    'id_jns_eval',
//                    'id_kls',
//                    'sks_subst_tot',
//                    'sks_tm_subst',
//                    'sks_prak_subst',
//                    'sks_prak_lap_subst',
//                    'sks_sim_subst',
//                    'jml_tm_renc',
//                    'jml_tm_real',
//                    'jml_mhs',
//                    'tgl_create AS create_date',
//                    'id_updater AS id_creator',
//                    'last_update',
//                    'id_updater',
//                    'soft_delete',
//                    'last_sync'
//                ])
//                ->where('id_reg_ptk',$each_dosen_ajar_sister->id_reg_ptk)->get();
//            if (count($ajar_sister)) {
//                foreach ($ajar_sister AS $each_sister_ajar_dosen) {
//                    $cari_kelas = KelasKuliah::find($each_sister_ajar_dosen->id_kls);
//                    if (!is_null($cari_kelas)) {
//                        $cari_ajar = AktAjarDosen::find($each_sister_ajar_dosen->id_ajar);
//                        if (is_null($cari_ajar)) {
//                            $input_ajar_dosen = (array) $each_sister_ajar_dosen;
//                            $pengajaran = new AktAjarDosen();
//                            $pengajaran->fill($input_ajar_dosen)->save();
//                        }
//                    }
//                }
//            }
//        }

        // publikasi
        $sdm_collect_id = Sdm::where('soft_delete',0)->pluck('id_sdm')->toArray();
        $litabmas = Litabmas::where('soft_delete',0)->pluck('id_litabmas')->toArray();
        $cari_pub = \DB::connection('pgsql_sister')->table('pdrd.publikasi')
            ->select([
                'id_publikasi',
                'id_jns_pub',
                'judul',
                'judul_chapter',
                'judul_asli',
                'abstrak',
                'nama_jurnal',
                'laman_jurnal',
                'tgl_terbit',
                'edisi',
                'impact_jurnal',
                'vol',
                'no',
                'hal',
                'jml_hal',
                'penerbit',
                'kota',
                'a_seminar',
                'a_prosiding',
                'dimensi',
                'bahasa',
                'no_paten',
                'pemberi_paten',
                'doi',
                'isbn',
                'issn',
                'e_issn',
                'url',
                'ket',
                'pengguna_produk_jasa',
                'a_komersialisasi',
                'stat_impor_sinta',
                'quartile',
                'id_kat_capaian',
                'id_media_pub',
                'id_litabmas',
                'tgl_create AS create_date',
                'id_updater AS id_creator',
                'last_update',
                'id_updater',
                'soft_delete',
                'last_sync'
            ])
            ->where(function ($wp) use ($litabmas) {
                $wp->whereNull('id_litabmas')->orWhereIn('id_litabmas',$litabmas);
            })->get();
        $total_pub = count($cari_pub);
        foreach ($cari_pub AS $urutan_pub=>$each_pub_sister) {
            echo "Publikasi ".($urutan_pub+1)." dari ".$total_pub." id:".$each_pub_sister->id_publikasi;
            $cari_penulis_sister = \DB::connection('pgsql_sister')->table('pdrd.tulis_pub')
                ->select([
                    'id_tulis_pub',
                    'id_publikasi',
                    'id_sdm',
                    'id_katgiat',
                    'id_pd',
                    'id_orang',
                    'urutan',
                    'afiliasi',
                    'peran_tulis',
                    'jns_penulis',
                    'a_corr_author',
                    'nm_pd',
                    'nipd',
                    'id_afiliasi',
                    'jns_afiliasi',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_publikasi',$each_pub_sister->id_publikasi)
                ->whereIn('id_sdm',$sdm_collect_id)->get();
            if (count($cari_penulis_sister)>0) {
                $cari_pub_od = Publikasi::find($each_pub_sister->id_publikasi);
                if (is_null($cari_pub_od)) {
                    $input_pub = (array) $each_pub_sister;
                    if (!in_array($input_pub['soft_delete'],[0,1])) {
                        $input_pub['stat_impor_sinta']  = $input_pub['soft_delete'];
                        $input_pub['soft_delete']       = (in_array($input_pub['soft_delete'],[4,5])?1:0);
                    }
                    $publikasi = new Publikasi();
                    $publikasi->fill($input_pub)->save();
                }
                foreach ($cari_penulis_sister AS $each_penulis) {
                    $cari_tulis_od = TulisPub::find($each_penulis->id_tulis_pub);
                    if (is_null($cari_tulis_od)) {
                        $input_tulis = (array) $each_penulis;
                        $tulis_pub = new TulisPub();
                        $tulis_pub->fill($input_tulis)->save();
                    }
                }
            }
            echo " (OK)\n";
        }
    }
}
