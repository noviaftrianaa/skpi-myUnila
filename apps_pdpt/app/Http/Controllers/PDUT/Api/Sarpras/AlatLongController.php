<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\AlatLong;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AlatLongController extends Controller
{
    protected $request;
    protected $alatLong;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alatLong = new AlatLong();
        $this->wrapResponse = new WrapResponse;
        $this->creatorId = $this->updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    }

    public function daftar()
    {
        InputValidator([
            'sort' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'required|numeric',
            'limit' => 'required|numeric'
        ]);

        $sort = 'DESC';
        $sort = $this->request->input('sort');

        $q_alatlong = "
            SELECT
                along.id_alat,
                along.id_smt,
                semes.nm_smt,
                along.jml_laik,
                along.jml_tidak_laik,
                along.create_date,
                along.last_update
            FROM
                sarpras.alat_long AS along WITH(NOLOCK)
                LEFT JOIN ref.semester AS semes WITH(NOLOCK) ON along.id_smt = semes.id_smt
                AND semes.expired_date IS NULL
            WHERE
                along.soft_delete = 0
            ORDER BY
                semes.id_smt " . $sort . " ";

        $pagination = CustomPagination($q_alatlong);
        $query = $pagination['query'];

        $d_alat = DB::select($query);
        if (empty($d_alat)) {
            return WrapResponse(['data' => null], 'tidak ada daftar sarpras alat long yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_alat as $value) {
            $data[] = [
                'id_alat' => $value->id_alat,
                'id_smt' => $value->id_smt,
                'nm_smt' => $value->nm_smt,
                'jml_laik' => $value->jml_laik,
                'jml_tidak_laik' => $value->jml_tidak_laik,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'berhasil menampilkan daftar sarpras alat long', TRUE, $pagination['metaData']);
    }

    public function tambah()
    {
        InputValidator([
            'id_smt' => 'required|uuid',
            'nm_smt' => 'required|string',
            'jml_laik' => 'required|numeric',
            'jml_tidak_laik' => 'required|numeric'
        ]);

        $id_alat = guid();
        $id_smt = $this->request->input('id_smt');
        $nm_smt = $this->request->input('nm_smt');
        $jml_laik = $this->request->input('jml_laik');
        $jml_tidak_laik = $this->request->input('jml_tidak_laik');

        $data = [
            'id_alat' =>  $id_alat,
            'id_smt' => $id_smt,
            'nm_smt' => $nm_smt,
            'jml_laik' => $jml_laik,
            'jml_tidak_laik' => $jml_tidak_laik,
            'soft_delete' => 0,
            'create_date' => currDateTime(),
            'id_creator' => $this->creatorId,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatLong->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses menambahkan sarpras alat long', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat long tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras alat long', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_alat' => 'required|uuid',
            'id_smt' => 'required|uuid',
            'nm_smt' => 'required|string',
            'jml_laik' => 'required|numeric',
            'jml_tidak_laik' => 'required|numeric'
        ]);

        $id_alat = $this->request->input('id_alat');
        $id_smt = $this->request->input('id_smt');
        $nm_smt = $this->request->input('nm_smt');
        $jml_laik = $this->request->input('jml_laik');
        $jml_tidak_laik = $this->request->input('jml_tidak_laik');

        $data = [
            'id_smt' => $id_smt,
            'nm_smt' => $nm_smt,
            'jml_laik' => $jml_laik,
            'jml_tidak_laik' => $jml_tidak_laik,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatLong->update($id_alat, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses mengubah sarpras alat long', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat long tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras alat long', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_alat' => 'required|uuid'
        ]);

        $id_alat = $this->request->input('id_alat');

        $data = [
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'id_updater' => $this->updateId,
            'last_sync' => currDateTime(),
        ];

        DB::beginTransaction();
        try {
            $this->alatLong->update($id_alat, $data);
            DB::commit();
            return WrapResponse(array('data' => array('id_alat' => $id_alat)), 'sukses menghapus sarpras alat long', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras alat long tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras alat long', FALSE);
        }
    }
}
