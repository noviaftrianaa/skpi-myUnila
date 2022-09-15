<?php

namespace App\Http\Controllers\PDUT\Api\Iku;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RegPd;
use App\Models\PDUT\Temp_iku\Iku_2;
use Illuminate\Http\Request;
use DB;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use Exception;
use Log;

class Iku2Controller extends Controller
{
    protected $request;
    protected $litabmas;
    protected $sdmLitabmas;
    protected $pdLitabmas;
    protected $nonCaLitabmas;
    protected $dokLitabmas;
    protected $dokumen;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->regPd = new RegPd();
        $this->iku2 = new Iku_2();
        $this->wrapResponse = new WrapResponse;
    }

    public function tambah()
    {

        InputValidator([
            'npm' => 'required|numeric',
            'id_thn_ajaran' => 'required|numeric',
            'status_kegiatan' => ['alpha', 'required', ValidationRule::in(['M', 'P'])],
            'nm_kegiatan' => 'required',
            'kat_kegiatan' => 'required',
            'peringkat' => 'numeric',
            'a_diluar_pt' => 'numeric',
            'total_sks' => 'numeric'
        ], [
            'status_kegiatan.in' => 'input status harus M/P'
        ]);

        $id_iku_2 = guid();
        $npm = $this->request->input('npm');
        $id_thn_ajaran =  $this->request->input('id_thn_ajaran');
        $id_smt =  $this->request->input('id_smt');
        $status_kegiatan =  $this->request->input('status_kegiatan');
        $nm_kegiatan = $this->request->input('nm_kegiatan');
        $kat_kegiatan = $this->request->input('kat_kegiatan');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $peringkat = $this->request->input('peringkat');
        $total_sks = $this->request->input('total_sks');
        $a_diluar_pt = $this->request->input('a_diluar_pt');
        $nidn_pembimbing = $this->request->input('nidn_pembimbing');
        $nm_pembimbing = $this->request->input('nm_pembimbing');

        $now = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;

        $id_reg_pd = $this->regPd->where('nipd', $npm)->pluck('id_reg_pd')->first();

        if (empty($id_reg_pd)) {
            return WrapResponse(['data' => null], 'npm tidak ada', FALSE);
        }

        DB::beginTransaction();
        try {
            $iku2 = $this->iku2->create([
                'id_iku_2' => $id_iku_2,
                'id_reg_pd' => $id_reg_pd,
                'id_thn_ajaran' => $id_thn_ajaran,
                'id_smt' => $id_smt,
                'status_kegiatan' => $status_kegiatan,
                'nm_kegiatan' => $nm_kegiatan,
                'kat_kegiatan' => $kat_kegiatan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'peringkat' => $peringkat,
                'total_sks' => $total_sks,
                'a_diluar_pt' => $a_diluar_pt,
                'nidn_pembimbing' => $nidn_pembimbing,
                'nm_pembimbing' => $nm_pembimbing,
                'id_creator' => $id_creator,
                'create_date' => $now,
                'last_update' => $now,
                'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);


            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses menambahkan iku2 - id : ' . $iku2->id_iku_2)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("iku 2 tidak ditemukan atau iku 2 tidak terdaftar")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("gagal menambahkan iku 2")->render();
        }
    }
}
