<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\KurikulumSp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class KurikulumController extends Controller
{
    protected $request;
    protected $kurikulumSp;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kurikulumSp = new KurikulumSp();
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
                kurikulum.id_kurikulum_sp,
                kurikulum.nm_kurikulum_sp AS nm_kurikulum,
                smt.nm_smt,
                jenjang.nm_jenj_didik,
                sms.nm_lemb AS nm_prodi,
                kurikulum.jmlh_smt_normal,
                kurikulum.jmlh_sks_lulus,
                kurikulum.jmlh_sks_wajib,
                kurikulum.jmlh_sks_pilihan,
                kurikulum.jmlh_sks_mk_wajib,
                kurikulum.jmlh_sks_mk_pilih,
                kurikulum.a_digunakan,
                kurikulum.create_date AS waktu_data_ditambahkan,
                kurikulum.last_update AS terakhir_diubah
            FROM
                pdrd.kurikulum_sp AS kurikulum WITH(NOLOCK)
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kurikulum.id_sms
                AND sms.id_sms = '" . $idProdi . "'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = kurikulum.id_jenj_didik
                AND jenjang.expired_date IS NULL
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kurikulum.id_smt
                AND smt.expired_date IS NULL
            WHERE
                kurikulum.soft_delete = 0
            ORDER BY
                kurikulum.nm_kurikulum_sp ASC ";

            // $query = DB::connection('sqlsrv_live')->select($query);
            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $kurikulum = DB::select($query);
            if (empty($kurikulum)) {
                return WrapResponse(['data' => null], 'tidak ada daftar kurikulum yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($kurikulum as $each_data) {
                $data[] = [
                    'id_kurikulum_sp' => $each_data->id_kurikulum_sp,
                    'nm_kurikulum' => $each_data->nm_kurikulum,
                    'nm_smt' => $each_data->nm_smt,
                    'nm_jenj_didik' => $each_data->nm_jenj_didik,
                    'nm_prodi' => $each_data->nm_prodi,
                    'jmlh_smt_normal' => $each_data->jmlh_smt_normal,
                    'jmlh_sks_lulus' => $each_data->jmlh_sks_lulus,
                    'jmlh_sks_wajib' => $each_data->jmlh_sks_wajib,
                    'jmlh_sks_pilihan' => $each_data->jmlh_sks_pilihan,
                    'jmlh_sks_mk_wajib' => $each_data->jmlh_sks_mk_wajib,
                    'jmlh_sks_mk_pilih' => $each_data->jmlh_sks_mk_pilih,
                    'a_digunakan' => $each_data->a_digunakan,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar kurikulum', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar kurikulum', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_jenj_didik' => 'required|numeric',
            'id_smt' => 'required',
            'id_sms' => 'required',
            'nm_kurikulum_sp' => 'required',
            'jmlh_smt_normal' => 'required',
            'jmlh_sks_lulus' => 'required',
            'jmlh_sks_wajib' => 'required',
            'jmlh_sks_pilihan' => 'required',
            'jmlh_sks_mk_wajib' => 'required',
            'jmlh_sks_mk_pilih' => 'required',
        ]);

        $id_kurikulum_sp = guid();
        $id_jenj_didik = $this->request->input('id_jenj_didik');
        $id_smt = $this->request->input('id_smt');
        $id_sms = $this->request->input('id_sms');
        $nm_kurikulum_sp = $this->request->input('nm_kurikulum_sp');
        $jmlh_smt_normal = $this->request->input('jmlh_smt_normal');
        $jmlh_sks_lulus = $this->request->input('jmlh_sks_lulus');
        $jmlh_sks_wajib = $this->request->input('jmlh_sks_wajib');
        $jmlh_sks_pilihan = $this->request->input('jmlh_sks_pilihan');
        $jmlh_sks_mk_wajib = $this->request->input('jmlh_sks_mk_wajib');
        $jmlh_sks_mk_pilih = $this->request->input('jmlh_sks_mk_pilih');
        $a_digunakan = 1;

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->kurikulumSp->create([
                'id_kurikulum_sp' => $id_kurikulum_sp,
                'id_jenj_didik' => $id_jenj_didik,
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                'nm_kurikulum_sp' => $nm_kurikulum_sp,
                'jmlh_smt_normal' => $jmlh_smt_normal,
                'jmlh_sks_lulus' => $jmlh_sks_lulus,
                'jmlh_sks_wajib' => $jmlh_sks_wajib,
                'jmlh_sks_pilihan' => $jmlh_sks_pilihan,
                'jmlh_sks_mk_wajib' => $jmlh_sks_mk_wajib,
                'jmlh_sks_mk_pilih' => $jmlh_sks_mk_pilih,
                'jmlh_sks_mk_pilih' => $jmlh_sks_mk_pilih,
                'a_digunakan' => $a_digunakan,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kurikulum_sp' => $id_kurikulum_sp)), 'sukses menambahkan kurikulum', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kurikulum tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan kurikulum', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_kurikulum_sp' => 'required',
            'id_jenj_didik' => 'required|numeric',
            'id_smt' => 'required',
            'id_sms' => 'required',
            'nm_kurikulum_sp' => 'required',
            'jmlh_smt_normal' => 'required',
            'jmlh_sks_lulus' => 'required',
            'jmlh_sks_wajib' => 'required',
            'jmlh_sks_pilihan' => 'required',
            'jmlh_sks_mk_wajib' => 'required',
            'jmlh_sks_mk_pilih' => 'required',
            'a_digunakan' => 'required|numeric',
        ]);

        $id_kurikulum_sp = $this->request->input('id_kurikulum_sp');
        $id_jenj_didik = $this->request->input('id_jenj_didik');
        $id_smt = $this->request->input('id_smt');
        $id_sms = $this->request->input('id_sms');
        $nm_kurikulum_sp = $this->request->input('nm_kurikulum_sp');
        $jmlh_smt_normal = $this->request->input('jmlh_smt_normal');
        $jmlh_sks_lulus = $this->request->input('jmlh_sks_lulus');
        $jmlh_sks_wajib = $this->request->input('jmlh_sks_wajib');
        $jmlh_sks_pilihan = $this->request->input('jmlh_sks_pilihan');
        $jmlh_sks_mk_wajib = $this->request->input('jmlh_sks_mk_wajib');
        $jmlh_sks_mk_pilih = $this->request->input('jmlh_sks_mk_pilih');
        $a_digunakan = $this->request->input('a_digunakan');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $kurikulum = $this->kurikulumSp->where('id_kurikulum_sp', $id_kurikulum_sp)->first();
            if (!$kurikulum) return WrapResponse(['data' => null], 'id_kurikulum_sp tidak ditemukan atau tidak terdaftar', FALSE);

            $kurikulum->update([
                'id_jenj_didik' => $id_jenj_didik,
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                'nm_kurikulum_sp' => $nm_kurikulum_sp,
                'jmlh_smt_normal' => $jmlh_smt_normal,
                'jmlh_sks_lulus' => $jmlh_sks_lulus,
                'jmlh_sks_wajib' => $jmlh_sks_wajib,
                'jmlh_sks_pilihan' => $jmlh_sks_pilihan,
                'jmlh_sks_mk_wajib' => $jmlh_sks_mk_wajib,
                'jmlh_sks_mk_pilih' => $jmlh_sks_mk_pilih,
                'jmlh_sks_mk_pilih' => $jmlh_sks_mk_pilih,
                'a_digunakan' => $a_digunakan,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kurikulum_sp' => $id_kurikulum_sp)), 'sukses mengubah kurikulum', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kurikulum tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah kurikulum', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_kurikulum_sp' => 'required',
        ]);

        $id_kurikulum_sp = $this->request->input('id_kurikulum_sp');
        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $kurikulum = $this->kurikulumSp->where('id_kurikulum_sp', $id_kurikulum_sp)->first();
            if (!$kurikulum) return WrapResponse(['data' => null], 'id_kurikulum_sp tidak ditemukan atau tidak terdaftar', FALSE);

            $kurikulum->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kurikulum_sp' => $id_kurikulum_sp)), 'sukses menghapus kurikulum', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kurikulum tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus kurikulum', FALSE);
        }
    }
}
