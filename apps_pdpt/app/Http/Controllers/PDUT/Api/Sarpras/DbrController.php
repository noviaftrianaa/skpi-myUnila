<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Dbr;
use Illuminate\Http\Request;

class DbrController extends Controller
{
    protected $request;
    protected $dbr;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->dbr = new Dbr();
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
