<?php

namespace App\Http\Controllers;

use App\Models\Pdrd\KeaktifanPTK;
use App\Models\Pdrd\RegPTK;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\JenjangPendidikan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait SyncTrait
{
    function sync_table($skema='',$table='',$token,$url,$response,$update_time,$waktu_mulai){
        if ('pdrd'==$skema) {
            if ('reg_ptk'==$table) {
                $data_penugasan = curl_api_pddikti($url.'/penugasan?id_sdm='.$response['id_sdm'],$token);
                foreach ($data_penugasan AS $each_data_penugasan) {
                    $detail_data_penugasan = curl_api_pddikti($url.'/penugasan/'.$each_data_penugasan['id'],$token);
                    $this->sync_table('pdrd','sms',$token,$url,$detail_data_penugasan['id_unit_kerja'],$update_time,$waktu_mulai);
                    $cek_reg_sdm = RegPTK::find($each_data_penugasan['id']);
                    if (is_null($cek_reg_sdm)) {
                        $reg_sdm_baru = new RegPTK();
                        $reg_sdm_baru->fill($reg_sdm_baru->prepare([
                            'id_reg_ptk'    => $each_data_penugasan['id'],
                            'id_jns_keluar' => $detail_data_penugasan['id_jenis_keluar'],
                            'id_sdm'        => $response['id_sdm'],
                            'id_sp'         => $detail_data_penugasan['id_perguruan_tinggi'],
                            'id_stat_pegawai'=>$detail_data_penugasan['id_status_kepegawaian'],
                            'id_ikatan_kerja'=>$detail_data_penugasan['id_ikatan_kerja'],
                            'id_sms'        => $detail_data_penugasan['id_unit_kerja'],
                            'no_srt_tgs'    => $detail_data_penugasan['surat_tugas'],
                            'tgl_srt_tgs'   => $detail_data_penugasan['tanggal_surat_tugas'],
                            'tmt_srt_tgs'   => $detail_data_penugasan['tanggal_mulai'],
                            'tgl_ptk_keluar'=> $detail_data_penugasan['tanggal_keluar'],
                            'nidn'          => $response['nidn'],
//                                    'jns_reg'       => $detail_data_penugasan['jenis_registrasi'],
                            'last_update'   => $update_time,
                            'last_sync'     => $update_time
                        ]))->save();
                        $this->sync_table('pdrd','keaktifan_ptk',$token,$url,$detail_data_penugasan,$update_time,$waktu_mulai);
                    } else {
                        $cek_reg_sdm->fill($cek_reg_sdm->prepare([
                            '_method'       => 'PUT',
                            'id_jns_keluar' => $detail_data_penugasan['id_jenis_keluar'],
                            'id_sp'         => $detail_data_penugasan['id_perguruan_tinggi'],
                            'id_stat_pegawai'=>$detail_data_penugasan['id_status_kepegawaian'],
                            'id_ikatan_kerja'=>$detail_data_penugasan['id_ikatan_kerja'],
                            'id_sms'        => $detail_data_penugasan['id_unit_kerja'],
                            'no_srt_tgs'    => $detail_data_penugasan['surat_tugas'],
                            'tgl_srt_tgs'   => $detail_data_penugasan['tanggal_surat_tugas'],
                            'tmt_srt_tgs'   => $detail_data_penugasan['tanggal_mulai'],
                            'tgl_ptk_keluar'=> $detail_data_penugasan['tanggal_keluar'],
                            'nidn'          => $response['nidn'],
//                                    'jns_reg'       => $detail_data_penugasan['jenis_registrasi'],
                            'last_update'   => $update_time,
                            'last_sync'     => $update_time
                        ]))->save();
                        $this->sync_table('pdrd','keaktifan_ptk',$token,$url,$each_data_penugasan,$update_time,$waktu_mulai);
                    }
                }
                $this->update_log_sync('pdrd',$table,$update_time,currDateTime());
            } elseif('keaktifan_ptk'==$table) {
                foreach ($response['keaktifan'] AS $each_response_keaktifan) {
                    $cek_keaktifan_ptk = KeaktifanPTK::where('id_reg_ptk',$response['id'])
                        ->where('id_thn_ajaran',$each_response_keaktifan['id_thn_ajaran'])
                        ->first();
                    if (is_null($cek_keaktifan_ptk)) {
                        $simpan_keaktifan_ptk = new KeaktifanPTK();
                        $simpan_keaktifan_ptk->fill($simpan_keaktifan_ptk->prepare([
                            'id_reg_ptk'    => $response['id'],
                            'id_thn_ajaran' => $each_response_keaktifan['id_thn_ajaran'],
                            'a_sp_homebase' => $each_response_keaktifan['apakah_pt_homebase'],
                            'last_update'   => $update_time,
                            'last_sync'     => $update_time
                        ]))->save();
                    } else {
                        if ($cek_keaktifan_ptk->a_sp_homebase!=$each_response_keaktifan['apakah_pt_homebase']) {
                            $cek_keaktifan_ptk->fill($cek_keaktifan_ptk->prepare([
                                '_method'       => 'PUT',
                                'a_sp_homebase' => $each_response_keaktifan['apakah_pt_homebase'],
                                'last_update'   => $update_time,
                                'last_sync'     => $update_time
                            ]))->save();
                        }
                    }
                }
                $this->update_log_sync('pdrd',$table,$update_time,currDateTime());
            } elseif('sdm'==$table) {
                $this->update_log_sync('pdrd',$table,$update_time);
                $this->update_log_sync('pdrd','satuan_pendidikan',$update_time);
                $this->update_log_sync('pdrd','sms',$update_time);
                $this->update_log_sync('pdrd','reg_ptk',$update_time);
                $this->update_log_sync('pdrd','keaktifan_ptk',$update_time);
                $data = curl_api_pddikti($url.$response->enpoint, $token);
                foreach ($data AS $each_data) {
                    $sdm = SDM::find($each_data['id_sdm']);
                    if (is_null($sdm)) {
                        $data_pribadi_alamat = curl_api_pddikti($url.'/data_pribadi/alamat/'.$each_data['id_sdm'],$token);
                        $data_keluarga = curl_api_pddikti($url.'/data_pribadi/keluarga/'.$each_data['id_sdm'],$token);
                        $data_kepegawaian = curl_api_pddikti($url.'/data_pribadi/kepegawaian/'.$each_data['id_sdm'],$token);
                        $data_kependudukan = curl_api_pddikti($url.'/data_pribadi/kependudukan/'.$each_data['id_sdm'],$token);
                        $data_lain = curl_api_pddikti($url.'/data_pribadi/lain/'.$each_data['id_sdm'],$token);
                        $data_profil = curl_api_pddikti($url.'/data_pribadi/profil/'.$each_data['id_sdm'],$token);
                        $input = array_merge($data_pribadi_alamat,$data_keluarga,$data_kependudukan,$data_kepegawaian,$data_lain,$data_profil);
                        $input_sdm = [
                            'id_sdm'            => $each_data['id_sdm'],
                            'nm_sdm'            => $each_data['nama_sdm'],
                            'jk'                => $input['jenis_kelamin'],
                            'tmpt_lahir'        => $input['tempat_lahir'],
                            'tgl_lahir'         => $input['tanggal_lahir'],
                            'nik'               => $input['nik'],
                            'nidn'              => $input['nidn'],
                            'stat_kawin'        => $input['id_status_kawin'],
                            'jln'               => $input['alamat'],
                            'rt'                => $input['rt'],
                            'rw'                => $input['rw'],
                            'nm_dsn'            => $input['dusun'],
                            'ds_kel'            => $input['kelurahan'],
                            'kode_pos'          => $input['kode_pos'],
                            'no_tel_rmh'        => $input['telepon_rumah'],
                            'no_hp'             => $input['telepon_hp'],
                            'email'             => $input['email'],
                            'nip'               => $input['nip'],
//                            'tmt_pns'         => $input[''],
                            'nm_suami_istri'    => $input['nama_pasangan'],
                            'nip_suami_istri'   => $input['nip_pasangan'],
                            'sk_cpns'           => $input['sk_cpns'],
                            'tgl_sk_cpns'       => $input['tanggal_sk_cpns'],
                            'sk_angkat'         => $input['sk_tmmd'],
                            'tmt_sk_angkat'     => $input['tmmd'],
                            'npwp'              => $input['npwp'],
                            'nm_wp'             => $input['nama_wp'],
                            'stat_data'         => 1,
//                            'nira'      => $input['id_sinta'],
                            'kewarganegaraan'   => $input['kode_negara'],
                            'id_jns_sdm'        => DB::table('ref.jenis_sdm')->where('nm_jns_sdm',$each_data['jenis_sdm'])->first()->id_jns_sdm,
                            'id_wil'            => $input['id_kota_kabupaten'],
                            'id_stat_aktif'     => DB::table('ref.status_keaktifan_pegawai')->where('nm_stat_aktif',$each_data['nama_status_aktif'])->first()->id_stat_aktif,
                            'id_agama'          => $input['id_agama'],
                            'id_pekerjaan_suami_istri'  => $input['id_pekerjaan_pasangan'],
                            'id_lemb_angkat'    => 0,
                            'id_sumber_gaji'    => $input['id_sumber_gaji'],
                            'last_update'       => $update_time,
                            'last_sync'         => $update_time
                        ];
                        $simpan_sdm = new SDM();
                        $simpan_sdm->fill($simpan_sdm->prepare($input_sdm))->save();
                    } else {
                        // jika sdm sudah ada
                    }
                    $this->sync_table('pdrd','reg_ptk',$token,$url,$each_data,$update_time,$waktu_mulai);
                }
                $this->update_log_sync('pdrd',$table,$update_time,currDateTime());
            } elseif('sms'==$table) {
                $cek_sms = SMS::find($response);
                $detail_sms = curl_api_pddikti($url.'referensi/detail_unit_kerja?id_unit_kerja='.$response,$token)[0];
                $jenjang = JenjangPendidikan::find($detail_sms['id_jenjang']);
                $jenis_sms = DB::table('ref.jenis_sms')->where('id_jns_sms',$detail_sms['id_jenis_unit'])->first();
                if ($detail_sms['id_jns_sms']!=3) {
                    $nama_pecah = $jenis_sms->nm_jns_sms.' ';
                } else {
                    $nama_pecah = $jenis_sms->nm_jns_sms.' '.$jenjang->nm_jenj_didik.' ';
                }
                if (is_null($cek_sms)) {
                    if (!is_null($detail_sms['id_induk_unit'])) {
                        $this->sync_table('pdrd','sms',$token,$url,$detail_sms['id_induk_unit'],$update_time,$waktu_mulai);
                    }
                    $simpan_sms = new SMS();
                    $jenjang = JenjangPendidikan::find($detail_sms['id_jenjang']);
                    $jenis_sms = DB::table('ref.jenis_sms')->where('id_jns_sms',$detail_sms['id_jenis_unit'])->first();
                    if ($detail_sms['id_jns_sms']!=3) {
                        $nama_pecah = $jenis_sms->nm_jns_sms.' ';
                    } else {
                        $nama_pecah = $jenis_sms->nm_jns_sms.' '.$jenjang->nm_jenj_didik.' ';
                    }
                    $simpan_sms->fill($simpan_sms->prepare([
                        'id_sms'            => $detail_sms['id'],
                        'id_lemb_non_sp'    => $detail_sms['id_lembaga_penerbit'],
                        'id_jur'            => $detail_sms['jurusan'][]['id'],
                        'id_jenj_didik'     => $detail_sms['id_jenjang'],
                        'nm_lemb'           => str_replace($nama_pecah,'',$detail_sms['nama']),
                        'smt_mulai'         => $detail_sms['semester_mulai'],
                        'kode_prodi'        => $detail_sms['kode_unit'],
                        'sks_lulus'         => $detail_sms['sks_lulus'],
                        'gelar_lulusan'     => $detail_sms['gelar_lulusan'],
                        'tgl_tutup'         => $detail_sms['tanggal_tutup'],
                        'stat_prodi'        => $detail_sms['status_unit'],
                        'tgl_berdiri'       => $detail_sms['tanggal_berdiri'],
                        'sk_selenggara'     => $detail_sms['sk_penyelenggara'],
                        'tgl_sk_selenggara' => $detail_sms['tanggal_sk_penyelenggara'],
                        'tmt_sk_selenggara' => $detail_sms['terhitung_mulai_tanggal_penyelenggara'],
                        'tst_sk_selenggara' => $detail_sms['terhitung_sampai_tanggal_penyelenggara'],
                        'id_sp'             => $detail_sms['id_pt'],
                        'id_jns_sms'        => $detail_sms['id_jenis_unit'],
                        'id_fungsi_lab'     => '*',
                        'id_kel_usaha'      => '*',
                        'id_wil'            => $detail_sms['wilayah'][]['id'],
                        'id_induk_sms'      => $detail_sms['id_induk_unit'],
                        'last_update'       => $update_time,
                        'last_sync'         => $update_time
                    ]))->save();
                } else {
                    if (strtotime($detail_sms['waktu_data_update'])>strtotime($cek_sms->last_update)) {
                        $cek_sms->fill($cek_sms->prepare([
                            '_method'           => 'PUT',
                            'id_lemb_non_sp'    => $detail_sms['id_lembaga_penerbit'],
                            'id_jur'            => $detail_sms['jurusan'][]['id'],
                            'id_jenj_didik'     => $detail_sms['id_jenjang'],
                            'nm_lemb'           => str_replace($nama_pecah,'',$detail_sms['nama']),
                            'smt_mulai'         => $detail_sms['semester_mulai'],
                            'kode_prodi'        => $detail_sms['kode_unit'],
                            'sks_lulus'         => $detail_sms['sks_lulus'],
                            'gelar_lulusan'     => $detail_sms['gelar_lulusan'],
                            'tgl_tutup'         => $detail_sms['tanggal_tutup'],
                            'stat_prodi'        => $detail_sms['status_unit'],
                            'tgl_berdiri'       => $detail_sms['tanggal_berdiri'],
                            'sk_selenggara'     => $detail_sms['sk_penyelenggara'],
                            'tgl_sk_selenggara' => $detail_sms['tanggal_sk_penyelenggara'],
                            'tmt_sk_selenggara' => $detail_sms['terhitung_mulai_tanggal_penyelenggara'],
                            'tst_sk_selenggara' => $detail_sms['terhitung_sampai_tanggal_penyelenggara'],
                            'id_sp'             => $detail_sms['id_pt'],
                            'id_jns_sms'        => $detail_sms['id_jenis_unit'],
                            'id_fungsi_lab'     => '*',
                            'id_kel_usaha'      => '*',
                            'id_wil'            => $detail_sms['wilayah'][]['id'],
                            'id_induk_sms'      => $detail_sms['id_induk_unit'],
                            'last_update'       => $update_time,
                            'last_sync'         => $update_time
                        ]))->save();
                    }
                }
                $this->update_log_sync('pdrd',$table,$update_time,currDateTime());
            } else {
                return false;
            }
        }
    }

    function update_log_sync($skema,$table,$waktu_create,$waktu_update=null)
    {
        $cek_table_app = DB::table('man_akses.table_aplikasi')
            ->where('skema_tbl',$skema)
            ->where('nm_tbl',$table)
            ->where('a_table_aktif',1)
            ->first();
        $cek_data = DB::table('logger.log_table_app')
            ->where('id_table_app',$cek_table_app->id_table_app)
            ->where('id_aplikasi',env('APP_ID'))
            ->first();
        if (is_null($cek_data)) {
            DB::table('logger.log_table_app')->insert([
                'id_log_table_app'  => guid(),
                'id_aplikasi'       => env('APP_ID'),
                'id_pengguna'       => auth()->user()->id_pengguna,
                'id_table_app'      => $cek_table_app->id_table_app,
                'waktu_mulai_sync'  => $waktu_create
            ]);
        } else {
            if (!is_null($waktu_update)) {
                $update = [
                    'id_pengguna'       => auth()->user()->id_pengguna,
                    'waktu_selesai_sync'=> $waktu_update
                ];
            } else {
                $update = [
                    'id_pengguna'       => auth()->user()->id_pengguna,
                    'waktu_mulai_sync'  => $waktu_create
                ];
            }
            DB::table('logger.log_table_app')
                ->where('id_log_table_app',$cek_data->id_log_table_app)
                ->update($update);
        }
    }
}
