<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class SumberListrik extends Model
{
    protected $table = 'ref.sumber_listrik';
    protected $primaryKey = 'id_sumber_listrik';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sumber_listrik',	'create_date',	'last_update',	'nm_sumber_listrik',
    ];
}