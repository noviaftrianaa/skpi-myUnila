<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Keuangan\RwyGajiBerkala;
use DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;

class KeuanganGajiSdmController extends Controller
{
    // protected $request;
    // protected $rwygaji;

    // public function __construct(Request $request)
    // {
    //     $this->request = $request;
    //     $this->rwygaji = new RwyGajiBerkala();
    // }

    // public function list()
    // {
    //     InputValidator([
    //         'page' => 'numeric|min:1',
    //         'count'    => 'numeric|min:1|max:50',
    //         'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
    //     ]);

    //     $sortby = "ASC";
    //     $sortby = $this->request->input('sortby');

    //     if (!empty($sortby)) {
    //         $sortby = $sortby;
    //     }

    //     try {
    //         $query = "SELECT
    //         klsukt.id_kelas_ukt,
    //         klsukt.nm_kelas_ukt,
    //         klsukt.nominal_ukt,
    //         klsukt.create_date,
    //         klsukt.id_creator,
    //         klsukt.last_update,
    //         klsukt.id_updater,
    //         klsukt.soft_delete,
    //         klsukt.last_sync
    //         FROM keuangan.kelas_ukt AS klsukt WITH(NOLOCK)
    //         WHERE klsukt.soft_delete = 0
    //         ORDER BY klsukt.nm_kelas_ukt " . $sortby . " ";

    //         $pagination = CustomPagination($query);
    //         $query = $pagination['query'];

    //         $noncas = DB::select($query);
    //         if (empty($noncas)) {
    //             return WrapResponse(['data' => null], 'tidak ada daftar kelas ukt yang ditampilkan', FALSE);
    //         }

    //         $data = [];
    //         foreach ($noncas as $value) {
    //             $data[] = [
    //                 'id_kelas_ukt' => $value->id_kelas_ukt,
    //                 'nm_kelas_ukt' => $value->nm_kelas_ukt,
    //                 'nominal_ukt' => $value->nominal_ukt,
    //                 'create_date' => $value->create_date,
    //                 'id_creator' => $value->id_creator,
    //                 'last_update' => $value->last_update,
    //                 'id_updater' => $value->id_updater,
    //                 'soft_delete' => $value->soft_delete,
    //                 'last_sync' => $value->last_sync,
    //             ];
    //         }
    //     } catch (\Throwable $th) {
    //         return WrapResponse(['data' => null], 'gagal mendapatkan daftar kelas ukt', FALSE);
    //     }
    //     return WrapResponse(['data' => $data], 'daftar kelas ukt', TRUE);
    // }























    // public function add()
    // {
    //     InputValidator([
    //         'nm_kelas_ukt' => 'required',
    //         'nominal_ukt' => 'required',
    //     ]);

    //     $id_kelas_ukt = guid();
    //     $nm_kelas_ukt = $this->request->input('nm_kelas_ukt');
    //     $nominal_ukt = $this->request->input('nominal_ukt');
    //     $id_creator = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    //     $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

    //     DB::beginTransaction();
    //     try {
    //         $this->kelasukt->create([
    //             'id_kelas_ukt' => $id_kelas_ukt,
    //             'nm_kelas_ukt' => $nm_kelas_ukt,
    //             'nominal_ukt' => $nominal_ukt,
    //             'soft_delete' => 0,
    //             'create_date' => currDateTime(),
    //             'id_creator' => $id_creator,
    //             'last_update' => currDateTime(),
    //             'id_updater' => $id_updater,
    //             'last_sync' => currDateTime(),
    //         ]);

    //         DB::commit();
    //         return WrapResponse(array('data' => array('id_kelas_ukt' => $id_kelas_ukt)), 'sukses menambahkan kelas ukt', TRUE);
    //     } catch (ModelNotFoundException $mnfe) {
    //         DB::rollBack();
    //         Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
    //         return WrapResponse(['data' => null], 'kelas ukt tidak dapat ditambahkan', FALSE);
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         Log::error($e->getMessage() . ' on line ' . $e->getLine());
    //         return WrapResponse(['data' => null], 'gagal menambahkan kelas ukt', FALSE);
    //     }
    // }

    // public function update()
    // {
    //     InputValidator([
    //         'id_kelas_ukt' => 'required|uuid',
    //         'nm_kelas_ukt' => 'required',
    //         'nominal_ukt' => 'required|numeric',
    //     ]);

    //     $id_kelas_ukt = $this->request->input('id_kelas_ukt');
    //     $nm_kelas_ukt = $this->request->input('nm_kelas_ukt');
    //     $nominal_ukt = $this->request->input('nominal_ukt');
    //     $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

    //     DB::beginTransaction();
    //     try {
    //         $kelasukt = $this->kelasukt->where('id_kelas_ukt', $id_kelas_ukt)->first();
    //         if (!$kelasukt) return WrapResponse(['data' => null], 'kelas ukt tidak ditemukan atau tidak terdaftar', FALSE);

    //         $this->kelasukt->update([
    //             'nm_kelas_ukt' => $nm_kelas_ukt,
    //             'nominal_ukt' => $nominal_ukt,
    //             'soft_delete' => 0,
    //             'last_update' => currDateTime(),
    //             'id_updater' => $id_updater,
    //         ]);

    //         DB::commit();
    //         return WrapResponse(array('data' => array('id_kelas_ukt' => $id_kelas_ukt)), 'sukses menambahkan kelas ukt', TRUE);
    //     } catch (ModelNotFoundException $mnfe) {
    //         DB::rollBack();
    //         Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
    //         return WrapResponse(['data' => null], 'kelas ukt tidak dapat ditambahkan', FALSE);
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         Log::error($e->getMessage() . ' on line ' . $e->getLine());
    //         return WrapResponse(['data' => null], 'gagal menambahkan kelas ukt', FALSE);
    //     }
    // }

    // public function delete()
    // {
    //     $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
    //     $id_kelas_ukt = $this->request->input('id_kelas_ukt');

    //     InputValidator([
    //         'id_kelas_ukt' => 'required|uuid',
    //     ]);

    //     DB::beginTransaction();
    //     try {
    //         $this->kelasukt->where('id_kelas_ukt', $id_kelas_ukt)->update([
    //             'soft_delete' => 1,
    //             'last_update' => currDateTime(),
    //             'id_updater' => $id_updater
    //         ]);
    //         DB::commit();
    //         return WrapResponse(array('data' => array('id_kelas_ukt' => $id_kelas_ukt)), 'berhasil menghapus data kelas ukt akademik', TRUE);
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
    //         return WrapResponse(['data' => null], 'gagal menghapus data kelas ukt akademik', FALSE);
    //     }
    // }
}
