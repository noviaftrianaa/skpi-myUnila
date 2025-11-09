<?php

namespace App\Models\Search;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\DB;
use App\Helpers\TahunAjaranHelper;

/**
 * Dosen Search Model for Meilisearch
 *
 * This is a read-only model specifically for search functionality
 */
class Dosen extends Model
{
    use Searchable;

    protected $connection = 'sqlsrv';

    public $timestamps = false;
    protected $primaryKey = 'id_sdm';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_sdm',
        'nama',
        'nidn',
        'nip',
        'jabatan_fungsional',
        'prodi_homebase',
        'jenjang_prodi',
        'jenis_kelamin',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id_sdm,
            'nama' => $this->nama,
            'nidn' => $this->nidn,
            'nip' => $this->nip,
            'jabatan_fungsional' => $this->jabatan_fungsional,
            'prodi_homebase' => $this->prodi_homebase,
            'jenjang_prodi' => $this->jenjang_prodi,
            'jenis_kelamin' => $this->jenis_kelamin,
            'category' => 'dosen',
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'dosen_index';
    }

    public function getScoutKey()
    {
        return $this->id_sdm;
    }

    /**
     * Static method to fetch and prepare data for indexing
     */
    public static function getAllForIndexing(): array
    {
        $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));
        $tahunAjaran = TahunAjaranHelper::getActiveTahunAjaran();

        $sql = "
            SELECT
                sdm.id_sdm,
                sdm.nm_sdm AS nama,
                sdm.nidn,
                sdm.nip,
                COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
                sms.nm_lemb AS prodi_homebase,
                jenj.nm_jenj_didik AS jenjang_prodi,
                CASE
                    WHEN sdm.jk = 'L' THEN 'Laki-laki'
                    ELSE 'Perempuan'
                END AS jenis_kelamin
            FROM pdrd.sdm AS sdm
            INNER JOIN pdrd.reg_ptk AS ptk
                ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND ptk.id_sp = '{$unilaIdSp}'
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = '{$tahunAjaran}'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = ptk.id_sms
                AND sms.soft_delete = 0
            INNER JOIN ref.jenjang_pendidikan AS jenj
                ON jenj.id_jenj_didik = sms.id_jenj_didik
                AND jenj.expired_date IS NULL
            LEFT JOIN (
                SELECT
                    rwy.id_sdm,
                    jab.nm_jabfung,
                    ROW_NUMBER() OVER (PARTITION BY rwy.id_sdm ORDER BY rwy.tmt_sk_jabfung DESC) AS rn
                FROM pdrd.rwy_fungsional AS rwy
                LEFT JOIN ref.jabfung AS jab
                    ON jab.id_jabfung = rwy.id_jabfung
                    AND jab.expired_date IS NULL
                WHERE rwy.soft_delete = 0
            ) AS jabfung ON jabfung.id_sdm = sdm.id_sdm AND jabfung.rn = 1
            WHERE sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            ORDER BY sdm.nm_sdm
        ";

        $results = DB::connection('sqlsrv')->select($sql);

        $dosenModels = [];
        foreach ($results as $result) {
            $model = new static();
            $model->id_sdm = $result->id_sdm;
            $model->nama = $result->nama;
            $model->nidn = $result->nidn;
            $model->nip = $result->nip;
            $model->jabatan_fungsional = $result->jabatan_fungsional;
            $model->prodi_homebase = $result->prodi_homebase;
            $model->jenjang_prodi = $result->jenjang_prodi;
            $model->jenis_kelamin = $result->jenis_kelamin;
            $model->exists = true;

            $dosenModels[] = $model;
        }

        return $dosenModels;
    }
}
