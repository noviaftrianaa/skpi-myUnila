<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisAktMhs extends Model
{
    protected $table = 'ref.jenis_akt_mhs';
    protected $primaryKey = 'id_jns_akt_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_akt_mhs',	'nm_jns_akt_mhs',	'ket_jns_akt_mhs',	'a_kegiatan_kampus_merdeka',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}