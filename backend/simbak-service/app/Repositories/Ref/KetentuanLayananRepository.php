<?php

namespace App\Repositories\Ref;

use App\Repositories\BaseRepository;

class KetentuanLayananRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 50;
        $search = $params['search'] ?? null;
        $idJenisLayanan = $params['id_jenis_layanan'] ?? null;
        $bindings = [];

        $where = "WHERE 1=1";

        if ($search) {
            $where .= " AND (LOWER(k.nm_ketentuan) LIKE ? OR LOWER(k.kode_ketentuan) LIKE ?)";
            $bindings[] = '%' . strtolower($search) . '%';
            $bindings[] = '%' . strtolower($search) . '%';
        }

        if ($idJenisLayanan) {
            $where .= " AND k.id_jenis_layanan = ?";
            $bindings[] = $idJenisLayanan;
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.ketentuan_layanan k {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT k.*, jl.kode_layanan, jl.nm_layanan
            FROM ref.ketentuan_layanan k
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = k.id_jenis_layanan
            {$where}
            ORDER BY jl.kode_layanan, k.nm_jenjang NULLS FIRST, k.kondisi_semester NULLS FIRST, k.urutan ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    /**
     * Ambil semua ketentuan aktif untuk satu jenis layanan.
     */
    public function getByJenisLayanan(string $idJenisLayanan): array
    {
        return $this->pgSelect("
            SELECT *
            FROM ref.ketentuan_layanan
            WHERE id_jenis_layanan = ? AND a_aktif = true
            ORDER BY nm_jenjang NULLS FIRST, kondisi_semester NULLS FIRST, urutan ASC
        ", [$idJenisLayanan]);
    }

    /**
     * Ambil ketentuan aktif berdasarkan kode layanan (helper).
     */
    public function getByKodeLayanan(string $kodeLayanan): array
    {
        return $this->pgSelect("
            SELECT k.*
            FROM ref.ketentuan_layanan k
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = k.id_jenis_layanan
            WHERE jl.kode_layanan = ? AND k.a_aktif = true
            ORDER BY k.nm_jenjang NULLS FIRST, k.kondisi_semester NULLS FIRST, k.urutan ASC
        ", [$kodeLayanan]);
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.ketentuan_layanan WHERE id_ketentuan = ?",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.ketentuan_layanan (
                id_jenis_layanan, nm_jenjang, kondisi_semester,
                kode_ketentuan, nm_ketentuan, operator, nilai,
                pesan_gagal, deskripsi, a_aktif, urutan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'],
            $data['nm_jenjang'] ?? null,
            $data['kondisi_semester'] ?? null,
            $data['kode_ketentuan'],
            $data['nm_ketentuan'],
            $data['operator'],
            $data['nilai'],
            $data['pesan_gagal'] ?? null,
            $data['deskripsi'] ?? null,
            $data['a_aktif'] ?? true,
            $data['urutan'] ?? 1,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.ketentuan_layanan
            SET nm_jenjang = ?, kondisi_semester = ?,
                kode_ketentuan = ?, nm_ketentuan = ?, operator = ?, nilai = ?,
                pesan_gagal = ?, deskripsi = ?, a_aktif = ?, urutan = ?, updated_at = NOW()
            WHERE id_ketentuan = ?
            RETURNING *
        ", [
            $data['nm_jenjang'] ?? null,
            $data['kondisi_semester'] ?? null,
            $data['kode_ketentuan'],
            $data['nm_ketentuan'],
            $data['operator'],
            $data['nilai'],
            $data['pesan_gagal'] ?? null,
            $data['deskripsi'] ?? null,
            $data['a_aktif'] ?? true,
            $data['urutan'] ?? 1,
            $id,
        ]);
    }

    public function delete(string $id): bool
    {
        return $this->pgUpdate(
            "DELETE FROM ref.ketentuan_layanan WHERE id_ketentuan = ?",
            [$id]
        ) > 0;
    }

    /**
     * Compile array of ketentuan rules ke SQL WHERE clause untuk PDUT.
     *
     * Logika:
     *   - Group by nm_jenjang + kondisi_semester
     *   - Dalam satu group: rules digabung dengan OR (untuk Putus Studi: IPK<2 OR SKS<40)
     *     KECUALI PM-ALIH yang semua rules digabung AND (IPK>=2.75 AND SKS>=40 AND SEM<=5).
     *     Default behavior: gunakan param $combineWithinGroup.
     *   - Antar group: digabung dengan OR
     *
     * @param array $rules array ketentuan dari getByJenisLayanan/getByKodeLayanan
     * @param array $fieldMap mapping kode_ketentuan ke nama kolom SQL
     * @param string $combineWithinGroup 'AND' atau 'OR'
     * @return string SQL fragment (tanpa "WHERE")
     */
    public function compileToSqlWhere(array $rules, array $fieldMap, string $combineWithinGroup = 'OR'): string
    {
        if (empty($rules)) return '1=1';

        // Group by nm_jenjang|kondisi_semester
        $groups = [];
        foreach ($rules as $rule) {
            $key = ($rule->nm_jenjang ?? '') . '|' . ($rule->kondisi_semester ?? '');
            $groups[$key][] = $rule;
        }

        $groupClauses = [];
        foreach ($groups as $group) {
            $jenjang = $group[0]->nm_jenjang;
            $semester = $group[0]->kondisi_semester;

            // Build inner conditions
            $inner = [];
            $jenjangField = $fieldMap['jenjang'] ?? 'jp.nm_jenj_didik';
            $semesterField = $fieldMap['semester'] ?? null;

            foreach ($group as $rule) {
                $field = $fieldMap[$rule->kode_ketentuan] ?? null;
                if (!$field) continue;
                $op = $rule->operator;
                $val = is_numeric($rule->nilai) ? $rule->nilai : "'" . addslashes($rule->nilai) . "'";
                $inner[] = "{$field} {$op} {$val}";
            }

            if (empty($inner)) continue;

            $innerSql = '(' . implode(' ' . $combineWithinGroup . ' ', $inner) . ')';

            // Add jenjang & semester filter
            $prefix = [];
            if ($jenjang) {
                if ($jenjang === 'S1') {
                    $prefix[] = "{$jenjangField} IN ('S1', 'D4')";
                } else {
                    $prefix[] = "{$jenjangField} = '" . addslashes($jenjang) . "'";
                }
            }
            if ($semester !== null && $semester !== '' && $semesterField) {
                $prefix[] = "{$semesterField} = " . (int) $semester;
            }

            if (!empty($prefix)) {
                $groupClauses[] = '(' . implode(' AND ', $prefix) . ' AND ' . $innerSql . ')';
            } else {
                $groupClauses[] = $innerSql;
            }
        }

        return empty($groupClauses) ? '1=1' : '(' . implode(' OR ', $groupClauses) . ')';
    }

    /**
     * Format rules ke array terstruktur untuk display di UI.
     * Group by jenjang/semester dengan format human-readable.
     */
    public function formatForDisplay(array $rules): array
    {
        $groups = [];
        foreach ($rules as $rule) {
            $key = trim(($rule->nm_jenjang ?? 'Semua') . ($rule->kondisi_semester ? " — Semester {$rule->kondisi_semester}" : ''));
            if (!isset($groups[$key])) {
                $groups[$key] = ['label' => $key, 'rules' => []];
            }
            $groups[$key]['rules'][] = [
                'nm_ketentuan' => $rule->nm_ketentuan,
                'operator' => $rule->operator,
                'nilai' => (float) $rule->nilai,
                'kode' => $rule->kode_ketentuan,
            ];
        }
        return array_values($groups);
    }
}
