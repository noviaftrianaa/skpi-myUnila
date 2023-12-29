<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use DB;
use App\Models\Peran;
use Auth;

class PeranController extends Controller
{

    protected $request;
    protected $peran;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->peran = new Peran();
    }

    public function list(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('limit', 50);
        $sortBy = $request->input('sort_by', 'ASC');

        InputValidator([
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
        ], [
            'sort_by.alpha' => 'input penyortiran harus kata',
            'sort_by.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET
                @PageNumber = ?
            SET
                @RowsOfPage = ?
            SELECT
                *
            FROM
                man_akses.peran
            ORDER BY
                id_peran " . $sortBy . "
            OFFSET (@PageNumber -1) *
            @RowsOfPage ROWS FETCH NEXT
            @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id'                    => $each_data->id_peran,
                'peran'                 => $each_data->nm_peran,
                'tgl_dibuat'            => TglWaktuIndonesia($each_data->tgl_create),
                'terakhir_update'       => TglWaktuIndonesia($each_data->last_update)
            ];
        }

        return WrapResponse(compact('data'), 'Berhasil mengambil data list Pengguna');
    }
}
