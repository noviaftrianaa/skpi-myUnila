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
    protected $cacheLifeTime;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->nonca = new NonCa();
        $this->cacheLifeTime = 3600;
    }

    public function list(Request $request)
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $sortby = "ASC";
        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
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
            ORDER BY nc.nm_orang " . $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $noncas = DB::select($query);
            if (empty($noncas)) {
                return WrapResponse([], 'tidak ada daftar Non Citivitas Akademik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($noncas as $value) {
                $data[] = [
                    'id_orang' => $value->id_orang,
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
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar Non Citivitas Akademik', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar Non Citivitas Akademik', TRUE);
    }

    public function add()
    {
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

        InputValidator([
            'id_negara' => 'required',
            'jln' => 'required',
            'rt' => 'required',
            'rw' => 'required',
            'nm_dsn' => 'required',
            'ds_kel' => 'required',
            'kode_pos' => 'required',
            'nm_orang' => 'required',
            'jk' => 'required',
            'nik' => 'required',
            'tmpt_lahir' => 'required',
            'tgl_lahir' => 'required',
            'no_tel_rmh' => 'required',
            'no_hp' => 'required',
            'email' => 'required',
            'npwp' => 'required'
        ], [
            'id_negara.required' => 'id_negara .....',
            'jln.required' => 'jln .....',
            'rt.required' => 'rt .....',
            'rw.required' => 'rw .....',
            'nm_dsn.required' => 'nm_dsn .....',
            'ds_kel.required' => 'ds_kel .....',
            'kode_pos.required' => 'kode_pos .....',
            'nm_orang.required' => 'nm_orang .....',
            'jk.required' => 'jk .....',
            'nik.required' => 'nik .....',
            'tmpt_lahir.required' => 'tmpt_lahir .....',
            'tgl_lahir.required' => 'tgl_lahir .....',
            'no_tel_rmh.required' => 'no_tel_rmh .....',
            'no_hp.required' => 'no_hp .....',
            'email.required' => 'email .....',
            'npwp.required' => 'npwp .....'
        ]);

        DB::beginTransaction();
        try {
            $non_ca = $this->nonca->create([
                'id_orang' => $id_orang,
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
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_orang' => $id_orang)), 'sukses menambahkan non citivitas akademik', TRUE);
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

    public function update()
    {
        $id_orang = $this->request->input('id_orang');
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
            'id_negara' => 'required',
            'jln' => 'required',
            'rt' => 'required',
            'rw' => 'required',
            'nm_dsn' => 'required',
            'ds_kel' => 'required',
            'kode_pos' => 'required',
            'nm_orang' => 'required',
            'jk' => 'required',
            'nik' => 'required',
            'tmpt_lahir' => 'required',
            'tgl_lahir' => 'required',
            'no_tel_rmh' => 'required',
            'no_hp' => 'required',
            'email' => 'required',
            'npwp' => 'required'
        ], [
            'id_negara.required' => 'id_negara .....',
            'jln.required' => 'jln .....',
            'rt.required' => 'rt .....',
            'rw.required' => 'rw .....',
            'nm_dsn.required' => 'nm_dsn .....',
            'ds_kel.required' => 'ds_kel .....',
            'kode_pos.required' => 'kode_pos .....',
            'nm_orang.required' => 'nm_orang .....',
            'jk.required' => 'jk .....',
            'nik.required' => 'nik .....',
            'tmpt_lahir.required' => 'tmpt_lahir .....',
            'tgl_lahir.required' => 'tgl_lahir .....',
            'no_tel_rmh.required' => 'no_tel_rmh .....',
            'no_hp.required' => 'no_hp .....',
            'email.required' => 'email .....',
            'npwp.required' => 'npwp .....'
        ]);

        DB::beginTransaction();
        try {
            $non_ca = $this->nonca->where('id_orang', $id_orang)->first();
            if (!$non_ca) return WrapResponse(['data' => null], 'non citivitas akademik tidak ditemukan atau tidak terdaftar', FALSE);

            $non_ca->update([
                'id_orang' => $id_orang,
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
                'last_update' => currDateTime()
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_orang' => $id_orang)), 'sukses mengubah non citivitas akademik', TRUE);
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

    public function delete()
    {
        InputValidator([
            'id_orang' => 'required|uuid',
        ], [
            'id_orang.required' => 'input id_orang harus diisi',
            'id_orang.uuid' => 'input id_orang harus berupa UUID yang valid',
        ]);

        $id_orang = $this->request->input('id_orang');

        DB::beginTransaction();
        try {
            $non_ca = $this->nonca->where('id_orang', $id_orang)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime()
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_orang' => $id_orang)), 'berhasil menghapus data non citivitas akademik');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data non citivitas akademik', FALSE);
        }
    }
}
