<?php

namespace App\Http\Controllers\PDUT\Api\Iku;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Temp_iku\Iku_7;
use Illuminate\Http\Request;
use DB;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use Exception;
use Log;

class Iku7Controller extends Controller
{
    protected $request;
    
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

  
        $this->iku7 = new Iku_7();
        $this->wrapResponse = new WrapResponse;
    }

    public function tambah()
    {

        InputValidator([
            'id_thn_ajaran' => 'required|numeric',
            'id_smt' => 'nullable',
            'nip' => 'nullable|string',
            'kode_mk' => 'required|string',
            'nm_mk' => 'nullable|string',
            'sks_mk' => 'nullable|numeric',
            'nm_fak' => 'nullable|string',
            'nm_prodi' => 'required|string',
            'komponen_evaluasi' => 'nullable',
            'bobot_evaluasi' => 'nullable',
            'tipe' => 'nullable|string',
        ]);

        $id_iku_7 = guid();
        $id_thn_ajaran =  $this->request->input('id_thn_ajaran');
        $id_smt =  $this->request->input('id_smt');
        $nip =  $this->request->input('nip');
        $kode_mk = $this->request->input('kode_mk');
        $nm_mk = $this->request->input('nm_mk');
        $sks_mk = $this->request->input('sks_mk');
        $nm_fak = $this->request->input('nm_fak');
        $nm_prodi = $this->request->input('nm_prodi');
        $komponen_evaluasi = $this->request->input('komponen_evaluasi');
        $bobot_evaluasi = $this->request->input('bobot_evaluasi');
        $tipe = $this->request->input('tipe');

        $now = currDateTime();
        $id_creator = '7C999853-1002-4363-B2FD-C8B37F3EB23E';
        $soft_delete = 0;



        DB::beginTransaction();
        try {
            $iku7 = $this->iku7->create([
                'id_iku_7' => $id_iku_7,
                'id_thn_ajaran' => $id_thn_ajaran,
                'id_smt' => $id_smt,
                'nip' => $nip,
                'kode_mk' => $kode_mk,
                'nm_mk' => $nm_mk,
                'sks_mk' => $sks_mk,
                'nm_mk' => $nm_mk,
                'sks_mk' => $sks_mk,
                'nm_fak' => $nm_fak,
                'nm_prodi' => $nm_prodi,
                'komponen_evaluasi' => $komponen_evaluasi,
                'bobot_evaluasi' => $bobot_evaluasi,
                'tipe' => $tipe,
                'id_creator' => $id_creator,
                'create_date' => $now,
                'last_update' => $now,
                'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);


            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses menambahkan iku7 - id : ' . $iku7->id_iku_7)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("iku 7 tidak ditemukan atau iku 7 tidak terdaftar")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("gagal menambahkan iku 7")->render();
        }
    }
}
