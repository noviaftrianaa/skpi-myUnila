<?php

namespace App\Models\PDUT\Dok;

use Illuminate\Database\Eloquent\Model;

class DokNilaiTes extends Model
{
    protected $table = 'dok.dok_nilai_tes';
    protected $primaryKey = 'id_nilai_tes';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_nilai_tes',	'id_dok',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}