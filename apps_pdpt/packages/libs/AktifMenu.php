<?php

use Illuminate\Support\Facades\Route;

if (!function_exists('AktifMenu')) {
    function AktifMenu($path, $level = 1)
    {
        $path_sekarang = Route::currentRouteName();
        if (strpos($path_sekarang, '.') !== false) {
            $pecah_path = explode('.', $path_sekarang);
            if ($level == 2 && count($pecah_path) == 2) {
                $new_path = $pecah_path[0] . '.' . $pecah_path[1];
            } elseif ($level == 3 && count($pecah_path) > 2) {
                $new_path = $pecah_path[0] . '.' . $pecah_path[1] . '.' . $pecah_path[2];
            } else {
                $new_path = $pecah_path[0];
            }
        } else {
            $new_path = $path_sekarang;
        }

        return $path == $new_path ? 'active' : '';
    }
}
