<?php

namespace App\Models\Referensi;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'ref.tahun_ajaran';
    protected $primaryKey = 'id_thn_ajaran';

    public $timestamps = false;
    public $incrementing = false;

    public static function getList()
    {
        $res = self::select('nm_thn_ajaran','id_thn_ajaran')
            ->where('tgl_mulai','>','2000-01-01')
            ->where('id_thn_ajaran', '>=', date('Y')-4)
            ->where('tgl_mulai','<=',date('Y-m-d H:i:s'))
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>=', date('Y-m-d H:i:s'));
            })
            ->orderBy('id_thn_ajaran','desc')
            ->lists('nm_thn_ajaran','id_thn_ajaran')
            ->toArray();

        return $res;
    }

    public static function isValid($tahun)
    {
        $res = self::select('id_thn_ajaran')
            ->where('tgl_mulai','>','2010-01-01')
            ->where('id_thn_ajaran','<=',$tahun)
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>=', date('Y-m-d H:i:s'));
            })
            ->count();

        return $res;
    }

    public static function getAktif()
    {
        $res = self::select('id_thn_ajaran')
            ->where('a_periode_aktif','=',1)
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>=', date('Y-m-d'));
            })
            ->first();

        return $res->id_thn_ajaran;
    }

    public static function tglSelesai($tahun)
    {
        $res = self::select('tgl_selesai')
            ->where('id_thn_ajaran','=',$tahun)
            ->first();
        return $res->tgl_selesai;
    }

    public static function tglMulai($tahun)
    {
        $res = self::select('tgl_mulai')
            ->where('id_thn_ajaran','=',$tahun)
            ->first();
        return $res->tgl_mulai;
    }

    public static function getTA($tahun)
    {
        $res = self::select('id_thn_ajaran', 'nm_thn_ajaran')
            ->where('id_thn_ajaran','=',$tahun)
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>=', date('Y-m-d'));
            })
            ->first();

        return $res;
    }
}
