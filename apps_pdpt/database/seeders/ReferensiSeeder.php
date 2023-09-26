<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferensiSeeder extends Seeder
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
        $cari_token = DB::table('man_akses.access_token')->where('waktu_expired','>=',currDateTime())->first();
        $url = ENV('URL_WS_NEO_FEEDER');
        $token = $this->generate_token();

        $method_alias = [
        //    'Jenis Pendaftaran'     => 'GetJenisPendaftaran',
//            'Kebutuhan Khusus'      => 'GetKebutuhanKhusus',
//           'Jenis Keluar'      => 'GetJenisKeluar',
//            'Jalur Masuk'           => 'GetJalurMasuk',
            'Status Mahasiswa'      => 'GetStatusMahasiswa',
            'Alat Transportasi'     => 'GetAlatTransportasi',
            'Jenis Tinggal'         => 'GetJenisTinggal',
            'Penghasilan'           => 'GetPenghasilan',
            'Pembiayaan'            => 'GetPembiayaan',
            'Jenis Prestasi'        => 'GetJenisPrestasi',
            'Tingkat Prestasi'      => 'GetTingkatPrestasi',
        ];
        foreach ($method_alias AS $name_alias=>$each_method) {
            echo "Mendapatkan data Referensi ".$name_alias."\n";
            $get_data = curl_api_neo_feeder($url, data_form_feeder($each_method,$token));
            $total_data = count($get_data);
            $no = 1;
            foreach ($get_data AS $each_data) {
                echo "Input data Referensi ".$name_alias." ".$no." dari ".$total_data." data\n";
                if ($each_method=='GetJenisPendaftaran') {
                    $cari_data = DB::table('ref.jenis_pendaftaran')->where('id_jns_daftar',$each_data['id_jenis_daftar'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.jenis_pendaftaran')->insert([
                            'id_jns_daftar' => $each_data['id_jenis_daftar'],
                            'nm_jns_daftar' => $each_data['nama_jenis_daftar'],
                            'u_daftar_sekolah' => $each_data['untuk_daftar_sekolah'],
                            'u_daftar_rombel' => 0,
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetKebutuhanKhusus') {
                    $cari_data = DB::table('ref.kebutuhan_khusus')->where('id_kk',$each_data['id_kebutuhan_khusus'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.kebutuhan_khusus')->insert([
                            'id_kk' => $each_data['id_kebutuhan_khusus'],
                            'nm_kk' => $each_data['nama_kebutuhan_khusus'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetJalurMasuk') {
                    $cari_data = DB::table('ref.jalur_daftar')->where('id_jalur_daftar',$each_data['id_jalur_masuk'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.jalur_daftar')->insert([
                            'id_jalur_daftar'   => $each_data['id_jalur_masuk'],
                            'nm_jalur_daftar'   => $each_data['nama_jalur_masuk'],
                            'create_date'       => currDateTime(),
                            'last_update'       => currDateTime(),
                            'last_sync'         => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetStatusMahasiswa') {
                    $cari_data = DB::table('ref.status_mahasiswa')->where('id_stat_mhs',$each_data['id_status_mahasiswa'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.status_mahasiswa')->insert([
                            'id_stat_mhs' => $each_data['id_status_mahasiswa'],
                            'nm_stat_mhs' => $each_data['nama_status_mahasiswa'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetAlatTransportasi') {
                    $cari_data = DB::table('sarpras.alat_transportasi')->where('id_alat_transport',$each_data['id_alat_transportasi'])->first();
                    if (is_null($cari_data)) {
                        DB::table('sarpras.alat_transportasi')->insert([
                            'id_alat_transport' => $each_data['id_alat_transportasi'],
                            'nm_alat_transport' => $each_data['nama_alat_transportasi'],
                            'create_date' => currDateTime(),
                            'id_creator' => '443701e4-e814-48f3-9528-251bccee8af1',
                            'last_update' => currDateTime(),
                            'id_updater' => '443701e4-e814-48f3-9528-251bccee8af1',
                            'soft_delete' => 0,
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetJenisTinggal') {
                    $cari_data = DB::table('ref.jenis_tinggal')->where('id_jns_tinggal',$each_data['id_jenis_tinggal'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.jenis_tinggal')->insert([
                            'id_jns_tinggal'    => $each_data['id_jenis_tinggal'],
                            'nm_jns_tinggal'    => $each_data['nama_jenis_tinggal'],
                            'create_date'       => currDateTime(),
                            'last_update'       => currDateTime(),
                            'last_sync'         => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetPenghasilan') {
                    $cari_data = DB::table('ref.penghasilan')->where('id_penghasilan',$each_data['id_penghasilan'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.penghasilan')->insert([
                            'id_penghasilan' => $each_data['id_penghasilan'],
                            'nm_penghasilan' => $each_data['nama_penghasilan'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetPembiayaan') {
                    $cari_data = DB::table('ref.pembiayaan')->where('id_pembiayaan',$each_data['id_pembiayaan'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.pembiayaan')->insert([
                            'id_pembiayaan' => $each_data['id_pembiayaan'],
                            'nm_pembiayaan' => $each_data['nama_pembiayaan'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetTingkatPrestasi') {
                    $cari_data = DB::table('ref.tingkat_prestasi')->where('id_tkt_prestasi',$each_data['id_tingkat_prestasi'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.tingkat_prestasi')->insert([
                            'id_tkt_prestasi' => $each_data['id_tingkat_prestasi'],
                            'nm_tkt_prestasi' => $each_data['nama_tingkat_prestasi'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                } elseif ($each_method=='GetJenisPrestasi') {
                    $cari_data = DB::table('ref.jenis_prestasi')->where('id_jenis_prestasi',$each_data['id_jenis_prestasi'])->first();
                    if (is_null($cari_data)) {
                        DB::table('ref.jenis_prestasi')->insert([
                            'id_jenis_prestasi' => $each_data['id_jenis_prestasi'],
                            'nm_jenis_prestasi' => $each_data['nama_jenis_prestasi'],
                            'create_date' => currDateTime(),
                            'last_update' => currDateTime(),
                            'last_sync' => currDateTime()
                        ]);
                    }
                }
                $no++;
            }
        }
        echo "Selesai\n";
    }

    function curl_api_feeder($url,$fields_string) {
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

    function data_form($act,$token)
    {
        return json_encode([
            "act"=> $act,
            "token"=> $token,
            "filter"=> "",
            "limit"=>0,
            "offset"=>0,
        ]);
    }

    function generate_token()
    {
        $cari_token = DB::table('man_akses.access_token')->where('keterangan','Token Seeder Data Referensi Feeder')->where(function ($token) {
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
