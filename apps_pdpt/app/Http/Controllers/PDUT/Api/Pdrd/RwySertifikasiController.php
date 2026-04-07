<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RwySertifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RwySertifikasiController extends Controller
{
    protected $request;
    protected $rwySertifikasi;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->rwySertifikasi = new RwySertifikasi();
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
                    rs.id_rwy_sert,
                    js.nm_jns_sert,
                    bs.nm_bid_studi,
                    ls.nm_lemb_sert,
                    rs.sk_sert,
                    rs.thn_sert
                FROM pdrd.rwy_sertifikasi AS rs WITH(NOLOCK)
                JOIN ref.jenis_sert AS js WITH(NOLOCK) ON rs.id_jns_sert = js.id_jns_sert
                LEFT JOIN ref.bidang_studi AS bs WITH(NOLOCK) ON rs.id_bid_studi = bs.id_bid_studi
                LEFT JOIN ref.lembaga_sertifikasi AS ls WITH(NOLOCK) ON rs.id_lemb_sert = ls.id_lemb_sert
                WHERE
                    rs.soft_delete = 0
                    AND rs.id_sdm = ?
                ORDER BY
                    rs.thn_sert DESC
            ";

            $query = DB::select($q, [$id_sdm]);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data riwayat sertifikasi berdasarkan SDM', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id' => $value->id_rwy_sert,
                    'jenis_sertifikasi' => $value->nm_jns_sert,
                    'bidang_studi' => $value->nm_bid_studi,
                    'lembaga_sertifikasi' => $value->nm_lemb_sert,
                    'sk_sertifikasi' => $value->sk_sert,
                    'tahun_sertifikasi' => $value->thn_sert,
                ];
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data riwayat sertifikasi tidak ditemukan atau data riwayat sertifikasi tidak terdaftar", FALSE);
        }
    }
}
