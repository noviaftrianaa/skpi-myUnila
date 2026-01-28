<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\BimbingMhs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PembinaanController extends Controller
{
    protected $request;
    protected $bimbingMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->bimbingMhs = new BimbingMhs();
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
                    bm.id_bimb_mhs,
                    s.nm_lemb,
                    kk.nm_kat,
                    am.id_smt,
                    am.judul_akt_mhs,
                    jam.nm_jns_akt_mhs
                FROM
                    pdrd.bimbing_mhs AS bm WITH(NOLOCK)
                    JOIN pdrd.akt_mhs AS am WITH(NOLOCK) ON bm.id_akt_mhs = am.id_akt_mhs AND am.soft_delete = 0
                    JOIN pdrd.sms AS s WITH(NOLOCK) ON am.id_sms = s.id_sms AND s.soft_delete = 0
                    JOIN ref.kategori_kegiatan AS kk WITH(NOLOCK) ON bm.id_katgiat = kk.id_katgiat
                    JOIn ref.jenis_akt_mhs AS jam WITH(NOLOCK) ON am.id_jns_akt_mhs = jam.id_jns_akt_mhs AND jam.id_jns_akt_mhs IN (7)
                WHERE
                    bm.soft_delete = 0
                    AND bm.id_sdm = ?
                ORDER BY
                    am.id_smt DESC
            ";

            $query = DB::select($q, [$id_sdm]);
            if (empty($query)) {
                return WrapResponse(['data' => NULL], 'tidak ditemukan data bimbingan mahasiswa berdasarkan SDM', FALSE);
            }

            $data = [];
            foreach ($query as $value) {
                $data[] = [
                    'id' => $value->id_bimb_mhs,
                    'nama_program_studi' => $value->nm_lemb,
                    'kategori_kegiatan' => $value->nm_kat,
                    'semester' => $value->id_smt,
                    'judul_aktivitas_mahasiswa' => $value->judul_akt_mhs,
                    'jenis_aktivitas_mahasiswa' => $value->nm_jns_akt_mhs
                ];
            }

            return WrapResponse(compact('data'), 'sukses');
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return WrapResponse([], "detail data bimbingan mahasiswa tidak ditemukan atau data bimbingan mahasiswa tidak terdaftar", FALSE);
        }
    }
}
