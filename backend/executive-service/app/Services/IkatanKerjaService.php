<?php

namespace App\Services;

use App\Repositories\IkatanKerjaRepository;
use Illuminate\Support\Facades\Crypt;

class IkatanKerjaService
{
    protected IkatanKerjaRepository $ikatanKerjaRepository;

    public function __construct(IkatanKerjaRepository $ikatanKerja)
    {
        $this->ikatanKerjaRepository = $ikatanKerja;
    }

    public function getIkatanKerjaFakultas($idThnAjaran = null)
    {
        $rawData = $this->ikatanKerjaRepository->getIkatanKerjaByLevel($idThnAjaran);

        return collect($rawData)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_fakultas' => $item->nama_fakultas,
                'dosen_tetap' => (int) $item->dosen_tetap,
                'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                'p3k_asn' => (int) $item->p3k_asn,
                'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                'instruktur' => (int) $item->instruktur,
                'tutor' => (int) $item->tutor,
                'jft' => (int) $item->jft,
                'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
                'total' => (int) $item->total,
            ];
        })->values();
    }

    public function getIkatanKerjaProdi($idFakultas, $idThnAjaran = null)
    {
        $rawData = $this->ikatanKerjaRepository->getIkatanKerjaByLevel($idThnAjaran, $idFakultas);

        return collect($rawData)->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
                'fakultas_id' => $item->fakultas_id,
                'nama_fakultas' => $item->nama_fakultas,
                'dosen_tetap' => (int) $item->dosen_tetap,
                'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                'p3k_asn' => (int) $item->p3k_asn,
                'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                'instruktur' => (int) $item->instruktur,
                'tutor' => (int) $item->tutor,
                'jft' => (int) $item->jft,
                'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
                'total' => (int) $item->total,
            ];
        })->values();
    }

    public function getDataDosen($idThnAjaran = null, $idFakultas = null, $idProdi = null, $perPage = 10, $page = 1, $search = null)
    {
        $result = $this->ikatanKerjaRepository->getDataDosen($idThnAjaran, $idFakultas, $idProdi, $perPage, $page, $search);

        $dosenData = collect($result['data'])->map(function ($item) {
            return [
                'id' => $item->id,
                'encrypted_id' => Crypt::encryptString($item->id),
                'nidn' => $item->nidn,
                'nama' => $item->nama,
                'prodi' => $item->nama_prodi,
                'fakultas' => $item->nama_fakultas,
                'ikatan_kerja' => $item->ikatan_kerja,
                'status' => $item->status,
            ];
        })->values();

        return [
            'data' => $dosenData,
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ];
    }

    public function getTahunAjaranList()
    {
        return $this->ikatanKerjaRepository->getTahunAjaranList();
    }

    public function getFakultasList()
    {
        return $this->ikatanKerjaRepository->getFakultasList();
    }

    public function getProdiListByFakultas($idFakultas)
    {
        return $this->ikatanKerjaRepository->getProdiListByFakultas($idFakultas);
    }

    /**
     * Get historical ikatan kerja data at university/fakultas level for multiple years
     *
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $fakultasId Filter by fakultas (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getIkatanKerjaFakultasHistorical($selectedYearId, $yearsBack = 5, $fakultasId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->ikatanKerjaRepository->getIkatanKerjaFakultasHistorical($startYear, $selectedYear, $fakultasId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = collect($yearData['data'])->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'dosen_tetap' => (int) $item->dosen_tetap,
                    'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                    'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                    'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                    'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                    'p3k_asn' => (int) $item->p3k_asn,
                    'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                    'instruktur' => (int) $item->instruktur,
                    'tutor' => (int) $item->tutor,
                    'jft' => (int) $item->jft,
                    'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                    'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                    'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
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
     * Get historical ikatan kerja data at fakultas level (per prodi) for multiple years
     *
     * @param string $fakultasId Faculty ID
     * @param string $selectedYearId Selected academic year ID from dropdown
     * @param int $yearsBack Number of years to go back (default: 5)
     * @param string|null $prodiId Filter by prodi (optional)
     * @return \Illuminate\Support\Collection
     */
    public function getIkatanKerjaProdiHistorical($fakultasId, $selectedYearId, $yearsBack = 5, $prodiId = null)
    {
        // Convert id_smt to id_thn_ajaran if needed
        $tahunId = strlen((string)$selectedYearId) > 4
            ? (int) floor((int)$selectedYearId / 10)
            : (int) $selectedYearId;

        // Calculate start year (go back N-1 years from selected year)
        $selectedYear = (int) $tahunId;
        $startYear = $selectedYear - ($yearsBack - 1);

        // Get historical data from repository
        $rawHistoricalData = $this->ikatanKerjaRepository->getIkatanKerjaProdiHistorical($fakultasId, $startYear, $selectedYear, $prodiId);

        // Transform each year's data
        $historicalData = $rawHistoricalData->map(function ($yearData) {
            $transformedData = $this->transformProdiIkatanKerjaData($yearData['data']);

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
     * Transform prodi-level ikatan kerja data from row-based to column-based format
     *
     * @param mixed $rawData
     * @return \Illuminate\Support\Collection
     */
    private function transformProdiIkatanKerjaData($rawData)
    {
        // Check if data is already in column-based format (has dosen_tetap field)
        $data = collect($rawData);
        if ($data->isNotEmpty() && isset($data->first()->dosen_tetap)) {
            // Already in column-based format, just transform field names
            return $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_prodi' => $item->nama_prodi,
                    'fakultas_id' => $item->fakultas_id,
                    'nama_fakultas' => $item->nama_fakultas,
                    'dosen_tetap' => (int) $item->dosen_tetap,
                    'dosen_pns_dpk' => (int) $item->dosen_pns_dpk,
                    'dokter_pendidik_klinis' => (int) $item->dokter_pendidik_klinis,
                    'dosen_tetap_bh' => (int) $item->dosen_tetap_bh,
                    'dosen_tidak_tetap' => (int) $item->dosen_tidak_tetap,
                    'p3k_asn' => (int) $item->p3k_asn,
                    'dosen_perjanjian_kerja' => (int) $item->dosen_perjanjian_kerja,
                    'instruktur' => (int) $item->instruktur,
                    'tutor' => (int) $item->tutor,
                    'jft' => (int) $item->jft,
                    'pengajar_nondosen' => (int) $item->pengajar_nondosen,
                    'dosen_tetap_pk_waktu_tertentu' => (int) $item->dosen_tetap_pk_waktu_tertentu,
                    'belum_ikatan_kerja' => (int) $item->belum_ikatan_kerja,
                    'total' => (int) $item->total,
                ];
            })->values();
        }

        // Data is in row-based format (one row per ikatan kerja category)
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
                'dosen_tetap' => 0,
                'dosen_pns_dpk' => 0,
                'dokter_pendidik_klinis' => 0,
                'dosen_tetap_bh' => 0,
                'dosen_tidak_tetap' => 0,
                'p3k_asn' => 0,
                'dosen_perjanjian_kerja' => 0,
                'instruktur' => 0,
                'tutor' => 0,
                'jft' => 0,
                'pengajar_nondosen' => 0,
                'dosen_tetap_pk_waktu_tertentu' => 0,
                'belum_ikatan_kerja' => 0,
                'total' => 0,
            ];

            // Sum up the totals and map categories
            foreach ($group as $row) {
                $aggregated['total'] += (int) $row->total;

                // Map ikatan_kerja code to the appropriate field
                $ikatanKerjaId = $row->id_ikatan_kerja ?? '-';
                switch ($ikatanKerjaId) {
                    case 'A':
                        $aggregated['dosen_tetap'] = (int) $row->total;
                        break;
                    case 'B':
                        $aggregated['dosen_pns_dpk'] = (int) $row->total;
                        break;
                    case 'E':
                        $aggregated['dokter_pendidik_klinis'] = (int) $row->total;
                        break;
                    case 'F':
                        $aggregated['dosen_tetap_bh'] = (int) $row->total;
                        break;
                    case 'G':
                        $aggregated['dosen_tidak_tetap'] = (int) $row->total;
                        break;
                    case 'H':
                        $aggregated['p3k_asn'] = (int) $row->total;
                        break;
                    case 'I':
                        $aggregated['dosen_perjanjian_kerja'] = (int) $row->total;
                        break;
                    case 'J':
                        $aggregated['instruktur'] = (int) $row->total;
                        break;
                    case 'K':
                        $aggregated['tutor'] = (int) $row->total;
                        break;
                    case 'L':
                        $aggregated['jft'] = (int) $row->total;
                        break;
                    case 'M':
                        $aggregated['pengajar_nondosen'] = (int) $row->total;
                        break;
                    case 'N':
                        $aggregated['dosen_tetap_pk_waktu_tertentu'] = (int) $row->total;
                        break;
                    case '-':
                    case '':
                        $aggregated['belum_ikatan_kerja'] = (int) $row->total;
                        break;
                }
            }

            return $aggregated;
        })->values();
    }
}
