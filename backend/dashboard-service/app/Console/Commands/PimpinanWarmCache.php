<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Dashboard\BerandaService;
use App\Services\Dashboard\MahasiswaService;
use App\Services\Dashboard\DosenService;
use App\Services\Dashboard\AkreditasiService;
use App\Services\Dashboard\LulusanService;
use App\Services\Dashboard\LitabmasService;
use App\Services\Dashboard\PublikasiService;
use App\Services\Dashboard\PegawaiService;
use App\Services\Dashboard\KeuanganService;
use App\Services\Dashboard\PrestasiService;
use App\Services\Dashboard\KerjasamaService;

/**
 * Pre-warm cache untuk endpoint Pimpinan canonical (Beranda + 10 sub-menu)
 * untuk universal scope + tiap fakultas. Tujuan: eliminate cold-start delay
 * saat user buka Dashboard Pimpinan.
 *
 * Schedule: tiap jam (lihat routes/console.php — append next to iku:warm-cache).
 * Manual: `php artisan pimpinan:warm-cache --force`
 *
 * Sub-menu Pimpinan yang di-warm:
 * - Beranda, Mahasiswa, Dosen, Akreditasi, Lulusan, Litabmas, Publikasi,
 *   Pegawai, Keuangan, Prestasi, Kerjasama
 *
 * IKU di-warm terpisah via iku:warm-cache command (lebih granular per-IKU).
 */
class PimpinanWarmCache extends Command
{
    protected $signature = 'pimpinan:warm-cache
        {--year= : Tahun ajaran (default: semester aktif)}
        {--force : Bypass existing cache and recompute}';

    protected $description = 'Pre-warm Pimpinan beranda + sub-menu cache untuk universal + tiap fakultas';

    public function handle(): int
    {
        $year = $this->option('year')
            ? (int) $this->option('year')
            : $this->resolveActiveYear();

        $semesters = [$year . '1', $year . '2'];
        $force = (bool) $this->option('force');

        // Daftar fakultas Unila — universal (null) + tiap fakultas UUID
        $fakRows = DB::connection('sqlsrv')->select("
            SELECT DISTINCT CONVERT(VARCHAR(36), id_fak_unila) AS id
            FROM pdrd.sms
            WHERE soft_delete = 0 AND stat_prodi = 'A' AND id_fak_unila IS NOT NULL
        ");
        $fakultasList = [null];
        foreach ($fakRows as $row) {
            $fakultasList[] = $row->id;
        }

        // Services × scopes matrix
        $services = [
            'beranda'   => fn(?string $fak) => (new BerandaService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
                'prodi'    => null,
            ]),
            'mahasiswa' => fn(?string $fak) => (new MahasiswaService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'dosen'     => fn(?string $fak) => (new DosenService())->getData([
                'fakultas' => $fak,
            ]),
            'akreditasi'=> fn(?string $fak) => (new AkreditasiService())->getData([
                'fakultas' => $fak,
            ]),
            'lulusan'   => fn(?string $fak) => (new LulusanService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'litabmas'  => fn(?string $fak) => (new LitabmasService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'publikasi' => fn(?string $fak) => (new PublikasiService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'pegawai'   => fn(?string $fak) => (new PegawaiService())->getData([
                'fakultas' => $fak,
            ]),
            'keuangan'  => fn(?string $fak) => (new KeuanganService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'prestasi'  => fn(?string $fak) => (new PrestasiService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
            'kerjasama' => fn(?string $fak) => (new KerjasamaService())->getData([
                'semester' => implode(',', $semesters),
                'fakultas' => $fak,
            ]),
        ];

        $total = count($services) * count($fakultasList);
        $this->output->progressStart($total);

        $ok = 0;
        $fail = 0;
        foreach ($services as $name => $callable) {
            foreach ($fakultasList as $fak) {
                $start = microtime(true);
                try {
                    $callable($fak);
                    $ok++;
                    $elapsed = round(microtime(true) - $start, 2);
                    if ($elapsed > 5) {
                        Log::info("Pimpinan/{$name} fak={$fak} warmed in {$elapsed}s");
                    }
                } catch (\Throwable $e) {
                    $fail++;
                    Log::warning("Pimpinan/{$name} fak={$fak} failed: " . $e->getMessage());
                }
                $this->output->progressAdvance();
            }
        }

        $this->output->progressFinish();
        $this->info("Done. OK: {$ok}, Fail: {$fail}");
        return 0;
    }

    /**
     * Resolve tahun semester aktif dari ref.semester.a_periode_aktif=1.
     */
    private function resolveActiveYear(): int
    {
        try {
            $row = DB::connection('sqlsrv')->selectOne("
                SELECT TOP 1 LEFT(CAST(id_smt AS VARCHAR), 4) AS tahun
                FROM ref.semester
                WHERE expired_date IS NULL AND a_periode_aktif = 1
                ORDER BY id_smt DESC
            ");
            if ($row && !empty($row->tahun)) return (int) $row->tahun;
        } catch (\Throwable $e) { /* fall-through */ }
        return (int) date('Y');
    }
}
