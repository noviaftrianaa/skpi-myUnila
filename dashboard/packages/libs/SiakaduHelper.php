<?php

use Illuminate\Support\Facades\DB;

if (!function_exists('getSiakadUnits')) {
    /**
     * Mencari id_unit siakad berdasarkan jenis unit
     *
     * @param string $jns_unit Jenis unit ('P', 'J', 'F')
     * @param string $id_sms ID SMS yang sesuai
     * @return array
     */
    function getSiakadUnits($jns_unit, $id_sms)
    {
        $id_units = [];

        if ($jns_unit == 'P') {
            $map = DB::table('temp.map_prodi_siakad')
                ->where('id_sms', $id_sms)
                ->where('soft_delete', 0)
                ->first();
            if ($map) {
                $id_units[] = $map->kode_siakad;
            }
        } elseif ($jns_unit == 'J') {
            $sms = DB::table('pdrd.sms')
                ->select('id_sms')
                ->where('id_jur_unila', $id_sms)
                ->where('soft_delete', 0)
                ->get();

            foreach ($sms as $item) {
                $maps = DB::table('temp.map_prodi_siakad')
                    ->where('id_sms', $item->id_sms)
                    ->where('soft_delete', 0)
                    ->get();

                foreach ($maps as $map) {
                    $id_units[] = $map->kode_siakad;
                }
            }
        } elseif ($jns_unit == 'F') {
            $sms = DB::table('pdrd.sms')
                ->select('id_sms')
                ->where('id_fak_unila', $id_sms)
                ->where('soft_delete', 0)
                ->get();

            foreach ($sms as $item) {
                $maps = DB::table('temp.map_prodi_siakad')
                    ->where('id_sms', $item->id_sms)
                    ->where('soft_delete', 0)
                    ->get();

                foreach ($maps as $map) {
                    $id_units[] = $map->kode_siakad;
                }
            }
        }

        return $id_units;
    }
}
