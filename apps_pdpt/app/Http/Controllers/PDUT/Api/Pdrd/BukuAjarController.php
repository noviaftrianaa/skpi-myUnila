<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BukuAjarController extends Controller
{
    /**
     * @OA\Get (
     *      path="/buku_ajar/list",
     *      operationId="getBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Mendapatkan Daftar Buku Ajar",
     *      description="Menampilkan Daftar Buku Ajar",
     *      @OA\RequestBody(
     *      description="Daftar Buku Ajar",
     *      @OA\JsonContent(
     *          @OA\Property(property="page", type="number", format="number", example="1"),
     *          @OA\Property(property="count", type="number", format="number", example="10"),
     *          @OA\Property(property="sortby", type="string", format="text", example="DESC")
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function list(Request $request)
    {
        $page = 1;
        $count = 10;
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
        ORDER BY tsbuku.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'rubrik_bkd' => null,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Get all data Buku Ajar',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    /**
     * @OA\Get (
     *      path="/buku_ajar/list_id",
     *      operationId="getBukuAjarById",
     *      tags={"Buku Ajar"},
     *      summary="Mendapatkan Daftar Buku Ajar Berdasarkan ID",
     *      description="Menampilkan Daftar Buku Ajar Berdasarkan ID",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Daftar Buku Ajar Berdasarkan ID",
     *      @OA\JsonContent(
     *          required={"id_sdm"},
     *          @OA\Property(property="id_sdm", type="string", format="text", example="1"),
     *          @OA\Property(property="page", type="number", format="number", example="1"),
     *          @OA\Property(property="count", type="number", format="number", example="10"),
     *          @OA\Property(property="sortby", type="string", format="text", example="DESC")
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function listById(Request $request)
    {
        $page = 1;
        $count = 10;
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

        $id = $request->id_sdm;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field id_sdm"
            ]);
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
        ORDER BY tsbuku.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY", [$page, $count, $id]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'rubrik_bkd' => null,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'get list id successfully',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    /**
     * @OA\Get (
     *      path="/buku_ajar/detail",
     *      operationId="getBukuAjarById",
     *      tags={"Buku Ajar"},
     *      summary="Mendapatkan Detail Buku Ajar",
     *      description="Menampilkan Detail Buku Ajar",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Detail Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_tulis_buku_ajar"},
     *          @OA\Property(property="id_tulis_buku_ajar", type="string", format="text", example="1")
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function detail(Request $request)
    {
        $id = $request->id_tulis_buku_ajar;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field id_tulis_buku_ajar"
            ]);
        }

        $buku_ajar = DB::select("SELECT
            tsbuku.id_tulis_buku_ajar, tsbuku.id_buku_ajar, jebaj.nm_jns_bhn_ajar,  kacaplu.nm_kat_capaian, lbms.judul_litabmas,
            buku.judul_buku, buku.tgl_terbit, buku.penerbit, buku.isbn, buku.sk_tugas, buku.tgl_sk_tugas
            FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
            LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
            LEFT JOIN ref.jenis_bahan_ajar AS jebaj WITH(NOLOCK) ON jebaj.id_jns_bhn_ajar = buku.id_jns_bhn_ajar AND jebaj.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = buku.id_kat_capaian AND kacaplu.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = buku.id_litabmas AND lbms.soft_delete = 0
            WHERE tsbuku.soft_delete = 0 AND tsbuku.id_tulis_buku_ajar = ? ", [$id]);

        $buku_ajar_sdm = DB::select("SELECT
            sdm.id_sdm, sdm.nm_sdm, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tsbuku.id_sdm
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);

        $buku_ajar_pd = DB::select("SELECT
            pd.id_pd, pd.nm_pd, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tsbuku.id_pd
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);

        $buku_ajar_nonca = DB::select("SELECT
            nonca.id_orang, nonca.nm_orang, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tsbuku.id_orang
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);

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
            WHERE buku.id_buku_ajar = ? AND buku.soft_delete = 0", [$buku_ajar[0]->id_buku_ajar]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'jenis_bahan_ajar' => $each_data->nm_jns_bhn_ajar,
                'kategori_capaian' => $each_data->nm_kat_capaian,
                'aktivitas_litabmas' => $each_data->judul_litabmas,
                'judul_bahan_ajar' => $each_data->judul_buku,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'isbn' => $each_data->isbn,
                'sk_penugasan_bukti' => $each_data->sk_tugas,
                'tgl_sk_penugasan_bukti' => $each_data->tgl_sk_tugas,
                'penulis_dosen' =>  $buku_ajar_sdm,
                'penulis_mahasiswa' =>  $buku_ajar_pd,
                'penulis_lain' =>  $buku_ajar_nonca,
                'dokumen' =>  $buku_ajar_dok
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'get detail successfully',
            'data'  => $data
        ], 200);
    }

    /**
     * @OA\Post (
     *      path="/buku_ajar/add",
     *      operationId="addBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Tambah Buku Ajar",
     *      description="Menambah Buku Ajar",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menambah Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_jns_bhn_ajar", "id_litabmas", "judul_buku", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_jns_bhn_ajar", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul_buku", type="string", format="text", example="Judul Buku"),
     *          @OA\Property(property="penulis", type="string", format="text", example="Penulis"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     *          @OA\Property(property="sk_tugas", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2022-01-25"),
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function add(Request $request)
    {
        $id_buku_ajar = guid();
        $id_tulis_buku_ajar = guid();
        $id_katgiat = 110801;

        DB::beginTransaction();
        try {
            DB::insert(
                "INSERT INTO pdrd.buku_ajar (id_buku_ajar, id_kat_capaian,
            id_jns_bhn_ajar, id_litabmas, judul_buku, penulis, penerbit, isbn,
            tgl_terbit, sk_tugas, tgl_sk_tugas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $id_buku_ajar, $request->id_kat_capaian, $request->id_jns_bhn_ajar,
                    $request->id_litabmas, $request->judul_buku, $request->penulis, $request->penerbit,
                    $request->isbn, $request->tgl_terbit, $request->sk_tugas, $request->tgl_sk_tugas
                ]
            );

            DB::insert(
                "INSERT INTO pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat,
            id_buku_ajar, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
            jns_penulis, nm_pd, nipd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $id_tulis_buku_ajar, $id_katgiat, $id_buku_ajar, $request->id_sdm, $request->id_pd,
                    $request->id_orang, $request->urutan2, $request->afiliasi, $request->peran_tulis,
                    $request->jns_penulis, $request->nm_pd, $request->nipd
                ]
            );

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'add data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed add data'
            ], 400);
        }
    }

    /**
     * @OA\Put (
     *      path="/buku_ajar/update",
     *      operationId="updateBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Ubah Buku Ajar",
     *      description="Mengubah Buku Ajar",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Mengubah Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_jns_bhn_ajar", "id_litabmas", "judul_buku", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_jns_bhn_ajar", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul_buku", type="string", format="text", example="Judul Buku"),
     *          @OA\Property(property="penulis", type="string", format="text", example="Penulis"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     *          @OA\Property(property="sk_tugas", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2022-01-25"),
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function update(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.buku_ajar SET id_kat_capaian = ?,
            SET id_jns_bhn_ajar = ?, SET id_litabmas = ?, SET judul_buku = ?,
            SET penulis = ?, SET penerbit = ?, SET isbn = ?, SET tgl_terbit = ?, SET sk_tugas = ?,
            SET tgl_sk_tugas = ? WHERE id_buku_ajar = ?", [
                $request->id_kat_capaian,
                $request->id_jns_bhn_ajar, $request->id_litabmas, $request->judul_buku,
                $request->penulis, $request->penerbit, $request->isbn, $request->tgl_terbit,
                $request->sk_tugas, $request->tgl_sk_tugas, $request->id_buku_ajar
            ]);

            DB::update("UPDATE pdrd.tulis_buku_ajar SET id_buku_ajar = ?, SET id_sdm = ?,
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_buku_ajar = ?", [
                $request->id_buku_ajar,
                $request->id_sdm, $request->id_pd, $request->id_orang, $request->urutan2, $request->afiliasi,
                $request->peran_tulis, $request->jns_penulis, $request->nm_pd, $request->nipd, $request->id_tulis_buku_ajar
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'updated data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed updated data'
            ], 400);
        }
    }

    /**
     * @OA\Delete (
     *      path="/buku_ajar/delete",
     *      operationId="deleteBukuAjar",
     *      tags={"Buku Ajar"},
     *      summary="Hapus Buku Ajar",
     *      description="Menghapus Buku Ajar",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Buku Ajar",
     *      @OA\JsonContent(
     *          required={"id_buku_ajar"},
     *          @OA\Property(property="id_buku_ajar", type="string", format="text", example="1")
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function delete(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            // DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 1 WHERE id_tulis_buku_ajar = ?", [$request->id_tulis_buku_ajar]);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'deleted data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed deleted data'
            ], 400);
        }
    }
}
