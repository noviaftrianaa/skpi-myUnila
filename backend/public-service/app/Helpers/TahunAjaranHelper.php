<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TahunAjaranHelper
{
    /**
     * Get active tahun ajaran (academic year) from ref.tahun_ajaran
     * Returns the id_thn_ajaran where a_periode_aktif = 1
     *
     * @return string
     */
    public static function getActiveTahunAjaran(): string
    {
        // Cache for 1 hour since tahun ajaran doesn't change frequently
        return Cache::remember('active_tahun_ajaran', 3600, function () {
            $result = DB::connection('sqlsrv')->select("
                SELECT TOP 1 id_thn_ajaran
                FROM ref.tahun_ajaran
                WHERE a_periode_aktif = 1
                    AND expired_date IS NULL
                ORDER BY id_thn_ajaran DESC
            ");

            if (empty($result)) {
                // Fallback to current year if no active period found
                return (string) date('Y');
            }

            return $result[0]->id_thn_ajaran;
        });
    }
}
