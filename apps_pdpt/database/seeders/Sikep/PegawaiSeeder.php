<?php

namespace Database\Seeders\Sikep;

use App\Models\Sikep\Pegawai;
use Illuminate\Database\Seeder;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PegawaiSeeder extends Seeder
{
    private $mPegawai;

    public function __construct()
    {
        $this->mPegawai = app(Pegawai::class);
    }

    public function run()
    {
        foreach ($this->getData(1, 3320) as $key => $v) {
            try {
                $this->mPegawai->updateOrInsert(
                    [
                        'id_pegawai' => $v['idpegawai']
                    ],
                    [
                        'nm_pegawai' => $v['nmpegawai'],
                        'jk' => $v['jnskel'],
                        'nip' => $v['nip'],
                        'nidn' => $v['nidn'],
                        'tmp_lahir' => $v['tmplahir'],
                        'tgl_lahir' => $v['tgllahir'],
                        'alamat' => $v['alamat'],
                        'jns_pegawai' => $v['jnspegawai'],
                        'tmt_cpns' => $v['tmtcpns'],
                        'tmt_pns' => $v['tmtpns'],
                        'jns_tenaga' => $v['jnstenaga'],
                        'id_golongan' => $v['idgolongan'],
                        'tmt_gol' => $v['tmtgol'],
                        'id_fungsional' => $v['idfungsional'],
                        'tmt_fung' => $v['tmtfung'],
                        'id_struktural' => $v['idstruktural'],
                        'id_pendidikan' => $v['idpendidikan'],
                        'id_org1' => $v['idorg1'],
                        'id_org2' => $v['idorg2'],
                        'id_org3' => $v['idorg3'],
                        'id_org' => $v['idorg'],
                        'status' => $v['status'],
                        'tmt_pensiun' => $v['tmtpensiun'],

                        'id_creator' => env('USER_ID'),
                        'create_date' => now(),
                        'last_sync' => now(),
                    ]
                );
                $this->command->info('sync ke-' . $key . ' pegawai | ' . $v['idpegawai']);
            } catch (ModelNotFoundException $mnfe) {
                DB::rollBack();
                Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
                $this->command->error('Koneksi database terputus.');
            } catch (Exception $e) {
                DB::rollBack();
                Log::error($e->getMessage() . ' on linenye ' . $e->getLine());
                $this->command->error('Terjadi kesalahan pada server.');
            }
        }
    }

    function getData($start, $limit)
    {
        $url = "https://sikep.unila.ac.id/api/v1/pegawai?start=" . $start . "&limit=" . $limit;
        $token = env('TOKEN_SIKEP');
        $headers = array(
            'Authorization: ' . $token,
            'Content-Type: application/json',
            'Accept: application/json'
        );
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_HTTPGET, true);
        if (!($curl_response = curl_exec($curl))) {
            die('Error: "' . curl_error($curl) . '" - Code: ' . curl_errno($curl));
        }
        curl_close($curl);
        $result = json_decode($curl_response, true);
        return $result['data'];
    }
}
