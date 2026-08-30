<?php

namespace App\Repositories;

use App\Models\Tingkatan;

class TingkatanRepository
{
    public function all()
    {
        return Tingkatan::orderBy('nama')->get();
    }

    public function find(int $id): ?Tingkatan
    {
        return Tingkatan::find($id);
    }
}