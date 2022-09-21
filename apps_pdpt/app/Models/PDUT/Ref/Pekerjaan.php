<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Pekerjaan extends Model
{
    protected $table = 'ref.pekerjaan';
    protected $primaryKey = 'id_pekerjaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pekerjaan',	'nm_pekerjaan',	'create_date',	'last_update',
    ];
}