<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\NilaiSmtMhs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class KelasController extends Controller
{
    protected $request;
    protected $kelasKuliah;
    protected $nilaiMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kelasKuliah = new KelasKuliah();
        $this->nilaiMhs = new NilaiSmtMhs();
    }

    public function index()
    {
        $idProdi = $this->request->input('idProdi', NULL);
        $idSmt = $this->request->input('idSmt', NULL);

        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idProdi' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',],
            ['idSmt' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idSmt.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        DB::beginTransaction();
        try {
            $query = "
            SELECT
                kk.id_kls,
                smt.nm_smt,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                kk.nm_kls,
                mk.kode_mk,
                mk.nm_mk,
                mk.sks_mk,
                CASE
                    WHEN mk.jns_mk = 'A' THEN 'Wajib'
                    WHEN mk.jns_mk = 'B' THEN 'Pilihan'
                    WHEN mk.jns_mk = 'C' THEN 'Wajib peminatan'
                    WHEN mk.jns_mk = 'D' THEN 'Pilihan peminatan'
                    WHEN mk.jns_mk = 'S' THEN 'Tugas'
                END AS status,
                kk.create_date AS waktu_data_ditambahkan,
                kk.last_update AS terakhir_diubah
            FROM
                pdrd.kelas_kuliah AS kk WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                AND sms.id_sms = '" . $idProdi . "'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kk.id_smt
                AND smt.id_smt = '". $idSmt ."'
                AND smt.expired_date IS NULL
            WHERE
                kk.soft_delete = 0
            ORDER BY
                smt.nm_smt DESC ";

            // $query = DB::connection('sqlsrv_live')->select($query);
            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $kelas = DB::select($query);
            if (empty($kelas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar kelas yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($kelas as $each_data) {
                $data[] = [
                    'id_kls' => $each_data->id_kls,
                    'nm_smt' => $each_data->nm_smt,
                    'nm_prodi' => $each_data->nm_prodi,
                    'nm_kls' => $each_data->nm_kls,
                    'kode_mk' => $each_data->kode_mk,
                    'nm_mk' => $each_data->nm_mk,
                    'sks_mk' => $each_data->sks_mk,
                    'status' => $each_data->status,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar kelas', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'berhasil mendapatkan daftar kelas', TRUE);
    }

    public function store()
    {

        InputValidator([
            'id_smt' => 'required|numeric',
            'id_sms' => 'required',
            'id_mk' => 'required',
            'nm_kls' => 'required',
            'a_selenggara_pditt' => 'required',
            'a_pengguna_pditt' => 'required',
            'kuota_pditt' => 'required',
        ]);

        //kelas kuliah
        $id_kls = guid();
        $id_smt  = $this->request->input('id_smt');
        $id_sms  = $this->request->input('id_sms');
        $id_mk = $this->request->input('id_mk');
        $sks_mk  = $this->request->input('sks_mk');
        $sks_tm  = $this->request->input('sks_tm');
        $sks_prak  = $this->request->input('sks_prak');
        $sks_prak_lap  = $this->request->input('sks_prak_lap');
        $sks_sim  = $this->request->input('sks_sim');
        $nm_kls  = $this->request->input('nm_kls');
        $bahasan_case =  $this->request->input('bahasan_case');
        $a_selenggara_pditt =  $this->request->input('a_selenggara_pditt');
        $a_pengguna_pditt =  $this->request->input('a_pengguna_pditt');
        $kuota_pditt =  $this->request->input('kuota_pditt');
        $kode_vclass =  $this->request->input('kode_vclass');
        $url_vclass =  $this->request->input('url_vclass');

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            DB::table('pdrd.kelas_kuliah')->insert([
                // $this->kelasKuliah->create([
                'id_kls' => $id_kls,
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                'id_mk' => $id_mk,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'nm_kls' => $nm_kls,
                'bahasan_case' => $bahasan_case,
                'a_selenggara_pditt' => $a_selenggara_pditt,
                'a_pengguna_pditt' => $a_pengguna_pditt,
                'kuota_pditt' => $kuota_pditt,
                'kode_vclass' => $kode_vclass,
                'url_vclass' => $url_vclass,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kls' => $id_kls)), 'sukses menambahkan kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kelas tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan kelas', FALSE);
        }
    }

    public function update()
    {

        InputValidator([
            'id_kls' => 'required',
            'id_smt' => 'required|numeric',
            'id_sms' => 'required',
            'id_mk' => 'required',
            'nm_kls' => 'required',
            'a_selenggara_pditt' => 'required',
            'a_pengguna_pditt' => 'required',
            'kuota_pditt' => 'required',
        ]);

        //kelas kuliah
        $id_kls = $this->request->input('id_kls');
        $id_smt  = $this->request->input('id_smt');
        $id_sms  = $this->request->input('id_sms');
        $id_mk = $this->request->input('id_mk');
        $sks_mk  = $this->request->input('sks_mk');
        $sks_tm  = $this->request->input('sks_tm');
        $sks_prak  = $this->request->input('sks_prak');
        $sks_prak_lap  = $this->request->input('sks_prak_lap');
        $sks_sim  = $this->request->input('sks_sim');
        $nm_kls  = $this->request->input('nm_kls');
        $bahasan_case =  $this->request->input('bahasan_case');
        $a_selenggara_pditt =  $this->request->input('a_selenggara_pditt');
        $a_pengguna_pditt =  $this->request->input('a_pengguna_pditt');
        $kuota_pditt =  $this->request->input('kuota_pditt');
        $kode_vclass =  $this->request->input('kode_vclass');
        $url_vclass =  $this->request->input('url_vclass');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $kelas = $this->kelasKuliah->where('id_kls', $id_kls)->first();
            if (!$kelas) return WrapResponse(['data' => null], 'id_kls tidak ditemukan atau tidak terdaftar', FALSE);

            $kelas->update([
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                'id_mk' => $id_mk,
                'sks_mk' => $sks_mk,
                'sks_tm' => $sks_tm,
                'sks_prak' => $sks_prak,
                'sks_prak_lap' => $sks_prak_lap,
                'sks_sim' => $sks_sim,
                'nm_kls' => $nm_kls,
                'bahasan_case' => $bahasan_case,
                'a_selenggara_pditt' => $a_selenggara_pditt,
                'a_pengguna_pditt' => $a_pengguna_pditt,
                'kuota_pditt' => $kuota_pditt,
                'kode_vclass' => $kode_vclass,
                'url_vclass' => $url_vclass,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kls' => $id_kls)), 'sukses mengubah kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kelas tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah kelas', FALSE);
        }
    }

    public function destroy()
    {

        InputValidator([
            'id_kls' => 'required',
        ]);

        //kelas kuliah
        $id_kls = $this->request->input('id_kls');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $kelas = $this->kelasKuliah->where('id_kls', $id_kls)->first();
            if (!$kelas) return WrapResponse(['data' => null], 'id_kls tidak ditemukan atau tidak terdaftar', FALSE);

            $kelas->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_kls' => $id_kls)), 'sukses menghapus kelas', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'kelas tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus kelas', FALSE);
        }
    }
}
