<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class AktifitasKerjasama extends Model
{
    protected $table = 'ref.aktifitas_kerjasama';
    protected $primaryKey = 'id_akt_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_akt_kerjasama',	'nm_akt_kerjasama',	'ket',	'create_date',	'last_update',
    ];
}