<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\TulisPub;
use Illuminate\Support\Facades\Log;


class BukuReferensiController extends Controller
{
    /**
     * @OA\Get (
     *      path="/buku_referensi/list",
     *      operationId="getBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Dapatkan Daftar Buku Referensi",
     *      description="Menampilkan Daftar Buku Referensi",
     *      @OA\RequestBody(
     *      description="Daftar Buku Referensi",
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
        $page = 1; $count = 10;
        if(!empty($request->page)) {
            $page = $request->page; 
        } 
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count; 
            }
        }

        $buku_referensi= DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT 
            tspub.id_tulis_pub, 
            pub.id_publikasi, 
            pub.judul, 
            pub.isbn, 
            pub.tgl_terbit, 
            pub.penerbit,
			katgiat.nm_kat
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tspub.id_katgiat AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0
        ORDER BY tspub.id_tulis_pub ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'kategori_kegiatan' => $each_data->nm_kat,
                'rubrik_bkd' => null
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    /**
     * @OA\Get (
     *      path="/buku_referensi/list_id",
     *      operationId="getBukuReferensiById",
     *      tags={"Buku Referensi"},
     *      summary="Dapatkan Daftar Buku Referensi Berdasarkan ID",
     *      description="Menampilkan Daftar Buku Referensi Berdasarkan ID",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Daftar Buku Referensi Berdasarkan ID",
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
                'message' => "id_sdm kosong"
            ]);
        }

        $buku_referensi = DB::select("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT 
        tspub.id_tulis_pub, 
        pub.id_publikasi, 
        pub.judul, pub.isbn, 
        pub.tgl_terbit, 
        pub.penerbit, 
        katgiat.nm_kat
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tspub.id_katgiat AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0 tspub.id_sdm = ?
        ORDER BY tspub.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY", [$page, $count, $id]);
        
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'kategori_kegiatan' => $each_data->nm_kat,
                'rubrik_bkd' => null,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    /**
     * @OA\Get (
     *      path="/buku_referensi/detail",
     *      operationId="getDetailBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Dapatkan Detail Buku Referensi",
     *      description="Menampilkan Detail Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Detail Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_tulis_pub"},
     *          @OA\Property(property="id_tulis_pub", type="string", format="text", example="1")
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
        $id = $request->id_tulis_pub;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_tulis_buku_referensi kosong"
            ]);
        }

        $buku_referensi = DB::select("SELECT 
            tspub.id_tulis_pub, 
            tspub.id_publikasi, 
            jepub.nm_jns_pub,  
            kacaplu.nm_kat_capaian, 
            lbms.judul_litabmas,
            pub.judul, 
            pub.tgl_terbit, 
            pub.penerbit, 
            pub.isbn
            FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
            LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
            LEFT JOIN ref.jenis_publikasi AS jepub WITH(NOLOCK) ON jepub.id_jns_pub = pub.id_jns_pub AND jepub.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = pub.id_kat_capaian AND kacaplu.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = pub.id_litabmas AND lbms.soft_delete = 0
            WHERE tspub.soft_delete = 0 AND tspub.id_tulis_pub = ? ", [$id]);
        
        $buku_referensi_sdm = DB::select("SELECT 
            sdm.id_sdm, 
            sdm.nm_sdm, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tspub.id_sdm
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikas]);

        $buku_referensi_pd= DB::select("SELECT 
            pd.id_pd, 
            pd.nm_pd, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tspub.id_pd
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikasi]);
        
        $buku_referensi_nonca= DB::select("SELECT 
            nonca.id_orang, 
            nonca.nm_orang, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tspub.id_orang
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikasi]);

        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'jenis_publikasi' => $each_data->nm_jns_pub,
                'kategori_capaian' => $each_data->nm_kat_capaian,
                'aktivitas_litabmas' => $each_data->judul_litabmas,
                'judul' => $each_data->judul,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'isbn' => $each_data->isbn,
                'penulis_dosen' =>  $buku_referensi_sdm,
                'penulis_mahasiswa' =>  $buku_referensi_pd,
                'penulis_lain' =>  $buku_referensi_nonca
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendapatkan data',
            'data'  => $data
        ], 200);
    }

     /**
     * @OA\Post (
     *      path="/buku_referensi/add",
     *      operationId="addBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Tambah Buku Referensi",
     *      description="Menambah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menambah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_jns_pub", "id_litabmas", "judul", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_jns_pub", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Buku"),
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
        $id_publikasi = guid();
        $id_tulis_pub = guid();
        $id_katgiat = 120102;

        DB::beginTransaction();
        try {
            DB::insert(
                "INSERT INTO pdrd.publikasi (id_publikasi, id_kat_capaian,
            id_jns_pub, id_litabmas, judul, penulis, penerbit, isbn,
            tgl_terbit, sk_tugas, tgl_sk_tugas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $id_publikasi, 
                $request->id_kat_capaian, 
                $request->id_jns_pub,
                $request->id_litabmas, 
                $request->judul, 
                $request->penulis, 
                $request->penerbit,
                $request->isbn, 
                $request->tgl_terbit, 
                $request->sk_tugas, 
                $request->tgl_sk_tugas
            ]
        );

        DB::insert(
            "INSERT INTO pdrd.tulis_pub (id_tulis_pub, id_katgiat,
        id_publikasi, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
        jns_penulis, nm_pd, nipd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $id_tulis_pub, 
                $id_katgiat, 
                $id_publikasi, 
                $request->id_sdm, 
                $request->id_pd,
                $request->id_orang, 
                $request->urutan2, 
                $request->afiliasi, 
                $request->peran_tulis,
                $request->jns_penulis, 
                $request->nm_pd,
                $request->nipd
            ]
        );

        DB::commit();
        return response()->json([
            'success' => true,
            'message' => 'Data Berhasil Ditambahkan'
        ], 200);
    } catch (\Exception $e) {
        DB::rollback();
        return response()->json([
            'success' => false,
            'message' => 'Data Gagal Ditambahkan'
        ], 400);
    }
        
    }
    
 /**
     * @OA\Put (
     *      path="/buku_referensi/update",
     *      operationId="updateBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Ubah Buku Referensi",
     *      description="Mengubah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Mengubah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_jns_pub", "id_litabmas", "judul", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_jns_pub", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Buku"),
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
            DB::update("UPDATE pdrd.buku_referensi SET id_kat_capaian = ?,
            SET id_jns_pub = ?, SET id_litabmas = ?, SET judul = ?,
            SET penulis = ?, SET penerbit = ?, SET isbn = ?, SET tgl_terbit = ?, SET sk_tugas = ?,
            SET tgl_sk_tugas = ? WHERE id_publikasi = ?", [
                $request->id_kat_capaian,
                $request->id_jns_pub, 
                $request->id_litabmas, 
                $request->judul,
                $request->penulis, 
                $request->penerbit, 
                $request->isbn, 
                $request->tgl_terbit,
                $request->sk_tugas, 
                $request->tgl_sk_tugas, 
                $request->id_publikasi
            ]);

            DB::update("UPDATE pdrd.tulis_pub SET id_publikasi = ?, SET id_sdm = ?,
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_pub = ?", [
                $request->id_publikasi,
                $request->id_sdm, 
                $request->id_pd, 
                $request->id_orang, 
                $request->urutan2, 
                $request->afiliasi,
                $request->peran_tulis, 
                $request->jns_penulis, 
                $request->nm_pd, 
                $request->nipd, 
                $request->id_tulis_pub
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil ubah data'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal ubah data'
            ], 400);
        }
    }

    /**
     * @OA\Delete (
     *      path="/buku_referensi/delete",
     *      operationId="deleteBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Hapus Buku Referensi",
     *      description="Menghapus Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_publikasi"},
     *          @OA\Property(property="id_publikasi", type="string", format="text", example="1")
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
            DB::update("UPDATE pdrd.publikasi SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
            DB::update("UPDATE pdrd.tulis_pub SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
           
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil hapus data'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus data'
            ], 400);
        }
    }
}
