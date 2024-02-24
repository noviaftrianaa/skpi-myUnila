<?php

namespace App\Exports\IKU;

use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use DB, Auth, Alert, Crypt, File, Excel;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use App\Models\Pdrd\SMS;

class TemplateIku2Prestasi implements FromView, ShouldAutoSize
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

        // if ($thn_iku == 2023) {
          if($id_sms == 'undefined'){
                $where = "
                    WHERE
                        reg.soft_delete = 0
                        AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                ";
          }else{
            $sms = Sms::where('id_sms', $id_sms)->first();
            if($sms->id_jns_sms == 3){
                $where = "
                    WHERE
                        reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                        AND reg.soft_delete = 0
                        AND reg.id_sms = '". $id_sms ."'
                ";
            }else{
                $where = "
                    WHERE
                        reg.soft_delete = 0
                        AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                        AND fak.id_sms = '". $id_sms ."'
                ";
            }
          }
        $select = "
          SELECT
              reg.id_reg_pd,
              reg.id_pd,
              reg.nipd,
              pd.nm_pd,
              fak.id_sms AS id_fak,
              fak.nm_lemb AS nm_fakultas,
              prodi.id_sms AS id_prodi,
              prodi.nm_lemb AS nm_prodi,
              jenj.nm_jenj_didik,
              prestasi.thn_prestasi,
              prestasi.nm_prestasi,
              prestasi.nm_tkt_prestasi,
              prestasi.peringkat,
              CASE
                  WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 1 THEN 1.0
                  WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 2 THEN 0.9
                  WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat = 3 THEN 0.8
                  WHEN prestasi.id_tkt_prestasi = 6 AND prestasi.peringkat IS NULL THEN 0.7
                  WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 1 THEN 0.7
                  WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 2 THEN 0.6
                  WHEN prestasi.id_tkt_prestasi = 5 AND prestasi.peringkat = 3 THEN 0.5
                  WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 1 THEN 0.4
                  WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 2 THEN 0.3
                  WHEN prestasi.id_tkt_prestasi = 4 AND prestasi.peringkat = 3 THEN 0.2
              END AS point
          FROM
              pdrd.reg_pd AS reg WITH(NOLOCK)
        ";
        $join = "
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
            AND pd.soft_delete = 0
            JOIN (
                SELECT
                    id_reg_pd
                FROM
                    pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE
                    soft_delete = 0
                    AND id_stat_mhs = 'A'
                    AND id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                GROUP BY
                    id_reg_pd
            ) AS kul ON kul.id_reg_pd = reg.id_reg_pd
            JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
            AND prodi.stat_prodi = 'A'
            AND prodi.soft_delete = 0
            JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
            AND fak.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
            AND jenj.expired_date IS NULL
            JOIN (
                SELECT
                    pres.id_pd,
                    pres.thn_prestasi,
                    pres.id_tkt_prestasi,
                    pres.peringkat,
                    pres.nm_prestasi,
                    tkt_prestasi.nm_tkt_prestasi
                FROM
                    pdrd.prestasi AS pres WITH(NOLOCK)
                    JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = pres.id_tkt_prestasi
                    AND tkt_prestasi.expired_date IS NULL
                WHERE
                    pres.thn_prestasi = '". $thn_iku ."'
                    AND pres.soft_delete = 0
            ) AS prestasi ON prestasi.id_pd = reg.id_pd
        ";
        $order_by = " ORDER BY point DESC, pd.nm_pd ASC ";

          $result = DB::select($select . $join . $where . $order_by);
          return view('content.main.iku.iku-2.download.prestasi', [
              'data' => $result
          ]);
        // } else {
        //   $result = [];
        //     return view('content.main.iku.iku-2.download', [
        //       'data' => $result
        //   ]);
        // }
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
