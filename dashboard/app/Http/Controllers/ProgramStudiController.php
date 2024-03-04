<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Auth;
use Session;
use DB;
use Crypt;

class ProgramStudiController extends Controller
{
    public function index($id)
    {
        $pageConfigs = ["myLayout" => "horizontal"];
        $id = Crypt::decrypt($id);

        $detail = DB::table("pdrd.sms")
            ->where("id_sms", $id)
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

        $periodeAktif = DB::table("ref.semester")
            ->whereNull("expired_date")
            ->where("a_periode_aktif", 1)
            ->distinct()
            ->pluck("id_thn_ajaran")[0];
        $getPeriode = DB::table("ref.semester")
            ->whereNull("expired_date")
            ->where(DB::raw("RIGHT(id_smt,1)"), "<", "3")
            ->whereBetween("id_thn_ajaran", [$periodeAktif - 4, $periodeAktif])
            ->select("id_thn_ajaran", "id_smt")
            ->orderByDesc("id_smt")
            ->get();
        $periode = collect($getPeriode)->groupBy("id_thn_ajaran");

        $profil = \DB::table("pdrd.profil_prodi")
            ->where("soft_delete", 0)
            ->where("id_sms", $id)
            ->orderByDesc("last_update")
            ->first();

        return view("content.pages.prodi.detail", [
            "pageConfigs" => $pageConfigs,
            "detail" => $detail,
            "id_sms" => $id,
            "periode" => $periode,
            "profil" => $profil,
        ]);
    }

    public function mahasiswa($id)
    {
        $data = \DB::SELECT(
            "
      SELECT DISTINCT
        kmh.id_smt,
        COUNT(pd.id_pd) AS total
      FROM
        pdrd.kuliah_mhs AS kmh
        JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd=kmh.id_reg_pd AND reg.soft_delete=0
        JOIN pdrd.peserta_didik AS pd ON pd.id_pd=reg.id_pd AND pd.soft_delete=0 AND pd.id_stat_mhs='A'
      WHERE
        kmh.soft_delete=0
        AND kmh.id_stat_mhs='A'
        AND reg.id_sms='" .
                $id .
                "'
      GROUP BY
        kmh.id_smt
      ORDER BY
        kmh.id_smt DESC
    "
        );

        return \DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }
}
