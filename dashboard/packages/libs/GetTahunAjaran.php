<?php
if (!function_exists('get_tahun_keaktifan')) {
  function get_tahun_keaktifan()
  {
    $q = \DB::SELECT(
      'select id_thn_ajaran AS tahun from ref.tahun_ajaran where a_periode_aktif = 1 and expired_date is null'
    );
    return $q[0]->tahun;
  }
}
