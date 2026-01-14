<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Report extends Model
{
    use HasFactory;
    public static $id_sp = 'e2b705a7-173e-464a-9fac-509128709515';

    public static function getListWilayahPT()
    {
        $listWilayah = DB::SELECT(
            "SELECT id_sp as id,nm_lemb as nama
                                    FROM [pdrd].[satuan_pendidikan]  WITH (NOLOCK)
                                    WHERE soft_delete=0
                                    AND id_stat_milik IN ('1','2')
                                    AND id_sp='" . env('APP_ID_SP') . "'"
        );
        return $listWilayah;
    }

    public static function getListWilayahFakultas()
    {

        $countFakultas = DB::SELECT(
            "SELECT COUNT(*) as jml
                                        FROM [pdrd].[sms]
                                        WHERE soft_delete=0
                                        AND id_jns_sms=1
                                        AND id_sp='" . env('APP_ID_SP') . "' "
        )[0];

        if ($countFakultas->jml > 0) {
            $currentLevel = 'Fakultas';
            $id_jns_sms = '1';
        } else {
            $currentLevel = 'Program Studi';
            $id_jns_sms = '3';
        }

        $listWilayah = DB::SELECT(
            "SELECT id_sms as id,CONCAT('FAKULTAS ',nm_lemb) as nama
                                    FROM [pdrd].[sms]  WITH (NOLOCK)
                                    WHERE soft_delete=0
                                    AND id_jns_sms='" . $id_jns_sms . "'
                                    AND id_sp='" . env('APP_ID_SP') . "' "
        );
        return [
            'wilayah' => $listWilayah,
            'level' => $currentLevel
        ];
    }

    public static function getListWilayahProdi($currentID)
    {
        $checkFakultas = DB::SELECT(
            "SELECT COUNT(*) as jml
                                        FROM [pdrd].[sms]
                                        WHERE soft_delete=0
                                        AND id_sms='" . $currentID . "'
                                        AND id_jns_sms=1 "
        )[0];

        if ($checkFakultas->jml > 0) {
            $listWilayah = DB::SELECT(
                "SELECT id_sms as id,CONCAT(nm_lemb,' (',jenjang_pendidikan.nm_jenj_didik,')') as nama
                                        FROM [pdrd].[sms]  WITH (NOLOCK)
                                        JOIN ref.jenjang_pendidikan ON jenjang_pendidikan.id_jenj_didik=sms.id_jenj_didik
                                        WHERE soft_delete=0
                                        AND id_fak_unila='" . $currentID . "'
                                        AND id_jns_sms=3 "
            );
        } else {
            $listWilayah = DB::SELECT(
                "SELECT TOP 1 id_sms as id,CONCAT(nm_lemb,' (',jenjang_pendidikan.nm_jenj_didik,')') as nama
                                        FROM [pdrd].[sms]  WITH (NOLOCK)
                                        JOIN ref.jenjang_pendidikan ON jenjang_pendidikan.id_jenj_didik=sms.id_jenj_didik
                                        WHERE soft_delete=0
                                        AND id_fak_unila='" . $currentID . "'
                                        AND id_jns_sms=3 "
            );
        }

        return $listWilayah;
    }


    /**
     * Generate list Wilayah & NextLevel berdasarkan Level drillDown
     */
    public static function getWilayah($currentLevel, $currentType, $currentID, $listCategories)
    {
        if ($currentLevel == 'Perguruan Tinggi') {
            $nextLevel = 'Fakultas';
            $listWilayah = $listCategories;
        } elseif ($currentLevel == 'Fakultas') {
            $nextLevel = 'Program Studi';
            $res = Self::getListWilayahFakultas();
            $currentLevel = $res['level'];
            $listWilayah = $res['wilayah'];
        } elseif ($currentLevel == 'Program Studi') {
            $nextLevel = 'Program Studi';
            $listWilayah = Self::getListWilayahProdi($currentID);
        }

        return [
            'currentLevel'  => $currentLevel,
            'nextLevel'     => $nextLevel,
            'listWilayah'   => $listWilayah,
        ];
    }
}
