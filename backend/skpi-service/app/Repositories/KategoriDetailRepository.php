<?php

namespace App\Repositories;

use App\Models\KategoriDetail;

class KategoriDetailRepository
{
    public function getByKategori(int $kategoriId)
    {
        return KategoriDetail::where('kategori_id', $kategoriId)
            ->orderBy('nama')
            ->get();
    }
}