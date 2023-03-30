<?php

namespace Database\Seeders;

use App\Models\PDUT\Pdrd\ProfilProdi;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Database\Seeder;

class ProfilSeeder extends Seeder
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
        $profil = [];
        $belum_profil = [];
        foreach ($cari_sms AS $each_sms) {
            echo 'Mencari profil prodi: '.$each_sms->id_sms.' - '.($each_sms->nm_lemb.' ('.$each_sms->jenjang->nm_jenj_didik.')').' dari PDDIKTI';
            $get_data = $this->curl_api_feeder($url.'/'.$kode_sp.'/prodi/'.strtoupper($each_sms->id_sms),$token);
            if (count($get_data)>0) {
                foreach ($get_data AS $each_data) {
                    $cari_profil = ProfilProdi::where('id_sms',$each_sms->id_sms)->first();
                    if (is_null($cari_profil)) {
                        $simpan = new ProfilProdi();
                        $simpan->id_thn_ajaran                  = 2019;
                        $simpan->id_sms                         = $each_sms->id_sms;
//                        $simpan->desk_singkat                   = $cari_nilai->id_akred;
                        $simpan->visi                           = $each_data['visi'];
                        $simpan->misi                           = $each_data['misi'];
                        $simpan->kompetensi                     = $each_data['kompetensi'];
                        $simpan->create_date                    = currDateTime();
                        $simpan->id_creator                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->last_update                    = currDateTime();
                        $simpan->last_sync                      = currDateTime();
                        $simpan->id_updater                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->save();
                        echo " berhasil disimpan\n";
                    } else {
                        echo " sudah ada\n";
                    }
                }
            } else {
                $belum_profil[] = $each_sms->id_sms;
                echo " belum ada profil\n";
            }
        }
        if (count($belum_profil)>0) {
            $akred['Belum Akreditasi'] = count($belum_profil);
        }
        $get_data_capaian = $this->curl_api_feeder($url.'/'.$kode_sp.'/capaian-pembelajaran',$token);
        if (count($get_data_capaian)>0) {
            foreach ($get_data_capaian AS $each_data_capaian) {
                if (!is_null($each_data_capaian['capaian_belajar'])) {
                    $cari_profil = ProfilProdi::where('id_thn_ajaran',2019)->where('id_sms',$each_data_capaian['id_sms'])->first();
                    if (is_null($cari_profil)) {
                        $simpan = new ProfilProdi();
                        $simpan->id_thn_ajaran                  = 2019;
                        $simpan->id_sms                         = $each_data_capaian['id_sms'];
                        $simpan->capaian_belajar                = $each_data_capaian['capaian_belajar'];
                        $simpan->create_date                    = currDateTime();
                        $simpan->id_creator                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->last_update                    = currDateTime();
                        $simpan->last_sync                      = currDateTime();
                        $simpan->id_updater                     = '443701e4-e814-48f3-9528-251bccee8af1';
                        $simpan->save();
                        echo " berhasil disimpan\n";
                    } else {
                        ProfilProdi::where('id_thn_ajaran',2019)->where('id_sms',$each_data_capaian['id_sms'])->update([
                            'capaian_belajar'   => $each_data_capaian['capaian_belajar'],
                            'last_update'       => currDateTime(),
                            'last_sync'         => currDateTime()
                        ]);
                        echo " berhasil update\n";
                    }
                }

            }
        }
        echo "Selesai\n";
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
}
