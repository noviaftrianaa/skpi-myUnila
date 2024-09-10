<?php

namespace App\Models\Pmb;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use DB;

class MinatProdi extends Model
{
    protected $table = 'temp_pmb.minat_prodi';

    public static function getTopMinatProdi($tahun, $kategori)
    {
        return DB::select("
            SELECT TOP 10
                CONCAT(jenj.nm_jenj_didik, '-', prodi.nm_lemb) AS nm_prodi_lulus,
                minat.jml_peminat
            FROM
                temp_pmb.minat_prodi AS minat
                LEFT JOIN pdrd.sms AS prodi ON prodi.id_sms = minat.id_prodi
                LEFT JOIN ref.jenjang_pendidikan AS jenj ON jenj.id_jenj_didik = prodi.id_jenj_didik
            WHERE
                minat.soft_delete = 0
                AND minat.id_thn_ajaran = ?
                AND minat.kategori = ?
            ORDER BY minat.jml_peminat DESC
        ", [$tahun, $kategori]);
    }
}
