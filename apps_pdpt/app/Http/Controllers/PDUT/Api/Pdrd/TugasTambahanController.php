<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\TugasTambahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TugasTambahanController extends Controller
{
    protected $request;
    protected $tugasTambahan;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->tugasTambahan = new TugasTambahan();
    }

    public function getData()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
        ]);

        $id_sdm = $this->request->input('id_sdm');

        try {
            $q = "
                SELECT
                    tt.id_tgs_tambah,
                    s.nm_lemb,
                    sp.nm_lemb AS nm_instansi,
                    tt.tmt_sk_tambah,
                    tt.tst_sk_tambah,
                    tt.sk_tugas_tambah,
                    kk.nm_kat
                FROM
                    pdrd.tugas_tambahan AS tt WITH(NOLOCK)
                    JOIN pdrd.sms AS s WITH(NOLOCK) ON tt.id_sms = s.id_sms AND s.soft_delete = 0
                    JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON s.id_sp = sp.id_sp AND sp.soft_delete = 0
                    JOIN ref.kategori_kegiatan AS kk WITH(NOLOCK) ON tt.id_katgiat = kk.id_katgiat
                WHERE
                    tt.soft_delete = 0
                    AND tt.id_sdm = ?
                ORDER BY
                    tt.tst_sk_tambah DESC
            ";

            $query = DB::select($q, [$id_sdm]);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data tugas tambahan berdasarkan SDM', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id' => $value->id_tgs_tambah,
                    'nama_lembaga' => $value->nm_lemb,
                    'nama_instansi' => $value->nm_instansi,
                    'tmt_sk_tambah' => $value->tmt_sk_tambah,
                    'tst_sk_tambah' => $value->tst_sk_tambah,
                    'sk_tugas_tambah' => $value->sk_tugas_tambah,
                    'kategori_kegiatan' => $value->nm_kat,
                ];
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data tugas tambahan tidak ditemukan atau data tugas tambahan tidak terdaftar", FALSE);
        }
    }
}
