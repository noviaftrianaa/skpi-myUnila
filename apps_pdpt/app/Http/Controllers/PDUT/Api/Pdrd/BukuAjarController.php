<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;

class BukuAjarController extends Controller
{
    public function list(Request $request)
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        $buku_ajar = DB::select("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT tsbuku.id_tulis_buku_ajar, tsbuku.create_date, tsbuku.last_update, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0
        ORDER BY tsbuku.create_date " . $sortby . "
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $data], 'Daftar Buku Ajar By All', TRUE);
    }

    public function listById(Request $request)
    {

        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc',
            'id_sdm.required'  => 'input id_sdm harus diisi',
            'id_sdm.uuid'  => 'input id_sdm harus berupa UUID yang valid'
        ]);

        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        $buku_ajar = DB::select("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT tsbuku.id_tulis_buku_ajar, tsbuku.create_date, tsbuku.last_update, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0 AND tsbuku.id_sdm = ?
        ORDER BY tsbuku.create_date " . $sortby . "
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY", [$page, $count, $request->id_sdm]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $data], 'Daftar Buku Ajar By id_sdm', TRUE);
    }

    public function detail(Request $request)
    {
        InputValidator([
            'id_buku_ajar' => 'required|uuid'
        ], [
            'id_buku_ajar.required'  => 'input id_buku_ajar harus diisi',
            'id_buku_ajar.uuid'  => 'input id_buku_ajar harus berupa UUID yang valid'
        ]);

        try {
            $buku_ajar = DB::select("SELECT TOP 1
            buku.id_buku_ajar, buku.judul_buku, buku.isbn, jnbajr.nm_jns_bhn_ajar, buku.penerbit,
            buku.tgl_terbit, buku.sk_tugas, buku.tgl_sk_tugas, lbms.judul_litabmas, kacap.nm_kat_capaian
            FROM pdrd.buku_ajar AS buku WITH(NOLOCK)
            LEFT JOIN ref.jenis_bahan_ajar AS jnbajr WITH(NOLOCK) ON jnbajr.id_jns_bhn_ajar = buku.id_jns_bhn_ajar AND jnbajr.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = buku.id_litabmas AND lbms.soft_delete = 0
            LEFT JOIN ref.kategori_capaian_luaran AS kacap WITH(NOLOCK) ON kacap.id_kat_capaian = buku.id_kat_capaian AND kacap.expired_date IS NULL
            WHERE buku.soft_delete = 0 AND buku.id_buku_ajar = ?", [$request->id_buku_ajar]);

            $buku_ajar_sdm = DB::select("SELECT
            sdm.id_sdm, sdm.nm_sdm, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tsbuku.id_sdm
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$request->id_buku_ajar]);

            $buku_ajar_pd = DB::select("SELECT
            pd.id_pd, pd.nm_pd, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tsbuku.id_pd
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$request->id_buku_ajar]);

            $buku_ajar_nonca = DB::select("SELECT
            nonca.id_orang, nonca.nm_orang, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tsbuku.id_orang
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$request->id_buku_ajar]);

            $buku_ajar_dok = DB::select("SELECT
            dok_dokumen.nm_dok AS nama_dok,
            dok_dokumen.file_name AS nama_file,
            dok_dokumen.media_type AS jenis_file,
            dok_bhn_ajar.create_date AS tanggal_upload,
            refj_dokumen.nm_jns_dok AS jenis_dokumen
            FROM pdrd.buku_ajar AS buku
            JOIN dok.dok_bhn_ajar AS dok_bhn_ajar ON dok_bhn_ajar.id_buku_ajar = buku.id_buku_ajar
            AND dok_bhn_ajar.soft_delete = 0
            LEFT JOIN dok.dokumen AS dok_dokumen ON dok_dokumen.id_dok = dok_bhn_ajar.id_dok
            AND dok_dokumen.soft_delete = 0
            LEFT JOIN ref.jenis_dokumen AS refj_dokumen ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
            AND refj_dokumen.expired_date IS NULL
            WHERE buku.id_buku_ajar = ? AND buku.soft_delete = 0", [$request->id_buku_ajar]);

            foreach ($buku_ajar as $each_data) {
                $data[] = [
                    'id_buku_ajar' => $each_data->id_buku_ajar,
                    'judul' => $each_data->judul_buku,
                    'isbn' => $each_data->isbn,
                    'nama_jenis' => $each_data->nm_jns_bhn_ajar,
                    'nama_penerbit' => $each_data->penerbit,
                    'tanggal_terbit' => $each_data->tgl_terbit,
                    'sk_penugasan' => $each_data->sk_tugas,
                    'tanggal_sk_penugasan' => $each_data->tgl_sk_tugas,
                    'judul_litabmas' => $each_data->judul_litabmas,
                    'kategori_capaian_luaran' => $each_data->nm_kat_capaian,
                    'penulis_dosen' =>  $buku_ajar_sdm,
                    'penulis_mahasiswa' =>  $buku_ajar_pd,
                    'penulis_lain' =>  $buku_ajar_nonca,
                    'dokumen' =>  $buku_ajar_dok
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'Tidak Dapat Menampilkan Detail Buku Ajar', FALSE);
        }
        return WrapResponse(['data' => $data], 'Detail Buku Ajar', TRUE);
    }

    public function add(Request $request)
    {
        $id_buku_ajar = guid();
        $id_katgiat = 110801;
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_jns_bhn_ajar = 1;
        $id_kat_capaian = 5;

        DB::beginTransaction();
        try {

            $buku = DB::insert(
                "INSERT INTO pdrd.buku_ajar (id_buku_ajar, id_kat_capaian,
            id_jns_bhn_ajar, id_litabmas, judul_buku, penulis, penerbit, isbn,
            tgl_terbit, sk_tugas, tgl_sk_tugas, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $id_buku_ajar, $id_kat_capaian, $id_jns_bhn_ajar,
                    $request->id_litabmas, $request->judul_buku, $request->penulis, $request->penerbit,
                    $request->isbn, $request->tgl_terbit, $request->sk_tugas, $request->tgl_sk_tugas, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                ]
            );


            if (!empty($request->id_dosen)) {
                foreach ($request->id_dosen as $index => $id_dosen) {
                    if (is_null($id_dosen)) break;
                    $dosen = DB::insert(
                        "INSERT INTO pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat,
                    id_buku_ajar, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                    jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_buku_ajar, $request->id_dosen[$index], NULL,
                            NULL, $request->urutan_dosen[$index], $request->afiliasi_dosen[$index], $request->peran_tulis_dosen[$index],
                            $request->jns_penulis_dosen[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            if (!empty($request->id_mahasiswa)) {
                foreach ($request->id_mahasiswa as $index => $id_mahasiswa) {
                    if (is_null($id_mahasiswa)) break;
                    $mahasiswa = DB::insert(
                        "INSERT INTO pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat,
                    id_buku_ajar, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                    jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_buku_ajar, NULL, $request->id_mahasiswa[$index],
                            NULL, $request->urutan_mahasiswa[$index], $request->afiliasi_mahasiswa[$index], $request->peran_tulis_mahasiswa[$index],
                            $request->jns_penulis_mahasiswa[$index], $request->nm_pd_mahasiswa[$index], $request->nipd_mahasiswa[$index], currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            if (!empty($request->id_orang)) {
                foreach ($request->id_orang as $index => $id_orang) {
                    if (is_null($id_orang)) break;
                    $orang = DB::insert(
                        "INSERT INTO pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat,
                    id_buku_ajar, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                    jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_buku_ajar, NULL,
                            NULL, $request->id_orang[$index], $request->urutan_orang[$index], $request->afiliasi_orang[$index], $request->peran_tulis_orang[$index],
                            $request->jns_penulis_orang[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $id_buku_ajar)), 'Buku Ajar Berhasil Ditambahkan', TRUE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['data' => null], 'Buku Ajar Gagal Ditambahkan', FALSE);
        }
    }

    public function update(Request $request)
    {
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_katgiat = 110801;
        $id_jns_bhn_ajar = 1;
        $id_kat_capaian = 5;

        DB::beginTransaction();
        try {
            $buku = DB::update("UPDATE pdrd.buku_ajar SET id_kat_capaian = ?,
             id_jns_bhn_ajar = ?, id_litabmas = ?, judul_buku = ?,
             penulis = ?, penerbit = ?, isbn = ?, tgl_terbit = ?, sk_tugas = ?,
             tgl_sk_tugas = ?, last_update = ?, id_updater = ? WHERE id_buku_ajar = ?", [
                $id_kat_capaian, $id_jns_bhn_ajar, $request->id_litabmas, $request->judul_buku,
                $request->penulis, $request->penerbit, $request->isbn, $request->tgl_terbit,
                $request->sk_tugas, $request->tgl_sk_tugas, currDateTime(), $id_updater, $request->id_buku_ajar
            ]);
            if (!empty($request->id_dosen)) {
                foreach ($request->id_dosen as $index => $id_dosen) {
                    if (is_null($id_dosen)) break;
                    $dosen = DB::insert(
                        "UPDATE pdrd.tulis_buku_ajar SET  id_katgiat = ?,
                    id_sdm = ?, id_pd = NULL, id_orang = NULL, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                    jns_penulis = ?, nm_pd = NULL, nipd = NULL, last_update = ?, id_updater= ?, soft_delete = 0
                    WHERE id_buku_ajar = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_dosen[$index], $request->urutan_dosen[$index], $request->afiliasi_dosen[$index],
                            $request->peran_tulis_dosen[$index], $request->jns_penulis_dosen[$index], currDateTime(), $id_updater,
                            $request->id_buku_ajar, $request->id_dosen[$index]
                        ]
                    );
                }
            }
            if (!empty($request->id_mahasiswa)) {
                foreach ($request->id_mahasiswa as $index => $id_mahasiswa) {
                    if (is_null($id_mahasiswa)) break;
                    $mahasiswa = DB::insert(
                        "UPDATE pdrd.tulis_buku_ajar SET  id_katgiat = ?,
                    id_sdm = NULL, id_pd = ?, id_orang = NULL, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                    jns_penulis = ?, nm_pd = ?, nipd = ?, last_update = ?, id_updater= ?, soft_delete = 0
                    WHERE id_buku_ajar = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_mahasiswa[$index], $request->urutan_mahasiswa[$index],
                            $request->afiliasi_mahasiswa[$index], $request->peran_tulis_mahasiswa[$index],
                            $request->jns_penulis_mahasiswa[$index], $request->nm_pd_mahasiswa[$index], $request->nipd_mahasiswa[$index],
                            currDateTime(), $id_updater, $request->id_buku_ajar,
                            $request->id_mahasiswa[$index]
                        ]
                    );
                }
            }
            if (!empty($request->id_orang)) {
                foreach ($request->id_orang as $index => $id_orang) {
                    if (is_null($id_orang)) break;
                    $orang = DB::insert(
                        "UPDATE pdrd.tulis_buku_ajar SET  id_katgiat = ?,
                    id_sdm = NULL, id_pd = NULL, id_orang = ?, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                    jns_penulis = ?, nm_pd = NULL, nipd = NULL, last_update = ?, id_updater= ?, soft_delete = 0
                    WHERE id_buku_ajar = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_orang[$index], $request->urutan_orang[$index],
                            $request->afiliasi_orang[$index], $request->peran_tulis_orang[$index],
                            $request->jns_penulis_orang[$index], currDateTime(), $id_updater,
                            $request->id_buku_ajar, $request->id_orang[$index]
                        ]
                    );
                }
            }
            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $request->id_buku_ajar)), 'Buku Ajar Berhasil Diubah', TRUE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['data' => null], 'Buku Ajar Gagal Diubah', FALSE);
        }
    }

    public function delete(Request $request)
    {
        InputValidator([
            'id_buku_ajar' => 'required|uuid'
        ], [
            'id_buku_ajar.required'  => 'input id_buku_ajar harus diisi',
            'id_buku_ajar.uuid'  => 'input id_buku_ajar harus berupa UUID yang valid'
        ]);

        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $request->id_buku_ajar)), 'Buku Ajar Berhasil Dihapus', FALSE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['data' => null], 'Buku Ajar Gagal Dihapus', FALSE);
        }
    }
}
