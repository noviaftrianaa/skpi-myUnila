<?php

namespace App\Services;

use App\Repositories\PdutRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

/**
 * AnalyticsService — query agregasi prestasi/sertifikasi/rekognisi untuk
 * dashboard pimpinan. Semua method di-cache via Redis (TTL 5 menit) untuk
 * mengurangi load karena 3 tabel + cross-DB JOIN ke pdut.pdrd.sms.
 *
 * Cache key prefix: siprestasi:analytics:*
 * Filter common: tahun, tipe (prestasi|sertifikasi|rekognisi|all), id_fakultas
 *
 * Note tabel:
 *   - prestasi.{prestasi_mandiri|sertifikasi|rekognisi} di Postgres
 *   - id_fakultas/id_sms_pdut adalah id_sms dari pdut.pdrd.sms (SQL Server)
 *   - Bobot peringkat: ref.peringkat.nilai_bobot (10..1)
 */
class AnalyticsService
{
    private const CACHE_PREFIX = 'siprestasi:analytics';
    private const CACHE_TTL = 300; // 5 menit

    public function __construct(private PdutRepository $pdut) {}

    // ====== Filter helpers ======

    private function buildWhere(array $filters, string $alias = ''): array
    {
        $a = $alias ? $alias . '.' : '';
        $where = ["{$a}soft_delete = FALSE"];
        $params = [];

        if (!empty($filters['tahun'])) {
            $where[] = "{$a}thn_prestasi = ?";
            $params[] = (int) $filters['tahun'];
        }
        if (!empty($filters['id_fakultas'])) {
            $where[] = "{$a}id_fakultas = ?";
            $params[] = $filters['id_fakultas'];
        }
        if (!empty($filters['status_workflow'])) {
            $where[] = "{$a}status_workflow = ?";
            $params[] = $filters['status_workflow'];
        }

        return ['sql' => implode(' AND ', $where), 'params' => $params];
    }

    private function cacheKey(string $method, array $params = []): string
    {
        return self::CACHE_PREFIX . ":{$method}:" . md5(json_encode($params));
    }

    private function remember(string $method, array $params, callable $callback)
    {
        return Cache::remember($this->cacheKey($method, $params), self::CACHE_TTL, $callback);
    }

    // ====== Overview / stats cards ======

    public function overview(array $filters = []): array
    {
        return $this->remember('overview', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters);
            $tables = [
                'prestasi'    => 'prestasi.prestasi_mandiri',
                'sertifikasi' => 'prestasi.sertifikasi',
                'rekognisi'   => 'prestasi.rekognisi',
            ];
            $counts = [];
            foreach ($tables as $key => $tbl) {
                $r = DB::selectOne("SELECT COUNT(*) AS c FROM {$tbl} WHERE {$w['sql']}", $w['params']);
                $counts[$key] = (int) $r->c;
            }
            $counts['total'] = $counts['prestasi'] + $counts['sertifikasi'] + $counts['rekognisi'];

            // Sync success rate
            $sync = DB::selectOne("
                SELECT
                  COUNT(*) FILTER (WHERE a_success = TRUE) AS success,
                  COUNT(*) AS total
                FROM sync.submission
            ");
            $counts['sync_success']  = (int) $sync->success;
            $counts['sync_total']    = (int) $sync->total;
            $counts['sync_pct']      = $sync->total > 0 ? round(($sync->success / $sync->total) * 100, 2) : 0;

            // Skor bobot (hanya prestasi_mandiri yang punya peringkat)
            $skor = DB::selectOne("
                SELECT COALESCE(SUM(p.nilai_bobot * pm.jumlah_unit_peserta), 0) AS skor
                FROM prestasi.prestasi_mandiri pm
                JOIN ref.peringkat p ON p.id_peringkat = pm.id_peringkat
                WHERE {$w['sql']}
            ", $w['params']);
            $counts['skor_bobot'] = (float) $skor->skor;

            return $counts;
        });
    }

    // ====== Trend per tahun ======

    public function trend(int $years = 5): array
    {
        return $this->remember('trend', ['years' => $years], function () use ($years) {
            $thisYear = (int) date('Y');
            $minYear = $thisYear - $years + 1;

            $rows = [];
            foreach (['prestasi_mandiri', 'sertifikasi', 'rekognisi'] as $tbl) {
                $key = $tbl === 'prestasi_mandiri' ? 'prestasi' : $tbl;
                $r = DB::select("
                    SELECT thn_prestasi AS tahun, COUNT(*) AS jumlah
                    FROM prestasi.{$tbl}
                    WHERE soft_delete = FALSE AND thn_prestasi BETWEEN ? AND ?
                    GROUP BY thn_prestasi
                    ORDER BY thn_prestasi
                ", [$minYear, $thisYear]);
                foreach ($r as $row) {
                    $year = (int) $row->tahun;
                    $rows[$year] = $rows[$year] ?? ['tahun' => $year, 'prestasi' => 0, 'sertifikasi' => 0, 'rekognisi' => 0];
                    $rows[$year][$key] = (int) $row->jumlah;
                }
            }

            $out = [];
            for ($y = $minYear; $y <= $thisYear; $y++) {
                $out[] = $rows[$y] ?? ['tahun' => $y, 'prestasi' => 0, 'sertifikasi' => 0, 'rekognisi' => 0];
            }
            return $out;
        });
    }

    // ====== Komposisi per tipe ======

    public function byTipe(array $filters = []): array
    {
        $ov = $this->overview($filters);
        return [
            ['name' => 'Prestasi Mandiri', 'value' => $ov['prestasi']],
            ['name' => 'Sertifikasi',      'value' => $ov['sertifikasi']],
            ['name' => 'Rekognisi',        'value' => $ov['rekognisi']],
        ];
    }

    // ====== Per Level ======

    public function byLevel(array $filters = []): array
    {
        return $this->remember('byLevel', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters);
            $tipe = $filters['tipe'] ?? 'all';
            $unions = [];
            $params = [];

            $cfg = [
                'prestasi'    => 'prestasi.prestasi_mandiri',
                'sertifikasi' => 'prestasi.sertifikasi',
                'rekognisi'   => 'prestasi.rekognisi',
            ];
            $tables = $tipe === 'all' ? array_values($cfg) : [$cfg[$tipe] ?? null];

            foreach (array_filter($tables) as $tbl) {
                $unions[] = "SELECT id_level_prestasi FROM {$tbl} WHERE {$w['sql']}";
                $params = array_merge($params, $w['params']);
            }

            if (!$unions) return [];

            $sql = "
                SELECT lvl.kode_simkatmawa AS kode, lvl.nm_level AS nama, COUNT(t.id_level_prestasi) AS jumlah
                FROM ref.level_prestasi lvl
                LEFT JOIN ( " . implode(' UNION ALL ', $unions) . " ) t
                  ON t.id_level_prestasi = lvl.id_level_prestasi
                WHERE lvl.a_active = TRUE
                GROUP BY lvl.kode_simkatmawa, lvl.nm_level, lvl.urutan
                ORDER BY lvl.urutan
            ";
            $rows = DB::select($sql, $params);
            return array_map(fn($r) => ['kode' => $r->kode, 'nama' => $r->nama, 'jumlah' => (int) $r->jumlah], $rows);
        });
    }

    // ====== Per Kategori (prestasi_mandiri only) ======

    public function byKategori(array $filters = []): array
    {
        return $this->remember('byKategori', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters, 'pm');
            $rows = DB::select("
                SELECT kat.kode_simkatmawa AS kode, kat.nm_kategori AS nama, COUNT(pm.id_prestasi_mandiri) AS jumlah
                FROM ref.kategori_prestasi kat
                LEFT JOIN prestasi.prestasi_mandiri pm
                  ON pm.id_kategori_prestasi = kat.id_kategori_prestasi
                  AND {$w['sql']}
                WHERE kat.a_active = TRUE
                GROUP BY kat.kode_simkatmawa, kat.nm_kategori, kat.urutan
                ORDER BY kat.urutan
            ", $w['params']);
            return array_map(fn($r) => ['kode' => $r->kode, 'nama' => $r->nama, 'jumlah' => (int) $r->jumlah], $rows);
        });
    }

    // ====== Per Peringkat (with weighted score) ======

    public function byPeringkat(array $filters = []): array
    {
        return $this->remember('byPeringkat', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters, 'pm');
            $rows = DB::select("
                SELECT
                    p.kode_simkatmawa AS kode,
                    p.nm_peringkat    AS nama,
                    p.nilai_bobot     AS bobot,
                    COUNT(pm.id_prestasi_mandiri)                                   AS jumlah,
                    COALESCE(SUM(p.nilai_bobot * pm.jumlah_unit_peserta), 0)        AS skor
                FROM ref.peringkat p
                LEFT JOIN prestasi.prestasi_mandiri pm
                  ON pm.id_peringkat = p.id_peringkat
                  AND {$w['sql']}
                WHERE p.a_active = TRUE
                GROUP BY p.kode_simkatmawa, p.nm_peringkat, p.nilai_bobot, p.urutan
                ORDER BY p.urutan
            ", $w['params']);
            return array_map(fn($r) => [
                'kode'   => $r->kode,
                'nama'   => $r->nama,
                'bobot'  => (float) $r->bobot,
                'jumlah' => (int) $r->jumlah,
                'skor'   => (float) $r->skor,
            ], $rows);
        });
    }

    // ====== Per Fakultas (drilldown level 1) ======

    public function byFakultas(array $filters = []): array
    {
        return $this->remember('byFakultas', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters);
            $tipe = $filters['tipe'] ?? 'all';
            $cfg = [
                'prestasi'    => 'prestasi.prestasi_mandiri',
                'sertifikasi' => 'prestasi.sertifikasi',
                'rekognisi'   => 'prestasi.rekognisi',
            ];
            $tables = $tipe === 'all' ? array_values($cfg) : [$cfg[$tipe] ?? null];

            $unions = [];
            $params = [];
            foreach (array_filter($tables) as $tbl) {
                $unions[] = "SELECT id_fakultas FROM {$tbl} WHERE {$w['sql']} AND id_fakultas IS NOT NULL";
                $params = array_merge($params, $w['params']);
            }

            if (!$unions) return [];

            $rows = DB::select("
                SELECT id_fakultas, COUNT(*) AS jumlah
                FROM ( " . implode(' UNION ALL ', $unions) . " ) t
                GROUP BY id_fakultas
                ORDER BY jumlah DESC
            ", $params);

            // Resolve nm_fakultas via batch query ke pdut
            $idList = array_map(fn($r) => $r->id_fakultas, $rows);
            $names = $this->resolveFakultasNames($idList);

            return array_map(fn($r) => [
                'id_fakultas' => $r->id_fakultas,
                'nm_fakultas' => $names[$r->id_fakultas] ?? '(unknown)',
                'jumlah'      => (int) $r->jumlah,
            ], $rows);
        });
    }

    private function resolveFakultasNames(array $ids): array
    {
        $ids = array_filter(array_unique($ids));
        if (!$ids) return [];
        $key = self::CACHE_PREFIX . ':fakultas_names:' . md5(implode(',', $ids));
        return Cache::remember($key, 3600, function () use ($ids) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $rows = DB::connection('sqlsrv')->select("
                SELECT id_sms, nm_lemb
                FROM pdrd.sms
                WHERE id_sms IN ({$placeholders}) AND soft_delete = 0
            ", array_values($ids));
            $map = [];
            foreach ($rows as $r) $map[$r->id_sms] = $r->nm_lemb;
            return $map;
        });
    }

    // ====== Per Prodi (drilldown level 2) ======

    public function byProdi(array $filters = []): array
    {
        return $this->remember('byProdi', $filters, function () use ($filters) {
            $tipe = $filters['tipe'] ?? 'all';
            $w = $this->buildWhere($filters);

            $tipeMap = [
                'PRESTASI'    => 'prestasi.prestasi_mandiri',
                'SERTIFIKASI' => 'prestasi.sertifikasi',
                'REKOGNISI'   => 'prestasi.rekognisi',
            ];
            $tipeFilter = $tipe === 'all' ? array_keys($tipeMap) : [strtoupper($tipe)];

            $unions = [];
            $params = [];
            foreach ($tipeFilter as $t) {
                $tbl = $tipeMap[$t] ?? null;
                if (!$tbl) continue;
                $idCol = $t === 'PRESTASI' ? 'id_prestasi_mandiri'
                       : ($t === 'SERTIFIKASI' ? 'id_sertifikasi' : 'id_rekognisi');
                $unions[] = "SELECT pm.{$idCol} AS id_parent, ? AS parent_tipe FROM {$tbl} pm WHERE {$w['sql']}";
                $params[] = $t;
                $params = array_merge($params, $w['params']);
            }

            if (!$unions) return [];

            $rows = DB::select("
                SELECT pmhs.id_sms_pdut, pmhs.nm_prodi, COUNT(DISTINCT (pmhs.id_parent, pmhs.parent_tipe)) AS jumlah
                FROM ( " . implode(' UNION ALL ', $unions) . " ) base
                JOIN prestasi.peserta_mhs pmhs
                  ON pmhs.id_parent = base.id_parent AND pmhs.parent_tipe = base.parent_tipe
                WHERE pmhs.id_sms_pdut IS NOT NULL
                GROUP BY pmhs.id_sms_pdut, pmhs.nm_prodi
                ORDER BY jumlah DESC
                LIMIT 50
            ", $params);

            return array_map(fn($r) => [
                'id_sms_pdut' => $r->id_sms_pdut,
                'nm_prodi'    => $r->nm_prodi ?? '(unknown)',
                'jumlah'      => (int) $r->jumlah,
            ], $rows);
        });
    }

    // ====== Top Mahasiswa Berprestasi ======

    public function topMahasiswa(array $filters = [], int $limit = 10): array
    {
        return $this->remember('topMahasiswa', array_merge($filters, ['limit' => $limit]), function () use ($filters, $limit) {
            $w = $this->buildWhere($filters, 'p');
            $tipeFilter = $filters['tipe'] ?? 'all';
            $tipes = $tipeFilter === 'all' ? ['PRESTASI', 'SERTIFIKASI', 'REKOGNISI'] : [strtoupper($tipeFilter)];

            $tipeMap = [
                'PRESTASI'    => 'prestasi.prestasi_mandiri',
                'SERTIFIKASI' => 'prestasi.sertifikasi',
                'REKOGNISI'   => 'prestasi.rekognisi',
            ];
            $idColMap = [
                'PRESTASI'    => 'id_prestasi_mandiri',
                'SERTIFIKASI' => 'id_sertifikasi',
                'REKOGNISI'   => 'id_rekognisi',
            ];

            $unions = [];
            $params = [];
            foreach ($tipes as $t) {
                $tbl = $tipeMap[$t] ?? null;
                if (!$tbl) continue;
                $idCol = $idColMap[$t];
                $unions[] = "SELECT p.{$idCol} AS id_parent, ? AS parent_tipe FROM {$tbl} p WHERE {$w['sql']}";
                $params[] = $t;
                $params = array_merge($params, $w['params']);
            }

            if (!$unions) return [];

            $params[] = $limit;
            $rows = DB::select("
                SELECT pmhs.nim, pmhs.nm_mahasiswa, pmhs.nm_prodi, COUNT(DISTINCT (base.id_parent, base.parent_tipe)) AS jumlah
                FROM ( " . implode(' UNION ALL ', $unions) . " ) base
                JOIN prestasi.peserta_mhs pmhs
                  ON pmhs.id_parent = base.id_parent AND pmhs.parent_tipe = base.parent_tipe
                GROUP BY pmhs.nim, pmhs.nm_mahasiswa, pmhs.nm_prodi
                ORDER BY jumlah DESC, pmhs.nm_mahasiswa
                LIMIT ?
            ", $params);

            return array_map(fn($r) => [
                'nim'           => $r->nim,
                'nm_mahasiswa'  => $r->nm_mahasiswa,
                'nm_prodi'      => $r->nm_prodi,
                'jumlah'        => (int) $r->jumlah,
            ], $rows);
        });
    }

    // ====== Sync Health ======

    public function syncHealth(): array
    {
        return $this->remember('syncHealth', [], function () {
            $row = DB::selectOne("
                SELECT
                  COUNT(*)                                                 AS total,
                  COUNT(*) FILTER (WHERE a_success = TRUE)                 AS success,
                  COUNT(*) FILTER (WHERE a_success = FALSE)                AS failed,
                  COUNT(*) FILTER (WHERE retry_count > 1)                  AS retried,
                  AVG(retry_count)                                          AS avg_retry,
                  MAX(request_at)                                           AS last_at
                FROM sync.submission
            ");
            $byTipe = DB::select("
                SELECT
                  parent_tipe,
                  COUNT(*) FILTER (WHERE a_success = TRUE) AS success,
                  COUNT(*) AS total
                FROM sync.submission
                GROUP BY parent_tipe
            ");

            return [
                'total'      => (int) $row->total,
                'success'    => (int) $row->success,
                'failed'     => (int) $row->failed,
                'retried'    => (int) $row->retried,
                'avg_retry'  => round((float) ($row->avg_retry ?? 0), 2),
                'success_pct'=> $row->total > 0 ? round(($row->success / $row->total) * 100, 2) : 0,
                'last_at'    => $row->last_at,
                'by_tipe'    => array_map(fn($r) => [
                    'parent_tipe' => $r->parent_tipe,
                    'success'     => (int) $r->success,
                    'total'       => (int) $r->total,
                    'success_pct' => $r->total > 0 ? round(($r->success / $r->total) * 100, 2) : 0,
                ], $byTipe),
            ];
        });
    }

    // ====== Workflow Pipeline (status funnel) ======

    public function workflowPipeline(array $filters = []): array
    {
        return $this->remember('workflowPipeline', $filters, function () use ($filters) {
            $tipe = $filters['tipe'] ?? 'all';
            $cfg = [
                'prestasi'    => 'prestasi.prestasi_mandiri',
                'sertifikasi' => 'prestasi.sertifikasi',
                'rekognisi'   => 'prestasi.rekognisi',
            ];
            $tables = $tipe === 'all' ? array_values($cfg) : [$cfg[$tipe] ?? null];

            $w = $this->buildWhere(array_diff_key($filters, ['status_workflow' => null, 'tipe' => null]));
            $unions = [];
            $params = [];
            foreach (array_filter($tables) as $tbl) {
                $unions[] = "SELECT status_workflow FROM {$tbl} WHERE {$w['sql']}";
                $params = array_merge($params, $w['params']);
            }
            if (!$unions) return [];

            $rows = DB::select("
                SELECT status_workflow, COUNT(*) AS jumlah
                FROM ( " . implode(' UNION ALL ', $unions) . " ) t
                GROUP BY status_workflow
            ", $params);

            $order = ['draft' => 1, 'review' => 2, 'ready' => 3, 'sending' => 4, 'sent' => 5, 'error' => 6, 'archived' => 7];
            $byStatus = [];
            foreach ($rows as $r) $byStatus[$r->status_workflow] = (int) $r->jumlah;

            $out = [];
            foreach ($order as $st => $_) {
                $out[] = ['status' => $st, 'jumlah' => $byStatus[$st] ?? 0];
            }
            return $out;
        });
    }

    // ====== Heatmap Kategori × Level (prestasi_mandiri only) ======

    public function matrixKategoriLevel(array $filters = []): array
    {
        return $this->remember('matrixKategoriLevel', $filters, function () use ($filters) {
            $w = $this->buildWhere($filters, 'pm');
            $rows = DB::select("
                SELECT
                  kat.kode_simkatmawa AS kategori,
                  lvl.kode_simkatmawa AS level,
                  COUNT(pm.id_prestasi_mandiri) AS jumlah
                FROM ref.kategori_prestasi kat
                CROSS JOIN ref.level_prestasi lvl
                LEFT JOIN prestasi.prestasi_mandiri pm
                  ON pm.id_kategori_prestasi = kat.id_kategori_prestasi
                  AND pm.id_level_prestasi = lvl.id_level_prestasi
                  AND {$w['sql']}
                WHERE kat.a_active = TRUE AND lvl.a_active = TRUE
                GROUP BY kat.kode_simkatmawa, lvl.kode_simkatmawa, kat.urutan, lvl.urutan
                ORDER BY kat.urutan, lvl.urutan
            ", $w['params']);

            return array_map(fn($r) => [
                'kategori' => $r->kategori,
                'level'    => $r->level,
                'jumlah'   => (int) $r->jumlah,
            ], $rows);
        });
    }

    // ====== List daftar mahasiswa berprestasi (drilldown modal) ======

    public function mahasiswaProdiDetail(string $idSmsPdut, array $filters = [], int $page = 1, int $limit = 50): array
    {
        $key = $this->cacheKey('mahasiswaProdi', array_merge($filters, ['id_sms' => $idSmsPdut, 'page' => $page, 'limit' => $limit]));
        return Cache::remember($key, self::CACHE_TTL, function () use ($idSmsPdut, $filters, $page, $limit) {
            $tipe = $filters['tipe'] ?? 'all';
            $w = $this->buildWhere($filters, 'p');

            $tipeMap = [
                'PRESTASI'    => ['tbl' => 'prestasi.prestasi_mandiri', 'idCol' => 'id_prestasi_mandiri', 'nm' => 'nm_lomba'],
                'SERTIFIKASI' => ['tbl' => 'prestasi.sertifikasi',      'idCol' => 'id_sertifikasi',      'nm' => 'nm_sertifikasi'],
                'REKOGNISI'   => ['tbl' => 'prestasi.rekognisi',        'idCol' => 'id_rekognisi',        'nm' => 'nm_rekognisi'],
            ];
            $tipes = $tipe === 'all' ? array_keys($tipeMap) : [strtoupper($tipe)];

            $unions = [];
            $params = [];
            foreach ($tipes as $t) {
                $cfg = $tipeMap[$t] ?? null;
                if (!$cfg) continue;
                $unions[] = "
                    SELECT
                      pmhs.nim, pmhs.nm_mahasiswa,
                      ? AS parent_tipe,
                      p.{$cfg['idCol']} AS id_parent,
                      p.{$cfg['nm']} AS judul,
                      p.thn_prestasi, p.status_workflow
                    FROM {$cfg['tbl']} p
                    JOIN prestasi.peserta_mhs pmhs
                      ON pmhs.id_parent = p.{$cfg['idCol']} AND pmhs.parent_tipe = ?
                    WHERE pmhs.id_sms_pdut = ? AND {$w['sql']}
                ";
                $params[] = $t;
                $params[] = $t;
                $params[] = $idSmsPdut;
                $params = array_merge($params, $w['params']);
            }

            if (!$unions) return ['data' => [], 'page' => $page, 'last_page' => 1, 'total' => 0];

            $sub = "( " . implode(' UNION ALL ', $unions) . " ) AS u";

            $total = (int) DB::selectOne("SELECT COUNT(*) AS c FROM {$sub}", $params)->c;

            $offset = ($page - 1) * $limit;
            $listParams = array_merge($params, [$limit, $offset]);
            $rows = DB::select("SELECT * FROM {$sub} ORDER BY thn_prestasi DESC, judul LIMIT ? OFFSET ?", $listParams);

            return [
                'data'      => array_map(fn($r) => (array) $r, $rows),
                'page'      => $page,
                'last_page' => max(1, (int) ceil($total / $limit)),
                'total'     => $total,
            ];
        });
    }

    // ====== Cache invalidation ======

    public function refreshCache(): array
    {
        // Flush semua key dengan prefix siprestasi:analytics:
        try {
            $cnt = 0;
            foreach (Redis::connection()->keys(self::CACHE_PREFIX . ':*') as $k) {
                Redis::connection()->del($k);
                $cnt++;
            }
            return ['flushed' => $cnt];
        } catch (\Throwable $e) {
            // Fallback: cache.flush kalau redis tidak tersedia
            Cache::flush();
            return ['flushed' => -1, 'error' => $e->getMessage()];
        }
    }
}
