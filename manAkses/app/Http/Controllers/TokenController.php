<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AccessToken;
use App\Models\TokenUser;
use DB;
use Auth;
use Crypt;
use DataTables;

class TokenController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if($request->ajax()) {
            $data = DB::SELECT('
                SELECT *
                FROM man_akses.access_token AS token
                JOIN man_akses.token_user AS token_user ON token_user.id_token=token.id_token
                ORDER BY token_user.wkt_create DESC
            ');

            return DataTables::of($data)
                ->addIndexColumn()
                ->addColumn('action', function($data) {
                    $button = '<a type="button" class="btn btn-primary btn-xs" title="Show" href="'.route('token.detail', [Crypt::encrypt($item->id_token)]).'"><i class="fas fa-eye"></i></a>';
                    return $button;
                })
                ->rawColumns(['action'])
                ->make(true);
        }
        return view('manajemen.token.index');
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
    public function detail($id)
    {
        $id = Crypt::decrypt($id);
        $data = DB::SELECT('
            SELECT *
            FROM man_akses.token_uri_sequence
            ORDER BY last_hit DESC
        ');
        return view('manajemen.token.show', ['data'=>$data]);
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
