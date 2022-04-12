<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Dbr;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
class DbrController extends Controller
{
    protected $request;
    protected $mDbr;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mDbr = new Dbr();
        $this->wrapResponse = new WrapResponse;
        $this->creatorId = $this->updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    }

    public function daftar()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'required|numeric',
            'limit' => 'required|numeric'
        ]);

        $sortby = 'DESC';
        $sortby = $this->request->input('sortby');

        $q_dbr = "SELECT * FROM sarpras.dbr ORDER BY id_ruang $sortby";

        $pagination = CustomPagination($q_dbr);
        $query = $pagination['query'];

        $d_dbr = DB::select($query);
        if (empty($d_dbr)) {
            return WrapResponse(['data' => null], 'tidak ada daftar sarpras dbr yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_dbr as $value) {
            $data[] = [
                'id_ruang' => $value->id_ruang,
                'id_alat' => $value->id_alat,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }
        return WrapResponse(['data' => $data], 'Daftar sarpras dbr', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_ruang' => 'required|numeric',
            'id_alat' => 'required|numeric'
        ]);

        $id_ruang = $this->request->input('id_ruang');
        $id_alat = $this->request->input('id_alat');

        $data = [
            'id_ruang' => $id_ruang,
            'id_alat' => $id_alat,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->mDbr->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang, 'id_alat' => $id_alat)), 'sukses menambahkan sarpras dbr', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras dbr tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras dbr', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_ruang' => 'required|numeric',
            'id_alat' => 'required|numeric'
        ]);

        $id_ruang = $this->request->input('id_ruang');
        $id_alat = $this->request->input('id_alat');

        $data = [
            'id_ruang' => $id_ruang,
            'id_alat' => $id_alat,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mDbr->where('id_ruang', $id_ruang)->where('id_alat', $id_alat)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang, 'id_alat' => $id_alat)), 'sukses mengubah sarpras dbr', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras dbr tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras dbr', FALSE);
        }

    }

    public function hapus()
    {
        InputValidator([
            'id_ruang' => 'required|numeric',
            'id_alat' => 'required|numeric'
        ]);

        $id_ruang = $this->request->input('id_ruang');
        $id_alat = $this->request->input('id_alat');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId
        ];

        DB::beginTransaction();
        try {
            $this->mDbr->where('id_ruang', $id_ruang)->where('id_alat', $id_alat)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang, 'id_alat' => $id_alat)), 'sukses menghapus sarpras dbr', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras dbr tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras dbr', FALSE);
        }
    }
}
