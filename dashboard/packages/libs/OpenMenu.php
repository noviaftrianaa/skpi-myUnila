<?php

use Illuminate\Support\Facades\Route;

if (!function_exists('OpenMenu')) {
  function OpenMenu($path, $level = 1)
  {
    $path_sekarang = Route::currentRouteName();
    if (strpos($path_sekarang, '.') !== false) {
      $pecah_path = explode('.', $path_sekarang);
      if ($level == 2) {
        $new_path = $pecah_path[0] . '.' . $pecah_path[1];
      } else {
        $new_path = $pecah_path[0];
      }
    } else {
      $new_path = $path_sekarang;
    }
    return $path == $new_path ? 'menu-open' : '';
  }
}
