<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\KurikulumSp;
use App\Models\PDUT\Pdrd\Matkul;
use App\Models\PDUT\Pdrd\MatkulKurikulum;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MataKuliahController extends Controller
{
    protected $request;
    protected $kurikulumSp;
    protected $matkulKurikulum;
    protected $matkul;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kurikulumSp = new KurikulumSp();
        $this->matkulKurikulum = new MatkulKurikulum();
        $this->matkul = new Matkul();
    }

    public function index()
    {
        $idProdi = $this->request->input('id_prodi', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50',
            'id_prodi' => 'required|uuid'
        ]);

        DB::beginTransaction();
        try {
            $query = "
            SELECT
                matkur.id_kurikulum_sp,
                mk.id_mk,
                mk.kode_mk,
                sms.id_sms,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                mk.nm_mk,
                mk.sks_mk,
                matkur.smt AS semester,
                CASE
                    WHEN mk.jns_mk = 'A' THEN 'Wajib'
                    WHEN mk.jns_mk = 'B' THEN 'Pilihan'
                    WHEN mk.jns_mk = 'C' THEN 'Wajib peminatan'
                    WHEN mk.jns_mk = 'D' THEN 'Pilihan peminatan'
                    WHEN mk.jns_mk = 'S' THEN 'Tugas'
                END AS status,
                mk.tgl_mulai_efektif,
                mk.create_date AS waktu_data_ditambahkan,
                mk.last_update AS terakhir_diubah
            FROM
                pdrd.matkul AS mk WITH(NOLOCK)
                LEFT JOIN pdrd.matkul_kurikulum AS matkur WITH(NOLOCK) ON matkur.id_mk = mk.id_mk
                AND matkur.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.id_sms = '" . $idProdi . "'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
            --  mk.jns_mk IN ('A', 'B', 'C', 'D', 'S')
            --  AND matkur.smt IS NOT NULL
            --  AND mk.tgl_mulai_efektif IS NOT NULL
                mk.soft_delete = 0
            ORDER BY
                mk.nm_mk, matkur.smt DESC ";

            // $query = DB::connection('sqlsrv_live')->select($query);
            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $matkul = DB::select($query);
            if (empty($matkul)) {
                return WrapResponse(['data' => null], 'tidak ada daftar mata kuliah yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($matkul as $each_data) {
                $data[] = [
                    'id_kurikulum_sp' => $each_data->id_kurikulum_sp,
                    'id_mk' => $each_data->id_mk,
                    'id_sms' => $each_data->id_sms,
                    'nm_prodi' => $each_data->nm_prodi,
                    'kode_mk' => $each_data->kode_mk,
                    'nm_mk' => $each_data->nm_mk,
                    'sks_mk' => $each_data->sks_mk,
                    'status' => $each_data->status,
                    'semester' => $each_data->semester,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar mata kuliah', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar mata kuliah', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_jenj_didik' => 'required|numeric',
            'id_kurikulum_sp' => 'required',
            'kode_mk' => 'required',
        ]);

        // mk
        $id_mk = guid();
        $id_sms  = $this->request->input('id_sms');
        $id_jenj_didik  = $this->request->input('id_jenj_didik');
        $sks_mk  = $this->request->input('sks_mk');
        $sks_tm  = $this->request->input('sks_tm');
        $sks_prak  = $this->request->input('sks_prak');
        $sks_prak_lap  = $this->request->input('sks_prak_lap');
        $sks_sim  = $this->request->input('sks_sim');
        $kode_mk  = $this->request->input('kode_mk');
        $nm_mk  = $this->request->input('nm_mk');
        $jns_mk  = $this->request->input('jns_mk');
        $kel_mk  = $this->request->input('kel_mk');
        $metode_pelaksanaan_kuliah  = $this->request->input('metode_pelaksanaan_kuliah');
        $a_sap  = $this->request->input('a_sap');
        $a_silabus  = $this->request->input('a_silabus');
        $a_bahan_ajar  = $this->request->input('a_bahan_ajar');
        $acara_prak  = $this->request->input('acara_prak');
        $a_diktat  = $this->request->input('a_diktat');
        $tgl_mulai_efektif  = $this->request->input('tgl_mulai_efektif');
        $tgl_akhir_efektif  = $this->request->input('tgl_akhir_efektif');

        //matkul kurikulum
        $id_kurikulum_sp  = $this->request->input('id_kurikulum_sp');
        $smt  = $this->request->input('smt');
        $a_wajib  = $this->request->input('a_wajib');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $matkul = $this->matkul->create([
                'id_mk' => $id_mk,
                'id_sms' => $id_sms,
                'id_jenj_didik' => $id_jenj_didik,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'kode_mk' => $kode_mk,
                'nm_mk' => $nm_mk,
                'jns_mk' => $jns_mk,
                'kel_mk' => $kel_mk,
                'metode_pelaksanaan_kuliah' => $metode_pelaksanaan_kuliah,
                'a_sap' => $a_sap,
                'a_silabus' => $a_silabus,
                'a_bahan_ajar' => $a_bahan_ajar,
                'acara_prak' => $acara_prak,
                'a_diktat' => $a_diktat,
                'tgl_mulai_efektif' => $tgl_mulai_efektif,
                'tgl_akhir_efektif' => $tgl_akhir_efektif,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            $this->matkulKurikulum->create([
                'id_kurikulum_sp' => $id_kurikulum_sp,
                'id_mk' => $matkul->id_mk,
                'smt' => $smt,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'a_wajib' => $a_wajib,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_mk' => $id_mk)), 'sukses menambahkan mata kuliah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'mata kuliah tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan mata kuliah', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_mk' => 'required',
            'id_jenj_didik' => 'required|numeric',
            'id_kurikulum_sp' => 'required',
            'kode_mk' => 'required',
        ]);

        // mk
        $id_mk = $this->request->input('id_mk');
        $id_sms  = $this->request->input('id_sms');
        $id_jenj_didik  = $this->request->input('id_jenj_didik');
        $sks_mk  = $this->request->input('sks_mk');
        $sks_tm  = $this->request->input('sks_tm');
        $sks_prak  = $this->request->input('sks_prak');
        $sks_prak_lap  = $this->request->input('sks_prak_lap');
        $sks_sim  = $this->request->input('sks_sim');
        $kode_mk  = $this->request->input('kode_mk');
        $nm_mk  = $this->request->input('nm_mk');
        $jns_mk  = $this->request->input('jns_mk');
        $kel_mk  = $this->request->input('kel_mk');
        $metode_pelaksanaan_kuliah  = $this->request->input('metode_pelaksanaan_kuliah');
        $a_sap  = $this->request->input('a_sap');
        $a_silabus  = $this->request->input('a_silabus');
        $a_bahan_ajar  = $this->request->input('a_bahan_ajar');
        $acara_prak  = $this->request->input('acara_prak');
        $a_diktat  = $this->request->input('a_diktat');
        $tgl_mulai_efektif  = $this->request->input('tgl_mulai_efektif');
        $tgl_akhir_efektif  = $this->request->input('tgl_akhir_efektif');

        //matkul kurikulum
        $id_kurikulum_sp  = $this->request->input('id_kurikulum_sp');
        $smt  = $this->request->input('smt');
        $a_wajib  = $this->request->input('a_wajib');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $matkul = $this->matkul->where('id_mk', $id_mk)->first();
            if (!$matkul) return WrapResponse(['data' => null], 'id_mk tidak ditemukan atau tidak terdaftar', FALSE);

            $matkul->update([
                'id_mk' => $id_mk,
                'id_sms' => $id_sms,
                'id_jenj_didik' => $id_jenj_didik,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'kode_mk' => $kode_mk,
                'nm_mk' => $nm_mk,
                'jns_mk' => $jns_mk,
                'kel_mk' => $kel_mk,
                'metode_pelaksanaan_kuliah' => $metode_pelaksanaan_kuliah,
                'a_sap' => $a_sap,
                'a_silabus' => $a_silabus,
                'a_bahan_ajar' => $a_bahan_ajar,
                'acara_prak' => $acara_prak,
                'a_diktat' => $a_diktat,
                'tgl_mulai_efektif' => $tgl_mulai_efektif,
                'tgl_akhir_efektif' => $tgl_akhir_efektif,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            $matkulKurikulum = $this->matkulKurikulum->where('id_kurikulum_sp', $id_kurikulum_sp)->where('id_mk', $id_mk)->first();
            if (!$matkulKurikulum) return WrapResponse(['data' => null], 'id_kurikulum_sp tidak ditemukan atau tidak terdaftar', FALSE);

            $matkulKurikulum->update([
                'id_kurikulum_sp' => $id_kurikulum_sp,
                'id_mk' => $matkul->id_mk,
                'smt' => $smt,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'a_wajib' => $a_wajib,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_mk' => $id_mk)), 'sukses mengubah mata kuliah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'mata kuliah tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah mata kuliah', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_mk' => 'required',
            'id_kurikulum_sp' => 'required',
        ]);

        // mk
        $id_mk = $this->request->input('id_mk');
        $id_kurikulum_sp = $this->request->input('id_kurikulum_sp');
        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $matkul = $this->matkul->where('id_mk', $id_mk)->first();
            if (!$matkul) return WrapResponse(['data' => null], 'id_mk tidak ditemukan atau tidak terdaftar', FALSE);

            $matkul->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            $matkulKurikulum = $this->matkulKurikulum->where('id_kurikulum_sp', $id_kurikulum_sp)->where('id_mk', $id_mk)->first();
            if (!$matkulKurikulum) return WrapResponse(['data' => null], 'id_kurikulum_sp tidak ditemukan atau tidak terdaftar', FALSE);

            $matkulKurikulum->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_mk' => $id_mk)), 'sukses menghapus mata kuliah', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'mata kuliah tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus mata kuliah', FALSE);
        }
    }
}
