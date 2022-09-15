<?php

namespace App\Http\Controllers\PDUT\Api\Iku;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Temp_iku\Iku_6;
use Illuminate\Http\Request;
use DB;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use Exception;
use Log;

class Iku6Controller extends Controller
{
    protected $request;
    protected $dokumen;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->iku6 = new Iku_6();
        $this->wrapResponse = new WrapResponse;
    }

    public function tambah()
    {

        InputValidator([
            'id_thn_ajaran' => 'nullable|numeric',
            'nm_fak' => 'nullable',
            'nm_prodi' => 'nullable',
            'nm_jenj_didik' => 'nullable',
            'instansi' => 'required',
            'jenis_dokumen' => 'required',
            'nomor_dokumen' => 'nullable|regex:/^[A-Z0-9\/\.]+$/',
            'judul' => 'required',
            'keterangan' => 'nullable|string',
            'status_kerjasama' => ['alpha', 'nullable', ValidationRule::in(['A', 'K', 'DP','TA'])],
            'tanggal_awal' => 'required|date_format:Y-m-d',
            'tanggal_akhir' => 'required|date_format:Y-m-d',
        ]);

        $id_iku_6 = guid();
        $id_thn_ajaran = $this->request->input('id_thn_ajaran');
        $nm_fak = $this->request->input('nm_fak');
        $nm_prodi = $this->request->input('nm_prodi');
        $nm_jenj_didik = $this->request->input('nm_jenj_didik');
        $instansi = $this->request->input('instansi');
        $nomor_dokumen =  $this->request->input('nomor_dokumen');
        $jenis_dokumen = $this->request->input('jenis_dokumen');
        $judul = $this->request->input('judul');
        $keterangan = $this->request->input('keterangan');
        $status_kerjasama = $this->request->input('status_kerjasama');
        $tanggal_awal = $this->request->input('tanggal_awal');
        $tanggal_akhir = $this->request->input('tanggal_akhir');

        $now = currDateTime();
        $id_creator = 'b2e7b814-9789-45a6-bbb9-31d4cd8cbff9';
        $soft_delete = 0;

        DB::beginTransaction();
        try {
            $iku6 = $this->iku6->create([
                'id_iku_6' => $id_iku_6,
                'id_thn_ajaran' => $id_thn_ajaran,
                'nm_fak' => $nm_fak,
                'nm_prodi' => $nm_prodi,
                'nm_jenj_didik' => $nm_jenj_didik,
                'instansi' => $instansi,
                'nomor_dokumen' => $nomor_dokumen,
                'jenis_dokumen' => $jenis_dokumen,
                'judul' => $judul,
                'keterangan' => $keterangan,
                'status_kerjasama' => $status_kerjasama,
                'tanggal_awal' => $tanggal_awal,
                'tanggal_akhir' => $tanggal_akhir,
                'id_creator' => $id_creator,
                'create_date' => $now,
                'last_update' => $now,
                'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);


            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses menambahkan iku6 - id : ' . $iku6->id_iku_6)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("iku 6 tidak ditemukan atau iku 6 tidak terdaftar")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("gagal menambahkan iku 6")->render();
        }
    }
}
