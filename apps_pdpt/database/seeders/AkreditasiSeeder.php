<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AkreditasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
        $kode_sp = '001026';
        $token = 'a934b2aa-ec1d-32a1-9d41-e982b6b1426c';
        $cari_sms = Sms::where('id_sp',$id_sp)->where('id_jns_sms',3)->get();
        $url = 'https://api.kemdikbud.go.id:8243/pddikti/1.2/pt';
        $akred = [];
        $belum_akred = [];
        foreach ($cari_sms AS $each_sms) {
            echo 'Mencari akreditasi prodi: '.($each_sms->nm_lemb.' ('.$each_sms->jenjang->nm_jenj_didik.')').' dari BAN-PT:PDDIKTI';
            $get_data = $this->curl_api_feeder($url.'/'.$kode_sp.'/prodi/'.strtoupper($each_sms->id_sms).'/akreditasi',$token);
            if (count($get_data)>0) {
                foreach ($get_data AS $each_data) {
                    if (key_exists($each_data['nilai'],$akred)) {
                        $akred[$each_data['nilai']] = ($akred[$each_data['nilai']]+1);
                    } else {
                        $akred[$each_data['nilai']] = 1;
                    }
                    echo ' dapat akreditasi:'.$each_data['nilai'];
                    $cari_akreditasi = AkreditasiProdi::find($each_data['id']);
                    if (is_null($cari_akreditasi)) {
                        $cari_nilai = DB::table('ref.nilai_akred')->where('nm_akred',$each_data['nilai'])->first();
                        $simpan = new AkreditasiProdi();
                        $simpan->id_akreditasi_prodi            = $each_data['id'];
                        $simpan->id_lemb_akred                  = '00001';
                        $simpan->id_sms                         = $each_sms->id_sms;
                        $simpan->id_akred                       = $cari_nilai->id_akred;
                        $simpan->sk_akreditasi_prodi            = $each_data['sk_akreditasi'];
                        $simpan->tanggal_sk_akreditasi_prodi    = $each_data['tgl_sk_akreditasi'];
                        $simpan->tst_sk_akreditasi_prodi        = $each_data['tst_sk_akreditasi'];
                        $simpan->create_date                    = currDateTime();
                        $simpan->id_creator                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->last_update                    = currDateTime();
                        $simpan->last_sync                      = currDateTime();
                        $simpan->id_updater                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->save();
                        echo " berhasil disimpan\n";
                    } else {
                        echo " gagal disimpan\n";
                    }
                }
            } else {
                $belum_akred[] = $each_sms->id_sms;
                echo " belum ada akreditasi\n";
            }
        }
        if (count($belum_akred)>0) {
            $akred['Belum Akreditasi'] = count($belum_akred);
        }
        echo "Selesai\n";
        dd($akred);

    }

    function curl_api_feeder($url,$token) {
        if (extension_loaded('curl') === true)
        {
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_HTTPHEADER, ['Content-Type: application/json','Authorization: Bearer '.$token]);
            curl_setopt($ch,CURLOPT_URL, $url);
//            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch,CURLOPT_POST, false);
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
        return $obj;
    }

    function data_form($act,$token,$filter=null,$param=null)
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
                "act"=> $act,
                "token"=> $token,
                "filter"=> "{$filter}='{$param}'",
                "limit"=>0,
                "offset"=>0,
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
