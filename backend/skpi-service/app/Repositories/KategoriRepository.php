<?php

namespace App\Repositories;

use App\Models\KategoriKegiatan;

class KategoriRepository
{
    public function all()
    {
        return KategoriKegiatan::all();
    }

    public function prestasi()
    {
        return KategoriKegiatan::where('is_prestasi', true)
            ->orderBy('nama')
            ->get();
    }
}