<?php

namespace App\Http\Controllers\PDUT\Api\Presensi;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Presensi\KehadiranMhs;
// use App\Models\PDUT\Pdrd\RegPtk;
// use App\Models\PDUT\Pdrd\KelasKuliah;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class KehadiranMahasiswaController extends Controller
{
    protected $request;
    protected $kehadiranmhs;
    // protected $mhs;

    protected $getListKehadiranByMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kehadiranmhs = new KehadiranMhs();
        // $this->reg_ptk = new RegPtk();
        // $this->kelas_kuliah = new KelasKuliah();
        // $this->cacheLifeTime = 3600;
        // $this->getListKehadiranByMhsId = [];
    }

    public function getListKehadiranByMhs()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50',
            // 'sdmid.required' => 'field sdmid ini harus diisi',
            // 'sdmid.uuid' => 'input sdmid harus berupa uuid yang valid',
            // 'sortby.alpha' => 'input sortby penyortiran tidak sesuai',
            // 'sortby.in' => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        // $sdmId = $this->request->input('sdmid');
        $sortBy = $this->request->input('sortby');
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        try {
            $query = " SELECT
            hadir_mhs.id_hadir_mhs,
            hadir_mhs.id_reg_ptk,
            hadir_mhs.id_kls,
            sdm.nm_sdm,
            matkul.nm_mk,
            kls_kul.sks_mk,
            kls_kul.nm_kls,
            fak.nm_lemb AS fakultas,
            CONCAT(prodi.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
            hadir_mhs.tgl_hadir,
            hadir_mhs.waktu_presensi,
            hadir_mhs.stat_hadir
        FROM
            presensi.kehadiran_mhs AS hadir_mhs WITH (NOLOCK)
            LEFT JOIN pdrd.reg_ptk AS reg_ptk ON reg_ptk.id_reg_ptk = hadir_mhs.id_reg_ptk
            AND reg_ptk.soft_delete = 0
            LEFT JOIN pdrd.sdm AS sdm ON sdm.id_sdm = reg_ptk.id_sdm
            AND sdm.soft_delete = 0
            LEFT JOIN pdrd.kelas_kuliah AS kls_kul ON kls_kul.id_kls = hadir_mhs.id_kls
            AND kls_kul.soft_delete = 0
            LEFT JOIN pdrd.sms AS sms ON sms.id_sms=kls_kul.id_sms
               AND sms.soft_delete=0
            LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = kls_kul.id_sms
               AND prodi.soft_delete = 0
               LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
               AND fak.soft_delete = 0
               LEFT JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
               AND jenjang.expired_date IS NULL
             LEFT JOIN pdrd.matkul AS matkul ON matkul.id_mk=kls_kul.id_mk
               AND matkul.soft_delete =0
        WHERE
            hadir_mhs.soft_delete = 0
            ORDER BY
                fak.nm_lemb " . $sortBy . "
        ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse([], "tidak ditemukan data kehadiran mahasiswa", FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id_hadir_mhs' => $value->id_hadir_mhs,
                    'id_reg_ptk' => $value->id_reg_ptk,
                    'id_kls' => $value->id_kls,
                    'tgl_hadir' => date('Y-m-d', strtotime($value->tgl_hadir)),
                    'waktu_presensi' => date('H:i:s', strtotime($value->waktu_presensi)),
                    'stat_hadir' => $value->stat_hadir,
                    'nm_sdm' => $value->nm_sdm,
                    'nm_mk' => $value->nm_mk,
                    'sks_mk' => $value->sks_mk,
                    'nm_kls' => $value->nm_kls,
                    'fakultas' => $value->fakultas,
                    'prodi' => $value->prodi,

                ];
            }
            //     return WrapResponse([
            //         'page' => $pagination['page'],
            //         'count' => $pagination['count'],
            //         'data' => $data
            //     ], 'sukses');
            // }

        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar kehadiran mahasiswa', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar kehadiran mahasiswa', TRUE);
    }

    public function store(Request $request)
    {

        $get_data = $request->all();
        // // if (empty($get_data['data'])) {
        //     return WrapResponse([], 'Data kosong silahkan diisi', FALSE);
        // }

        // InputValidator([
        //     'id_reg_ptk' => 'required|uuid',
        //     'id_kls' => 'required|uuid',
        //     'tgl_hadir' => 'nullable|date',
        //     'waktu_presensi' => 'nullable|date',
        //     'stat_hadir' => 'required|string',

        // ]);


        $id_hadir_mhs = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';

        $id_reg_ptk = $this->request->input('id_reg_ptk');
        $id_kls = $this->request->input('id_kls');
        // $tgl_hadir = $this->request->input('tgl_hadir');
        // $waktu_presensi = $this->request->input('waktu_presensi');
        $stat_hadir = $this->request->input('stat_hadir');
        $tgl_hadir = $this->request->input('tgl_hadir');
        $waktu_presensi = $this->request->input('waktu_presensi');

        // $create_date = currDateTime();
        // $last_update = currDateTime();
        // $soft_delete = 0;
        // $last_sync = currDateTime();

        // $id_mk = guid();
        // $kode_mk = $this->request->input('kode_mk');
        // $nm_mk = $this->request->input('nm_mk');


        // $id_sms = guid();
        // $id_sdm = $this->request->input('id_sdm');

        // $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';



        // $id_sdm = $this->request->input('id_sdm');
        // $lokasi_presensi = $this->request->input('lokasi_presensi');
        // $rencana_hari_ini = $this->request->input('rencana_hari_ini');
        // $realisasi_hari_ini = $this->request->input('realisasi_hari_ini');

        DB::beginTransaction();

        // try {
        //     $presensi = [];
        //     foreach ($get_data['data'] as $each_data) {

        //         $presensi = $this->kehadiranmhs->create([
        //             // try {
        //             //     $this->kehadiranmhs->create([
        //             'id_reg_ptk' => $each_data['id_reg_ptk'],
        //             'id_kls' => $each_data['id_kls'],
        //             'id_hadir_mhs' => guid(),
        //             'tgl_hadir' => currDateTime(),
        //             'waktu_presensi' => currDateTime(),
        //             'stat_hadir' => $each_data['stat_hadir'],
        //             'create_date' => currDateTime(),
        //             'id_creator' => $creatorId,
        //             'last_update' => currDateTime(),
        //             'id_updater' => $creatorId,
        //             'soft_delete' => 0,
        //             'last_sync' => currDateTime()

        //         ]);
        //     }

        try {
            $this->kehadiranmhs->create([
                'id_reg_ptk' => $id_reg_ptk,
                'id_kls' => $id_kls,
                'id_hadir_mhs' => guid(),
                'tgl_hadir' => currDateTime(),
                'waktu_presensi' => currDateTime(),
                'stat_hadir' => $stat_hadir,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $creatorId,
                'soft_delete' => 0,
                'last_sync' => currDateTime()

            ]);
            //         DB::commit();
            //         return WrapResponse([], 'sukses menambahkan data Kehadiran Mahasiswa');
            //     } catch (ModelNotFoundException $mnfe) {
            //         DB::rollBack();
            //         Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            //         return WrapResponse([], 'data Kehadiran Mahasiswa tidak ditemukan atau data Kehadiran Mahasiswa tidak terdaftar', FALSE);
            //     } catch (Exception $e) {
            //         DB::rollBack();
            //         Log::error($e->getMessage() . ' on line ' . $e->getLine());
            //         return WrapResponse([], "gagal menambahkan data Kehadiran Mahasiswa ");
            //     }
            // }
            DB::commit();
            return WrapResponse(array('data' => array('id_hadir_mhs' => $id_hadir_mhs)), 'sukses menambahkan menambahkan data Kehadiran Mahasiswa', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'Kehadiran Mahasiswa tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan data Kehadiran Mahasiswa', FALSE);
        }
    }

    // public function update(Request $request)
    // {

    //     $get_data = $request->all();
    //     // // if (empty($get_data['data'])) {
    //     //     return WrapResponse([], 'Data kosong silahkan diisi', FALSE);
    //     // }

    //     // InputValidator([
    //     //     'id_reg_ptk' => 'required|uuid',
    //     //     'id_kls' => 'required|uuid',
    //     //     'tgl_hadir' => 'nullable|date',
    //     //     'waktu_presensi' => 'nullable|date',
    //     //     'stat_hadir' => 'required|string',

    //     // ]);


    //     $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';

    //     $id_hadir_mhs=$this->request->input('id_hadir_mhs');
    //     $id_reg_ptk = $this->request->input('id_reg_ptk');
    //     $id_kls = $this->request->input('id_kls');
    //     // $tgl_hadir = $this->request->input('tgl_hadir');
    //     // $waktu_presensi = $this->request->input('waktu_presensi');
    //     $stat_hadir = $this->request->input('stat_hadir');
    //     $tgl_hadir = $this->request->input('tgl_hadir');
    //     $waktu_presensi = $this->request->input('waktu_presensi');

    //     // $create_date = currDateTime();
    //     // $last_update = currDateTime();
    //     // $soft_delete = 0;
    //     // $last_sync = currDateTime();

    //     // $id_mk = guid();
    //     // $kode_mk = $this->request->input('kode_mk');
    //     // $nm_mk = $this->request->input('nm_mk');


    //     // $id_sms = guid();
    //     // $id_sdm = $this->request->input('id_sdm');

    //     // $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';



    //     // $id_sdm = $this->request->input('id_sdm');
    //     // $lokasi_presensi = $this->request->input('lokasi_presensi');
    //     // $rencana_hari_ini = $this->request->input('rencana_hari_ini');
    //     // $realisasi_hari_ini = $this->request->input('realisasi_hari_ini');

    //     DB::beginTransaction();

    //     // try {
    //     //     $presensi = [];
    //     //     foreach ($get_data['data'] as $each_data) {

    //     //         $presensi = $this->kehadiranmhs->create([
    //     //             // try {
    //     //             //     $this->kehadiranmhs->create([
    //     //             'id_reg_ptk' => $each_data['id_reg_ptk'],
    //     //             'id_kls' => $each_data['id_kls'],
    //     //             'id_hadir_mhs' => guid(),
    //     //             'tgl_hadir' => currDateTime(),
    //     //             'waktu_presensi' => currDateTime(),
    //     //             'stat_hadir' => $each_data['stat_hadir'],
    //     //             'create_date' => currDateTime(),
    //     //             'id_creator' => $creatorId,
    //     //             'last_update' => currDateTime(),
    //     //             'id_updater' => $creatorId,
    //     //             'soft_delete' => 0,
    //     //             'last_sync' => currDateTime()

    //     //         ]);
    //     //     }

    //     try {
    //         $this->kehadiranmhs->update([
    //             'id_hadir_mhs'=>$id_hadir_mhs,
    //             'id_reg_ptk' => $id_reg_ptk,
    //             'id_kls' => $id_kls,
    //             'id_hadir_mhs' => guid(),
    //             'tgl_hadir' => currDateTime(),
    //             'waktu_presensi' => currDateTime(),
    //             'stat_hadir' => $stat_hadir,
    //             'create_date' => currDateTime(),
    //             'id_creator' => $creatorId,
    //             'last_update' => currDateTime(),
    //             'id_updater' => $creatorId,
    //             'soft_delete' => 0,
    //             'last_sync' => currDateTime()

    //         ]);
    //         //         DB::commit();
    //         //         return WrapResponse([], 'sukses menambahkan data Kehadiran Mahasiswa');
    //         //     } catch (ModelNotFoundException $mnfe) {
    //         //         DB::rollBack();
    //         //         Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
    //         //         return WrapResponse([], 'data Kehadiran Mahasiswa tidak ditemukan atau data Kehadiran Mahasiswa tidak terdaftar', FALSE);
    //         //     } catch (Exception $e) {
    //         //         DB::rollBack();
    //         //         Log::error($e->getMessage() . ' on line ' . $e->getLine());
    //         //         return WrapResponse([], "gagal menambahkan data Kehadiran Mahasiswa ");
    //         //     }
    //         // }
    //         DB::commit();
    //         return WrapResponse(array('data' => array('id_hadir_mhs' => $id_hadir_mhs)), 'sukses mengubah data Kehadiran Mahasiswa', TRUE);
    //     } catch (ModelNotFoundException $mnfe) {
    //         DB::rollBack();
    //         Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
    //         return WrapResponse(['data' => null], 'Kehadiran Mahasiswa tidak dapat diubah', FALSE);
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         Log::error($e->getMessage() . ' on line ' . $e->getLine());
    //         return WrapResponse(['data' => null], 'gagal mengubah data Kehadiran Mahasiswa', FALSE);
    //     }
    // }


}
