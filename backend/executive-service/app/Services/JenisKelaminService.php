<?php

namespace App\Services;

use App\Repositories\JenisKelaminRepository;
use Illuminate\Support\Facades\Crypt;

class JenisKelaminService
{
    protected JenisKelaminRepository $jenisKelaminRepository;

    public function __construct(JenisKelaminRepository $jenisKelamin)
    {
        $this->jenisKelaminRepository = $jenisKelamin;
    }

    /**
     * Get jenis kelamin data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenisKelaminFakultas($idThnAjaran = null)
    {
        $raw_data = $this->jenisKelaminRepository->getJenisKelaminByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'laki_laki' => (int) $item->laki_laki,
                'perempuan' => (int) $item->perempuan,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get jenis kelamin data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getJenisKelaminProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->jenisKelaminRepository->getJenisKelaminByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'laki_laki' => (int) $item->laki_laki,
                'perempuan' => (int) $item->perempuan,
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
     * @param string|null $jenisKelamin
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null, $jenisKelamin = null)
    {
        $result = $this->jenisKelaminRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $jenisKelamin);

        // Transform to match frontend Dosen interface
        $dosen_data = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'jenis_kelamin' => $item->jenis_kelamin,
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
        return $this->jenisKelaminRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->jenisKelaminRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->jenisKelaminRepository->getProdiListByFakultas($idFakultas);
    }

    /**
     * Get historical jenis kelamin data at university/fakultas level for multiple years
     *
     * @param string|null $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenisKelaminFakultasHistorical($selectedYearId = null, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jenisKelaminRepository->getJenisKelaminFakultasHistorical($startYear, $selectedYear, $fakultasId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'laki_laki' => (int) $item->laki_laki,
                    'perempuan' => (int) $item->perempuan,
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
     * Get historical jenis kelamin data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getJenisKelaminProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->jenisKelaminRepository->getJenisKelaminProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = $this->transformProdiJenisKelaminData($yearData['data']);

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
     * Transform prodi-level jenis kelamin data from row-based to column-based format
     *
     * @param mixed $rawData
     * @return \Illuminate\Support\Collection
     */
    private function transformProdiJenisKelaminData($rawData)
    {
        // Check if data is already in column-based format (has laki_laki field)
        $data = collect($rawData);
        if ($data->isNotEmpty() && isset($data->first()->laki_laki)) {
            // Already in column-based format, just transform field names
            return $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_prodi' => $item->nama_prodi,
                    'fakultas_id' => $item->fakultas_id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'laki_laki' => (int) $item->laki_laki,
                    'perempuan' => (int) $item->perempuan,
                    'total' => (int) $item->total,
                ];
            })->values();
        }

        // Data is in row-based format (one row per jenis kelamin category)
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
                'laki_laki' => 0,
                'perempuan' => 0,
                'total' => 0,
            ];

            // Sum up the totals and map categories
            foreach ($group as $row) {
                $aggregated['total'] += (int) $row->total;

                // Map id_jenis_kelamin to the appropriate field
                $jenisKelaminId = $row->id_jenis_kelamin ?? '-';
                switch ($jenisKelaminId) {
                    case 'L':
                        $aggregated['laki_laki'] = (int) $row->total;
                        break;
                    case 'P':
                        $aggregated['perempuan'] = (int) $row->total;
                        break;
                }
            }

            return $aggregated;
        })->values();
    }
}
