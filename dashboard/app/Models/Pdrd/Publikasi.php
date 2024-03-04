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

    public static function get_data_pub($list_sms,$tipe)
    {
        $where_katgiat = '';
        if ($tipe=='publikasi') {
            $where_katgiat .= " AND tp.id_katgiat IN (120101, 120102, 120103, 120104, 120105, 120106, 120107, 120108, 120109, 120110, 120111, 120112, 120901, 120902, 120903, 120904, 120905, 120906, 120907, 120908, 120909, 120910, 120911, 120113, 120114, 120115, 120116, 120117, 120118, 120119, 120120, 120121, 120122, 120200, 120300, 121300, 130500, 130600)";
        } else {
            $where_katgiat .= " AND (kk.id_induk_katgiat IN (120400, 121100, 121200, 120504) OR tp.id_katgiat=121000)";
        }
        $condition = '';
        if (count($list_sms)>0) {
            $condition = " AND tr.id_sms IN ('".implode("','",$list_sms)."')";
        }
        $query = "
            SELECT
                 DISTINCT p.id_publikasi, jns.nm_jns_pub, p.judul, YEAR(p.tgl_terbit) AS thn_terbit, p.tgl_terbit, tp2.nm_ketua, tp2.prodi_ketua
            FROM pdrd.sdm AS tsdm
            JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                AND tr.id_jns_keluar IS NULL AND tr.id_sp='".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                ".$condition."
            JOIN pdrd.keaktifan_ptk AS ta ON ta.id_reg_ptk=tr.id_reg_ptk AND ta.a_sp_homebase=1
                AND ta.id_thn_ajaran=".get_tahun_keaktifan()."
            JOIN pdrd.tulis_pub AS tp ON tp.id_sdm=tsdm.id_sdm AND tp.soft_delete=0
            JOIN pdrd.publikasi AS p ON p.id_publikasi=tp.id_publikasi AND p.soft_delete=0
                AND p.id_jns_pub!=9999
            JOIN ref.jenis_publikasi AS jns ON jns.id_jns_pub=p.id_jns_pub AND jns.expired_date IS NULL
            JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat=tp.id_katgiat AND kk.expired_date IS NULL
            LEFT JOIN (
                SELECT TOP 1 t.id_publikasi, CONCAT(sdm.nm_sdm,' (',sdm.nidn,')') AS nm_ketua, CONCAT(s.nm_lemb,' (',j.nm_jenj_didik,')') AS prodi_ketua
                FROM pdrd.tulis_pub AS t
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm=t.id_sdm AND sdm.soft_delete=0
                JOIN pdrd.reg_ptk AS r ON r.id_sdm=sdm.id_sdm AND r.soft_delete=0
                    AND r.id_jns_keluar IS NULL
                JOIN pdrd.keaktifan_ptk AS tk ON tk.id_reg_ptk=r.id_reg_ptk AND tk.soft_delete=0
                    AND tk.a_sp_homebase=1 AND tk.id_thn_ajaran=".get_tahun_keaktifan()."
                JOIN pdrd.sms AS s ON s.id_sms=r.id_sms AND s.soft_delete=0
                JOIN ref.jenjang_pendidikan AS j ON j.id_jenj_didik=s.id_jenj_didik
                WHERE t.soft_delete=0 AND t.urutan=1
            ) AS tp2 ON tp2.id_publikasi=p.id_publikasi
            WHERE tsdm.soft_delete=0
            ".$where_katgiat."
            ORDER BY p.tgl_terbit DESC
	    ";
        return DB::SELECT($query);
    }

    public static function get_penulis($id)
    {
        $query = "
            SELECT
                CASE
                    WHEN tp.id_sdm IS NOT NULL THEN CONCAT(tsdm.nm_sdm,' (',tsdm.nidn,')')
                    WHEN tp.id_pd IS NOT NULL THEN CONCAT(tp.nm_pd,' (',rpd.nipd,')')
                    ELSE NULL
                END AS nama,
                tp.urutan,
                CASE WHEN tp.id_sdm IS NOT NULL THEN js.nm_jns_sdm
                    WHEN tp.id_pd IS NOT NULL THEN 'Mahasiswa'
                    ELSE NULL
                END AS jenis_penulis
            FROM pdrd.tulis_pub AS tp
            LEFT JOIN pdrd.sdm AS tsdm ON tsdm.id_sdm=tp.id_sdm
            LEFT JOIN ref.jenis_sdm AS js ON js.id_jns_sdm=tsdm.id_jns_sdm
            LEFT JOIN pdrd.peserta_didik AS pd ON pd.id_pd=tp.id_pd
            LEFT JOIN pdrd.reg_pd AS rpd ON rpd.id_pd=pd.id_pd AND rpd.soft_delete=0
            WHERE tp.soft_delete=0
                AND tp.id_publikasi='" . $id . "'
            ORDER BY tp.urutan ASC
        ";
        $data = collect(DB::SELECT($query))->toArray();
        return $data;
    }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    public static function total_publikasi($tahun)
    {
        $query = "
            SELECT
                p.nm_lemb,
                SUM(p.total) AS total
            FROM
                (
                    SELECT
                        fak.nm_lemb,
                        (
                            SELECT
                                COUNT(DISTINCT pub.id_publikasi)
                            FROM
                                pdrd.publikasi AS pub WITH (NOLOCK)
                                JOIN pdrd.tulis_pub AS tulis WITH (NOLOCK) ON tulis.id_publikasi=pub.id_publikasi AND tulis.soft_delete=0 AND tulis.peran_tulis='A'
                                JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm=tulis.id_sdm AND ptk.soft_delete=0
                            WHERE
                                pub.soft_delete=0
                                AND YEAR(pub.tgl_terbit) = '".$tahun."'
                                AND pub.id_jns_pub NOT IN (41,42,43,44)
                                AND ptk.id_sms=sms.id_sms
                        ) AS total
                    FROM
                        pdrd.sms AS sms WITH (NOLOCK)
                        JOIN pdrd.sms AS fak WITH (NOLOCK) ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
                    WHERE
                        sms.soft_delete=0
                ) AS p
            GROUP BY
                p.nm_lemb
            ORDER BY
                p.nm_lemb ASC
        ";

        $data = \DB::SELECT($query);

        return collect($data);
    }

    public static function total_haki($tahun)
    {
        $query = "
            SELECT
                p.nm_lemb,
                SUM(p.total) AS total
            FROM
                (
                    SELECT
                        fak.nm_lemb,
                        (
                            SELECT
                                COUNT(DISTINCT pub.id_publikasi)
                            FROM
                                pdrd.publikasi AS pub WITH (NOLOCK)
                                JOIN pdrd.tulis_pub AS tulis WITH (NOLOCK) ON tulis.id_publikasi=pub.id_publikasi AND tulis.soft_delete=0 AND tulis.peran_tulis='A'
                                JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm=tulis.id_sdm AND ptk.soft_delete=0
                            WHERE
                                pub.soft_delete=0
                                AND YEAR(pub.tgl_terbit) = '".$tahun."'
                                AND pub.id_jns_pub IN (41,42,43,44)
                                AND ptk.id_sms=sms.id_sms
                        ) AS total
                    FROM
                        pdrd.sms AS sms WITH (NOLOCK)
                        JOIN pdrd.sms AS fak WITH (NOLOCK) ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
                    WHERE
                        sms.soft_delete=0
                ) AS p
            GROUP BY
                p.nm_lemb
            ORDER BY
                p.nm_lemb ASC
        ";

        $data = \DB::SELECT($query);

        return collect($data);
    }
}
