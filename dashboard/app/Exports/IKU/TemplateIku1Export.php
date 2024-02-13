<?php

namespace App\Exports\IKU;

use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use DB, Auth, Alert, Crypt, File, Excel;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use App\Models\Pdrd\SMS;

class TemplateIku1Export implements FromView, ShouldAutoSize
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
                WHERE
                  tc.soft_delete = 0
                  AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
              ";
          }else{
            $sms = Sms::where('id_sms', $id_sms)->first();
            if($sms->id_jns_sms == 3){
                $where = "
                  WHERE
                    prodi.id_sms = '". $id_sms ."'
                    AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
                ";
            }else{
                $where = "
                  WHERE
                    fak.id_sms = '". $id_sms ."'
                    AND YEAR(reg.tgl_keluar) = '" . ($thn_iku - 1) . "'
                ";
            }
          }
          $select = "
              SELECT
                  reg.id_reg_pd,
                  YEAR(reg.tgl_keluar) AS tahun_lulus,
                  tc.wkt_pengisian,
                  reg.nipd,
                  pd.nm_pd,
                  fak.nm_lemb AS nm_fakultas,
                  prodi.nm_lemb AS nm_prodi,
                  jenj.nm_jenj_didik,
                  reg.tgl_keluar,
                  reg.tgl_sk_yudisium,
                      CASE
                      WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                      WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                      WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                      WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                      ELSE 'Belum Mengisi'
                  END AS status_lulusan,
                  CASE
                      WHEN tc.a_kerja_sblm_lulus = 1 THEN 'Ya'
                      ELSE 'Tidak'
                  END AS a_kerja_sblm_lulus,
                  CONCAT(tc.wkt_tunggu, ' Bulan') bln_dpt_kerja,
                  format(tc.income_per_bln, 'N') AS income_per_bln,
                  provinsi.nm_wil,
                  tc.nm_tmpt_bekerja,
                  CASE
                      WHEN tc.status_lulusan IN (1, 2) THEN FORMAT(1.2 * umr.besaran_umr, 'N')
                      ELSE NULL
                  END AS ump,
                  CASE
                      WHEN tc.wkt_masuk IS NOT NULL THEN 1
                      ELSE 0
                  END AS a_lnjut_study,
                  tc.wkt_masuk AS wkt_masuk_lnjt_study,
                CASE
                    WHEN tc.status_lulusan = 3 THEN CONCAT(
                        DATEDIFF(MONTH, reg.tgl_keluar, tc.wkt_masuk),
                        ' Bulan'
                    )
                    ELSE NULL
                END AS jarak_wkt_masuk_lnjt_study,
                  tc.nm_pt_lnjt,
                  tc.nm_prodi_lnjt,
                  tc.ket,
                  CASE
                      WHEN tc.status_lulusan = 1 AND ( tc.wkt_tunggu = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                        OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1
                      WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8
                      WHEN tc.status_lulusan = 1 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                        OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 0.7
                      WHEN tc.status_lulusan = 1 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.5

                      WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr))
                        OR ( tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) )THEN 1.2
                      WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln >= (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 1.0
                      WHEN tc.status_lulusan = 2 AND ( tc.a_kerja_sblm_lulus = 1 AND (tc.income_per_bln < (1.2 * umr.besaran_umr))
                        OR (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu <= 6) ) THEN 1.0
                      WHEN tc.status_lulusan = 2 AND (tc.a_kerja_sblm_lulus = 0 AND (tc.income_per_bln < (1.2 * umr.besaran_umr)) AND tc.wkt_tunggu BETWEEN 7 AND 12) THEN 0.8

                      WHEN tc.status_lulusan = 3 AND ( DATEDIFF(DAY, reg.tgl_keluar, tc.wkt_masuk) < 365) THEN 1
                  ELSE 0
                END AS point
              FROM
                tracer.hasil_tracer_study AS tc
          ";
          $join = "
              LEFT JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = tc.id_reg_pd
              AND reg.id_jns_keluar = '1'
              AND reg.soft_delete = 0
              JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
              AND pd.soft_delete = 0
              JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
              AND prodi.soft_delete = 0
              AND prodi.stat_prodi = 'A'
              LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
              AND fak.soft_delete = 0
              JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
              AND jenj.expired_date IS NULL
              AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
              LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
              AND umr.id_tahun_anggaran = YEAR(reg.tgl_keluar) + 1
              AND umr.soft_delete = 0
              LEFT JOIN ref.wilayah AS provinsi ON provinsi.id_wil = umr.id_wil
              AND provinsi.id_level_wil = 1
              AND provinsi.expired_date IS NULL
          ";
          $order_by = " ORDER BY fak.nm_lemb, prodi.nm_lemb, jenj.nm_jenj_didik, pd.nm_pd ASC ";

          $result = DB::select($select . $join . $where . $order_by);
          return view('content.main.iku.iku-1.download', [
              'data' => $result
          ]);
        } else {
          $result = [];
            return view('content.main.iku.iku-1.download', [
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
