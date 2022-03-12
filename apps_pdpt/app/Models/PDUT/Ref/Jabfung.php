<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Jabfung extends Model
{
    protected $table = 'ref.jabfung';
    protected $primaryKey = 'id_jabfung';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jabfung',
	'id_kel_prof',
	'nm_jabfung',
	'angka_kredit',
	'create_date',
	'last_update',
	'expired_date',
	'last_sync',
    ];

    public static function getList()
    {
        $res = self::select(
            DB::RAW("concat(nm_jabfung , CASE WHEN angka_kredit>0 THEN concat(' (' , convert(int,angka_kredit),')') ELSE '' END) as nm_jabfung"),
            'id_jabfung'
        )
            ->where('id_jabfung','>=',31)
            ->where('id_kel_prof','=','2')
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>=', date('Y-m-d'));
            })
            ->orderBy('id_jabfung','desc')
            ->pluck('nm_jabfung','id_jabfung')
            ->toArray();

        return $res;
    }
}
