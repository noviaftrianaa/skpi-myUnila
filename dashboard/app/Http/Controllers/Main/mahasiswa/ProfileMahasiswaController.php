<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileMahasiswaController extends Controller
{
    private string $path_view = 'content.main.mahasiswa.';
    public function index(){
        $judul = "Halaman Profile";

        return view($this->path_view.'profile_mhs.index', compact('judul'));
    }
}
