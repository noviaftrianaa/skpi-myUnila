<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\KeaktifanPtk;
use App\Models\PDUT\Pdrd\RegPtk;
use App\Models\PDUT\Pdrd\RwyFungsional;
use App\Models\PDUT\Pdrd\RwyKepangkatan;
use App\Models\PDUT\Pdrd\RwyPekerjaan;
use App\Models\PDUT\Pdrd\RwyPendFormal;
use App\Models\PDUT\Pdrd\RwySertifikasi;
use App\Models\PDUT\Pdrd\Sdm;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Ref\IkatanKerjaSdm;
use App\Models\PDUT\Ref\LembagaSertifikasi;
use App\Models\PDUT\Ref\Semester;
use App\Models\PDUT\Ref\StatusKepegawaian;
use App\Models\PDUT\Ref\TahunAjaran;
use App\Models\PDUT\Ref\GelarAkademik;
use Illuminate\Database\Seeder;

class TarikSisterDosenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ini_set('memory_limit',-1);
        $waktu_sekarang = currDateTime();
        $tahun_ajaran = \DB::connection('pgsql_sister')->table('ref.tahun_ajaran')
            ->whereNull('expired_date')
            ->get();
        foreach ($tahun_ajaran AS $each_ta) {
            $cek_ta = TahunAjaran::find($each_ta->id_thn_ajaran);
            if (is_null($cek_ta)) {
                $input_ta = (array) $each_ta;
                unset($input_ta['csf']);
                $input_ta['last_update']   = $waktu_sekarang;
                $input_ta['last_sync']     = $waktu_sekarang;
                $simpan_ta = new TahunAjaran();
                $simpan_ta->fill($input_ta)->save();
                echo " (OK - tambah Tahun Ajaran)\n";
            } else {
                if ($each_ta->last_update>$cek_ta->last_update) {
                    $input_ta = (array) $each_ta;
                    unset($input_ta['csf']);
                    $input_ta['last_update']   = $waktu_sekarang;
                    $input_ta['last_sync']     = $waktu_sekarang;
                    $cek_ta->fill($input_ta)->save();
                    echo " (OK - tambah Tahun Ajaran)\n";
                }
            }
            $semester = \DB::connection('pgsql_sister')->table('ref.semester')
                ->whereNull('expired_date')->where('id_thn_ajaran',$each_ta->id_thn_ajaran)
                ->get();
            foreach ($semester AS $each_smt) {
                $cek_smt = Semester::find($each_smt->id_smt);
                if (is_null($cek_smt)) {
                    $input_smt = (array) $each_smt;
                    unset($input_smt['csf']);
                    $input_smt['last_update']   = $waktu_sekarang;
                    $input_smt['last_sync']     = $waktu_sekarang;
                    $simpan_smt = new Semester();
                    $simpan_smt->fill($input_smt)->save();
                    echo " (OK - tambah Semester)\n";
                } else {
                    if ($each_smt->last_update>$cek_smt->last_update) {
                        $input_smt = (array) $each_smt;
                        unset($input_smt['csf']);
                        $input_smt['last_update']   = $waktu_sekarang;
                        $input_smt['last_sync']     = $waktu_sekarang;
                        $cek_smt->fill($input_smt)->save();
                        echo " (OK - tambah Semester)\n";
                    }
                }
            }
        }
        $data_dosen_gelar = \DB::connection('pgsql_sister')->table('ref.gelar_akademik')
            ->whereNull('expired_date')
            ->get();
        foreach ($data_dosen_gelar AS $each_gelar) {
            $cek_gelar = GelarAkademik::find($each_gelar->id_gelar_akad);
            if (is_null($cek_gelar)) {
                $input_gelar = (array) $each_gelar;
                unset($input_gelar['csf']);
                $input_gelar['last_update']   = $waktu_sekarang;
                $input_gelar['last_sync']     = $waktu_sekarang;
                $simpan_gelar = new GelarAkademik();
                $simpan_gelar->fill($input_gelar)->save();
                echo " (OK - tambah Gelar)\n";
            } else {
                if ($each_gelar->last_update>$cek_gelar->last_update) {
                    $input_gelar = (array) $each_gelar;
                    unset($input_gelar['csf']);
                    $input_gelar['last_update']   = $waktu_sekarang;
                    $input_gelar['last_sync']     = $waktu_sekarang;
                    $cek_gelar->fill($input_gelar)->save();
                    echo " (OK - tambah Gelar)\n";
                }
            }
        }
        $data_lembaga_sertifikasi = \DB::connection('pgsql_sister')->table('ref.lembaga_sertifikasi')
            ->whereNull('expired_date')
            ->get();
        foreach ($data_lembaga_sertifikasi AS $each_lembaga_sert) {
            $cek_lembaga_sert = LembagaSertifikasi::find($each_lembaga_sert->id_lemb_sert);
            if (is_null($cek_lembaga_sert)) {
                $input_lembaga_sert = (array) $each_lembaga_sert;
                unset($input_lembaga_sert['csf']);
                $input_lembaga_sert['last_update']   = $waktu_sekarang;
                $input_lembaga_sert['last_sync']     = $waktu_sekarang;
                $simpan_lembaga_sert = new StatusKepegawaian();
                $simpan_lembaga_sert->fill($input_lembaga_sert)->save();
                echo " (OK - tambah Lembaga Sertifikasi)\n";
            } else {
                if ($each_lembaga_sert->last_update>$cek_lembaga_sert->last_update) {
                    $input_lembaga_sert = (array) $each_lembaga_sert;
                    unset($input_lembaga_sert['csf']);
                    $input_lembaga_sert['last_update']   = $waktu_sekarang;
                    $input_lembaga_sert['last_sync']     = $waktu_sekarang;
                    $cek_lembaga_sert->fill($input_lembaga_sert)->save();
                    echo " (OK - tambah Lembaga Sertifikasi)\n";
                }
            }
        }
        $data_dosen_status_kepegawaian = \DB::connection('pgsql_sister')->table('ref.status_kepegawaian')
            ->whereNull('expired_date')
            ->get();
        foreach ($data_dosen_status_kepegawaian AS $each_status_kepegawaian) {
            $cek_status_kepegawaian = StatusKepegawaian::find($each_status_kepegawaian->id_stat_pegawai);
            if (is_null($cek_status_kepegawaian)) {
                $input_status_kepegawaian = (array) $each_status_kepegawaian;
                unset($input_status_kepegawaian['ket_stat_pegawai']);
                unset($input_status_kepegawaian['a_ptk_dikti']);
                unset($input_status_kepegawaian['csf']);
                $input_status_kepegawaian['last_update']   = $waktu_sekarang;
                $input_status_kepegawaian['last_sync']     = $waktu_sekarang;
                $simpan_status_kepegawaian = new StatusKepegawaian();
                $simpan_status_kepegawaian->fill($input_status_kepegawaian)->save();
                echo " (OK - tambah Status Kepegawaian)\n";
            } else {
                if ($each_status_kepegawaian->last_update>$cek_status_kepegawaian->last_update) {
                    $input_status_kepegawaian = (array) $each_status_kepegawaian;
                    unset($input_status_kepegawaian['csf']);
                    unset($input_status_kepegawaian['ket_stat_pegawai']);
                    unset($input_status_kepegawaian['a_ptk_dikti']);
                    $input_status_kepegawaian['last_update']   = $waktu_sekarang;
                    $input_status_kepegawaian['last_sync']     = $waktu_sekarang;
                    $cek_status_kepegawaian->fill($input_status_kepegawaian)->save();
                    echo " (OK - tambah Status Kepegawaian)\n";
                }
            }
        }
        $data_dosen_ikatan_kerja = \DB::connection('pgsql_sister')->table('ref.ikatan_kerja_sdm')
            ->whereNull('expired_date')
            ->get();
        foreach ($data_dosen_ikatan_kerja AS $each_ikatan_kerja) {
            $cek_ikatan_kerja = IkatanKerjaSdm::find($each_ikatan_kerja->id_ikatan_kerja);
            if (is_null($cek_ikatan_kerja)) {
                $input_ikatan_kerja = (array) $each_ikatan_kerja;
                unset($input_ikatan_kerja['csf']);
                $input_ikatan_kerja['a_ref_pddikti'] = 1;
                $input_ikatan_kerja['last_update']   = $waktu_sekarang;
                $input_ikatan_kerja['last_sync']     = $waktu_sekarang;
                $simpan_ikatan_kerja = new StatusKepegawaian();
                $simpan_ikatan_kerja->fill($input_ikatan_kerja)->save();
                echo " (OK - tambah Ikatan Kerja SDM)\n";
            } else {
                if ($each_ikatan_kerja->last_update>$cek_ikatan_kerja->last_update) {
                    $input_ikatan_kerja = (array) $each_ikatan_kerja;
                    unset($input_ikatan_kerja['csf']);
                    $input_ikatan_kerja['a_ref_pddikti'] = 1;
                    $input_ikatan_kerja['last_update']   = $waktu_sekarang;
                    $input_ikatan_kerja['last_sync']     = $waktu_sekarang;
                    $cek_ikatan_kerja->fill($input_ikatan_kerja)->save();
                    echo " (OK - tambah Ikatan Kerja SDM)\n";
                }
            }
        }
        $data_dosen_sister = \DB::connection('pgsql_sister')->table('pdrd.sdm AS tsdm')
            ->join('pdrd.reg_ptk AS tr','tr.id_sdm','=','tsdm.id_sdm')
            ->where('tr.id_sp',strtolower(env('app_id_sp')))
            ->where('tsdm.id_jns_sdm',12)->where('tsdm.soft_delete',0)
            ->get();
        $total_dosen_pdut = count($data_dosen_sister);
        foreach ($data_dosen_sister AS $no=>$each_dosen_sister) {
            echo "Memulai sdm:".$each_dosen_sister->id_sdm." ".($no+1)." dari ".$total_dosen_pdut."\n";
            $cari_sdm = \DB::connection('pgsql_sister')->table('pdrd.sdm')
                ->select([
                    'id_sdm',
                    'nm_sdm',
                    'jk',
                    'tmpt_lahir',
                    'tgl_lahir',
                    'nik',
                    'niy_nigk',
                    'nuptk',
                    'nidn',
                    'nsdmi',
                    'stat_kawin',
                    'jln',
                    'rt',
                    'rw',
                    'nm_dsn',
                    'ds_kel',
                    'kode_pos',
                    'no_tel_rmh',
                    'no_hp',
                    'email',
                    'nip',
                    'tmt_pns',
                    'nm_suami_istri',
                    'nip_suami_istri',
                    'sk_cpns',
                    'tgl_sk_cpns',
                    'sk_angkat',
                    'tmt_sk_angkat',
                    'npwp',
                    'nm_wp',
                    'stat_data',
                    'akta_ijin_ajar',
                    'nira',
                    'kewarganegaraan',
                    'id_jns_sdm',
                    'id_wil',
                    'id_stat_aktif',
                    'id_agama',
                    'id_keahlian_lab',
                    'id_pekerjaan_suami_istri',
                    'id_lemb_angkat',
                    'id_sumber_gaji',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)->first();
            echo "--- Proses SDM ";
            $cek_sdm_pdut = Sdm::find($each_dosen_sister->id_sdm);
            if (is_null($cek_sdm_pdut)) {
                $input_sdm = (array) $cari_sdm;
                $input_sdm['last_update']   = $waktu_sekarang;
                $input_sdm['last_sync']     = $waktu_sekarang;
                $simpan_sdm = new Sdm();
                $simpan_sdm->fill($input_sdm)->save();
                echo " (OK - tambah)\n";
            } else {
                if ($cari_sdm->last_update>$cek_sdm_pdut->last_update) {
                    $input_sdm = (array) $cari_sdm;
                    $input_sdm['last_update']   = $waktu_sekarang;
                    $input_sdm['last_sync']     = $waktu_sekarang;
                    $simpan_sdm = Sdm::find($each_dosen_sister->id_sdm);
                    $simpan_sdm->fill($input_sdm)->save();
                    echo " (OK - update)\n";
                } else {
                    echo " (Tidak berubah)\n";
                }
            }
            $cari_reg = \DB::connection('pgsql_sister')->table('pdrd.reg_ptk')
                ->select([
                    'id_reg_ptk',
                    'id_jns_keluar',
                    'id_sdm',
                    'id_sp',
                    'id_stat_pegawai',
                    'id_ikatan_kerja',
                    'id_sms',
                    'no_srt_tgs',
                    'tgl_srt_tgs',
                    'tmt_srt_tgs',
                    'tgl_ptk_keluar',
                    'nidn',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)
                ->where('id_sp',strtolower(env('APP_ID_SP')))->get();
            if (count($cari_reg)>0) {
                $total_dosen_reg = count($cari_reg);
                foreach ($cari_reg AS $no_reg=>$each_cari_reg) {
                    echo "--- Proses Register ".($no_reg+1)." dari ".$total_dosen_reg;
                    $cek_reg_pdut = RegPtk::find($each_cari_reg->id_reg_ptk);
                    if(!is_null($each_cari_reg->id_sms)) {
                        $cari_sms = Sms::find($each_cari_reg->id_sms);
                        if (is_null($cari_sms)) {
                            $prodi = \DB::connection('pgsql_sister')->table('pdrd.sms')
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
                                ])->where('id_sms',$each_cari_reg->id_sms)
                                ->first();
                            if (!is_null($prodi->id_induk_sms)) {
                                $cek_induk = Sms::find($prodi->id_induk_sms);
                                if (is_null($cek_induk)) {
                                    $induk = \DB::connection('pgsql_sister')->table('pdrd.sms')
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
                                        ])->where('id_sms',$prodi->id_induk_sms)
                                        ->first();
                                }
                                $prodi_induk_lama = (array) $induk;
                                $simpan_prodi_induk = new Sms();
                                $simpan_prodi_induk->fill($prodi_induk_lama)->save();
                            }
                        }
                    }

                    if (is_null($cek_reg_pdut)) {
                        $input_reg = (array) $each_cari_reg;
                        $input_reg['last_update']   = $waktu_sekarang;
                        $input_reg['last_sync']     = $waktu_sekarang;
                        $simpan_reg = new RegPtk();
                        $simpan_reg->fill($input_reg)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_reg->last_update>$cek_reg_pdut->last_update) {
                            $input_reg = (array) $each_cari_reg;
                            $input_reg['last_update'] = $waktu_sekarang;
                            $input_reg['last_sync'] = $waktu_sekarang;
                            $simpan_reg = RegPtk::find($each_cari_reg->id_reg_ptk);
                            $simpan_reg->fill($input_reg)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }

                    $cari_keaktifan = \DB::connection('pgsql_sister')->table('pdrd.keaktifan_ptk')
                        ->select([
                            'id_reg_ptk',
                            'id_thn_ajaran',
                            'a_sp_homebase',
                            'a_aktif_bln_1',
                            'a_aktif_bln_2',
                            'a_aktif_bln_3',
                            'a_aktif_bln_4',
                            'a_aktif_bln_5',
                            'a_aktif_bln_6',
                            'a_aktif_bln_7',
                            'a_aktif_bln_8',
                            'a_aktif_bln_9',
                            'a_aktif_bln_10',
                            'a_aktif_bln_11',
                            'a_aktif_bln_12',
                            'tgl_create AS create_date',
                            'id_updater AS id_creator',
                            'last_update',
                            'id_updater',
                            'soft_delete',
                            'last_sync'
                        ])->where('id_reg_ptk',$each_cari_reg->id_reg_ptk)->get();
                    if (count($cari_keaktifan)>0) {
                        $total_dosen_keaktifan = count($cari_keaktifan);
                        foreach ($cari_keaktifan as $no_keaktifan => $each_cari_keaktifan) {
                            echo "------ Proses Keaktifan Register " . ($no_keaktifan + 1) . " dari " . $total_dosen_keaktifan;
                            $cek_keaktifan_pdut = KeaktifanPtk::where('id_reg_ptk',$each_cari_keaktifan->id_reg_ptk)->where('id_thn_ajaran',$each_cari_keaktifan->id_thn_ajaran)->first();
                            if (is_null($cek_keaktifan_pdut)) {
                                $input_keaktifan = (array)$each_cari_keaktifan;
                                $input_keaktifan['last_update'] = $waktu_sekarang;
                                $input_keaktifan['last_sync'] = $waktu_sekarang;
                                $simpan_keaktifan = new KeaktifanPtk();
                                $simpan_keaktifan->fill($input_keaktifan)->save();
                                echo " (OK - tambah)\n";
                            } else {
                                if ($each_cari_keaktifan->last_update > $cek_keaktifan_pdut->last_update) {
                                    $input_keaktifan = (array) $each_cari_keaktifan;
                                    $input_keaktifan['last_update'] = $waktu_sekarang;
                                    $input_keaktifan['last_sync'] = $waktu_sekarang;
                                    unset($input_keaktifan['id_reg_ptk']);
                                    unset($input_keaktifan['id_thn_ajaran']);
                                    $simpan_keaktifan = KeaktifanPtk::where('id_reg_ptk',$each_cari_keaktifan->id_reg_ptk)->where('id_thn_ajaran',$each_cari_keaktifan->id_thn_ajaran)->first();
                                    $simpan_keaktifan->fill($input_keaktifan)->save();
                                    echo " (OK - update)\n";
                                } else {
                                    echo " (Tidak berubah)\n";
                                }
                            }
                        }
                    } else {
                        echo " (Keaktifan Register tidak ditemukan)\n";
                    }
                }
            } else {
                echo " (Register tidak ditemukan)\n";
            }

            $cari_fungsional = \DB::connection('pgsql_sister')->table('pdrd.rwy_fungsional')
                ->select([
                    'id_rwy_jabfung',
                    'id_sdm',
                    'id_kel_bidang',
                    'id_jabfung',
                    'sk_jabfung',
                    'tmt_sk_jabfung',
                    'angka_kredit',
                    'lebih_ajar',
                    'lebih_lit',
                    'lebih_pengmas',
                    'lebih_tunjang',
                    'bidang_ilmu',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)->get();
            if (count($cari_fungsional)>0) {
                $total_dosen_fungsional = count($cari_fungsional);
                foreach ($cari_fungsional as $no_fungsional => $each_cari_fungsional) {
                    echo "--- Proses Fungsional " . ($no_fungsional + 1) . " dari " . $total_dosen_fungsional;
                    $cek_fungsional_pdut = RwyFungsional::find($each_cari_fungsional->id_rwy_jabfung);
                    if (is_null($cek_fungsional_pdut)) {
                        $input_fungsional = (array)$each_cari_fungsional;
                        $input_fungsional['bidang_ilmu'] = null;
                        $input_fungsional['create_date'] = date('Y-m-d H:i:s',strtotime($each_cari_fungsional->create_date));
                        $input_fungsional['last_update'] = $waktu_sekarang;
                        $input_fungsional['last_sync'] = $waktu_sekarang;
                        $simpan_fungsional = new RwyFungsional();
                        $simpan_fungsional->fill($input_fungsional)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_fungsional->last_update > $cek_fungsional_pdut->last_update) {
                            $input_fungsional = (array) $each_cari_fungsional;
                            $input_fungsional['create_date'] = date('Y-m-d H:i:s',strtotime($each_cari_fungsional->create_date));
                            $input_fungsional['last_update'] = $waktu_sekarang;
                            $input_fungsional['last_sync'] = $waktu_sekarang;
                            $simpan_fungsional = RwyFungsional::find($each_cari_fungsional->id_rwy_jabfung);
                            $simpan_fungsional->fill($input_fungsional)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }
                }
            } else {
                echo " (Fungsional tidak ditemukan)\n";
            }

            $cari_kepangkatan = \DB::connection('pgsql_sister')->table('pdrd.rwy_kepangkatan')
                ->select([
                    'id_rwy_pangkat',
                    'id_sdm',
                    'id_pangkat_gol',
                    'sk_pangkat',
                    'tgl_sk_pangkat',
                    'tmt_sk_pangkat',
                    'masa_kerja_gol_thn',
                    'masa_kerja_gol_bln',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)->get();
            if (count($cari_kepangkatan)>0) {
                $total_dosen_kepangkatan = count($cari_kepangkatan);
                foreach ($cari_kepangkatan as $no_kepangkatan => $each_cari_kepangkatan) {
                    echo "--- Proses Kepangkatan " . ($no_kepangkatan + 1) . " dari " . $total_dosen_kepangkatan;
                    $cek_kepangkatan_pdut = RwyKepangkatan::find($each_cari_kepangkatan->id_rwy_pangkat);
                    if (is_null($cek_kepangkatan_pdut)) {
                        $input_kepangkatan = (array)$each_cari_kepangkatan;
                        $input_kepangkatan['last_update'] = $waktu_sekarang;
                        $input_kepangkatan['last_sync'] = $waktu_sekarang;
                        $simpan_kepangkatan = new RwyKepangkatan();
                        $simpan_kepangkatan->fill($input_kepangkatan)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_kepangkatan->last_update > $cek_kepangkatan_pdut->last_update) {
                            $input_kepangkatan = (array) $each_cari_kepangkatan;
                            $input_kepangkatan['last_update'] = $waktu_sekarang;
                            $input_kepangkatan['last_sync'] = $waktu_sekarang;
                            $simpan_kepangkatan = RwyKepangkatan::find($each_cari_kepangkatan->id_rwy_pangkat);
                            $simpan_kepangkatan->fill($input_kepangkatan)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }
                }
            } else {
                echo " (Kepangkatan tidak ditemukan)\n";
            }

            $cari_pend_formal = \DB::connection('pgsql_sister')->table('pdrd.rwy_pend_formal')
                ->select([
                    'id_rwy_didik_formal',
                    'id_sms',
                    'id_katgiat',
                    'id_sdm',
                    'id_jenj_didik',
                    'id_bid_studi',
                    'id_gelar_akad',
                    'nm_sp_formal',
                    'fak',
                    'a_kependidikan',
                    'thn_masuk',
                    'thn_lulus',
                    'nipd',
                    'stat_kul',
                    'smt',
                    'sks_lulus',
                    'ipk',
                    'sk_setara',
                    'tgl_sk_setara',
                    'no_ijazah',
                    'judul_tesis',
                    'tgl_lulus',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)->get();
            if (count($cari_pend_formal)>0) {
                $total_dosen_pend_formal = count($cari_pend_formal);
                foreach ($cari_pend_formal as $no_pend_formal => $each_cari_pend_formal) {
                    echo "--- Proses Pendidikan Formal " . ($no_pend_formal + 1) . " dari " . $total_dosen_pend_formal;
                    $cek_pend_formal_pdut = RwyPendFormal::find($each_cari_pend_formal->id_rwy_didik_formal);
                    if (is_null($cek_pend_formal_pdut)) {
                        $input_pend_formal = (array)$each_cari_pend_formal;
                        $input_pend_formal['last_update'] = $waktu_sekarang;
                        $input_pend_formal['last_sync'] = $waktu_sekarang;
                        $simpan_pend_formal = new RwyPendFormal();
                        $simpan_pend_formal->fill($input_pend_formal)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_pend_formal->last_update > $cek_pend_formal_pdut->last_update) {
                            $input_pend_formal = (array) $each_cari_pend_formal;
                            $input_pend_formal['last_update'] = $waktu_sekarang;
                            $input_pend_formal['last_sync'] = $waktu_sekarang;
                            $simpan_pend_formal = RwyPendFormal::find($each_cari_pend_formal->id_rwy_didik_formal);
                            $simpan_pend_formal->fill($input_pend_formal)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }
                }
            } else {
                echo " (Pendidikan Formal tidak ditemukan)\n";
            }

            $cari_sert = \DB::connection('pgsql_sister')->table('pdrd.rwy_sertifikasi')
                ->select([
                    'id_rwy_sert',
                    'id_jns_sert',
                    'id_bid_studi',
                    'id_lemb_sert',
                    'tmt_sert',
                    'tst_sert',
                    'id_sdm',
                    'thn_sert',
                    'sk_sert',
                    'nrg',
                    'no_peserta',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_jns_sert','!=',5)
                ->where('id_sdm',$each_dosen_sister->id_sdm)->get();
            if (count($cari_sert)>0) {
                $total_dosen_sert = count($cari_sert);
                foreach ($cari_sert as $no_sert => $each_cari_sert) {
                    echo "--- Proses Sertifikasi " . ($no_sert + 1) . " dari " . $total_dosen_sert;
                    $cek_sert_pdut = RwySertifikasi::find($each_cari_sert->id_rwy_sert);
                    if (is_null($cek_sert_pdut)) {
                        $input_sert = (array)$each_cari_sert;
                        $input_sert['last_update'] = $waktu_sekarang;
                        $input_sert['last_sync'] = $waktu_sekarang;
                        $simpan_sert = new RwySertifikasi();
                        $simpan_sert->fill($input_sert)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_sert->last_update > $cek_sert_pdut->last_update) {
                            $input_sert = (array) $each_cari_sert;
                            $input_sert['last_update'] = $waktu_sekarang;
                            $input_sert['last_sync'] = $waktu_sekarang;
                            $simpan_sert = RwySertifikasi::find($each_cari_sert->id_rwy_sert);
                            $simpan_sert->fill($input_sert)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }
                }
            } else {
                echo " (Sertifikasi tidak ditemukan)\n";
            }

            $cari_kerja = \DB::connection('pgsql_sister')->table('pdrd.rwy_pekerjaan')
                ->select([
                    'id_rwy_kerja',
                    'id_sdm',
                    'id_dudi',
                    'id_pekerjaan',
                    'id_kbli',
                    'nm_jabatan',
                    'deskripsi_kerja',
                    'instansi',
                    'divisi',
                    'mulai_bekerja',
                    'selesai_bekerja',
                    'a_ln',
                    'tgl_create AS create_date',
                    'id_updater AS id_creator',
                    'last_update',
                    'id_updater',
                    'soft_delete',
                    'last_sync'
                ])
                ->where('id_sdm',$each_dosen_sister->id_sdm)->get();
            if (count($cari_kerja)>0) {
                $total_dosen_kerja = count($cari_kerja);
                foreach ($cari_kerja as $no_kerja => $each_cari_kerja) {
                    echo "--- Proses Sertifikasi " . ($no_kerja + 1) . " dari " . $total_dosen_kerja;
                    $cek_kerja_pdut = RwyPekerjaan::find($each_cari_kerja->id_rwy_kerja);
                    if (is_null($cek_kerja_pdut)) {
                        $input_kerja = (array)$each_cari_kerja;
                        $input_kerja['last_update'] = $waktu_sekarang;
                        $input_kerja['last_sync'] = $waktu_sekarang;
                        $simpan_kerja = new RwyPekerjaan();
                        $simpan_kerja->fill($input_kerja)->save();
                        echo " (OK - tambah)\n";
                    } else {
                        if ($each_cari_kerja->last_update > $cek_kerja_pdut->last_update) {
                            $input_kerja = (array) $each_cari_kerja;
                            $input_kerja['last_update'] = $waktu_sekarang;
                            $input_kerja['last_sync'] = $waktu_sekarang;
                            $simpan_kerja = RwyPekerjaan::find($each_cari_kerja->id_rwy_kerja);
                            $simpan_kerja->fill($input_kerja)->save();
                            echo " (OK - update)\n";
                        } else {
                            echo " (Tidak berubah)\n";
                        }
                    }
                }
            } else {
                echo " (Sertifikasi tidak ditemukan)\n";
            }
        }
    }
}
