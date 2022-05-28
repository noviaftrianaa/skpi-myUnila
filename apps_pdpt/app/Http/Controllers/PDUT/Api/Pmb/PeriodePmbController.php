<?php

namespace App\Http\Controllers\PDUT\Api\Pmb;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pmb\PeriodePmb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PeriodePmbController extends Controller
{
    protected $request;
    protected $periode_pmb;

    protected $getAllListPeriodePmb;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->periode_pmb = new PeriodePmb();
    }

    public function getAllListPeriodePmb()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50'
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }
        try {
            $query =  "
                        SELECT
                            prd_pmb.id_periode_pmb,
                            prd_pmb.id_pembiayaan,
                            prd_pmb.id_jenj_didik,
                            prd_pmb.id_jns_daftar,
                            prd_pmb.id_thn_ajaran,
                            ta.nm_thn_ajaran,
                            prd_pmb.id_jalur_daftar,
                            prd_pmb.nm_periode_pmb AS periode_pmb,
                            jp.nm_jenj_didik AS jenjang_didik,
                            j_pendaftaran.nm_jns_daftar AS jenis_daftar,
                            ta.nm_thn_ajaran AS tahun_ajaran,
                            jd.nm_jalur_daftar AS jalur_daftar,
                            prd_pmb.gelombang,
                            prd_pmb.smt,
                            prd_pmb.a_internal
                        FROM
                            pmb.periode_pmb AS prd_pmb WITH(NOLOCK)
                            LEFT JOIN ref.pembiayaan as pembiayaan ON pembiayaan.id_pembiayaan = prd_pmb.id_pembiayaan
                            AND pembiayaan.expired_date IS NULL
                            LEFT JOIN ref.jenjang_pendidikan as jp ON jp.id_jenj_didik = prd_pmb.id_jenj_didik
                            AND jp.expired_date IS NULL
                            LEFT JOIN ref.jenis_pendaftaran as j_pendaftaran ON j_pendaftaran.id_jns_daftar = prd_pmb.id_jns_daftar
                            AND j_pendaftaran.expired_date IS NULL
                            LEFT JOIN ref.tahun_ajaran as ta ON ta.id_thn_ajaran = prd_pmb.id_thn_ajaran
                            AND ta.expired_date IS NULL
                            LEFT JOIN ref.jalur_daftar as jd ON jd.id_jalur_daftar = prd_pmb.id_jalur_daftar
                            AND jd.expired_date IS NULL
                        WHERE
                            prd_pmb.soft_delete = 0
                        ORDER BY
                        prd_pmb.nm_periode_pmb " . $sortby . "
                        ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data PMB', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id_periode_pmb' => $value->id_periode_pmb,
                    'periode_pmb' => $value->periode_pmb,
                    'jenjang_didik' => $value->jenjang_didik,
                    'jenis_daftar' => $value->jenis_daftar,
                    'nm_thn_ajaran' => $value->nm_thn_ajaran,
                    'jalur_daftar' => $value->jalur_daftar,
                    'gelombang' => $value->gelombang,
                    'smt' => $value->smt,
                    'a_internal' => $value->a_internal
                ];
            }
            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data Periode PMB tidak ditemukan atau data Periode PMB tidak terdaftar", FALSE);
        }
    }

    public function tambah()
    {
        InputValidator([
            'id_pembiayaan' => 'required|numeric',
            'id_jenj_didik' => 'required|numeric',
            'id_jns_daftar' => 'required|numeric',
            'id_thn_ajaran' => 'required|numeric',
            'id_jalur_daftar' => 'required|numeric',
            'nm_periode_pmb' => 'required|string',
            'gelombang' => 'nullable|numeric',
            'smt' => 'nullable|numeric',
            'a_internal' => 'nullable|numeric'
        ]);

        $id_periode_pmb = guid();
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_pembiayaan = $this->request->input('id_pembiayaan');
        $id_jenj_didik = $this->request->input('id_jenj_didik');
        $id_jns_daftar = $this->request->input('id_jns_daftar');
        $id_thn_ajaran = $this->request->input('id_thn_ajaran');
        $id_jalur_daftar = $this->request->input('id_jalur_daftar');
        $nm_periode_pmb = $this->request->input('nm_periode_pmb');
        $gelombang = $this->request->input('gelombang');
        $smt = $this->request->input('smt');
        $a_internal = $this->request->input('a_internal');
        $create_date = currDateTime();
        $last_update = currDateTime();
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->periode_pmb->create([
                'id_periode_pmb' => $id_periode_pmb,
                'id_pembiayaan' => $id_pembiayaan,
                'id_jenj_didik' => $id_jenj_didik,
                'id_jns_daftar' => $id_jns_daftar,
                'id_thn_ajaran' => $id_thn_ajaran,
                'id_jalur_daftar' => $id_jalur_daftar,
                'nm_periode_pmb' => $nm_periode_pmb,
                'gelombang' => $gelombang,
                'smt' => $smt,
                'a_internal' => $a_internal,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_pmb' => $id_periode_pmb)), 'sukses menambahkan data Periode PMB', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Periode PMB tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan data Periode PMB', FALSE);
        }
    }

    public function ubahPeriodePmb()
    {
        InputValidator([
            'id_periode_pmb' => 'required|uuid',
            'id_pembiayaan' => 'required|numeric',
            'id_jenj_didik' => 'required|numeric',
            'id_jns_daftar' => 'required|numeric',
            'id_thn_ajaran' => 'required|numeric',
            'id_jalur_daftar' => 'required|numeric',
            'nm_periode_pmb' => 'required|string',
            'gelombang' => 'nullable|numeric',
            'smt' => 'nullable|numeric',
            'a_internal' => 'nullable|numeric'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_periode_pmb = $this->request->input('id_periode_pmb');
        $id_pembiayaan = $this->request->input('id_pembiayaan');
        $id_jenj_didik = $this->request->input('id_jenj_didik');
        $id_jns_daftar = $this->request->input('id_jns_daftar');
        $id_thn_ajaran = $this->request->input('id_thn_ajaran');
        $id_jalur_daftar = $this->request->input('id_jalur_daftar');
        $nm_periode_pmb = $this->request->input('nm_periode_pmb');
        $gelombang = $this->request->input('gelombang');
        $smt = $this->request->input('smt');
        $a_internal = $this->request->input('a_internal');
        $create_date = currDateTime();
        $last_update = currDateTime();
        $soft_delete = 0;
        $last_sync = currDateTime();


        DB::beginTransaction();
        try {
            $periode_pmb = $this->periode_pmb->where('id_periode_pmb', $id_periode_pmb)->first();
            if (!$periode_pmb) return WrapResponse(['data' => null], 'id_periode_pmb tidak ditemukan atau tidak terdaftar', FALSE);

            $periode_pmb->update([
                'id_periode_pmb' => $id_periode_pmb,
                'id_pembiayaan' => $id_pembiayaan,
                'id_jenj_didik' => $id_jenj_didik,
                'id_jns_daftar' => $id_jns_daftar,
                'id_thn_ajaran' => $id_thn_ajaran,
                'id_jalur_daftar' => $id_jalur_daftar,
                'nm_periode_pmb' => $nm_periode_pmb,
                'gelombang' => $gelombang,
                'smt' => $smt,
                'a_internal' => $a_internal,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_pmb' => $id_periode_pmb)), 'sukses mengubah data Periode PMB', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Periode PMB tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah data Periode PMB', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_periode_pmb' => 'required',
        ]);

        $id_periode_pmb = $this->request->input('id_periode_pmb');
        $last_update = currDateTime();
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $daftar_periode_pmb = $this->periode_pmb->where('id_periode_pmb', $id_periode_pmb)->first();
            if (!$daftar_periode_pmb) return WrapResponse(['data' => null], 'daftar Periode PMB tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar periode pmb
            $daftar_periode_pmb->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_pmb' => $id_periode_pmb)), 'sukses menghapus daftar data Periode PMB', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Periode PMB tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data Periode PMB', FALSE);
        }
    }
}
