<?php

namespace App\Http\Controllers\PDUT\Api\Mbkm;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Mbkm\PeriodeKampusMerdeka;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;
use DB;

class PeriodeController extends Controller
{

    protected $request;
    protected $periodeMbkm;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->periodeMbkm = new PeriodeKampusMerdeka();
    }

    public function index()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50'
        ]);

        try {
            $query = "SELECT
                p_mbkm.id_periode_mbkm,
                smt.nm_smt AS semester,
                akt_mhs.nm_jns_akt_mhs AS jenis_aktivitas,
                p_mbkm.nm_periode_mbkm,
                p_mbkm.nm_penyelenggara,
                p_mbkm.waktu_mulai,
                p_mbkm.waktu_selesai,
                CASE
                    WHEN p_mbkm.a_aktif = 1 THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS status,
                p_mbkm.create_date AS waktu_data_ditambahkan,
                p_mbkm.last_update AS terakhir_diubah
            FROM
                mbkm.periode_kampus_merdeka AS p_mbkm
                LEFT JOIN ref.semester AS smt ON smt.id_smt = p_mbkm.id_smt
                AND smt.expired_date IS NULL
                LEFT JOIN ref.jenis_akt_mhs AS akt_mhs ON akt_mhs.id_jns_akt_mhs = p_mbkm.id_jns_akt_mhs
                AND akt_mhs.expired_date IS NULL
                ORDER BY smt.nm_smt DESC ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $periode = DB::select($query);
            if (empty($periode)) {
                return WrapResponse(['data' => null], 'tidak ada daftar periode mbkm yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($periode as $each_data) {
                $data[] = [
                    'id_periode_mbkm' => $each_data->id_periode_mbkm,
                    'semester' => $each_data->semester,
                    'jenis_aktivitas' => $each_data->jenis_aktivitas,
                    'nm_periode_mbkm' => $each_data->nm_periode_mbkm,
                    'nm_penyelenggara' => $each_data->nm_penyelenggara,
                    'waktu_mulai' => $each_data->waktu_mulai,
                    'waktu_selesai' => $each_data->waktu_selesai
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar periode mbkm', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar periode mbkm', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_smt' => 'required',
            'id_jns_akt_mhs' => 'required|numeric',
            'nm_periode_mbkm' => 'required',
            'nm_penyelenggara' => 'required',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
        ]);

        $id_periode_mbkm = guid();
        $id_smt = $this->request->input('id_smt');
        $id_jns_akt_mhs = $this->request->input('id_jns_akt_mhs');
        $nm_periode_mbkm = $this->request->input('nm_periode_mbkm');
        $nm_penyelenggara = $this->request->input('nm_penyelenggara');
        $waktu_mulai = $this->request->input('waktu_mulai');
        $waktu_selesai = $this->request->input('waktu_selesai');
        $a_aktif = 1;
        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();
        DB::beginTransaction();

        try {
            $this->periodeMbkm->create([
                'id_smt' => $id_smt,
                'id_jns_akt_mhs' => $id_jns_akt_mhs,
                'nm_periode_mbkm' => $nm_periode_mbkm,
                'id_periode_mbkm' => $id_periode_mbkm,
                'nm_penyelenggara' => $nm_penyelenggara,
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
                'a_aktif' => $a_aktif,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_mbkm' => $id_periode_mbkm)), 'sukses menambahkan periode mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'periode mbkm tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan periode mbkm', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_periode_mbkm' => 'required',
            'id_smt' => 'required',
            'id_jns_akt_mhs' => 'required|numeric',
            'nm_periode_mbkm' => 'required',
            'nm_penyelenggara' => 'required',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
        ]);

        $id_periode_mbkm = $this->request->input('id_periode_mbkm');
        $id_smt = $this->request->input('id_smt');
        $id_jns_akt_mhs = $this->request->input('id_jns_akt_mhs');
        $nm_periode_mbkm = $this->request->input('nm_periode_mbkm');
        $nm_penyelenggara = $this->request->input('nm_penyelenggara');
        $waktu_mulai = $this->request->input('waktu_mulai');
        $waktu_selesai = $this->request->input('waktu_selesai');
        $a_aktif = $this->request->input('a_aktif');
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';

        DB::beginTransaction();
        try {
            $periodeMbkm = $this->periodeMbkm->where('id_periode_mbkm', $id_periode_mbkm)->first();
            if (!$periodeMbkm) return WrapResponse(['data' => null], 'id_periode_mbkm tidak ditemukan atau tidak terdaftar', FALSE);

            $periodeMbkm->update([
                'id_smt' => $id_smt,
                'id_jns_akt_mhs' => $id_jns_akt_mhs,
                'nm_periode_mbkm' => $nm_periode_mbkm,
                'id_periode_mbkm' => $id_periode_mbkm,
                'nm_penyelenggara' => $nm_penyelenggara,
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
                'a_aktif' => $a_aktif,
                'last_update' => $last_update,
                'id_updater' => $id_updater
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_mbkm' => $id_periode_mbkm)), 'sukses mengubah periode mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'periode mbkm tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah periode mbkm', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_periode_mbkm' => 'required',
        ]);

        $id_periode_mbkm = $this->request->input('id_periode_mbkm');
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $daftar_mbkm = $this->periodeMbkm->where('id_periode_mbkm', $id_periode_mbkm)->first();
            if (!$daftar_mbkm) return WrapResponse(['data' => null], 'daftar mbkm tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar periode mbkm
            $daftar_mbkm->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_periode_mbkm' => $id_periode_mbkm)), 'sukses menghapus periode mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'periode mbkm tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus periode mbkm', FALSE);
        }
    }
}
