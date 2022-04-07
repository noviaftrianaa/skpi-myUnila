<?php

namespace App\Http\Controllers\PDUT\Api\Mbkm;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Mbkm\DaftarKampusMerdeka;
use App\Models\PDUT\Mbkm\KonversiKampusMerdeka;
use App\Models\PDUT\Mbkm\PeriodeKampusMerdeka;
use App\Models\PDUT\Pdrd\AktMhs;
use App\Models\PDUT\Pdrd\BimbingMhs;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;
use DB;

class PesertaController extends Controller
{
    protected $request;
    protected $periodeMbkm;
    protected $daftarMbkm;
    protected $aktMhs;
    protected $bimbingMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->periodeMbkm = new PeriodeKampusMerdeka();
        $this->daftarMbkm = new DaftarKampusMerdeka();
        $this->aktMhs = new AktMhs();
        $this->bimbingMhs = new BimbingMhs();
    }

    public function index()
    {

        InputValidator([
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50'
        ]);

        try {
            $query = "SELECT
            d_mbkm.id_daftar_kampus_merdeka,
            reg.id_reg_pd,
            smt.nm_smt AS semester,
            reg.nipd AS npm,
            pd.nm_pd AS nm_mahasiswa,
            fak.nm_lemb AS nm_fakultas,
            CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
            p_mbkm.nm_periode_mbkm AS nm_kegiatan,
            d_mbkm.lokasi_mbkm AS lokasi_kegiatan,
            CASE
                WHEN d_mbkm.a_diluar_pt = 1 THEN 'di luar PT'
                WHEN d_mbkm.a_diluar_pt = 0 THEN 'di dalam PT'
            END AS kat_kegiatan
        FROM
            mbkm.daftar_kampus_merdeka AS d_mbkm WITH(NOLOCK)
            LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = d_mbkm.id_reg_pd
            AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
            AND pd.soft_delete = 0
            LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
            AND sms.soft_delete = 0
            LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
            AND fak.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
            AND jenjang.expired_date IS NULL
            JOIN mbkm.periode_kampus_merdeka AS p_mbkm WITH(NOLOCK) ON p_mbkm.id_periode_mbkm = d_mbkm.id_periode_mbkm
            AND p_mbkm.soft_delete = 0
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = p_mbkm.id_smt
            AND smt.expired_date IS NULL
        WHERE
            d_mbkm.soft_delete = 0
        ORDER BY
            pd.nm_pd ASC ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $peserta = DB::select($query);
            if (empty($peserta)) {
                return WrapResponse(['data' => null], 'tidak ada daftar peserta mbkm yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($peserta as $each_data) {
                $data[] = [
                    'id_daftar_kampus_merdeka ' => $each_data->id_daftar_kampus_merdeka ,
                    'id_reg_pd' => $each_data->id_reg_pd,
                    'semester' => $each_data->semester,
                    'npm' => $each_data->npm,
                    'nm_mahasiswa' => $each_data->nm_mahasiswa,
                    'nm_fakultas' => $each_data->nm_fakultas,
                    'nm_prodi' => $each_data->nm_prodi,
                    'nm_kegiatan' => $each_data->nm_kegiatan,
                    'lokasi_kegiatan' => $each_data->lokasi_kegiatan,
                    'kat_kegiatan' => $each_data->kat_kegiatan
                    // 'nm_pembimbing' => $each_data->nm_pembimbing,
                    // 'nidn' => $each_data->nidn,
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar peserta mbkm', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar peserta mbkm', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_periode_mbkm' => 'required|uuid',
            'id_reg_pd' => 'required|uuid',
            'lokasi_mbkm' => 'required',
            'a_diluar_pt' => 'required',
            'judul_akt_mhs' => 'required',
            'sk_tugas' => 'required',
            'tgl_sk_tugas' => 'required|date',
            'ket_akt' => 'required',
            'a_komunal' => 'required',
            'id_sdm' => 'required|uuid',
            'urutan_promotor' => 'required|numeric'
        ]);

        //request daftar mbkm
        $id_daftar_kampus_merdeka = guid();
        $id_periode_mbkm = $this->request->input('id_periode_mbkm');
        $id_reg_pd = $this->request->input('id_reg_pd');
        $lokasi_mbkm = $this->request->input('lokasi_mbkm');
        $a_diluar_pt = $this->request->input('a_diluar_pt');

        //request aktivitas
        $id_akt_mhs = guid();
        $judul_akt_mhs = $this->request->input('judul_akt_mhs');
        $sk_tugas = $this->request->input('sk_tugas');
        $tgl_sk_tugas = $this->request->input('tgl_sk_tugas');
        $ket_akt = $this->request->input('ket_akt');
        $a_komunal = $this->request->input('a_komunal');

        //request pembimbing
        $id_bimb_mhs = guid();
        $id_katgiat = 111400;
        $id_sdm = $this->request->input('id_sdm');
        $urutan_promotor = $this->request->input('urutan_promotor');

        $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();

        $data_mhs = DB::select("
            SELECT
                reg.nipd,
                reg.id_reg_pd,
                pd.nm_pd,
                reg.id_sms
            FROM
                pdrd.reg_pd AS reg
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
            WHERE
                reg.id_reg_pd = ?
                AND reg.soft_delete = 0
        ", [$id_reg_pd]);

        $periode_mbkm  = DB::select("
                SELECT
                    periode.id_smt,
                    periode.id_jns_akt_mhs
                FROM
                    mbkm.periode_kampus_merdeka AS periode
                WHERE
                    periode.id_periode_mbkm = ?
                    AND periode.soft_delete = 0
        ", [$id_periode_mbkm]);

        try {
            //tambah daftar mbkm
            $daftar_mbkm = $this->daftarMbkm->create([
                'id_daftar_kampus_merdeka' => $id_daftar_kampus_merdeka,
                'id_periode_mbkm' => $id_periode_mbkm,
                'id_reg_pd' => $id_reg_pd,
                'id_sp' => $id_sp,
                'lokasi_mbkm' => $lokasi_mbkm,
                'nm_pd' => $data_mhs[0]->nm_pd,
                'nipd' => $data_mhs[0]->nipd,
                'a_diluar_pt' => $a_diluar_pt,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            //tambah aktivitas mahasiswa
            $akt_mhs = $this->aktMhs->create([
                'id_akt_mhs' => $id_akt_mhs,
                'id_jns_akt_mhs' => $periode_mbkm[0]->id_jns_akt_mhs,
                'id_sms' => $data_mhs[0]->id_sms,
                'id_smt' => $periode_mbkm[0]->id_smt,
                'judul_akt_mhs' => $judul_akt_mhs,
                'lokasi_kegiatan' => $daftar_mbkm->lokasi_mbkm,
                'sk_tugas' => $sk_tugas,
                'tgl_sk_tugas' => $tgl_sk_tugas,
                'ket_akt' => $ket_akt,
                'a_komunal' => $a_komunal,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            //tambah pembimbing/pembina
            $this->bimbingMhs->create([
                'id_bimb_mhs' => $id_bimb_mhs,
                'id_katgiat' => $id_katgiat,
                'id_sdm' => $id_sdm,
                'id_akt_mhs' => $akt_mhs->id_akt_mhs,
                'urutan_promotor' => $urutan_promotor,
                'create_date' => $create_date,
                'id_creator' => $id_creator,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_daftar_kampus_merdeka' => $id_daftar_kampus_merdeka)), 'sukses menambahkan peserta mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'peserta mbkm tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan peserta mbkm', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_daftar_kampus_merdeka' => 'required',
        ]);

        $id_daftar_kampus_merdeka = $this->request->input('id_daftar_kampus_merdeka');
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $daftar_mbkm = $this->daftarMbkm->where('id_daftar_kampus_merdeka', $id_daftar_kampus_merdeka)->first();
            if (!$daftar_mbkm) return WrapResponse(['data' => null], 'daftar mbkm tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar mbkm
            $daftar_mbkm->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_daftar_kampus_merdeka' => $id_daftar_kampus_merdeka)), 'sukses menghapus peserta mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'peserta mbkm tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus peserta mbkm', FALSE);
        }
    }
}
