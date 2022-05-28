<?php

namespace App\Http\Controllers\PDUT\Api\Pmb;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pmb\DayaTampung;
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

    protected $getAllListDayaTampung;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->daya_tampung = new DayaTampung();
    }

    public function getAllListDayaTampung()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

        $sortby = $this->request->input('sortby');
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
            return WrapResponse([], "detail data daya tampung tidak ditemukan atau data daya tampung tidak terdaftar", FALSE);
        }
    }
}
