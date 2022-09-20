<?php

namespace Database\Seeders\Sikep;

use App\Models\Sikep\Golongan;
use Illuminate\Database\Seeder;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GolonganSeeder extends Seeder
{
    private $mGolongan;

    public function __construct()
    {
        $this->mGolongan = app(Golongan::class);
    }

    public function run()
    {
        foreach ($this->getData() as $key => $v) {
            try {
                $this->mGolongan->updateOrInsert(
                    [
                        'id_gol' => $v['id']
                    ],
                    [
                        'kd_gol' => $v['kode'],
                        'nm_gol' => $v['golongan'],
                        'nm_pangkat' => $v['pangkat'],
                        'deskripsi' => $v['deskripsi'],

                        'id_creator' => env('USER_ID'),
                        'create_date' => now(),
                        'last_sync' => now(),
                    ]
                );
                $this->command->info('sync ke-' . $key . ' golongan | ' . $v['id']);
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
        $url = "https://sikep.unila.ac.id/api/v1/golongan";
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
