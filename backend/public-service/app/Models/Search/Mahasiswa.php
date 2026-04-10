<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

/**
 * Mahasiswa Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 * Data comes from complex queries with JOINs from SearchRepository
 */
class Mahasiswa extends Model
{
    use Searchable;

    protected $connection = 'sqlsrv';

    // This is a virtual model - no actual table
    // Data comes from SearchRepository query results
    public $timestamps = false;
    protected $primaryKey = 'id_pd';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_pd',
        'nama',
        'nim',
        'prodi',
        'jenjang',
        'status',
        'jenis_kelamin',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_pd,
            'nama' => $this->nama,
            'nim' => $this->nim,
            'prodi' => $this->prodi,
            'jenjang' => $this->jenjang,
            'status' => $this->status,
            'jenis_kelamin' => $this->jenis_kelamin,
            'category' => 'mahasiswa',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'mahasiswa_index';
    }

    /**
     * Get searchable fields for filtering
     */
    public function getScoutKey()
    {
        return $this->id_pd;
    }

    /**
     * Static method to fetch and prepare data for indexing
     * This uses the same query from SearchRepository
     */
    public static function getAllForIndexing(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

        $sql = "
            SELECT
                pd.id_pd,
                pd.nm_pd AS nama,
                reg.nipd AS nim,
                sms.nm_lemb AS prodi,
                jenj.nm_jenj_didik AS jenjang,
                CASE
                    WHEN CAST(reg.id_jns_keluar AS VARCHAR(10)) = '1' THEN 'Lulus'
                    WHEN reg.id_jns_keluar IS NULL THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS status,
                CASE
                    WHEN pd.jk = 'L' THEN 'Laki-laki'
                    ELSE 'Perempuan'
                END AS jenis_kelamin
            FROM pdrd.peserta_didik AS pd
            INNER JOIN pdrd.reg_pd AS reg
                ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.id_sp = '{$unilaIdSp}'
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN pdrd.kuliah_mhs AS kmh
                ON kmh.id_reg_pd = reg.id_reg_pd
                AND kmh.soft_delete = 0
                AND kmh.id_smt = (
                    SELECT TOP 1 CAST(id_smt AS VARCHAR(10))
                    FROM ref.semester
                    WHERE expired_date IS NULL
                    AND a_periode_aktif = 1
                    ORDER BY id_smt DESC
                )
            WHERE pd.soft_delete = 0
            ORDER BY pd.nm_pd
        ";

        $results = DB::connection('sqlsrv')->select($sql);

        // Convert stdClass to Mahasiswa models
        $mahasiswaModels = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_pd = $result->id_pd;
            $model->nama = $result->nama;
            $model->nim = $result->nim;
            $model->prodi = $result->prodi;
            $model->jenjang = $result->jenjang;
            $model->status = $result->status;
            $model->jenis_kelamin = $result->jenis_kelamin;
            $model->exists = true; // Mark as existing record

            $mahasiswaModels[] = $model;
        }

        return $mahasiswaModels;
    }
}
