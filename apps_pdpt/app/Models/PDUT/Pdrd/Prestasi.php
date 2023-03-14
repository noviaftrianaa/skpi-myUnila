<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use App\Models\PDUT\Ref\TahunAjaran;
use Illuminate\Database\Eloquent\Model;

class Prestasi extends Model
{
    protected $table = 'pdrd.prestasi';
    protected $primaryKey = 'id_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = ['id_prestasi', 'id_jenis_prestasi', 'id_akt_mhs', 'nm_prestasi', 'thn_prestasi', 'penyelenggara', 'peringkat', 'id_sp', 'id_pd', 'id_tkt_prestasi', 'create_date', 'id_creator', 'last_update', 'id_updater', 'soft_delete', 'last_sync'];

    public static function prestasi($tipe, $tahun)
    {
        $tgl = TahunAjaran::tglSelesai($tahun);
        $from = "  FROM pdrd.prestasi AS prestasi WITH (NOLOCK)
        ";
        $group = '';
        $order = '';
        if ($tipe == 'jenis_prestasi') {
            $select = "
                SELECT
                    SUM(CASE WHEN prestasi.id_jenis_prestasi=1 THEN 1 ELSE 0 END) AS 'Sains',
                    SUM(CASE WHEN prestasi.id_jenis_prestasi=2 THEN 1 ELSE 0 END) AS 'Seni',
                    SUM(CASE WHEN prestasi.id_jenis_prestasi=3 THEN 1 ELSE 0 END) AS 'Olahraga',
                    SUM(CASE WHEN prestasi.id_jenis_prestasi=9 THEN 1 ELSE 0 END) AS 'Lain-lain'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'tingkat_prestasi') {
            $select = "
                SELECT
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=1 THEN 1 ELSE 0 END) AS 'Sekolah',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=2 THEN 1 ELSE 0 END) AS 'Kecamatan',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=3 THEN 1 ELSE 0 END) AS 'Kab/kota',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=4 THEN 1 ELSE 0 END) AS 'Propinsi',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=5 THEN 1 ELSE 0 END) AS 'Nasional',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=6 THEN 1 ELSE 0 END) AS 'Internasional',
                    SUM(CASE WHEN prestasi.id_tkt_prestasi=9 THEN 1 ELSE 0 END) AS 'Lainnya'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'peringkat') {
            $select = "
                SELECT
                    SUM(CASE WHEN prestasi.peringkat=1 THEN 1 ELSE 0 END) AS 'Juara 1',
                    SUM(CASE WHEN prestasi.peringkat=2 THEN 1 ELSE 0 END) AS 'Juara 2',
                    SUM(CASE WHEN prestasi.peringkat=3 THEN 1 ELSE 0 END) AS 'Juara 3',
                    SUM(CASE WHEN prestasi.peringkat=4 THEN 1 ELSE 0 END) AS 'Juara 4',
                    SUM(CASE WHEN prestasi.peringkat=5 THEN 1 ELSE 0 END) AS 'Juara 5',
                    SUM(CASE WHEN prestasi.peringkat IS NULL THEN 1 ELSE 0 END) AS 'Tidak Juara'
                ";
            $alternative_where = '';
        } elseif ($tipe == 'iku_prestasi') {
            $select = "
                SELECT
                SUM (
                    CASE
                        WHEN tkt_prestasi.id_tkt_prestasi IN (5, 6) THEN 1
                        ELSE 0
                    END
                ) AS memenuhi_iku,
                SUM (
                    CASE
                        WHEN tkt_prestasi.id_tkt_prestasi NOT IN (5, 6) THEN 1
                        ELSE 0
                    END
                ) AS tidak_memenuhi_iku
                ";
            $alternative_where = '';
        }

        $join = "
            JOIN ref.jenis_prestasi AS jns_prestasi WITH(NOLOCK) ON jns_prestasi.id_jenis_prestasi = prestasi.id_jenis_prestasi
            ANd jns_prestasi.expired_date IS NULL
            JOIN ref.tingkat_prestasi AS tkt_prestasi WITH(NOLOCK) ON tkt_prestasi.id_tkt_prestasi = prestasi.id_tkt_prestasi
            AND tkt_prestasi.expired_date IS NULL
                ";

        $where =
            "
            WHERE
            prestasi.soft_delete = 0
            AND prestasi.thn_prestasi = '". $tahun ."'
                ";
        $data = \DB::SELECT($select . $from . $join . $where . $alternative_where . $group . $order);
        return collect($data);
    }
}
