<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LembagaNonSp extends Model
{
    protected $table = 'pdrd.lembaga_non_sp';
    protected $primaryKey = 'id_lemb_non_sp';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_lemb_non_sp',
	'nm_lemb',
	'singkatan',
	'deskripsi',
	'level_lemb',
	'tgl_mulai_efektif',
	'tgl_akhir_efektif',
	'jln',
	'rt',
	'rw',
	'nm_dsn',
	'ds_kel',
	'kode_pos',
	'lintang',
	'bujur',
	'no_tel',
	'no_fax',
	'email',
	'website',
	'kd_kl',
	'kd_satker',
	'id_jns_lemb',
	'id_wil',
	'id_induk_lemb_non_sp',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];




    public static function getNamaLembaga($id)
    {
        $result = Self::select('nm_lemb')->where('id_lemb_non_sp',$id)->first();
        if($result)
            $nama = $result->nm_lemb;
        else
            $nama = 'Semua Unit';

        return $nama;
    }

    /**
     * Get List
     *
     * Digunakan untuk menampilkan list Lembaga Non SP sesuai dengan Hirarki
     *
     * @return  Array
     *
     */
    public static function getList($encrypt = '')
    {
        $arr = [];
        // Get Lembaga Non SP Teratas
        $first = DB::select("SELECT id_lemb_non_sp,nm_lemb FROM pdrd.lembaga_non_sp WHERE level_lemb='0' AND id_jns_lemb=99")[0];
        if($encrypt=='encrypted')
            $arr[Crypt::encrypt($first->id_lemb_non_sp)] = $first->nm_lemb;
        else
            $arr[$first->id_lemb_non_sp] = $first->nm_lemb;

        // Get Hirarki Lembaga Non SP
        $res = DB::select("WITH tableR
                          AS
                          (
                              SELECT e.id_induk_lemb_non_sp, e.id_lemb_non_sp, case when e.level_lemb ='1' then CONCAT('- ',e.nm_lemb) when e.level_lemb ='2' then CONCAT('-- ',e.nm_lemb) when e.level_lemb ='3' then CONCAT('--- ',e.nm_lemb) when e.level_lemb ='4' then CONCAT('---- ',e.nm_lemb) end as nm_lemb, case when e.nm_lemb ='DP2M' then '00' when e.deskripsi='A' then '20' when e.deskripsi='B' then '22' when e.deskripsi='C' then '26' when e.deskripsi='D' then '24' when e.deskripsi='E' then '28' else e.deskripsi end as deskripsi, e.level_lemb, e.tgl_akhir_efektif
                              FROM pdrd.lembaga_non_sp AS e
                              WHERE id_induk_lemb_non_sp in (SELECT id_lemb_non_sp FROM pdrd.lembaga_non_sp WHERE level_lemb=0)

                              UNION ALL

                              SELECT e.id_induk_lemb_non_sp, e.id_lemb_non_sp, case when e.level_lemb ='1' then CONCAT('- ',e.nm_lemb) when e.level_lemb ='2' then CONCAT('-- ',e.nm_lemb) when e.level_lemb ='3' then CONCAT('--- ',e.nm_lemb) when e.level_lemb ='4' then CONCAT('---- ',e.nm_lemb) end as nm_lemb, case when e.nm_lemb ='DP2M' then '00' when e.deskripsi='A' then '20' when e.deskripsi='B' then '22' when e.deskripsi='C' then '26' when e.deskripsi='D' then '24' when e.deskripsi='E' then '28' else e.deskripsi end as deskripsi, e.level_lemb, e.tgl_akhir_efektif
                              FROM pdrd.lembaga_non_sp AS e
                              INNER JOIN tableR AS d
                                  ON e.id_induk_lemb_non_sp = d.id_lemb_non_sp
                          )
                          SELECT id_lemb_non_sp, nm_lemb
                          FROM tableR
                          WHERE nm_lemb NOT LIKE '%PT luar negeri%'
                          AND (tgl_akhir_efektif >= getdate() OR tgl_akhir_efektif IS NULL)
                          ORDER BY deskripsi ASC,  level_lemb ASC
                    ");

        // Konversi Hirarki dalam ARRAY
        foreach($res as $r)
        {
            if($encrypt=='encrypted')
                $arr[Crypt::encrypt($r->id_lemb_non_sp)] = $r->nm_lemb;
            else
                $arr[$r->id_lemb_non_sp] = $r->nm_lemb;
        }
        return $arr;
    }


    /**
     * fungsi untuk menampilkan Lembaga Pembina
     */
    public static function listPembina()
    {
        return DB::SELECT("
                      SELECT lem.id_lemb_non_sp, lem.nm_lemb FROM [pdrd].[lembaga_non_sp] lem WITH (NOLOCK)
                      LEFT JOIN [pdrd].[satuan_pendidikan] sp WITH (NOLOCK) ON lem.id_lemb_non_sp=sp.id_pembina
                      WHERE lem.soft_delete = 0
                      AND sp.soft_delete = 0
                      AND lem.deskripsi IS NOT NULL
                      AND LEFT(sp.id_wil,2) != '99'
                      GROUP BY lem.id_lemb_non_sp, lem.nm_lemb, lem.deskripsi
                      ORDER BY lem.deskripsi;
                  ");

    }


    /**
     * Get Lowest Children
     *
     * Digunakan untuk menampilkan list Lembaga Non SP terbawah berdasarkan ID Parent
     * @param  string $parent_id
     * @return  Array DataSet
     *
     */
    public static function getLowestChildren($parent_id)
    {
        return DB::SELECT("
                    WITH lowestChildren AS (
                        SELECT id_lemb_non_sp
                        FROM pdrd.lembaga_non_sp WHERE id_lemb_non_sp = '".$parent_id."'
                        UNION ALL
                        SELECT parent.id_lemb_non_sp
                        FROM pdrd.lembaga_non_sp parent
                        INNER JOIN lowestChildren child ON child.id_lemb_non_sp = parent.id_induk_lemb_non_sp
                    )
                    SELECT id_lemb_non_sp
                    FROM lowestChildren
                    Where not Exists(Select id_lemb_non_sp from pdrd.lembaga_non_sp where id_induk_lemb_non_sp=lowestChildren.id_lemb_non_sp)
                ");
    }

    public static function getAllChildren($wilayahKoord, $implode=true)
    {
        $daftarLembaga = Self::getLowestChildren($wilayahKoord);
        foreach($daftarLembaga as $r)
            $list[] = $r->id_lemb_non_sp;
        if($implode)
            $listLembaga = implode("','", $list);
        else
            $listLembaga = $list;

        return $listLembaga;
    }

    public static function getKopertis($lingkup=NULL)
    {
        $query  = " SELECT nm_lemb, id_lemb_non_sp
              FROM pdrd.lembaga_non_sp
              where level_lemb = '2'
              AND id_jns_lemb IN ('2','11')
              AND soft_delete = '0' ";
        if($lingkup != NULL)
            $lingkup  = " AND id_lemb_non_sp = '".$lingkup."' ";

        $order  = " ORDER BY nm_lemb ASC";
        $sql    = DB::SELECT($query.$lingkup.$order);

        return $sql;
    }

    public static function listPembinaNew($lembaga, $role)
    {
        if($lembaga->deskripsi == 99) {
            return DB::SELECT("
                      SELECT lem.id_lemb_non_sp as id_organisasi, lem.nm_lemb FROM [pdrd].[lembaga_non_sp] lem WITH (NOLOCK)
                      --LEFT JOIN [pdrd].[satuan_pendidikan] sp WITH (NOLOCK) ON lem.id_lemb_non_sp=sp.id_pembina
                      WHERE lem.soft_delete = 0
                      --AND sp.soft_delete = 0
                      AND lem.deskripsi IS NOT NULL
                      --AND LEFT(sp.id_wil,2) != '99'
                      GROUP BY lem.id_lemb_non_sp, lem.nm_lemb, lem.deskripsi
                      ORDER BY lem.deskripsi;
                  ");
        } else {
            $cek  = Self::getAllChildren($role->id_organisasi);

            return DB::SELECT("
                      SELECT lem.id_lemb_non_sp as id_organisasi, lem.nm_lemb FROM [pdrd].[lembaga_non_sp] lem WITH (NOLOCK)
                      --LEFT JOIN [pdrd].[satuan_pendidikan] sp WITH (NOLOCK) ON lem.id_lemb_non_sp=sp.id_pembina
                      WHERE lem.soft_delete = 0
                      --AND sp.soft_delete = 0
                      AND lem.deskripsi IS NOT NULL
                      AND lem.id_lemb_non_sp IN ('".$cek."')
                      --AND LEFT(sp.id_wil,2) != '99'
                      GROUP BY lem.id_lemb_non_sp, lem.nm_lemb, lem.deskripsi
                      ORDER BY lem.deskripsi;
                  ");
        }

    }
}
