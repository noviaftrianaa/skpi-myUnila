<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use App\Models\PDUT\Pdrd\NonCa;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;

class NonCaController extends Controller
{
    protected $request;
    protected $nonca;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->nonca = new NonCa();
    }

    public function daftar()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sort = "ASC";
        $sort = $this->request->input('sort_by');

        if (!empty($sort)) {
            $sort = $sort;
        }

        try {
            $query = "SELECT
				nc.id_orang,
				ng.nm_negara,
				nc.nm_orang,
                CASE nc.jk WHEN 'L' THEN 'Laki-laki' WHEN 'P' THEN 'Perempuan' END AS jk,
				nc.nik,
				nc.tmpt_lahir,
				nc.tgl_lahir,
				nc.no_tel_rmh,
				nc.no_hp,
				nc.email,
				nc.npwp,
				nc.jln,
				nc.rt,
				nc.rw,
				nc.nm_dsn,
				nc.ds_kel,
				nc.kode_pos,
                nc.create_date,
                nc.last_update
            FROM pdrd.non_ca AS nc WITH(NOLOCK)
            LEFT JOIN ref.negara AS ng WITH(NOLOCK) ON ng.id_negara = nc.id_negara  AND ng.expired_date IS NULL
            WHERE nc.soft_delete = 0
            ORDER BY nc.nm_orang " . $sort . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $noncas = DB::select($query);
            if (empty($noncas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar non citivitas akademik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($noncas as $value) {
                $data[] = [
                    'id_nonca' => $value->id_orang,
                    'nm_negara' => $value->nm_negara,
                    'nm_orang' => $value->nm_orang,
                    'jk' => $value->jk,
                    'nik' => $value->nik,
                    'tmpt_lahir' => $value->tmpt_lahir,
                    'tgl_lahir' => $value->tgl_lahir,
                    'no_tel_rmh' => $value->no_tel_rmh,
                    'no_hp' => $value->no_hp,
                    'email' => $value->email,
                    'npwp' => $value->npwp,
                    'jln' => $value->jln,
                    'rt' => $value->rt,
                    'rw' => $value->rw,
                    'nm_dsn' => $value->nm_dsn,
                    'ds_kel' => $value->ds_kel,
                    'kode_pos' => $value->kode_pos,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar non citivitas akademik', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar non citivitas akademik', TRUE);
    }

    public function detail()
    {
        InputValidator([
            'id_nonca' => 'required|uuid'
        ]);

        $id_orang = $this->request->input('id_nonca');

        try {
            $query = "SELECT
				nc.id_orang,
				ng.nm_negara,
				nc.nm_orang,
                CASE nc.jk WHEN 'L' THEN 'Laki-laki' WHEN 'P' THEN 'Perempuan' END AS jk,
				nc.nik,
				nc.tmpt_lahir,
				nc.tgl_lahir,
				nc.no_tel_rmh,
				nc.no_hp,
				nc.email,
				nc.npwp,
				nc.jln,
				nc.rt,
				nc.rw,
				nc.nm_dsn,
				nc.ds_kel,
				nc.kode_pos,
                nc.create_date,
                nc.last_update
            FROM pdrd.non_ca AS nc WITH(NOLOCK)
            LEFT JOIN ref.negara AS ng WITH(NOLOCK) ON ng.id_negara = nc.id_negara  AND ng.expired_date IS NULL
            WHERE nc.soft_delete = 0
            AND nc.id_orang = '" . $id_orang . "'";

            $noncas = DB::select($query);
            if (empty($noncas)) {
                return WrapResponse(array('data' => array('id_nonca' => $id_orang)), 'tidak ada detail non citivitas akademik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($noncas as $value) {
                $data[] = [
                    'id_nonca' => $value->id_orang,
                    'nm_negara' => $value->nm_negara,
                    'nm_orang' => $value->nm_orang,
                    'jk' => $value->jk,
                    'nik' => $value->nik,
                    'tmpt_lahir' => $value->tmpt_lahir,
                    'tgl_lahir' => $value->tgl_lahir,
                    'no_tel_rmh' => $value->no_tel_rmh,
                    'no_hp' => $value->no_hp,
                    'email' => $value->email,
                    'npwp' => $value->npwp,
                    'jln' => $value->jln,
                    'rt' => $value->rt,
                    'rw' => $value->rw,
                    'nm_dsn' => $value->nm_dsn,
                    'ds_kel' => $value->ds_kel,
                    'kode_pos' => $value->kode_pos,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan detail non citivitas akademik', FALSE);
        }
        return WrapResponse(['data' => $data], 'detail non citivitas akademik', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_negara' => 'required|alpha',
            'jln' => 'required',
            'rt' => 'required|numeric',
            'rw' => 'required|numeric',
            'nm_dsn' => 'required',
            'ds_kel' => 'required',
            'kode_pos' => 'required',
            'nm_orang' => 'required',
            'jk' => 'required',
            'nik' => 'required',
            'tmpt_lahir' => 'required',
            'tgl_lahir' => 'required|date',
            'no_tel_rmh' => 'required',
            'no_hp' => 'required',
            'email' => 'required|email',
            'npwp' => 'required'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_orang = guid();
        $id_negara = $this->request->input('id_negara');
        $jln = $this->request->input('jln');
        $rt = $this->request->input('rt');
        $rw = $this->request->input('rw');
        $nm_dsn = $this->request->input('nm_dsn');
        $ds_kel = $this->request->input('ds_kel');
        $kode_pos = $this->request->input('kode_pos');
        $nm_orang = $this->request->input('nm_orang');
        $jk = $this->request->input('jk');
        $nik = $this->request->input('nik');
        $tmpt_lahir = $this->request->input('tmpt_lahir');
        $tgl_lahir = $this->request->input('tgl_lahir');
        $no_tel_rmh = $this->request->input('no_tel_rmh');
        $no_hp = $this->request->input('no_hp');
        $email = $this->request->input('email');
        $npwp = $this->request->input('npwp');

        DB::beginTransaction();
        try {
            $non_ca = $this->nonca->create([
                'id_nonca' => $id_orang,
                'id_negara' => $id_negara,
                'jln' => $jln,
                'rt' => $rt,
                'rw' => $rw,
                'nm_dsn' => $nm_dsn,
                'ds_kel' => $ds_kel,
                'kode_pos' => $kode_pos,
                'nm_orang' => $nm_orang,
                'jk' => $jk,
                'nik' => $nik,
                'tmpt_lahir' => $tmpt_lahir,
                'tgl_lahir' => $tgl_lahir,
                'no_tel_rmh' => $no_tel_rmh,
                'no_hp' => $no_hp,
                'email' => $email,
                'npwp' => $npwp,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_nonca' => $id_orang)), 'sukses menambahkan non citivitas akademik', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'non citivitas akademik tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan non citivitas akademik', FALSE);
        }
    }

    public function ubah()
    {
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_orang = $this->request->input('id_nonca');
        $id_negara = $this->request->input('id_negara');
        $jln = $this->request->input('jln');
        $rt = $this->request->input('rt');
        $rw = $this->request->input('rw');
        $nm_dsn = $this->request->input('nm_dsn');
        $ds_kel = $this->request->input('ds_kel');
        $kode_pos = $this->request->input('kode_pos');
        $nm_orang = $this->request->input('nm_orang');
        $jk = $this->request->input('jk');
        $nik = $this->request->input('nik');
        $tmpt_lahir = $this->request->input('tmpt_lahir');
        $tgl_lahir = $this->request->input('tgl_lahir');
        $no_tel_rmh = $this->request->input('no_tel_rmh');
        $no_hp = $this->request->input('no_hp');
        $email = $this->request->input('email');
        $npwp = $this->request->input('npwp');

        InputValidator([
            'id_negara' => 'required|alpha',
            'jln' => 'required',
            'rt' => 'required|numeric',
            'rw' => 'required|numeric',
            'nm_dsn' => 'required',
            'ds_kel' => 'required',
            'kode_pos' => 'required',
            'nm_orang' => 'required',
            'jk' => 'required',
            'nik' => 'required',
            'tmpt_lahir' => 'required',
            'tgl_lahir' => 'required|date',
            'no_tel_rmh' => 'required',
            'no_hp' => 'required',
            'email' => 'required|email',
            'npwp' => 'required'
        ]);

        DB::beginTransaction();
        try {
            $non_ca = $this->nonca->where('id_nonca', $id_orang)->first();
            if (!$non_ca) return WrapResponse(['data' => null], 'non citivitas akademik tidak ditemukan atau tidak terdaftar', FALSE);

            $non_ca->update([
                // 'id_nonca' => $id_orang,
                'id_negara' => $id_negara,
                'jln' => $jln,
                'rt' => $rt,
                'rw' => $rw,
                'nm_dsn' => $nm_dsn,
                'ds_kel' => $ds_kel,
                'kode_pos' => $kode_pos,
                'nm_orang' => $nm_orang,
                'jk' => $jk,
                'nik' => $nik,
                'tmpt_lahir' => $tmpt_lahir,
                'tgl_lahir' => $tgl_lahir,
                'no_tel_rmh' => $no_tel_rmh,
                'no_hp' => $no_hp,
                'email' => $email,
                'npwp' => $npwp,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_nonca' => $id_orang)), 'sukses mengubah non citivitas akademik', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'non citivitas akademik tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah non citivitas akademik', FALSE);
        }
    }

    public function hapus()
    {
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_orang = $this->request->input('id_nonca');

        InputValidator([
            'id_nonca' => 'required|uuid',
        ]);

        DB::beginTransaction();
        try {
            $this->nonca->where('id_nonca', $id_orang)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_nonca' => $id_orang)), 'berhasil menghapus data non citivitas akademik', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data non citivitas akademik', FALSE);
        }
    }
}
