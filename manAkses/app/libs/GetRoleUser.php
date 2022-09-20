<?php

use Illuminate\Support\Facades\Http;

if( !function_exists('GetRoleUser')){

  /**

   *

   * Digunakan untuk menampilkan peran User

   *

   * @return  string

   */

  function GetRoleUser() {

    // $response = Http::get(url('/api/live/0.1/peran?id_pengguna='.Auth::user()->id_pengguna));
    // $message = $response['message'];

    // if(!empty($message) AND !is_null($response['data'])) {
    //     foreach($response['data'] AS $each_data) {
    //       // dd($each_data);
    //       return $each_data;
    //     }
    // }

  }

}