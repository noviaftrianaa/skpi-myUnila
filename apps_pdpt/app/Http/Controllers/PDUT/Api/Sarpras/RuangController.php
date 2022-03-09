<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Ruang;
use Illuminate\Http\Request;

class RuangController extends Controller
{
    protected $request;
    protected $ruang;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->ruang = new Ruang();
    }

    public function daftar()
    {
    }

    public function tambah()
    {
    }

    public function ubah()
    {
    }

    public function hapus()
    {
    }
}
