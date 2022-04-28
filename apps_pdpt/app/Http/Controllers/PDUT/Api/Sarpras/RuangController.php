<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Ruang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RuangController extends Controller
{
    protected $request;
    protected $mRuang;
    protected $wrapResponse;
    protected $creatorId;
    protected $updateId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->mRuang = new Ruang();
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

        $q_ruang = "SELECT * FROM sarpras.ruang ORDER BY id_ruang $sort";

        $pagination = CustomPagination($q_ruang);
        $query = $pagination['query'];

        $d_alat = DB::select($query);
        if (empty($d_alat)) {
            return WrapResponse(['data' => null], 'tidak ada daftar Sarpras Alat yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($d_alat as $value) {
            $data[] = [
                'id_ruang' => $value->id_ruang,
                'id_sms' => $value->id_sms,
                'kd_satuan' => $value->kd_satuan,
                'kode_ruang' => $value->kode_ruang,
                'nama_ruang' => $value->nama_ruang,
                'lantai' => $value->lantai,
                'kapasitas' => $value->kapasitas,
                'luas' => $value->luas,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'Daftar Sarpras Alat', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_sms' => 'required|numeric',
            'kd_satuan' => 'required|numeric',
            'kode_ruang' => 'required|string',
            'nama_ruang' => 'required|string',
            'lantai' => 'required|numeric',
            'kapasitas' => 'required|numeric',
            'luas' => 'required|numeric'
        ]);

        $id_ruang = guid();
        $id_sms = $this->request->input('id_sms');
        $kd_satuan = $this->request->input('kd_satuan');
        $kode_ruang = $this->request->input('kode_ruang');
        $nama_ruang = $this->request->input('nama_ruang');
        $lantai = $this->request->input('lantai');
        $kapasitas = $this->request->input('kapasitas');
        $luas = $this->request->input('luas');

        $data = [
            'id_ruang' => $id_ruang,
            'id_sms' => $id_sms,
            'kd_satuan' => $kd_satuan,
            'kode_ruang' => $kode_ruang,
            'nama_ruang' => $nama_ruang,
            'lantai' => $lantai,
            'kapasitas' => $kapasitas,
            'luas' => $luas,
            'create_date' => date('Y-m-d H:i:s'),
            'id_creator' => $this->creatorId,
            'last_update' => date('Y-m-d H:i:s'),
            'id_updater' => $this->updateId,
            'soft_delete' => '0',
            'last_sync' => date('Y-m-d H:i:s')
        ];

        DB::beginTransaction();
        try {
            $this->mRuang->create($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang)), 'sukses menambahkan sarpras ruang', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras ruang tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan sarpras ruang', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_ruang' => 'required|numeric',
            'id_sms' => 'required|numeric',
            'kd_satuan' => 'required|numeric',
            'kode_ruang' => 'required|string',
            'nama_ruang' => 'required|string',
            'lantai' => 'required|numeric',
            'kapasitas' => 'required|numeric',
            'luas' => 'required|numeric'
        ]);

        $id_ruang = $this->request->input('id_ruang');
        $id_sms = $this->request->input('id_sms');
        $kd_satuan = $this->request->input('kd_satuan');
        $kode_ruang = $this->request->input('kode_ruang');
        $nama_ruang = $this->request->input('nama_ruang');
        $lantai = $this->request->input('lantai');
        $kapasitas = $this->request->input('kapasitas');
        $luas = $this->request->input('luas');

        $data = [
            'id_sms' => $id_sms,
            'kd_satuan' => $kd_satuan,
            'kode_ruang' => $kode_ruang,
            'nama_ruang' => $nama_ruang,
            'lantai' => $lantai,
            'kapasitas' => $kapasitas,
            'luas' => $luas,
            'last_update' => date('Y-m-d H:i:s'),
            'id_updater' => $this->updateId,
            'last_sync' => date('Y-m-d H:i:s')
        ];

        DB::beginTransaction();
        try {
            $this->mRuang->where('id_ruang', $id_ruang)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang)), 'sukses mengubah sarpras ruang', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras ruang tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah sarpras ruang', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_ruang' => 'required|numeric'
        ]);

        $id_ruang = $this->request->input('id_ruang');

        $data = [
            'soft_delete' => '1',
            'last_update' => date('Y-m-d H:i:s'),
            'id_updater' => $this->updateId,
            'last_sync' => date('Y-m-d H:i:s')
        ];

        DB::beginTransaction();
        try {
            $this->mRuang->where('id_ruang', $id_ruang)->update($data);
            DB::commit();
            return WrapResponse(array('data' => array('id_ruang' => $id_ruang)), 'sukses menghapus sarpras ruang', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'sarpras ruang tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus sarpras ruang', FALSE);
        }
    }
}
