<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\Diklat;
use App\Models\PDUT\Ref\JenisDiklat;
use App\Models\PDUT\Ref\KelompokBidang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DiklatController extends Controller
{
    protected $request;
    protected $diklat;
    protected $jenis_diklat;
    protected $kelompok_bidang;

    protected $getAllListDiklat;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->diklat = new Diklat();
        $this->jenis_diklat = new JenisDiklat();
        $this->kelompok_bidang = new KelompokBidang();
    }

    public function getAllListDiklat()
    {
        InputValidator([
            'sort_by' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric|min:1',
            'limit' => 'numeric|min:1|max:50'
        ]);

        $sortby = $this->request->input('sort_by');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }
        try {
            $query =  "
                    SELECT
                        diklat.id_diklat AS id_diklat,
                        diklat.id_katgiat,
                        diklat.id_jns_diklat,
                        jd.nm_jns_diklat AS jenis_diklat,
                        katgiat.nm_kat AS kategori,
                        kb.nm_kel_bidang AS bidang_keilmuan,
                        diklat.nm_diklat AS nama_diklat,
                        diklat.penyelenggara AS penyelenggara,
                        diklat.thn AS tahun,
                        diklat.peran AS peran,
                        diklat.jml_jam AS durasi,
                        diklat.no_sert,
                        diklat.tgl_sert,
                        diklat.tempat,
                        diklat.tgl_mulai,
                        diklat.tgl_selesai,
                        diklat.sk_tugas,
                        diklat.create_date AS waktu_data_ditambahkan,
                        diklat.last_update AS terakhir_diubah
                    FROM
                        pdrd.diklat AS diklat WITH(NOLOCK)
                        LEFT JOIN ref.kategori_kegiatan as katgiat ON katgiat.id_katgiat = diklat.id_katgiat
                        AND katgiat.expired_date IS NULL
                        LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = diklat.id_kel_bidang
                        AND kb.expired_date IS NULL
                        LEFT JOIN ref.jenis_diklat AS jd ON jd.id_jns_diklat = diklat.id_jns_diklat
                        AND jd.expired_date IS NULL
                    WHERE
                        diklat.soft_delete = 0
                    ORDER BY
                        diklat.nm_diklat " . $sortby . "
                        ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $query = DB::select($query);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data diklat', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id_diklat' => $value->id_diklat,
                    'jenis_diklat' => $value->jenis_diklat,
                    'kategori' => $value->kategori,
                    'bidang_keilmuan' => $value->bidang_keilmuan,
                    'nama_diklat' => $value->nama_diklat,
                    'penyelenggara' => $value->penyelenggara,
                    'tahun' => $value->tahun,
                    'peran' => $value->peran,
                    'durasi' => $value->durasi,
                    'no_sert' => $value->no_sert,
                    'tgl_sert' => date('Y-m-d H:i:s', strtotime($value->tgl_sert)),
                    'tempat' => $value->tempat,
                    'tgl_mulai' => date('Y-m-d H:i:s', strtotime($value->tgl_mulai)),
                    'tgl_selesai' => date('Y-m-d H:i:s', strtotime($value->tgl_mulai)),
                    'sk_tugas' => $value->sk_tugas,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
                ];
            }
            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data diklat tidak ditemukan atau data diklat tidak terdaftar", FALSE);
        }
    }

    public function tambah()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'id_kel_bidang' => 'nullable|numeric',
            'id_katgiat' => 'required|numeric',
            'id_jns_diklat' => 'required|numeric',
            'nm_diklat' => 'required|string',
            'penyelenggara' => 'nullable|string',
            'thn' => 'nullable|date_format:Y',
            'peran' => 'nullable|string',
            'tkt' => 'nullable|numeric',
            'jml_jam' => 'nullable|numeric',
            'no_sert' => 'nullable|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'tgl_sert' => 'nullable|date_format:Y-m-d',
            'tempat' => 'nullable|string',
            'tgl_mulai' => 'nullable|date_format:Y-m-d',
            'tgl_selesai' => 'nullable|date_format:Y-m-d',
            'sk_tugas' => 'nullable|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'tgl_sk_tugas' => 'nullable|date_format:Y-m-d'


        ]);

        $id_diklat = guid();
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_sdm = $this->request->input('id_sdm');
        $id_kel_bidang = $this->request->input('id_kel_bidang');
        $id_katgiat = $this->request->input('id_katgiat');
        $id_jns_diklat = $this->request->input('id_jns_diklat');
        $nm_diklat = $this->request->input('nm_diklat');
        $penyelenggara = $this->request->input('penyelenggara');
        $thn = $this->request->input('thn');
        $peran = $this->request->input('peran');
        $tkt = $this->request->input('tkt');
        $jml_jam = $this->request->input('jml_jam');
        $no_sert = $this->request->input('no_sert');
        $tgl_sert = $this->request->input('tgl_sert');
        $tempat = $this->request->input('sk_tugas');
        $tgl_mulai = $this->request->input('tgl_mulai');
        $tgl_selesai = $this->request->input('tgl_selesai');
        $sk_tugas = $this->request->input('sk_tugas');
        $tgl_sk_tugas = $this->request->input('tgl_sk_tugas');
        $create_date = currDateTime();
        $last_update = currDateTime();
        $soft_delete = 0;
        $last_sync = currDateTime();

        if ($id_jns_diklat == 20 || $id_jns_diklat == 21) {
            return WrapResponse(['data' => null], 'gagal menambahkan data diklat id_jns_diklat 20,21', FALSE);
        }


        DB::beginTransaction();
        try {
            $this->diklat->create([
                'id_diklat' => $id_diklat,
                'id_sdm' => $id_sdm,
                'id_kel_bidang' => $id_kel_bidang,
                'id_katgiat' => $id_katgiat,
                'id_jns_diklat' => $id_jns_diklat,
                'nm_diklat' => $nm_diklat,
                'penyelenggara' => $penyelenggara,
                'thn' => $thn,
                'peran' => $peran,
                'tkt' => $tkt,
                'jml_jam' => $jml_jam,
                'no_sert' => $no_sert,
                'tgl_sert' => $tgl_sert,
                'tempat' => $tempat,
                'tgl_mulai' => $tgl_mulai,
                'tgl_selesai' => $tgl_selesai,
                'sk_tugas' => $sk_tugas,
                'tgl_sk_tugas' => $tgl_sk_tugas,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_diklat' => $id_diklat)), 'sukses menambahkan data diklat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data diklat tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan data diklat', FALSE);
        }
    }

    public function ubahDiklat()
    {
        InputValidator([
            'id_diklat' => 'required|uuid',
            'id_sdm' => 'required|uuid',
            'id_kel_bidang' => 'nullable|numeric',
            'id_katgiat' => 'required|numeric',
            'id_jns_diklat' => 'required|numeric',
            'nm_diklat' => 'required|string',
            'penyelenggara' => 'nullable|string',
            'thn' => 'nullable|date_format:Y',
            'peran' => 'nullable|string',
            'tkt' => 'nullable|numeric',
            'jml_jam' => 'nullable|numeric',
            'no_sert' => 'nullable|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'tgl_sert' => 'nullable|date_format:Y-m-d',
            'tempat' => 'nullable|string',
            'tgl_mulai' => 'nullable|date_format:Y-m-d',
            'tgl_selesai' => 'nullable|date_format:Y-m-d',
            'sk_tugas' => 'nullable|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'tgl_sk_tugas' => 'nullable|date_format:Y-m-d'


        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_diklat = $this->request->input('id_diklat');
        $id_sdm = $this->request->input('id_sdm');
        $id_kel_bidang = $this->request->input('id_kel_bidang');
        $id_katgiat = $this->request->input('id_katgiat');
        $id_jns_diklat = $this->request->input('id_jns_diklat');
        $nm_diklat = $this->request->input('nm_diklat');
        $penyelenggara = $this->request->input('penyelenggara');
        $thn = $this->request->input('thn');
        $peran = $this->request->input('peran');
        $tkt = $this->request->input('tkt');
        $jml_jam = $this->request->input('jml_jam');
        $no_sert = $this->request->input('no_sert');
        $tgl_sert = $this->request->input('tgl_sert');
        $tempat = $this->request->input('sk_tugas');
        $tgl_mulai = $this->request->input('tgl_mulai');
        $tgl_selesai = $this->request->input('tgl_selesai');
        $sk_tugas = $this->request->input('sk_tugas');
        $tgl_sk_tugas = $this->request->input('tgl_sk_tugas');
        $create_date = currDateTime();
        $last_update = currDateTime();
        $soft_delete = 0;
        $last_sync = currDateTime();

        if ($id_jns_diklat == 20 || $id_jns_diklat == 21) {
            return WrapResponse(['data' => null], 'gagal mengubah data diklat id_jns_diklat 20,21', FALSE);
        }


        DB::beginTransaction();
        try {
            $diklat = $this->diklat->where('id_diklat', $id_diklat)->first();
            if (!$diklat) return WrapResponse(['data' => null], 'id_diklat tidak ditemukan atau tidak terdaftar', FALSE);

            $diklat->update([
                'id_sdm' => $id_sdm,
                'id_kel_bidang' => $id_kel_bidang,
                'id_katgiat' => $id_katgiat,
                'id_jns_diklat' => $id_jns_diklat,
                'id_diklat' => $id_diklat,
                'nm_diklat' => $nm_diklat,
                'penyelenggara' => $penyelenggara,
                'thn' => $thn,
                'peran' => $peran,
                'tkt' => $tkt,
                'jml_jam' => $jml_jam,
                'no_sert' => $no_sert,
                'tgl_sert' => $tgl_sert,
                'tempat' => $tempat,
                'tgl_mulai' => $tgl_mulai,
                'tgl_selesai' => $tgl_selesai,
                'sk_tugas' => $sk_tugas,
                'tgl_sk_tugas' => $tgl_sk_tugas,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_diklat' => $id_diklat)), 'sukses mengubah data diklat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data diklat tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah data diklat', FALSE);
        }
    }


    public function destroy()
    {
        InputValidator([
            'id_diklat' => 'required',
        ]);

        $id_diklat = $this->request->input('id_diklat');
        $last_update = currDateTime();
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $soft_delete = 1;
        $last_sync = currDateTime();

        DB::beginTransaction();

        try {
            $daftar_diklat = $this->diklat->where('id_diklat', $id_diklat)->first();
            if (!$daftar_diklat) return WrapResponse(['data' => null], 'daftar diklat tidak ditemukan atau tidak terdaftar', FALSE);

            //hapus daftar diklat
            $daftar_diklat->update([
                'last_update' => $last_update,
                'id_updater' => $id_updater,
                'soft_delete' => $soft_delete,
                'last_sync' => $last_sync
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_diklat' => $id_diklat)), 'sukses menghapus daftar data diklat', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'data diklat tidak dapat dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data diklat', FALSE);
        }
    }
}
