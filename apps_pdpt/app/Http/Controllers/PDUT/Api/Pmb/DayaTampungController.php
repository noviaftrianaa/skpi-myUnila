<?php

namespace App\Http\Controllers\PDUT\Api\Pmb;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pmb\DayaTampung;
use App\Models\PDUT\Pmb\PeriodePmb;
use App\Models\PDUT\Pdrd\Sms;
use App\Models\PDUT\Ref\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DayaTampungController extends Controller
{
    protected $request;
    protected $daya_tampung;
    // protected $periode_pmb;
    // protected $sms;
    // protected $smt;

    protected $getAllListDayaTampung;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->daya_tampung = new DayaTampung();
        // $this->daya_tampung = new PeriodePmb();
    }

    public function getAllListDayaTampung()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50'
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }
        try {
            $query =  "
            SELECT
            dapung.id_daya_tampung,
            dapung.id_periode_pmb,
            dapung.id_smt,
            dapung.id_sms,
            smt.nm_smt,
            fak.nm_lemb AS fakultas,
            jur.nm_lemb AS jurusan,
            CONCAT(prodi.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi,
            dapung.target_mhs_baru,
            dapung.calon_ikut_seleksi,
            dapung.calon_pilihan_1,
            dapung.calon_pilihan_2,
            dapung.calon_pilihan_3,
            dapung.ketetatan_statistik,
            dapung.ketetatan_probabilitas,
            dapung.calon_lulus_seleksi,
            dapung.daftar_sbg_mhs,
            dapung.pst_undur_diri,
            dapung.tgl_awal_kul,
            dapung.tgl_akhir_kul
        FROM
            pmb.daya_tampung AS dapung WITH(NOLOCK)
            LEFT JOIN pdrd.sms as sms ON sms.id_sms = dapung.id_sms
            AND sms.soft_delete = 0
            LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = dapung.id_sms
            AND prodi.soft_delete = 0
            LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
            AND fak.soft_delete = 0
            LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
            AND jur.soft_delete = 0
            LEFT JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
            AND jenjang.expired_date IS NULL
            LEFT JOIN ref.semester AS smt ON smt.id_smt = dapung.id_smt
            AND smt.expired_date IS NULL
        WHERE
            dapung.soft_delete = 0
        ORDER BY
            dapung.id_sms DESC
             ";


            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data daya tampung', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id_daya_tampung' => $value->id_daya_tampung,
                    'id_periode_pmb' => $value->id_periode_pmb,
                    'id_smt' => $value->id_smt,
                    'id_sms' => $value->id_sms,
                    'nm_smt' => $value->nm_smt,
                    'fakultas' => $value->fakultas,
                    'jurusan' => $value->jurusan,
                    'prodi' => $value->prodi,
                    'target_mhs_baru' => $value->target_mhs_baru,
                    'calon_ikut_seleksi' => $value->calon_ikut_seleksi,
                    'calon_pilihan_1' => $value->calon_pilihan_1,
                    'calon_pilihan_2' => $value->calon_pilihan_2,
                    'calon_pilihan_3' => $value->calon_pilihan_3,
                    'ketetatan_statistik' => $value->ketetatan_statistik,
                    'ketetatan_probabilitas' => $value->ketetatan_probabilitas,
                    'calon_lulus_seleksi' => $value->calon_lulus_seleksi,
                    'daftar_sbg_mhs' => $value->daftar_sbg_mhs,
                    'pst_undur_diri' => $value->pst_undur_diri,
                    'tgl_awal_kul' => date('Y-m-d H:i:s', strtotime($value->tgl_awal_kul)),
                    'tgl_akhir_kul' => date('Y-m-d H:i:s', strtotime($value->tgl_akhir_kul))

                ];
            }
            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data daya tampung tidak ditemukan atau data daya tampung tidak terdaftar", FALSE);
        }
    }

    public function tambah()
    {
        InputValidator([
            'id_periode_pmb' => 'required|uuid',
            'id_smt' => 'required|string',
            'id_prodi' => 'required|uuid',

            'target_mhs_baru' => 'nullable|numeric',
            'calon_ikut_seleksi' => 'nullable|numeric',
            'calon_pilihan_1' => 'nullable|numeric',
            'calon_pilihan_2' => 'nullable|numeric',
            'calon_pilihan_3' => 'nullable|numeric',
            'ketetatan_statistik' => 'nullable|numeric',
            'ketetatan_probabilitas' => 'nullable|numeric',
            'calon_lulus_seleksi' => 'nullable|numeric',
            'daftar_sbg_mhs' => 'nullable|numeric',
            'pst_undur_diri' => 'nullable|numeric',

            'tgl_awal_kul' => 'nullable|date_format:Y-m-d',
            'tgl_akhir_kul' => 'nullable|date_format:Y-m-d'
        ]);

        $id_daya_tampung = guid();
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_periode_pmb = $this->request->input('id_periode_pmb');
        $id_smt = $this->request->input('id_smt');
        $id_sms = $this->request->input('id_prodi');
        // $nm_smt = $this->request->input('nm_smt');
        // $fakultas = $this->request->input('fakultas');
        // $jurusan = $this->request->input('jurusan');
        // $prodi = $this->request->input('prodi');
        $target_mhs_baru = $this->request->input('target_mhs_baru');
        $calon_ikut_seleksi = $this->request->input('calon_ikut_seleksi');
        $calon_pilihan_1 = $this->request->input('calon_pilihan_1');
        $calon_pilihan_2 = $this->request->input('calon_pilihan_2');
        $calon_pilihan_3 = $this->request->input('calon_pilihan_3');
        $ketetatan_statistik = $this->request->input('ketetatan_statistik');
        $ketetatan_probabilitas = $this->request->input('ketetatan_probabilitas');
        $calon_lulus_seleksi = $this->request->input('jurusan');
        $daftar_sbg_mhs = $this->request->input('daftar_sbg_mhs');
        $pst_undur_diri = $this->request->input('pst_undur_diri');


        $tgl_awal_kul = $this->request->input('tgl_mulai_kul');
        $tgl_akhir_kul = $this->request->input('tgl_akhir_kul');
        $create_date = currDateTime();
        $last_update = currDateTime();
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->daya_tampung->create([
                'id_daya_tampung' => $id_daya_tampung,
                'id_periode_pmb' => $id_periode_pmb,
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                // 'nm_Smt' => $nm_smt,
                // 'fakultas' => $fakultas,
                // 'jurusan' => $jurusan,
                // 'prodi' => $prodi,
                'target_mhs_baru' => $target_mhs_baru,
                'calon_ikut_seleksi' => $calon_ikut_seleksi,
                'calon_pilihan_1' => $calon_pilihan_1,
                'calon_pilihan_2' => $calon_pilihan_2,
                'calon_pilihan_3' => $calon_pilihan_3,
                'ketetatan_statistik' => $ketetatan_statistik,
                'ketetatan_probabilitas' => $ketetatan_probabilitas,
                'calon_lulus_seleksi' => $calon_lulus_seleksi,
                'daftar_sbg_mhs' => $daftar_sbg_mhs,
                'pst_undur_diri' => $pst_undur_diri,

                'tgl_awal_kul' => $tgl_awal_kul,
                'tgl_akhir_kul' => $tgl_akhir_kul,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_daya_tampung' => $id_daya_tampung)), 'sukses menambahkan data Daya Tampung', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Daya Tampung tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan data Daya Tampung', FALSE);
        }
    }

    public function ubahDayaTampung()
    {
        InputValidator([
            'id_daya_tampung' => 'required|uuid',
            'id_periode_pmb' => 'required|uuid',
            'id_smt' => 'required|string',
            'id_prodi' => 'required|uuid',

            'target_mhs_baru' => 'nullable|numeric',
            'calon_ikut_seleksi' => 'nullable|numeric',
            'calon_pilihan_1' => 'nullable|numeric',
            'calon_pilihan_2' => 'nullable|numeric',
            'calon_pilihan_3' => 'nullable|numeric',
            'ketetatan_statistik' => 'nullable|numeric',
            'ketetatan_probabilitas' => 'nullable|numeric',
            'calon_lulus_seleksi' => 'nullable|numeric',
            'daftar_sbg_mhs' => 'nullable|numeric',
            'pst_undur_diri' => 'nullable|numeric',

            'tgl_awal_kul' => 'nullable|date_format:Y-m-d',
            'tgl_akhir_kul' => 'nullable|date_format:Y-m-d'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_daya_tampung = $this->request->input('id_daya_tampung');
        $id_periode_pmb = $this->request->input('id_periode_pmb');
        $id_smt = $this->request->input('id_smt');
        $id_sms = $this->request->input('id_prodi');
        // $nm_smt = $this->request->input('nm_smt');
        // $fakultas = $this->request->input('fakultas');
        // $jurusan = $this->request->input('jurusan');
        // $prodi = $this->request->input('prodi');
        $target_mhs_baru = $this->request->input('target_mhs_baru');
        $calon_ikut_seleksi = $this->request->input('calon_ikut_seleksi');
        $calon_pilihan_1 = $this->request->input('calon_pilihan_1');
        $calon_pilihan_2 = $this->request->input('calon_pilihan_2');
        $calon_pilihan_3 = $this->request->input('calon_pilihan_3');
        $ketetatan_statistik = $this->request->input('ketetatan_statistik');
        $ketetatan_probabilitas = $this->request->input('ketetatan_probabilitas');
        $calon_lulus_seleksi = $this->request->input('jurusan');
        $daftar_sbg_mhs = $this->request->input('daftar_sbg_mhs');
        $pst_undur_diri = $this->request->input('pst_undur_diri');


        $tgl_awal_kul = $this->request->input('tgl_mulai_kul');
        $tgl_akhir_kul = $this->request->input('tgl_akhir_kul');

        DB::beginTransaction();
        try {
            $daya_tampung = $this->daya_tampung->where('id_daya_tampung', $id_daya_tampung)->first();
            if (!$daya_tampung) return WrapResponse(['data' => null], 'id_daya_tampung tidak ditemukan atau tidak terdaftar', FALSE);

            $daya_tampung->update([
                'id_daya_tampung' => $id_daya_tampung,
                'id_periode_pmb' => $id_periode_pmb,
                'id_smt' => $id_smt,
                'id_sms' => $id_sms,
                // 'nm_Smt' => $nm_smt,
                // 'fakultas' => $fakultas,
                // 'jurusan' => $jurusan,
                // 'prodi' => $prodi,
                'target_mhs_baru' => $target_mhs_baru,
                'calon_ikut_seleksi' => $calon_ikut_seleksi,
                'calon_pilihan_1' => $calon_pilihan_1,
                'calon_pilihan_2' => $calon_pilihan_2,
                'calon_pilihan_3' => $calon_pilihan_3,
                'ketetatan_statistik' => $ketetatan_statistik,
                'ketetatan_probabilitas' => $ketetatan_probabilitas,
                'calon_lulus_seleksi' => $calon_lulus_seleksi,
                'daftar_sbg_mhs' => $daftar_sbg_mhs,
                'pst_undur_diri' => $pst_undur_diri,

                'tgl_awal_kul' => $tgl_awal_kul,
                'tgl_akhir_kul' => $tgl_akhir_kul,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_daya_tampung' => $id_daya_tampung)), 'sukses mengubah data Daya Tampung', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Daya Tampung tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah data Daya Tampung', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_daya_tampung' => 'required',
        ]);

        $id_daya_tampung = $this->request->input('id_daya_tampung');
        $last_update = currDateTime();
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $daftar_daya_tampung = $this->daya_tampung->where('id_daya_tampung', $id_daya_tampung)->first();
            if (!$daftar_daya_tampung) return WrapResponse(['data' => null], 'daftar Daya Tampung tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar periode pmb
            $daftar_daya_tampung->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_daya_tampung' => $id_daya_tampung)), 'sukses menghapus daftar data Daya Tampung', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data Daya Tampung tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data Daya Tampung', FALSE);
        }
    }
}
