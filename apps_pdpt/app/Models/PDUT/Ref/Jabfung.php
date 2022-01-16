<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class Jabfung extends AbstractionModel
{
    protected $table = 'ref.jabfung';
    protected $primaryKey = 'id_jabfung';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jabfung',	'id_kel_prof',	'nm_jabfung',	'angka_kredit',
    ];
}