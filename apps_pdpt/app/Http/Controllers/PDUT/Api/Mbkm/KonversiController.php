<?php

namespace App\Http\Controllers\PDUT\Api\Mbkm;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Mbkm\DaftarKampusMerdeka;
use App\Models\PDUT\Mbkm\KonversiKampusMerdeka;
use App\Models\PDUT\Mbkm\PeriodeKampusMerdeka;
use App\Models\PDUT\Pdrd\AktMhs;
use App\Models\PDUT\Pdrd\AnggotaAktMhs;
use App\Models\PDUT\Pdrd\BimbingMhs;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;
use DB;

class KonversiController extends Controller
{
    protected $request;
    protected $periodeMbkm;
    protected $daftarMbkm;
    protected $aktMhs;
    protected $bimbingMhs;
    protected $konversiMbkm;
    protected $AktMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->periodeMbkm = new PeriodeKampusMerdeka();
        $this->daftarMbkm = new DaftarKampusMerdeka();
        $this->aktMhs = new AktMhs();
        $this->bimbingMhs = new BimbingMhs();
        $this->konversiMbkm = new KonversiKampusMerdeka();
        $this->AktMhs = new AktMhs();
    }
    public function index()
    {
        $id_reg_pd = $this->request->input('id_reg_pd');

        InputValidator([
            'id_reg_pd' => 'required|uuid',
        ]);

        try {

            $query1 = DB::SELECT("
                SELECT
                    DISTINCT reg.id_reg_pd,
                    pd.nm_pd,
                    reg.nipd AS npm,
                    jns_akt.nm_jns_akt_mhs AS program_mbkm,
                    akt.judul_akt_mhs AS judul_mbkm,
                    sks.total_sks,
                    sdm.nidn,
                    sdm.nm_sdm AS nm_pembimbing
                FROM
                    mbkm.konversi_kampus_merdeka AS k_mbkm WITH(NOLOCK)
                    LEFT JOIN pdrd.anggota_akt_mhs AS ang_akt WITH(NOLOCK) ON ang_akt.id_ang_akt_mhs = k_mbkm.id_ang_akt_mhs
                    AND ang_akt.soft_delete = 0
                    LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = ang_akt.id_akt_mhs
                    AND akt.soft_delete = 0
                    LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = ang_akt.id_reg_pd
                    AND reg.id_reg_pd = '" . $id_reg_pd . "'
                    AND reg.soft_delete = 0
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                    JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
                    AND expired_date IS NULL
                    LEFT JOIN pdrd.bimbing_mhs AS bimbing WITH(NOLOCK) ON bimbing.id_akt_mhs = ang_akt.id_akt_mhs
                    AND bimbing.soft_delete = 0
                    LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = bimbing.id_sdm
                    AND sdm.soft_delete = 0
                    LEFT JOIN (
                        SELECT
                            SUM(k_mbkm1.sks_mk) as total_sks,
                            ang_akt.id_reg_pd
                        FROM
                            mbkm.konversi_kampus_merdeka AS k_mbkm1 WITH(NOLOCK)
                            LEFT JOIN pdrd.anggota_akt_mhs AS ang_akt WITH(NOLOCK) ON ang_akt.id_ang_akt_mhs = k_mbkm1.id_ang_akt_mhs
                            AND ang_akt.soft_delete = 0
                        WHERE
                            k_mbkm1.soft_delete = 0
                        GROUP BY
                            ang_akt.id_reg_pd
                    ) AS sks ON sks.id_reg_pd = reg.id_reg_pd
                WHERE
                    k_mbkm.soft_delete = 0 ");

            $konversi_mbkm = [];
            foreach ($query1 as $each_data) {
                $id = $each_data->id_reg_pd;
                $konversi_mbkm[$id] = DB::SELECT("
                    SELECT
                        k_mbkm.id_konversi_aktivitas AS id_konversi,
                        mk.id_mk,
                        mk.nm_mk,
                        k_mbkm.nilai_angka,
                        k_mbkm.nilai_huruf,
                        k_mbkm.nilai_indeks,
                        k_mbkm.sks_mk
                    FROM
                        mbkm.konversi_kampus_merdeka AS k_mbkm WITH(NOLOCK)
                        LEFT JOIN pdrd.anggota_akt_mhs AS ang_akt WITH(NOLOCK) ON ang_akt.id_ang_akt_mhs = k_mbkm.id_ang_akt_mhs
                        AND ang_akt.soft_delete = 0
                        LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = ang_akt.id_akt_mhs
                        AND akt.soft_delete = 0
                        JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = ang_akt.id_reg_pd
                        AND reg.id_reg_pd = '" . $id . "'
                        AND reg.soft_delete = 0
                        LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_mbkm.id_mk
                        AND reg.soft_delete = 0
                    WHERE
                        k_mbkm.soft_delete = 0
                ");
            }

            if (!$konversi_mbkm) return WrapResponse(['data' => null], 'daftar konversi tidak ditemukan atau tidak terdaftar', FALSE);

            $data = [];
            foreach ($query1 as $each_data) {
                $data[] = [
                    'id_reg_pd ' => $each_data->id_reg_pd,
                    'nm_pd' => $each_data->nm_pd,
                    'npm' => $each_data->npm,
                    'program_mbkm' => $each_data->program_mbkm,
                    'judul_mbkm' => $each_data->judul_mbkm,
                    'total_sks' => $each_data->total_sks,
                    'nidn' => $each_data->nidn,
                    'nm_pembimbing' => $each_data->nm_pembimbing,
                    'konversi_mbkm' => $konversi_mbkm[$each_data->id_reg_pd]
                ];
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . ' on line ' . $th->getLine());
            return WrapResponse(['data' => null], 'gagal mendapatkan data detail konversi mbkm', FALSE);
        }
        return WrapResponse(['data' => $data], 'data detail konversi mbkm', TRUE);
    }

    public function store()
    {
        InputValidator([
            'id_ang_akt_mhs' => 'required|uuid',
            'id_daftar_kampus_merdeka' => 'required|uuid',
            'konversi_mbkm' => 'required',
        ]);

        //request konversi kampus merdeka
        $id_konversi_aktivitas = guid();
        $id_ang_akt_mhs = $this->request->input('id_ang_akt_mhs');
        $id_daftar_kampus_merdeka = $this->request->input('id_daftar_kampus_merdeka');
        $konversi_mbkm = $this->request->input('konversi_mbkm');

        $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
        $create_date = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;
        $last_sync = currDateTime();

        DB::beginTransaction();

        $data_akt = DB::select("
            SELECT
                ang_akt.id_akt_mhs,
                ang_akt.nipd,
                ang_akt.id_reg_pd,
                ang_akt.nm_pd,
                akt.id_sms
            FROM
                pdrd.anggota_akt_mhs AS ang_akt WITH(NOLOCK)
                LEFT JOIN pdrd.akt_mhs AS akt WITH(NOLOCK) ON akt.id_akt_mhs = ang_akt.id_akt_mhs
                AND akt.soft_delete = 0
            WHERE
                ang_akt.id_ang_akt_mhs = ?
                AND ang_akt.soft_delete = 0
            ", [$id_ang_akt_mhs]);

        try {
            if (!empty($konversi_mbkm)) {
                foreach ($konversi_mbkm as $index => $id) {

                    //tambah konversi mbkm
                    $konversi_mbkm = $this->konversiMbkm->create([
                        'id_konversi_aktivitas' => guid(),
                        'id_ang_akt_mhs' => $id_ang_akt_mhs,
                        'id_akt_mhs' => $data_akt[0]->id_akt_mhs,
                        'id_daftar_kampus_merdeka' => $id_daftar_kampus_merdeka,
                        'id_mk' => $id['id_mk'],
                        'nilai_angka' => $id['nilai_angka'],
                        'nilai_huruf' => $id['nilai_huruf'],
                        'nilai_indeks' => $id['nilai_indeks'],
                        'sks_mk' => $id['sks_mk'],
                        'create_date' => $create_date,
                        'id_creator' => $id_creator,
                        'last_update' => $last_update,
                        'id_updater' => $id_updater,
                        'soft_delete' => $soft_delete,
                        'last_sync' => $last_sync
                    ]);
                }
            }

            DB::commit();
            return WrapResponse(array('data' => array('id_konversi_aktivitas' => $id_konversi_aktivitas)), 'sukses menambahkan konversi mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'konversi mbkm tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan konversi mbkm', FALSE);
        }
    }

    public function update()
    {
        InputValidator([
            'id_konversi' => 'required',
            'id_mk' => 'required',
            'nilai_angka' => 'required',
            'nilai_huruf' => 'required',
            'nilai_indeks' => 'required',
            'sks_mk' => 'required'
        ]);

        $id_konversi = $this->request->input('id_konversi');
        $id_mk = $this->request->input('id_mk');
        $nilai_angka = $this->request->input('nilai_angka');
        $nilai_huruf = $this->request->input('nilai_huruf');
        $nilai_indeks = $this->request->input('nilai_indeks');
        $sks_mk = $this->request->input('sks_mk');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $konversi_mbkm = $this->konversiMbkm->where('id_konversi_aktivitas', $id_konversi)->first();
            if (!$konversi_mbkm) return WrapResponse(['data' => null], 'daftar konversi tidak ditemukan atau tidak terdaftar', FALSE);

            //update daftar mbkm
            $konversi_mbkm->update([
                'id_mk' => $id_mk,
                'nilai_angka' => $nilai_angka,
                'nilai_huruf' => $nilai_huruf,
                'nilai_indeks' => $nilai_indeks,
                'sks_mk' => $sks_mk,
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_konversi' => $id_konversi)), 'sukses mengubah peserta mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'konversi mbkm tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah konversi mbkm', FALSE);
        }
    }

    public function destroy()
    {
        InputValidator([
            'id_konversi' => 'required',
        ]);

        $id_konversi = $this->request->input('id_konversi');
        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $konversi_mbkm = $this->konversiMbkm->where('id_konversi_aktivitas', $id_konversi)->first();
            if (!$konversi_mbkm) return WrapResponse(['data' => null], 'daftar konversi tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar mbkm
            $konversi_mbkm->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_konversi' => $id_konversi)), 'sukses menghapus peserta mbkm', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'konversi mbkm tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus konversi mbkm', FALSE);
        }
    }
}
