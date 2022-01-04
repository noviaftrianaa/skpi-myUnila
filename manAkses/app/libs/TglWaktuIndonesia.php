<?php

if( !function_exists( 'tglWaktuIndonesia' ) ){
  function tglWaktuIndonesia($date)
  {
      if( trim($date) != '' ){
          $pecah_waktu = explode(' ',$date);
        $arr_date = explode('-', $pecah_waktu[0]);

        $month = bulanIndonesia( sprintf("%d", $arr_date[1]) );

        return "{$arr_date[2]} {$month} $arr_date[0]".' '.$pecah_waktu[1];
      }
      
      return $date;
  }
}