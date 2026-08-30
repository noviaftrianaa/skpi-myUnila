<?php

namespace App\Repositories;

use App\Models\BobotSkp;

class BobotRepository
{
    public function getBobot(int $kategoriId, int $tingkatanId, int $detailId)
    {
        return BobotSkp::where('kategori_id', $kategoriId)
            ->where('tingkatan_id', $tingkatanId)
            ->where('kategori_detail_id', $detailId)
            ->first();
    }
}
