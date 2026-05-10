<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Endpoint barrier untuk foto user yang sedang login.
 *
 * Frontend portal memanggil endpoint ini sebagai `<img src>` (browser kirim
 * cookie access_token) — endpoint redirect 302 ke MinIO public URL berdasar
 * jenis user dari kolom `man_akses.pengguna`.
 *
 * Tidak meng-expose UUID id_sdm/id_pd ke kode frontend.
 */
class MePhotoController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->attributes->get('auth_user');
        if (!$user || empty($user->id_pengguna)) {
            return $this->placeholderRedirect();
        }

        $row = DB::connection('sqlsrv')->selectOne(
            'SELECT id_sdm_pengguna, id_pd_pengguna, id_user_sikep FROM man_akses.pengguna WHERE id_pengguna = ?',
            [$user->id_pengguna]
        );

        if (!$row) {
            return $this->placeholderRedirect();
        }

        $base = sprintf(
            '%s/%s/photos',
            rtrim(env('MINIO_PUBLIC_URL', 'http://192.168.120.47:9000'), '/'),
            env('MINIO_BUCKET', 'myunila-storage')
        );

        // Priority: dosen (id_sdm) → mahasiswa (id_pd) → tendik (NIP via sikep.pegawai).
        if (!empty($row->id_sdm_pengguna)) {
            return $this->redirectNoCache("{$base}/sdm/{$row->id_sdm_pengguna}.jpg");
        }

        if (!empty($row->id_pd_pengguna)) {
            return $this->redirectNoCache("{$base}/pd/{$row->id_pd_pengguna}.jpg");
        }

        // Tendik: foto disimpan sebagai photos/tendik/{uuid_pegawai}.jpg.
        // uuid_pegawai (UNIQUEIDENTIFIER) ditambah lewat ALTER (lihat
        // data-model/script/sqlserver/alter_sikep_pegawai_add_uuid.sql).
        // Lebih stabil daripada NIP (NIP bisa berubah / null untuk honorer).
        if (!empty($row->id_user_sikep)) {
            $peg = DB::connection('sqlsrv')->selectOne(
                'SELECT LOWER(CONVERT(VARCHAR(36), uuid_pegawai)) AS uuid_pegawai FROM sikep.pegawai WHERE id_pegawai = ?',
                [$row->id_user_sikep]
            );
            if ($peg && !empty(trim((string) $peg->uuid_pegawai))) {
                $uuid = trim((string) $peg->uuid_pegawai);
                return $this->redirectNoCache("{$base}/tendik/{$uuid}.jpg");
            }
        }

        return $this->placeholderRedirect();
    }

    private function redirectNoCache(string $url)
    {
        return redirect()->away($url)->withHeaders([
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    private function placeholderRedirect()
    {
        return response('', 404)->withHeaders([
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }
}
