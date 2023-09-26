<?php

namespace App\Http\Controllers\PDUT\Sinkronisasi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use stdClass;

use App\Models\PDUT\Man_akses\TableAplikasi;

class TableController extends Controller
{
    protected $basepath;
    protected $id_sp;
    protected $request;

    public function __construct(Request $request)
    {
        $this->basepath = 'sinkonisasi';
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
        $this->request = $request;
    }

    public function index()
    {
        $side_active = $this->basepath;
        return view('home.sinkronisasi.daftar_tabel', compact('side_active'));
    }

    public function skema_tabel(){

        $data = DB::SELECT("
            SELECT
                DISTINCT skema_tbl
            FROM
                man_akses.table_aplikasi WITH (NOLOCK)
            WHERE
                expired_date IS NULL
                AND a_table_aktif = 1
            ORDER BY
                skema_tbl DESC
        ");

        return \DataTables::of($data)->make(true);

    }

    public function daftar_tabel(){
        $skema_tabel = $this->request->input('skema_tbl');
        $select = "
            SELECT
                id_table_app,
                skema_tbl,
                nm_tbl,
                tabel_alias,
                kode_primary,
                a_table_aktif,
                tgl_create
            FROM
                man_akses.table_aplikasi WITH (NOLOCK)
        ";
        $where = "
            WHERE
                expired_date IS NULL
                AND a_table_aktif = 1
            ORDER BY
                nm_tbl ASC
                ";

        if(!is_null($skema_tabel)){
            $where = "AND skema_tbl = '". $skema_tabel ."'";
            $data = DB::SELECT($select . $where);
            return \DataTables::of($data)->make(true);
        }else{
            $data = DB::SELECT($select . $where);
            return \DataTables::of($data)->make(true);
        }

    }

    public function sinkron(){
        dd($this->request->all());
    }

}
