<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\AlatTransportasi;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AlatTransportasiController extends Controller
{
    protected $request;
    protected $alatTransportasi;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alatTransportasi = new AlatTransportasi();
        $this->wrapResponse = new WrapResponse;
    }

    public function daftar()
    {
        InputValidator([
            'sort' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'item' => 'numeric'
        ]);

        $sort = 'DESC';
        $sort = $this->request->input('sort');

        $q_transport = "
            SELECT
                altrans.id_alat_transport,
                altrans.nm_alat_transport,
                altrans.create_date,
                altrans.last_update
            FROM
                sarpras.alat_transportasi AS altrans WITH(NOLOCK)
            WHERE
                altrans.soft_delete = 0
            ORDER BY
                altrans.nm_alat_transport " . $sort . " ";

        $pagination = CustomPagination($q_transport);
        $query = $pagination['query'];

        $d_transport = DB::select($query);
        if (empty($d_transport)) {
            return WrapResponse(['data' => null], 'tidak ada daftar sarpras alat transportasi yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_transport as $value) {
            $data[] = [
                'id_alat_transport' => $value->id_alat_transport,
                'nm_alat_transport' => $value->nm_alat_transport,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'berhasil menampilkan daftar sarpras alat transportasi', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'nm_alat_transport' => 'required|string'
        ]);

        $id_alat_transport = guid();
        $nm_alat_transport = $this->request->input('nm_alat_transport');

        $data = [
            'id_alat_transport' => $id_alat_transport,
            'nm_alat_transport' => $nm_alat_transport,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatTransportasi->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat_transport' => $id_alat_transport)), 'sukses menambahkan sarpras alat transpostasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat transpostasi tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras alat transpostasi', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_alat_transport' => 'required|numeric',
            'nm_alat_transport' => 'required|string'
        ]);

        $id_alat_transport = $this->request->input('id_alat_transport');
        $nm_alat_transport = $this->request->input('nm_alat_transport');

        $data = [
            'nm_alat_transport' => $nm_alat_transport,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatTransportasi->where('id_alat_transport', $id_alat_transport)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat_transport' => $id_alat_transport)), 'sukses mengubah sarpras alat transpostasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat transpostasi tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras alat transpostasi', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_alat_transport' => 'required|numberic'
        ]);

        $id_alat_transport = $this->request->input('id_alat_transport');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatTransportasi->where('id_alat_transport', $id_alat_transport)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat_transport' => $id_alat_transport)), 'sukses menghapus sarpras alat transpostasi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat transpostasi tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras alat transpostasi', FALSE);
        }
    }
}
