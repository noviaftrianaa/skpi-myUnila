<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;

/**
 * Prodi Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 */
class Prodi extends Model
{
    use Searchable;

    protected $connection = 'sqlsrv';

    public $timestamps = false;
    protected $primaryKey = 'id_sms';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_sms',
        'nama_prodi',
        'jenjang',
        'kode_prodi',
        'status',
        'jumlah_mahasiswa',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_sms,
            'nama_prodi' => $this->nama_prodi,
            'jenjang' => $this->jenjang,
            'kode_prodi' => $this->kode_prodi,
            'status' => $this->status,
            'jumlah_mahasiswa' => (int) $this->jumlah_mahasiswa,
            'category' => 'prodi',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'prodi_index';
    }

    public function getScoutKey()
    {
        return $this->id_sms;
    }

    /**
     * Static method to fetch and prepare data for indexing
     */
    public static function getAllForIndexing(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                sms.id_sms,
                sms.nm_lemb AS nama_prodi,
                jenj.nm_jenj_didik AS jenjang,
                sms.kode_prodi,
                CASE
                    WHEN sms.stat_prodi = 'A' THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS status,
                COUNT(DISTINCT pd.id_pd) AS jumlah_mahasiswa
            FROM pdrd.sms AS sms
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN pdrd.reg_pd AS reg
                ON reg.id_sms = sms.id_sms
                AND reg.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik AS pd
                ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0
                AND pd.id_stat_mhs = 'A'
            WHERE sms.soft_delete = 0
                AND sms.id_sp = '{$unilaIdSp}'
            GROUP BY
                sms.id_sms,
                sms.nm_lemb,
                jenj.nm_jenj_didik,
                sms.kode_prodi,
                sms.stat_prodi
            ORDER BY sms.nm_lemb
        ";

        $results = DB::connection('sqlsrv')->select($sql);

        $prodiModels = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_sms = $result->id_sms;
            $model->nama_prodi = $result->nama_prodi;
            $model->jenjang = $result->jenjang;
            $model->kode_prodi = $result->kode_prodi;
            $model->status = $result->status;
            $model->jumlah_mahasiswa = $result->jumlah_mahasiswa;
            $model->exists = true;

            $prodiModels[] = $model;
        }

        return $prodiModels;
    }
}
