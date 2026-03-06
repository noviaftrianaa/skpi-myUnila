<?php

namespace App\Services;

use App\Repositories\JenjangPendidikanRepository;
use Illuminate\Support\Facades\Crypt;

class JenjangPendidikanService
{
    protected JenjangPendidikanRepository $jenjangRepository;

    public function __construct(JenjangPendidikanRepository $jenjang)
    {
        $this->jenjangRepository = $jenjang;
    }

    /**
     * Get jenjang pendidikan data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangFakultas($idThnAjaran = null)
    {
        $raw_data = $this->jenjangRepository->getJenjangByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'd3' => (int) $item->d3,
                'd4' => (int) $item->d4,
                's1' => (int) $item->s1,
                's2' => (int) $item->s2,
                's2_terapan' => (int) $item->s2_terapan,
                's3' => (int) $item->s3,
                'profesi' => (int) $item->profesi,
                'sp1' => (int) $item->sp1,
                'sp2' => (int) $item->sp2,
                'belum_jenjang' => (int) $item->belum_jenjang,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get jenjang pendidikan data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->jenjangRepository->getJenjangByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'd3' => (int) $item->d3,
                'd4' => (int) $item->d4,
                's1' => (int) $item->s1,
                's2' => (int) $item->s2,
                's2_terapan' => (int) $item->s2_terapan,
                's3' => (int) $item->s3,
                'profesi' => (int) $item->profesi,
                'sp1' => (int) $item->sp1,
                'sp2' => (int) $item->sp2,
                'belum_jenjang' => (int) $item->belum_jenjang,
                'total' => (int) $item->total,
            ];
        })->values();

        return $prodi_data;
    }

    /**
     * Get dosen data with pagination
     *
     * @param string|null $idFakultas
     * @param string|null $idProdi
     * @param int|null $idThnAjaran
     * @param int $perPage
     * @param int $page
     * @param string|null $search
     * @param string|null $jenjangDidik
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null, $jenjangDidik = null)
    {
        $result = $this->jenjangRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $jenjangDidik);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'jenjang_didik' => $item->jenjang_didik,
                'status' => $item->status,
            ];
        })->values();

        return [
            'data' => $dosen_data,
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ];
    }

    /**
     * Get tahun ajaran list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getTahunAjaranList()
    {
        return $this->jenjangRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->jenjangRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->jenjangRepository->getProdiListByFakultas($idFakultas);
    }

    /**
     * Get historical jenjang pendidikan data at university/fakultas level for multiple years
     *
     * @param string|null $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangFakultasHistorical($selectedYearId = null, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jenjangRepository->getJenjangFakultasHistorical($startYear, $selectedYear, $fakultasId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'd3' => (int) $item->d3,
                    'd4' => (int) $item->d4,
                    's1' => (int) $item->s1,
                    's2' => (int) $item->s2,
                    's2_terapan' => (int) $item->s2_terapan,
                    's3' => (int) $item->s3,
                    'profesi' => (int) $item->profesi,
                    'sp1' => (int) $item->sp1,
                    'sp2' => (int) $item->sp2,
                    'belum_jenjang' => (int) $item->belum_jenjang,
                    'total' => (int) $item->total,
                ];
            })->values();

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => $yearData['tahun_id'],
                'smt_id' => $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }

    /**
     * Get historical jenjang pendidikan data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenjangProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jenjangRepository->getJenjangProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = $this->transformProdiJenjangData($yearData['data']);

            return [
                'tahun' => $yearData['tahun'],
                'tahun_id' => $yearData['tahun_id'],
                'smt_id' => $yearData['smt_id'],
                'data' => $transformedData
            ];
        });

        return $historicalData;
    }

    /**
     * Transform prodi-level jenjang pendidikan data from row-based to column-based format
     *
     * @param mixed $rawData
     * @return \Illuminate\Support\Collection
     */
    private function transformProdiJenjangData($rawData)
    {
        // Check if data is already in column-based format (has d3 field)
        $data = collect($rawData);
        if ($data->isNotEmpty() && isset($data->first()->d3)) {
            // Already in column-based format, just transform field names
            return $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_prodi' => $item->nama_prodi,
                    'fakultas_id' => $item->fakultas_id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'd3' => (int) $item->d3,
                    'd4' => (int) $item->d4,
                    's1' => (int) $item->s1,
                    's2' => (int) $item->s2,
                    's2_terapan' => (int) $item->s2_terapan,
                    's3' => (int) $item->s3,
                    'profesi' => (int) $item->profesi,
                    'sp1' => (int) $item->sp1,
                    'sp2' => (int) $item->sp2,
                    'belum_jenjang' => (int) $item->belum_jenjang,
                    'total' => (int) $item->total,
                ];
            })->values();
        }

        // Data is in row-based format (one row per jenjang category)
        // Need to aggregate to column-based format
        $groupedData = $data->groupBy(function ($item) {
            return $item->id_prodi . '|' . $item->nama_prodi;
        });

        return $groupedData->map(function ($group) {
            $first = $group->first();

            // Initialize all categories to 0
            $aggregated = [
                'id' => $first->id_prodi,
                'nama_prodi' => $first->nama_prodi,
                'fakultas_id' => $first->id_fakultas,
                'nama_fakultas' => $first->nama_fakultas,
                'd3' => 0,
                'd4' => 0,
                's1' => 0,
                's2' => 0,
                's2_terapan' => 0,
                's3' => 0,
                'profesi' => 0,
                'sp1' => 0,
                'sp2' => 0,
                'belum_jenjang' => 0,
                'total' => 0,
            ];

            // Sum up the totals and map categories
            foreach ($group as $row) {
                $aggregated['total'] += (int) $row->total;

                // Map id_jenj_didik to the appropriate field
                $jenjangId = $row->id_jenj_didik ?? 999;
                switch ($jenjangId) {
                    case 22:
                        $aggregated['d3'] = (int) $row->total;
                        break;
                    case 23:
                        $aggregated['d4'] = (int) $row->total;
                        break;
                    case 30:
                        $aggregated['s1'] = (int) $row->total;
                        break;
                    case 35:
                        $aggregated['s2'] = (int) $row->total;
                        break;
                    case 36:
                        $aggregated['s2_terapan'] = (int) $row->total;
                        break;
                    case 40:
                        $aggregated['s3'] = (int) $row->total;
                        break;
                    case 31:
                        $aggregated['profesi'] = (int) $row->total;
                        break;
                    case 32:
                        $aggregated['sp1'] = (int) $row->total;
                        break;
                    case 37:
                        $aggregated['sp2'] = (int) $row->total;
                        break;
                    case 999:
                        $aggregated['belum_jenjang'] = (int) $row->total;
                        break;
                }
            }

            return $aggregated;
        })->values();
    }
}
