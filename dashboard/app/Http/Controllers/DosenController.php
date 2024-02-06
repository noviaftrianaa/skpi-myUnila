<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DosenController extends Controller
{

  public function __construct()
  {
    $this->basepath = 'dosen';
    $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();
  }

  public function index($id)
  {
    $pageConfigs = ['myLayout' => 'horizontal'];
    $profil = DB::table('pdrd.sdm')->where('id_sdm', $id)->where('soft_delete',0)->first();
    $profil = DB::SELECT("
      SELECT
        sdm.*,
        sms.nm_lemb
      FROM
        pdrd.sdm AS sdm
        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm=sdm.id_sdm AND ptk.soft_delete=0
        JOIN pdrd.sms AS sms ON sms.id_sms=ptk.id_sms AND sms.soft_delete=0
      WHERE
        sdm.soft_delete=0
        AND sdm.id_sdm='".$id."'
    ")[0];
    $pendidikan = DB::SELECT("
      SELECT DISTINCT
        pendidikan.*,
        jenjang.nm_jenj_didik,
        bidang.nm_bid_studi,
        gelar.singkat_gelar,
        gelar.nm_gelar_akad
      FROM
        pdrd.rwy_pend_formal AS pendidikan
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=pendidikan.id_jenj_didik AND jenjang.expired_date IS NULL
        JOIN ref.bidang_studi AS bidang ON bidang.id_bid_studi=pendidikan.id_bid_studi AND bidang.expired_date IS NULL
        JOIN ref.gelar_akademik AS gelar ON gelar.id_gelar_akad=pendidikan.id_gelar_akad AND gelar.expired_date IS NULL
      WHERE
        pendidikan.soft_delete=0
        AND pendidikan.id_sdm = '".$profil->id_sdm."'
        AND pendidikan.thn_lulus IS NOT NULL
      ORDER BY
        pendidikan.thn_lulus DESC
    ") ?? [];
    $sertifikasi = DB::SELECT("
      SELECT DISTINCT
        sertifikasi.*,
        jenis.nm_jns_sert,
        bidang.nm_bid_studi
      FROM
      pdrd.rwy_sertifikasi AS sertifikasi
      JOIN ref.jenis_sert AS jenis ON jenis.id_jns_sert=sertifikasi.id_jns_sert AND jenis.expired_date IS NULL
      JOIN ref.bidang_studi AS bidang ON bidang.id_bid_studi=sertifikasi.id_bid_studi AND bidang.expired_date IS NULL
      WHERE
        sertifikasi.soft_delete=0
        AND sertifikasi.id_sdm = '".$profil->id_sdm."'
        AND sertifikasi.thn_sert IS NOT NULL
      ORDER BY
        sertifikasi.thn_sert DESC
    ") ?? [];

    return view('content.pages.dosen.detail', [
      'pageConfigs' => $pageConfigs,
      'profil' => $profil,
      'pendidikan' => $pendidikan,
      'sertifikasi' => $sertifikasi
    ]);
  }
}
