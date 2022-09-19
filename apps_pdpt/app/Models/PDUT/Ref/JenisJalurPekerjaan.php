<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisJalurPekerjaan extends Model
{
    protected $table = 'ref.jenis_jalur_pekerjaan';
    protected $primaryKey = 'id_jns_jalur_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_jalur_kerja',	'nm_jns_jalur_kerja',	'create_date',	'last_update',
    ];
}