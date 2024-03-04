<?php

namespace App\Models\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Litabmas extends AbstractionModel
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = 'pdrd.litabmas';
    protected $primaryKey = 'id_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    public $hidden = [
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];

    public static function get_data_litabmas($kode='L',$list_sms)
    {
        $condition = '';
        if (count($list_sms)>0) {
            $condition = " AND tr.id_sms IN ('".implode("','",$list_sms)."')";
        }
        $query = "
            SELECT DISTINCT a.* FROM (
                SELECT
                    l.id_litabmas,
                    CASE WHEN l.jns_litabmas='L' THEN 'Penelitian' ELSE 'Pengabdian' END AS jenis_litabmas,
                    l.judul_litabmas,
                    l.sk_tugas,
                    l.tgl_sk_tugas,
                    l.lokasi_kegiatan,
                    l.id_thn_usulan AS thn_usulan,
                    l.id_thn_kegiatan AS thn_kegiatan,
                    ang2.nm_sdm AS nm_ketua,
                    ang2.prodi_ketua
                FROM pdrd.sdm AS tsdm
                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                    AND tr.id_jns_keluar IS NULL AND tr.id_sp='".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                    ".$condition."
                JOIN pdrd.keaktifan_ptk AS taptk ON taptk.id_reg_ptk=tr.id_reg_ptk
                    AND taptk.soft_delete=0 AND taptk.a_sp_homebase=1 AND taptk.id_thn_ajaran=".get_tahun_keaktifan()."
                JOIN pdrd.sdm_anggota_litabmas AS tsl ON tsl.id_sdm=tsdm.id_sdm AND tsl.soft_delete=0
                JOIN pdrd.litabmas AS l ON l.id_litabmas=tsl.id_litabmas AND l.soft_delete=0
                    AND l.jns_litabmas='".$kode."'
                LEFT JOIN (
                    SELECT t1.id_litabmas, tsdm.nm_sdm, t1.peran_litabmas, CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS prodi_ketua FROM pdrd.sdm_anggota_litabmas AS t1
                    JOIN pdrd.sdm AS tsdm ON tsdm.id_sdm=t1.id_sdm
                    JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                    JOIN pdrd.keaktifan_ptk AS taptk ON taptk.id_reg_ptk=tr.id_reg_ptk
                        AND taptk.soft_delete=0 AND taptk.a_sp_homebase=1 AND taptk.id_thn_ajaran=".get_tahun_keaktifan()."
                    JOIN pdrd.sms AS tsms ON tsms.id_sms=tr.id_sms
                    JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
                    WHERE tr.id_sp='".env('APP_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515')."'
                    AND t1.peran_litabmas='K'
                ) AS ang2 ON l.id_litabmas=ang2.id_litabmas
                WHERE tsdm.soft_delete=0
            ) AS a
            ORDER BY a.thn_usulan DESC, a.judul_litabmas ASC
        ";
        return DB::SELECT($query);
    }

    public static function get_penulis($id)
    {
        $query = "
            SELECT a.* FROM (
                SELECT
                    tsdm.nm_sdm AS nama,
                    CASE WHEN sl.peran_litabmas='K' THEN 'Ketua' ELSE 'Anggota' END peran,
                    tj.nm_jns_sdm AS jenis_penulis
                FROM pdrd.sdm_anggota_litabmas AS sl
                JOIN pdrd.sdm AS tsdm ON tsdm.id_sdm=sl.id_sdm
                JOIN ref.jenis_sdm AS tj ON tj.id_jns_sdm=tsdm.id_jns_sdm
                WHERE sl.soft_delete=0
                AND sl.id_litabmas='".$id."'

                UNION

                SELECT
                    pd.nm_pd AS nama,
                    CASE WHEN pl.peran_litabmas='K' THEN 'Ketua' ELSE 'Anggota' END peran,
                    'Mahasiswa' AS jenis_penulis
                FROM pdrd.pd_anggota_litabmas AS pl
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd=pl.id_pd
                WHERE pl.soft_delete=0
                AND pl.id_litabmas='".$id."'

                UNION

                SELECT
                    nc.nm_orang AS nama,
                    CASE WHEN ncl.peran_litabmas='K' THEN 'Ketua' ELSE 'Anggota' END peran,
                    'Non Civitas Akademika' AS jenis_penulis
                FROM pdrd.non_ca_anggota_litabmas AS ncl
                JOIN pdrd.non_ca AS nc ON nc.id_orang=ncl.id_orang
                WHERE ncl.soft_delete=0
                AND ncl.id_litabmas='".$id."'
            ) AS a
            ORDER BY a.peran DESC
        ";
        $data = collect(DB::SELECT($query))->toArray();
        return $data;
    }

    public static function total($tahun, $jenis)
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
                                COUNT(DISTINCT litabmas.id_litabmas)
                            FROM
                                pdrd.litabmas AS litabmas WITH (NOLOCK)
                                JOIN pdrd.sdm_anggota_litabmas AS tulis WITH (NOLOCK) ON tulis.id_litabmas=litabmas.id_litabmas AND tulis.soft_delete=0
                                JOIN pdrd.reg_ptk AS ptk WITH (NOLOCK) ON ptk.id_sdm=tulis.id_sdm AND ptk.soft_delete=0
                            WHERE
                                litabmas.soft_delete=0
                                AND litabmas.jns_litabmas = '".$jenis."'
                                AND litabmas.id_thn_laks = '".$tahun."'
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
