<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class NilaiTes extends Model
{
    protected $table = 'pdrd.nilai_tes';
    protected $primaryKey = 'id_nilai_tes';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_nilai_tes',	'id_sdm',	'id_jns_tes',	'nm_nilai_tes',	'penyelenggara',	'thn',	'skor',	'tgl_tes',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}