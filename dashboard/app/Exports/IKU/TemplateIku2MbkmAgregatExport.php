<?php

namespace App\Exports\IKU;

use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use DB, Auth, Alert, Crypt, File, Excel;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use App\Models\Pdrd\SMS;

class TemplateIku2MbkmAgregatExport implements FromView, ShouldAutoSize
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
              $where = "";
          }else{
            $sms = Sms::where('id_sms', $id_sms)->first();
            if($sms->id_jns_sms == 3){
                $where = "
                    WHERE
                        al.id_prodi = '". $id_sms ."'
                ";
            }else{
                $where = "
                    WHERE
                        al.id_fak = '". $id_sms ."'
                ";
            }
          }
        $select = "
                SELECT
                    al.*,
                    al.konversi_a + al.konversi_b AS total_konversi,
                    al.point_a + al.point_b AS total_point
                FROM
                    (
                        SELECT
                            mbkm.id_reg_pd,
                            mbkm.id_pd,
                            mbkm.nipd,
                            mbkm.nm_pd,
                            mbkm.id_fak,
                            mbkm.nm_fakultas,
                            mbkm.id_prodi,
                            mbkm.nm_prodi,
                            mbkm.nm_jenj_didik,
                            CASE
                                WHEN (mbkm.id_jenj_didik IN (22, 23, 30) AND mbkm.konversi_a >= 10) THEN mbkm.konversi_a / 20
                                WHEN (mbkm.id_jenj_didik IN (20, 21) AND mbkm.konversi_a >= 5 ) THEN mbkm.konversi_a / 20
                                ELSE 0
                            END AS point_a,
                            CASE
                                WHEN mbkm.konversi_b > 0 THEN mbkm.konversi_b / 20
                                ELSE 0
                            END AS point_b,
                            CASE WHEN mbkm.konversi_a > 0 THEN mbkm.konversi_a ELSE 0 END AS konversi_a,
                            CASE WHEN mbkm.konversi_b > 0 THEN mbkm.konversi_b ELSE 0 END AS konversi_b
                        FROM
                            (
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
                                    jenj.id_jenj_didik,
                                    (
                                        SELECT
                                            SUM(k_nilai.sks_mk) AS sks_konversi
                                        FROM
                                            mbkm.konversi_akt_mhs AS k_nilai
                                            JOIN pdrd.anggota_akt_mhs AS ang_mbkm WITH(NOLOCK) ON ang_mbkm.id_ang_akt_mhs = k_nilai.id_ang_akt_mhs
                                            AND ang_mbkm.soft_delete = 0
                                            JOIN pdrd.akt_mhs AS akt_mbkm WITH(NOLOCK) ON akt_mbkm.id_akt_mhs = ang_mbkm.id_akt_mhs
                                            AND akt_mbkm.soft_delete = 0
                                            JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm.id_jns_akt_mhs
                                            AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                            ANd jns_akt.expired_date IS NULL
                                        WHERE
                                            akt_mbkm.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                            AND akt_mbkm.id_jns_akt_mhs != 21
                                            AND ang_mbkm.id_reg_pd = reg.id_reg_pd
                                            AND k_nilai.soft_delete = 0
                                    ) AS konversi_a,
                                    (
                                        SELECT
                                            SUM(k_nilai_tf.sks_diakui) AS sks_konversi
                                        FROM
                                            mbkm.ekuiv_transfer AS k_nilai_tf WITH(NOLOCK)
                                            JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = k_nilai_tf.id_mk
                                            AND mk.soft_delete = 0
                                            JOIN pdrd.akt_mhs AS akt_mbkm_tf WITH(NOLOCK) ON akt_mbkm_tf.id_akt_mhs = k_nilai_tf.id_akt_mhs
                                            AND akt_mbkm_tf.soft_delete = 0
                                            JOIN pdrd.anggota_akt_mhs AS ang_mbkm_tf WITH(NOLOCK) ON ang_mbkm_tf.id_akt_mhs = akt_mbkm_tf.id_akt_mhs
                                            AND ang_mbkm_tf.soft_delete = 0
                                            JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK) ON jns_akt.id_jns_akt_mhs = akt_mbkm_tf.id_jns_akt_mhs
                                            AND jns_akt.a_kegiatan_kampus_merdeka = 1
                                            ANd jns_akt.expired_date IS NULL
                                        WHERE
                                            k_nilai_tf.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                                            AND akt_mbkm_tf.id_jns_akt_mhs = 21
                                            AND ang_mbkm_tf.id_reg_pd = reg.id_reg_pd
                                            AND k_nilai_tf.soft_delete = 0
                                    ) AS konversi_b
                                FROM
                                    pdrd.reg_pd AS reg WITH(NOLOCK)
        ";
        $join = "
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = reg.id_sms
                AND prodi.soft_delete = 0
                AND prodi.stat_prodi = 'A'
                AND prodi.id_sms NOT IN (
                    '7cf61032-52b1-43b0-b9ec-316d838c735a',
                    '225a5ae5-225e-482b-b379-521b6676c485',
                    'abe8f1f8-bef0-4793-8ea3-6efac5794886'
                )
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON jenj.id_jenj_didik = prodi.id_jenj_didik
                AND jenj.expired_date IS NULL
                AND jenj.id_jenj_didik IN (20, 21, 22, 23, 30)
                JOIN (
                    SELECT
                        kul.id_reg_pd,
                        SUM(kul.sks_semester) AS sks
                    FROM
                        pdrd.kuliah_mhs AS kul WITH(NOLOCK)
                    WHERE
                        kul.soft_delete = 0
                        AND kul.id_stat_mhs = 'M'
                        AND kul.id_smt IN ('" . ($thn_iku - 1) . "2', '" . $thn_iku . "1')
                    GROUP BY
                        kul.id_reg_pd
                ) AS mbkm ON mbkm.id_reg_pd = reg.id_reg_pd
                WHERE
                reg.soft_delete = 0
                AND reg.id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
                AND reg.soft_delete = 0
                ) AS mbkm
            ) al
        ";
        $order_by = " ORDER BY total_point DESC, nm_pd ASC ";

          $result = DB::select($select . $join . $where . $order_by);
          return view('content.main.iku.iku-2.download.mbkm_agregat', [
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
