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
        $sdm_collect_id = Sdm::where('soft_delete',0)->pluck('id_sdm')->toArray();
        $data_dosen_sister = \DB::connection('pgsql_sister')->SELECT("
            SELECT tsdm.id_sdm FROM pdrd.sdm AS tsdm
            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_sp='e2b705a7-173e-464a-9fac-509128709515'
            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk AND ta.soft_delete=0
                AND ta.id_thn_ajaran=2022
            GROUP BY tsdm.id_sdm
        ");

       // pengajaran
    //    $dosen_sister_ajar = \DB::connection('pgsql_sister')->SELECT("
    //        SELECT tsdm.id_sdm, tr.id_reg_ptk FROM pdrd.sdm AS tsdm
    //        JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
    //            AND tr.id_sp='e2b705a7-173e-464a-9fac-509128709515'
    //        JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk = tr.id_reg_ptk AND ta.soft_delete=0
    //            AND ta.id_thn_ajaran=2021
    //        WHERE tsdm.soft_delete=0
    //        GROUP BY tsdm.id_sdm, tr.id_reg_ptk
    //    ");
    //    foreach ($dosen_sister_ajar AS $each_dosen_ajar_sister) {
    //        $ajar_sister = \DB::connection('pgsql_sister')->table('pdrd.akt_ajar_dosen')
    //            ->select([
    //                'id_ajar',
    //                'id_reg_ptk',
    //                'id_subst',
    //                'id_katgiat',
    //                'id_jns_eval',
    //                'id_kls',
    //                'sks_subst_tot',
    //                'sks_tm_subst',
    //                'sks_prak_subst',
    //                'sks_prak_lap_subst',
    //                'sks_sim_subst',
    //                'jml_tm_renc',
    //                'jml_tm_real',
    //                'jml_mhs',
    //                'tgl_create AS create_date',
    //                'id_updater AS id_creator',
    //                'last_update',
    //                'id_updater',
    //                'soft_delete',
    //                'last_sync'
    //            ])
    //            ->where('id_reg_ptk',$each_dosen_ajar_sister->id_reg_ptk)->get();
    //        if (count($ajar_sister)) {
    //            foreach ($ajar_sister AS $each_sister_ajar_dosen) {
    //                $cari_kelas = KelasKuliah::find($each_sister_ajar_dosen->id_kls);
    //                if (!is_null($cari_kelas)) {
    //                    $cari_ajar = AktAjarDosen::find($each_sister_ajar_dosen->id_ajar);
    //                    if (is_null($cari_ajar)) {
    //                         $input_ajar_dosen = (array) $each_sister_ajar_dosen;
    //                         $input_ajar_dosen['last_sync']  = currDateTime();
    //                         $pengajaran = new AktAjarDosen();
    //                         $pengajaran->fill($input_ajar_dosen)->save();
    //                    }
    //                }
    //            }
    //        }
    //    }

       //litabmas
       $cari_litabmas = \DB::connection('pgsql_sister')->table('pdrd.litabmas')
        ->select([
            'id_litabmas',
            'id_lemb_iptek',
            'judul_litabmas',
            'lama_kegiatan',
            'thn_laks_ke',
            'dana_dikti',
            'dana_pt',
            'dana_institusi_lain',
            'in_kind',
            'stat_aktif',
            'jns_litabmas',
            'sk_tugas',
            'tgl_sk_tugas',
            'lokasi_kegiatan',
            'id_skim',
            'id_thn_usulan',
            'id_thn_kegiatan',
            'id_thn_laks',
            'id_lanjutan_litabmas',
            'id_kel_bidang',
            'id_tse',
            'id_smi',
            'id_jns_lit',
            'tgl_create AS create_date',
            'id_updater AS id_creator',
            'last_update',
            'id_updater',
            'soft_delete',
            'last_sync'
        ])->get();
        $total_litabmas = count($cari_litabmas);
        foreach ($cari_litabmas AS $urutan_litabmas=>$each_litabmas_sister) {
            echo "Litabmas ".($urutan_litabmas+1)." dari ".$total_litabmas." id:".$each_litabmas_sister->id_litabmas;
            $cari_sdm_anggota_litabmas_sister = \DB::connection('pgsql_sister')->table('pdrd.sdm_anggota_litabmas')
                ->select([
                    'id_litabmas',
                    'id_sdm',
                    'id_katgiat',
                    'peran_litabmas',
                    'stat_aktif',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_litabmas',$each_litabmas_sister->id_litabmas)
                ->whereIn('id_sdm',$sdm_collect_id)->get();
            if (count($cari_sdm_anggota_litabmas_sister)>0) {
                $cari_pub_od = Publikasi::find($each_litabmas_sister->id_publikasi);
                if (is_null($cari_pub_od)) {
                    $input_pub = (array) $each_litabmas_sister;
                    $input_pub['tgl_terbit']    = date('Y-m-d',strtotime($each_pub_sister['tgl_terbit']));
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

        // publikasi
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
                    $input_pub['tgl_terbit']    = date('Y-m-d',strtotime($each_pub_sister['tgl_terbit']));
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
