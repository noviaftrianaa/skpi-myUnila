<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * PayloadTransformer — convert internal model (prestasi_mandiri /
 * sertifikasi / rekognisi) ke payload SIMKATMAWA.
 *
 * Mapping enum lewat ref.<table>.kode_simkatmawa (sudah di-seed di
 * data-model/script/postgresql/si_prestasi/seed). Kalau ref row tidak
 * punya kode_simkatmawa atau record tidak ditemukan, throw RuntimeException
 * supaya Job-nya retry/error secara eksplisit.
 *
 * Caller: SubmitToSimkatmawaJob.
 */
class PayloadTransformer
{
    /**
     * Bangun payload prestasi_mandiri sesuai schema SIMKATMAWA POST
     * /api/prestasi-mandiri.
     *
     * @param string $idPrestasi UUID prestasi_mandiri
     * @return array
     * @throws \RuntimeException kalau record tidak ditemukan atau enum mapping kosong
     */
    public function transformPrestasiMandiri(string $idPrestasi): array
    {
        $row = DB::selectOne("
            SELECT
                pm.id_prestasi_mandiri,
                pm.thn_prestasi,
                pm.nm_lomba                      AS lomba,
                pm.nm_cabang                     AS cabang,
                pm.nm_penyelenggara              AS penyelenggara,
                pm.jumlah_unit_peserta,
                pm.url_peserta,
                pm.url_sertifikat,
                TO_CHAR(pm.tgl_sertifikat,'YYYY-MM-DD') AS tgl_sertifikat,
                pm.url_foto_upp,
                pm.url_dokumen_undangan,
                pm.keterangan,
                lvl.kode_simkatmawa  AS level,
                kat.kode_simkatmawa  AS kategori,
                rng.kode_simkatmawa  AS peringkat,
                klp.kode_simkatmawa  AS kelompok_prestasi,
                bnt.kode_simkatmawa  AS bentuk
            FROM prestasi.prestasi_mandiri pm
            JOIN ref.level_prestasi      lvl ON lvl.id_level_prestasi      = pm.id_level_prestasi
            JOIN ref.kategori_prestasi   kat ON kat.id_kategori_prestasi   = pm.id_kategori_prestasi
            JOIN ref.peringkat           rng ON rng.id_peringkat           = pm.id_peringkat
            JOIN ref.kelompok_prestasi   klp ON klp.id_kelompok_prestasi   = pm.id_kelompok_prestasi
            JOIN ref.bentuk_pelaksanaan  bnt ON bnt.id_bentuk_pelaksanaan  = pm.id_bentuk_pelaksanaan
            WHERE pm.id_prestasi_mandiri = ? AND pm.soft_delete = FALSE
        ", [$idPrestasi]);

        if (!$row) {
            throw new \RuntimeException("Prestasi mandiri {$idPrestasi} tidak ditemukan / sudah dihapus");
        }
        $this->assertEnums($row, ['level', 'kategori', 'peringkat', 'kelompok_prestasi', 'bentuk'], $idPrestasi);

        return [
            'level'                => $row->level,
            'kategori'             => $row->kategori,
            'lomba'                => $row->lomba,
            'cabang'               => $row->cabang ?? '',
            'penyelenggara'        => $row->penyelenggara,
            'peringkat'            => $row->peringkat,
            'jumlah_unit_peserta'  => (string) ($row->jumlah_unit_peserta ?? 0),
            'kelompok_prestasi'    => $row->kelompok_prestasi,
            'bentuk'               => $row->bentuk,
            'url_peserta'          => $row->url_peserta ?: '',
            'url_sertifikat'       => $row->url_sertifikat ?: '',
            'tgl_sertifikat'       => $row->tgl_sertifikat,
            'url_foto_upp'         => $row->url_foto_upp ?: '',
            'url_dokumen_undangan' => $row->url_dokumen_undangan ?: '',
            'keterangan'           => $row->keterangan ?? '',
            'mahasiswa'            => $this->fetchPesertaMhs($idPrestasi, 'PRESTASI'),
            'dosen'                => $this->fetchPesertaDosen($idPrestasi, 'PRESTASI'),
        ];
    }

    /**
     * Bangun payload sertifikasi sesuai schema SIMKATMAWA POST /api/sertifikasi.
     */
    public function transformSertifikasi(string $idSertifikasi): array
    {
        $row = DB::selectOne("
            SELECT
                s.id_sertifikasi,
                s.thn_prestasi,
                s.nm_sertifikasi              AS nama,
                s.nm_penyelenggara            AS penyelenggara,
                s.url_peserta,
                s.url_sertifikat,
                TO_CHAR(s.tgl_sertifikat,'YYYY-MM-DD') AS tgl_sertifikat,
                s.url_foto_upp,
                s.url_dokumen_undangan,
                s.keterangan,
                lvl.kode_simkatmawa AS level
            FROM prestasi.sertifikasi s
            JOIN ref.level_prestasi lvl ON lvl.id_level_prestasi = s.id_level_prestasi
            WHERE s.id_sertifikasi = ? AND s.soft_delete = FALSE
        ", [$idSertifikasi]);

        if (!$row) {
            throw new \RuntimeException("Sertifikasi {$idSertifikasi} tidak ditemukan / sudah dihapus");
        }
        $this->assertEnums($row, ['level'], $idSertifikasi);

        return [
            'level'                => $row->level,
            'nama'                 => $row->nama,
            'penyelenggara'        => $row->penyelenggara,
            'url_peserta'          => $row->url_peserta ?: '',
            'url_sertifikat'       => $row->url_sertifikat ?: '',
            'tgl_sertifikat'       => $row->tgl_sertifikat,
            'url_foto_upp'         => $row->url_foto_upp ?: '',
            'url_dokumen_undangan' => $row->url_dokumen_undangan ?: '',
            'keterangan'           => $row->keterangan ?? '',
            'mahasiswa'            => $this->fetchPesertaMhs($idSertifikasi, 'SERTIFIKASI'),
            'dosen'                => $this->fetchPesertaDosen($idSertifikasi, 'SERTIFIKASI'),
        ];
    }

    /**
     * Bangun payload rekognisi sesuai schema SIMKATMAWA POST /api/rekognisi.
     */
    public function transformRekognisi(string $idRekognisi): array
    {
        $row = DB::selectOne("
            SELECT
                r.id_rekognisi,
                r.thn_prestasi,
                r.nm_rekognisi                AS nama,
                r.nm_penyelenggara            AS penyelenggara,
                r.url_peserta,
                r.url_sertifikat,
                TO_CHAR(r.tgl_sertifikat,'YYYY-MM-DD') AS tgl_sertifikat,
                r.url_foto_upp,
                r.url_dokumen_undangan,
                r.keterangan,
                lvl.kode_simkatmawa     AS level,
                jr.kode_simkatmawa      AS jenis_rekognisi
            FROM prestasi.rekognisi r
            JOIN ref.level_prestasi   lvl ON lvl.id_level_prestasi   = r.id_level_prestasi
            JOIN ref.jenis_rekognisi  jr  ON jr.id_jenis_rekognisi   = r.id_jenis_rekognisi
            WHERE r.id_rekognisi = ? AND r.soft_delete = FALSE
        ", [$idRekognisi]);

        if (!$row) {
            throw new \RuntimeException("Rekognisi {$idRekognisi} tidak ditemukan / sudah dihapus");
        }
        $this->assertEnums($row, ['level', 'jenis_rekognisi'], $idRekognisi);

        return [
            'level'                => $row->level,
            'jenis_rekognisi'      => $row->jenis_rekognisi,
            'nama'                 => $row->nama,
            'penyelenggara'        => $row->penyelenggara,
            'url_peserta'          => $row->url_peserta ?: '',
            'url_sertifikat'       => $row->url_sertifikat ?: '',
            'tgl_sertifikat'       => $row->tgl_sertifikat,
            'url_foto_upp'         => $row->url_foto_upp ?: '',
            'url_dokumen_undangan' => $row->url_dokumen_undangan ?: '',
            'keterangan'           => $row->keterangan ?? '',
            'mahasiswa'            => $this->fetchPesertaMhs($idRekognisi, 'REKOGNISI'),
            'dosen'                => $this->fetchPesertaDosen($idRekognisi, 'REKOGNISI'),
        ];
    }

    /**
     * Fetch peserta mahasiswa untuk parent.
     * Output array of {nim, nama} sesuai SIMKATMAWA.
     */
    protected function fetchPesertaMhs(string $idParent, string $tipe): array
    {
        $rows = DB::select("
            SELECT nim, nm_mahasiswa AS nama
            FROM prestasi.peserta_mhs
            WHERE id_parent = ? AND parent_tipe = ?
            ORDER BY nim
        ", [$idParent, $tipe]);
        return array_map(fn($r) => ['nim' => $r->nim, 'nama' => $r->nama], $rows);
    }

    /**
     * Fetch peserta dosen untuk parent.
     * Output array of {nuptk, nama, url_surat_tugas} — kalau dosen kosong, return [].
     */
    protected function fetchPesertaDosen(string $idParent, string $tipe): array
    {
        $rows = DB::select("
            SELECT nuptk, nm_dosen AS nama, url_surat_tugas
            FROM prestasi.peserta_dosen
            WHERE id_parent = ? AND parent_tipe = ?
            ORDER BY nuptk
        ", [$idParent, $tipe]);
        return array_map(fn($r) => [
            'nuptk'           => $r->nuptk,
            'nama'            => $r->nama,
            'url_surat_tugas' => $r->url_surat_tugas ?? '',
        ], $rows);
    }

    /**
     * Validate enum mapping ke SIMKATMAWA tidak null/kosong.
     */
    protected function assertEnums(object $row, array $enumKeys, string $id): void
    {
        foreach ($enumKeys as $k) {
            if (empty($row->{$k})) {
                throw new \RuntimeException(
                    "Enum '{$k}' kosong di ref untuk record {$id} — pastikan ref table sudah di-seed dengan kode_simkatmawa"
                );
            }
        }
    }
}
