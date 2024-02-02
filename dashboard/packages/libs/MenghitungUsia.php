<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 03/08/2021
 * Time: 1:04 AM
 */
if (!function_exists('menghitung_usia')) {
  function menghitung_usia($value)
  {
    $birthDate = new DateTime($value);
    $today = new DateTime('today');
    if ($birthDate > $today) {
      exit(0);
    }
    $y = $today->diff($birthDate)->y;
    return $y;
  }
}
