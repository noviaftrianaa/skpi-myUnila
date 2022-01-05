<?php

if( !function_exists( 'cekcopyright' ) ){
  function cekcopyright()
  {
      $year_dev = config('bppmb.year_dev');
      $year_now = date('Y');
      if($year_dev != $year_now) {
          return $year_dev.' - '.$year_now;
      }
      return $year_dev;
  }
}