<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use function PHPUnit\Framework\arrayHasKey;

class Publikasi extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'pdrd.publikasi';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;

    public static function dashboard_publikasi($id_thn, $level, $id_sms)
    {
        $alternative_where = '';
        if ($level=='prodi') {
            $alternative_where .= " AND tr.id_sms='".$id_sms."'";
        } elseif ($level=='jurusan') {
            $alternative_where .= " AND tsms.id_jur_unila='".$id_sms."'";
        } elseif ($level=='fakultas') {
            $alternative_where .= " AND tsms.id_fak_unila='".$id_sms."'";
        }
        $query = "
                SELECT
                    a.nm_jns_pub, a.thn_terbit, COUNT(a.id_publikasi) AS total_publikasi
                FROM (
                    SELECT
                        jns.nm_jns_pub, YEAR(p.tgl_terbit) AS thn_terbit, p.id_publikasi
                    FROM pdrd.sdm AS tsdm
                    JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.id_jns_keluar IS NULL
                    JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.a_sp_homebase=1
                        AND ta.id_thn_ajaran=".$id_thn."
                    JOIN pdrd.sms AS tsms ON tsms.id_sms=tr.id_sms AND tsms.soft_delete=0
                    JOIN pdrd.tulis_pub AS tp ON tp.id_sdm=tsdm.id_sdm AND tp.soft_delete=0
                    JOIN pdrd.publikasi AS p ON p.id_publikasi=tp.id_publikasi AND p.soft_delete=0
                        AND p.id_jns_pub!=9999
                    JOIN ref.jenis_publikasi AS jns ON jns.id_jns_pub=p.id_jns_pub AND jns.expired_date IS NULL
                    WHERE tsdm.soft_delete=0 ".$alternative_where."
                ) AS a
                WHERE a.thn_terbit BETWEEN ".($id_thn-2)." AND ".$id_thn."
                GROUP BY a.nm_jns_pub, a.thn_terbit
                ORDER BY a.thn_terbit ASC, a.nm_jns_pub ASC
        ";
        $data = DB::SELECT($query);
        $data_group = collect($data)->groupBy('nm_jns_pub')->toArray();
        $data_pub = [];
        for ($i=($id_thn-2);$i<=$id_thn;$i++) {
            foreach ($data_group AS $key_pub=>$each_pub) {
                $data_pub[$key_pub][$i] = 0;
            }

            foreach ($data_group AS $key_pub_extras=>$each_pub_extrast) {
                foreach ($each_pub_extrast AS $detail_pub_extrast) {
                    if ($i==$detail_pub_extrast->thn_terbit) {
                        $data_pub[$key_pub_extras][$i] = $detail_pub_extrast->total_publikasi;
                    }
                }
            }
        }
        return $data_pub;
    }
}
