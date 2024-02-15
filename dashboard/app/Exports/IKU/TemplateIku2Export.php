<?php

namespace App\Exports\IKU;

use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use DB, Auth, Alert, Crypt, File, Excel;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use App\Models\Pdrd\SMS;

class TemplateIku2Export implements FromView, ShouldAutoSize
{

    public function  __construct($thn_iku, $id_sms)
    {
        $this->thn_iku= $thn_iku;
        $this->id_sms= $id_sms;
    }

    public function view(): View
    {
        $thn_iku = $this->thn_iku;
        $id_sms = $this->id_sms;

        if ($thn_iku == 2023) {
          if($id_sms == 'undefined'){
              $where = "

              ";
          }else{
            $sms = Sms::where('id_sms', $id_sms)->first();
            if($sms->id_jns_sms == 3){
                $where = "

                ";
            }else{
                $where = "

                ";
            }
          }
          $select = "

          ";
          $join = "

          ";
          $order_by = " ";

          $result = DB::select($select . $join . $where . $order_by);
          return view('content.main.iku.iku-2.download', [
              'data' => $result
          ]);
        } else {
          $result = [];
            return view('content.main.iku.iku-2.download', [
              'data' => $result
          ]);
        }
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class    => function(AfterSheet $event) {
                $styleArray = [
                    'borders' => [
                        'outline' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                            'color' => ['argb' => 'FFFF0000'],
                        ],
                    'cellRange' => 'A1:W1'
                    ],
                ];
                $event->sheet->getDelegate()->getFont()->setSize(14)->applyFromArray($styleArray);
            },
        ];
    }

}
