<?php

namespace App\Services;

use App\Repositories\StatusKepegawaianRepository;
use Illuminate\Support\Facades\Crypt;

class StatusKepegawaianService
{
    protected StatusKepegawaianRepository $statusKepegawaianRepository;

    public function __construct(StatusKepegawaianRepository $statusKepegawaian)
    {
        $this->statusKepegawaianRepository = $statusKepegawaian;
    }

    /**
     * Get status kepegawaian data at university level (per fakultas)
     *
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianFakultas($idThnAjaran = null)
    {
        $raw_data = $this->statusKepegawaianRepository->getStatusKepegawaianByLevel($idThnAjaran);

        // Transform to match frontend Fakultas interface
        $fakultas_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'pns' => (int) $item->pns,
                'cpns' => (int) $item->cpns,
                'pppk' => (int) $item->pppk,
                'non_asn' => (int) $item->non_asn,
                'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'lainnya' => (int) $item->lainnya,
                'total' => (int) $item->total,
            ];
        })->values();

        return $fakultas_data;
    }

    /**
     * Get status kepegawaian data at fakultas level (per prodi)
     *
     * @param string $idFakultas
     * @param int|null $idThnAjaran
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianProdi($idFakultas, $idThnAjaran = null)
    {
        $raw_data = $this->statusKepegawaianRepository->getStatusKepegawaianByLevel($idThnAjaran, $idFakultas);

        // Transform to match frontend Prodi interface
        $prodi_data = collect($raw_data)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'pns' => (int) $item->pns,
                'cpns' => (int) $item->cpns,
                'pppk' => (int) $item->pppk,
                'non_asn' => (int) $item->non_asn,
                'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'lainnya' => (int) $item->lainnya,
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
     * @param string|null $statusKepegawaian
     * @return array
     */
    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null, $statusKepegawaian = null)
    {
        $result = $this->statusKepegawaianRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search, $statusKepegawaian);

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
                'status_kepegawaian' => $item->status_kepegawaian,
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
        return $this->statusKepegawaianRepository->getTahunAjaranList();
    }

    /**
     * Get fakultas list
     *
     * @return \Illuminate\Support\Collection
     */
    public function getFakultasList()
    {
        return $this->statusKepegawaianRepository->getFakultasList();
    }

    /**
     * Get prodi list by fakultas
     *
     * @param string $idFakultas
     * @return \Illuminate\Support\Collection
     */
    public function getProdiListByFakultas($idFakultas)
    {
        return $this->statusKepegawaianRepository->getProdiListByFakultas($idFakultas);
    }

    /**
     * Get historical status kepegawaian data at university/fakultas level for multiple years
     *
     * @param string|null $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianFakultasHistorical($selectedYearId = null, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->statusKepegawaianRepository->getStatusKepegawaianFakultasHistorical($startYear, $selectedYear, $fakultasId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'pns' => (int) $item->pns,
                    'cpns' => (int) $item->cpns,
                    'pppk' => (int) $item->pppk,
                    'non_asn' => (int) $item->non_asn,
                    'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                    'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                    'lainnya' => (int) $item->lainnya,
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
     * Get historical status kepegawaian data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getStatusKepegawaianProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->statusKepegawaianRepository->getStatusKepegawaianProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = $this->transformProdiStatusKepegawaianData($yearData['data']);

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
     * Transform prodi-level status kepegawaian data from row-based to column-based format
     *
     * @param mixed $rawData
     * @return \Illuminate\Support\Collection
     */
    private function transformProdiStatusKepegawaianData($rawData)
    {
        // Check if data is already in column-based format (has pns field)
        $data = collect($rawData);
        if ($data->isNotEmpty() && isset($data->first()->pns)) {
            // Already in column-based format, just transform field names
            return $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_prodi' => $item->nama_prodi,
                    'fakultas_id' => $item->fakultas_id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'pns' => (int) $item->pns,
                    'cpns' => (int) $item->cpns,
                    'pppk' => (int) $item->pppk,
                    'non_asn' => (int) $item->non_asn,
                    'asn_jf_non_dosen' => (int) $item->asn_jf_non_dosen,
                    'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                    'lainnya' => (int) $item->lainnya,
                    'total' => (int) $item->total,
                ];
            })->values();
        }

        // Data is in row-based format (one row per status kepegawaian category)
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
                'pns' => 0,
                'cpns' => 0,
                'pppk' => 0,
                'non_asn' => 0,
                'asn_jf_non_dosen' => 0,
                'dokter_pendidik_klinis' => 0,
                'lainnya' => 0,
                'total' => 0,
            ];

            // Sum up the totals and map categories
            foreach ($group as $row) {
                $aggregated['total'] += (int) $row->total;

                // Map id_stat_pegawai to the appropriate field
                $statusId = $row->id_status_kepegawaian ?? '-';
                switch ($statusId) {
                    case 1:
                        $aggregated['pns'] = (int) $row->total;
                        break;
                    case 13:
                        $aggregated['cpns'] = (int) $row->total;
                        break;
                    case 14:
                        $aggregated['pppk'] = (int) $row->total;
                        break;
                    case 16:
                        $aggregated['non_asn'] = (int) $row->total;
                        break;
                    case 18:
                        $aggregated['asn_jf_non_dosen'] = (int) $row->total;
                        break;
                    case 17:
                        $aggregated['dokter_pendidik_klinis'] = (int) $row->total;
                        break;
                    default:
                        $aggregated['lainnya'] += (int) $row->total;
                        break;
                }
            }

            return $aggregated;
        })->values();
    }
}
