<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use DB, Auth, Alert, Crypt, File, Excel;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;

class TemplateIku1Export implements FromView, ShouldAutoSize
{

    public $Params;

    public function  __construct($Params)
    {
        $this->Params= $Params;
    }

    public function view(): View
    {
        $thn_iku = $this->Params;;
        $data = DB::connection("sqlsrv_live")->select("
            SELECT
                rgpd.id_reg_pd,
                rgpd.nipd,
                pd.nm_pd,
                rgpd.tgl_keluar,
                fak.nm_lemb AS y_nm_fakultas,
                CONCAT(prod.nm_lemb, ' (', jenj.nm_jenj_didik, ')') AS y_nm_prodi,
                CASE
                    WHEN tc.status_lulusan = 0 THEN 'Tidak Bekerja'
                    WHEN tc.status_lulusan = 1 THEN 'Bekerja'
                    WHEN tc.status_lulusan = 2 THEN 'Berwirausaha'
                    WHEN tc.status_lulusan = 3 THEN 'Melanjutkan Studi'
                    ELSE 'Belum Mengisi'
                END AS l_stat_lulus,
                CASE
                    WHEN (
                        tc.a_kerja_sblm_lulus = 1
                        OR tc.wkt_tunggu < 12
                    )
                    OR (
                        DATEDIFF(MONTH, rgpd.tgl_keluar, tc.wkt_masuk) < 12
                    ) THEN 'Ya'
                    ELSE 'Tidak'
                END AS kerja_or_study_12_bln,
                FORMAT(tc.income_per_bln, '##,##0') AS income_per_bln,
                wil.nm_wil AS provinsi,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2') THEN FORMAT(1.2 * umr.besaran_umr, '##,##0')
                    ELSE NULL
                END AS satu_koma_dua_ump,
                CASE
                    WHEN tc.status_lulusan IN ('1', '2')
                    AND (
                        (
                            tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.a_kerja_sblm_lulus = 1
                        )
                        OR (
                            tc.a_kerja_sblm_lulus = 0
                            AND tc.income_per_bln >= 1.2 * umr.besaran_umr
                            AND tc.wkt_tunggu < 12
                        )
                    ) THEN 'Ya'
                    WHEN tc.status_lulusan IN ('3')
                    AND (
                        DATEDIFF(MONTH, rgpd.tgl_keluar, tc.wkt_masuk) < 12
                    ) THEN 'Ya'
                    ELSE 'Tidak'
                END AS x_data_yes,
                tc.nm_pt_lnjt,
                CONVERT(DATE, tc.wkt_masuk) AS wkt_masuk
            FROM
                tracer.hasil_tracer_study AS tc WITH(NOLOCK)
                JOIN pdrd.reg_pd AS rgpd WITH(NOLOCK) ON rgpd.id_reg_pd = tc.id_reg_pd
                AND rgpd.soft_delete = 0
                AND rgpd.id_jns_keluar = '1'
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = rgpd.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prod WITH(NOLOCK) ON prod.id_sms = rgpd.id_sms
                AND prod.soft_delete = 0
                AND prod.stat_prodi = 'A'
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prod.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prod.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30, 31)
                LEFT JOIN tracer.umr_wilayah AS umr WITH(NOLOCK) ON umr.id_wil = tc.id_wil
                AND umr.id_tahun_anggaran = '" . ($thn_iku) . "'
                AND umr.soft_delete = 0
                LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = umr.id_wil
                AND wil.expired_date IS NULL
            WHERE
                tc.soft_delete = 0
                AND YEAR(rgpd.tgl_keluar) = '" . ($thn_iku - 1) . "'
            ORDER BY
                pd.nm_pd ASC
        ");

        return view('home.wr.wakil_rektor4.iku.export.excel_iku1', [
            'data' => $data,
            'thn_iku' => $thn_iku
        ]);
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
