<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AkreditasiProdiController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $listdata = DB::table('pdrd.akreditasi_prodi')->select('id_akreditasi_prodi', 'id_sms', 'id_lemb_akred', 'id_akred', 'sk_akreditasi_prodi', 'tanggal_sk_akreditasi_prodi', 'tst_sk_akreditasi_prodi', 'asal_data')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'id_sms' => $each_data->id_sms,
                'id_lemb_akred' => $each_data->id_lemb_akred,
                'id_akred' => $each_data->id_akred,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'tst_sk_akreditasi_prodi' => $each_data->tst_sk_akreditasi_prodi,
                'asal-data' => $each_data->asal_data,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
