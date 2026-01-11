<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;

/**
 * BidangIlmu Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 */
class BidangIlmu extends Model
{
    use Searchable;

    protected $connection = 'sister';

    public $timestamps = false;
    protected $primaryKey = 'id_kel_bidang';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_kel_bidang',
        'kode_kel_bidang',
        'nm_kel_bidang',
        'ket_kel_bidang',
        'total_dosen',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_kel_bidang,
            'id_kel_bidang' => $this->id_kel_bidang,
            'kode_kel_bidang' => $this->kode_kel_bidang,
            'nm_kel_bidang' => $this->nm_kel_bidang,
            'ket_kel_bidang' => $this->ket_kel_bidang,
            'total_dosen' => (int) $this->total_dosen,
            'category' => 'bidang-ilmu',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'bidang_ilmu_index';
    }

    /**
     * Get searchable fields for filtering
     */
    public function getScoutKey()
    {
        return $this->id_kel_bidang;
    }

    /**
     * Static method to fetch and prepare data for indexing
     */
    public static function getAllForIndexing(): array
    {
        $sql = "
            SELECT
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang,
                COUNT(DISTINCT msb.id_sdm) AS total_dosen
            FROM ref.kelompok_bidang AS kb
            LEFT JOIN pdrd.map_sdm_bidang AS msb
                ON msb.id_kel_bidang = kb.id_kel_bidang
                AND msb.soft_delete = 0
            WHERE kb.expired_date IS NULL
            GROUP BY
                kb.id_kel_bidang,
                kb.kode_kel_bidang,
                kb.nm_kel_bidang,
                kb.ket_kel_bidang
            ORDER BY COUNT(DISTINCT msb.id_sdm) DESC, kb.nm_kel_bidang ASC
        ";

        $results = DB::connection('sister')->select($sql);

        // Convert stdClass to BidangIlmu models
        $models = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_kel_bidang = $result->id_kel_bidang;
            $model->kode_kel_bidang = $result->kode_kel_bidang ?? null;
            $model->nm_kel_bidang = $result->nm_kel_bidang;
            $model->ket_kel_bidang = $result->ket_kel_bidang ?? null;
            $model->total_dosen = (int) $result->total_dosen;
            $model->exists = true;

            $models[] = $model;
        }

        return $models;
    }
}
