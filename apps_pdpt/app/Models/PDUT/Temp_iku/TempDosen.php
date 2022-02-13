<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempDosen extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_dsn';
    protected $primaryKey = 'id_iku3_dsn';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_dsn',
        'id_dsn',
        'nm',
        'tmp_lhr',
        'tgl_lhr',
        'usia',
        'jk',
        'nidn',
        'nidk',
        'ikt_kerja',
        'fakultas',
        'jurusan',
        'prodi',
        'jenj_lulusan',
        'pt_lulusan',
        'last_sync'
    ];
}
