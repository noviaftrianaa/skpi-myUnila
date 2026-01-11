<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;

/**
 * Penelitian Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 */
class Penelitian extends Model
{
    use Searchable;

    protected $connection = 'sqlsrv';

    public $timestamps = false;
    protected $primaryKey = 'id_litabmas';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_litabmas',
        'judul',
        'tahun',
        'skim',
        'ketua_peneliti',
        'bidang_ilmu',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_litabmas,
            'judul' => $this->judul,
            'tahun' => $this->tahun,
            'skim' => $this->skim,
            'ketua_peneliti' => $this->ketua_peneliti,
            'bidang_ilmu' => $this->bidang_ilmu,
            'category' => 'penelitian',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'penelitian_index';
    }

    /**
     * Get searchable fields for filtering
     */
    public function getScoutKey()
    {
        return $this->id_litabmas;
    }

    /**
     * Static method to fetch and prepare data for indexing
     */
    public static function getAllForIndexing(): array
    {
        $sql = "
            SELECT
                l.id_litabmas,
                l.judul_litabmas AS judul,
                l.id_thn_kegiatan AS tahun,
                COALESCE(sk.nm_skim, 'Lainnya') AS skim,
                '' AS ketua_peneliti,
                'Tidak Ada' AS bidang_ilmu
            FROM pdrd.litabmas AS l
            LEFT JOIN ref.skim_kegiatan AS sk
                ON sk.id_skim = l.id_skim
                AND sk.expired_date IS NULL
            WHERE l.soft_delete = 0
                AND l.jns_litabmas = 'L'
            ORDER BY l.id_thn_kegiatan DESC
        ";

        $results = DB::connection('sqlsrv')->select($sql);

        // Convert stdClass to Penelitian models
        $models = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_litabmas = $result->id_litabmas;
            $model->judul = $result->judul;
            $model->tahun = $result->tahun;
            $model->skim = $result->skim;
            $model->ketua_peneliti = $result->ketua_peneliti;
            $model->bidang_ilmu = $result->bidang_ilmu;
            $model->exists = true;

            $models[] = $model;
        }

        return $models;
    }
}
