<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\AktAjarDosen;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\AktAjarDosenTransformer;

class AktAjarDosenController extends Controller
{
    protected $request;
    protected $aktAjarDosen;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->wrapResponse = new WrapResponse;
        $this->aktAjarDosen = new AktAjarDosen();
    }

    public function index()
    {
        $idKls = $this->request->input('idKls', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idKls' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idKls.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        $query = "
            SELECT
                ajar_dosen.id_ajar,
                sdm.nm_sdm,
                mk.nm_mk,
                ajar_dosen.sks_subst_tot,
                ajar_dosen.sks_tm_subst,
                ajar_dosen.sks_prak_subst,
                ajar_dosen.sks_prak_lap_subst,
                ajar_dosen.sks_sim_subst,
                ajar_dosen.jml_tm_renc,
                ajar_dosen.jml_tm_real,
                ajar_dosen.jml_mhs,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
                ajar_dosen.create_date AS waktu_data_ditambahkan,
                ajar_dosen.last_update AS terakhir_diubah
            FROM
                pdrd.akt_ajar_dosen AS ajar_dosen WITH(NOLOCK)
                LEFT JOIN pdrd.kelas_kuliah AS kelas WITH(NOLOCK) ON kelas.id_kls = ajar_dosen.id_kls
                AND kelas.soft_delete = 0
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_reg_ptk = ajar_dosen.id_reg_ptk
                AND ptk.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = ptk.id_sdm
                AND sdm.soft_delete = 0
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kelas.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
                ajar_dosen.id_kls = '". $idKls ."'
                AND ajar_dosen.soft_delete = 0
            ORDER BY
                sdm.nm_sdm ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar ajar dosen yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            ->setTransformer(new AktAjarDosenTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar ajar dosen')
            ->withSimplePagination()
            ->render($result->query());
    }

    public function store()
    {
        InputValidator([
            'id_kls' => 'required',
            'id_reg_ptk' => 'required',
            'sks_subst_tot' => 'required',
            'sks_tm_subst' => 'required',
            'sks_prak_subst' => 'required',
            'sks_prak_lap_subst' => 'required',
            'sks_sim_subst' => 'required',
            'jml_tm_renc' => 'required',
        ]);

        //akt_ajar_dosen
        $id_ajar = guid();
        $id_kls  = $this->request->input('id_kls');
        $id_reg_ptk  = $this->request->input('id_reg_ptk');
        $id_subst  = $this->request->input('id_subst');
        $katgiat_ajar_id_katgiat  = $this->request->input('katgiat_ajar_id_katgiat');
        $sks_subst_tot  = $this->request->input('sks_subst_tot');
        $sks_tm_subst  = $this->request->input('sks_tm_subst');
        $sks_prak_subst  = $this->request->input('sks_prak_subst');
        $sks_prak_lap_subst  = $this->request->input('sks_prak_lap_subst');
        $sks_sim_subst  = $this->request->input('sks_sim_subst');
        $jml_tm_renc  = $this->request->input('jml_tm_renc');
        $jml_tm_real  = $this->request->input('jml_tm_real');
        $jml_mhs  = $this->request->input('jml_mhs');
        $id_katgiat  = 110100;
        $id_jns_eval  = 1;

        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            DB::table('pdrd.akt_ajar_dosen')->insert([
            // $this->aktAjarDosen->create([
                'id_ajar' => $id_ajar,
                'id_kls' => $id_kls,
                'id_reg_ptk' => $id_reg_ptk,
                'id_katgiat' => $id_katgiat,
                'id_subst' => $id_subst,
                'katgiat_ajar_id_katgiat' => $katgiat_ajar_id_katgiat,
                'id_jns_eval' => $id_jns_eval,
                'sks_subst_tot' => $sks_subst_tot,
                'sks_tm_subst' => $sks_tm_subst,
                'sks_prak_subst' => $sks_prak_subst,
                'sks_prak_lap_subst' => $sks_prak_lap_subst,
                'sks_sim_subst' => $sks_sim_subst,
                'jml_tm_renc' => $jml_tm_renc,
                'jml_tm_real' => $jml_tm_real,
                'jml_mhs' => $jml_mhs,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_ajar' => $id_ajar)), 'sukses menambahkan dosen ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'dosen ajar tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan dosen ajar', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_ajar' => 'required',
            'id_kls' => 'required',
            'id_reg_ptk' => 'required',
            'sks_subst_tot' => 'required',
            'sks_tm_subst' => 'required',
            'sks_prak_subst' => 'required',
            'sks_prak_lap_subst' => 'required',
            'sks_sim_subst' => 'required',
            'jml_tm_renc' => 'required',
        ]);

        //akt_ajar_dosen
        $id_ajar = $this->request->input('id_ajar');
        $id_kls  = $this->request->input('id_kls');
        $id_reg_ptk  = $this->request->input('id_reg_ptk');
        $id_subst  = $this->request->input('id_subst');
        $katgiat_ajar_id_katgiat  = $this->request->input('katgiat_ajar_id_katgiat');
        $sks_subst_tot  = $this->request->input('sks_subst_tot');
        $sks_tm_subst  = $this->request->input('sks_tm_subst');
        $sks_prak_subst  = $this->request->input('sks_prak_subst');
        $sks_prak_lap_subst  = $this->request->input('sks_prak_lap_subst');
        $sks_sim_subst  = $this->request->input('sks_sim_subst');
        $jml_tm_renc  = $this->request->input('jml_tm_renc');
        $jml_tm_real  = $this->request->input('jml_tm_real');
        $jml_mhs  = $this->request->input('jml_mhs');
        $id_katgiat  = 110100;
        $id_jns_eval  = 1;


        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $aktAjarDosen = $this->aktAjarDosen->where('id_ajar', $id_ajar)->first();
            if (!$aktAjarDosen) return WrapResponse(['data' => null], 'id_ajar tidak ditemukan atau tidak terdaftar', FALSE);

            $aktAjarDosen->update([
                'id_kls' => $id_kls,
                'id_reg_ptk' => $id_reg_ptk,
                'id_katgiat' => $id_katgiat,
                'id_subst' => $id_subst,
                'katgiat_ajar_id_katgiat' => $katgiat_ajar_id_katgiat,
                'id_jns_eval' => $id_jns_eval,
                'sks_subst_tot' => $sks_subst_tot,
                'sks_tm_subst' => $sks_tm_subst,
                'sks_prak_subst' => $sks_prak_subst,
                'sks_prak_lap_subst' => $sks_prak_lap_subst,
                'sks_sim_subst' => $sks_sim_subst,
                'jml_tm_renc' => $jml_tm_renc,
                'jml_tm_real' => $jml_tm_real,
                'jml_mhs' => $jml_mhs,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_ajar' => $id_ajar)), 'sukses mengubah ajar dosen', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], ' ajar dosen tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah ajar dosen', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_ajar' => 'required',
        ]);

        //rencana_ajar
        $id_ajar  = $this->request->input('id_ajar');

        $soft_delete = 1;
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
           $aktAjarDosen = $this->aktAjarDosen->where('id_ajar', $id_ajar)->first();
            if (!$aktAjarDosen) return WrapResponse(['data' => null], 'id_ajar tidak ditemukan atau tidak terdaftar', FALSE);

            $aktAjarDosen->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_ajar' => $id_ajar)), 'sukses menghapus ajar dosen', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'ajar dosen tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus ajar dosen', FALSE);
        }
    }
}
