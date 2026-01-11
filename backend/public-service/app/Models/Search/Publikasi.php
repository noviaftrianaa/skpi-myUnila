<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;

/**
 * Publikasi Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 */
class Publikasi extends Model
{
    use Searchable;

    protected $connection = 'sqlsrv';

    public $timestamps = false;
    protected $primaryKey = 'id_publikasi';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_publikasi',
        'judul',
        'tahun',
        'jenis_publikasi',
        'penerbit',
        'penulis_utama',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_publikasi,
            'judul' => $this->judul,
            'tahun' => $this->tahun,
            'jenis_publikasi' => $this->jenis_publikasi,
            'penerbit' => $this->penerbit,
            'penulis_utama' => $this->penulis_utama,
            'category' => 'publikasi',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'publikasi_index';
    }

    /**
     * Get searchable fields for filtering
     */
    public function getScoutKey()
    {
        return $this->id_publikasi;
    }

    /**
     * Static method to fetch and prepare data for indexing
     */
    public static function getAllForIndexing(): array
    {
        $sql = "
            SELECT
                p.id_publikasi,
                p.judul,
                YEAR(p.tgl_terbit) AS tahun,
                COALESCE(jp.nm_jns_pub, 'Lainnya') AS jenis_publikasi,
                p.penerbit,
                '' AS penulis_utama
            FROM pdrd.publikasi AS p
            LEFT JOIN ref.jenis_publikasi AS jp
                ON jp.id_jns_pub = p.id_jns_pub
                AND jp.expired_date IS NULL
            WHERE p.soft_delete = 0
            ORDER BY p.tgl_terbit DESC
        ";

        $results = DB::connection('sqlsrv')->select($sql);

        // Convert stdClass to Publikasi models
        $models = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_publikasi = $result->id_publikasi;
            $model->judul = $result->judul;
            $model->tahun = $result->tahun;
            $model->jenis_publikasi = $result->jenis_publikasi;
            $model->penerbit = $result->penerbit;
            $model->penulis_utama = $result->penulis_utama;
            $model->exists = true;

            $models[] = $model;
        }

        return $models;
    }
}
