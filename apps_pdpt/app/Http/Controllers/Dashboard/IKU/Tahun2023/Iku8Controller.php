<?php

namespace App\Http\Controllers\Dashboard\IKU\Tahun2023;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables as DaTables;

class Iku8Controller extends Controller
{
    private $request;
    private $tahunIku;

    public function __construct()
    {
        $this->request = app(Request::class);
        $this->tahunIku = app(Iku1Controller::class)->tahunIku();
    }

    public function homeIku8()
    {
        $thn_iku = $this->tahunIku;
        $side_active   = 'iku';
        return view('home.wr.wakil_rektor4.iku.iku8', compact('side_active', 'thn_iku'));
    }

}
