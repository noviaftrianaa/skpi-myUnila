<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AktMhs;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\NilaiSmtMhs;
use App\Models\PDUT\Pdrd\ReMk;
use App\Models\PDUT\Pdrd\RencanaAjar;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Ref\JenisEvaluasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NeoFeederSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nomor_data=0;
        $id_creator = '443701e4-e814-48f3-9528-251bccee8af1';
        $prodi = DB::table('pdrd.sms')->where('soft_delete',0)->select('id_sms')->groupBy('id_sms')->pluck('id_sms')->toArray();
        $cari_token = DB::table('man_akses.access_token')->where(function ($token) {
            $token->where('waktu_create','>=',currDateTime())->where('waktu_expired','<=',currDateTime());
        })->first();
        $url = ENV('URL_WS_NEO_FEEDER');
        if (is_null($cari_token)) {
            $form_token = $this->data_get_token_form();
            $get_token = $this->curl_api_neo_feeder($url,$form_token);
            $token = $get_token['token'];
            DB::table('man_akses.access_token')->insert([
                'id_token'      => guid(),
                'waktu_create'  => currDateTime(),
                'waktu_expired' => config('mp.exp_data_row.waktu_expired_token'),
                'keterangan'    => 'Token Seeder Data Neo Feeder',
                'token_value'   => $token,
                'is_seq_uri'    => 0,
                'is_reg_user'   => 1,
                'base_url'      => $url
            ]);
        } else {
            $token = $cari_token->token_value;
        }

        $func = [
//            'substansi_kuliah',
//            'akt_mhs',
//            'ang_akt_mhs',
//            'konversi'
//            'kurikulum',
//            'mk_kurikulum',
//            'rencana_ajar',
//            'rencana_evaluasi',
            'nilai_kelas'
        ];

        // substansi kuliah
        if (in_array('substansi_kuliah',$func)) {
            $get_data_substansi_kuliah = $this->curl_api_neo_feeder($url, $this->data_form('GetListSubstansiKuliah',$token));
            $total_data_substansi_kuliah = count($get_data_substansi_kuliah);
            if ($total_data_substansi_kuliah>0) {
                foreach ($get_data_substansi_kuliah AS $no_substansi_kuliah=>$each_substansi_kuliah) {
                    echo 'Mendapatkan '.($no_substansi_kuliah+1).' dari '.$total_data_substansi_kuliah;
                    DB::table('pdrd.substansi_kuliah')->insert([
                        'id_subst'	    => $each_substansi_kuliah['id_substansi'],
                        'id_sms'	    => $each_substansi_kuliah['id_prodi'],
                        'id_jns_subst'	=> $each_substansi_kuliah['id_jenis_substansi'],
                        'nm_subst'	    => $each_substansi_kuliah['nama_substansi'],
                        'sks_mk'	    => $each_substansi_kuliah['sks_mata_kuliah'],
                        'sks_tm'	    => $each_substansi_kuliah['sks_tatap_muka'],
                        'sks_prak'	    => $each_substansi_kuliah['sks_praktek'],
                        'sks_prak_lap'	=> $each_substansi_kuliah['sks_praktek_lapangan'],
                        'sks_sim'	    => $each_substansi_kuliah['sks_simulasi'],
                        'create_date'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['tgl_create'])),
                        'id_creator'	=> $id_creator,
                        'last_update'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['last_update'])),
                        'id_updater'	=> $id_creator,
                        'soft_delete'	=> 0,
                        'last_sync'	    => currDateTime()
                    ]);
                    echo " (OK)\n";
                }
            }
        }

        // aktivitas mhs
        if (in_array('akt_mhs',$func)) {
            $get_data_akt_mhs = $this->curl_api_neo_feeder($url, $this->data_form('GetListAktivitasMahasiswa', $token));
            $total_data_akt_mhs = count($get_data_akt_mhs);
            if ($total_data_akt_mhs > 0) {
                foreach ($get_data_akt_mhs as $no_akt_mhs => $each_akt_mhs) {
                    echo 'Mendapatkan ' . ($no_akt_mhs + 1) . ' dari ' . $total_data_akt_mhs;
                    $cek_sms = Sms::find($each_akt_mhs['id_prodi']);
                    if (!is_null($cek_sms)) {
                        $cek_akt = DB::table('pdrd.akt_mhs')->where('id_akt_mhs',$each_akt_mhs['id_aktivitas'])->first();
                        if (is_null($cek_akt)) {
                            DB::table('pdrd.akt_mhs')->insert([
                                'id_akt_mhs'    => $each_akt_mhs['id_aktivitas'],
                                'id_jns_akt_mhs'=> $each_akt_mhs['id_jenis_aktivitas'],
                                'id_sms'        => $each_akt_mhs['id_prodi'],
                                'id_smt'        => $each_akt_mhs['id_semester'],
                                'judul_akt_mhs' => $each_akt_mhs['judul'],
                                'lokasi_kegiatan' => $each_akt_mhs['lokasi'],
                                'sk_tugas'      => $each_akt_mhs['sk_tugas'],
                                'tgl_sk_tugas'  => $each_akt_mhs['tanggal_sk_tugas'],
                                'ket_akt'       => $each_akt_mhs['keterangan'],
                                'a_komunal'     => $each_akt_mhs['untuk_kampus_merdeka'],
                                'create_date'   => currDateTime(),
                                'id_creator'    => $id_creator,
                                'last_update'   => currDateTime(),
                                'id_updater'    => $id_creator,
                                'soft_delete'   => 0,
                                'last_sync'     => currDateTime()
                            ]);
                            echo " (OK)\n";
                        } else {
                            echo " (SUDAH ADA)\n";
                        }

                        $get_data_ang_akt_mhs = $this->curl_api_neo_feeder($url, $this->data_form('GetListAnggotaAktivitasMahasiswa', $token,'id_aktivitas',$each_akt_mhs['id_aktivitas']));
                        $total_data_ang_akt_mhs = count($get_data_ang_akt_mhs);
                        if ($total_data_ang_akt_mhs > 0) {
                            foreach ($get_data_ang_akt_mhs AS $no_ang_akt_mhs => $each_data_ang_akt_mhs) {
                                $cek_ang_akt = DB::table('pdrd.anggota_akt_mhs')->where('id_ang_akt_mhs',$each_data_ang_akt_mhs['id_anggota'])->first();
                                if (is_null($cek_ang_akt)) {
                                    DB::table('pdrd.anggota_akt_mhs')->insert([
                                        'id_ang_akt_mhs'=> $each_data_ang_akt_mhs['id_anggota'],
                                        'id_akt_mhs'    => $each_data_ang_akt_mhs['id_aktivitas'],
                                        'id_reg_pd'     => $each_data_ang_akt_mhs['id_registrasi_mahasiswa'],
                                        'nm_pd'         => $each_data_ang_akt_mhs['nama_mahasiswa'],
                                        'nipd'          => $each_data_ang_akt_mhs['nim'],
                                        'jns_peran_mhs' => $each_data_ang_akt_mhs['jenis_peran'],
                                        'create_date'   => currDateTime(),
                                        'id_creator'    => $id_creator,
                                        'last_update'   => currDateTime(),
                                        'id_updater'    => $id_creator,
                                        'soft_delete'   => 0,
                                        'last_sync'     => currDateTime()
                                    ]);
                                }
                            }
                        }

                        $get_data_konversi_mbkm = $this->curl_api_neo_feeder($url, $this->data_form('GetListKonversiKampusMerdeka', $token,'id_aktivitas',$each_akt_mhs['id_aktivitas']));
                        $total_data_konversi_mbkm = count($get_data_konversi_mbkm);
                        if ($total_data_konversi_mbkm > 0) {
                            foreach ($get_data_konversi_mbkm AS $no_konversi_mbkm => $each_data_konversi_mbkm) {
                                $cek_konversi = DB::table('mbkm.konversi_kampus_merdeka')->where('id_konversi_aktivitas',$each_data_konversi_mbkm['id_konversi_aktivitas'])->first();
                                if (is_null($cek_konversi)) {
                                    DB::table('mbkm.konversi_kampus_merdeka')->insert([
                                        'id_konversi_aktivitas'=> $each_data_konversi_mbkm['id_konversi_aktivitas'],
                                        'id_mk'         => $each_data_konversi_mbkm['id_matkul'],
                                        'id_ang_akt_mhs'=> $each_data_konversi_mbkm['id_anggota'],
                                        'id_akt_mhs'    => $each_data_konversi_mbkm['id_aktivitas'],
//                                        'id_daftar_kampus_merdeka'          => $each_data_konversi_mbkm['nim'],
                                        'nilai_angka'   => $each_data_konversi_mbkm['nilai_angka'],
                                        'nilai_huruf'   => $each_data_konversi_mbkm['nilai_huruf'],
                                        'nilai_indeks'  => $each_data_konversi_mbkm['nilai_indeks'],
                                        'sks_mk'        => $each_data_konversi_mbkm['sks_mata_kuliah'],
                                        'create_date'   => currDateTime(),
                                        'id_creator'    => $id_creator,
                                        'last_update'   => currDateTime(),
                                        'id_updater'    => $id_creator,
                                        'soft_delete'   => 0,
                                        'last_sync'     => currDateTime()
                                    ]);
                                }
                            }
                        }
                    } else {
                        echo " (LEWATI)\n";
                    }
                }
            }
        }

        // anggota aktivitas mhs
        if (in_array('ang_akt_mhs',$func)) {
            $get_data_ang_akt_mhs = $this->curl_api_neo_feeder($url, $this->data_form('GetListAnggotaAktivitasMahasiswa', $token));
            $total_data_ang_akt_mhs = count($get_data_ang_akt_mhs);
            if ($total_data_ang_akt_mhs > 0) {
                foreach ($get_data_ang_akt_mhs AS $no_ang_akt_mhs => $each_data_ang_akt_mhs) {
                    echo 'Mendapatkan ' . ($no_ang_akt_mhs + 1) . ' dari ' . $total_data_ang_akt_mhs;
                    $cek_akt = AktMhs::find($each_data_ang_akt_mhs['id_aktivitas']);
                    if (!is_null($cek_akt)) {
                        $cek_ang_akt = DB::table('pdrd.anggota_akt_mhs')->where('id_ang_akt_mhs', $each_data_ang_akt_mhs['id_anggota'])->first();
                        if (is_null($cek_ang_akt)) {
                            DB::table('pdrd.anggota_akt_mhs')->insert([
                                'id_ang_akt_mhs' => $each_data_ang_akt_mhs['id_anggota'],
                                'id_akt_mhs' => $each_data_ang_akt_mhs['id_aktivitas'],
                                'id_reg_pd' => $each_data_ang_akt_mhs['id_registrasi_mahasiswa'],
                                'nm_pd' => $each_data_ang_akt_mhs['nama_mahasiswa'],
                                'nipd' => $each_data_ang_akt_mhs['nim'],
                                'jns_peran_mhs' => $each_data_ang_akt_mhs['jenis_peran'],
                                'create_date' => currDateTime(),
                                'id_creator' => $id_creator,
                                'last_update' => currDateTime(),
                                'id_updater' => $id_creator,
                                'soft_delete' => 0,
                                'last_sync' => currDateTime()
                            ]);
                            echo " (OK)\n";
                        } else {
                            echo " (SUDAH ADA)\n";
                        }
                    } else {
                        echo " (LEWATI)\n";
                    }
                }
            }
        }

        // list konversi
        if (in_array('konversi',$func)) {
            $get_data_konversi_mbkm = $this->curl_api_neo_feeder($url, $this->data_form('GetListKonversiKampusMerdeka', $token));
            $total_data_konversi_mbkm = count($get_data_konversi_mbkm);
            if ($total_data_konversi_mbkm > 0) {
                foreach ($get_data_konversi_mbkm as $no_konversi_mbkm => $each_data_konversi_mbkm) {
                    echo 'Mendapatkan ' . ($no_konversi_mbkm + 1) . ' dari ' . $total_data_konversi_mbkm;
                    $cek_konversi = DB::table('mbkm.konversi_kampus_merdeka')->where('id_konversi_aktivitas',$each_data_konversi_mbkm['id_konversi_aktivitas'])->first();
                    if (is_null($cek_konversi)) {
                        DB::table('mbkm.konversi_kampus_merdeka')->insert([
                            'id_konversi_aktivitas'=> $each_data_konversi_mbkm['id_konversi_aktivitas'],
                            'id_mk'         => $each_data_konversi_mbkm['id_matkul'],
                            'id_ang_akt_mhs'=> $each_data_konversi_mbkm['id_anggota'],
                            'id_akt_mhs'    => $each_data_konversi_mbkm['id_aktivitas'],
//                                        'id_daftar_kampus_merdeka'          => $each_data_konversi_mbkm['nim'],
                            'nilai_angka'   => $each_data_konversi_mbkm['nilai_angka'],
                            'nilai_huruf'   => $each_data_konversi_mbkm['nilai_huruf'],
                            'nilai_indeks'  => $each_data_konversi_mbkm['nilai_indeks'],
                            'sks_mk'        => $each_data_konversi_mbkm['sks_mata_kuliah'],
                            'create_date'   => currDateTime(),
                            'id_creator'    => $id_creator,
                            'last_update'   => currDateTime(),
                            'id_updater'    => $id_creator,
                            'soft_delete'   => 0,
                            'last_sync'     => currDateTime()
                        ]);
                        echo " (OK)\n";
                    } else {
                        echo " (SUDAH ADA)\n";
                    }
                }
            }
        }

        // Kurikulum
        if (in_array('kurikulum',$func)) {
            $get_data_kurikulum_sp = $this->curl_api_neo_feeder($url, $this->data_form('GetListKurikulum',$token));
            $total_data_kurikulum_sp = count($get_data_kurikulum_sp);
            if ($total_data_kurikulum_sp>0) {
                foreach ($get_data_kurikulum_sp AS $no_kurikulum_sp=>$each_kurikulum_sp) {
                    echo 'Mendapatkan '.($no_kurikulum_sp+1).' dari '.$total_data_kurikulum_sp;
                    DB::table('pdrd.kurikulum_sp')->insert([
                        'id_kurikulum_sp'   => $each_kurikulum_sp['id_kurikulum'],
                        'id_smt'            => $each_kurikulum_sp['id_semester'],
                        'id_jenj_didik'     => $each_kurikulum_sp['id_jenj_didik'],
                        'id_sms'	        => $each_kurikulum_sp['id_prodi'],
                        'nm_kurikulum_sp'   => $each_kurikulum_sp['nama_kurikulum'],
                        'jmlh_smt_normal'	=> $each_kurikulum_sp['jml_sem_normal'],
                        'jmlh_sks_lulus'	=> $each_kurikulum_sp['jumlah_sks_lulus'],
                        'jmlh_sks_wajib'	=> $each_kurikulum_sp['jumlah_sks_wajib'],
                        'jmlh_sks_pilihan'	=> $each_kurikulum_sp['jumlah_sks_pilihan'],
                        'jmlh_sks_mk_wajib'	=> $each_kurikulum_sp['jumlah_sks_mata_kuliah_wajib'],
                        'jmlh_sks_mk_pilih'	=> $each_kurikulum_sp['jumlah_sks_mata_kuliah_pilihan'],
                        'create_date'	=> currDateTime(),
                        'id_creator'	=> $id_creator,
                        'last_update'	=> currDateTime(),
                        'id_updater'	=> $id_creator,
                        'soft_delete'	=> 0,
                        'last_sync'	    => currDateTime()
                    ]);
                    echo " (OK)\n";
                }
            }
        }

        // MK Kurikulum
        if (in_array('mk_kurikulum',$func)) {
            $get_data_mk_kurikulum = $this->curl_api_neo_feeder($url, $this->data_form('GetMatkulKurikulum',$token));
            $total_data_mk_kurikulum = count($get_data_mk_kurikulum);
            if ($total_data_mk_kurikulum>0) {
                foreach ($get_data_mk_kurikulum AS $no_mk_kurikulum=>$each_mk_kurikulum) {
                    echo 'Mendapatkan '.($no_mk_kurikulum+1).' dari '.$total_data_mk_kurikulum;
                    DB::table('pdrd.matkul_kurikulum')->insert([
                        'id_kurikulum_sp'   => $each_mk_kurikulum['id_kurikulum'],
                        'id_mk'             => $each_mk_kurikulum['id_matkul'],
                        'smt'               => $each_mk_kurikulum['semester'],
                        'sks_mk'            => $each_mk_kurikulum['sks_mata_kuliah'],
                        'sks_tm'            => $each_mk_kurikulum['sks_tatap_muka'],
                        'sks_prak'          => $each_mk_kurikulum['sks_praktek'],
                        'sks_prak_lap'      => $each_mk_kurikulum['sks_praktek_lapangan'],
                        'sks_sim'           => $each_mk_kurikulum['sks_simulasi'],
                        'a_wajib'           => $each_mk_kurikulum['apakah_wajib'],
                        'create_date'	=> currDateTime(),
                        'id_creator'	=> $id_creator,
                        'last_update'	=> currDateTime(),
                        'id_updater'	=> $id_creator,
                        'soft_delete'	=> 0,
                        'last_sync'	    => currDateTime()
                    ]);
                    echo " (OK)\n";
                }
            }
        }

        // Rencana Pembelajaran
        if (in_array('rencana_ajar',$func)) {
            $get_data_renc_ajar = $this->curl_api_neo_feeder($url, $this->data_form('GetListRencanaPembelajaran',$token));
            $total_data_renc_ajar = count($get_data_renc_ajar);
            if ($total_data_renc_ajar>0) {
                foreach ($get_data_renc_ajar AS $no_renc_ajar=>$each_renc_ajar) {
                    echo 'Mendapatkan '.($no_renc_ajar+1).' dari '.$total_data_renc_ajar;
                    $cari_renc = RencanaAjar::find($each_renc_ajar->id_rencana_ajar);
                    if (is_null($cari_renc)) {
                        DB::table('pdrd.rencana_ajar')->insert([
                            'id_renc_ajar'      => $each_renc_ajar['id_rencana_ajar'],
                            'id_mk'             => $each_renc_ajar['id_matkul'],
                            'pertemuan'         => $each_renc_ajar['pertemuan'],
                            'materi_indonesia'  => $each_renc_ajar['materi_indonesia'],
                            'materi_inggris'    => $each_renc_ajar['materi_inggris'],
                            'create_date'	    => currDateTime(),
                            'id_creator'	    => $id_creator,
                            'last_update'	    => currDateTime(),
                            'id_updater'	    => $id_creator,
                            'soft_delete'	    => 0,
                            'last_sync'	        => currDateTime()
                        ]);
                        echo " (OK)\n";
                    } else {
                        echo " (SUDAH ADA)\n";
                    }
                }
            }
        }

        // Rencana Evaluasi
        if (in_array('rencana_evaluasi',$func)) {
            $get_data_basis_evaluasi = $this->curl_api_neo_feeder($url, $this->data_form('GetJenisEvaluasi',$token));
            foreach ($get_data_basis_evaluasi AS $each_basis_evaluasi) {
                $cari_basis = JenisEvaluasi::find($each_basis_evaluasi['id_jenis_evaluasi']);
                if (is_null($cari_basis)) {
                    DB::table('ref.jenis_evaluasi')->insert([
                        'id_jns_eval'   => $each_basis_evaluasi['id_jenis_evaluasi'],
                        'nm_jns_eval'   => $each_basis_evaluasi['nama_jenis_evaluasi'],
                        'create_date'   => currDateTime(),
                        'last_update'   => currDateTime(),
                        'last_sync'     => currDateTime()
                    ]);
                }
            }
            $get_data_re_mk = $this->curl_api_neo_feeder($url, $this->data_form('GetListRencanaEvaluasi',$token));
            $total_data_re_mk = count($get_data_re_mk);
            if ($total_data_re_mk>0) {
                foreach ($get_data_re_mk AS $no_re_mk=>$each_re_mk) {
                    echo 'Mendapatkan '.($no_re_mk+1).' dari '.$total_data_re_mk;
                    $cari_renc = ReMk::find($each_re_mk['id_rencana_evaluasi']);
                    if (is_null($cari_renc)) {
                        DB::table('pdrd.re_mk')->insert([
                            'id_re_mk'          => $each_re_mk['id_rencana_evaluasi'],
                            'id_jns_eval'       => $each_re_mk['id_jenis_evaluasi'],
                            'id_mk'             => $each_re_mk['id_matkul'],
                            'komponen_evaluasi' => $each_re_mk['nama_evaluasi'],
                            'desk_indo'         => $each_re_mk['deskripsi_indonesia'],
                            'desk_ing'          => $each_re_mk['deskrips_inggris'],
                            'bobot_evaluasi'    => $each_re_mk['bobot_evaluasi'],
                            'no_urut'           => $each_re_mk['nomor_urut'],
                            'create_date'	    => currDateTime(),
                            'id_creator'	    => $id_creator,
                            'last_update'	    => currDateTime(),
                            'id_updater'	    => $id_creator,
                            'soft_delete'	    => 0,
                            'last_sync'	        => currDateTime()
                        ]);
                        echo " (OK)\n";
                    } else {
                        echo " (SUDAH ADA)\n";
                    }
                }
            }
        }

        if (in_array('nilai_kelas',$func)) {
            foreach ($prodi AS $id_sms) {
                $cari_prodi = DB::table('pdrd.sms')->where('id_sms', $id_sms)->first();
                $jenjang = DB::table('ref.jenjang_pendidikan')->where('id_jenj_didik',$cari_prodi->id_jenj_didik)->first();
                $kelas = KelasKuliah::where('id_sms',$id_sms)->orderBy('id_smt','ASC')->get();
                $total_kelas = count($kelas);
                if ($total_kelas>0) {
                    foreach ($kelas AS $each_kelas) {
                        echo "Mendapatkan data nilai_kelas dari prodi ".($cari_prodi->nm_lemb.' ('.$jenjang->nm_jenj_didik.')')."\n";
                        $get_data_nilai_kelas = $this->curl_api_neo_feeder($url, $this->data_form('GetDetailNilaiPerkuliahanKelas',$token,'id_kelas_kuliah',$each_kelas->id_kls));
                        $total_peserta_nilai_kelas = count($get_data_nilai_kelas);
                        if ($total_peserta_nilai_kelas>0) {
                            foreach ($get_data_nilai_kelas AS $no_nilai_kelas=>$each_data_nilai_kelas) {
                                echo "Memproses ".($no_nilai_kelas+1)." dari total ".$total_peserta_nilai_kelas;
                                $cari_nilai = DB::table('pdrd.nilai_smt_mhs')->where('id_reg_pd',$each_data_nilai_kelas['id_registrasi_mahasiswa'])
                                    ->where('id_kls',$each_data_nilai_kelas['id_kelas_kuliah'])
                                    ->first();
                                if (is_null($cari_nilai)) {
                                    DB::table('pdrd.nilai_smt_mhs')->insert([
                                        'id_reg_pd'     => $each_data_nilai_kelas['id_registrasi_mahasiswa'],
                                        'id_kls'        => $each_data_nilai_kelas['id_kelas_kuliah'],
                                        'nilai_angka'   => $each_data_nilai_kelas['nilai_angka'],
                                        'nilai_huruf'   => $each_data_nilai_kelas['nilai_huruf'],
                                        'nilai_indeks'  => $each_data_nilai_kelas['nilai_indeks'],
                                        'create_date'	=> currDateTime(),
                                        'id_creator'	=> $id_creator,
                                        'last_update'	=> currDateTime(),
                                        'id_updater'	=> $id_creator,
                                        'soft_delete'	=> 0,
                                        'last_sync'	    => currDateTime()
                                    ]);
                                    echo " (OK)\n";
                                } else {
                                    DB::table('pdrd.nilai_smt_mhs')->where('id_reg_pd',$each_data_nilai_kelas['id_registrasi_mahasiswa'])
                                        ->where('id_kls',$each_data_nilai_kelas['id_kelas_kuliah'])->update([
                                            'nilai_angka'   => $each_data_nilai_kelas['nilai_angka'],
                                            'nilai_huruf'   => $each_data_nilai_kelas['nilai_huruf'],
                                            'nilai_indeks'  => $each_data_nilai_kelas['nilai_indeks'],
                                            'last_update'	=> currDateTime(),
                                            'last_sync'	    => currDateTime()
                                        ]);
                                    echo " (SUDAH ADA)\n";
                                }
                            }
                        } else {
                            echo "Kelas Prodi dilewati\n";
                        }
                    }
                } else {
                    echo "Prodi dilewati\n";
                }

            }
        }
    }

    function curl_api_neo_feeder($url,$fields_string) {
        if (extension_loaded('curl') === true)
        {
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch,CURLOPT_URL, $url);
//            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch,CURLOPT_POST, true);
            curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec ($ch);
            if ($result === false) {
                $info = curl_getinfo($ch);
                curl_close($ch);
                die('error occured during curl exec. Info: ' . var_export($info));
            }
            curl_close ($ch);
        } else {
            ini_set("allow_url_fopen", 1);
            $result = file_get_contents($url);
        }
        $obj = json_decode($result, TRUE);
        return $obj['data'];
    }

    function data_form($act,$token,$filter=null,$param=null,$limit=0,$offset=0)
    {
        if (is_null($filter)) {
            return json_encode([
                "act"=> $act,
                "token"=> $token,
                "filter"=> "",
                "limit"=>0,
                "offset"=>0,
            ]);
        } else {
            return json_encode([
                "act"   => $act,
                "token" => $token,
                "filter"=> "{$filter}='{$param}'",
                "limit" =>   $limit,
                "offset"=>  $offset,
            ]);
        }
    }

    function data_get_token_form()
    {
        return json_encode([
            "act"=> "GetToken",
            "username"=> ENV('WS_USERNAME'),
            "password"=> ENV('WS_PASSWORD')
        ]);
    }
}
