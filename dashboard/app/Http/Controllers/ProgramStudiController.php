<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Auth;
use Session;
use DB;

class ProgramStudiController extends Controller
{
  public function index($id)
  {
    $pageConfigs = ['myLayout' => 'horizontal'];
    $detail = DB::table('pdrd.sms')
      ->where('id_sms', $id)
      ->first();
    $detail = DB::SELECT(
      "
        SELECT
          sms.id_sms,
          sms.nm_lemb,
          sms.kode_prodi,
          sms.tgl_berdiri,
          sms.stat_prodi,
          sms.jln,
          sms.no_tel,
          sms.email,
          didik.nm_jenj_didik,
          jur.nm_lemb AS nm_jur,
          fak.nm_lemb AS nm_fak
        FROM
          pdrd.sms AS sms
          JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik=sms.id_jenj_didik AND didik.expired_date IS NULL
          LEFT JOIN pdrd.sms AS jur ON jur.id_sms=sms.id_jur_unila AND jur.soft_delete=0
          LEFT JOIN pdrd.sms AS fak ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
        WHERE
          sms.id_sms = '" .
        $id .
        "'
          AND sms.soft_delete=0
      "
    )[0];

    $detail->akreditasi =
      DB::SELECT(
        "
        SELECT
          ap.sk_akreditasi_prodi,
          ap.tanggal_sk_akreditasi_prodi,
          ap.tst_sk_akreditasi_prodi,
          na.nm_akred
        FROM
          pdrd.akreditasi_prodi AS ap
          JOIN ref.nilai_akred AS na ON na.id_akred=ap.id_akred AND na.expired_date IS NULL
        WHERE
          ap.soft_delete=0
          AND ap.a_aktif=1
          AND ap.id_sms = '" .
          $id .
          "'
        ORDER BY
          ap.tst_sk_akreditasi_prodi DESC
      "
      ) ?? null;

    return view('content.pages.pages-prodi', [
      'pageConfigs' => $pageConfigs,
      'detail' => $detail,
    ]);
  }
}
