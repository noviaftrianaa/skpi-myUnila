<?php

namespace Database\Seeders\Sikep;

use App\Models\Sikep\Organisasi;
use Illuminate\Database\Seeder;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class OrganisasiSeeder extends Seeder
{
    private $mOrganisasi;

    public function __construct()
    {
        $this->mOrganisasi = app(Organisasi::class);
    }

    public function run()
    {
        $this->insertData($this->getData());
    }

    public function insertData($data = [], $idInduk = null)
    {
        foreach ($data as $key => $v) {
            try {
                $this->mOrganisasi->updateOrInsert(
                    [
                        'id_unit_orga' => $v['idorg']
                    ],
                    [
                        'id_unit_orga_induk' => $idInduk,
                        'kd_unit_orga' => $v['kode'],
                        'nm_unit_orga' => $v['nama'],
                        'alamat' => $v['alamat'],
                        'no_tlp' => $v['notelp'],
                        'no_fax' => $v['nofax'],
                        'kd_pos' => $v['kodepos'],
                        'nm_singkat' => $v['nmsingkat'],
                        'nm_inisial' => $v['nminisial'],

                        'id_creator' => env('USER_ID'),
                        'create_date' => now(),
                        'last_sync' => now(),
                    ]
                );

                if(array_key_exists('items', $v)){
                    $this->insertData($v['items'], $v['idorg']);
                }

                $this->command->info('sync ke-' . $key . ' organisasi | ' . $v['idorg']);
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

    function getData()
    {
        $url = "https://sikep.unila.ac.id/api/v1/organisasi";
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
