<?php


if (!function_exists('sdid_get_versi_sister')) {
    function sdid_get_versi_sister()
    {
        exec('git log -1 --format="%ci"',$output);
        if(!empty($output)) {
            $temp       = explode(' ', $output[0]);
            $tgl_lokal  = sdid_ina_date($temp[0]).' - '.$temp[1];
        } else {
            $tgl_lokal = sdid_ina_date('1970-01-01');
        }

        exec('git fetch',$o);

        exec('git log -1 origin/master --format="%ci"',$rOutput);
        if(!empty($rOutput)) {

            $temp       = explode(' ', $rOutput[0]);
            $tgl_pusat  = sdid_ina_date($temp[0]).' - '.$temp[1];
        } else {
            $tgl_pusat = sdid_ina_date('1970-01-01');
        }

        $db_lokal = sdid_get_versi_db();

        return array($tgl_pusat, $tgl_lokal, $db_lokal);
    }
}

if (!function_exists('sdid_get_versi_db')) {
    function sdid_get_versi_db() {
        $query  = \DB::SELECT("SELECT column_default FROM information_schema.columns WHERE table_name='versi_db' AND column_name = 'versi'");
        if($query) {
            $hsl_query  = $query[0]->column_default;
            if($hsl_query) {
                $pch_query  = explode('::',$hsl_query);
                if($pch_query) {
                    $db_lokal   = str_replace("'","",$pch_query[0]);
                } else {
                    $db_lokal = false;
                }
            } else {
                $db_lokal = false;
            }
        } else {
            $db_lokal = false;
        }
        return $db_lokal;
    }
}

if (!function_exists('sdid_get_info_table')) {
    function sdid_get_info_table($schema, $table) {
        $query  = \DB::SELECT("SELECT column_name, data_type,character_maximum_length FROM information_schema.columns
                            WHERE table_schema = '".$schema."' AND table_name   = '".$table."'");
        return $query;
    }
}
