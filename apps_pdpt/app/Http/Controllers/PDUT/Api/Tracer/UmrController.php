<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\UmrWilayah;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class UmrController extends Controller
{

    protected $request;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
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
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                umr.id_umr_wil, wil.nm_wil, ta.id_tahun_anggaran,
                umr.besaran_umr, umr.create_date AS waktu_data_ditambahkan,
                umr.last_update AS terakhir_diubah
            FROM tracer.umr_wilayah AS umr WITH(NOLOCK)
            JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = umr.id_wil
                AND wil.expired_date IS NULL
            JOIN ref.tahun_anggaran AS ta WITH(NOLOCK) ON ta.id_tahun_anggaran = umr.id_tahun_anggaran
                AND wil.expired_date IS NULL
            WHERE umr.soft_delete = 0
            ORDER BY wil.nm_wil " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_umr_wil' => $each_data->id_umr_wil,
                'wilayah' => $each_data->nm_wil,
                'tahun_anggaran' => $each_data->id_tahun_anggaran,
                'besaran_umr' => $each_data->besaran_umr,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list UMR wilayah');
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $id_wil = $request->input('id_wilayah');
        $id_tahun_anggaran = $request->input('id_tahun_anggaran');
        $besaran_umr = $request->input('besaran_umr');

        DB::beginTransaction();
        try {
                UmrWilayah::updateOrInsert([
                    'id_wil' => $id_wil,
                    'id_tahun_anggaran' => $id_tahun_anggaran
                ],[
                    'id_umr_wil' => guid(),
                    'besaran_umr' => $besaran_umr,
                    'id_creator' => guid(),
                    'id_updater' => guid(),
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0
                ]);

            DB::commit();
            return WrapResponse([], 'sukses menambahkan umr wilayah');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan umr wilayah");
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $id_umr_wil = $request->input('id_umr_wil');
        $besaran_umr = $request->input('besaran_umr');

        InputValidator([
            'id_umr_wil' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'besaran_umr' => 'required|numeric'
        ], [
            'id_umr_wil.required' => 'field ini harus diisi',
            'id_umr_wil.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'besaran_umr.regex' => 'input harus numerik'
        ]);

        DB::beginTransaction();
        try {
            $data_umr = UmrWilayah::where('id_umr_wil', $id_umr_wil)->first();

            if (empty($data_umr)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $data_umr->update([
                'besaran_umr' => $besaran_umr,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);


            DB::commit();
            return WrapResponse([], 'sukses memperbaharui umr wilayah - ' . $data_umr->id_umr_wil);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal memperbaharui umr wilayah");
        }
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $id_umr_wil = $request->input('id_umr_wil');
        InputValidator([
            'id_umr_wil' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_umr_wil.required' => 'field ini harus diisi',
            'id_umr_wil.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $data_umr = UmrWilayah::where('id_umr_wil', $id_umr_wil)->first();

            if (empty($data_umr)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $data_umr->update(['soft_delete' => 1]);

            DB::commit();
            return WrapResponse([], 'sukses menghapus umr wilayah - ' . $data_umr->id_umr_wil);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menghapus umr wilayah");
        }
    }
}
