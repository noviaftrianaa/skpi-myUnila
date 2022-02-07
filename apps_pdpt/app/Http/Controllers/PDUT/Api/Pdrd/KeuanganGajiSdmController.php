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
    protected $request;
    protected $rwygaji;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->rwygaji = new RwyGajiBerkala();
    }

    public function daftar()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');

        if (!empty($sortby)) {
            $sortby = $sortby;
        }

        try {
            $query = "SELECT
            rwgaji.id_rwy_gaji_berkala,
            sdm.nik,
            sdm.nidn,
            sdm.nip,
            sdm.nm_sdm,
            aktf.nm_stat_aktif,
            skep.nm_stat_pegawai,
            jsdm.nm_jns_sdm,
            prodi.nm_lemb AS prodi,
            jur.nm_jur AS jurusan,
            fak.nm_lemb AS fakultas,
            pgkt.nm_pangkat,
            rwgaji.sk_gaji_berkala,
            rwgaji.tgl_sk_gaji_berkala,
            rwgaji.tmt_kgb,
            rwgaji.masa_kerja_thn,
            rwgaji.masa_kerja_bln,
            rwgaji.gaji_pokok,
            rwgaji.create_date,
            rwgaji.last_update
            FROM
                keuangan.rwy_gaji_berkala AS rwgaji WITH(NOLOCK)
            JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON rwgaji.id_sdm = sdm.id_sdm
                AND sdm.soft_delete = 0
            JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0 AND ptk.id_jns_keluar IS NULL
                AND ( ptk.tgl_ptk_keluar IS NULL OR ptk.tgl_ptk_keluar > GETDATE() )
            LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
            LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_induk_sms
                AND fak.soft_delete = 0
            LEFT JOIN ref.jurusan AS jur WITH(NOLOCK) ON jur.id_jur = prodi.id_jur
                AND jur.expired_date IS NULL
            JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                AND skep.expired_date IS NULL
            JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
            LEFT JOIN ref.jenis_sdm AS jsdm WITH(NOLOCK) ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                AND jsdm.expired_date IS NULL
            LEFT JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                AND aktf.expired_date IS NULL
            JOIN ref.pangkat_golongan AS pgkt WITH(NOLOCK) ON rwgaji.id_pangkat_gol = pgkt.id_pangkat_gol
                AND pgkt.expired_date IS NULL
            WHERE rwgaji.soft_delete = 0
                ORDER BY sdm.nm_sdm " . $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $gajis = DB::select($query);
            if (empty($gajis)) {
                return WrapResponse(['data' => null], 'tidak ada daftar gaji sdm yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($gajis as $value) {
                $data[] = [
                    'id_rwy_gaji_berkala,' => $value->id_rwy_gaji_berkala,
                    'nik,' => $value->nik,
                    'nidn,' => $value->nidn,
                    'nip,' => $value->nip,
                    'nama_sdm,' => $value->nm_sdm,
                    'prodi,' => $value->prodi,
                    'jurusan,' => $value->jurusan,
                    'fakultas,' => $value->fakultas,
                    'pangkat_golongan,' => $value->nm_pangkat,
                    'status_aktif,' => $value->nm_stat_aktif,
                    'status_pegawai,' => $value->nm_stat_pegawai,
                    'jenis_sdm,' => $value->nm_jns_sdm,
                    'sk_gaji_berkala,' => $value->sk_gaji_berkala,
                    'tgl_sk_gaji_berkala,' => $value->tgl_sk_gaji_berkala,
                    'tmt_kgb,' => $value->tmt_kgb,
                    'masa_kerja_thn,' => $value->masa_kerja_thn,
                    'masa_kerja_bln,' => $value->masa_kerja_bln,
                    'gaji_pokok' => $value->gaji_pokok,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar gaji sdm', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar gaji sdm', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'id_pangkat_gol' => 'required|numeric',
            'sk_gaji_berkala' => 'required',
            'tgl_sk_gaji_berkala' => 'required|date',
            'tmt_kgb' => 'required|date',
            'masa_kerja_thn' => 'required|numeric',
            'masa_kerja_bln' => 'required|numeric',
            'gaji_pokok' => 'required|numeric'
        ]);

        $id_rwy_gaji_berkala = guid();
        $id_sdm = $this->request->input('id_sdm');
        $id_pangkat_gol = $this->request->input('id_pangkat_gol');
        $sk_gaji_berkala = $this->request->input('sk_gaji_berkala');
        $tgl_sk_gaji_berkala = $this->request->input('tgl_sk_gaji_berkala');
        $tmt_kgb = $this->request->input('tmt_kgb');
        $masa_kerja_thn = $this->request->input('masa_kerja_thn');
        $masa_kerja_bln = $this->request->input('masa_kerja_bln');
        $gaji_pokok = $this->request->input('gaji_pokok');
        $create_date = currDateTime();
        $id_creator = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $last_update = currDateTime();
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();
        try {
            $this->rwygaji->create([
                'id_rwy_gaji_berkala' => $id_rwy_gaji_berkala,
                'id_sdm' => $id_sdm,
                'id_pangkat_gol' => $id_pangkat_gol,
                'sk_gaji_berkala' => $sk_gaji_berkala,
                'tgl_sk_gaji_berkala' => $tgl_sk_gaji_berkala,
                'tmt_kgb' => $tmt_kgb,
                'masa_kerja_thn' => $masa_kerja_thn,
                'masa_kerja_bln' => $masa_kerja_bln,
                'gaji_pokok' => $gaji_pokok,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_rwy_gaji_berkala' => $id_rwy_gaji_berkala)), 'sukses menambahkan gaji sdm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'gaji sdm tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan gaji sdm', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_rwy_gaji_berkala' => 'required|uuid',
            'id_sdm' => 'required|uuid',
            'id_pangkat_gol' => 'required|numeric',
            'sk_gaji_berkala' => 'required',
            'tgl_sk_gaji_berkala' => 'required|date',
            'tmt_kgb' => 'required|date',
            'masa_kerja_thn' => 'required|numeric',
            'masa_kerja_bln' => 'required|numeric',
            'gaji_pokok' => 'required|numeric'
        ]);

        $id_rwy_gaji_berkala = $this->request->input('id_rwy_gaji_berkala');
        $id_sdm = $this->request->input('id_sdm');
        $id_pangkat_gol = $this->request->input('id_pangkat_gol');
        $sk_gaji_berkala = $this->request->input('sk_gaji_berkala');
        $tgl_sk_gaji_berkala = $this->request->input('tgl_sk_gaji_berkala');
        $tmt_kgb = $this->request->input('tmt_kgb');
        $masa_kerja_thn = $this->request->input('masa_kerja_thn');
        $masa_kerja_bln = $this->request->input('masa_kerja_bln');
        $gaji_pokok = $this->request->input('gaji_pokok');
        $last_update = currDateTime();
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        DB::beginTransaction();
        try {
            $rwygaji = $this->rwygaji->where('id_rwy_gaji_berkala', $id_rwy_gaji_berkala)->first();
            if (!$rwygaji) return WrapResponse(['data' => null], 'gaji sdm tidak ditemukan atau tidak terdaftar', FALSE);

            $rwygaji->update([
                'id_sdm' => $id_sdm,
                'id_pangkat_gol' => $id_pangkat_gol,
                'sk_gaji_berkala' => $sk_gaji_berkala,
                'tgl_sk_gaji_berkala' => $tgl_sk_gaji_berkala,
                'tmt_kgb' => $tmt_kgb,
                'masa_kerja_thn' => $masa_kerja_thn,
                'masa_kerja_bln' => $masa_kerja_bln,
                'gaji_pokok' => $gaji_pokok,
                'last_update' => $last_update,
                'id_updater' => $id_updater
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_rwy_gaji_berkala' => $id_rwy_gaji_berkala)), 'sukses mengubah gaji sdm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'gaji sdm tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah gaji sdm', FALSE);
        }
    }

    public function hapus()
    {
        $id_rwy_gaji_berkala = $this->request->input('id_rwy_gaji_berkala');
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $last_update = currDateTime();

        InputValidator([
            'id_rwy_gaji_berkala' => 'required|uuid',
        ]);

        DB::beginTransaction();
        try {
            $this->rwygaji->where('id_rwy_gaji_berkala', $id_rwy_gaji_berkala)->update([
                'soft_delete' => 1,
                'last_update' => $last_update,
                'id_updater' => $id_updater
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_rwy_gaji_berkala' => $id_rwy_gaji_berkala)), 'berhasil menghapus data gaji sdm', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data gaji sdm', FALSE);
        }
    }
}
