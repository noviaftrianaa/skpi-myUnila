<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MahasiswaSeeder extends Seeder
{
    public $token = '';
    public $expired = '';
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
        $url = ENV('URL_WS_NEO_FEEDER');
        $token = $this->generate_token();

        foreach ($prodi AS $id_sms) {
            if (currDateTime()>$this->expired) {
                $token = $this->generate_token();
            }
            $cari_prodi = DB::table('pdrd.sms')->where('id_sms',$id_sms)->first();
//            $cari_sms_sync = DB::table('log_sync_pd_sms')->where('id_sms',$id_sms)->where('tgl_sync','>=',date('Y-m-1'))->first();
//            if (!is_null($cari_sms_sync)) {
//                if ($cari_sms_sync->a_selesai==1) {
//                    continue;
//                }
//            } else {
//                DB::table('log_sync_pd_sms')->insert([
//                    'id_sms' => $id_sms,
//                    'tgl_sync'=> date('Y-m-d'),
//                    'a_selesai'=> 0
//                ]);
//            }
            $jenjang = DB::table('ref.jenjang_pendidikan')->where('id_jenj_didik',$cari_prodi->id_jenj_didik)->first();
            echo "Mendapatkan data mahasiswa dari prodi ".($cari_prodi->nm_lemb.' ('.$jenjang->nm_jenj_didik.')')."\n";
            $get_data = curl_api_neo_feeder($url, data_form_feeder('GetDataLengkapMahasiswaProdi',$token,'id_prodi',$id_sms));
            $total_data = count($get_data);
            $no = 1;
            foreach ($get_data AS $each_data) {
                if (currDateTime()>$this->expired) {
                    $token = $this->generate_token();
                }
                $get_data_reg = curl_api_neo_feeder($url, data_form_feeder('GetListRiwayatPendidikanMahasiswa',$token,'id_registrasi_mahasiswa',$each_data['id_registrasi_mahasiswa']));
                $cari_keaktifan = DB::table('ref.status_mahasiswa')->where('nm_stat_mhs',$each_data['nama_status_mahasiswa'])->first();
                echo "Input data Mahasiswa Prodi ".($cari_prodi->nm_lemb.' ('.$jenjang->nm_jenj_didik.')')." ".$no." dari ".$total_data." data\n";
                $carimhs = DB::table('pdrd.peserta_didik')->where('id_pd',$each_data['id_mahasiswa'])->first();
                if (is_null($carimhs)) {
                    DB::table('pdrd.peserta_didik')->insert([
                        'id_pd'             => $each_data['id_mahasiswa'],
                        'nm_pd'             => $each_data['nama_mahasiswa'],
                        'jk'                => $each_data['jenis_kelamin'],
                        'nisn'              => $each_data['nisn'],
                        'nik'               => $each_data['nik'],
                        'tmpt_lahir'        => $each_data['tempat_lahir'],
                        'tgl_lahir'         => $each_data['tanggal_lahir'],
                        'jln'               => $each_data['jalan'],
                        'email'             => $each_data['email'],
                        'rt'                => $each_data['rt'],
                        'rw'                => $each_data['rw'],
                        'nm_dsn'            => $each_data['dusun'],
                        'ds_kel'            => $each_data['kelurahan'],
                        'kode_pos'          => $each_data['kode_pos'],
                        'tlpn_rumah'        => $each_data['telepon'],
                        'tlpn_hp'           => $each_data['handphone'],
                        'nm_wali'           => $each_data['nama_wali'],
                        'tgl_lahir_wali'    => $each_data['tanggal_lahir_wali'],
                        'id_pekerjaan_wali' => $each_data['id_pekerjaan_wali'],
                        'id_penghasilan_wali'=> $each_data['id_penghasilan_wali'],
                        'id_pendidikan_wali'=> $each_data['id_pendidikan_wali'],
                        'nm_ibu_kandung'    => $each_data['nama_ibu_kandung'],
                        'tgl_lahir_ibu'     => $each_data['tanggal_lahir_ibu'],
                        'nik_ibu'           => $each_data['nik_ibu'],
                        'id_pekerjaan_ibu'  => $each_data['id_pekerjaan_ibu'],
                        'id_penghasilan_ibu'=> $each_data['id_penghasilan_ibu'],
                        'id_pendidikan_ibu' => $each_data['id_pendidikan_ibu'],
                        'id_kk_ibu'         => $each_data['id_kebutuhan_khusus_ibu'],
                        'nm_ayah'           => $each_data['nama_ayah'],
                        'tgl_lahir_ayah'    => $each_data['tanggal_lahir_ayah'],
                        'nik_ayah'          => $each_data['nik_ayah'],
                        'id_pekerjaan_ayah' => $each_data['id_pekerjaan_ayah'],
                        'id_penghasilan_ayah'=> $each_data['id_penghasilan_ayah'],
                        'id_pendidikan_ayah'=> $each_data['id_pendidikan_ayah'],
                        'id_kk_ayah'        => $each_data['id_kebutuhan_khusus_ayah'],
                        'a_terima_kps'      => $each_data['penerima_kps'],
                        'no_kps'            => $each_data['nomor_kps'],
                        'id_kk'             => $each_data['id_kebutuhan_khusus_mahasiswa'],
                        'id_alat_transport' => $each_data['id_alat_transportasi'],
                        'id_kewarganegaraan'=> $each_data['id_negara'],
                        'id_agama'          => $each_data['id_agama'],
                        'id_jns_tinggal'    => $each_data['id_jenis_tinggal'],
                        'id_wil'            => $each_data['id_wilayah'],
                        'id_stat_mhs'       => is_null($cari_keaktifan)?'N':($each_data['nama_status_mahasiswa']=='Lulus'?'N':$cari_keaktifan->id_stat_mhs),
                        'create_date'       => currDateTime(),
                        'id_creator'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        'last_update'       => currDateTime(),
                        'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        'soft_delete'       => 0,
                        'last_sync'         => currDateTime()
                    ]);
                } else {
                    DB::table('pdrd.peserta_didik')->where('id_pd',$carimhs->id_pd)->update([
                        'email'             => $each_data['email'],
                        'last_update'       => currDateTime(),
                        'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                    ]);
                }
                $carireg = DB::table('pdrd.reg_pd')->where('id_reg_pd',$each_data['id_registrasi_mahasiswa'])->first();
                if (is_null($carireg)) {
                    $get_data_lulus_do = curl_api_neo_feeder($url, data_form_feeder('GetDetailMahasiswaLulusDO',$token,'id_registrasi_mahasiswa',$each_data['id_registrasi_mahasiswa']));
                    DB::table('pdrd.reg_pd')->insert([
                        'id_reg_pd'         => $each_data['id_registrasi_mahasiswa'],
                        'id_sp'             => $cari_prodi->id_sp,
                        'id_sms'            => $each_data['id_prodi'],
                        'id_pd'             => $each_data['id_mahasiswa'],
                        'id_jns_daftar'     => is_null($get_data_reg[0]['id_jenis_daftar'])?1:$get_data_reg[0]['id_jenis_daftar'],
                        'id_jalur_daftar'   => is_null($get_data_reg[0]['id_jalur_daftar'])?5:$get_data_reg[0]['id_jalur_daftar'],
                        'id_pembiayaan'     => is_null($get_data_reg[0]['id_pembiayaan'])?1:$get_data_reg[0]['id_pembiayaan'],
                        'id_semester_masuk' => $get_data_reg[0]['id_periode_masuk'],
                        'id_jns_keluar'     => $get_data_reg[0]['id_jenis_keluar'],
                        'nipd'              => $get_data_reg[0]['nim'],
                        'tgl_masuk_sp'      => date('Y-m-d',strtotime($get_data_reg[0]['tanggal_daftar'])),
                        'sks_diakui'        => $get_data_reg[0]['sks_diakui'],
                        'id_pt_asal'        => $get_data_reg[0]['id_perguruan_tinggi_asal'],
                        'nm_pt_asal'        => $get_data_reg[0]['nama_perguruan_tinggi_asal'],
                        'id_prodi_asal'     => $get_data_reg[0]['id_prodi_asal'],
                        'nm_prodi_asal'     => $get_data_reg[0]['nama_program_studi_asal'],
                        'tgl_keluar'        => (count($get_data_lulus_do)>0)?(!is_null($get_data_lulus_do[0]['tanggal_keluar'])?date('Y-m-d',strtotime($get_data_lulus_do[0]['tanggal_keluar'])):null):null,
                        'ket'               => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['keterangan']:null,
                        'sk_yudisium'       => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['nomor_sk_yudisium']:null,
                        'tgl_sk_yudisium'   => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['tanggal_sk_yudisium']:null,
                        'ipk'               => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['ipk']:null,
                        'no_seri_ijazah'    => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['nomor_ijazah']:null,
                        'jalur_skripsi'     => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['jalur_skripsi']:null,
                        'judul_skripsi'     => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['judul_skripsi']:null,
                        'bln_awal_bimbingan'=> (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['bulan_awal_bimbingan']:null,
                        'bln_akhir_bimbingan'=> (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['bulan_akhir_bimbingan']:null,
                        'asal_data_ijazah'  => (count($get_data_lulus_do)>0)?$get_data_lulus_do[0]['asal_ijazah']:0,
                        'create_date'       => currDateTime(),
                        'id_creator'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        'last_update'       => currDateTime(),
                        'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        'soft_delete'       => 0,
                        'last_sync'         => currDateTime()
                    ]);
                } else {
                    if (!is_null($carireg->id_jns_keluar)) {
                        $get_data_lulus_do = curl_api_neo_feeder($url, data_form_feeder('GetDetailMahasiswaLulusDO',$token,'id_registrasi_mahasiswa',$each_data['id_registrasi_mahasiswa']));
                        DB::table('pdrd.reg_pd')->where('id_reg_pd',$carireg->id_reg_pd)->update([
                            'id_jns_keluar'     => $get_data_lulus_do[0]['id_jenis_keluar'],
                            'tgl_keluar'        => date('Y-m-d',strtotime($get_data_lulus_do[0]['tanggal_keluar'])),
                            'ket'               => $get_data_lulus_do[0]['keterangan'],
                            'sk_yudisium'       => $get_data_lulus_do[0]['nomor_sk_yudisium'],
                            'tgl_sk_yudisium'   => $get_data_lulus_do[0]['tanggal_sk_yudisium'],
                            'ipk'               => $get_data_lulus_do[0]['ipk'],
                            'no_seri_ijazah'    => $get_data_lulus_do[0]['nomor_ijazah'],
                            'jalur_skripsi'     => $get_data_lulus_do[0]['jalur_skripsi'],
                            'judul_skripsi'     => $get_data_lulus_do[0]['judul_skripsi'],
                            'bln_awal_bimbingan'=> $get_data_lulus_do[0]['bulan_awal_bimbingan'],
                            'bln_akhir_bimbingan'=> $get_data_lulus_do[0]['bulan_akhir_bimbingan'],
                            'asal_data_ijazah'  => $get_data_lulus_do[0]['asal_ijazah'],
                            'last_update'       => currDateTime(),
                            'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        ]);
                    } else {
                        DB::table('pdrd.reg_pd')->where('id_reg_pd',$carireg->id_reg_pd)->update([
                            'id_jns_keluar'     => $get_data_reg[0]['id_jenis_keluar'],
                            'nipd'              => $get_data_reg[0]['nim'],
                            'tgl_masuk_sp'      => date('Y-m-d',strtotime($get_data_reg[0]['tanggal_daftar'])),
                            'sks_diakui'        => $get_data_reg[0]['sks_diakui'],
                            'id_pt_asal'        => $get_data_reg[0]['id_perguruan_tinggi_asal'],
                            'nm_pt_asal'        => $get_data_reg[0]['nama_perguruan_tinggi_asal'],
                            'id_prodi_asal'     => $get_data_reg[0]['id_prodi_asal'],
                            'nm_prodi_asal'     => $get_data_reg[0]['nama_program_studi_asal'],
                            'last_update'       => currDateTime(),
                            'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                        ]);
                    }
                }
                $get_data_keaktifan = curl_api_neo_feeder($url, data_form_feeder('GetListPerkuliahanMahasiswa',$token,'id_registrasi_mahasiswa',$each_data['id_registrasi_mahasiswa']));
                if (currDateTime()>$this->expired) {
                    $token = $this->generate_token();
                }
                if (count($get_data_keaktifan)>0) {
                    foreach ($get_data_keaktifan AS $each_keaktifan) {
                        $cari_dftr_keaktifan = DB::table('pdrd.kuliah_mhs')->where('id_reg_pd',$each_keaktifan['id_registrasi_mahasiswa'])
                            ->where('id_smt',$each_keaktifan['id_semester'])->where('soft_delete',0)->first();
                        if (is_null($cari_dftr_keaktifan)) {
                            DB::table('pdrd.kuliah_mhs')->insert([
                                'id_reg_pd'         => $each_keaktifan['id_registrasi_mahasiswa'],
                                'id_smt'            => $each_keaktifan['id_semester'],
                                'id_stat_mhs'       => $each_keaktifan['id_status_mahasiswa'],
                                'ips'               => $each_keaktifan['ips'],
                                'ipk'               => $each_keaktifan['ipk'],
                                'sks_semester'      => $each_keaktifan['sks_semester'],
                                'total_sks'         => $each_keaktifan['sks_total'],
                                'biaya_smt'         => $each_keaktifan['biaya_kuliah_smt'],
                                'create_date'       => currDateTime(),
                                'id_creator'        => '443701e4-e814-48f3-9528-251bccee8af1',
                                'last_update'       => currDateTime(),
                                'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                                'soft_delete'       => 0,
                                'last_sync'         => currDateTime()
                            ]);
                        } else {
                            DB::table('pdrd.kuliah_mhs')
                                ->where('id_reg_pd',$each_keaktifan['id_registrasi_mahasiswa'])
                                ->where('id_smt',$each_keaktifan['id_semester'])->update([
                                    'id_stat_mhs'       => $each_keaktifan['id_status_mahasiswa'],
                                    'ips'               => $each_keaktifan['ips'],
                                    'ipk'               => $each_keaktifan['ipk'],
                                    'sks_semester'      => $each_keaktifan['sks_semester'],
                                    'total_sks'         => $each_keaktifan['sks_total'],
                                    'last_update'       => currDateTime(),
                                    'id_updater'        => '443701e4-e814-48f3-9528-251bccee8af1',
                                ]);
                        }
                    }
                }
                $no++;
            }
        }
        echo "Selesai\n";
    }

    function generate_token()
    {
        $cari_token = DB::table('man_akses.access_token')->where('keterangan','Token Seeder Data Neo Feeder')->where(function ($token) {
            $token->where('waktu_create','<=',currDateTime())->where('waktu_expired','>=',currDateTime());
        })->orderBy('waktu_expired','DESC')->first();
        if (is_null($cari_token)) {
            $token = generate_token_feeder();
            $this->expired = config('mp.exp_data_row.waktu_expired_token');
        } else {
            $token = $cari_token->token_value;
            $this->expired = $cari_token->waktu_expired;
        }
        $this->token = $token;
        return $token;
    }
}
