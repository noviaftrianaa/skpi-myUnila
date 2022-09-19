<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KelompokProfesi extends Model
{
    protected $table = 'ref.kelompok_profesi';
    protected $primaryKey = 'id_kel_prof';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_prof',	'nm_kel_prof',	'ket_kel_prof',	'create_date',	'last_update',
    ];
}