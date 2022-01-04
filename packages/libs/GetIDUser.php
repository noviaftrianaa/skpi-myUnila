<?php

if( !function_exists('getIDUser')){
  /**
   *
   * Digunakan untuk menampilkan Judul halaman Aktif
   *
   * @return  string
   */
  function getIDUser() {
      return Auth::user()->id_pengguna;
  }
}