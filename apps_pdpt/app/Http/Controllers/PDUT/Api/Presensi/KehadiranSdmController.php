<?php

namespace App\Http\Controllers\PDUT\Api\Presensi;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Presensi\KehadiranSdm;
use App\Models\PDUT\Pdrd\Sdm;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class KehadiranSdmController extends Controller
{
    protected $request;
    protected $kehadiransdm;
    protected $sdm;

    protected $getListKehadiranBySdmId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kehadiransdm = new KehadiranSdm();
        $this->sdm = new Sdm();
        $this->cacheLifeTime = 3600;
        $this->getListKehadiranBySdmId = [];
    }
    public function getListKehadiranBySdmId()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50',
            'id_sdm.required' => 'field sdmid ini harus diisi',
            'id_sdm.uuid' => 'input sdmid harus berupa uuid yang valid',
            'sort_by.alpha' => 'input sortby penyortiran tidak sesuai',
            'sort_by.in' => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $sdmId = $this->request->input('id_sdm');
        $sortBy = $this->request->input('sort_by');
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        try {
            $query = "
            SELECT
                ks.id_kehadiran_sdm,
                sdm.nm_sdm AS sdm,
                sdm.nip AS nip,
                ks.tgl_hadir,
                ks.waktu_presensi,
                ks.lokasi_presensi,
                ks.waktu_pulang,
                ks.lokasi_pulang,
                ks.rencana_hari_ini,
                ks.realisasi_hari_ini,
                ks.create_date AS waktu_data_ditambahkan,
                ks.last_update AS terakhir_diubah
            FROM
                presensi.kehadiran_sdm AS ks
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = ks.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_sdm ='" . $sdmId . "'
            WHERE
                ks.soft_delete = 0
            ORDER BY
                ks.tgl_hadir " . $sortBy . "
        ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse([], "tidak ditemukan data kehadiran dari sdm id $sdmId", FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id_kehadiran_sdm' => $value->id_kehadiran_sdm,
                    'sdm' => $value->sdm,
                    'nip' => $value->nip,
                    'waktu_presensi' => $value->waktu_presensi,
                    'lokasi_presensi' => $value->lokasi_presensi,
                    'waktu_pulang' => $value->waktu_pulang,
                    'lokasi_pulang' => $value->lokasi_pulang,
                    'rencana_hari_ini' => $value->rencana_hari_ini,
                    'realisasi_hari_ini' => $value->realisasi_hari_ini,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
                ];
            }
            //     return WrapResponse([
            //         'page' => $pagination['page'],
            //         'limit' => $pagination['limit'],
            //         'data' => $data
            //     ], 'sukses');
            // }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data Periode PMB tidak ditemukan atau data Periode PMB tidak terdaftar", FALSE);
        }
    }

    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $get_data = $request->all();
        // if (empty($get_data['data'])) {
        //     return WrapResponse([], 'Data kosong silahkan diisi', FALSE);
        // }

        // InputValidator([
        //     'id_sdm' =>'required|uuid',
        //     'lokasi_presensi' => 'required|string',
        //     'rencana_hari_ini' => 'nullable|string',
        //     'realisasi_hari_ini' => 'nullable|string',
        // ]);

        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';

        // $id_sdm = $this->request->input('id_sdm');
        // $lokasi_presensi = $this->request->input('lokasi_presensi');
        // $rencana_hari_ini = $this->request->input('rencana_hari_ini');
        // $realisasi_hari_ini = $this->request->input('realisasi_hari_ini');

        DB::beginTransaction();
        try {
            $presensi = [];
            foreach ($get_data['data'] as $each_data) {

                $presensi = $this->kehadiransdm->create([
                    'id_kehadiran_sdm' => guid(),
                    'id_sdm' => $each_data['id_sdm'],
                    'tgl_hadir' => currDateTime(),
                    'id_creator' => $creatorId,
                    'id_updater' => $creatorId,
                    'waktu_presensi' => currDateTime(),
                    'lokasi_presensi' => $each_data['lokasi_presensi'],
                    'rencana_hari_ini' => $each_data['rencana_hari_ini'],
                    'realisasi_hari_ini' => $each_data['realisasi_hari_ini'],
                    'soft_delete' => 0,
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime()

                ]);
            }
            DB::commit();
            return WrapResponse([], 'sukses menambahkan data kehadiran');
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse([], 'data kehadiran tidak ditemukan atau data kehadiran tidak terdaftar', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan data kehadiran");
        }
    }


    public function update()
    {
        InputValidator([
            'id_kehadiran_sdm' => 'required|uuid',
            'id_sdm' => 'required|uuid',
            'lokasi_pulang' => 'required|string',
            'rencana_hari_ini' => 'nullable|string',
            'realisasi_hari_ini' => 'nullable|string',
        ]);



        $kehadiransdmId  = $this->request->input('id_kehadiran_sdm');
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';

        $id_sdm = $this->request->input('id_sdm');
        $lokasi_pulang = $this->request->input('lokasi_pulang');
        $rencana_hari_ini = $this->request->input('rencana_hari_ini');
        $realisasi_hari_ini = $this->request->input('realisasi_hari_ini');

        DB::beginTransaction();
        try {
            $presensi = $this->kehadiransdm->where('id_kehadiran_sdm', $kehadiransdmId)->first();
            if (!$presensi) return WrapResponse([], 'presensi tidak ditemukan atau presensi tidak terdaftar', FALSE);

            $presensi->update([
                'id_kehadiran_sdm' => $kehadiransdmId,
                'id_sdm' => $id_sdm,
                'tgl_hadir' => currDateTime(),
                'id_creator' => $creatorId,
                'id_updater' => $updateId,
                'waktu_pulang' => currDateTime(),
                'lokasi_pulang' => $lokasi_pulang,
                'rencana_hari_ini' => $rencana_hari_ini,
                'realisasi_hari_ini' => $realisasi_hari_ini,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);
            DB::commit();
            return WrapResponse([], 'sukses mengubah data kehadiran');
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse([], 'data kehadiran tidak ditemukan atau data kehadiran tidak terdaftar', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal mengubah data kehadiran");
        }
    }

    public function destroy($id)
    {
        //
    }
}
