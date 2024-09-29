<?php

namespace App\Http\Controllers\main\iku;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IKU\TemplateIku2Export;

class Iku8Controller extends Controller
{
  public function __construct()
  {
    $this->request = app(Request::class);
  }


  public function index()
  {
    $thn_iku = get_tahun_keaktifan();
    return view('content.main.iku.iku-8.index', compact('thn_iku'));
  }

  public function listTotalPoint()
  {
    $thn_iku = $this->request->thn_iku;
    $id_jns_sms = $this->request->id_jns_sms;
    $id_sms = $this->request->id_sms;

    if ($thn_iku == 2023) {
      if ($id_jns_sms == 3 && !is_null($id_sms)) {
        $select = "

        ";
        $join = "

        ";
        $where = "

        ";
        $group_by = "
        ";
      } else {
        $select = "

        ";
        $join = "

        ";
        $where = "

        ";
        $group_by = "

        ";
      }
      $result = DB::select($select . $join . $where . $group_by);
      $last_sync = collect(
        DB::select('SELECT last_sync FROM tracer.hasil_tracer_study WHERE soft_delete=0 ORDER BY last_sync DESC')
      )->first();

      $iku = array();
      $total_point = 0;
      $total_responden = 0;
      $total_alumni = 0;
      $rumus = 'Kepdirjen 173/E/KPT/2023';
      $sumber_data = 'Sistem Kampus Merdeka Universitas Lampung - FEEDER PDDIKTI';

      foreach ($result as $index => $each_data) {
        $total_point += $each_data->point;
        $total_responden += $each_data->total_responden;
        $total_alumni += $each_data->total_alumni;
        $pembentuk = $total_point . '/' . $total_responden;
        if ($total_responden != 0) {
          $pencapaian = ($total_point / $total_responden) * 100;
        } else {
          $pencapaian = 0;
        }
        $gold_standart = 60;

        $sub = $gold_standart - $pencapaian;
        if($pencapaian > $gold_standart){
          $delta_gold_standart = abs($sub);
        }else{
          $delta_gold_standart = $sub;
        }
        $skor_pencapaian = $pencapaian / $gold_standart;

        $iku['count'] = [

        ];
        $iku['data'][$index] = [

        ];
      }

      return response()->json($iku);
    } else {
      $result = [];
      return response()->json($result);
    }
  }

  public function listRawData()
  {
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;

    if ($thn_iku == 2023) {
      if (!is_null($id_sms)) {
        $where = "

        ";
      } else {
        $where = "

        ";
      }
      $select = "

      ";
      $join = "

      ";
      $order_by = " ";
      $result = DB::select($select . $join . $where . $order_by);

      return response()->json($result);


    } else {
      $result = [];
      return response()->json($result);
    }
  }

  public function downloadRawData()
  {
    ini_set('max_execution_time', 0);
    $thn_iku = $this->request->thn_iku;
    $id_sms = $this->request->id_sms;
    // $id_jns_sms = $this->request->id_jns_sms;

    return Excel::download(new TemplateIku2Export($thn_iku, $id_sms), 'LAPORAN IKU 2 TAHUN '.$thn_iku.' UNIVERSITAS LAMPUNG.xlsx');

  }
}
