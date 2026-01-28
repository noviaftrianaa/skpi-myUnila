<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RwyPekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RwyPekerjaanController extends Controller
{
    protected $request;
    protected $rwyPekerjaan;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->rwyPekerjaan = new RwyPekerjaan();
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
                    rp.id_rwy_kerja,
                    rp.nm_jabatan,
                    rp.deskripsi_kerja,
                    rp.instansi,
                    rp.mulai_bekerja,
                    rp.selesai_bekerja
                FROM pdrd.rwy_pekerjaan AS rp WITH(NOLOCK)
                WHERE
                    rp.soft_delete = 0
                    AND rp.id_sdm = ?
                ORDER BY
                    rp.mulai_bekerja DESC
            ";

            $query = DB::select($q, [$id_sdm]);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data riwayat pekerjaan berdasarkan SDM', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id' => $value->id_rwy_kerja,
                    'nama_jabatan' => $value->nm_jabatan,
                    'deskripsi_pekerjaan' => $value->deskripsi_kerja,
                    'instansi' => $value->instansi,
                    'mulai_bekerja' => $value->mulai_bekerja,
                    'selesai_bekerja' => $value->selesai_bekerja,
                ];
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data riwayat pekerjaan tidak ditemukan atau data riwayat pekerjaan tidak terdaftar", FALSE);
        }
    }
}
