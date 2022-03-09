<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Tanah;
use Illuminate\Http\Request;

class TanahController extends Controller
{
    protected $request;
    protected $tanah;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->tanah = new Tanah();
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
