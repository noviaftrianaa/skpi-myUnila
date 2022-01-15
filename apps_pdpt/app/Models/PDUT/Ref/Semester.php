<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Semester extends AbstractionModel
{
    protected $table = 'ref.semester';
    protected $primaryKey = 'id_smt';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_smt',	'id_thn_ajaran',	'nm_smt',	'smt',	'a_periode_aktif',	'tgl_mulai',	'tgl_selesai',
    ];
}